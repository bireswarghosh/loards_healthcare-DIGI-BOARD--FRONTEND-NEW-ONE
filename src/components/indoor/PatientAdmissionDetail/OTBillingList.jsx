import React from 'react';

const OTBillingList = () => {
  return (
    <div className="panel">

      {/* Header */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <div className="panel-title fw-bold">O.T. Billing List</div>

        {/* Tabs */}
        <div className="tabs d-flex gap-2">
          <button className="btn btn-sm btn-primary">List</button>
          <button className="btn btn-sm btn-outline-light">Detail</button>
          <button className="btn btn-sm btn-outline-light">OT Note Procedure</button>
        </div>
      </div>

      {/* Body */}
      <div className="panel-body">

        {/* FILTERS */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3 align-items-center">

            <div className="col-md-3">
              <label className="form-label fw-bold small">Date From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                defaultValue="2025-02-22"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold small">Date To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                defaultValue="2025-02-22"
              />
            </div>

          </div>
        </div>

        {/* TABLE */}
       <div className="table-responsive border rounded">
  <table className="table table-dashed table-hover digi-dataTable table-sm align-middle mb-0">

    <thead className="digi-table-header">
      <tr>
        <th>O.T. Bill No</th>
        <th>Bill Date</th>
        <th>Admission No</th>
        <th>Patient Name</th>
        <th>Bill Amount</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td colSpan="5" className="text-center text-muted py-5">
          No records found for selected date.
        </td>
      </tr>
    </tbody>

  </table>
</div>


      </div>

      {/* FOOTER BUTTONS */}
      <div className="panel-footer d-flex justify-content-between flex-wrap gap-2 p-3">

        <div className="btn-group">
          <button className="btn btn-sm btn-warning">Repeat OT Entry</button>
          <button className="btn btn-sm btn-primary">New</button>
          <button className="btn btn-sm btn-secondary">Edit</button>
          <button className="btn btn-sm btn-success">Save</button>
          <button className="btn btn-sm btn-danger">Delete</button>
          <button className="btn btn-sm btn-dark">Undo</button>
          <button className="btn btn-sm btn-info">Print</button>
          <button className="btn btn-sm btn-dark">Exit</button>
        </div>

        <button className="btn btn-sm btn-outline-secondary">NotePrint</button>
      </div>

    </div>
  );
};

export default OTBillingList;
