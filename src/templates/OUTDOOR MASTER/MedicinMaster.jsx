import { useState, useEffect, useContext, useRef } from "react"
import Footer from '../../components/footer/Footer';
import axiosInstance from '../../axiosInstance';
import { DigiContext } from '../../context/DigiContext';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const MedicinMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const dropdownRef = useRef(null);
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ MedicineName: '', Type: '' })
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = medicines.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setMedicines(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = medicines.map((data) => ({ ...data, showDropdown: false }));
        setMedicines(updatedData);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [medicines]);

  const fetchMedicines = async (page = 1, search = '') => {
    setLoading(true)
    try {
      let url = `/medicines?page=${page}&limit=20`
      if (search) url += `&search=${encodeURIComponent(search)}`
      
      const response = await axiosInstance.get(url)
      setMedicines(response.data.data.map(item => ({ ...item, showDropdown: false })))
      setTotalPages(response.data.pagination.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching medicines:", error)
      setError('Failed to fetch medicines')
    }
    setLoading(false)
  }

  const handleAddNew = () => {
    setFormData({ MedicineName: '', Composition: '', Type: '' })
    setSelectedItem(null)
    setModalType('add')
    setShowModal(true)
  }

  const handleEdit = (medicine) => {
    setFormData({ 
      MedicineName: medicine.MedicineName || '', 
      Type: medicine.Type || '' 
    })
    setSelectedItem(medicine)
    setModalType('edit')
    setShowModal(true)
  }

  const handleView = (medicine) => {
    setFormData({ 
      MedicineName: medicine.MedicineName || '', 
      Type: medicine.Type || '' 
    })
    setSelectedItem(medicine)
    setModalType('view')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (modalType === 'edit' && selectedItem) {
        const response = await axiosInstance.put(`/medicines/${selectedItem.MedicineId}`, formData)
        if (response.data.success) {
          fetchMedicines(currentPage, searchTerm)
          setShowModal(false)
        }
      } else {
        const response = await axiosInstance.post('/medicines', formData)
        if (response.data.success) {
          fetchMedicines(currentPage, searchTerm)
          setShowModal(false)
        }
      }
    } catch (error) {
      console.error("Error saving medicine:", error)
      setError('Failed to save medicine')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        setLoading(true)
        await axiosInstance.delete(`/medicines/${id}`)
        fetchMedicines(currentPage, searchTerm)
      } catch (error) {
        console.error("Error deleting medicine:", error)
        setError('Failed to delete medicine')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchMedicines(1, searchTerm)
  }

  useEffect(() => {
    fetchMedicines()
  }, [])

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => fetchMedicines(i, searchTerm)}>{i}</button>
        </li>
      );
    }
    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => fetchMedicines(currentPage - 1, searchTerm)}>Previous</button>
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => fetchMedicines(currentPage + 1, searchTerm)}>Next</button>
          </li>
        </ul>
      </nav>
    );
  }

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
          <th>Medicine Name</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {medicines.length > 0 ? medicines.map((medicine, index) => (
          <tr key={medicine.MedicineId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                <button
                  className={`btn btn-sm btn-outline-primary ${medicine.showDropdown ? 'show' : ''}`}
                  onClick={(event) => handleDropdownToggle(event, index)}
                >
                  Action <i className="fa-regular fa-angle-down"></i>
                </button>
                <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${medicine.showDropdown ? 'show' : ''}`}>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleView(medicine); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-eye"></i></span> View
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(medicine); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span> Edit
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(medicine.MedicineId); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span> Delete
                    </a>
                  </li>
                </ul>
              </div>
            </td>
            <td>{medicine.MedicineId}</td>
            <td>{medicine.MedicineName}</td>
            <td>{medicine.Type}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan="5" className="text-center">No medicines found</td>
          </tr>
        )}
      </tbody>
    </table>
  )

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
              <h5>💊 Medicine Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch" className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="btn btn-sm btn-primary" onClick={handleSearch}>
                    <i className="fa-light fa-search"></i>
                  </button>
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
                  {renderPagination()}
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
                {modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} Medicine
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">💊 Medicine Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.MedicineName}
                        onChange={(e) => setFormData({...formData, MedicineName: e.target.value})}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">📋 Type</label>
                      <select
                        className="form-control"
                        value={formData.Type}
                        onChange={(e) => setFormData({...formData, Type: e.target.value})}
                        disabled={modalType === 'view'}
                      >
                        <option value="">Select Type</option>
                        <option value="M">M</option>
                        <option value="I">I</option>
                      </select>
                    </div>
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
  )
}

export default MedicinMaster
