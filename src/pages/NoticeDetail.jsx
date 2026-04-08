import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchNotice } = usePilaCon();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotice = async () => {
      try {
        setLoading(true);
        const data = await fetchNotice(id);
        setNotice(data);
      } catch (err) {
        console.error('Failed to load notice:', err);
        setError(err.response?.data?.message || '공지사항을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadNotice();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="policy-page">
        <div className="policy-container">
          <div className="notice-loading">불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="policy-page">
        <div className="policy-container">
          <div className="notice-error">
            <h2>앗! 문제가 발생했습니다</h2>
            <p>{error || '공지사항이 존재하지 않거나 비공개 상태입니다.'}</p>
            <button className="back-btn" onClick={() => navigate('/notice')}>
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-page">
      <div className="policy-container">
        <div className="notice-header">
          <button className="back-link" onClick={() => navigate('/notice')}>
            &larr; 목록으로
          </button>
          <h1 className="notice-title">{notice.title}</h1>
          <div className="notice-meta">
            <span className="notice-tag">공지</span>
            <span className="notice-date">{formatDate(notice.createdAt)}</span>
          </div>
        </div>

        <div className="notice-content">
          {notice.content}
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
        .notice-header {
          margin-bottom: 40px;
          padding-bottom: 32px;
          border-bottom: 2px solid #f1f5f9;
        }
        .back-link {
          background: none;
          border: none;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .back-link:hover {
          color: #5b5ff5;
        }
        .notice-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 20px;
          line-height: 1.4;
          letter-spacing: -0.02em;
        }
        .notice-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .notice-tag {
          font-size: 12px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
          background: #eef2ff;
          color: #5b5ff5;
        }
        .notice-date {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 500;
        }
        .notice-content {
          font-size: 16px;
          line-height: 1.8;
          color: #334155;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .notice-loading, .notice-error {
          text-align: center;
          padding: 100px 0;
          color: #94a3b8;
          font-weight: 500;
        }
        .notice-error h2 {
          color: #1e293b;
          margin-bottom: 12px;
          font-size: 20px;
          font-weight: 800;
        }
        .notice-error p {
          margin-bottom: 24px;
        }
        .back-btn {
          padding: 12px 24px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .policy-page { padding: 40px 20px 80px; }
          .notice-title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
