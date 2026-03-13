import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';

export default function RecentlyViewedJobs() {
    const navigate = useNavigate();
    const { recentlyViewedJobs, jobs } = usePilaCon();
    
    // In a real app, we'd map recentlyViewedJobs (IDs) to actual job objects
    const viewedJobs = recentlyViewedJobs.map(id => jobs.find(j => j.id === id)).filter(Boolean);

    return (
        <div className="recent-jobs-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ICONS.chevronLeft size={24} />
                </button>
                <h2 className="unified-title">최근 본 공고</h2>
                <div style={{ width: 44 }} />
            </header>

            <main className="content">
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
            </main>

            <style>{`
                .recent-jobs-page {
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
                .content {
                    padding: 40px 20px;
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    color: #94a3b8;
                    margin-top: 100px;
                }
            `}</style>
        </div>
    );
}
