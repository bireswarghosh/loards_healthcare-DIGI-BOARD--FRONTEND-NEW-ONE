import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const DiagnosticBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState("add"); 
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    testId: "",
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "pending",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientPage, setPatientPage] = useState(1);
  const [patientPagination, setPatientPagination] = useState(null);
  const [tests, setTests] = useState([]);
  const [testPage, setTestPage] = useState(1);
  const [testPagination, setTestPagination] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (drawerOpen && mode === "add") {
      fetchPatients(patientPage);
    }
  }, [drawerOpen, patientPage, mode]);

  useEffect(() => {
    if (drawerOpen) {
      fetchTests(testPage);
    }
  }, [drawerOpen, testPage]);

  const fetchPatients = async (page = 1) => {
    try {
      const response = await axiosInstance.get(`/appointment-booking-app/patients?page=${page}&limit=10`);
      if (response.data.success) {
        setPatients(response.data.data || []);
        setPatientPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchTests = async (page = 1) => {
    try {
      const response = await axiosInstance.get(`/diagnostic/tests?page=${page}&limit=10`);
      if (response.data.success) {
        setTests(response.data.data || []);
        setTestPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/diagnostic/bookings");
      setBookings(response.data.data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    setMode("add");
    setFormData({
      name: "",
      email: "",
      phone: "",
      testId: "",
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      status: "pending",
    });
    setSelectedFile(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (booking) => {
    setMode("edit");
    setSelectedBooking(booking);

    // Use formatted_time if available, otherwise extract from datetime
    let timeValue = booking.formatted_time || "";
    if (!timeValue && booking.appointment_time) {
      const timeDate = new Date(booking.appointment_time);
      const hours = timeDate.getUTCHours().toString().padStart(2, '0');
      const minutes = timeDate.getUTCMinutes().toString().padStart(2, '0');
      timeValue = `${hours}:${minutes}`;
    }

    setFormData({
      name: booking.name || "",
      email: booking.email || "",
      phone: booking.phone || "",
      testId: booking.test_id || "",
      patientId: booking.patient_id || "",
      appointmentDate: booking.appointment_date?.split("T")[0] || "",
      appointmentTime: timeValue,
      status: booking.status || "pending",
    });
    setSelectedFile(null);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      let response;
      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
      if (selectedFile) fd.append("diagnostic_prescription", selectedFile);

      if (mode === "edit") {
        response = await axiosInstance.put(
          `/diagnostic/booking/${selectedBooking.id}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axiosInstance.post("/diagnostic/booking", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        fetchBookings();
        setDrawerOpen(false);
      }
    } catch (err) {
      console.log(err);
      alert("Error saving booking");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const response = await axiosInstance.delete(`/diagnostic/booking/${id}`);
      if (response.data.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting booking");
    }
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find((p) => p.id === parseInt(patientId));
    if (!patient) return;
    setFormData((prev) => ({
      ...prev,
      patientId: patientId,
      name: patient.fullName,
      email: patient.email || "",
      phone: patient.mobileNo || "",
    }));
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-warning",
      confirmed: "bg-primary",
      completed: "bg-success",
      cancelled: "bg-danger",
    };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  return (
    <>
      <div className="main-content">
        <div className="panel">
          <div className="panel-header d-flex justify-content-between align-items-center">
            <h5>🧪 Diagnostic Bookings</h5>
            <button className="btn btn-sm btn-primary" onClick={openAddDrawer}>
              <i className="fa-light fa-plus"></i> Add New
            </button>
          </div>

          <div className="panel-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <OverlayScrollbarsComponent>
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th className="text-start">Action</th>
                      <th>Name</th>
                      <th>Test</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      bookings.map((row) => (
                        <tr key={row.id}>
                          <td className="text-start">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => openEditDrawer(row)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(row.id)}
                            >
                              Delete
                            </button>
                          </td>

                          <td>{row.name}</td>
                          <td>{row.test_name}</td>
                          <td>
                            {row.appointment_date
                              ? new Date(row.appointment_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            {row.formatted_time ? (() => {
                              const [hours, minutes] = row.formatted_time.split(':');
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const displayHour = hour % 12 || 12;
                              return `${displayHour}:${minutes} ${ampm}`;
                            })() : "N/A"}
                          </td>
                          <td>{getStatusBadge(row.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </OverlayScrollbarsComponent>
            )}
          </div>
        </div>

        {drawerOpen && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={() => setDrawerOpen(false)}
              style={{ zIndex: 9998 }}
            ></div>

            <div
              className="profile-right-sidebar active"
              style={{
                zIndex: 9999,
                width: "100%",
                maxWidth: "500px",
                right: drawerOpen ? "0" : "-100%",
                top: "70px",
                height: "calc(100vh - 70px)",
              }}
            >
              <button
                className="right-bar-close"
                onClick={() => setDrawerOpen(false)}
              >
                <i className="fa-light fa-angle-right"></i>
              </button>

              <div className="top-panel">
                <div
                  className="dropdown-txt"
                  style={{ position: "sticky", top: 0, background: "#0a1735" }}
                >
                  {mode === "add" ? "➕ Add Booking" : "✏️ Edit Booking"}
                </div>

                <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                  <div className="p-3">
                    <div className="row g-3">
                      {mode === "add" && (
                        <div className="col-12">
                          <label className="form-label">Select Patient</label>
                          <select
                            className="form-control"
                            value={formData.patientId}
                            onChange={(e) => handlePatientSelect(e.target.value)}
                          >
                            <option value="">Select Patient</option>
                            {patients.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.fullName} - {p.mobileNo}
                              </option>
                            ))}
                          </select>
                          
                          {patientPagination && (
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <small className="text-muted">
                                Page {patientPagination.currentPage} of {patientPagination.totalPages}
                              </small>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary"
                                  disabled={!patientPagination.hasPrev}
                                  onClick={() => setPatientPage(p => p - 1)}
                                >
                                  Prev
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  disabled={!patientPagination.hasNext}
                                  onClick={() => setPatientPage(p => p + 1)}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="col-md-12">
                        <label>Name</label>
                        <input
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label>Phone</label>
                        <input
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="col-md-12">
                        <label>Select Test</label>
                        <select
                          className="form-control"
                          value={formData.testId}
                          onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                        >
                          <option value="">Select Test</option>
                          {tests.map((t) => (
                            <option key={t.TestId} value={t.TestId}>
                              {t.Test} - ₹{t.Rate}
                            </option>
                          ))}
                        </select>
                        
                        {testPagination && (
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted">
                              Page {testPagination.currentPage} of {testPagination.totalPages}
                            </small>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-secondary"
                                disabled={!testPagination.hasPrev}
                                onClick={() => setTestPage(p => p - 1)}
                              >
                                Prev
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                disabled={!testPagination.hasNext}
                                onClick={() => setTestPage(p => p + 1)}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label>Appointment Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.appointmentDate}
                          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label>Appointment Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.appointmentTime}
                          onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                        />
                      </div>

                      <div className="col-md-12">
                        <label>{mode === "edit" ? "Update Prescription (Optional)" : "Prescription File"}</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="form-control"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <small className="text-muted">{mode === "edit" ? "Leave empty to keep existing" : "Upload prescription"}</small>
                      </div>

                      <div className="col-md-12">
                        <label>Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-secondary w-50"
                        onClick={() => setDrawerOpen(false)}
                      >
                        Cancel
                      </button>
                      <button className="btn btn-primary w-50" onClick={handleSave}>
                        {mode === "add" ? "Create Booking" : "Update Booking"}
                      </button>
                    </div>
                  </div>
                </OverlayScrollbarsComponent>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DiagnosticBookingList;
