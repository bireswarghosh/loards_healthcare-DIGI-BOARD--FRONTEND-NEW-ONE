import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const PatientList = () => {
  const dropdownRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);  
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [patientDetails, setPatientDetails] = useState({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/appointment-booking-app/patients?page=${page}&limit=10`);
      setPatients(response.data.data.map((p) => ({ ...p, showDropdown: false })));
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
    setLoading(false);
  };

  const fetchPatientDetails = async (patientId, type) => {
    try {
      let endpoint = '';
      switch(type) {
        case 'profile':
          endpoint = `/patient-auth/profile/${patientId}`;
          break;
        case 'ambulance':
          endpoint = `/pickup/patient/${patientId}`;
          break;
        case 'nursing':
          endpoint = `/nursing-bookings/patient/${patientId}`;
          break;
        case 'appointments':
          endpoint = `/appointments/patient/${patientId}`;
          break;
        case 'diagnostic':
          endpoint = `/diagnostic/patient/${patientId}/bookings`;
          break;
        case 'prescriptions':
          endpoint = `/appointments/patient/${patientId}`;
          break;
        case 'healthpackages':
          endpoint = `/health-packages/patient/${patientId}`;
          break;
      }
      const response = await axiosInstance.get(endpoint);
      setPatientDetails(prev => ({ ...prev, [type]: response.data }));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('profile');
    setPatientDetails({});
    setShowDrawer(true);
    fetchPatientDetails(patient.id, 'profile');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedPatient && !patientDetails[tab]) {
      fetchPatientDetails(selectedPatient.id, tab);
    }
  };

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setPatients((prev) =>
      prev.map((item, i) => ({
        ...item,
        showDropdown: i === index ? !item.showDropdown : false,
      }))
    );
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setPatients((prev) =>
          prev.map((d) => ({ ...d, showDropdown: false }))
        );
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderTabContent = () => {
    const data = patientDetails[activeTab];
    if (!data) return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

    switch(activeTab) {
      case 'profile':
        return data.patient && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" value={data.patient.fullName} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="text" className="form-control" value={data.patient.email} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mobile</label>
              <input type="text" className="form-control" value={data.patient.mobileNo} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <input type="text" className="form-control" value={data.patient.gender || 'N/A'} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Blood Group</label>
              <input type="text" className="form-control" value={data.patient.bloodGroup || 'N/A'} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Age</label>
              <input type="text" className="form-control" value={data.patient.age || 'N/A'} readOnly />
            </div>
          </div>
        );
      case 'ambulance':
        return (
          <div>
            {data.pickupRequests?.length > 0 ? (
              data.pickupRequests.map(req => (
                <div key={req.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Ambulance:</strong> {req.ambulance_name}</p>
                    <p><strong>From:</strong> {req.pickup_address}</p>
                    <p><strong>To:</strong> {req.destination_address}</p>
                    <p><strong>Status:</strong> <span className={`badge bg-${req.status === 'pending' ? 'warning' : 'success'}`}>{req.status}</span></p>
                  </div>
                </div>
              ))
            ) : <p className="text-muted">No ambulance requests found</p>}
          </div>
        );
      case 'nursing':
        return (
          <div>
            {data.bookings?.length > 0 ? (
              data.bookings.map(booking => (
                <div key={booking.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Package:</strong> {booking.package_name}</p>
                    <p><strong>Duration:</strong> {booking.duration} hours</p>
                    <p><strong>Price:</strong> ₹{booking.price}</p>
                    <p><strong>Status:</strong> <span className={`badge bg-${booking.status === 'pending' ? 'warning' : 'success'}`}>{booking.status}</span></p>
                  </div>
                </div>
              ))
            ) : <p className="text-muted">No nursing bookings found</p>}
          </div>
        );
      case 'appointments':
        return (
          <div>
            {data.appointments?.length > 0 ? (
              data.appointments.map(apt => (
                <div key={apt.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Doctor:</strong> {apt.doctor_name}</p>
                    <p><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {apt.time}</p>
                    <p><strong>Status:</strong> <span className={`badge bg-${apt.status === 'pending' ? 'warning' : 'success'}`}>{apt.status}</span></p>
                  </div>
                </div>
              ))
            ) : <p className="text-muted">No appointments found</p>}
          </div>
        );
      case 'diagnostic':
        return (
          <div>
            {data.data?.length > 0 ? (
              data.data.map(test => (
                <div key={test.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Test:</strong> {test.test_name}</p>
                    <p><strong>Rate:</strong> ₹{test.test_rate}</p>
                    <p><strong>Status:</strong> <span className={`badge bg-${test.status === 'pending' ? 'warning' : 'success'}`}>{test.status}</span></p>
                  </div>
                </div>
              ))
            ) : <p className="text-muted">No diagnostic tests found</p>}
          </div>
        );
      case 'prescriptions':
        return (
          <div>
            {data.appointments?.filter(apt => apt.prescription_by_doctor).length > 0 ? (
              data.appointments.filter(apt => apt.prescription_by_doctor).map(apt => (
                <div key={apt.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Doctor:</strong> {apt.doctor_name}</p>
                    <p><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}</p>
                    <a href={`${axiosInstance.defaults.baseURL}/appointments/prescription/file/${apt.id}?user_id=${selectedPatient.id}&user_type=patient`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">View Prescription</a>
                  </div>
                </div>
              ))
            ) : <p className="text-muted">No prescriptions found</p>}
          </div>
        );
      case 'healthpackages':
        return (
          <div>
            {data.purchases?.length > 0 ? (
              data.purchases.map(purchase => (
                <div key={purchase.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Package:</strong> {purchase.package.packageName}</p>
                    <p><strong>Amount:</strong> ₹{purchase.purchaseAmount}</p>
                    <p><strong>Payment:</strong> {purchase.paymentMethod}</p>
                    <p><strong>Status:</strong> <span className={`badge bg-${purchase.paymentStatus === 'completed' ? 'success' : 'warning'}`}>{purchase.paymentStatus}</span></p>
                  </div>
                </div>
              ))
            ) : <p className="text-muted">No health packages found</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          <h5>👥 Patient Management</h5>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "200px" }}
            />
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-dashed table-hover digi-dataTable table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((patient, index) => (
                    <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td>{patient.fullName}</td>
                      <td>{patient.email}</td>
                      <td>{patient.mobileNo}</td>
                      <td>
                        <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                          <button
                            className={`btn btn-sm btn-outline-primary ${patient.showDropdown ? "show" : ""}`}
                            onClick={(e) => toggleDropdown(e, index)}
                          >
                            Action <i className="fa-regular fa-angle-down"></i>
                          </button>
                          <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${patient.showDropdown ? "show" : ""}`}>
                            <li>
                              <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handlePatientSelect(patient); }}>
                                <i className="fa-light fa-eye"></i> View Details
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}

          <div className="d-flex justify-content-center mt-3">
            <nav>
              <ul className="pagination pagination-sm">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchPatients(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                </li>
                <li className="page-item active">
                  <span className="page-link">Page {currentPage} of {totalPages}</span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchPatients(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE DRAWER */}
      {showDrawer && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowDrawer(false)} style={{ zIndex: 9998 }}></div>
          <div className="profile-right-sidebar active" style={{ zIndex: 9999, width: "80%", maxWidth: "80%", right: showDrawer ? "0" : "-100%", top: "70px", height: "calc(100vh - 70px)" }}>
            <button className="right-bar-close" onClick={() => setShowDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#0a1735" }}>
                👁️ Patient Details: {selectedPatient?.fullName}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <ul className="nav nav-pills mb-3" style={{flexWrap: 'wrap', gap: '8px'}}>
                    {[
                      { key: 'profile', label: 'Profile' },
                      { key: 'ambulance', label: 'Ambulance' },
                      { key: 'nursing', label: 'Nursing' },
                      { key: 'appointments', label: 'Appointments' },
                      { key: 'prescriptions', label: 'Prescriptions' },
                      { key: 'diagnostic', label: 'Diagnostic' },
                      { key: 'healthpackages', label: 'Health Packages' }
                    ].map(tab => (
                      <li key={tab.key} className="nav-item">
                        <button className={`nav-link ${activeTab === tab.key ? 'active' : ''}`} onClick={() => handleTabChange(tab.key)}>
                          {tab.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {renderTabContent()}
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientList;
