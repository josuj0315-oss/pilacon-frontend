import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

// 응답 인터셉터용 변수들
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.request.use((config) => {
  const hasManualAuth = config.headers?.Authorization || (typeof config.headers?.get === 'function' && config.headers.get('Authorization'));
  const token = localStorage.getItem("accessToken");
  const rawTokenLog = token ? `${token.substring(0, 10)}...` : "NONE";

  const isDev = import.meta.env.DEV;

  if (hasManualAuth) {
    if (isDev) console.log(`[Axios Debug] url=${config.url}, using MANUALLY provided Auth Header.`);
  } else if (token) {
    const authHeader = `Bearer ${token}`;
    if (!config.headers) {
      config.headers = {};
    }
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', authHeader);
    } else {
      config.headers.Authorization = authHeader;
    }
  }
  return config;
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401이고 재시도한 적이 없으며, /auth/refresh 요청 자체가 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;
        // 완전 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        
        processQueue(null, newAccessToken);
        isRefreshing = false;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

import { jobs as seedJobs } from "../data/jobs";

const PilaConContext = createContext(null);

const LS = {
  jobs: "pilacon:v1:jobs",
  applications: "pilacon:v1:applications",
  auth: "auth",
  instructorProfiles: "pilacon:v1:instructor_profiles",
  notifications: "pilacon:v1:notifications",
  notificationSettings: "pilacon:v1:notification_settings",
  recentlyViewed: "pilacon:v1:recently_viewed",
  blockedUsers: "pilacon:v1:blocked_users",
  mutedChatRooms: "pilacon:v1:muted_chat_rooms",
  leftChatRooms: "pilacon:v1:left_chat_rooms",
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  all: true,
  posts: {
    on: false,
    regions: [],
    workouts: [],
    employmentTypes: [], 
    newJob: true,
    deadline: true,
    closed: true,
  },
  applicant: {
    on: true,
    viewed: true,
    chat: true,
    deadline: true,
    hire: true,
  },
  owner: {
    on: true,
    apply: true,
    chat: true,
  },
  message: {
    on: true,
  },
  extra: {
    favoriteDeadline: true,
    favoriteClosed: true,
    applyStatus: true,
    newChat: true,
    jobUpdate: true,
    interview: true,
  }
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

function normalizeBlockedUsers(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return {
          userId: String(entry),
          nickname: "차단한 사용자",
          profileImage: "",
          blockedAt: new Date().toISOString(),
        };
      }
      if (!entry) return null;
      return {
        userId: String(entry.userId ?? entry.id ?? ""),
        nickname: entry.nickname || entry.name || "차단한 사용자",
        profileImage: entry.profileImage || "",
        blockedAt: entry.blockedAt || new Date().toISOString(),
      };
    })
    .filter((entry) => entry?.userId);
}

/** ✅ category 정규화: 대소문자 및 오타 대응 */
const CATEGORY_OPTIONS = ["필라테스", "요가", "PT", "기타"];
function normalizeCategory(input) {
  const v = String(input ?? "").trim().toLowerCase();

  if (v.includes("헬스") || v.includes("pt")) return "PT";
  if (v.includes("필라") || v === "pilates") return "필라테스";
  if (v.includes("요가") || v === "yoga") return "요가";
  if (v.includes("기타") || v === "etc") return "기타";

  // 이미 정규화된 한글명이면 그대로 반환
  const found = CATEGORY_OPTIONS.find(opt => v === opt.toLowerCase());
  if (found) return found;

  return "필라테스"; // 기본값
}

export function getApplicationStatusLabel(status) {
  const map = {
    submitted: "지원완료",
    read: "심사중",
    chatting: "채팅중",
    pending: "보류",
    rejected: "불합격",
    accepted: "채용확정",
    closed: "채용완료",
    canceled: "지원취소",
  };
  return map[status] || status || "심사중";
}

export function PilaConProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState(() => readJSON(LS.instructorProfiles, []));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = readJSON(LS.notificationSettings, DEFAULT_NOTIFICATION_SETTINGS);
    // ✅ Schema 업데이트 대응: 최상위 키들이 누락된 경우 DEFAULT에서 가져옴
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...saved,
      posts: { ...DEFAULT_NOTIFICATION_SETTINGS.posts, ...(saved.posts || {}) },
      applicant: { ...DEFAULT_NOTIFICATION_SETTINGS.applicant, ...(saved.applicant || {}) },
      owner: { ...DEFAULT_NOTIFICATION_SETTINGS.owner, ...(saved.owner || {}) },
      message: { ...DEFAULT_NOTIFICATION_SETTINGS.message, ...(saved.message || {}) },
    };
  });

  // ✅ Auth 상태 관리 (토큰과 유저 정보가 모두 있어야 로그인 상태로 간주)
  // ✅ Auth 상태 관리: 앱 시작 시 localStorage를 신뢰하지 않고 일단 null로 시작. /auth/me 응답 기준으로 상태 복구
  const [user, setUser] = useState(null);

  const [isAuthLoading, setIsAuthLoading] = useState(() => !!localStorage.getItem("accessToken"));

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [lastChatMessage, setLastChatMessage] = useState(null);

  const [recentlyViewedJobs, setRecentlyViewedJobs] = useState(() => readJSON(LS.recentlyViewed, []));
  const [blockedUsers, setBlockedUsers] = useState(() => normalizeBlockedUsers(readJSON(LS.blockedUsers, [])));
  const [mutedChatRooms, setMutedChatRooms] = useState(() => readJSON(LS.mutedChatRooms, []));
  const [leftChatRooms, setLeftChatRooms] = useState(() => readJSON(LS.leftChatRooms, []));

  const [applications, setApplications] = useState(() => {
    const stored = readJSON(LS.applications, []);
    return Array.isArray(stored) ? stored : [];
  });

  const sseTimerRef = useRef(null);

  const [toasts, setToasts] = useState([]);
  const [globalModal, setGlobalModal] = useState(null);
  const [fullError, setFullError] = useState(null);

  const showToast = (message, type = 'success', duration = 2500, onRetry = null) => {
    setToasts(prev => {
      // 1. 중복 메시지 방지
      if (prev.some(t => t.message === message)) return prev;

      const id = Date.now();
      const newToast = { id, message, type, onRetry };

      // 2. 큐 관리 (최대 3개)
      const next = [...prev, newToast].slice(-3);

      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, duration);

      return next;
    });
  };

  const openModal = (options) => {
    setGlobalModal({
      id: Date.now(),
      ...options,
      onClose: () => setGlobalModal(null)
    });
  };

  const confirm = (title, message, options = {}) => {
    return new Promise((resolve) => {
      setGlobalModal({
        id: Date.now(),
        title,
        message,
        confirmText: options.confirmText || '확인',
        cancelText: options.cancelText || '취소',
        type: options.type || 'confirm',
        isDanger: options.isDanger || options.type === 'danger' || false,
        onConfirm: () => {
          setGlobalModal(null);
          resolve(true);
        },
        onCancel: () => {
          setGlobalModal(null);
          resolve(false);
        },
        onClose: () => {
          setGlobalModal(null);
          resolve(false);
        }
      });
    });
  };

  const showFullError = (title, message, onRetry = null) => {
    setFullError({ title, message, onRetry });
  };

  const closeFullError = () => {
    setFullError(null);
  };

  let isFetchingAuth = false;

  // 1. 초기 데이터 로드 (백엔드 API 호출)
  const fetchMyData = async (tokenParam) => {
    if (isFetchingAuth) {
      if (import.meta.env.DEV) console.log("[Store] fetchMyData is already in flight. Skipping duplicate call.");
      return;
    }
    isFetchingAuth = true;
    let userData = null;
    try {
      const headers = tokenParam ? { Authorization: `Bearer ${tokenParam}` } : {};
      const timestamp = new Date().getTime();
      const authRes = await axios.get(`${API_BASE_URL}/auth/me?_t=${timestamp}`, { headers });
      console.log('🔥 [Store] fetchMyData - Response data:', authRes.data);
      userData = authRes.data;
      setUser(userData);
      writeJSON(LS.auth, userData);
    } catch (e) {
      console.error('Failed to fetch user data (/auth/me):', e);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      writeJSON(LS.auth, null);
      throw e;
    }

    try {
      // fetch applications
      const appRes = await axios.get(`${API_BASE_URL}/applications/my`);
      setApplications(appRes.data);
    } catch (e) { console.warn('Failed to fetch applications:', e); }

    try {
      // fetch profiles
      const profRes = await axios.get(`${API_BASE_URL}/instructor-profiles`);
      setProfiles(profRes.data);
    } catch (e) { console.warn('Failed to fetch instructor profiles:', e); }

    try {
      // fetch favorites
      const favRes = await axios.get(`${API_BASE_URL}/favorites/me`);
      setFavorites(favRes.data);
    } catch (e) { console.warn('Failed to fetch favorites:', e); }
    finally {
      isFetchingAuth = false;
    }
    return userData;
  };

  // 1. 초기 데이터 로드 (백엔드 API 호출)
  useEffect(() => {
    const initData = async () => {
      // ✅ 1. 소셜 로그인 설정 중일 때는 전역 초기화를 방지합니다 (Login.jsx에 양도)
      if (window.location.search.includes("accessToken=")) {
        if (import.meta.env.DEV) console.log("[Store] Omitted initial auth bootstrap to defer to social callback.");
        setIsAuthLoading(false);
      } else {
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            await fetchMyData(token);
            // ✅ 알림 설정 동기화 추가
            try {
              const settingsRes = await axios.get(`${API_BASE_URL}/notifications/settings`);
              if (settingsRes.data?.settings) {
                setNotificationSettings(prev => ({
                  ...prev,
                  ...settingsRes.data.settings
                }));
              }
            } catch (se) { console.warn('Failed to fetch notification settings:', se); }
          } finally {
            setIsAuthLoading(false);
          }
        } else {
          setIsAuthLoading(false);
        }
      }

      // 2. 공고 목록 가져오기 (비로그인 공유)
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/jobs`);
        if (Array.isArray(response.data)) {
          setJobs(response.data.map(j => ({
            ...j,
            applicants: j.applicants ?? [],
            category: normalizeCategory(j.category),
            status: (j.status ?? "active").toLowerCase()
          })));
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        showFullError("서버 연결 실패", "공고 목록을 불러오지 못했습니다. 서버 상태를 확인하거나 잠시 후 다시 시도해주세요.", () => window.location.reload());
        setJobs(seedJobs);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  useEffect(() => {
    writeJSON(LS.applications, applications);
  }, [applications]);

  useEffect(() => {
    writeJSON(LS.notificationSettings, notificationSettings);
  }, [notificationSettings]);

  // ✅ Auth 상태 변화 저장 (로그인 시 데이터 백업용. 초기화 시 빈 유저라고 토큰을 지우면 안됨!)
  useEffect(() => {
    if (user) {
      writeJSON(LS.auth, user);
    }
  }, [user]);

  const loginWithToken = async (accessToken, refreshToken) => {
    try {
      setIsAuthLoading(true);
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      const userData = await fetchMyData(accessToken);
      return { ok: true, user: userData };
    } catch (e) {
      console.error('Login failed', e);
      return { ok: false, error: e };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = (provider) => {
    const dummyUser = {
      provider,
      id: `${provider}_${Math.floor(Math.random() * 1000)}`,
      name: provider === 'kakao' ? '카카오 유저' : '네이버 유저',
    };
    setUser(dummyUser);
  };

  const localSignup = async (details) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, details);
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(userData);
      return { ok: true, user: userData };
    } catch (e) {
      console.error('Signup failed', e);
      return { ok: false, error: e.response?.data?.message || '회원가입에 실패했습니다.' };
    }
  };

  const localLogin = async (details) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, details);
      const { user: userData, accessToken, refreshToken } = res.data;
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      if (userData) {
        setUser(userData);
        writeJSON(LS.auth, userData);
      }
      
      const finalUser = await fetchMyData(accessToken);
      return { ok: true, user: finalUser || userData };
    } catch (e) {
      console.error('Login failed', e);
      return { ok: false, error: e.response?.data?.message || '로그인에 실패했습니다.' };
    }
  };

  const toggleFavorite = async (jobId) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      const response = await axios.post(`${API_BASE_URL}/favorites/${jobId}`, {});

      // 즐겨찾기 목록 다시 불러오기
      const listRes = await axios.get(`${API_BASE_URL}/favorites/me`);
      setFavorites(listRes.data);

      return { ok: true, favorited: response.data.favorited };
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return { ok: false, error };
    }
  };

  const isFavorited = (jobId) => {
    return favorites.some(f => String(f.id) === String(jobId));
  };

  const updateUser = async (updateData) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/me`, updateData);
      setUser(res.data);
      return { ok: true, data: res.data };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { ok: false, error: error.response?.data?.message || '사용자 정보 수정에 실패했습니다.' };
    }
  };

  const checkNickname = async (nickname) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/check-nickname`, {
        params: { nickname }
      });
      return res.data; // { available: true/false }
    } catch (error) {
      console.error('Failed to check nickname:', error);
      return { available: false };
    }
  };

  const checkUsername = async (username) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/check-username`, {
        params: { username }
      });
      return res.data; // { available: true/false }
    } catch (error) {
      console.error('Failed to check username:', error);
      return { available: false };
    }
  };

  const requestPhoneVerification = async (phone) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/phone/request`, { phone });
      return {
        ok: true,
        message: res.data?.message || '인증번호를 전송했습니다.',
        data: res.data,
      };
    } catch (error) {
      console.error('Failed to request phone verification:', error);
      return {
        ok: false,
        error: error.response?.data?.message || '인증번호 전송에 실패했습니다.',
      };
    }
  };

  const verifyPhoneCode = async (phone, code) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/phone/verify`, { phone, code });
      return {
        ok: true,
        verified: res.data?.verified ?? true,
        verificationToken: res.data?.verificationToken ?? res.data?.token ?? null,
        message: res.data?.message || '휴대폰 인증이 완료되었습니다.',
        data: res.data,
      };
    } catch (error) {
      console.error('Failed to verify phone code:', error);
      return {
        ok: false,
        error: error.response?.data?.message || '인증번호 확인에 실패했습니다.',
      };
    }
  };

  const requestEmailVerification = async (email) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/email/request`, { email });
      return {
        ok: true,
        message: res.data?.message || '인증번호를 이메일로 전송했습니다.',
        data: res.data,
      };
    } catch (error) {
      console.error('Failed to request email verification:', error);
      return {
        ok: false,
        error: error.response?.data?.message || '인증번호 전송에 실패했습니다.',
      };
    }
  };

  const verifyEmailCode = async (email, code) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/email/verify`, { email, code });
      return {
        ok: true,
        verified: res.data?.verified ?? true,
        verificationToken: res.data?.verificationToken ?? null,
        message: res.data?.message || '이메일 인증이 완료되었습니다.',
        data: res.data,
      };
    } catch (error) {
      console.error('Failed to verify email code:', error);
      return {
        ok: false,
        error: error.response?.data?.message || '인증번호 확인에 실패했습니다.',
      };
    }
  };

  const uploadFile = async (file) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload/profile`, formData, {
        headers: {
          
          'Content-Type': 'multipart/form-data',
        },
      });
      return { ok: true, url: res.data.url };
    } catch (error) {
      console.error('Failed to upload file:', error);
      if (error.response?.status === 401) {
        return { ok: false, error: '인증 세션이 만료되었습니다. 다시 로그인해주세요.', reason: 'unauthorized' };
      }
      if (error.response?.status === 413) {
        return { ok: false, error: '파일 용량이 너무 큽니다. (최대 5MB)', reason: 'too_large' };
      }
      return { ok: false, error: '파일 업로드에 실패했습니다.' };
    }
  };

  const uploadResume = async (file) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload/resume`, formData, {
        headers: {
          
          'Content-Type': 'multipart/form-data',
        },
      });
      return { ok: true, url: res.data.url };
    } catch (error) {
      console.error('Failed to upload resume:', error);
      if (error.response?.status === 401) {
        return { ok: false, error: '인증 세션이 만료되었습니다. 다시 로그인해주세요.', reason: 'unauthorized' };
      }
      if (error.response?.status === 413) {
        return { ok: false, error: '파일 용량이 너무 큽니다. (최대 10MB)', reason: 'too_large' };
      }
      return { ok: false, error: '이력서 업로드에 실패했습니다.' };
    }
  };

  const uploadChatImage = async (roomId, file) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload/chat/${roomId}`, formData, {
        headers: {
          
          'Content-Type': 'multipart/form-data',
        },
      });
      return { ok: true, data: res.data }; // { url, key }
    } catch (error) {
      console.error('Failed to upload chat image:', error);
      if (error.response?.status === 401) {
        return { ok: false, error: '인증 세션이 만료되었습니다. 다시 로그인해주세요.', reason: 'unauthorized' };
      }
      if (error.response?.status === 413) {
        return { ok: false, error: '파일 용량이 너무 큽니다. (최대 10MB)', reason: 'too_large' };
      }
      return { ok: false, error: '이미지 업로드에 실패했습니다.' };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (e) { console.warn('Logout hook failed', e); }
    
    // 완전 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem(LS.auth); 
    localStorage.removeItem('auth');
    setUser(null);
    setProfiles([]);
    setFavorites([]);
  };

  const myJobs = useMemo(() => {
    if (!user) return [];
    return jobs.filter((j) => String(j.userId) === String(user.id));
  }, [jobs, user]);

  const appliedList = useMemo(() => {
    if (!user) return [];
    return applications
      .filter((a) => String(a.userId) === String(user.id))
      .map((a) => {
        const job = a.job || jobs.find((j) => String(j.id) === String(a.jobId));
        if (!job) return a; // job이 없어도 application 데이터는 유지
        return { ...a, job };
      })
      .filter(Boolean)
      .sort((x, y) => (x.createdAt < y.createdAt ? 1 : -1));
  }, [applications, jobs, user]);

  const createJob = async (jobDraft) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      const payload = {
        ...jobDraft,
        category: normalizeCategory(jobDraft.category),
        ownerId: user.id,
        status: "active",
      };

      const response = await axios.post(`${API_BASE_URL}/jobs`, payload);
      const newJob = response.data;
      const normalized = {
        ...newJob,
        applicants: newJob.applicants ?? [],
        category: normalizeCategory(newJob.category),
        status: (newJob.status ?? "active").toLowerCase()
      };

      setJobs((prev) => [normalized, ...prev]);
      return { ok: true, data: normalized };
    } catch (error) {
      console.error('Failed to create job:', error);
      return { ok: false, error };
    }
  };

  const closeJob = async (jobId) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      const response = await axios.patch(`${API_BASE_URL}/jobs/${jobId}/close`, {});
      const updatedJob = response.data;
      setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
      return { ok: true, data: updatedJob };
    } catch (error) {
      console.error('Failed to close job:', error);
      return { ok: false, error };
    }
  };

  const updateJob = async (jobId, jobDraft) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      const response = await axios.patch(`${API_BASE_URL}/jobs/${jobId}`, jobDraft);
      const updatedJob = response.data;
      const normalized = {
        ...updatedJob,
        applicants: updatedJob.applicants ?? [],
        category: normalizeCategory(updatedJob.category),
        status: (updatedJob.status ?? "active").toLowerCase()
      };
      setJobs(prev => prev.map(j => (String(j.id) === String(jobId) ? normalized : j)));
      return { ok: true, data: normalized };
    } catch (error) {
      console.error('Failed to update job:', error);
      return { ok: false, error };
    }
  };

  const deleteJob = async (jobId) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      await axios.delete(`${API_BASE_URL}/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => String(j.id) !== String(jobId)));
      return { ok: true };
    } catch (error) {
      console.error('Failed to delete job:', error);
      return { ok: false, error };
    }
  };

  const reportJob = async (reportData) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      const response = await axios.post(`${API_BASE_URL}/reports`, reportData);
      return { ok: true, data: response.data };
    } catch (error) {
      console.error('Failed to report job:', error);
      return { 
        ok: false, 
        error: error.response?.data?.message || '신고 제출에 실패했습니다.' 
      };
    }
  };

  const submitInquiry = async (data) => {
    if (!user) return { ok: false, error: '로그인이 필요합니다.' };
    try {
      const res = await axios.post(`${API_BASE_URL}/inquiries`, data);
      return { ok: true, data: res.data };
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      return { ok: false, error: error.response?.data?.message || '문의 제출에 실패했습니다.' };
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notices`);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      return [];
    }
  };

  const fetchNotice = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notices/${id}`);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch notice:', error);
      throw error;
    }
  };

  const createNotice = async (noticeData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/notices`, noticeData);
      return { ok: true, data: res.data };
    } catch (error) {
      console.error('Failed to create notice:', error);
      return { ok: false, error: error.response?.data?.message || '공지사항 작성에 실패했습니다.' };
    }
  };

  const getAdminInquiries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/inquiries`);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch admin inquiries:', error);
      throw error;
    }
  };

  const getAdminInquiry = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/inquiries/${id}`);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch admin inquiry:', error);
      throw error;
    }
  };

  const getAdminReports = async (params) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/reports`, { params });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch admin reports:', error);
      throw error;
    }
  };

  const getAdminReportDetail = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/reports/${id}`);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch admin report detail:', error);
      throw error;
    }
  };

  const updateAdminReport = async (id, updateData) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/admin/reports/${id}`, updateData);
      return { ok: true, data: res.data };
    } catch (error) {
      console.error('Failed to update admin report:', error);
      return { ok: false, error: error.response?.data?.message || '처리에 실패했습니다.' };
    }
  };

  const applyToJob = async (jobId, instructorProfileId, message) => {
    if (!user) return { ok: false, reason: 'unauthorized', message: '로그인이 필요합니다.' };

    try {
      const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        instructorProfileId,
        message
      });

      const newApp = { 
        ...response.data, 
        jobId: jobId // Ensure jobId is present for frontend filtering
      };
      setApplications((prev) => {
        const index = prev.findIndex(a => a.id === newApp.id);
        if (index > -1) {
          const next = [...prev];
          next[index] = newApp;
          return next;
        }
        return [newApp, ...prev];
      });

      return { ok: true };
    } catch (error) {
      console.error('Failed to apply:', error);
      const message = error.response?.data?.message || '지원에 실패했습니다.';
      const status = error.response?.status;
      return { ok: false, reason: status === 409 ? 'already' : 'error', message };
    }
  };

  const getApplicantsByJobId = async (jobId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      return [];
    }
  };

  const markApplicationAsViewed = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/applications/${id}/view`, {});
      setApplications(prev => prev.map(a => a.id === id ? { ...a, isViewed: true, viewedAt: new Date() } : a));
      return { ok: true };
    } catch (error) {
      console.error('Failed to mark application as viewed:', error);
      return { ok: false };
    }
  };

  const acceptApplication = async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/applications/accept/${id}`, {});
      const updated = response.data;
      setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      return { ok: true, data: updated };
    } catch (error) {
      console.error('Failed to accept application:', error);
      return { ok: false, error: error.response?.data?.message || '지원서 수락에 실패했습니다.' };
    }
  };

  const cancelApplication = async (id, reason, detail) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/applications/${id}/cancel`, {
        reason,
        detail
      });

      const updated = response.data;
      setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      return { ok: true, data: updated };
    } catch (error) {
      console.error('Failed to cancel application:', error);
      return { ok: false, error: error.response?.data?.message || '지원 취소에 실패했습니다.' };
    }
  };

  const saveProfile = async (profileData) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      let response;
      if (profileData.id && !String(profileData.id).startsWith('new_')) { // 이미 저장된 프로필(DB ID 존재)
        response = await axios.patch(`${API_BASE_URL}/instructor-profiles/${profileData.id}`, profileData);
      } else {
        // eslint-disable-next-line no-unused-vars
        const { id, ...createData } = profileData;
        response = await axios.post(`${API_BASE_URL}/instructor-profiles`, createData);
      }

      // 목록 갱신을 위해 전체 다시 불러오기 (isPrimary 동기화 등 복잡하므로)
      const listRes = await axios.get(`${API_BASE_URL}/instructor-profiles`);
      setProfiles(listRes.data);

      return { ok: true, data: response.data };
    } catch (error) {
      console.error('Failed to save profile:', error);
      return { ok: false, error: error.response?.data?.message || '프로필 저장에 실패했습니다.' };
    }
  };

  const deleteProfile = async (id) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      await axios.delete(`${API_BASE_URL}/instructor-profiles/${id}`);
      setProfiles(prev => prev.filter(p => p.id !== id));
      return { ok: true };
    } catch (error) {
      console.error('Failed to delete profile:', error);
      return { ok: false, error: error.response?.data?.message || '프로필 삭제에 실패했습니다.' };
    }
  };

  const setPrimaryProfile = async (id) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    try {
      await axios.post(`${API_BASE_URL}/instructor-profiles/${id}/set-primary`, {});
      // 목록 갱신
      const listRes = await axios.get(`${API_BASE_URL}/instructor-profiles`);
      setProfiles(listRes.data);
      return { ok: true };
    } catch (error) {
      console.error('Failed to set primary profile:', error);
      return { ok: false, error: error.response?.data?.message || '대표 설정에 실패했습니다.' };
    }
  };

  const refreshApplications = async () => {
    if (!user) return;
    try {
      const appRes = await axios.get(`${API_BASE_URL}/applications/my`);
      setApplications(appRes.data);
    } catch (e) {
      console.warn('Failed to refresh applications:', e);
    }
  };

  const createChatRoom = async (applicationId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/rooms`, { applicationId });
      return { ok: true, data: response.data };
    } catch (error) {
      console.error('Failed to create chat room:', error);
      return { ok: false, error };
    }
  };

  const getChatRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/rooms`);
      const leftRoomSet = new Set((leftChatRooms || []).map((roomId) => String(roomId)));
      return (response.data || []).filter((room) => !leftRoomSet.has(String(room.id)));
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      return [];
    }
  };

  const getChatMessages = async (roomId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/rooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
      return [];
    }
  };

  const sendChatMessage = async (roomId, content, type = 'text', imageUrl = null, imageKey = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
        content,
        type,
        imageUrl,
        imageKey
      });
      return { ok: true, data: response.data };
    } catch (error) {
      console.error('Failed to send chat message:', error);
      return { ok: false, error };
    }
  };

  const getNotifications = async (page = 1) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications?page=${page}`);
      // 채팅 알림은 알림 페이지에서 제외
      if (res.data && res.data.items) {
        res.data.items = res.data.items.filter(n => {
          const type = (n.resourceType || '').toLowerCase();
          return type !== 'chat' && type !== 'message';
        });
      }
      return res.data;
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
      return { items: [], total: 0 };
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return { ok: true };
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
      return { ok: false };
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      return { ok: true };
    } catch (e) {
      console.error("Failed to mark all as read:", e);
      return { ok: false };
    }
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("accessToken");
    if (!user || !token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/unread-count`);
      setUnreadCount(res.data);
    } catch (e) {
      console.error("Failed to fetch unread count:", e);
    }
  };

  // SSE 연결
  useEffect(() => {
    writeJSON(LS.blockedUsers, blockedUsers);
  }, [blockedUsers]);

  useEffect(() => {
    writeJSON(LS.mutedChatRooms, mutedChatRooms);
  }, [mutedChatRooms]);

  useEffect(() => {
    writeJSON(LS.leftChatRooms, leftChatRooms);
  }, [leftChatRooms]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!user || !token) return;

    fetchUnreadCount();

    let eventSource;
    const connectSSE = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // EventSource는 헤더 전송을 못하므로 쿼리파라미터로 처리
      eventSource = new EventSource(`${API_BASE_URL}/notifications/stream?token=${token}`);

      eventSource.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const newNotif = payload.data;
        const resType = (newNotif.resourceType || '').toLowerCase();
        const deepLink = newNotif.deepLink || "";
        const roomIdFromLink = deepLink.startsWith("/chat/") ? deepLink.split("/chat/")[1]?.split("?")[0] : null;
        const resourceRoomId = newNotif.resourceId || newNotif.roomId || roomIdFromLink;
        const isMutedRoom = resourceRoomId && mutedChatRooms.some((roomId) => String(roomId) === String(resourceRoomId));
        const isLeftRoom = resourceRoomId && leftChatRooms.some((roomId) => String(roomId) === String(resourceRoomId));

        if (resType === 'chat' || resType === 'message') {
          if (isMutedRoom || isLeftRoom) return;
          // 채팅 알림은 메인 알림 리스트에 넣지 않고 별도 카운트 및 배너 연동
          setUnreadMessageCount(prev => prev + 1);
          if (notificationSettings.message.on) {
            setLastChatMessage(newNotif);
          }
        } else {
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      };

      eventSource.onerror = (e) => {
        console.error("SSE Error:", e);
        eventSource.close();
        if (sseTimerRef.current) clearTimeout(sseTimerRef.current);
        sseTimerRef.current = setTimeout(connectSSE, 5000); // 5초 후 재연결
      };
    };

    connectSSE();
    return () => {
      if (eventSource) eventSource.close();
      if (sseTimerRef.current) clearTimeout(sseTimerRef.current);
    };
  }, [user, mutedChatRooms, leftChatRooms, notificationSettings.message.on]);

  const resetLocal = () => {
    try {
      localStorage.removeItem(LS.applications);
      localStorage.removeItem(LS.auth);
    } catch { }

    setJobs(
      (seedJobs ?? []).map((j, idx) => ({
        id: j.id ?? String(idx + 1),
        applicants: j.applicants ?? [],
        ownerId: j.ownerId ?? "other",
        category: normalizeCategory(j.category),
        ...j,
      }))
    );
    setApplications([]);
    setUser(null);
  };

  const addRecentlyViewedJob = (jobId) => {
    setRecentlyViewedJobs(prev => {
      const filtered = prev.filter(id => id !== jobId);
      const updated = [jobId, ...filtered].slice(0, 20); // Keep last 20
      writeJSON(LS.recentlyViewed, updated);
      return updated;
    });
  };

  const isUserBlocked = (userId) => blockedUsers.some((entry) => String(entry.userId) === String(userId));

  const blockUser = (userInfo) => {
    setBlockedUsers(prev => {
      const nextUserId = String(userInfo?.userId ?? userInfo?.id ?? "");
      if (!nextUserId || prev.some((entry) => String(entry.userId) === nextUserId)) return prev;
      const updated = [
        ...prev,
        {
          userId: nextUserId,
          nickname: userInfo?.nickname || userInfo?.name || "차단한 사용자",
          profileImage: userInfo?.profileImage || "",
          blockedAt: new Date().toISOString(),
        },
      ];
      return updated;
    });
  };

  const unblockUser = (userId) => {
    setBlockedUsers(prev => {
      const updated = prev.filter(entry => String(entry.userId) !== String(userId));
      return updated;
    });
  };

  const isChatRoomMuted = (roomId) => mutedChatRooms.some((id) => String(id) === String(roomId));

  const toggleChatRoomMute = (roomId) => {
    setMutedChatRooms(prev => (
      prev.some((id) => String(id) === String(roomId))
        ? prev.filter((id) => String(id) !== String(roomId))
        : [...prev, roomId]
    ));
  };

  const leaveChatRoom = (roomId) => {
    setLeftChatRooms(prev => (
      prev.some((id) => String(id) === String(roomId)) ? prev : [...prev, roomId]
    ));
    setMutedChatRooms(prev => prev.filter((id) => String(id) !== String(roomId)));
  };

  const hasLeftChatRoom = (roomId) => leftChatRooms.some((id) => String(id) === String(roomId));

  const value = useMemo(
    () => ({
      jobs,
      myJobs,
      appliedList,
      applications,
      refreshApplications,
      favorites,
      isFavorited,
      toggleFavorite,
      createJob,
      updateJob,
      reportJob,
      deleteJob,
      closeJob,
      applyToJob,
      cancelApplication,
      markApplicationAsViewed,
      acceptApplication,
      getApplicantsByJobId,
      user,
      profile,
      profiles,
      saveProfile,
      saveProfiles: (nextProfiles) => {
        setProfiles(nextProfiles);
        writeJSON(LS.instructorProfiles, nextProfiles);
      },
      deleteProfile,
      setPrimaryProfile,
      createChatRoom,
      getChatRooms,
      getChatMessages,
      sendChatMessage,
      login,
      localSignup,
      localLogin,
      updateUser,
      checkNickname,
      checkUsername,
      requestPhoneVerification,
      verifyPhoneCode,
      requestEmailVerification,
      verifyEmailCode,
      uploadFile,
      uploadResume,
      uploadChatImage,
      submitInquiry,
      fetchNotices,
      fetchNotice,
      createNotice,
      getAdminInquiries,
      getAdminInquiry,
      loginWithToken,
      logout,
      resetLocal,
      loading,
      isAuthLoading,
      notifications,
      unreadCount,
      setUnreadCount,
      unreadMessageCount,
      setUnreadMessageCount,
      lastChatMessage,
      setLastChatMessage,
      notificationSettings,
      updateNotificationSettings: async (updater) => {
        let next;
        setNotificationSettings(prev => {
          const update = typeof updater === 'function' ? updater(prev) : updater;
          next = { ...prev, ...update };
          return next;
        });
        
        // 서버 동기화
        if (user) {
          try {
            // posts 구조가 핵심이므로 settings 필드에 전체 담아서 보냄 (또는 필요한 것만)
            await axios.patch(`${API_BASE_URL}/notifications/settings`, {
              allowMatchingJob: true, // 맞춤 알림을 사용하므로 항상 true로 설정하거나 UI에 맞춰 연동
              settings: next 
            });
          } catch (e) { console.error('Failed to sync notification settings', e); }
        }
      },
      getNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      recentlyViewedJobs,
      addRecentlyViewedJob,
      blockedUsers,
      mutedChatRooms,
      leftChatRooms,
      blockUser,
      unblockUser,
      isUserBlocked,
      isChatRoomMuted,
      toggleChatRoomMute,
      leaveChatRoom,
      hasLeftChatRoom,
      toasts,
      showToast,
      globalModal,
      openModal,
      confirm,
      fullError,
      showFullError,
      closeFullError,
      getAdminReports,
      getAdminReportDetail,
      updateAdminReport,
    }),
    [jobs, myJobs, appliedList, applications, refreshApplications, favorites, loading, isAuthLoading, user, profiles, notifications, unreadCount, unreadMessageCount, lastChatMessage, notificationSettings, recentlyViewedJobs, blockedUsers, mutedChatRooms, leftChatRooms, toasts, globalModal, fullError, applyToJob, closeJob, createJob, deleteJob, deleteProfile, isFavorited, localLogin, loginWithToken, saveProfile, setPrimaryProfile, toggleFavorite, updateJob, updateUser, uploadChatImage, uploadFile, uploadResume, requestEmailVerification, verifyEmailCode, reportJob, submitInquiry, fetchNotices, fetchNotice, createNotice, getAdminInquiries, getAdminInquiry, getAdminReports, getAdminReportDetail, updateAdminReport]
  );

  return <PilaConContext.Provider value={value}>{children}</PilaConContext.Provider>;
}

export function usePilaCon() {
  const ctx = useContext(PilaConContext);
  if (!ctx) throw new Error("usePilaCon must be used within PilaConProvider");
  return ctx;
}
