import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { toast } from "react-toastify";

const PickupRequestList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [pickupRequests, setPickupRequests] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    ambulance_id: "",
    patient_id: "",
    pickup_area: "",
    pickup_address: "",
    destination_area: "",
    destination_address: "",
    name: "",
    phone_number: "",
    status: "pending"
  });

  useEffect(() => {
    fetchPickupRequests();
    fetchAmbulances();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get("/patient/all");
      if (response.data?.patients) setPatients(response.data.patients);
    } catch {
      setPatients([]);
    }
  };

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/ambulance/pickup/all");
      if (response.data.success) {
        setPickupRequests(
          response.data.pickupRequests.map((r) => ({ ...r, showDropdown: false }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbulances = async () => {
    try {
      const response = await axiosInstance.get("/ambulance");
      if (response.data.success) setAmbulances(response.data.ambulances);
    } catch {}
  };

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setPickupRequests((prev) =>
      prev.map((row, i) => ({
        ...row,
        showDropdown: i === index ? !row.showDropdown : false
      }))
    );
  };

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setPickupRequests((prev) =>
          prev.map((row) => ({ ...row, showDropdown: false }))
        );
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleAddNew = () => {
    setFormData({
      ambulance_id: ambulances[0]?.id || "",
      patient_id: patients[0]?.id || "",
      pickup_area: "",
      pickup_address: "",
      destination_area: "",
      destination_address: "",
      name: "",
      phone_number: "",
      status: "pending",
    });
    setSelectedRequest(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (req) => {
    setFormData({
      ambulance_id: req.ambulance_id,
      patient_id: req.patient_id || "",
      pickup_area: req.pickup_area,
      pickup_address: req.pickup_address,
      destination_area: req.destination_area,
      destination_address: req.destination_address,
      name: req.name,
      phone_number: req.phone_number,
      status: req.status,
    });
    setSelectedRequest(req);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    try {
      e.target.disabled = true;

      let res;

      if (isEditMode) {
        res = await axiosInstance.put(
          `/ambulance/pickup/${selectedRequest.id}/status`,
          { status: formData.status }
        );
      } else {
        res = await axiosInstance.post("/ambulance/pickup", formData);
      }

      if (res.data.success) {
        e.target.disabled = false;
        toast.success("Pickup request saved successfully!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
        fetchPickupRequests();
        setShowModal(false);
      } else {
        toast.error("Failed to save pickup request!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
      }
    } catch {
      toast.error("Error while saving!", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  const handleDelete = async (req) => {
    if (!window.confirm("Delete this pickup request?")) return;

    try {
      const res = await axiosInstance.delete(`/ambulance/pickup/${req.id}`);

      if (res.data.success) {
        toast.success("Pickup request deleted!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
        fetchPickupRequests();
      } else {
        toast.error("Delete failed!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
      }
    } catch {
      toast.error("Delete failed!", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: "warning",
      accepted: "primary",
      completed: "success",
      cancelled: "danger",
    };
    return <span className={`badge bg-${map[status]}`}>{status}</span>;
  };

  return (
    <div className="main-content">

      <div className="panel">
        <div className="panel-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="m-0">🚑 Ambulance Pickup Requests</h5>
          <button className="btn btn-primary btn-sm" onClick={handleAddNew}>
            <i className="fa-light fa-plus"></i> New Request
          </button>
        </div>

        <div className="panel-body">

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <OverlayScrollbarsComponent>
                <table className="table table-dashed table-hover digi-dataTable table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Sl No</th>
                      <th>Ambulance</th>
                      <th>Patient</th>
                      <th>Pickup</th>
                      <th>Destination</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pickupRequests.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          No pickup requests
                        </td>
                      </tr>
                    ) : (
                      pickupRequests.map((req, index) => (
                        <tr key={req.id}>
                          <td>{index + 1}</td>
                          <td>{req.ambulance_name || `Ambulance #${req.ambulance_id}`}</td>
                          <td>
                            {req.patient_id ? (
                              <span className="badge bg-info">Patient #{req.patient_id}</span>
                            ) : (
                              <span className="badge bg-secondary">None</span>
                            )}
                          </td>

                          <td>
                            <div>{req.pickup_area}</div>
                            <small className="text-muted">{req.pickup_address}</small>
                          </td>

                          <td>
                            <div>{req.destination_area}</div>
                            <small className="text-muted">{req.destination_address}</small>
                          </td>

                          <td>{req.name}</td>
                          <td>{req.phone_number}</td>
                          <td>{statusBadge(req.status)}</td>

                          <td>
                            <div
                              ref={dropdownRef}
                              className="digi-dropdown dropdown d-inline-block"
                            >
                              <button
                                className={`btn btn-sm btn-outline-primary ${
                                  req.showDropdown ? "show" : ""
                                }`}
                                onClick={(e) => toggleDropdown(e, index)}
                              >
                                Action <i className="fa-regular fa-angle-down"></i>
                              </button>

                              <ul
                                className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-menu-sm ${
                                  req.showDropdown ? "show" : ""
                                }`}
                              >
                                <li>
                                  <a
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleEdit(req);
                                    }}
                                  >
                                    <span className="dropdown-icon">
                                      <i className="fa-light fa-pen-to-square"></i>
                                    </span>
                                    Update Status
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDelete(req);
                                    }}
                                  >
                                    <span className="dropdown-icon">
                                      <i className="fa-light fa-trash-can"></i>
                                    </span>
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </OverlayScrollbarsComponent>
            </div>
          )}

        </div>
      </div>

      {/* RESPONSIVE RIGHT SIDEBAR */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 9998 }}
            onClick={() => setShowModal(false)}
          />

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: 0,
              top: 0,
              height: "100vh",
            }}
          >
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="dropdown-txt">
              {isEditMode ? "✏️ Update Status" : "➕ New Pickup Request"}
            </div>

            <OverlayScrollbarsComponent style={{ height: "calc(100% - 60px)" }}>
              <div className="p-3">
                <div className="row g-3">

                  {!isEditMode && (
                    <>
                      <div className="col-md-6 col-12">
                        <label className="form-label">🚑 Ambulance</label>
                        <select
                          className="form-control"
                          value={formData.ambulance_id}
                          onChange={(e) => handleInputChange("ambulance_id", e.target.value)}
                        >
                          <option value="">Select</option>
                          {ambulances.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 col-12">
                        <label className="form-label">👨‍⚕️ Patient (Optional)</label>
                        <select
                          className="form-control"
                          value={formData.patient_id}
                          onChange={(e) => handleInputChange("patient_id", e.target.value)}
                        >
                          <option value="">None</option>
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.fullName || `Patient #${p.id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 col-12">
                        <label className="form-label">📍 Pickup Area</label>
                        <input
                          className="form-control"
                          value={formData.pickup_area}
                          onChange={(e) => handleInputChange("pickup_area", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label className="form-label">📍 Pickup Address</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={formData.pickup_address}
                          onChange={(e) => handleInputChange("pickup_address", e.target.value)}
                        ></textarea>
                      </div>

                      <div className="col-md-6 col-12">
                        <label className="form-label">📍 Destination Area</label>
                        <input
                          className="form-control"
                          value={formData.destination_area}
                          onChange={(e) => handleInputChange("destination_area", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label className="form-label">📍 Destination Address</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={formData.destination_address}
                          onChange={(e) => handleInputChange("destination_address", e.target.value)}
                        ></textarea>
                      </div>

                      <div className="col-md-6 col-12">
                        <label className="form-label">👤 Name</label>
                        <input
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label className="form-label">📱 Phone</label>
                        <input
                          className="form-control"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="col-md-6 col-12">
                    <label className="form-label">📊 Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                </div>

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-secondary w-50" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary w-50" onClick={handleSave}>
                    {isEditMode ? "Update" : "Save"}
                  </button>
                </div>

              </div>
            </OverlayScrollbarsComponent>
          </div>
        </>
      )}

    </div>
  );
};

export default PickupRequestList;
