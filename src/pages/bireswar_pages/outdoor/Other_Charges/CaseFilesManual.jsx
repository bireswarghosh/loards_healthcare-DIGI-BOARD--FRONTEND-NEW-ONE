import React, { useState } from "react";

const CaseFilesManual = ({ caseId, onClose }) => {
  // Manual file mapping - add your files here
  const fileMapping = {
    "000001/17-18": [
      {
        name: "Case1-17-18_87.doc",
        link: "https://docs.google.com/document/d/1Jxm9jOYMvGTsom1l1bvXBBQzejVpu3ot/edit"
      },
      {
        name: "Case1-17-18_711.Doc",
        link: "https://docs.google.com/document/d/ANOTHER_FILE_ID_HERE/edit"
      }
    ],
    // Add more cases here
    // "000002/17-18": [
    //   { name: "Case2-17-18_100.doc", link: "https://..." }
    // ]
  };

  const files = fileMapping[caseId] || [];

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
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
              <h5 className="modal-title">📄 Files for Case: {caseId}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {files.length > 0 ? (
                <div className="row">
                  {files.map((file, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title text-truncate" title={file.name}>
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
                  <p className="mb-0">No files configured for this case</p>
                  <small className="text-muted">
                    Add file links in CaseFilesManual.jsx
                  </small>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseFilesManual;
