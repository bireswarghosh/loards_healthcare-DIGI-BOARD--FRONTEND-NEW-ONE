import React, { useState, useEffect, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const AdminBookingConversationViewer = ({ conversationId }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails();
      fetchBookingDetails();
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
        }/api/admin/ai-booking-conversations/${conversationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const data = await response.json();
      setConversation(data.conversation);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/admin/ai-booking-conversations/${conversationId}/booking`
      );

      if (!response.ok) {
        return; // Booking might not exist yet
      }

      const data = await response.json();
      if (data.booking) {
        setBooking(data.booking);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
      // Non-critical error, don't set error state
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

  if (!conversationId) {
    return (
      <div className="panel-body msg-area d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">
          <i className="fa-light fa-comment-dots fa-4x mb-3"></i>
          <h5>Select a conversation</h5>
          <p>Choose a booking conversation from the list to view details</p>
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
              <img src="/assets/images/avatar-2.png" alt="User" />
            </div>
            <div>
              <h6 className="mb-0">
                {conversation.user_name || `User #${conversation.user_id}`}
              </h6>
              <small className="text-muted">
                {conversation.user_email || "No email"}
              </small>
            </div>
          </div>
          <div className="text-end">
            <div className="badge bg-primary">
              <i className="fa-light fa-calendar-check me-1"></i>
              AI Booking
            </div>
            {booking && (
              <div className="mt-1">
                <small className="text-muted">Appointment #{booking.id}</small>
              </div>
            )}
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
                            <img src="/assets/images/avatar-2.png" alt="User" />
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
                              {msg.attachments && (
                                <div className="mt-2">
                                  <small className="text-muted">
                                    <i className="fa-light fa-paperclip me-1"></i>
                                    Attachment
                                  </small>
                                </div>
                              )}
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
                              src="/assets/images/admin.png"
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

      {/* Booking Details Card (if available) */}
      {booking && (
        <div
          className="panel-footer"
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderTop: "1px solid #dee2e6",
          }}
        >
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <h6 className="card-title mb-3">
                <i className="fa-light fa-calendar-check me-2"></i>
                Booking Details
              </h6>
              <div className="row g-2" style={{ fontSize: "13px" }}>
                <div className="col-6">
                  <strong>Doctor:</strong> {booking.doctor_name || "N/A"}
                </div>
                <div className="col-6">
                  <strong>Specialty:</strong>{" "}
                  {booking.doctor_specialty || "N/A"}
                </div>
                <div className="col-6">
                  <strong>Date:</strong> {booking.date || "N/A"}
                </div>
                <div className="col-6">
                  <strong>Time:</strong> {booking.time || "N/A"}
                </div>
                <div className="col-6">
                  <strong>Type:</strong>{" "}
                  <span
                    className={`badge ${
                      booking.appointment_type === "offline"
                        ? "bg-info"
                        : "bg-success"
                    }`}
                  >
                    {booking.appointment_type === "offline"
                      ? "In-person"
                      : "Online"}
                  </span>
                </div>
                <div className="col-6">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${
                      booking.status === "pending"
                        ? "bg-warning"
                        : booking.status === "confirmed"
                        ? "bg-success"
                        : booking.status === "cancelled"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                {booking.ambulance_name && (
                  <div className="col-12">
                    <strong>Ambulance:</strong> {booking.ambulance_name}
                    <i className="fa-solid fa-ambulance ms-2 text-danger"></i>
                  </div>
                )}
                {booking.problem && (
                  <div className="col-12 mt-2">
                    <strong>Problem:</strong>
                    <p
                      className="mb-0 mt-1 p-2 bg-light rounded"
                      style={{ fontSize: "12px" }}
                    >
                      {booking.problem}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBookingConversationViewer;
