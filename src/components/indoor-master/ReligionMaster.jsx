import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const ReligionMaster = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [religionsData, setReligionsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    Religion: "",
  });

  useEffect(() => {
    fetchReligions();
  }, []);

  const fetchReligions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/religion");
      if (res.data.success) {
        setReligionsData(res.data.data);
      }
    } catch (err) {
      setError("Failed to fetch religions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ Religion: "" });
    setSelectedReligion(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (religion) => {
    setFormData({ Religion: religion.Religion });
    setSelectedReligion(religion);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this religion?")) return;
    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/religion/${id}`);
      if (res.data.success) {
        fetchReligions();
      }
    } catch (err) {
      alert("Error deleting religion");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = isEditMode
        ? await axiosInstance.put(`/religion/${selectedReligion.ReligionId}`, formData)
        : await axiosInstance.post("/religion", formData);

      if (res.data.success) {
        fetchReligions();
        setShowModal(false);
      }
    } catch (err) {
      alert("Error saving");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {/* EMR PANEL */}
          <div className="panel">

            {/* HEADER */}
            <div className="panel-header d-flex justify-content-between align-items-center">
              <h5>📜 Religion Master - List</h5>

              <div className="btn-box d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={handleAddNew}>
                  <i className="fa-light fa-plus"></i> Add Religion
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="panel-body">
              <div
                className="table-responsive"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                <table className="table table-dashed table-hover digi-dataTable table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Sl No</th>
                      <th>Religion</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          <div className="spinner-border text-primary"></div>
                        </td>
                      </tr>
                    ) : (
                      religionsData.map((row, i) => (
                        <tr key={row.ReligionId}>
                          <td>{i + 1}</td>
                          <td>{row.Religion}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(row)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(row.ReligionId)}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* EMR RIGHT-SIDEBAR PANEL */}
          {showModal && (
            <>
              {/* Backdrop */}
              <div
                className="modal-backdrop fade show"
                style={{ zIndex: 9998 }}
                onClick={handleCloseModal}
              ></div>

              {/* Sidebar */}
              <div
                className="profile-right-sidebar active"
                style={{
                  zIndex: 9999,
                  width: "100%",
                  maxWidth: "500px",
                  right: 0,
                  top: "70px",
                  height: "calc(100vh - 70px)",
                }}
              >
                <button className="right-bar-close" onClick={handleCloseModal}>
                  <i className="fa-light fa-angle-right"></i>
                </button>

                <div className="top-panel" style={{ height: "100%" }}>
                  <div
                    className="dropdown-txt"
                    style={{
                      backgroundColor: "#0a1735",
                      position: "sticky",
                      top: 0,
                      color: "white",
                      zIndex: 10,
                    }}
                  >
                    {isEditMode ? "✏️ Edit Religion" : "➕ Add Religion"}
                  </div>

                  <div style={{ height: "calc(100% - 60px)", overflowY: "auto" }}>
                    <form onSubmit={handleSave} className="p-3">
                      <label className="form-label fw-bold">📛 Religion Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter religion"
                        value={formData.Religion}
                        onChange={(e) => handleInputChange("Religion", e.target.value)}
                      />

                      <div className="d-flex gap-2 mt-4">
                        <button
                          type="button"
                          className="btn btn-secondary w-50"
                          onClick={handleCloseModal}
                        >
                          ❌ Cancel
                        </button>

                        <button
                          type="submit"
                          className="btn btn-primary w-50"
                          disabled={loading}
                        >
                          💾 {isEditMode ? "Update" : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReligionMaster;
