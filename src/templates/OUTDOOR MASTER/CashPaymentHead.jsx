import { useState, useEffect, useContext, useRef } from "react";
import Footer from '../../components/footer/Footer';
import axiosInstance from '../../axiosInstance';
import { DigiContext } from '../../context/DigiContext';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const CashPaymentHeadMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const dropdownRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedHead, setSelectedHead] = useState(null);
  const [cashPaymentHeads, setCashPaymentHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    CashPaymentHead: "",
    doctorId: "",
    doctorY: 0
  });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchCashPaymentHeads();
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/doctors');
      const doctorData = response.data?.data || response.data || [];
      setDoctors(Array.isArray(doctorData) ? doctorData : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const fetchCashPaymentHeads = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/cashpaymenthead');
      const headsData = response.data?.data || response.data || [];
      setCashPaymentHeads(Array.isArray(headsData) ? headsData : []);
    } catch (error) {
      console.error('Error fetching cash payment heads:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      CashPaymentHead: "",
      doctorId: "",
      doctorY: 0
    });
    setSelectedHead(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = cashPaymentHeads.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setCashPaymentHeads(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = cashPaymentHeads.map((data) => ({ ...data, showDropdown: false }));
        setCashPaymentHeads(updatedData);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [cashPaymentHeads]);

  const handleEdit = (head) => {
    setFormData({
      CashPaymentHead: head.CashPaymentHead || "",
      doctorId: head.doctorId || "",
      doctorY: head.doctorY || ""
    });
    setSelectedHead(head);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (head) => {
    setFormData({
      CashPaymentHead: head.CashPaymentHead || "",
      doctorId: head.doctorId || "",
      doctorY: head.doctorY || ""
    });
    setSelectedHead(head);
    setModalType('view');
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        doctorId: formData.doctorId ? parseInt(formData.doctorId) : null,
        doctorY: formData.doctorY
      };
      
      if (selectedHead) {
        await axiosInstance.put(`/cashpaymenthead/${selectedHead.CashPaymentHeadId}`, submitData);
        alert('Cash Payment Head updated successfully');
      } else {
        await axiosInstance.post('/cashpaymenthead', submitData);
        alert('Cash Payment Head created successfully');
      }
      await fetchCashPaymentHeads();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving cash payment head:', error);
      alert('Error saving cash payment head');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cash payment head?')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/cashpaymenthead/${id}`);
        await fetchCashPaymentHeads();
        alert('Cash Payment Head deleted successfully');
      } catch (error) {
        console.error('Error deleting cash payment head:', error);
        alert('Error deleting cash payment head');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHead(null);
    setModalType('add');
    setFormData({ CashPaymentHead: "", doctorId: "", doctorY: 0 });
  };

  const filteredHeads = cashPaymentHeads.filter(head =>
    head.CashPaymentHead?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">
      <thead>
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th>Action</th>
          <th>ID</th>
          <th>Cash Payment Head</th>
          <th>Doctor ID</th>
          <th>Doctor Y</th>
        </tr>
      </thead>
      <tbody>
        {filteredHeads.length > 0 ? filteredHeads.map((head, index) => (
          <tr key={head.CashPaymentHeadId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                <button
                  className={`btn btn-sm btn-outline-primary ${head.showDropdown ? 'show' : ''}`}
                  onClick={(event) => handleDropdownToggle(event, index)}
                >
                  Action <i className="fa-regular fa-angle-down"></i>
                </button>
                <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${head.showDropdown ? 'show' : ''}`}>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleView(head); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-eye"></i></span> View
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(head); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span> Edit
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(head.CashPaymentHeadId); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span> Delete
                    </a>
                  </li>
                </ul>
              </div>
            </td>
            <td>{head.CashPaymentHeadId}</td>
            <td>{head.CashPaymentHead}</td>
            <td>{head.doctorId ? (Array.isArray(doctors) ? doctors.find(d => d.DoctorId === head.doctorId)?.Doctor : head.doctorId) || head.doctorId : 'N/A'}</td>
            <td>{head.doctorY === 1 ? 'Yes' : 'No'}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan="6" className="text-center">No cash payment heads found</td>
          </tr>
        )}
      </tbody>
    </table>
  );

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
              <h5>💰 Cash Payment Head Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn btn-sm btn-primary" onClick={handleAddNew}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            <div className="panel-body">
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
          <div className={`profile-right-sidebar ${showModal ? 'active' : ''}`} style={{ zIndex: 9999, width: '100%', maxWidth: '500px', right: showModal ? '0' : '-100%', top: '70px', height: 'calc(100vh - 70px)' }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: '100%', paddingTop: '10px' }}>
              <div className="dropdown-txt" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#0a1735' }}>
                {modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} Cash Payment Head
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="mb-3">
                      <label className="form-label">💰 Cash Payment Head Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.CashPaymentHead}
                        onChange={(e) => handleInputChange("CashPaymentHead", e.target.value)}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">📊 Doctor Y</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.doctorY === 1}
                          onChange={(e) => handleInputChange("doctorY", e.target.checked ? 1 : 0)}
                          disabled={modalType === 'view'}
                        />
                        <label className="form-check-label">{formData.doctorY === 1 ? 'Yes' : 'No'}</label>
                      </div>
                    </div>
                    {formData.doctorY === 1 && (
                      <div className="mb-3">
                        <label className="form-label">👨⚕️ Doctor Name</label>
                        <select
                          className="form-control"
                          value={formData.doctorId}
                          onChange={(e) => handleInputChange("doctorId", e.target.value)}
                          disabled={modalType === 'view'}
                        >
                          <option value="">Select Doctor</option>
                          {Array.isArray(doctors) && doctors.map(doctor => (
                            <option key={doctor.DoctorId} value={doctor.DoctorId}>
                              {doctor.Doctor}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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
      <Footer />
    </div>
  );
};

export default CashPaymentHeadMaster;
