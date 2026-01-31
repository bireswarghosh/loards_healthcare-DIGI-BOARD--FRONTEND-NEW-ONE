import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { DigiContext } from "../../context/DigiContext";

const OTMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingOT, setEditingOT] = useState(null);
  const [otData, setOtData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    OtMaster: "",
    Rate: "",
  });

  useEffect(() => {
    fetchOtMasters();
  }, [showInactive]);

  const fetchOtMasters = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = showInactive ? "/otMaster/inactive" : "/otMaster";
      const response = await axiosInstance.get(endpoint);
      if (response.data.success) {
        setOtData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching OT masters:", error);
      setError("Failed to fetch: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingOT(null);
    setFormData({ OtMaster: "", Rate: "" });
    setShowSidebar(true);
  };

  const handleEdit = (ot) => {
    setEditingOT(ot);
    setFormData({
      OtMaster: ot.OtMaster,
      Rate: ot.Rate,
    });
    setShowSidebar(true);
  };

  const handleDelete = async (ot) => {
    if (window.confirm(`Delete ${ot.OtMaster}?`)) {
      setLoading(true);
      setError(null);
      try {
        await axiosInstance.delete(`/otMaster/${ot.OtMasterId}`);
        alert("Deleted successfully!");
        fetchOtMasters();
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to delete: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/otMaster/${id}/toggle-status`);
      fetchOtMasters();
    } catch (error) {
      console.error("Toggle Error:", error);
      setError("Failed to toggle status: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingOT) {
        await axiosInstance.put(`/otMaster/${editingOT.OtMasterId}`, formData);
        alert("Updated successfully!");
      } else {
        await axiosInstance.post("/otMaster", formData);
        alert("Added successfully!");
      }
      setShowSidebar(false);
      fetchOtMasters();
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to save: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filtered = otData.filter(
    (ot) =>
      ot.OtMaster?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ot.OtMasterId?.toString().includes(searchTerm)
  );

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable table-striped">
      <thead>
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th>ID</th>
          <th>OT Master</th>
          <th className="text-end">Rate (₹)</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((ot) => (
          <tr key={ot.OtMasterId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>{ot.OtMasterId}</td>
            <td>{ot.OtMaster}</td>
            <td className="text-end">
              ₹{Number(ot.Rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={ot.Active === 1}
                  onChange={() => handleToggleStatus(ot.OtMasterId)}
                  style={{ cursor: "pointer" }}
                  title={ot.Active ? "Active - Click to Deactivate" : "Inactive - Click to Activate"}
                />
              </div>
            </td>
            <td>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(ot)}
                  title="Edit"
                >
                  <i className="fa-light fa-pen-to-square"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(ot)}
                  title="Delete"
                >
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
              <h5>🏥 OT Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className={`btn btn-sm ${showInactive ? "btn-warning" : "btn-info"}`}
                  onClick={() => setShowInactive(!showInactive)}
                >
                  <i className="fa-light fa-filter"></i> {showInactive ? "Show Active" : "Show Inactive"}
                </button>
                <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
                  <i className="fa-light fa-plus"></i> Add OT
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
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowSidebar(false)}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              right: 0,
              zIndex: 9999,
              maxWidth: "500px",
              width: "100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={() => setShowSidebar(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%", paddingTop: "10px" }}>
              <div
                className="dropdown-txt"
                style={{
                  backgroundColor: "#0a1735",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                {editingOT ? "✏️ Edit OT" : "➕ Add OT"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">OT Master *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.OtMaster}
                        onChange={(e) => setFormData({ ...formData, OtMaster: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rate (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.Rate}
                        onChange={(e) => setFormData({ ...formData, Rate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowSidebar(false)}
                      >
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit" disabled={loading}>
                        {loading ? "Saving..." : editingOT ? "Update" : "Save"}
                      </button>
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

export default OTMaster;
