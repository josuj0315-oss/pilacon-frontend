import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import {
  ArrowLeft,
  Share2,
  Star,
  Calendar,
  Clock,
  MapPin,
  Activity,
  Info,
  Phone,
  Search,
  Coins,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { formatPayKRW } from "../utils/format";
import ApplyConfirmSheet from "../components/ApplyConfirmSheet";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function JobPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, user, deleteJob, loading: storeLoading, isFavorited, toggleFavorite, applications, refreshApplications, showToast, confirm } = usePilaCon();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 이미 지원했는지 확인 (취소된 경우 제외)
  const existingApplication = (applications || []).find(
    (a) => (
      String(a.jobId) === String(id) || 
      String(a.job?.id) === String(id) || 
      String(a.job_id) === String(id)
    ) && a.status !== 'canceled'
  );

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/jobs/${id}`);
        if (res.data) {
          setJob(res.data);
        } else {
          const found = jobs?.find(j => String(j.id) === String(id));
          setJob(found || null);
        }
      } catch (err) {
        console.error("Failed to fetch job detail:", err);
        const found = jobs?.find(j => String(j.id) === String(id));
        setJob(found || null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, jobs]);

  // mount 시 또는 id 변경 시 지원 내역 최신화
  useEffect(() => {
    if (user && refreshApplications) {
      refreshApplications();
    }
  }, [id, user]);

  const favorited = job ? isFavorited(job.id) : false;

  if (loading || storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#5b5ff5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search size={32} color="#94a3b8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">게시물을 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-8">요청하신 공고가 삭제되었거나 잘못된 경로입니다.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#5b5ff5] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const isOwner = user && String(user.id) === String(job?.userId);
  const isClosed = String(job?.status || "active").toLowerCase() === "closed";

  const handleApplyClick = () => {
    if (isClosed) return;
    if (!user) {
      showToast("로그인이 필요합니다.", "info");
      return;
    }
    setShowApplySheet(true);
  };

  const handleDelete = async () => {
    const ok = await confirm("공고 삭제", "정말 삭제할까요? 삭제하면 되돌릴 수 없습니다.");
    if (ok) {
      const res = await deleteJob(job.id);
      if (res.ok) {
        showToast("공고가 삭제되었습니다.", "success");
        navigate("/activity?tab=recruitment");
      } else {
        showToast("삭제에 실패했습니다.", "error");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/jobs/${job.id}/edit`);
  };

  // Helper for time display
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "방금 전";
    const now = new Date();
    const created = new Date(dateStr);
    const diff = Math.floor((now - created) / 1000 / 60); // minutes
    if (isNaN(diff)) return "방금 전";
    if (diff < 1) return "방금 전";
    if (diff < 60) return `${diff}분 전`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  return (
    <div className="job-post-detail bg-white min-h-screen font-sans selection:bg-indigo-100">
      {/* 1) Sticky Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-[60]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-14 relative">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors" aria-label="뒤로가기">
            <ArrowLeft size={24} color="#1e293b" />
          </button>

          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors" aria-label="공유하기">
              <Share2 size={22} color="#1e293b" />
            </button>
            <button
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              onClick={() => toggleFavorite(job.id)}
              aria-label="찜하기"
            >
              <Star
                size={22}
                className={`transition-all duration-300 ${favorited ? "scale-110 fill-[#fbbf24] text-[#fbbf24]" : "text-[#1e293b]"}`}
              />
            </button>
            {isOwner && (
              <div className="relative">
                <button
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="더보기"
                >
                  <MoreVertical size={22} color="#1e293b" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleEdit();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-gray-700 hover:bg-indigo-50 hover:text-[#5b5ff5] transition-colors"
                      >
                        <Edit size={16} />
                        수정하기
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDelete();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={16} />
                        삭제하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-32">
        {/* 2) Core Info Section */}
        <section className="pt-8 pb-8 border-b border-gray-100">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-indigo-50 text-[#5b5ff5] text-[11px] font-black rounded-full uppercase tracking-wider">
              {job.category || "필라테스"}
            </span>
            {job.type === 'sub' && (
              <span className="px-3 py-1 bg-rose-50 text-[#ff4747] text-[11px] font-black rounded-full uppercase tracking-wider">
                대타/급구
              </span>
            )}
            {job.type === 'short' && (
              <span className="px-3 py-1 bg-purple-50 text-[#9333ea] text-[11px] font-black rounded-full uppercase tracking-wider">
                단기
              </span>
            )}
            {job.type === 'regular' && (
              <span className="px-3 py-1 bg-emerald-50 text-[#10b981] text-[11px] font-black rounded-full uppercase tracking-wider">
                정규직
              </span>
            )}
            {job.taxDeduction && (
              <span className="px-3 py-1 bg-gray-100 text-[#64748b] text-[11px] font-black rounded-full uppercase tracking-wider border border-gray-200">
                3.3% 공제
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#1e293b] leading-[1.3] mb-3">
            {job.title}
          </h1>
          <div className="text-[13px] font-bold text-gray-400 flex items-center gap-2">
            <span>{getTimeAgo(job.createdAt)}</span>
            <span>·</span>
            <span>조회 {job.views || 0}</span>
            {job.user && (
              <>
                <span>·</span>
                <span className="text-gray-400">{job.user.nickname || job.user.name || '사용자'}</span>
              </>
            )}
          </div>
        </section>

        {/* 3) Work Conditions Section (Vertical List) */}
        <section className="py-2">
          {/* Work Date / Deadline */}
          <div className="py-6 flex items-start gap-4 border-b border-gray-50 last:border-0">
            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar size={20} color="#64748b" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">
                {job.type === 'regular' ? '모집 마감일' : '근무 날짜'}
              </span>
              <span className="text-[16px] font-black text-[#1e293b]">
                {job.days && job.days.length > 1
                  ? (job.days[0] === job.days[1] ? job.days[0] : `${job.days[0]} ~ ${job.days[1]}`)
                  : (job.days?.[0] || job.workDate || "협의 가능")}
              </span>
              {job.daysOfWeek && job.daysOfWeek.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.daysOfWeek.map((day, dIdx) => (
                    <span key={dIdx} className="px-1.5 py-0.5 bg-indigo-50 text-[#5b5ff5] text-[10px] font-black rounded">
                      {day}요일
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Work Time */}
          <div className="py-6 flex items-start gap-4 border-b border-gray-50 last:border-0">
            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} color="#64748b" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">근무 시간</span>
              <span className="text-[16px] font-black text-[#1e293b]">
                {job.workTime ? `${job.workTime}${job.workTimeNote ? ` (${job.workTimeNote})` : ''}` : (job.time || "오전/오후 협의")}
              </span>
            </div>
          </div>

          {/* Pay Info */}
          <div className="py-6 flex items-start gap-4 border-b border-gray-50 last:border-0">
            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Coins size={20} color="#64748b" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">급여 및 정산</span>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-black text-[#5b5ff5]">
                  {formatPayKRW(job.pay)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-500">
                    지급일: {job.payDate || "협의"}
                  </span>
                  {job.taxDeduction && (
                    <span className="px-2 py-0.5 bg-rose-50 text-[#ff4747] text-[10px] font-black rounded-md border border-rose-100">
                      3.3% 공제
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center Location */}
          <div className="py-6 flex items-start gap-4 border-b border-gray-50 last:border-0">
            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <MapPin size={20} color="#64748b" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">센터 위치</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[16px] font-black text-[#1e293b]">{job.studio}</span>
                <span className="text-[14px] font-bold text-gray-500 leading-snug">
                  {job.address || job.location || job.region || "위치 정보 없음"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4) Equipment Section */}
        {job.equipment && (Array.isArray(job.equipment) ? job.equipment.length > 0 : String(job.equipment).length > 0) && (
          <section className="py-10 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} color="#1e293b" strokeWidth={3} />
              <h3 className="text-[16px] font-black text-[#1e293b]">보유 및 사용 기구</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(Array.isArray(job.equipment) ? job.equipment : String(job.equipment).split(',')).map((item, idx) => (
                <span key={idx} className="px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-50/50">
                  {item.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 5) Description Section */}
        <section className="py-10 border-b border-gray-100">
          <h3 className="text-[16px] font-black text-[#1e293b] mb-5">상세 내용</h3>
          <div className="text-[15px] font-bold text-[#475569] leading-[1.85] whitespace-pre-wrap">
            {job.description || "상세 내용이 작성되지 않았습니다."}
          </div>
        </section>

        {/* 6) Center Info Section */}
        <section className="py-10">
          <div className="flex items-center gap-2 mb-5">
            <Info size={19} color="#1e293b" strokeWidth={3} />
            <h3 className="text-[16px] font-black text-[#1e293b]">센터 정보</h3>
          </div>

          <div className="bg-gray-50/80 p-7 rounded-[28px] space-y-5 border border-gray-100/50">
            {job.companyName && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-400">업체명</span>
                <span className="text-[15px] font-black text-[#1e293b]">{job.companyName}</span>
              </div>
            )}
            {job.phone && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-400">센터 연락처</span>
                <div className="flex items-center gap-1.5 text-[#5b5ff5]">
                  <Phone size={14} className="fill-[#5b5ff5]" strokeWidth={3} />
                  <span className="text-[15px] font-black tracking-tight">{job.phone}</span>
                </div>
              </div>
            )}
            {job.payDate && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-400">급여 지급일</span>
                <span className="text-[15px] font-black text-[#1e293b]">{job.payDate}</span>
              </div>
            )}
            {job.taxDeduction && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-400">세금 공제</span>
                <span className="text-[15px] font-black text-[#e11d48]">3.3% 공제 적용</span>
              </div>
            )}
            {!job.companyName && !job.phone && !job.payDate && !job.taxDeduction && (
              <p className="text-center text-gray-400 text-sm font-bold py-2">등록된 센터 상세 정보가 없습니다.</p>
            )}
          </div>
        </section>
      </main>

      {/* 7) Fixed Bottom CTA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50">
        <div className="max-w-lg mx-auto px-5 pt-3.5 pb-10">
          {isOwner ? (
            <button className="w-full h-[58px] bg-gray-100 text-gray-400 rounded-2xl text-[16px] font-black cursor-not-allowed shadow-inner" disabled>
              내가 등록한 공고입니다
            </button>
          ) : isClosed ? (
            <button
              className="w-full h-[58px] bg-gray-200 text-gray-400 rounded-2xl text-[16px] font-black flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <Info size={20} strokeWidth={3} />
              모집이 완료된 공고입니다
            </button>
          ) : existingApplication ? (
            <button
              className="w-full h-[58px] bg-gray-100 text-gray-400 rounded-2xl text-[16px] font-black flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
              onClick={() => navigate(`/activity?view=appliedDetail&id=${existingApplication.id}`)}
              disabled
            >
              <Activity size={20} className="text-gray-300" strokeWidth={3} />
              이미 지원한 공고입니다
            </button>
          ) : (
            <button
              className="w-full h-[58px] bg-[#5b5ff5] text-white rounded-2xl text-[16px] font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all duration-200"
              onClick={handleApplyClick}
            >
              <Activity size={20} strokeWidth={3} />
              지원하기
            </button>
          )}
        </div>
      </footer>

      {showApplySheet && (
        <ApplyConfirmSheet
          job={job}
          onClose={() => setShowApplySheet(false)}
          onApplySuccess={() => {
            setShowApplySheet(false);
            navigate("/activity?tab=applied");
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        body {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
