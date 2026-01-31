import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../axiosInstance";
import { DigiContext } from "../../context/DigiContext";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const OTSlotMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [slotData, setSlotData] = useState([]);
  const [otMasters, setOtMasters] = useState([]);
  const [depGroups, setDepGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    OtMasterId: "",
    OTSlot: "",
    Rate: 0,
    DepGroupId: "",
  });

  useEffect(() => {
    fetchOtSlots();
    fetchOtMasters();
    fetchDepGroups();
  }, [showInactive]);

  const fetchOtSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = showInactive ? "/otSlot/inactive" : "/otSlot";
      const response = await axiosInstance.get(endpoint);
      if (response.data.success) {
        setSlotData(response.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchOtMasters = async () => {
    try {
      const response = await axiosInstance.get("/otSlot/otmasters");
      if (response.data.success) {
        setOtMasters(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching OT masters:", error);
    }
  };

  const fetchDepGroups = async () => {
    try {
      const response = await axiosInstance.get("/otSlot/depgroups");
      if (response.data.success) {
        setDepGroups(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dep groups:", error);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ OtMasterId: "", OTSlot: "", Rate: 0, DepGroupId: "" });
    setEditingSlot(null);
    setShowSidebar(true);
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      OtMasterId: slot.OtMasterId || "",
      OTSlot: slot.OTSlot || "",
      Rate: slot.Rate || 0,
      DepGroupId: slot.DepGroupId || "",
    });
    setShowSidebar(true);
  };

  const handleDelete = async (slot) => {
    if (window.confirm(`Delete ${slot.OTSlot}?`)) {
      setLoading(true);
      setError(null);
      try {
        await axiosInstance.delete(`/otSlot/${slot.OTSlotId}`);
        alert("Deleted successfully!");
        fetchOtSlots();
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
      await axiosInstance.patch(`/otSlot/${id}/toggle-status`);
      fetchOtSlots();
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
      const payload = {
        ...formData,
        OtMasterId: formData.OtMasterId ? Number(formData.OtMasterId) : "",
        DepGroupId: formData.DepGroupId ? Number(formData.DepGroupId) : "",
        Rate: Number(formData.Rate) || 0,
      };

      if (editingSlot) {
        await axiosInstance.put(`/otSlot/${editingSlot.OTSlotId}`, payload);
        alert("Updated successfully!");
      } else {
        await axiosInstance.post("/otSlot", payload);
        alert("Added successfully!");
      }
      setShowSidebar(false);
      fetchOtSlots();
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to save: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filtered = slotData.filter(
    (slot) =>
      slot.OTSlot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.OtMaster?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.OTSlotId?.toString().includes(searchTerm)
  );

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable table-striped">
      <thead>
        <tr>
          <th className="no-sort"><div className="form-check"><input className="form-check-input" type="checkbox" /></div></th>
          <th>ID</th>
          <th>OT Master</th>
          <th>OT Slot</th>
          <th className="text-end">Rate (₹)</th>
          <th>Dep Group</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((slot) => (
          <tr key={slot.OTSlotId}>
            <td><div className="form-check"><input className="form-check-input" type="checkbox" /></div></td>
            <td>{slot.OTSlotId}</td>
            <td>{slot.OtMaster || "N/A"}</td>
            <td>{slot.OTSlot}</td>
            <td className="text-end">₹{(slot.Rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td>{slot.DepGroup || "N/A"}</td>
            <td>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={slot.Active === 1}
                  onChange={() => handleToggleStatus(slot.OTSlotId)}
                  style={{ cursor: "pointer" }}
                  title={slot.Active ? "Active - Click to Deactivate" : "Inactive - Click to Activate"}
                />
              </div>
            </td>
            <td>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(slot)} title="Edit">
                  <i className="fa-light fa-pen-to-square"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(slot)} title="Delete">
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
              <h5>⏰ OT Slot Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input type="text" className="form-control form-control-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className={`btn btn-sm ${showInactive ? "btn-warning" : "btn-info"}`} onClick={() => setShowInactive(!showInactive)}>
                  <i className="fa-light fa-filter"></i> {showInactive ? "Show Active" : "Show Inactive"}
                </button>
                <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
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
          <div className={`profile-right-sidebar ${showSidebar ? "active" : ""}`} style={{ zIndex: 9999, width: "100%", maxWidth: "500px", right: showSidebar ? "0" : "-100%", top: "70px", height: "calc(100vh - 70px)" }}>
            <button className="right-bar-close" onClick={() => setShowSidebar(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%", paddingTop: "10px" }}>
              <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#0a1735" }}>
                {editingSlot ? "✏️ Edit OT Slot" : "➕ Add OT Slot"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">🏥 OT Master *</label>
                        <select className="form-control" value={formData.OtMasterId} onChange={(e) => setFormData({ ...formData, OtMasterId: e.target.value })} required>
                          <option value="">Select OT Master</option>
                          {otMasters.map((ot) => (
                            <option key={ot.OtMasterId} value={ot.OtMasterId}>{ot.OtMaster}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">🏢 Department Group *</label>
                        <select className="form-control" value={formData.DepGroupId} onChange={(e) => setFormData({ ...formData, DepGroupId: e.target.value })} required>
                          <option value="">Select Department Group</option>
                          {depGroups.map((dep) => (
                            <option key={dep.DepGroupId} value={dep.DepGroupId}>{dep.DepGroup}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">⏰ OT Slot *</label>
                        <input type="text" className="form-control" value={formData.OTSlot} onChange={(e) => setFormData({ ...formData, OTSlot: e.target.value })} required placeholder="e.g., 00:01 TO 01:00" />
                      </div>

                      <div className="col-12">
                        <label className="form-label">💰 Rate (₹) *</label>
                        <input type="number" step="0.01" className="form-control" value={formData.Rate} onChange={(e) => setFormData({ ...formData, Rate: e.target.value })} required placeholder="Enter rate amount" />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setShowSidebar(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary w-50" disabled={loading}>{loading ? "Saving..." : editingSlot ? "Update" : "Save"}</button>
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

export default OTSlotMaster;
