import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePilaCon } from "../store/pilaconStore";
import { ICONS, ICON_CONFIG } from "../constants/icons";

export default function Chat() {
  const navigate = useNavigate();
  const { getChatRooms, user } = usePilaCon();
  const [q, setQ] = useState("");
  const [realRooms, setRealRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [realRooms, q]);

  return (
    <div className="chat-page">
      <header className="unified-header">
        <h1 className="unified-title">채팅</h1>
        <div className="unified-header-actions" />
      </header>

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

      <main className="chat-list-container">
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
                onClick={() => navigate(`/chat/${encodeURIComponent(room.id)}`)}
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
                    <span className="chat-item-time">{room.time}</span>
                  </div>
                  <div className="chat-item-bottom">
                    <p className="chat-last-msg">
                      <span className="chat-msg-prefix">{room.title} · </span>
                      {room.lastMsg}
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
      </main>
    </div>
  );
}
