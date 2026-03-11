import { useState } from "react";
import "./modal.css";
import { useNavigate } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import ApplyConfirmSheet from "./ApplyConfirmSheet";

export default function JobDetailModal({ job, onClose }) {
  const navigate = useNavigate();
  const { user } = usePilaCon();
  const [showApplySheet, setShowApplySheet] = useState(false);

  const handleApplyClick = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    setShowApplySheet(true);
  };

  const handleApplySuccess = () => {
    setShowApplySheet(false);
    onClose?.();
    navigate("/activity?tab=applied");
  };

  const typeLabel = job.type ?? "대타/급구";
  const center = job.studio ?? job.center ?? job.storeName ?? "센터 정보 없음";
  const time = job.timeSlot ?? job.time ?? "시간 정보 없음";
  const pay = job.pay ?? "급여 정보 없음";
  const desc = job.description ?? "상세 내용이 아직 작성되지 않았어요.";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-topbar">
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <span className="badge urgent">{typeLabel}</span>

          <h2 className="title">{job.title}</h2>

          <section className="info">
            <p>📍 센터명: {center}</p>
            <p>🕘 근무시간: {time}</p>
            <p>💰 급여: {pay}</p>
          </section>

          <section className="description">
            <h4>상세 내용</h4>
            <p>{desc}</p>
          </section>
        </div>

        <div className="modal-footer">
          {user && String(user.id) === String(job.userId) ? (
            <button
              type="button"
              className="apply-btn"
              disabled
              style={{ backgroundColor: "#94a3b8", cursor: "not-allowed" }}
            >
              내가 등록한 공고
            </button>
          ) : (
            <button
              type="button"
              className="apply-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleApplyClick();
              }}
            >
              지원하기
            </button>
          )}
        </div>
      </div>

      {showApplySheet && (
        <ApplyConfirmSheet
          job={job}
          onClose={() => setShowApplySheet(false)}
          onApplySuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
