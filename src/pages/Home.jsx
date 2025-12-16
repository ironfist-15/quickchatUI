import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Home() {
  const { userId } = useParams();
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/${encodeURIComponent(userId)}/home`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
    )
    
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load chats.");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setChats(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Could not load chats.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const searchUser = async () => {
    if (!search.trim()) {
      setSearchError("Enter a user ID to start a new chat.");
      return;
    }
    setSearchError("");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/${encodeURIComponent(userId)}/search?username=${encodeURIComponent(
            search.trim()
          )
        }`
        );
      if (!res.ok) {
        throw new Error("Unable to search users.");
      }
      const data = await res.json();
      if (data.exists && data.userId) {
        navigate(`/${userId}/history/${data.userId}`);
      } else {
        setSearchError("No user found with that username.");
      }
    } catch (err) {
      setSearchError(err.message || "Something went wrong. Try again.");
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="page">
      <div className="page-inner">
        <div className="card-surface">
          <div className="page-header-row">
            <div>
              <h2 className="page-title">Chats</h2>
              <div className="status-text">
                Signed in as <strong>{chats.currentUsername || userId}</strong>
              </div>
            </div>
            <button
              className="secondary"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <div className="search-row">
            <input
              placeholder="Search or start a chat by user ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  searchUser();
                }
              }}
            />
            <button type="button" onClick={searchUser}>
              Search
            </button>
          </div>
          {searchError && <div className="error-text">{searchError}</div>}

          {loading ? (
            <div className="empty-state">Loading your recent chats…</div>
          ) : error ? (
            <div className="error-text">{error}</div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              You don&apos;t have any chats yet. Search for a user ID above to
              start a conversation.
            </div>
          ) : (
            <ul className="chat-list">
              {chats.map((conv, idx) => {
                // ConversationDTO structure: { withUserId, lastMessage, timestamp }
                const otherUserId = conv.withUserId;
                const lastMessage = conv.lastMessage || "";
                const timestamp = conv.timestamp ? new Date(conv.timestamp) : null;

                // Format timestamp
                const formatTime = (date) => {
                  if (!date || isNaN(date.getTime())) return "";
                  const now = new Date();
                  const diffMs = now - date;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return "Just now";
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  if (diffDays < 7) return `${diffDays}d ago`;
                  return date.toLocaleDateString();
                };

                return (
                  <li
                    key={otherUserId || idx}
                    className="chat-list-item"
                    onClick={() => navigate(`/${userId}/history/${otherUserId}`)}
                  >
                    <div className="chat-list-item-content">
                      <div className="chat-list-item-header">
                        <span className="chat-list-item-name">{otherUserId}</span>
                        {timestamp && (
                          <span className="chat-list-item-time">{formatTime(timestamp)}</span>
                        )}
                      </div>
                      {lastMessage && (
                        <div className="chat-list-item-preview">{lastMessage}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}