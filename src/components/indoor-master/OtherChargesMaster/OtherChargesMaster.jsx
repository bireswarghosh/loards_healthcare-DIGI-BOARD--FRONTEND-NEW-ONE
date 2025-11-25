import { useState, useEffect, useCallback, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../../axiosInstance";
import Footer from "../../../components/footer/Footer";

const OtherChargesMaster = () => {
  // Mocking isBelowLg check based on ProfileMaster usage
  const isBelowLg = window.innerWidth < 1200;
  const dropdownRef = useRef(null); // Ref for outside click detection

  const [showModal, setShowModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [modalType, setModalType] = useState("add"); // Replaced isEditMode with modalType
  const [chargesData, setChargesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [depGroups, setDepGroups] = useState([]);
  const [billPrintHeads, setBillPrintHeads] = useState([]);
  const [error, setError] = useState(null); // Added error state for consistency

  // Map to include showDropdown state for action button in table
  const [charges, setCharges] = useState([]);

  const [formData, setFormData] = useState({
    OtherCharges: "",
    DepGroupId: "",
    Rate: 0,
    Unit: "",
    ServiceCh: "N",
    ShowInFinal: "Y",
    BillPrintHeadId: "",
    ConcYN: "N",
    QtyReq: "N",
    Code: "",
    CSTP: 0,
    SGST: 0,
    vatp: 0,
    ICU: 0,
    CAB: 0,
    SUIT: 0,
    IPYN: "Y",
    corporateyn: "N",
  });

  // --- Dropdown Toggle Logic (Copied from ProfileMaster) ---
  const handleDropdownToggle = (event, index) => {
    event.stopPropagation();
    const updatedData = charges.map((data, i) => ({
      ...data,
      showDropdown: i === index ? !data.showDropdown : false,
    }));
    setCharges(updatedData);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Check if any dropdown is open
      if (
        charges.some((charge) => charge.showDropdown) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        const updatedData = charges.map((data) => ({
          ...data,
          showDropdown: false,
        }));
        setCharges(updatedData);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [charges]);
  // ------------------------------------------------------------------

  const fetchOtherCharges = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/otherCharges");
      if (response.data.success) {
        // Map to include showDropdown state
        setCharges(
          response.data.data.map((item) => ({ ...item, showDropdown: false }))
        );
      }
    } catch (error) {
      console.error("Error fetching other charges:", error);
      setError("Failed to fetch other charges");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const response = await axiosInstance.get("/otherCharges/dropdown-data");
      if (response.data.success) {
        setDepGroups(response.data.data.depGroups);
        setBillPrintHeads(response.data.data.billPrintHeads);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchOtherCharges();
    fetchDropdownData();
  }, []);

  const resetFormData = () => ({
    OtherCharges: "",
    DepGroupId: "",
    Rate: 0,
    Unit: "",
    ServiceCh: "N",
    ShowInFinal: "Y",
    BillPrintHeadId: "",
    ConcYN: "N",
    QtyReq: "N",
    Code: "",
    CSTP: 0,
    SGST: 0,
    vatp: 0,
    ICU: 0,
    CAB: 0,
    SUIT: 0,
    IPYN: "Y",
    corporateyn: "N",
  });

  const handleAddNew = () => {
    setFormData(resetFormData());
    setSelectedCharge(null);
    setModalType("add");
    setShowModal(true);
  };

  const mapChargeToFormData = (charge) => ({
    OtherCharges: charge.OtherCharges || "",
    DepGroupId: charge.DepGroupId || "",
    Rate: charge.Rate || 0,
    Unit: charge.Unit || "",
    ServiceCh: charge.ServiceCh || "N",
    ShowInFinal: charge.ShowInFinal || "Y",
    BillPrintHeadId: charge.BillPrintHeadId || "",
    ConcYN: charge.ConcYN || "N",
    QtyReq: charge.QtyReq || "N",
    Code: charge.Code || "",
    CSTP: charge.CSTP || 0,
    SGST: charge.SGST || 0,
    vatp: charge.vatp || 0,
    ICU: charge.ICU || 0,
    CAB: charge.CAB || 0,
    SUIT: charge.SUIT || 0,
    IPYN: charge.IPYN || "Y",
    corporateyn: charge.corporateyn || "N",
  });

  const handleEdit = (charge) => {
    setCharges((prev) => prev.map((c) => ({ ...c, showDropdown: false }))); // Close dropdown

    setFormData(mapChargeToFormData(charge));
    setSelectedCharge(charge);
    setModalType("edit");
    setShowModal(true);
  };


  const handleDelete = async (id) => {
    setCharges((prev) => prev.map((c) => ({ ...c, showDropdown: false }))); // Close dropdown

    if (window.confirm("Are you sure you want to delete this other charge?")) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`/otherCharges/${id}`);
        if (response.data.success) {
          await fetchOtherCharges();
          alert("Other charge deleted successfully"); // Keeping alert as in original
        } else {
          alert("Error: " + response.data.error); // Keeping alert as in original
        }
      } catch (error) {
        console.error("Error deleting other charge:", error);
        alert("Error deleting other charge"); // Keeping alert as in original
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

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        // Ensure numbers are numbers and not strings for the API
        Rate: Number(formData.Rate),
        CSTP: Number(formData.CSTP),
        SGST: Number(formData.SGST),
        vatp: Number(formData.vatp),
        ICU: Number(formData.ICU),
        CAB: Number(formData.CAB),
        SUIT: Number(formData.SUIT),
      };

      const response = selectedCharge
        ? await axiosInstance.put(
            `/otherCharges/${selectedCharge.OtherChargesId}`,
            payload
          )
        : await axiosInstance.post("/otherCharges", payload);

      if (response.data.success) {
        await fetchOtherCharges();
        setShowModal(false);
        alert(
          selectedCharge
            ? "Other charge updated successfully"
            : "Other charge created successfully"
        ); // Keeping alert as in original
      } else {
        alert("Error: " + response.data.error); // Keeping alert as in original
      }
    } catch (error) {
      console.error("Error saving other charge:", error);
      alert("Error saving other charge"); // Keeping alert as in original
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCharge(null);
    setModalType("add");
  };

  const renderForm = () => (
    <div className="row g-3">
      <div className="col-12">
        <label className="form-label">🏷️ Other Charges Name</label>
        <input
          type="text"
          className="form-control"
          value={formData.OtherCharges}
          onChange={(e) => handleInputChange("OtherCharges", e.target.value)}
          placeholder="Enter other charges name"
          required
          
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">🏢 Department Group</label>
        <select
          className="form-select"
          value={formData.DepGroupId}
          onChange={(e) => handleInputChange("DepGroupId", e.target.value)}
          required
          
        >
          <option value="">Select Department Group</option>
          {depGroups.map((dept) => (
            <option key={dept.DepGroupId} value={dept.DepGroupId}>
              {dept.DepGroup}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label">📋 Bill Print Head</label>
        <select
          className="form-select"
          value={formData.BillPrintHeadId}
          onChange={(e) => handleInputChange("BillPrintHeadId", e.target.value)}
          
        >
          <option value="">Select Bill Print Head</option>
          {billPrintHeads.map((head) => (
            <option key={head.BillPrintHeadId} value={head.BillPrintHeadId}>
              {head.BillPrintHead}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label">🔢 Code</label>
        <input
          type="text"
          className="form-control"
          value={formData.Code}
          onChange={(e) => handleInputChange("Code", e.target.value)}
          placeholder="Enter code"
          
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">📎 Unit</label>
        <input
          type="text"
          className="form-control"
          value={formData.Unit}
          onChange={(e) => handleInputChange("Unit", e.target.value)}
          placeholder="Enter unit (PCS, DAY, etc.)"
          
        />
      </div>

      <div className="col-12">
        <h6 className="mt-2 mb-3 text-primary">Rate Structure</h6>
      </div>
      <div className="col-md-3">
        <label className="form-label">💰 General Rate</label>
        <input
          type="number"
          className="form-control"
          value={formData.Rate}
          onChange={(e) => handleInputChange("Rate", Number(e.target.value))}
          placeholder="0"
          required
          
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">🏥 ICU Rate</label>
        <input
          type="number"
          className="form-control"
          value={formData.ICU}
          onChange={(e) => handleInputChange("ICU", Number(e.target.value))}
          placeholder="0"
          
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">🛌 Cabin Rate</label>
        <input
          type="number"
          className="form-control"
          value={formData.CAB}
          onChange={(e) => handleInputChange("CAB", Number(e.target.value))}
          placeholder="0"
          
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">🏨 Suite Rate</label>
        <input
          type="number"
          className="form-control"
          value={formData.SUIT}
          onChange={(e) => handleInputChange("SUIT", Number(e.target.value))}
          placeholder="0"
          
        />
      </div>

      <div className="col-12">
        <h6 className="mt-4 mb-3 text-primary">Taxation (%)</h6>
      </div>
      <div className="col-md-4">
        <label className="form-label">📈 CGST %</label>
        <input
          type="number"
          className="form-control"
          value={formData.CSTP}
          onChange={(e) => handleInputChange("CSTP", Number(e.target.value))}
          placeholder="0"
          
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">📈 SGST %</label>
        <input
          type="number"
          className="form-control"
          value={formData.SGST}
          onChange={(e) => handleInputChange("SGST", Number(e.target.value))}
          placeholder="0"
          
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">📈 VAT %</label>
        <input
          type="number"
          className="form-control"
          value={formData.vatp}
          onChange={(e) => handleInputChange("vatp", Number(e.target.value))}
          placeholder="0"
          
        />
      </div>

      <div className="col-12">
        <h6 className="mt-4 mb-3 text-primary">Applicability and Options</h6>
        <div className="row g-2">
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.IPYN === "Y"}
                onChange={(e) =>
                  handleInputChange("IPYN", e.target.checked ? "Y" : "N")
                }
                
              />
              <label className="form-check-label">🏥 IP Applicable</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.ServiceCh === "Y"}
                onChange={(e) =>
                  handleInputChange("ServiceCh", e.target.checked ? "Y" : "N")
                }
                
              />
              <label className="form-check-label">💼 Service Charges</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.ShowInFinal === "Y"}
                onChange={(e) =>
                  handleInputChange("ShowInFinal", e.target.checked ? "Y" : "N")
                }
                
              />
              <label className="form-check-label">📋 Show in Final</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.QtyReq === "Y"}
                onChange={(e) =>
                  handleInputChange("QtyReq", e.target.checked ? "Y" : "N")
                }
                
              />
              <label className="form-check-label">🔢 Qty Required</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.ConcYN === "Y"}
                onChange={(e) =>
                  handleInputChange("ConcYN", e.target.checked ? "Y" : "N")
                }
                
              />
              <label className="form-check-label">🎯 Concession</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.corporateyn === "Y"}
                onChange={(e) =>
                  handleInputChange("corporateyn", e.target.checked ? "Y" : "N")
                }
                
              />
              <label className="form-check-label">🏢 Corporate</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    // Adopted classes from ProfileMaster: digi-dataTable all-employee-table
    <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped align-middle mb-0">
      <thead className="sticky-top">
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th>Action</th>
          <th>Other Charges</th>
          <th>Code</th>
          <th>Unit</th>
          <th>Department</th>
          <th className="text-end">Rate</th>
          <th className="text-end">ICU</th>
          <th className="text-end">CAB</th>
          <th className="text-center">IPYN</th>
        </tr>
      </thead>
      <tbody>
        {charges.map((charge, index) => (
          <tr key={charge.OtherChargesId}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>
              {/* Adopted dropdown action structure from ProfileMaster */}
              <div
                className="digi-dropdown dropdown d-inline-block"
                ref={dropdownRef}
              >
                <button
                  className={`btn btn-sm btn-outline-primary ${
                    charge.showDropdown ? "show" : ""
                  }`}
                  onClick={(event) => handleDropdownToggle(event, index)}
                  disabled={loading}
                >
                  Action <i className="fa-regular fa-angle-down"></i>
                </button>
                <ul
                  className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${
                    charge.showDropdown ? "show" : ""
                  }`}
                >
                  <li>
                    <a
                      href="#"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(charge);
                      }}
                    >
                      <span className="dropdown-icon">
                        <i className="fa-light fa-pen-to-square"></i>
                      </span>{" "}
                      Edit
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(charge.OtherChargesId);
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
            <td>{charge.OtherCharges}</td>
            <td>{charge.Code}</td>
            <td>{charge.Unit}</td>
            <td>{charge.departmentGroupName}</td>
            <td className="text-end">
              <span className="badge bg-info">
                ₹{(charge.Rate || 0).toLocaleString("en-IN")}
              </span>
            </td>
            <td className="text-end">
              ₹{(charge.ICU || 0).toLocaleString("en-IN")}
            </td>
            <td className="text-end">
              ₹{(charge.CAB || 0).toLocaleString("en-IN")}
            </td>
            <td className="text-center">
              <span
                className={`badge ${
                  charge.IPYN === "Y" ? "bg-success" : "bg-secondary"
                }`}
              >
                {charge.IPYN === "Y" ? "✅" : "❌"}
              </span>
            </td>
          </tr>
        ))}
        {charges.length === 0 && !loading && (
          <tr>
            <td colSpan="10" className="text-center py-4">
              No other charges found.
            </td>
          </tr>
        )}
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

          <div className="panel">
            <div className="panel-header">
              <h5 className="mb-0">
                💳 Other Charges Master Management {loading && "(Loading...)"}
              </h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleAddNew}
                  disabled={loading}
                >
                  <i className="fa-light fa-plus me-1"></i> Add New Charge
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading && charges.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : charges.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">💳 No other charges found.</p>
                </div>
              ) : (
                <>
                  {isBelowLg ? (
                    // Use OverlayScrollbarsComponent for table when below LG size
                    <OverlayScrollbarsComponent style={{ maxHeight: "65vh" }}>
                      {renderTable()}
                    </OverlayScrollbarsComponent>
                  ) : (
                    // Render table directly when not below LG size
                    renderTable()
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Right Sidebar Modal Structure - Styled like ProfileMaster */}
      {showModal && (
        <>
          {/* Modal Backdrop */}
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
            style={{ zIndex: 9998 }}
          ></div>

          {/* Side Panel Modal */}
          <div
            className={`profile-right-sidebar ${showModal ? "active" : ""}`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "700px",
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
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  padding: "10px 15px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                {modalType === "add"
                  ? "➕ Add"
                  :  "✏️ Edit"}{" "}
                Other Charge
              </div>

              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                {" "}
                {/* Adjusted height for top bar and footer buttons */}
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    {renderForm()}

                    {/* Adopted button style and placement from ProfileMaster */}
                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={handleCloseModal}
                        disabled={loading}
                      >
                        ❌ Cancel
                      </button>
                      {modalType !== "view" && (
                        <button
                          type="submit"
                          className="btn btn-primary w-50"
                          disabled={loading}
                        >
                          {loading
                            ? "⏳ Saving..."
                            : `💾 ${modalType === "edit" ? "Update" : "Save"}`}
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
      <Footer /> {/* Added Footer for consistency */}
    </div>
  );
};

export default OtherChargesMaster;
