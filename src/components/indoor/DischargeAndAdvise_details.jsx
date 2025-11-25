import React from "react";

const DischargeAndAdviceDetails = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row g-3">

        {/* LEFT PANEL — Patient Information */}
        <div className="col-lg-8">
          <div className="card shadow-sm rounded-4">

            {/* Header */}
            <div className="card-header bg-light d-flex justify-content-between align-items-center rounded-top-4">
              <h5 className="fw-bold mb-0 text-primary">
                <i className="bi bi-file-earmark-medical me-2"></i>
                Discharge & Advice
              </h5>

              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-secondary">List</button>
                <button className="btn btn-sm btn-primary">Details</button>
              </div>
            </div>

            {/* Body */}
            <div className="card-body">

              {/* Patient Details */}
              <div className="panel mb-3 p-3 border rounded-3">
                <h6 className="fw-bold text-primary mb-3">Patient Details</h6>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Admission No</label>
                    <input className="form-control form-control-sm" defaultValue="A-001006/24-25" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Patient Name</label>
                    <input className="form-control form-control-sm" defaultValue="ABHISHEK SINGH" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Gender</label>
                    <input className="form-control form-control-sm" defaultValue="M" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Phone</label>
                    <input className="form-control form-control-sm" defaultValue="9836xxxxxx" />
                  </div>

                  <div className="col-md-8">
                    <label className="form-label small fw-bold">Address</label>
                    <input className="form-control form-control-sm" defaultValue="HOWRAH" />
                  </div>
                </div>
              </div>

              {/* Discharge Details */}
              <div className="panel p-3 border rounded-3 mb-3">
                <h6 className="fw-bold text-primary mb-3">Discharge Information</h6>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Admission Date</label>
                    <input type="date" className="form-control form-control-sm" defaultValue="2024-05-27" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Discharge Date</label>
                    <input type="date" className="form-control form-control-sm" defaultValue="2024-05-27" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Time</label>
                    <input className="form-control form-control-sm" defaultValue="01:35 PM" />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold">Final Diagnosis</label>
                    <textarea className="form-control form-control-sm" rows="3"></textarea>
                  </div>
                </div>
              </div>

              {/* Advice Section */}
              <div className="panel p-3 border rounded-3 mb-3">
                <h6 className="fw-bold text-primary mb-3">Advice</h6>

                <textarea className="form-control form-control-sm" rows="4"></textarea>
              </div>

              {/* Footer Buttons */}
              <div className="d-flex flex-wrap gap-2 mt-3">
                {["New", "Edit", "Save", "Delete", "Undo", "Print"].map((btn) => (
                  <button key={btn} className="btn btn-sm btn-outline-primary px-4">
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — BARCODE + INFO */}
        <div className="col-lg-4">

          {/* BARCODE BLOCK (Restored) */}
          <div className="p-3 border rounded-4 shadow-sm text-center bg-light-subtle mb-4">
            <img
              src="https://barcode.tec-it.com/barcode.ashx?data=A-001006%2F24-25&code=Code128"
              alt="barcode"
              className="img-fluid"
            />
            <p className="fw-bold text-dark mb-0 mt-2">A-001006/24-25</p>
          </div>

          {/* Right Side Info */}
          <div className="p-3 border rounded-4 shadow-sm bg-white">
            <h6 className="fw-bold text-primary">Discharged By</h6>
            <p>RM</p>

            <h6 className="fw-bold mt-3 text-primary">Current User</h6>
            <p>Admin</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DischargeAndAdviceDetails;
