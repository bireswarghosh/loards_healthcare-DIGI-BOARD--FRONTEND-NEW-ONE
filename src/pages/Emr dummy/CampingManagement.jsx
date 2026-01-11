import { useState, useEffect, useCallback, useContext, useRef } from "react";
import Footer from '../../components/footer/Footer';
import axiosInstance from "../../axiosInstance";
import { DigiContext } from '../../context/DigiContext';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const CampingManagement = () => {
  const { isBelowLg } = useContext(DigiContext);
  const dropdownRef = useRef(null);
  const [activeTab, setActiveTab] = useState('camping');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [campings, setCampings] = useState([]);
  const [campingSearch, setCampingSearch] = useState("");
  const [campingPage, setCampingPage] = useState(1);
  const [campingTotalPages, setCampingTotalPages] = useState(1);
  
  const [doctors, setDoctors] = useState([]);
  const [campingDoctors, setCampingDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctorType, setDoctorType] = useState('hospital');
  const [externalDoctor, setExternalDoctor] = useState({ name: '', speciality: '', hospital: '' });
  
  const [leads, setLeads] = useState([]);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsTotalPages, setLeadsTotalPages] = useState(1);
  const [selectedCamping, setSelectedCamping] = useState("");
  
  const [formData, setFormData] = useState({
    camping_name: '',
    location: '',
    start_date: '',
    end_date: '',
    organizer_name: '',
    contact_details: '',
    participants_count: '',
    remarks: '',
    camping_id: '',
    lead_name: '',
    phone: '',
    email: '',
    age: '',
    address: '',
    interest_level: 'High',
    source: 'Website'
  });

  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const currentData = activeTab === 'camping' ? campings : leads;
    const updatedData = currentData.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    activeTab === 'camping' ? setCampings(updatedData) : setLeads(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const currentData = activeTab === 'camping' ? campings : leads;
        const updatedData = currentData.map((data) => ({ ...data, showDropdown: false }));
        activeTab === 'camping' ? setCampings(updatedData) : setLeads(updatedData);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeTab, campings, leads]);

  const resetForm = () => {
    setFormData({
      camping_name: '',
      location: '',
      start_date: '',
      end_date: '',
      organizer_name: '',
      contact_details: '',
      participants_count: '',
      remarks: '',
      camping_id: '',
      lead_name: '',
      phone: '',
      email: '',
      age: '',
      address: '',
      interest_level: 'High',
      source: 'Website'
    });
  };

  const handleAddNew = () => {
    resetForm();
    const tempItem = { camping_id: 'temp_' + Date.now() };
    setSelectedItem(tempItem);
    setModalType('add');
    setCampingDoctors([]);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    if (activeTab === 'camping') {
      setFormData({
        ...formData,
        camping_name: item.camping_name,
        location: item.location,
        start_date: item.start_date?.split('T')[0] || '',
        end_date: item.end_date?.split('T')[0] || '',
        organizer_name: item.organizer_name,
        contact_details: item.contact_details,
        participants_count: item.participants_count,
        remarks: item.remarks || ''
      });
      fetchCampingDoctors(item.camping_id);
    } else {
      setFormData({
        ...formData,
        camping_id: item.camping_id,
        lead_name: item.lead_name,
        phone: item.phone,
        email: item.email || '',
        age: item.age || '',
        address: item.address || '',
        interest_level: item.interest_level,
        source: item.source,
        remarks: item.remarks || ''
      });
    }
    setSelectedItem(item);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (item) => {
    if (activeTab === 'camping') {
      setFormData({
        ...formData,
        camping_name: item.camping_name,
        location: item.location,
        start_date: item.start_date?.split('T')[0] || '',
        end_date: item.end_date?.split('T')[0] || '',
        organizer_name: item.organizer_name,
        contact_details: item.contact_details,
        participants_count: item.participants_count,
        remarks: item.remarks || ''
      });
      fetchCampingDoctors(item.camping_id);
    } else {
      setFormData({
        ...formData,
        camping_id: item.camping_id,
        lead_name: item.lead_name,
        phone: item.phone,
        email: item.email || '',
        age: item.age || '',
        address: item.address || '',
        interest_level: item.interest_level,
        source: item.source,
        remarks: item.remarks || ''
      });
    }
    setSelectedItem(item);
    setModalType('view');
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const endpoint = activeTab === 'camping' ? '/camping' : '/camping-leads';
      const idField = activeTab === 'camping' ? 'camping_id' : 'lead_id';
      
      if (modalType === 'edit' && selectedItem) {
        const response = await axiosInstance.put(
          `${endpoint}/${selectedItem[idField]}`,
          formData
        );
        
        if (response.data.success) {
          activeTab === 'camping' ? fetchCampings() : fetchLeads();
          setShowModal(false);
        }
      } else {
        const response = await axiosInstance.post(endpoint, formData);
        
        if (response.data.success) {
          const newCampingId = response.data.data?.camping_id || response.data.data?.id;
          
          if (activeTab === 'camping' && campingDoctors.length > 0 && newCampingId) {
            for (const doc of campingDoctors) {
              await axiosInstance.post('/camping-doctors', {
                camping_id: newCampingId,
                doctor_id: doc.doctor_id || null,
                doctor_name: doc.DoctorName,
                speciality: doc.Speciality,
                hospital: doc.hospital || null,
                is_external: doc.is_external || false
              });
            }
          }
          
          activeTab === 'camping' ? fetchCampings() : fetchLeads();
          setShowModal(false);
          setCampingDoctors([]);
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      setError('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        setLoading(true);
        const endpoint = activeTab === 'camping' ? '/camping' : '/camping-leads';
        const response = await axiosInstance.delete(`${endpoint}/${id}`);
        
        if (response.data.success) {
          activeTab === 'camping' ? fetchCampings() : fetchLeads();
        }
      } catch (error) {
        console.error('Error deleting:', error);
        setError('Failed to delete record');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchCampings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/camping?page=${campingPage}&search=${campingSearch}`);
      
      if (response.data.success) {
        setCampings(response.data.data.map(item => ({ ...item, showDropdown: false })));
        setCampingTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching campings:', error);
      setError('Failed to fetch camping records');
    } finally {
      setLoading(false);
    }
  }, [campingPage, campingSearch]);

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/doctormaster?page=1&limit=1000');
      if (response.data.success) {
        setDoctors(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  const fetchCampingDoctors = async (campingId) => {
    try {
      console.log('Fetching doctors for camping:', campingId);
      const response = await axiosInstance.get(`/camping-doctors/${campingId}`);
      console.log('Doctors response:', response.data);
      if (response.data.success) {
        setCampingDoctors(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching camping doctors:', error);
    }
  };

  const handleAddDoctor = async () => {
    if (!selectedDoctor) return;
    const doctor = doctors.find(d => d.DoctorId == selectedDoctor);
    
    if (modalType === 'add') {
      setCampingDoctors([...campingDoctors, {
        id: 'temp_' + Date.now(),
        doctor_id: selectedDoctor,
        DoctorName: doctor.Doctor || doctor.DoctorName,
        Speciality: doctor.Speciality || 'N/A',
        is_external: false
      }]);
      setSelectedDoctor("");
    } else {
      if (!selectedItem?.camping_id) return;
      try {
        const response = await axiosInstance.post('/camping-doctors', {
          camping_id: selectedItem.camping_id,
          doctor_id: selectedDoctor,
          doctor_name: doctor.Doctor || doctor.DoctorName,
          speciality: doctor.Speciality || 'N/A',
          is_external: false
        });
        if (response.data.success) {
          fetchCampingDoctors(selectedItem.camping_id);
          setSelectedDoctor("");
        }
      } catch (error) {
        console.error('Error adding doctor:', error);
        setError('Failed to add doctor');
      }
    }
  };

  const handleRemoveDoctor = async (id) => {
    if (modalType === 'add') {
      setCampingDoctors(campingDoctors.filter(cd => cd.id !== id));
    } else {
      try {
        const response = await axiosInstance.delete(`/camping-doctors/${id}`);
        if (response.data.success) {
          fetchCampingDoctors(selectedItem.camping_id);
        }
      } catch (error) {
        console.error('Error removing doctor:', error);
        setError('Failed to remove doctor');
      }
    }
  };

  const handleAddExternalDoctor = async () => {
    if (!externalDoctor.name) return;
    
    if (modalType === 'add') {
      setCampingDoctors([...campingDoctors, {
        id: 'temp_' + Date.now(),
        doctor_id: null,
        DoctorName: externalDoctor.name,
        Speciality: externalDoctor.speciality,
        hospital: externalDoctor.hospital,
        is_external: true
      }]);
      setExternalDoctor({ name: '', speciality: '', hospital: '' });
    } else {
      if (!selectedItem?.camping_id) return;
      try {
        const response = await axiosInstance.post('/camping-doctors', {
          camping_id: selectedItem.camping_id,
          doctor_id: null,
          doctor_name: externalDoctor.name,
          speciality: externalDoctor.speciality,
          hospital: externalDoctor.hospital,
          is_external: true
        });
        if (response.data.success) {
          fetchCampingDoctors(selectedItem.camping_id);
          setExternalDoctor({ name: '', speciality: '', hospital: '' });
        }
      } catch (error) {
        console.error('Error adding external doctor:', error);
        setError('Failed to add external doctor');
      }
    }
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: leadsPage,
        search: leadsSearch,
        ...(selectedCamping && { camping_id: selectedCamping })
      });
      
      const response = await axiosInstance.get(`/camping-leads?${params}`);
      
      if (response.data.success) {
        setLeads(response.data.data.map(item => ({ ...item, showDropdown: false })));
        setLeadsTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to fetch lead records');
    } finally {
      setLoading(false);
    }
  }, [leadsPage, leadsSearch, selectedCamping]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (activeTab === 'camping') {
      fetchCampings();
    } else {
      fetchLeads();
    }
  }, [activeTab, fetchCampings, fetchLeads]);

  const renderCampingForm = () => (
    <>
    <div className="row ">
      <div className="col-md-6 mb-3">
        <label className="form-label">🏕️ Camping Name *</label>
        <input type="text" className="form-control" value={formData.camping_name} onChange={(e) => handleInputChange('camping_name', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📍 Location *</label>
        <input type="text" className="form-control" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📅 Start Date *</label>
        <input type="date" className="form-control" value={formData.start_date} onChange={(e) => handleInputChange('start_date', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📅 End Date *</label>
        <input type="date" className="form-control" value={formData.end_date} onChange={(e) => handleInputChange('end_date', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">👤 Organizer Name *</label>
        <input type="text" className="form-control" value={formData.organizer_name} onChange={(e) => handleInputChange('organizer_name', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📞 Contact Details *</label>
        <input type="text" className="form-control" value={formData.contact_details} onChange={(e) => handleInputChange('contact_details', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">👥 Participants Count</label>
        <input type="number" className="form-control" value={formData.participants_count} onChange={(e) => handleInputChange('participants_count', e.target.value)} disabled={modalType === 'view'} />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📝 Remarks</label>
        <textarea className="form-control" rows="3" value={formData.remarks} onChange={(e) => handleInputChange('remarks', e.target.value)} disabled={modalType === 'view'} />
      </div>
    </div>
    {(modalType === 'add' || modalType === 'edit' || modalType === 'view') && selectedItem && (
      <div className="mt-4">
        <h6 className="mb-3">👨‍⚕️ Doctors</h6>
        <div className="mb-3">
          <label className="form-label">Select Doctor Type</label>
          <div className="btn-group w-100 mb-3" role="group">
            <button type="button" className={`btn ${doctorType === 'hospital' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setDoctorType('hospital')}>🏥 Hospital Doctor</button>
            <button type="button" className={`btn ${doctorType === 'external' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setDoctorType('external')}>👤 External Doctor</button>
          </div>
        </div>
        {modalType !== 'view' && doctorType === 'hospital' && (
        <div className="mb-3">
          <div className="input-group">
            <select className="form-control" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} disabled={modalType === 'view'}>
              <option value="">Select Doctor</option>
              {doctors.map(doc => (
                <option key={doc.DoctorId} value={doc.DoctorId}>{doc.Doctor || doc.DoctorName} - {doc.Speciality || 'N/A'}</option>
              ))}
            </select>
            {modalType !== 'view' && (
              <button type="button" className="btn btn-primary" onClick={handleAddDoctor} disabled={!selectedDoctor}>
                <i className="fa-light fa-plus"></i> Add
              </button>
            )}
          </div>
        </div>
        )}
        {modalType !== 'view' && doctorType === 'external' && (
        <div className="card mb-3 p-3">
          <label className="form-label fw-bold">Add External Doctor</label>
          <div className="row">
            <div className="col-md-6 mb-2"><input type="text" className="form-control" placeholder="Doctor Name *" value={externalDoctor.name} onChange={(e) => setExternalDoctor({...externalDoctor, name: e.target.value})} /></div>
            <div className="col-md-6 mb-2"><input type="text" className="form-control" placeholder="Speciality" value={externalDoctor.speciality} onChange={(e) => setExternalDoctor({...externalDoctor, speciality: e.target.value})} /></div>
            <div className="col-12 mb-2"><input type="text" className="form-control" placeholder="Hospital Name" value={externalDoctor.hospital} onChange={(e) => setExternalDoctor({...externalDoctor, hospital: e.target.value})} /></div>
            <div className="col-12"><button type="button" className="btn btn-success w-100" onClick={handleAddExternalDoctor} disabled={!externalDoctor.name}><i className="fa-light fa-check"></i> Add External Doctor</button></div>
          </div>
        </div>
        )}
        <div className="list-group mt-3">
          <div className="list-group-item bg-secondary text-white"><strong>Added Doctors ({campingDoctors.length})</strong></div>
          {campingDoctors.map(cd => (
            <div key={cd.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{cd.DoctorName}</strong>
                {cd.is_external ? (
                  <span className="badge bg-warning text-dark ms-2">External</span>
                ) : (
                  <span className="badge bg-success ms-2">Hospital</span>
                )}
                <br />
                <small className="text-muted">{cd.Speciality || 'N/A'}</small>
                {cd.hospital && <><br /><small className="text-info">🏥 {cd.hospital}</small></>}
              </div>
              {modalType !== 'view' && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveDoctor(cd.id)}>
                  <i className="fa-light fa-trash"></i>
                </button>
              )}
            </div>
          ))}
          {campingDoctors.length === 0 && (
            <div className="text-center text-muted py-3">No doctors added yet</div>
          )}
        </div>
      </div>
    )}
    </>
  );

  const renderLeadsForm = () => (
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">🏕️ Camping *</label>
        <select className="form-control" value={formData.camping_id} onChange={(e) => handleInputChange('camping_id', e.target.value)} disabled={modalType === 'view'} required>
          <option value="">Select Camping</option>
          {campings.map(camping => (
            <option key={camping.camping_id} value={camping.camping_id}>{camping.camping_name} - {camping.location}</option>
          ))}
        </select>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">👤 Lead Name *</label>
        <input type="text" className="form-control" value={formData.lead_name} onChange={(e) => handleInputChange('lead_name', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📞 Phone *</label>
        <input type="tel" className="form-control" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={modalType === 'view'} required />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📧 Email</label>
        <input type="email" className="form-control" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={modalType === 'view'} />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📅 Age</label>
        <input type="number" className="form-control" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} disabled={modalType === 'view'} />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">🎯 Interest Level</label>
        <select className="form-control" value={formData.interest_level} onChange={(e) => handleInputChange('interest_level', e.target.value)} disabled={modalType === 'view'}>
          <option value="High">🔥 High</option>
          <option value="Medium">⚡ Medium</option>
          <option value="Low">💤 Low</option>
        </select>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">📊 Source</label>
        <select className="form-control" value={formData.source} onChange={(e) => handleInputChange('source', e.target.value)} disabled={modalType === 'view'}>
          <option value="Website">🌐 Website</option>
          <option value="Social Media">📱 Social Media</option>
          <option value="Referral">👥 Referral</option>
          <option value="Advertisement">📺 Advertisement</option>
          <option value="Walk-in">🚶 Walk-in</option>
        </select>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">🏠 Address</label>
        <textarea className="form-control" rows="2" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} disabled={modalType === 'view'} />
      </div>
    </div>
  );

  const renderTable = () => {
    const currentData = activeTab === 'camping' ? campings : leads;
    
    return (
      <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">
        <thead>
          <tr>
            <th className="no-sort">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </th>
            <th>Action</th>
            {activeTab === 'camping' ? (
              <>
                <th>ID</th>
                <th>Camping Name</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Organizer</th>
                <th>Contact</th>
                <th>Participants</th>
              </>
            ) : (
              <>
                <th>ID</th>
                <th>Camping</th>
                <th>Lead Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Interest</th>
                <th>Source</th>
                <th>Date</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {currentData.map((data, index) => (
            <tr key={activeTab === 'camping' ? data.camping_id : data.lead_id}>
              <td>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </td>
              <td>
                <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                  <button
                    className={`btn btn-sm btn-outline-primary ${data.showDropdown ? 'show' : ''}`}
                    onClick={(event) => handleDropdownToggle(event, index)}
                  >
                    Action <i className="fa-regular fa-angle-down"></i>
                  </button>
                  <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${data.showDropdown ? 'show' : ''}`}>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleView(data); }}><span className="dropdown-icon"><i className="fa-light fa-eye"></i></span> View</a></li>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(data); }}><span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span> Edit</a></li>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(activeTab === 'camping' ? data.camping_id : data.lead_id); }}><span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span> Delete</a></li>
                  </ul>
                </div>
              </td>
              {activeTab === 'camping' ? (
                <>
                  <td>{data.camping_id}</td>
                  <td>{data.camping_name}</td>
                  <td>{data.location}</td>
                  <td>{new Date(data.start_date).toLocaleDateString()}</td>
                  <td>{new Date(data.end_date).toLocaleDateString()}</td>
                  <td>{data.organizer_name}</td>
                  <td>{data.contact_details}</td>
                  <td><span className="badge bg-info">{data.participants_count || 0}</span></td>
                </>
              ) : (
                <>
                  <td>{data.lead_id}</td>
                  <td>{data.camping_name}</td>
                  <td>{data.lead_name}</td>
                  <td>{data.phone}</td>
                  <td>{data.email || 'N/A'}</td>
                  <td>
                    <span className={`badge ${data.interest_level === 'High' ? 'bg-success' : data.interest_level === 'Medium' ? 'bg-warning' : 'bg-secondary'}`}>
                      {data.interest_level}
                    </span>
                  </td>
                  <td>{data.source}</td>
                  <td>{new Date(data.created_at).toLocaleDateString()}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          
          <div className="panel">
            <div className="panel-header">
              <h5>🏕️ Camping Management</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={activeTab === 'camping' ? campingSearch : leadsSearch}
                    onChange={(e) => activeTab === 'camping' ? setCampingSearch(e.target.value) : setLeadsSearch(e.target.value)}
                  />
                </div>
                <button className="btn btn-sm btn-primary" onClick={handleAddNew}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            <div className="panel-body">
              <div className="nav nav-pills mb-3">
                <button
                  className={`nav-link me-2 ${activeTab === 'camping' ? 'active' : ''}`}
                  onClick={() => setActiveTab('camping')}
                >
                  🏕️ Camping Events
                </button>
                <button
                  className={`nav-link ${activeTab === 'leads' ? 'active' : ''}`}
                  onClick={() => setActiveTab('leads')}
                >
                  👥 Lead Management
                </button>
              </div>

              {activeTab === 'leads' && (
                <div className="row mb-3">
                  <div className="col-md-4">
                    <select
                      className="form-control form-control-sm"
                      value={selectedCamping}
                      onChange={(e) => setSelectedCamping(e.target.value)}
                    >
                      <option value="">🏕️ All Campings</option>
                      {campings.map(camping => (
                        <option key={camping.camping_id} value={camping.camping_id}>
                          {camping.camping_name} - {camping.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {isBelowLg ? (
                    <OverlayScrollbarsComponent>
                      {renderTable()}
                    </OverlayScrollbarsComponent>
                  ) : (
                    renderTable()
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} style={{ zIndex: 9998 }}></div>
          <div className={`profile-right-sidebar ${showModal ? 'active' : ''}`} style={{ zIndex: 9999, width: '100%', maxWidth: '800px', right: showModal ? '0' : '-100%', top: '70px', height: 'calc(100vh - 70px)' }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: '100%', paddingTop: '10px' }}>
              <div className="dropdown-txt" style={{ position: 'sticky', top: 0, zIndex: 10, }}>
                {modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} {activeTab === 'camping' ? 'Camping' : 'Lead'}
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    {activeTab === 'camping' ? renderCampingForm() : renderLeadsForm()}
                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setShowModal(false)}>
                        Cancel
                      </button>
                      {modalType !== 'view' && (
                        <button type="submit" className="btn btn-primary w-50" disabled={loading}>
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      <Footer/>
    </div>
  );
};

export default CampingManagement;
