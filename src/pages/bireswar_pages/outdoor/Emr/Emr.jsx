import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../axiosInstance';
import Footer from '../../../../components/footer/Footer';


const Emr = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('pastHistory');
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    registrationId: '',
    patientName: '',
    doctorId: '',
    fromDate: '',
    toDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [pastHistoryRows, setPastHistoryRows] = useState([{ id: 1, value: "" }]);
  const [diagnosisRows, setDiagnosisRows] = useState([{ id: 1, value: "" }]);
  const [investigationRows, setInvestigationRows] = useState([{ id: 1, value: "" }]);
  const [complaintRows, setComplaintRows] = useState([{ id: 1, value: "" }]);
  const [adviceRows, setAdviceRows] = useState([{ id: 1, value: "" }]);
  const [medicineRows, setMedicineRows] = useState([{ id: 1, medicine: "", dose: "", days: "", unit: "" }]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...searchFilters
      });
      const response = await axiosInstance.get(`/emr/patients?${params}`);
      setPatients(response.data.data || []);
      const newPagination = response.data.pagination || pagination;
      newPagination.hasNextPage = newPagination.currentPage < newPagination.totalPages;
      newPagination.hasPrevPage = newPagination.currentPage > 1;
      setPagination(newPagination);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => loadPatients(1);
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    loadPatients(page);
  };
  const handleFilterChange = (field, value) => setSearchFilters(prev => ({ ...prev, [field]: value }));

  const handleViewEmr = async (patient) => {
    const formattedPatient = {
      ...patient,
      PVisitId: patient.PVisitId,
      patientregistration: { PatientName: patient.PatientName, Age: patient.Age, Sex: patient.Sex, PhoneNo: patient.PhoneNo },
      doctormaster: { DoctorName: patient.DoctorName },
      department: { Department: patient.Department }
    };
    setSelectedPatient(formattedPatient);
    setShowDetail(true);
    await loadEmrData(formattedPatient);
  };

  const loadEmrData = async (patient) => {
    if (!patient?.RegistrationId) return;
    try {
      const response = await axiosInstance.get(`/emr/${patient.RegistrationId}`);
      const emrData = response.data.data;
      setPastHistoryRows([{ id: 1, value: "", isExisting: false }]);
      setDiagnosisRows([{ id: 1, value: "", isExisting: false }]);
      setInvestigationRows([{ id: 1, value: "", isExisting: false }]);
      setComplaintRows([{ id: 1, value: "", isExisting: false }]);
      setAdviceRows([{ id: 1, value: "", isExisting: false }]);
      setMedicineRows([{ id: 1, medicine: "", dose: "", days: "", unit: "", isExisting: false }]);
      if (emrData.pastHistory?.length > 0) setPastHistoryRows(emrData.pastHistory.map((item, index) => ({ id: index + 1, value: item.pasthistory || "", isExisting: true, slno: item.slno })));
      if (emrData.diagnosis?.length > 0) setDiagnosisRows(emrData.diagnosis.map((item, index) => ({ id: index + 1, value: item.diagnosis || "", isExisting: true, slno: item.slno })));
      if (emrData.investigations?.length > 0) setInvestigationRows(emrData.investigations.map((item, index) => ({ id: index + 1, value: item.investigation || "", isExisting: true, slno: item.slno })));
      if (emrData.complaints?.length > 0) setComplaintRows(emrData.complaints.map((item, index) => ({ id: index + 1, value: item.chiefcomplaint || "", isExisting: true, slno: item.slno })));
      if (emrData.advice?.length > 0) setAdviceRows(emrData.advice.map((item, index) => ({ id: index + 1, value: item.advice || "", isExisting: true, slno: item.slno })));
      if (emrData.medicine?.length > 0) setMedicineRows(emrData.medicine.map((item, index) => ({ id: index + 1, medicine: item.advmed || "", dose: item.dose || "", days: item.nodays || "", unit: item.dunit || "", isExisting: true, slno: item.slno })));
    } catch (error) {
      console.error('Error loading EMR data:', error);
    }
  };

  const addRow = (rows, setRows) => {
    if (rows.length < 10) {
      const newId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
      setRows([...rows, { id: newId, value: "", isExisting: false }]);
    }
  };

  const addMedicineRow = (rows, setRows) => {
    if (rows.length < 10) {
      const newId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
      setRows([...rows, { id: newId, medicine: "", dose: "", days: "", unit: "", isExisting: false }]);
    }
  };

  const handleRowChange = (id, value, rows, setRows) => setRows(rows.map(row => (row.id === id ? { ...row, value: value } : row)));
  const handleMedicineRowChange = (id, field, value, rows, setRows) => setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));

  const deleteRow = async (row, rows, setRows) => {
    if (row.isExisting && row.slno) {
      if (!window.confirm("Are you sure you want to delete this saved record?")) return;
      let endpoint = '';
      if (rows === pastHistoryRows) endpoint = 'pasthistory';
      else if (rows === diagnosisRows) endpoint = 'diagnosis';
      else if (rows === investigationRows) endpoint = 'investigations';
      else if (rows === complaintRows) endpoint = 'complaints';
      else if (rows === adviceRows) endpoint = 'advice';
      else if (rows === medicineRows) endpoint = 'advice-medicine';
      try {
        setLoading(true);
        await axiosInstance.delete(`/emr/${endpoint}/${row.slno}`);
        alert("Record deleted successfully!");
      } catch (error) {
        console.error('Error deleting record:', error);
        alert("Failed to delete record.");
        setLoading(false);
        return;
      }
    }
    setRows(rows.filter(r => r.id !== row.id));
    setLoading(false);
  };

  const updateOrSaveRow = async (row, rows) => {
    if (!selectedPatient || (!row.value && !row.medicine)) return;
    try {
      const isMedicineRow = rows === medicineRows;
      const endpointMap = { [pastHistoryRows]: 'pasthistory', [diagnosisRows]: 'diagnosis', [investigationRows]: 'investigations', [complaintRows]: 'complaints', [adviceRows]: 'advice', [medicineRows]: 'advice-medicine' };
      let endpoint = endpointMap[rows];
      let data = { RegistrationId: selectedPatient.RegistrationId, VisitId: selectedPatient.PVisitId, admissionid: null };
      if (isMedicineRow) {
        data.advmed = row.medicine;
        data.dose = row.dose;
        data.nodays = row.days;
        data.dunit = row.unit;
      } else if (rows === pastHistoryRows) data.pasthistory = row.value;
      else if (rows === diagnosisRows) data.diagnosis = row.value;
      else if (rows === investigationRows) data.Invest = row.value;
      else if (rows === complaintRows) data.chief = row.value;
      else if (rows === adviceRows) data.advice = row.value;
      if (row.isExisting && row.slno) {
        if (isMedicineRow) await axiosInstance.put(`/emr/${endpoint}/${row.slno}`, { advmed: row.medicine, dose: row.dose, nodays: row.days, dunit: row.unit });
        else await axiosInstance.put(`/emr/${endpoint}/${row.slno}`, data);
      } else await axiosInstance.post(`/emr/${endpoint}`, data);
      return true;
    } catch (error) {
      console.error(`Error saving/updating EMR row:`, error);
      return false;
    }
  };

  const handleSaveEmr = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    const dataToSave = [
      { rows: pastHistoryRows }, { rows: diagnosisRows }, { rows: investigationRows },
      { rows: complaintRows }, { rows: adviceRows }, { rows: medicineRows }
    ];
    let success = true;
    for (const { rows } of dataToSave) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const isNewOrDirty = !row.isExisting || (row.isExisting && (row.value || row.medicine));
        if (isNewOrDirty) {
          const result = await updateOrSaveRow(row, rows);
          if (!result) { success = false; break; }
        }
      }
      if (!success) break;
    }
    setLoading(false);
    if (success) {
      alert("EMR data saved successfully!");
      await loadEmrData(selectedPatient);
    } else alert("Failed to save all EMR data.");
  };

  const renderSimpleRows = (rows, setRows, title) => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">{title}</h6>
        <button className="btn btn-sm btn-success rounded-pill" onClick={() => addRow(rows, setRows)}>
          <i className="fa-solid fa-plus me-1"></i> Add Row
        </button>
      </div>
      {rows.map((row) => (
        <div key={row.id} className="row g-2 mb-2">
          <div className="col">
            <input type="text" className="form-control form-control-sm" value={row.value} onChange={(e) => handleRowChange(row.id, e.target.value, rows, setRows)} />
          </div>
          <div className="col-auto">
            <button className="btn btn-sm btn-danger rounded-pill" onClick={() => deleteRow(row, rows, setRows)}>
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMedicineRows = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Medicines</h6>
        <button className="btn btn-sm btn-success rounded-pill" onClick={() => addMedicineRow(medicineRows, setMedicineRows)}>
          <i className="fa-solid fa-plus me-1"></i> Add Row
        </button>
      </div>
      <div className="row g-2 mb-2 fw-bold text-muted small">
        <div className="col-4">Medicine</div>
        <div className="col-2">Dose</div>
        <div className="col-2">Days</div>
        <div className="col-2">Unit</div>
        <div className="col-auto">Action</div>
      </div>
      {medicineRows.map((row) => (
        <div key={row.id} className="row g-2 mb-2">
          <div className="col-4">
            <input type="text" className="form-control form-control-sm" value={row.medicine} onChange={(e) => handleMedicineRowChange(row.id, 'medicine', e.target.value, medicineRows, setMedicineRows)} />
          </div>
          <div className="col-2">
            <input type="text" className="form-control form-control-sm" value={row.dose} onChange={(e) => handleMedicineRowChange(row.id, 'dose', e.target.value, medicineRows, setMedicineRows)} />
          </div>
          <div className="col-2">
            <input type="number" className="form-control form-control-sm" value={row.days} onChange={(e) => handleMedicineRowChange(row.id, 'days', e.target.value, medicineRows, setMedicineRows)} />
          </div>
          <div className="col-2">
            <input type="text" className="form-control form-control-sm" value={row.unit} onChange={(e) => handleMedicineRowChange(row.id, 'unit', e.target.value, medicineRows, setMedicineRows)} />
          </div>
          <div className="col-auto">
            <button className="btn btn-sm btn-danger rounded-pill" onClick={() => deleteRow(row, medicineRows, setMedicineRows)}>
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pastHistory': return renderSimpleRows(pastHistoryRows, setPastHistoryRows, 'Past History');
      case 'diagnosis': return renderSimpleRows(diagnosisRows, setDiagnosisRows, 'Diagnosis');
      case 'investigations': return renderSimpleRows(investigationRows, setInvestigationRows, 'Investigations');
      case 'complaints': return renderSimpleRows(complaintRows, setComplaintRows, 'Chief Complaints');
      case 'advice': return renderSimpleRows(adviceRows, setAdviceRows, 'Advice');
      case 'medicine': return renderMedicineRows();
      default: return null;
    }
  };

  if (showDetail) {
    return (
      <div className="container-fluid py-4" >
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-header border-0  rounded-top-4 d-flex justify-content-between align-items-center" >
            <div className="d-flex align-items-center">
              <div className=" rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                <span className="fw-bold" style={{ fontSize: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{selectedPatient?.PatientName?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h5 className="mb-0">EMR: {selectedPatient?.PatientName}</h5>
                <small className="opacity-75">Reg ID: {selectedPatient?.RegistrationId}</small>
              </div>
            </div>
            <button className="btn btn-light btn-sm rounded-pill" onClick={() => setShowDetail(false)}>
              <i className="fa-solid fa-arrow-left me-1"></i> Back
            </button>
          </div>
          <div className="card-body">
            <div className="card mb-3 border">
              <div className="card-header ">
                <h6 className="mb-0"><i className="fa-solid fa-user-injured me-2"></i>Patient Visit Information</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className='form-label small fw-semibold'>Registration No:</label>
                    <input type="text" value={selectedPatient?.RegistrationId || ''} readOnly className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className='form-label small fw-semibold'>Visit Date:</label>
                    <input type="text" value={selectedPatient?.PVisitDate ? new Date(selectedPatient.PVisitDate).toLocaleDateString() : ''} readOnly className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className='form-label small fw-semibold'>Doctor:</label>
                    <input type="text" value={selectedPatient?.DoctorName || ''} readOnly className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className='form-label small fw-semibold'>Patient Name:</label>
                    <input type="text" value={selectedPatient?.PatientName || ''} readOnly className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className='form-label small fw-semibold'>Age/Sex:</label>
                    <input type="text" value={`${selectedPatient?.Age || ''} / ${selectedPatient?.Sex || ''}`} readOnly className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className='form-label small fw-semibold'>Phone No:</label>
                    <input type="text" value={selectedPatient?.PhoneNo || ''} readOnly className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className='form-label small fw-semibold'>Department:</label>
                    <input type="text" value={selectedPatient?.Department || ''} readOnly className="form-control form-control-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <ul className="nav nav-pills mb-4" style={{flexWrap: 'wrap', gap: '8px'}}>
                  {[
                    { key: 'pastHistory', icon: 'clock-rotate-left', label: 'Past History' },
                    { key: 'diagnosis', icon: 'stethoscope', label: 'Diagnosis' },
                    { key: 'investigations', icon: 'microscope', label: 'Investigations' },
                    { key: 'complaints', icon: 'notes-medical', label: 'Complaints' },
                    { key: 'advice', icon: 'comment-medical', label: 'Advice' },
                    { key: 'medicine', icon: 'pills', label: 'Medicines' }
                  ].map(tab => (
                    <li key={tab.key} className="nav-item">
                      <button 
                        className={`nav-link rounded-pill ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '13px',
                          padding: '8px 16px'
                
                        }}
                      >
                        <i className={`fa-solid fa-${tab.icon} me-1`}></i> {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="p-3 rounded-3">
                  {renderTabContent()}
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button className="btn btn-primary rounded-pill px-4" onClick={handleSaveEmr} disabled={loading} >
                    <i className="fa-solid fa-save me-2"></i>{loading ? 'Saving...' : 'Save EMR'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header border-0  rounded-top-4">
          <h5 className="mb-0"><i className="fa-solid fa-file-medical me-2"></i>EMR Patient Visit List</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-2">
              <input type="text" className="form-control form-control-sm" placeholder="Reg ID" value={searchFilters.registrationId} onChange={(e) => handleFilterChange('registrationId', e.target.value)} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control form-control-sm" placeholder="Patient Name" value={searchFilters.patientName} onChange={(e) => handleFilterChange('patientName', e.target.value)} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control form-control-sm" placeholder="Doctor" value={searchFilters.doctorId} onChange={(e) => handleFilterChange('doctorId', e.target.value)} />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control form-control-sm" value={searchFilters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control form-control-sm" value={searchFilters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-sm btn-primary w-100 rounded-pill" onClick={handleSearch} >
                <i className="fa-solid fa-search me-1"></i> Search
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead >
                    <tr>
                      <th>Reg ID</th>
                      <th>Visit ID</th>
                      <th>Patient Name</th>
                      <th>Age/Sex</th>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Visit Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.RegistrationId + patient.PVisitId}>
                        <td>{patient.RegistrationId}</td>
                        <td>{patient.PVisitId}</td>
                        <td>{patient.PatientName}</td>
                        <td>{patient.Age} / {patient.Sex}</td>
                        <td>{patient.DoctorName}</td>
                        <td>{patient.Department}</td>
                        <td>{new Date(patient.PVisitDate).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-primary rounded-pill" onClick={() => handleViewEmr(patient)}>
                            <i className="fa-solid fa-eye me-1"></i> View EMR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">Showing {pagination.totalItems > 0 ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 : 0} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries</small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>Previous</button>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">{pagination.currentPage}</span>
                    </li>
                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Emr;