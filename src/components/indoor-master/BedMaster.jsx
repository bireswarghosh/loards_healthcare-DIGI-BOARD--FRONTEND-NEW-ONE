import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const BedMaster = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bedData, setBedData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch Bed + Department Data
  useEffect(() => {
    fetchBeds();
    fetchDepartments();
  }, []);

  const fetchBeds = async (page = currentPage, search = searchQuery) => {
    try {
      setLoading(true);
      let url = `/bedMaster?page=${page}&limit=${itemsPerPage}`;
      
      if (search && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        const sorted = response.data.data.sort(
          (a, b) => a.DepartmentId - b.DepartmentId
        );
        setBedData(sorted);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch beds");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get("/departmentIndoor");
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDepartmentName = (id) => {
    const dept = departments.find((d) => d.DepartmentId === id);
    return dept ? dept.Department : "Unknown";
  };

  // Form State
  const [formData, setFormData] = useState({
    DepartmentId: "",
    Bed: "",
    ShortName: "",
    BedCh: 0,
    AtttndantCh: 0,
    RMOCh: 0,
    TotalCh: 0,
    ServiceCh: "Y",
    ShowInFinal: "Y",
    BP: 0,
    Vacant: "Y",
  });

  // Add new
  const handleAddNew = () => {
    setFormData({
      DepartmentId: "",
      Bed: "",
      ShortName: "",
      BedCh: 0,
      AtttndantCh: 0,
      RMOCh: 0,
      TotalCh: 0,
      ServiceCh: "Y",
      ShowInFinal: "Y",
      BP: 0,
      Vacant: "Y",
    });
    setSelectedBed(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (bed) => {
    setFormData({
      DepartmentId: bed.DepartmentId,
      Bed: bed.Bed,
      ShortName: bed.ShortName,
      BedCh: bed.BedCh,
      AtttndantCh: bed.AtttndantCh,
      RMOCh: bed.RMOCh,
      TotalCh: bed.TotalCh,
      ServiceCh: bed.ServiceCh,
      ShowInFinal: bed.ShowInFinal,
      BP: bed.BP,
      Vacant: bed.Vacant,
    });
    setSelectedBed(bed);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));

    if (["BedCh", "AtttndantCh", "RMOCh"].includes(field)) {
      setFormData((prev) => ({
        ...prev,
        TotalCh:
          (field === "BedCh" ? value : prev.BedCh) +
          (field === "AtttndantCh" ? value : prev.AtttndantCh) +
          (field === "RMOCh" ? value : prev.RMOCh),
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = isEditMode
        ? await axiosInstance.put(`/bedMaster/${selectedBed.BedId}`, formData)
        : await axiosInstance.post("/bedMaster", formData);

      if (response.data.success) {
        fetchBeds(currentPage, searchQuery);
        setShowModal(false);
      } else {
        alert("Error saving bed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving bed");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBeds(1, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchBeds(1, "");
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchBeds(page, searchQuery);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(1)}>«</button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage - 1)}>‹</button>
          </li>
          
          {pageNumbers.map((pageNumber) => (
            <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? "active" : ""}`}>
              <button className="page-link" onClick={() => goToPage(pageNumber)}>
                {pageNumber}
              </button>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage + 1)}>›</button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(totalPages)}>»</button>
          </li>
        </ul>
      </nav>
    );
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
              <button className="btn-close" onClick={() => setError(null)} />
            </div>
          )}

          {/* EMR PANEL */}
          <div className="panel">
            {/* HEADER */}
            <div className="panel-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🛏️ Bed Master - List</h5>

              <div className="btn-box d-flex gap-2">
                <div className="input-group" style={{ width: '300px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search bed..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleSearch}>
                    <i className="fa-light fa-search"></i>
                  </button>
                  {searchQuery && (
                    <button className="btn btn-sm btn-outline-danger" onClick={handleClearSearch}>
                      <i className="fa-light fa-times"></i>
                    </button>
                  )}
                </div>
                <button className="btn btn-sm btn-primary" onClick={handleAddNew}>
                  <i className="fa-light fa-plus"></i> Add Bed
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="panel-body">
              <div className="table-responsive" style={{ maxHeight: "60vh" }}>
                <table className="table table-dashed table-hover digi-dataTable table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Bed No</th>
                      <th className="text-end">Bed Ch.</th>
                      <th className="text-end">Nursing</th>
                      <th className="text-end">RMO</th>
                      <th className="text-end">Total</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="spinner-border text-primary"></div>
                        </td>
                      </tr>
                    ) : bedData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No beds found
                        </td>
                      </tr>
                    ) : (
                      bedData.map((bed, i) => (
                        <tr key={i}>
                          <td>{getDepartmentName(bed.DepartmentId)}</td>
                          <td>{bed.Bed}</td>
                          <td className="text-end">₹{bed.BedCh}</td>
                          <td className="text-end">₹{bed.AtttndantCh}</td>
                          <td className="text-end">₹{bed.RMOCh}</td>
                          <td className="text-end fw-bold">₹{bed.TotalCh}</td>

                          <td className="text-center">
                            <span
                              className={`badge ${
                                bed.Vacant === "Y"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {bed.Vacant === "Y" ? "Vacant" : "Occupied"}
                            </span>
                          </td>

                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(bed)}
                            >
                              ✏️ Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination()}
            </div>
          </div>

          {/* EMR RIGHT SIDEBAR FORM */}
          {showModal && (
            <>
              {/* Backdrop */}
              <div
                className="modal-backdrop fade show"
                onClick={handleCloseModal}
                style={{ zIndex: 9998 }}
              ></div>

              {/* RIGHT PANEL */}
              <div
                className={`profile-right-sidebar active`}
                style={{
                  zIndex: 9999,
                  width: "100%",
                  maxWidth: "520px",
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
                      color: "white",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    {isEditMode ? "✏️ Edit Bed" : "➕ Add Bed"}
                  </div>

                  {/* FORM */}
                  <div style={{ height: "calc(100% - 70px)", overflowY: "auto" }}>
                    <form onSubmit={handleSave} className="p-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold">🏥 Department</label>
                          <select
                            className="form-control"
                            value={formData.DepartmentId}
                            onChange={(e) =>
                              handleInputChange("DepartmentId", Number(e.target.value))
                            }
                          >
                            <option value="">Select Department</option>
                            {departments.map((d) => (
                              <option key={d.DepartmentId} value={d.DepartmentId}>
                                {d.Department}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">🛏️ Bed No</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.Bed}
                            onChange={(e) =>
                              handleInputChange("Bed", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">💰 Bed Charges</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.BedCh}
                            onChange={(e) =>
                              handleInputChange("BedCh", Number(e.target.value))
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">👩‍⚕️ Nursing</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.AtttndantCh}
                            onChange={(e) =>
                              handleInputChange("AtttndantCh", Number(e.target.value))
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">👨‍⚕️ RMO</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.RMOCh}
                            onChange={(e) =>
                              handleInputChange("RMOCh", Number(e.target.value))
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">🏷️ Short Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.ShortName}
                            onChange={(e) =>
                              handleInputChange("ShortName", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-12 mt-2">
                          <div className="row">
                            <div className="col-md-4">
                              <label className="form-check-label fw-bold">
                                Vacant
                              </label>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={formData.Vacant === "Y"}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "Vacant",
                                      e.target.checked ? "Y" : "N"
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="col-md-4">
                              <label className="form-check-label fw-bold">
                                Service Charge
                              </label>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={formData.ServiceCh === "Y"}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "ServiceCh",
                                      e.target.checked ? "Y" : "N"
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="col-md-4">
                              <label className="form-check-label fw-bold">
                                Show In Final
                              </label>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={formData.ShowInFinal === "Y"}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "ShowInFinal",
                                      e.target.checked ? "Y" : "N"
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="d-flex gap-2 mt-4">
                        <button
                          type="button"
                          className="btn btn-secondary w-50"
                          onClick={handleCloseModal}
                        >
                          ❌ Cancel
                        </button>

                        <button type="submit" className="btn btn-primary w-50">
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

export default BedMaster;

