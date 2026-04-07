import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import { usePilaCon } from "../store/pilaconStore";
import { useCategory } from "../context/CategoryContext";
import { ICONS, ICON_CONFIG } from "../constants/icons";
import useDevice from "../hooks/useDevice";
import MessageNotificationBanner from "../components/MessageNotificationBanner";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, unreadCount } = usePilaCon();
  const { category, setCategory } = useCategory();
  const { isDesktop } = useDevice();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");
  const isDetailView = view === "appliedDetail" || view === "jobDetail";

  // ✅ 하단탭 숨길 화면이 있다면 여기서 관리 (예: 상세페이지)
  const hideNav =
    location.pathname.startsWith("/jobs/") ||
    location.pathname.startsWith("/activity/applicants") ||
    isDetailView; // 필요하면 추가

  const isHome = location.pathname === "/" || location.pathname === "/home";

  return (
    <div className="app-layout">
      <MessageNotificationBanner />
      {!isDesktop && user && (
        <div id="userBadge" className="user-badge">
          <div className="header-left">
            {isHome ? (
              <div className="category-wrap">
                <button className="category-btn-mini" onClick={() => setShowCategoryMenu((v) => !v)}>
                  <span className="category-text">{category}</span>
                  <ICONS.chevronDown
                    size={14}
                    strokeWidth={3}
                    className={`chev ${showCategoryMenu ? "open" : ""}`}
                    color="#1e293b"
                  />
                </button>
                {showCategoryMenu && (
                  <div className="category-menu-mini">
                    {["필라테스", "요가", "PT", "기타"].map((item) => (
                      <button
                        key={item}
                        className={category === item ? "menu-item-mini active" : "menu-item-mini"}
                        onClick={() => {
                          setCategory(item);
                          setShowCategoryMenu(false);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="page-title-mini">
                {location.pathname === "/chat" ? "채팅" : 
                 location.pathname === "/activity" ? "내 활동" :
                 location.pathname === "/mypage" ? "내 정보" : "Pilacon"}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="header-icon-btn notification-btn" onClick={() => navigate('/notifications')}>
              <ICONS.notification size={20} color="#1e293b" strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
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
          padding: 0 16px;
          background: #fff;
          height: 50px;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid #f1f5f9;
        }
        .header-left {
          display: flex;
          align-items: center;
        }
        .category-wrap {
          position: relative;
        }
        .category-btn-mini {
          display: flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          padding: 4px 0;
          cursor: pointer;
        }
        .category-text {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }
        .page-title-mini {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }
        .category-menu-mini {
          position: absolute;
          top: 36px;
          left: -4px;
          width: 140px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
          padding: 6px;
          z-index: 1100;
          border: 1px solid #f1f5f9;
        }
        .menu-item-mini {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }
        .menu-item-mini.active {
          background: #f1f5f9;
          color: #5b5ff5;
        }
        .header-actions {
          display: flex;
          align-items: center;
        }
        .header-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
        }
        .unread-badge {
          position: absolute;
          top: 2px;
          right: 2px;
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
          border: 2px solid #fff;
        }
        .chev {
          transition: transform 0.2s ease;
        }
        .chev.open {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
