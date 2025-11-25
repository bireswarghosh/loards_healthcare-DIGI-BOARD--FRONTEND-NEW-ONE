import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import Footer from "../../../components/footer/Footer";

const PickupRequestList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [pickupRequests, setPickupRequests] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPickupRequests();
    fetchAmbulances();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // This is a placeholder - you'll need to implement an API endpoint to get all patients
      // For now, we'll just use a mock implementation
      const response = await axiosInstance.get('/patient/all');
      if (response.data && response.data.patients) {
        setPatients(response.data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // If the API doesn't exist yet, use mock data
      setPatients([]);
    }
  };

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ambulance/pickup/all');
      if (response.data.success) {
        setPickupRequests(response.data.pickupRequests);
      }
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbulances = async () => {
    try {
      const response = await axiosInstance.get('/ambulance');
      if (response.data.success) {
        setAmbulances(response.data.ambulances);
      }
    } catch (error) {
      console.error('Error fetching ambulances:', error);
    }
  };

  const handleAddNew = () => {
    setFormData({
      ambulance_id: ambulances.length > 0 ? ambulances[0].id : "",
      patient_id: patients.length > 0 ? patients[0].id : "",
      pickup_area: "",
      pickup_address: "",
      destination_area: "",
      destination_address: "",
      name: "",
      phone_number: "",
      status: "pending"
    });
    setSelectedRequest(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (request) => {
    setFormData({
      ambulance_id: request.ambulance_id,
      patient_id: request.patient_id || "",
      pickup_area: request.pickup_area,
      pickup_address: request.pickup_address,
      destination_area: request.destination_area,
      destination_address: request.destination_address,
      name: request.name,
      phone_number: request.phone_number,
      status: request.status
    });
    setSelectedRequest(request);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      let response;
      
      if (isEditMode) {
        // Update status only for existing requests
        response = await axiosInstance.put(`/ambulance/pickup/${selectedRequest.id}/status`, {
          status: formData.status
        });
      } else {
        // Create new pickup request
        response = await axiosInstance.post('/ambulance/pickup', formData);
      }
      
      if (response.data.success) {
        fetchPickupRequests();
        setShowModal(false);
      } else {
        alert('Error saving pickup request: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error saving pickup request:', error);
      alert('Error saving pickup request');
    }
  };

  const handleDelete = async (request) => {
    if (window.confirm(`Are you sure you want to delete this pickup request?`)) {
      try {
        const response = await axiosInstance.delete(`/ambulance/pickup/${request.id}`);
        if (response.data.success) {
          fetchPickupRequests();
        } else {
          alert('Error deleting pickup request: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error deleting pickup request:', error);
        alert('Error deleting pickup request');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setIsEditMode(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'accepted':
        return <span className="badge bg-primary">Accepted</span>;
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header d-flex justify-content-between align-items-center">
              <h5>🚑 Ambulance Pickup Requests</h5>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleAddNew}
              >
                <i className="fa-light fa-plus me-1"></i> NEW PICKUP REQUEST
              </button>
            </div>
            <div className="panel-body">
              <div className="table-responsive">
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ambulance</th>
                    <th>Patient</th>
                    <th>Pickup Area</th>
                    <th>Destination Area</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : pickupRequests.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">No pickup requests found</td>
                    </tr>
                  ) : (
                    pickupRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.ambulance_name || `Ambulance #${request.ambulance_id}`}</td>
                        <td>
                          {request.patient_id ? (
                            <span className="badge bg-info">Patient #{request.patient_id}</span>
                          ) : (
                            <span className="badge bg-secondary">No Patient</span>
                          )}
                        </td>
                        <td>
                          <div>{request.pickup_area}</div>
                          <small className="text-muted">{request.pickup_address}</small>
                        </td>
                        <td>
                          <div>{request.destination_area}</div>
                          <small className="text-muted">{request.destination_address}</small>
                        </td>
                        <td>{request.name}</td>
                        <td>{request.phone_number}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td className="text-center">
                          <button 
                            className="btn btn-sm btn-icon btn-primary me-1" 
                            onClick={() => handleEdit(request)}
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-icon btn-danger" 
                            onClick={() => handleDelete(request)}
                          >
                            <i className="fa-light fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

      {showModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div 
                  className="modal-header text-white rounded-top-4"
                  style={{ background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)" }}
                >
                  <h5 className="modal-title">
                    🚑 {isEditMode ? "Update Pickup Request Status" : "New Pickup Request"}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={handleCloseModal}
                  ></button>
                </div>
                
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {!isEditMode && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">🚑 Select Ambulance</label>
                          <select
                            className="form-select"
                            value={formData.ambulance_id}
                            onChange={(e) => handleInputChange("ambulance_id", e.target.value)}
                            required
                          >
                            <option value="">Select an ambulance</option>
                            {ambulances.map(ambulance => (
                              <option key={ambulance.id} value={ambulance.id}>
                                {ambulance.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">👨‍⚕️ Select Patient (Optional)</label>
                          <select
                            className="form-select"
                            value={formData.patient_id}
                            onChange={(e) => handleInputChange("patient_id", e.target.value)}
                          >
                            <option value="">No patient</option>
                            {patients.map(patient => (
                              <option key={patient.id} value={patient.id}>
                                {patient.fullName || `Patient #${patient.id}`}
                              </option>
                            ))}
                          </select>
                          <small className="text-muted">Link this request to a patient account</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">📍 Pickup Area</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.pickup_area}
                            onChange={(e) => handleInputChange("pickup_area", e.target.value)}
                            placeholder="Enter pickup area"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">📍 Destination Area</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.destination_area}
                            onChange={(e) => handleInputChange("destination_area", e.target.value)}
                            placeholder="Enter destination area"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">🏠 Pickup Address</label>
                          <textarea
                            className="form-control"
                            value={formData.pickup_address}
                            onChange={(e) => handleInputChange("pickup_address", e.target.value)}
                            placeholder="Enter detailed pickup address"
                            rows="3"
                            required
                          ></textarea>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">🏢 Destination Address</label>
                          <textarea
                            className="form-control"
                            value={formData.destination_address}
                            onChange={(e) => handleInputChange("destination_address", e.target.value)}
                            placeholder="Enter detailed destination address"
                            rows="3"
                            required
                          ></textarea>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">👤 Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Enter contact name"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">📱 Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange("phone_number", e.target.value)}
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Status field - shown for both new and edit modes */}
                    <div className="col-12">
                      <label className="form-label fw-bold">📊 Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSave}
                  >
                    {isEditMode ? "Update Status" : "Create Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
      <Footer />
    </div>
  );
};

export default PickupRequestList;