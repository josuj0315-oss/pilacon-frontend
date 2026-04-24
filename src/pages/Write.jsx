import React, { useEffect, useMemo, useState } from "react";
import "./Write.css";
import { REGION_TABS, REGION_OPTIONS } from "../data/regions";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import { useCategory } from "../context/CategoryContext";
import { ICONS } from "../constants/icons";
import RegionFilterSheet from "../components/RegionFilterSheet";
import useDevice from "../hooks/useDevice";

const WORK_TYPES = [
  { id: "sub", label: "대타/급구" },
  { id: "short", label: "단기" },
  { id: "regular", label: "정규직" },
];

const OTHER_WORKOUT_TYPES = [
  { id: '플라잉요가', label: '플라잉요가' },
  { id: '발레핏', label: '발레핏' },
  { id: '줌바', label: '줌바' },
  { id: '재활운동', label: '재활운동' },
  { id: '크로스핏', label: '크로스핏' },
  { id: '스트레칭', label: '스트레칭' },
  { id: '체형교정', label: '체형교정' },
  { id: '기타', label: '기타' },
];

const CATEGORY_OPTIONS = ["필라테스", "요가", "PT", "기타"];
const PAY_DATE_OPTIONS = ["당일", "다음날", "주급", "월급", "직접입력"];
const TIME_OPTIONS = [
  { id: "morning", label: "오전" },
  { id: "afternoon", label: "오후" },
  { id: "all", label: "종일" },
];

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const EQUIPMENT_OPTIONS = ["리포머", "바렐", "체어", "캐딜락", "스프링보드", "소도구"];

import { fetchCenters, analyzeJobPosting } from "../api/client";

const LS_KEY = "pilacon:draft:job";

import usePageTitle from "../hooks/usePageTitle";

export default function Write() {
  usePageTitle("공고등록 | 핏잡");
  const { isDesktop } = useDevice();
  const navigate = useNavigate();
  const { createJob, logout, confirm, showToast } = usePilaCon();
  const [savedCenters, setSavedCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const startDateRef = React.useRef(null);
  const endDateRef = React.useRef(null);
  const titleRef = React.useRef(null);
  const payRef = React.useRef(null);
  const regionRef = React.useRef(null);
  
  const [errors, setErrors] = useState({});
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const { category: globalCategory, setCategory: setGlobalCategory } = useCategory();
  const [searchParams] = useSearchParams();

  const queryCategoryRaw = searchParams.get("category");
  const queryCategory = useMemo(() => {
    const decoded = queryCategoryRaw ? decodeURIComponent(queryCategoryRaw) : "";
    return CATEGORY_OPTIONS.includes(decoded) ? decoded : null;
  }, [queryCategoryRaw]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const [selectedCenterId, setSelectedCenterId] = useState("");

  const [newPost, setNewPost] = useState({
    category: globalCategory,
    title: "",
    description: "",
    studio: "", // 센터명 (기존 매핑 유지)
    type: "sub",
    regionTab: REGION_TABS[0],
    location: REGION_OPTIONS[REGION_TABS[0]][0],
    pay: "",
    payDate: "당일",
    taxDeduction: false,
    // 날짜/시간
    workDate: "",
    workEndDate: "",
    isToday: false,
    workTime: "morning",
    workTimeNote: "",
    // 센터 상세 정보
    agencyName: "",
    address: "",
    addressDetail: "",
    centerPhone: "",
    equipment: [],
    subCategory: "기타",
    daysSelected: [],
  });

  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiElapsedSeconds, setAiElapsedSeconds] = useState(0);

  // ✅ 초기 진입 시: 로컬 스토리지에서 임시저장 데이터 복원
  useEffect(() => {
    const loadCenters = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (import.meta.env.DEV) {
        console.log(`[CreateJob Debug] accessToken exists=${!!token}`);
        console.log(`[CreateJob Debug] Authorization=Bearer ${token ? token.substring(0, 20) + '...' : 'NONE'}`);
        console.log(`[CreateJob Debug] fetching center profile...`);
      }
      
      if (!token || token === 'null' || token === 'undefined') {
        console.warn("No token found, skipping center fetch");
        showToast("인증 정보가 없습니다. 다시 로그인해주세요.", "error");
        logout();
        navigate('/login');
        return;
      }
      setLoadingCenters(true);
      try {
        const data = await fetchCenters();
        setSavedCenters(data);

        // Find default center or newest center if no center is selected yet
        if (!selectedCenterId || selectedCenterId === 'none') {
          const defaultCenter = data.find(c => c.isDefault);
          if (defaultCenter) {
            handleCenterChange(defaultCenter.id, data);
          } else if (data.length > 0) {
            // If no default, pick the newest one
            handleCenterChange(data[0].id, data);
          }
        }
      } catch (e) {
        console.error("Failed to load centers", e);
        if (e.message.includes('401') || e.message.includes('Unauthorized')) {
          showToast("세션이 만료되었습니다. 다시 로그인해주세요.", "error");
          logout();
          navigate('/login');
        }
      } finally {
        setLoadingCenters(false);
      }
    };
    loadCenters();

    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // Ensure equipment and daysSelected are arrays (for backward compatibility with old drafts)
        if (typeof parsed.equipment === 'string') {
          parsed.equipment = parsed.equipment.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (typeof parsed.daysSelected === 'string') {
          parsed.daysSelected = parsed.daysSelected.split(',').map(s => s.trim()).filter(Boolean);
        }

        if (parsed.selectedCenterId) {
          setSelectedCenterId(parsed.selectedCenterId);
        }

        setNewPost(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  // 진입 혹은 URL 변경 시: queryCategory가 있으면 그것을 최우선으로 폼에 세팅
  useEffect(() => {
    if (queryCategory) {
      setGlobalCategory(queryCategory);
      setNewPost((prev) => ({ ...prev, category: queryCategory }));
    }
  }, [queryCategory, setGlobalCategory]);

  // URL 쿼리가 없는 경우에만 전역 카테고리 설정을 따라가도록 함
  useEffect(() => {
    if (!queryCategory) {
      setNewPost((prev) => ({ ...prev, category: globalCategory }));
    }
  }, [globalCategory, queryCategory]);

  useEffect(() => {
    if (!isAiLoading) {
      setAiElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setAiElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isAiLoading]);

  // ✅ 임시저장 기능
  const handleSaveDraft = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(newPost));
    showToast("작성 내용이 임시저장되었습니다.", "success");
  };

  // ✅ 센터 선택 시 로직
  const handleCenterChange = (id, centersList = savedCenters) => {
    setSelectedCenterId(id);
    if (id === "new") {
      // Save draft before navigating
      localStorage.setItem(LS_KEY, JSON.stringify({ ...newPost, selectedCenterId: 'none' }));
      navigate('/profile/centers');
      return;
    }
    if (id === "none" || !id) {
      setNewPost(prev => ({
        ...prev,
        studio: "",
        agencyName: "",
        address: "",
        addressDetail: "",
        centerPhone: "",
        equipment: [],
      }));
    } else if (id) {
      const center = centersList.find(c => c.id == id);
      if (center) {
        // 주소 파싱 시도 (예: "서울 강남구")
        let parsedRegionTab = center.regionTab || "";
        let parsedLocation = center.address || "";

        if (!parsedRegionTab && center.address && center.address.includes(" ")) {
          const parts = center.address.split(" ");
          parsedRegionTab = parts[0];
          parsedLocation = center.address; // 필터에서는 전체 주소를 쓰는 경우가 많음
        }

        setNewPost(prev => ({
          ...prev,
          studio: center.name,
          agencyName: center.businessName,
          address: center.address,
          addressDetail: center.addressDetail,
          centerPhone: center.phone,
          equipment: typeof center.equipment === 'string' ? center.equipment.split(',').map(s => s.trim()).filter(Boolean) : (center.equipment || []),
          regionTab: parsedRegionTab || prev.regionTab,
          location: parsedLocation || prev.location,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!newPost.title.trim()) newErrors.title = "공고 제목을 입력해주세요.";
    if (!newPost.pay) newErrors.pay = "급여를 입력해주세요.";
    if (!newPost.location) newErrors.location = "근무 지역을 선택해주세요.";
    if (!newPost.workDate) newErrors.workDate = "날짜를 선택해주세요.";
    if (newPost.type !== 'regular' && !newPost.isToday && !newPost.workEndDate) newErrors.workEndDate = "종료 날짜를 선택해주세요.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("입력되지 않은 필수 항목이 있습니다.", "error");
      
      // Focus first error
      if (newErrors.title) titleRef.current?.focus();
      else if (newErrors.pay) payRef.current?.focus();
      else if (newErrors.workDate) startDateRef.current?.focus();
      else if (newErrors.workEndDate) endDateRef.current?.focus();
      return;
    }

    const payNumber = Number(String(newPost.pay ?? "").replace(/\D/g, ""));

    const finalCategory = CATEGORY_OPTIONS.includes(newPost.category)
      ? newPost.category
      : globalCategory;

    const result = await createJob({
      title: newPost.title,
      description: newPost.description,
      category: finalCategory,
      subCategory: finalCategory === "기타" ? newPost.subCategory : "",
      type: newPost.type,
      location: newPost.location,
      regionTab: newPost.regionTab,
      pay: String(payNumber),
      payDate: newPost.payDate,
      taxDeduction: newPost.taxDeduction === true || newPost.taxDeduction === "true",

      // 센터 연동 필드
      centerId: (selectedCenterId && selectedCenterId !== 'none' && selectedCenterId !== 'new') ? Number(selectedCenterId) : null,
      centerTempName: newPost.studio || "미등록 센터",
      centerTempBusinessName: newPost.agencyName,
      centerTempAddress: newPost.address,
      centerTempAddressDetail: newPost.addressDetail,
      centerTempPhone: newPost.centerPhone,
      centerTempEquipment: Array.isArray(newPost.equipment) ? newPost.equipment.join(', ') : newPost.equipment,

      // 기존 필드 유지 (하위 호환성)
      studio: newPost.studio || "미등록 센터",
      companyName: newPost.agencyName || newPost.studio || "미등록 센터",
      address: newPost.address,
      addressDetail: newPost.addressDetail,
      phone: newPost.centerPhone,
      equipment: newPost.equipment || [],

      workTime: TIME_OPTIONS.find(o => o.id === newPost.workTime)?.label || "오전",
      workTimeNote: newPost.workTimeNote,
      days: newPost.type === 'regular' ? [newPost.workDate] : (newPost.isToday ? [newPost.workDate] : [newPost.workDate, newPost.workEndDate].filter(Boolean)),
      daysOfWeek: newPost.daysSelected,
      time: `${TIME_OPTIONS.find(o => o.id === newPost.workTime)?.label || "오전"}${newPost.workTimeNote ? ` (${newPost.workTimeNote})` : ""}`,
    });

    if (result.ok) {
      localStorage.removeItem(LS_KEY);
      showToast("공고가 등록되었습니다!", "success");
      navigate("/");
    } else {
      if (result.error?.response?.status === 401) {
        showToast("세션이 만료되었습니다. 다시 로그인해주세요.", "error");
        logout();
        navigate('/login');
        return;
      }
      showToast("공고 등록에 실패했습니다: " + (result.error?.response?.data?.message || result.error?.message || "알 수 없는 오류"), "error");
    }
  };

  // ✅ 유효성 조건
  const isSubmitDisabled =
    !newPost.category ||
    !newPost.title.trim() ||
    ((selectedCenterId !== "none" && !!selectedCenterId) && !newPost.studio.trim()) ||
    !newPost.type ||
    !newPost.workDate ||
    (newPost.type !== 'regular' && !newPost.isToday && !newPost.workEndDate) ||
    !newPost.workTime ||
    !newPost.pay;

  // 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
  const displayDate = newPost.workDate ? newPost.workDate.replace(/-/g, '.') : "";
  const displayEndDate = newPost.workEndDate ? newPost.workEndDate.replace(/-/g, '.') : "";
  const workTypeLabel = WORK_TYPES.find((t) => t.id === newPost.type)?.label || "-";
  const summaryDateText = newPost.type === "regular"
    ? (displayDate || "미입력")
    : newPost.isToday
      ? `${displayDate || "오늘"} (당일)`
      : (displayDate && displayEndDate ? `${displayDate} ~ ${displayEndDate}` : "미입력");
  const summaryTimeText = `${TIME_OPTIONS.find((o) => o.id === newPost.workTime)?.label || "-"}${newPost.workTimeNote ? ` (${newPost.workTimeNote})` : ""}`;
  const summaryPayText = newPost.pay ? `${Number(newPost.pay).toLocaleString()}원` : "미입력";

  // 당일 체크박스 핸들러
  const handleTodayChange = (checked) => {
    if (checked) {
      const today = new Date();
      const daysKOR = ['일', '월', '화', '수', '목', '금', '토'];
      const todayDayKOR = daysKOR[today.getDay()];
      setNewPost(prev => ({
        ...prev,
        isToday: true,
        workDate: todayStr,
        workEndDate: todayStr,
        daysSelected: [todayDayKOR]
      }));
    } else {
      setNewPost(prev => ({
        ...prev,
        isToday: false,
        workDate: "",
        workEndDate: "",
        daysSelected: []
      }));
    }
  };

  const handleStartDateChange = (val) => {
    setNewPost(prev => ({
      ...prev,
      workDate: val,
      workEndDate: (prev.workEndDate && prev.workEndDate < val) ? "" : prev.workEndDate
    }));
  };

  // 요일 선택 핸들러
  const handleDayToggle = (day) => {
    setNewPost(prev => {
      const currentArr = Array.isArray(prev.daysSelected) ? prev.daysSelected : [];
      return {
        ...prev,
        daysSelected: currentArr.includes(day)
          ? currentArr.filter(d => d !== day)
          : [...currentArr, day]
      };
    });
  };

  // ✅ AI 자동 채우기 핸들러
  const handleAiAutoFill = async () => {
    if (!aiInput.trim()) {
      showToast("분석할 공고 내용을 입력해주세요.", "info");
      return;
    }

    setIsAiLoading(true);
    setAiMessage("");
    try {
      const result = await analyzeJobPosting(aiInput);

      if (result) {
        // 상세 내용 덮어쓰기 방지 및 병합 로직
        let finalDescription = result.description || "";
        if (newPost.description.trim()) {
          const ok = await confirm("내용 덮어쓰기", "이미 입력된 상세 내용이 있습니다. AI가 분석한 내용으로 교체할까요?\n(취소 시 기존 내용 뒤에 추가됩니다)", { isDanger: true });
          if (ok) {
            finalDescription = result.description;
          } else {
            finalDescription = `${newPost.description}\n\n[AI 추가]\n${result.description}`;
          }
        }

        // 폼 데이터 반영
        setNewPost(prev => {
          const updated = { ...prev };

          if (result.category && CATEGORY_OPTIONS.includes(result.category)) {
            updated.category = result.category;
            setGlobalCategory(result.category);
          }
          if (result.title) updated.title = result.title;
          if (result.type && WORK_TYPES.some(t => t.id === result.type)) updated.type = result.type;

          if (result.workDate) updated.workDate = result.workDate;
          if (result.workEndDate) updated.workEndDate = result.workEndDate;
          if (result.isToday !== undefined) updated.isToday = result.isToday;
          if (result.daysSelected) updated.daysSelected = result.daysSelected;

          if (result.workTime && TIME_OPTIONS.some(o => o.id === result.workTime)) updated.workTime = result.workTime;
          if (result.workTimeNote) updated.workTimeNote = result.workTimeNote;

          if (result.pay) updated.pay = String(result.pay).replace(/\D/g, "");
          if (result.payDate && PAY_DATE_OPTIONS.includes(result.payDate)) updated.payDate = result.payDate;
          if (result.taxDeduction !== undefined) updated.taxDeduction = result.taxDeduction;

          if (result.studio) updated.studio = result.studio;
          if (result.agencyName) updated.agencyName = result.agencyName;

          // 주소 처리: 시/도 구/군 단위가 있으면 반영
          if (result.address) {
            // REGION_TABS와 매칭 시도
            const regionMatch = REGION_TABS.find(tab => result.address.includes(tab));
            if (regionMatch) {
              updated.regionTab = regionMatch;
              updated.location = result.address;
            } else {
              updated.address = result.address;
            }
          }
          if (result.addressDetail) updated.addressDetail = result.addressDetail;
          if (result.centerPhone) updated.centerPhone = result.centerPhone;

          // 사용기구
          if (result.equipment) {
            const standard = result.equipment.filter(e => EQUIPMENT_OPTIONS.includes(e));
            const custom = result.customEquipment || result.equipment.filter(e => !EQUIPMENT_OPTIONS.includes(e));
            updated.equipment = [...new Set([...standard, ...custom])];
          }

          updated.description = finalDescription;

          return updated;
        });

        // 센터 선택 해제 (직접 입력 모드로 전환되도록)
        setSelectedCenterId("none");
        setAiMessage("자동 입력 완료, 내용을 확인해주세요.");
      }
    } catch (e) {
      console.error(e);
      showToast("AI 분석 중 오류가 발생했습니다.", "error");
      setAiMessage("분석 실패. 다시 시도해주세요.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // 기구 선택 핸들러
  const handleEquipmentToggle = (item) => {
    setNewPost(prev => {
      const currentArr = Array.isArray(prev.equipment) ? prev.equipment : [];
      return {
        ...prev,
        equipment: currentArr.includes(item)
          ? currentArr.filter(e => e !== item)
          : [...currentArr, item]
      };
    });
  };

  const aiLoadingGuide = useMemo(() => {
    if (aiElapsedSeconds < 4) return "입력한 내용을 읽고 핵심 정보를 정리하고 있어요.";
    if (aiElapsedSeconds < 9) return "근무 형태, 급여, 지역 같은 항목을 추출하는 중입니다.";
    if (aiElapsedSeconds < 15) return "조금 더 걸리고 있어요. 작성 가능한 형태로 정리 중입니다.";
    return "문장이 길거나 정보가 많으면 시간이 조금 더 걸릴 수 있어요.";
  }, [aiElapsedSeconds]);

  const aiElapsedLabel = useMemo(() => {
    const minutes = Math.floor(aiElapsedSeconds / 60);
    const seconds = aiElapsedSeconds % 60;
    if (minutes === 0) return `${seconds}초째 분석 중`;
    return `${minutes}분 ${seconds}초째 분석 중`;
  }, [aiElapsedSeconds]);

  return (
    <div className="write-container">
      {/* 고정 헤더 */}
      <header className="write-header">
        <div className="header-left">
          <button type="button" className="back-btn" onClick={goBack}>
            <ICONS.back size={22} />
          </button>
        </div>
        <h1>공고 올리기</h1>
        <button type="button" className="ghost-btn active" onClick={handleSaveDraft}>임시저장</button>
      </header>

      {/* 스크롤 영역 */}
      <div className="write-scroll-area">
        <div className={`write-desktop-layout ${isDesktop ? "desktop" : ""}`}>
        <div className="write-form">
          {/* AI 자동채우기 영역 */}
          <div className="form-section ai-section">
            <div className="ai-header">
              <div className="ai-title">
                <ICONS.zap size={16} className="ai-icon" />
                <h3>자유글로 공고 작성</h3>
              </div>
              <p className="ai-desc">공고 내용을 일상 언어로 한꺼번에 적어보세요.</p>
            </div>

            <div className="ai-textarea-wrapper">
              <textarea
                className="ai-textarea"
                placeholder="예: 강남역 필라테스 대타 구해요. 내일 오후 2~4시 리포머 수업. 시급 4만원 당일지급."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
            </div>

            <div className="ai-footer">
              <span className="ai-helper-text">
                <ICONS.check size={12} />
                내용을 바탕으로 아래 항목들을 자동 입력합니다
              </span>

              <button
                type="button"
                className={`ai-fill-btn ${isAiLoading ? 'loading' : ''}`}
                onClick={handleAiAutoFill}
                disabled={isAiLoading || !aiInput.trim()}
              >
                {isAiLoading ? (
                  <>분석 중...</>
                ) : (
                  <>
                    <ICONS.zap size={18} />
                    AI로 자동 채우기
                  </>
                )}
              </button>

              {isAiLoading && (
                <div className="ai-loading-panel" aria-live="polite" aria-busy="true">
                  <div className="ai-loading-top">
                    <div className="ai-loading-title-row">
                      <span className="ai-loading-spinner" aria-hidden="true" />
                      <strong>AI가 공고를 분석하고 있어요</strong>
                    </div>
                    <span className="ai-loading-time">{aiElapsedLabel}</span>
                  </div>
                  <p className="ai-loading-guide">{aiLoadingGuide}</p>
                  <div className="ai-loading-progress" aria-hidden="true">
                    <span className="ai-loading-progress-bar" />
                  </div>
                </div>
              )}

              {aiMessage && (
                <div className={`ai-message ${aiMessage.includes('실패') ? 'error' : 'success'}`}>
                  {aiMessage.includes('실패') ? <ICONS.close size={14} /> : <ICONS.check size={14} />}
                  {aiMessage}
                </div>
              )}
            </div>
          </div>

          <form className="original-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>

            {/* 카드 1: 기본 정보 */}
            <div className="form-section">
              <div className="field">
                <label className="label">직군 <span className="required">*</span></label>
                <select
                  className="select"
                  value={newPost.category}
                  onChange={(e) => {
                    const next = e.target.value;
                    setNewPost((prev) => ({ ...prev, category: next }));
                    setGlobalCategory(next);
                  }}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {newPost.category === "기타" && (
                <div className="field">
                  <label className="label">운동 종목 <span className="required">*</span></label>
                  <div className="chips-row">
                    {OTHER_WORKOUT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={`chip-btn ${newPost.subCategory === type.id ? "active" : ""}`}
                        onClick={() => setNewPost({ ...newPost, subCategory: type.id })}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="field">
                <label className="label">공고 제목 <span className="required">*</span></label>
                <input
                  ref={titleRef}
                  type="text"
                  placeholder="예: XX필라테스 내일 대강 급하게 구합니다"
                  className={`input ${errors.title ? 'error' : ''}`}
                  value={newPost.title}
                  onChange={(e) => {
                    setNewPost({ ...newPost, title: e.target.value });
                    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                  }}
                />
                {errors.title && <p className="field-error">{errors.title}</p>}
              </div>
            </div>

            {/* 카드 2: 근무 */}
            <div className="form-section">
              <div className="field">
                <label className="label">근무 형태 <span className="required">*</span></label>
                <select
                  className="select"
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                >
                  {WORK_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                {newPost.type === 'regular' ? (
                  <>
                    <label className="label">마감일 선택 <span className="required">*</span></label>
                    <div
                      className="date-input-wrapper"
                      onClick={() => startDateRef.current?.showPicker()}
                    >
                      <div className="date-display" data-placeholder="마감일 선택">
                        {displayDate}
                      </div>
                      <input
                        ref={startDateRef}
                        type="date"
                        className="real-date-input"
                        value={newPost.workDate}
                        onChange={(e) => setNewPost({ ...newPost, workDate: e.target.value })}
                        min={todayStr}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="label-with-action">
                      <label className="label">날짜 선택 <span className="required">*</span></label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newPost.isToday}
                          onChange={(e) => handleTodayChange(e.target.checked)}
                        />
                        <span>당일</span>
                      </label>
                    </div>
                    <div className="date-range-grid">
                      <div
                        className={`date-input-wrapper ${newPost.isToday ? 'disabled' : ''}`}
                        onClick={() => !newPost.isToday && startDateRef.current?.showPicker()}
                      >
                        <div className="date-display" data-placeholder="시작일">
                          {displayDate}
                        </div>
                        <input
                          ref={startDateRef}
                          type="date"
                          className="real-date-input"
                          value={newPost.workDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                          disabled={newPost.isToday}
                          min={todayStr}
                        />
                      </div>
                      <span className="date-separator">~</span>
                      <div
                        className={`date-input-wrapper ${(newPost.isToday || !newPost.workDate) ? 'disabled' : ''}`}
                        onClick={() => !(newPost.isToday || !newPost.workDate) && endDateRef.current?.showPicker()}
                      >
                        <div className="date-display" data-placeholder="종료일">
                          {displayEndDate}
                        </div>
                        <input
                          ref={endDateRef}
                          type="date"
                          className="real-date-input"
                          value={newPost.workEndDate}
                          onChange={(e) => setNewPost({ ...newPost, workEndDate: e.target.value })}
                          disabled={newPost.isToday || !newPost.workDate}
                          min={newPost.workDate || todayStr}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="field">
                <label className="label">근무 요일 <span className="required">*</span></label>
                <div className="days-selection-grid">
                  {WEEK_DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`day-chip ${newPost.daysSelected.includes(day) ? 'active' : ''}`}
                      onClick={() => handleDayToggle(day)}
                      disabled={newPost.isToday}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="label">시간 <span className="required">*</span></label>
                <div className="time-grid">
                  <div className="segment-wrap">
                    {TIME_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`segment-btn ${newPost.workTime === opt.id ? 'active' : ''}`}
                        onClick={() => setNewPost({ ...newPost, workTime: opt.id })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="time-note-input"
                    placeholder="예: 6~8, 3타임"
                    value={newPost.workTimeNote}
                    onChange={(e) => setNewPost({ ...newPost, workTimeNote: e.target.value })}
                  />
                </div>
                <p className="time-helper">정확한 시간을 입력하면 강사님들이 지원하기 좋아요.</p>
              </div>
            </div>

            {/* 카드 3: 급여/정산 */}
            <div className="form-section">
              <div className="field">
                <label className="label">급여 <span className="required">*</span></label>
                <input
                  ref={payRef}
                  className={`input ${errors.pay ? 'error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 30000"
                  value={newPost.pay ?? ""}
                  onChange={(e) => {
                    const onlyNumber = e.target.value.replace(/\D/g, "");
                    setNewPost({ ...newPost, pay: onlyNumber });
                    if (errors.pay) setErrors(prev => ({ ...prev, pay: '' }));
                  }}
                />
                {errors.pay && <p className="field-error">{errors.pay}</p>}
              </div>

              <div className="grid2">
                <div className="field">
                  <label className="label">입금일</label>
                  <select
                    className="select"
                    value={newPost.payDate}
                    onChange={(e) => setNewPost({ ...newPost, payDate: e.target.value })}
                  >
                    {PAY_DATE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="field toggle-field">
                  <label className="label">3.3% 세금 공제</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={newPost.taxDeduction}
                      onChange={(e) => setNewPost({ ...newPost, taxDeduction: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* 카드 4: 센터 선택 */}
            <div className="form-section">
              <div className="field">
                <label className="label">센터 선택</label>
                <select
                  className="select"
                  value={selectedCenterId}
                  onChange={(e) => handleCenterChange(e.target.value)}
                >
                  <option value="none">센터 선택 안함(미등록)</option>
                  {savedCenters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.isDefault ? ' (기본)' : ''}</option>
                  ))}
                  <option value="new">+ 새 센터 등록하기</option>
                </select>
              </div>

              {(selectedCenterId === "none" || !selectedCenterId) && (
                <div className="center-detail-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    공고에 표시될 센터 정보를 직접 입력해주세요.
                  </p>
                  <div className="field">
                    <label className="label">센터명</label>
                    <input
                      type="text"
                      placeholder="예: XX필라테스 강남점"
                      className="input"
                      value={newPost.studio}
                      onChange={(e) => setNewPost({ ...newPost, studio: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label className="label">업체명(사업자명)</label>
                    <input
                      type="text"
                      placeholder="예: (주)필라콘컴퍼니"
                      className="input"
                      value={newPost.agencyName}
                      onChange={(e) => setNewPost({ ...newPost, agencyName: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label className="label">주소 선택</label>
                    <div
                      className={`address-trigger ${!newPost.address ? 'placeholder' : ''}`}
                      onClick={() => setShowAddressSheet(true)}
                    >
                      <ICONS.location size={18} />
                      <span>{newPost.address || '주소를 선택해주세요'}</span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">상세 주소 입력</label>
                    <input
                      type="text"
                      placeholder="예: 테헤란로 123, 5층"
                      className="input"
                      value={newPost.addressDetail}
                      onChange={(e) => setNewPost({ ...newPost, addressDetail: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label className="label">센터 전화번호</label>
                    <input
                      type="text"
                      placeholder="예: 02-123-4567"
                      className="input"
                      value={newPost.centerPhone}
                      onChange={(e) => setNewPost({ ...newPost, centerPhone: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label className="label">사용기구</label>
                    <div className="equipment-chips-grid">
                      {EQUIPMENT_OPTIONS.map(item => (
                        <button
                          key={item}
                          type="button"
                          className={`chip-btn ${Array.isArray(newPost.equipment) && newPost.equipment.includes(item) ? 'active' : ''}`}
                          onClick={() => handleEquipmentToggle(item)}
                        >
                          {item}
                        </button>
                      ))}
                      <input
                        type="text"
                        placeholder="직접 입력"
                        className="chip-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val && Array.isArray(newPost.equipment) && !newPost.equipment.includes(val)) {
                              handleEquipmentToggle(val);
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    {Array.isArray(newPost.equipment) && newPost.equipment.filter(e => !EQUIPMENT_OPTIONS.includes(e)).length > 0 && (
                      <div className="selected-equipment-tags" style={{ marginTop: '8px' }}>
                        {newPost.equipment.filter(e => !EQUIPMENT_OPTIONS.includes(e)).map(e => (
                          <div key={e} className="custom-tag">
                            <span>{e}</span>
                            <button type="button" onClick={() => handleEquipmentToggle(e)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedCenterId && selectedCenterId !== "none" && selectedCenterId !== "new") && (
                <div className="selected-center-preview" style={{ marginTop: '12px', padding: '16px', background: '#f8faff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{newPost.studio}</h4>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b' }}>{newPost.address || '주소 정보 없음'}</p>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#94a3b8' }}>{newPost.centerPhone || '전화번호 정보 없음'}</p>
                </div>
              )}
            </div>

            {/* 카드 5: 상세 내용 */}
            <div className="form-section">
              <div className="field">
                <label className="label">상세 내용</label>
                <textarea
                  className="textarea"
                  placeholder="강사님들께 전할 상세 내용을 적어주세요."
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                />
              </div>
            </div>

            <p className="hint-text">게시 후 제목만 초기화되고, 다른 설정값은 유지됩니다.</p>
          </form>
        </div>

        {isDesktop && (
          <aside className="write-side-summary">
            <h3>공고 미리보기</h3>
            <div className="summary-title">{newPost.title || "공고 제목을 입력해주세요"}</div>
            <div className="summary-list">
              <div><span>직군</span><strong>{newPost.category || "-"}</strong></div>
              <div><span>근무 형태</span><strong>{workTypeLabel}</strong></div>
              <div><span>근무 날짜</span><strong>{summaryDateText}</strong></div>
              <div><span>근무 시간</span><strong>{summaryTimeText}</strong></div>
              <div><span>근무 지역</span><strong>{newPost.location || newPost.address || "미입력"}</strong></div>
              <div><span>급여</span><strong>{summaryPayText}</strong></div>
              <div><span>센터명</span><strong>{newPost.studio || "미입력"}</strong></div>
            </div>
            <p className="summary-note">데스크톱에서는 입력값을 우측에서 바로 확인할 수 있습니다.</p>
          </aside>
        )}
        </div>

        {/* 하단 고정 버튼 영역 */}
        <div className="write-cta-area">
          <button
            className="submit-btn"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            공고 게시하기
          </button>
        </div>

        {showAddressSheet && (
          <RegionFilterSheet
            initialRegions={newPost.address ? [newPost.address] : []}
            onApply={(regions) => {
              if (regions.length > 0) {
                setNewPost({ ...newPost, address: regions[0] });
              }
            }}
            onClose={() => setShowAddressSheet(false)}
            disableAllOptions={true}
            maxSelect={1}
            title="주소 선택"
            includeTabName={true}
          />
        )}
      </div>
    </div>
  );
}
