import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import MessageNotificationBanner from "../components/MessageNotificationBanner";
import PCGlobalHeader from "./components/PCGlobalHeader";
import PCFooter from "./components/PCFooter";

export default function PCLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, unreadCount, unreadMessageCount } = usePilaCon();
  const isChatListRoute = location.pathname === "/chat";

  const searchValue = searchParams.get("q") || "";
  const isHomeRoute = location.pathname === "/";

  const applySearch = (value) => {
    const q = value.trim();
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    navigate(`/${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const handleSearchChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("q", value);
    else next.delete("q");

    if (isHomeRoute) setSearchParams(next);
    else setSearchParams(next, { replace: true });
  };

  return (
    <div className={`pc-global-layout ${isChatListRoute ? "pc-global-layout-chat" : ""}`}>
      <MessageNotificationBanner />

      <PCGlobalHeader
        searchValue={searchValue}
        unreadCount={unreadCount}
        unreadMessageCount={unreadMessageCount}
        profileInitial={(user?.nickname || user?.name || "U").slice(0, 1)}
        onSearchChange={handleSearchChange}
        onSearchSubmit={applySearch}
      />

      <div className={`pc-content-wrapper ${isChatListRoute ? "pc-content-wrapper-chat" : ""}`}>
        <main className={`pc-content-main ${isChatListRoute ? "pc-content-main-chat" : ""}`}>
          <Outlet />
        </main>
      </div>

      <PCFooter />
    </div>
  );
}
