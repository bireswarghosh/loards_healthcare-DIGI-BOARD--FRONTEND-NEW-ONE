import React from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const DoctorSelectionModal = ({ 
  show, 
  onClose, 
  doctors, 
  searchTerm, 
  onSearchChange, 
  currentPage, 
  onPageChange, 
  onSelect,
  doctorsPerPage = 8,
  title = 'Doctor Selection',
  nameField = 'Doctor',
  idField = 'DoctorId',
  extraFields = []
}) => {
  if (!show) return null;

  const filteredDoctors = doctors;

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
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
          maxWidth: '500px',
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
            {title}
          </div>

          <OverlayScrollbarsComponent style={{ maxHeight: 'calc(100vh - 150px)' }}>
            <div className="p-3">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="border rounded p-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {paginatedDoctors.length === 0 ? (
                  <div className="text-center text-muted py-3">No {title.toLowerCase()} found</div>
                ) : (
                  paginatedDoctors.map((doctor, i) => (
                    <div
                      key={i}
                      className="p-2 border-bottom cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelect(doctor)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="fw-bold">{doctor[nameField]}</div>
                      <small className="text-muted">ID: {doctor[idField]}</small>
                      {extraFields.map((field, idx) => (
                        <div key={idx}>
                          <small className="text-muted">{field.label}: {doctor[field.field]}</small>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {filteredDoctors.length > doctorsPerPage && (
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
                    Showing {Math.min((currentPage - 1) * doctorsPerPage + 1, filteredDoctors.length)} to{' '}
                    {Math.min(currentPage * doctorsPerPage, filteredDoctors.length)} of {filteredDoctors.length} items
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

export default DoctorSelectionModal;
