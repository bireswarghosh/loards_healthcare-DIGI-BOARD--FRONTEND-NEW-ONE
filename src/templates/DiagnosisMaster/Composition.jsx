import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Composition = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    ItemSubGroup: "",
    SubGroupType:"",
    ItemGroupId:"",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch item sub groups
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/item-subgroups?page=${pageNumber}&limit=${limit}`
      );

      if (res.data.success) {
        setItems(res.data.data);

        if (res.data.pagination) {
          setPage(res.data.pagination.currentPage);
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch {
      toast.error("Failed to fetch data!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // Drawer Add
  const openDrawerAdd = () => {
    setFormData({ ItemSubGroup: "",
    SubGroupType:"",
    ItemGroupId:"", });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  // Drawer Edit
  const openDrawerEdit = (item) => {
    setFormData({ ItemSubGroup: item.ItemSubGroup,
        SubGroupType:item.SubGroupType,
        ItemGroupId:item.ItemGroupId,
     });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  // Drawer View
  const openDrawerView = (item) => {
    setFormData({ ItemSubGroup: item.ItemSubGroup,
        SubGroupType:item.SubGroupType,
        ItemGroupId:item.ItemGroupId, });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // Submit form (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "edit") {
        await axiosInstance.put(
          `/item-subgroups/${editingItem.ItemSubGroupId}`,
          formData
        );
        toast.success("Updated!");
      } else {
        await axiosInstance.post(`/item-subgroups`, formData);
        toast.success("Created!");
      }

      setShowDrawer(false);
      fetchItems(page);
    } catch {
      toast.error("Error saving data!");
    }
  };

  // Delete
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/item-subgroups/${deleteId}`);
      toast.success("Deleted!");

      if (items.length === 1 && page > 1) fetchItems(page - 1);
      else fetchItems(page);

      setShowConfirm(false);
    } catch {
      toast.error("Failed to delete!");
    }
  };

  // Pagination
  const goToPage = (p) => {
    if (p > 0 && p <= totalPages) fetchItems(p);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>📦 Composition (Item Sub Group)</h5>

          <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
            <i className="fa-light fa-plus"></i> Add
          </button>
        </div>

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
                    <th>Item Sub Group</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4">No Data Found</td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.ItemSubGroupId}>
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
                                setDeleteId(item.ItemSubGroupId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.ItemSubGroup}</td>
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
              right: "0",
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
                  background: "#0a1735",
                  color: "#fff",
                  padding: 10,
                }}
              >
                {modalType === "add"
                  ? "➕ Add Sub Group"
                  : modalType === "edit"
                  ? "✏️ Edit Sub Group"
                  : "👁️ View Sub Group"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Sub Group Field */}
                    <div className="mb-3">
                      <label className="form-label">Item Sub Group *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ItemSubGroup}
                        onChange={(e) =>
                        {console.log(e.target.value);
                        
                          setFormData(prev => ({
  ...prev,
  ItemSubGroup: e.target.value
}))}

                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">SubGroupType *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.SubGroupType}
                        onChange={(e) =>
                        {console.log(e.target.value);
                        
                          
                        setFormData(prev => ({
  ...prev,
  SubGroupType: e.target.value
}))
                        }
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">ItemGroupId *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ItemGroupId}
                        onChange={(e) =>
                        {console.log(e.target.value);
                        
                          setFormData(prev => ({
  ...prev,
  ItemGroupId: e.target.value
}));

                        
                        }
                        }
                        disabled={modalType === "view"}
                        required
                      />
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

      {/* DELETE MODAL */}
      {showConfirm && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>

          <div
            className="modal d-block"
            style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
            onClick={() => setShowConfirm(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Confirm Delete</h5>
                  <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
                </div>

                <div className="modal-body text-center">
                  Are you sure you want to delete?
                </div>

                <div className="modal-footer d-flex justify-content-center gap-3">
                  <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
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

      <Footer />
    </div>
  );
};

export default Composition;
