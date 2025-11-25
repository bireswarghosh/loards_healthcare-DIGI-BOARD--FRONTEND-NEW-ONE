import React from "react";

const DoctorVisit = () => {
  return (
    <div className="panel">

      {/* HEADER */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h5 className="panel-title">Doctor Visit</h5>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-secondary">List</button>
          <button className="btn btn-sm btn-secondary">Detail</button>
          <button className="btn btn-sm btn-primary">Doctor Visit</button>
        </div>
      </div>

      {/* BODY */}
      <div className="panel-body">

        {/* BILL DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Bill Detail</h6>
        <div className="row g-2 mb-3">

          <div className="col-md-4">
            <label className="form-label small fw-bold mb-1">Patient Name</label>
            <input className="form-control form-control-sm" defaultValue="SUCHNITITA PACHHAL" />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold mb-1">Admission No</label>
            <input className="form-control form-control-sm" defaultValue="A-001736/20-21" />
          </div>

          <div className="col-md-4 d-flex align-items-end gap-3">
            <div className="form-check form-check-inline">
              <input type="radio" className="form-check-input" name="find" defaultChecked />
              <label className="form-check-label small">Find By Name</label>
            </div>

            <div className="form-check form-check-inline">
              <input type="radio" className="form-check-input" name="find" />
              <label className="form-check-label small">Find By No.</label>
            </div>
          </div>

        </div>

        {/* PATIENT DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Patient Detail</h6>

        <div className="row g-2 mb-3">

          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Address</label>
            <input className="form-control form-control-sm" defaultValue="DARIARA" />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Area</label>
            <input className="form-control form-control-sm" defaultValue="PS: TAMULK" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Age</label>
            <input className="form-control form-control-sm" defaultValue="18.00" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Sex</label>
            <select className="form-select form-select-sm">
              <option>F</option>
              <option>M</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Phone</label>
            <input className="form-control form-control-sm" />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Marital Status</label>
            <input className="form-control form-control-sm" defaultValue="U" />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Bed No</label>
            <input className="form-control form-control-sm" defaultValue="21" />
          </div>

        </div>

        {/* DOCTOR VISIT DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Doctor Visit</h6>

        <div className="row g-2 mb-3">

          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Doctor Name</label>
            <input className="form-control form-control-sm" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Date</label>
            <input type="date" className="form-control form-control-sm" defaultValue="2025-02-22" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Time</label>
            <input className="form-control form-control-sm" defaultValue="12:19 PM" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Package</label>
            <select className="form-select form-select-sm"><option>N</option></select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Rate</label>
            <input className="form-control form-control-sm" defaultValue="0.00" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">No of Visit</label>
            <input className="form-control form-control-sm" defaultValue="0" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">/VISIT</label>
            <select className="form-select form-select-sm"><option>1</option></select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Amount</label>
            <input className="form-control form-control-sm" defaultValue="0.00" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Doc Pay Amt</label>
            <input className="form-control form-control-sm" defaultValue="0.00" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Type of Visit</label>
            <input className="form-control form-control-sm" defaultValue="DOCTOR VISIT" />
          </div>

        </div>

        {/* PREVIOUS DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Previous Detail</h6>

        <div className="table-responsive mb-3" style={{ maxHeight: "130px" }}>
          <table className="table table-sm table-hover table-bordered digi-dataTable">
            <thead className="digi-table-header">
              <tr>
                <th>Doctor Name</th>
                <th>Rate</th>
                <th>No of Visit</th>
                <th>Amount</th>
                <th>Pay Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Entry</th>
                <th>Visit Type</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="9" className="text-muted small text-center py-2">
                  No previous entries.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ADVICE + PROCEDURE */}
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Advice</label>
            <textarea className="form-control form-control-sm" rows="2"></textarea>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Procedure</label>
            <textarea className="form-control form-control-sm" rows="2"></textarea>
          </div>
        </div>

      </div>

      {/* FOOTER BUTTONS */}
      <div className="panel-footer d-flex justify-content-between flex-wrap gap-2">

        <div className="btn-group">
          <button className="btn btn-sm btn-primary">New</button>
          <button className="btn btn-sm btn-secondary">Edit</button>
          <button className="btn btn-sm btn-success">Save</button>
          <button className="btn btn-sm btn-danger">Delete</button>
          <button className="btn btn-sm btn-dark">Undo</button>
          <button className="btn btn-sm btn-info">Find</button>
          <button className="btn btn-sm btn-warning">Print</button>
          <button className="btn btn-sm btn-dark">Exit</button>
        </div>

      </div>

    </div>
  );
};

export default DoctorVisit;

