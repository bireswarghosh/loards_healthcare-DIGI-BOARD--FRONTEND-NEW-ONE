import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../axiosInstance";

const DoctorWiseAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New state to manage the expanded/collapsed state of each doctor's appointments
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(""); // view | cancel | reschedule
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctormaster/active");
      if (res.data.success) {
        setDoctors(res.data.data);
        fetchAllAppointments();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      const res = await axiosInstance.get("/appointments");
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load appointments");
    }
  };

  const getAppointmentsForDoctor = (doctorId) => {
    return appointments.filter((apt) => apt.doctor_id === doctorId);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return timeString.slice(0, 5);
  };

  // Function to toggle the expanded state
  const toggleDoctorAppointments = (doctorId) => {
    setExpandedDoctorId(doctorId === expandedDoctorId ? null : doctorId);
  };

  const openDrawer = (type, appointment) => {
    setDrawerType(type);
    setSelectedAppointment(appointment);

    if (type === "reschedule") {
      const date = new Date(appointment.date).toISOString().split("T")[0];
      let time = appointment.time.includes("T")
        ? new Date(appointment.time).toTimeString().slice(0, 5)
        : appointment.time.slice(0, 5);
      setRescheduleData({ date, time });
    }
    setShowDrawer(true);
  };

  const getStatusBadge = (status) => {
    if (status === "accepted") return "bg-success";
    if (status === "cancelled") return "bg-danger";
    if (status === "complete" || status === "completed") return "bg-primary";
    return "bg-warning";
  };

  // ACTION --- ACCEPT
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const res = await axiosInstance.put(`/appointments/${appointmentId}/status`, { status });
      if (res.data.success) {
        fetchAllAppointments();
        toast.success(`Appointment ${status} successfully`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ACTION --- COMPLETE
  const completeAppointment = async (appointmentId) => {
    try {
      const res = await axiosInstance.put(`/appointments/${appointmentId}/status`, {
        status: "completed",
      });
      if (res.data.success) {
        fetchAllAppointments();
        toast.success("Appointment marked completed");
      }
    } catch (error) {
      toast.error("Failed to complete appointment");
    }
  };

  // ACTION --- CANCEL
  const handleCancelSubmit = async () => {
    if (cancelReason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }

    try {
      const res = await axiosInstance.put(
        `/appointments/${selectedAppointment.id}/cancel`,
        { reason: cancelReason }
      );
      if (res.data.success) {
        fetchAllAppointments();
        toast.success("Appointment cancelled");
        setCancelReason("");
        setShowDrawer(false);
      }
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  // ACTION --- RESCHEDULE
  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error("Date & time required");
      return;
    }

    try {
      const res = await axiosInstance.put(
        `/appointments/${selectedAppointment.id}/reschedule`,
        rescheduleData
      );
      if (res.data.success) {
        fetchAllAppointments();
        toast.success("Appointment rescheduled");
        setShowDrawer(false);
      }
    } catch (error) {
      toast.error("Failed to reschedule");
    }
  };

  // Filtering logic for appointments
  const filteredAppointments = (doctorAppointments) => {
    return doctorAppointments
      .filter((a) => {
        const s = searchTerm.toLowerCase();
        const matchSearch =
          a.patient_name.toLowerCase().includes(s) ||
          a.problem?.toLowerCase().includes(s);

        const matchFilter =
          filterStatus === "all" ||
          a.status === filterStatus ||
          (filterStatus === "pending" && (!a.status || a.status === "pending"));

        return matchSearch && matchFilter;
      });
  };

  return (
    <div className="main-content">
      <ToastContainer />

      {/* PANEL START */}
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>👨‍⚕️ Doctor Wise Appointments</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 180 }}
            />

            <select
              className="form-select form-select-sm"
              style={{ width: 150 }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="cancelled">Cancelled</option>
              <option value="complete">Completed</option>
            </select>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent style={{ height: "72vh" }}>
              {doctors.map((doctor) => {
                const doctorAppointments = getAppointmentsForDoctor(
                  doctor.DoctorId
                );
                const isExpanded = doctor.DoctorId === expandedDoctorId;

                // Apply filtering to the list
                const displayedAppointments = filteredAppointments(doctorAppointments);

                return (
                  <div
                    key={doctor.DoctorId}
                    className="mb-3 border rounded shadow-sm"
                  >
                    <div
                    //   className={`p-3 d-flex justify-content-between align-items-center ${isExpanded ? 'bg-light' : ''}`}
                      className={`p-3 d-flex justify-content-between align-items-center `}
                      onClick={() => toggleDoctorAppointments(doctor.DoctorId)}
                      style={{ cursor: "pointer" }}
                    >
                      <h6 className="mb-0">
                        <i
                          className={`fa-solid me-2 ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'}`}
                        ></i>
                        <strong>Dr. {doctor.Doctor}</strong>{" "}
                        <small className="text-muted">{doctor.Qualification}</small>
                        <span className="badge bg-dark ms-2">
                          {doctorAppointments.length} Appointments
                        </span>
                      </h6>
                      {/* <span className="text-primary fw-bold">
                          {displayedAppointments.length} Matched
                      </span> */}
                    </div>

                    {/* Conditional Rendering for Dropdown Content */}
                    {isExpanded && (
                      <div className="p-3 pt-0">
                        <table className="table table-sm table-striped table-hover mb-0">
                          <thead className="">
                            <tr>
                              <th>ID</th>
                              <th>Patient</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Type</th>
                              <th>Problem</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {displayedAppointments.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="text-center py-3">
                                  No Appointments {searchTerm || filterStatus !== 'all' ? 'found for current filter.' : 'booked.'}
                                </td>
                              </tr>
                            ) : (
                              displayedAppointments.map((apt) => (
                                <tr key={apt.id}>
                                  <td>#{apt.id}</td>
                                  <td>{apt.patient_name}</td>
                                  <td>{new Date(apt.date).toLocaleDateString()}</td>
                                  <td>{formatTime(apt.time)}</td>
                                  <td>
                                    <span className="badge bg-info text-dark">
                                      {apt.appointment_type}
                                    </span>
                                  </td>
                                  <td>{apt.problem || "N/A"}</td>
                                  <td>
                                    <span
                                      className={`badge ${getStatusBadge(
                                        apt.status
                                      )}`}
                                    >
                                      {apt.status || "pending"}
                                    </span>
                                  </td>

                                  <td>
                                    {/* ACTION BUTTON LOGIC */}
                                    {apt.status === "accepted" ? (
                                      <>
                                        <button
                                          className="btn btn-primary btn-sm me-1"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent dropdown toggle
                                            completeAppointment(apt.id);
                                          }}
                                        >
                                          Complete
                                        </button>
                                        <button
                                          className="btn btn-outline-info btn-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDrawer("view", apt);
                                          }}
                                        >
                                          View
                                        </button>
                                      </>
                                    ) : apt.status === "cancelled" ? (
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openDrawer("view", apt);
                                        }}
                                      >
                                        Reason
                                      </button>
                                    ) : apt.status === "complete" ||
                                      apt.status === "completed" ? (
                                      <span className="badge bg-success">Done</span>
                                    ) : (
                                      <>
                                        <button
                                          className="btn btn-success btn-sm me-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateAppointmentStatus(apt.id, "accepted");
                                          }}
                                        >
                                          Accept
                                        </button>
                                        <button
                                          className="btn btn-danger btn-sm me-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDrawer("cancel", apt);
                                          }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className="btn btn-warning btn-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDrawer("reschedule", apt);
                                          }}
                                        >
                                          Reschedule
                                        </button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* DRAWER (Remains unchanged) */}
      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "430px",
              right: "0",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div
                className="dropdown-txt"
                style={{
                  backgroundColor: "#0a1735",
                  color: "#fff",
                  padding: 10,
                }}
              >
                {drawerType === "view"
                  ? "👁️ Appointment Details"
                  : drawerType === "cancel"
                  ? "❌ Cancel Appointment"
                  : "📅 Reschedule Appointment"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100%)" }}>
                <div className="p-3">
                  {/* VIEW DETAILS */}
                  {drawerType === "view" && (
                    <div>
                      <h6>Patient: {selectedAppointment?.patient_name}</h6>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(selectedAppointment?.date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {formatTime(selectedAppointment?.time)}
                      </p>
                      <p>
                        <strong>Problem:</strong>{" "}
                        {selectedAppointment?.problem || "No data"}
                      </p>

                      {selectedAppointment?.cancel_reason && (
                        <p className="text-danger">
                          <strong>Reason:</strong>{" "}
                          {selectedAppointment.cancel_reason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* CANCEL */}
                  {drawerType === "cancel" && (
                    <div>
                      <label className="form-label fw-bold">
                        Reason for Cancel *
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      ></textarea>

                      <button
                        className="btn btn-danger w-100 mt-3"
                        onClick={handleCancelSubmit}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}

                  {/* RESCHEDULE */}
                  {drawerType === "reschedule" && (
                    <div>
                      <label className="form-label fw-bold">New Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={rescheduleData.date}
                        onChange={(e) =>
                          setRescheduleData({
                            ...rescheduleData,
                            date: e.target.value,
                          })
                        }
                      />

                      <label className="form-label fw-bold mt-3">
                        New Time
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        value={rescheduleData.time}
                        onChange={(e) =>
                          setRescheduleData({
                            ...rescheduleData,
                            time: e.target.value,
                          })
                        }
                      />

                      <button
                        className="btn btn-warning w-100 mt-3"
                        onClick={handleRescheduleSubmit}
                      >
                        Reschedule Appointment
                      </button>
                    </div>
                  )}
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorWiseAppointments;