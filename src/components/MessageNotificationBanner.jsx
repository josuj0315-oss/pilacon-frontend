import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import { ICONS } from '../constants/icons';

export default function MessageNotificationBanner() {
    const { lastChatMessage, setLastChatMessage } = usePilaCon();
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (lastChatMessage) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                // 지연 후 데이터 초기화 (애니메이션 위해)
                setTimeout(() => setLastChatMessage(null), 500);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [lastChatMessage, setLastChatMessage]);

    if (!lastChatMessage && !visible) return null;

    const handleClick = () => {
        if (lastChatMessage.deepLink) {
            navigate(lastChatMessage.deepLink);
            setVisible(false);
            setLastChatMessage(null);
        }
    };

    return (
        <div className={`message-banner ${visible ? 'show' : ''}`} onClick={handleClick}>
            <div className="banner-content">
                <div className="banner-icon">
                    <ICONS.message size={18} color="#fff" />
                </div>
                <div className="banner-text">
                    <span className="banner-title">{lastChatMessage?.title || '새 메시지'}</span>
                    <p className="banner-body">{lastChatMessage?.body}</p>
                </div>
            </div>
            <button className="banner-close" onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
                setLastChatMessage(null);
            }}>
                <ICONS.close size={16} color="#94a3b8" />
            </button>

            <style>{`
                .message-banner {
                    position: fixed;
                    top: -100px;
                    left: 16px;
                    right: 16px;
                    background: #fff;
                    border-radius: 20px;
                    padding: 16px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
                    z-index: 10000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                    cursor: pointer;
                    max-width: 500px;
                    margin: 0 auto;
                }
                .message-banner.show {
                    top: 20px;
                }
                .banner-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                    min-width: 0;
                }
                .banner-icon {
                    width: 36px;
                    height: 36px;
                    background: #5b5ff5;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .banner-text {
                    flex: 1;
                    min-width: 0;
                }
                .banner-title {
                    font-size: 14px;
                    font-weight: 800;
                    color: #1e293b;
                    display: block;
                    margin-bottom: 2px;
                }
                .banner-body {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 600;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .banner-close {
                    background: none;
                    border: none;
                    padding: 8px;
                    margin-left: 8px;
                }
            `}</style>
        </div>
    );
}
