import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DrIPCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    Category: "",
  });

  // search
  const [searchName, setSearchName] = useState("");

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // fetch all
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/dripcategory?page=${pageNumber}`);
      const data = res.data.success ? res.data.data : [];

      setCategories(data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setPage(res.data.pagination.currentPage || 1);
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error(`Fetch failed: ${err.response?.data?.message || err.message || 'Server connection error'}`);
      setCategories([]); // Set empty array on error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // search
  const handleSearch = async () => {
    if (!searchName.trim()) return fetchItems(1);
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/dripcategory?search=${searchName}`);
      setCategories(res.data.data || []);
      setTotalPages(1);
      setPage(1);
    } catch (err) {
      toast.error("Search failed");
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchName("");
    fetchItems(1);
  };

  // drawer
  const openDrawerAdd = () => {
    setFormData({
      Category: "",
    });
    setModalType("add");
    setEditingItem(null);
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      Category: item.Category || "",
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      Category: item.Category || "",
    });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // save
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
    };

    try {
      if (modalType === "edit") {
        await axiosInstance.put(`/dripcategory/${editingItem.id}`, payload);
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post(`/dripcategory`, payload);
        toast.success("Created successfully");
      }
      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  // delete
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/dripcategory/${deleteId}`);
      toast.success("Deleted");
      setDeleteId(null);
      setShowConfirm(false);
      fetchItems(1);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchItems(p);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🏥 Dr.IP Category</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Category name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 200 }}
            />

            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>

            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
              Clear
            </button>

            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add
            </button>
          </div>
        </div>

        {/* TABLE */}
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
                    <th>Category</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4">
                        No data
                      </td>
                    </tr>
                  ) : (
                    categories.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openDrawerView(item)}
                            >
                              <i className="fa fa-eye"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openDrawerEdit(item)}
                            >
                              <i className="fa fa-pen"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setDeleteId(item.id);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.Category || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>
              Prev
            </button>
          </li>

          <li className="page-item disabled">
            <button className="page-link">{page}/{totalPages}</button>
          </li>

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* Drawer */}
      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
          ></div>

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

            <div className="top-panel">
              <div className="dropdown-txt" style={{ background: "#0a1735", color: "#fff", padding: 10 }}>
                {modalType === "add"
                  ? "Add Dr.IP Category"
                  : modalType === "edit"
                  ? "Edit Dr.IP Category"
                  : "View Dr.IP Category"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Category Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Category}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, Category: e.target.value }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
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

      {/* Confirm Delete Modal */}
      {showConfirm && <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
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
                <p className="text-muted">This cannot be undone.</p>
              </div>

              <div className="modal-footer d-flex justify-content-center gap-3">
                <button className="btn btn-secondary px-4" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>

                <button className="btn btn-danger px-4" onClick={confirmDelete}>
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

export default DrIPCategory;