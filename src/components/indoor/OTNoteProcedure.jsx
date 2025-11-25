import React from "react";

const OTNoteProcedure = () => {
  return (
    <div className="panel">

      {/* HEADER + TABS */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h5 className="panel-title">OT Note Procedure</h5>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-secondary">List</button>
          <button className="btn btn-sm btn-secondary">Detail</button>
          <button className="btn btn-sm btn-primary">OT Note Procedure</button>
        </div>
      </div>

      {/* BODY */}
      <div className="panel-body">

        <div className="row g-3">

          <div className="col-md-6">
            <label className="form-label fw-bold small">Incision</label>
            <input className="form-control form-control-sm" type="text" />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">
              Pre Operative Diagnostic
            </label>
            <input className="form-control form-control-sm" type="text" />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">
              Post Operative Diagnostic
            </label>
            <input className="form-control form-control-sm" type="text" />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small">Findings</label>
            <textarea className="form-control form-control-sm" rows="3"></textarea>
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small">Steps</label>
            <textarea className="form-control form-control-sm" rows="3"></textarea>
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small">Closure</label>
            <textarea className="form-control form-control-sm" rows="2"></textarea>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">Operative Difficulties</label>
            <input className="form-control form-control-sm" type="text" />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">Count</label>
            <input className="form-control form-control-sm" type="text" />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">Blood Loss</label>
            <input className="form-control form-control-sm" type="text" />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">Transfusion</label>
            <input className="form-control form-control-sm" type="text" />
          </div>

        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="panel-footer d-flex justify-content-between flex-wrap gap-2">

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

        <button className="btn btn-sm btn-outline-secondary">
          Note Print
        </button>
      </div>

    </div>
  );
};

export default OTNoteProcedure;



