import React from "react";

const BedTransfer = () => {
  return (
    <div className="panel">

      {/* HEADER */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h5 className="panel-title">Bed Transfer</h5>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-secondary">List</button>
          <button className="btn btn-sm btn-primary">Transfer</button>
        </div>
      </div>

      {/* BODY */}
      <div className="panel-body">

        {/* PATIENT INFORMATION */}
        <h6 className="text-primary fw-bold mb-2">Patient Information</h6>
        <div className="row g-2 mb-3">

          <div className="col-md-4">
            <label className="form-label small fw-bold">Patient Name</label>
            <input className="form-control form-control-sm" defaultValue="MD YOUNUS" />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold">Admission No</label>
            <input className="form-control form-control-sm" defaultValue="A-000014/16-17" />
          </div>

          <div className="col-md-4 d-flex align-items-end gap-3">
            <div className="form-check d-flex align-items-center gap-1">
              <input type="radio" name="find" className="form-check-input" defaultChecked />
              <label className="form-check-label small">Find By Name</label>
            </div>

            <div className="form-check d-flex align-items-center gap-1">
              <input type="radio" name="find" className="form-check-input" />
              <label className="form-check-label small">Find By No.</label>
            </div>
          </div>
        </div>

        {/* CURRENT DATE */}
        <h6 className="text-primary fw-bold mb-2">Current Date</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold">Date</label>
            <input className="form-control form-control-sm" defaultValue="22/Feb/2025" />
          </div>
        </div>

        {/* BEFORE TRANSFER BED */}
        <h6 className="text-primary fw-bold mb-2">Before Transfer Bed</h6>
        <div className="row g-2 mb-3">

          <div className="col-md-4">
            <label className="form-label small fw-bold">Department</label>
            <input className="form-control form-control-sm" defaultValue="ICU" />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold">Bed No</label>
            <input className="form-control form-control-sm" defaultValue="32" />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold">Rate</label>
            <input className="form-control form-control-sm" defaultValue="4000.00" />
          </div>

        </div>

        {/* TRANSFER BED */}
        <h6 className="text-primary fw-bold mb-2">Transfer Bed</h6>
        <div className="row g-2 mb-3 align-items-end">

          <div className="col-md-3">
            <label className="form-label small fw-bold">Department</label>
            <input className="form-control form-control-sm" defaultValue="GENERAL-WARD-FEMALE" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Bed No</label>
            <input className="form-control form-control-sm" defaultValue="13" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Rate</label>
            <input className="form-control form-control-sm" defaultValue="1000.00" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Time</label>
            <input className="form-control form-control-sm" defaultValue="05:01 PM" />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold">To Day Rate</label>
            <input className="form-control form-control-sm" defaultValue="600.00" />
          </div>

        </div>

        {/* TRANSFER HISTORY */}
        <h6 className="text-primary fw-bold mb-2 mt-4">Transfer History</h6>

        <div className="table-responsive border rounded">
          <table className="table table-sm table-bordered table-hover digi-dataTable mb-0">

            <thead className="digi-table-header">
              <tr>
                <th>A Date</th>
                <th>A Time</th>
                <th>Department</th>
                <th>Bed No</th>
                <th>Rate</th>
                <th>R Date</th>
                <th>R Time</th>
                <th>To Day Rate</th>
                <th>Entry By</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>13/10/2017</td>
                <td>05:24 PM</td>
                <td>ICU</td>
                <td>32</td>
                <td>4000</td>
                <td>15/10/2017</td>
                <td>05:01 PM</td>
                <td>2000.00</td>
                <td>ADMIN</td>
              </tr>
            </tbody>

          </table>
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
          <button className="btn btn-sm btn-dark">Exit</button>
        </div>

      </div>

    </div>
  );
};

export default BedTransfer;
