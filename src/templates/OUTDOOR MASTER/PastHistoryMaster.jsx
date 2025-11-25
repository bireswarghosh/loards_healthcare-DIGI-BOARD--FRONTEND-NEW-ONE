import { useState, useEffect, useContext, useRef } from "react"
import Footer from '../../components/footer/Footer';
import axiosInstance from '../../axiosInstance';
import { DigiContext } from '../../context/DigiContext';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const PastHistoryMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const dropdownRef = useRef(null);
  const [histories, setHistories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ pasthistory: '' })
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = histories.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setHistories(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = histories.map((data) => ({ ...data, showDropdown: false }));
        setHistories(updatedData);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [histories]);

  const fetchHistories = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/past-histories')
      if (response.data.success) {
        setHistories(response.data.data.map(item => ({ ...item, showDropdown: false })))
      }
    } catch (error) {
      console.error("Error fetching histories:", error)
      setError('Failed to fetch histories')
    }
    setLoading(false)
  }

  const handleAddNew = () => {
    setFormData({ pasthistory: '' })
    setSelectedItem(null)
    setModalType('add')
    setShowModal(true)
  }

  const handleEdit = (history) => {
    setFormData({ pasthistory: history.pasthistory || '' })
    setSelectedItem(history)
    setModalType('edit')
    setShowModal(true)
  }

  const handleView = (history) => {
    setFormData({ pasthistory: history.pasthistory || '' })
    setSelectedItem(history)
    setModalType('view')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (modalType === 'edit' && selectedItem) {
        const response = await axiosInstance.put(`/past-histories/${selectedItem.pasthistoryId}`, formData)
        if (response.data.success) {
          fetchHistories()
          setShowModal(false)
        }
      } else {
        const response = await axiosInstance.post('/past-histories', formData)
        if (response.data.success) {
          fetchHistories()
          setShowModal(false)
        }
      }
    } catch (error) {
      console.error("Error saving history:", error)
      setError('Failed to save history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this past history?')) {
      try {
        setLoading(true)
        const response = await axiosInstance.delete(`/past-histories/${id}`)
        if (response.data.success) {
          fetchHistories()
        }
      } catch (error) {
        console.error("Error deleting history:", error)
        setError('Failed to delete history')
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchHistories()
  }, [])

  const filteredHistories = histories.filter(history => 
    history.pasthistory?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <th>Past History</th>
        </tr>
      </thead>
      <tbody>
        {filteredHistories.map((history, index) => (
          <tr key={history.pasthistoryId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                <button
                  className={`btn btn-sm btn-outline-primary ${history.showDropdown ? 'show' : ''}`}
                  onClick={(event) => handleDropdownToggle(event, index)}
                >
                  Action <i className="fa-regular fa-angle-down"></i>
                </button>
                <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${history.showDropdown ? 'show' : ''}`}>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleView(history); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-eye"></i></span> View
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(history); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-pen-to-square"></i></span> Edit
                    </a>
                  </li>
                  <li>
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleDelete(history.pasthistoryId); }}>
                      <span className="dropdown-icon"><i className="fa-light fa-trash-can"></i></span> Delete
                    </a>
                  </li>
                </ul>
              </div>
            </td>
            <td>{history.pasthistoryId}</td>
            <td>{history.pasthistory}</td>
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
              <h5>📋 Past History Master</h5>
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
                {modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} Past History
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">📋 Past History *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.pasthistory}
                        onChange={(e) => setFormData({...formData, pasthistory: e.target.value})}
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

export default PastHistoryMaster
