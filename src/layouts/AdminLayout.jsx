import React from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { 
  BarChart3, 
  Flag, 
  Users, 
  FileText, 
  Settings, 
  ChevronLeft,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { usePilaCon } from "../store/pilaconStore";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = usePilaCon();

  // 실제 운영 환경에서는 유저 권한 체크(isAdmin) 로직 필수
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { label: "대시보드", icon: LayoutDashboard, path: "/admin" },
    { label: "문의 관리", icon: Mail, path: "/admin/inquiries" },
    { label: "공지 관리", icon: FileText, path: "/admin/notices/write" }, // 현재는 작성만 있으므로 바로 작성으로 연결
    { label: "신고 관리", icon: Flag, path: "/admin/reports" },
    { label: "회원 관리", icon: Users, path: "/admin/users" },
    { label: "공고 관리", icon: FileText, path: "/admin/jobs" },
    { label: "시스템 설정", icon: Settings, path: "/admin/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <FitJobLogo height="32px" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-all
                ${location.pathname === item.path 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}
              `}
            >
              <item.icon size={18} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-[15px] font-black text-slate-900 uppercase tracking-wider">
              {menuItems.find(i => location.pathname === i.path)?.label || "Main System"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[13px] font-black text-slate-900">{user?.nickname || user?.name}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Administrator</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>

        <div className="p-8 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
