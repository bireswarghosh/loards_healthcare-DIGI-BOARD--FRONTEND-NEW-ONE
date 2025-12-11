import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReportHeading = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit | view
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    ReportHeading: "",
  });

  // Search
  const [searchText, setSearchText] = useState("");

  // Delete Confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch List
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reportheading?page=${pageNumber}`);
      const data = res.data.success ? res.data.data : [];

      setItems(data);

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Failed to fetch!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // Search API
  const handleSearch = async () => {
    if (!searchText.trim()) return fetchItems(1);

    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/reportheading?search=${searchText.trim()}`
      );

      if (res.data.success) {
        setItems(res.data.data);
      }

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Search failed!");
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchText("");
    fetchItems(1);
  };

  // Drawer open/add
  const openDrawerAdd = () => {
    setFormData({ ReportHeading: "" });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({ ReportHeading: item.ReportHeading });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({ ReportHeading: item.ReportHeading });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
setLoading(true)
    try {
      if (modalType === "edit") {
        await axiosInstance.put(
          `/reportheading/${editingItem.ReportHeadingId}`,
          formData
        );
        toast.success("Updated successfully!");
      } else {
        await axiosInstance.post(`/reportheading`, formData);
        toast.success("Created successfully!");
      }

      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      toast.error("Failed to save data!");
    }
     finally{setLoading(false)}
  };

  // Delete Confirm
  const confirmDelete = async () => {
    setLoading(true)
    try {
      await axiosInstance.delete(`/reportheading/${deleteId}`);
      toast.success("Deleted successfully!");

      if (items.length === 1 && page > 1) fetchItems(page - 1);
      else fetchItems(page);

      setShowConfirm(false);
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete!");
    }
     finally{setLoading(false)}
  };

  // Pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchItems(p);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>📄 Report Heading</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Heading..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
                    <th className="text-center">Report Heading</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.ReportHeadingId}>
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
                              onClick={() => {
                                setDeleteId(item.ReportHeadingId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td className="text-center">{item.ReportHeading}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* Drawer */}
      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
            style={{ zIndex: 9998 }}
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
                  ? "➕ Add Report Heading"
                  : modalType === "edit"
                  ? "✏️ Edit Report Heading"
                  : "👁️ View Report Heading"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Report Heading *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ReportHeading}
                        onChange={(e) =>
                          setFormData({ ReportHeading: e.target.value })
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        disabled={loading}
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Cancel
                      </button>

                      {modalType !== "view" && (
                        <button type="submit" disabled={loading} className="btn btn-primary w-50">
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

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>
              Prev
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
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

      {/* Delete Modal */}
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
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-light fa-triangle-exclamation me-2"></i>
                  Confirm Delete
                </h5>
                <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>

              <div className="modal-body text-center">
                <p>Are you sure you want to delete this report heading?</p>
                <p className="text-muted">This cannot be undone.</p>
              </div>

              <div className="modal-footer d-flex justify-content-center gap-3">
                <button disabled={loading} className="btn btn-secondary px-4" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>

                <button disabled={loading} className="btn btn-danger px-4" onClick={confirmDelete}>
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

export default ReportHeading;