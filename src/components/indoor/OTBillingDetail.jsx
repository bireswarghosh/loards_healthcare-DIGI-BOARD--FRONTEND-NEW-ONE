import React from "react";

const OTBillingDetail = () => {
  return (
    <div className="panel">

      {/* Header with Tabs */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <div className="panel-title fw-bold">O.T. Billing Detail</div>

        <div className="tabs d-flex gap-2">
          <button className="btn btn-sm btn-outline-light">List</button>
          <button className="btn btn-sm btn-primary">Detail</button>
          <button className="btn btn-sm btn-outline-light">OT Note Procedure</button>
        </div>
      </div>

      {/* Body */}
      <div className="panel-body">

        {/* BASIC INFO */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">O.T. Bill No.</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Date</label>
              <input type="date" className="form-control form-control-sm" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Search</label>
              <select className="form-select form-select-sm">
                <option>By Admission No.</option>
                <option>By Name</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">EMR</label>
              <input className="form-control form-control-sm" />
            </div>
          </div>
        </div>

        {/* ADMISSION + ANESTHESIA */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">Admission No.</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Anesthesia Doctor Name
              </label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Type</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Amount</label>
              <input
                className="form-control form-control-sm"
                defaultValue="0.00"
              />
            </div>
          </div>
        </div>

        {/* SURGEON */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">
                Surgeon Doctor Name
              </label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Amount</label>
              <input
                className="form-control form-control-sm"
                defaultValue="0.00"
              />
            </div>
          </div>
        </div>

        {/* OTHER DOCTOR */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">
                Other/Under Care Doctor
              </label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Amount</label>
              <input
                className="form-control form-control-sm"
                defaultValue="0.00"
              />
            </div>
          </div>
        </div>

        {/* OT CHARGE SECTION */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">O.T. Name</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Slot</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">O.T. Type</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">O.T. Hour</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Minute</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-12">
              <label className="form-label small fw-bold">Remarks</label>
              <textarea className="form-control form-control-sm" rows={2} />
            </div>
          </div>
        </div>

        {/* BILLING ITEMS TABLE */}
        <div className="table-responsive border rounded mb-4">
          <table className="table table-dashed table-hover digi-dataTable table-sm align-middle mb-0">
            <thead className="digi-table-header">
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No items added yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* OT SUMMARY */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">O.T. Consumable</label>
              <input className="form-control form-control-sm" defaultValue="0.00" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">O.T. Instruments</label>
              <input className="form-control form-control-sm" defaultValue="0.00" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">O.T. Medicines</label>
              <input className="form-control form-control-sm" defaultValue="0.00" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">O.T. Other Charges</label>
              <input className="form-control form-control-sm" defaultValue="0.00" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Service Charges</label>
              <input className="form-control form-control-sm" defaultValue="0.00" />
            </div>
          </div>
        </div>

        {/* BOOKING INFO */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">Booking No</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Booking Date</label>
              <input type="date" className="form-control form-control-sm" />
            </div>
          </div>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">Admission By</label>
              <input className="form-control form-control-sm" />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Current User</label>
              <input
                className="form-control form-control-sm"
                defaultValue="Admin"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold text-danger">
                Total Bill Amount
              </label>
              <input
                className="form-control form-control-sm text-danger fw-bold"
                defaultValue="0.00"
              />
            </div>
          </div>
        </div>

        {/* MEDICINE SECTION */}
        <div className="panel border rounded p-3 mb-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label small fw-bold">
                Detail Print in OT Medicine Issue
              </label>
            </div>

            <div className="col-md-2">
              <button className="btn btn-sm btn-outline-primary w-100">
                OT Medicine
              </button>
            </div>

            <div className="col-md-2">
              <button className="btn btn-sm btn-outline-secondary w-100">
                Load Medicine
              </button>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Amount</label>
              <input
                className="form-control form-control-sm"
                defaultValue="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="panel-footer d-flex flex-wrap justify-content-between align-items-center p-3">

        <div className="btn-group">
          <button className="btn btn-sm btn-warning">Repeat OT Entry</button>
          <button className="btn btn-sm btn-primary">New</button>
          <button className="btn btn-sm btn-outline-secondary">Edit</button>
          <button className="btn btn-sm btn-outline-success">Save</button>
          <button className="btn btn-sm btn-outline-danger">Delete</button>
          <button className="btn btn-sm btn-outline-dark">Undo</button>
          <button className="btn btn-sm btn-outline-info">Print</button>
          <button className="btn btn-sm btn-outline-dark">Exit</button>
        </div>

        <button className="btn btn-sm btn-outline-secondary">NotePrint</button>
      </div>

    </div>
  );
};

export default OTBillingDetail;
