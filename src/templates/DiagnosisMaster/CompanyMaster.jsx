import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompanyMaster = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    ItemGroup: "",
    ItemGroupType: "M",
  });

  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Data
  const fetchItems = async (pageNo = 1, searchVal = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/item-groups?page=${pageNo}&limit=${limit}&search=${searchVal}`
      );

      if (res.data.success) {
        setItems(res.data.data);

        if (res.data.pagination) {
          setPage(res.data.pagination.currentPage);
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch {
      toast.error("Failed to fetch!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // Search
  const handleSearch = () => {
    fetchItems(1, searchText.trim());
  };

  const clearSearch = () => {
    setSearchText("");
    fetchItems(1);
  };

  // Drawer Open Add
  const openDrawerAdd = () => {
    setFormData({
      ItemGroup: "",
      ItemGroupType: "",
    });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  // Drawer Edit
  const openDrawerEdit = (item) => {
    setFormData({
      ItemGroup: item.ItemGroup,
      ItemGroupType: item.ItemGroupType,
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  // Drawer View
  const openDrawerView = (item) => {
    setFormData({
      ItemGroup: item.ItemGroup,
      ItemGroupType: item.ItemGroupType,
    });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      if (modalType === "edit") {
        await axiosInstance.put(
          `/item-groups/${editingItem.ItemGroupId}`,
          formData
        );
        toast.success("Updated successfully!");
      } else {
        await axiosInstance.post(`/item-groups`, formData);
        toast.success("Created successfully!");
      }

      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save!");
    }
    finally{
        setLoading(false)
    }
  };

  // Delete
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/item-groups/${deleteId}`);
      toast.success("Deleted!");

      if (items.length === 1 && page > 1) fetchItems(page - 1);
      else fetchItems(page);

      setShowConfirm(false);
    } catch {
      toast.error("Delete failed!");
    }
  };

  // Pagination
  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) fetchItems(p, searchText);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      {/* Panel */}
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🏢 Company Master</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Company..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220 }}
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

        {/* Table */}
        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>SL</th>
                    <th>Item Group (Company)</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4">
                        No Data Found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.ItemGroupId}>
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
                              <i className="fa-light fa-pen"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setDeleteId(item.ItemGroupId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.ItemGroup}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* RIGHT DRAWER */}
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
              right: 0,
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              <div className="d-flex justify-content-between me-3 ">
                 <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  // backgroundColor: "#0a1735",
                  // color: "#fff",
                  padding: "10px",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Test"
                  : modalType === "edit"
                  ? "✏️ Edit Test"
                  : "👁️ View Test"}
              </div>
              <div style={{cursor:"pointer"}} onClick={() => setShowDrawer(false)}>
                X
              </div>
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Company Name */}
                    <div className="mb-3">
                      <label className="form-label">Item Group (Company) *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ItemGroup}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ItemGroup: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    {/* Type */}
                    {/* <div className="mb-3">
                      <label className="form-label">Item Group Type *</label>
                      <select
                        className="form-control"
                        value={formData.ItemGroupType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ItemGroupType: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        // required 
                      >
                          <option value="">select</option>
                        <option value="M">M</option>
                        <option value="A">A</option>
                        <option value="S">S</option>
                      </select>
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
                        <button type="submit" disabled={loading} className="btn btn-primary w-50">
                         {loading ? "saving" :"save"} 
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

      {/* DELETE MODAL */}
      {showConfirm && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>

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
                  <h5>Confirm Delete</h5>
                  <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
                </div>

                <div className="modal-body text-center">
                  Are you sure you want to delete this company?
                </div>

                <div className="modal-footer d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Yes, Delete
                  </button>
                </div>
              </div>
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

      <Footer />
    </div>
  );
};

export default CompanyMaster;
