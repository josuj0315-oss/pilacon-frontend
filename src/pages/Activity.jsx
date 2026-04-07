import React, { useEffect, useMemo, useState } from "react";
import "./Activity.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApplicationStatusLabel, usePilaCon } from "../store/pilaconStore";
import ActivityCard from "../components/ActivityCard";
import AppliedDetail from "./AppliedDetail";
import { ICONS } from "../constants/icons";
import useDevice from "../hooks/useDevice";
import { resetAppScrollPosition } from "../utils/scroll";

const APPLIED_FILTERS = [
  { id: "all", label: "전체" },
  { id: "in_progress", label: "진행중" },
  { id: "accepted", label: "채용확정" },
  { id: "closed", label: "마감/완료" },
  { id: "rejected", label: "불합격/취소" },
];

const TYPE_LABEL = {
  sub: "대타/급구",
  short: "단기",
  regular: "정규직",
};

import usePageTitle from "../hooks/usePageTitle";

export default function Activity() {
  usePageTitle("내활동 | 핏잡");
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const [params, setParams] = useSearchParams();

  const initialTab = params.get("tab") === "recruitment" ? "recruitment" : "applied";
  const [tab, setTab] = useState(initialTab);
  const [appliedFilter, setAppliedFilter] = useState("all");
  const [appliedSort, setAppliedSort] = useState("latest");

  const viewParam = params.get("view");
  const appIdParam = params.get("id");
  const jobIdParam = params.get("jobId");

  const [view, setView] = useState(
    viewParam === "appliedDetail" ? "appliedDetail" : viewParam === "jobDetail" ? "jobDetail" : "list"
  );

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const { appliedList, myJobs, jobs, favorites, createChatRoom, cancelApplication, closeJob, confirm, showToast } = usePilaCon();

  useEffect(() => {
    if (view === "appliedDetail" && appIdParam && appliedList.length > 0) {
      const found = appliedList.find((a) => String(a.id) === String(appIdParam));
      if (found) setSelectedApplication(found);
    }
    if (view === "jobDetail" && jobIdParam && jobs.length > 0) {
      const found = jobs.find((j) => String(j.id) === String(jobIdParam));
      if (found) setSelectedJob(found);
    }
  }, [view, appIdParam, jobIdParam, appliedList, jobs]);

  useEffect(() => {
    const nextParams = { tab };
    if (view === "appliedDetail" && selectedApplication) {
      nextParams.view = "appliedDetail";
      nextParams.id = selectedApplication.id;
    } else if (view === "jobDetail" && selectedJob) {
      nextParams.view = "jobDetail";
      nextParams.jobId = selectedJob.id;
    }

    const currentTab = params.get("tab");
    const currentView = params.get("view");
    const currentId = params.get("id");
    const currentJobId = params.get("jobId");

    if (
      currentTab !== nextParams.tab ||
      currentView !== nextParams.view ||
      currentId !== nextParams.id ||
      currentJobId !== nextParams.jobId
    ) {
      setParams(nextParams);
    }
  }, [tab, view, selectedApplication, selectedJob, setParams, params]);

  const safeApplied = useMemo(() => appliedList ?? [], [appliedList]);
  const safeMyJobs = useMemo(() => myJobs ?? [], [myJobs]);
  const safeFavorites = useMemo(() => favorites ?? [], [favorites]);

  const appliedStats = useMemo(() => {
    const submittedOrRead = safeApplied.filter((item) => ["submitted", "read", "pending"].includes(item.status)).length;
    const chattingCount = safeApplied.filter((item) => item.status === "chatting").length;
    const acceptedCount = safeApplied.filter((item) => item.status === "accepted").length;
    const completedCount = safeApplied.filter((item) => {
      const jobStatus = String(item?.job?.status || "").toLowerCase();
      return item.status === "closed" || jobStatus === "closed";
    }).length;

    return {
      appliedCount: safeApplied.length,
      waitingCount: submittedOrRead,
      chattingCount,
      acceptedCount,
      completedCount,
      favoriteCount: safeFavorites.length,
    };
  }, [safeApplied, safeFavorites]);

  const recruitmentStats = useMemo(() => {
    const activeJobs = safeMyJobs.filter((item) => String(item.status).toLowerCase() === "active");
    const closedJobs = safeMyJobs.filter((item) => String(item.status).toLowerCase() !== "active");
    const applicantsTotal = safeMyJobs.reduce((sum, item) => sum + (item.applicants?.length ?? 0), 0);

    return {
      total: safeMyJobs.length,
      active: activeJobs.length,
      closed: closedJobs.length,
      applicantsTotal,
      favoriteCount: safeFavorites.length,
    };
  }, [safeMyJobs, safeFavorites]);

  const desktopAppliedList = useMemo(() => {
    const filtered = safeApplied.filter((item) => {
      const jobStatus = String(item?.job?.status || "").toLowerCase();
      const status = String(item?.status || "").toLowerCase();
      if (appliedFilter === "all") return true;
      if (appliedFilter === "in_progress") {
        return !["accepted", "rejected", "canceled", "closed"].includes(status) && jobStatus !== "closed";
      }
      if (appliedFilter === "accepted") return status === "accepted";
      if (appliedFilter === "closed") return status === "closed" || jobStatus === "closed";
      if (appliedFilter === "rejected") return status === "rejected" || status === "canceled";
      return true;
    });

    return filtered.sort((a, b) => {
      const at = new Date(a.createdAt || 0).getTime();
      const bt = new Date(b.createdAt || 0).getTime();
      return appliedSort === "oldest" ? at - bt : bt - at;
    });
  }, [safeApplied, appliedFilter, appliedSort]);

  const handleBackToList = () => {
    setView("list");
    setSelectedApplication(null);
    setSelectedJob(null);
  };

  const handleGoToChat = async (app) => {
    if (!app) return;
    const res = await createChatRoom(app.id);
    if (res.ok) {
      navigate(`/chat/${res.data.id}`);
    } else {
      showToast("채팅방을 생성할 수 없습니다.", "error");
    }
  };

  const handleGoToJobDetail = (application) => {
    if (!application?.job) {
      showToast("연결된 공고를 찾을 수 없습니다.", "error");
      return;
    }
    navigate(`/jobs/${application.job.id}`);
  };

  if (view === "appliedDetail" && selectedApplication) {
    return (
      <AppliedDetail
        application={selectedApplication}
        onBack={handleBackToList}
        onChat={() => handleGoToChat(selectedApplication)}
        onGoToJob={() => handleGoToJobDetail(selectedApplication)}
      />
    );
  }

  const desktopRecruitmentItem = selectedJob || (safeMyJobs.length > 0 ? safeMyJobs[0] : null);

  return (
    <div className={`activity-page ${isDesktop ? "activity-page-desktop" : ""}`}>
      <div className="activity-sticky-header">
        {isDesktop && (
          <header className="unified-header">
            <h2 className="unified-title">내 활동</h2>
            <div className="unified-header-actions" />
          </header>
        )}

        <div className="activity-tabs-wrap">
          <div className="activity-tabs">
            <button
              type="button"
              className={`tab ${tab === "applied" ? "is-active" : ""}`}
              onClick={() => {
                setTab("applied");
                resetAppScrollPosition();
              }}
            >
              지원한 내역
            </button>
            <button
              type="button"
              className={`tab ${tab === "recruitment" ? "is-active" : ""}`}
              onClick={() => {
                setTab("recruitment");
                resetAppScrollPosition();
              }}
            >
              내가 올린 공고
            </button>
          </div>
        </div>
      </div>

      {isDesktop && (
        <ActivitySummarySection
          tab={tab}
          appliedStats={appliedStats}
          recruitmentStats={recruitmentStats}
        />
      )}

      <div className={`activity-content ${isDesktop && tab !== "applied" ? "desktop-split" : ""}`}>
        {tab === "applied" ? (
          <>
            <section className="activity-list-column">
              {isDesktop && (
                <div className="activity-list-toolbar">
                  <div className="toolbar-left">
                    {APPLIED_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        className={`toolbar-chip ${appliedFilter === filter.id ? "active" : ""}`}
                        onClick={() => setAppliedFilter(filter.id)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="toolbar-right">
                    <label htmlFor="applied-sort">정렬</label>
                    <select
                      id="applied-sort"
                      value={appliedSort}
                      onChange={(e) => setAppliedSort(e.target.value)}
                    >
                      <option value="latest">최신순</option>
                      <option value="oldest">오래된순</option>
                    </select>
                  </div>
                </div>
              )}

              {safeApplied.length === 0 ? (
                <EmptyState title="아직 지원한 내역이 없어요" />
              ) : isDesktop ? (
                <div className="activity-record-list-wrap">
                  <div className="activity-record-head">
                    <span>공고 정보</span>
                    <span>지원일</span>
                    <span>진행 현황</span>
                    <span>관리</span>
                  </div>

                  <div className="activity-record-body">
                    {desktopAppliedList.map((item) => (
                      <AppliedActivityRow
                        key={item.id}
                        item={item}
                        onChat={() => handleGoToChat(item)}
                        onOpenAppliedInfo={() => {
                          setSelectedApplication(item);
                          setView("appliedDetail");
                        }}
                        onCancel={async () => {
                          if (item.status === "accepted") {
                            showToast("채용확정된 지원서는 취소할 수 없습니다.", "error");
                            return;
                          }
                          if (item.status === "canceled") {
                            showToast("이미 취소된 지원입니다.", "info");
                            return;
                          }
                          const ok = await confirm(
                            "지원 취소",
                            "해당 지원 내역을 취소하시겠습니까?",
                            { type: "danger" }
                          );
                          if (!ok) return;
                          const res = await cancelApplication(item.id, "기타 (직접 입력)", "PC 내 활동에서 취소");
                          if (res.ok) showToast("지원 취소가 완료되었습니다.");
                          else showToast(res.error || "지원 취소에 실패했습니다.", "error");
                        }}
                      />
                    ))}

                    {desktopAppliedList.length === 0 && (
                      <div className="activity-record-empty">선택한 조건에 맞는 지원 내역이 없습니다.</div>
                    )}
                  </div>
                </div>
              ) : (
                safeApplied.map((item) => (
                  <ActivityCard
                    key={item.id}
                    type="applied"
                    item={item}
                    onClick={() => {
                      setSelectedApplication(item);
                      if (!isDesktop) setView("appliedDetail");
                    }}
                  />
                ))
              )}
            </section>
          </>
        ) : (
          <>
            <section className="activity-list-column">
              {safeMyJobs.length === 0 ? (
                <EmptyState title="아직 올린 공고가 없어요" />
              ) : (
                safeMyJobs.map((post) => (
                  <ActivityCard
                    key={post.id}
                    type="recruitment"
                    item={post}
                    onClick={() => {
                      if (isDesktop) setSelectedJob(post);
                      else navigate(`/jobs/${post.id}`);
                    }}
                    onAction={() => navigate(`/activity/applicants/${post.id}`)}
                    onSecondaryAction={async () => {
                      if (post.status === "CLOSED") {
                        showToast("이미 마감된 공고입니다.", "info");
                        return;
                      }
                      const ok = await confirm(
                        "공고 마감",
                        "공고를 마감하시겠습니까? 마감 후에는 지원자를 새로 받을 수 없습니다.",
                        { type: "danger" }
                      );
                      if (ok) {
                        const res = await closeJob(post.id);
                        if (res.ok) showToast("마감 처리되었습니다.");
                        else showToast("마감 처리에 실패했습니다.", "error");
                      }
                    }}
                  />
                ))
              )}
            </section>
            {isDesktop && (
              <DesktopActivityDetailPanel
                tab={tab}
                job={desktopRecruitmentItem}
                onManageApplicants={(jobId) => navigate(`/activity/applicants/${jobId}`)}
                onOpenJob={(jobId) => navigate(`/jobs/${jobId}`)}
              />
            )}
          </>
        )}
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}

function ActivitySummarySection({ tab, appliedStats, recruitmentStats }) {
  const cards =
    tab === "applied"
      ? [
          {
            key: "applied-total",
            label: "지원한 공고",
            value: `${appliedStats.appliedCount}건`,
            desc: "지금까지 지원한 전체 공고",
          },
          {
            key: "applied-waiting",
            label: "연락 대기",
            value: `${appliedStats.waitingCount}건`,
            desc: "확인 대기 또는 답변 대기 상태",
          },
          {
            key: "applied-chat",
            label: "채팅 진행",
            value: `${appliedStats.chattingCount}건`,
            desc: "센터와 소통 중인 지원 건",
          },
          {
            key: "favorites",
            label: "찜한 공고",
            value: `${appliedStats.favoriteCount}건`,
            desc: "추후 지원 검토용 저장 공고",
          },
        ]
      : [
          {
            key: "recruit-total",
            label: "내가 올린 공고",
            value: `${recruitmentStats.total}건`,
            desc: "등록한 채용 공고 전체",
          },
          {
            key: "recruit-active",
            label: "진행중 공고",
            value: `${recruitmentStats.active}건`,
            desc: "현재 지원을 받고 있는 공고",
          },
          {
            key: "recruit-closed",
            label: "마감 공고",
            value: `${recruitmentStats.closed}건`,
            desc: "채용 마감 처리된 공고",
          },
          {
            key: "recruit-applicants",
            label: "누적 지원자",
            value: `${recruitmentStats.applicantsTotal}명`,
            desc: "내 공고 전체 지원자 수",
          },
        ];

  return (
    <section className="activity-summary-grid">
      {cards.map((card) => (
        <article key={card.key} className="activity-summary-card">
          <p className="summary-label">{card.label}</p>
          <strong className="summary-value">{card.value}</strong>
          <p className="summary-desc">{card.desc}</p>
        </article>
      ))}
    </section>
  );
}

function AppliedActivityRow({ item, onOpenAppliedInfo, onChat, onCancel }) {
  const job = item?.job || {};
  const statusKey = getAppliedStatusKey(item);
  const statusText = getAppliedStatusText(item);

  const centerName =
    (typeof job.center === "object" ? job.center?.name : job.center) ||
    job.centerTempName ||
    job.studio ||
    job.storeName ||
    "-";

  const typeText = TYPE_LABEL[job.type] ?? job.type ?? "형태미정";
  const appliedDate = item?.createdAt?.slice(0, 10).replaceAll("-", ".") ?? "-";

  return (
    <div className="activity-record-row">
      <div className="record-col col-job">
        <p className="job-title">{job.title || "제목 없음"}</p>
        <p className="job-meta">{centerName} · {job.category || "직군"} · {typeText}</p>
      </div>

      <div className="record-col col-date">{appliedDate}</div>
      <div className="record-col col-progress">
        <span className={`status-badge ${statusKey}`}>{statusText}</span>
      </div>

      <div className="record-col col-actions">
        <button type="button" className="record-btn" onClick={onOpenAppliedInfo}>내 지원정보</button>
        <RowOverflowMenu onChat={onChat} onCancel={onCancel} />
      </div>
    </div>
  );
}

function RowOverflowMenu({ onChat, onCancel }) {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="row-overflow" ref={menuRef}>
      <button
        type="button"
        className="overflow-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="더보기"
      >
        <ICONS.moreVertical size={16} color="#64748b" />
      </button>

      {open && (
        <div className="overflow-menu">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onChat?.();
            }}
          >
            채팅하기
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              setOpen(false);
              onCancel?.();
            }}
          >
            지원취소
          </button>
        </div>
      )}
    </div>
  );
}

function getAppliedStatusKey(application) {
  const appStatus = String(application?.status || "").toLowerCase();
  const jobStatus = String(application?.job?.status || "").toLowerCase();

  if (appStatus === "accepted") return "accepted";
  if (appStatus === "rejected" || appStatus === "canceled") return "closed";
  if (appStatus === "closed" || jobStatus === "closed") return "closed";
  if (appStatus === "submitted") return "submitted";
  if (appStatus === "read" || appStatus === "chatting" || appStatus === "pending") return "reviewing";
  return "reviewing";
}

function getAppliedStatusText(application) {
  if (!application) return "-";
  const appStatus = String(application.status || "").toLowerCase();
  const jobStatus = String(application?.job?.status || "").toLowerCase();

  if (appStatus === "accepted") return "채용확정";
  if (jobStatus === "closed" && appStatus !== "accepted") return "마감";
  return getApplicationStatusLabel(appStatus);
}

function DesktopActivityDetailPanel({
  tab,
  application,
  job,
  onChat,
  onGoToJob,
  onManageApplicants,
  onOpenJob,
}) {
  if (tab === "applied") {
    if (!application?.job) {
      return (
        <aside className="activity-detail-panel empty-panel">
          <h3>지원 상세</h3>
          <p>좌측 목록에서 지원 내역을 선택하세요.</p>
        </aside>
      );
    }

    const appJob = application.job;
    const appliedDate = application.createdAt?.slice(0, 10).replaceAll("-", ".") ?? "";
    const statusText = getAppliedStatusText(application);
    const isClosed = String(appJob?.status || "").toLowerCase() === "closed";
    const profile = application.profileSnapshot || application.instructorProfile || {};
    const statusGuide = isClosed
      ? "지원한 공고가 마감되었습니다."
      : application.status === "read" || application.status === "chatting" || application.isViewed
      ? "센터에서 강사님의 프로필을 검토 중입니다."
      : "지원서가 정상 접수되었고, 센터 확인을 기다리고 있습니다.";

    return (
      <aside className="activity-detail-panel">
        <h3>지원 상세</h3>

        <article className="applied-detail-post">
          <section className="detail-post-section">
            <div className="detail-post-head">
              <h4>진행 현황</h4>
              <span className={`status-badge ${getAppliedStatusKey(application)}`}>{statusText}</span>
            </div>
            <p className="detail-post-guide">{statusGuide}</p>
            <div className="detail-post-meta">지원일: {appliedDate}</div>
          </section>

          <section className="detail-post-section">
            <h4>공고 정보</h4>
            <p className="detail-post-title">{appJob.title}</p>
            <div className="detail-post-grid">
              <div><span>근무지역</span><strong>{appJob.location || appJob.region || "협의"}</strong></div>
              <div><span>급여</span><strong>{appJob.pay || "협의"}</strong></div>
              <div><span>근무시간</span><strong>{appJob.timeSlot || appJob.time || "협의"}</strong></div>
              <div><span>직군</span><strong>{appJob.category || "-"}</strong></div>
            </div>
          </section>

          <section className="detail-post-section">
            <h4>내 지원 정보</h4>
            <div className="detail-post-profile">
              <div className="profile-avatar">
                <ICONS.profile size={18} color="#94a3b8" />
              </div>
              <div className="profile-copy">
                <strong>{application.user?.nickname || application.user?.name || "익명 강사"}</strong>
                <span>{profile.experience || "경력 미입력"} · {profile.specialty || "전문분야 미입력"}</span>
              </div>
            </div>
            <div className="detail-post-message">{application.message || "지원 메시지가 없습니다."}</div>
          </section>
        </article>

        <div className="detail-actions">
          <button onClick={() => onGoToJob?.(application)}>공고 원문 보기</button>
          <button onClick={() => onChat?.(application)} className="primary">채팅하기</button>
        </div>
      </aside>
    );
  }

  if (!job) {
    return (
      <aside className="activity-detail-panel empty-panel">
        <h3>공고 상세</h3>
        <p>좌측 목록에서 공고를 선택하세요.</p>
      </aside>
    );
  }

  const createdDate = job.createdAt?.slice(0, 10).replaceAll("-", ".") ?? "";
  const applicantsCount = job.applicants?.length ?? 0;

  return (
    <aside className="activity-detail-panel">
      <h3>내 공고 상세</h3>
      <div className="detail-title">{job.title}</div>
      <div className="detail-meta">등록일: {createdDate}</div>
      <div className="detail-grid">
        <div><span>상태</span><strong>{String(job.status).toLowerCase() === "active" ? "진행중" : "마감"}</strong></div>
        <div><span>지원자</span><strong>{applicantsCount}명</strong></div>
        <div><span>직군</span><strong>{job.category || "-"}</strong></div>
        <div><span>형태</span><strong>{job.type || "-"}</strong></div>
      </div>
      <div className="detail-actions">
        <button onClick={() => onOpenJob?.(job.id)}>공고 보기</button>
        <button onClick={() => onManageApplicants?.(job.id)} className="primary">지원자 관리</button>
      </div>
    </aside>
  );
}

function EmptyState({ title }) {
  return (
    <div className="empty">
      <div className="empty-icon-wrap">
        <ICONS.activity size={48} color="#cbd5e1" strokeWidth={1.5} />
      </div>
      <h3 className="empty__title">{title}</h3>
    </div>
  );
}
