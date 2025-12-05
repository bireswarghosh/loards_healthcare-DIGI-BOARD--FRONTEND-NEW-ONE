import { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance";

const BedDrawer = ({ show, onClose, onSelect, selectedDepartmentId, departments = [] }) => {
  const [bedData, setBedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (show) {
      fetchBeds();
    }
  }, [show, currentPage, searchQuery]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      let url = `/bedMaster?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (searchQuery && searchQuery.trim() !== "") {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        let beds = response.data.data;
        
        if (selectedDepartmentId) {
          beds = beds.filter(bed => bed.DepartmentId === selectedDepartmentId);
        }
        
        setBedData(beds);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (id) => {
    const dept = departments.find((d) => d.DepartmentId === id);
    return dept ? dept.Department : "Unknown";
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBeds();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
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
        <ul className="pagination pagination-sm justify-content-center">
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

  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 9998 }}
      ></div>

      <div
        className="profile-right-sidebar active"
        style={{
          position: 'fixed',
          right: 0,
          top: '70px',
          height: 'calc(100vh - 70px)',
          width: '100%',
          maxWidth: '800px',
          zIndex: 9999,
          backgroundColor: 'white',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}
      >
        <button className="right-bar-close" onClick={onClose}>
          <i className="fa-light fa-angle-right"></i>
        </button>

        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">🛏️ Select Bed</h5>
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
          </div>

          <div className="table-responsive" style={{ maxHeight: "calc(100vh - 250px)" }}>
            <table className="table table-hover table-striped align-middle">
              <thead className="sticky-top bg-white">
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
                          className="btn btn-sm btn-primary"
                          onClick={() => onSelect(bed)}
                        >
                          Select
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
    </>
  );
};

export default BedDrawer;
