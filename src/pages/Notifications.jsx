import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';

const TABS = [
    { id: 'all', label: '전체' },
    { id: 'application', label: '지원' },
    { id: 'job', label: '공고' },
    { id: 'system', label: '알림' },
];

export default function Notifications() {
    const {
        getNotifications,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadCount,
        showToast,
        confirm
    } = usePilaCon();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            await getNotifications();
            setLoading(false);
        };
        fetch();
    }, []);

    const filteredList = useMemo(() => {
        if (activeTab === 'all') return notifications;

        return notifications.filter(n => {
            const type = n.type || '';
            const resourceType = (n.resourceType || '').toLowerCase();

            if (activeTab === 'application') {
                return resourceType === 'application' || type.includes('APPLY') || type.includes('APPLICATION');
            }
            if (activeTab === 'job') {
                return resourceType === 'job' || type.includes('JOB') || type.includes('FAVORITE');
            }
            if (activeTab === 'system') {
                return !['application', 'chat', 'job'].some(key => resourceType.includes(key) || type.includes(key.toUpperCase()));
            }
            return true;
        });
    }, [notifications, activeTab]);

    const handleRead = async (id, deepLink) => {
        await markNotificationAsRead(id);
        if (deepLink) {
            navigate(deepLink);
        }
    };

    const handleReadAll = async () => {
        const ok = await confirm('알림 전체 읽음', '모든 알림을 읽음 처리하시겠습니까?');
        if (ok) {
            await markAllNotificationsAsRead();
            showToast("모든 알림을 읽음 처리했습니다.", "success");
        }
    };

    const getTimeLabel = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        const sec = Math.floor(diff / 1000);
        if (sec < 60) return '방금 전';

        const min = Math.floor(sec / 60);
        if (min < 60) return `${min}분 전`;

        const hour = Math.floor(min / 60);
        if (hour < 24) return `${hour}시간 전`;

        const day = Math.floor(hour / 24);
        if (day < 7) return `${day}일 전`;

        return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    };

    const getIcon = (item) => {
        const type = item.type || '';
        const resType = (item.resourceType || '').toLowerCase();

        if (resType === 'application' || type.includes('APPLY')) return <ICONS.move size={20} />;
        if (resType === 'job' || type.includes('JOB')) return <ICONS.briefcase size={20} />;

        return <ICONS.notification size={20} />;
    };

    return (
        <div className="notifications-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ICONS.chevronLeft size={24} />
                </button>
                <h2 className="unified-title">알림</h2>
                <div style={{ width: 44 }} /> {/* Balance */}
            </header>

            <div className="notifications-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="notifications-content">
                {loading ? (
                    <div className="notif-placeholder">알림을 불러오는 중...</div>
                ) : filteredList.length === 0 ? (
                    <div className="notif-placeholder">
                        <ICONS.notification size={48} color="#e2e8f0" style={{ marginBottom: 12 }} />
                        <p>새로운 알림이 없습니다.</p>
                    </div>
                ) : (
                    <div className="notif-list">
                        {filteredList.map(n => (
                            <div
                                key={n.id}
                                className={`notif-card ${n.isRead ? 'read' : 'unread'}`}
                                onClick={() => handleRead(n.id, n.deepLink)}
                            >
                                <div className={`notif-icon-box ${n.resourceType?.toLowerCase() || 'system'}`}>
                                    {getIcon(n)}
                                </div>
                                <div className="notif-details">
                                    <div className="notif-top">
                                        <span className="notif-title">{n.title}</span>
                                        <span className="notif-time">{getTimeLabel(n.createdAt)}</span>
                                    </div>
                                    <p className="notif-body">{n.body}</p>
                                </div>
                                {!n.isRead && <div className="unread-dot" />}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {unreadCount > 0 && (
                <div className="notifications-footer">
                    <button className="read-all-action" onClick={handleReadAll}>
                        모든 알림 읽음 처리
                    </button>
                </div>
            )}

            <style>{`
        .notifications-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #fff;
          max-width: 600px;
          margin: 0 auto;
          position: relative;
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

        .notifications-tabs {
          display: flex;
          padding: 4px 16px;
          gap: 12px;
          overflow-x: auto;
          background: #fff;
          border-bottom: 1px solid #f8fafc;
          scrollbar-width: none;
        }

        .notifications-tabs::-webkit-scrollbar {
          display: none;
        }

        .tab-item {
          padding: 12px 4px;
          font-size: 15px;
          font-weight: 600;
          color: #94a3b8;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .tab-item.active {
          color: #5b5ff5;
          border-bottom-color: #5b5ff5;
        }

        .notifications-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 0;
        }

        .notif-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94a3b8;
          font-weight: 500;
        }

        .notif-list {
          display: flex;
          flex-direction: column;
        }

        .notif-card {
          display: flex;
          padding: 16px 20px;
          gap: 16px;
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
          border-bottom: 1px solid #f8fafc;
        }

        .notif-card:active {
          background: #f8fafc;
        }

        .notif-card.unread {
          background: rgba(91, 95, 245, 0.02);
        }

        .notif-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-icon-box.application { background: #eff6ff; color: #3b82f6; }
        .notif-icon-box.chat { background: #f0fdf4; color: #22c55e; }
        .notif-icon-box.job { background: #fff7ed; color: #f97316; }
        .notif-icon-box.system { background: #f8fafc; color: #64748b; }

        .notif-details {
          flex: 1;
        }

        .notif-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }

        .notif-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }

        .notif-time {
          font-size: 11px;
          color: #94a3b8;
        }

        .notif-body {
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .unread-dot {
          width: 6px;
          height: 6px;
          background: #5b5ff5;
          border-radius: 50%;
          position: absolute;
          right: 20px;
          top: 48px;
        }

        .notifications-footer {
          padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
          border-top: 1px solid #f1f5f9;
          background: #fff;
        }

        .read-all-action {
          width: 100%;
          height: 52px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .read-all-action:active {
          background: #f1f5f9;
        }
      `}</style>
        </div>
    );
}
