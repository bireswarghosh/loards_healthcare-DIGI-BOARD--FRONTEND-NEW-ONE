import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../../axiosInstance";

const DateRangeBillOther = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [data, setData] = useState({
    modeWise: [],
    grandTotal: 0,
    totalReceipts: 0,
  });

  // ✅ UPDATED TRANSFORM (only data mapping changed)
  const transformApiData = (apiData) => {
    const modeMap = {
      0: "Cash",
      1: "Card",
      2: "Cheque",
      3: "UPI",
      null: "Others",
    };

    const grouped = {};
    let grandTotal = 0;
    let totalReceipts = 0;

    (apiData || []).forEach((item) => {
      const type =
        item.PaymentType === null ? "null" : item.PaymentType.toString();

      if (!grouped[type]) {
        grouped[type] = {
          paymentMode: modeMap[item.PaymentType] || "Others",
          totalAmount: 0,
          receipts: [],
        };
      }

      const amount = Number(item.Amount || 0);

      grouped[type].totalAmount += amount;
      grandTotal += amount;
      totalReceipts++;

      grouped[type].receipts.push({
        ReceiptNo: item.OutBillNo || "-",
        RegistrationId: item.RegistrationId || "-",
        Patient: item.PatientName || "-",
        PVisitDate: item.OutBillDate ? item.OutBillDate.split("T")[0] : "-",
        PaidAmount: amount,
        TransNo:
          [item.BANK, item.Cheque].filter((v) => v && v.trim()).join(", ") ||
          "-",
      });
    });

    return {
      modeWise: Object.values(grouped),
      grandTotal,
      totalReceipts,
    };
  };

  // ✅ UPDATED API ONLY
  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(
        "/opd-other-charges/search/advanced",
        {
          params: {
            page: 1,
            limit: 10000,
            startDate,
            endDate,
          },
        }
      );

      if (res?.data?.success) {
        const transformed = transformApiData(res.data.data);
        setData(transformed);
      } else {
        setData({
          modeWise: [],
          grandTotal: 0,
          totalReceipts: 0,
        });
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // ✅ PRINT (same style, only column data changed)
  const handlePrint = (reportData, startDate, endDate) => {
    const { modeWise, grandTotal } = reportData;

    const getTotal = (type) =>
      modeWise.find((m) => m.paymentMode.toLowerCase() === type.toLowerCase())
        ?.totalAmount || 0;

    const cashTotal = getTotal("Cash");
    const cardTotal = getTotal("Card");
    const chequeTotal = getTotal("Cheque");
    const upiTotal = getTotal("UPI");
    const othersTotal = getTotal("Others");

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
@page { size:A4; margin:10mm; }

body {
  font-family: 'Segoe UI', Arial;
  font-size: 10pt;
  color:#000;
}

.header {
  text-align:center;
  border-bottom:2px solid #000;
  padding-bottom:8px;
  margin-bottom:12px;
}
.header h3 { margin:0; font-size:16pt; }

table {
  width:100%;
  border-collapse:collapse;
  margin-bottom:18px;
}

th {
  border-bottom:1px solid #000;
  padding:6px 4px;
  background:#f2f2f2;
  text-align:left;
}

td {
  padding:5px 4px;
  border-bottom:0.5px solid #ddd;
}

thead { display:table-header-group; }
tr { page-break-inside: avoid; }

.mode-title {
  font-weight:bold;
  background:#e6e6e6;
  padding:6px;
  margin:12px 0 5px 0;
  border-left:4px solid #000;
}

.total-row td {
  font-weight:bold;
  border-top:1px solid #000;
}

.summary {
  display:flex;
  justify-content:flex-end;
  margin-top:25px;
}

.box {
  border:1px solid #000;
  padding:10px;
  width:280px;
}

.row {
  display:flex;
  justify-content:space-between;
  margin-bottom:4px;
}

.bold {
  font-weight:bold;
  border-top:1px solid #000;
  padding-top:5px;
}
</style>
</head>

<body>

<div class="header">
  <h3>LORDS HEALTH CARE</h3>
  <div><b> Other Charges Bill-OUTDOOR</b></div>

  <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:9pt;">
    <span><b>Date From:</b> ${startDate.split("-").reverse().join("/")}</span>
    <span><b>Date To:</b> ${endDate.split("-").reverse().join("/")}</span>
    <span><b>Print Time:</b> ${new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}</span>
  </div>
</div>

${modeWise
  .map(
    (mode) => `
  <div class="mode-title">${mode.paymentMode.toUpperCase()}</div>

  <table>
    <thead>
      <tr>
        <th style="width:20%">Bill No</th>
        <th style="width:25%">RegistrationId</th>
        <th style="width:20%">Date</th>
        <th style="width:25%">Patient</th>
        <th style="width:15%; text-align:right;">Amount</th>
        <th style="width:15%">Trans No</th>
      </tr>
    </thead>

    <tbody>
      ${mode.receipts
        .map(
          (r) => `
        <tr>
          <td>${r.ReceiptNo}</td>
          <td>${r.RegistrationId}</td>
          <td>${r.PVisitDate}</td>
          <td>${r.Patient}</td>
          <td style="text-align:right;">${r.PaidAmount.toFixed(2)}</td>
          <td>${r.TransNo}</td>
        </tr>
      `
        )
        .join("")}

      <tr class="total-row">
        <td colspan="4" style="text-align:right;">TOTAL</td>
        <td style="text-align:right;">${mode.totalAmount.toFixed(2)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
`
  )
  .join("")}

<div class="summary">
  <div class="box">

    <div class="row bold">
      <span>Total Receipt:</span>
      <span>${grandTotal.toFixed(2)}</span>
    </div>

    <div class="row">
      <span>Cash:</span>
      <span>${cashTotal.toFixed(2)}</span>
    </div>

    <div class="row">
      <span>Card:</span>
      <span>${cardTotal.toFixed(2)}</span>
    </div>

    <div class="row">
      <span>Cheque:</span>
      <span>${chequeTotal.toFixed(2)}</span>
    </div>

    <div class="row">
      <span>UPI:</span>
      <span>${upiTotal.toFixed(2)}</span>
    </div>

    <div class="row">
      <span>Others:</span>
      <span>${othersTotal.toFixed(2)}</span>
    </div>

  </div>
</div>

<script>
window.onload = function() {
  window.print();
  setTimeout(()=>{ window.frameElement.remove(); },100);
}
</script>

</body>
</html>
`;

    doc.open();
    doc.write(htmlContent);
    doc.close();
  };

  return (
    <div className="container mt-3">
      {/* ✅ SAME NAVBAR */}
      <nav className="navbar navbar-dark bg-primary rounded shadow mb-4">
        <span className="navbar-brand ms-2 h5">
          Other Charrges Bill-OUTDOOR
        </span>
      </nav>

      {/* ✅ SAME UI */}
      <main className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm p-4">
            <h6 className="fw-bold text-center mb-3">Visit Date</h6>

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
              onClick={() => handlePrint(data, startDate, endDate)}
              className="btn btn-success mt-3 w-100"
            >
              Print Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DateRangeBillOther;
