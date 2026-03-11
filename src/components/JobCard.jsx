import { ICONS, ICON_CONFIG } from "../constants/icons";
import { formatPayKRW } from "../utils/format";

// type → 한글
const TYPE_LABEL = {
  sub: "대타/급구",
  short: "단기",
  regular: "정규직",
};

// type → 색상 class
const TYPE_CLASS = {
  sub: "urgent",
  short: "short",
  regular: "regular",
};

export default function JobCard({ job, onClick, showFavorite, isFavorited, onToggleFavorite }) {
  const status = (job.status || "active").toLowerCase();
  const isClosed = status === "closed";

  const typeLabel = TYPE_LABEL[job.type] ?? job.type ?? "대타/급구";
  const typeClass = TYPE_CLASS[job.type] ?? "urgent";

  const studioName = job.studio;
  const locationText = job.location ?? job.region;
  const timeText = job.timeSlot ?? job.time;

  // 날짜 포맷팅 (YYYY-MM-DD -> MM.DD)
  const formattedDates = (job.days || []).map(d => {
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[1]}.${parts[2]}`;
    return d;
  });
  const dateRange = formattedDates.length > 1
    ? `${formattedDates[0]} ~ ${formattedDates[formattedDates.length - 1]}`
    : (formattedDates[0] || "");

  const daysSuffix = (job.daysOfWeek && job.daysOfWeek.length > 0)
    ? `(${job.daysOfWeek.join(', ')})`
    : "";

  return (
    <div
      className={`job-card is-clickable ${isClosed ? "is-closed" : ""}`}
      onClick={onClick}
      style={{
        position: 'relative',
        filter: isClosed ? 'grayscale(0.8) opacity(0.7)' : 'none',
        pointerEvents: 'auto', // 여전히 클릭은 되어야 함 (지난 공고 볼 수 있게)
      }}
    >
      <div className="job-top">
        <div className="job-badges">
          {isClosed ? (
            <span className="tag closed" style={{ background: '#94a3b8', color: '#fff' }}>
              모집완료
            </span>
          ) : (
            <span className={`tag ${typeClass}`}>
              {typeLabel}
            </span>
          )}
          {locationText && (
            <span className="tag location">{locationText.split(' ').slice(0, 2).join(' ')}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pay">{formatPayKRW(job.pay)}</span>
          {showFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(job.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isClosed ? 0.3 : 1
              }}
            >
              <ICONS.star
                size={20}
                color={isFavorited ? "#fbbf24" : "#cbd5e1"}
                fill={isFavorited ? "#fbbf24" : "none"}
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>
      </div>

      <h2 className="job-title">{job.title}</h2>

      {studioName && (
        <p className="job-center-italic">{studioName}</p>
      )}

      <div className="job-info-line" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '12px', borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
        <div className="info-item" style={{ color: '#1e293b' }}>
          {ICONS.calendar ? (
            <ICONS.calendar size={13} color="#94a3b8" />
          ) : (
            <ICONS.clock size={13} color="#94a3b8" />
          )}
          <span>{dateRange} {daysSuffix}</span>
        </div>
        <div className="info-item">
          <ICONS.clock size={13} color="#94a3b8" />
          <span>{timeText || "협의"}</span>
        </div>
      </div>

      {isClosed && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#64748b',
          letterSpacing: '-0.02em'
        }}>
          종료된 공고
        </div>
      )}
    </div>
  );
}
