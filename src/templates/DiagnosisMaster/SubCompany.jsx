import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SubCompany = () => {
  const dropdownRef = useRef(null);

  // data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    SubCompany: "",
    DescId: "",
  });

  // search
  const [searchName, setSearchName] = useState("");

  // delete modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // fetch all items
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/sub-company?page=${pageNumber}&limit=${limit}`
      );

      const data = res.data.success ? res.data.data : [];

      setItems(data.map((d) => ({ ...d, showDropdown: false })));

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setLimit(res.data.pagination.itemsPerPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // search API
  const fetchSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchName.trim()) params.append("subcompanyname", searchName.trim());
      params.append("page", pageNumber);
      params.append("limit", limit);

      const res = await axiosInstance.get(`/sub-company/search?${params}`);

      const data = res.data.success ? res.data.data : [];

      setItems(data.map((d) => ({ ...d, showDropdown: false })));

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setLimit(res.data.pagination.itemsPerPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchName.trim()) {
      fetchItems(1);
    } else {
      fetchSearch(1);
    }
  };

  const clearSearch = () => {
    setSearchName("");
    fetchItems(1);
  };

  // drawer openers
  const openDrawerAdd = () => {
    setFormData({ SubCompany: "", DescId: "" });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      SubCompany: item.SubCompany,
      DescId: item.DescId,
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      SubCompany: item.SubCompany,
      DescId: item.DescId,
    });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "edit") {
        await axiosInstance.put(
          `/sub-company/${editingItem.SubCompanyId}`,
          formData
        );
        toast.success("Updated successfully", { autoClose: 1000 });
      } else {
        await axiosInstance.post(`/sub-company`, formData);
        toast.success("Created successfully", { autoClose: 1000 });
      }

      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  // delete
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/sub-company/${deleteId}`);
      toast.success("Deleted successfully!", { autoClose: 1000 });

      setShowConfirm(false);
      setDeleteId(null);

      if (items.length === 1 && page > 1) {
        fetchItems(page - 1);
      } else {
        fetchItems(page);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete!");
    }
  };

  // pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;

    if (!searchName.trim()) {
      fetchItems(p);
    } else {
      fetchSearch(p);
    }
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          <h5>🏢 Sub Company</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Sub Company..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 180 }}
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

        {/* Body */}
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
                    <th>Sub Company</th>
                    <th>Company</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.SubCompanyId}>
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
                                setDeleteId(item.SubCompanyId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>

                        <td>{item.SubCompany}</td>

                        {/* Company column blank */}
                        <td></td>
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
                //   backgroundColor: "#0a1735",
                //   color: "#fff",
                  padding: "10px",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Sub Company"
                  : modalType === "edit"
                  ? "✏️ Edit Sub Company"
                  : "👁️ View Sub Company"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Sub Company */}
                    <div className="mb-3">
                      <label className="form-label">Sub Company *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.SubCompany}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            SubCompany: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    {/* DescId
                    <div className="mb-3">
                      <label className="form-label">Company Code (DescId)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.DescId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            DescId: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div> */}

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

      {/* Pagination */}
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

      {/* Delete modal */}
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
            <div className="modal-content" style={{ borderRadius: "10px" }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-light fa-triangle-exclamation me-2"></i>
                  Confirm Delete
                </h5>
                <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>

              <div className="modal-body text-center">
                <p className="fs-6 mb-1">Are you sure you want to delete?</p>
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

export default SubCompany;