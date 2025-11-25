import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const OTSlotMaster = () => {
  const [slotData, setSlotData] = useState([]);
  const [otMasters, setOtMasters] = useState([]);
  const [depGroups, setDepGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

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
  }, []);

  const fetchOtSlots = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/otSlot");
      if (response.data.success) {
        setSlotData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching OT slots:", error);
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
    setFormData({
      OtMasterId: "",
      OTSlot: "",
      Rate: 0,
      DepGroupId: "",
    });
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
    if (window.confirm(`Are you sure you want to delete ${slot.OTSlot}?`)) {
      try {
        const response = await axiosInstance.delete(`/otSlot/${slot.OTSlotId}`);
        if (response.data.success) {
          fetchOtSlots();
        } else {
          alert("Error deleting OT slot: " + response.data.error);
        }
      } catch (error) {
        console.error("Error deleting OT slot:", error);
        alert("Error deleting OT slot");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        OtMasterId: formData.OtMasterId ? Number(formData.OtMasterId) : "",
        DepGroupId: formData.DepGroupId ? Number(formData.DepGroupId) : "",
        Rate: Number(formData.Rate) || 0,
      };

      const response = editingSlot
        ? await axiosInstance.put(`/otSlot/${editingSlot.OTSlotId}`, payload)
        : await axiosInstance.post("/otSlot", payload);

      if (response.data.success) {
        await fetchOtSlots();
        setShowSidebar(false);
        setEditingSlot(null);
        setFormData({ OtMasterId: "", OTSlot: "", Rate: 0, DepGroupId: "" });
      } else {
        alert("Error saving OT slot: " + response.data.error);
      }
    } catch (error) {
      console.error("Error saving OT slot:", error);
      alert("Error saving OT slot");
    }
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setEditingSlot(null);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            {/* HEADER */}
            <div className="panel-header">
              <h5>⏰ OT Slot Master - List</h5>
              <div className="btn-box d-flex gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleOpenAdd}
                >
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : slotData.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No OT slots found
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dashed table-hover digi-dataTable table-striped">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>OT Master</th>
                        <th>OT Slot</th>
                        <th className="text-end">Rate (₹)</th>
                        <th>Dep Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slotData.map((slot) => (
                        <tr key={slot.OTSlotId}>
                          {/* ACTION LEFT SIDE */}
                          <td>
                            <div className="btn-box">
                              <button onClick={() => handleEdit(slot)}>
                                <i className="fa-light fa-pen"></i>
                              </button>
                              <button onClick={() => handleDelete(slot)}>
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>
                          <td>{slot.OtMaster || "N/A"}</td>
                          <td>{slot.OTSlot}</td>
                          <td className="text-end">
                            ₹
                            {(slot.Rate || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td>{slot.DepGroup || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EMR RIGHT SIDEBAR (NO MODAL, NO STATUS FIELD) */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseSidebar}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className={`profile-right-sidebar ${showSidebar ? "active" : ""}`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: showSidebar ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={handleCloseSidebar}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%", paddingTop: "10px" }}>
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                {editingSlot ? "✏️ Edit OT Slot" : "➕ Add OT Slot"}
              </div>

              <div style={{ height: "calc(100% - 70px)", overflowY: "auto" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">🏥 OT Master *</label>
                        <select
                          className="form-control"
                          value={formData.OtMasterId}
                          onChange={(e) =>
                            handleInputChange("OtMasterId", e.target.value)
                          }
                          required
                        >
                          <option value="">Select OT Master</option>
                          {otMasters.map((ot) => (
                            <option
                              key={ot.OtMasterId}
                              value={ot.OtMasterId}
                            >
                              {ot.OtMaster}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          🏢 Department Group *
                        </label>
                        <select
                          className="form-control"
                          value={formData.DepGroupId}
                          onChange={(e) =>
                            handleInputChange("DepGroupId", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Department Group</option>
                          {depGroups.map((dep) => (
                            <option
                              key={dep.DepGroupId}
                              value={dep.DepGroupId}
                            >
                              {dep.DepGroup}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">⏰ OT Slot *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.OTSlot}
                          onChange={(e) =>
                            handleInputChange("OTSlot", e.target.value)
                          }
                          required
                          placeholder="e.g., 00:01 TO 01:00"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">💰 Rate (₹) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.Rate}
                          onChange={(e) =>
                            handleInputChange("Rate", e.target.value)
                          }
                          required
                          step="0.01"
                          placeholder="Enter rate amount"
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={handleCloseSidebar}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary w-50">
                        {editingSlot ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OTSlotMaster;
