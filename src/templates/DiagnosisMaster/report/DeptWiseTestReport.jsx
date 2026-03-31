import React, { useState } from "react";
import axiosInstance from "../../../axiosInstance";

const DeptWiseTestReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);

  // ✅ Group Data
  const groupData = (data) => {
    const map = {};

    data.forEach((item) => {
      if (!map[item.Department]) {
        map[item.Department] = {
          name: item.Department,
          tests: [],
          deptTotalQty: Number(item.deptTotalQty),
          deptTotalAmount: Number(item.deptTotalAmount),
        };
      }

      map[item.Department].tests.push(item);
    });

    return Object.values(map);
  };

  // ✅ Grand Total
  const getGrandTotal = (grouped) => {
    let totalQty = 0;
    let totalAmount = 0;

    grouped.forEach((dept) => {
      totalQty += dept.deptTotalQty;
      totalAmount += dept.deptTotalAmount;
    });

    return { totalQty, totalAmount };
  };

  // ✅ Print Function
  const handlePrint = async () => {
    if (!fromDate || !toDate) {
      alert("Select date range");
      return;
    }

    const res = await axiosInstance.get(
      `/case-dtl-01/test-report?fromDate=${fromDate}&toDate=${toDate}`
    );

    const grouped = groupData(res.data.data);
    setData(grouped);

    const grand = getGrandTotal(grouped);

    setTimeout(() => {
      const printContents = document.getElementById("print-area").innerHTML;

      const newWindow = window.open("", "_blank");

      newWindow.document.write(`
        <html>
          <head>
            <title>Department Report</title>
            <style>
              body {
                font-family: Arial;
                padding: 20px;
              }

              h2, p {
                text-align: center;
                margin: 0;
              }

              .date-range {
                text-align: center;
                margin: 10px 0;
                font-weight: bold;
              }

              .dept {
                margin-top: 20px;
                page-break-inside: avoid;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 5px;
              }

              th, td {
                border: 1px solid black;
                padding: 6px;
                font-size: 12px;
              }

              th {
                background: #eee;
              }

              .subtotal {
                text-align: right;
                margin-top: 5px;
                font-weight: bold;
              }

              .grand-total {
                margin-top: 20px;
                font-weight: bold;
                text-align: right;
                font-size: 14px;
              }

              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
              }
            </style>
          </head>

          <body>
            <h2>LORDS DIAGNOSTIC</h2>
            <p>Department Wise Register</p>

            <div class="date-range">
              From: ${fromDate} &nbsp;&nbsp; To: ${toDate}
            </div>

            ${printContents}

            <div class="grand-total">
              Grand Total: ${grand.totalQty} / ₹${grand.totalAmount}
            </div>
          </body>
        </html>
      `);

      newWindow.document.close();

      newWindow.onload = function () {
        newWindow.focus();
        setTimeout(() => {
          newWindow.print();
        }, 300);
      };
    }, 500);
  };

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: "#1e88e5",
          color: "#fff",
          padding: "15px 20px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        OPD Bill Register
      </div>

      {/* Card */}
      <div
        style={{
          maxWidth: "400px",
          margin: "40px auto",
          background: "#fff",
          padding: "25px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          Visit Date
        </h3>

        <div style={{ marginBottom: "15px" }}>
          <label>Date From :</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Date To :</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          onClick={handlePrint}
          style={{
            width: "100%",
            background: "#2e7d32",
            color: "#fff",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Print Report
        </button>
      </div>

      {/* Hidden Print Area */}
      <div id="print-area" style={{ display: "none" }}>
        {data.map((dept, i) => (
          <div className="dept" key={i}>
            <h4>{dept.name}</h4>

            <table>
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {dept.tests.map((t, index) => (
                  <tr key={index}>
                    <td>{t.Test}</td>
                    <td>{t.totalTestCount}</td>
                    <td>{t.Rate}</td>
                    <td>{t.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="subtotal">
              Sub Total: {dept.deptTotalQty} / ₹{dept.deptTotalAmount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeptWiseTestReport;
