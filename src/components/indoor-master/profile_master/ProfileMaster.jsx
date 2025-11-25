import { useState, useEffect, useCallback, useRef } from "react";
// Assuming MasterLayout and Breadcrumb are replaced by standard main-content structure
// import MasterLayout from "../../MasterLayout"; 
// import Breadcrumb from "../../Breadcrumb";

import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'; // For consistent scrolling
import axiosInstance from "../../../axiosInstance";
import Footer from "../../../components/footer/Footer";

const ProfileMaster = () => {
  // Mocking isBelowLg check based on Emr1 usage
  const isBelowLg = window.innerWidth < 1200; 
  const dropdownRef = useRef(null); // Ref for outside click detection

  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Initialize profiles with showDropdown state for action button
  const [profiles, setProfiles] = useState([]);

  const [formData, setFormData] = useState({
    Profile: '',
    Rate: '',
    SubDepartmentId: ''
  });

  // --- Dropdown Toggle Logic (Copied from Emr1/OtherCharges style) ---
  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = profiles.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setProfiles(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = profiles.map((data) => ({ ...data, showDropdown: false }));
        setProfiles(updatedData);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [profiles]);
  // ------------------------------------------------------------------

  const handleAddNew = () => {
    setFormData({
      Profile: '',
      Rate: '',
      SubDepartmentId: ''
    });
    setSelectedProfile(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (profile) => {
    // Close dropdown
    setProfiles(prev => prev.map(p => ({ ...p, showDropdown: false })));

    setFormData({
      Profile: profile.Profile || '',
      Rate: profile.Rate || '',
      SubDepartmentId: profile.SubDepartmentId || ''
    });
    setSelectedProfile(profile);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (profile) => {
    // Close dropdown
    setProfiles(prev => prev.map(p => ({ ...p, showDropdown: false })));

    setFormData({
      Profile: profile.Profile || '',
      Rate: profile.Rate || '',
      SubDepartmentId: profile.SubDepartmentId || ''
    });
    setSelectedProfile(profile);
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
      
      if (modalType === 'edit' && selectedProfile) {
        const response = await axiosInstance.put(
          `/profile/${selectedProfile.ProfileId}`,
          formData
        );
        
        if (response.data.success) {
          fetchProfiles();
          setShowModal(false);
        }
      } else {
        const response = await axiosInstance.post(
          '/profile',
          formData
        );
        
        if (response.data.success) {
          fetchProfiles();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Close dropdown
    setProfiles(prev => prev.map(p => ({ ...p, showDropdown: false })));

    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`/profile/${id}`);
        
        if (response.data.success) {
          fetchProfiles();
        }
      } catch (error) {
        console.error('Error deleting profile:', error);
        setError('Failed to delete profile record');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/profile?page=${currentPage}&search=${searchTerm}`);
      
      if (response.data.success) {
        // Map to include showDropdown state
        setProfiles(response.data.data.map(item => ({ ...item, showDropdown: false })));
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to fetch profile records');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);


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
          <th>👤 Profile Name</th>
          <th>💰 Rate</th>
          <th>🏥 Sub Department ID</th>
        </tr>
      </thead>
      <tbody>
        {profiles.map((profile, index) => (
          <tr key={profile.ProfileId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>
                <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                  <button
                    className={`btn btn-sm btn-outline-primary ${profile.showDropdown ? 'show' : ''}`}
                    onClick={(event) => handleDropdownToggle(event, index)}
                  >
                    Action <i className="fa-regular fa-angle-down"></i>
                  </button>
                  <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${profile.showDropdown ? 'show' : ''}`}>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleView(profile); }}><span className="dropdown-icon"><i className="fa-light fa-eye"></i></span> View</a></li>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(profile); }}><span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span> Edit</a></li>
                    <li><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(profile.ProfileId); }}><span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span> Delete</a></li>
                  </ul>
                </div>
              </td>
            <td>{profile.ProfileId}</td>
            <td>{profile.Profile}</td>
            <td>
              <span className="badge bg-info">
                ₹{profile.Rate}
              </span>
            </td>
            <td className="text-center">{profile.SubDepartmentId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );


  const renderForm = () => (
    <div className="row g-3">
      <div className="col-md-12">
        <label className="form-label">👤 Profile Name *</label>
        <input
          type="text"
          className="form-control"
          required
          disabled={modalType === 'view'}
          value={formData.Profile}
          onChange={(e) => handleInputChange('Profile', e.target.value)}
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
          
          {/* Main Panel/Card Structure */}
          <div className="panel">
            <div className="panel-header">
              <h5>👤 Profile Master Management</h5>
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
              ) : profiles.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">👤 No profile records found</p>
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

      {/* Right Sidebar Modal Structure */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} style={{ zIndex: 9998 }}></div>
          <div className={`profile-right-sidebar ${showModal ? 'active' : ''}`} style={{ zIndex: 9999, width: '100%', maxWidth: '500px', right: showModal ? '0' : '-100%', top: '70px', height: 'calc(100vh - 70px)' }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: '100%', paddingTop: '10px' }}>
              <div className="dropdown-txt" style={{ position: 'sticky', top: 0, zIndex: 10, }}>
                {modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} Profile
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

export default ProfileMaster;