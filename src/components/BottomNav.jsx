import { NavLink, useNavigate } from "react-router-dom";
import { ICONS, ICON_CONFIG } from "../constants/icons";
import { usePilaCon } from "../store/pilaconStore";
import { resetAppScrollPosition } from "../utils/scroll";
import "./BottomNav.css";

export default function BottomNav() {
  const { user, unreadMessageCount, confirm } = usePilaCon();
  const navigate = useNavigate();
  const navItems = [
    { to: "/", label: "홈", iconKey: "home", requiresAuth: false },
    { to: "/activity", label: "내 활동", iconKey: "activity", requiresAuth: true },
    { to: "/chat", label: "채팅", iconKey: "chat", requiresAuth: true },
    { to: "/mypage", label: "내 정보", iconKey: "profile", requiresAuth: false },
  ];

  const handleNavClick = async (e, item) => {
    resetAppScrollPosition();
    if (item.requiresAuth && !user) {
      e.preventDefault();
      const ok = await confirm("알림", "로그인 후 이용하세요.");
      if (ok) {
        navigate(`/login?next=${encodeURIComponent(item.to)}`);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = ICONS[item.iconKey];
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={(e) => handleNavClick(e, item)}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={ICON_CONFIG.size.nav}
                  strokeWidth={ICON_CONFIG.strokeWidth}
                  color={isActive ? ICON_CONFIG.color.active : ICON_CONFIG.color.inactive}
                  className="nav-icon"
                />
                {item.iconKey === 'chat' && unreadMessageCount > 0 && (
                  <span className="nav-badge">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>
                )}
                <span className="nav-label">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
