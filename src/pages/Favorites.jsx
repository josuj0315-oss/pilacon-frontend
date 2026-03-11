import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';
import JobCard from '../components/JobCard';

export default function Favorites() {
    const navigate = useNavigate();
    const { favorites, isFavorited, toggleFavorite, loading } = usePilaCon();

    const handleBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="favorites-page">
            <header className="unified-header">
                <button className="back-btn" onClick={handleBack} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
                    <ICONS.back size={24} color="#1e293b" />
                </button>
                <h2 className="unified-title">즐겨찾기</h2>
                <div style={{ width: 40 }} />
            </header>

            <main className="favorites-content" style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                        불러오는 중...
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="empty-state" style={{ padding: '100px 20px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px', background: '#f8fafc', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <ICONS.star size={48} color="#cbd5e1" strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>즐겨찾기한 게시물이 없습니다</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>마음에 드는 공고를 찾아 즐겨찾기 해보세요!</p>
                        <button
                            onClick={handleGoHome}
                            style={{
                                padding: '14px 32px',
                                background: '#5b5ff5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '16px',
                                fontWeight: 800,
                                fontSize: '15px',
                                cursor: 'pointer'
                            }}
                        >
                            홈으로 이동
                        </button>
                    </div>
                ) : (
                    <div className="favorites-list" style={{ display: 'grid', gap: '16px' }}>
                        {favorites.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                showFavorite={true}
                                isFavorited={isFavorited(job.id)}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </main>

            <style>{`
        .favorites-page {
          min-height: 100vh;
          background: #f7f9fc;
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
      `}</style>
        </div>
    );
}
