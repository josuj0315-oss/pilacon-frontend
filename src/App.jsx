import { Routes, Route, Navigate } from "react-router-dom";
import { usePilaCon } from "./store/pilaconStore";
import AppLayout from "./layouts/AppLayout";
import PCLayout from "./layouts/PCLayout";

import Home from "./pages/Home";
import JobPostDetail from "./pages/JobPostDetail";
import Write from "./pages/Write";
import MyPage from "./pages/MyPage";
import Activity from "./pages/Activity";
import Chat from "./pages/Chat";
import ChatRoom from "./pages/ChatRoom";
import Login from "./pages/Login";
import ApplicantList from "./pages/ApplicantList";
import InstructorProfileManager from "./pages/InstructorProfileManager";
import JobEdit from "./pages/JobEdit";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import NotificationCustomSettings from "./pages/NotificationCustomSettings";
import AppSettings from "./pages/AppSettings";
import RecentlyViewedJobs from "./pages/RecentlyViewedJobs";
import BlockedUsers from "./pages/BlockedUsers";

import Favorites from "./pages/Favorites";
import UserInfoEdit from "./pages/UserInfoEdit";
import SignupWizard from "./pages/SignupWizard";
import CenterManagement from "./pages/CenterManagement";

import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Inquiry from "./pages/Inquiry";
import Notice from "./pages/Notice";
import NoticeDetail from "./pages/NoticeDetail";

import GlobalUI from "./components/GlobalUI";
import AdminLayout from "./layouts/AdminLayout";
import AdminReportList from "./pages/admin/AdminReportList";
import AdminReportDetail from "./pages/admin/AdminReportDetail";
import AdminNoticeWrite from "./pages/admin/AdminNoticeWrite";
import AdminInquiryList from "./pages/admin/AdminInquiryList";
import AdminInquiryDetail from "./pages/admin/AdminInquiryDetail";

import { useState } from "react";
import useDevice from "./hooks/useDevice";

export default function App() {
  const { user, isAuthLoading } = usePilaCon();
  const { isDesktop } = useDevice();
  const MainLayout = isDesktop ? PCLayout : AppLayout;

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '10px' }}>
        <p style={{ color: '#888', fontSize: '14px' }}>인증 정보를 확인하는 중입니다...</p>
      </div>
    );
  }

  if (!user) {
    if (!isDesktop) {
      return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupWizard />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );
    }

    return (
      <div id="appScreen">
        <GlobalUI />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/:id" element={<JobPostDetail />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/inquiry" element={<Inquiry />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupWizard />} />

          <Route path="/activity" element={<Navigate to="/login?next=%2Factivity" replace />} />
          <Route path="/chat" element={<Navigate to="/login?next=%2Fchat" replace />} />
          <Route path="/chat/:id" element={<Navigate to="/login?next=%2Fchat" replace />} />
          <Route path="/write" element={<Navigate to="/login?next=%2Fwrite" replace />} />
          <Route path="/mypage" element={<Navigate to="/login?next=%2Fmypage" replace />} />
          <Route path="/mypage/*" element={<Navigate to="/login?next=%2Fmypage" replace />} />
          <Route path="/profile/*" element={<Navigate to="/login?next=%2Fprofile%2Fedit" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div id="appScreen">
      <GlobalUI />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/jobs/:id" element={<JobPostDetail />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/favorites" element={<Favorites />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
        </Route>

        {/* ✅ 하단 탭 없이 단독 화면으로 쓰고 싶은 페이지 */}
        <Route path="/write" element={<Write />} />
        <Route path="/profile/edit" element={<InstructorProfileManager />} />
        <Route path="/profile/centers" element={<CenterManagement />} />
        <Route path="/mypage/profile/edit" element={<UserInfoEdit />} />
        <Route path="/jobs/:id/edit" element={<JobEdit />} />
        <Route path="/activity/applicants/:jobId" element={<ApplicantList />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/mypage/notification-settings" element={<NotificationSettings />} />
        <Route path="/mypage/notification-settings/custom" element={<NotificationCustomSettings />} />
        <Route path="/mypage/app-settings" element={<AppSettings />} />
        <Route path="/mypage/recent-jobs" element={<RecentlyViewedJobs />} />
        <Route path="/mypage/blocked-users" element={<BlockedUsers />} />

        {/* ✅ Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/reports" replace />} />
          <Route path="reports" element={<AdminReportList />} />
          <Route path="reports/:id" element={<AdminReportDetail />} />
          <Route path="notices/write" element={<AdminNoticeWrite />} />
          <Route path="inquiries" element={<AdminInquiryList />} />
          <Route path="inquiries/:id" element={<AdminInquiryDetail />} />
        </Route>

        {/* 로그인 상태에서 로그인 페이지 접근 시 홈으로 리다이렉트 */}
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/signup" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
