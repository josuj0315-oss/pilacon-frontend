import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Calendar, 
  AlertCircle, 
  ChevronRight,
  RefreshCcw,
  MoreHorizontal
} from "lucide-react";
import { usePilaCon } from "../../store/pilaconStore";
import { 
  ReportStatus, 
  ReportStatusLabels, 
  ReportStatusColors,
  ReportReasonLabels,
  ReportActionResultLabels
} from "../../constants/reports";

export default function AdminReportList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAdminReports, showToast } = usePilaCon();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ TOTAL: 0, PENDING: 0 });

  const currentStatus = searchParams.get("status") || "ALL";

  const fetchReports = async () => {
    setLoading(true);
    try {
      // "ALL" 상태일 때는 필터를 보내지 않거나 명시적으로 서버와 약속된 값을 보냄
      const statusFilter = currentStatus === "ALL" ? undefined : currentStatus;
      const data = await getAdminReports({ status: statusFilter });
      
      // [Diagnostic Log] API 응답 구조를 개발자 도구 콘솔에서 확인할 수 있게 추가
      console.log(`[AdminReportList] Fetching status=${currentStatus}, received:`, data);

      if (Array.isArray(data)) {
        setReports(data);
        // 간단한 통계 내기
        const pendingCount = data.filter(r => r.status === ReportStatus.PENDING || r.status === 'REVIEWING').length;
        setCounts({ TOTAL: data.length, PENDING: pendingCount });
      } else {
        console.warn("[AdminReportList] API response is not an array:", data);
        setReports([]);
        setCounts({ TOTAL: 0, PENDING: 0 });
      }
    } catch (err) {
      console.error("[AdminReportList] API Error:", err);
      showToast("신고 목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentStatus]);

  const handleStatusTab = (status) => {
    const next = new URLSearchParams(searchParams);
    if (status === "ALL") next.delete("status");
    else next.set("status", status);
    setSearchParams(next);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">전체 신고</div>
          <div className="text-[28px] font-black text-slate-900">{counts.TOTAL}건</div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-[24px] shadow-lg shadow-indigo-100">
          <div className="text-[12px] font-black text-indigo-200 uppercase tracking-widest mb-1">미처리 신고</div>
          <div className="text-[28px] font-black text-white">{counts.PENDING}건</div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={fetchReports}>
           <RefreshCcw size={20} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
           <span className="ml-2 text-[14px] font-bold text-slate-500">목록 새로고침</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["ALL", ...Object.keys(ReportStatus)].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusTab(status)}
            className={`
              px-5 py-2.5 rounded-full text-[13px] font-black whitespace-nowrap transition-all border-2
              ${currentStatus === status 
                ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-200" 
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"}
            `}
          >
            {status === "ALL" ? "전체보기" : ReportStatusLabels[status]}
          </button>
        ))}
      </div>

      {/* List Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">ID / 일시</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">신고 대상</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">사유</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">신고자</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">상태</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8 bg-slate-50/20" />
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search size={40} className="text-slate-200" />
                       <p className="text-[15px] font-bold text-slate-400">신고 내역이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr 
                    key={report.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/reports/${report.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="text-[13px] font-black text-slate-900 mb-0.5">#{report.id}</div>
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <div className="text-[14px] font-bold text-slate-700 truncate line-clamp-1">
                        {report.targetSnapshotTitle || "알 수 없는 게시물"}
                      </div>
                      <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
                        {report.targetType} #{report.targetId}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[13px] font-bold text-slate-600">
                        {ReportReasonLabels[report.reasonCode] || report.reasonCode}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
                        <span className="text-[13px] font-bold text-slate-700">
                          {report.reporter?.nickname || report.reporter?.name || "사용자"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`
                        inline-flex px-3 py-1 rounded-full text-[11px] font-black border
                        ${ReportStatusColors[report.status] || 'bg-slate-100 text-slate-500 border-slate-200'}
                      `}>
                        {ReportStatusLabels[report.status]}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-between">
                         <span className="text-[12px] font-bold text-slate-400">
                           {ReportActionResultLabels[report.actionResult] || "미처리"}
                         </span>
                         <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
