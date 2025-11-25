import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import Footer from "../../components/footer/Footer";

// table scroll style new
const tableResponsiveStyle = {
  maxHeight: "60vh",
  overflowY: "auto",
};

const stickyHeaderStyle = {
  zIndex: 10,
  backgroundColor: "var(--bs-table-bg, #f8f9fa)",
  boxShadow: "0 2px 2px rgba(0,0,0,0.1)",
};

// static sample type list (you can change ID according to DB)
const sampleTypeOptions = [
  { id: "", label: "Select Sample Type" },
  { id: 0, label: "N/A" },
  { id: 1, label: "Blood" },
  { id: 2, label: "CSF" },
  { id: 3, label: "EDTA" },
  { id: 4, label: "Fluid" },
  { id: 5, label: "FNAC" },
  { id: 6, label: "Na.Heparin" },
  { id: 7, label: "Plasma" },
];

const TestMaster = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // SubDepartment lookup
  const [subDepartments, setSubDepartments] = useState([]);

  // form state (add/edit)
  const emptyForm = {
    TestId: null,
    Test: "",
    ReportingName: "",
    SubDepartmentId: "",
    Method: "",
    Rate: "",
    DescFormat: "",
    TestCode: "",
    ARate: "",
    BRate: "",
    ICURate: "",
    CABRate: "",
    SUITRate: "",

    // NEW FIELDS (from old software screen)
    DeliveryAfter: "", // days
    SampleTypeId: "", // dropdown
    SMType: "", // free text if you want

    // checkboxes / flags
    NABLTag: true, // true => NABL, false => NOT NABL
    NSBilling: false, // "Not in N S Billing"
    NotReq: false, // "Not required in commission"
    agent: false, // "FOR AGENT"
    RateEdit: false,
    IsFormulative: false,
    FForm: false, // F-Form Required
    IsProfile: false,
    OutSource: false,
    IsDisc: false,
    cNotReq: false, // commission not required, if you use

    // costing
    cost: "",

    // Interpretation & Instructions (big text box)
    Interpretation: "",
    Instructions: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    setLoading(true);
    await Promise.all([fetchTests(page), fetchSubDepartments()]);
    setLoading(false);
  };

  const fetchSubDepartments = async () => {
    try {
      const response = await axiosInstance.get("/subdepartment");
      if (response.data && Array.isArray(response.data.data)) {
        setSubDepartments(response.data.data);
      } else {
        setSubDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching subdepartments:", error);
    }
  };

  const fetchTests = async (page) => {
    try {
      const response = await axiosInstance.get(
        `/tests?page=${page}&limit=${itemsPerPage}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        setTests(response.data.data);
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        setTests([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      alert("Error fetching test data. Check network or API configuration.");
    }
  };

  const getSubDepartmentName = (id) => {
    const subDep = subDepartments.find((dep) => dep.SubDepartmentId === id);
    return subDep ? subDep.SubDepartment : "N/A";
  };

  // helper: number / null
  const getValueOrNull = (value) => {
    if (value === null || value === undefined) return null;
    const v = String(value).trim();
    if (v === "") return null;
    return Number(v);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const submitData = {
        Test: formData.Test,
        ReportingName: formData.ReportingName,
        SubDepartmentId: getValueOrNull(formData.SubDepartmentId),
        Method: formData.Method,
        Rate: getValueOrNull(formData.Rate),
        DescFormat: getValueOrNull(formData.DescFormat),
        TestCode: formData.TestCode,
        ARate: getValueOrNull(formData.ARate),
        BRate: getValueOrNull(formData.BRate),
        ICURate: getValueOrNull(formData.ICURate),
        CABRate: getValueOrNull(formData.CABRate),
        SUITRate: getValueOrNull(formData.SUITRate),

        // extra fields
        DeliveryAfter:
          getValueOrNull(formData.DeliveryAfter) ?? 0, // default 0
        SampleTypeId: getValueOrNull(formData.SampleTypeId),
        SMType: formData.SMType || null,

        // checkbox flags -> 0 / 1
        NABLTag: formData.NABLTag ? 1 : 0,
        NSBilling: formData.NSBilling ? 1 : 0,
        NotReq: formData.NotReq ? 1 : 0,
        agent: formData.agent ? 1 : 0,
        RateEdit: formData.RateEdit ? 1 : 0,
        IsFormulative: formData.IsFormulative ? 1 : 0,
        FForm: formData.FForm ? 1 : 0,
        IsProfile: formData.IsProfile ? 1 : 0,
        OutSource: formData.OutSource ? 1 : 0,
        IsDisc: formData.IsDisc ? 1 : 0,
        cNotReq: formData.cNotReq ? 1 : 0,

        cost: getValueOrNull(formData.cost),

        Interpretation: formData.Interpretation || null,
        Instructions: formData.Instructions || null,

        // constant / audit fields (same as before)
        RSlNo: 1,
        FFormReq: formData.FForm ? 1 : 0, // if your DB has FFormReq, otherwise remove
        ActualColName: "glucose_fasting",
        CreatedBy: "admin",
        CreatedDate: new Date().toISOString(),
        UpdatedBy: "lab_manager",
        UpdatedDate: new Date().toISOString(),
        Status: "Active",
      };

      console.log("Submitting cleaned data:", submitData);

      if (formData.TestId) {
        await axiosInstance.put(`/tests/${formData.TestId}`, submitData);
        alert("Test updated successfully");
      } else {
        await axiosInstance.post("/tests", submitData);
        alert("Test created successfully");
        if (currentPage !== 1) {
          setCurrentPage(1);
          return;
        }
      }

      await fetchData(currentPage);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving test:", error.response?.data || error.message);
      alert("Error saving test. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Test?")) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/tests/${id}`);
        await fetchData(currentPage);
        alert("Test deleted successfully");
      } catch (error) {
        console.error("Error deleting test:", error);
        alert("Error deleting test");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleAddNew = () => {
    setFormData(emptyForm);
    setSelectedTest(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (test) => {
    setFormData({
      TestId: test.TestId || null,
      Test: test.Test || "",
      ReportingName: test.ReportingName || "",
      SubDepartmentId: test.SubDepartmentId || "",
      Method: test.Method || "",
      Rate: test.Rate ?? "",
      DescFormat: test.DescFormat ?? "",
      TestCode: test.TestCode || "",
      ARate: test.ARate ?? "",
      BRate: test.BRate ?? "",
      ICURate: test.ICURate ?? "",
      CABRate: test.CABRate ?? "",
      SUITRate: test.SUITRate ?? "",

      DeliveryAfter: test.DeliveryAfter ?? "",
      SampleTypeId: test.SampleTypeId ?? "",
      SMType: test.SMType || "",

      NABLTag: !!test.NABLTag,
      NSBilling: !!test.NSBilling,
      NotReq: !!test.NotReq,
      agent: !!test.agent,
      RateEdit: !!test.RateEdit,
      IsFormulative: !!test.IsFormulative,
      FForm: !!test.FForm,
      IsProfile: !!test.IsProfile,
      OutSource: !!test.OutSource,
      IsDisc: !!test.IsDisc,
      cNotReq: !!test.cNotReq,

      cost: test.cost ?? "",
      Interpretation: test.Interpretation || "",
      Instructions: test.Instructions || "",
    });

    setSelectedTest(test);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTest(null);
    setIsEditMode(false);
    setFormData(emptyForm);
  };

  const startSerialNumber = (currentPage - 1) * itemsPerPage;

  const Pagination = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center mt-3">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}

          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item ${
                number === currentPage ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </li>
        </ul>
        <p className="text-center text-muted small">
          Page {currentPage} of {totalPages}
        </p>
      </nav>
    );
  };

  return (
    <div className="main-content">
      <div className="container-fluid py-4">
        <div className="card shadow border-0 rounded-4">
          <div className="card-header border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              🧪 Test Master - List (Page {currentPage} of {totalPages}){" "}
              {loading && " (Loading...)"}
            </h5>

            <button
              className="btn btn-gradient-primary px-4 py-2 rounded-pill shadow-lg"
              onClick={handleAddNew}
              style={{
                background:
                  "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              ➕ ADD TEST
            </button>
          </div>

          <div className="card-body">
            <div className="table-responsive" style={tableResponsiveStyle}>
              <table className="table table-bordered table-sm table-striped table-hover align-middle">
                <thead
                  className="table-primary sticky-top"
                  style={stickyHeaderStyle}
                >
                  <tr>
                    <th>Sl.No</th>
                    <th>Test Name</th>
                    <th>SubDepartment</th>
                    <th>Code</th>
                    <th>Rate</th>
                    <th>Format ID</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center text-info">
                        ⏳ Loading tests...
                      </td>
                    </tr>
                  ) : tests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-warning">
                        ⚠️ No tests found on this page.
                      </td>
                    </tr>
                  ) : (
                    tests.map((test, index) => (
                      <tr key={test.TestId}>
                        <td>{startSerialNumber + index + 1}</td>
                        <td style={{ padding: "0.2rem" }}>
                          {test.Test || "N/A"}
                        </td>
                        <td>
                          {getSubDepartmentName(test.SubDepartmentId) ||
                            "N/A"}
                        </td>
                        <td>{test.TestCode || "N/A"}</td>
                        <td>{test.Rate || "N/A"}</td>
                        <td>{test.DescFormat || "N/A"}</td>

                        <td className="text-center">
                          <button
                            className="btn btn-outline-primary btn-sm me-1"
                            onClick={() => handleEdit(test)}
                            disabled={loading}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(test.TestId)}
                            disabled={loading}
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

            {!loading && totalPages > 1 && <Pagination />}
          </div>
        </div>

       {
  showModal && (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="TestMasterModalLabel"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }} // Darker overlay for better focus
      onClick={handleCloseModal}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        // Applying a custom maximum width for better visibility on large screens
        style={{ maxWidth: "90vw", width: "90vw" }} // Use 90% of viewport width
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4 shadow-lg">
          <div
            className="modal-header text-white rounded-top-4"
            style={{
              background:
                "linear-gradient(45deg, #4c5dcc 0%, #5d3493 100%)", // Slightly richer gradient
              padding: "1.5rem", // Increased padding for a better header look
            }}
          >
            <h4 // Increased size of the title
              className="modal-title fw-bold"
              id="TestMasterModalLabel"
              style={{ fontSize: "1.5rem" }}
            >
              🧪 {isEditMode ? "Edit Test Details" : "Add New Test"}
            </h4>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleCloseModal}
            ></button>
          </div>

          <div
            className="modal-body p-5"
            style={{ fontSize: "1rem" }} // Ensure base font size is legible
          >
            {/* TOP ROW: NABL / NOT NABL + COMMISSION/AGENT */}
            <div className="row g-4 mb-3">
              <div className="col-md-4 d-flex align-items-center">
                <span className="fw-bold me-4 text-primary fs-5">NABL:</span>{" "}
                {/* Larger font size for labels */}
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="nablRadio"
                    id="nablYes"
                    checked={formData.NABLTag === true}
                    onChange={() => handleInputChange("NABLTag", true)}
                  />
                  <label className="form-check-label" htmlFor="nablYes">
                    NABL
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="nablRadio"
                    id="nablNo"
                    checked={formData.NABLTag === false}
                    onChange={() => handleInputChange("NABLTag", false)}
                  />
                  <label className="form-check-label" htmlFor="nablNo">
                    NOT NABL
                  </label>
                </div>
              </div>

              <div className="col-md-8 d-flex flex-wrap align-items-center">
                <div className="form-check me-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chkNotReq"
                    checked={formData.NotReq}
                    onChange={() => handleCheckboxChange("NotReq")}
                  />
                  <label className="form-check-label" htmlFor="chkNotReq">
                    Not required in commission
                  </label>
                </div>

                <div className="form-check me-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chkAgent"
                    checked={formData.agent}
                    onChange={() => handleCheckboxChange("agent")}
                  />
                  <label className="form-check-label" htmlFor="chkAgent">
                    FOR AGENT
                  </label>
                </div>

                <div className="form-check me-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chkNSBilling"
                    checked={formData.NSBilling}
                    onChange={() => handleCheckboxChange("NSBilling")}
                  />
                  <label className="form-check-label" htmlFor="chkNSBilling">
                    Not in N S Billing
                  </label>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="row g-4">
              {/* Test Name */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-primary">
                  📝 Test Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg" // Larger input size
                  value={formData.Test}
                  onChange={(e) => handleInputChange("Test", e.target.value)}
                  placeholder="Enter Test name"
                  style={{
                    backgroundColor: "#e3f2fd", // light blue
                    border: "1px solid #90caf9", // darker blue border
                  }}
                />
              </div>

              {/* Reporting Name */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-primary">
                  📑 Reporting Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={formData.ReportingName}
                  onChange={(e) =>
                    handleInputChange("ReportingName", e.target.value)
                  }
                  placeholder="Enter Reporting Name"
                  style={{
                    backgroundColor: "#e3f2fd", // light blue
                    border: "1px solid #90caf9", // darker blue border
                  }}
                />
              </div>

              {/* SubDepartment */}
              <div className="col-md-4">
                <label className="form-label fw-bold text-primary">
                  🏬 SubDepartment
                </label>
                <select
                  className="form-select form-select-lg"
                  value={formData.SubDepartmentId || ""}
                  onChange={(e) =>
                    handleInputChange("SubDepartmentId", e.target.value)
                  }
                  style={{
                    backgroundColor: "#e8f5e9", // light green
                    border: "1px solid #a5d6a7", // darker green border
                  }}
                >
                  <option value="">Select SubDepartment</option>
                  {/* Assuming subDepartments is defined */}
                  {/* {subDepartments.map((dep) => (
                    <option
                      key={dep.SubDepartmentId}
                      value={dep.SubDepartmentId}
                    >
                      {dep.SubDepartment}
                    </option>
                  ))} */}
                </select>
              </div>

              {/* Sample Type (dropdown) */}
              <div className="col-md-4">
                <label className="form-label fw-bold text-primary">
                  🧫 Sample Type
                </label>
                <select
                  className="form-select form-select-lg"
                  value={
                    formData.SampleTypeId === null ? "" : formData.SampleTypeId
                  }
                  onChange={(e) =>
                    handleInputChange("SampleTypeId", e.target.value)
                  }
                  style={{
                    backgroundColor: "#e8f5e9", // light green
                    border: "1px solid #a5d6a7", // darker green border
                  }}
                >
                  {/* Assuming sampleTypeOptions is defined */}
                  {sampleTypeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Blood Format Mapping */}
<div className="col-md-4">
  <label className="form-label fw-bold text-primary">
    🧬 Blood Format Mapping
  </label>

  <select
    className="form-select"
    value={formData.BloodFormatMapping || ""}
    onChange={(e) =>
      handleInputChange("BloodFormatMapping", e.target.value)
    }
  >
    <option value="">Select Mapping</option>
    <option value="HB">HB</option>
    <option value="CBC">CBC</option>
    <option value="Platelet">Platelet Count</option>
    <option value="TC-DC">TC / DC</option>
    <option value="ESR">ESR</option>
  </select>
</div>


              {/* Optional free text SMType */}
              <div className="col-md-4">
                <label className="form-label fw-bold text-primary">
                  Sample Text (SMType)
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={formData.SMType}
                  onChange={(e) => handleInputChange("SMType", e.target.value)}
                  placeholder="e.g., Serum"
                />
              </div>

              {/* Method */}
              <div className="col-md-5">
                <label className="form-label fw-bold text-primary">
                  🔬 Method
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={formData.Method}
                  onChange={(e) => handleInputChange("Method", e.target.value)}
                  placeholder="e.g., Enzymatic Method"
                  style={{
                    backgroundColor: "#fff3e0", // light orange
                    border: "1px solid #ffb74d", // darker orange border
                  }}
                />
              </div>

              {/* Test Code */}
              <div className="col-md-3">
                <label className="form-label fw-bold text-primary">
                  # Test Code
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={formData.TestCode}
                  onChange={(e) => handleInputChange("TestCode", e.target.value)}
                  placeholder="e.g., HI01"
                  style={{
                    backgroundColor: "#fbeff2", // light pink
                    border: "1px solid #f48fb1", // darker pink border
                  }}
                />
              </div>

              {/* Delivery After */}
              <div className="col-md-2">
                <label className="form-label fw-bold text-primary">
                  📦 Delivery After (Days)
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.DeliveryAfter}
                  onChange={(e) =>
                    handleInputChange("DeliveryAfter", e.target.value)
                  }
                  placeholder="0"
                />
              </div>

              {/* Rate Edit + Is Formulative + F-Form */}
              <div className="col-md-2 d-flex flex-column justify-content-end">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chkRateEdit"
                    checked={formData.RateEdit}
                    onChange={() => handleCheckboxChange("RateEdit")}
                  />
                  <label className="form-check-label" htmlFor="chkRateEdit">
                    Rate Edit
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chkIsFormulative"
                    checked={formData.IsFormulative}
                    onChange={() => handleCheckboxChange("IsFormulative")}
                  />
                  <label className="form-check-label" htmlFor="chkIsFormulative">
                    Is Formulative
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chkFForm"
                    checked={formData.FForm}
                    onChange={() => handleCheckboxChange("FForm")}
                  />
                  <label className="form-check-label" htmlFor="chkFForm">
                    F-Form Req
                  </label>
                </div>
              </div>

              <hr className="my-4" />

              {/* standard rate & other rates */}
              <div className="col-md-3">
                <label className="form-label fw-bold text-success">
                  💰 Standard Rate
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.Rate}
                  onChange={(e) => handleInputChange("Rate", e.target.value)}
                  placeholder="Rate"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold text-success">
                  A Rate
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.ARate}
                  onChange={(e) => handleInputChange("ARate", e.target.value)}
                  placeholder="A Rate"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold text-success">
                  B Rate
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.BRate}
                  onChange={(e) => handleInputChange("BRate", e.target.value)}
                  placeholder="B Rate"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold text-primary">
                  🔢 Format ID (DescFormat)
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.DescFormat}
                  onChange={(e) =>
                    handleInputChange("DescFormat", e.target.value)
                  }
                  placeholder="e.g., 1"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold text-success">
                  ICU Rate
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.ICURate}
                  onChange={(e) => handleInputChange("ICURate", e.target.value)}
                  placeholder="ICU Rate"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold text-success">
                  CAB Rate
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.CABRate}
                  onChange={(e) => handleInputChange("CABRate", e.target.value)}
                  placeholder="CAB Rate"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold text-success">
                  SUIT Rate
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.SUITRate}
                  onChange={(e) => handleInputChange("SUITRate", e.target.value)}
                  placeholder="SUIT Rate"
                />
              </div>

              {/* Cost */}
              <div className="col-md-3">
                <label className="form-label fw-bold text-success">
                  Cost
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  placeholder="Cost"
                />
              </div>
              <div className="col-md-9">{/* Spacer for alignment */}</div>

              {/* Interpretation */}
              <div className="col-md-12">
                <label className="form-label fw-bold text-primary">
                  Interpretation
                </label>
                <textarea
                  className="form-control"
                  rows="3" // Increased rows for more visible editing area
                  value={formData.Interpretation}
                  onChange={(e) =>
                    handleInputChange("Interpretation", e.target.value)
                  }
                  style={{ minHeight: "80px" }}
                />
              </div>

              {/* Instructions */}
              <div className="col-md-12">
                <label className="form-label fw-bold text-primary">
                  Instructions
                </label>
                <textarea
                  className="form-control"
                  rows="3" // Increased rows for more visible editing area
                  value={formData.Instructions}
                  onChange={(e) =>
                    handleInputChange("Instructions", e.target.value)
                  }
                  style={{ minHeight: "80px" }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer p-4 border-top-0">
            <button
              type="button"
              className="btn btn-secondary rounded-pill px-5 py-2" // Increased button size
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-gradient-success rounded-pill px-5 py-2" // Increased button size
              onClick={handleSave}
              disabled={loading}
              style={{
                background:
                  "linear-gradient(45deg, #1fdf8c 0%, #00b09b 100%)",
                border: "none",
                color: "white",
                fontWeight: "700", // Bolder text
                fontSize: "1.1rem", // Slightly larger text
              }}
            >
              {loading
                ? "Saving..."
                : isEditMode
                ? "💾 Update Test" // Clearer action text
                : "✅ Save New Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
      </div>
      <Footer />
    </div>
  );
};

export default TestMaster;
