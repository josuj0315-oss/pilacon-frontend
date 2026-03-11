import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import { ICONS, ICON_CONFIG } from "../constants/icons";
import { FileText, Paperclip, ExternalLink } from "lucide-react";
import "./ApplicantList.css";

const STATUS_MAP = {
  submitted: { label: "심사중", class: "new" },
  new: { label: "새 지원", class: "new" },
  read: { label: "열람", class: "read" },
  chatting: { label: "채팅중", class: "chatting" },
  pending: { label: "보류", class: "pending" },
  canceled: { label: "지원취소", class: "read" }
};

export default function ApplicantList() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, getApplicantsByJobId, createChatRoom, markApplicationAsViewed } = usePilaCon();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");
  const [expandedId, setExpandedId] = useState(null);
  const [showMore, setShowMore] = useState({});

  const job = useMemo(() => jobs.find((j) => String(j.id) === String(jobId)), [jobs, jobId]);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      const data = await getApplicantsByJobId(jobId);
      const formatted = data.map(app => {
        const profile = app.profileSnapshot || app.instructorProfile || app.user?.instructorProfiles?.[0] || {};
        return {
          id: app.id,
          name: app.user?.nickname || app.user?.name || "알수없음",
          careerYears: profile.experience || "정보 없음",
          intro: app.message || profile.intro || profile.message || profile.detailIntro || profile.bio || "자기소개가 없습니다.",
          appliedAt: app.createdAt,
          status: app.status || "read",
          tags: profile.specialty ? (typeof profile.specialty === 'string' ? profile.specialty.split(',').map(s => s.trim()) : profile.specialty) : [],
          resumeUrl: profile.resumeUrl,
          activityUrl: profile.activityUrl,
          portfolioUrl: profile.portfolioUrl,
          pdfUrl: profile.pdfUrl,
          detailedBio: profile.detailIntro || profile.intro || profile.bio,
          profileImage: app.user?.profileImage,
          cancelReason: app.cancelReason,
          cancelReasonDetail: app.cancelReasonDetail,
        };
      });
      setApplicants(formatted);
      setLoading(false);
    };

    fetchApplicants();
  }, [jobId, getApplicantsByJobId]);

  const filteredApplicants = useMemo(() => {
    let list = [...applicants];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q) || (a.intro && a.intro.toLowerCase().includes(q)));
    }
    if (activeFilter !== "전체") {
      const statusKeyMap = { "새 지원": "new", "열람": "read", "채팅중": "chatting", "보류": "pending" };
      list = list.filter(a => a.status === statusKeyMap[activeFilter] || a.status === activeFilter);
    }
    return list;
  }, [applicants, searchQuery, activeFilter]);

  const toggleExpand = async (id) => {
    const isExpanding = expandedId !== id;
    setExpandedId(isExpanding ? id : null);

    if (isExpanding) {
      const app = applicants.find(a => a.id === id);
      if (app && (app.status === 'submitted' || app.status === 'new')) {
        await markApplicationAsViewed(id);
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'read' } : a));
      }
    }
  };

  const toggleShowMore = (e, id) => {
    e.stopPropagation();
    setShowMore(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGoToChat = async (applicant) => {
    const res = await createChatRoom(applicant.id);
    if (res.ok) {
      navigate(`/chat/${res.data.id}`);
    } else {
      alert("채팅방을 생성할 수 없습니다.");
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "오늘";
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return isoStr;
    return `${date.getMonth() + 1}.${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="applicant-manage-page">
      <header className="manage-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ICONS.chevronRight size={24} style={{ transform: 'rotate(180deg)' }} color="#111827" />
        </button>
        <div className="header-info">
          <h2 className="header-title">지원자 관리</h2>
          <p className="header-subtitle">{job?.title} · {filteredApplicants.length}명</p>
        </div>
        <div style={{ width: 40 }} />
      </header>

      <div className="filter-section">
        <div className="search-pill-box">
          <ICONS.search size={18} color="#94a3b8" />
          <input
            className="search-input-field"
            placeholder="지원자 검색 (이름/키워드)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chips-container">
          {["전체", "새 지원", "열람", "채팅중", "보류"].map(chip => (
            <button
              key={chip}
              className={`filter-chip ${activeFilter === chip ? "active" : ""}`}
              onClick={() => setActiveFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <main className="applicant-list-container">
        {loading ? (
          <div className="chat-empty">지원자 정보를 불러오는 중입니다...</div>
        ) : filteredApplicants.length === 0 ? (
          <div className="chat-empty">조건에 맞는 지원자가 없어요.</div>
        ) : (
          <div className="applicant-list-rows">
            {filteredApplicants.map(app => {
              const isExpanded = expandedId === app.id;
              const isStatus = STATUS_MAP[app.status] || { label: app.status, class: "read" };
              const isLongIntro = app.intro.length > 100;
              const isShowingMore = showMore[app.id];

              return (
                <div key={app.id} className="applicant-row-wrapper">
                  <button className="applicant-row" onClick={() => toggleExpand(app.id)}>
                    <div className="applicant-avatar">
                      {app.profileImage ? (
                        <img src={app.profileImage} alt={app.name} className="applicant-avatar-img" />
                      ) : (
                        app.name.slice(0, 1)
                      )}
                    </div>
                    <div className="applicant-info-main">
                      <div className="applicant-name-line">
                        <span className="applicant-name">{app.name}</span>
                        <span className="applicant-career">경력 {app.careerYears}년</span>
                      </div>
                      <p className="applicant-intro-preview">{app.intro}</p>
                    </div>
                    <div className="applicant-meta">
                      <span className="applicant-date">{formatDate(app.appliedAt)}</span>
                      <span className={`status-tag ${isStatus.class}`}>{isStatus.label}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="applicant-detail-accordion">
                      <div className="detail-intro-box">
                        <p className="intro-text-long">
                          {isShowingMore ? app.intro : (isLongIntro ? `${app.intro.slice(0, 100)}...` : app.intro)}
                        </p>
                        {isLongIntro && (
                          <button className="toggle-more-btn" onClick={(e) => toggleShowMore(e, app.id)}>
                            {isShowingMore ? "접기" : "소개글 더보기"}
                          </button>
                        )}
                      </div>
                                     <div className="attachments-section">
                        <h4 className="section-subtitle">첨부 및 자료</h4>
                        {app.status === 'canceled' ? (
                          <div className="canceled-resume-lock">
                            <ICONS.activity size={24} color="#94a3b8" />
                            <p>지원 취소된 지원자의 이력서는 열람할 수 없습니다.</p>
                            {app.cancelReason && (
                              <div className="cancel-reason-box">
                                <span className="reason-label">취소 사유</span>
                                <p className="reason-text">{app.cancelReason === '기타 (직접 입력)' ? app.cancelReasonDetail : app.cancelReason}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="attachment-previews">
                              {[
                                { label: "이력서", url: app.resumeUrl },
                                { label: "포트폴리오", url: app.portfolioUrl },
                                { label: "활동사진", url: app.activityUrl }
                              ].map((group, gIdx) => {
                                const urls = (group.url || "").split(",").filter(Boolean);
                                return urls.map((url, uIdx) => {
                                  const isPdf = url.toLowerCase().endsWith(".pdf");
                                  return (
                                    <div key={`${gIdx}-${uIdx}`} className="attachment-preview-item">
                                      {isPdf ? (
                                        <div className="pdf-placeholder" onClick={() => window.open(url)}>
                                          <FileText size={32} color="#5b5ff5" />
                                          <ExternalLink size={14} className="zoom-icon-mini" />
                                        </div>
                                      ) : (
                                        <div className="image-wrapper-mini" onClick={() => window.open(url)}>
                                          <img src={url} alt={group.label} />
                                          <ExternalLink size={14} className="zoom-icon-mini" />
                                        </div>
                                      )}
                                      <span className="preview-label">{group.label}</span>
                                    </div>
                                  );
                                });
                              })}
                              {!app.resumeUrl && !app.portfolioUrl && !app.activityUrl && (
                                <div className="no-attachment">첨부된 파일이 없습니다.</div>
                              )}
                            </div>
                            <div className="attachments-buttons">
                              {app.pdfUrl && (app.pdfUrl.split(",").filter(Boolean)).map((url, idx) => (
                                <button key={idx} className="attach-btn" onClick={() => window.open(url)}>
                                  <FileText size={14} /> PDF 프로필 {idx + 1}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="action-buttons-row">
                        <button className="btn-primary-chat" onClick={() => handleGoToChat(app)} disabled={app.status === 'canceled'}>
                          <ICONS.chat size={18} /> 채팅하기
                        </button>
                        <button className="btn-secondary-reject" onClick={() => alert("보류 처리되었습니다.")} disabled={app.status === 'canceled'}>보류</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <div style={{ height: 60 }} />
    </div>
  );
}
