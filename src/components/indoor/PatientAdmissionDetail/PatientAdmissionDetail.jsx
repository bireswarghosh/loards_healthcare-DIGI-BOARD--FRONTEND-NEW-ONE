import React from 'react';

const PatientAdmissionDetail = () => {
  return (
    <div className="panel">

      {/* ================== HEADER ================== */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <div className="panel-title fw-bold">Patient Admission - Detail</div>

        <div className="tabs d-flex gap-2">
          <button className="btn btn-sm btn-outline-light">List</button>
          <button className="btn btn-sm btn-primary">Detail</button>
          <button className="btn btn-sm btn-outline-light">MRD</button>
        </div>
      </div>

      {/* ================== BODY ================== */}
      <div className="panel-body">

        {/* ==== Admission Detail ==== */}
        <h5 className="fw-bold text-info mb-3">Admission Detail</h5>

        <div className="row g-3">
          <div className="col-md-3"><label className="form-label small">Admission No</label><input className="form-control form-control-sm" defaultValue="A-001043/24-25"/></div>
          <div className="col-md-2"><label className="form-label small">Date</label><input type="date" className="form-control form-control-sm" defaultValue="2025-02-22"/></div>
          <div className="col-md-2"><label className="form-label small">Bill Time</label><input className="form-control form-control-sm" defaultValue="12:00 PM"/></div>
          <div className="col-md-2"><label className="form-label small">Admission Time</label><input className="form-control form-control-sm" defaultValue="07:51 AM"/></div>
          <div className="col-md-2"><label className="form-label small">O.P.D</label><input className="form-control form-control-sm" defaultValue="S-019378/24-25"/></div>
          <div className="col-md-1"><label className="form-label small">Booking</label><input className="form-control form-control-sm" defaultValue="N"/></div>
        </div>

        {/* BARCODE */}
        <div className="text-end mt-3">
          <img src="https://barcode.tec-it.com/barcode.ashx?data=A-001043%2F24-25&code=Code128" alt="barcode"/>
          <div className="fw-bold">A-001043/24-25</div>
        </div>

        <hr className="my-4" />

        {/* ==== Patient Detail ==== */}
        <h5 className="fw-bold text-info mb-3">Patient Detail</h5>

        <div className="row g-3">
          {[
            ["Patient Name", "NITA BANERJEE", 4],
            ["Address", "42/1, RAM MOHAN MUKHERJEE LANE", 4],
            ["Area", "P.O.+P.S.-SHIBPUR", 4],
            ["Pin Code", "DIST.HOWRAH,PIN-711102", 4],
            ["DOB", "22/02/1960", 2],
            ["Age", "65", 1],
            ["Y", "0", 1], ["M", "0", 1], ["D", "0", 1],
            ["Sex", "F", 2],
            ["Marital Status", "M", 2],
            ["Phone", "9432248472", 3],
            ["ID Proof", "2270 7106 0089", 3],
            ["Religion", "HINDU", 2],
            ["PAN No", "N", 2],
            ["State", "Howrah", 2],
            ["Nationality", "INDIAN", 2],
            ["Weight", "0.000", 2],
            ["District / PS", "SHIBPUR", 2],
            ["URN", "", 2],
          ].map((i, idx) => (
            <div className={`col-md-${i[2]}`} key={idx}>
              <label className="form-label small">{i[0]}</label>
              <input className="form-control form-control-sm" defaultValue={i[1]} />
            </div>
          ))}
        </div>

        <hr className="my-4" />

        {/* ==== Guardian Detail ==== */}
        <h5 className="fw-bold text-info mb-3">Guardian Detail</h5>

        <div className="row g-3">
          <div className="col-md-5"><label className="form-label small">W/O, S/O, D/O</label><input className="form-control form-control-sm" defaultValue="W/O TAPAN KUMAR BANERJEE"/></div>
          <div className="col-md-4"><label className="form-label small">Relative Name</label><input className="form-control form-control-sm" defaultValue="TAPAN KUMAR BANERJEE (HUSBAND)"/></div>
          <div className="col-md-2"><label className="form-label small">Relation</label><input className="form-control form-control-sm" defaultValue="HUSBAND"/></div>
          <div className="col-md-3"><label className="form-label small">Phone No</label><input className="form-control form-control-sm" defaultValue="8777751519"/></div>
          <div className="col-md-2"><label className="form-label small">Company</label><input className="form-control form-control-sm" defaultValue="N"/></div>
          <div className="col-md-2"><label className="form-label small">Admission Type</label><input className="form-control form-control-sm" defaultValue="None"/></div>
        </div>

        <hr className="my-4" />

        {/* ========================================================= */}
        {/* ============== OTHER DETAILS  — FULL RESTORED ============ */}
        {/* ========================================================= */}

        <h5 className="fw-bold text-info mb-3">Other Details</h5>

        <div className="row g-3">

          <div className="col-md-4"><label className="form-label small">Department</label><input className="form-control form-control-sm" defaultValue="DELUX CABIN"/></div>
          <div className="col-md-3"><label className="form-label small">Under Care</label><input className="form-control form-control-sm" defaultValue="ABHRA MUKHOPADHYAY"/></div>
          <div className="col-md-2"><label className="form-label small">Doctor</label><input className="form-control form-control-sm"/></div>
          <div className="col-md-2"><label className="form-label small">Referral</label><input className="form-control form-control-sm" defaultValue="N"/></div>
          <div className="col-md-1"><label className="form-label small">Package</label><input className="form-control form-control-sm" defaultValue="N"/></div>

          <div className="col-md-2"><label className="form-label small">Valid Till</label><input className="form-control form-control-sm" defaultValue="01/01/1900"/></div>
          <div className="col-md-2"><label className="form-label small">Start Date</label><input className="form-control form-control-sm" defaultValue="01/01/1900"/></div>
          <div className="col-md-2"><label className="form-label small">Bed</label><input className="form-control form-control-sm" defaultValue="Y"/></div>
          <div className="col-md-2"><label className="form-label small">Cashless</label><input className="form-control form-control-sm" defaultValue="N"/></div>
          <div className="col-md-4"><label className="form-label small">Insurance Company</label><input className="form-control form-control-sm"/></div>

          <div className="col-md-2"><label className="form-label small">Bed No.</label><input className="form-control form-control-sm" defaultValue="DC-3RD-(01)"/></div>
          <div className="col-md-2"><label className="form-label small">Bed Rate</label><input className="form-control form-control-sm" defaultValue="3500"/></div>
          <div className="col-md-2"><label className="form-label small">Nursing Charge</label><input className="form-control form-control-sm" defaultValue="0"/></div>
          <div className="col-md-2"><label className="form-label small">RMO Charge</label><input className="form-control form-control-sm" defaultValue="0"/></div>
          <div className="col-md-2"><label className="form-label small">Day Care</label><input className="form-control form-control-sm" defaultValue="N"/></div>
          <div className="col-md-2"><label className="form-label small">Particular</label><input className="form-control form-control-sm"/></div>

          <div className="col-md-2"><label className="form-label small">Day Care Bed Rate</label><input className="form-control form-control-sm" defaultValue="0.00"/></div>
          <div className="col-md-2"><label className="form-label small">Employee</label><input className="form-control form-control-sm"/></div>
          <div className="col-md-3"><label className="form-label small">Disease</label><input className="form-control form-control-sm"/></div>
          <div className="col-md-3"><label className="form-label small">R.M.O.</label><input className="form-control form-control-sm" defaultValue="MO KAPIL KUMAR SHAW"/></div>

          <div className="col-md-3"><label className="form-label small">Referring Doctor</label><input className="form-control form-control-sm"/></div>
          <div className="col-md-3"><label className="form-label small">Referring Doctor 2</label><input className="form-control form-control-sm"/></div>

          <div className="col-md-3"><label className="form-label small">Package Amount</label><input className="form-control form-control-sm" defaultValue="0.00"/></div>
          <div className="col-md-3"><label className="form-label small">Total Package</label><input className="form-control form-control-sm"/></div>

          <div className="col-md-3"><label className="form-label small">Card No</label><input className="form-control form-control-sm"/></div>
          <div className="col-md-3"><label className="form-label small">CCN No</label><input className="form-control form-control-sm"/></div>
          <div className="col-md-3"><label className="form-label small">Disease Code</label><input className="form-control form-control-sm"/></div>

          <div className="col-md-3"><label className="form-label small">Admission By</label><input className="form-control form-control-sm" defaultValue="SANJAY ST."/></div>
          <div className="col-md-3"><label className="form-label small">Current User</label><input className="form-control form-control-sm" defaultValue="Admin"/></div>

          <div className="col-md-3"><label className="form-label small">Operation Date</label><input type="date" className="form-control form-control-sm" defaultValue="2025-02-22"/></div>
          <div className="col-md-3"><label className="form-label small">Operation Time</label><input className="form-control form-control-sm" defaultValue="07:51 AM"/></div>

          <div className="col-md-12">
            <label className="form-label small">Remarks</label>
            <textarea className="form-control form-control-sm" rows="2"></textarea>
          </div>

        </div>
      </div>

      {/* ================== FOOTER ================== */}
      {/* <div className="panel-footer d-flex justify-content-between flex-wrap gap-2 p-3">
        <div className="btn-group">
          {["New", "Edit", "Save", "Delete", "Undo", "Print", "Exit"].map((b,i)=>(
            <button key={i} className="btn btn-sm btn-primary">{b}</button>
          ))}
        </div>

        <div className="btn-group">
          <button className="btn btn-sm btn-secondary">Barcode</button>
          <button className="btn btn-sm btn-secondary">H Risk Consent</button>
          <button className="btn btn-sm btn-secondary">Consent</button>
        </div>
      </div> */}

    </div>
  );
};

export default PatientAdmissionDetail;
