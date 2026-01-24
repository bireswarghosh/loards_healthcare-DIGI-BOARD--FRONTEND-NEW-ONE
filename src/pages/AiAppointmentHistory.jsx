import React, { useState, useEffect } from "react";
import Footer from "../components/footer/Footer";
import AiHistoryTable from "../components/tables/AiHistoryTable";
import { getUserTimezone } from "../lib/utils";
import { Modal, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

const AiAppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointmentData, setRescheduleAppointmentData] =
    useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelAppointmentData, setCancelAppointmentData] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const userTimezone = getUserTimezone();

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (showRescheduleModal) {
      setNewDate("");
      setNewTime("");
    }
  }, [showRescheduleModal]);

  useEffect(() => {
    if (showCancelModal) {
      setCancelReason("");
    }
  }, [showCancelModal]);

  const loadAppointments = async () => {
    try {
      // Use external API for appointment history
      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/appointments`,
        {
          headers: {
            "x-timezone": userTimezone,
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        // Transform external API data to match expected format
        const transformedAppointments = (result.appointments || [])
          .map((appointment) => ({
            id: appointment.id,
            appointmentId: appointment.id,
            patient_id: appointment.patient_id,
            patientName: appointment.patient_name,
            doctor_id: appointment.doctor_id,
            doctorName: appointment.doctor_name,
            problem: appointment.problem,
            appointment_type: appointment.appointment_type,
            time: appointment.time,
            status: appointment.status,
            created_at: appointment.createdAt,
            updated_at: appointment.updatedAt,
            date: appointment.date,
            cancel_reason: appointment.cancel_reason,
            Reschedule_date: appointment.Reschedule_date,
            Reschedule_time: appointment.Reschedule_time,
            payment_method: appointment.payment_method,
            transaction_id: appointment.transaction_id,
            booking_price: appointment.booking_price,
            prescription_by_doctor: appointment.prescription_by_doctor,
          }))
          .sort((a, b) => {
            // Sort by ID descending (newest first)
            return b.id - a.id;
          });
        setAppointments(transformedAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId,
    newStatus,
    cancelReason = ""
  ) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_LOARDS_URL
        }/api/v1/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Refresh the appointments list
        loadAppointments();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      return { success: false, error: "Network error" };
    }
  };

  const rescheduleAppointment = async (appointment) => {
    setRescheduleAppointmentData(appointment);
    setShowRescheduleModal(true);
  };

  const cancelAppointment = async (appointment) => {
    setCancelAppointmentData(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleAppointmentData?.id || !newDate || !newTime) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/appointments/${
          rescheduleAppointmentData.id
        }/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date: newDate, time: newTime }),
        }
      );

      if (response.ok) {
        setShowRescheduleModal(false);
        setNewDate("");
        setNewTime("");
        setRescheduleAppointmentData(null);
        loadAppointments();
        toast.success("Appointment rescheduled successfully!");
      } else {
        const error = await response.json();
        toast.error(
          "Failed to reschedule: " + (error.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Network error while rescheduling");
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelAppointmentData?.id) return;

    try {
      const result = await updateAppointmentStatus(
        cancelAppointmentData.id,
        "cancelled",
        cancelReason
      );
      if (result.success) {
        setShowCancelModal(false);
        setCancelReason("");
        setCancelAppointmentData(null);
        loadAppointments();
        toast.success("Appointment cancelled successfully!");
      } else {
        toast.error("Failed to cancel: " + result.error);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Network error while cancelling");
    }
  };

  const viewChat = async (appointment) => {
    setChatLoading(true);
    setChatModalOpen(true);
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      // First, find the conversation for this appointment
      const convResponse = await fetch(
        `${apiBaseUrl}/api/admin/ai-booking-conversations`
      );
      if (convResponse.ok) {
        const conversations = await convResponse.json();
        const conversation = conversations.find((conv) => {
          try {
            const meta = JSON.parse(conv.meta || "{}");
            return meta.appointmentId == appointment.id;
          } catch {
            return false;
          }
        });
        if (conversation) {
          // Fetch messages
          const msgResponse = await fetch(
            `${apiBaseUrl}/api/admin/ai-booking-conversations/${conversation.id}`
          );
          if (msgResponse.ok) {
            const convData = await msgResponse.json();
            setChatMessages(convData.messages || []);
          } else {
            setChatMessages([]);
          }
        } else {
          setChatMessages([]);
        }
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="row">
        <AiHistoryTable
          title="AI Appointment History"
          data={appointments}
          loading={loading}
          updateAppointmentStatus={updateAppointmentStatus}
          onReschedule={rescheduleAppointment}
          onCancel={cancelAppointment}
          columns={[
            {
              field: "created_at",
              header: "Date & Time",
              type: "datetime",
              sortable: true,
            },
            {
              field: "appointmentId",
              header: "Appointment ID",
              sortable: true,
            },
            {
              field: "patientName",
              header: "Patient Name",
              sortable: true,
            },
            {
              field: "doctorName",
              header: "Doctor Name",
              sortable: true,
            },
            {
              field: "problem",
              header: "Problem",
              type: "truncate",
              maxLength: 50,
              sortable: true,
            },
            {
              field: "appointment_type",
              header: "Type",
              sortable: true,
            },
            {
              field: "time",
              header: "Time",
              sortable: true,
            },
            {
              field: "status",
              header: "Status",
              type: "badge",
              badgeColor: (item) =>
                item.status === "completed"
                  ? "success"
                  : item.status === "pending"
                  ? "warning"
                  : item.status === "accepted"
                  ? "info"
                  : item.status === "cancelled"
                  ? "danger"
                  : "secondary",
              sortable: true,
            },
          ]}
          searchableFields={[
            "appointmentId",
            "problem",
            "patientName",
            "doctorName",
            "appointment_type",
            "time",
          ]}
          filterableFields={[
            { field: "status", label: "All Status" },
            { field: "model", label: "All Models" },
            { field: "appointment_type", label: "All Types" },
          ]}
          sortableFields={[
            "created_at",
            "appointmentId",
            "patientName",
            "doctorName",
            "problem",
            "appointment_type",
            "time",
            "status",
            "model",
          ]}
          onViewDetails={(item) => {
            // TODO: Implement appointment details modal
            console.log("View appointment details:", item);
          }}
          onRefresh={loadAppointments}
          showExport={true}
          onExport={() => {
            console.log("Export appointment history");
          }}
          renderDetailsModal={(item) => (
            <div className="row g-3 align-items-stretch">
              <div className="col-md-6">
                <div className="card border-primary h-100">
                  <div className="card-header bg-primary text-white py-2">
                    <h6 className="card-title mb-0">
                      <i className="fa-light fa-users me-2"></i>
                      Appointment Info
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    <div className="row g-2">
                      <div className="col-12 d-flex justify-content-between">
                        <span className="text-muted small">
                          Appointment ID:
                        </span>
                        <span className="fw-medium">{item.appointmentId}</span>
                      </div>
                      <div className="col-12 d-flex justify-content-between">
                        <span className="text-muted small">Patient:</span>
                        <span className="fw-medium">{item.patientName}</span>
                      </div>
                      <div className="col-12 d-flex justify-content-between">
                        <span className="text-muted small">Doctor:</span>
                        <span className="fw-medium">{item.doctorName}</span>
                      </div>
                      <div className="col-12 d-flex justify-content-between">
                        <span className="text-muted small">Status:</span>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge ${
                              item.status === "completed"
                                ? "bg-success"
                                : item.status === "pending"
                                ? "bg-warning"
                                : item.status === "accepted"
                                ? "bg-info"
                                : "bg-danger"
                            } p-1`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-info h-100">
                  <div className="card-header bg-info text-white py-2">
                    <h6 className="card-title mb-0">
                      <i className="fa-light fa-calendar me-2"></i>
                      Appointment Details
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Appointment ID:</span>
                      <span className="fw-medium">{item.appointmentId}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Date:</span>
                      <span className="fw-medium small">
                        {new Date(item.created_at).toLocaleDateString()}{" "}
                        {new Date(item.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Model:</span>
                      <span className="fw-medium">{item.model}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">
                        Appointment Type:
                      </span>
                      <span className="fw-medium">{item.appointment_type}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Time:</span>
                      <span className="fw-medium">{item.time}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Type:</span>
                      <span className="fw-medium">AI-Assisted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-success">
                  <div className="card-header bg-success text-white py-2">
                    <h6 className="card-title mb-0">
                      <i className="fa-light fa-notes-medical me-2"></i>
                      Appointment Information
                    </h6>
                  </div>
                  <div
                    className="card-body p-3"
                    style={{ maxHeight: "50vh", overflowY: "auto" }}
                  >
                    {item.problem && (
                      <div className="mb-3">
                        <h6 className="text-success mb-1">Problem</h6>
                        <p className="mb-0">{item.problem}</p>
                      </div>
                    )}

                    {item.appointment_type && (
                      <div className="mb-3">
                        <h6 className="text-success mb-1">Appointment Type</h6>
                        <p className="mb-0">{item.appointment_type}</p>
                      </div>
                    )}

                    {item.time && (
                      <div className="mb-3">
                        <h6 className="text-success mb-1">Scheduled Time</h6>
                        <p className="mb-0">{item.time}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          additionalActions={(item) => (
            <button
              className="btn btn-sm btn-outline-info"
              onClick={() => viewChat(item)}
              title="View Chat"
            >
              <i className="fa-light fa-comments"></i>
            </button>
          )}
        />
      </div>

      <Modal
        show={chatModalOpen}
        onHide={() => setChatModalOpen(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Appointment Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {chatLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading chat messages...</p>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="fa-light fa-inbox fa-3x mb-3"></i>
              <p>No chat messages found for this appointment</p>
            </div>
          ) : (
            <div className="chat-container" style={{ padding: "10px" }}>
              {chatMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`chat-message ${
                    msg.role === "user" ? "user" : "assistant"
                  }`}
                  style={{
                    display: "flex",
                    marginBottom: "15px",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className="message-bubble"
                    style={{
                      maxWidth: "70%",
                      padding: "10px 15px",
                      borderRadius: "18px",
                      backgroundColor:
                        msg.role === "user" ? "#007bff" : "#f1f1f1",
                      color: msg.role === "user" ? "#fff" : "#333",
                      position: "relative",
                      wordWrap: "break-word",
                    }}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div
                      className="message-time"
                      style={{
                        fontSize: "10px",
                        marginTop: "5px",
                        opacity: 0.7,
                        textAlign: msg.role === "user" ? "right" : "left",
                      }}
                    >
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Cancel Sidebar */}
      <div
        className={`right-sidebar ${showCancelModal ? "active" : ""}`}
        style={{ paddingTop: "60px" }}
      >
        <button
          className="right-bar-close"
          onClick={() => setShowCancelModal(false)}
        >
          <i className="fa-light fa-angle-right"></i>
        </button>
        <div className="sidebar-title">
          <h3>Cancel Appointment</h3>
        </div>
        <div className="sidebar-body">
          {cancelAppointmentData && (
            <div>
              <p>Are you sure you want to cancel this appointment?</p>
              <div className="mb-3">
                <strong>Appointment Details:</strong>
                <p className="mb-1">
                  ID: {cancelAppointmentData.appointmentId}
                </p>
                <p className="mb-1">
                  Patient: {cancelAppointmentData.patientName}
                </p>
                <p className="mb-1">
                  Doctor: {cancelAppointmentData.doctorName}
                </p>
                <p className="mb-0">Time: {cancelAppointmentData.time}</p>
              </div>
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
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Appointment
                </Button>
                <Button variant="danger" onClick={handleCancelAppointment}>
                  Cancel Appointment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Sidebar */}
      <div
        className={`right-sidebar ${showRescheduleModal ? "active" : ""}`}
        style={{ paddingTop: "60px" }}
      >
        <button
          className="right-bar-close"
          onClick={() => setShowRescheduleModal(false)}
        >
          <i className="fa-light fa-angle-right"></i>
        </button>
        <div className="sidebar-title">
          <h3>Reschedule Appointment</h3>
        </div>
        <div className="sidebar-body">
          {rescheduleAppointmentData && (
            <div>
              <div className="mb-3">
                <strong>Current Appointment:</strong>
                <p className="mb-1">
                  ID: {rescheduleAppointmentData.appointmentId}
                </p>
                <p className="mb-1">
                  Patient: {rescheduleAppointmentData.patientName}
                </p>
                <p className="mb-1">
                  Doctor: {rescheduleAppointmentData.doctorName}
                </p>
                <p className="mb-1">Time: {rescheduleAppointmentData.time}</p>
                <p className="mb-0">
                  Date:{" "}
                  {new Date(
                    rescheduleAppointmentData.created_at
                  ).toLocaleDateString()}
                </p>
              </div>
              <hr />
              <Form.Group className="mb-3">
                <Form.Label>New Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Time</Form.Label>
                <Form.Select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                >
                  <option value="">Select a time slot</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </Form.Select>
              </Form.Group>
              <div className="d-flex gap-2">
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
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AiAppointmentHistory;
