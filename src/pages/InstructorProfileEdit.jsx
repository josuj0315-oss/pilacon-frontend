import React, { useState, useRef } from "react";
import { ArrowLeft, FileText, MessageSquare, Link, Star, Image as ImageIcon, Loader2, Paperclip } from "lucide-react";
import { usePilaCon } from "../store/pilaconStore";

export default function InstructorProfileEdit({ profile, onSave, onBack, fromJobId }) {
    const { uploadFile, uploadResume, showToast } = usePilaCon();
    const [formData, setFormData] = useState({ ...profile });
    const [uploading, setUploading] = useState({}); // { fieldName: boolean }
    const [saving, setSaving] = useState(false);

    const fileInputRefs = useRef({});

    const handleTogglePrimary = () => {
        setFormData(prev => ({ ...prev, isPrimary: !prev.isPrimary }));
    };

    const handleFileChange = async (e, field) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const isResumeField = ['resumeUrl', 'pdfUrl', 'portfolioUrl', 'activityUrl'].includes(field);
        const uploadFn = isResumeField ? uploadResume : uploadFile;

        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const uploadPromises = files.map(file => {
                console.log(`Starting upload for ${file.name} to ${field}`);
                return uploadFn(file);
            });
            const results = await Promise.all(uploadPromises);
            console.log("Upload results:", results);

            const failures = results.filter(res => !res.ok);
            if (failures.length > 0) {
                const headError = failures[0].error || '서버 오류';
                showToast(headError, "error");
            }

            const successfulUrls = results
                .filter(res => res.ok)
                .map(res => res.url);

            if (successfulUrls.length > 0) {
                const currentVal = formData[field] || "";
                const newVal = currentVal
                    ? `${currentVal},${successfulUrls.join(",")}`
                    : successfulUrls.join(",");

                setFormData(prev => ({ ...prev, [field]: newVal }));
            }
        } catch (error) {
            console.error("Critical upload error:", error);
            showToast("파일 업로드 중 오류가 발생했습니다.", "error");
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const triggerFileUpload = (field) => {
        fileInputRefs.current[field]?.click();
    };

    const handleRemoveFile = (field, urlToRemove) => {
        const currentUrls = (formData[field] || "").split(",").filter(Boolean);
        const filteredUrls = currentUrls.filter(url => url !== urlToRemove);
        setFormData(prev => ({ ...prev, [field]: filteredUrls.join(",") }));
    };

    const renderFilePreviews = (field) => {
        const urls = (formData[field] || "").split(",").filter(Boolean);
        if (urls.length === 0) return null;

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
                                </a>
                            ) : (
                                <div className="image-wrapper">
                                    <img src={url} alt="첨부 이미지" />
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="zoom-btn">
                                        <Link size={14} />
                                    </a>
                                </div>
                            )}
                            <button type="button" className="remove-file-btn" onClick={() => handleRemoveFile(field, url)}>
                                &times;
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return;

        const dataToSave = { ...formData };
        if (dataToSave.type === "sub" && !dataToSave.title) {
            dataToSave.title = "대타·급구 프로필";
        }

        setSaving(true);
        try {
            await onSave({
                ...dataToSave,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Save error:", err);
            showToast("저장 중 오류가 발생했습니다.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-edit-page">
            <header className="edit-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={24} color="#1e293b" />
                </button>
                <h1 className="header-title">
                    {formData.type === "sub" ? "대타·급구 프로필 작성" : "정규직 프로필 작성"}
                </h1>
            </header>

            <main className="edit-main">
                <form onSubmit={handleSave} className="edit-form">

                    {/* 기본 정보 - 정규직일 때만 노출 */}
                    {formData.type === "regular" && (
                        <section className="edit-section">
                            <div className="section-label">
                                <FileText size={16} />
                                <span>기본 정보</span>
                            </div>

                            <div className="input-group">
                                <label className="field-label">프로필 제목</label>
                                <input
                                    type="text"
                                    className="edit-input"
                                    placeholder="예: 5년차 재활 필라테스 전문 강사"
                                    value={formData.title ?? ""}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="field-label">한줄 소개</label>
                                <input
                                    type="text"
                                    className="edit-input"
                                    placeholder="자신을 한 줄로 표현해 보세요"
                                    value={formData.intro ?? ""}
                                    onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="field-label">경력 사항</label>
                                <input
                                    type="text"
                                    className="edit-input"
                                    placeholder="예: 센터 A 3년, 센터 B 2년"
                                    value={formData.experience ?? ""}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="field-label">전문 분야</label>
                                <input
                                    type="text"
                                    className="edit-input"
                                    placeholder="예: 재활, 임산부, 다이어트"
                                    value={formData.specialty ?? ""}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                />
                            </div>
                        </section>
                    )}

                    {/* 상세 자기소개 / 지원 메시지 설정 SECTION */}
                    <section className="edit-section accent">
                        <div className="section-label">
                            <MessageSquare size={16} />
                            <span>{formData.type === "sub" ? "지원 메시지 설정" : "상세 자기소개"}</span>
                        </div>
                        <div className="input-group">
                            <label className="field-label">
                                {formData.type === "sub" ? "대강 지원시 기본 메시지" : "상세 내용"}
                            </label>
                            <textarea
                                className="edit-textarea"
                                placeholder={formData.type === "sub"
                                    ? "대강(강사 대체) 지원 시 자동으로 전송될 메시지를 입력하세요"
                                    : "본인의 강점, 수업 스타일 등을 상세히 기록해 보세요"
                                }
                                value={formData.type === "sub" ? (formData.message ?? "") : (formData.detailIntro ?? "")}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [formData.type === "sub" ? "message" : "detailIntro"]: e.target.value
                                })}
                            />
                        </div>
                    </section>

                    {/* 첨부 파일 섹션 */}
                    <section className="edit-section">
                        <div className="section-label">
                            <Link size={16} />
                            <span>첨부 파일</span>
                        </div>

                        {formData.type === "sub" ? (
                            <>
                                <div className="input-group">
                                    <label className="field-label">이력서 이미지</label>
                                    <div className="file-upload-wrapper">
                                        <button
                                            type="button"
                                            className="file-upload-btn"
                                            onClick={() => triggerFileUpload('resumeUrl')}
                                            disabled={uploading['resumeUrl']}
                                        >
                                            <div className="btn-content">
                                                {uploading['resumeUrl'] ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                                                <span>{uploading['resumeUrl'] ? "업로드 중..." : "파일 선택 (이미지/PDF)"}</span>
                                            </div>
                                        </button>
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            ref={el => fileInputRefs.current['resumeUrl'] = el}
                                            onChange={(e) => handleFileChange(e, 'resumeUrl')}
                                            accept="image/*,.pdf"
                                        />
                                    </div>
                                    {renderFilePreviews('resumeUrl')}
                                </div>
                                <div className="input-group">
                                    <label className="field-label">추가 활동 이미지</label>
                                    <div className="file-upload-wrapper">
                                        <button
                                            type="button"
                                            className="file-upload-btn"
                                            onClick={() => triggerFileUpload('activityUrl')}
                                            disabled={uploading['activityUrl']}
                                        >
                                            <div className="btn-content">
                                                {uploading['activityUrl'] ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                                                <span>{uploading['activityUrl'] ? "업로드 중..." : "추가 활동 이미지 선택"}</span>
                                            </div>
                                        </button>
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            ref={el => fileInputRefs.current['activityUrl'] = el}
                                            onChange={(e) => handleFileChange(e, 'activityUrl')}
                                            accept="image/*"
                                        />
                                    </div>
                                    {renderFilePreviews('activityUrl')}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="input-group">
                                    <label className="field-label">포트폴리오 이미지</label>
                                    <div className="file-upload-wrapper">
                                        <button
                                            type="button"
                                            className="file-upload-btn"
                                            onClick={() => triggerFileUpload('portfolioUrl')}
                                            disabled={uploading['portfolioUrl']}
                                        >
                                            <div className="btn-content">
                                                {uploading['portfolioUrl'] ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                                                <span>{uploading['portfolioUrl'] ? "업로드 중..." : "포트폴리오 이미지 선택"}</span>
                                            </div>
                                        </button>
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            ref={el => fileInputRefs.current['portfolioUrl'] = el}
                                            onChange={(e) => handleFileChange(e, 'portfolioUrl')}
                                            accept="image/*"
                                        />
                                    </div>
                                    {renderFilePreviews('portfolioUrl')}
                                </div>
                                <div className="input-group">
                                    <label className="field-label">정규직 프로필 PDF</label>
                                    <div className="file-upload-wrapper">
                                        <button
                                            type="button"
                                            className="file-upload-btn"
                                            onClick={() => triggerFileUpload('pdfUrl')}
                                            disabled={uploading['pdfUrl']}
                                        >
                                            <div className="btn-content">
                                                {uploading['pdfUrl'] ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                                                <span>{uploading['pdfUrl'] ? "업로드 중..." : "프로필 PDF 선택"}</span>
                                            </div>
                                        </button>
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            ref={el => fileInputRefs.current['pdfUrl'] = el}
                                            onChange={(e) => handleFileChange(e, 'pdfUrl')}
                                            accept=".pdf,image/*"
                                        />
                                    </div>
                                    {renderFilePreviews('pdfUrl')}
                                </div>
                            </>
                        )}
                        <p className="hint-text">
                            * 파일 첨부 시 여러 장을 한 번에 선택할 수 있습니다.
                        </p>
                    </section >

                    <div className="fixed-bottom-cta">
                        <button type="submit" className="save-btn" disabled={saving || Object.values(uploading).some(Boolean)}>
                            {saving 
                                ? "저장 중..." 
                                : Object.values(uploading).some(Boolean) 
                                    ? "업로드 중..." 
                                    : "저장하기"}
                        </button>
                    </div>
                </form >
            </main >

            <style>{`
                .profile-edit-page {
                    min-height: 100vh;
                    background: #f8faff;
                }
                .edit-header {
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
                    transition: background 0.2s;
                }
                .back-btn:active {
                    background: #f1f5f9;
                }
                .header-title {
                    margin: 0 0 0 8px;
                    font-size: 18px;
                    font-weight: 800;
                    color: #1e293b;
                }
                .edit-main {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    padding-bottom: calc(120px + 72px + env(safe-area-inset-bottom));
                }
                .edit-form {
                    display: grid;
                    gap: 20px;
                }
                .edit-section {
                    background: #fff;
                    border-radius: 22px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.01);
                    display: grid;
                    gap: 20px;
                }
                .edit-section.accent {
                    background: linear-gradient(to bottom right, #ffffff, #f5f7ff);
                    border: 1px solid rgba(91, 95, 245, 0.05);
                }
                .section-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 900;
                    color: #5b5ff5;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .input-group {
                    display: grid;
                    gap: 8px;
                }
                .field-label {
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                }
                .edit-input, .edit-textarea {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 18px;
                    border: 1px solid #e2e8f0;
                    background: #f8faff;
                    font-size: 15px;
                    font-weight: 600;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s;
                }
                .edit-input:focus, .edit-textarea:focus {
                    background: #fff;
                    border-color: #5b5ff5;
                    box-shadow: 0 0 0 4px rgba(91, 95, 245, 0.08);
                }
                .file-upload-wrapper {
                    width: 100%;
                }
                .file-upload-btn {
                    width: 100%;
                    padding: 16px;
                    border-radius: 18px;
                    border: 2px dashed #e2e8f0;
                    background: #f8faff;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .file-upload-btn:hover {
                    background: #fff;
                    border-color: #5b5ff5;
                    color: #5b5ff5;
                }
                .file-upload-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .btn-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 700;
                }
                .edit-textarea {
                    min-height: 120px;
                    resize: none;
                    line-height: 1.5;
                }
                .hint-text {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 600;
                    margin-top: -8px;
                }
                .fixed-bottom-cta {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 20px;
                    padding-bottom: calc(20px + env(safe-area-inset-bottom));
                    background: linear-gradient(to top, #fff 80%, rgba(255, 255, 255, 0));
                    max-width: 600px;
                    margin: 0 auto;
                    z-index: 1100;
                }
                .save-btn {
                    width: 100%;
                    height: 56px;
                    border-radius: 18px;
                    border: none;
                    background: #5b5ff5;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(91, 95, 245, 0.2);
                    transition: all 0.2s ease;
                }
                .save-btn:active {
                    transform: scale(0.98);
                }
                .file-previews {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 8px;
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
                .remove-file-btn {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid #e2e8f0;
                    color: #ef4444;
                    display: grid;
                    place-items: center;
                    font-size: 14px;
                    cursor: pointer;
                    z-index: 10;
                }
            `}</style>
        </div >
    );
}
