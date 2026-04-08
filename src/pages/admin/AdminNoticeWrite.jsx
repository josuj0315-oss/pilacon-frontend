import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { usePilaCon } from "../../store/pilaconStore";

export default function AdminNoticeWrite() {
  const navigate = useNavigate();
  const { createNotice, showToast } = usePilaCon();

  const [form, setForm] = useState({
    title: "",
    content: "",
    isPublished: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.title.trim() || !form.content.trim()) {
      showToast("제목과 내용을 모두 입력해주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await createNotice(form);
      if (result.ok) {
        showToast("공지사항이 등록되었습니다.");
        // 생성된 공지 상세 페이지로 이동
        navigate(`/notice/${result.data.id}`);
      } else {
        showToast(result.error || "등록에 실패했습니다.", "error");
      }
    } catch (err) {
      showToast("오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-[14px] mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            뒤로가기
          </button>
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight">공지사항 작성</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[14px] hover:bg-slate-50 transition-all"
          >
            취소
          </button>
          <button
            form="notice-form"
            type="submit"
            disabled={loading}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black text-[14px] shadow-lg shadow-indigo-100 transition-all
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'}
            `}
          >
            <Save size={18} />
            {loading ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <form id="notice-form" onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">공지 제목</label>
            <input
              type="text"
              placeholder="공지사항 제목을 입력하세요"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[16px] font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">상세 내용</label>
            <textarea
              placeholder="공지사항 상세 내용을 입력하세요 (최소 5자 이상)"
              rows={12}
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[16px] font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Settings Section */}
          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${form.isPublished ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                {form.isPublished ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <div className="text-[15px] font-black text-slate-900">게시 상태</div>
                <div className="text-[13px] font-bold text-slate-400">
                  {form.isPublished ? "즉시 대중에게 노출됩니다" : "비공개로 저장됩니다"}
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={form.isPublished}
                onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
              />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 transition-all"></div>
            </label>
          </div>
        </form>
      </div>

      <div className="mt-8 p-6 rounded-[24px] bg-slate-100/50 border border-slate-100 flex items-start gap-4">
        <AlertCircle size={20} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="text-[13px] font-bold text-slate-500 leading-relaxed">
          공지사항 작성이 완료되면 즉시 사용자 서비스 화면에 반영됩니다. <br />
          중요한 공지일수록 제목과 내용을 꼼꼼히 확인해 주세요.
        </div>
      </div>
    </div>
  );
}
