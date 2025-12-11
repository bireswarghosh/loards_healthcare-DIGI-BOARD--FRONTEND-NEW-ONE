import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DiagProfile = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

// subdepertment------------------
  const [subDepartments, setSubDepartments] = useState([]);

  // department name 
  const [departmentName, setDepartmentName] = useState("");



  const [formData, setFormData] = useState({
    Profile: "",
    Department: "",
    SubDepartmentId: "",
    Rate: "",
    cost: "",
    DeliveryAfter: "",
    NotReq: false,
    Interpretation: "",
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
      const res = await axiosInstance.get(`/profile?page=${pageNumber}`);
      const data = res.data.success ? res.data.data : [];

      setItems(data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setPage(res.data.pagination.currentPage || 1);
      }
    } catch (err) {
      toast.error("Fetch failed");
    }
    setLoading(false);
  };
//fetch sub department-------
const fetchSubDepartments = async () => {
  try {
    const res = await axiosInstance.get(`/subdepartment`);
    setSubDepartments(res.data.data || []);
  } catch (err) {
    console.error("SubDepartment load error:", err);
  }
};

// fetch department name---- 
const fetchDepartmentName = async (deptId) => {
  try {
    const res = await axiosInstance.get(`/department/${deptId}`);
    if (res.data?.data?.Department) {
      setDepartmentName(res.data.data.Department);
      setFormData((prev) => ({ ...prev, Department: res.data.data.Department }));
    }
  } catch (err) {
    console.error("Department fetch error:", err);
  }
};

  useEffect(() => {
    fetchSubDepartments();
    fetchItems(1);
  }, []);


// find subdepartment name---- 
const getSubDeptName = (id) => {
  const found = subDepartments.find((sd) => sd.SubDepartmentId === id);
  return found ? found.SubDepartment : "—";
};


  // search
  const handleSearch = async () => {
    if (!searchName.trim()) return fetchItems(1);
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/profile?search=${searchName}`);
      setItems(res.data.data || []);
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
      Profile: "",
      Department: "",
      SubDepartmentId: "",
      Rate: "",
      cost: "",
      DeliveryAfter: "",
      NotReq: false,
      Interpretation: "",
    });
    setModalType("add");
    setEditingItem(null);
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      Profile: item.Profile || "",
      Department: item.Department || "",
      SubDepartmentId: item.SubDepartmentId || "",
      Rate: item.Rate || "",
      cost: item.cost || "",
      DeliveryAfter: item.DeliveryAfter || "",
      NotReq: item.NotReq === 1,
      Interpretation: item.Interpretation || "",
    });
    // find departmentId from subdepartment list
const sd = subDepartments.find(s => s.SubDepartmentId === item.SubDepartmentId);

if (sd?.DepartmentId) {
  fetchDepartmentName(sd.DepartmentId);
}

    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      Profile: item.Profile || "",
      Department: item.Department || "",
      SubDepartmentId: item.SubDepartmentId || "",
      Rate: item.Rate || "",
      cost: item.cost || "",
      DeliveryAfter: item.DeliveryAfter || "",
      NotReq: item.NotReq === 1,
      Interpretation: item.Interpretation || "",
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
      NotReq: formData.NotReq ? 1 : 0,
    };

    try {
      if (modalType === "edit") {
        await axiosInstance.put(`/profile/${editingItem.ProfileId}`, payload);
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post(`/profile`, payload);
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
      await axiosInstance.delete(`/profile/${deleteId}`);
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
          <h5>🧾Profile</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Profile name..."
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
                    <th>Profile Name</th>
                    
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4">
                        No data
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.ProfileId}>
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
                                setDeleteId(item.ProfileId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.Profile || "—"}</td>
                        
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
                  ? "Add Profile"
                  : modalType === "edit"
                  ? "Edit Profile"
                  : "View Profile"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                    <div className="mb-2 col-md-4">
                      <label className="form-label">Profile Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Profile}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, Profile: e.target.value }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    <div className="mb-2 col-md-4">
                      <label className="form-label">Department *</label>
                      <input
  type="text"
  className="form-control"
  value={formData.Department}
  disabled
/>

                    </div>

                    <div className="mb-2 col-md-4">
                      <label className="form-label">Sub Department *</label>
                    <select
  className="form-control"
  value={formData.SubDepartmentId}
 onChange={(e) => {
  const subId = Number(e.target.value);
  setFormData((p) => ({ ...p, SubDepartmentId: subId }));

  // find subdepartment to get departmentId
  const selected = subDepartments.find((s) => s.SubDepartmentId === subId);
  if (selected?.DepartmentId) {
    fetchDepartmentName(selected.DepartmentId);
  }
}}

  disabled={modalType === "view"}
>
  <option value="">Select Sub Department</option>

  {subDepartments.map((sd) => (
    <option key={sd.SubDepartmentId} value={sd.SubDepartmentId}>
      {sd.SubDepartment}
    </option>
  ))}
</select>

                    </div>
</div>
                    <div className="row">
                      <div className="col-md-4 mb-2">
                        <label className="form-label">Rate(Rs.) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.Rate}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, Rate: e.target.value }))
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label">Costing *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.cost}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, cost: e.target.value }))
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                        <div className="mb-2 col-md-4">
                      <label className="form-label">Delivery After</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="day(s)"
                        min="0"
                        value={formData.DeliveryAfter}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, DeliveryAfter: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>
                    </div>

                  

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.NotReq}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, NotReq: e.target.checked }))
                        }
                        disabled={modalType === "view"}
                      />
                      <label className="form-check-label">Not Required</label>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Interpretation</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.Interpretation}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, Interpretation: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      ></textarea>
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
export default DiagProfile;