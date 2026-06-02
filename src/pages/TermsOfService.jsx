import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

export default function TermsOfService() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/legal/terms`)
      .then(r => r.json())
      .then(data => {
        setContent(data.content || '');
        setUpdatedAt(data.updatedAt || '');
      })
      .catch(() => setContent('이용약관을 불러올 수 없습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1 className="policy-title">이용약관</h1>
        {updatedAt && (
          <div className="policy-meta">
            최종 수정일: {new Date(updatedAt).toLocaleDateString('ko-KR')}
          </div>
        )}
        <div className="policy-content">
          {isLoading ? (
            <p style={{ color: '#94a3b8' }}>불러오는 중...</p>
          ) : (
            <pre className="policy-pre">{content}</pre>
          )}
        </div>
      </div>
      <style>{`
        .policy-page { min-height: 100vh; background: #f8fafc; padding: 24px 16px 60px; }
        .policy-container { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 32px 24px; }
        .policy-title { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
        .policy-meta { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
        .policy-content { border-top: 1px solid #f1f5f9; padding-top: 24px; }
        .policy-pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 14px; line-height: 1.8; color: #334155; }
      `}</style>
    </div>
  );
}
