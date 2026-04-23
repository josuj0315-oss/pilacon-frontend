import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import JobCard from "../components/JobCard.jsx";
import { usePilaCon } from "../store/pilaconStore";
import { useCategory } from "../context/CategoryContext";
import { ICONS } from "../constants/icons";
import useDevice from "../hooks/useDevice";
import AdBanner, { AD_POSITIONS } from "../components/common/AdBanner";
import DesktopFilterPanel from "../components/DesktopFilterPanel";
import RegionFilterSheet from "../components/RegionFilterSheet";

const OTHER_WORKOUT_TYPES = [
  { id: "플라잉요가", label: "플라잉요가", icon: "zap" },
  { id: "발레핏", label: "발레핏", icon: "move" },
  { id: "줌바", label: "줌바", icon: "activityIcon" },
  { id: "재활운동", label: "재활운동", icon: "heart" },
  { id: "크로스핏", label: "크로스핏", icon: "dumbbell" },
  { id: "스트레칭", label: "스트레칭", icon: "disc" },
  { id: "체형교정", label: "체형교정", icon: "target" },
  { id: "기타", label: "기타", icon: "plusCircle" },
];

import usePageTitle from "../hooks/usePageTitle";

export default function Home() {
  usePageTitle("핏잡");
  const { isDesktop } = useDevice();
  const [desktopSearchParams, setDesktopSearchParams] = useSearchParams();
  const { category, setCategory } = useCategory();
  const navigate = useNavigate();
  const { user, jobs, loading, isFavorited, toggleFavorite, confirm } = usePilaCon();

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workType, setWorkType] = useState("all");
  const [timeType, setTimeType] = useState("all");
  const [selectedRegions, setSelectedRegions] = useState(["전국"]);
  const [showRegionSheet, setShowRegionSheet] = useState(false);
  const [showFabSheet, setShowFabSheet] = useState(false);
  const [selectedOtherTypes, setSelectedOtherTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const desktopSearchQuery = desktopSearchParams.get("q") || "";
  const effectiveSearchQuery = isDesktop ? desktopSearchQuery : searchQuery;
  const PAGE_SIZE = 12;

  useEffect(() => {
    if (!isDesktop) return;

    // URL -> Local State 동기화 (Source of Truth: URL)
    const jobParam = desktopSearchParams.get("job") || "필라테스";
    const typeParam = desktopSearchParams.get("type") || "all";
    const timeParam = desktopSearchParams.get("time") || "all";
    const regionParam = desktopSearchParams.get("region");
    const otherParam = desktopSearchParams.get("other");
    const pageParam = Number(desktopSearchParams.get("page") || "1");

    // 1. 직군 (Category)
    if (jobParam !== category) {
      setCategory(jobParam);
    }

    // 2. 근무 형태 (WorkType)
    const newWorkType = ["all", "sub", "short", "regular"].includes(typeParam) ? typeParam : "all";
    if (newWorkType !== workType) {
      setWorkType(newWorkType);
    }

    // 3. 시간 (TimeType)
    const newTimeType = ["all", "morning", "afternoon", "full"].includes(timeParam) ? timeParam : "all";
    if (newTimeType !== timeType) {
      setTimeType(newTimeType);
    }

    // 3. 지역 (Regions)
    const newRegions = regionParam ? regionParam.split(",").filter(Boolean) : ["전국"];
    if (JSON.stringify(newRegions) !== JSON.stringify(selectedRegions)) {
      setSelectedRegions(newRegions);
    }

    // 4. 기타 종목 (OtherTypes)
    const newOtherTypes = otherParam ? otherParam.split(",").filter(Boolean) : [];
    if (JSON.stringify(newOtherTypes) !== JSON.stringify(selectedOtherTypes)) {
      setSelectedOtherTypes(newOtherTypes);
    }

    // 5. 페이지 (Page)
    const newPage = pageParam > 0 ? pageParam : 1;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [isDesktop, desktopSearchParams]); // 의존성 단순화: URL 변화에만 반응

  const filteredJobs = useMemo(() => {
    const list = jobs ?? [];
    const q = effectiveSearchQuery.trim().toLowerCase();

    return list
      .filter((job) => {
        const jobCategory = job.category ?? "필라테스";
        if (jobCategory !== category) return false;

        if (q) {
          const title = (job.title ?? "").toLowerCase();
          const centerName = (
            (typeof job.center === "object" ? job.center?.name : job.center) ||
            job.centerTempName ||
            job.studio ||
            job.storeName ||
            ""
          ).toLowerCase();
          if (!title.includes(q) && !centerName.includes(q)) return false;
        }

        if (category === "기타") {
          if (selectedOtherTypes.length > 0) {
            const jobSub = job.subCategory || job.workoutType || "";
            if (!selectedOtherTypes.includes(jobSub)) return false;
          }
        } else if (workType !== "all") {
          if ((job.type ?? "sub") !== workType) return false;
        }

        // Time Filter
        if (timeType !== "all") {
          const jobTimeText = (job.time || job.timeInfo || job.description || "").toLowerCase();
          const titleText = (job.title || "").toLowerCase();
          const combined = `${jobTimeText} ${titleText}`;

          if (timeType === "morning") {
            if (!combined.includes("오전") && !combined.includes("morning")) return false;
          } else if (timeType === "afternoon") {
            if (!combined.includes("오후") && !combined.includes("afternoon")) return false;
          } else if (timeType === "full") {
            if (!combined.includes("종일") && !combined.includes("전임")) return false;
          }
        }

        const jobStatus = String(job.status || "active").toLowerCase();
        if (jobStatus === "deleted") return false;

        if (selectedRegions?.length && !selectedRegions.includes("전국")) {
          const isMatch = selectedRegions.some((sel) => {
            const jobAddr = (job.address || job.centerTempAddress || (job.center ? job.center.address : "") || "").toLowerCase();
            const jobRegion = (job.location || "").toLowerCase();
            const jobTab = (job.regionTab || "").toLowerCase();
            const target = sel.toLowerCase();

            if (target.endsWith("전체")) {
              const tabName = target.split(" ")[0];
              return jobTab === tabName || jobAddr.startsWith(tabName);
            }

            const fullSpec = jobTab && jobRegion ? `${jobTab} ${jobRegion}` : jobRegion;
            return fullSpec === target || jobRegion === target || jobAddr.includes(target);
          });
          if (!isMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aStatus = String(a.status || "active").toLowerCase();
        const bStatus = String(b.status || "active").toLowerCase();
        if (aStatus === "active" && bStatus !== "active") return -1;
        if (aStatus !== "active" && bStatus === "active") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [jobs, category, effectiveSearchQuery, workType, timeType, selectedRegions, selectedOtherTypes]);

  const middleAdIndex = useMemo(() => {
    if (!filteredJobs || filteredJobs.length < 4) return -1;
    return Math.floor(filteredJobs.length / 2);
  }, [filteredJobs]);

  // State -> URL 동기화 (중앙 집중 관리)
  const updateURLParams = (updates) => {
    if (!isDesktop) return;
    const nextParams = new URLSearchParams(desktopSearchParams);

    // 1. 직군
    if (updates.category !== undefined) {
      if (!updates.category || updates.category === "필라테스") nextParams.delete("job");
      else nextParams.set("job", updates.category);
    }

    // 2. 근무형태
    if (updates.workType !== undefined) {
      if (!updates.workType || updates.workType === "all") nextParams.delete("type");
      else nextParams.set("type", updates.workType);
    }

    // 3. 시간
    if (updates.timeType !== undefined) {
      if (!updates.timeType || updates.timeType === "all") nextParams.delete("time");
      else nextParams.set("time", updates.timeType);
    }

    // 4. 지역
    if (updates.selectedRegions !== undefined) {
      const isDefault = !updates.selectedRegions || updates.selectedRegions.length === 0 || 
                       (updates.selectedRegions.length === 1 && updates.selectedRegions[0] === "전국");
      if (isDefault) nextParams.delete("region");
      else nextParams.set("region", updates.selectedRegions.join(","));
    }

    // 5. 기타 종목
    if (updates.selectedOtherTypes !== undefined) {
      if (!updates.selectedOtherTypes || updates.selectedOtherTypes.length === 0) nextParams.delete("other");
      else nextParams.set("other", updates.selectedOtherTypes.join(","));
    }

    // 6. 페이지
    if (updates.currentPage !== undefined) {
      if (updates.currentPage <= 1) nextParams.delete("page");
      else nextParams.set("page", String(updates.currentPage));
    }

    const currentQuery = desktopSearchParams.toString();
    const nextQuery = nextParams.toString();

    if (nextQuery !== currentQuery) {
      setDesktopSearchParams(nextParams, { replace: true });
    }
  };

  const handleCategoryChange = (nextCategory) => {
    // URL을 먼저 업데이트하고, 상태는 useEffect에서 따라오도록 함
    updateURLParams({ category: nextCategory, currentPage: 1 });
    // 전역 컨텍스트만 우선 업데이트
    setCategory(nextCategory);
  };

  const handleWorkTypeChange = (nextType) => {
    updateURLParams({ workType: nextType, currentPage: 1 });
    setWorkType(nextType);
  };

  const handleTimeTypeChange = (nextTime) => {
    updateURLParams({ timeType: nextTime, currentPage: 1 });
    setTimeType(nextTime);
  };

  const handleRegionApply = (regions) => {
    updateURLParams({ selectedRegions: regions, currentPage: 1 });
    setSelectedRegions(regions);
  };

  const handleOtherTypeToggle = (typeId) => {
    const nextOtherTypes = selectedOtherTypes.includes(typeId)
      ? selectedOtherTypes.filter((id) => id !== typeId)
      : [...selectedOtherTypes, typeId];
    updateURLParams({ selectedOtherTypes: nextOtherTypes, currentPage: 1 });
    setSelectedOtherTypes(nextOtherTypes);
  };

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  const paginatedJobs = useMemo(() => {
    if (!isDesktop) return filteredJobs;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, currentPage, isDesktop]);

  const scrollToListTop = () => {
    const headerHeight = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--pc-global-header-height") || "116", 10);
    window.scrollTo({ top: headerHeight, behavior: "smooth" });
  };

  const changePage = (page) => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    updateURLParams({ currentPage: safePage });
    setCurrentPage(safePage);
    scrollToListTop();
  };

  const paginationItems = useMemo(() => {
    const items = [];
    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) items.push(page);
      return items;
    }

    items.push(1);
    if (currentPage > 3) items.push("start-ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let page = start; page <= end; page += 1) items.push(page);

    if (currentPage < totalPages - 2) items.push("end-ellipsis");
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className={`home ${isDesktop ? "home-desktop" : ""}`}>
      {!isDesktop && (
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
      )}

      {!isDesktop && (
        <section className="filter-section">
          <button
            className={`filter ${selectedRegions.length > 0 && !selectedRegions.includes("전국") ? "active" : ""}`}
            onClick={() => setShowRegionSheet(true)}
          >
            지역·범위
            <span className="filter-icon-box">
              <ICONS.location size={12} />
            </span>
          </button>

                  {category !== "기타" ? (
            <>
              <button
                className={`filter ${workType === "all" ? "active" : ""}`}
                onClick={() => handleWorkTypeChange("all")}
              >
                전체
              </button>
              <button
                className={`filter ${workType === "sub" ? "active" : ""}`}
                onClick={() => handleWorkTypeChange("sub")}
              >
                대타·급구
              </button>
              <button
                className={`filter ${workType === "short" ? "active" : ""}`}
                onClick={() => handleWorkTypeChange("short")}
              >
                단기
              </button>
              <button
                className={`filter ${workType === "regular" ? "active" : ""}`}
                onClick={() => handleWorkTypeChange("regular")}
              >
                정규직
              </button>

              <div className="filter-divider-v" style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px', flexShrink: 0 }} />

              <button
                className={`filter ${timeType === "morning" ? "active" : ""}`}
                onClick={() => handleTimeTypeChange("morning")}
              >
                오전
              </button>
              <button
                className={`filter ${timeType === "afternoon" ? "active" : ""}`}
                onClick={() => handleTimeTypeChange("afternoon")}
              >
                오후
              </button>
              <button
                className={`filter ${timeType === "full" ? "active" : ""}`}
                onClick={() => handleTimeTypeChange("full")}
              >
                종일
              </button>
            </>
          ) : (
            <>
              {OTHER_WORKOUT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`filter ${selectedOtherTypes.includes(type.id) ? "active" : ""}`}
                  onClick={() => handleOtherTypeToggle(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </>
          )}
        </section>
      )}

      {showRegionSheet && (
        <RegionFilterSheet
          title="지역 선택"
          initialRegions={selectedRegions}
          onApply={handleRegionApply}
          onClose={() => setShowRegionSheet(false)}
        />
      )}

      {isDesktop ? (
        <>
          <div className="home-desktop-top-tools">
            <button
              className={`pc-region-filter-trigger ${selectedRegions.length > 0 && !selectedRegions.includes("전국") ? "active" : ""}`}
              onClick={() => setShowRegionSheet(true)}
            >
              <ICONS.filter size={14} />
              <span>지역·범위</span>
            </button>
          </div>

          <div className="home-layout">
            <main className="job-list job-list-desktop">
              <div className="home-results-bar">
                <div className="home-results-meta">
                  <strong>총 {filteredJobs.length}건</strong>
                  <span>|</span>
                  <span>{currentPage} / {totalPages} 페이지</span>
                </div>
                <div className="home-results-actions">
                  <button
                    type="button"
                    className="home-results-next"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    다음
                  </button>
                </div>
              </div>

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

              {paginatedJobs.map((job) => (
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

              {!loading && filteredJobs.length > 0 && (
                <div className="home-pagination">
                  <button type="button" className="home-page-btn nav" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                    이전
                  </button>
                  {paginationItems.map((item) => (
                    item === "start-ellipsis" || item === "end-ellipsis" ? (
                      <span key={item} className="home-page-ellipsis">...</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={`home-page-btn ${currentPage === item ? "active" : ""}`}
                        onClick={() => changePage(Number(item))}
                      >
                        {item}
                      </button>
                    )
                  ))}
                  <button type="button" className="home-page-btn nav" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
                    다음
                  </button>
                </div>
              )}
            </main>

            <aside className="filter-panel">
              <DesktopFilterPanel
                category={category}
                setCategory={handleCategoryChange}
                workType={workType}
                setWorkType={handleWorkTypeChange}
                timeType={timeType}
                setTimeType={handleTimeTypeChange}
                otherTypes={OTHER_WORKOUT_TYPES}
                selectedOtherTypes={selectedOtherTypes}
                toggleOtherType={handleOtherTypeToggle}
              />
            </aside>
          </div>
        </>
      ) : (
        <main className="job-list">
          <AdBanner position={AD_POSITIONS.JOB_LIST_TOP} className="job-list-top-ad" />

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

          {filteredJobs.map((job, idx) => (
            <div key={job.id}>
              <div className="job-card-wrapper">
                <JobCard
                  job={job}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  showFavorite={true}
                  isFavorited={isFavorited(job.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
              {idx === middleAdIndex && <AdBanner position={AD_POSITIONS.JOB_LIST_MIDDLE} className="job-list-middle-ad" />}
            </div>
          ))}
        </main>
      )}

      {!isDesktop && (
        <button onClick={() => setShowFabSheet(true)} className="fab">
          <ICONS.plus size={32} strokeWidth={2.5} />
        </button>
      )}

      {!isDesktop && showFabSheet && (
        <div className="sheet-overlay fab-overlay" onClick={() => setShowFabSheet(false)}>
          <div className="sheet fab-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="fab-menu-list">
              <button
                className="fab-menu-item"
                onClick={async () => {
                  const nextPath = `/write?category=${encodeURIComponent(category)}`;
                  if (!user) {
                    const ok = await confirm("알림", "로그인 후 이용하세요.");
                    if (ok) {
                      setShowFabSheet(false);
                      navigate(`/login?next=${encodeURIComponent(nextPath)}`);
                    }
                  } else {
                    setShowFabSheet(false);
                    navigate(nextPath);
                  }
                }}
              >
                <ICONS.plus size={24} strokeWidth={2.5} color="#5b5ff5" />
                <span>공고 올리기</span>
              </button>

              <button
                className="fab-menu-item"
                onClick={async () => {
                  const nextPath = `/profile/instructor/edit?mode=new`;
                  if (!user) {
                    const ok = await confirm("알림", "로그인 후 이용하세요.");
                    if (ok) {
                      setShowFabSheet(false);
                      navigate(`/login?next=${encodeURIComponent(nextPath)}`);
                    }
                  } else {
                    setShowFabSheet(false);
                    navigate(nextPath);
                  }
                }}
              >
                <ICONS.profile size={24} strokeWidth={2.5} color="#5b5ff5" />
                <span>이력서 등록하기</span>
              </button>
            </div>
          </div>
        </div>
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
      `}</style>
    </div>
  );
}
