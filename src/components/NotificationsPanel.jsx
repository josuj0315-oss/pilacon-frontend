import React, { useEffect, useState } from 'react';
import { usePilaCon } from '../store/pilaconStore';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants/icons';

export default function NotificationsPanel({ onClose }) {
    const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } = usePilaCon();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await getNotifications();
            setList(data.items);
            setLoading(false);
        };
        fetch();
    }, [getNotifications]);

    const handleRead = async (id, linkUrl) => {
        await markNotificationAsRead(id);
        if (linkUrl) {
            navigate(linkUrl);
            onClose();
        }
    };

    const handleReadAll = async () => {
        await markAllNotificationsAsRead();
        setList(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <div className="notifications-panel-overlay" onClick={onClose}>
            <div className="notifications-panel" onClick={e => e.stopPropagation()}>
                <div className="notifications-header">
                    <h3>알림</h3>
                    <div className="header-btns">
                        <button className="read-all-btn" onClick={handleReadAll}>전체 읽음</button>
                        <button className="close-panel-btn" onClick={onClose}>
                            <ICONS.close size={20} color="#64748b" />
                        </button>
                    </div>
                </div>

                <div className="notifications-body">
                    {loading ? (
                        <div className="notif-empty">로딩 중...</div>
                    ) : list.length === 0 ? (
                        <div className="notif-empty">새로운 알림이 없습니다.</div>
                    ) : (
                        list.map(n => (
                            <div
                                key={n.id}
                                className={`notif-item ${n.isRead ? 'is-read' : 'is-unread'}`}
                                onClick={() => handleRead(n.id, n.linkUrl)}
                            >
                                <div className="notif-content">
                                    <div className="notif-title">{n.title}</div>
                                    <div className="notif-body">{n.body}</div>
                                    <div className="notif-time">{new Date(n.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                {!n.isRead && <div className="unread-dot" />}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
        .notifications-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.2);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          padding-top: 50px;
          padding-right: 10px;
        }
        .notifications-panel {
          width: 320px;
          max-height: 80vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideIn 0.2s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .notifications-header {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notifications-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }
        .header-btns {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .read-all-btn {
          background: none;
          border: none;
          color: #5b5ff5;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .close-panel-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
        }
        .notifications-body {
          flex: 1;
          overflow-y: auto;
        }
        .notif-item {
          padding: 14px 16px;
          border-bottom: 1px solid #f8fafc;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: background 0.1s;
        }
        .notif-item:hover {
          background: #f8fafc;
        }
        .notif-item.is-unread {
          background: #fdf2f2; /* 연한 빨강 또는 파랑으로 강조 가능 */
          background: rgba(91, 95, 245, 0.03);
        }
        .notif-content {
          flex: 1;
        }
        .notif-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2px;
        }
        .notif-body {
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
        }
        .notif-time {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 6px;
        }
        .unread-dot {
          width: 6px;
          height: 6px;
          background: #5b5ff5;
          border-radius: 50%;
          margin-top: 6px;
        }
        .notif-empty {
          padding: 40px 20px;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
        }
      `}</style>
        </div>
    );
}
