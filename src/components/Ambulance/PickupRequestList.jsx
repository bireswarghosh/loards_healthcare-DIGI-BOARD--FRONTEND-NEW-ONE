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
    name: "",
    phone: "",
    pickupArea: "",
    pickupLandmark: "",
    destinationArea: "",
    destinationLandmark: ""
  });

  useEffect(() => {
    fetchPickupRequests();
    fetchAmbulances();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get("/appointment-booking-app/patients?page=1&limit=100");
      if (response.data.success) setPatients(response.data.data || []);
    } catch {
      setPatients([]);
    }
  };

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/pickup");
      if (response.data.success) {
        setPickupRequests(response.data.pickupRequests.map((r) => ({ ...r, showDropdown: false })));
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
    setPickupRequests((prev) => prev.map((row, i) => ({ ...row, showDropdown: i === index ? !row.showDropdown : false })));
  };

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setPickupRequests((prev) => prev.map((row) => ({ ...row, showDropdown: false })));
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleAddNew = () => {
    setFormData({
      ambulance_id: "",
      patient_id: "",
      name: "",
      phone: "",
      pickupArea: "",
      pickupLandmark: "",
      destinationArea: "",
      destinationLandmark: ""
    });
    setSelectedRequest(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (req) => {
    setFormData({
      ambulance_id: req.ambulance_id,
      patient_id: req.patient_id || "",
      name: req.name,
      phone: req.phone,
      pickupArea: req.pickupArea,
      pickupLandmark: req.pickupLandmark || "",
      destinationArea: req.destinationArea,
      destinationLandmark: req.destinationLandmark || ""
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

      const payload = {
        ambulance_id: parseInt(formData.ambulance_id),
        patient_id: formData.patient_id ? parseInt(formData.patient_id) : null,
        name: formData.name,
        phone: formData.phone,
        pickupArea: formData.pickupArea,
        pickupLandmark: formData.pickupLandmark,
        destinationArea: formData.destinationArea,
        destinationLandmark: formData.destinationLandmark
      };

      if (isEditMode) {
        payload.phone_number = formData.phone;
        payload.pickup_area = formData.pickupArea;
        payload.pickup_address = formData.pickupLandmark;
        payload.destination_area = formData.destinationArea;
        payload.destination_address = formData.destinationLandmark;
      }

      let res;
      if (isEditMode) {
        res = await axiosInstance.put(`/pickup/${selectedRequest.id}`, payload);
      } else {
        res = await axiosInstance.post("/pickup", payload);
      }

      if (res.data.success) {
        e.target.disabled = false;
        toast.success("Saved successfully!");
        fetchPickupRequests();
        setShowModal(false);
      }
    } catch {
      e.target.disabled = false;
      toast.error("Error saving!");
    }
  };

  const handleDelete = async (req) => {
    if (!window.confirm("Delete?")) return;
    try {
      const res = await axiosInstance.delete(`/pickup/${req.id}`);
      if (res.data.success) {
        toast.success("Deleted!");
        fetchPickupRequests();
      }
    } catch {
      toast.error("Delete failed!");
    }
  };

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🚑 Pickup Requests</h5>
          <button className="btn btn-primary btn-sm" onClick={handleAddNew}>
            <i className="fa-light fa-plus"></i> New
          </button>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <OverlayScrollbarsComponent>
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Ambulance</th>
                      <th>Patient</th>
                      <th>Pickup</th>
                      <th>Destination</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickupRequests.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-4">No requests</td></tr>
                    ) : (
                      pickupRequests.map((req, i) => (
                        <tr key={req.id}>
                          <td>{i + 1}</td>
                          <td>{req.ambulance_name || `#${req.ambulance_id}`}</td>
                          <td>{req.patient_name || (req.patient_id ? `#${req.patient_id}` : "None")}</td>
                          <td>
                            <div>{req.pickupArea}</div>
                            <small className="text-muted">{req.pickupLandmark}</small>
                          </td>
                          <td>
                            <div>{req.destinationArea}</div>
                            <small className="text-muted">{req.destinationLandmark}</small>
                          </td>
                          <td>{req.name}</td>
                          <td>{req.phone}</td>
                          <td>
                            <div ref={dropdownRef} className="digi-dropdown dropdown d-inline-block">
                              <button className={`btn btn-sm btn-outline-primary ${req.showDropdown ? "show" : ""}`} onClick={(e) => toggleDropdown(e, i)}>
                                Action <i className="fa-regular fa-angle-down"></i>
                              </button>
                              <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-menu-sm ${req.showDropdown ? "show" : ""}`}>
                                <li>
                                  <a className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(req); }}>
                                    <span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span>
                                    Edit
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(req); }}>
                                    <span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span>
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

      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 9998 }} onClick={() => setShowModal(false)} />
          <div className="profile-right-sidebar active" style={{ zIndex: 9999, width: "100%", maxWidth: "500px", right: 0, top: 0, height: "100vh" }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="dropdown-txt">{isEditMode ? "✏️ Edit" : "➕ New"} Pickup Request</div>
            <OverlayScrollbarsComponent style={{ height: "calc(100% - 60px)" }}>
              <div className="p-3">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">🚑 Ambulance</label>
                    <select className="form-control" value={formData.ambulance_id} onChange={(e) => handleInputChange("ambulance_id", e.target.value)}>
                      <option value="">Select</option>
                      {ambulances.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">👨⚕️ Patient (Optional)</label>
                    <select className="form-control" value={formData.patient_id} onChange={(e) => handleInputChange("patient_id", e.target.value)}>
                      <option value="">None</option>
                      {patients.map((p) => (<option key={p.id} value={p.id}>{p.fullName}</option>))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">👤 Name</label>
                    <input className="form-control" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">📱 Phone</label>
                    <input className="form-control" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">📍 Pickup Area</label>
                    <input className="form-control" value={formData.pickupArea} onChange={(e) => handleInputChange("pickupArea", e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">📍 Pickup Address</label>
                    <textarea className="form-control" rows="2" value={formData.pickupLandmark} onChange={(e) => handleInputChange("pickupLandmark", e.target.value)}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">📍 Destination Area</label>
                    <input className="form-control" value={formData.destinationArea} onChange={(e) => handleInputChange("destinationArea", e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">📍 Destination Address</label>
                    <textarea className="form-control" rows="2" value={formData.destinationLandmark} onChange={(e) => handleInputChange("destinationLandmark", e.target.value)}></textarea>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-secondary w-50" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary w-50" onClick={handleSave}>{isEditMode ? "Update" : "Save"}</button>
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
