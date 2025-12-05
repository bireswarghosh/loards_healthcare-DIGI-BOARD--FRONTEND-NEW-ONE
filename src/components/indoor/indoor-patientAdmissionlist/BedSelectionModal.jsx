import React from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const BedSelectionModal = ({ 
  show, 
  onClose, 
  beds, 
  searchTerm, 
  onSearchChange, 
  currentPage, 
  onPageChange, 
  onSelect,
  bedsPerPage = 10,
  departments = []
}) => {
  if (!show) return null;

  const getDepartmentName = (id) => {
    const dept = departments.find((d) => d.DepartmentId === id);
    return dept ? dept.Department : 'Unknown';
  };

  const filteredBeds = beds.filter(bed => {
    const bedName = (bed.Bed || '').toString().toLowerCase();
    const deptName = getDepartmentName(bed.DepartmentId).toLowerCase();
    const search = searchTerm.toLowerCase();
    const matches = bedName.includes(search) || deptName.includes(search);
    if (searchTerm) {
      console.log(`Bed: ${bed.Bed}, Search: ${searchTerm}, Matches: ${matches}`);
    }
    return matches;
  });

  console.log('Total beds received:', beds.length);
  console.log('Filtered beds after search:', filteredBeds.length);

  const totalPages = Math.ceil(filteredBeds.length / bedsPerPage);
  const paginatedBeds = filteredBeds.slice(
    (currentPage - 1) * bedsPerPage,
    currentPage * bedsPerPage
  );

  return (
    <>
      <div
        onClick={onClose}
        className="modal-backdrop fade show"
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
          maxWidth: '550px',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        <div className="top-panel" style={{ height: '100%', paddingTop: '10px' }}>
          <div
            className="dropdown-txt"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              padding: '10px',
            }}
          >
            🛏️ Bed Selection
          </div>

          <OverlayScrollbarsComponent style={{ maxHeight: 'calc(100vh - 150px)' }}>
            <div className="p-3">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search bed by number or department..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="border rounded p-2" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {paginatedBeds.length === 0 ? (
                  <div className="text-center text-muted py-3">No beds found</div>
                ) : (
                  paginatedBeds.map((bed, i) => (
                    <div
                      key={i}
                      className="p-2 border-bottom cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelect(bed)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">🛏️ {bed.Bed}</div>
                          <small className="text-muted">🏥 {getDepartmentName(bed.DepartmentId)}</small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">₹{bed.TotalCh}</div>
                          <span className={`badge ${bed.Vacant === 'Y' ? 'bg-success' : 'bg-danger'}`}>
                            {bed.Vacant === 'Y' ? 'Vacant' : 'Occupied'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {filteredBeds.length > bedsPerPage && (
                <nav className="mt-3">
                  <ul className="pagination pagination-sm justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        ← Prev
                      </button>
                    </li>
                    {(() => {
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                      const pages = [];
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => onPageChange(i)}>
                              {i}
                            </button>
                          </li>
                        );
                      }
                      return pages;
                    })()}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next →
                      </button>
                    </li>
                  </ul>
                  <div className="text-center mt-2 text-muted small">
                    Showing {Math.min((currentPage - 1) * bedsPerPage + 1, filteredBeds.length)} to{' '}
                    {Math.min(currentPage * bedsPerPage, filteredBeds.length)} of {filteredBeds.length} beds
                  </div>
                </nav>
              )}

              <div className="d-flex gap-2 mt-3">
                <button
                  onClick={onClose}
                  type="button"
                  className="btn btn-secondary w-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </>
  );
};

export default BedSelectionModal;
