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
                <div className="d-flex">
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

                  <button className="btn btn-sm text-danger" title="Delete">
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
    </div>
  );
};

export default CaseList;
