import React, { useRef, useState } from "react";
import useAxiosFetch from "../Fetch";
import { Table } from "react-bootstrap";

const CancelTest = () => {
  const printRef = useRef();

  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const params = new URLSearchParams({
    startDate,
    endDate,
  });
  const { data: patients } = useAxiosFetch(
    `/case-dtl-01/cases-with-tests?PatientName=&startDate=${startDate}&endDate=${endDate}&page=1&limit=100`,
    [startDate, endDate]
  );

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");

    printWindow.document.write(`
    <html>
      <head>
        <title>Monthly Bill Register</title>

        <link rel="stylesheet" 
         href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
          }

          .report-header {
            text-align: center;
            border-bottom: 3px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .report-title {
            font-size: 24px;
            font-weight: 700;
          }

          .sub-title {
            font-size: 14px;
            margin-top: -4px;
            color: #555;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          th, td {
            border: 1px dashed #000 !important;
            padding: 8px !important;
            font-size: 14px;
          }

          thead {
            background-color: #343a40;
            color: #fff;
          }

          .footer {
            border-top: 2px dashed #000;
            margin-top: 40px;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
            color: #333;
          }

        </style>

      </head>

      <body>
        <div class="report-header">
          <div class="report-title">Monthly Bill Register</div>
          <div class="sub-title">Report Period: ${startDate} to ${endDate}</div>
        </div>

        ${printContents}

        <div class="footer">
          Generated on: ${new Date().toLocaleString()}
        </div>

      </body>
    </html>
  `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  return (
    <div className="container mt-3">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary rounded shadow mb-4">
        <span className="navbar-brand ms-2 h5">Cancel Test Register</span>
      </nav>

      <main className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm p-4">
            <h6 className="fw-bold text-center mb-3">Report Date</h6>

            <div className="mb-3">
              <label className="form-label">Date From :</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Date To :</label>
              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                type="date"
                className="form-control"
              />
            </div>
            <button
              onClick={handlePrint}
              className="btn btn-success mt-3 w-100"
            >
              Print Report
            </button>
          </div>
        </div>
      </main>
      {/* PRINTABLE TABLE */}
      <div hidden ref={printRef}>
        <div className="container">
          <h5 className="mt-2 mb-3">
            <b>Selected Case Wise Lab Report</b>
          </h5>

          {patients.map((p, pIndex) => (
            <div key={pIndex} style={{ marginBottom: "25px" }}>
              {/* PATIENT DETAILS BLOCK */}
              <div
                style={{
                  padding: "10px",
                  border: "1px dashed #000",
                  marginBottom: "10px",
                  background: "#f7f7f7",
                }}
              >
                <p style={{ margin: 0 }}>
                  <b>Patient ID:</b> {p.PatientId}
                  <b>Name:</b> {p.PatientName}
                  <b>Age:</b> {p.Age} | <b>Sex:</b> {p.Sex}
                  <b>Date:</b> {new Date(p.CaseDate).toLocaleDateString()}
                </p>
              </div>

              {/* TEST TABLE FOR THIS PATIENT */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  letterSpacing: "1px",
                  fontSize: "14px",
                }}
              >
                {/* <thead>
                  <tr style={{ background: "#e6e6e6" }}>
                    <th style={{ border: "1px dashed #000", padding: "6px" }}>
                      SL
                    </th>
                    <th style={{ border: "1px dashed #000", padding: "6px" }}>
                      Test Name
                    </th>
                  </tr>
                </thead> */}

                <tbody>
                  {p.tests.map((test, idx) => (
                    <tr key={idx}>
                      <td
                        style={{
                          border: "1px dashed #000",
                          padding: "6px",
                          width: "60px",
                        }}
                      >
                        {idx + 1}
                      </td>

                      <td style={{ border: "1px dashed #000", padding: "6px" }}>
                        {test.TestName}
                      </td>

                      <td style={{ border: "1px dashed #000", padding: "6px" }}>
                        {p.CaseDate.split("T")[0]}
                      </td>
                      <td style={{ border: "1px dashed #000", padding: "6px" }}>
                        {p.CancelDate || "-"}
                      </td>
                      <td style={{ border: "1px dashed #000", padding: "6px" }}>
                        {test.Rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CancelTest;
