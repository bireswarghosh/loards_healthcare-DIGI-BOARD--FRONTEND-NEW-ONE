import { useState, useEffect, useRef } from "react"
import axiosInstance from '../../axiosInstance'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import Footer from '../../components/footer/Footer'

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CulMedHdMaster = () => {
  const dropdownRef = useRef(null)
  const [culMedHds, setCulMedHds] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [modalType, setModalType] = useState('add')
  const [formData, setFormData] = useState({ CulMedHd: '' })
  const [search, setSearch] = useState('')
  const [showConfirm, setShowConfirm] = useState(false);
const [deleteId, setDeleteId] = useState(null);


  // for pagination----- 
  const [page, setPage] = useState(1);
const [limit,setLimit] = useState(20);
const [totalPages, setTotalPages] = useState(1);


  const fetchCulMedHds = async (pageNumber = page) => {
    setLoading(true)
    try {
      const  res = await axiosInstance.get(`/culmedhds?page=${pageNumber}`);
      const data = (res.data.success ? res.data.data : res.data).map(d => ({ ...d, showDropdown: false }))
      setCulMedHds(data)
      if(res.data.pagination){
        setPage(res.data.pagination.page)
        setTotalPages(res.data.pagination.totalPages)
        setLimit(res.data.pagination.limit)
      }
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
// fetch search---------- 


const fetchSearchCulMedHds = async (pageNumber = 1) => {
  setLoading(true);
  try {
    const res = await axiosInstance.get(
      `/culmedhds/search?name=${search}`
    );
setCulMedHds(res.data.data || []);
    
    if (res.data.pagination) {
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
      setLimit(res.data.pagination.limit);
    }

  } catch (err) {
    console.error("Search error:", err);
  }
  setLoading(false);
};

// handle search----------- 


const handleSearch = () => {
  if (search.trim() === "") {
    // empty search → load normal list
    fetchCulMedHds(1);
  } else {
    fetchSearchCulMedHds(1);
  }
};



  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await axiosInstance.delete(`/culmedhds/${id}`)
      fetchCulMedHds()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }
  


  // confirm delete-------- 
  const confirmDelete = async () => {
    setLoading(true)
  try {
    await axiosInstance.delete(`/culmedhds/${deleteId}`);

    toast.success("Deleted successfully!", { autoClose: 1000 });

    setShowConfirm(false);
    setDeleteId(null);

    // Reload logic
    if (culMedHds.length === 1 && page > 1) {
      fetchCulMedHds(page - 1);
    } else {
      fetchCulMedHds(page);
    }

  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Failed to delete!", { autoClose: 1500 });
  }
  finally{
    setLoading(false)
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (modalType === 'edit') {
        await axiosInstance.put(`/culmedhds/${editingItem.CulMedHdId}`, formData)
         toast.success("Updated Sucessfully",{autoClose:1000})
      } else {
        await axiosInstance.post('/culmedhds', formData)
          toast.success("Created Sucessfully",{autoClose:1000})
      }
      setShowDrawer(false)
      fetchCulMedHds()
    } catch (err) {
      console.error("Save error:", err)
    }
    finally{
      setLoading(false)
    }
  }

  const filtered = culMedHds.filter(s => s.CulMedHd?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          <h5>💬 Culture Medicine Head</h5>
          <div className="d-flex gap-2">
  <input
    type="text"
    className="form-control form-control-sm"
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{ width: "200px" }}
  />

  <button className="btn btn-sm btn-info" onClick={handleSearch}>
    <i className="fa fa-search"></i>
  </button>

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
                    <th>Sl No</th>
                    <th>CulMedHd Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item.CulMedHdId}>
                      <td>
  <div className="d-flex gap-2">

    <button
      className="btn btn-sm btn-outline-info"
      onClick={() => openDrawerView(item)}
    >
      <i className="fa-light fa-eye"></i> 
    </button>

    <button
      className="btn btn-sm btn-outline-primary"
      onClick={() => openDrawerEdit(item)}
    >
      <i className="fa-light fa-pen-to-square"></i> 
    </button>

    <button
      className="btn btn-sm btn-outline-danger"
      onClick={() =>{ 
        // handleDelete(item.CulMedHdId)
setDeleteId(item.CulMedHdId);
    setShowConfirm(true);
      }}
    >
      <i className="fa-light fa-trash-can"></i> 
    </button>

  </div>
</td>

                      <td>{(page - 1) * limit + index + 1}</td>
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
              <div className="dropdown-txt" style={{ position: 'sticky', top: 0, zIndex: 10,  }}>
                {modalType === 'add' ? '➕ Add Item' : modalType === 'edit' ? '✏️ Edit Item' : '👁️ View Item'}
              </div>
              <OverlayScrollbarsComponent style={{ height: 'calc(100% - 70px)' }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Culture Medicine Head *</label>
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
                        <button disabled={loading} type="submit" className="btn btn-primary w-50">
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
  <div className="d-flex justify-content-center mt-3">
  <ul className="pagination pagination-sm">

    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => fetchCulMedHds(page - 1)}>
        Prev
      </button>
    </li>

    {[...Array(totalPages)].map((_, i) => (
      <li
        key={i}
        className={`page-item ${page === i + 1 ? "active" : ""}`}
      >
        <button className="page-link" onClick={() => fetchCulMedHds(i + 1)}>
          {i + 1}
        </button>
      </li>
    ))}

    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => fetchCulMedHds(page + 1)}>
        Next
      </button>
    </li>

  </ul>
</div>




{/* modal--------------------------  */}

{showConfirm && (
  <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>
)}

{showConfirm && (
  <div
    className="modal d-block"
    style={{
      zIndex: 100000,
      background: "rgba(0,0,0,0.2)",
    }}
    onClick={() => setShowConfirm(false)}
  >
    <div
      className="modal-dialog modal-dialog-centered"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="modal-content"
        style={{
          borderRadius: "10px",
          border: "1px solid #1e3a8a15",
          boxShadow: "0 0 25px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* THEME HEADER — based on #0a1735 */}
        <div
          className="modal-header"
          style={{
            // background: "#0a1735",
            // color: "#fff",
            padding: "12px 18px",
          }}
        >
          <h5 className="modal-title">
            <i className="fa-light fa-triangle-exclamation me-2"></i>
            Confirm Delete
          </h5>
          <button
            className="btn-close btn-close-white"
            onClick={() => setShowConfirm(false)}
          ></button>
        </div>

        {/* BODY */}
        <div className="modal-body text-center" style={{ padding: "25px 20px" }}>
          <p className="fs-6 mb-1" >
            Are you sure you want to delete this item?
          </p>
          <p className="text-muted" style={{ fontSize: "14px" }}>
            This action cannot be undone.
          </p>
        </div>

        {/* FOOTER WITH THEME BUTTONS */}
        <div
          className="modal-footer"
          style={{
            borderTop: "1px solid #e5e5e5",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          <button
            className="btn btn-secondary px-4"
            style={{
              borderRadius: "6px",
            }}
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>

          <button
            className="btn px-4" disabled={loading}
            style={{
              background: "#dc3545",
              color: "#fff",
              borderRadius: "6px",
            }}
            onClick={confirmDelete}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      <Footer />
    </div>
  )
}

export default CulMedHdMaster