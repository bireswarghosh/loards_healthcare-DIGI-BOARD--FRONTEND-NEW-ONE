import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Collector = () => {
  const dropdownRef = useRef(null);

  // data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);



  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit | view
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    Collector: "",
    ShortName: "",
    Add1: "",
    Add2: "",
    Add3: "",
    Phone: "",
    Zone: "",
    Share: "",
  });

// colector name collection for dropdown----- 
const [collectorList, setCollectorList] = useState([]);


  // search
 const [searchCollector, setSearchCollector] = useState("");

//   const [searchZone, setSearchZone] = useState("");

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // fetch all collectors
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/collector?page=${pageNumber}`);
      const data = res.data.success ? res.data.data : [];

      setItems(data.map((d) => ({ ...d, showDropdown: false })));

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setLimit(res.data.pagination.limit);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch collectors!");
    }
    setLoading(false);
  };

// colector name fetching------- 
const fetchCollectorNames = async () => {
  try {
    const res = await axiosInstance.get(`/collector`);
    if (res.data.success) {
      setCollectorList(res.data.data);
    }
  } catch (err) {
    console.error("Collector list load error:", err);
  }
};


  useEffect(() => {
    fetchItems(1);
  }, []);

  // search handle
 const handleSearch = async (pageNumber = 1) => {
  if (!searchCollector.trim()) {
    return fetchItems(1); // empty hole normal fetch
  }

  try {
    setLoading(true);

    const res = await axiosInstance.get(
      `/collector?search=${searchCollector.trim()}&page=${pageNumber}`
    );

    const data = res.data.success ? res.data.data : [];
    setItems(data);

    if (res.data.pagination) {
      setPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
      setLimit(res.data.pagination.limit);
    }
  } catch (err) {
    console.error("Search error:", err);
    toast.error("Search failed!");
  }

  setLoading(false);
};


  const clearSearch = () => {
    setSearchCollector("");
    // setSearchZone("");
    fetchItems(1);
  };

  // drawer openers
  const openDrawerAdd = () => {
    setFormData({
      Collector: "",
      ShortName: "",
      Add1: "",
      Add2: "",
      Add3: "",
      Phone: "",
      Zone: "",
      Share: "",
    });
    fetchCollectorNames();
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData(item);
    fetchCollectorNames();
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData(item);
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "edit") {
        await axiosInstance.put(`/collector/${editingItem.CollectorId}`, formData);
        toast.success("Updated successfully!");
      } else {
        await axiosInstance.post(`/collector`, formData);
        toast.success("Collector created!");
      }

      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      toast.error("Failed to save collector!");
    }
  };

  // delete confirm
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/collector/${deleteId}`);
      toast.success("Deleted successfully!");

      if (items.length === 1 && page > 1) fetchItems(page - 1);
      else fetchItems(page);

      setShowConfirm(false);
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete!");
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
          <h5>👤 Collector</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Collector Name..."
              value={searchCollector}
              onChange={(e) => setSearchCollector(e.target.value)}
              style={{ width: 150 }}
            />

            {/* <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Zone..."
              value={searchZone}
              onChange={(e) => setSearchZone(e.target.value)}
              style={{ width: 120 }}
            /> */}

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
                    <th>Collector</th>
                    <th>Phone</th>
                    <th>Zone</th>
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
                      <tr key={item.CollectorId}>
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
                                setDeleteId(item.CollectorId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.Collector}</td>
                        <td>{item.Phone}</td>
                        <td>{item.Zone}</td>
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
                  backgroundColor: "#0a1735",
                  color: "#fff",
                  padding: "10px",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Collector"
                  : modalType === "edit"
                  ? "✏️ Edit Collector"
                  : "👁️ View Collector"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Collector */}
                    <div className="mb-3">
                      <label className="form-label">Collector *</label>
                      <select
  className="form-control"
  value={formData.Collector}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      Collector: e.target.value
    }))
  }
  disabled={modalType === "view"}
  required
>
  <option value="">Select Collector</option>

  {collectorList.map((c) => (
    <option key={c.CollectorId} value={c.Collector}>
      {c.Collector}
    </option>
  ))}
</select>

                    </div>

                    {/* Short Name */}
                    <div className="mb-3">
                      <label className="form-label">Short Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ShortName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, ShortName: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>

                    {/* Add1 */}
                    <div className="mb-3">
                      <label className="form-label">Address 1</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add1}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, Add1: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>

                    {/* Add2 */}
                    <div className="mb-3">
                      <label className="form-label">Address 2</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add2}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, Add2: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>

                    {/* Add3 */}
                    <div className="mb-3">
                      <label className="form-label">Address 3</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add3}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, Add3: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                      <label className="form-label">Phone No</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, Phone: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>
<div className="row">
 {/* Zone */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Zone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Zone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, Zone: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>

                    {/* Share */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">% of Share</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.Share}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, Share: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>
</div>
                   

                    {/* Buttons */}
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
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-light fa-triangle-exclamation me-2"></i>
                  Confirm Delete
                </h5>
                <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>

              <div className="modal-body text-center">
                <p>Are you sure you want to delete this collector?</p>
                <p className="text-muted">This action cannot be undone.</p>
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

export default Collector;
