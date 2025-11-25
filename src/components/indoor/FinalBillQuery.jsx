import React from "react";

const FinalBillQuery = () => {
  return (
    <div className="container-fluid py-4">

      <div className="digi-panel shadow-sm">
        {/* ================= HEADER ================= */}
        <div className="digi-panel-header">
          <h5 className="digi-title">
            <i className="bi bi-receipt-cutoff me-2"></i>
            Final Bill Query
          </h5>
        </div>

        <div className="digi-panel-body row g-4">

          {/* ================= LEFT COLUMN ================= */}
          <div className="col-lg-7">

            {/* ========== Bill Detail ========== */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Bill Detail</h6>

              <div className="row g-2">
                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Name / Bill No" />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Bill No" />
                </div>

                <div className="col-md-2">
                  <input type="date" className="form-control form-control-sm" />
                </div>

                <div className="col-md-2">
                  <input type="time" className="form-control form-control-sm" />
                </div>

                <div className="col-md-2">
                  <input type="time" className="form-control form-control-sm" placeholder="Discharge Time" />
                </div>
              </div>
            </div>

            {/* ========== Patient Detail ========== */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Patient Detail</h6>

              <div className="row g-2">
                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Admission No" />
                </div>

                <div className="col-md-2">
                  <input type="number" className="form-control form-control-sm" placeholder="Age" />
                </div>

                <div className="col-md-2">
                  <select className="form-select form-select-sm">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <input className="form-control form-control-sm" placeholder="Status" />
                </div>

                <div className="col-md-2">
                  <input type="date" className="form-control form-control-sm" />
                </div>

                <div className="col-md-4">
                  <input type="time" className="form-control form-control-sm" />
                </div>

                <div className="col-12">
                  <textarea className="form-control form-control-sm" rows={2} placeholder="Address"></textarea>
                </div>

                <div className="col-md-6">
                  <input className="form-control form-control-sm" placeholder="Phone No" />
                </div>
              </div>
            </div>

            {/* ========== Bill Head Detail ========== */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Bill Head Detail</h6>

              <div className="table-responsive digi-scroll-sm">
                <table className="table table-sm table-bordered">
                  <thead className="digi-table-header">
                    <tr>
                      <th>Head</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr><td>Bed Charges</td><td>3600.00</td></tr>
                    <tr><td>Other Charges</td><td>9640.00</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========== Totals Section ========== */}
            <div className="digi-subpanel">
              <h6 className="digi-section-title">Summary</h6>

              <div className="row g-2">
                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Total Amount" defaultValue="0.00" /></div>

                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Receipt" defaultValue="0.00" /></div>

                <div className="col-md-4 d-flex align-items-center">
                  <input type="checkbox" className="form-check-input me-2" />
                  <label className="small">Tax Inclusive (Y/N)</label>
                </div>

                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Net Balance" defaultValue="0.00" /></div>
                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Approval Amt" defaultValue="0.00" /></div>
                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Service Tax" defaultValue="0.00" /></div>

                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Patient Party" defaultValue="0.00" /></div>
                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Corp. Payable" defaultValue="0.00" /></div>
                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="TDS" defaultValue="0.00" /></div>

                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Discount" defaultValue="0.00" /></div>
                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Receipt Amt" defaultValue="0.00" /></div>
                <div className="col-md-4"><input className="form-control form-control-sm" placeholder="Due" defaultValue="0.00" /></div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="col-lg-5">

            {/* Payment Party */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Payment Party</h6>

              <div className="table-responsive digi-scroll-sm">
                <table className="table table-sm table-bordered">
                  <thead className="digi-table-header">
                    <tr>
                      <th>Party</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Insurance</td><td>0.00</td></tr>
                    <tr><td>Private</td><td>0.00</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* After Final Bill */}
            <div className="digi-subpanel">
              <h6 className="digi-section-title">After Final Bill Detail</h6>

              <div className="row g-2">
                <div className="col-md-6"><input className="form-control form-control-sm" placeholder="Corporate Due" defaultValue="0.00" /></div>
                <div className="col-md-6"><input className="form-control form-control-sm" placeholder="Party Due" defaultValue="0.00" /></div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= FOOTER BUTTONS ================= */}
        <div className="digi-panel-footer">
          {["New", "Edit", "Save", "Delete", "Undo", "Print", "Exit"].map((b) => (
            <button key={b} className="btn digi-btn">{b}</button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FinalBillQuery;
