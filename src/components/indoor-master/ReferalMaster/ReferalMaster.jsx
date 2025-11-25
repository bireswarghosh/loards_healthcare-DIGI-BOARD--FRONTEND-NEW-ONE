import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Removed MasterLayout and Breadcrumb for Emr1's theme structure
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"; // Added for modal scrolling
import axiosInstance from "../../../axiosInstance";
import Footer from "../../../components/footer/Footer";

const ReferalMaster = () => {
  const navigate = useNavigate();
  // Mocking isBelowLg check based on Emr1 usage
  const isBelowLg = window.innerWidth < 1200;
  const dropdownRef = useRef(null); // Ref for outside click detection

  const [showModal, setShowModal] = useState(false);
  const [selectedReferal, setSelectedReferal] = useState(null);
  // Renamed to modalType for consistency with Emr1 style
  const [modalType, setModalType] = useState("add"); // 'add' | 'edit' 
  const [referalsData, setReferalsData] = useState([]);
  const [mexecutivesData, setMexecutivesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Added for consistency

  const [formData, setFormData] = useState({
    Referal: "",
    PhoneNo: "",
    MExecutiveId: "",
  });

  // --- Dropdown Toggle Logic (Copied from Emr1 style) ---
  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = referalsData.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setReferalsData(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = referalsData.map((data) => ({
          ...data,
          showDropdown: false,
        }));
        setReferalsData(updatedData);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [referalsData]);
  // --------------------------------------------------------

  // Wrapped fetchReferals in useCallback for useEffect dependency
  const fetchReferals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/referal");
      // Map to include showDropdown state
      setReferalsData(
        response.data.map((item) => ({ ...item, showDropdown: false }))
      );
      // Note: Original code didn't have search/pagination, so I'm omitting totalPages
    } catch (error) {
      console.error("Error fetching referals:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMExecutives = async () => {
    try {
      const response = await axiosInstance.get("/mexecutive");
      setMexecutivesData(response.data);
    } catch (error) {
      console.error("Error fetching mexecutives:", error);
    }
  };

  useEffect(() => {
    fetchReferals();
    fetchMExecutives();
  }, [fetchReferals]); // Depend on useCallback wrapped fetchReferals

  const handleAddNew = () => {
    setFormData({ Referal: "", PhoneNo: "", MExecutiveId: "" });
    setSelectedReferal(null);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (referal) => {
    // Close dropdown
    setReferalsData((prev) => prev.map((r) => ({ ...r, showDropdown: false })));

    setFormData({
      Referal: referal.Referal || "",
      PhoneNo: referal.PhoneNo || "",
      MExecutiveId: referal.MExecutiveId || "",
    });
    setSelectedReferal(referal);
    setModalType("edit");
    setShowModal(true);
  };

  // ADDED FIX: Function to handle Set Rate navigation and close dropdowns
  const handleSetRate = (referal) => {
    // 1. Close all dropdowns
    setReferalsData((prev) => prev.map((r) => ({ ...r, showDropdown: false })));

    // 2. Perform navigation
    navigate(
      `/CompanyTestRate?referalId=${referal.ReferalId}&referalName=${encodeURIComponent(
        referal.Referal
      )}`
    );
  };
  
  // Added handleView for consistency, although not in original file,
  // it's needed for the Emr1-style dropdown and is harmless.
  
  const handleDelete = async (id) => {
    // Close dropdown
    setReferalsData((prev) => prev.map((r) => ({ ...r, showDropdown: false })));

    if (window.confirm("Are you sure you want to delete this Referal?")) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/referal/${id}`);
        await fetchReferals();
        alert("Referal deleted successfully");
      } catch (error) {
        console.error("Error deleting referal:", error);
        setError("Error deleting referal");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        MExecutiveId: formData.MExecutiveId
          ? parseInt(formData.MExecutiveId)
          : null,
      };

      if (selectedReferal) {
        await axiosInstance.put(
          `/referal/${selectedReferal.ReferalId}`,
          submitData
        );
        alert("Referal updated successfully");
      } else {
        await axiosInstance.post("/referal", submitData);
        alert("Referal created successfully");
      }
      await fetchReferals();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving referal:", error);
      setError("Error saving referal");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReferal(null);
    setModalType("add");
  };

  // Renders the form content for the right sidebar modal
  const renderForm = () => (
    <div className="row g-3">
      <div className="col-12">
        <label className="form-label">🧑‍🤝‍🧑 Referal Name</label>
        <input
          type="text"
          className="form-control"
          value={formData.Referal}
          onChange={(e) => handleInputChange("Referal", e.target.value)}
          placeholder="Enter referal name"
        />
      </div>

      <div className="col-12">
        <label className="form-label">📞 Phone Number</label>
        <input
          type="text"
          className="form-control"
          value={formData.PhoneNo}
          onChange={(e) => handleInputChange("PhoneNo", e.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      <div className="col-12">
        <label className="form-label">💼 Marketing Executive</label>
        <select
          className="form-select"
          value={formData.MExecutiveId}
          onChange={(e) => handleInputChange("MExecutiveId", e.target.value)}
        >
          <option value="">Select Marketing Executive</option>
          {mexecutivesData.map((exec) => (
            <option key={exec.MExecutiveId} value={exec.MExecutiveId}>
              {exec.MExecutive}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">
      <thead>
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th className="text-center">Action</th>
          <th>Sl.No</th>
          <th>Referal Name</th>
          <th>Phone No</th>
          <th>MExecutive</th>
        </tr>
      </thead>
      <tbody>
        {referalsData.map((referal, index) => (
          <tr key={referal.ReferalId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td className="text-center">
              <div
                className="digi-dropdown dropdown d-inline-block"
                ref={dropdownRef}
              >
                <button
                  className={`btn btn-sm btn-outline-primary ${
                    referal.showDropdown ? "show" : ""
                  }`}
                  onClick={(event) => handleDropdownToggle(event, index)}
                >
                  Action <i className="fa-regular fa-angle-down"></i>
                </button>
                <ul
                  className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${
                    referal.showDropdown ? "show" : ""
                  }`}
                >
                  {/* Set Rate Action (Original Navigation) */}
                  <li>
                    <a
                      href="#"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        // CALLING THE NEW DEDICATED FUNCTION
                        handleSetRate(referal);
                      }}
                    >
                      <span className="dropdown-icon">
                        <i className="fa-light fa-calculator"></i>
                      </span>{" "}
                      Set Rate
                    </a>
                  </li>
                  {/* Edit Action */}
                  <li>
                    <a
                      href="#"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(referal);
                      }}
                    >
                      <span className="dropdown-icon">
                        <i className="fa-light fa-pen-to-square"></i>
                      </span>{" "}
                      Edit
                    </a>
                  </li>
                  {/* Delete Action */}
                  <li>
                    <a
                      href="#"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(referal.ReferalId);
                      }}
                    >
                      <span className="dropdown-icon">
                        <i className="fa-light fa-trash-can"></i>
                      </span>{" "}
                      Delete
                    </a>
                  </li>
                </ul>
              </div>
            </td>
            <td>{index + 1}</td>
            <td>{referal.Referal}</td>
            <td>{referal.PhoneNo}</td>
            <td>
              <span className="badge bg-info">
                {referal.mexecutive?.MExecutive || "N/A"}
              </span>
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

          {/* Main Panel/Card Structure */}
          <div className="panel">
            <div className="panel-header">
              <h5>🧑‍🤝‍🧑 Referal Master Management</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleAddNew}
                  disabled={loading}
                >
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
                  <p className="text-muted mt-2">Loading Referals...</p>
                </div>
              ) : referalsData.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">🧑‍🤝‍🧑 No referal records found</p>
                </div>
              ) : (
                <>
                  {isBelowLg ? (
                    <OverlayScrollbarsComponent>
                      {renderTable()}
                    </OverlayScrollbarsComponent>
                  ) : (
                    renderTable()
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Modal Structure */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className={`profile-right-sidebar ${showModal ? "active" : ""}`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: showModal ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={handleCloseModal}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div
              className="top-panel"
              style={{ height: "100%", paddingTop: "10px" }}
            >
              <div
                className="dropdown-txt"
                style={{ position: "sticky", top: 0, zIndex: 10 }}
              >
                {modalType === "add"
                  ? "➕ Add"
                  : "✏️ Edit"}{" "}
                Referal
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave();
                    }}
                  >
                    {renderForm()}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                      {modalType !== "view" && (
                        <button
                          type="submit"
                          className="btn btn-primary w-50"
                          disabled={loading}
                        >
                          {loading
                            ? "Saving..."
                            : modalType === "edit"
                            ? "Update"
                            : "Save"}
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

      <Footer />
    </div>
  );
};

export default ReferalMaster;