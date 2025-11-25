import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const OTType = () => {
  const [typeData, setTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [formData, setFormData] = useState({
    OtType: "",
    Status: "Y",
  });

  useEffect(() => {
    fetchOtTypes();
  }, []);

  const fetchOtTypes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/otType");
      if (response.data.success) {
        setTypeData(response.data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openAddSidebar = () => {
    setFormData({ OtType: "", Status: "Y" });
    setEditingType(null);
    setShowSidebar(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      OtType: type.OtType,
      Status: type.Status,
    });
    setShowSidebar(true);
  };

  const handleDelete = async (type) => {
    if (window.confirm(`Delete ${type.OtType}?`)) {
      try {
        await axiosInstance.delete(`/otType/${type.OtTypeId}`);
        fetchOtTypes();
      } catch {
        alert("Delete failed");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingType
        ? await axiosInstance.put(`/otType/${editingType.OtTypeId}`, formData)
        : await axiosInstance.post("/otType", formData);

      if (res.data.success) {
        fetchOtTypes();
        setShowSidebar(false);
      } else {
        alert("Save failed");
      }
    } catch {
      alert("Save failed");
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingType(null);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          <div className="panel">
            <div className="panel-header">
              <h5>🔧 OT Type - List</h5>

              <div className="btn-box d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={openAddSidebar}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dashed table-hover digi-dataTable table-striped">
                    <thead>
                      <tr>
                        <th style={{ width: "70px" }}>Action</th>
                        <th className="text-center">OT Type</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {typeData.map((type) => (
                        <tr key={type.OtTypeId}>
                          {/* left action */}
                          <td className="text-center">
                            <div className="btn-box">
                              <button onClick={() => handleEdit(type)}>
                                <i className="fa-light fa-pen"></i>
                              </button>
                              <button onClick={() => handleDelete(type)}>
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td className="text-center">{type.OtType}</td>

                          <td className="text-center">
                            {type.Status === "Y" ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-danger">Inactive</span>
                            )}
                          </td>
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

      {/* RIGHT SIDEBAR */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={closeSidebar}
            style={{ zIndex: 9998 }}
          />

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: "0",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={closeSidebar}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div className="dropdown-txt" style={{ backgroundColor: "#0a1735" }}>
                {editingType ? "✏️ Edit OT Type" : "➕ Add OT Type"}
              </div>

              <div style={{ overflowY: "auto", height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">OT Type *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.OtType}
                        onChange={(e) =>
                          setFormData({ ...formData, OtType: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.Status}
                        onChange={(e) =>
                          setFormData({ ...formData, Status: e.target.value })
                        }
                      >
                        <option value="Y">Active</option>
                        <option value="N">Inactive</option>
                      </select>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={closeSidebar}
                      >
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit">
                        {editingType ? "Update" : "Save"}
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

export default OTType;
