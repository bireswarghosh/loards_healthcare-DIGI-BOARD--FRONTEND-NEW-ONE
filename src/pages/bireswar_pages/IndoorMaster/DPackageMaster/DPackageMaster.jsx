import { useState, useEffect, useCallback, useRef } from "react";
// Assuming MasterLayout and Breadcrumb will now be used inside a standard 'main-content' wrapper
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import axiosInstance from "../../../../axiosInstance";
import Footer from "../../../../components/footer/Footer";

const DPackageMaster = () => {
  // const { isBelowLg } = useContext(DigiContext); // Uncomment if DigiContext is available
  const isBelowLg = window.innerWidth < 1200; // Mocking isBelowLg check based on Emr1 usage
  const dropdownRef = useRef(null); // Ref for outside click detection

  const [showModal, setShowModal] = useState(false);
  const [selectedDPackage, setSelectedDPackage] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Initialize dpackages with showDropdown state
  const [dpackages, setDPackages] = useState([]);

  const [formData, setFormData] = useState({
    Dpackage: '',
    Rate: '',
    SubDepartmentId: ''
  });

  // --- Dropdown Toggle Logic (Copied from Emr1.jsx) ---
  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = dpackages.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setDPackages(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = dpackages.map((data) => ({ ...data, showDropdown: false }));
        setDPackages(updatedData);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [dpackages]);
  // ----------------------------------------------------
  
  const handleAddNew = () => {
    setFormData({
      Dpackage: '',
      Rate: '',
      SubDepartmentId: ''
    });
    setSelectedDPackage(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (dpackage) => {
    // Close dropdown
    setDPackages(prev => prev.map(p => ({ ...p, showDropdown: false }))); 
    
    setFormData({
      Dpackage: dpackage.Dpackage || '',
      Rate: dpackage.Rate || '',
      SubDepartmentId: dpackage.SubDepartmentId || ''
    });
    setSelectedDPackage(dpackage);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (dpackage) => {
    // Close dropdown
    setDPackages(prev => prev.map(p => ({ ...p, showDropdown: false })));

    setFormData({
      Dpackage: dpackage.Dpackage || '',
      Rate: dpackage.Rate || '',
      SubDepartmentId: dpackage.SubDepartmentId || ''
    });
    setSelectedDPackage(dpackage);
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
      
      if (modalType === 'edit' && selectedDPackage) {
        const response = await axiosInstance.put(
          `/dpackage/${selectedDPackage.DpackageId}`,
          formData
        );
        
        if (response.data.success) {
          fetchDPackages();
          setShowModal(false);
        }
      } else {
        const response = await axiosInstance.post(
          '/dpackage',
          formData
        );
        
        if (response.data.success) {
          fetchDPackages();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving dpackage:', error);
      setError('Failed to save dpackage record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Close dropdown
    setDPackages(prev => prev.map(p => ({ ...p, showDropdown: false }))); 

    if (window.confirm('Are you sure you want to delete this dpackage?')) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`/dpackage/${id}`);
        
        if (response.data.success) {
          fetchDPackages();
        }
      } catch (error) {
        console.error('Error deleting dpackage:', error);
        setError('Failed to delete dpackage record');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchDPackages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/dpackage?page=${currentPage}&search=${searchTerm}`);
      
      if (response.data.success) {
        // Map to include showDropdown state
        setDPackages(response.data.data.map(item => ({ ...item, showDropdown: false }))); 
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching dpackages:', error);
      setError('Failed to fetch dpackage records');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchDPackages();
  }, [fetchDPackages]);


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
          <th>📦 DPackage</th>
          <th>💰 Rate(₹)</th>
          <th>🏥 Sub Department ID</th>
        </tr>
      </thead>
      <tbody>
        {dpackages.map((dpackage, index) => (
          <tr key={dpackage.DpackageId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            {/* --- Updated Action Column with Dropdown Structure --- */}
            <td>
                <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                  <button
                    className={`btn btn-sm btn-outline-primary ${dpackage.showDropdown ? 'show' : ''}`}
                    onClick={(event) => handleDropdownToggle(event, index)}
                  >
                    Action <i className="fa-regular fa-angle-down"></i>
                  </button>
                  <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${dpackage.showDropdown ? 'show' : ''}`}>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleView(dpackage); }}><span className="dropdown-icon"><i className="fa-light fa-eye"></i></span> View</a></li>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(dpackage); }}><span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span> Edit</a></li>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(dpackage.DpackageId); }}><span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span> Delete</a></li>
                  </ul>
                </div>
              </td>
            {/* ---------------------------------------------------- */}
            <td>{dpackage.DpackageId}</td>
            <td>{dpackage.Dpackage}</td>
            <td>
              <span className="badge bg-info">
                ₹{dpackage.Rate}
              </span>
            </td>
            <td className="text-center">{dpackage.SubDepartmentId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );


  const renderForm = () => (
    <div className="row g-3">
      <div className="col-md-12">
        <label className="form-label">📦 DPackage Name *</label>
        <input
          type="text"
          className="form-control"
          required
          disabled={modalType === 'view'}
          value={formData.Dpackage}
          onChange={(e) => handleInputChange('Dpackage', e.target.value)}
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">💰 Rate(₹)</label>
        <input
          type="number"
          step="0.01"
          className="form-control"
          disabled={modalType === 'view'}
          value={formData.Rate}
          onChange={(e) => handleInputChange('Rate', e.target.value)}
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">🏥 Sub Department ID</label>
        <input
          type="number"
          className="form-control"
          disabled={modalType === 'view'}
          value={formData.SubDepartmentId}
          onChange={(e) => handleInputChange('SubDepartmentId', e.target.value)}
        />
      </div>
    </div>
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
              <h5>📦 DPackage Master Management</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
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
              ) : dpackages.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">📦 No dpackage records found</p>
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
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        ← Previous
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
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
              <div className="dropdown-txt" style={{ position: 'sticky', top: 0, zIndex: 10, }}>
                {modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} DPackage
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    {renderForm()}
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

export default DPackageMaster;