import { useState, useEffect, useCallback, useRef } from "react";
// import { DigiContext } from '../context/DigiContext'; // Commented out as context is not defined here
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../../../components/footer/Footer";
import axiosInstance from "../../../../axiosInstance";

const OtherCharges = () => {
  const navigate = useNavigate();
  const isBelowLg = false;

  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Search for the main list
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [date, setDate] = useState("");

  // Fetch data from API
  const fetchCharges = async (page = currentPage) => {
    try {
      let url;
      if (search1) {
        url = `/admissions?page=${page}&limit=20&search=${search1}`;
      } else if (search2) {
        url = `/admissions?page=${page}&limit=20&search=${search2}&date=${date}`;
      } else {
        url = `/admissions?page=${page}&limit=20&date=${date}`;
      }

      const response = await axiosInstance.get(url);

      if (response.data.success) {
        setCharges(
          response.data.data.map((item) => ({ ...item, showDropdown: false })),
        );
        console.log("data: ", response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (err) {
      setError(
        "Failed to fetch records: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewCharges = (admission) => {
    navigate("/other-charges", {
      state: {
        selectedAdmission: admission,
        admissionId: admission.AdmitionId,
      },
    });
  };

  useEffect(() => {
    fetchCharges(currentPage);
  }, [currentPage, search1, search2, date]);

  const renderTable = () => {
    return (
      <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">
        <thead>
          <tr>
            <th>Action</th>
            <th>SL NO.</th>
            <th>Admission Id</th>
            <th>Patient Name</th>
            <th>Phone</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Address</th>
            <th>Addmission Date</th>
            <th>Gurdian</th>
            <th>Bed No</th>
            <th>Status</th>
            <th>Company</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {charges.length > 0 ? (
            charges.map((charge, index) => (
              <tr key={index}>
                <td>
                  <ul className="d-flex gap-2">
                    {/* <li>
                      <a
                        href="#"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("hello : ", charge);
                          handleViewCharges(charge);
                        }}
                      >
                        <span className="dropdown-icon">
                          <i className="fa-light fa-eye"></i>
                        </span>
                      </a>
                    </li> */}
                    <li>
                      {/* <a
                        href="#"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("hello : ", charge);
                          handleViewCharges(charge);
                        }}
                      >
                        <span className="dropdown-icon">
                         <i className="fa-solid fa-plus"></i> Add
                        </span>
                      </a> */}

                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("hello : ", charge);
                          handleViewCharges(charge);
                        }}
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </li>
                    {/* <li>
                      <a
                        href="#"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <span className="dropdown-icon">
                          <i className="fa-light fa-trash-can"></i>
                        </span>
                      </a>
                    </li> */}
                  </ul>
                </td>
                <td>{index + 1}</td>
                <td>{charge.AdmitionId}</td>
                <td>{charge.PatientName}</td>
                <td>{charge.PhoneNo}</td>
                <td>{charge.Age}</td>
                <td>{charge.Sex}</td>
                <td>{charge.Add1}</td>
                <td>{charge.AdmitionDate.split("T")[0]}</td>
                <td>{charge.GurdianName}</td>
                <td>{charge.BedId}</td>
                <td>{charge.Status}</td>
                <td>{charge.CompanyId}</td>
                <td>{charge.DepartmentId}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted py-4">
                No Other Charges records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  // ==========================================================
  // FIXED: Simplified Pagination Logic (like VisitList's structural requirements)
  // ==========================================================

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Logic to determine which pages to display in the pagination bar
    const maxPages = 5; // Max page links to display (e.g., 1 2 [3] 4 5)
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const goToPage = (page) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      setCurrentPage(page);
      fetchCharges(page);
    };

    return (
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
        <div className="text-muted small">
          Page {currentPage} of {totalPages}
        </div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            {/* Previous */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {/* Page Numbers */}
            {pageNumbers.map((pageNumber) => (
              <li
                key={pageNumber}
                className={`page-item ${
                  currentPage === pageNumber ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            ))}

            {/* Next */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // ==========================================================
  // END: FIXED Pagination Logic
  // ==========================================================

  return (
    <div className="main-content">
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
            <div className="panel-header">
              <h5>💰 Other Charges Management</h5>
              <div className="row gap-2">
                <input
                  placeholder="Search By Name..."
                  type="text"
                  className="form-control form-control-sm col"
                  value={search1}
                  onChange={(e) => {
                    setSearch1(e.target.value);
                  }}
                />
                <input
                  placeholder="Search By Phone..."
                  type="text"
                  className="form-control form-control-sm col"
                  value={search2}
                  onChange={(e) => {
                    setSearch2(e.target.value);
                  }}
                />
                <input
                  type="date"
                  className="form-control form-control-sm col"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                />
              </div>
              {/* <div className="btn-box d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  // onClick={handleAddNew}
                >
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div> */}
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {isBelowLg ? (
                    <OverlayScrollbarsComponent>
                      <div className="table-responsive">{renderTable()}</div>
                    </OverlayScrollbarsComponent>
                  ) : (
                    <div className="table-responsive">{renderTable()}</div>
                  )}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OtherCharges;
