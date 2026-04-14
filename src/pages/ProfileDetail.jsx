import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS, ICON_CONFIG } from '../constants/icons';
import useDevice from '../hooks/useDevice';

export default function ProfileDetail() {
  const { isDesktop } = useDevice();
  const { user, updateUser, showToast, confirm } = usePilaCon();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleRoleChange = async (newRole) => {
    const ok = await confirm(
      '회원 유형 변경',
      '회원 유형 변경 시 일부 정보가 초기화될 수 있습니다. 계속하시겠습니까?'
    );
    if (!ok) return;

    const res = await updateUser({ role: newRole });
    if (res.ok) {
      showToast('회원 유형이 변경되었습니다.', 'success');
    } else {
      showToast(res.error, 'error');
    }
  };

  const nickname = user?.nickname || '-';
  const email = user?.email || '-';
  const phone = user?.phone || '전화번호를 입력해주세요';
  
  const providerLabelMap = {
    naver: '네이버',
    kakao: '카카오',
    local: '일반',
  };
  const providerDisplay = providerLabelMap[user?.provider] || '일반';
  const role = user?.role || 'INSTRUCTOR';

  return (
    <div className={`page profile-detail-page ${isDesktop ? 'desktop' : ''}`}>
      {isDesktop ? (
        <div className="desktop-page-header">
          <h1 className="unified-title">프로필</h1>
        </div>
      ) : (
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate('/mypage')}>
            <ICONS.chevronLeft size={24} color="#1e293b" />
          </button>
          <h2 className="unified-title">프로필</h2>
          <div style={{ width: 44 }} />
        </header>
      )}

      <div className="profile-detail-content">
        <section className="profile-detail-section">
          <div className="profile-main">
            <div className="profile-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="profile-img" />
              ) : (
                <ICONS.profile size={32} color={ICON_CONFIG.color.active} />
              )}
            </div>

            <div className="profile-info">
              <h2 className="profile-name">{nickname}</h2>
              <p className="profile-email">{email}</p>
            </div>

            <button className="profile-edit-btn" onClick={() => navigate('/profile/edit')}>
              프로필 수정
            </button>
          </div>

          <div className="profile-meta-list">
            <div className="profile-meta-row">
              <span className="label">닉네임</span>
              <strong className="value">{nickname}</strong>
            </div>

            <div className="profile-meta-row">
              <span className="label">이메일</span>
              <strong className="value">{email}</strong>
            </div>

            <div className="profile-meta-row">
              <span className="label">전화번호</span>
              <strong className="value">{phone}</strong>
            </div>

            <div className="profile-meta-row">
              <span className="label">연동계정</span>
              <strong className="value">{providerDisplay}</strong>
            </div>

            <div className="profile-meta-row">
              <span className="label">회원 유형</span>
              <strong className="value">{role === 'INSTRUCTOR' ? '강사' : '센터'}</strong>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .profile-detail-page {
          background: #f8fafc;
          min-height: 100vh;
        }
        .desktop-page-header {
          padding: 24px 16px 8px;
          max-width: 600px;
          margin: 0 auto;
        }
        .desktop-page-header .unified-title {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 56px;
          background: #fff;
          border-bottom: 1px solid #eef2f6;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .back-btn {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .unified-title {
          font-size: 17px;
          font-weight: 800;
          color: #1e293b;
        }
        .profile-detail-content {
          padding: 16px;
          max-width: 600px;
          margin: 0 auto;
        }
        .profile-detail-section {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .profile-main {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f1f5f9;
          display: grid;
          place-items: center;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
        }
        .profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-info {
          flex: 1;
          min-width: 0;
        }
        .profile-name {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .profile-email {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .profile-edit-btn {
          padding: 10px 16px;
          background: #f8faff;
          color: #5b5ff5;
          border: 1px solid #eef2ff;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .profile-edit-btn:active {
          background: #eef2ff;
          transform: scale(0.98);
        }
        .profile-meta-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid #f1f5f9;
          padding-top: 24px;
        }
        .profile-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 0;
        }
        .profile-meta-row .label {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
        }
        .profile-meta-row .value {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          text-align: right;
        }
        .role-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .role-select {
          appearance: none;
          padding: 8px 32px 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }
        .role-select:focus {
          border-color: #5b5ff5;
          background: #fff;
        }
        .select-icon {
          position: absolute;
          right: 10px;
          pointer-events: none;
        }
        @media (min-width: 1200px) {
          .profile-detail-page.desktop {
            padding: 24px;
          }
          .profile-detail-content {
            max-width: 700px;
          }
        }
      `}</style>
    </div>
  );
}
