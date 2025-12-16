import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Chat() {
  const { id1, id2 } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Connecting…");
  const [error, setError] = useState("");
  const [ws, setWs] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    setStatus("Loading history…");
    setError("");

    // Fetch chat history
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/${encodeURIComponent(id1)}/history/${encodeURIComponent(id2)}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load messages.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setMessages(data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load previous messages.");
      });

    // Open WebSocket
    const socket = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/chat?userId=${id1}`);

    socket.onopen = () => {
      if (!cancelled) {
        setStatus("Online");
        setConnected(true);
      }
    };

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages((prev) => [...prev, msg]);
    };

    socket.onerror = () => {
      if (!cancelled) {
        setStatus("Disconnected");
        setError("Connection issue. Messages may be delayed.");
        setConnected(false);
      }
    };

    socket.onclose = () => {
      if (!cancelled) {
        setStatus("Disconnected");
        setConnected(false);
      }
    };

    setWs(socket);

    return () => {
      cancelled = true;
      socket.close();
    };
  }, [id1, id2]);

  const send = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;

    const payload = { senderId: id1, receiverId: id2, content: text.trim() };

    // Optimistic UI
    setMessages((prev) => [...prev, { ...payload, optimistic: true }]);

    ws.send(JSON.stringify(payload));
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const goBack = () => {
    navigate(`/${id1}/home`);
  };

  return (
    <div className="page">
      <div className="page-inner">
        <div className="card-surface chat-layout">
          <div className="page-header-row">
            <div>
              <h2 className="page-title">Chat with {id2}</h2>
              <div className="status-text">{status}</div>
            </div>
            <button type="button" className="secondary" onClick={goBack}>
              Back to chats
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">Say hi to start the conversation.</div>
            ) : (
              messages.map((m, i) => {
                const senderId = m.senderId || m.sender;
                const isMe = senderId === id1;
                return (
                  <div key={i} className={`chat-message ${isMe ? "me" : "them"}`}>
                    <div className={`chat-bubble ${isMe ? "me" : "them"}`}>
                      <span className="chat-bubble-sender">{isMe ? "You" : senderId}</span>
                      <span>{m.content}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div>
            {error && <div className="error-text">{error}</div>}
            <div className="chat-input-row">
              <input
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="button" onClick={send} disabled={!text.trim() || !connected}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
