import React from 'react';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';

export default function GlobalUI() {
  const { toasts, globalModal, fullError, closeFullError } = usePilaCon();

  return (
    <>
      {/* --- Toast Layer --- */}
      <div className="global-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type || 'success'}`}>
            <div className="toast-icon">
              {t.type === 'error' ? <ICONS.notification size={18} /> : <ICONS.check size={18} />}
            </div>
            <span className="toast-message">{t.message}</span>
            {t.onRetry && (
              <button 
                className="toast-retry-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  t.onRetry();
                }}
              >
                재시도
              </button>
            )}
          </div>
        ))}
      </div>

      {/* --- Modal Layer --- */}
      {globalModal && (
        <div className="global-modal-overlay" onClick={globalModal.onCancel || globalModal.onClose}>
          <div className="global-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{globalModal.title || '알림'}</h3>
            </div>
            <div className="modal-body">
              <p className="modal-text">{globalModal.message}</p>
            </div>
            <div className="modal-footer">
              {(globalModal.type === 'confirm' || globalModal.onCancel) && (
                <button className="modal-btn cancel" onClick={globalModal.onCancel}>
                  {globalModal.cancelText || '취소'}
                </button>
              )}
              <button 
                className={`modal-btn confirm ${globalModal.isDanger ? 'danger' : ''}`} 
                onClick={globalModal.onConfirm || globalModal.onClose}
              >
                {globalModal.confirmText || '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Full Error Screen --- */}
      {fullError && (
        <div className="global-full-error-overlay">
          <div className="error-content">
            <div className="error-icon-lg">⚠️</div>
            <h2 className="error-title">{fullError.title || '알 수 없는 오류'}</h2>
            <p className="error-message">{fullError.message}</p>
            <div className="error-actions">
              {fullError.onRetry && (
                <button 
                  className="error-btn retry" 
                  onClick={() => {
                    fullError.onRetry();
                    closeFullError();
                  }}
                >
                  다시 시도
                </button>
              )}
              <button className="error-btn close" onClick={closeFullError}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Toast Container */
        .global-toast-container {
          position: fixed;
          bottom: calc(100px + env(safe-area-inset-bottom));
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
          pointer-events: none;
          width: 90%;
          max-width: 400px;
        }

        .toast-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #1e293b;
          color: #fff;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          animation: toastUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: auto;
          min-height: 52px;
        }

        @keyframes toastUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .toast-item.success .toast-icon { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .toast-item.error .toast-icon { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .toast-item.info .toast-icon { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }

        .toast-message {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          flex: 1;
        }

        .toast-retry-btn {
          background: #fff;
          color: #1e293b;
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          margin-left: 12px;
          cursor: pointer;
        }

        /* Modal Layer */
        .global-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 10000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .global-modal-card {
          width: 100%;
          max-width: 320px;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalPop {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 24px 20px 8px;
          text-align: center;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .modal-body {
          padding: 8px 24px 24px;
          text-align: center;
        }

        .modal-text {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
        }

        .modal-footer {
          display: flex;
          border-top: 1px solid #f1f5f9;
        }

        .modal-btn {
          flex: 1;
          height: 56px;
          border: none;
          background: none;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .modal-btn:active {
          background: #f8fafc;
        }

        .modal-btn.cancel {
          color: #94a3b8;
          border-right: 1px solid #f1f5f9;
        }

        .modal-btn.confirm {
          color: #5b5ff5;
        }

        .modal-btn.confirm.danger {
          color: #ef4444;
        }

        /* Full Error Screen */
        .global-full-error-overlay {
          position: fixed;
          inset: 0;
          background: #fff;
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: pageIn 0.3s ease-out;
        }

        @keyframes pageIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .error-content {
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        .error-icon-lg {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .error-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .error-message {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .error-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .error-btn {
          height: 56px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: transform 0.1s;
        }

        .error-btn:active {
          transform: scale(0.98);
        }

        .error-btn.retry {
          background: #5b5ff5;
          color: #fff;
        }

        .error-btn.close {
          background: #f1f5f9;
          color: #64748b;
        }
      `}</style>
    </>
  );
}
