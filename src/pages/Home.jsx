import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard.jsx";
import { REGION_TABS, REGION_OPTIONS } from "../data/regions";
import { usePilaCon } from "../store/pilaconStore";
import { useCategory } from "../context/CategoryContext";
import { ICONS, ICON_CONFIG } from "../constants/icons";
import RegionFilterSheet from "../components/RegionFilterSheet";

const OTHER_WORKOUT_TYPES = [
  { id: '플라잉요가', label: '플라잉요가', icon: 'zap' },
  { id: '발레핏', label: '발레핏', icon: 'move' },
  { id: '줌바', label: '줌바', icon: 'activityIcon' },
  { id: '재활운동', label: '재활운동', icon: 'heart' },
  { id: '크로스핏', label: '크로스핏', icon: 'dumbbell' },
  { id: '스트레칭', label: '스트레칭', icon: 'disc' },
  { id: '체형교정', label: '체형교정', icon: 'target' },
  { id: '기타', label: '기타', icon: 'plusCircle' },
];

export default function Home() {
  const { category, setCategory } = useCategory();
  const navigate = useNavigate();
  const { jobs, applyToJob, loading, isFavorited, toggleFavorite } = usePilaCon();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workType, setWorkType] = useState("all");
  const [showRegionSheet, setShowRegionSheet] = useState(false);
  const [regionTab, setRegionTab] = useState("서울");
  const [selectedRegions, setSelectedRegions] = useState(["전국"]);
  const [tempRegions, setTempRegions] = useState(["전국"]);
  const [showFabSheet, setShowFabSheet] = useState(false);
  const [selectedOtherTypes, setSelectedOtherTypes] = useState([]);

  const filteredJobs = useMemo(() => {
    const list = jobs ?? [];
    const q = searchQuery.trim().toLowerCase();

    return list.filter((job) => {
      const jobCategory = job.category ?? "필라테스";
      if (jobCategory !== category) return false;

      if (q) {
        const title = (job.title ?? "").toLowerCase();
        // job.center가 객체일 수 있으므로 이름을 추출
        const centerName = (
          (typeof job.center === 'object' ? job.center?.name : job.center) ||
          job.centerTempName ||
          job.studio ||
          job.storeName ||
          ""
        ).toLowerCase();

        if (!title.includes(q) && !centerName.includes(q)) return false;
      }

      if (category === "기타") {
        if (selectedOtherTypes.length > 0) {
          // job.workoutType 또는 job.subCategory 필드가 있다고 가정하거나, 
          // tags 등에 포함되어 있는지 확인 (여기서는 job.subCategory로 체크 제안)
          // 사실 백엔드 필드가 명확하지 않으므로, job.subCategory 또는 tags 확인 로직 필요
          const jobSub = job.subCategory || job.workoutType || "";
          if (!selectedOtherTypes.includes(jobSub)) return false;
        }
      } else {
        if (workType !== "all") {
          if ((job.type ?? "sub") !== workType) return false;
        }
      }

      const jobStatus = String(job.status || "active").toLowerCase();
      const isDeleted = jobStatus === "deleted";
      if (isDeleted) return false;

      if (selectedRegions?.length && !selectedRegions.includes("전국")) {
        const isMatch = selectedRegions.some(sel => {
          const jobAddr = (job.address || job.centerTempAddress || (job.center ? job.center.address : "") || "").toLowerCase();
          const jobRegion = (job.location || "").toLowerCase();
          const jobTab = (job.regionTab || "").toLowerCase();

          const target = sel.toLowerCase();

          if (target.endsWith("전체")) {
            const tabName = target.split(" ")[0]; // "서울"
            // 광역 매칭: regionTab이 일치하거나, 주소가 해당 광역으로 시작
            return jobTab === tabName || jobAddr.startsWith(tabName);
          }

          // 상세 매칭 (RegionFilterSheet에서 includeTabName: true이므로 "서울 강남구" 형태)
          const fullSpec = (jobTab && jobRegion) ? `${jobTab} ${jobRegion}` : jobRegion;
          return fullSpec === target || jobRegion === target || jobAddr.includes(target);
        });
        if (!isMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // 1. status가 active인 것이 위로 (active < closed)
      const aStatus = String(a.status || "active").toLowerCase();
      const bStatus = String(b.status || "active").toLowerCase();

      if (aStatus === "active" && bStatus !== "active") return -1;
      if (aStatus !== "active" && bStatus === "active") return 1;

      // 2. 같은 상태끼리는 최신순 (createdAt DESC)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [jobs, category, searchQuery, workType, selectedRegions, selectedOtherTypes]);

  return (
    <div className="home">
      <header className="unified-header">
        <div className="category-wrap">
          <button
            className="category-btn"
            onClick={() => setShowCategoryMenu((v) => !v)}
            style={{ padding: 0 }}
          >
            <h1 className="unified-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {category}
              <ICONS.chevronDown
                size={18}
                strokeWidth={3}
                className={`chev ${showCategoryMenu ? "open" : ""}`}
                color="#0f172a"
              />
            </h1>
          </button>

          {showCategoryMenu && (
            <div className="category-menu" style={{ top: '40px' }}>
              {["필라테스", "요가", "PT", "기타"].map((item) => (
                <button
                  key={item}
                  className={category === item ? "menu-item active" : "menu-item"}
                  onClick={() => {
                    setCategory(item);
                    setShowCategoryMenu(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="unified-header-actions">
          {/* 알림 버튼은 AppLayout에 이미 있으므로 여기서는 생략하거나 다른 액션 배치 */}
        </div>
      </header>

      <section className="search-section">
        <div className="search-input-wrap">
          <ICONS.search size={18} color="#94a3b8" className="search-icon" />
          <input
            className="search-input"
            placeholder="센터명이나 공고 제목 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="filter-section">
        <button
          className="filter"
          onClick={() => {
            setTempRegions(selectedRegions);
            setShowRegionSheet(true);
          }}
        >
          <span className="filter-icon-box">
            <ICONS.location size={12} strokeWidth={3} />
          </span>
          지역·범위
        </button>

        {category !== "기타" ? (
          <>
            <button className={`filter ${workType === "all" ? "active" : ""}`} onClick={() => setWorkType("all")}>전체</button>
            <button className={`filter ${workType === "sub" ? "active" : ""}`} onClick={() => setWorkType("sub")}>대타/급구</button>
            <button className={`filter ${workType === "short" ? "active" : ""}`} onClick={() => setWorkType("short")}>단기</button>
            <button className={`filter ${workType === "regular" ? "active" : ""}`} onClick={() => setWorkType("regular")}>정규직</button>
          </>
        ) : null}
      </section>

      {category === "기타" && (
        <section className="other-types-grid">
          {OTHER_WORKOUT_TYPES.map((type) => {
            const isActive = selectedOtherTypes.includes(type.id);
            const IconComponent = ICONS[type.icon];
            return (
              <button
                key={type.id}
                className={`other-type-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (isActive) {
                    setSelectedOtherTypes(prev => prev.filter(id => id !== type.id));
                  } else {
                    setSelectedOtherTypes(prev => [...prev, type.id]);
                  }
                }}
              >
                <div className="icon-box">
                  {IconComponent && <IconComponent size={24} strokeWidth={2} />}
                </div>
                <span>{type.label}</span>
              </button>
            );
          })}
        </section>
      )}

      <main className="job-list">
        {loading && (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontWeight: 700 }}>
            공고 데이터를 불러오는 중...
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>
            아직 등록된 공고가 없어
          </div>
        )}

        {filteredJobs.map((job) => (
          <div key={job.id} className="job-card-wrapper">
            <JobCard
              job={job}
              onClick={() => navigate(`/jobs/${job.id}`)}
              showFavorite={true}
              isFavorited={isFavorited(job.id)}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        ))}
      </main>

      <button onClick={() => setShowFabSheet(true)} className="fab">
        <ICONS.plus size={32} strokeWidth={2.5} />
      </button>

      {showFabSheet && (
        <div className="sheet-overlay fab-overlay" onClick={() => setShowFabSheet(false)}>
          <div className="sheet fab-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="fab-menu-list">
              <button
                className="fab-menu-item"
                onClick={() => {
                  setShowFabSheet(false);
                  navigate(`/write?category=${encodeURIComponent(category)}`);
                }}
              >
                <ICONS.plus size={24} strokeWidth={2.5} color="#5b5ff5" />
                <span>공고 올리기</span>
              </button>

              <button
                className="fab-menu-item"
                onClick={() => {
                  setShowFabSheet(false);
                  navigate(`/profile/edit?mode=new`);
                }}
              >
                <ICONS.profile size={24} strokeWidth={2.5} color="#5b5ff5" />
                <span>이력서 등록하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegionSheet && (
        <RegionFilterSheet
          initialRegions={selectedRegions}
          onApply={(regions) => setSelectedRegions(regions)}
          onClose={() => setShowRegionSheet(false)}
          title="일하는 곳 추가"
          includeTabName={true}
        />
      )}

      <style>{`
        .fab-overlay {
          background: rgba(0, 0, 0, 0.45);
          animation: fadeIn 0.2s ease-out;
          padding: 0;
          align-items: flex-end;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fab-sheet {
          width: 100%;
          border-radius: 24px 24px 0 0;
          padding: 24px 20px calc(32px + env(safe-area-inset-bottom));
          border: none;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .fab-menu-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fab-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 12px;
          height: 64px;
          background: transparent;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .fab-menu-item:active {
          background: #f8fafc;
          transform: scale(0.98);
        }

        .fab-menu-item span {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .other-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
        }

        .other-type-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 0;
        }

        .other-type-item .icon-box {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
          border: 1.5px solid transparent;
        }

        .other-type-item span {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          transition: all 0.2s;
        }

        .other-type-item.active .icon-box {
          background: rgba(91, 95, 245, 0.1);
          color: #5b5ff5;
          border-color: rgba(91, 95, 245, 0.2);
          transform: translateY(-2px);
        }

        .other-type-item.active span {
          color: #5b5ff5;
        }
      `}</style>
    </div>
  );
}
