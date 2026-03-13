import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';

export default function AppSettings() {
    const navigate = useNavigate();
    const { logout } = usePilaCon();

    const settingGroups = [
        {
            title: '고객지원',
            items: [
                { label: '문의하기', icon: ICONS.activity, path: '#' },
                { label: '공지사항', icon: ICONS.activity, path: '#' },
            ]
        },
        {
            title: '약관 및 정책',
            items: [
                { label: '이용약관', icon: ICONS.activity, path: '#' },
                { label: '개인정보 처리방침', icon: ICONS.activity, path: '#' },
            ]
        },
        {
            title: '계정 관리',
            items: [
                { label: '로그아웃', icon: ICONS.activity, action: logout, danger: true },
                { label: '회원탈퇴', icon: ICONS.activity, path: '#', danger: true },
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

            <main className="settings-content">
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
            `}</style>
        </div>
    );
}
