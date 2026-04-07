import AdBanner, { AD_POSITIONS } from "./common/AdBanner";

const CATEGORY_OPTIONS = ["필라테스", "요가", "PT", "기타"];
const WORK_TYPE_OPTIONS = [
  { id: "all", label: "전체" },
  { id: "sub", label: "대타/급구" },
  { id: "short", label: "단기" },
  { id: "regular", label: "정규직" },
];

export default function DesktopFilterPanel({
  category,
  setCategory,
  workType,
  setWorkType,
  otherTypes,
  selectedOtherTypes,
  toggleOtherType,
}) {
  return (
    <div className="home-desktop-filter-panel">
      <div className="desktop-filter-card desktop-filter-main-card">
        <div className="desktop-filter-section">
          <h4>직군</h4>
          <div className="desktop-filter-grid">
            {CATEGORY_OPTIONS.map((item) => (
              <button
                key={item}
                className={`desktop-filter-btn ${category === item ? "active" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="desktop-filter-divider" />

        <div className="desktop-filter-section">
          <h4>근무 형태</h4>
          <div className="desktop-filter-grid">
            {WORK_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`desktop-filter-btn ${workType === opt.id ? "active" : ""}`}
                onClick={() => setWorkType(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="desktop-filter-divider" />
        <div className={`desktop-filter-section other-workout-section ${category === "기타" ? "visible" : "hidden"}`}>
          <h4>운동 종목</h4>
          <div className="desktop-filter-grid">
            {otherTypes.map((type) => (
              <button
                key={type.id}
                className={`desktop-filter-btn ${selectedOtherTypes.includes(type.id) ? "active" : ""}`}
                onClick={() => toggleOtherType(type.id)}
                disabled={category !== "기타"}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="desktop-filter-card ad-card">
        <AdBanner position={AD_POSITIONS.SIDEBAR} className="home-top-ad" />
      </div>
    </div>
  );
}
