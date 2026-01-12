import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const PrescriptionDelivery = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientPage, setPatientPage] = useState(1);
  const [patientPagination, setPatientPagination] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [formData, setFormData] = useState({
    patient_id: "",
    name: "",
    phone_number: "",
    delivery_type: "home_delivery",
    home_delivery_location: "",
    home_delivery_address: "",
    status: "pending",
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    if (drawerOpen && !isEditMode) {
      fetchPatients(patientPage);
    }
  }, [drawerOpen, patientPage, isEditMode]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      let url = "/prescription-delivery";
      const params = [];
      if (fromDate) params.push(`fromDate=${fromDate}`);
      if (toDate) params.push(`toDate=${toDate}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        setDeliveries(response.data.deliveries || []);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const openAddDrawer = () => {
    setFormData({
      patient_id: "",
      name: "",
      phone_number: "",
      delivery_type: "home_delivery",
      home_delivery_location: "",
      home_delivery_address: "",
      status: "pending",
    });
    setSelectedDelivery(null);
    setSelectedFile(null);
    setIsEditMode(false);
    setDrawerOpen(true);
  };

  const openEditDrawer = (delivery) => {
    setFormData({
      patient_id: delivery.patient_id,
      name: delivery.name,
      phone_number: delivery.phone_number,
      delivery_type: delivery.delivery_type,
      home_delivery_location: delivery.home_delivery_location || "",
      home_delivery_address: delivery.home_delivery_address || "",
      status: delivery.status,
    });
    setSelectedDelivery(delivery);
    setSelectedFile(null);
    setIsEditMode(true);
    setDrawerOpen(true);
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find((p) => p.id === parseInt(patientId));
    if (!patient) return;

    setFormData((prev) => ({
      ...prev,
      patient_id: patientId,
      name: patient.fullName,
      phone_number: patient.mobileNo || "",
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      let response;
      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
      if (selectedFile) fd.append("prescription_image", selectedFile);

      if (isEditMode) {
        response = await axiosInstance.put(
          `/prescription-delivery/${selectedDelivery.id}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axiosInstance.post("/prescription-delivery", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        fetchDeliveries();
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving delivery");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    try {
      const response = await axiosInstance.delete(`/prescription-delivery/${id}`);
      if (response.data.success) {
        fetchDeliveries();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting delivery");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-warning",
      confirmed: "bg-primary",
      delivered: "bg-success",
      cancelled: "bg-danger",
    };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  const getDeliveryTypeBadge = (type) =>
    type === "home_delivery" ? (
      <span className="badge bg-info">Home Delivery</span>
    ) : (
      <span className="badge bg-secondary">Hospital Pickup</span>
    );

  return (
    <>
      <div className="main-content">
        <div className="panel">
          <div className="panel-header">
            <h5>💊 Prescription Delivery</h5>
            <div className="d-flex gap-2 align-items-center mt-3">
              <div>
                <label className="form-label mb-1">From Date</label>
                <input type="date" className="form-control form-control-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <label className="form-label mb-1">To Date</label>
                <input type="date" className="form-control form-control-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" style={{marginTop: "28px"}} onClick={fetchDeliveries}>
                <i className="fa-light fa-search"></i> Search
              </button>
              <button className="btn btn-secondary btn-sm" style={{marginTop: "28px"}} onClick={() => { setFromDate(""); setToDate(""); fetchDeliveries(); }}>
                Clear
              </button>
              <button className="btn btn-sm btn-primary ms-auto" style={{marginTop: "28px"}} onClick={openAddDrawer}>
                <i className="fa-light fa-plus"></i> Add Delivery
              </button>
            </div>
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
                      <th>Patient</th>
                      <th>Phone</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Address</th>
                      <th>Prescription</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No delivery requests found
                        </td>
                      </tr>
                    ) : (
                      deliveries.map((delivery) => (
                        <tr key={delivery.id}>
                          <td className="text-start">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => openEditDrawer(delivery)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(delivery.id)}
                            >
                              Delete
                            </button>
                          </td>

                          <td>{delivery.name}</td>
                          <td>{delivery.phone_number}</td>
                          <td>{getDeliveryTypeBadge(delivery.delivery_type)}</td>
                          <td>{delivery.home_delivery_location || "N/A"}</td>
                          <td>{delivery.home_delivery_address || "N/A"}</td>

                          <td>
                            {delivery.prescription_image ? (
                              <a
                                href={`https://xrk77z9r-5000.inc1.devtunnels.ms/uploads/prescriptions/${delivery.prescription_image}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                View
                              </a>
                            ) : (
                              "No File"
                            )}
                          </td>

                          <td>{getStatusBadge(delivery.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </OverlayScrollbarsComponent>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR DRAWER */}
        {drawerOpen && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={() => setDrawerOpen(false)}
              style={{ zIndex: 9998, }}
            ></div>

            <div
              className="profile-right-sidebar active"
              style={{
                zIndex: 9999,
                // width: "100%",
                width:"80%",
                maxWidth: "80%",
                right: drawerOpen ? "0" : "-100%",
                top: "70px",
                height: "calc(100vh - 70px)",
              }}
            >
              <button className="right-bar-close" onClick={() => setDrawerOpen(false)}>
                <i className="fa-light fa-angle-right"></i>
              </button>

              <div className="top-panel">
                <div
                  className="dropdown-txt"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  {isEditMode ? "✏️ Edit Delivery Status" : "➕ Add New Delivery"}
                </div>

                <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                  <div className="p-3">
                    <div className="row g-3">
                      {!isEditMode && (
                        <div className="col-12">
                          <label className="form-label">Select Patient</label>
                          <select
                            className="form-control"
                            value={formData.patient_id}
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

                      <div className="col-md-6">
                        <label className="form-label">Patient Name</label>
                        <input
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Phone Number</label>
                        <input
                          className="form-control"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Delivery Type</label>
                        <select
                          className="form-control"
                          value={formData.delivery_type}
                          onChange={(e) => handleInputChange("delivery_type", e.target.value)}
                        >
                          <option value="home_delivery">Home Delivery</option>
                          <option value="hospital_pickup">Hospital Pickup</option>
                        </select>
                      </div>

                      {formData.delivery_type === "home_delivery" && (
                        <>
                          <div className="col-md-6">
                            <label className="form-label">Location</label>
                            <input
                              className="form-control"
                              value={formData.home_delivery_location}
                              onChange={(e) => handleInputChange("home_delivery_location", e.target.value)}
                            />
                          </div>

                          <div className="col-12">
                            <label className="form-label">Full Address</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={formData.home_delivery_address}
                              onChange={(e) => handleInputChange("home_delivery_address", e.target.value)}
                            ></textarea>
                          </div>
                        </>
                      )}

                      <div className="col-12">
                        <label className="form-label">{isEditMode ? "Update Prescription File (Optional)" : "Prescription File"}</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="form-control"
                          onChange={handleFileChange}
                        />
                        <small className="text-muted">{isEditMode ? "Leave empty to keep existing file" : "Upload image or PDF (Max 5MB)"}</small>
                      </div>

                      {/* Status */}
                      <div className="col-12">
                        <label className="form-label">Status</label>
                        <select
                          className="form-control"
                          value={formData.status}
                          onChange={(e) => handleInputChange("status", e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
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
                        {isEditMode ? "Update Delivery" : "Save Delivery"}
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

export default PrescriptionDelivery;
