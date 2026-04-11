import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';
import useDevice from '../hooks/useDevice';

export default function RecentlyViewedJobs() {
    const navigate = useNavigate();
    const { isDesktop } = useDevice();
    const { recentlyViewedJobs, jobs } = usePilaCon();
    
    // In a real app, we'd map recentlyViewedJobs (IDs) to actual job objects
    const viewedJobs = recentlyViewedJobs.map(id => jobs.find(j => j.id === id)).filter(Boolean);

    return (
        <div className="recent-jobs-page">
            <header className="unified-header">
                <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
                    <ICONS.back size={24} color="#1e293b" />
                </button>
                <h2 className="unified-title">최근 본 공고</h2>
                <div style={{ width: 40 }} />
            </header>

            <main className={`content ${isDesktop ? 'desktop' : ''}`}>
                {isDesktop && (
                    <aside className="settings-side-nav">
                        <button className="side-item" onClick={() => navigate('/mypage/favorites')}>즐겨찾기</button>
                        <button className="side-item active">최근 본 공고</button>
                        <button className="side-item" onClick={() => navigate('/mypage/blocked-users')}>차단 사용자</button>
                    </aside>
                )}
                <section className="content-main">
                {viewedJobs.length === 0 ? (
                    <div className="empty-state">
                        <ICONS.clock size={48} color="#e2e8f0" />
                        <p>최근 본 공고가 없습니다.</p>
                    </div>
                ) : (
                    <div className="job-list">
                        {/* Job card items would go here */}
                        <p style={{ textAlign: 'center', color: '#64748b' }}>준비 중인 기능입니다.</p>
                    </div>
                )}
                </section>
            </main>

            <style>{`
                .recent-jobs-page {
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
