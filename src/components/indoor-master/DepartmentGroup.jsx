import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../axiosInstance";

const DepartmentGroup = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    DepGroup: "",
    Anst: 0.0,
    Assi: 0.0,
    Sour: 0.0,
  });

  const handleAddNew = () => {
    setFormData({
      DepGroup: "",
      Anst: 0.0,
      Assi: 0.0,
      Sour: 0.0,
    });
    setSelectedDepartment(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (department) => {
    setFormData({
      DepGroup: department.DepGroup,
      Anst: department.Anst || 0.0,
      Assi: department.Assi || 0.0,
      Sour: department.Sour || 0.0,
    });
    setSelectedDepartment(department);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);

      if (isEditMode && selectedDepartment) {
        // Update existing department
        const response = await axiosInstance.put(
          `/department_groups/${selectedDepartment.DepGroupId}`,
          formData
        );

        if (response.data.success) {
          fetchDepartments();
          setShowModal(false);
        }
      } else {
        // Create new department
        const response = await axiosInstance.post(
          "/department_groups",
          formData
        );

        if (response.data.success) {
          fetchDepartments();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving department group:", error);
      setError("Failed to save department group");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDepartment(null);
    setIsEditMode(false);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department group?")) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`/department_groups/${id}`);

        if (response.data.success) {
          fetchDepartments();
        }
      } catch (error) {
        console.error("Error deleting department group:", error);
        setError("Failed to delete department group");
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchDepartments = useCallback(
    async () => {
      try {
        setLoading(true);
        let url = "/department_groups";

        if (searchTerm) {
          url = `/department_groups/search?search=${encodeURIComponent(
            searchTerm
          )}`;
        }

        const response = await axiosInstance.get(url);

        if (response.data.success) {
          setDepartments(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching department groups:", error);
        setError("Failed to fetch department groups");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {/* Error alert */}
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* EMR Panel */}
          <div className="panel">
            {/* Panel Header (EMR style) */}
            <div className="panel-header">
              <h5>🏥 Department Group - List</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                {/* EMR search box */}
                <div id="tableSearch">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>

                {/* EMR Add button */}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleAddNew}
                >
                  <i className="fa-light fa-plus"></i> Add Department
                </button>
              </div>
            </div>

            {/* Panel Body */}
            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading departments...</p>
                </div>
              ) : departments.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No department groups found</p>
                </div>
              ) : (
                <>
                  {/* Desktop EMR table */}
                  <div
                    className="table-responsive d-none d-md-block"
                    style={{ maxHeight: "60vh", overflowY: "auto" }}
                  >
                    <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped align-middle">
                      <thead>
                        <tr>
                          <th>Department Name</th>
                          <th className="text-end">Anaesthesia</th>
                          <th className="text-end">Asst Surgeon</th>
                          <th className="text-end">Surgeon OT</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((dept) => (
                          <tr key={dept.DepGroupId}>
                            <td>{dept.DepGroup}</td>
                            <td className="text-end">
                              ₹
                              {(dept.Anst || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="text-end">
                              ₹
                              {(dept.Assi || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="text-end">
                              ₹
                              {(dept.Sour || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(dept)}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleDelete(dept.DepGroupId)
                                  }
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view cards (EMR-friendly) */}
                  <div
                    className="d-md-none"
                    style={{ maxHeight: "60vh", overflowY: "auto" }}
                  >
                    {departments.map((dept) => (
                      <div
                        key={dept.DepGroupId}
                        className="card mb-3 border-0 shadow-sm"
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="card-title mb-0 fw-bold text-primary">
                              {dept.DepGroup}
                            </h6>
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-12">
                              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                <small className="text-muted">
                                  💉 Anaesthesia:
                                </small>
                                <span className="fw-bold">
                                  ₹
                                  {(dept.Anst || 0).toLocaleString(
                                    "en-IN",
                                    { minimumFractionDigits: 2 }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                <small className="text-muted">
                                  👨‍⚕️ Asst Surgeon:
                                </small>
                                <span className="fw-bold">
                                  ₹
                                  {(dept.Assi || 0).toLocaleString(
                                    "en-IN",
                                    { minimumFractionDigits: 2 }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="d-flex justify-content-between align-items-center py-2">
                                <small className="text-muted">
                                  🏥 Surgeon OT:
                                </small>
                                <span className="fw-bold">
                                  ₹
                                  {(dept.Sour || 0).toLocaleString(
                                    "en-IN",
                                    { minimumFractionDigits: 2 }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary flex-fill"
                              onClick={() => handleEdit(dept)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger flex-fill"
                              onClick={() =>
                                handleDelete(dept.DepGroupId)
                              }
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* EMR style right sidebar “modal” */}
          {showModal && (
            <>
              <div
                className="modal-backdrop fade show"
                onClick={handleCloseModal}
                style={{ zIndex: 9998 }}
              ></div>

              <div
                className={`profile-right-sidebar ${
                  showModal ? "active" : ""
                }`}
                style={{
                  zIndex: 9999,
                  width: "100%",
                  maxWidth: "500px",
                  right: showModal ? "0" : "-100%",
                  top: "70px",
                  height: "calc(100vh - 70px)",
                }}
              >
                <button
                  className="right-bar-close"
                  onClick={handleCloseModal}
                >
                  <i className="fa-light fa-angle-right"></i>
                </button>

                <div
                  className="top-panel"
                  style={{ height: "100%", paddingTop: "10px" }}
                >
                  <div
                    className="dropdown-txt"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      backgroundColor: "#0a1735",
                    }}
                  >
                    {isEditMode ? "✏️ Edit" : "➕ Add"} Department Group
                  </div>

                  <div
                    style={{
                      height: "calc(100% - 70px)",
                      overflowY: "auto",
                    }}
                  >
                    <div className="p-3">
                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}

                      <form onSubmit={handleSave}>
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label fw-bold">
                              🏢 Department Group Name
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              value={formData.DepGroup}
                              onChange={(e) =>
                                handleInputChange(
                                  "DepGroup",
                                  e.target.value
                                )
                              }
                              placeholder="Enter department group name"
                            />
                          </div>

                          <div className="col-md-4 col-12">
                            <label className="form-label fw-bold">
                              💉 Anaesthesia
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">₹</span>
                              <input
                                type="number"
                                className="form-control"
                                value={formData.Anst}
                                onChange={(e) =>
                                  handleInputChange(
                                    "Anst",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                step="0.01"
                              />
                            </div>
                          </div>

                          <div className="col-md-4 col-12">
                            <label className="form-label fw-bold">
                              👨‍⚕️ Asst Surgeon
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">₹</span>
                              <input
                                type="number"
                                className="form-control"
                                value={formData.Assi}
                                onChange={(e) =>
                                  handleInputChange(
                                    "Assi",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                step="0.01"
                              />
                            </div>
                          </div>

                          <div className="col-md-4 col-12">
                            <label className="form-label fw-bold">
                              🏥 Surgeon OT
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">₹</span>
                              <input
                                type="number"
                                className="form-control"
                                value={formData.Sour}
                                onChange={(e) =>
                                  handleInputChange(
                                    "Sour",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2 mt-4">
                          <button
                            type="button"
                            className="btn btn-secondary w-50"
                            onClick={handleCloseModal}
                            disabled={loading}
                          >
                            ❌ Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary w-50"
                            disabled={loading}
                          >
                            {loading
                              ? "Processing..."
                              : isEditMode
                              ? "💾 Update"
                              : "💾 Save"}
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
      </div>
    </div>
  );
};

export default DepartmentGroup;
