import { useState, useEffect, useCallback } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../axiosInstance";
import { generatePatientActionsPDF } from "./PatientActionsPDF"; // Removed PDF import for clean styling

const PatientActions = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalType, setModalType] = useState("add");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [patients, setPatients] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    address: "",
    phone: "",
    case_details: "",
    bed_number: "",
    remarks: "",
  });

  const resetForm = () => {
    setFormData({
      patient_name: "",
      age: "",
      address: "",
      phone: "",
      case_details: "",
      bed_number: "",
      remarks: "",
    });
  };

  const handleAddNew = () => {
    resetForm();
    setSelectedPatient(null);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setFormData({
      patient_name: patient.patient_name,
      age: patient.age,
      address: patient.address,
      phone: patient.phone,
      case_details: patient.case_details,
      bed_number: patient.bed_number || "",
      remarks: patient.remarks || "",
    });
    setSelectedPatient(patient);
    setModalType("edit");
    setShowModal(true);
  };

  const handleView = (patient) => {
    setFormData({
      patient_name: patient.patient_name,
      age: patient.age,
      address: patient.address,
      phone: patient.phone,
      case_details: patient.case_details,
      bed_number: patient.bed_number || "",
      remarks: patient.remarks || "",
    });
    setSelectedPatient(patient);
    setModalType("view");
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (modalType === "edit" && selectedPatient) {
        const response = await axiosInstance.put(
          `/patient-actions/${selectedPatient.admin_action_no}`,
          formData
        );

        if (response.data.success) {
          fetchPatients();
          setShowModal(false);
        }
      } else {
        const response = await axiosInstance.post("/patient-actions", formData);

        if (response.data.success) {
          fetchPatients();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      setError("Failed to save patient record");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this patient record?")
    ) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`/patient-actions/${id}`);

        if (response.data.success) {
          fetchPatients();
        }
      } catch (error) {
        console.error("Error deleting patient:", error);
        setError("Failed to delete patient record");
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/patient-actions?page=${currentPage}&search=${searchTerm}`
      );

      if (response.data.success) {
        // Adding showDropdown property for consistency, although not strictly needed for this table
        setPatients(
          response.data.data.map((item) => ({ ...item, showDropdown: false }))
        );
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patient records");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // NOTE: PDF generation logic is retained but simplified, as it doesn't affect the visual theme.
  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      let pdfData = patients;

      if (fromDate && toDate) {
        const response = await axiosInstance.get(
          `/patient-actions/report?date_from=${fromDate}&date_to=${toDate}`
        );
        if (response.data.success) {
          pdfData = response.data.data;
        }
      }

      const doc = generatePatientActionsPDF(
        pdfData,
        fromDate || "All",
        toDate || "All"
      );
      doc.save(
        `Patient_Actions_Report_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Custom Render Functions for DRY code and consistent styling
  const renderPatientForm = () => (
    <div className="row g-3">
      <div className="col-md-6 mb-3">
        <label className="form-label">👤 Patient Name *</label>
        <input
          type="text"
          className="form-control"
          required
          disabled={modalType === "view"}
          value={formData.patient_name}
          onChange={(e) => handleInputChange("patient_name", e.target.value)}
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">📅 Age *</label>
        <input
          type="number"
          className="form-control"
          required
          disabled={modalType === "view"}
          value={formData.age}
          onChange={(e) => handleInputChange("age", e.target.value)}
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">📞 Phone *</label>
        <input
          type="tel"
          className="form-control"
          required
          disabled={modalType === "view"}
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">🛏️ Bed Number</label>
        <input
          type="text"
          className="form-control"
          disabled={modalType === "view"}
          value={formData.bed_number}
          onChange={(e) => handleInputChange("bed_number", e.target.value)}
        />
      </div>

      <div className="col-12 mb-3">
        <label className="form-label">🏠 Address *</label>
        <textarea
          className="form-control"
          rows="3"
          required
          disabled={modalType === "view"}
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
        />
      </div>

      <div className="col-12 mb-3">
        <label className="form-label">📝 Case Details *</label>
        <textarea
          className="form-control"
          rows="4"
          required
          disabled={modalType === "view"}
          value={formData.case_details}
          onChange={(e) => handleInputChange("case_details", e.target.value)}
        />
      </div>

      <div className="col-12 mb-3">
        <label className="form-label">💬 Remarks</label>
        <textarea
          className="form-control"
          rows="3"
          disabled={modalType === "view"}
          value={formData.remarks}
          onChange={(e) => handleInputChange("remarks", e.target.value)}
        />
      </div>
    </div>
  );

  const renderTable = () => {
    // No need for dropdownRef logic as we are simplifying the actions based on Emr1's use
    return (
      <div className="table-responsive">
        <table className="table table-dashed table-hover digi-dataTable table-striped">
          <thead>
            <tr>
              <th className="no-sort">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </th>
              <th>Action</th>
              <th>SLNo.</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Phone</th>
              <th>Bed No.</th>
              <th>Case Details</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr key={patient.admin_action_no}>
                <td>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </td>
                <td>
                  {/* Simplified action group, mimicking the visual style of Emr1's dropdown but as a simple group */}
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleView(patient)}
                    >
                      <i className="fa-light fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(patient)}
                    >
                      <i className="fa-light fa-pen-to-square"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(patient.admin_action_no)}
                    >
                      <i className="fa-light fa-trash-can"></i>
                    </button>
                  </div>
                </td>
                <td>{index + 1}</td>
                <td>{patient.patient_name}</td>
                <td>{patient.age}</td>
                <td>{patient.phone}</td>
                <td>
                  <span className="badge bg-info">
                    {patient.bed_number || "N/A"}
                  </span>
                </td>
                <td className="text-truncate" style={{ maxWidth: "200px" }}>
                  {patient.case_details}
                </td>
                <td>{new Date(patient.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMobileCards = () => (
    <div className="d-md-none">
      {patients.map((patient, index) => (
        <div
          key={patient.admin_action_no}
          className="card mb-3 border-0 shadow-sm"
        >
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title mb-0 fw-bold text-primary">
                {patient.patient_name}
              </h6>
              <span className="badge bg-secondary">SLNo: {index + 1}</span>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <small className="text-muted">📅 Age:</small>
                <div className="fw-semibold">{patient.age}</div>
              </div>
              <div className="col-6">
                <small className="text-muted">📞 Phone:</small>
                <div className="fw-semibold">{patient.phone}</div>
              </div>
              <div className="col-6">
                <small className="text-muted">🛏️ Bed:</small>
                <div className="fw-semibold">{patient.bed_number || "N/A"}</div>
              </div>
              <div className="col-6">
                <small className="text-muted">🕒 Date:</small>
                <div className="fw-semibold">
                  {new Date(patient.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <small className="text-muted">📝 Case Details:</small>
              <div className="fw-semibold text-truncate">
                {patient.case_details}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary flex-fill"
                onClick={() => handleView(patient)}
              >
                👁️ View
              </button>
              <button
                className="btn btn-sm btn-outline-primary flex-fill"
                onClick={() => handleEdit(patient)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger flex-fill"
                onClick={() => handleDelete(patient.admin_action_no)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="container-fluid py-4 main-content">
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
              <div className="">
                <h5>🏥 Patient Actions Management</h5>
                {/* Use a container and row for better structural control */}
                <div className="container-fluid p-0 px-4">
                  {/* Row 1: Date Filters and PDF Button */}
                  {/* This row will contain the date filters and PDF button */}
                  <div className="row g-2 mb-3 align-items-end">
                    {/* Date Filter Group (From Date, To Date) */}
                    <div className="col-12 col-md-auto">
                      <div className="d-flex flex-column gap-2">
                        {/* From Date Input */}
                        <div className="d-flex align-items-center gap-2">
                          <label
                            htmlFor="from-date"
                            className="text-sm"
                            style={{ width: "60px" }}
                          >
                            From:
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            placeholder="From Date"
                          />
                        </div>

                        {/* To Date Input */}
                        <div className="d-flex align-items-center gap-2">
                          <label
                            htmlFor="to-date"
                            className="text-sm"
                            style={{ width: "60px" }}
                          >
                            To:
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            placeholder="To Date"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PDF Button - Aligns itself horizontally with the date inputs, taking full width on mobile */}
                    <div className="col-12 col-md-auto">
                      <button
                        className="btn btn-sm btn-success w-100"
                        onClick={handleGeneratePDF}
                        disabled={loading}
                      >
                        PDF
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Search Bar and Add Patient Button */}
                  {/* This row will contain the search input and the Add Patient button */}
                  <div className="row g-2 align-items-center mb-3">
                    {/* Search Input - Takes more space on desktop, full width on mobile */}
                    <div className="col-12 col-md-8 col-lg-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search Patient Name, Case Details, Bed No..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>

                    {/* Add Patient Button - Takes remaining space on desktop, full width on mobile */}
                    <div className="col-12 col-md-4 col-lg-3">
                      <button
                        className="btn btn-sm btn-primary w-100"
                        onClick={handleAddNew}
                      >
                        <i className="fa-light fa-plus"></i> Add Patient
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading patients...</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">📋 No patient records found</p>
                  </div>
                ) : (
                  <>
                    <div className="d-none d-md-block">
                      <OverlayScrollbarsComponent>
                        {renderTable()}
                      </OverlayScrollbarsComponent>
                    </div>

                    {renderMobileCards()}

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="btn-group">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          ← Previous
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
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
            <button
              className="right-bar-close"
              onClick={() => setShowModal(false)}
            >
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
                  ? "➕ Add New Patient"
                  : modalType === "edit"
                  ? "✏️ Edit Patient"
                  : "👁️ View Patient"}
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    {renderPatientForm()}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowModal(false)}
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
                            : modalType === "add"
                            ? "➕ Add Patient"
                            : "💾 Update Patient"}
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
    </>
  );
};

export default PatientActions;
