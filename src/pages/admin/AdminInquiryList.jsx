import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  ChevronRight,
  RefreshCcw,
  Mail,
  User as UserIcon
} from "lucide-react";
import { usePilaCon } from "../../store/pilaconStore";

export default function AdminInquiryList() {
  const navigate = useNavigate();
  const { getAdminInquiries, showToast } = usePilaCon();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await getAdminInquiries();
      setInquiries(data);
    } catch (err) {
      console.error("[AdminInquiryList] API Error:", err);
      showToast("문의 목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">전체 문의</div>
          <div className="text-[28px] font-black text-slate-900">{inquiries.length}건</div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-[24px] shadow-lg shadow-indigo-100">
          <div className="text-[12px] font-black text-indigo-200 uppercase tracking-widest mb-1">미처리 문의</div>
          <div className="text-[28px] font-black text-white">
            {inquiries.filter(i => i.status === 'pending').length}건
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={fetchInquiries}>
           <RefreshCcw size={20} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
           <span className="ml-2 text-[14px] font-bold text-slate-500">새로고침</span>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">일시</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">문의 내용</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">작성자</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">상태</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8 bg-slate-50/20" />
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search size={40} className="text-slate-200" />
                       <p className="text-[15px] font-bold text-slate-400">문의 내역이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr 
                    key={inquiry.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(inquiry.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <div className="text-[14px] font-bold text-slate-700 truncate line-clamp-1">
                        {inquiry.subject}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <UserIcon size={12} className="text-slate-400" />
                          <span className="text-[13px] font-bold text-slate-700">{inquiry.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-400">{inquiry.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`
                        inline-flex px-3 py-1 rounded-full text-[11px] font-black border
                        ${getStatusBadgeClass(inquiry.status)}
                      `}>
                        {inquiry.status === 'pending' ? '대기' : inquiry.status === 'resolved' ? '완료' : inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-end">
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
