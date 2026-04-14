import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';
import useDevice from '../hooks/useDevice';

export default function AppSettings() {
    const navigate = useNavigate();
    const { isDesktop } = useDevice();
    const { logout } = usePilaCon();

    const settingGroups = [
        {
            title: '고객지원',
            items: [
                { label: '광고/제휴 문의', icon: ICONS.activity, path: '/partnership' },
                { label: '공지사항', icon: ICONS.activity, path: '/notice' },
            ]
        },
        {
            title: '약관 및 정책',
            items: [
                { label: '이용약관', icon: ICONS.activity, path: '/terms' },
                { label: '개인정보 처리방침', icon: ICONS.activity, path: '/privacy' },
            ]
        },
        {
            title: '계정 관리',
            items: [
                { label: '로그아웃', icon: ICONS.activity, action: logout, danger: true },
            ]
        }
    ];

    return (
        <div className="app-settings-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ICONS.chevronLeft size={24} />
                </button>
                <h2 className="unified-title">앱 설정</h2>
                <div style={{ width: 44 }} />
            </header>

            <main className={`settings-content ${isDesktop ? 'desktop' : ''}`}>
                {isDesktop && (
                    <aside className="settings-side-nav">
                        <button className="side-item" onClick={() => navigate('/mypage/notification-settings')}>알림 설정</button>
                        <button className="side-item" onClick={() => navigate('/mypage/notification-settings/custom')}>게시물 맞춤 설정</button>
                        <button className="side-item active">앱 설정</button>
                    </aside>
                )}
                <section className="settings-main">
                {settingGroups.map((group, gIdx) => (
                    <div key={gIdx} className="settings-group">
                        <h3 className="group-title">{group.title}</h3>
                        <div className="group-items">
                            {group.items.map((item, iIdx) => (
                                <button 
                                    key={iIdx} 
                                    className={`setting-item ${item.danger ? 'danger' : ''}`}
                                    onClick={() => {
                                        if (item.action) item.action();
                                        else if (item.path !== '#') navigate(item.path);
                                    }}
                                >
                                    <span className="item-label">{item.label}</span>
                                    {item.label === '앱 버전' ? (
                                        <span className="version-text">1.0.0</span>
                                    ) : (
                                        <ICONS.chevronRight size={18} color="#cbd5e1" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="version-info">
                    <span>앱 버전</span>
                    <span className="version-text">1.0.0</span>
                </div>
                
                <div className="withdraw-info">
                    <button className="withdraw-btn" onClick={() => navigate('#')}>회원탈퇴</button>
                </div>
                </section>
            </main>

            <style>{`
                .app-settings-page {
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
                    color: #1e293b;
                }
                .settings-content {
                    padding: 20px;
                }
                .settings-main {
                    min-width: 0;
                }
                .settings-group {
                    margin-bottom: 24px;
                }
                .group-title {
                    font-size: 13px;
                    font-weight: 800;
                    color: #94a3b8;
                    margin: 0 0 12px 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .group-items {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .setting-item {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 20px;
                    background: none;
                    border: none;
                    border-bottom: 1px solid #f8fafc;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .setting-item:last-child {
                    border-bottom: none;
                }
                .setting-item:active {
                    background: #f8fafc;
                }
                .item-label {
                    font-size: 15px;
                    font-weight: 700;
                    color: #334155;
                }
                .setting-item.danger .item-label {
                    color: #ef4444;
                }
                .version-info {
                    display: flex;
                    justify-content: space-between;
                    padding: 18px 20px;
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 600;
                }
                .version-text {
                    font-weight: 700;
                    color: #cbd5e1;
                }
                .withdraw-info {
                    display: flex;
                    justify-content: center;
                    padding: 24px 20px 40px;
                }
                .withdraw-btn {
                    background: none;
                    border: none;
                    color: #cbd5e1;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: underline;
                    cursor: pointer;
                }
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
