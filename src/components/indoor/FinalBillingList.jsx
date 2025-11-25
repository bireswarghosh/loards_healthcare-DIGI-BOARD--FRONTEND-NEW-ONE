import React from "react";

const FinalBillingList = () => {
  const billingData = [
    { billNo: "F-001043/24-25", billDate: "22/02/2025", billTime: "11:09 AM", admissionNo: "A-001035/24-25", patientName: "SK MOSTAK AHMAMD" },
    { billNo: "F-001044/24-25", billDate: "22/02/2025", billTime: "11:57 AM", admissionNo: "A-001032/24-25", patientName: "SALAUDDIN MOLLAH" },
    { billNo: "F-001045/24-25", billDate: "22/02/2025", billTime: "11:50 AM", admissionNo: "A-001036/24-25", patientName: "PRABIR MUKHERJEE" }
  ];

  return (
    <div className="container-fluid py-4">
      <div className="digi-panel shadow-sm">

        {/* ===================== HEADER ===================== */}
        <div className="digi-panel-header">
          <h5 className="digi-title">
            <i className="bi bi-receipt me-2"></i>
            Final Billing List
          </h5>

          <ul className="nav digi-tabs ms-auto">
            <li className="nav-item"><button className="nav-link active">List</button></li>
            <li className="nav-item"><button className="nav-link">Detail</button></li>
          </ul>
        </div>

        {/* ===================== BODY ===================== */}
        <div className="digi-panel-body">
          <div className="row g-4">

            {/* ===================== LEFT FILTERS ===================== */}
            <div className="col-md-8">
              <div className="digi-subpanel mb-3">
                <h6 className="digi-section-title">Filters</h6>

                <div className="row g-2">
                  <div className="col-md-3">
                    <label className="form-label small fw-bold">Date From</label>
                    <input type="date" className="form-control form-control-sm" defaultValue="2025-02-22" />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-bold">Date To</label>
                    <input type="date" className="form-control form-control-sm" defaultValue="2025-02-22" />
                  </div>

                  <div className="col-md-6 d-flex align-items-end gap-3">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="searchType" defaultChecked />
                      <label className="form-check-label small">Bill No Wise</label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="searchType" />
                      <label className="form-check-label small">Admission No Wise</label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="searchType" />
                      <label className="form-check-label small">Patient Name Wise</label>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center mt-3">
                  <input type="text" className="form-control form-control-sm me-2" placeholder="Search..." />
                  <button className="btn digi-btn-primary px-4">Show</button>
                </div>
              </div>
            </div>

            {/* ===================== RIGHT PANEL ===================== */}
            <div className="col-md-4">
              <div className="digi-subpanel h-100">

                <div className="text-center mb-3">
                  <img
                    src="https://via.placeholder.com/150x50?text=Barcode"
                    className="img-fluid mb-1"
                    alt="barcode"
                  />
                  <div className="fw-bold text-primary">A-001035/24-25</div>
                </div>

                <div className="mb-2">
                  <label className="small fw-bold text-danger">Diagnostic Adv Rcvd</label>
                  <input type="text" className="form-control form-control-sm" defaultValue="3120.00" />
                </div>

                <div className="mb-2">
                  <label className="small fw-bold text-danger">Med Adv Received</label>
                  <input type="text" className="form-control form-control-sm" defaultValue="0.00" />
                </div>

                <div className="mb-3">
                  <label className="small fw-bold text-danger">Remarks</label>
                  <textarea className="form-control form-control-sm" rows={4}></textarea>
                </div>

                {/* FIXED BUTTONS (always visible in all themes) */}
              <button
  className="btn digi-btn-primary w-100 mb-2"
  style={{
    backgroundColor: "#0d6efd",
    color: "#fff",
    fontWeight: 600,
    border: "1px solid #0d6efd"
  }}
>
  All Money Receipt
</button>

<button
  className="btn digi-btn-dark w-100 mb-3"
  style={{
    backgroundColor: "#212529",
    color: "#fff",
    fontWeight: 600,
    border: "1px solid #212529"
  }}
>
  Print MRet
</button>


                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="submitted" />
                  <label className="form-check-label small" htmlFor="submitted">Submitted</label>
                </div>

                <input type="text" className="form-control form-control-sm mt-2 mb-2" placeholder="User/Note" />

                <button className="btn digi-btn-primary w-100">Update</button>
              </div>
            </div>

          </div>

          {/* ===================== TABLE ===================== */}
          <div className="digi-subpanel mt-4">
            <h6 className="digi-section-title">Billing Records</h6>

            <div className="table-responsive digi-scroll-md">
              <table className="table table-sm table-bordered align-middle">
                <thead className="digi-table-header">
                  <tr>
                    <th>Bill No</th>
                    <th>Bill Date</th>
                    <th>Bill Time</th>
                    <th>Admission No</th>
                    <th>Patient Name</th>
                    <th>Bill Type</th>
                    <th>Receipt</th>
                  </tr>
                </thead>

                <tbody>
                  {billingData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{row.billNo}</td>
                      <td>{row.billDate}</td>
                      <td>{row.billTime}</td>
                      <td>{row.admissionNo}</td>
                      <td>{row.patientName}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>

        {/* ===================== FOOTER BUTTONS ===================== */}
        <div className="digi-panel-footer">
  {[
    { label: "Modify", color: "#ffc107", text: "#000" },
    { label: "New", color: "#0d6efd", text: "#fff" },
    { label: "Edit", color: "#6c757d", text: "#fff" },
    { label: "Save", color: "#198754", text: "#fff" },
    { label: "Delete", color: "#dc3545", text: "#fff" },
    { label: "Undo", color: "#212529", text: "#fff" },
    { label: "Print", color: "#0dcaf0", text: "#000" },
    { label: "Exit", color: "#000", text: "#fff" },
    { label: "Prev", color: "#6c757d", text: "#fff" },
    { label: "Next", color: "#6c757d", text: "#fff" }
  ].map((btn, idx) => (
    <button
      key={idx}
      className="btn digi-btn"
      style={{
        backgroundColor: btn.color,
        color: btn.text,
        fontWeight: 600,
        minWidth: "90px",
        border: `1px solid ${btn.color}`
      }}
    >
      {btn.label}
    </button>
  ))}
</div>


      </div>
    </div>
  );
};

export default FinalBillingList;

