import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import { ICONS } from "../constants/icons";
import useDevice from "../hooks/useDevice";
import ChatConversationPanel from "../components/ChatConversationPanel";

import usePageTitle from "../hooks/usePageTitle";

export default function Chat() {
  usePageTitle("채팅 | 핏잡");
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const { getChatRooms, isUserBlocked, isChatRoomMuted } = usePilaCon();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [realRooms, setRealRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const roomParam = searchParams.get("room");

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const data = await getChatRooms();
      setRealRooms(data);
      setLoading(false);
    };
    fetchRooms();
  }, [getChatRooms]);

  const rooms = useMemo(() => {
    const list = realRooms.map((r) => {
      const job = r.job;
      return {
        id: r.id,
        name: r.otherUser?.nickname || r.otherUser?.name || job?.studio || job?.center || "상대방",
        title: job?.title ?? "공고",
        lastMsg: r.lastMessage?.content || "대화가 시작되었습니다.",
        time: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString("ko-KR", { month: 'short', day: 'numeric' }) : "",
        unread: 0,
        otherUser: r.otherUser,
        isMuted: isChatRoomMuted(r.id),
        isBlocked: isUserBlocked(r.otherUser?.id),
      };
    });

    const query = q.trim().toLowerCase();
    if (!query) return list;

    return list.filter((r) => {
      return (
        (r.name ?? "").toLowerCase().includes(query) ||
        (r.title ?? "").toLowerCase().includes(query) ||
        (r.lastMsg ?? "").toLowerCase().includes(query)
      );
    });
  }, [realRooms, q, isChatRoomMuted, isUserBlocked]);

  useEffect(() => {
    if (!isDesktop) return;
    if (rooms.length === 0) {
      setSelectedRoomId(null);
      return;
    }
    const requestedRoom = roomParam && rooms.some((r) => String(r.id) === String(roomParam))
      ? roomParam
      : null;
    const nextRoomId = requestedRoom || rooms[0].id;

    if (String(selectedRoomId) !== String(nextRoomId)) {
      setSelectedRoomId(nextRoomId);
    }

    if (String(roomParam) !== String(nextRoomId)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("room", String(nextRoomId));
      setSearchParams(nextParams, { replace: true });
    }
  }, [rooms, selectedRoomId, isDesktop, roomParam, searchParams, setSearchParams]);

  const handleSelectRoom = (roomId) => {
    if (!isDesktop) {
      navigate(`/chat/${encodeURIComponent(roomId)}`);
      return;
    }

    setSelectedRoomId(roomId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("room", String(roomId));
    setSearchParams(nextParams, { replace: true });
  };

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.id) === String(selectedRoomId)) || null,
    [rooms, selectedRoomId]
  );

  const handleRoomLeft = (roomId) => {
    setRealRooms((prev) => prev.filter((room) => String(room.id) !== String(roomId)));
    if (String(selectedRoomId) === String(roomId)) {
      const remaining = realRooms.filter((room) => String(room.id) !== String(roomId));
      const nextRoom = remaining[0]?.id || null;
      setSelectedRoomId(nextRoom);
      const nextParams = new URLSearchParams(searchParams);
      if (nextRoom) nextParams.set("room", String(nextRoom));
      else nextParams.delete("room");
      setSearchParams(nextParams, { replace: true });
    }
  };

  return (
    <div className={`chat-page ${isDesktop ? "chat-page-desktop" : ""}`}>
      {isDesktop ? (
        <>
          <header className="unified-header">
            <h1 className="unified-title">채팅</h1>
            <div className="unified-header-actions" />
          </header>

          <section className="chat-content-shell">
            <div className="chat-search-container">
              <div className="chat-search-pill">
                <ICONS.search size={16} color="#94a3b8" />
                <input
                  className="chat-search-input-new"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="채팅방 검색 (센터명/공고)"
                />
              </div>
            </div>

            <main className="chat-page-main">
              <section className="chat-list-container">
                {loading ? (
                  <div className="chat-empty">채팅 목록을 불러오는 중...</div>
                ) : rooms.length === 0 ? (
                  <div className="chat-empty">
                    아직 채팅이 없어요. <br />
                    공고에 지원하면 채팅방이 여기에 생겨요.
                  </div>
                ) : (
                  <div className="chat-list-rows">
                    {rooms.map((room) => (
                      <button
                        key={room.id}
                        className={`chat-row-item ${isDesktop && String(selectedRoomId) === String(room.id) ? "active" : ""}`}
                        onClick={() => handleSelectRoom(room.id)}
                        type="button"
                      >
                        <div className="chat-avatar-new" aria-hidden>
                          {room.otherUser?.profileImage ? (
                            <img src={room.otherUser.profileImage} alt={room.name} className="chat-avatar-img" />
                          ) : (
                            String(room.name ?? "C").slice(0, 1)
                          )}
                        </div>

                        <div className="chat-item-main">
                          <div className="chat-item-top">
                            <span className="chat-room-name">{room.name}</span>
                            <span className="chat-item-time">
                              {room.isMuted && <ICONS.bellOff size={12} color="#94a3b8" style={{ marginRight: 4, verticalAlign: "middle" }} />}
                              {room.time}
                            </span>
                          </div>
                          <div className="chat-item-bottom">
                            <p className="chat-last-msg">
                              <span className="chat-msg-prefix">{room.title} · </span>
                              {room.isBlocked ? "차단된 사용자입니다. 메시지를 보낼 수 없습니다." : room.lastMsg}
                            </p>
                            {room.unread > 0 && (
                              <span className="chat-unread-badge">
                                {room.unread > 99 ? '99+' : room.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {isDesktop && (
                <aside className="chat-detail-pane">
                  <ChatConversationPanel roomId={selectedRoom?.id} embedded isDesktop onRoomLeft={handleRoomLeft} />
                </aside>
              )}
            </main>
          </section>
        </>
      ) : (
        <div className="chat-search-container">
          <div className="chat-search-pill">
            <ICONS.search size={16} color="#94a3b8" />
            <input
              className="chat-search-input-new"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="채팅방 검색 (센터명/공고)"
            />
          </div>
        </div>
      )}
      {!isDesktop && (
        <main className="chat-page-main">
          <section className="chat-list-container">
            {loading ? (
              <div className="chat-empty">채팅 목록을 불러오는 중...</div>
            ) : rooms.length === 0 ? (
              <div className="chat-empty">
                아직 채팅이 없어요. <br />
                공고에 지원하면 채팅방이 여기에 생겨요.
              </div>
            ) : (
              <div className="chat-list-rows">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    className="chat-row-item"
                    onClick={() => handleSelectRoom(room.id)}
                    type="button"
                  >
                    <div className="chat-avatar-new" aria-hidden>
                      {room.otherUser?.profileImage ? (
                        <img src={room.otherUser.profileImage} alt={room.name} className="chat-avatar-img" />
                      ) : (
                        String(room.name ?? "C").slice(0, 1)
                      )}
                    </div>

                    <div className="chat-item-main">
                      <div className="chat-item-top">
                        <span className="chat-room-name">{room.name}</span>
                        <span className="chat-item-time">
                          {room.isMuted && <ICONS.bellOff size={12} color="#94a3b8" style={{ marginRight: 4, verticalAlign: "middle" }} />}
                          {room.time}
                        </span>
                      </div>
                      <div className="chat-item-bottom">
                        <p className="chat-last-msg">
                          <span className="chat-msg-prefix">{room.title} · </span>
                          {room.isBlocked ? "차단된 사용자입니다. 메시지를 보낼 수 없습니다." : room.lastMsg}
                        </p>
                        {room.unread > 0 && (
                          <span className="chat-unread-badge">
                            {room.unread > 99 ? '99+' : room.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
