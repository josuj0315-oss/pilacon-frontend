import React, { useState } from 'react';
import { ICONS, ICON_CONFIG } from '../constants/icons';
import { getApplicationStatusLabel, usePilaCon } from '../store/pilaconStore';
import "../components/modal.css";

export default function AppliedDetail({ application, onBack, onChat, onGoToJob }) {
  const { cancelApplication } = usePilaCon();
  const [isFolded, setIsFolded] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const job = application.job;
  const appliedDate = application.createdAt?.slice(0, 10).replaceAll("-", ".") ?? "";

  // 지원 시점의 스냅샷 데이터 우선 사용
  const profile = application.profileSnapshot || application.instructorProfile || {};

  // Status mapping for the timeline
  const getSteps = () => {
    const status = application.status;
    const isClosed = job.status === 'closed';
    const isViewed = status === 'read' || application.isViewed;

    return [
      {
        label: '지원완료',
        desc: '소중한 지원서가 센터에 전달되었습니다.',
        status: (isViewed || isClosed) ? 'completed' : 'active'
      },
      {
        label: '심사중',
        desc: '센터에서 강사님의 프로필을 검토하고 있습니다.',
        status: isClosed ? 'completed' : (isViewed ? 'active' : 'pending')
      },
      {
        label: '채용확정',
        desc: isClosed ? '공고가 마감되었습니다.' : '결과를 기다리는 중입니다.',
        status: isClosed ? 'active' : 'pending'
      },
    ];
  };

  const steps = getSteps();
  const currentStep = steps.find(s => s.status === 'active') || steps[steps.length - 1];

  return (
    <div className="applied-detail">
      {/* 상단 네비바 - 상단에 고정 */}
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ICONS.chevronRight size={24} style={{ transform: 'rotate(180deg)' }} color="#1e293b" />
        </button>
        <h2 className="header-title">지원 상세</h2>
        <div style={{ width: 40 }} />
      </header>

      <main className="detail-content">
        {/* (A) 진행 현황 카드 - 인라인 섹션으로 고정 */}
        <section className="status-section card">
          <div className="card-header-row">
            <h3 className="card-main-title">진행 현황</h3>
            {application.status !== 'canceled' && (
              <button className="fold-toggle-btn" onClick={() => setIsFolded(!isFolded)}>
                {isFolded ? (
                  <div className="folded-summary">
                    <span className="summary-label">현재: {currentStep.label}</span>
                    <ICONS.chevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                ) : (
                  <ICONS.chevronRight size={16} style={{ transform: 'rotate(-90deg)' }} />
                )}
              </button>
            )}
          </div>

          {!isFolded && application.status !== 'canceled' && (
            <div className="timeline-container">
              {steps.map((step, idx) => (
                <div key={idx} className={`timeline-item ${step.status}`}>
                  {idx < steps.length - 1 && <div className="timeline-line" />}
                  <div className="timeline-dot-box">
                    <div className="timeline-dot">
                      {step.status === 'completed' && <div className="timeline-dot-inner" />}
                      {step.status === 'active' && <div className="timeline-dot-active blink" />}
                    </div>
                  </div>
                  <div className="timeline-text">
                    <span className="timeline-label">{step.label}</span>
                    <span className="timeline-desc">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {application.status === 'canceled' && (
            <div className="canceled-status-badge">
              <span className="cancel-tag">지원취소</span>
            </div>
          )}

          <div className="status-divider" />

          {application.status === 'canceled' ? (
            <p className="status-guide-text canceled">
              지원 취소가 완료된 공고입니다.
              {application.cancelReason && (
                <span className="cancel-reason-text">사유: {application.cancelReason === '기타 (직접 입력)' ? application.cancelReasonDetail : application.cancelReason}</span>
              )}
            </p>
          ) : (
            <p className="status-guide-text">
              {job.status === 'closed'
                ? "“안녕하세요, 센터입니다. 아쉽게도 지원하신 공고가 마감되었습니다. 비록 이번에는 인연이 닿지 않았지만, 소중한 지원에 진심으로 감사드리며 앞으로의 활동을 응원하겠습니다.”"
                : (application.status === 'read' || application.isViewed)
                  ? "“센터에서 강사님의 이력서를 검토하고 있습니다.”"
                  : "“소중한 지원서가 센터에 전달되었습니다. 센터에서 확인 후 연락드릴 예정입니다.”"}
            </p>
          )}
        </section>

        {/* (B) 공고 정보 카드 */}
        <section className="job-info-section card">
          <h3 className="card-main-title">공고 정보</h3>
          <h4 className="job-display-title">{job.title}</h4>

          <div className="job-grid">
            <div className="grid-item">
              <span className="grid-label">근무지역</span>
              <span className="grid-value">{job.location || job.region}</span>
            </div>
            <div className="grid-item">
              <span className="grid-label">급여</span>
              <span className="grid-value">{job.pay}</span>
            </div>
            <div className="grid-item">
              <span className="grid-label">근무시간</span>
              <span className="grid-value">{job.timeSlot || job.time || "협의"}</span>
            </div>
            <div className="grid-item">
              <span className="grid-label">직군</span>
              <span className="grid-value">{job.category}</span>
            </div>
          </div>

          <button className="btn-view-original" onClick={onGoToJob}>
            공고 원문 보기
          </button>
        </section>

        {/* (C) 내 지원 정보 카드 */}
        <section className="my-apply-section card">
          <h3 className="card-main-title">내 지원 정보</h3>

          <div className="profile-row">
            <div className="profile-avatar">
              <ICONS.profile size={24} color="#94a3b8" />
            </div>
            <div className="profile-text">
              <div className="profile-name">
                {application.user?.nickname || application.user?.name || '익명 강사'}
              </div>
              <div className="profile-summary">
                {profile.experience || '경력 미입력'} {' · '}
                {profile.specialty || '전문분야 미입력'}
              </div>
            </div>
          </div>

          <div className="message-box">
            {application.message || '지원 메시지가 없습니다.'}
          </div>
        </section>

        {/* 하단 CTA - 일반 흐름으로 변경 */}
        <div className="detail-footer-cta-inline">
          <button
            className={`cta-btn outline ${application.status === 'canceled' ? 'is-disabled' : ''}`}
            onClick={() => {
              if (application.status === 'canceled') return;
              onChat();
            }}
            disabled={application.status === 'canceled'}
          >
            <ICONS.chat size={18} />
            채팅하기
          </button>
          <button
            className={`cta-btn secondary ${application.status === 'canceled' ? 'is-disabled' : ''}`}
            onClick={() => {
              if (application.status === 'accepted') {
                alert("채용확정된 지원서는 취소할 수 없습니다.");
                return;
              }
              if (application.status === 'canceled') return;
              setShowCancelModal(true);
            }}
            disabled={application.status === 'canceled'}
          >
            {application.status === 'canceled' ? '지원취소 완료' : '지원 취소'}
          </button>
        </div>

        {/* 하단 여백 */}
        <div className="bottom-spacer" />
      </main>

      {showCancelModal && (
        <CancelReasonModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={async (reason, detail) => {
            const res = await cancelApplication(application.id, reason, detail);
            if (res.ok) {
              alert("지원 취소가 완료되었습니다.");
              setShowCancelModal(false);
            } else {
              alert(res.error);
            }
          }}
        />
      )}

      <style>{`
        .applied-detail {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #f7f9fc;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .canceled-status-badge {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .cancel-tag {
          font-size: 14px;
          font-weight: 800;
          color: #64748b;
          background: #f1f5f9;
          padding: 6px 16px;
          border-radius: 100px;
        }

        .status-guide-text.canceled {
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cancel-reason-text {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
        }
        .detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
        .back-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
        }
        .header-title {
          font-size: 16px;
          font-weight: 800;
          margin: 0;
          color: #1e293b;
        }
        .detail-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          -webkit-overflow-scrolling: touch;
        }
        .card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0,0,0,0.02);
        }
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .card-main-title {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .fold-toggle-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }
        
        .folded-summary {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .summary-label {
          font-size: 12px;
          font-weight: 700;
          color: #5b5ff5;
          background: rgba(91, 95, 245, 0.08);
          padding: 4px 10px;
          border-radius: 8px;
        }

        /* Inline Timeline */
        .timeline-container {
          display: flex;
          flex-direction: column;
          margin: 10px 0 24px 8px;
        }
        .timeline-item {
          display: flex;
          gap: 20px;
          position: relative;
          padding-bottom: 24px;
        }
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        .timeline-line {
          position: absolute;
          left: 6px;
          top: 14px;
          bottom: -4px;
          width: 2px;
          background: #e2e8f0;
        }
        .timeline-item.completed .timeline-line {
          background: #5b5ff5;
        }
        .timeline-dot-box {
          position: relative;
          z-index: 2;
          padding-top: 4px;
        }
        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timeline-item.completed .timeline-dot,
        .timeline-item.active .timeline-dot {
          background: #5b5ff5;
        }
        .timeline-dot-inner {
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
        }
        .timeline-dot-active {
          width: 14px;
          height: 14px;
          background: #5b5ff5;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(91,95,245,0.2);
        }
        .timeline-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .timeline-label {
          font-size: 15px;
          font-weight: 800;
          color: #94a3b8;
        }
        .timeline-item.completed .timeline-label,
        .timeline-item.active .timeline-label {
          color: #1e293b;
        }
        .timeline-desc {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.4;
        }

        .status-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0 -24px 20px -24px;
        }
        
        .status-guide-text {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
          text-align: center;
          margin: 0;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          line-height: 1.5;
        }

        /* Job Info Card */
        .job-display-title {
          font-size: 17px;
          font-weight: 800;
          color: #1e293b;
          margin: 16px 0;
          line-height: 1.4;
        }
        .job-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .grid-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .grid-label {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
        }
        .grid-value {
          font-size: 14px;
          color: #334155;
          font-weight: 700;
        }
        .btn-view-original {
          width: 100%;
          height: 48px;
          background: #f1f5f9;
          border: none;
          border-radius: 14px;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        /* My Info Card */
        .profile-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
        }
        .profile-avatar {
          width: 48px;
          height: 48px;
          background: #f1f5f9;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .profile-name {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
        }
        .profile-summary {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }
        .message-box {
          background: rgba(91, 95, 245, 0.08);
          padding: 16px;
          border-radius: 16px;
          font-size: 14px;
          color: #334155;
          font-weight: 600;
          line-height: 1.6;
          word-break: break-word;
          white-space: pre-wrap;
        }

        /* Inline Footer CTA */
        .detail-footer-cta-inline {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        .cta-btn {
          flex: 1;
          height: 54px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .cta-btn:active { transform: scale(0.98); }
        .cta-btn.outline {
          background: #fff;
          border: 1.5px solid #5b5ff5;
          color: #5b5ff5;
        }
        .cta-btn.secondary {
          background: #f1f5f9;
          color: #64748b;
        }
        
        .bottom-spacer {
          height: 48px;
        }

        .cta-btn.is-disabled {
          background: #e2e8f0 !important;
          color: #94a3b8 !important;
          border-color: #e2e8f0 !important;
          cursor: not-allowed;
        }

        @keyframes status-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.1; }
        }
        .blink {
          animation: status-blink 0.6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

function CancelReasonModal({ onClose, onConfirm }) {
  const [selected, setSelected] = React.useState("");
  const [detail, setDetail] = React.useState("");

  const reasons = [
    "다른 센터에 이미 채용되었습니다",
    "근무 시간 또는 일정이 맞지 않습니다",
    "센터 위치가 맞지 않습니다",
    "급여 조건이 맞지 않습니다",
    "개인 사정으로 근무가 어렵습니다",
    "추후 다시 지원할 예정입니다",
    "단순 지원 실수입니다",
    "기타 (직접 입력)"
  ];

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected, detail);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cancellation-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">지원 취소 사유 선택</h3>
          <button className="close-btn" onClick={onClose}><ICONS.close size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="reason-card">
            {reasons.map((r, idx) => (
              <label key={idx} className={`reason-radio-item ${selected === r ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="cancel-reason"
                  className="radio-input"
                  checked={selected === r}
                  onChange={() => setSelected(r)}
                />
                <span className="radio-custom" />
                <span className="reason-label-text">{r}</span>
              </label>
            ))}
          </div>

          {selected === "기타 (직접 입력)" && (
            <textarea
              className="reason-detail-textarea"
              placeholder="취소 사유를 입력해주세요 (최대 100자)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              maxLength={100}
            />
          )}
        </div>

        <div className="modal-footer-dual">
          <button className="btn-modal-cancel" onClick={onClose}>취소</button>
          <button 
            className="btn-modal-confirm" 
            disabled={!selected} 
            onClick={handleConfirm}
          >
            지원 취소 완료
          </button>
        </div>
      </div>

      <style>{`
        .cancellation-modal {
          width: 92% !important;
          max-width: 360px !important;
          padding: 20px !important;
          border-radius: 20px !important;
          background: #fff;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .modal-title {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          padding: 8px;
          color: #94a3b8;
          cursor: pointer;
        }
        .modal-body {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 4px;
        }
        .reason-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 8px 4px;
          display: flex;
          flex-direction: column;
        }
        .reason-radio-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.2s;
          border-radius: 12px;
        }
        .reason-radio-item:active {
          background: rgba(0,0,0,0.02);
        }
        .radio-input {
          display: none;
        }
        .radio-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #fff;
          transition: all 0.2s;
        }
        .reason-radio-item.is-selected .radio-custom {
          border-color: #5b5ff5;
        }
        .reason-radio-item.is-selected .radio-custom::after {
          content: "";
          width: 10px;
          height: 10px;
          background: #5b5ff5;
          border-radius: 50%;
        }
        .reason-label-text {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }
        .reason-radio-item.is-selected .reason-label-text {
          color: #1e293b;
        }
        .reason-detail-textarea {
          width: 100%;
          height: 90px;
          margin-top: 12px;
          padding: 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          resize: none;
          background: #fff;
        }
        .reason-detail-textarea:focus {
          outline: none;
          border-color: #5b5ff5;
        }
        .modal-footer-dual {
          display: flex;
          gap: 10px;
        }
        .btn-modal-cancel {
          flex: 1;
          height: 48px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-modal-confirm {
          flex: 2;
          height: 48px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-modal-confirm:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
