import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../../../axiosInstance";
import Footer from "../../../../components/footer/Footer";

const CaseList = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchPatientName, setSearchPatientName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchRegistrationId, setSearchRegistrationId] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [driveFiles, setDriveFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Set default limit to 20 as requested
  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [rowCount, setRowCount] = useState(0);

  const fetchVisits = useCallback(
    async (
      patientName = "",
      phone = "",
      date = "",
      registrationId = "",
      page = 1,
      limit = 20
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(patientName && { PatientName: patientName }),
          ...(phone && { Phone: phone }),
          ...(registrationId && { caseNo: registrationId }),
          ...(date && { date }),
        });

        const response = await axiosInstance.get(`/case01/search?${params}`);

        if (response.data?.success) {
          const mappedData = response.data.data;
          // console.log(mappedData);
          setVisits(mappedData);

          // Use pagination object from API response
          const pagination = response.data.pagination;
          setRowCount(pagination.total || 0);
          setPaginationModel((prev) => ({
            ...prev,
            page: pagination.page,
            totalPages: pagination.totalPages,
          }));
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchVisits("", "", "", "", 1, paginationModel.pageSize);
  }, [fetchVisits]);

  const handleSearch = () => {
    fetchVisits(
      searchPatientName,
      searchPhone,
      searchDate,
      searchRegistrationId,
      1,
      paginationModel.pageSize
    );
  };

  const handlePaginationChange = (newPage) => {
    fetchVisits(
      searchPhone,
      searchDate,
      searchRegistrationId,
      newPage,
      paginationModel.pageSize
    );
  };

  const fetchDriveFiles = async (caseId) => {
    try {
      setLoadingFiles(true);
      
      // Call backend API to get files
      const response = await axiosInstance.get(`/case-files/${encodeURIComponent(caseId)}`);
      
      if (response.data?.success && response.data.files) {
        setDriveFiles(response.data.files);
      } else {
        setDriveFiles([]);
      }
    } catch (error) {
      console.error("Error fetching case files:", error);
      setDriveFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleOpenFiles = (caseId) => {
    setSelectedCaseId(caseId);
    setShowFileModal(true);
    fetchDriveFiles(caseId);
  };

  const handleCloseModal = () => {
    setShowFileModal(false);
    setSelectedCaseId(null);
  };

  const renderTable = () => {
    return (
      <table className="table table-dashed table-hover digi-dataTable table-striped">
        <thead>
          <tr>
            <th>Action</th>
            <th>SL No.</th>
            <th>Case No.</th>
            <th>Slip</th>
            <th>Case Date</th>
            <th>Patient Name</th>

            <th>Total</th>
            <th>Adv</th>

            <th>G.Total</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((data, index) => (
            <tr key={data.CaseId}>
              <td>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm text-primary"
                    title="View"
                    onClick={() => {
                      navigate(`/CaseEntry/${encodeURIComponent(data.CaseId)}/view`);
                    }}
                  >
                    <i className="fa-light fa-eye"></i>
                  </button>

                  <button className="btn btn-sm text-success" title="Edit"
                   onClick={() => {
                      navigate(`/CaseEntry/${encodeURIComponent(data.CaseId)}/edit`);
                    }}
                  >
                    <i className="fa-light fa-pen-to-square"></i>
                  </button>

                  <button 
                    className="btn btn-sm text-info" 
                    title="Open Files"
                    onClick={() => handleOpenFiles(data.CaseId)}
                  >
                    <i className="fa-light fa-file"></i>
                  </button>

                  <button 
                    className="btn btn-sm text-danger" 
                    title="Delete"
                    onClick={async () => {
                      if (window.confirm(`Delete case ${data.CaseNo}?`)) {
                        try {
                          await axiosInstance.delete(`/case01/${encodeURIComponent(data.CaseId)}`);
                          alert('Case deleted successfully!');
                          fetchVisits("", "", "", "", paginationModel.page, paginationModel.pageSize);
                        } catch (error) {
                          alert('Failed to delete: ' + (error.response?.data?.message || error.message));
                        }
                      }
                    }}
                  >
                    <i className="fa-light fa-trash"></i>
                  </button>
                </div>
              </td>

              <td>
                {(paginationModel.page - 1) * paginationModel.pageSize +
                  (index + 1)}
              </td>
              <td className="text-nowrap">{data.CaseNo}</td>
              <td>{data.SlipNo}</td>
              <td>{data.CaseDate.slice(0, 10)}</td>
              <td className="fw-bold">{data.PatientName}</td>

              <td>₹{data.Total}</td>
              <td>₹{data.Advance}</td>

              <td>
                <span className="badge bg-success">₹{data.GrossAmt}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className="panel">
              <div className="panel-header d-flex justify-content-between align-items-center">
                <h5>🏥 Case List</h5>
                <div className="btn-box d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate('/CaseEntry')}
                  >
                    <i className="fa-light fa-plus me-2"></i> Add New Case
                  </button>
                  <div id="tableSearch" className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Patient Name"
                      value={searchPatientName}
                      onChange={(e) => setSearchPatientName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Phone"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                    />
                    {/* <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Case No"
                      value={searchRegistrationId}
                      onChange={(e) => setSearchRegistrationId(e.target.value)}
                    /> */}
                    {/* <input
                      type="date"
                      className="form-control form-control-sm"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                    /> */}
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSearch}
                  >
                    <i className="fa-light fa-magnifying-glass"></i> Search
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setSearchPatientName("");
                      setSearchPhone("");
                      setSearchDate("");
                      setSearchRegistrationId("");
                      fetchVisits("", "", "", "", 1, 20);
                    }}
                  >
                    Clear
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                     navigate(-1)
                    }}
                  >
                    Back
                  </button>

                </div>
              </div>

              <div className="panel-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  </div>
                ) : (
                  <>
                    <OverlayScrollbarsComponent style={{ height: "500px" }}>
                      {renderTable()}
                    </OverlayScrollbarsComponent>

                    {/* Dynamic Pagination UI based on API metadata */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted small">
                        Showing{" "}
                        {(paginationModel.page - 1) * paginationModel.pageSize +
                          1}{" "}
                        to{" "}
                        {Math.min(
                          paginationModel.page * paginationModel.pageSize,
                          rowCount
                        )}{" "}
                        of {rowCount} entries
                      </div>
                      <nav>
                        <ul className="pagination pagination-sm m-0">
                          <li
                            className={`page-item ${
                              paginationModel.page === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                handlePaginationChange(paginationModel.page - 1)
                              }
                            >
                              Previous
                            </button>
                          </li>
                          <li className="page-item active">
                            <span className="page-link">
                              {paginationModel.page}/
                              {paginationModel.totalPages}
                            </span>
                          </li>
                          <li
                            className={`page-item ${
                              paginationModel.page >= paginationModel.totalPages
                                ? "disabled"
                                : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                handlePaginationChange(paginationModel.page + 1)
                              }
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* File Modal */}
      {showFileModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className="modal fade show d-block"
            style={{ zIndex: 9999 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">📄 Files for Case: {selectedCaseId}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {loadingFiles ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-2">Loading files...</p>
                    </div>
                  ) : driveFiles.length > 0 ? (
                    <div className="row">
                      {driveFiles.map((file, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title text-truncate" title={file.name}>
                                <i className="fa-light fa-file-pdf me-2"></i>
                                {file.name}
                              </h6>
                              <div className="d-flex gap-2 mt-3">
                                <a
                                  href={file.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-primary flex-fill"
                                >
                                  <i className="fa-light fa-eye me-1"></i>View
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info text-center">
                      <i className="fa-light fa-folder-open fa-3x mb-3"></i>
                      <p className="mb-0">No files found for this case</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CaseList;
