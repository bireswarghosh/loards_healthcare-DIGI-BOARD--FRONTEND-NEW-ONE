import React from "react";

const PatientEnquiryDetail = () => {
  return (
    <div className="container-fluid py-4">
      <div className="digi-panel shadow-sm rounded-4">

        {/* =================== HEADER =================== */}
        <div className="digi-panel-header">
          <h5 className="digi-title">
            <i className="bi bi-file-earmark-text me-2" />
            Patient Enquiry Detail
          </h5>

          <ul className="nav digi-tabs ms-auto">
            <li className="nav-item">
              <button className="nav-link">List</button>
            </li>
            <li className="nav-item">
              <button className="nav-link active">Detail</button>
            </li>
          </ul>
        </div>

        {/* =================== BODY =================== */}
        <div className="digi-panel-body row g-4">

          {/* LEFT SIDE */}
          <div className="col-md-9">

            {/* BILL DETAILS */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Bill Detail</h6>

              <div className="row g-2">
                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Bill No" />
                </div>

                <div className="col-md-3">
                  <input type="date" className="form-control form-control-sm" />
                </div>

                <div className="col-md-3">
                  <input type="time" className="form-control form-control-sm" placeholder="Bill Time" />
                </div>

                <div className="col-md-3">
                  <input type="time" className="form-control form-control-sm" placeholder="Discharge Time" />
                </div>
              </div>
            </div>

            {/* PATIENT DETAILS */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Patient Detail</h6>

              <div className="row g-2">

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Patient Name" />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Admission No" />
                </div>

                <div className="col-md-2">
                  <input className="form-control form-control-sm" type="number" placeholder="Age" />
                </div>

                <div className="col-md-2">
                  <select className="form-select form-select-sm">
                    <option>Sex</option>
                    <option>M</option>
                    <option>F</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Marital Status" />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Admission Date" />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Admission Time" />
                </div>

                <div className="col-12">
                  <input className="form-control form-control-sm" placeholder="Address" />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Phone No." />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Referral" />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Company" />
                </div>

                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Cashless" />
                </div>

                <div className="col-12">
                  <input className="form-control form-control-sm" placeholder="Remarks" />
                </div>

              </div>
            </div>

            {/* BILL HEAD DETAIL */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">Bill Head Detail</h6>

              <div className="table-responsive digi-scroll-sm" style={{ maxHeight: "150px" }}>
                <table className="table table-sm table-bordered">
                  <thead className="digi-table-header">
                    <tr>
                      <th>Head</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr><td>Bed Charges</td><td>0.00</td></tr>
                    <tr><td>Doctor Charges</td><td>0.00</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="row g-2 mt-3">
                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Net Balance" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Approval Amt" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Patient Party" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Discount" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Receipt Amt" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Service Tax" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Corp. Payable" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="TDS" />
                </div>

                <div className="col-md-3 d-flex align-items-center">
                  <input className="form-check-input me-2" type="checkbox" />
                  <label className="small">Tax Inclusive</label>
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Due" />
                </div>
              </div>
            </div>

            {/* AFTER FINAL BILL DETAIL */}
            <div className="digi-subpanel mb-3">
              <h6 className="digi-section-title">After Final Bill Detail</h6>

              <div className="row g-3">
                <div className="col-md-6">
                  <table className="table table-sm table-bordered">
                    <thead className="digi-table-header">
                      <tr>
                        <th>Head</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Other Charges</td><td>0.00</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Corporate Due" />
                </div>

                <div className="col-md-3">
                  <input className="form-control form-control-sm" placeholder="Party Due" />
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT PANEL */}
<div className="col-md-3">
  <div
    className="digi-subpanel h-100 d-flex flex-column gap-2"
    style={{
      background: "var(--digi-light-bg)",
      border: "1px solid var(--digi-border)",
      padding: "16px",
      borderRadius: "8px",
    }}
  >
    <h6 className="text-center digi-section-title">Quick Actions</h6>

    <button className="btn digi-btn-primary w-100">Search</button>
    <button className="btn digi-btn-success w-100">Save</button>
    <button className="btn digi-btn-danger w-100">Delete</button>
    <button className="btn digi-btn-dark w-100">Print</button>
    <button className="btn digi-btn w-100">Exit</button>
  </div>
</div>




        </div>

      </div>
    </div>
  );
};

export default PatientEnquiryDetail;
