import { useState, useEffect, useContext, useRef } from "react"
import Footer from '../../components/footer/Footer';
import axiosInstance from '../../axiosInstance';
import { DigiContext } from '../../context/DigiContext';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const DoseMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const dropdownRef = useRef(null);
  const [doses, setDoses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ Dose: '' })
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = doses.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setDoses(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = doses.map((data) => ({ ...data, showDropdown: false }));
        setDoses(updatedData);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [doses]);

  const fetchDoses = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/doses')
      setDoses(response.data.map(item => ({ ...item, showDropdown: false })))
    } catch (error) {
      console.error("Error fetching doses:", error)
      setError('Failed to fetch doses')
    }
    setLoading(false)
  }

  const handleAddNew = () => {
    setFormData({ Dose: '' })
    setSelectedItem(null)
    setModalType('add')
    setShowModal(true)
  }

  const handleEdit = (dose) => {
    setFormData({ Dose: dose.Dose || '' })
    setSelectedItem(dose)
    setModalType('edit')
    setShowModal(true)
  }

  const handleView = (dose) => {
    setFormData({ Dose: dose.Dose || '' })
    setSelectedItem(dose)
    setModalType('view')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (modalType === 'edit' && selectedItem) {
        await axiosInstance.put(`/doses/${selectedItem.DoseId}`, formData)
        fetchDoses()
        setShowModal(false)
      } else {
        await axiosInstance.post('/doses', formData)
        fetchDoses()
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error saving dose:", error)
      setError('Failed to save dose')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dose?')) {
      try {
        setLoading(true)
        await axiosInstance.delete(`/doses/${id}`)
        fetchDoses()
      } catch (error) {
        console.error("Error deleting dose:", error)
        setError('Failed to delete dose')
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchDoses()
  }, [])

  const filteredDoses = doses.filter(dose => 
    dose.Dose?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <th>Dose</th>
        </tr>
      </thead>
      <tbody>
        {filteredDoses.map((dose, index) => (
          <tr key={dose.DoseId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                <button
                  className={`btn btn-sm btn-outline-primary ${dose.showDropdown ? 'show' : ''}`}
                  onClick={(event) => handleDropdownToggle(event, index)}
                >
                  Action <i className="fa-regular fa-angle-down"></i>
                </button>
                <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${dose.showDropdown ? 'show' : ''}`}>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleView(dose); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-eye"></i></span> View
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(dose); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span> Edit
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(dose.DoseId); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span> Delete
                    </a>
                  </li>
                </ul>
              </div>
            </td>
            <td>{dose.DoseId}</td>
            <td>{dose.Dose}</td>
          </tr>
        ))}
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
              <h5>💊 Dose Master</h5>
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
                {modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} Dose
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">💊 Dose *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Dose}
                        onChange={(e) => setFormData({...formData, Dose: e.target.value})}
                        disabled={modalType === 'view'}
                        required
                      />
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

export default DoseMaster
