import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const NurseMaster = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    Nurse: "",
    Add1: "",
    Add2: "",
    Add3: "",
    GroupType: "",
  });

  const fetchNurses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/nurses");
      if (response.data.success) {
        setNurses(response.data.data);
      } else {
        setError("Failed to load nurses");
      }
    } catch (error) {
      console.error("Error fetching nurses:", error);
      setError("Error fetching nurses");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const resetForm = () => {
    setFormData({
      Nurse: "",
      Add1: "",
      Add2: "",
      Add3: "",
      GroupType: "",
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingNurse(null);
    setShowSidebar(true);
  };

  const handleEdit = (nurse) => {
    setEditingNurse(nurse);
    setFormData({
      Nurse: nurse.Nurse || "",
      Add1: nurse.Add1 || "",
      Add2: nurse.Add2 || "",
      Add3: nurse.Add3 || "",
      GroupType: nurse.GroupType || "",
    });
    setShowSidebar(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this nurse?")) {
      try {
        await axiosInstance.delete(`/nurses/${id}`);
        alert("Nurse deleted successfully!");
        fetchNurses();
      } catch (error) {
        console.error("Error deleting nurse:", error);
        alert("Error deleting nurse");
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
      if (editingNurse) {
        await axiosInstance.put(`/nurses/${editingNurse.NurseId}`, formData);
        alert("Nurse updated successfully!");
      } else {
        const nextId =
          nurses.length > 0
            ? Math.max(...nurses.map((n) => n.NurseId)) + 1
            : 1;

        await axiosInstance.post("/nurses", {
          ...formData,
          NurseId: nextId,
        });

        alert("Nurse created successfully!");
      }

      setShowSidebar(false);
      setEditingNurse(null);
      resetForm();
      fetchNurses();
    } catch (error) {
      console.error("Error saving nurse:", error);
      alert("Error saving nurse");
    }
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setEditingNurse(null);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <div className="panel">
            <div className="panel-header">
              <h5>👩‍⚕️ Nurse Master</h5>

              <div className="btn-box d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : nurses.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No nurses found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dashed table-hover digi-dataTable table-striped">
                    <thead>
                      <tr>
                        <th className="no-sort">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" />
                          </div>
                        </th>

                        <th>Actions</th>
                        <th>Sl No</th>
                        <th>Nurse Name</th>
                        <th>Address 1</th>
                        <th>Address 2</th>
                        <th>Address 3</th>
                        <th>Group Type</th>
                      </tr>
                    </thead>

                    <tbody>
                      {nurses.map((nurse,idx) => (
                        <tr key={nurse.NurseId}>
                          <td>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" />
                            </div>
                          </td>

                          {/* Left-side Action Column */}
                          <td>
                            <div className="btn-box">
                                <button><i className="fa-light fa-eye"></i></button>
                              <button onClick={() => handleEdit(nurse)}>
                                <i className="fa-light fa-pen"></i>
                              </button>

                              <button onClick={() => handleDelete(nurse.NurseId)}>
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td>{idx +1}</td>
                          <td>{nurse.Nurse}</td>
                          <td>{nurse.Add1 || "-"}</td>
                          <td>{nurse.Add2 || "-"}</td>
                          <td>{nurse.Add3 || "-"}</td>
                          <td>{nurse.GroupType || "-"}</td>
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

      {/* EMR Right Sidebar */}
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

            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "#0a1735",
                }}
              >
                {editingNurse ? "✏️ Edit Nurse" : "➕ Add Nurse"}
              </div>

              <div style={{ height: "calc(100% - 70px)", overflowY: "auto" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">👩‍⚕️ Nurse Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Nurse}
                        onChange={(e) => handleInputChange("Nurse", e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">🏠 Address 1</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add1}
                        onChange={(e) => handleInputChange("Add1", e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">🏠 Address 2</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add2}
                        onChange={(e) => handleInputChange("Add2", e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">🏠 Address 3</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add3}
                        onChange={(e) => handleInputChange("Add3", e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">👥 Group Type</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.GroupType}
                        onChange={(e) => handleInputChange("GroupType", e.target.value)}
                      />
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
                        {editingNurse ? "Update" : "Save"}
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

export default NurseMaster;
