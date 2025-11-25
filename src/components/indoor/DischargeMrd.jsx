import React from "react";

const docSlots = Array.from({ length: 8 }, (_, i) => i + 1);

const DischargeMrd = () => {
  return (
    <div className="container-fluid py-4">
      <div className="card shadow border-0 rounded-4 digi-card">

        {/* Tabs */}
        <div className="card-header p-0 digi-card-header">
          <ul className="nav digi-nav-tabs">
            <li className="nav-item">
              <button className="nav-link">List</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Detail</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Advice</button>
            </li>
            <li className="nav-item">
              <button className="nav-link active">MRD</button>
            </li>
          </ul>
        </div>

        {/* Body */}
        <div className="card-body digi-body">
          <div className="row g-3">

            {docSlots.map((slot) => (
              <div className="col-md-4" key={slot}>
                <div className="digi-panel p-3 h-100">

                  <h6 className="fw-bold text-primary mb-3">Load Document {slot}</h6>

                  <div className="mb-3">
                    <input type="file" className="form-control form-control-sm mb-2" />

                    {/* SAVE BUTTON */}
                    <button
                      className="btn btn-primary btn-sm w-100 mb-2 digi-btn"
                    >
                      <i className="bi bi-save me-1"></i>
                      Save
                    </button>

                    {/* OPEN DOC BUTTON */}
                    <button
                      className="btn btn-primary btn-sm w-100 mb-2 digi-btn"
                    >
                      <i className="bi bi-eye-fill me-1"></i>
                      Open Document
                    </button>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Footer Buttons */}
        <div className="card-footer digi-footer-buttons gap-2">
          <button className="btn btn-primary btn-sm">New</button>
          <button className="btn btn-outline-secondary btn-sm">Edit</button>
          <button className="btn btn-outline-success btn-sm" disabled>Save</button>
          <button className="btn btn-outline-danger btn-sm">Delete</button>
          <button className="btn btn-outline-dark btn-sm">Undo</button>
          <button className="btn btn-warning btn-sm">Print</button>
          <button className="btn btn-dark btn-sm">Exit</button>
        </div>

      </div>
    </div>
  );
};

export default DischargeMrd;
