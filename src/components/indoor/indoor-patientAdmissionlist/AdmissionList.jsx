import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";

const AdmissionList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");

  const [dateFrom, setDateFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchAdmissions();
  }, [pagination.page, searchQuery, dateFrom, dateTo]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      let response;

      if (searchQuery) {
        response = await axiosInstance.get(
          `/admission/search?q=${encodeURIComponent(searchQuery)}&dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
      } else {
        response = await axiosInstance.get(
          `/admission?page=${pagination.page}&limit=${pagination.limit}&dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
      }

      if (response.status === 200 && response.data) {
        if (response.data.success) {
          setAdmissions(response.data.data || []);
          if (response.data.pagination) {
            setPagination((prev) => ({ ...prev, ...response.data.pagination }));
          }
        } else {
          setAdmissions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching admissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (field, value) => {
    if (field === "from") setDateFrom(value);
    else setDateTo(value);
  };

  const handleRowClick = (admission) => {
    navigate(
      `/patient-registration/${encodeURIComponent(
        admission.AdmitionId || admission.AdmitionNo
      )}`
    );
  };

  const handleDelete = async (admissionId) => {
    if (!window.confirm("Are you sure you want to delete this admission?"))
      return;

    try {
      const response = await axiosInstance.delete(`/admission/${admissionId}`);
      if (response.data.success) {
        alert("Admission deleted successfully!");
        fetchAdmissions();
      }
    } catch (error) {
      console.error("Error deleting admission:", error);
      alert("Error deleting admission");
    }
  };

  return (
    <div className="panel">

      {/* Header */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <div className="panel-title fw-bold">Admission List</div>

        {/* EMR Style Tabs */}
        <div className="tabs d-flex gap-2">
          <button
            className={`btn btn-sm ${
              activeTab === "list" ? "btn-primary" : "btn-outline-light"
            }`}
            onClick={() => setActiveTab("list")}
          >
            List
          </button>
          <button className="btn btn-sm btn-outline-light">Detail</button>
        </div>
      </div>

      {/* Body */}
      <div className="panel-body">

        {/* FILTER PANEL */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3 align-items-center">

            {/* SEARCH */}
            <div className="col-lg-6">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <div className="fw-bold text-secondary small">Search</div>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    checked={searchType === "name"}
                    onChange={() => setSearchType("name")}
                  />
                  <label className="form-check-label small">By Name</label>
                </div>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    checked={searchType === "phone"}
                    onChange={() => setSearchType("phone")}
                  />
                  <label className="form-check-label small">By Phone</label>
                </div>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    checked={searchType === "reg"}
                    onChange={() => setSearchType("reg")}
                  />
                  <label className="form-check-label small">By Reg No</label>
                </div>

                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder={`Search by ${searchType}`}
                  value={searchQuery}
                  onChange={handleSearch}
                  style={{ width: "170px" }}
                />
              </div>
            </div>

            {/* DATE FILTER */}
            <div className="col-lg-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text">From</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                />
                <span className="input-group-text">To</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive border rounded">
          <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">

            {/* ⭐ EMR DARK HEADER FIXED ⭐ */}
            <thead className="table-dark sticky-top">
              <tr>
                <th>Actions</th>
                <th>Patient Name</th>
                <th>Registration No</th>
                <th>Date</th>
                <th>Phone No</th>
                <th>Address</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">Loading...</td>
                </tr>
              ) : admissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No admissions found</td>
                </tr>
              ) : (
                admissions.map((admission, i) => (
                  <tr key={i}>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() =>
                          navigate(
                            `/PatientRegistrationDetail/${encodeURIComponent(
                              admission.AdmitionId || admission.AdmitionNo
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
                            `/PatientRegistrationDetail/${encodeURIComponent(
                              admission.AdmitionId || admission.AdmitionNo
                            )}?mode=edit`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          handleDelete(
                            admission.AdmitionId || admission.AdmitionNo
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>

                    <td>{admission.PatientName || "N/A"}</td>
                    <td>{admission.AdmitionNo || "N/A"}</td>
                    <td>
                      {admission.AdmitionDate
                        ? new Date(admission.AdmitionDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{admission.PhoneNo || "N/A"}</td>
                    <td>{admission.Add1 || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* FOOTER */}
      <div className="panel-footer d-flex justify-content-between flex-wrap gap-2 p-3">
        <div className="btn-group">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate("/PatientRegistrationDetail")}
          >
            New
          </button>

          <button className="btn btn-sm btn-secondary" disabled>Edit</button>
          <button className="btn btn-sm btn-success" disabled>Save</button>
          <button className="btn btn-sm btn-danger" disabled>Delete</button>

          <button className="btn btn-sm btn-warning" onClick={fetchAdmissions}>
            Refresh
          </button>

          <button className="btn btn-sm btn-dark">Print</button>

          <button className="btn btn-sm btn-dark" onClick={() => navigate("/")}>
            Exit
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdmissionList;

