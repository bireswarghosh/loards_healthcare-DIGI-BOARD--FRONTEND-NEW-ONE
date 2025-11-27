import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"; // Added for sidebar modal and table scrolling
import axiosInstance from "../../../axiosInstance";

const NursingBookingList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nursingBookings, setNursingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nursing_package_id: "",
    patient_id: "",
    existing_patient: "no",
    patient_name: "",
    phone_number: "",
    email: "",
    gender: "",
    age: "",
    address: "",
    start_date: "",
    end_date: "",
    advance_booking: "",
    transaction_id: "",
    status: "pending"
  });

  const [patients, setPatients] = useState([]);
  const [patientPage, setPatientPage] = useState(1);
  const [patientPagination, setPatientPagination] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchNursingBookings();
  }, []);

  useEffect(() => {
    if (showModal && !isEditMode) {
      fetchPatients(patientPage);
    }
  }, [showModal, patientPage, isEditMode]);

  useEffect(() => {
    if (showModal) {
      fetchPackages();
    }
  }, [showModal]);

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

  const fetchPackages = async () => {
    try {
      const response = await axiosInstance.get("/nursing");
      if (response.data.success) {
        const allPackages = [];
        for (const category of response.data.categories) {
          const pkgResponse = await axiosInstance.get(`/nursing/packages/${category.id}`);
          if (pkgResponse.data.success) {
            allPackages.push(...pkgResponse.data.packages);
          }
        }
        setPackages(allPackages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchNursingBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/nursing-bookings");
      if (response.data.success) {
        setNursingBookings(response.data.bookings || response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching nursing bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      nursing_package_id: "",
      patient_id: "",
      existing_patient: "no",
      patient_name: "",
      phone_number: "",
      email: "",
      gender: "",
      age: "",
      address: "",
      start_date: "",
      end_date: "",
      advance_booking: "",
      transaction_id: "",
      status: "pending"
    });
    setSelectedBooking(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (booking) => {
    setFormData({
      nursing_package_id: booking.nursing_package_id,
      patient_id: booking.patient_id || "",
      existing_patient: booking.existing_patient || "no",
      patient_name: booking.patient_name,
      phone_number: booking.phone_number,
      email: booking.email || "",
      gender: booking.gender || "",
      age: booking.age || "",
      address: booking.address,
      start_date: booking.start_date ? booking.start_date.split('T')[0] : "",
      end_date: booking.end_date ? booking.end_date.split('T')[0] : "",
      advance_booking: booking.advance_booking,
      transaction_id: booking.transaction_id,
      status: booking.status || "pending"
    });
    setSelectedBooking(booking);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find((p) => p.id === parseInt(patientId));
    if (!patient) return;
    setFormData((prev) => ({
      ...prev,
      patient_id: patientId,
      patient_name: patient.fullName,
      phone_number: patient.mobileNo || "",
      email: patient.email || "",
      gender: patient.gender || "",
      age: patient.age || "",
      address: patient.address || "",
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.nursing_package_id || !formData.start_date || !formData.end_date) {
        alert("Please fill in Package, Start Date, and End Date");
        return;
      }

      if (!formData.patient_name || !formData.phone_number || !formData.email || !formData.gender || !formData.age || !formData.address) {
        alert("Please fill in all patient details");
        return;
      }

      const payload = {
        nursing_package_id: parseInt(formData.nursing_package_id),
        patient_name: formData.patient_name,
        phone_number: formData.phone_number,
        email: formData.email,
        gender: formData.gender,
        age: parseInt(formData.age),
        address: formData.address,
        start_date: formData.start_date,
        end_date: formData.end_date,
        advance_booking: formData.advance_booking ? parseFloat(formData.advance_booking) : 0,
        transaction_id: formData.transaction_id || null,
        status: formData.status
      };

      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`/nursing-bookings/${selectedBooking.id}`, payload);
      } else {
        payload.patient_id = formData.patient_id ? parseInt(formData.patient_id) : null;
        payload.existing_patient = formData.existing_patient;
        response = await axiosInstance.post("/nursing-bookings", payload);
      }

      if (response.data.success) {
        alert("Booking saved successfully!");
        fetchNursingBookings();
        setShowModal(false);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error saving:", error);
      console.error("Error response:", error.response?.data);
      alert("Error: " + (error.response?.data?.message || "Failed to save"));
    }
  };

  const handleDelete = async (booking) => {
    if (window.confirm(`Are you sure you want to cancel this booking?`)) {
      try {
        const response = await axiosInstance.put(
          `/nursing-bookings/${booking.id}/status`,
          { status: "cancelled" }
        );
        if (response.data.success) {
          alert("Booking cancelled successfully!");
          fetchNursingBookings();
        } else {
          alert("Error: " + response.data.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error: " + (error.response?.data?.message || "Failed to cancel"));
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setIsEditMode(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge bg-warning">Pending</span>;
      case "confirmed":
        return <span className="badge bg-primary">Confirmed</span>;
      case "in_progress":
        return <span className="badge bg-info">In Progress</span>;
      case "completed":
        return <span className="badge bg-success">Completed</span>;
      case "cancelled":
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <>
      {/* Changed to main-content wrapper style */}
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            {/* Changed to panel style */}
            <div className="panel">
              <div className="panel-header">
                <h5>👩‍⚕️ Nursing Booking Management</h5>
                <div className="btn-box">
                  {/* Changed button style */}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleAddNew}
                  >
                    <i className="fa-light fa-plus"></i> NEW BOOKING
                  </button>
                </div>
              </div>

              <div className="panel-body">
                <div className="table-responsive">
                  <OverlayScrollbarsComponent>
                    {/* Changed table classes to match NurshingCare.jsx */}
                    <table className="table table-dashed table-hover digi-dataTable table-striped align-middle">
                      <thead>
                        <tr>
                          <th className="no-sort">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                            </div>
                          </th>
                          <th className="text-center">Action</th>
                          <th>SLNo.</th>
                          <th>Patient Name</th>
                          <th>Phone</th>
                          <th>Package</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Advance</th>
                          <th>Transaction ID</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="10" className="text-center py-4">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : nursingBookings.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center py-4">
                              No nursing bookings found
                            </td>
                          </tr>
                        ) : (
                          nursingBookings.map((booking, index) => (
                            <tr key={booking.id}>
                              <td>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                  <button
                                    className="fa-light fa-pen bg-transparent border-0 p-0"
                                    style={{
                                      outline: "none",
                                      boxShadow: "none",
                                      color: "inherit", // 🌟 theme adaptive
                                    }}
                                    onClick={() => handleEdit(booking)}
                                  ></button>
                                  <button
                                    className="fa-light fa-trash bg-transparent border-0 p-0"
                                    style={{
                                      outline: "none",
                                      boxShadow: "none",
                                      color: "inherit", // 🌟 theme adaptive
                                    }}
                                    onClick={() => handleDelete(booking)}
                                  ></button>
                                </div>
                              </td>
                              <td>{index + 1}</td>
                              <td>{booking.patient_name}</td>
                              <td>{booking.phone_number}</td>
                              <td>{booking.package_name || "N/A"}</td>
                              <td>
                                {new Date(
                                  booking.start_date
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                {new Date(
                                  booking.end_date
                                ).toLocaleDateString()}
                              </td>
                              <td>₹{booking.advance_booking || 0}</td>
                              <td>{booking.transaction_id || "N/A"}</td>
                              <td>{getStatusBadge(booking.status)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </OverlayScrollbarsComponent>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Changed to sidebar modal style */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className={`profile-right-sidebar ${showModal ? "active" : ""}`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "800px",
              right: showModal ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={handleCloseModal}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div
              className="top-panel"
              style={{ height: "100%", paddingTop: "10px" }}
            >
              <div
                className="dropdown-txt"
                style={{ position: "sticky", top: 0, zIndex: 10 }}
              >
                {isEditMode
                  ? "✏️ Edit Nursing Booking"
                  : "➕ Add New Nursing Booking"}
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave();
                    }}
                  >
                    <div className="row">
                      {!isEditMode && (
                        <div className="col-12 mb-3">
                          <label className="form-label">Select Patient</label>
                          <select
                            className="form-control"
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
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Patient Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.patient_name}
                          onChange={(e) =>
                            handleInputChange("patient_name", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.phone_number}
                          onChange={(e) =>
                            handleInputChange("phone_number", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Address</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-control"
                          value={formData.gender}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.age}
                          onChange={(e) =>
                            handleInputChange("age", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nursing Package</label>
                        <select
                          className="form-control"
                          value={formData.nursing_package_id}
                          onChange={(e) =>
                            handleInputChange("nursing_package_id", e.target.value)
                          }
                        >
                          <option value="">Select Package</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.package_name} - ₹{pkg.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.start_date}
                          onChange={(e) =>
                            handleInputChange("start_date", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.end_date}
                          onChange={(e) =>
                            handleInputChange("end_date", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Advance Booking Amount
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.advance_booking}
                          onChange={(e) =>
                            handleInputChange("advance_booking", e.target.value)
                          }
                          placeholder="Enter advance amount"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Transaction ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.transaction_id}
                          onChange={(e) =>
                            handleInputChange("transaction_id", e.target.value)
                          }
                          placeholder="Enter transaction ID"
                        />
                      </div>
                      {isEditMode && (
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Status</label>
                          <select
                            className="form-control"
                            value={formData.status}
                            onChange={(e) =>
                              handleInputChange("status", e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary w-50">
                        {isEditMode ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NursingBookingList;
