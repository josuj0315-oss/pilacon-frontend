import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePilaCon } from '../store/pilaconStore';
import { ReportReasonCode, ReportReasonLabels, ReportTargetType } from '../constants/reports';

export default function ReportModal({ targetType = ReportTargetType.JOB, targetId, targetTitle = '', onClose, onSuccess }) {
  const { reportJob, showToast } = usePilaCon();
  const [reasonCode, setReasonCode] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Esc 키를 눌렀을 때 닫기 기능 추가
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 제출 버튼 활성화 여부
  const isSubmitDisabled = !reasonCode || (reasonCode === ReportReasonCode.OTHER && !reasonDetail.trim()) || isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    try {
      const res = await reportJob({
        targetType,
        targetId: Number(targetId),
        reasonCode,
        reasonDetail: reasonDetail.trim() || undefined,
      });

      if (res.ok) {
        showToast('신고가 정상적으로 접수되었습니다.', 'success');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(res.error || '신고 제출에 실패했습니다.', 'error');
      }
    } catch (err) {
      showToast('오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => !isSubmitting && onClose()} 
      />
      
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 sm:duration-200 origin-bottom">
        <header className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" strokeWidth={2.5} />
              <h2 className="text-[17px] font-black text-slate-900">게시물 신고</h2>
            </div>
            {targetTitle && (
              <p className="text-[12px] font-bold text-slate-400 line-clamp-1 truncate max-w-[280px]">
                대상: {targetTitle}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
            disabled={isSubmitting}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-[14px] font-bold text-slate-500 mb-6 leading-relaxed">
            신고 사유를 선택해 주세요.<br />
            허위 신고 시 서비스 이용이 제한될 수 있습니다.
          </p>

          <div className="space-y-2.5 mb-8">
            {Object.keys(ReportReasonLabels).map((key) => (
              <label 
                key={key}
                className={`
                  flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.99]
                  ${reasonCode === key 
                    ? 'border-indigo-500 bg-indigo-50/30' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'}
                `}
              >
                <input
                  type="radio"
                  name="reason"
                  value={key}
                  checked={reasonCode === key}
                  onChange={(e) => setReasonCode(e.target.value)}
                  className="hidden"
                />
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${reasonCode === key ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}
                `}>
                  {reasonCode === key && <CheckCircle2 size={12} className="text-white" strokeWidth={4} />}
                </div>
                <span className={`text-[14px] font-bold ${reasonCode === key ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {ReportReasonLabels[key]}
                </span>
              </label>
            ))}
          </div>

          {(reasonCode === ReportReasonCode.OTHER) && (
            <div className="mb-8 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[13px] font-bold text-slate-400 mb-2 ml-1">
                상세 사유 (필수)
              </label>
              <textarea
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="상세 내용을 10자 이상 입력해 주세요."
                className="w-full h-32 px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-indigo-100 focus:outline-none transition-all resize-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-[0.4] h-[54px] text-[15px] font-black text-slate-400 bg-slate-100 rounded-2xl active:scale-95 transition-all"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`
                  flex-1 h-[54px] text-[15px] font-black text-white rounded-2xl shadow-lg transition-all
                  ${isSubmitDisabled ? 'bg-slate-200 shadow-none' : 'bg-indigo-600 shadow-indigo-100 active:scale-95'}
                `}
              >
                {isSubmitting ? '제출 중...' : '신고 제출하기'}
              </button>
            </div>
            <p className="text-[11px] text-center font-bold text-slate-400">
              검토 결과가 허위로 판명될 경우 패널티가 부여될 수 있습니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
