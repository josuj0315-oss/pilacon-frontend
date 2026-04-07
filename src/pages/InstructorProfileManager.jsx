import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import InstructorProfileList from "./InstructorProfileList";
import InstructorProfileEdit from "./InstructorProfileEdit";
import InstructorProfileView from "./InstructorProfileView";
import { usePilaCon } from "../store/pilaconStore";
import { useBodyScrollLock } from "../utils/hooks";

import usePageTitle from "../hooks/usePageTitle";

export default function InstructorProfileManager() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { profiles, deleteProfile, setPrimaryProfile, saveProfile, applyToJob, jobs, confirm, showToast } = usePilaCon();
    
    const initialMode = searchParams.get("mode");
    usePageTitle(initialMode === "new" ? "이력서작성 | 핏잡" : "프로필 관리 | 핏잡");

    const fromJobId = searchParams.get("fromJobId");
    const jobType = searchParams.get("jobType"); // 'sub' or 'regular'

    const [view, setView] = useState("list"); // list | detail | edit
    const [activeTab, setActiveTab] = useState(jobType || "sub"); // sub | regular
    const [viewingProfileId, setViewingProfileId] = useState(null);
    const [showApplyPromotion, setShowApplyPromotion] = useState(false);
    const [savedProfileId, setSavedProfileId] = useState(null);

    useBodyScrollLock(showApplyPromotion);

    // 공고 지원에서 넘어온 경우 바로 작성 모드로 진입
    useEffect(() => {
        if (fromJobId && initialMode === "new" && jobType) {
            handleCreateProfile(jobType);
        }
    }, [fromJobId, initialMode, jobType]);

    const handleCreateProfile = (type) => {
        setViewingProfileId(`new_${type}`);
        setActiveTab(type);
        setView("edit");
    };

    const handleViewProfile = (id) => {
        setViewingProfileId(id);
        setView("detail");
    };

    const handleEditProfile = (id) => {
        setViewingProfileId(id);
        setView("edit");
    };

    const handleDeleteProfile = async (id) => {
        const ok = await confirm("프로필 삭제", "프로필을 삭제하시겠습니까?", { type: 'danger' });
        if (ok) {
            await deleteProfile(id);
            showToast("프로필이 삭제되었습니다.");
            if (view === "detail") setView("list");
        }
    };

    const handleSetPrimary = async (type, id) => {
        await setPrimaryProfile(id);
    };

    const handleSaveProfile = async (updatedProfile) => {
        const res = await saveProfile(updatedProfile);
        if (res.ok) {
            setViewingProfileId(res.data.id);
            if (fromJobId) {
                // 공고 지원 모맥에서 저장 성공 시, 지원 의사를 묻는 모달 노출
                setSavedProfileId(res.data.id);
                setShowApplyPromotion(true);
            } else {
                setView("detail");
                showToast("프로필이 저장되었습니다.");
            }
        } else {
            showToast(res.error, "error");
        }
    };

    const handleApplyWithProfile = async (profileId) => {
        if (!fromJobId) return;
        try {
            const res = await applyToJob(fromJobId, profileId);
            if (res.ok) {
                showToast("지원 완료되었습니다!");
                // 히스토리 핑퐁 방지를 위해 뒤로가기(navigate(-1)) 수행
                // 이를 통해 현재 프로필 작성/상세 페이지가 히스토리에서 제거됨
                navigate(-1);
            } else {
                showToast(res.message || "지원 중 오류가 발생했습니다.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("지원 중 오류가 발생했습니다.", "error");
        }
    };

    let mainContent;

    if (view === "detail") {
        const profile = profiles.find(p => p.id === viewingProfileId);
        if (!profile) {
            setView("list");
            mainContent = null;
        } else {
            mainContent = (
                <InstructorProfileView
                    profile={profile}
                    fromJobId={fromJobId}
                    onEdit={() => setView("edit")}
                    onBack={() => {
                        if (fromJobId) {
                            navigate(-1);
                        } else {
                            setView("list");
                        }
                    }}
                    onApply={() => handleApplyWithProfile(profile.id)}
                />
            );
        }
    } else if (view === "edit") {
        let editingProfile;
        if (typeof viewingProfileId === 'string' && viewingProfileId.startsWith('new_')) {
            const type = viewingProfileId.split('_')[1];
            editingProfile = {
                type: type,
                title: "",
                intro: "",
                experience: "",
                specialty: "",
                message: "",
                resumeUrl: "",
                activityUrl: "",
                detailIntro: "",
                pdfUrl: "",
                portfolioUrl: "",
                isPrimary: profiles.filter(p => p.type === type).length === 0,
            };
        } else {
            editingProfile = profiles.find(p => p.id === viewingProfileId);
        }

        if (!editingProfile) {
            setView("list");
            mainContent = null;
        } else {
            mainContent = (
                <InstructorProfileEdit
                    profile={editingProfile}
                    fromJobId={fromJobId}
                    onSave={handleSaveProfile}
                    onBack={() => {
                        if (fromJobId && typeof viewingProfileId === 'string' && viewingProfileId.startsWith('new_')) {
                            navigate(-1);
                        } else if (typeof viewingProfileId === 'string' && viewingProfileId.startsWith('new_')) {
                            setView("list");
                        } else {
                            setView("detail");
                        }
                    }}
                />
            );
        }
    } else {
        mainContent = (
            <InstructorProfileList
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                profiles={profiles.filter(p => p.type === activeTab)}
                onCreate={handleCreateProfile}
                onView={handleViewProfile}
                onDelete={handleDeleteProfile}
                onSetPrimary={handleSetPrimary}
                initialMode={initialMode}
                fromJobId={fromJobId}
            />
        );
    }

    return (
        <>
            {mainContent}

            {/* 지원 확인 모달 */}
            {showApplyPromotion && (
                <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={(e) => {
                    setShowApplyPromotion(false);
                    setView("detail");
                }}>
                    <div className="modal slide-up" onClick={(e) => e.stopPropagation()} style={{ 
                        height: "auto", 
                        minHeight: "340px", 
                        borderRadius: "32px", 
                        width: "100%", 
                        maxWidth: "560px",
                        marginTop: "15vh"
                    }}>
                        <div className="modal-content" style={{ textAlign: "center", paddingTop: "40px", paddingBottom: "20px" }}>
                            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎉</div>
                            <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#1e293b" }}>
                                프로필 작성이 완료되었습니다!
                            </h2>
                            <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "15px", lineHeight: "1.6", fontWeight: "600" }}>
                                이제 이 프로필로 해당 공고에<br />바로 지원하실 수 있습니다. 지금 지원할까요?
                            </p>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <button
                                    className="apply-btn"
                                    onClick={() => handleApplyWithProfile(savedProfileId)}
                                    style={{ 
                                        height: "58px", 
                                        borderRadius: "18px", 
                                        fontSize: "16px", 
                                        fontWeight: "800",
                                        background: "#5b5ff5",
                                        boxShadow: "0 10px 20px rgba(91, 95, 245, 0.2)"
                                    }}
                                >
                                    이 프로필로 바로 지원하기
                                </button>
                                <button
                                    style={{
                                        width: "100%",
                                        height: "50px",
                                        background: "none",
                                        border: "none",
                                        color: "#94a3b8",
                                        fontWeight: "700",
                                        fontSize: "14px",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        setShowApplyPromotion(false);
                                        setView("detail");
                                    }}
                                >
                                    나중에 할게요
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
