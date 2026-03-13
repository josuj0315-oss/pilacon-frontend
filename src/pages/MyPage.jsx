import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS, ICON_CONFIG } from '../constants/icons';

export default function MyPage() {
  const { user, logout, favorites } = usePilaCon();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: '활동 관리',
      items: [
        { label: '강사 이력서 등록 및 관리', icon: ICONS.profile, path: '/profile/edit' },
        { label: '센터 관리', icon: ICONS.studio || ICONS.briefcase, path: '/profile/centers' },
        { label: '즐겨찾기', icon: ICONS.star, path: '/mypage/favorites' },
        { label: '최근 본 공고', icon: ICONS.clock, path: '/mypage/recent-jobs' },
      ]
    },
    {
      title: '안전 관리',
      items: [
        { label: '차단 사용자 관리', icon: ICONS.close, path: '/mypage/blocked-users' },
      ]
    },
    {
      title: '알림',
      items: [
        { label: '알림 설정', icon: ICONS.notification, path: '/mypage/notification-settings' },
      ]
    },
    {
      title: '기타',
      items: [
        { label: '앱 설정', icon: ICONS.settings, path: '/mypage/app-settings' },
      ]
    }
  ];

  return (
    <div className="page my-page" style={{ padding: 0 }}>
      <header className="page-header">
        <h2 className="unified-title">내 정보</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="mypage-content">
        {/* 프로필 카드 영역 */}
        <section className="profile-section">
          <div className="profile-main">
            <div className="profile-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="profile-img" />
              ) : (
                <ICONS.profile size={32} color={ICON_CONFIG.color.active} />
              )}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{user?.nickname || user?.name || '사용자'}</h2>
              <p className="profile-email">{user?.email || '이메일 정보 없음'}</p>
            </div>
            <button className="profile-edit-btn" onClick={() => navigate('/mypage/profile/edit')}>
              프로필 수정
            </button>
          </div>
        </section>

        {/* 메뉴 그룹 영역 */}
        <div className="menu-groups">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="group-container">
              <h3 className="group-header">{group.title}</h3>
              <div className="group-list">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <button key={iIdx} className="menu-item-btn" onClick={() => item.path !== '#' && navigate(item.path)}>
                      <div className="item-left">
                        {Icon && <Icon size={20} color="#475569" strokeWidth={2} />}
                        <span className="item-label">{item.label}</span>
                      </div>
                      <ICONS.chevronRight size={18} color="#cbd5e1" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .my-page {
          background: #f8fafc;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
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
        
        /* 프로필 섹션 스타일 */
        .profile-section {
          background: #fff;
          padding: 24px 20px;
          margin-bottom: 8px;
        }
        .profile-main {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f1f5f9;
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
        .profile-info {
          flex: 1;
        }
        .profile-name {
          font-size: 17px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 2px;
        }
        .profile-email {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        .profile-edit-btn {
          padding: 8px 12px;
          background: #f8faff;
          color: #5b5ff5;
          border: 1px solid #eef2ff;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        /* 메뉴 그룹 스타일 (당근마켓 리스트형) */
        .menu-groups {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .group-container {
          background: #fff;
          padding: 16px 0 8px 0;
        }
        .group-header {
          padding: 0 20px 12px 20px;
          font-size: 13px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .group-list {
          display: flex;
          flex-direction: column;
        }
        .menu-item-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .menu-item-btn:active {
          background: #f8fafc;
        }
        .item-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .item-label {
          font-size: 15px;
          font-weight: 600;
          color: #334155;
        }
      `}</style>
    </div>
  );
}
