import React, { useState } from "react";

import { toast } from "react-toastify";
import useAxiosFetch from "./DiagnosisMaster/Fetch";

const CaseWiseLab = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectionFilter, setSelectionFilter] = useState("selective");
  const [selectedPatients, setSelectedPatients] = useState([]);
  const { data: patients } = useAxiosFetch(
    `/case-dtl-01/cases-with-tests?PatientName=&startDate=${startDate}&endDate=${endDate}&page=1&limit=100`,
    [startDate, endDate]
  );
  // const patients = patientsold?.filter((x) => x.tests && x.tests.length > 0);

  const handleSelectionFilter = (type) => {
    setSelectionFilter(type);
    if (type === "all") {
      setSelectedPatients(patients?.map((x) => x.CaseId));
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
    const selectedData = patients?.filter((p) =>
      selectedPatients.includes(p.CaseId)
    );

    let innerHTML = `
    <div class="container">
      <h5 class="mt-2 mb-2"><b>Selected Case Wise Lab Report</b></h5>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th style="width: 60px">Sl No</th>
            <th>Patient ID</th>
            <th>Patient Name</th>
            <th>Age</th>
            <th>Sex</th>
            <th>Date</th>
            <th>Tests</th>
          </tr>
        </thead>
        <tbody>
  `;

    selectedData.forEach((p, index) => {
      innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${p.PatientId}</td>
        <td>${p.PatientName}</td>
<td>${p.Age}</td>

<td>${p.Sex}</td>

        <td>${new Date(p.CaseDate).toLocaleDateString()}</td>
        <td>
          <ul style="padding-left: 16px; margin: 0;list-style: none;">
            ${p.tests.map((test, idx) => `<li>${idx + 1}. ${test.TestName}</li>`).join("")} </ul>
        </td>
      </tr>
    `;
    });

    innerHTML += `
        </tbody>
      </table>
    </div>
  `;

    const printWindow = window.open("", "", "width=900,height=700");

    printWindow.document.write(`
    <html>
      <head>
        <title>Case Wise Lab Report</title>

        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
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
          }

          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
            font-size: 14px;
          }

          thead {
            background-color: #343a40;
            color: #fff;
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
          <div class="report-title">Case Wise Lab Report</div>
          <div class="sub-title">Generated List Based on Selection</div>
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
        <span className="navbar-brand ms-2 h5">Case Wise Lab Report</span>
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

              <tbody>
                {patients?.map((patient) => (
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

export default CaseWiseLab;