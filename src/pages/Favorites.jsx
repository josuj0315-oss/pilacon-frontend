import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';
import JobCard from '../components/JobCard';
import useDevice from '../hooks/useDevice';

export default function Favorites() {
    const navigate = useNavigate();
    const { isDesktop } = useDevice();
    const { favorites, isFavorited, toggleFavorite, loading } = usePilaCon();

    const handleBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="favorites-page">
      {isDesktop ? (
        <header className="unified-header">
          <button className="back-btn-pc" onClick={handleBack}>
            <ICONS.back size={24} color="#1e293b" />
          </button>
          <h2 className="unified-title">즐겨찾기</h2>
          <div style={{ width: 40 }} />
        </header>
      ) : (
        <header className="manager-header">
          <button className="back-btn" onClick={handleBack}>
            <ICONS.back size={24} color="#1e293b" />
          </button>
          <h1 className="header-title">즐겨찾기</h1>
        </header>
      )}

            <main className={`favorites-content ${isDesktop ? 'desktop' : ''}`} style={{ padding: '20px' }}>
                {isDesktop && (
                    <aside className="settings-side-nav">
                        <button className="side-item active">즐겨찾기</button>
                        <button className="side-item" onClick={() => navigate('/mypage/recent-jobs')}>최근 본 공고</button>
                        <button className="side-item" onClick={() => navigate('/mypage/blocked-users')}>차단 사용자</button>
                    </aside>
                )}
                <section className="favorites-main">
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
                </section>
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
        .back-btn-pc {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .unified-title {
          font-size: 16px;
          font-weight: 800;
          margin: 0;
          color: #1e293b;
        }
        .manager-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          height: 56px;
        }
        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: transparent;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .header-title {
          margin: 0 0 0 8px;
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
        }
        .favorites-main {
          min-width: 0;
        }
        @media (min-width: 1200px) {
          .favorites-content.desktop {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 240px minmax(0, 1fr);
            gap: 16px;
            align-items: start;
            padding: 20px !important;
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
          .favorites-main {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 16px;
            min-height: 480px;
          }
        }
      `}</style>
        </div>
    );
}
