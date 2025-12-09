import { useState, useEffect, useRef } from "react";
import axiosInstance from '../../axiosInstance';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Footer from '../../components/footer/Footer';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Soluation = () => {
  const dropdownRef = useRef(null);

  // data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // drawer/modal
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit | view
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ Salutation: "", sex: "" });

  // search
  const [searchSalutation, setSearchSalutation] = useState("");
  const [searchSex, setSearchSex] = useState("");

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // fetch all (paginated)
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/salutations?page=${pageNumber}`);
      const respData = res.data;
      const data = respData.success ? respData.data : [];
      setItems(data.map(d => ({ ...d, showDropdown: false })));
      if (respData.pagination) {
        setPage(respData.pagination.page || pageNumber);
        setTotalPages(respData.pagination.totalPages || 1);
        setLimit(respData.pagination.limit || 20);
      } else {
        setPage(pageNumber);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // search endpoint
  const fetchSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchSalutation.trim()) params.append("salutation", searchSalutation.trim());
      if (searchSex.trim()) params.append("sex", searchSex.trim());
      params.append("page", pageNumber);

      const res = await axiosInstance.get(`/salutations/search?${params.toString()}`);
      const respData = res.data;
      const data = respData.success ? respData.data : [];
      setItems(data.map(d => ({ ...d, showDropdown: false })));
      if (respData.pagination) {
        setPage(respData.pagination.page || pageNumber);
        setTotalPages(respData.pagination.totalPages || 1);
        setLimit(respData.pagination.limit || 20);
      } else {
        setPage(pageNumber);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // toggle dropdown for per-row actions (if needed)
  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setItems(prev => prev.map((it, i) => ({ ...it, showDropdown: i === index ? !it.showDropdown : false })));
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setItems(prev => prev.map(d => ({ ...d, showDropdown: false })));
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  // drawer openers
  const openDrawerAdd = () => {
    setFormData({ Salutation: "", sex: "" });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };
  const openDrawerEdit = (item) => {
    setFormData({ Salutation: item.Salutation || "", sex: item.sex || "" });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };
  const openDrawerView = (item) => {
    setFormData({ Salutation: item.Salutation || "", sex: item.sex || "" });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // handle search submit
  const handleSearch = () => {
    if (!searchSalutation.trim() && !searchSex.trim()) {
      fetchItems(1);
    } else {
      fetchSearch(1);
    }
  };

  const clearSearch = () => {
    setSearchSalutation("");
    setSearchSex("");
    fetchItems(1);
  };

  // create / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "edit" && editingItem) {
        await axiosInstance.put(`/salutations/${editingItem.SalutationId}`, formData);
        toast.success("Updated successfully", { autoClose: 1200 });
      } else {
        await axiosInstance.post('/salutations', formData);
        toast.success("Created successfully", { autoClose: 1200 });
      }
      setShowDrawer(false);
      // reload current page (or page 1 if new created)
      fetchItems(page);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Save failed");
    }
  };

  // delete flow
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(`/salutations/${deleteId}`);
      toast.success("Deleted successfully", { autoClose: 1200 });
      setShowConfirm(false);
      setDeleteId(null);

      // reload logic: if last item on page removed and page>1, go to previous page
      if (items.length === 1 && page > 1) {
        fetchItems(page - 1);
      } else {
        fetchItems(page);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  // pagination click
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    if (!searchSalutation.trim() && !searchSex.trim()) {
      fetchItems(p);
    } else {
      // maintain search when paginating search results
      fetchSearch(p);
    }
  };

  return (
    <div className="main-content">
      <ToastContainer />
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🎯 Salutations</h5>

          <div className="d-flex gap-2 align-items-center">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Salutation..."
              value={searchSalutation}
              onChange={(e) => setSearchSalutation(e.target.value)}
              style={{ width: 150 }}
            />
            <select
              className="form-control form-control-sm"
              value={searchSex}
              onChange={(e) => setSearchSex(e.target.value)}
              style={{ width: 110 }}
            >
              <option value="">Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="F">F</option>
              <option value="-">-</option>
            </select>

            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>
            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>Clear</button>

            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add
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
                    <th>Sex</th>
                    <th>Salutation</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-4">No data</td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.SalutationId}>
                        <td>
                          <div className="d-flex gap-2" ref={dropdownRef}>
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
                              onClick={() => {
                                setDeleteId(item.SalutationId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.sex}</td>
                        <td>{item.Salutation}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* right drawer */}
      {showDrawer && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowDrawer(false)} style={{ zIndex: 9998 }}></div>

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "420px",
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)"
            }}
          >
            <button className="right-bar-close" onClick={() => setShowDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#0a1735", color: "#fff", padding: "10px" }}>
                {modalType === "add" ? "➕ Add Salutation" : modalType === "edit" ? "✏️ Edit Salutation" : "👁️ View Salutation"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Salutation *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Salutation}
                        onChange={(e) => setFormData(prev => ({ ...prev, Salutation: e.target.value }))}
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Sex *</label>
                      <select
                        className="form-control"
                        value={formData.sex}
                        onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                        disabled={modalType === "view"}
                        required
                      >
                        <option value="">Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="F">F</option>
                        <option value="-">-</option>
                      </select>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setShowDrawer(false)}>
                        Cancel
                      </button>

                      {modalType !== "view" && (
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

      {/* pagination */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>Prev</button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => goToPage(i + 1)}>{i + 1}</button>
            </li>
          ))}

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>Next</button>
          </li>
        </ul>
      </div>

      {/* confirm delete modal */}
      {showConfirm && <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
              <div className="modal-header" style={{ padding: "12px 18px" }}>
                <h5 className="modal-title"><i className="fa-light fa-triangle-exclamation me-2"></i>Confirm Delete</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>

              <div className="modal-body text-center" style={{ padding: "25px 20px" }}>
                <p className="fs-6 mb-1">Are you sure you want to delete this item?</p>
                <p className="text-muted" style={{ fontSize: "14px" }}>This action cannot be undone.</p>
              </div>

              <div className="modal-footer" style={{ borderTop: "1px solid #e5e5e5", padding: "12px 16px", display: "flex", justifyContent: "center", gap: "15px" }}>
                <button className="btn btn-secondary px-4" style={{ borderRadius: "6px" }} onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="btn px-4" style={{ background: "#dc3545", color: "#fff", borderRadius: "6px" }} onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Soluation;

