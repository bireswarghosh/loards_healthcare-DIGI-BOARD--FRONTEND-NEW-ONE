import React, { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate } from "react-router-dom";

const AdminBookingConversationList = ({ onSelectConversation, selectedId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    // Refresh every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/admin/ai-booking-conversations`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      // Sort conversations by appointment ID (assuming conv.id is the appointment ID)
      const sortedData = data.sort((a, b) => (a.id || 0) - (b.id || 0));
      setConversations(sortedData);
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

  const truncateMessage = (message, maxLength = 80) => {
    if (!message) return "No messages yet";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const getBookingContext = (meta) => {
    if (!meta) return { context: null, status: null };

    try {
      const metadata = typeof meta === "string" ? JSON.parse(meta) : meta;
      const bookingData = metadata.bookingData || {};

      const parts = [];
      if (bookingData.doctor) {
        if (typeof bookingData.doctor === "object" && bookingData.doctor.name) {
          parts.push(`Dr. ${bookingData.doctor.name}`);
        } else if (
          typeof bookingData.doctor === "string" ||
          typeof bookingData.doctor === "number"
        ) {
          parts.push(`Dr. ID: ${bookingData.doctor}`);
        } else {
          parts.push(`Dr. ${bookingData.doctor}`);
        }
      }
      if (bookingData.slot) parts.push(bookingData.slot);
      if (bookingData.type)
        parts.push(bookingData.type === 1 ? "In-person" : "Online");

      const context = parts.length > 0 ? parts.join(" • ") : null;
      const status = bookingData.status || null;

      return { context, status };
    } catch (e) {
      return { context: null, status: null };
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
    <div className="panel-body message-list">
      <OverlayScrollbarsComponent
        className="main-menu"
        options={{
          className: "os-theme-light",
          scrollbars: {
            autoHide: "scroll",
          },
        }}
      >
        <div className="scrollable">
          {conversations.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="fa-light fa-inbox fa-3x mb-3"></i>
              <p>No booking conversations yet</p>
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
                <div className="part-txt">
                  <div className="top">
                    <span className="user-name">
                      {(() => {
                        const { context } = getBookingContext(conv.meta);
                        return context
                          ? `Appointment #${
                              JSON.parse(conv.meta || "{}").appointmentId ||
                              conv.id
                            }`
                          : `User: ${
                              conv.user_name || `User #${conv.user_id}`
                            }`;
                      })()}
                    </span>
                    <span className="msg-time">
                      {formatTime(conv.last_message_time || conv.updated_at)}
                    </span>
                  </div>
                  {(() => {
                    const { context, status } = getBookingContext(conv.meta);
                    if (!context) return null;

                    const getStatusColor = (status) => {
                      switch (status?.toLowerCase()) {
                        case "confirmed":
                        case "accepted":
                        case "completed":
                          return "#28a745"; // green
                        case "pending":
                          return "#ffc107"; // yellow/amber
                        case "cancelled":
                          return "#dc3545"; // red
                        default:
                          return "#6c757d"; // gray
                      }
                    };

                    return (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6c757d",
                          marginBottom: "2px",
                        }}
                      >
                        <i className="fa-light fa-calendar-check me-1"></i>
                        {context}
                        {status && (
                          <>
                            {" • "}
                            <span
                              style={{
                                color: getStatusColor(status),
                                fontWeight: "500",
                              }}
                            >
                              {status}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  <div className="msg-short">
                    <span>{truncateMessage(conv.last_message)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#999",
                      marginTop: "3px",
                    }}
                  >
                    <i className="fa-light fa-comments me-1"></i>
                    {conv.message_count || 0} messages
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default AdminBookingConversationList;
