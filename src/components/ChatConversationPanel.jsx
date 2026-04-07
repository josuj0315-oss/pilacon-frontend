import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import { ICONS } from "../constants/icons";

export default function ChatConversationPanel({ roomId, embedded = false, isDesktop = false, onBack, onRoomLeft }) {
  const navigate = useNavigate();
  const {
    getChatMessages,
    sendChatMessage,
    user,
    getChatRooms,
    uploadChatImage,
    acceptApplication,
    confirm,
    showToast,
    blockUser,
    isUserBlocked,
    isChatRoomMuted,
    toggleChatRoomMute,
    leaveChatRoom,
  } = usePilaCon();

  const numericRoomId = Number(roomId);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomLookupDone, setRoomLookupDone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    if (!numericRoomId) {
      setMessages([]);
      setRoomInfo(null);
      setRoomLookupDone(true);
      return;
    }

    const fetchRoomInfo = async () => {
      const rooms = await getChatRooms();
      const currentRoom = (rooms || []).find((room) => room.id === numericRoomId);
      setRoomInfo(currentRoom || null);
      setRoomLookupDone(true);
    };

    setRoomLookupDone(false);
    fetchRoomInfo();
  }, [getChatRooms, numericRoomId]);

  useEffect(() => {
    if (!numericRoomId) return undefined;

    const loadMessages = async () => {
      const data = await getChatMessages(numericRoomId);
      setMessages(data || []);
    };

    loadMessages();
    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, [getChatMessages, numericRoomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, numericRoomId]);

  useEffect(() => {
    setInput("");
    setShowMenu(false);
    setShowSearch(false);
    setSearchKeyword("");
    setShowMoreMenu(false);
    setShowReportModal(false);
    setReportReason("");
    messageRefs.current = {};
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
    }
  }, [numericRoomId]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setShowMenu(false);
      setShowMoreMenu(false);
      setShowSearch(false);
      setShowReportModal(false);
      setPreviewData(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleAccept = async () => {
    if (!roomInfo?.application?.id) return;

    const ok = await confirm("채용 확정", "정말로 채용을 확정하시겠습니까?");
    if (!ok) return;

    try {
      setIsSending(true);
      const res = await acceptApplication(roomInfo.application.id);
      if (res.ok) {
        showToast("채용이 확정되었습니다.");
        const rooms = await getChatRooms();
        const currentRoom = (rooms || []).find((room) => room.id === numericRoomId);
        setRoomInfo(currentRoom || null);
      } else {
        showToast(res.error || "채용 확정에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("오류가 발생했습니다.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `image_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = `image_${Date.now()}.png`;
      link.click();
    }
  };

  const handleProfileClick = (userProfile) => {
    if (!userProfile?.profileImage) return;
    setPreviewData({
      url: userProfile.profileImage,
      name: userProfile.nickname || userProfile.name || "프로필",
      type: "profile",
    });
  };

  const isBlockedRoom = useMemo(
    () => isUserBlocked(roomInfo?.otherUser?.id),
    [isUserBlocked, roomInfo]
  );

  const isMutedRoom = useMemo(
    () => isChatRoomMuted(numericRoomId),
    [isChatRoomMuted, numericRoomId]
  );

  const send = async () => {
    const text = input.trim();
    if (!text || isSending || !numericRoomId) return;
    if (isBlockedRoom) {
      showToast("차단한 사용자와는 메시지를 주고받을 수 없습니다.", "info");
      return;
    }

    try {
      setIsSending(true);
      setInput("");
      if (isDesktop && textareaRef.current) {
        textareaRef.current.style.height = "72px";
      }
      const res = await sendChatMessage(numericRoomId, text);
      if (res.ok) {
        const data = await getChatMessages(numericRoomId);
        setMessages(data || []);
      } else {
        showToast("메시지 전송에 실패했습니다.", "error");
        setInput(text);
      }
    } catch (error) {
      console.error(error);
      showToast("전송 중 오류가 발생했습니다.", "error");
      setInput(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleDesktopTextareaChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (!isDesktop || !textareaRef.current) return;
    textareaRef.current.style.height = "72px";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 88);
    textareaRef.current.style.height = `${nextHeight}px`;
  };

  const handleFileChange = async (e, isCamera = false) => {
    const file = e.target.files[0];
    if (!file || !numericRoomId) return;

    setShowMenu(false);
    setIsSending(true);

    try {
      const uploadRes = await uploadChatImage(numericRoomId, file);
      if (!uploadRes.ok) {
        showToast(uploadRes.error || "이미지 업로드에 실패했습니다.", "error");
        setIsSending(false);
        return;
      }

      const { url, key } = uploadRes.data;
      const res = await sendChatMessage(numericRoomId, "(이미지)", "image", url, key);

      if (res.ok) {
        const data = await getChatMessages(numericRoomId);
        setMessages(data || []);
      } else {
        showToast("이미지 전송에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("이미지 전송 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSending(false);
      if (isCamera && cameraInputRef.current) cameraInputRef.current.value = "";
      if (!isCamera && fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    const found = messages.slice().reverse().find((message) => message.type === "text" && message.content.includes(searchKeyword));
    if (found && messageRefs.current[found.id]) {
      messageRefs.current[found.id].scrollIntoView({ behavior: "smooth", block: "center" });
      const el = messageRefs.current[found.id].querySelector(".bubble");
      if (el) {
        el.style.boxShadow = "0 0 10px 4px rgba(91, 95, 245, 0.5)";
        setTimeout(() => {
          el.style.boxShadow = "";
        }, 2000);
      }
    } else {
      showToast("검색 결과가 없습니다.", "info");
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  const closeAllLayers = () => {
    setShowMenu(false);
    setShowMoreMenu(false);
    setShowReportModal(false);
  };

  const handleBlock = async () => {
    closeAllLayers();
    const ok = await confirm("차단하기", "이 사용자를 차단하시겠습니까?");
    if (!ok || !roomInfo?.otherUser) return;
    blockUser({
      userId: roomInfo.otherUser.id,
      nickname: roomInfo.otherUser.nickname || roomInfo.otherUser.name,
      profileImage: roomInfo.otherUser.profileImage,
    });
    showToast("사용자를 차단했습니다.", "success");
  };

  const handleMuteToggle = () => {
    toggleChatRoomMute(numericRoomId);
    setShowMoreMenu(false);
    showToast(isMutedRoom ? "채팅방 알림을 켰습니다." : "채팅방 알림을 껐습니다.", "success");
  };

  const handleLeaveRoom = async () => {
    closeAllLayers();
    const ok = await confirm("채팅방 나가기", "채팅방을 나가겠습니까?", {
      confirmText: "예",
      cancelText: "아니오",
    });
    if (!ok) return;

    leaveChatRoom(numericRoomId);
    showToast("채팅방에서 나갔습니다.", "success");
    onRoomLeft?.(numericRoomId);
    navigate("/chat");
  };

  const handleReportSubmit = () => {
    const reason = reportReason.trim();
    if (!reason || !roomInfo?.otherUser?.id || !user?.id) {
      showToast("신고 사유를 입력해주세요.", "info");
      return;
    }

    const reportedAt = new Date().toISOString();
    const subject = `[FITJOB 신고] 채팅방 ${numericRoomId}`;
    const body = [
      `신고자 ID: ${user.id}`,
      `신고 대상 ID: ${roomInfo.otherUser.id}`,
      `채팅방 ID: ${numericRoomId}`,
      `신고 시각: ${reportedAt}`,
      "",
      "[신고 사유]",
      reason,
    ].join("\n");

    window.location.href = `mailto:contact@fitjob.co.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowReportModal(false);
    setShowMoreMenu(false);
    setReportReason("");
    showToast("메일 앱이 열렸습니다. 신고 내용을 전송해주세요.", "success");
  };

  if (!numericRoomId) {
    return (
      <section className={`chat-conversation-panel ${embedded ? "chat-conversation-panel-embedded" : ""}`}>
        <div className="chat-conversation-empty">좌측에서 채팅방을 선택하세요.</div>
        <style>{`
          .chat-conversation-panel {
            min-height: 0;
            height: 100%;
            display: flex;
            background: #fff;
          }
          .chat-conversation-empty {
            flex: 1;
            display: grid;
            place-items: center;
            color: #64748b;
            font-size: 14px;
            font-weight: 700;
          }
        `}</style>
      </section>
    );
  }

  if (roomLookupDone && !roomInfo) {
    return (
      <section className={`chat-conversation-panel ${embedded ? "chat-conversation-panel-embedded" : ""}`}>
        <div className="chat-conversation-empty">채팅방을 찾을 수 없습니다.</div>
      </section>
    );
  }

  return (
    <section className={`chat-conversation-panel ${embedded ? "chat-conversation-panel-embedded" : ""}`}>
      <div className="chatroom-main-pane">
        <header className="chatroom-header">
          {!embedded && (
            <button className="chatroom-back" type="button" onClick={() => (onBack ? onBack() : navigate(-1))}>
              <ICONS.chevronLeft size={24} color="#1e293b" strokeWidth={2.5} />
            </button>
          )}

          <div className="chatroom-head">
            <div className="chatroom-title-row">
              <div
                className="chatroom-avatar"
                onClick={() => handleProfileClick(roomInfo?.otherUser)}
                style={{ cursor: roomInfo?.otherUser?.profileImage ? "pointer" : "default" }}
              >
                {roomInfo?.otherUser?.profileImage ? (
                  <img src={roomInfo.otherUser.profileImage} alt="profile" className="chatroom-avatar-img" />
                ) : (
                  <div className="chatroom-avatar-placeholder">
                    {(roomInfo?.otherUser?.nickname || roomInfo?.otherUser?.name || "C").slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="chatroom-name">
                {roomInfo?.otherUser?.nickname || roomInfo?.otherUser?.name || roomInfo?.job?.studio || roomInfo?.job?.center || "채팅"}
              </div>
              {isMutedRoom && <ICONS.bellOff size={14} color="#94a3b8" />}
            </div>
            {roomInfo?.job?.title ? <div className="chatroom-sub">{roomInfo.job.title}</div> : null}
          </div>

          <div className="header-actions">
            <button className="header-icon-btn" type="button" onClick={() => setShowSearch(!showSearch)}>
              <ICONS.search size={22} color="#475569" strokeWidth={2} />
            </button>
            <button className="header-icon-btn" type="button" onClick={() => setShowMoreMenu(true)}>
              <ICONS.moreVertical size={22} color="#475569" strokeWidth={2} />
            </button>
          </div>
        </header>

        {roomInfo?.job && (
          <div className="chatroom-job-bar">
            <div className="job-bar-info">
              <div className="job-bar-title">{roomInfo.job.title}</div>
              <div className="job-bar-status">
                {isBlockedRoom && <span className="status-badge muted">차단됨</span>}
                {isMutedRoom && <span className="status-badge muted">알림 꺼짐</span>}
                {roomInfo.application?.status === "accepted" ? (
                  <span className="status-badge accepted">채용 완료된 지원자입니다</span>
                ) : (
                  <span className="status-badge">대화 중</span>
                )}
              </div>
            </div>
            <div className="job-bar-actions">
              <button className="job-action-btn secondary" type="button" onClick={() => navigate(`/jobs/${roomInfo.job.id}`)}>
                공고보기
              </button>
              {user?.id === roomInfo.job.userId && roomInfo.application?.status !== "accepted" && (
                <button className="job-action-btn primary" type="button" onClick={handleAccept}>
                  채용확정
                </button>
              )}
            </div>
          </div>
        )}

        {showSearch && (
          <div className="chatroom-search-bar">
            <input
              className="search-input"
              autoFocus
              placeholder="상대방과의 대화 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-btn" type="button" onClick={handleSearch}>검색</button>
            <button className="search-close" type="button" onClick={() => { setShowSearch(false); setSearchKeyword(""); }}>취소</button>
          </div>
        )}

        {(showMenu || showMoreMenu || showReportModal) && (
          <div className="chatroom-overlay" onClick={closeAllLayers} />
        )}

        <main className="chatroom-body" ref={scrollRef}>
          <div className="chatroom-message-stack">
            <div className="chatroom-date">대화 시작</div>
            {isBlockedRoom && (
              <div className="chatroom-state-banner">
                차단한 사용자입니다. 이 채팅방에서는 메시지를 주고받을 수 없습니다.
              </div>
            )}

            {messages.map((message) => {
              const isMe = message.senderUserId === user?.id;
              const senderName = isMe ? (user?.nickname || "나") : (roomInfo?.otherUser?.nickname || roomInfo?.otherUser?.name || "상대방");

              return (
                <div
                  key={message.id}
                  ref={(el) => { messageRefs.current[message.id] = el; }}
                  className={`bubble-row ${isMe ? "is-me" : "is-other"}`}
                >
                  {!isMe && (
                    <div
                      className="bubble-avatar"
                      onClick={() => handleProfileClick(roomInfo?.otherUser)}
                      style={{ cursor: roomInfo?.otherUser?.profileImage ? "pointer" : "default" }}
                    >
                      {roomInfo?.otherUser?.profileImage ? (
                        <img src={roomInfo.otherUser.profileImage} alt="avatar" className="bubble-avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">{(roomInfo?.otherUser?.nickname || roomInfo?.otherUser?.name || "C").slice(0, 1)}</div>
                      )}
                    </div>
                  )}

                  <div className="bubble-content">
                    {!isMe && <div className="bubble-sender-name">{senderName}</div>}
                    <div className="bubble-wrapper">
                      {isMe && <div className="bubble-time">{formatTime(message.createdAt)}</div>}
                      <div className={`bubble ${isMe ? "bubble-me" : "bubble-other"} ${message.type === "image" ? "bubble-image-type" : ""}`}>
                        {message.type === "image" ? (
                          <div
                            className="bubble-image-container"
                            onClick={() => setPreviewData({ url: message.imageUrl, name: senderName, type: "image" })}
                          >
                            <img src={message.imageUrl} alt="첨부 이미지" className="bubble-image" />
                          </div>
                        ) : (
                          <div className="bubble-text">{message.content}</div>
                        )}
                      </div>
                      {!isMe && <div className="bubble-time">{formatTime(message.createdAt)}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <footer className="chatroom-inputbar">
          <button
            className={`chatroom-plus ${showMenu ? "is-active" : ""}`}
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="첨부 메뉴"
          >
            {showMenu ? <ICONS.close size={20} /> : <ICONS.plus size={24} />}
          </button>

          <div className="chatroom-composer-box">
            {isDesktop ? (
              <textarea
                ref={textareaRef}
                className="chatroom-textarea"
                value={input}
                onChange={handleDesktopTextareaChange}
                placeholder={isBlockedRoom ? "차단한 사용자에게는 메시지를 보낼 수 없습니다." : "메시지를 입력하세요..."}
                rows={3}
                disabled={isBlockedRoom}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                onFocus={() => setShowMenu(false)}
              />
            ) : (
              <input
                className="chatroom-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isBlockedRoom ? "차단한 사용자에게는 메시지를 보낼 수 없습니다." : "메시지를 입력하세요..."}
                disabled={isBlockedRoom}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                onFocus={() => setShowMenu(false)}
              />
            )}
          </div>

          <button
            className={`chatroom-send ${input.trim() && !isSending ? "is-active" : ""}`}
            type="button"
            onClick={send}
            disabled={!input.trim() || isSending || isBlockedRoom}
          >
            {isSending ? "..." : "보내기"}
          </button>

          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, false)}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            ref={cameraInputRef}
            onChange={(e) => handleFileChange(e, true)}
          />
        </footer>

        {showMenu && (
          <div className="chatroom-bottom-sheet">
            <div className="sheet-handle"></div>
            <div className="sheet-content grid-menu">
              <div className="attach-item" onClick={() => fileInputRef.current?.click()}>
                <div className="attach-icon">🖼️</div>
                <div className="attach-label">앨범</div>
              </div>
              <div className="attach-item" onClick={() => cameraInputRef.current?.click()}>
                <div className="attach-icon">📷</div>
                <div className="attach-label">카메라</div>
              </div>
            </div>
          </div>
        )}

        {showMoreMenu && (
          <div className="chatroom-bottom-sheet" role="dialog" aria-modal="true" aria-label="채팅방 메뉴">
            <div className="sheet-handle"></div>
            <div className="sheet-content list-menu">
              <button className="menu-item" type="button" onClick={handleBlock}>차단하기</button>
              <button className="menu-item" type="button" onClick={() => { setShowMoreMenu(false); setShowReportModal(true); }}>신고하기</button>
              <button className="menu-item" type="button" onClick={handleMuteToggle}>{isMutedRoom ? "알림 켜기" : "알림 끄기"}</button>
              <button className="menu-item text-danger" type="button" onClick={handleLeaveRoom}>채팅방 나가기</button>
              <div className="menu-divider" />
              <button className="menu-close-btn" type="button" onClick={() => setShowMoreMenu(false)}>닫기</button>
            </div>
          </div>
        )}

        {previewData && (
          <div className="image-preview-overlay">
            <div className="preview-top-bar">
              <button className="preview-action-btn" type="button" onClick={() => setPreviewData(null)}>
                <ICONS.close size={24} color="#fff" />
              </button>
              <div className="preview-sender-name">{previewData.name}</div>
              {previewData.type === "image" ? (
                <button className="preview-action-btn" type="button" onClick={() => handleDownload(previewData.url)}>
                  <ICONS.download size={24} color="#fff" />
                </button>
              ) : (
                <div style={{ width: 40 }} />
              )}
            </div>
            <div className="preview-image-wrapper" onClick={() => setPreviewData(null)}>
              <img src={previewData.url} alt="preview" className="image-preview-full" />
            </div>
          </div>
        )}

        {showReportModal && (
          <div className="chatroom-modal">
            <div className="chatroom-modal-card" role="dialog" aria-modal="true" aria-label="신고하기">
              <div className="chatroom-modal-head">
                <strong>신고하기</strong>
                <button type="button" className="chatroom-modal-close" onClick={() => setShowReportModal(false)}>
                  <ICONS.close size={18} color="#64748b" />
                </button>
              </div>
              <textarea
                className="chatroom-report-textarea"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="신고 사유를 입력해주세요."
                rows={5}
              />
              <div className="chatroom-modal-actions">
                <button type="button" className="chatroom-modal-btn secondary" onClick={() => setShowReportModal(false)}>취소</button>
                <button type="button" className="chatroom-modal-btn primary" onClick={handleReportSubmit}>신고하기</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .chat-conversation-panel {
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          background: #f7f9fc;
        }
        .chat-conversation-panel.chat-conversation-panel-embedded {
          background: #fff;
        }
        .chatroom-main-pane {
          flex: 1;
          min-width: 0;
          min-height: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          background: inherit;
          overflow: hidden;
        }
        .chatroom-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
          z-index: 10;
        }
        .chatroom-back {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          cursor: pointer;
        }
        .chatroom-head {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: ${embedded ? "flex-start" : "center"};
          overflow: hidden;
        }
        .chatroom-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: 100%;
        }
        .chatroom-avatar {
          width: 28px;
          height: 28px;
          border-radius: 10px;
          background: #f1f5f9;
          overflow: hidden;
          flex-shrink: 0;
        }
        .chatroom-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .chatroom-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #5b5ff5;
        }
        .chatroom-name {
          font-weight: 700;
          font-size: 15px;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chatroom-sub {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 1px;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .header-icon-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chatroom-job-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
          gap: 12px;
        }
        .job-bar-info {
          flex: 1;
          min-width: 0;
        }
        .job-bar-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .job-bar-status {
          margin-top: 2px;
        }
        .status-badge.accepted {
          color: #5b5ff5;
          font-weight: 800;
        }
        .status-badge.muted {
          color: #64748b;
          font-weight: 800;
        }
        .job-bar-actions {
          display: flex;
          gap: 6px;
        }
        .job-action-btn {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .job-action-btn.primary {
          background: #5b5ff5;
          color: #fff;
          border: none;
          box-shadow: 0 4px 12px rgba(91, 95, 245, 0.2);
        }
        .job-action-btn.secondary {
          background: #fff;
          color: #1e293b;
          border: 1px solid #e2e8f0;
        }
        .chatroom-search-bar {
          position: absolute;
          top: 52px;
          left: 0;
          right: 0;
          height: 52px;
          background: #fff;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          z-index: 12;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .search-input {
          flex: 1;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }
        .search-btn,
        .search-close {
          background: none;
          border: none;
          font-weight: 600;
          font-size: 14px;
          color: #5b5ff5;
          cursor: pointer;
          padding: 4px;
        }
        .search-close {
          color: #64748b;
        }
        .chatroom-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 16px;
          padding-bottom: ${embedded ? "20px" : "90px"};
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chatroom-message-stack {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .chatroom-date {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          margin: 10px 0;
        }
        .chatroom-state-banner {
          margin-bottom: 14px;
          padding: 10px 12px;
          border: 1px solid #fee2e2;
          background: #fff5f5;
          color: #b91c1c;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.5;
        }
        .bubble-row {
          display: flex;
          width: 100%;
          gap: 8px;
        }
        .bubble-row.is-me {
          justify-content: flex-end;
        }
        .bubble-row.is-other {
          justify-content: flex-start;
        }
        .bubble-avatar {
          width: 36px;
          height: 36px;
          border-radius: 14px;
          background: #f1f5f9;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .bubble-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-placeholder {
          font-size: 12px;
          font-weight: 800;
          color: #5b5ff5;
        }
        .bubble-content {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          gap: 4px;
        }
        .bubble-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }
        .bubble-sender-name {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          margin-left: 2px;
        }
        .bubble {
          padding: 10px 14px;
          border-radius: 18px;
          position: relative;
          width: fit-content;
        }
        .bubble-me {
          background: #5b5ff5;
          color: #fff;
          border-top-right-radius: 4px;
        }
        .bubble-other {
          background: #fff;
          color: #334155;
          border-top-left-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .bubble-text {
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
          word-break: break-all;
        }
        .bubble-time {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 600;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .chatroom-inputbar {
          position: ${embedded ? "relative" : "fixed"};
          left: 0;
          right: 0;
          bottom: 0;
          padding: 12px 16px;
          padding-bottom: ${embedded ? "12px" : "calc(12px + env(safe-area-inset-bottom))"};
          background: #fff;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 15;
          width: 100%;
          max-width: none;
          margin: 0;
          flex-shrink: 0;
        }
        .chatroom-composer-box {
          flex: 1;
          min-width: 0;
        }
        .chatroom-input {
          flex: 1;
          height: 40px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 20px;
          padding: 0 14px;
          outline: none;
          font-size: 14px;
          width: 100%;
        }
        .chatroom-input:disabled,
        .chatroom-textarea:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }
        .chatroom-textarea {
          width: 100%;
          min-height: 72px;
          max-height: 88px;
          border: 1px solid #dbe2ea;
          background: #f8fafc;
          border-radius: 18px;
          padding: 12px 14px;
          outline: none;
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          overflow-y: auto;
          font-family: inherit;
        }
        .chatroom-send {
          background: #cbd5e1;
          color: #fff;
          border: none;
          padding: 0 16px;
          height: 40px;
          border-radius: 20px;
          font-weight: 800;
          cursor: pointer;
        }
        .chatroom-send.is-active {
          background: #5b5ff5;
        }
        .chatroom-plus {
          width: 40px;
          height: 40px;
          border-radius: ${embedded ? "12px" : "50%"};
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .chatroom-plus.is-active {
          background: #f1f5f9;
          color: #1e293b;
        }
        .chatroom-bottom-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.1);
          padding: 20px;
          padding-bottom: calc(30px + env(safe-area-inset-bottom));
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1051;
        }
        .sheet-handle {
          width: 40px;
          height: 5px;
          background: #e2e8f0;
          border-radius: 2.5px;
          margin-bottom: 24px;
        }
        .sheet-content {
          width: 100%;
        }
        .grid-menu {
          display: flex;
          gap: 40px;
          justify-content: center;
        }
        .list-menu {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .menu-item {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          border-radius: 12px;
        }
        .menu-item:hover {
          background: #f8fafc;
        }
        .menu-item.text-danger {
          color: #ef4444;
        }
        .menu-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 8px 0;
        }
        .menu-close-btn {
          width: 100%;
          background: #f1f5f9;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          color: #64748b;
          margin-top: 8px;
          cursor: pointer;
        }
        .chatroom-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1040;
        }
        .chatroom-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1060;
          padding: 20px;
        }
        .chatroom-modal-card {
          width: min(420px, 100%);
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
          padding: 18px;
          display: grid;
          gap: 14px;
        }
        .chatroom-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .chatroom-modal-head strong {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }
        .chatroom-modal-close {
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 4px;
        }
        .chatroom-report-textarea {
          width: 100%;
          resize: none;
          border: 1px solid #dbe2ea;
          border-radius: 14px;
          padding: 12px 14px;
          background: #f8fafc;
          font-size: 14px;
          line-height: 1.5;
          outline: none;
          font-family: inherit;
        }
        .chatroom-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .chatroom-modal-btn {
          height: 40px;
          padding: 0 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #334155;
        }
        .chatroom-modal-btn.primary {
          border-color: #dbe2ff;
          background: #5b5ff5;
          color: #fff;
        }
        .attach-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .attach-icon {
          width: 56px;
          height: 56px;
          background: #f8fafc;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }
        .attach-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .bubble-image-type {
          padding: 4px !important;
          overflow: hidden;
          max-width: 240px;
        }
        .bubble-image-container {
          cursor: pointer;
          border-radius: 14px;
          overflow: hidden;
          display: block;
        }
        .bubble-image {
          width: 100%;
          display: block;
          max-height: 300px;
          object-fit: cover;
        }
        .image-preview-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 1);
          z-index: 2000;
          display: flex;
          flex-direction: column;
        }
        .preview-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 40px 20px 20px;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
          z-index: 2001;
        }
        .preview-sender-name {
          color: #fff;
          font-size: 16px;
          font-weight: 700;
        }
        .preview-action-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-image-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .image-preview-full {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      `}</style>
    </section>
  );
}
