import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../../axiosInstance";
import { useAuth } from "../../../../../context/AuthContext";

const SampleReceipt = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [adminLevel, setAdminLevel] = useState("0");
  const [activeTab, setActiveTab] = useState("list"); // "list" or "logs"
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [dateFrom, setDateFrom] = useState(new Date(Date.now()).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date(Date.now()).toISOString().slice(0, 10));

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
      
      let url = `/activity-log?action=edit_receipt_unlock&page=${logsPagination.page}&limit=${logsPagination.limit}`;
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
  const [allReceipt, setAllReceipt] = useState(true);
  const [refund, setRefund] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchReceiptNo, setSearchReceiptNo] = useState("");
  const [searchRefId, setSearchRefId] = useState("");

  const barcodeData = "OP/2425/08287";

  useEffect(() => {
    fetchReceipts(dateFrom, dateTo);
  }, [pagination.page,  allReceipt, refund, searchTerm]);

  // debounce search from to to data
  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     fetchReceipts(dateFrom, dateTo);
  //   }, 700);

  //   return () => clearTimeout(delayDebounceFn);
  // }, [dateFrom, dateTo]);


  const fetchReceipts = async (from, to) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        allReceipt,
        refund,
        search: searchTerm || searchReceiptNo || searchRefId,
        ...(searchName && { patientName: searchName }),
        ...(searchPhone && { phone: searchPhone }),
      });

      const response = await axiosInstance.get(`/moneyreceipt/search?${params}&dateFrom=${from}&dateTo=${to}`);

      if (response.data.success) {
        setReceipts(response.data.data || []);

        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.data.pagination,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm("Are you sure you want to delete this receipt?")) return;

    try {
      await axiosInstance.delete(
        `/moneyreceipt/${encodeURIComponent(receiptId)}`
      );
      fetchReceipts();
      alert("Receipt deleted successfully");
    } catch (error) {
      console.error("Error deleting receipt:", error);
      alert("Error deleting receipt");
    }
  };

  return (
    <div className="panel">

      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title fw-bold">
          {activeTab === "list" ? "Money Receipt List" : "🔒 Money Receipt Edit Audit Logs"}
        </div>
        <div className="d-flex gap-2">
          {activeTab === "list" && (
            <button className="btn btn-success" onClick={() => {
              navigate('/initialFormData') 
            }}>
              <i className="fa-solid fa-plus"></i>Add
            </button>
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
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="panel-body">
        {activeTab === "list" ? (
          <>
            {/* Filters */}
            <div className="panel border rounded p-3 mb-3">
              <div className="row g-3">

                <div className="col-md-3">
                  <label className="form-label">Date From</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Date To</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Patient Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Receipt No</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Receipt No"
                    value={searchReceiptNo}
                    onChange={(e) => setSearchReceiptNo(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Phone No"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Ref ID</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Reference ID"
                    value={searchRefId}
                    onChange={(e) => setSearchRefId(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <button className="btn btn-sm btn-primary mt-4 me-2" onClick={() => fetchReceipts(dateFrom, dateTo)}><i className="fas fa-search"></i> Search</button>

                  <button className="btn btn-sm btn-primary mt-4" onClick={() => {
                    setDateFrom(new Date(Date.now()).toISOString().slice(0, 10));
                    setDateTo(new Date(Date.now()).toISOString().slice(0, 10));
                    setSearchName("");
                    setSearchPhone("");
                    setSearchReceiptNo("");
                    setSearchRefId("");
                    fetchReceipts(new Date(Date.now()).toISOString().slice(0, 10), new Date(Date.now()).toISOString().slice(0, 10))}}>Clear</button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive border rounded">
              <table className="table table-dashed digi-dataTable table-hover mb-0">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Patient</th>
                    <th className="text-end">Bill</th>
                    <th className="text-end">Amount</th>
                    <th>Ref</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        Loading...
                      </td>
                    </tr>
                  ) : receipts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No receipts found
                      </td>
                    </tr>
                  ) : (
                    receipts.map((receipt, index) => (
                      <tr key={index}>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-info me-1"
                            onClick={() =>
                              navigate(
                                `/initialFormData/${encodeURIComponent(
                                  receipt.MoneyreeciptId
                                )}?mode=view`
                              )
                            }
                          >
                            <i className="fa-light fa-eye"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-warning me-1"
                            onClick={() =>
                              navigate(
                                `/initialFormData/${encodeURIComponent(
                                  receipt.MoneyreeciptId
                                )}?mode=edit`
                              )
                            }
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(receipt.MoneyreeciptId)
                            }
                          >
                            <i className="fa-light fa-trash-can"></i>
                          </button>
                        </td>

                        <td>{receipt.MoneyreeciptNo}</td>
                        <td>
                          {receipt.ReceiptDate
                            ? new Date(receipt.ReceiptDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{receipt.admission?.PatientName || "-"}</td>
                        <td className="text-end">
                          {parseFloat(receipt.BillAmount || 0).toFixed(2)}
                        </td>
                        <td className="text-end">
                          {parseFloat(receipt.Amount || 0).toFixed(2)}
                        </td>
                        <td>{receipt.RefferenceId || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn btn-sm btn-secondary"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                ◀ Prev
              </button>

              <span>
                Page <strong>{pagination.page}</strong> of{" "}
                <strong>{pagination.pages}</strong> — Total Records:{" "}
                {pagination.total}
              </span>

              <button
                className="btn btn-sm btn-secondary"
                disabled={pagination.page === pagination.pages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next ▶
              </button>
            </div>
          </>
        ) : (
          <div className="audit-logs-section">
            <div className="alert alert-info border-0 p-3 mb-4 rounded-3 d-flex align-items-center gap-3" style={{ background: "rgba(13, 110, 253, 0.1)", color: "#0d6efd" }}>
              <i className="fa-solid fa-circle-info fs-4"></i>
              <div>
                <strong>Audit Compliance Transparency:</strong> All receipt edits require mandatory unlocking and justification. 
                {adminLevel === "1" || user?.username === 'lords' || user?.username === 'lordsYou' 
                  ? " As Super Admin, you are viewing the complete system-wide edit logs for all cashiers." 
                  : " You are currently viewing your own personal receipt edit logs."}
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
                        No receipt edit logs found.
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
  );
};

export default SampleReceipt;