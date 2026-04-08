import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  User as UserIcon,
  Tag,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { usePilaCon } from "../../store/pilaconStore";

export default function AdminInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAdminInquiry, showToast } = usePilaCon();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInquiry = async () => {
    setLoading(true);
    try {
      const data = await getAdminInquiry(id);
      setInquiry(data);
    } catch (err) {
      console.error("[AdminInquiryDetail] API Error:", err);
      const msg = err.response?.status === 404 
        ? "해당 문의 내역을 찾을 수 없습니다." 
        : "데이터를 불러오는 데 실패했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiry();
  }, [id]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const statusLabel = inquiry?.status === 'pending' ? '처리 대기' : inquiry?.status === 'resolved' ? '처리 완료' : inquiry?.status;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold">문의 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="inline-flex p-4 rounded-full bg-rose-50 text-rose-500 mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-[24px] font-black text-slate-900 mb-2">앗! 문제가 발생했습니다</h2>
        <p className="text-slate-500 font-bold mb-8">{error || "알 수 없는 오류가 발생했습니다."}</p>
        <button 
          onClick={() => navigate("/admin/inquiries")}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[14px]"
        >
          문의 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <button 
          onClick={() => navigate("/admin/inquiries")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-[14px] mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          목록으로 돌아가기
        </button>
        <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          {inquiry.subject}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <MessageSquare size={18} />
                </div>
                <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">문의 내용</h3>
              </div>
              <div className="text-[17px] font-bold text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[300px]">
                {inquiry.message}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
             <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">상세 정보</h3>
             
             <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <UserIcon size={14} />
                    <span className="text-[11px] font-black uppercase tracking-wider">작성자</span>
                  </div>
                  <div className="text-[15px] font-black text-slate-900">{inquiry.name}</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Mail size={14} />
                    <span className="text-[11px] font-black uppercase tracking-wider">이메일</span>
                  </div>
                  <div className="text-[15px] font-black text-indigo-600 break-all">{inquiry.email}</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Tag size={14} />
                    <span className="text-[11px] font-black uppercase tracking-wider">상태</span>
                  </div>
                  <div>
                    <span className={`
                      inline-flex px-3 py-1 rounded-full text-[11px] font-black border
                      ${inquiry.status === 'pending' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}
                    `}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Calendar size={14} />
                    <span className="text-[11px] font-black uppercase tracking-wider">접수일시</span>
                  </div>
                  <div className="text-[13px] font-bold text-slate-500">
                    {formatDate(inquiry.createdAt)}
                  </div>
                </div>
             </div>
          </div>

          <div className="p-6 rounded-[32px] bg-slate-900 text-white flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white/50">
              <AlertCircle size={24} />
            </div>
            <p className="text-[13px] font-bold text-slate-300 leading-relaxed mb-4">
              문의 처리를 위한 기능(메일 발송, 상태 변경)은 다음 단계에서 업데이트될 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
