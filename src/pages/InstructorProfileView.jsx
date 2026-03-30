import React from "react";
import { ArrowLeft, FileText, MessageSquare, Link, Star, Image as ImageIcon, Download, ExternalLink } from "lucide-react";

export default function InstructorProfileView({ profile, onEdit, onBack, fromJobId, onApply }) {
    const renderFilePreviews = (urlStr) => {
        const urls = (urlStr || "").split(",").filter(Boolean);
        if (urls.length === 0) return <p className="empty-text">첨부된 파일이 없습니다.</p>;

        return (
            <div className="file-previews">
                {urls.map((url, idx) => {
                    const isPdf = url.toLowerCase().endsWith(".pdf");
                    return (
                        <div key={idx} className="preview-item">
                            {isPdf ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="pdf-link">
                                    <FileText size={20} />
                                    <span>PDF 문서</span>
                                    <Download size={12} className="download-icon" />
                                </a>
                            ) : (
                                <div className="image-wrapper">
                                    <img src={url} alt="첨부 이미지" />
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="zoom-btn">
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="profile-view-page">
            <header className="view-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={24} color="#1e293b" />
                </button>
                <h1 className="header-title">프로필 상세 보기</h1>
                <button className="edit-top-btn" onClick={onEdit}>수정</button>
            </header>

            <main className="view-main">
                <div className="view-container">
                    {/* 타이틀 섹션 */}
                    <section className="view-section hero">
                        <div className="type-badge">{profile.type === 'sub' ? '대타·급구' : '정규직 지원'}</div>
                        <h2 className="profile-title">{profile.title || "제목 없음"}</h2>
                        {profile.intro && <p className="profile-intro">{profile.intro}</p>}
                    </section>

                    {/* 기본 정보 */}
                    <section className="view-section">
                        <div className="section-label">
                            <FileText size={16} />
                            <span>기본 정보</span>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">경력 사항</span>
                                <span className="value">{profile.experience || "정보 없음"}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">전문 분야</span>
                                <span className="value">{profile.specialty || "정보 없음"}</span>
                            </div>
                        </div>
                    </section>

                    {/* 상세 내용 / 지원 메시지 */}
                    <section className="view-section accent">
                        <div className="section-label">
                            <MessageSquare size={16} />
                            <span>{profile.type === "sub" ? "기본 지원 메시지" : "상세 자기소개"}</span>
                        </div>
                        <div className="detail-content">
                            {profile.type === "sub"
                                ? (profile.message || "등록된 메시지가 없습니다.")
                                : (profile.detailIntro || "등록된 자기소개가 없습니다.")
                            }
                        </div>
                    </section>

                    {/* 첨부 파일 섹션 */}
                    <section className="view-section">
                        <div className="section-label">
                            <Link size={16} />
                            <span>첨부 파일</span>
                        </div>

                        {profile.type === "sub" ? (
                            <div className="attachments-view-grid">
                                <div className="attachment-group">
                                    <label className="field-label">이력서 이미지/PDF</label>
                                    {renderFilePreviews(profile.resumeUrl)}
                                </div>
                                <div className="attachment-group">
                                    <label className="field-label">추가 활동 이미지</label>
                                    {renderFilePreviews(profile.activityUrl)}
                                </div>
                            </div>
                        ) : (
                            <div className="attachments-view-grid">
                                <div className="attachment-group">
                                    <label className="field-label">포트폴리오 이미지</label>
                                    {renderFilePreviews(profile.portfolioUrl)}
                                </div>
                                <div className="attachment-group">
                                    <label className="field-label">프로필 PDF</label>
                                    {renderFilePreviews(profile.pdfUrl)}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <div className="fixed-bottom-cta">
                {fromJobId ? (
                    <button className="apply-btn-primary" onClick={onApply}>이 프로필로 지원하기</button>
                ) : (
                    <button className="edit-btn" onClick={onEdit}>프로필 수정하기</button>
                )}
            </div>

            <style>{`
                .profile-view-page {
                    min-height: 100vh;
                    background: #f8faff;
                }
                .view-header {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
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
                    flex: 1;
                    margin: 0 0 0 8px;
                    font-size: 18px;
                    font-weight: 800;
                    color: #1e293b;
                }
                .edit-top-btn {
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: none;
                    background: #eef2ff;
                    color: #5b5ff5;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .view-main {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    padding-bottom: calc(100px + env(safe-area-inset-bottom));
                }
                .view-container {
                    display: grid;
                    gap: 20px;
                }
                .view-section {
                    background: #fff;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }
                .view-section.hero {
                    background: linear-gradient(135deg, #5b5ff5 0%, #3b82f6 100%);
                    color: #fff;
                    padding: 32px 24px;
                }
                .type-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .hero .profile-title {
                    color: #fff;
                    font-size: 22px;
                    font-weight: 900;
                    margin: 0 0 12px 0;
                }
                .hero .profile-intro {
                    color: rgba(255,255,255,0.9);
                    font-size: 15px;
                    margin: 0;
                    line-height: 1.5;
                }
                .section-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 900;
                    color: #5b5ff5;
                    margin-bottom: 20px;
                }
                .info-grid {
                    display: grid;
                    gap: 16px;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .info-item .label {
                    font-size: 13px;
                    color: #94a3b8;
                    font-weight: 700;
                }
                .info-item .value {
                    font-size: 15px;
                    color: #1e293b;
                    font-weight: 600;
                }
                .view-section.accent {
                    background: #f8faff;
                }
                .detail-content {
                    font-size: 15px;
                    line-height: 1.6;
                    color: #334155;
                    white-space: pre-wrap;
                }
                .attachments-view-grid {
                    display: grid;
                    gap: 24px;
                }
                .field-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 12px;
                }
                .file-previews {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .preview-item {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    background: #f1f5f9;
                }
                .pdf-link {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    color: #5b5ff5;
                    font-size: 10px;
                    font-weight: 700;
                    gap: 4px;
                    padding: 8px;
                    text-align: center;
                }
                .download-icon {
                    margin-top: 2px;
                    opacity: 0.6;
                }
                .image-wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .zoom-btn {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .image-wrapper:hover .zoom-btn {
                    opacity: 1;
                }
                .empty-text {
                    font-size: 13px;
                    color: #cbd5e1;
                    margin: 0;
                }
                .fixed-bottom-cta {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 20px;
                    padding-bottom: calc(20px + env(safe-area-inset-bottom));
                    max-width: 600px;
                    margin: 0 auto;
                    z-index: 1001;
                    background: linear-gradient(to top, #f8faff 80%, rgba(248,250,255,0));
                }
                .edit-btn {
                    width: 100%;
                    height: 56px;
                    border-radius: 18px;
                    border: none;
                    background: #1e293b;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 800;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    cursor: pointer;
                }
                .apply-btn-primary {
                    width: 100%;
                    height: 56px;
                    border-radius: 18px;
                    border: none;
                    background: #5b5ff5;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 800;
                    box-shadow: 0 10px 20px rgba(91, 95, 245, 0.2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .apply-btn-primary:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}
