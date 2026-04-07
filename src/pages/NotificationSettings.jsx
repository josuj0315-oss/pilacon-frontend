import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';
import useDevice from '../hooks/useDevice';

export default function NotificationSettings() {
    const navigate = useNavigate();
    const { isDesktop } = useDevice();
    const { notificationSettings, updateNotificationSettings } = usePilaCon();

    const { all, posts, applicant, owner, message } = notificationSettings;

    const handleGlobalToggle = () => {
        updateNotificationSettings({ all: !all });
    };

    const handleCategoryToggle = (category) => {
        if (!all) return;
        updateNotificationSettings({
            [category]: { ...notificationSettings[category], on: !notificationSettings[category].on }
        });
    };

    const getPostSummary = () => {
        if (!posts.on) return null;
        const conditions = [];
        if (posts.regions.length > 0) {
            conditions.push(posts.regions[0] + (posts.regions.length > 1 ? ` 외 ${posts.regions.length - 1}` : ''));
        }
        if (posts.workouts.length > 0) {
            conditions.push(posts.workouts.join('/'));
        }
        if (posts.employmentTypes.length > 0) {
            conditions.push(posts.employmentTypes.join('/'));
        }

        if (conditions.length === 0) return "맞춤 알림을 설정해보세요";
        return `${conditions.join(' · ')} 알림 수신 중`;
    };

    return (
        <div className="notification-settings-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ICONS.chevronLeft size={24} />
                </button>
                <h2 className="unified-title">알림 설정</h2>
                <div style={{ width: 44 }} />
            </header>

            <main className={`settings-content ${isDesktop ? 'desktop' : ''}`}>
                {isDesktop && (
                    <aside className="settings-side-nav">
                        <button className="side-item active">알림 설정</button>
                        <button className="side-item" onClick={() => navigate('/mypage/notification-settings/custom')}>게시물 맞춤 설정</button>
                        <button className="side-item" onClick={() => navigate('/mypage/app-settings')}>앱 설정</button>
                    </aside>
                )}
                <section className="settings-main">
                <section className="global-toggle-section">
                    <div className="setting-item main">
                        <div className="setting-info">
                            <span className="setting-label main">전체 알림</span>
                            <p className="setting-desc">모든 푸시 알림을 한 번에 켜고 끌 수 있습니다.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={all} onChange={handleGlobalToggle} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </section>

                <div className={`categories-list ${!all ? 'disabled-ui' : ''}`}>
                    {/* A. 게시물 알림 */}
                    <section className="category-card">
                        <div className="category-header">
                            <div className="setting-info">
                                <span className="category-title">게시물 알림</span>
                                <p className="setting-desc">원하는 지역과 운동 종목의 새 공고를 빠르게 받아보세요.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={posts.on} 
                                    onChange={() => handleCategoryToggle('posts')}
                                    disabled={!all}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        {posts.on && (
                            <button 
                                className="custom-entry-btn" 
                                onClick={() => all && navigate('/mypage/notification-settings/custom')}
                                disabled={!all}
                            >
                                <div className="entry-content">
                                    <span className={`summary-text ${posts.regions.length === 0 && posts.workouts.length === 0 ? 'placeholder' : ''}`}>
                                        {getPostSummary()}
                                    </span>
                                </div>
                                <ICONS.chevronRight size={18} color="#cbd5e1" />
                            </button>
                        )}
                    </section>

                    {/* B. 지원자 알림 */}
                    <section className="category-card">
                        <div className="category-header">
                            <div className="setting-info">
                                <span className="category-title">지원자 알림</span>
                                <p className="setting-desc">내 지원 상태가 바뀌면 알려드려요.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={applicant.on} 
                                    onChange={() => handleCategoryToggle('applicant')}
                                    disabled={!all}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        {applicant.on && (
                            <div className="sub-settings">
                                <div className="sub-setting-item">
                                    <span>열람 알림</span>
                                    <label className="switch small">
                                        <input 
                                            type="checkbox" 
                                            checked={applicant.viewed} 
                                            onChange={() => updateNotificationSettings({ applicant: { ...applicant, viewed: !applicant.viewed }})}
                                            disabled={!all}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="sub-setting-item">
                                    <span>마감 알림</span>
                                    <label className="switch small">
                                        <input 
                                            type="checkbox" 
                                            checked={applicant.deadline} 
                                            onChange={() => updateNotificationSettings({ applicant: { ...applicant, deadline: !applicant.deadline }})}
                                            disabled={!all}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="sub-setting-item">
                                    <span>채용공고/채용확정 관련 알림</span>
                                    <label className="switch small">
                                        <input 
                                            type="checkbox" 
                                            checked={applicant.hire} 
                                            onChange={() => updateNotificationSettings({ applicant: { ...applicant, hire: !applicant.hire }})}
                                            disabled={!all}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* C. 등록자 알림 */}
                    <section className="category-card">
                        <div className="category-header">
                            <div className="setting-info">
                                <span className="category-title">등록자 알림</span>
                                <p className="setting-desc">내가 등록한 공고에 지원이 오면 알려드려요.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={owner.on} 
                                    onChange={() => handleCategoryToggle('owner')}
                                    disabled={!all}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        {owner.on && (
                            <div className="sub-settings">
                                <div className="sub-setting-item">
                                    <span>지원 알림</span>
                                    <label className="switch small">
                                        <input 
                                            type="checkbox" 
                                            checked={owner.apply} 
                                            onChange={() => updateNotificationSettings({ owner: { ...owner, apply: !owner.apply }})}
                                            disabled={!all}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* D. 메시지 알림 */}
                    <section className="category-card">
                        <div className="category-header">
                            <div className="setting-info">
                                <span className="category-title">메시지 알림</span>
                                <p className="setting-desc">새로운 채팅 메시지가 도착하면 알려드려요.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={!!message?.on} 
                                    onChange={() => handleCategoryToggle('message')}
                                    disabled={!all}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </section>
                </div>
                </section>
            </main>

            <style>{`
                .notification-settings-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }
                .page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    height: 56px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                .unified-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
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
                .settings-content {
                    padding: 20px;
                }
                .settings-main {
                    min-width: 0;
                }
                .global-toggle-section {
                    background: #fff;
                    border-radius: 20px;
                    padding: 20px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .setting-item.main {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .setting-label.main {
                    font-size: 17px;
                    font-weight: 800;
                    color: #1e293b;
                    display: block;
                    margin-bottom: 4px;
                }
                .setting-desc {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                    line-height: 1.4;
                }
                .categories-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: opacity 0.3s;
                }
                .categories-list.disabled-ui {
                    opacity: 0.5;
                    pointer-events: none;
                }
                .category-card {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .category-header {
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .category-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1e293b;
                    display: block;
                    margin-bottom: 4px;
                }
                .custom-entry-btn {
                    width: 100%;
                    padding: 16px 20px;
                    background: #f8fafc;
                    border: none;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    text-align: left;
                    cursor: pointer;
                }
                .summary-text {
                    font-size: 14px;
                    font-weight: 600;
                    color: #5b5ff5;
                }
                .summary-text.placeholder {
                    color: #94a3b8;
                }
                .sub-settings {
                    padding: 0 20px 12px;
                    display: flex;
                    flex-direction: column;
                }
                .sub-setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-top: 1px solid #f8fafc;
                    font-size: 14px;
                    font-weight: 600;
                    color: #334155;
                }

                /* Switch Styles */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 28px;
                    flex-shrink: 0;
                }
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
                    height: 20px; width: 20px;
                    left: 4px; bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .switch.small .slider:before {
                    height: 16px; width: 16px;
                    left: 3px; bottom: 3px;
                }
                input:checked + .slider { background-color: #5b5ff5; }
                input:checked + .slider:before { transform: translateX(22px); }
                .switch.small input:checked + .slider:before { transform: translateX(18px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }
                @media (min-width: 1200px) {
                    .settings-content.desktop {
                        max-width: 1200px;
                        margin: 0 auto;
                        display: grid;
                        grid-template-columns: 240px minmax(0, 1fr);
                        gap: 16px;
                        align-items: start;
                    }
                    .settings-side-nav {
                        background: #fff;
                        border: 1px solid #e2e8f0;
                        border-radius: 14px;
                        padding: 10px;
                        position: sticky;
                        top: 84px;
                        display: grid;
                        gap: 8px;
                    }
                    .side-item {
                        width: 100%;
                        height: 40px;
                        border-radius: 10px;
                        border: 1px solid #eef2f7;
                        background: #fff;
                        color: #475569;
                        font-size: 13px;
                        font-weight: 700;
                        cursor: pointer;
                        text-align: left;
                        padding: 0 12px;
                    }
                    .side-item.active {
                        background: #eef2ff;
                        color: #4f46e5;
                        border-color: #c7d2fe;
                    }
                }
            `}</style>
        </div>
    );
}
