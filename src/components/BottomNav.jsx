import { NavLink } from "react-router-dom";
import { ICONS, ICON_CONFIG } from "../constants/icons";
import "./BottomNav.css";

export default function BottomNav() {
  const navItems = [
    { to: "/", label: "홈", iconKey: "home" },
    { to: "/activity", label: "내 활동", iconKey: "activity" },
    { to: "/chat", label: "채팅", iconKey: "chat" },
    { to: "/mypage", label: "내 정보", iconKey: "profile" },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = ICONS[item.iconKey];
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
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
                <span className="nav-label">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
