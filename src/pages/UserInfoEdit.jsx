import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ArrowLeft, Camera, User, Mail } from 'lucide-react';

export default function UserInfoEdit() {
  const { user, updateUser, uploadFile, checkNickname, showToast } = usePilaCon();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(true); // Initial state is checked because it's current nickname
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const nicknameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    profileImage: user?.profileImage || '',
  });

  const [previewImage, setPreviewImage] = useState(user?.profileImage || '');

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. UI Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // 2. Upload to S3
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
      setIsEditable(false);
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
    if (!isNicknameChecked && formData.nickname !== user?.nickname) {
      setNicknameError('닉네임 중복확인을 해주세요.');
      showToast('닉네임 중복확인을 해주세요.', 'error');
      nicknameInputRef.current?.focus();
      return;
    }
    const res = await updateUser(formData);
    if (res.ok) {
      showToast('프로필 정보가 수정되었습니다.');
      navigate('/mypage');
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div className="user-info-edit-page">
      <header className="edit-header">
        <button className="back-btn" onClick={() => navigate('/mypage')}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="header-title">프로필 수정</h1>
      </header>

      <main className="edit-main">
        <form onSubmit={handleSubmit} className="edit-form">

          <div className="avatar-section">
            <div className="avatar-container" onClick={handleImageClick} style={{ cursor: 'pointer' }}>
              <div className="avatar-wrapper">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="avatar-img" style={{ opacity: isUploading ? 0.5 : 1 }} />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={40} color="#cbd5e1" />
                  </div>
                )}
                {isUploading && (
                  <div className="upload-loader">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
              <div className="camera-badge">
                <Camera size={18} color="#fff" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="avatar-hint">대표 이미지를 등록해주세요</p>
          </div>

          <div className="input-section">
            <div className="input-group">
              <label className="field-label">닉네임</label>
              <div className="input-wrapper nickname-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="edit-input"
                  placeholder="닉네임을 입력하세요"
                  ref={nicknameInputRef}
                  value={formData.nickname}
                  onChange={(e) => {
                    setFormData({ ...formData, nickname: e.target.value });
                    setIsNicknameChecked(false);
                    setNicknameError('');
                  }}
                  disabled={!isEditable}
                  required
                />
                {!isEditable ? (
                  <button type="button" className="action-btn-small" onClick={() => setIsEditable(true)}>
                    변경
                  </button>
                ) : (
                  <button
                    type="button"
                    className="action-btn-small check-btn"
                    onClick={handleNicknameCheck}
                    disabled={checkingNickname || (formData.nickname === user?.nickname)}
                  >
                    {checkingNickname ? '...' : '중복확인'}
                  </button>
                )}
              </div>
              {nicknameError && <p className="field-error">{nicknameError}</p>}
            </div>
          </div>

          <div className="fixed-bottom-cta">
            <button
              type="submit"
              className="save-btn"
              disabled={isUploading || checkingNickname || (!isNicknameChecked && formData.nickname !== user?.nickname)}
            >
              저장하기
            </button>
          </div>
        </form>
      </main>

      <style>{`
        .user-info-edit-page {
          min-height: 100vh;
          background: #f8faff;
        }
        .edit-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }
        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: transparent;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .header-title {
          margin: 0 0 0 8px;
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
        }
        .edit-main {
          padding: 32px 20px;
          max-width: 600px;
          margin: 0 auto;
          padding-bottom: 120px;
        }
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }
        .avatar-container {
          position: relative;
          width: 100px;
          height: 100px;
          transition: transform 0.2s;
        }
        .avatar-container:active {
          transform: scale(0.95);
        }
        .avatar-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 35px;
          background: #fff;
          box-shadow: 0 8px 16px rgba(0,0,0,0.05);
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 2px solid #fff;
        }
        .avatar-wrapper:active {
          transform: none;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #f1f5f9;
          display: grid;
          place-items: center;
        }
        .camera-badge {
          position: absolute;
          right: -8px;
          bottom: -4px;
          width: 36px;
          height: 36px;
          background: #5b5ff5;
          border-radius: 14px;
          display: grid;
          place-items: center;
          border: 3px solid #f8faff;
          box-shadow: 0 4px 8px rgba(91, 95, 245, 0.3);
          pointer-events: none;
          z-index: 10;
        }
        .upload-loader {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,0.1);
        }
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(91, 95, 245, 0.2);
          border-top-color: #5b5ff5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .avatar-hint {
          margin-top: 14px;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
        }
        .input-section {
          display: grid;
          gap: 24px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
        }
        .field-label {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          margin-left: 4px;
          margin-bottom: 12px;
          display: block;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .nickname-wrapper .edit-input {
          padding-right: 100px;
        }
        .action-btn-small {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 82px;
          height: 38px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: grid;
          place-items: center;
          z-index: 10;
        }
        .action-btn-small:active {
          background: #e2e8f0;
          transform: translateY(-50%) scale(0.96);
        }
        .action-btn-small.check-btn {
          background: #eef2ff;
          color: #5b5ff5;
        }
        .action-btn-small.check-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f1f5f9;
          color: #94a3b8;
        }
        .input-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          z-index: 5;
        }
        .edit-input {
          width: 100%;
          height: 56px;
          padding-left: 56px !important;
          padding-right: 20px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          line-height: normal;
        }
        .edit-input:focus {
          border-color: #5b5ff5;
          box-shadow: 0 0 0 4px rgba(91, 95, 245, 0.08);
        }
        .fixed-bottom-cta {
          position: fixed;
          bottom: 24px;
          left: 0;
          right: 0;
          padding: 0 24px;
          max-width: 600px;
          margin: 0 auto;
        }
        .save-btn {
          width: 100%;
          height: 58px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(91, 95, 245, 0.25);
          transition: transform 0.2s;
        }
        .save-btn:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
        }
        .save-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .field-error {
          color: #ef4444;
          font-size: 12px;
          font-weight: 600;
          margin-top: 6px;
          margin-left: 4px;
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
