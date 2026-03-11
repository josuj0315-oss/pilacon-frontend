import { useNavigate, Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { usePilaCon } from "../store/pilaconStore";
import { ICONS, ICON_CONFIG } from "../constants/icons";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, unreadCount } = usePilaCon();

  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");
  const isDetailView = view === "appliedDetail" || view === "jobDetail";

  // ✅ 하단탭 숨길 화면이 있다면 여기서 관리 (예: 상세페이지)
  const hideNav =
    location.pathname.startsWith("/jobs/") ||
    location.pathname.startsWith("/activity/applicants") ||
    isDetailView; // 필요하면 추가

  return (
    <div className="app-layout">
      {user && (
        <div id="userBadge" className="user-badge">
          <div className="user-info">
            <span className="provider-tag">{user.provider === 'kakao' ? '카카오' : '네이버'} 유저</span>
            <span className="user-name">{user.nickname || user.name || '사용자'}</span>
          </div>
          <div className="header-actions">
            <button className="header-icon-btn notification-btn" onClick={() => navigate('/notifications')}>
              <ICONS.notification size={20} color="#5b5ff5" strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            <button className="logout-btn" onClick={logout}>
              <ICONS.logout size={18} color="#ef4444" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      <div className="app-content">
        <Outlet />
      </div>

      {!hideNav && <BottomNav />}

      <style>{`
        .user-badge {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .provider-tag {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #e2e8f0;
          color: #475569;
          font-weight: 700;
        }
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .unread-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #f8fafc;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
