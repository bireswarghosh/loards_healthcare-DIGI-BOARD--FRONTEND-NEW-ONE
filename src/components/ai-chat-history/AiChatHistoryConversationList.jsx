import React, { useState, useEffect } from "react";

const AiChatHistoryConversationList = ({
  onSelectConversation,
  selectedId,
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    fetchConversations();
    // Refresh every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiBaseUrl}/api/ai/conversations/all`, {
        headers: {
          "x-timezone": userTimezone,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""}.`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""}.`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""}.`;

    return date.toLocaleDateString();
  };

  const getConversationTypeLabel = (type) => {
    switch (type) {
      case "user_ai":
        return "User-AI Chat";
      case "doctor_ai":
        return "Doctor-AI Chat";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="panel-body message-list">
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-body message-list">
        <div className="alert alert-danger m-3">
          <i className="fa-light fa-exclamation-triangle me-2"></i>
          {error}
          <button
            className="btn btn-sm btn-primary mt-2 d-block"
            onClick={fetchConversations}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="panel-body message-list"
      style={{ maxHeight: "500px", overflowY: "auto" }}
    >
      {conversations.length === 0 ? (
        <div className="text-center p-4 text-muted">
          <i className="fa-light fa-inbox fa-3x mb-3"></i>
          <p>No conversations yet</p>
        </div>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.id}
            className={`single-message ${
              selectedId === conv.id ? "active" : ""
            }`}
            onClick={() => onSelectConversation(conv.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="avatar">
              <img src="/assets/images/avatar-2.png" alt="AI" />
              <span className="active-status"></span>
            </div>
            <div className="part-txt">
              <div className="top">
                <span className="user-name">
                  {conv.user_name || `User #${conv.user_id}`}
                </span>
                <span className="msg-time">{formatTime(conv.created_at)}</span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6c757d",
                  marginBottom: "2px",
                }}
              >
                <i className="fa-light fa-envelope me-1"></i>
                {conv.user_email || "No email"}
              </div>
              <div className="msg-short">
                <span>
                  <i className="fa-light fa-robot me-1"></i>
                  {conv.model || "Unknown"} • {conv.message_count || 0} messages
                </span>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#999",
                  marginTop: "3px",
                }}
              >
                {getConversationTypeLabel(conv.conversation_type)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AiChatHistoryConversationList;
