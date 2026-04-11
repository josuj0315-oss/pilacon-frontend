import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';
import useDevice from '../hooks/useDevice';

export default function BlockedUsers() {
    const navigate = useNavigate();
    const { isDesktop } = useDevice();
    const { blockedUsers, unblockUser } = usePilaCon();

    return (
        <div className="blocked-users-page">
            <header className="unified-header">
                <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
                    <ICONS.back size={24} color="#1e293b" />
                </button>
                <h2 className="unified-title">차단 사용자 관리</h2>
                <div style={{ width: 40 }} />
            </header>

            <main className={`content ${isDesktop ? 'desktop' : ''}`}>
                {isDesktop && (
                    <aside className="settings-side-nav">
                        <button className="side-item" onClick={() => navigate('/mypage/favorites')}>즐겨찾기</button>
                        <button className="side-item" onClick={() => navigate('/mypage/recent-jobs')}>최근 본 공고</button>
                        <button className="side-item active">차단 사용자</button>
                    </aside>
                )}
                <section className="content-main">
                {blockedUsers.length === 0 ? (
                    <div className="empty-state">
                        <ICONS.close size={48} color="#e2e8f0" />
                        <p>차단한 사용자가 없습니다.</p>
                    </div>
                ) : (
                    <div className="user-list">
                        {blockedUsers.map((blockedUser) => (
                            <article key={blockedUser.userId} className="blocked-user-card">
                                <div className="blocked-user-info">
                                    <div className="blocked-user-avatar">
                                        {blockedUser.profileImage ? (
                                            <img src={blockedUser.profileImage} alt={blockedUser.nickname} />
                                        ) : (
                                            <span>{String(blockedUser.nickname || "U").slice(0, 1)}</span>
                                        )}
                                    </div>
                                    <div className="blocked-user-copy">
                                        <strong>{blockedUser.nickname}</strong>
                                        <span>
                                            차단일 {new Date(blockedUser.blockedAt).toLocaleDateString("ko-KR")}
                                        </span>
                                    </div>
                                </div>
                                <button className="unblock-btn" onClick={() => unblockUser(blockedUser.userId)}>
                                    차단 해제
                                </button>
                            </article>
                        ))}
                    </div>
                )}
                </section>
            </main>

            <style>{`
                .blocked-users-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }
                .unified-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: #fff;
                    border-bottom: 1px solid #f0f0f0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .unified-title {
                    font-size: 16px;
                    font-weight: 800;
                    margin: 0;
                    color: #1e293b;
                }
                .back-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .content {
                    padding: 40px 20px;
                }
                .content-main {
                    min-width: 0;
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    color: #94a3b8;
                    margin-top: 100px;
                }
                .user-list {
                    display: grid;
                    gap: 12px;
                }
                .blocked-user-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    border-radius: 14px;
                    padding: 14px 16px;
                }
                .blocked-user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }
                .blocked-user-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    background: #f1f5f9;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #5b5ff5;
                    font-weight: 800;
                }
                .blocked-user-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .blocked-user-copy {
                    min-width: 0;
                    display: grid;
                    gap: 4px;
                }
                .blocked-user-copy strong {
                    font-size: 14px;
                    color: #1e293b;
                }
                .blocked-user-copy span {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 600;
                }
                .unblock-btn {
                    height: 38px;
                    padding: 0 14px;
                    border-radius: 10px;
                    border: 1px solid #dbe2ff;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                @media (min-width: 1200px) {
                    .content.desktop {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
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
                    .content-main {
                        background: #fff;
                        border: 1px solid #e2e8f0;
                        border-radius: 14px;
                        min-height: 420px;
                        padding: 20px;
                    }
                    .empty-state {
                        margin-top: 60px;
                    }
                }
            `}</style>
        </div>
    );
}
