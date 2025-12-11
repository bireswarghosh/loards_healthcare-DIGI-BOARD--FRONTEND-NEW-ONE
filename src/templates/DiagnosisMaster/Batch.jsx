import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Batch = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

  const [forName,setForName]=useState([])

  const [formData, setFormData] = useState({
    Batch: "",
    BatchId:"",
    ExpDate: "",
    MRP:"",
    ItemId:"",
    EYN: 0,
  EPrise: 0,
  BKP: 0,
  prate: 0,
  saleYN: "Y"
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
        `/batch?page=${pageNo}&limit=${limit}&search=${searchVal}`
    
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
    fetchItemName()
  }, []);

// fetch item master for item name--- 
 const fetchItemName=async ()=>{
  setLoading(true)
  try {
    const res= await axiosInstance.get("/item-master")
    if(res.data.success){
      setForName(res.data.data)
    }
  } catch  {
    toast.error("failed to fetch name")
  }
  finally{
    setLoading(false)
  }

 }

 const getItemName=(id)=>{
  const match=forName.find(it=>Number(it.ItemId)===Number(id));
  
 
  return match ? match.Item : "Not found"
  
 }

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
      Batch: "",
      BatchId:"",
    ExpDate: "",
    MRP:"",
     ItemId:"",
     EYN: 0,
  EPrise: 0,
  BKP: 0,
  prate: 0,
  saleYN: "Y"
    });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  // Drawer Edit
  const openDrawerEdit = (item) => {
    setFormData({
      Batch: item.Batch,
      BatchId:item.BatchId,
      ExpDate: item.ExpDate,
    MRP:item.MRP,
     ItemId:item.ItemId,
     EYN: item.EYN || 0,
  EPrise: item.EPrise || 0,
  BKP:item.BKP || 0,
  prate: item.prate || 0,
  saleYN:item.saleYN || "Y"
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  // Drawer View
  const openDrawerView = (item) => {
    setFormData({
      Batch: item.Batch,
       BatchId:item.BatchId,
      ExpDate: item.ExpDate,
    MRP:item.MRP,
    ItemId:item.ItemId,
       EYN: item.EYN || 0,
  EPrise: item.EPrise || 0,
  BKP:item.BKP || 0,
  prate: item.prate || 0,
  saleYN:item.saleYN || "Y"
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
          `/batch/${formData.BatchId}`,
          formData
        );
        toast.success("Updated successfully!");
      } else {
        await axiosInstance.post(`/batch`, formData);
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
      await axiosInstance.delete(`/batch/${deleteId}`);
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
                    <th>Batch Name</th>
                    <th>Exp.Date</th>
                    <th>M.R.P</th>
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
                                setDeleteId(item.BatchId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{getItemName(item.ItemId)}</td>
                        
                        <td>{item.ExpDate.split("T")[0]}</td>
                        <td>{item.MRP}</td>
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
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Batch || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            Batch: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>
                    <div className="row">
 <div className="mb-3 col-md-6">
                      <label className="form-label">Batch No</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ItemId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ItemId: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>
                     <div className="mb-3 col-md-6">
                      <label className="form-label">HSN Code</label>
                      <input
                        type="text"
                        className="form-control"
                        // value={formData.ItemId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            // ItemId: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        
                      />
                    </div>
                    </div>
                    
                    <div className="mb-3 mt-2">
                      <label className="form-label">Exp Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.ExpDate.split("T")[0]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ExpDate: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                     
                    </div>
                    <div className="row">

                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            // checked={formData.RateEdit}
                            // onChange={() => handleToggle("RateEdit")}
                            // disabled={modalType === "view"}
                            // id="RateEdit"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="VAT"
                          >
                            VAT
                          </label>
                        </div>
                      </div>

                        <div className="mb-3 col-md-5">
                      <label className="form-label">(MRP + VAT) Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        // value={formData.MRP}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            // MRP: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        
                      />
                    </div>
                    <div className="mb-3 col-md-5">
                      <label className="form-label">MRP</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.MRP}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            MRP: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>
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

   
    <button className="page-link" > {`${page}/${totalPages}`}</button>
   

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

export default Batch;