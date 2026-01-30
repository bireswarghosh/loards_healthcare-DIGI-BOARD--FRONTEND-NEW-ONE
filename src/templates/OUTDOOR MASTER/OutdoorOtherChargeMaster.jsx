import { useState, useEffect, useContext, useRef } from "react"
import Footer from '../../components/footer/Footer'
import axiosInstance from '../../axiosInstance'
import { DigiContext } from '../../context/DigiContext'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

const OutdoorOtherChargeMaster = () => {
  const { isBelowLg } = useContext(DigiContext)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ OtherCharge: '', Rate: '', UNIT: '', OT: '', OTSLOTID: '' })
  const [showInactive, setShowInactive] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')



  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = showInactive ? '/outdoor-other-charges/inactive' : '/outdoor-other-charges'
      const response = await axiosInstance.get(endpoint)
      const data = response.data.success ? response.data.data : []
      setItems(data)
    } catch (error) {
      console.error("Error:", error)
      setError('Failed to fetch: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setFormData({ OtherCharge: '', Rate: '', UNIT: '', OT: '', OTSLOTID: '' })
    setSelectedItem(null)
    setModalType('add')
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setFormData({
      OtherCharge: item.OtherCharge || '',
      Rate: item.Rate || '',
      UNIT: item.UNIT || '',
      OT: item.OT || '',
      OTSLOTID: item.OTSLOTID || ''
    })
    setSelectedItem(item)
    setModalType('edit')
    setShowModal(true)
  }

  const handleView = (item) => {
    setFormData({
      OtherCharge: item.OtherCharge || '',
      Rate: item.Rate || '',
      UNIT: item.UNIT || '',
      OT: item.OT || '',
      OTSLOTID: item.OTSLOTID || ''
    })
    setSelectedItem(item)
    setModalType('view')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (modalType === 'edit' && selectedItem) {
        await axiosInstance.put(`/outdoor-other-charges/${selectedItem.OtherChId}`, formData)
        alert('Updated successfully!')
      } else {
        await axiosInstance.post('/outdoor-other-charges', formData)
        alert('Added successfully!')
      }
      setShowModal(false)
      fetchItems()
    } catch (error) {
      console.error("Error:", error)
      setError('Failed to save: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this charge?')) {
      setLoading(true)
      setError(null)
      try {
        await axiosInstance.delete(`/outdoor-other-charges/${id}`)
        alert('Deleted successfully!')
        fetchItems()
      } catch (error) {
        console.error("Error:", error)
        setError('Failed to delete: ' + (error.response?.data?.message || error.message))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToggleStatus = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await axiosInstance.patch(`/outdoor-other-charges/${id}/toggle-status`)
      fetchItems()
    } catch (error) {
      console.error("Toggle Error:", error)
      setError('Failed to toggle status: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [showInactive])

  const filtered = items.filter(i => 
    i.OtherCharge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.OtherChId?.toString().includes(searchTerm)
  )

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">
      <thead>
        <tr>
          <th className="no-sort"><div className="form-check"><input className="form-check-input" type="checkbox" /></div></th>
          <th>ID</th>
          <th>Charge Name</th>
          <th>Rate</th>
          <th>Unit</th>
          <th>OT</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((item) => (
          <tr key={item.OtherChId}>
            <td><div className="form-check"><input className="form-check-input" type="checkbox" /></div></td>
            <td>{item.OtherChId}</td>
            <td>{item.OtherCharge}</td>
            <td>₹{item.Rate || 'N/A'}</td>
            <td>{item.UNIT || 'N/A'}</td>
            <td>{item.OT || 'N/A'}</td>
            <td>
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  checked={item.Active === 1}
                  onChange={() => handleToggleStatus(item.OtherChId)}
                  style={{ cursor: 'pointer' }}
                  title={item.Active ? 'Active - Click to Deactivate' : 'Inactive - Click to Activate'}
                />
              </div>
            </td>
            <td>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-info" onClick={() => handleView(item)} title="View">
                  <i className="fa-light fa-eye"></i>
                </button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)} title="Edit">
                  <i className="fa-light fa-pen-to-square"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.OtherChId)} title="Delete">
                  <i className="fa-light fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}<button type="button" className="btn-close" onClick={() => setError(null)}></button></div>}
          <div className="panel">
            <div className="panel-header">
              <h5>💰 Outdoor Other Charge Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch"><input type="text" className="form-control form-control-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <button className={`btn btn-sm ${showInactive ? 'btn-warning' : 'btn-info'}`} onClick={() => setShowInactive(!showInactive)}>
                  <i className="fa-light fa-filter"></i> {showInactive ? 'Show Active' : 'Show Inactive'}
                </button>
                <button className="btn btn-sm btn-primary" onClick={handleAddNew}><i className="fa-light fa-plus"></i> Add New</button>
              </div>
            </div>
            <div className="panel-body">
              {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div> : <>{isBelowLg ? <OverlayScrollbarsComponent>{renderTable()}</OverlayScrollbarsComponent> : renderTable()}</>}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} style={{ zIndex: 9998 }}></div>
          <div className={`profile-right-sidebar ${showModal ? 'active' : ''}`} style={{ zIndex: 9999, width: '100%', maxWidth: '500px', right: showModal ? '0' : '-100%', top: '70px', height: 'calc(100vh - 70px)' }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}><i className="fa-light fa-angle-right"></i></button>
            <div className="top-panel" style={{ height: '100%', paddingTop: '10px' }}>
              <div className="dropdown-txt" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#0a1735' }}>{modalType === 'add' ? '➕ Add' : modalType === 'edit' ? '✏️ Edit' : '👁️ View'} Outdoor Other Charge</div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">💰 Charge Name *</label>
                      <input type="text" className="form-control" value={formData.OtherCharge} onChange={(e) => setFormData({ ...formData, OtherCharge: e.target.value })} disabled={modalType === 'view'} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">💵 Rate</label>
                      <input type="number" step="0.01" className="form-control" value={formData.Rate} onChange={(e) => setFormData({ ...formData, Rate: e.target.value })} disabled={modalType === 'view'} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">📦 Unit</label>
                      <input type="text" className="form-control" value={formData.UNIT} onChange={(e) => setFormData({ ...formData, UNIT: e.target.value })} disabled={modalType === 'view'} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">🏥 OT</label>
                      <input type="text" className="form-control" value={formData.OT} onChange={(e) => setFormData({ ...formData, OT: e.target.value })} disabled={modalType === 'view'} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">🔢 OT Slot ID</label>
                      <input type="text" className="form-control" value={formData.OTSLOTID} onChange={(e) => setFormData({ ...formData, OTSLOTID: e.target.value })} disabled={modalType === 'view'} />
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setShowModal(false)}>Cancel</button>
                      {modalType !== 'view' && <button type="submit" className="btn btn-primary w-50" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>}
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

export default OutdoorOtherChargeMaster
