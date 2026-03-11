import React, { useState, useEffect } from "react";
import "./modal.css";
import { usePilaCon } from "../store/pilaconStore";
import { useNavigate } from "react-router-dom";

export default function ApplyConfirmSheet({ job, onClose, onApplySuccess }) {
    const { profiles, applyToJob, user } = usePilaCon();
    const navigate = useNavigate();

    const isSubJob = job.type === "sub" || job.type === "short";
    const requiredType = isSubJob ? "sub" : "regular";
    const typeLabel = requiredType === "sub" ? "대타·급구" : "정규직";

    // 해당 타입의 프로필만 필터링
    const matchingProfiles = profiles.filter((p) => p.type === requiredType);

    // 기본 프로필 설정: 대표 프로필이 있으면 그걸 우선, 없으면 최신순
    const initialProfile =
        matchingProfiles.find((p) => p.isPrimary) ||
        [...matchingProfiles].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    const [selectedProfileId, setSelectedProfileId] = useState(initialProfile?.id);
    const [showProfileList, setShowProfileList] = useState(false);
    const [loading, setLoading] = useState(false);

    const selectedProfile = matchingProfiles.find((p) => p.id === selectedProfileId);

    const handleApply = async () => {
        if (!selectedProfileId) return;

        setLoading(true);
        try {
            const res = await applyToJob(job.id, selectedProfileId, selectedProfile?.message);
            if (res.ok) {
                alert("지원 완료되었습니다!");
                onApplySuccess?.();
            } else {
                alert(res.message || "지원 중 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("지원 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (matchingProfiles.length === 0) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal slide-up" onClick={(e) => e.stopPropagation()} style={{ height: "auto", minHeight: "300px" }}>
                    <div className="modal-content" style={{ textAlign: "center", paddingTop: "40px" }}>
                        <div style={{ fontSize: "40px", marginBottom: "20px" }}>📄</div>
                        <h2 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "12px" }}>
                            {typeLabel} 프로필이 없어요
                        </h2>
                        <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "15px" }}>
                            지원하려면 먼저 {typeLabel} 전용 프로필을<br />등록해야 합니다.
                        </p>
                        <button
                            className="apply-btn"
                            onClick={() => navigate("/profile/edit")}
                        >
                            프로필 만들러 가기
                        </button>
                        <button
                            style={{
                                width: "100%",
                                background: "none",
                                border: "none",
                                color: "#94a3b8",
                                marginTop: "16px",
                                fontWeight: "700"
                            }}
                            onClick={onClose}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal slide-up" onClick={(e) => e.stopPropagation()} style={{ height: "auto", maxHeight: "85vh" }}>
                <div className="modal-topbar">
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content" style={{ padding: "0 24px 20px 24px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>지원 프로필 확인</h2>
                    <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
                        이 공고는 <strong>{typeLabel}</strong> 프로필로 지원됩니다.
                    </p>

                    {!showProfileList ? (
                        <div
                            style={{
                                border: "1px solid rgba(15, 23, 42, 0.1)",
                                borderRadius: "16px",
                                padding: "20px",
                                backgroundColor: "#f8fafc"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                <div>
                                    <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "4px" }}>{selectedProfile?.title}</h3>
                                    <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>{selectedProfile?.intro?.substring(0, 50)}...</p>
                                </div>
                                {selectedProfile?.isPrimary && (
                                    <span style={{ fontSize: "10px", backgroundColor: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>대표</span>
                                )}
                            </div>

                            {matchingProfiles.length > 1 && (
                                <button
                                    style={{
                                        fontSize: "13px",
                                        color: "var(--brand, #6366f1)",
                                        background: "none",
                                        border: "none",
                                        padding: "0",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        marginTop: "8px"
                                    }}
                                    onClick={() => setShowProfileList(true)}
                                >
                                    프로필 변경하기
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h4 style={{ fontSize: "15px", fontWeight: "800", marginBottom: "12px" }}>지원할 프로필 선택</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {matchingProfiles.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedProfileId(p.id);
                                            setShowProfileList(false);
                                        }}
                                        style={{
                                            border: p.id === selectedProfileId ? "2px solid var(--brand, #6366f1)" : "1px solid rgba(15, 23, 42, 0.1)",
                                            borderRadius: "14px",
                                            padding: "16px",
                                            cursor: "pointer",
                                            backgroundColor: p.id === selectedProfileId ? "#eef2ff" : "white"
                                        }}
                                    >
                                        <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "2px" }}>{p.title}</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>{p.intro?.substring(0, 30)}...</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                style={{
                                    marginTop: "16px",
                                    padding: "8px 0",
                                    fontSize: "13px",
                                    color: "#64748b",
                                    background: "none",
                                    border: "none",
                                    fontWeight: "700",
                                    cursor: "pointer"
                                }}
                                onClick={() => setShowProfileList(false)}
                            >
                                취소
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ borderTop: "none", padding: "0 24px 24px 24px" }}>
                    <button
                        className="apply-btn"
                        disabled={!selectedProfileId || loading}
                        onClick={handleApply}
                        style={{ height: "54px", borderRadius: "16px" }}
                    >
                        {loading ? "지원 중..." : "이 프로필로 지원하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
