import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../../../axiosInstance";
import Footer from "../../../../components/footer/Footer";
import { useAuth } from "../../../../context/AuthContext";

const STORAGE_KEY = "caseListSearch";
const getStored = () => {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};

const CaseList = () => {
  const navigate = useNavigate();
  const { permissions, user } = useAuth();
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  const [adminLevel, setAdminLevel] = useState("0");
  const [activeTab, setActiveTab] = useState("list");
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.userId) {
        try {
          const res = await axiosInstance.get('/auth/users');
          if (res.data.success) {
            const currentUser = res.data.data.find(u => String(u.UserId) === String(user.userId));
            if (currentUser) {
              setAdminLevel(String(currentUser.Admin));
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const fetchAuditLogs = async () => {
    if (!user) return;
    try {
      setLogsLoading(true);
      const isSuper = adminLevel === "1" || user?.username === 'lords' || user?.username === 'lordsYou';
      
      let url = `/activity-log?action=edit_case_unlock&page=${logsPagination.page}&limit=${logsPagination.limit}`;
      if (!isSuper) {
        url += `&username=${user.username}`;
      }
      
      const res = await axiosInstance.get(url);
      if (res.data.success) {
        setAuditLogs(res.data.data || []);
        const total = res.data.total || 0;
        setLogsPagination(prev => ({
          ...prev,
          total,
          pages: Math.ceil(total / prev.limit)
        }));
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchAuditLogs();
    }
  }, [activeTab, logsPagination.page, adminLevel]);
  const dropdownRef = useRef(null);
  const stored = useRef(getStored()).current;
  const today = new Date().toISOString().slice(0, 10);

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState(stored.phone || "");
  const [searchPatientName, setSearchPatientName] = useState(stored.patientName || "");
  const [searchDate, setSearchDate] = useState(stored.date || "");
  const [searchRegistrationId, setSearchRegistrationId] = useState(stored.regId || "");
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [driveFiles, setDriveFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [agentMap, setAgentMap] = useState({});

  const [startDate, setStartDate] = useState(stored.startDate || today);
  const [endDate, setEndDate] = useState(stored.endDate || today);

  const [paginationModel, setPaginationModel] = useState({
    page: stored.page || 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [rowCount, setRowCount] = useState(0);

  // Save search state to sessionStorage whenever filters change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      startDate, endDate, patientName: searchPatientName,
      phone: searchPhone, date: searchDate, regId: searchRegistrationId,
      page: paginationModel.page,
    }));
  }, [startDate, endDate, searchPatientName, searchPhone, searchDate, searchRegistrationId, paginationModel.page]);

  useEffect(() => {
    axiosInstance.get("/agents?page=1&limit=1000").then((res) => {
      if (res.data?.data) {
        const map = {};
        res.data.data.forEach((a) => {
          map[a.AgentId] = a.Agent;
        });
        setAgentMap(map);
      }
    }).catch(console.error);
  }, []);

  const fetchVisits = useCallback(
    async (
      patientName = "",
      phone = "",
      date = "",
      registrationId = "",
      page = 1,
      limit = 20,
    ) => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(patientName && { PatientName: patientName }),
          ...(phone && { Phone: phone }),
          ...(registrationId && { caseNo: registrationId }),
          ...(!patientName &&
            !phone &&
            startDate &&
            endDate && { startDate: startDate }),
          ...(!patientName &&
            !phone &&
            startDate &&
            endDate && { endDate: endDate }),
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
    [startDate, endDate],
  );

  const initialFetchDone = useRef(false);
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchVisits(searchPatientName, searchPhone, searchDate, searchRegistrationId, stored.page || 1, paginationModel.pageSize);
    } else {
      fetchVisits(searchPatientName, searchPhone, searchDate, searchRegistrationId, 1, paginationModel.pageSize);
    }
  }, [fetchVisits]);

  const handleSearch = () => {
    fetchVisits(
      searchPatientName,
      searchPhone,
      searchDate,
      searchRegistrationId,
      1,
      paginationModel.pageSize,
    );
  };

  const handlePaginationChange = (newPage) => {
    fetchVisits(
      searchPatientName,
      searchPhone,
      searchDate,
      searchRegistrationId,
      newPage,
      paginationModel.pageSize,
    );
  };

  const fetchDriveFiles = async (caseId) => {
    try {
      setLoadingFiles(true);

      // Call backend API to get files
      const response = await axiosInstance.get(
        `/case-files/${encodeURIComponent(caseId)}`,
      );

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
            <th>Agent Name</th>
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
                  {(isSuperAdmin || permissions?.diagnosis_caseEntry_view !== false) && (
                    <button
                      className="btn btn-sm text-primary"
                      title="View"
                      onClick={() => {
                        navigate(
                          `/CaseEntry/${encodeURIComponent(data.CaseId)}/view`,
                        );
                      }}
                    >
                      <i className="fa-light fa-eye"></i>
                    </button>
                  )}

                  {(isSuperAdmin || permissions?.diagnosis_caseFlowExplorer !== false) && (
                    <button
                      className="btn btn-sm text-info"
                      title="Trace Flow"
                      onClick={() => {
                        navigate(`/CaseFlowExplorer?caseId=${encodeURIComponent(data.CaseId)}`);
                      }}
                    >
                      <i className="fa-duotone fa-network-wired"></i>
                    </button>
                  )}

                  {(isSuperAdmin || permissions?.diagnosis_caseEntry_edit !== false) && (
                    <button
                      className="btn btn-sm text-success"
                      title="Edit"
                      onClick={() => {
                        navigate(
                          `/CaseEntry/${encodeURIComponent(data.CaseId)}/edit`,
                        );
                      }}
                    >
                      <i className="fa-light fa-pen-to-square"></i>
                    </button>
                  )}

                  <button
                    className="btn btn-sm text-info"
                    title="Open Files"
                    onClick={() => handleOpenFiles(data.CaseId)}
                  >
                    <i className="fa-light fa-file"></i>
                  </button>

                  {(isSuperAdmin || permissions?.diagnosis_caseEntry_delete !== false) && (
                    <button
                      className="btn btn-sm text-danger"
                      title="Delete"
                      onClick={async () => {
                        if (window.confirm(`Delete case ${data.CaseNo}?`)) {
                          try {
                            await axiosInstance.delete(
                              `/case01/${encodeURIComponent(data.CaseId)}`,
                            );
                            alert("Case deleted successfully!");
                            fetchVisits(
                              "",
                              "",
                              "",
                              "",
                              paginationModel.page,
                              paginationModel.pageSize,
                            );
                          } catch (error) {
                            alert(
                              "Failed to delete: " +
                                (error.response?.data?.message || error.message),
                            );
                          }
                        }
                      }}
                    >
                      <i className="fa-light fa-trash"></i>
                    </button>
                  )}
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
              <td>{agentMap[data.AgentId] || ""}</td>
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
                <h5>{activeTab === "list" ? "🏥 Case List" : "🔒 Case Edit Audit Logs"}</h5>
                <div className="btn-box d-flex flex-wrap gap-2 align-items-center">
                  {activeTab === "list" && (
                    <>
                      {(isSuperAdmin || permissions?.diagnosis_caseEntry_create !== false) && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => navigate("/CaseEntry")}
                        >
                          <i className="fa-light fa-plus me-2"></i> Add New Case
                        </button>
                      )}
                      {(isSuperAdmin || permissions?.diagnosis_caseEntry_search !== false) && (
                        <>
                          <div id="tableSearch" className="d-flex gap-2">
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />

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
                              setStartDate(today);
                              setEndDate(today);
                              setSearchPatientName("");
                              setSearchPhone("");
                              setSearchDate("");
                              setSearchRegistrationId("");
                              sessionStorage.removeItem(STORAGE_KEY);
                              fetchVisits("", "", "", "", 1, 20);
                            }}
                          >
                            Clear
                          </button>
                        </>
                      )}
                    </>
                  )}

                  <button 
                    className={`btn btn-sm ${activeTab === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab("list")}
                  >
                    List
                  </button>
                  <button 
                    className={`btn btn-sm ${activeTab === 'logs' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setActiveTab("logs")}
                  >
                    <i className="fa-solid fa-shield-halved me-1"></i> Audit Logs
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      navigate(-1);
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="panel-body">
                {activeTab === "list" ? (
                  loading ? (
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
                            rowCount,
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
                  )
                ) : (
                  <div className="audit-logs-section">
                    <div className="alert alert-info border-0 p-3 mb-4 rounded-3 d-flex align-items-center gap-3" style={{ background: "rgba(13, 110, 253, 0.1)", color: "#0d6efd" }}>
                      <i className="fa-solid fa-circle-info fs-4"></i>
                      <div>
                        <strong>Audit Compliance Transparency:</strong> All completed case entry edits require mandatory unlocking and justification. 
                        {adminLevel === "1" || user?.username === 'lords' || user?.username === 'lordsYou' 
                          ? " As Super Admin, you are viewing the complete system-wide edit logs for all cashiers." 
                          : " You are currently viewing your own personal case edit logs."}
                      </div>
                    </div>

                    <div className="table-responsive border rounded">
                      <table className="table table-dashed digi-dataTable table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Timestamp</th>
                            <th>Action By</th>
                            <th>Audit Details / Justification</th>
                            <th>IP Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logsLoading ? (
                            <tr>
                              <td colSpan="4" className="text-center text-muted py-4">
                                Loading audit trail...
                              </td>
                            </tr>
                          ) : auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center text-muted py-4">
                                No case edit logs found.
                              </td>
                            </tr>
                          ) : (
                            auditLogs.map((log) => (
                              <tr key={log.id}>
                                <td>
                                  {new Date(log.createdAt).toLocaleString("en-IN", { hour12: true })}
                                </td>
                                <td>
                                  <span className="badge bg-secondary px-2 py-1">
                                    {log.username}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex flex-column gap-1">
                                    <span className="text-danger fw-bold small">
                                      <i className="fa-solid fa-unlock-keyhole me-1"></i>
                                      {log.action?.toUpperCase()}
                                    </span>
                                    <span className="text-dark-emphasis small" style={{ wordBreak: "break-word" }}>
                                      {log.details}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <code className="text-muted small">{log.ipAddress}</code>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Logs Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={logsPagination.page === 1}
                        onClick={() =>
                          setLogsPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                      >
                        ◀ Prev
                      </button>

                      <span>
                        Page <strong>{logsPagination.page}</strong> of{" "}
                        <strong>{logsPagination.pages || 1}</strong> — Total Audit Records:{" "}
                        {logsPagination.total}
                      </span>

                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={logsPagination.page >= logsPagination.pages}
                        onClick={() =>
                          setLogsPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
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
                  <h5 className="modal-title">
                    📄 Files for Case: {selectedCaseId}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {loadingFiles ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      ></div>
                      <p className="mt-2">Loading files...</p>
                    </div>
                  ) : driveFiles.length > 0 ? (
                    <div className="row">
                      {driveFiles.map((file, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6
                                className="card-title text-truncate"
                                title={file.name}
                              >
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
