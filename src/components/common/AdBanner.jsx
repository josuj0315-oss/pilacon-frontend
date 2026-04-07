const LABEL_BY_POSITION = {
  HOME_TOP: "HOME TOP",
  JOB_LIST_TOP: "JOB LIST TOP",
  JOB_LIST_MIDDLE: "JOB LIST MIDDLE",
  SIDEBAR: "SIDEBAR",
};

export const AD_POSITIONS = {
  HOME_TOP: "HOME_TOP",
  JOB_LIST_TOP: "JOB_LIST_TOP",
  JOB_LIST_MIDDLE: "JOB_LIST_MIDDLE",
  SIDEBAR: "SIDEBAR",
};

export default function AdBanner({ position, className = "" }) {
  const label = LABEL_BY_POSITION[position] || "AD";

  return (
    <section className={`ad-banner ad-banner-${position?.toLowerCase?.() || "default"} ${className}`.trim()} aria-label={`ad-${position || "default"}`}>
      <div className="ad-banner-inner">
        <span className="ad-badge">AD</span>
        <div className="ad-copy">
          <strong>광고 영역</strong>
          <span>{label}</span>
        </div>
      </div>
    </section>
  );
}
