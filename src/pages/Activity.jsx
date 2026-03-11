import React, { useEffect, useMemo, useState } from "react";
import "./Activity.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import ActivityCard from "../components/ActivityCard";
import AppliedDetail from "./AppliedDetail";
import { ICONS, ICON_CONFIG } from "../constants/icons";

export default function Activity() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const initialTab = params.get("tab") === "recruitment" ? "recruitment" : "applied";
  const [tab, setTab] = useState(initialTab);

  // ✅ 상세 뷰 관리를 위한 상태
  // view: "list" | "appliedDetail" | "jobDetail"
  const viewParam = params.get("view");
  const appIdParam = params.get("id");
  const jobIdParam = params.get("jobId");

  const [view, setView] = useState(
    viewParam === "appliedDetail" ? "appliedDetail" :
      viewParam === "jobDetail" ? "jobDetail" : "list"
  );

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const { appliedList, myJobs, jobs, createChatRoom, closeJob } = usePilaCon();

  // ✅ 초기 진입 시 데이터 복구 (새로고침 대응)
  useEffect(() => {
    if (view === "appliedDetail" && appIdParam && appliedList.length > 0) {
      const found = appliedList.find(a => String(a.id) === String(appIdParam));
      if (found) setSelectedApplication(found);
    }
    if (view === "jobDetail" && jobIdParam && jobs.length > 0) {
      const found = jobs.find(j => String(j.id) === String(jobIdParam));
      if (found) setSelectedJob(found);
    }
  }, [view, appIdParam, jobIdParam, appliedList, jobs]);

  // ✅ 탭/뷰 바뀌면 URL도 동기화 (BottomNav 숨김 처리 등 연동)
  useEffect(() => {
    const nextParams = { tab };
    if (view === "appliedDetail" && selectedApplication) {
      nextParams.view = "appliedDetail";
      nextParams.id = selectedApplication.id;
    } else if (view === "jobDetail" && selectedJob) {
      nextParams.view = "jobDetail";
      nextParams.jobId = selectedJob.id;
      // 지원 상세에서 넘어온 경우 context 유지를 위해 appId도 남겨둘 수 있으나 일단 심플하게
    }

    // 무한 루프 방지를 위해 현재 파라미터와 다를 때만 업데이트
    const currentTab = params.get("tab");
    const currentView = params.get("view");
    const currentId = params.get("id");
    const currentJobId = params.get("jobId");

    if (currentTab !== nextParams.tab ||
      currentView !== nextParams.view ||
      currentId !== nextParams.id ||
      currentJobId !== nextParams.jobId) {
      setParams(nextParams);
    }
  }, [tab, view, selectedApplication, selectedJob, setParams, params]);

  const safeApplied = useMemo(() => appliedList ?? [], [appliedList]);
  const safeMyJobs = useMemo(() => myJobs ?? [], [myJobs]);

  // ✅ 지원 상세에서 리스트로 돌아오기
  const handleBackToList = () => {
    setView("list");
    setSelectedApplication(null);
    setSelectedJob(null);
  };

  // ✅ 지원 상세에서 이전 화면(지원 상세)으로 돌아오기
  const handleBackToAppliedDetail = () => {
    setView("appliedDetail");
    setSelectedJob(null);
  };

  // ✅ 채팅 페이지로 이동
  const handleGoToChat = async (app) => {
    if (!app) return;
    const res = await createChatRoom(app.id);
    if (res.ok) {
      navigate(`/chat/${res.data.id}`);
    } else {
      alert("채팅방을 생성할 수 없습니다.");
    }
  };

  // ✅ 공고 원문 보기 클릭 시
  const handleGoToJobDetail = (application) => {
    if (!application?.job) {
      alert("연결된 공고를 찾을 수 없습니다.");
      return;
    }
    navigate(`/jobs/${application.job.id}`);
  };

  // 1. 공고 상세 뷰 (Home과 동일한 UI를 위해 Modal 혹은 스크린 렌더링)
  // 여기서는 setView('detail') 요구사항을 충족하기 위해 Activity 내에서 조건부 렌더링


  // 2. 지원 상세 뷰
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

  // 3. 리스트 뷰
  return (
    <div className="activity-page">
      <div className="activity-sticky-header">
        <header className="unified-header">
          <h2 className="unified-title">내 활동</h2>
          <div className="unified-header-actions" />
        </header>

        <div className="activity-tabs">
          <button
            type="button"
            className={`tab ${tab === "applied" ? "is-active" : ""}`}
            onClick={() => setTab("applied")}
          >
            지원한 내역
          </button>
          <button
            type="button"
            className={`tab ${tab === "recruitment" ? "is-active" : ""}`}
            onClick={() => setTab("recruitment")}
          >
            내가 올린 공고
          </button>
        </div>
      </div>

      <div className="activity-content">
        {tab === "applied" ? (
          <>
            {safeApplied.length === 0 ? (
              <EmptyState
                title="아직 지원한 내역이 없어요"
                desc="마음에 드는 공고를 찾아 바로 지원해보자!"
              />
            ) : (
              safeApplied.map((item) => (
                <ActivityCard
                  key={item.id}
                  type="applied"
                  item={item}
                  onClick={() => {
                    setSelectedApplication(item);
                    setView("appliedDetail");
                  }}
                />
              ))
            )}
          </>
        ) : (
          <>
            {safeMyJobs.length === 0 ? (
              <EmptyState
                title="아직 올린 공고가 없어요"
                desc="플로팅 + 버튼으로 첫 공고를 올려보자!"
              />
            ) : (
              safeMyJobs.map((post) => (
                <ActivityCard
                  key={post.id}
                  type="recruitment"
                  item={post}
                  onClick={() => navigate(`/jobs/${post.id}`)}
                  onAction={() => navigate(`/activity/applicants/${post.id}`)}
                  onSecondaryAction={async () => {
                    if (post.status === 'CLOSED') {
                      alert("이미 마감된 공고입니다.");
                      return;
                    }
                    if (window.confirm("공고를 마감하시겠습니까? 마감 후에는 지원자를 새로 받을 수 없습니다.")) {
                      const res = await closeJob(post.id);
                      if (res.ok) alert("마감 처리되었습니다.");
                      else alert("마감 처리에 실패했습니다.");
                    }
                  }}
                />
              ))
            )}
          </>
        )}
      </div>

      <div style={{ height: 40 }} />
    </div >
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="empty">
      <div className="empty-icon-wrap">
        <ICONS.activity size={48} color="#cbd5e1" strokeWidth={1.5} />
      </div>
      <h3 className="empty__title">{title}</h3>
      <p className="empty__desc">{desc}</p>
    </div>
  );
}
