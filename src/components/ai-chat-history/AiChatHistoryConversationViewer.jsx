import React, { useState, useEffect, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const AiChatHistoryConversationViewer = ({ conversationId }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails();
    }
  }, [conversationId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/ai/conversations/${conversationId}/messages`,
        {
          headers: {
            "x-timezone": userTimezone,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const data = await response.json();
      setMessages(data);

      // Get conversation metadata from first message or API
      if (data.length > 0) {
        // For now, we'll infer from messages, but ideally API should provide conversation details
        setConversation({
          id: conversationId,
          model: data[0].model || "Unknown",
          conversation_type: data[0].conversation_type || "user_ai",
          created_at: data[0].created_at,
          message_count: data.length,
        });
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
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

  if (!conversationId) {
    return (
      <div className="panel-body msg-area d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">
          <i className="fa-light fa-comment-dots fa-4x mb-3"></i>
          <h5>Select a conversation</h5>
          <p>Choose a conversation from the list to view messages</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel-body msg-area d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-body msg-area d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">
          <i className="fa-light fa-exclamation-triangle me-2"></i>
          {error}
          <button
            className="btn btn-sm btn-primary mt-2 d-block"
            onClick={fetchConversationDetails}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <>
      {/* Top Bar */}
      <div className="panel-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar me-3">
              <img src="/assets/images/avatar-2.png" alt="AI" />
            </div>
            <div>
              <h6 className="mb-0">
                {getConversationTypeLabel(conversation?.conversation_type)}
              </h6>
              <small className="text-muted">
                {conversation?.model || "Unknown model"}
              </small>
            </div>
          </div>
          <div className="text-end">
            <div className="badge bg-info">
              <i className="fa-light fa-comments me-1"></i>
              {messages.length} messages
            </div>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="panel-body msg-area w-100 flex-grow-1">
        <OverlayScrollbarsComponent
          className="main-menu w-100 h-80"
          options={{
            className: "os-theme-light msg-scrollbar",
            scrollbars: {
              visibility: "auto",
              autoHide: "scroll",
            },
          }}
        >
          <div className="scrollable" ref={scrollRef}>
            <div
              className="main-chat-area d-flex flex-column w-100 h-80"
              style={{ paddingBottom: "100px" }}
            >
              {Object.entries(messageGroups).map(([date, dateMessages]) => (
                <React.Fragment key={date}>
                  <div className="day-divider">
                    <span>{date}</span>
                  </div>
                  {dateMessages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`single-message ${
                        msg.role === "user" ? "" : "outgoing"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <>
                          <div className="avatar">
                            <img src="/assets/images/admin.png" alt="User" />
                          </div>
                          <div className="msg-box">
                            <div className="msg-box-inner">
                              <div className="msg-option">
                                <span className="msg-time">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                              <p style={{ whiteSpace: "pre-wrap" }}>
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="msg-box">
                            <div className="msg-box-inner">
                              <div className="msg-option">
                                <span className="msg-time">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                              <span
                                className="sent-status seen"
                                title="delivered"
                              >
                                <i className="fa-solid fa-circle-check"></i>
                              </span>
                              <p style={{ whiteSpace: "pre-wrap" }}>
                                {msg.content}
                              </p>
                              {msg.model && (
                                <div className="mt-1">
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "10px" }}
                                  >
                                    <i className="fa-light fa-robot me-1"></i>
                                    {msg.model}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="avatar">
                            <img
                              src="/assets/images/avatar-2.png"
                              alt="AI Assistant"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </>
  );
};

export default AiChatHistoryConversationViewer;
