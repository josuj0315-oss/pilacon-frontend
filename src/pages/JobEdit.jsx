import React, { useEffect, useMemo, useState } from "react";
import "./Write.css";
import { REGION_TABS, REGION_OPTIONS } from "../data/regions";
import { useNavigate, useParams } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import { useCategory } from "../context/CategoryContext";
import { ICONS } from "../constants/icons";
import axios from "axios";
import useDevice from "../hooks/useDevice";

const WORK_TYPES = [
    { id: "sub", label: "대타/급구" },
    { id: "short", label: "단기" },
    { id: "regular", label: "정규직" },
];

const CATEGORY_OPTIONS = ["필라테스", "요가", "헬스트레이너"];
const PAY_DATE_OPTIONS = ["당일", "다음날", "주급", "월급", "직접입력"];
const TIME_OPTIONS = [
    { id: "morning", label: "오전" },
    { id: "afternoon", label: "오후" },
    { id: "all", label: "종일" },
];

const SAVED_CENTERS = [
    {
        id: "center_1",
        name: "필라콘 스튜디오 (저장됨)",
        agencyName: "(주)필라콘컴퍼니",
        address: "서울시 강남구 테헤란로 123 필라콘빌딩 3층",
        phone: "02-123-4567",
        equipment: "리포머, 바렐, 체어, 캐딜락",
    }
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function JobEdit() {
    const { isDesktop } = useDevice();
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateJob, user, showToast } = usePilaCon();
    const titleRef = React.useRef(null);
    const payRef = React.useRef(null);
    const startDateRef = React.useRef(null);
    const endDateRef = React.useRef(null);
    const todayStr = new Date().toISOString().split('T')[0];
    const [errors, setErrors] = useState({});
    const { setCategory: setGlobalCategory } = useCategory();

    const [loading, setLoading] = useState(true);
    const [selectedCenterId, setSelectedCenterId] = useState("");

    const [newPost, setNewPost] = useState({
        category: "필라테스",
        title: "",
        description: "",
        studio: "",
        type: "sub",
        regionTab: REGION_TABS[0],
        location: REGION_OPTIONS[REGION_TABS[0]][0],
        pay: "",
        payDate: "당일",
        taxDeduction: false,
        workDate: "",
        workEndDate: "",
        isToday: false,
        workTime: "morning",
        workTimeNote: "",
        agencyName: "",
        address: "",
        centerPhone: "",
        equipment: "",
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/jobs/${id}`);
                const job = res.data;

                if (!job) {
                    showToast("공고를 찾을 수 없습니다.", "error");
                    navigate("/");
                    return;
                }

                // 권한 체크
                if (user && String(job.userId) !== String(user.id)) {
                    showToast("수정 권한이 없습니다.", "error");
                    navigate(`/jobs/${id}`);
                    return;
                }

                // 데이터 매핑
                const workDate = job.days?.[0] || "";
                const workTime = TIME_OPTIONS.find(o => o.label === job.workTime)?.id || "morning";

                setNewPost({
                    category: job.category,
                    title: job.title,
                    description: job.description || "",
                    studio: job.studio,
                    type: job.type || "sub",
                    regionTab: job.regionTab || REGION_TABS[0],
                    location: job.location || REGION_OPTIONS[REGION_TABS[0]][0],
                    pay: job.pay,
                    payDate: job.payDate || "당일",
                    taxDeduction: job.taxDeduction || false,
                    workDate: job.days?.[0] || "",
                    workEndDate: job.days?.[1] || job.days?.[0] || "",
                    isToday: job.days?.length === 1 && job.days[0] === new Date().toISOString().split('T')[0],
                    workTime: workTime,
                    workTimeNote: job.workTimeNote || "",
                    agencyName: job.companyName || job.studio,
                    address: job.address || "",
                    centerPhone: job.phone || "",
                    equipment: Array.isArray(job.equipment) ? job.equipment.join(", ") : (job.equipment || ""),
                });
            } catch (err) {
                console.error("Failed to fetch job for edit:", err);
                showToast("데이터를 불러오는데 실패했습니다.", "error");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJob();
        }
    }, [id, user, navigate]);

    const goBack = () => {
        navigate(-1);
    };

    const handleCenterChange = (id) => {
        setSelectedCenterId(id);
        if (id === "new") {
            setNewPost(prev => ({
                ...prev,
                studio: "",
                agencyName: "",
                address: "",
                centerPhone: "",
                equipment: "",
            }));
        } else if (id) {
            const center = SAVED_CENTERS.find(c => c.id === id);
            if (center) {
                setNewPost(prev => ({
                    ...prev,
                    studio: center.name,
                    agencyName: center.agencyName,
                    address: center.address,
                    centerPhone: center.phone,
                    equipment: center.equipment,
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!newPost.title.trim()) newErrors.title = "공고 제목을 입력해주세요.";
        
        const payNumber = Number(String(newPost.pay ?? "").replace(/\D/g, ""));
        if (!payNumber) newErrors.pay = "급여를 입력해주세요.";
        
        if (!newPost.workDate) newErrors.workDate = "날짜를 선택해주세요.";
        if (!newPost.isToday && !newPost.workEndDate) newErrors.workEndDate = "기본 종료 날짜를 선택해주세요.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast("입력되지 않은 필수 항목이 있습니다.", "error");
            
            if (newErrors.title) titleRef.current?.focus();
            else if (newErrors.pay) payRef.current?.focus();
            else if (newErrors.workDate) startDateRef.current?.focus();
            else if (newErrors.workEndDate) endDateRef.current?.focus();
            return;
        }
        
        setErrors({});

        const payload = {
            title: newPost.title,
            description: newPost.description,
            category: newPost.category,
            type: newPost.type,
            location: newPost.location,
            regionTab: newPost.regionTab,
            pay: String(payNumber),
            payDate: newPost.payDate,
            taxDeduction: newPost.taxDeduction === true || newPost.taxDeduction === "true",
            studio: newPost.studio,
            companyName: newPost.agencyName || newPost.studio,
            address: newPost.address,
            phone: newPost.centerPhone,
            equipment: newPost.equipment ? (Array.isArray(newPost.equipment) ? newPost.equipment : newPost.equipment.split(',').map(s => s.trim()).filter(Boolean)) : [],
            workTime: TIME_OPTIONS.find(o => o.id === newPost.workTime)?.label || "오전",
            workTimeNote: newPost.workTimeNote,
            days: newPost.isToday ? [newPost.workDate] : [newPost.workDate, newPost.workEndDate].filter(Boolean),
            time: `${TIME_OPTIONS.find(o => o.id === newPost.workTime)?.label || "오전"}${newPost.workTimeNote ? ` (${newPost.workTimeNote})` : ""}`,
        };

        const result = await updateJob(id, payload);

        if (result.ok) {
            showToast("공고가 수정되었습니다!", "success");
            navigate(`/jobs/${id}`);
        } else {
            showToast("공고 수정에 실패했습니다. " + (result.error?.response?.data?.message || ""), "error");
        }
    };

    const isSubmitDisabled =
        !newPost.category ||
        !newPost.title.trim() ||
        !newPost.studio.trim() ||
        !newPost.type ||
        !newPost.workDate ||
        (!newPost.isToday && !newPost.workEndDate) ||
        !newPost.workTime ||
        !newPost.pay;

    const displayDate = newPost.workDate ? newPost.workDate.replace(/-/g, '.') : "";
    const displayEndDate = newPost.workEndDate ? newPost.workEndDate.replace(/-/g, '.') : "";
    const workTypeLabel = WORK_TYPES.find((t) => t.id === newPost.type)?.label || "-";
    const summaryDateText = newPost.isToday
        ? `${displayDate || "오늘"} (당일)`
        : (displayDate && displayEndDate ? `${displayDate} ~ ${displayEndDate}` : "미입력");
    const summaryTimeText = `${TIME_OPTIONS.find((o) => o.id === newPost.workTime)?.label || "-"}${newPost.workTimeNote ? ` (${newPost.workTimeNote})` : ""}`;
    const summaryPayText = newPost.pay ? `${Number(String(newPost.pay).replace(/\D/g, "")).toLocaleString()}원` : "미입력";

    // 당일 체크박스 핸들러
    const handleTodayChange = (checked) => {
        if (checked) {
            const today = new Date().toISOString().split('T')[0];
            setNewPost(prev => ({
                ...prev,
                isToday: true,
                workDate: today,
                workEndDate: today
            }));
        } else {
            setNewPost(prev => ({
                ...prev,
                isToday: false,
                workDate: "",
                workEndDate: ""
            }));
        }
    };

    // 시작일 변경 시 종료일 체크
    const handleStartDateChange = (val) => {
        setNewPost(prev => {
            const next = { ...prev, workDate: val };
            if (prev.workEndDate && val > prev.workEndDate) {
                next.workEndDate = val;
            }
            return next;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="w-8 h-8 border-4 border-[#5b5ff5] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="write-container">
            <header className="write-header">
                <div className="header-left">
                    <button type="button" className="back-btn" onClick={goBack}>
                        <ICONS.back size={22} />
                    </button>
                </div>
                <h1>공고 수정하기</h1>
                <div className="header-right" style={{ width: '40px' }}></div>
            </header>

            <div className="write-scroll-area">
                <div className={`write-desktop-layout ${isDesktop ? "desktop" : ""}`}>
                <form className="write-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="field">
                            <label className="label">직군 <span className="required">*</span></label>
                            <select
                                className="select"
                                value={newPost.category}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setNewPost((prev) => ({ ...prev, category: next }));
                                }}
                            >
                                {CATEGORY_OPTIONS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`field ${errors.title ? 'shake' : ''}`}>
                            <label className="label">공고 제목 <span className="required">*</span></label>
                            <input
                                ref={titleRef}
                                type="text"
                                placeholder="예: XX필라테스 내일 대강 급하게 구합니다"
                                className={`input ${errors.title ? 'field-error' : ''}`}
                                value={newPost.title}
                                onChange={(e) => {
                                    setNewPost({ ...newPost, title: e.target.value });
                                    if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                                }}
                            />
                            {errors.title && <p className="field-caption" style={{ color: '#ef4444' }}>{errors.title}</p>}
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="field">
                            <label className="label">근무 형태 <span className="required">*</span></label>
                            <select
                                className="select"
                                value={newPost.type}
                                onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                            >
                                {WORK_TYPES.map((t) => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <div className="label-with-action">
                                <label className="label">날짜 선택 <span className="required">*</span></label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={newPost.isToday}
                                        onChange={(e) => handleTodayChange(e.target.checked)}
                                    />
                                    <span>당일</span>
                                </label>
                            </div>
                            <div className="date-range-grid">
                                <div
                                    className={`date-input-wrapper ${newPost.isToday ? 'disabled' : ''} ${errors.workDate ? 'field-error' : ''} ${errors.workDate ? 'shake' : ''}`}
                                    onClick={() => !newPost.isToday && startDateRef.current?.showPicker()}
                                >
                                    <div className="date-display" data-placeholder="시작일">
                                        {displayDate}
                                    </div>
                                    <input
                                        ref={startDateRef}
                                        type="date"
                                        className="real-date-input"
                                        value={newPost.workDate}
                                        onChange={(e) => {
                                            handleStartDateChange(e.target.value);
                                            if (errors.workDate) setErrors(prev => ({ ...prev, workDate: null }));
                                        }}
                                        disabled={newPost.isToday}
                                        min={todayStr}
                                    />
                                </div>
                                <span className="date-separator">~</span>
                                <div
                                    className={`date-input-wrapper ${(newPost.isToday || !newPost.workDate) ? 'disabled' : ''} ${errors.workEndDate ? 'field-error' : ''} ${errors.workEndDate ? 'shake' : ''}`}
                                    onClick={() => !(newPost.isToday || !newPost.workDate) && endDateRef.current?.showPicker()}
                                >
                                    <div className="date-display" data-placeholder="종료일">
                                        {displayEndDate}
                                    </div>
                                    <input
                                        ref={endDateRef}
                                        type="date"
                                        className="real-date-input"
                                        value={newPost.workEndDate}
                                        onChange={(e) => {
                                            setNewPost({ ...newPost, workEndDate: e.target.value });
                                            if (errors.workEndDate) setErrors(prev => ({ ...prev, workEndDate: null }));
                                        }}
                                        disabled={newPost.isToday || !newPost.workDate}
                                        min={newPost.workDate || todayStr}
                                    />
                                </div>
                            </div>
                            {(errors.workDate || errors.workEndDate) && (
                                <p className="field-caption" style={{ color: '#ef4444' }}>
                                    {errors.workDate || errors.workEndDate}
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <label className="label">시간 <span className="required">*</span></label>
                            <div className="time-grid">
                                <div className="segment-wrap">
                                    {TIME_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={`segment-btn ${newPost.workTime === opt.id ? 'active' : ''}`}
                                            onClick={() => setNewPost({ ...newPost, workTime: opt.id })}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className="time-note-input"
                                    placeholder="예: 6~8, 3타임"
                                    value={newPost.workTimeNote}
                                    onChange={(e) => setNewPost({ ...newPost, workTimeNote: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className={`field ${errors.pay ? 'shake' : ''}`}>
                            <label className="label">급여 <span className="required">*</span></label>
                            <input
                                ref={payRef}
                                className={`input ${errors.pay ? 'field-error' : ''}`}
                                type="text"
                                inputMode="numeric"
                                placeholder="예: 30000"
                                value={newPost.pay ?? ""}
                                onChange={(e) => {
                                    const onlyNumber = e.target.value.replace(/\D/g, "");
                                    setNewPost({ ...newPost, pay: onlyNumber });
                                    if (errors.pay) setErrors(prev => ({ ...prev, pay: null }));
                                }}
                            />
                            {errors.pay && <p className="field-caption" style={{ color: '#ef4444' }}>{errors.pay}</p>}
                        </div>

                        <div className="grid2">
                            <div className="field">
                                <label className="label">입금일</label>
                                <select
                                    className="select"
                                    value={newPost.payDate}
                                    onChange={(e) => setNewPost({ ...newPost, payDate: e.target.value })}
                                >
                                    {PAY_DATE_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field toggle-field">
                                <label className="label">3.3% 세금 공제</label>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={newPost.taxDeduction}
                                        onChange={(e) => setNewPost({ ...newPost, taxDeduction: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="field">
                            <label className="label">센터 선택</label>
                            <select
                                className="select"
                                value={selectedCenterId}
                                onChange={(e) => handleCenterChange(e.target.value)}
                            >
                                <option value="">센터를 선택해주세요</option>
                                {SAVED_CENTERS.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                                <option value="new">새 센터 등록하기 +</option>
                            </select>
                        </div>

                        <div className="center-detail-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                            <div className="field">
                                <label className="label">센터명 <span className="required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="예: XX필라테스 강남점"
                                    className="input"
                                    value={newPost.studio}
                                    onChange={(e) => setNewPost({ ...newPost, studio: e.target.value, agencyName: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label className="label">업체명(사업자명)</label>
                                <input
                                    type="text"
                                    placeholder="예: (주)필라콘컴퍼니"
                                    className="input"
                                    value={newPost.agencyName}
                                    onChange={(e) => setNewPost({ ...newPost, agencyName: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label className="label">상세 주소</label>
                                <input
                                    type="text"
                                    placeholder="예: 서울시 강남구 테헤란로 123"
                                    className="input"
                                    value={newPost.address}
                                    onChange={(e) => setNewPost({ ...newPost, address: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label className="label">센터 전화번호</label>
                                <input
                                    type="text"
                                    placeholder="예: 02-123-4567"
                                    className="input"
                                    value={newPost.centerPhone}
                                    onChange={(e) => setNewPost({ ...newPost, centerPhone: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label className="label">사용기구</label>
                                <input
                                    type="text"
                                    placeholder="예: 리포머, 바렐, 체어"
                                    className="input"
                                    value={newPost.equipment}
                                    onChange={(e) => setNewPost({ ...newPost, equipment: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="field">
                            <label className="label">상세 내용</label>
                            <textarea
                                className="textarea"
                                placeholder="강사님들께 전할 상세 내용을 적어주세요."
                                value={newPost.description}
                                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                            />
                        </div>
                    </div>
                </form>

                {isDesktop && (
                    <aside className="write-side-summary">
                        <h3>수정 미리보기</h3>
                        <div className="summary-title">{newPost.title || "공고 제목을 입력해주세요"}</div>
                        <div className="summary-list">
                            <div><span>직군</span><strong>{newPost.category || "-"}</strong></div>
                            <div><span>근무 형태</span><strong>{workTypeLabel}</strong></div>
                            <div><span>근무 날짜</span><strong>{summaryDateText}</strong></div>
                            <div><span>근무 시간</span><strong>{summaryTimeText}</strong></div>
                            <div><span>근무 지역</span><strong>{newPost.location || newPost.address || "미입력"}</strong></div>
                            <div><span>급여</span><strong>{summaryPayText}</strong></div>
                            <div><span>센터명</span><strong>{newPost.studio || "미입력"}</strong></div>
                        </div>
                        <p className="summary-note">수정값이 우측 패널에 즉시 반영됩니다.</p>
                    </aside>
                )}
                </div>
            </div>

            <div className="write-cta-area">
                <button
                    className="submit-btn"
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                >
                    수정 완료하기
                </button>
            </div>
        </div>
    );
}
