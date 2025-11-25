import React from "react";

const FinalBillingDetail = () => {
  return (
    <div className="container-fluid py-4">

      <div className="digi-panel shadow-sm">

        {/* ================= HEADER ================= */}
        <div className="digi-panel-header">
          <h5 className="digi-title">
            <i className="bi bi-receipt me-2"></i>
            Final Billing Detail
          </h5>

          {/* <ul className="nav digi-tabs ms-auto">
            <li className="nav-item"><button className="nav-link">List</button></li>
            <li className="nav-item"><button className="nav-link active">Detail</button></li>
          </ul> */}
        </div>

        {/* ================= BODY ================= */}
        <div className="digi-panel-body row g-4">

          {/* LEFT SECTION */}
          <div className="col-md-9">

            {/* BILL DETAIL */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Bill Detail</h6>

              <div className="row g-2">
                <div className="col-md-4">
                  <input className="form-control form-control-sm" defaultValue="F-001043/24-25" placeholder="Bill No" />
                </div>

                <div className="col-md-4">
                  <input type="date" className="form-control form-control-sm" defaultValue="2025-02-22" />
                </div>

                <div className="col-md-4">
                  <input type="time" className="form-control form-control-sm" defaultValue="12:27" />
                </div>

                <div className="col-md-4 mt-2">
                  <input className="form-control form-control-sm" placeholder="Patient Name" defaultValue="SK MOSTAK AHAMMAD" />
                </div>

                <div className="col-md-4 mt-2">
                  <input className="form-control form-control-sm" placeholder="Department" />
                </div>

                <div className="col-md-4 mt-2">
                  <input className="form-control form-control-sm" placeholder="Entry By" defaultValue="SANJAY ST." />
                </div>
              </div>
            </div>

            {/* PATIENT DETAILS */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Patient Details</h6>

              <div className="row g-2">
                <div className="col-md-4">
                  <input className="form-control form-control-sm" defaultValue="A-001035/24-25" placeholder="Admission No" />
                </div>

                <div className="col-md-2">
                  <input className="form-control form-control-sm" defaultValue="58" placeholder="Age" />
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
                  <input className="form-control form-control-sm" defaultValue="9830948796" placeholder="Phone" />
                </div>

                <div className="col-12 mt-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    defaultValue="VILL: DANSPARA, P.O: SALAP, P.S: DOMJUR, HOWRAH, PIN: 711409"
                  ></textarea>
                </div>

                <div className="col-md-4 mt-2">
                  <input className="form-control form-control-sm" defaultValue="2025-02-19" placeholder="Admission Date" />
                </div>

                <div className="col-md-4 mt-2">
                  <input className="form-control form-control-sm" defaultValue="07:21 PM" placeholder="Admission Time" />
                </div>
              </div>
            </div>

            {/* BILL HEAD DETAIL */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Bill Head Detail</h6>

              <div className="table-responsive digi-scroll-md">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="digi-table-header">
                    <tr>
                      <th>Head</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Bed</th>
                      <th>Rate</th>
                      <th>Attendant</th>
                      <th>RMO</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr><td>Bed Charges</td><td>3600.00</td><td>19/02/2025</td><td>M1 GWM</td><td>1200</td><td>0</td><td>0</td></tr>
                    <tr><td>Others Charges</td><td>9640.00</td><td>20/02/2025</td><td>M1 GWM</td><td>1200</td><td>0</td><td>0</td></tr>
                    <tr><td>Service</td><td>969.00</td><td>21/02/2025</td><td>M1 GWM</td><td>1200</td><td>0</td><td>0</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTALS */}
            <div className="row g-2 mb-3">
              <div className="col-md-3">
                <input className="form-control form-control-sm text-danger" defaultValue="12000.00" placeholder="Total Receipt" />
              </div>

              <div className="col-md-3">
                <input className="form-control form-control-sm text-danger" defaultValue="2209.00" placeholder="Net Balance" />
              </div>

              <div className="col-md-3">
                <input className="form-control form-control-sm" defaultValue="0.00" placeholder="Approval Amt" />
              </div>

              <div className="col-md-3">
                <input className="form-control form-control-sm text-success fw-bold" defaultValue="14209.00" placeholder="Net Bill" />
              </div>
            </div>

            <div className="row g-2">
              <div className="col-md-3"><input className="form-control form-control-sm" placeholder="Corp Disc" /></div>
              <div className="col-md-3"><input className="form-control form-control-sm" defaultValue="2209.00" placeholder="Hosp Disc" /></div>
              <div className="col-md-3"><input className="form-control form-control-sm" placeholder="GST Amount" /></div>
              <div className="col-md-3">
                <select className="form-select form-select-sm">
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank</option>
                </select>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="col-md-3">
            <div className="digi-subpanel h-100">

              <div className="text-center mb-3">
                <img
                  src="https://via.placeholder.com/150x50?text=Barcode"
                  className="img-fluid mb-2"
                  alt="barcode"
                />
                <div className="fw-bold text-primary">A-001035/24-25</div>
              </div>

              <div className="mb-2">
                <label className="small fw-bold text-danger">Diagnostic Adv Received</label>
                <input className="form-control form-control-sm" defaultValue="3120.00" />
              </div>

              <div className="mb-2">
                <label className="small fw-bold text-danger">Med Adv Received</label>
                <input className="form-control form-control-sm" defaultValue="0.00" />
              </div>

              <div className="mb-3">
                <label className="small fw-bold text-danger">Remarks</label>
                <textarea className="form-control form-control-sm" rows={4}></textarea>
              </div>

              <div className="d-grid gap-2">
                <button className="btn digi-btn">All Money Receipt</button>
                <button className="btn digi-btn-dark">Print MRet</button>

                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="submitted" />
                  <label className="form-check-label small" htmlFor="submitted">
                    Submitted
                  </label>
                </div>

                <input type="text" className="form-control form-control-sm" placeholder="User / Note" />

                <button className="btn digi-btn-primary">Update</button>
              </div>

            </div>
          </div>

        </div>

        {/* ================= FOOTER ================= */}
        <div className="digi-panel-footer">
          {["Modify", "New", "Edit", "Save", "Delete", "Undo", "Print", "Exit", "Prev", "Next"].map((b) => (
            <button key={b} className="btn digi-btn">{b}</button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FinalBillingDetail;
