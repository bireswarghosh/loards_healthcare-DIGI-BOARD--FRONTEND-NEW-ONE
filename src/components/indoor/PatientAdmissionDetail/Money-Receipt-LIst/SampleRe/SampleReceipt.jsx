import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../../axiosInstance";

const SampleReceipt = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [dateFrom, setDateFrom] = useState("2025-02-22");
  const [dateTo, setDateTo] = useState("2025-02-22");
  const [allReceipt, setAllReceipt] = useState(true);
  const [refund, setRefund] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const barcodeData = "OP/2425/08287";

  useEffect(() => {
    fetchReceipts();
  }, [pagination.page, dateFrom, dateTo, allReceipt, refund, searchTerm]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        dateFrom,
        dateTo,
        allReceipt,
        refund,
        search: searchTerm,
      });

      const response = await axiosInstance.get(`/moneyreceipt/search?${params}`);

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
        <div className="panel-title fw-bold">Money Receipt</div>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-primary">List</button>
          <button className="btn btn-sm btn-outline-light">Detail</button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="panel-body">

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

            {/* <div className="col-md-2 d-flex align-items-end">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={allReceipt}
                  onChange={(e) => setAllReceipt(e.target.checked)}
                />
                <label className="form-check-label">All Receipt</label>
              </div>
            </div> */}

            {/* <div className="col-md-2 d-flex align-items-end">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={refund}
                  onChange={(e) => setRefund(e.target.checked)}
                />
                <label className="form-check-label">Refund</label>
              </div>
            </div> */}

          </div>
        </div>

        {/* Search */}
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              {/* <input
                type="text"
                className="form-control"
                placeholder="Search receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" onClick={fetchReceipts}>
                <i className="fa fa-search"></i>
              </button> */}
            </div>
          </div>

          <div className="col-md-6 text-end">
            <img
              src={`https://barcode.tec-it.com/barcode.ashx?data=${barcodeData}&code=Code128`}
              alt="barcode"
              height="45"
            />
            <div className="fw-bold mt-1">{barcodeData}</div>
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
                        className="btn btn-sm btn-info me-1"
                        onClick={() =>
                          navigate(
                            `/initialFormData/${encodeURIComponent(
                              receipt.MoneyreeciptId
                            )}?mode=view`
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="btn btn-sm btn-warning me-1"
                        onClick={() =>
                          navigate(
                            `/initialFormData/${encodeURIComponent(
                              receipt.MoneyreeciptId
                            )}?mode=edit`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          handleDelete(receipt.MoneyreeciptId)
                        }
                      >
                        Delete
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
      </div>
    </div>
  );
};

export default SampleReceipt;
