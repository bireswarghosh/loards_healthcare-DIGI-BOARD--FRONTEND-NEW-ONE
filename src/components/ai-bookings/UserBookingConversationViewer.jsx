import React, { useState, useEffect, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Modal, Button, Form } from "react-bootstrap";

const UserBookingConversationViewer = ({ conversationId }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const scrollRef = useRef(null);

  // Get user ID from localStorage or context
  const getUserId = () => {
    return localStorage.getItem("userId") || "95"; // Default to 95 for testing
  };

  // Helper function to parse appointment date and time
  const parseAppointmentDateTime = (date, time) => {
    // Convert time from '9:00 AM' format to 24-hour format
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!timeMatch) return new Date(date + "T" + time); // fallback

    let [_, hours, minutes, ampm] = timeMatch;
    hours = parseInt(hours);
    if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;

    const time24 = `${hours.toString().padStart(2, "0")}:${minutes}`;
    return new Date(`${date}T${time24}`);
  };

  useEffect(() => {
    if (showRescheduleModal) {
      // Reset form when modal opens
      setNewDate("");
      setNewTime("");
    }
  }, [showRescheduleModal]);

  useEffect(() => {
    fetchConversationDetails();
  }, [conversationId]);

  const fetchConversationDetails = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const userId = getUserId();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/user/ai-booking-conversations/${conversationId}?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const data = await response.json();
      setConversation(data.conversation);
      setMessages(data.messages);

      // Fetch booking details if conversation has appointment
      if (data.conversation?.meta) {
        try {
          const metadata = JSON.parse(data.conversation.meta);
          if (metadata.appointmentId) {
            fetchBookingDetails();
          }
        } catch (e) {
          console.error("Error parsing conversation meta:", e);
        }
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    if (!conversationId) return;

    try {
      const userId = getUserId();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/user/ai-booking-conversations/${conversationId}/booking?userId=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelAppointment = async () => {
    if (!booking?.id) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/appointments/${
          booking.id
        }/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        }
      );

      if (response.ok) {
        setShowCancelModal(false);
        setCancelReason("");
        fetchBookingDetails(); // Refresh booking details
        alert("Appointment cancelled successfully");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment");
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!booking?.id || !newDate || !newTime) return;

    // Check if current appointment hasn't passed (allow for testing/demo purposes)
    const currentAppointmentDateTime = parseAppointmentDateTime(
      booking.date,
      booking.time
    );
    const now = new Date();
    // Comment out the restriction for demo purposes
    // if (currentAppointmentDateTime <= now) {
    //   alert("Cannot reschedule appointments that have already passed.");
    //   return;
    // }

    // Additional validation for today's date
    const today = new Date().toISOString().split("T")[0];
    if (newDate === today) {
      const selectedTime = new Date(`${newDate}T${newTime}`);
      if (selectedTime <= now) {
        alert("Please select a future time for today's appointments.");
        return;
      }
    }

    // Check if selected date is within 15 days
    const selectedDate = new Date(newDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 15);
    if (selectedDate > maxDate) {
      alert("You can only reschedule appointments within the next 15 days.");
      return;
    }

    // Basic business hours validation (9 AM to 6 PM) - all dropdown options should be valid
    const [hours, minutes] = newTime.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const businessStart = 9 * 60; // 9:00 AM
    const businessEnd = 18 * 60; // 6:00 PM

    if (timeInMinutes < businessStart || timeInMinutes > businessEnd) {
      alert("Please select a valid time slot between 9:00 AM and 6:00 PM.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/appointments/${
          booking.id
        }/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: newDate,
            time: newTime,
          }),
        }
      );

      if (response.ok) {
        setShowRescheduleModal(false);
        setNewDate("");
        setNewTime("");
        fetchBookingDetails(); // Refresh booking details
        alert("Appointment rescheduled successfully");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to reschedule appointment");
      }
    } catch (err) {
      console.error("Error rescheduling appointment:", err);
      alert("Failed to reschedule appointment");
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
          <i className="fa-light fa-comments fa-4x mb-3"></i>
          <h5>Select a conversation</h5>
          <p>
            Choose a conversation from the list to view your chat with the AI
            assistant and manage your appointment
          </p>
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
              <img src="/assets/images/admin.png" alt="AI Assistant" />
            </div>
            <div>
              <h6 className="mb-0">
                {booking
                  ? `Appointment #${booking.id}`
                  : "AI Booking Assistant"}
              </h6>
              <small className="text-muted">
                {conversation?.title || "Appointment Booking Chat"}
              </small>
            </div>
          </div>
          <div className="text-end">
            {booking && (
              <div className="mt-1">
                <small
                  className={`text-${
                    booking.status === "confirmed"
                      ? "success"
                      : booking.status === "pending"
                      ? "warning"
                      : booking.status === "cancelled"
                      ? "danger"
                      : "muted"
                  }`}
                >
                  Status: {booking.status}
                </small>
              </div>
            )}
          </div>
          <div className="text-end">
            <div className="mt-2">
              {booking &&
                booking.status !== "cancelled" &&
                booking.status !== "completed" && (
                  <>
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setShowRescheduleModal(true)}
                    >
                      Reschedule
                    </button>
                  </>
                )}
              {booking && booking.status === "cancelled" && (
                <small className="text-danger">Appointment cancelled</small>
              )}
              {booking && booking.status === "completed" && (
                <small className="text-success">Appointment completed</small>
              )}
              {booking &&
                (() => {
                  const appointmentDateTime = parseAppointmentDateTime(
                    booking.date,
                    booking.time
                  );
                  return (
                    appointmentDateTime <= new Date() &&
                    booking.status !== "cancelled" &&
                    booking.status !== "completed"
                  );
                })() && <small className="text-muted">Past appointment</small>}
            </div>
            {/* Cancel Modal */}
            <Modal
              show={showCancelModal}
              onHide={() => setShowCancelModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Cancel Appointment</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Are you sure you want to cancel this appointment?</p>
                <Form.Group className="mb-3">
                  <Form.Label>Reason (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Appointment
                </Button>
                <Button variant="danger" onClick={handleCancelAppointment}>
                  Cancel Appointment
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Reschedule Modal */}
            <Modal
              show={showRescheduleModal}
              onHide={() => setShowRescheduleModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Reschedule Appointment</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="mb-3">
                  <strong>Current Appointment:</strong>
                  <p className="mb-1">Date: {booking?.date}</p>
                  <p className="mb-1">Time: {booking?.time}</p>
                  <p className="mb-0">Doctor: {booking?.doctor_name}</p>
                </div>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Label>New Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    max={(() => {
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 15);
                      return maxDate.toISOString().split("T")[0];
                    })()}
                  />
                  <Form.Text className="text-muted">
                    Select a date within the next 15 days for rescheduling.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Time</Form.Label>
                  <Form.Select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                  >
                    <option value="">Select a time slot</option>
                    {/* Hourly slots: 9:00 AM - 5:00 PM */}
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    {/* Last slot: 6:00 PM */}
                    <option value="18:00">6:00 PM</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Business hours: 9:00 AM - 6:00 PM. All slots are 1-hour
                    intervals.
                  </Form.Text>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRescheduleAppointment}
                  disabled={!newDate || !newTime}
                >
                  Reschedule
                </Button>
              </Modal.Footer>
            </Modal>
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
                        msg.role === "user" ? "outgoing" : ""
                      }`}
                    >
                      {msg.role === "user" ? (
                        <>
                          <div className="msg-box">
                            <div className="msg-box-inner">
                              <div className="msg-option">
                                <span className="msg-time">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                              <span className="sent-status seen" title="sent">
                                <i className="fa-solid fa-circle-check"></i>
                              </span>
                              <p style={{ whiteSpace: "pre-wrap" }}>
                                {msg.content}
                              </p>
                            </div>
                          </div>
                          <div className="avatar">
                            <img src="/assets/images/avatar-2.png" alt="You" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="avatar">
                            <img
                              src="/assets/images/admin.png"
                              alt="AI Assistant"
                            />
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

export default UserBookingConversationViewer;
