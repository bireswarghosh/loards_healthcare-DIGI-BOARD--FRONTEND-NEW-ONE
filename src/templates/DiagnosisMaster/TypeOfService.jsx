import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TypeOfService = () => {
  const dropdownRef = useRef(null);

  // data state
  const [items, setItems] = useState([]);
  const[areaName,setAreaName]=useState([])
  const [loading, setLoading] = useState(false);

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit | view
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    ServiceType: "",
    AreaId: "",
    Rate: "",
  });

  // search
  const [searchService, setSearchService] = useState("");
  const [searchArea, setSearchArea] = useState("");

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // ============================================
  // FETCH ALL SERVICE TYPES (GET)
  // ============================================
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/servicetypes?page=${pageNumber}`);
      const data = res.data.success ? res.data.data : [];

      setItems(data.map((d) => ({ ...d, showDropdown: false })));

      if (res.data.pagination) {
        setPage(res.data.pagination.page);
        setLimit(res.data.pagination.limit);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch!");
    }
    setLoading(false);
  };

// Fetch all area---- 
const fetchArea= async()=>{
    setLoading(true)
    try {
    const res= await axiosInstance.get("/area")
    const data=res.data.success ? res.data.data : []
    setAreaName(data)
    } catch (error) {
        toast.error("failled to fetch area")
        
    }
    finally{
        setLoading(false)
    }
}


  useEffect(() => {
    fetchArea();
    fetchItems(1);
  }, []);


// get area name function-----
const getAreaName=(id)=>{
    const found=areaName.find((a)=>a.AreaId===id)
    return found ? found.Area : "not found"
}

    // ============================================
  // SEARCH API
  // ============================================
  const fetchSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchService.trim()) params.append("servicetype", searchService.trim());
      if (searchArea.trim()) params.append("area", searchArea.trim());
      params.append("page", pageNumber);

      const res = await axiosInstance.get(`/servicetypes/search?${params.toString()}`);
      const data = res.data.success ? res.data.data : [];

      setItems(data.map((d) => ({ ...d, showDropdown: false })));

      if (res.data.pagination) {
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
        setLimit(res.data.pagination.limit);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    }
    setLoading(false);
  };

  // search handle
  const handleSearch = () => {
    if (!searchService.trim() && !searchArea.trim()) {
      fetchItems(1);
    } else {
      fetchSearch(1);
    }
  };

  const clearSearch = () => {
    setSearchService("");
    setSearchArea("");
    fetchItems(1);
  };

  // ============================================
  // DRAWER OPEN FUNCTIONS
  // ============================================
  const openDrawerAdd = () => {
    setFormData({ ServiceType: "", AreaId: "", Rate: "" });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      ServiceType: item.ServiceType,
      AreaId: item.AreaId,
      Rate: item.Rate,
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      ServiceType: item.ServiceType,
      AreaId: item.AreaId,
      Rate: item.Rate,
    });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // ============================================
  // SUBMIT FORM (CREATE / UPDATE)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
setLoading(true)
    try {

      if (modalType === "edit") {
        await axiosInstance.put(`/servicetypes/${editingItem.ServiceTypeId}`, formData);
        toast.success("Updated successfully!", { autoClose: 1000 });
      } else {
        await axiosInstance.post(`/servicetypes`, formData);
        toast.success("Created successfully!", { autoClose: 1000 });
      }

      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to save");
    }
    finally{
      setLoading(false)
    }
  };

  // ============================================
  // DELETE CONFIRM
  // ============================================
  const confirmDelete = async () => {
    setLoading(true)
    try {
      await axiosInstance.delete(`/servicetypes/${deleteId}`);
      toast.success("Deleted successfully!", { autoClose: 1000 });

      setShowConfirm(false);
      setDeleteId(null);

      // pagination logic
      if (items.length === 1 && page > 1) {
        fetchItems(page - 1);
      } else {
        fetchItems(page);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete!");
    }
    finally{setLoading(false)}
  };

  // ============================================
  // PAGINATION
  // ============================================
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;

    if (!searchService.trim() && !searchArea.trim()) {
      fetchItems(p);
    } else {
      fetchSearch(p);
    }
  };


    return (
    <div className="main-content">
      <ToastContainer />

      {/* ================= PANEL HEADER ================= */}
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🛠️ Type Of Service</h5>

          <div className="d-flex gap-2">
            {/* Search Inputs */}
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Service Type..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              style={{ width: 150 }}
            />
{/* 
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Area..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              style={{ width: 120 }}
            /> */}

            {/* Search Buttons */}
            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>

            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
              Clear
            </button>

            {/* Add */}
            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add
            </button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-striped table-hover table-dashed">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Sl No</th>
                    <th>Area</th>
                    <th>Service Type</th>
                    <th>Rate</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.ServiceTypeId}>
                        <td>
                          <div className="d-flex gap-2">
                            {/* View */}
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openDrawerView(item)}
                            >
                              <i className="fa-light fa-eye"></i>
                            </button>

                            {/* Edit */}
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openDrawerEdit(item)}
                            >
                              <i className="fa-light fa-pen-to-square"></i>
                            </button>

                            {/* Delete */}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setDeleteId(item.ServiceTypeId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{getAreaName(item.AreaId)}</td>
                        <td>{item.ServiceType}</td>
                        <td>{item.Rate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* ================= DRAWER ================= */}
      {showDrawer && (
        <>
          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>

          {/* RIGHT SIDEBAR DRAWER */}
          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "420px",
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={() => setShowDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  padding: "10px",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Service Type"
                  : modalType === "edit"
                  ? "✏️ Edit Service Type"
                  : "👁️ View Service Type"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
  {/* SERVICE TYPE */}
                    <div className="mb-3">
                      <label className="form-label">Service Type *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ServiceType}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, ServiceType: e.target.value }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    {/* AREA */}
                    <div className="mb-3">
                      <label className="form-label">Area </label>

                      <select
                        className="form-control"
                        value={formData.AreaId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, AreaId: e.target.value }))
                        }
                        disabled={modalType === "view"}
                        
                      >
                        <option value="">-- Select Area --</option>
                        {areaName.map((a, idx) => (
                          <option key={idx} value={a.AreaId}>{getAreaName(a.AreaId)}</option>
                        ))}
                      </select>
                     
                    </div>

                  

                    {/* RATE */}
                    <div className="mb-3">
                      <label className="form-label">Collection Rate </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.Rate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, Rate: e.target.value }))
                        }
                        disabled={modalType === "view"}
                        
                      />
                    </div>

                    {/* BUTTONS */}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>

                      {modalType !== "view" && (
                        <button  disabled={loading} type="submit" className="btn btn-primary w-50">
                          {loading ? "Submitting" : "save"}
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

  


      {/* ================= PAGINATION ================= */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>
              Prev
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${page === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {showConfirm && <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>}

      {showConfirm && (
        <div
          className="modal d-block"
          style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div
              className="modal-content"
              style={{
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-light fa-triangle-exclamation me-2"></i>
                  Confirm Delete
                </h5>
                <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>

              <div className="modal-body text-center">
                <p className="fs-6 mb-1">Are you sure you want to delete this?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>

              <div className="modal-footer d-flex justify-content-center gap-3">
                <button  disabled={loading} className="btn btn-secondary px-4" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>

                <button  disabled={loading} className="btn btn-danger px-4" onClick={confirmDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TypeOfService;