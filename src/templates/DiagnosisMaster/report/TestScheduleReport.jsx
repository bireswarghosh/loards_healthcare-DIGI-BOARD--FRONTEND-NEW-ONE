import React, { useState } from "react";
import useAxiosFetch from "../Fetch";

import { toast } from "react-toastify";
import ZLoader from "../ZLoader";

const TestScheduleReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectionFilter, setSelectionFilter] = useState("selective");
  const [selectedPatients, setSelectedPatients] = useState([]);
  const { data: patients,loading } = useAxiosFetch(
    // `/case01/search?PatientName=&startDate=${startDate}&endDate=${endDate}&page=1&limit=100`,
    `case01/cases-with-details?page=1&limit=999&startDate=${startDate}&endDate=${endDate}`,[
      (startDate, endDate)
    ]
  );
  
  const handleSelectionFilter = (type) => {
    setSelectionFilter(type);
    if (type === "all") {
      setSelectedPatients(patients.map((x) => x.CaseId));
    } else {
      setSelectedPatients([]);
    }
  };

  const handleCheckBox = (id) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    if (selectedPatients.length === 0) {
      toast.error("Please select at least one patient!");
      return;
    }

    // filter selected patients
    const selectedData = patients.filter((p) =>
      selectedPatients.includes(p.CaseId)
    );

    let innerHTML = `
    <div class="container">
      
      <table class="table table-bordered">
        <thead>
          <tr>
            <th >Sl</th>
            <th>Patient ID</th>
            <th >Patient Name</th>
            <th>Date</th>
            <th>Age</th>
            <th>Sex</th>
            <th>Total</th>
            <th>ReceiptAmt</th>
            <th>Due</th>
            <th>Tests</th>

          </tr>
        </thead>
        <tbody>
  `;

    selectedData.forEach((p, index) => {
      innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${p.CaseNo}</td>
        <td>${p.PatientName}</td>
        <td>${new Date(p.CaseDate).toLocaleDateString()}</td>
        <td>${p.Age}</td>
        <td>${p.Sex}</td>
        <td>${p.Total}</td>
        <td>${p.ReceiptAmt}</td>
        <td>${p.DueBillPrint}</td>
        <td>${p.tests.map(t => t.TestName).join(", ")}</td>
        


      </tr>
    `;
    });

    innerHTML += `
        </tbody>
      </table>
    </div>
  `;

    const printWindow = window.open("", "", "width=900,height=800");

    printWindow.document.write(`
    <html>
      <head>
        <title>Test Schedule Report</title>

        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

       <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
          }

          .total-row td{
  background:#e1c1c1 !important;
  color:# !important;
  font-weight:bold;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}

          .report-header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .report-title {
            font-size: 24px;
            font-weight: 700;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
          }

          th, td {
            border-left: none !important;
  border-right: none !important;
            padding: 2px !important;
            font-size: 10px;
            
          }

         thead th {
  background: #f3b9b9 !important;
  color: black !important;
}

          .footer {
            border-top: 2px solid #000;
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
          <div class="report-title">Test Schedule Report</div>
          <div class="sub-title">Lords Health Care</div>
        </div>

        ${innerHTML}

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
    <div className="container mt-2">
      {/* ============= Header ============= */}
      <nav className="navbar navbar-dark bg-primary rounded shadow mb-2">
        <span className="navbar-brand ms-2 h5">Test Schedule Report</span>
      </nav>

      {/* ============= Date Filters ============= */}
      <div className="card shadow-sm border-0 mb-2">
        <div className="card-body">
          <h6 className="text-primary fw-bold mb-2">Date Range</h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label mb-1">Date From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1">Date To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============= Selection Type ============= */}
      <div className="card shadow-sm border-0 mb-2">
        <div className="card-body">
          <h6 className="text-primary fw-bold mb-2">Selection Options</h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="border rounded p-2 d-flex align-items-center gap-2 w-100">
                <input
                  type="radio"
                  name="selectType"
                  checked={selectionFilter === "all"}
                  onChange={() => handleSelectionFilter("all")}
                />
                <span>All</span>
              </label>
            </div>

            <div className="col-md-6">
              <label className="border rounded p-2 d-flex align-items-center gap-2 w-100">
                <input
                  type="radio"
                  name="selectType"
                  checked={selectionFilter === "selective"}
                  onChange={() => handleSelectionFilter("selective")}
                />
                <span>Selective</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ============= Patient Table ============= */}
      <div className="card shadow-sm border-0 mb-2">
        <div className="card-body">
          <h6 className="fw-bold mb-2">Select Patients</h6>

          <div
            className="table-responsive hide-scroll"
            style={{ maxHeight: "240px", overflowY: "auto" }}
          >
            <table className="table table-bordered table-sm">
              <thead className="bg-primary sticky-top">
                <tr>
                  <th style={{ width: "160px" }}>Patient ID</th>
                  <th>Patient Name</th>
                </tr>
              </thead>
{loading && <ZLoader/>}
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.CaseId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.CaseId)}
                        onChange={() => handleCheckBox(patient.CaseId)}
                        className="me-2"
                      />
                      <span>{patient.PatientId}</span>
                    </td>

                    <td>{patient.PatientName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scroll hide */}
          <style>{`
            .hide-scroll::-webkit-scrollbar { display: none; }
          `}</style>
        </div>
      </div>

      {/* ============= Print Button ============= */}
      <div className="d-flex justify-content-end mt-3">
        <button
          onClick={handlePrint}
          className="btn btn-primary shadow-sm px-4"
        >
          <i className="fa fa-print me-2"></i> Print
        </button>
      </div>
    </div>
  );
};

export default TestScheduleReport;
