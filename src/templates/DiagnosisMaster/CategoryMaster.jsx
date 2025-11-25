import { useState, useEffect, useRef } from "react"
import axiosInstance from '../../axiosInstance'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import Footer from '../../components/footer/Footer'

const CategoryMaster = () => {
  const dropdownRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [modalType, setModalType] = useState('add')
  const [formData, setFormData] = useState({ Category: '', CategoryType: '' })
  const [search, setSearch] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/categories')
      const data = (res.data.success ? res.data.data : res.data).map(d => ({ ...d, showDropdown: false }))
      setCategories(data)
    } catch (err) {
      console.error("Error:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const toggleDropdown = (e, index) => {
    e.stopPropagation()
    setCategories(prev => prev.map((item, i) => ({ ...item, showDropdown: i === index ? !item.showDropdown : false })))
  }

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategories(prev => prev.map(d => ({ ...d, showDropdown: false })))
      }
    }
    document.addEventListener('click', closeDropdown)
    return () => document.removeEventListener('click', closeDropdown)
  }, [])

  const openDrawerAdd = () => {
    setFormData({ Category: '', CategoryType: '' })
    setEditingItem(null)
    setModalType('add')
    setShowDrawer(true)
  }

  const openDrawerEdit = (item) => {
    setFormData({ Category: item.Category, CategoryType: item.CategoryType })
    setEditingItem(item)
    setModalType('edit')
    setShowDrawer(true)
  }

  const openDrawerView = (item) => {
    setFormData({ Category: item.Category, CategoryType: item.CategoryType })
    setEditingItem(item)
    setModalType('view')
    setShowDrawer(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await axiosInstance.delete(`/categories/${id}`)
      fetchCategories()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'edit') {
        await axiosInstance.put(`/categories/${editingItem.CategoryId}`, formData)
      } else {
        await axiosInstance.post('/categories', formData)
      }
      setShowDrawer(false)
      fetchCategories()
    } catch (err) {
      console.error("Save error:", err)
    }
  }

  const filtered = categories.filter(s => s.Category?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          <h5>🏷️ Category Master</h5>
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
              <i className="fa-light fa-plus"></i> Add Category
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
                    <th>Category</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item.CategoryId}>
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
                              <a href="#" className="dropdown-item text-danger" onClick={(e) => { e.preventDefault(); handleDelete(item.CategoryId); }}>
                                <i className="fa-light fa-trash-can"></i> Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                      <td>{item.CategoryId}</td>
                      <td>{item.Category}</td>
                      <td>{item.CategoryType || '-'}</td>
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
                {modalType === 'add' ? '➕ Add Category' : modalType === 'edit' ? '✏️ Edit Category' : '👁️ View Category'}
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Category *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Category}
                        onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category Type</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.CategoryType}
                        onChange={(e) => setFormData({ ...formData, CategoryType: e.target.value })}
                        disabled={modalType === 'view'}
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

export default CategoryMaster
