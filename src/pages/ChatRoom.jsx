import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import { ICONS } from "../constants/icons";

export default function ChatRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getChatMessages, sendChatMessage, user, getChatRooms, uploadChatImage, acceptApplication } = usePilaCon();
  const roomId = Number(id);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleAccept = async () => {
    if (!roomInfo?.application?.id) return;
    if (!window.confirm("정말로 채용을 확정하시겠습니까?")) return;

    try {
      setIsSending(true);
      const res = await acceptApplication(roomInfo.application.id);
      if (res.ok) {
        alert("채용이 확정되었습니다.");
        // 방 정보 갱신
        const rooms = await getChatRooms();
        const currentRoom = rooms.find(r => r.id === roomId);
        setRoomInfo(currentRoom);
      } else {
        alert(res.error || "채용 확정에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [previewData, setPreviewData] = useState(null); // { url, name }
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const messageRefs = useRef({});

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
      type: 'profile'
    });
  };

  // 방 정보 가져오기 (목록에서 찾기)
  useEffect(() => {
    const fetchRoomInfo = async () => {
      const rooms = await getChatRooms();
      const currentRoom = rooms.find(r => r.id === roomId);
      setRoomInfo(currentRoom);
    };
    fetchRoomInfo();
  }, [getChatRooms, roomId]);

  // 메시지 로드 및 폴링
  useEffect(() => {
    const loadMessages = async () => {
      const data = await getChatMessages(roomId);
      setMessages(data);
    };

    loadMessages();
    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, [getChatMessages, roomId]);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    try {
      setIsSending(true);
      setInput("");
      const res = await sendChatMessage(roomId, text);
      if (res.ok) {
        const data = await getChatMessages(roomId);
        setMessages(data);
      } else {
        alert("메시지 전송에 실패했습니다.");
        setInput(text); // 실패 시 입력값 복구
      }
    } catch (e) {
      console.error(e);
      alert("전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e, isCamera = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowMenu(false);
    setIsSending(true);

    try {
      // 1. 이미지 업로드
      const uploadRes = await uploadChatImage(roomId, file);
      if (!uploadRes.ok) {
        alert(uploadRes.error || "이미지 업로드에 실패했습니다.");
        setIsSending(false);
        return;
      }

      // 2. 이미지 메시지 전송
      const { url, key } = uploadRes.data;
      const res = await sendChatMessage(roomId, "(이미지)", "image", url, key);

      if (res.ok) {
        const data = await getChatMessages(roomId);
        setMessages(data);
      } else {
        alert("이미지 전송에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("이미지 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
      // input 초기화 (같은 파일 다시 선택 시 이벤트 발생을 위해)
      if (isCamera && cameraInputRef.current) cameraInputRef.current.value = "";
      if (!isCamera && fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    const found = messages.slice().reverse().find(m =>
      m.type === 'text' && m.content.includes(searchKeyword)
    );
    if (found && messageRefs.current[found.id]) {
      messageRefs.current[found.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
      const el = messageRefs.current[found.id].querySelector('.bubble');
      if (el) {
        el.style.boxShadow = "0 0 10px 4px rgba(91, 95, 245, 0.5)";
        setTimeout(() => {
          el.style.boxShadow = "";
        }, 2000);
      }
    } else {
      alert("검색 결과가 없습니다.");
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chatroom">
      <header className="chatroom-header">
        <button className="chatroom-back" type="button" onClick={() => navigate(-1)}>
          <ICONS.chevronLeft size={24} color="#1e293b" strokeWidth={2.5} />
        </button>

        <div className="chatroom-head">
          <div className="chatroom-title-row">
            <div
              className="chatroom-avatar"
              onClick={() => handleProfileClick(roomInfo?.otherUser)}
              style={{ cursor: roomInfo?.otherUser?.profileImage ? 'pointer' : 'default' }}
            >
              {roomInfo?.otherUser?.profileImage ? (
                <img src={roomInfo.otherUser.profileImage} alt="profile" className="chatroom-avatar-img" />
              ) : (
                <div className="chatroom-avatar-placeholder">
                  {(roomInfo?.otherUser?.nickname || roomInfo?.otherUser?.name || "C").slice(0, 1)}
                </div>
              )}
            </div>
            <div className="chatroom-name">{roomInfo?.otherUser?.nickname || roomInfo?.otherUser?.name || roomInfo?.job?.studio || roomInfo?.job?.center || "채팅"}</div>
          </div>
          {roomInfo?.job?.title ? <div className="chatroom-sub">{roomInfo.job.title}</div> : null}
        </div>

        <div className="header-actions">
          <button className="header-icon-btn" onClick={() => setShowSearch(!showSearch)}>
            <ICONS.search size={22} color="#475569" strokeWidth={2} />
          </button>
          <button className="header-icon-btn" onClick={() => setShowMoreMenu(true)}>
            <ICONS.moreVertical size={22} color="#475569" strokeWidth={2} />
          </button>
        </div>
      </header>

      {roomInfo?.job && (
        <div className="chatroom-job-bar">
          <div className="job-bar-info">
            <div className="job-bar-title">{roomInfo.job.title}</div>
            <div className="job-bar-status">
              {roomInfo.application?.status === 'accepted' ? (
                <span className="status-badge accepted">채용 완료된 지원자입니다</span>
              ) : (
                <span className="status-badge">대화 중</span>
              )}
            </div>
          </div>
          <div className="job-bar-actions">
            <button
              className="job-action-btn secondary"
              onClick={() => navigate(`/jobs/${roomInfo.job.id}`)}
            >
              공고보기
            </button>
            {user.id === roomInfo.job.userId && roomInfo.application?.status !== 'accepted' && (
              <button
                className="job-action-btn primary"
                onClick={handleAccept}
              >
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
          <button className="search-btn" onClick={handleSearch}>검색</button>
          <button className="search-close" onClick={() => { setShowSearch(false); setSearchKeyword(""); }}>취소</button>
        </div>
      )}

      {(showMenu || showMoreMenu) && <div className="chatroom-overlay" onClick={() => { setShowMenu(false); setShowMoreMenu(false); }} />}

      <main className="chatroom-body" ref={scrollRef}>
        <div className="chatroom-date">대화 시작</div>

        {messages.map((m) => {
          const isMe = m.senderUserId === user?.id;
          const senderName = isMe ? (user?.nickname || "나") : (roomInfo?.otherUser?.nickname || roomInfo?.otherUser?.name || "상대방");
          return (
            <div
              key={m.id}
              ref={el => messageRefs.current[m.id] = el}
              className={`bubble-row ${isMe ? "is-me" : "is-other"}`}
            >
              {!isMe && (
                <div
                  className="bubble-avatar"
                  onClick={() => handleProfileClick(roomInfo?.otherUser)}
                  style={{ cursor: roomInfo?.otherUser?.profileImage ? 'pointer' : 'default' }}
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
                  {isMe && <div className="bubble-time">{formatTime(m.createdAt)}</div>}
                  <div className={`bubble ${isMe ? "bubble-me" : "bubble-other"} ${m.type === "image" ? "bubble-image-type" : ""}`}>
                    {m.type === "image" ? (
                      <div className="bubble-image-container" onClick={() => setPreviewData({ url: m.imageUrl, name: senderName, type: 'image' })}>
                        <img src={m.imageUrl} alt="첨부 이미지" className="bubble-image" />
                      </div>
                    ) : (
                      <div className="bubble-text">{m.content}</div>
                    )}
                  </div>
                  {!isMe && <div className="bubble-time">{formatTime(m.createdAt)}</div>}
                </div>
              </div>
            </div>
          );
        })}
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

        <input
          className="chatroom-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          onFocus={() => setShowMenu(false)}
        />
        <button
          className={`chatroom-send ${input.trim() && !isSending ? "is-active" : ""}`}
          type="button"
          onClick={send}
          disabled={!input.trim() || isSending}
        >
          {isSending ? "..." : "보내기"}
        </button>

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
          <div className="chatroom-bottom-sheet">
            <div className="sheet-handle"></div>
            <div className="sheet-content list-menu">
              <button className="menu-item">차단하기</button>
              <button className="menu-item">신고하기</button>
              <button className="menu-item">알림 끄기</button>
              <button className="menu-item text-danger">채팅방 나가기</button>

              <div className="menu-divider" />

              <button className="menu-close-btn" onClick={() => setShowMoreMenu(false)}>닫기</button>
            </div>
          </div>
        )}

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

      {previewData && (
        <div className="image-preview-overlay">
          <div className="preview-top-bar">
            <button className="preview-action-btn" onClick={() => setPreviewData(null)}>
              <ICONS.close size={24} color="#fff" />
            </button>
            <div className="preview-sender-name">{previewData.name}</div>
            {previewData.type === 'image' ? (
              <button className="preview-action-btn" onClick={() => handleDownload(previewData.url)}>
                <ICONS.download size={24} color="#fff" />
              </button>
            ) : (
              <div style={{ width: 40 }} /> // Spacer to maintain alignment
            )}
          </div>
          <div className="preview-image-wrapper" onClick={() => setPreviewData(null)}>
            <img src={previewData.url} alt="preview" className="image-preview-full" />
          </div>
        </div>
      )}

      <style>{`
        .chatroom {
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100svh;
          background: #f7f9fc;
          position: relative;
        }
        .chatroom-header {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          padding-top: calc(10px + env(safe-area-inset-top));
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
          z-index: 1001;
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
          align-items: center;
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
        .chatroom-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .chatroom-avatar-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #5b5ff5;
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
          top: calc(52px + env(safe-area-inset-top));
          left: 0;
          right: 0;
          height: 52px;
          background: #fff;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
        .search-btn, .search-close {
          background: none;
          border: none;
          font-weight: 600;
          font-size: 14px;
          color: #5b5ff5;
          cursor: pointer;
          padding: 4px;
        }
        .search-close { color: #64748b; }

        .chatroom-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          padding-bottom: 90px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chatroom-date {
          text-align: center; font-size: 12px; color: #94a3b8; margin: 10px 0;
        }
        .bubble-row { display: flex; width: 100%; gap: 8px; transition: all 0.3s; }
        .bubble-row.is-me { justify-content: flex-end; }
        .bubble-row.is-other { justify-content: flex-start; }
        
        .bubble-avatar {
          width: 36px; height: 36px; border-radius: 14px;
          background: #f1f5f9; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 4px;
        }
        .bubble-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .bubble-content { display: flex; flex-direction: column; max-width: 80%; gap: 4px; }
        .bubble-wrapper { display: flex; align-items: flex-end; gap: 6px; }
        .bubble-sender-name { font-size: 11px; font-weight: 700; color: #64748b; margin-left: 2px; }
        
        .bubble { padding: 10px 14px; border-radius: 18px; position: relative; width: fit-content; }
        .bubble-me { background: #5b5ff5; color: #fff; border-top-right-radius: 4px; }
        .bubble-other { background: #fff; color: #334155; border-top-left-radius: 4px; border: 1px solid #e2e8f0; }
        .bubble-text { font-size: 14px; line-height: 1.5; font-weight: 500; word-break: break-all; }
        .bubble-time { font-size: 10px; color: #94a3b8; font-weight: 600; white-space: nowrap; margin-bottom: 2px; }
        
        .chatroom-inputbar {
          position: fixed; bottom: 0; left: 0; right: 0;
          padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom));
          background: #fff; border-top: 1px solid #eee;
          display: flex; align-items: center; gap: 10px; z-index: 1050;
        }
        .chatroom-input {
          flex: 1; border: 1px solid #e2e8f0; background: #f8fafc;
          border-radius: 20px; padding: 10px 16px; outline: none; font-size: 14px;
        }
        .chatroom-send {
          background: #cbd5e1; color: #fff; border: none; padding: 0 16px;
          height: 38px; border-radius: 19px; font-weight: 800; cursor: pointer;
        }
        .chatroom-send.is-active { background: #5b5ff5; }

        .chatroom-plus {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid #e2e8f0; background: #fff; color: #64748b;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all 0.2s;
        }
        .chatroom-plus.is-active { background: #f1f5f9; color: #1e293b; }

        .chatroom-bottom-sheet {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-radius: 24px 24px 0 0;
          box-shadow: 0 -8px 30px rgba(0,0,0,0.1);
          padding: 20px; padding-bottom: calc(30px + env(safe-area-inset-bottom));
          display: flex; flex-direction: column; align-items: center;
          animation: slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1051;
        }
        .sheet-handle { width: 40px; height: 5px; background: #e2e8f0; border-radius: 2.5px; margin-bottom: 24px; }
        .sheet-content { width: 100%; }
        .grid-menu { display: flex; gap: 40px; justify-content: center; }
        .list-menu { display: flex; flex-direction: column; gap: 4px; }

        .menu-item {
          width: 100%; text-align: left; background: none; border: none;
          padding: 16px; font-size: 16px; font-weight: 600; color: #334155;
          cursor: pointer; border-radius: 12px;
        }
        .menu-item:active { background: #f8fafc; }
        .menu-item.text-danger { color: #ef4444; }
        .menu-divider { height: 1px; background: #f1f5f9; margin: 8px 0; }
        .menu-close-btn {
          width: 100%; background: #f1f5f9; border: none; padding: 14px;
          border-radius: 12px; font-size: 15px; font-weight: 700; color: #64748b;
          margin-top: 8px; cursor: pointer;
        }

        @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .chatroom-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4); z-index: 1040; animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .attach-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; }
        .attach-icon {
          width: 56px; height: 56px; background: #f8fafc; border-radius: 18px;
          display: flex; align-items: center; justify-content: center; font-size: 26px;
        }
        .attach-label { font-size: 13px; font-weight: 600; color: #475569; }

        .bubble-image-type { padding: 4px !important; overflow: hidden; max-width: 240px; }
        .bubble-image-container { cursor: pointer; border-radius: 14px; overflow: hidden; display: block; }
        .bubble-image { width: 100%; display: block; max-height: 300px; object-fit: cover; }

        .image-preview-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,1); z-index: 2000;
          display: flex; flex-direction: column;
        }
        .preview-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 40px 20px 20px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
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
    </div>
  );
}
