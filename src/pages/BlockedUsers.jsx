import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';

export default function BlockedUsers() {
    const navigate = useNavigate();
    const { blockedUsers } = usePilaCon();

    return (
        <div className="blocked-users-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ICONS.chevronLeft size={24} />
                </button>
                <h2 className="unified-title">차단 사용자 관리</h2>
                <div style={{ width: 44 }} />
            </header>

            <main className="content">
                {blockedUsers.length === 0 ? (
                    <div className="empty-state">
                        <ICONS.close size={48} color="#e2e8f0" />
                        <p>차단한 사용자가 없습니다.</p>
                    </div>
                ) : (
                    <div className="user-list">
                        <p style={{ textAlign: 'center', color: '#64748b' }}>차단된 사용자 리스트가 표시됩니다.</p>
                    </div>
                )}
            </main>

            <style>{`
                .blocked-users-page {
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
