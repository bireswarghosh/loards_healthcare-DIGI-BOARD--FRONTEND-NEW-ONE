import React, { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate } from "react-router-dom";

const UserBookingConversationList = ({ onSelectConversation, selectedId }) => {
  const [conversations, setConversations] = useState([]);
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get user ID from localStorage or context (assuming it's stored there)
  const getUserId = () => {
    // This should be replaced with proper auth context
    return localStorage.getItem("userId") || "95"; // Default to 95 for testing
  };

  useEffect(() => {
    fetchConversations();
    // Refresh every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const userId = getUserId();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/user/ai-booking-conversations?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();

      // Fetch booking details for each conversation
      const bookingPromises = data.map(async (conv) => {
        try {
          const bookingResponse = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
            }/api/user/ai-booking-conversations/${
              conv.id
            }/booking?userId=${userId}`
          );
          if (bookingResponse.ok) {
            const bookingData = await bookingResponse.json();
            return { conversationId: conv.id, booking: bookingData.booking };
          }
        } catch (err) {
          console.error(
            `Error fetching booking for conversation ${conv.id}:`,
            err
          );
        }
        return { conversationId: conv.id, booking: null };
      });

      const bookingResults = await Promise.all(bookingPromises);
      const bookingMap = {};
      bookingResults.forEach((result) => {
        bookingMap[result.conversationId] = result.booking;
      });

      setConversations(data);
      setBookings(bookingMap);
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

    // For older dates, show short format
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const truncateMessage = (message, maxLength = 80) => {
    if (!message) return "No messages yet";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const getAppointmentNumberFromMeta = (meta) => {
    if (!meta) return null;

    try {
      const metadata = typeof meta === "string" ? JSON.parse(meta) : meta;
      if (metadata.appointmentId) {
        return `Appointment #${metadata.appointmentId}`;
      }
      return "Booking in Progress";
    } catch (e) {
      return null;
    }
  };

  const getBookingContextFromBooking = (booking, meta) => {
    if (!booking && !meta) return null;

    const parts = [];
    let status = null;

    // Use booking data if available, otherwise fall back to meta
    if (booking) {
      if (booking.doctor_name) {
        parts.push(`Dr. ${booking.doctor_name}`);
      }
      if (booking.date && booking.time) {
        try {
          let date;
          if (booking.date instanceof Date) {
            date = booking.date;
          } else if (typeof booking.date === "string") {
            // Handle ISO date strings
            if (booking.date.includes("T")) {
              // It's an ISO string, parse it and combine with time
              const baseDate = new Date(booking.date);
              if (!isNaN(baseDate.getTime())) {
                // Parse time (could be 12-hour or 24-hour format)
                const timeMatch = booking.time.match(
                  /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
                );
                if (timeMatch) {
                  let hours = parseInt(timeMatch[1]);
                  const minutes = parseInt(timeMatch[2]);
                  const ampm = timeMatch[3]?.toUpperCase();

                  if (ampm === "PM" && hours !== 12) hours += 12;
                  if (ampm === "AM" && hours === 12) hours = 0;

                  date = new Date(baseDate);
                  date.setHours(hours, minutes, 0, 0);
                } else {
                  date = baseDate; // Fallback to date without time
                }
              }
            } else {
              // Try standard date parsing
              date = new Date(`${booking.date} ${booking.time}`);
            }
          }

          if (date && !isNaN(date.getTime())) {
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
            parts.push(`${formattedDate}, ${formattedTime}`);
          } else {
            // Fallback to original format if parsing fails
            parts.push(`${booking.date} ${booking.time}`);
          }
        } catch (e) {
          // Fallback to original format
          parts.push(`${booking.date} ${booking.time}`);
        }
      }
      if (booking.appointment_type) {
        parts.push(
          booking.appointment_type === "offline" ? "In-person" : "Online"
        );
      }
      if (booking.status) {
        status =
          booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
      }
    } else if (meta) {
      // Fallback to meta data
      try {
        const metadata = typeof meta === "string" ? JSON.parse(meta) : meta;
        const bookingData = metadata.bookingData || {};

        if (bookingData.doctor) {
          if (
            typeof bookingData.doctor === "object" &&
            bookingData.doctor.name
          ) {
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
      } catch (e) {
        return null;
      }
    }

    return { parts, status };
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
              <small>
                Start a conversation with our AI assistant to book appointments
              </small>
            </div>
          ) : (
            conversations
              .filter((conv) => bookings[conv.id]) // Only show conversations with valid bookings
              .sort((a, b) => {
                const bookingA = bookings[a.id];
                const bookingB = bookings[b.id];
                const appointmentA = bookingA?.id || 0;
                const appointmentB = bookingB?.id || 0;
                return appointmentB - appointmentA; // Sort by appointment number descending
              })
              .map((conv) => {
                const booking = bookings[conv.id];
                return (
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
                          {booking
                            ? `Appointment #${booking.id}`
                            : getAppointmentNumberFromMeta(conv.meta) ||
                              "AI Booking Assistant"}
                        </span>
                        <span className="msg-time">
                          {formatTime(
                            conv.last_message_time || conv.updated_at
                          )}
                        </span>
                      </div>
                      {(() => {
                        const context = getBookingContextFromBooking(
                          booking,
                          conv.meta
                        );
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
                            {context.parts.join(" • ")}
                            {context.status && (
                              <>
                                {" • "}
                                <span
                                  style={{
                                    color: getStatusColor(context.status),
                                    fontWeight: "500",
                                  }}
                                >
                                  {context.status}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })()}

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
                );
              })
          )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default UserBookingConversationList;
