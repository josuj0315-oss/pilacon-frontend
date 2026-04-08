import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Flag, 
  User, 
  FileText, 
  ExternalLink, 
  MessageSquare, 
  Save,
  Clock,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { usePilaCon } from "../../store/pilaconStore";
import { 
  ReportStatus, 
  ReportStatusLabels, 
  ReportStatusColors,
  ReportReasonLabels,
  ReportActionResult,
  ReportActionResultLabels
} from "../../constants/reports";

export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAdminReportDetail, updateAdminReport, showToast } = usePilaCon();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [status, setStatus] = useState("");
  const [actionResult, setActionResult] = useState("");
  const [adminMemo, setAdminMemo] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await getAdminReportDetail(id);
      setReport(data);
      setStatus(data.status);
      setActionResult(data.actionResult);
      setAdminMemo(data.adminMemo || "");
    } catch (err) {
      showToast("신고 정보를 불러오지 못했습니다.", "error");
      navigate("/admin/reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateAdminReport(id, {
        status,
        actionResult,
        adminMemo
      });
      if (res.ok) {
        showToast("처리가 완료되었습니다.", "success");
        setReport(res.data);
      } else {
        showToast(res.error, "error");
      }
    } catch (err) {
      showToast("처리 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/reports")}
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight">신고 접수 내역 확인</h2>
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Report Management System</span>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-full text-[13px] font-black border-2 ${ReportStatusColors[report.status]}`}>
          {ReportStatusLabels[report.status]}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Report Meta */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Flag size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">상세 사유</span>
                <span className="text-[18px] font-black text-slate-900">{ReportReasonLabels[report.reasonCode] || report.reasonCode}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[20px] p-6 mb-8 min-h-[120px]">
              <p className="text-[15px] font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {report.reasonDetail || "상세 사유가 입력되지 않았습니다."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-1.5">신고자 정보</span>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200" />
                   <div className="flex flex-col">
                      <span className="text-[14px] font-black text-slate-700">{report.reporter?.nickname || report.reporter?.name || "사용자"}</span>
                      <span className="text-[11px] font-bold text-slate-400">ID: #{report.reporterId}</span>
                   </div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-1.5">신고 일시</span>
                <div className="flex items-center gap-2 text-slate-700">
                   <Clock size={16} />
                   <span className="text-[14px] font-black underline-offset-4 decoration-2 decoration-indigo-200">{formatDate(report.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Content Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Briefcase size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">대상 콘텐츠 정보</span>
                  <span className="text-[18px] font-black text-slate-900 line-clamp-1">{report.targetSnapshotTitle || "알 수 없는 게시물"}</span>
                </div>
              </div>
              <Link 
                to={`/jobs/${report.targetId}`} 
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl text-[13px] font-black transition-all group"
              >
                콘텐츠 보기
                <ExternalLink size={14} className="group-hover:scale-110 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-2 text-[12px] font-bold text-slate-400">
              <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-100 uppercase tracking-wider">Type: {report.targetType}</span>
              <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-100 uppercase tracking-wider">ID: {report.targetId}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Processing Control */}
        <div className="space-y-6">
          <form onSubmit={handleSave} className="bg-indigo-900 rounded-[32px] shadow-xl p-8 sticky top-28 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck size={120} className="text-white" />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-2 text-indigo-200">
                <ShieldCheck size={16} />
                <span className="text-[12px] font-black uppercase tracking-[2px]">Admin Terminal</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-2 ml-1">상태 변경</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-12 bg-indigo-800/50 border-2 border-indigo-700/50 rounded-2xl px-4 text-[14px] font-black text-white focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
                  >
                    {Object.keys(ReportStatus).map(s => (
                      <option key={s} value={s} className="bg-indigo-900">{ReportStatusLabels[s]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-2 ml-1">조치 결과</label>
                  <select 
                    value={actionResult}
                    onChange={(e) => setActionResult(e.target.value)}
                    className="w-full h-12 bg-indigo-800/50 border-2 border-indigo-700/50 rounded-2xl px-4 text-[14px] font-black text-white focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
                  >
                    {Object.keys(ReportActionResult).map(a => (
                      <option key={a} value={a} className="bg-indigo-900">{ReportActionResultLabels[a]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-2 ml-1">계정/게시물 관리 메모</label>
                  <textarea 
                    value={adminMemo}
                    onChange={(e) => setAdminMemo(e.target.value)}
                    placeholder="조치 사유나 특이사항을 입력하세요."
                    className="w-full h-32 bg-indigo-800/50 border-2 border-indigo-700/50 rounded-2xl p-4 text-[14px] font-bold text-indigo-100 focus:outline-none focus:border-indigo-400 transition-all placeholder:text-indigo-400/50 resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full h-14 flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-indigo-900 rounded-2xl text-[16px] font-black shadow-lg shadow-indigo-950/20 active:scale-95 transition-all
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} />
                    반영하기
                  </>
                )}
              </button>

              {(report.processedAt || report.processedById) && (
                <div className="pt-6 border-t border-indigo-800/50">
                  <div className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-2">마지막 처리 정보</div>
                  <div className="text-[12px] font-bold text-indigo-200">
                    처리자: 관리자 #{report.processedById || "N/A"}
                  </div>
                  <div className="text-[12px] font-bold text-indigo-200 mt-1">
                    일시: {formatDate(report.processedAt)}
                  </div>
                </div>
              )}
            </div>
          </form>
          
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-3">
             <AlertTriangle className="text-rose-500 shrink-0" size={20} />
             <p className="text-[13px] font-bold text-rose-600 leading-snug">
               파란 버튼 클릭 시 선택한 조치가 실제 DB에 반영됩니다.<br/> 게시물 숨김/삭제 시 작성자 게시물 목록에서도 사라집니다.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
