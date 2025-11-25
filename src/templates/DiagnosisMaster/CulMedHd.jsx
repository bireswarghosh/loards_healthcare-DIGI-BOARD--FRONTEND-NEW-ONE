import { useState, useEffect, useRef } from "react"
import axiosInstance from '../../axiosInstance'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import Footer from '../../components/footer/Footer'

const CulMedHdMaster = () => {
  const dropdownRef = useRef(null)
  const [culMedHds, setCulMedHds] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [modalType, setModalType] = useState('add')
  const [formData, setFormData] = useState({ CulMedHd: '' })
  const [search, setSearch] = useState('')

  const fetchCulMedHds = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/culmedhds')
      const data = (res.data.success ? res.data.data : res.data).map(d => ({ ...d, showDropdown: false }))
      setCulMedHds(data)
    } catch (err) {
      console.error("Error:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCulMedHds()
  }, [])

  const toggleDropdown = (e, index) => {
    e.stopPropagation()
    setCulMedHds(prev => prev.map((item, i) => ({ ...item, showDropdown: i === index ? !item.showDropdown : false })))
  }

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCulMedHds(prev => prev.map(d => ({ ...d, showDropdown: false })))
      }
    }
    document.addEventListener('click', closeDropdown)
    return () => document.removeEventListener('click', closeDropdown)
  }, [])

  const openDrawerAdd = () => {
    setFormData({ CulMedHd: '' })
    setEditingItem(null)
    setModalType('add')
    setShowDrawer(true)
  }

  const openDrawerEdit = (item) => {
    setFormData({ CulMedHd: item.CulMedHd })
    setEditingItem(item)
    setModalType('edit')
    setShowDrawer(true)
  }

  const openDrawerView = (item) => {
    setFormData({ CulMedHd: item.CulMedHd })
    setEditingItem(item)
    setModalType('view')
    setShowDrawer(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await axiosInstance.delete(`/culmedhds/${id}`)
      fetchCulMedHds()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'edit') {
        await axiosInstance.put(`/culmedhds/${editingItem.CulMedHdId}`, formData)
      } else {
        await axiosInstance.post('/culmedhds', formData)
      }
      setShowDrawer(false)
      fetchCulMedHds()
    } catch (err) {
      console.error("Save error:", err)
    }
  }

  const filtered = culMedHds.filter(s => s.CulMedHd?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          <h5>💬 Culture Medicine Master</h5>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "200px" }}
            />
            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add Item
            </button>
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
                    <th>Action</th>
                    <th>ID</th>
                    <th>Culture Medicine</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item.CulMedHdId}>
                      <td>
                        <div className="digi-dropdown dropdown d-inline-block" ref={dropdownRef}>
                          <button
                            className={`btn btn-sm btn-outline-primary ${item.showDropdown ? 'show' : ''}`}
                            onClick={(e) => toggleDropdown(e, index)}
                          >
                            Action <i className="fa-regular fa-angle-down"></i>
                          </button>
                          <ul className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${item.showDropdown ? 'show' : ''}`}>
                            <li>
                              <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); openDrawerView(item); }}>
                                <i className="fa-light fa-eye"></i> View
                              </a>
                            </li>
                            <li>
                              <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); openDrawerEdit(item); }}>
                                <i className="fa-light fa-pen-to-square"></i> Edit
                              </a>
                            </li>
                            <li>
                              <a href="#" className="dropdown-item text-danger" onClick={(e) => { e.preventDefault(); handleDelete(item.CulMedHdId); }}>
                                <i className="fa-light fa-trash-can"></i> Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                      <td>{item.CulMedHdId}</td>
                      <td>{item.CulMedHd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {showDrawer && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowDrawer(false)} style={{ zIndex: 9998 }}></div>
          <div className="profile-right-sidebar active" style={{ zIndex: 9999, width: '100%', maxWidth: '450px', right: showDrawer ? '0' : '-100%', top: '70px', height: 'calc(100vh - 70px)' }}>
            <button className="right-bar-close" onClick={() => setShowDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: '100%' }}>
              <div className="dropdown-txt" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#0a1735' }}>
                {modalType === 'add' ? '➕ Add Item' : modalType === 'edit' ? '✏️ Edit Item' : '👁️ View Item'}
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Culture Medicine *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.CulMedHd}
                        onChange={(e) => setFormData({ CulMedHd: e.target.value })}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setShowDrawer(false)}>
                        Cancel
                      </button>
                      {modalType !== 'view' && (
                        <button type="submit" className="btn btn-primary w-50">
                          Save
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

export default CulMedHdMaster
