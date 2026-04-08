import React, { useState, useEffect } from 'react';
import { usePilaCon } from '../store/pilaconStore';
import { useNavigate } from 'react-router-dom';

export default function Notice() {
  const { fetchNotices } = usePilaCon();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await fetchNotices();
        setNotices(data);
      } finally {
        setLoading(false);
      }
    };
    loadNotices();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1 className="policy-title">공지사항</h1>
        
        <div className="policy-content">
          {loading ? (
            <div className="notice-loading">불러오는 중...</div>
          ) : notices.length > 0 ? (
            <div className="notice-list">
              {notices.map((notice) => (
                <div 
                  key={notice.id} 
                  className="notice-item"
                  onClick={() => navigate(`/notice/${notice.id}`)}
                >
                  <div className="notice-item-left">
                    <span className="notice-tag">공지</span>
                    <h3 className="notice-item-title">{notice.title}</h3>
                  </div>
                  <span className="notice-item-date">{formatDate(notice.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="notice-empty">
              <div className="empty-icon">📢</div>
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .policy-page {
          background: #fff;
          min-height: 100vh;
          padding: 60px 24px 100px;
        }
        .policy-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .policy-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f1f5f9;
          letter-spacing: -0.02em;
        }
        .notice-list {
          display: flex;
          flex-direction: column;
        }
        .notice-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 8px;
          border-bottom: 1px solid #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
        }
        .notice-item:hover {
          background: #fbfcfe;
          padding-left: 16px;
        }
        .notice-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .notice-tag {
          font-size: 12px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #64748b;
        }
        .notice-item-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
        .notice-item-date {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 500;
        }
        .notice-loading, .notice-empty {
          text-align: center;
          padding: 60px 0;
          color: #94a3b8;
          font-weight: 500;
        }
        .empty-icon {
          font-size: 40px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        @media (max-width: 768px) {
          .policy-page { padding: 40px 20px 80px; }
          .policy-title { font-size: 22px; margin-bottom: 30px; }
          .notice-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 20px 0;
          }
          .notice-item:hover {
            padding-left: 0;
            background: #fff;
          }
          .notice-item-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .notice-item-date {
            padding-left: 0;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
