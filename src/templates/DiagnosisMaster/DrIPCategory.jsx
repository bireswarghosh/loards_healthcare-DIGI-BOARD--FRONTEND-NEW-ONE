import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxiosFetch from "./Fetch";

const DrIpCategory = () => {
  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

  // form
  const [formData, setFormData] = useState({
    Category: "",
    DoctorName: "",
    PhoneNo: "",
    DrIPCategoryId: " ",
    DoctorId: " ",
  });

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // drip category
  const {
    data: items,
    loading: itemLoading,
    refetch: fetchItems,
  } = useAxiosFetch("/dripcategory", []);

  // doctor
  const [doctorList, setDoctorList] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  const doctorRef = useRef(null);

  /* =========================
     FETCH ALL DOCTORS (TOTAL)
  ========================== */
  const fetchAllDoctors = async () => {
    try {
      setDoctorLoading(true);

      const firstRes = await axiosInstance.get("/doctormaster", {
        params: { limit: 1, page: 1 },
      });

      const total = firstRes.data?.total || 0;
      if (!total) return;

      const allRes = await axiosInstance.get("/doctormaster", {
        params: { limit: total, page: 1 },
      });

      setDoctorList(allRes.data?.data || []);
    } catch (err) {
      toast.error("Failed to fetch doctors");
    } finally {
      setDoctorLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================== */
  useEffect(() => {
    fetchItems();
    fetchAllDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     CLICK OUTSIDE CLOSE
  ========================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (doctorRef.current && !doctorRef.current.contains(e.target)) {
        setShowDoctorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     FILTERED DOCTORS
  ========================== */
  const filteredDoctors = doctorSearch
    ? doctorList.filter((d) =>
        d.Doctor?.toLowerCase().includes(doctorSearch.toLowerCase())
      )
    : doctorList;

  /* =========================
     DRAWER OPENERS
  ========================== */
  const openDrawerAdd = () => {
    setFormData({
      Category: "",
      DoctorName: "",
      PhoneNo: "",
      DrIPCategoryId: " ",
      DoctorId: " ",
    });
    setDoctorSearch("");
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      Category: item.Category,
      DoctorName: item.DoctorName,
      PhoneNo: item.PhoneNo,
      DrIPCategoryId: item.DrIPCategoryId,
      DoctorId: " ",
    });
    setDoctorSearch(item.DoctorName || "");
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      Category: item.Category,
      DoctorName: item.DoctorName,
      PhoneNo: item.PhoneNo,
      DrIPCategoryId: item.DrIPCategoryId,
      DoctorId: " ",
    });
    setDoctorSearch(item.DoctorName || "");
    setModalType("view");
    setShowDrawer(true);
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "edit") {
        await axiosInstance.put(
          `/dripcategory/${editingItem.DrIPCategoryId}`,
          formData
        );
        toast.success("Updated successfully!");
      } else {
        await axiosInstance.post("/dripcategory", formData);
        toast.success("Created successfully!");
      }
      setShowDrawer(false);
      fetchItems();
    } catch {
      toast.error("Save failed!");
    }
  };

  /* =========================
     DELETE
  ========================== */
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/dripcategory/${deleteId}`);
      toast.success("Deleted!");
      setShowConfirm(false);
      fetchItems();
    } catch {
      toast.error("Failed to delete!");
    }
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🏥 Drip Category</h5>
          <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
            <i className="fa-light fa-plus"></i> Add Doctor
          </button>
        </div>

        <div className="panel-body">
          {itemLoading || doctorLoading ? (
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
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.DrIPCategoryId}>
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
                                setDeleteId(item.DrIPCategoryId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                        <td>{index + 1}</td>
                        <td>{item.Category}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* ================= RIGHT SIDEBAR ================= */}
      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
            style={{ zIndex: 9997 }}
          />

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9998,
              maxWidth: "420px",
              width: "100%",
              right: "0",
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

            <div className="top-panel h-100">
              <div className="dropdown-txt p-2">
                {modalType === "add"
                  ? "➕ Add Doctor"
                  : modalType === "edit"
                  ? "✏️ Edit Doctor"
                  : "👁️ View Doctor"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Category */}
                    <div className="mb-3">
                      <label className="form-label">Category *</label>
                      <input
                        className="form-control"
                        value={formData.Category}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            Category: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    {/* Doctor Search Dropdown */}
                    <div className="mb-3 position-relative" ref={doctorRef}>
                      <label className="form-label">Doctor Name *</label>
                      <input
                        className="form-control"
                        placeholder="Search doctor..."
                        value={doctorSearch}
                        onFocus={() => setShowDoctorDropdown(true)}
                        onChange={(e) => {
                          setDoctorSearch(e.target.value);
                          setShowDoctorDropdown(true);
                        }}
                        disabled={modalType === "view"}
                      />

                      {showDoctorDropdown && (
                        <div
                          className="border rounded bg-black position-absolute w-100 mt-1"
                          style={{
                              
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 9999,
                          }}
                        >
                          {filteredDoctors.length === 0 ? (
                            <div className="px-2 py-1 text-muted">
                              No doctor found
                            </div>
                          ) : (
                            filteredDoctors.slice(0, 100).map((d) => (
                              <div
                                key={d.DoctorId}
                                className="px-2 py-1 dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setFormData((p) => ({
                                    ...p,
                                    DoctorName: d.Doctor,
                                  }));
                                  setDoctorSearch(d.Doctor);
                                  setShowDoctorDropdown(false);
                                }}
                              >
                                {d.Doctor}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                      <label className="form-label">Phone *</label>
                      <input
                      type="number"
                        className="form-control"
                        value={formData.PhoneNo}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            PhoneNo: e.target.value,
                          }))
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
    </div>
  );
};

export default DrIpCategory;