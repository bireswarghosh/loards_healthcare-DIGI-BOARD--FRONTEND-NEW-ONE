import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../axiosInstance";
import { DigiContext } from "../../context/DigiContext";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const OTItemMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [itemData, setItemData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    OtItem: "",
    OtCategoryId: "",
    Rate: 0,
    Unit: "",
    ServiceChYN: "Y",
  });

  useEffect(() => {
    fetchOtItems();
    fetchCategories();
  }, [showInactive]);

  const fetchOtItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = showInactive ? "/otItem/inactive" : "/otItem";
      const response = await axiosInstance.get(endpoint);
      if (response.data.success) setItemData(response.data.data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/otItem/categories");
      if (response.data.success) setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const openAddSidebar = () => {
    setFormData({ OtItem: "", OtCategoryId: "", Rate: 0, Unit: "", ServiceChYN: "Y" });
    setEditingItem(null);
    setShowSidebar(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      OtItem: item.OtItem || "",
      OtCategoryId: item.OtCategoryId || "",
      Rate: item.Rate || 0,
      Unit: item.Unit || "",
      ServiceChYN: item.ServiceChYN || "Y",
    });
    setShowSidebar(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete ${item.OtItem}?`)) {
      setLoading(true);
      setError(null);
      try {
        await axiosInstance.delete(`/otItem/${item.OtItemId}`);
        alert("Deleted successfully!");
        fetchOtItems();
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to delete: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/otItem/${id}/toggle-status`);
      fetchOtItems();
    } catch (error) {
      console.error("Toggle Error:", error);
      setError("Failed to toggle status: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingItem) {
        await axiosInstance.put(`/otItem/${editingItem.OtItemId}`, formData);
        alert("Updated successfully!");
      } else {
        await axiosInstance.post("/otItem", formData);
        alert("Added successfully!");
      }
      setShowSidebar(false);
      fetchOtItems();
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to save: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filtered = itemData.filter(
    (item) =>
      item.OtItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.OtCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.OtItemId?.toString().includes(searchTerm)
  );

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable table-striped">
      <thead>
        <tr>
          <th className="no-sort"><div className="form-check"><input className="form-check-input" type="checkbox" /></div></th>
          <th>ID</th>
          <th>Item Name</th>
          <th>Category</th>
          <th className="text-end">Rate (₹)</th>
          <th>Unit</th>
          <th className="text-center">Service</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((item) => (
          <tr key={item.OtItemId}>
            <td><div className="form-check"><input className="form-check-input" type="checkbox" /></div></td>
            <td>{item.OtItemId}</td>
            <td>{item.OtItem}</td>
            <td>{item.OtCategory || "N/A"}</td>
            <td className="text-end">₹{(item.Rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td>{item.Unit || "N/A"}</td>
            <td className="text-center">
              <span className={`badge ${item.ServiceChYN === "Y" ? "bg-success" : "bg-danger"}`}>
                {item.ServiceChYN === "Y" ? "Yes" : "No"}
              </span>
            </td>
            <td>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={item.Active === 1}
                  onChange={() => handleToggleStatus(item.OtItemId)}
                  style={{ cursor: "pointer" }}
                  title={item.Active ? "Active - Click to Deactivate" : "Inactive - Click to Activate"}
                />
              </div>
            </td>
            <td>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)} title="Edit">
                  <i className="fa-light fa-pen-to-square"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)} title="Delete">
                  <i className="fa-light fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          <div className="panel">
            <div className="panel-header">
              <h5>🔧 OT Item Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input type="text" className="form-control form-control-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className={`btn btn-sm ${showInactive ? "btn-warning" : "btn-info"}`} onClick={() => setShowInactive(!showInactive)}>
                  <i className="fa-light fa-filter"></i> {showInactive ? "Show Active" : "Show Inactive"}
                </button>
                <button className="btn btn-sm btn-primary" onClick={openAddSidebar}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>{isBelowLg ? <OverlayScrollbarsComponent>{renderTable()}</OverlayScrollbarsComponent> : renderTable()}</>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSidebar && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowSidebar(false)} style={{ zIndex: 9998 }}></div>
          <div className="profile-right-sidebar active" style={{ zIndex: 9999, width: "100%", maxWidth: "500px", right: "0", top: "70px", height: "calc(100vh - 70px)" }}>
            <button className="right-bar-close" onClick={() => setShowSidebar(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%", paddingTop: "10px" }}>
              <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#0a1735" }}>
                {editingItem ? "✏️ Edit OT Item" : "➕ Add OT Item"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Item Name *</label>
                      <input type="text" className="form-control" value={formData.OtItem} onChange={(e) => setFormData({ ...formData, OtItem: e.target.value })} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Category *</label>
                      <select className="form-control" value={formData.OtCategoryId} onChange={(e) => setFormData({ ...formData, OtCategoryId: Number(e.target.value) })} required>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.OtCategoryId} value={cat.OtCategoryId}>{cat.OtCategory}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rate (₹) *</label>
                      <input type="number" step="0.01" className="form-control" value={formData.Rate} onChange={(e) => setFormData({ ...formData, Rate: Number(e.target.value) })} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Unit *</label>
                      <input type="text" className="form-control" value={formData.Unit} onChange={(e) => setFormData({ ...formData, Unit: e.target.value })} required />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" checked={formData.ServiceChYN === "Y"} onChange={(e) => setFormData({ ...formData, ServiceChYN: e.target.checked ? "Y" : "N" })} />
                      <label className="form-check-label">Service Charge</label>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setShowSidebar(false)}>Cancel</button>
                      <button className="btn btn-primary w-50" type="submit" disabled={loading}>{loading ? "Saving..." : editingItem ? "Update" : "Save"}</button>
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OTItemMaster;
