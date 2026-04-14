import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS, ICON_CONFIG } from '../constants/icons';
import useDevice from '../hooks/useDevice';
import { Camera } from 'lucide-react';

export default function UserInfoEdit() {
  const { isDesktop } = useDevice();
  const { user, updateUser, uploadFile, checkNickname, showToast, confirm } = usePilaCon();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    profileImage: user?.profileImage || '',
    role: user?.role || 'INSTRUCTOR',
  });

  const [previewImage, setPreviewImage] = useState(user?.profileImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);

      // Upload
      setIsUploading(true);
      const res = await uploadFile(file);
      setIsUploading(false);

      if (res.ok) {
        setFormData(prev => ({ ...prev, profileImage: res.url }));
        setPreviewImage(res.url);
      } else {
        showToast(res.error, 'error');
      }
    }
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) return;
    if (formData.nickname === user?.nickname) {
      setIsNicknameChecked(true);
      return;
    }

    setCheckingNickname(true);
    const res = await checkNickname(formData.nickname);
    setCheckingNickname(false);

    if (res.available) {
      showToast('사용 가능한 닉네임입니다.', 'success');
      setIsNicknameChecked(true);
      setNicknameError('');
    } else {
      setNicknameError('이미 사용 중인 닉네임입니다.');
      setIsNicknameChecked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    
    // Validate role change confirmation if role is different
    if (formData.role !== user?.role) {
      const ok = await confirm(
        '회원 유형 변경',
        '회원 유형 변경 시 일부 정보가 초기화될 수 있습니다. 계속하시겠습니까?'
      );
      if (!ok) return;
    }

    if (!isNicknameChecked && formData.nickname !== user?.nickname) {
      setNicknameError('닉네임 중복확인을 해주세요.');
      showToast('닉네임 중복확인을 해주세요.', 'error');
      return;
    }

    const res = await updateUser(formData);
    if (res.ok) {
      showToast('프로필 정보가 수정되었습니다.', 'success');
      navigate('/profile');
    } else {
      showToast(res.error, 'error');
    }
  };

  if (!user) return null;

  return (
    <div className={`page profile-edit-page ${isDesktop ? 'desktop' : ''}`}>
      {isDesktop ? (
        <div className="desktop-page-header">
          <h1 className="unified-title">프로필 수정</h1>
        </div>
      ) : (
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ICONS.chevronLeft size={24} color="#1e293b" />
          </button>
          <h2 className="unified-title">프로필 수정</h2>
          <div style={{ width: 44 }} />
        </header>
      )}

      <div className="profile-edit-content">
        <form onSubmit={handleSubmit} className="profile-edit-section">
          <div className="profile-main">
            <div className="avatar-edit-wrapper" onClick={handleImageClick}>
              <div className="profile-avatar">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="profile-img" style={{ opacity: isUploading ? 0.5 : 1 }} />
                ) : (
                  <ICONS.profile size={32} color={ICON_CONFIG.color.active} />
                )}
                {isUploading && (
                  <div className="upload-loader">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
              <div className="camera-badge">
                <Camera size={14} color="#fff" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="profile-info">
              <h2 className="profile-name">{formData.nickname || user.nickname}</h2>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>

          <div className="profile-meta-list">
            <div className="profile-meta-row edit-row">
              <span className="label">닉네임</span>
              <div className="input-group">
                <input
                  type="text"
                  className="edit-input"
                  value={formData.nickname}
                  onChange={(e) => {
                    setFormData({ ...formData, nickname: e.target.value });
                    setIsNicknameChecked(false);
                    setNicknameError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className={`check-btn ${isNicknameChecked ? 'checked' : ''}`}
                  onClick={handleNicknameCheck}
                  disabled={checkingNickname || (formData.nickname === user?.nickname)}
                >
                  {checkingNickname ? '...' : (isNicknameChecked && formData.nickname !== user?.nickname ? '확인완료' : '중복확인')}
                </button>
              </div>
            </div>
            {nicknameError && <p className="error-text">{nicknameError}</p>}

            <div className="profile-meta-row">
              <span className="label">이메일</span>
              <strong className="value disabled">{user.email}</strong>
            </div>

            <div className="profile-meta-row">
              <span className="label">전화번호</span>
              <strong className="value disabled">{user.phone || '-'}</strong>
            </div>

            <div className="profile-meta-row edit-row">
              <span className="label">회원 유형</span>
              <div className="role-select-wrapper">
                <select 
                  className="role-select" 
                  value={formData.role} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="INSTRUCTOR">강사</option>
                  <option value="CENTER">센터</option>
                </select>
                <ICONS.chevronDown size={14} color="#94a3b8" className="select-icon" />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={isUploading || checkingNickname || (!isNicknameChecked && formData.nickname !== user?.nickname)}
            >
              저장하기
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .profile-edit-page {
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
        .profile-edit-content {
          padding: 16px;
          max-width: 600px;
          margin: 0 auto;
        }
        .profile-edit-section {
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
        .avatar-edit-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .camera-badge {
          position: absolute;
          right: -2px;
          bottom: -2px;
          width: 24px;
          height: 24px;
          background: #5b5ff5;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 2px solid #fff;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upload-loader {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.2);
          display: grid;
          place-items: center;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
        }
        .profile-email {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .profile-meta-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-top: 1px solid #f1f5f9;
          padding-top: 24px;
        }
        .profile-meta-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-height: 48px;
          flex-wrap: nowrap;
          padding-top: 4px;
        }
        .profile-meta-row .label {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          width: 60px;
          flex-shrink: 0;
        }
        .profile-meta-row.edit-row {
          align-items: flex-start;
          padding-top: 4px;
        }
        .profile-meta-row .value {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          flex: 1;
          text-align: right;
        }
        .profile-meta-row .value.disabled {
          color: #94a3b8;
        }
        .input-group {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: flex-start !important;
          gap: 8px !important;
          flex: 1;
          min-width: 0;
        }
        .edit-input {
          flex: 1 !important;
          width: auto !important;
          min-width: 0 !important;
          height: 40px;
          padding: 0 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .edit-input:focus {
          border-color: #5b5ff5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(91, 95, 245, 0.05);
        }
        .check-btn {
          flex-shrink: 0 !important;
          height: 40px;
          padding: 0 12px;
          background: #eef2ff;
          color: #5b5ff5;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .check-btn:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }
        .check-btn.checked {
          background: #f0fdf4;
          color: #22c55e;
        }
        .error-text {
          font-size: 11px;
          color: #ef4444;
          font-weight: 600;
          margin-top: 4px;
          margin-left: 72px;
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
        }
        .select-icon {
          position: absolute;
          right: 10px;
          pointer-events: none;
        }
        .form-actions {
          margin-top: 32px;
        }
        .save-btn {
          width: 100%;
          height: 52px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(91, 95, 245, 0.2);
        }
        .save-btn:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
        }
        .save-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
