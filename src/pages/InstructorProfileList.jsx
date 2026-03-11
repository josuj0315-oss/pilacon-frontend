import React from "react";
import { ArrowLeft, Zap, Briefcase, Plus, MoreVertical, Edit2, CheckCircle2, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstructorProfileList({
    activeTab,
    setActiveTab,
    profiles,
    onCreate,
    onView,
    onDelete,
    onSetPrimary,
    initialMode
}) {
    const navigate = useNavigate();
    const [isTypePickerOpen, setIsTypePickerOpen] = React.useState(initialMode === "new");

    const sortedProfiles = [...profiles].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const handleTypeSelect = (type) => {
        onCreate(type);
        setIsTypePickerOpen(false);
    };

    const renderCompactAttachments = (urlStr, label) => {
        const urls = (urlStr || "").split(",").filter(Boolean);
        if (urls.length === 0) return null;

        return (
            <div className="attachment-group">
                <span className="attachment-label">{label}</span>
                <div className="attachment-items">
                    {urls.map((url, idx) => {
                        const isPdf = url.toLowerCase().endsWith(".pdf");
                        return (
                            <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`attachment-item ${isPdf ? 'pdf' : 'image'}`}
                                onClick={e => e.stopPropagation()}
                            >
                                {isPdf ? (
                                    <FileText size={12} strokeWidth={3} />
                                ) : (
                                    <ImageIcon size={12} strokeWidth={3} />
                                )}
                            </a>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="profile-manager-page">
            <header className="manager-header">
                <button className="back-btn" onClick={() => navigate("/mypage")}>
                    <ArrowLeft size={24} color="#1e293b" />
                </button>
                <h1 className="header-title">강사 이력서 등록 및 관리</h1>
            </header>

            <main className="manager-main">
                {/* 탭 세그먼트 */}
                <div className="tab-segments">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "sub" ? "active" : ""}`}
                        onClick={() => setActiveTab("sub")}
                        aria-pressed={activeTab === "sub"}
                    >
                        대타·급구
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "regular" ? "active" : ""}`}
                        onClick={() => setActiveTab("regular")}
                        aria-pressed={activeTab === "regular"}
                    >
                        정규직 지원
                    </button>
                </div>

                {/* 안내 카드 */}
                <div className={`info-card ${activeTab}`}>
                    <div className="info-icon">
                        {activeTab === "sub" ? <Zap size={20} fill="currentColor" /> : <Briefcase size={20} fill="currentColor" />}
                    </div>
                    <div className="info-text">
                        {activeTab === "sub" ? (
                            <>
                                <strong>빠른 지원용 프로필</strong>
                                <p>대타·급구 공고에 지원할 때 사용</p>
                            </>
                        ) : (
                            <>
                                <strong>채용 심사용 프로필</strong>
                                <p>정규직 공고 지원 시 센터가 열람</p>
                            </>
                        )}
                    </div>
                </div>

                {/* 프로필 리스트 */}
                <div className="profile-list">
                    {sortedProfiles.map(profile => (
                        <div
                            key={profile.id}
                            className={`profile-card compact ${profile.isPrimary ? "primary" : ""}`}
                            onClick={() => onView(profile.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {profile.isPrimary && <div className="primary-badge">대표</div>}
                            <div className="card-content">
                                <h3 className="profile-title">{profile.title || "제목 없음"}</h3>
                                {profile.type === 'sub' && profile.message && (
                                    <p className="profile-snippet">
                                        {profile.message.length > 40 ? `${profile.message.substring(0, 40)}...` : profile.message}
                                    </p>
                                )}
                                <div className="card-meta">
                                    <span className="update-date">수정일 {formatDate(profile.updatedAt)}</span>
                                </div>
                            </div>
                            <div className="card-actions">
                                {!profile.isPrimary && (
                                    <button
                                        className="action-btn primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSetPrimary(activeTab, profile.id);
                                        }}
                                    >
                                        <CheckCircle2 size={16} />
                                        <span>대표 설정</span>
                                    </button>
                                )}
                                <button
                                    className="action-btn delete"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDelete(profile.id);
                                    }}
                                    style={{ position: 'relative', zIndex: 10 }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {sortedProfiles.length === 0 && (
                        <div className="empty-state">
                            <p>등록된 프로필이 없습니다.</p>
                            <p>새 프로필을 만들어 보세요!</p>
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed-bottom-cta">
                <button className="create-btn" onClick={() => setIsTypePickerOpen(true)}>
                    <Plus size={20} strokeWidth={3} />
                    <span>새 프로필 만들기</span>
                </button>
            </div>

            {/* 유형 선택 모달 */}
            {isTypePickerOpen && (
                <div className="modal-overlay" onClick={() => setIsTypePickerOpen(false)}>
                    <div className="type-picker-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">새 프로필 유형 선택</h2>
                            <p className="modal-desc">원하시는 프로필 종류를 선택해주세요.</p>
                        </div>
                        <div className="type-options">
                            <button className="type-option-btn sub" onClick={() => handleTypeSelect('sub')}>
                                <div className="option-icon">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div className="option-info">
                                    <strong>대타·급구용 프로필</strong>
                                    <span>빠른 대체 강사 지원용</span>
                                </div>
                            </button>
                            <button className="type-option-btn regular" onClick={() => handleTypeSelect('regular')}>
                                <div className="option-icon">
                                    <Briefcase size={24} fill="currentColor" />
                                </div>
                                <div className="option-info">
                                    <strong>정규직 지원용 프로필</strong>
                                    <span>센터 정규직/파트타임 채용용</span>
                                </div>
                            </button>
                        </div>
                        <button className="modal-close-btn" onClick={() => setIsTypePickerOpen(false)}>취소</button>
                    </div>
                </div>
            )}

            <style>{`
                .profile-manager-page {
                    min-height: 100vh;
                    background: #f8faff;
                    padding-bottom: 100px;
                }
                .manager-header {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                }
                .back-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    display: grid;
                    place-items: center;
                    cursor: pointer;
                }
                .header-title {
                    margin: 0 0 0 8px;
                    font-size: 18px;
                    font-weight: 800;
                    color: #1e293b;
                }
                .manager-main {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    padding-bottom: calc(100px + 72px + env(safe-area-inset-bottom));
                }
                .tab-segments {
                    display: flex;
                    width: 100%;
                    background: #fff;
                    padding: 8px;
                    border-radius: 9999px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e6e9f5;
                    margin-bottom: 24px;
                }
                .tab-btn {
                    flex: 1;
                    padding: 16px 0;
                    border: none;
                    border-radius: 9999px;
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: transparent;
                    color: #5b5ff5;
                }
                .tab-btn.active {
                    background: #5b5ff5;
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(91, 95, 245, 0.3);
                }
                .tab-btn:not(.active):active {
                    background: rgba(91, 95, 245, 0.05);
                }
                .info-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    border-radius: 22px;
                    margin-bottom: 24px;
                }
                .info-card.sub {
                    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
                    color: #312e81;
                }
                .info-card.regular {
                    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
                    color: #4c1d95;
                }
                .info-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: rgba(255,255,255,0.5);
                    display: grid;
                    place-items: center;
                }
                .info-text strong {
                    display: block;
                    font-size: 15px;
                    margin-bottom: 2px;
                }
                .info-text p {
                    font-size: 13px;
                    opacity: 0.8;
                    margin: 0;
                }
                .profile-list {
                    display: grid;
                    gap: 16px;
                }
                .profile-card {
                    background: #fff;
                    border-radius: 22px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.01);
                    position: relative;
                    transition: transform 0.2s;
                }
                .profile-card.primary {
                    border-color: rgba(91, 95, 245, 0.3);
                }
                .profile-card.compact {
                    padding: 20px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .profile-card.compact:hover {
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                    transform: translateY(-2px);
                }
                .primary-badge {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: #5b5ff5;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 8px;
                }
                .profile-title {
                    font-size: 17px;
                    font-weight: 800;
                    margin: 0 0 4px 0;
                    color: #1e293b;
                    padding-right: 20px;
                }
                .profile-snippet {
                    font-size: 13px;
                    color: #64748b;
                    margin: 4px 0 8px 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .card-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .update-date {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 600;
                }
                .card-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-top: 16px;
                    border-top: 1px solid #f1f5f9;
                }
                .action-btn {
                    padding: 8px 12px;
                    border-radius: 10px;
                    border: none;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:active {
                    transform: scale(0.95);
                }
                .action-btn.edit {
                    background: #eef2ff;
                    color: #5b5ff5;
                }
                .action-btn.primary {
                    background: #f0fdf4;
                    color: #16a34a;
                }
                .action-btn.delete {
                    margin-left: auto;
                    color: #ef4444;
                    background: #fef2f2;
                }
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #94a3b8;
                }
                .empty-state p {
                    margin: 4px 0;
                    font-size: 14px;
                    font-weight: 600;
                }
                .fixed-bottom-cta {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 20px;
                    padding-bottom: calc(20px + env(safe-area-inset-bottom));
                    background: linear-gradient(to top, #f8faff 80%, rgba(248,250,255,0));
                    max-width: 600px;
                    margin: 0 auto;
                    z-index: 1100;
                }
                .create-btn {
                    width: 100%;
                    height: 56px;
                    border-radius: 18px;
                    border: none;
                    background: #5b5ff5;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 10px 20px rgba(91, 95, 245, 0.2);
                    cursor: pointer;
                }

                /* 모달 스타일 */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: grid;
                    place-items: center;
                    padding: 20px;
                    z-index: 2000;
                }
                .type-picker-modal {
                    background: #fff;
                    width: 100%;
                    max-width: 400px;
                    border-radius: 28px;
                    padding: 32px 24px 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .modal-header {
                    text-align: center;
                    margin-bottom: 28px;
                }
                .modal-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }
                .modal-desc {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0;
                }
                .type-options {
                    display: grid;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .type-option-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 18px;
                    border-radius: 20px;
                    border: 1px solid #eef2f6;
                    background: #f8faff;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                .type-option-btn:active {
                    transform: scale(0.98);
                    background: #fff;
                    border-color: #5b5ff5;
                }
                .option-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    display: grid;
                    place-items: center;
                }
                .type-option-btn.sub .option-icon {
                    background: #eff6ff;
                    color: #3b82f6;
                }
                .type-option-btn.regular .option-icon {
                    background: #f5f3ff;
                    color: #8b5cf6;
                }
                .option-info {
                    display: grid;
                    gap: 2px;
                }
                .option-info strong {
                    font-size: 16px;
                    font-weight: 800;
                    color: #1e293b;
                }
                .option-info span {
                    font-size: 13px;
                    color: #64748b;
                }
                .modal-close-btn {
                    width: 100%;
                    padding: 16px;
                    border: none;
                    background: transparent;
                    color: #94a3b8;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .profile-attachments {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .attachment-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .attachment-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    min-width: 50px;
                }
                .attachment-items {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }
                .attachment-item {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    background: #f1f5f9;
                    display: grid;
                    place-items: center;
                    color: #64748b;
                    text-decoration: none;
                    transition: all 0.2s;
                    border: 1px solid #e2e8f0;
                }
                .attachment-item:hover {
                    background: #e2e8f0;
                    color: #5b5ff5;
                }
                .attachment-item.pdf {
                    background: #eff6ff;
                    color: #3b82f6;
                }
                .attachment-item.image {
                    background: #f0fdf4;
                    color: #16a34a;
                }
            `}</style>
        </div>
    );
}
