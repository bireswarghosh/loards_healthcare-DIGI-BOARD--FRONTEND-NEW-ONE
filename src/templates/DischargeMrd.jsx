import React from "react";

const DocumentBox = ({ docNo }) => {
  return (
    <div className="border rounded p-2 shadow-sm bg-white">
      {/* Buttons */}
      <div className="d-flex flex-column gap-2 mb-2">
        <button className="btn btn-sm btn-primary">Load Doc {docNo}</button>
        <button className="btn btn-sm btn-success">Save</button>
        <button className="btn btn-sm btn-outline-secondary">Open Doc</button>
      </div>

      {/* Preview area */}
      <div
        className="border rounded bg-light"
        style={{ height: "180px", width: "100%" }}
      ></div>
    </div>
  );
};

const DocumentPanel = () => {
  return (
    <div className="container my-3">
      <h5 className="fw-bold text-primary mb-3">Document Management</h5>

      <div className="row g-3">
        {/* 1 to 8 Document Blocks */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <div className="col-md-3 col-sm-6" key={num}>
            <DocumentBox docNo={num} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentPanel;