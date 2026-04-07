import { Navigate, useNavigate, useParams } from "react-router-dom";
import useDevice from "../hooks/useDevice";
import ChatConversationPanel from "../components/ChatConversationPanel";

import usePageTitle from "../hooks/usePageTitle";

export default function ChatRoom() {
  usePageTitle("채팅 | 핏잡");
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const { id } = useParams();

  if (isDesktop) {
    return <Navigate to={`/chat?room=${encodeURIComponent(id || "")}`} replace />;
  }

  return (
    <div className="chatroom-page">
      <ChatConversationPanel roomId={id} isDesktop={false} onBack={() => navigate("/chat")} />
      <style>{`
        .chatroom-page {
          height: 100vh;
          height: 100svh;
          min-height: 0;
          background: #f7f9fc;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
