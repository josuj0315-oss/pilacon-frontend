import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';
import RegionFilterSheet from '../components/RegionFilterSheet';

const WORKOUT_OPTIONS = ["필라테스", "요가", "PT", "기타"];
const EMPLOYMENT_OPTIONS = ["대타", "단기", "정규직"];

export default function NotificationCustomSettings() {
    const navigate = useNavigate();
    const { notificationSettings, updateNotificationSettings } = usePilaCon();
    const { posts } = notificationSettings;

    const [showRegionSheet, setShowRegionSheet] = useState(false);

    const toggleWorkout = (type) => {
        const next = posts.workouts.includes(type)
            ? posts.workouts.filter(w => w !== type)
            : [...posts.workouts, type];
        updateNotificationSettings({ posts: { ...posts, workouts: next } });
    };

    const toggleEmployment = (type) => {
        const next = posts.employmentTypes.includes(type)
            ? posts.employmentTypes.filter(e => e !== type)
            : [...posts.employmentTypes, type];
        updateNotificationSettings({ posts: { ...posts, employmentTypes: next } });
    };

    const toggleEvent = (key) => {
        updateNotificationSettings({ posts: { ...posts, [key]: !posts[key] } });
    };

    const removeRegion = (region) => {
        const next = posts.regions.filter(r => r !== region);
        updateNotificationSettings({ posts: { ...posts, regions: next } });
    };

    return (
        <div className="custom-settings-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ICONS.chevronLeft size={24} />
                </button>
                <h2 className="unified-title">게시물 맞춤 설정</h2>
                <div style={{ width: 44 }} />
            </header>

            <main className="custom-content">
                <section className="guide-section">
                    <p className="guide-text">
                        받고 싶은 공고의 조건을 설정해주세요.<br/>
                        조건이 하나도 없으면 알림이 가지 않아요.
                    </p>
                </section>

                {/* 1. 지역 설정 */}
                <section className="setting-block">
                    <div className="block-header">
                        <h3 className="block-title">지역 설정</h3>
                        <button className="add-btn" onClick={() => setShowRegionSheet(true)}>추가</button>
                    </div>
                    <div className="tag-list">
                        {posts.regions.length === 0 ? (
                            <p className="empty-msg">선택된 지역이 없습니다.</p>
                        ) : (
                            posts.regions.map(r => (
                                <div key={r} className="tag">
                                    <span>{r}</span>
                                    <button className="tag-del" onClick={() => removeRegion(r)}>✕</button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 2. 운동 설정 */}
                <section className="setting-block">
                    <h3 className="block-title">운동 설정</h3>
                    <div className="chip-list">
                        {WORKOUT_OPTIONS.map(opt => {
                            const active = posts.workouts.includes(opt);
                            return (
                                <button 
                                    key={opt} 
                                    className={`chip ${active ? 'active' : ''}`}
                                    onClick={() => toggleWorkout(opt)}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 3. 고용형태 설정 */}
                <section className="setting-block">
                    <h3 className="block-title">고용형태 설정</h3>
                    <div className="chip-list">
                        {EMPLOYMENT_OPTIONS.map(opt => {
                            const active = posts.employmentTypes.includes(opt);
                            return (
                                <button 
                                    key={opt} 
                                    className={`chip ${active ? 'active' : ''}`}
                                    onClick={() => toggleEmployment(opt)}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 4. 알림 항목 */}
                <section className="setting-block">
                    <h3 className="block-title">알림 항목</h3>
                    <div className="check-list">
                        <div className="check-item">
                            <span>새 공고 알림</span>
                            <label className="switch small">
                                <input type="checkbox" checked={posts.newPost} onChange={() => toggleEvent('newPost')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="check-item">
                            <span>마감 임박 알림</span>
                            <label className="switch small">
                                <input type="checkbox" checked={posts.deadline} onChange={() => toggleEvent('deadline')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="check-item">
                            <span>모집 완료 알림</span>
                            <label className="switch small">
                                <input type="checkbox" checked={posts.closed} onChange={() => toggleEvent('closed')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </section>

                <div className="save-action">
                    <button className="primary-btn" onClick={() => navigate(-1)}>설정 완료</button>
                </div>
            </main>

            {showRegionSheet && (
                <RegionFilterSheet
                    initialRegions={posts.regions}
                    onApply={(regions) => updateNotificationSettings({ posts: { ...posts, regions } })}
                    onClose={() => setShowRegionSheet(false)}
                    title="지역 추가"
                    includeTabName={true}
                />
            )}

            <style>{`
                .custom-settings-page {
                    min-height: 100vh;
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                }
                .page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    height: 56px;
                    background: #fff;
                    border-bottom: 1px solid #f1f5f9;
                }
                .back-btn {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                }
                .custom-content {
                    flex: 1;
                    padding: 24px 20px;
                    overflow-y: auto;
                }
                .guide-section {
                    margin-bottom: 32px;
                }
                .guide-text {
                    font-size: 15px;
                    font-weight: 600;
                    color: #64748b;
                    line-height: 1.6;
                }
                .setting-block {
                    margin-bottom: 32px;
                }
                .block-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .block-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 12px;
                }
                .block-header .block-title {
                    margin-bottom: 0;
                }
                .add-btn {
                    font-size: 14px;
                    font-weight: 700;
                    color: #5b5ff5;
                    background: none;
                    border: none;
                }
                .tag-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    min-height: 40px;
                }
                .tag {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                }
                .tag-del {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    padding: 0;
                    font-size: 10px;
                }
                .empty-msg {
                    font-size: 14px;
                    color: #cbd5e1;
                    font-weight: 600;
                }
                .chip-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .chip {
                    padding: 12px 20px;
                    border-radius: 14px;
                    border: 1.5px solid #f1f5f9;
                    background: #fff;
                    font-size: 14px;
                    font-weight: 700;
                    color: #64748b;
                    transition: all 0.2s;
                }
                .chip.active {
                    border-color: #5b5ff5;
                    background: rgba(91, 95, 245, 0.05);
                    color: #5b5ff5;
                }
                .check-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .check-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    font-size: 15px;
                    font-weight: 600;
                    color: #334155;
                }
                .save-action {
                    margin-top: 20px;
                    padding-bottom: 40px;
                }
                .primary-btn {
                    width: 100%;
                    height: 56px;
                    background: #1e293b;
                    color: #fff;
                    border: none;
                    border-radius: 18px;
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                }

                /* Switch Styles */
                .switch.small {
                    width: 40px;
                    height: 22px;
                }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #e2e8f0;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px; width: 16px;
                    left: 3px; bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                input:checked + .slider { background-color: #5b5ff5; }
                input:checked + .slider:before { transform: translateX(18px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }
            `}</style>
        </div>
    );
}
