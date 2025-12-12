import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaLayerGroup,
  FaHospital,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../axiosInstance";

const DepartmentSubdepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [subdepartments, setSubdepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDepartment, setOpenDepartment] = useState(null); // Track open department for dropdown

  // Modal/Drawer states (Replaced Modal states with Drawer states)
  const [showDrawer, setShowDrawer] = useState(false); // For Department Add/Edit
  const [showSubdeptDrawer, setShowSubdeptDrawer] = useState(false); // For Subdepartment Add/Edit
  const [showConfirm, setShowConfirm] = useState(false); // For Delete Confirmation
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [confirmId, setConfirmId] = useState({ id: null, type: "" }); // {id, type: 'dept'|'subdept'}

  // Form states
  const [deptFormData, setDeptFormData] = useState({
    Department: "",
    DepShName: "",
    BP: 0,
  });
  const [subdeptFormData, setSubdeptFormData] = useState({
    SubDepartment: "",
    DepartmentId: "",
    SpRemTag: 0,
  });
  const [formError, setFormError] = useState("");

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const deptResponse = await axiosInstance.get("/department", { headers });

      if (deptResponse.data && deptResponse.data.success) {
        const newDepartments = deptResponse.data.data || [];
        setDepartments(
          newDepartments.map((d) => ({ ...d, showDropdown: false }))
        );
      }

      const subdeptResponse = await axiosInstance.get("/subdepartment", {
        headers,
      });

      if (subdeptResponse.data && subdeptResponse.data.success) {
        setSubdepartments(subdeptResponse.data.data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load departments and subdepartments");
      setLoading(false);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Department handlers
  const handleDepartmentClick = (department) => {
    setOpenDepartment(
      openDepartment === department.DepartmentId
        ? null
        : department.DepartmentId
    );
  };

  const openDeptDrawer = (type, dept = null) => {
    setModalType(type);
    if (type === "edit" && dept) {
      setDeptFormData({
        DepartmentId: dept.DepartmentId,
        Department: dept.Department,
        DepShName: dept.DepShName || "",
        BP: dept.BP || 0,
      });
    } else {
      setDeptFormData({ Department: "", DepShName: "", BP: 0 });
    }
    setFormError("");
    setShowDrawer(true);
  };

  const handleDeptChange = (e) => {
    const { name, value } = e.target;
    // Special handling for BP to ensure it's a number
    const newValue =
      name === "BP" ? (value === "" ? "" : Number(value)) : value;
    setDeptFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setShowDrawer(false); // Close drawer optimistically/early

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (modalType === "add") {
        const response = await axiosInstance.post("/department", deptFormData, {
          headers,
        });

        if (response.data && response.data.success) {
          toast.success("Department created successfully!");
          fetchData(); // Fetch fresh data to ensure everything is in sync
        } else {
          throw new Error("Failed to create department");
        }
      } else {
        const updateData = {
          DepartmentId: deptFormData.DepartmentId,
          Department: deptFormData.Department,
          DepShName: deptFormData.DepShName || "",
          BP: deptFormData.BP || 0,
        };

        const response = await axiosInstance.put(
          `/department/${deptFormData.DepartmentId}`,
          updateData,
          { headers }
        );

        if (response.data && response.data.success) {
          toast.success("Department updated successfully!");
          fetchData();
        } else {
          throw new Error("Failed to update department");
        }
      }
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save department"
      );
    }
  };

  const handleDeleteDept = async () => {
    const deptId = confirmId.id;
    setShowConfirm(false); // Close confirmation modal

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.delete(`/department/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        toast.success("Department deleted successfully!");
        fetchData(); // Fetch fresh data
      } else {
        throw new Error("Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete department"
      );
    }
  };

  // Subdepartment handlers
  const openSubdeptDrawer = (type, subdept = null) => {
    setModalType(type);
    if (type === "edit" && subdept) {
      setSubdeptFormData({
        SubDepartmentId: subdept.SubDepartmentId,
        SubDepartment: subdept.SubDepartment,
        DepartmentId: subdept.DepartmentId,
        SpRemTag: subdept.SpRemTag || 0,
      });
    } else {
      setSubdeptFormData({
        SubDepartment: "",
        DepartmentId: openDepartment || "", // Prefill with currently open department
        SpRemTag: 0,
      });
    }
    setFormError("");
    setShowSubdeptDrawer(true);
  };

  const handleSubdeptChange = (e) => {
    const { name, value } = e.target;
    // Special handling for SpRemTag to ensure it's a number
    const newValue =
      name === "SpRemTag" ? (value === "" ? "" : Number(value)) : value;
    setSubdeptFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubdeptSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setShowSubdeptDrawer(false); // Close drawer optimistically/early

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (modalType === "add") {
        const response = await axiosInstance.post(
          "/subdepartment",
          subdeptFormData,
          { headers }
        );

        if (response.data && response.data.success) {
          toast.success("Subdepartment created successfully!");
          fetchData();
        } else {
          throw new Error("Failed to create subdepartment");
        }
      } else {
        const updateData = {
          SubDepartmentId: subdeptFormData.SubDepartmentId,
          SubDepartment: subdeptFormData.SubDepartment,
          DepartmentId: subdeptFormData.DepartmentId,
          SpRemTag: subdeptFormData.SpRemTag || 0,
        };

        const response = await axiosInstance.put(
          `/subdepartment/${subdeptFormData.SubDepartmentId}`,
          updateData,
          { headers }
        );

        if (response.data && response.data.success) {
          toast.success("Subdepartment updated successfully!");
          fetchData();
        } else {
          throw new Error("Failed to update subdepartment");
        }
      }
    } catch (error) {
      console.error("Error saving subdepartment:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save subdepartment"
      );
    }
  };

  const handleDeleteSubdept = async () => {
    const subdeptId = confirmId.id;
    setShowConfirm(false); // Close confirmation modal

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.delete(
        `/subdepartment/${subdeptId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        toast.success("Subdepartment deleted successfully!");
        fetchData();
      } else {
        throw new Error("Failed to delete subdepartment");
      }
    } catch (error) {
      console.error("Error deleting subdepartment:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete subdepartment"
      );
    }
  };

  const handleConfirmDelete = (id, type) => {
    setConfirmId({ id, type });
    setShowConfirm(true);
  };

  // Filter subdepartments
  const getSubdepartments = (deptId) =>
    subdepartments.filter((subdept) => subdept.DepartmentId === deptId);

  // Determine the correct delete function to call
  const finalDeleteAction = () => {
    if (confirmId.type === "dept") {
      handleDeleteDept();
    } else if (confirmId.type === "subdept") {
      handleDeleteSubdept();
    }
  };

  // Loading state (Styled like TestParameter)
  if (loading) {
    return (
      <>
        <div className="main-content">
          <div className="panel">
            <div className="panel-body">
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state (Styled like TestParameter/general toast)
  if (error) {
    // Note: In TestParameter, the error shows up as a toast. For a persistent master error,
    // we'll keep a basic text display within the panel body, though a toast would be more typical.
    return (
      <>
        <div className="main-content">
          <div className="panel">
            <div className="panel-body">
              <div className="alert alert-danger" role="alert">
                <i className="fa-light fa-circle-exclamation me-2"></i> {error}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="main-content">
        <div className="panel">
          <div className="panel-header d-flex justify-content-between">
            {/* Updated Title */}
            <h5>
              <FaHospital className="me-2" /> Department Master
            </h5>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => openDeptDrawer("add")}
            >
              <FaPlus className="me-1" /> Add Department
            </button>
          </div>

          <div className="panel-body">
            <OverlayScrollbarsComponent
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <div className="table-responsive">
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Department Name</th>
                      <th>Short Name</th>
                      {/* <th>BP Value</th> */}
                      <th>Subdepartments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <React.Fragment key={dept.DepartmentId}>
                        <tr
                          className={`cursor-pointer`}
                          onClick={() => handleDepartmentClick(dept)}
                        >
                          <td>
                            <div className="d-flex gap-2">
                              {/* Edit Button */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  openDeptDrawer("edit", dept);
                                }}
                                title="Edit Department"
                              >
                                <i className="fa-light fa-pen-to-square"></i>
                              </div>

                              {/* Delete Button */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  handleConfirmDelete(
                                    dept.DepartmentId,
                                    "dept"
                                  );
                                }}
                                title="Delete Department"
                              >
                                <i className="fa-light fa-trash-can"></i>
                              </div>
                            </div>
                          </td>
                          <td>{dept.Department}</td>
                          <td>{dept.DepShName}</td>
                          {/* <td>{dept.BP}</td> */}
                          <td>
                            <span className="badge  me-2">
                              {getSubdepartments(dept.DepartmentId).length}
                            </span>
                            {openDepartment === dept.DepartmentId ? (
                              <FaChevronUp className="ms-1" size={12} />
                            ) : (
                              <FaChevronDown className="ms-1" size={12} />
                            )}
                          </td>
                        </tr>
                        {/* Subdepartment Row - behaves like a detail row */}
                        {openDepartment === dept.DepartmentId && (
                          <tr className="subdepartment-row">
                            <td colSpan="5" className="p-0 border-top-0">
                              <div
                                className="p-3"
                                style={{ 
                                  borderTop: "1px solid #e9ecef",
                                  width: '100%',
                                  overflow: 'hidden'
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0 fw-bold ">
                                    <FaLayerGroup className="me-1" />{" "}
                                    Subdepartments
                                  </h6>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => openSubdeptDrawer("add")}
                                  >
                                    <FaPlus className="me-1" /> Add
                                    Subdepartment
                                  </button>
                                </div>
                                {getSubdepartments(dept.DepartmentId).length >
                                0 ? (
                                  <div 
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                      gap: '12px',
                                      width: '100%'
                                    }}
                                  >
                                    {getSubdepartments(dept.DepartmentId).map(
                                      (subdept) => (
                                        <div
                                          key={subdept.SubDepartmentId}
                                        >
                                          <div className="card shadow-sm h-100">
                                            <div className="card-body d-flex justify-content-between align-items-center p-2">
                                              <div className="fw-bold" style={{ wordBreak: 'break-word', flex: 1, marginRight: '8px' }}>
                                                {subdept.SubDepartment}
                                                {subdept.SpRemTag > 0 && (
                                                  <span className="badge bg-warning text-dark ms-2">
                                                    Tag: {subdept.SpRemTag}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="d-flex gap-2" style={{ flexShrink: 0 }}>
                                                <div
                                                  onClick={() =>
                                                    openSubdeptDrawer(
                                                      "edit",
                                                      subdept
                                                    )
                                                  }
                                                  title="Edit Subdepartment"
                                                >
                                                  <i className="fa-light fa-pen-to-square"></i>
                                                </div>
                                                <div
                                                  onClick={() =>
                                                    handleConfirmDelete(
                                                      subdept.SubDepartmentId,
                                                      "subdept"
                                                    )
                                                  }
                                                  title="Delete Subdepartment"
                                                >
                                                  <i className="fa-light fa-trash-can"></i>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-center text-muted py-3 mb-0">
                                    No subdepartments found for this department.
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No departments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>

        {/* --- Department Add/Edit Drawer --- */}
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
                maxWidth: "450px",
                right: showDrawer ? "0" : "-100%",
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
                <div
                  className="dropdown-txt"
                  style={{ position: "sticky", top: 0, zIndex: 10 }}
                >
                  {/* Drawer Title */}
                  {modalType === "add"
                    ? "➕ Add Department"
                    : "✏️ Edit Department"}
                </div>
                <OverlayScrollbarsComponent
                  style={{ height: "calc(100% - 70px)" }}
                >
                  <div className="p-3">
                    <form onSubmit={handleDeptSubmit}>
                      {formError && (
                        <div className="alert alert-danger mb-3" role="alert">
                          {formError}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label">Department Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="Department"
                          value={deptFormData.Department}
                          onChange={handleDeptChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Short Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="DepShName"
                          value={deptFormData.DepShName}
                          onChange={handleDeptChange}
                        />
                      </div>

                      {/* <div className="mb-3">
                        <label className="form-label">BP Value</label>
                        <input
                          type="number"
                          className="form-control"
                          name="BP"
                          value={deptFormData.BP}
                          onChange={handleDeptChange}
                        />
                      </div> */}

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary w-50"
                          onClick={() => setShowDrawer(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary w-50">
                          {modalType === "add"
                            ? "Create"
                            : "Update"}
                        </button>
                      </div>
                    </form>
                  </div>
                </OverlayScrollbarsComponent>
              </div>
            </div>
          </>
        )}

        {/* --- Subdepartment Add/Edit Drawer --- */}
        {showSubdeptDrawer && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={() => setShowSubdeptDrawer(false)}
              style={{ zIndex: 9998 }}
            ></div>
            <div
              className="profile-right-sidebar active"
              style={{
                zIndex: 9999,
                width: "100%",
                maxWidth: "450px",
                right: showSubdeptDrawer ? "0" : "-100%",
                top: "70px",
                height: "calc(100vh - 70px)",
              }}
            >
              <button
                className="right-bar-close"
                onClick={() => setShowSubdeptDrawer(false)}
              >
                <i className="fa-light fa-angle-right"></i>
              </button>
              <div className="top-panel" style={{ height: "100%" }}>
                <div
                  className="dropdown-txt"
                  style={{ position: "sticky", top: 0, zIndex: 10 }}
                >
                  {/* Drawer Title */}
                  {modalType === "add"
                    ? "➕ Add Subdepartment"
                    : "✏️ Edit Subdepartment"}
                </div>
                <OverlayScrollbarsComponent
                  style={{ height: "calc(100% - 70px)" }}
                >
                  <div className="p-3">
                    <form onSubmit={handleSubdeptSubmit}>
                      {formError && (
                        <div className="alert alert-danger mb-3" role="alert">
                          {formError}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label">
                          Subdepartment Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="SubDepartment"
                          value={subdeptFormData.SubDepartment}
                          onChange={handleSubdeptChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Department *</label>
                        <select
                          className="form-control"
                          name="DepartmentId"
                          value={subdeptFormData.DepartmentId}
                          onChange={handleSubdeptChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option
                              key={dept.DepartmentId}
                              value={dept.DepartmentId}
                            >
                              {dept.Department}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Special Tag</label>
                        <input
                          type="number"
                          className="form-control"
                          name="SpRemTag"
                          value={subdeptFormData.SpRemTag}
                          onChange={handleSubdeptChange}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary w-50"
                          onClick={() => setShowSubdeptDrawer(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary w-50">
                          {modalType === "add"
                            ? "Create"
                            : "Update"}
                        </button>
                      </div>
                    </form>
                  </div>
                </OverlayScrollbarsComponent>
              </div>
            </div>
          </>
        )}

        {/* --- Delete Confirmation Modal (Styled like TestParameter) --- */}
        {showConfirm && (
          <div
            className="modal d-block"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5>
                    Delete{" "}
                    {confirmId.type === "dept" ? "Department" : "Subdepartment"}
                    ?
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowConfirm(false)}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  <p>
                    Are you sure you want to delete this{" "}
                    {confirmId.type === "dept"
                      ? "Department (This will also delete all associated subdepartments)"
                      : "Subdepartment"}
                    ?
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={finalDeleteAction}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DepartmentSubdepartment;










