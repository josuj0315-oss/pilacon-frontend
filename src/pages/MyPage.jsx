import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS, ICON_CONFIG } from '../constants/icons';

export default function MyPage() {
  const { user, logout, favorites } = usePilaCon();
  const navigate = useNavigate();

  const menuItems = [
    { label: '강사 이력서 등록 및 관리', icon: ICONS.profile, path: '/profile/edit' },
    { label: '센터 관리', icon: ICONS.studio || ICONS.activity, path: '/profile/centers' },
    { label: '즐겨찾기', icon: ICONS.star || ICONS.heart || ICONS.activity, path: '/mypage/favorites' },
    { label: '알림 설정', icon: ICONS.notification, path: '#' },
    { label: '앱 설정', icon: ICONS.settings, path: '#' },
  ];

  return (
    <div className="page my-page" style={{ padding: 0 }}>

      <header className="unified-header">
        <h1 className="unified-title">내 정보</h1>
        <div className="unified-header-actions">
          <button className="icon-btn" style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px' }}>
            <ICONS.settings size={20} color="#475569" />
          </button>
        </div>
      </header>

      <div style={{ padding: '24px 20px' }}>

        <section className="profile-card card">
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="profile-img" />
                ) : (
                  <ICONS.profile size={48} color={ICON_CONFIG.color.active} />
                )}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{user?.nickname || user?.name || '사용자'}</h2>
                <p className="profile-email">{user?.email || '이메일 정보 없음'}</p>
              </div>
            </div>
            <button className="profile-edit-badge" onClick={() => navigate('/mypage/profile/edit')}>
              프로필 수정
            </button>
          </div>
        </section>

        <div className="menu-list">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button key={idx} className="menu-button" onClick={() => item.path !== '#' && navigate(item.path)}>
                <div className="menu-left">
                  <Icon size={20} color="#64748b" strokeWidth={2} />
                  <span className="menu-label">{item.label}</span>
                </div>
                <ICONS.chevronRight size={18} color="#cbd5e1" />
              </button>
            );
          })}
        </div>



        <button className="logout-button" onClick={logout}>로그아웃</button>
      </div>

      <style>{`
        .my-page {
          background: #f7f9fc;
        }
        .profile-card {
          margin-bottom: 24px;
          padding: 20px;
        }
        .profile-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 22px;
          background: #eef2ff;
          display: grid;
          place-items: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-name {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 4px;
          color: #1e293b;
        }
        .profile-email {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }
        .profile-edit-badge {
          padding: 10px 14px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .menu-list {
          display: grid;
          gap: 12px;
          margin-bottom: 32px;
        }
        .menu-button {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 18px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .menu-button:active {
          transform: scale(0.98);
        }
        .menu-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .menu-label {
          font-size: 15px;
          font-weight: 700;
          color: #334155;
        }
        .logout-button {
          width: 100%;
          padding: 16px;
          background: #fef2f2;
          color: #ef4444;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        }

      `}</style>
    </div>
  );
}
