import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS, ICON_CONFIG } from '../constants/icons';
import useDevice from '../hooks/useDevice';
import { IS_EMAIL_LOGIN_ENABLED } from '../constants/auth';

export default function MyPage() {
  const { isDesktop } = useDevice();
  const { user, logout, confirm } = usePilaCon();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = await confirm('로그아웃', '로그아웃 하시겠습니까?');
    if (ok) {
      logout();
      navigate('/');
    }
  };

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
    <div className={`page my-page ${isDesktop ? "my-page-desktop" : ""}`} style={{ padding: 0 }}>
      {isDesktop && (
        <header className="page-header">
          <h2 className="unified-title">내 정보</h2>
          <div style={{ width: 44 }} />
        </header>
      )}

      <div className="mypage-content">
        {/* 프로필 카드 영역 */}
        <section className="profile-section">
          {user ? (
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
          ) : (
            <div className="profile-guest">
              <div className="guest-copy">
                <h2 className="guest-title">로그인이 필요해요</h2>
                <p className="guest-desc">로그인해서 더 많은 기능을 이용해보세요!</p>
              </div>
              <button className="login-trigger-btn" onClick={() => navigate('/login')}>
                {IS_EMAIL_LOGIN_ENABLED ? '로그인 / 회원가입' : '로그인'}
              </button>
            </div>
          )}

          {user && (
            <div className="profile-meta-list">
              <div className="profile-meta-row">
                <span>아이디</span>
                <strong>{user?.username || '-'}</strong>
              </div>
              <div className="profile-meta-row">
                <span>이메일</span>
                <strong>{user?.email || '-'}</strong>
              </div>
              <div className="profile-meta-row">
                <span>연락처</span>
                <strong>{user?.phone || '-'}</strong>
              </div>
            </div>
          )}
        </section>

        {/* 메뉴 그룹 영역 */}
        <div className="menu-groups">
          {menuGroups.map((group, gIdx) => {
            // 로그인 필요 기능 필터링 (게스트일 때)
            const filteredItems = !user 
              ? group.items.filter(item => ['최근 본 공고', '앱 설정'].includes(item.label))
              : group.items;
              
            if (filteredItems.length === 0) return null;

            return (
              <div key={gIdx} className="group-container">
                <h3 className="group-header">{group.title}</h3>
                <div className="group-list">
                  {filteredItems.map((item, iIdx) => {
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
            );
          })}
        </div>

        {/* 로그아웃 버튼 (로그인 상태에서만) */}
        {user && (
          <div className="logout-section">
            <button className="logout-btn-full" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
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
          padding: 0 16px;
          height: 48px;
          background: #f8fafc;
          border-bottom: 1px solid #e9eef6;
          position: sticky;
          top: 0;
          z-index: 80;
          isolation: isolate;
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
        .profile-guest {
          padding: 8px 0;
        }
        .guest-copy {
          margin-bottom: 16px;
        }
        .guest-title {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .guest-desc {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .login-trigger-btn {
          width: 100%;
          padding: 14px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-trigger-btn:active {
          background: #4a4ed4;
          transform: scale(0.98);
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
        .profile-meta-list {
          display: none;
        }
        .profile-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .profile-meta-row span {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          flex-shrink: 0;
        }
        .profile-meta-row strong {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          min-width: 0;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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

        .logout-section {
          padding: 24px 20px 64px 20px;
        }
        .logout-btn-full {
          width: 100%;
          padding: 16px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          color: #ef4444;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn-full:active {
          background: #fef2f2;
          transform: scale(0.98);
        }
        @media (min-width: 1200px) {
          .my-page-desktop {
            position: relative;
            min-height: 100%;
            overflow: hidden;
          }
          .my-page-desktop .page-header {
            background: #f8fafc;
            z-index: 80;
          }
          .my-page-desktop .mypage-content {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: 300px minmax(0, 1fr);
            gap: 14px;
            padding: 10px 12px 14px;
            width: min(1060px, 100%);
            margin: 0 auto;
            align-items: start;
          }
          .my-page-desktop .profile-section {
            margin-bottom: 0;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            position: sticky;
            top: 62px;
          }
          .my-page-desktop .profile-main {
            align-items: center;
          }
          .my-page-desktop .profile-info {
            min-width: 0;
          }
          .my-page-desktop .profile-email {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .my-page-desktop .profile-meta-list {
            margin-top: 14px;
            border-top: 1px solid #eef2f7;
            padding-top: 12px;
            display: grid;
            gap: 8px;
          }
          .my-page-desktop .menu-groups {
            gap: 10px;
          }
          .my-page-desktop .group-container {
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            overflow: hidden;
          }
          .my-page-desktop .logout-section {
            padding: 0;
            margin-top: 10px;
            grid-column: 2;
          }
        }
      `}</style>
    </div>
  );
}
