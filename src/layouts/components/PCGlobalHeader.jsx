import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ICONS } from "../../constants/icons";
import { usePilaCon } from "../../store/pilaconStore";
import { resetAppScrollPosition } from "../../utils/scroll";

const navItems = [
  { to: "/", label: "채용정보", requiresAuth: false },
  { to: "/activity", label: "내 활동", requiresAuth: true },
  { to: "/chat", label: "메시지", requiresAuth: true },
];

export default function PCGlobalHeader({
  searchValue,
  unreadCount,
  unreadMessageCount,
  profileInitial,
  onSearchChange,
  onSearchSubmit,
}) {
  const navigate = useNavigate();
  const { user, showToast, getNotifications, markNotificationAsRead } = usePilaCon();
  const isLoggedIn = !!user;
  const chatBadge = unreadMessageCount > 99 ? "99+" : unreadMessageCount;
  const [openNotif, setOpenNotif] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [previewList, setPreviewList] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!openNotif) return;
    const onDown = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openNotif]);

  const openNotificationPopover = async () => {
    if (!isLoggedIn) return;
    const next = !openNotif;
    setOpenNotif(next);
    if (!next) return;

    setLoadingNotif(true);
    const data = await getNotifications(1);
    setPreviewList((data?.items || []).slice(0, 5));
    setLoadingNotif(false);
  };

  const handleNotifItemClick = async (item) => {
    if (!item?.id) return;
    await markNotificationAsRead(item.id);
    setPreviewList((prev) =>
      prev.map((n) => (String(n.id) === String(item.id) ? { ...n, isRead: true } : n))
    );
    if (item.deepLink) {
      setOpenNotif(false);
      navigate(item.deepLink);
    }
  };

  const goLogin = (nextPath = "/") => {
    showToast("로그인 후 이용할 수 있습니다.", "info");
    resetAppScrollPosition();
    navigate(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  const handleProtectedAction = (nextPath, action) => {
    if (!isLoggedIn) {
      goLogin(nextPath);
      return;
    }
    action();
  };

  return (
    <header className="pc-global-header">
      <div className="pc-global-header-inner">
        <div className="pc-header-row row-1">
          <div className="pc-row1-left">
            <button
              className="pc-logo-btn"
              onClick={() => {
                resetAppScrollPosition();
                navigate("/");
              }}
              aria-label="핏잡 홈으로 이동"
            >
              <span className="pc-logo-fit">FIT</span>
              <span className="pc-logo-job">JOB</span>
            </button>
            <div className="pc-global-search">
              <ICONS.search size={15} color="#94a3b8" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearchSubmit?.(e.currentTarget.value);
                }}
                placeholder="공고/센터 검색"
              />
            </div>
          </div>

          <div className="pc-row1-right">
            {isLoggedIn ? (
              <div className="pc-header-account-group">
                <div className="pc-notif-wrap" ref={notifRef}>
                  <button
                    className="pc-header-icon-btn"
                    onClick={openNotificationPopover}
                    aria-label="알림"
                    aria-expanded={openNotif}
                  >
                    <ICONS.notification size={18} color="#5b5ff5" strokeWidth={2.3} />
                    {unreadCount > 0 && (
                      <span className="pc-header-icon-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                    )}
                  </button>

                  {openNotif && (
                    <div className="pc-notif-popover">
                      <div className="pc-notif-popover-head">
                        <strong>최근 알림</strong>
                      </div>

                      <div className="pc-notif-popover-list">
                        {loadingNotif ? (
                          <div className="pc-notif-empty">알림을 불러오는 중...</div>
                        ) : previewList.length === 0 ? (
                          <div className="pc-notif-empty">새로운 알림이 없습니다.</div>
                        ) : (
                          previewList.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className={`pc-notif-item ${item.isRead ? "read" : ""}`}
                              onClick={() => handleNotifItemClick(item)}
                            >
                              <span className="pc-notif-title">{item.title || "알림"}</span>
                              <span className="pc-notif-body">{item.body || ""}</span>
                            </button>
                          ))
                        )}
                      </div>

                      <button
                        type="button"
                        className="pc-notif-view-all"
                        onClick={() => {
                          setOpenNotif(false);
                          navigate("/notifications");
                        }}
                      >
                        전체 알림 보기
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="pc-header-profile-btn"
                  onClick={() => {
                    resetAppScrollPosition();
                    navigate("/mypage");
                  }}
                  aria-label="내 정보"
                >
                  <span className="pc-header-profile-avatar">{profileInitial}</span>
                </button>
              </div>
            ) : (
              <div className="pc-auth-links">
                <button
                  className="pc-auth-link"
                  onClick={() => {
                    resetAppScrollPosition();
                    navigate("/login");
                  }}
                >
                  로그인
                </button>
                <span className="pc-auth-links-divider">|</span>
                <button
                  className="pc-auth-link"
                  onClick={() => {
                    resetAppScrollPosition();
                    navigate("/signup");
                  }}
                >
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pc-header-row row-2">
          <nav className="pc-global-nav" aria-label="글로벌 메뉴">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={(e) => {
                  if (item.requiresAuth && !isLoggedIn) {
                    e.preventDefault();
                    goLogin(item.to);
                    return;
                  }
                  resetAppScrollPosition();
                }}
                className={({ isActive }) => (isActive ? "pc-global-nav-item active" : "pc-global-nav-item")}
              >
                {item.label}
                {item.to === "/chat" && isLoggedIn && unreadMessageCount > 0 && (
                  <span className="pc-global-nav-badge">{chatBadge}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {isLoggedIn && (
            <div className="pc-header-cta-group">
              <button
                className="pc-header-cta-btn primary"
                onClick={() => handleProtectedAction("/write", () => navigate("/write"))}
              >
                공고 등록
              </button>

              <button
                className="pc-header-cta-btn secondary"
                onClick={() =>
                  handleProtectedAction("/profile/edit?mode=new", () => navigate("/profile/edit?mode=new"))
                }
              >
                이력서 작성
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
