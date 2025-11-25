import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

const OtherCharges = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchName, setSearchName] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
  });

  const navigate = useNavigate();

  const fetchAdmissions = async (
    phone = "",
    date = "",
    name = "",
    page = 1,
    limit = 100
  ) => {
    setLoading(true);
    try {
      let params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (phone) params.append("search", phone);
      if (name) params.append("search", name);
      if (date) params.append("date", date);

      const response = await axios.get(`${API_BASE_URL}/admissions?${params}`);

      if (response.data?.success) {
        const data = response.data.data.map((item) => ({
          id: item.AdmitionId,
          ...item,
          Sex:
            item.Sex === "M"
              ? "Male"
              : item.Sex === "F"
              ? "Female"
              : item.Sex,
          AdmitionDate: item.AdmitionDate
            ? item.AdmitionDate.split("T")[0]
            : "N/A",
        }));

        setAdmissions(data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination?.totalRecords || data.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching admissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions("", "", "", 1, pagination.limit);
  }, []);

  const handleSearch = () => {
    fetchAdmissions(searchPhone, searchDate, searchName, 1, pagination.limit);
  };

  const handleClear = () => {
    setSearchPhone("");
    setSearchDate("");
    setSearchName("");
    fetchAdmissions("", "", "", 1, pagination.limit);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchAdmissions(
      searchPhone,
      searchDate,
      searchName,
      newPage,
      pagination.limit
    );
  };

  const handleViewCharges = (row) => {
    navigate("/other-charges", {
      state: {
        selectedAdmission: row,
        admissionId: row.AdmitionId,
      },
    });
  };

  return (
    <div className="panel">

      {/* Header */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <div className="panel-title fw-bold">Other Charges</div>
      </div>

      {/* Search Panel */}
      <div className="panel-body">
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">

            <div className="col-md-3">
              <label className="form-label small fw-bold">Search by Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Search by Phone</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Search by Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>

            <div className="col-md-3 d-flex align-items-end gap-2">
              <button className="btn btn-sm btn-primary" onClick={handleSearch}>
                Search
              </button>

              <button className="btn btn-sm btn-secondary" onClick={handleClear}>
                Clear
              </button>
            </div>

          </div>
        </div>

        {/* Table Section */}
        <div className="table-responsive border rounded">
          <table className="table table-dashed table-hover digi-dataTable align-middle mb-0">

            {/* ⭐ EMR DARK HEADER */}
            <thead className="table-dark sticky-top">
              <tr>
                <th>Actions</th>
                <th>Admission ID</th>
                <th>Patient Name</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Admission Date</th>
                <th>Guardian</th>
                <th>Bed</th>
                <th>Status</th>
                <th>Company</th>
                <th>Department</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="13" className="text-center">
                    Loading…
                  </td>
                </tr>
              ) : admissions.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              ) : (
                admissions.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-1"
                        onClick={() => handleViewCharges(row)}
                      >
                        Other Charges
                      </button>

                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => console.log("View details:", row)}
                      >
                        View
                      </button>
                    </td>

                    <td>{row.AdmitionId}</td>
                    <td>{row.PatientName}</td>
                    <td>{row.PhoneNo}</td>
                    <td>{row.Age}</td>
                    <td>{row.Sex}</td>
                    <td>{row.Add1}</td>
                    <td>{row.AdmitionDate}</td>
                    <td>{row.GurdianName}</td>
                    <td>{row.BedId}</td>
                    <td>{row.Status}</td>
                    <td>{row.CompanyId}</td>
                    <td>{row.DepartmentId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">

          <div className="text-muted small">
            Page {pagination.page}
          </div>

          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default OtherCharges;
