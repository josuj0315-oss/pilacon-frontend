import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ICONS } from '../constants/icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const PopupContainer = () => {
  const [activePopups, setActivePopups] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/popups/active`);
        const allActive = res.data;

        // localStorage에서 숨김 처리된 팝업 필터링
        const hiddenPopups = JSON.parse(localStorage.getItem('hiddenPopups') || '{}');
        const now = new Date().getTime();

        const filtered = allActive.filter(popup => {
          const hideUntil = hiddenPopups[popup.id];
          if (hideUntil && now < hideUntil) {
            return false;
          }
          return true;
        });

        if (filtered.length > 0) {
          setActivePopups(filtered);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Failed to fetch active popups:', error);
      }
    };

    fetchPopups();
  }, []);

  const handleClose = () => {
    if (currentIndex < activePopups.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handleHideFor30Days = () => {
    const popup = activePopups[currentIndex];
    const hiddenPopups = JSON.parse(localStorage.getItem('hiddenPopups') || '{}');
    
    // 30일 후의 밀리초 계산 (30일 * 24시간 * 60분 * 60초 * 1000밀리초)
    const hideUntil = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
    
    hiddenPopups[popup.id] = hideUntil;
    localStorage.setItem('hiddenPopups', JSON.stringify(hiddenPopups));
    
    handleClose();
  };

  if (!isVisible || activePopups.length === 0) return null;

  const currentPopup = activePopups[currentIndex];

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-content-scroll">
          {currentPopup.type === 'CUSTOM' ? (
            <div className="popup-custom-content">
              {currentPopup.imageUrl && (
                <img src={currentPopup.imageUrl} alt={currentPopup.title} className="popup-image" />
              )}
              <div className="popup-text-content">
                <h3 className="popup-title">{currentPopup.title}</h3>
                <p className="popup-description">{currentPopup.content}</p>
              </div>
            </div>
          ) : (
            <div className="popup-notice-content">
              <div className="popup-notice-badge">공지사항</div>
              <h3 className="popup-title">{currentPopup.notice?.title}</h3>
              <div className="popup-description notice-content">
                {currentPopup.notice?.content}
              </div>
            </div>
          )}
        </div>
        
        <div className="popup-footer">
          <button className="popup-hide-btn" onClick={handleHideFor30Days}>
            30일 동안 보지 않기
          </button>
          <button className="popup-close-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>

      <style>{`
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 11000;
          padding: 20px;
          backdrop-filter: blur(2px);
        }

        .popup-card {
          width: 100%;
          max-width: 340px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: popupFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes popupFadeIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .popup-content-scroll {
          max-height: 70vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .popup-image {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        .popup-text-content, .popup-notice-content {
          padding: 24px;
        }

        .popup-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .popup-description {
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .popup-notice-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #5b5ff5;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          border-radius: 6px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notice-content {
          color: #64748b;
        }

        .popup-footer {
          display: flex;
          border-top: 1px solid #f1f5f9;
        }

        .popup-hide-btn, .popup-close-btn {
          flex: 1;
          height: 56px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .popup-hide-btn {
          color: #94a3b8;
          border-right: 1px solid #f1f5f9;
        }

        .popup-close-btn {
          color: #0f172a;
          font-weight: 700;
        }

        .popup-hide-btn:active, .popup-close-btn:active {
          background: #f8fafc;
        }

        /* 스크롤바 숨기기 (선택 사항) */
        .popup-content-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .popup-content-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default PopupContainer;
