import React from "react";

const DischargeAdvise = () => {
  return (
    <div className="container-fluid py-3">

      {/* ====== EMR PANEL WRAPPER ====== */}
      <div className="panel shadow-sm rounded-3 overflow-hidden">

        {/* ===================== HEADER & TABS ===================== */}
        <div className="panel-header d-flex justify-content-between align-items-center px-3 py-2">
          <h5 className="panel-title m-0">
            <i className="bi bi-file-medical-fill text-primary me-2"></i>
            Discharge & Advice
          </h5>
        </div>

        {/* ==== TABS ==== */}
       

        {/* ===================== BODY ===================== */}
        <div className="panel-body p-3">
          <div className="row g-3">

            {/* ========================================================================
                LEFT SIDE : TEXT BLOCKS (EMR Styled)
            ======================================================================== */}
            <div className="col-lg-6">

              {/* Past History */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Past History</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  defaultValue="1"
                ></textarea>
              </div>

              {/* Significant Findings */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Significant Findings</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  defaultValue={`BP=190/100 MMHG
PULSE = 110/MIN
SPO2=98%R.A`}
                ></textarea>
              </div>

              {/* Investigations */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Investigation Results</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  defaultValue="All reports enclosed."
                ></textarea>
              </div>

              {/* Treatment */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Treatment Done</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  defaultValue="1. Conservative."
                ></textarea>
              </div>

              {/* Procedure */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Procedure (If Any)</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  defaultValue="2. Gastroenterologist (Dr.Srikant Mohta) and General surgeon (Dr. Shashank Shukla) opinion were taken."
                ></textarea>
              </div>

              {/* Condition */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Condition At Discharge</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  defaultValue="Hemodynamically stable."
                ></textarea>
              </div>

              {/* Follow Up */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Follow Up Date</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  defaultValue="Follow up after 10 days at opd/or in case of any emergency please contact..."
                ></textarea>
              </div>

              {/* Advice Table */}
              <div className="panel p-3 mb-3">
                <label className="form-label small fw-bold">Advice on Discharge</label>

                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="digi-table-header">
                      <tr>
                        <th>S.No</th>
                        <th>Type</th>
                        <th>Medicine</th>
                        <th>Dose</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>NORMAL DIET</td><td></td><td></td><td></td></tr>
                      <tr><td>2</td><td>CAPSULE</td><td>PAN-D</td><td>1 CAP. ODACX 2</td><td></td></tr>
                      <tr><td>3</td><td>TABLET</td><td>MAGNICLAV LB 625 MG</td><td>1 TAB. TDCX X 10</td><td></td></tr>
                      <tr><td>4</td><td>TABLET</td><td>CEFAKIND 500 MG</td><td>1 TAB BDPCX X 7</td><td></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ========================================================================
                RIGHT SIDE : TEST TABLES
            ======================================================================== */}
            <div className="col-lg-6">

              {/* General Format */}
              <div className="panel p-3 mb-3">
                <h6 className="fw-bold text-primary small mb-2">General Format</h6>

                <div className="table-responsive" style={{ maxHeight: 220 }}>
                  <table className="table table-sm table-bordered text-center">
                    <thead className="digi-table-header">
                      <tr>
                        <th>Test</th>
                        <th>Rate</th>
                        <th>TestPro</th>
                        <th>Provalue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <tr key={idx}>
                          <td>CREATININE</td>
                          <td>250</td>
                          <td>CREATININ</td>
                          <td>{Math.random().toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blood Format */}
              <div className="panel p-3 mb-3">
                <h6 className="fw-bold text-primary small mb-2">Blood Format</h6>

                <div className="table-responsive" style={{ maxHeight: 180 }}>
                  <table className="table table-sm table-bordered">
                    <thead className="digi-table-header">
                      <tr>
                        <th>SNo</th>
                        <th>Pro Name</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>Hemoglobin1</td><td>14.5</td></tr>
                      <tr><td>2</td><td>Hemoglobin2</td><td>14.6</td></tr>
                      <tr><td>3</td><td>Hemoglobin3</td><td>100.68</td></tr>
                      <tr><td>4</td><td>Erythrocytes</td><td>5.35</td></tr>
                      <tr><td>5</td><td>Leucocytes</td><td>15000</td></tr>
                      <tr><td>6</td><td>Neutrophils</td><td>88</td></tr>
                      <tr><td>7</td><td>Lymphocytes</td><td>10</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div className="panel p-3">
                <label className="form-label small fw-bold">Notes / Narration</label>
                <textarea className="form-control form-control-sm" rows={4}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== FOOTER BUTTONS ===================== */}
        <div className="panel-footer d-flex flex-wrap justify-content-center gap-2 p-2">
          <button className="btn btn-sm btn-primary px-4">New</button>
          <button className="btn btn-sm btn-outline-secondary px-4">Edit</button>
          <button className="btn btn-sm btn-outline-success px-4">Save</button>
          <button className="btn btn-sm btn-outline-danger px-4">Delete</button>
          <button className="btn btn-sm btn-outline-dark px-4">Undo</button>
          <button className="btn btn-sm btn-outline-warning px-4">Print</button>
          <button className="btn btn-sm btn-dark px-4">Exit</button>
        </div>
      </div>
    </div>
  );
};

export default DischargeAdvise;

