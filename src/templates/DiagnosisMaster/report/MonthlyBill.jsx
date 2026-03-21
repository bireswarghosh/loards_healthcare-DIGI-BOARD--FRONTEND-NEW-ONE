import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../axiosInstance";

const MonthlyBill = () => {
  const printRef = useRef();

  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const [data, setData] = useState({
    modeWise: [],
    grandTotal: 0,
    totalReceipts: 0,
  });
  const [modeWise, setModeWise] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(
        `/money-receipt01/payment-mode-report?${params}`,
        [startDate, endDate],
      );
      if (res.data.success) {
        setData(res.data.data);
        setModeWise(res.data.data.modeWise);
      } else {
        setData({
          modeWise: [],
          grandTotal: 0,
          totalReceipts: 0,
        });
        setModeWise([]);
      }
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    if (endDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);


// const handlePrint = (reportData) => {
//   const { modeWise, grandTotal, totalReceipts } = reportData;

//   const iframe = document.createElement('iframe');
//   iframe.style.display = 'none';
//   document.body.appendChild(iframe);
//   const doc = iframe.contentWindow.document;

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Payment Report - Lords Diagnostic</title>
//         <style>
//           /* A4 Setup */
//           @page {
//             size: A4;
//             margin: 10mm; /* Standard professional margin */
//           }

//           body { 
//             font-family: 'Segoe UI', Arial, sans-serif; 
//             font-size: 10pt; /* Using pt for print consistency */
//             line-height: 1.3;
//             margin: 0; 
//             color: #000; 
//           }

//           /* Header */
//           .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
//           .header h2 { margin: 0; font-size: 18pt; color: #000; }
//           .header p { margin: 2px 0; font-size: 9pt; }
//           .report-title { margin-top: 5px; font-weight: bold; font-size: 11pt; text-decoration: underline; }
          
//           .meta-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 9pt; }
          
//           /* Table Formatting */
//           table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
          
//           th { 
//             border-bottom: 1px solid #000; 
//             text-align: left; 
//             padding: 6px 4px; 
//             font-size: 9pt; 
//             background-color: #f9f9f9 !important;
//             -webkit-print-color-adjust: exact; 
//           }
          
//           td { padding: 5px 4px; vertical-align: top; font-size: 9pt; border-bottom: 0.5px solid #eee; word-wrap: break-word; }

//           /* Repeat header on every page */
//           thead { display: table-header-group; }
          
//           /* Avoid breaking a single row across two pages */
//           tr { page-break-inside: avoid; page-break-after: auto; }

//           .mode-section-title { 
//             font-weight: bold; 
//             background: #eee !important; 
//             padding: 5px; 
//             margin: 10px 0 5px 0; 
//             border-left: 4px solid #000; 
//             -webkit-print-color-adjust: exact;
//           }

//           .total-row td { 
//             font-weight: bold; 
//             border-top: 1px solid #000; 
//             border-bottom: 1px solid #000; 
//             background: #fafafa !important;
//           }

//           /* Footer Summary */
//           .footer-container { display: flex; justify-content: flex-end; page-break-inside: avoid; }
//           .grand-total-box { 
//             width: 250px; 
//             border: 1px solid #000; 
//             padding: 10px; 
//             margin-top: 10px; 
//             background: #fdfdfd !important;
//           }
//           .flex-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
//           .grand-total-text { font-size: 12pt; font-weight: bold; border-top: 1px solid #ccc; padding-top: 5px; margin-top: 5px; }

//           @media print {
//             body { -webkit-print-color-adjust: exact; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h2>LORDS DIAGNOSTIC</h2>
//           <p>13/3, CIRCULAR 2ND BYE LANE, HOWRAH</p>
//           <div class="report-title">CASH REGISTER REPORT</div>
//         </div>

//         <div class="meta-info">
//           <span><strong>Date From:</strong> ${startDate?.split("-").reverse().join("/")}</span>
//           <span><strong>Date To:</strong> ${endDate?.split("-").reverse().join("/")}</span>
//           <span><strong>Print Time:</strong> ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
//         </div>

//         ${modeWise.map(mode => `
//           <div class="mode-section-title">PAYMENT MODE: ${mode.paymentMode.toUpperCase()}</div>
//           <table>
//             <thead>
//               <tr>
//                 <th style="width: 18%;">Receipt No</th>
//                 <th style="width: 15%;">Case No</th>
//                 <th style="width: 27%;">Patient Name</th>
//                 <th style="width: 12%; text-align:right;">Bill</th>
//                 <th style="width: 12%; text-align:right;">Paid</th>
//                 <th style="width: 16%;">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${mode.receipts.map(r => `
//                 <tr>
//                   <td>${r.ReceiptNo}<br/><small>${new Date(r.ReceiptDate).toLocaleDateString('en-GB')}</small></td>
//                   <td>${r.CaseNo}</td>
//                   <td>${r.PatientName}</td>
//                   <td style="text-align:right;">${r.BillAmount?.toFixed(2) || '0.00'}</td>
//                   <td style="text-align:right;">${r.PaidAmount.toFixed(2)}</td>
//                   <td><small>${r.Remarks || '-'}</small></td>
//                 </tr>
//               `).join('')}
//               <tr class="total-row">
//                 <td colspan="4" style="text-align:right;">${mode.paymentMode} TOTAL:</td>
//                 <td style="text-align:right;">${mode.totalAmount.toFixed(2)}</td>
//                 <td></td>
//               </tr>
//             </tbody>
//           </table>
//         `).join('')}

//         <div class="footer-container">
//           <div class="grand-total-box">
//             <div class="flex-row">
//               <span>Total Receipts:</span>
//               <span>${totalReceipts}</span>
//             </div>
//             <div class="flex-row grand-total-text">
//               <span>GRAND TOTAL:</span>
//               <span>₹ ${grandTotal.toFixed(2)}</span>
//             </div>
//           </div>
//         </div>

//         <script>
//           window.onload = function() {
//             window.print();
//             setTimeout(() => { window.frameElement.remove(); }, 100);
//           };
//         </script>
//       </body>
//     </html>
//   `;

//   doc.open();
//   doc.write(htmlContent);
//   doc.close();
// };











// const handlePrint = (reportData, startDate, endDate) => {
//   const { modeWise, grandTotal, totalReceipts } = reportData;

//   // Calculate specific totals for the summary block
//   const cashTotal = modeWise.find(m => m.paymentMode.toLowerCase() === 'cash')?.totalAmount || 0;
//   const bankTotal = modeWise.find(m => m.paymentMode.toLowerCase() === 'bank' || m.paymentMode.toLowerCase() === 'upi')?.totalAmount || 0;
//   const cardTotal = modeWise.find(m => m.paymentMode.toLowerCase() === 'card')?.totalAmount || 0;
//   const walletTotal = modeWise.find(m => m.paymentMode.toLowerCase() === 'wallet')?.totalAmount || 0;
  
//   const totalNonCash = grandTotal - cashTotal;

//   const iframe = document.createElement('iframe');
//   iframe.style.display = 'none';
//   document.body.appendChild(iframe);
//   const doc = iframe.contentWindow.document;

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Payment Report - Lords Diagnostic</title>
//         <style>
//           @page { size: A4; margin: 10mm; }
//           body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; line-height: 1.3; margin: 0; color: #000; }
//           .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
//           .header h2 { margin: 0; font-size: 18pt; }
//           .report-title { margin-top: 5px; font-weight: bold; font-size: 11pt; text-decoration: underline; }
//           .meta-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 9pt; }
          
//           table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
//           th { border-bottom: 1px solid #000; text-align: left; padding: 6px 4px; font-size: 9pt; background-color: #f9f9f9 !important; -webkit-print-color-adjust: exact; }
//           td { padding: 5px 4px; vertical-align: top; font-size: 9pt; border-bottom: 0.5px solid #eee; }
//           thead { display: table-header-group; }
//           tr { page-break-inside: avoid; }

//           .mode-section-title { font-weight: bold; background: #eee !important; padding: 5px; margin: 10px 0 5px 0; border-left: 4px solid #000; -webkit-print-color-adjust: exact; }
//           .total-row td { font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; background: #fafafa !important; }

//           /* Summary Styling from Image */
//           .summary-wrapper { display: flex; justify-content: space-between; margin-top: 30px; page-break-inside: avoid; border-top: 2px solid #000; padding-top: 15px; font-size:11px}
//           .calculation-block { width: 55%; }
//           .calculation-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #ddd; }
//           .calculation-row.bold { font-weight: bold; border-bottom: 2px solid #000; }
          
//           .mode-grid-box { width: 40%; border: 1px solid #000; padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; height: fit-content; }
//           .grid-item { display: flex; justify-content: space-between; font-size: 9pt; }
//           .label { color: #444; }

//           @media print { body { -webkit-print-color-adjust: exact; } }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h2>LORDS DIAGNOSTIC</h2>
//           <p>13/3, CIRCULAR 2ND BYE LANE, HOWRAH</p>
//           <div class="report-title">CASH REGISTER REPORT</div>
//         </div>

//         <div class="meta-info">
//           <span><strong>Date From:</strong> ${startDate?.split("-").reverse().join("/") || 'N/A'}</span>
//           <span><strong>Date To:</strong> ${endDate?.split("-").reverse().join("/") || 'N/A'}</span>
//           <span><strong>Print Time:</strong> ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
//         </div>

//         ${modeWise.map(mode => `
//           <div class="mode-section-title">PAYMENT MODE: ${mode.paymentMode.toUpperCase()}</div>
//           <table>
//             <thead>
//               <tr>
//                 <th style="width: 18%;">Receipt No</th>
//                 <th style="width: 15%;">Case No</th>
//                 <th style="width: 27%;">Patient Name</th>
//                 <th style="width: 12%; text-align:right;">Bill</th>
//                 <th style="width: 12%; text-align:right;">Paid</th>
//                 <th style="width: 16%;">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${mode.receipts.map(r => `
//                 <tr>
//                   <td>${r.ReceiptNo}<br/><small>${new Date(r.ReceiptDate).toLocaleDateString('en-GB')}</small></td>
//                   <td>${r.CaseNo}</td>
//                   <td>${r.PatientName}</td>
//                   <td style="text-align:right;">${r.BillAmount?.toFixed(2) || '0.00'}</td>
//                   <td style="text-align:right;">${r.PaidAmount.toFixed(2)}</td>
//                   <td><small>${r.Remarks || '-'}</small></td>
//                 </tr>
//               `).join('')}
//               <tr class="total-row">
//                 <td colspan="4" style="text-align:right;">${mode.paymentMode} TOTAL:</td>
//                 <td style="text-align:right;">${mode.totalAmount.toFixed(2)}</td>
//                 <td></td>
//               </tr>
//             </tbody>
//           </table>
//         `).join('')}

//         <div class="summary-wrapper">
//           <div class="calculation-block">
//             <div class="calculation-row">
//               <span>TOTAL Receipt</span>
//               <span>${grandTotal.toFixed(2)}</span>
//             </div>
//             <div class="calculation-row">
//               <span>LESS TOTAL NON-CASH Receipt</span>
//               <span>${totalNonCash.toFixed(2)}</span>
//             </div>
//             <div class="calculation-row bold">
//               <span>NET CASH Receipt</span>
//               <span>${cashTotal.toFixed(2)}</span>
//             </div>
//             <div class="calculation-row">
//               <span>LESS TOTAL EXPENSES</span>
//               <span>0.00</span>
//             </div>
//             <div class="calculation-row bold" style="background: #f0f0f0;">
//               <span>NET CASH BALANCE</span>
//               <span>${cashTotal.toFixed(2)}</span>
//             </div>
//           </div>

//           <div class="mode-grid-box">
//             <div class="grid-item"><span class="label">Total Cash</span> <span>${cashTotal.toFixed(2)}</span></div>
//             <div class="grid-item"><span class="label">Total Bank</span> <span>${bankTotal.toFixed(2)}</span></div>
//             <div class="grid-item"><span class="label">Total Card</span> <span>${cardTotal.toFixed(2)}</span></div>
//             <div class="grid-item"><span class="label">Total Wallet</span> <span>${walletTotal.toFixed(2)}</span></div>
//           </div>
//         </div>

//         <script>
//           window.onload = function() {
//             window.print();
//             setTimeout(() => { window.frameElement.remove(); }, 100);
//           };
//         </script>
//       </body>
//     </html>
//   `;

//   doc.open();
//   doc.write(htmlContent);
//   doc.close();
// };











const handlePrint = (reportData, startDate, endDate) => {
  const { modeWise, grandTotal, totalReceipts } = reportData;

  // 1. Dynamic Calculation Logic
  const cashTotal = modeWise.find(m => m.paymentMode.toLowerCase() === 'cash')?.totalAmount || 0;
  
  // Non-Cash is everything that isn't 'Cash'
  const totalNonCash = modeWise
    .filter(m => m.paymentMode.toLowerCase() !== 'cash')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Report - Lords Diagnostic</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 9pt; 
            line-height: 1.3; 
            margin: 0; 
            color: #000; 
          }
          
          /* Header */
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h2 { margin: 0; font-size: 16pt; text-transform: uppercase; }
          .report-title { margin-top: 5px; font-weight: bold; font-size: 11pt; text-decoration: underline; }
          
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
          
          /* Main Table */
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
          th { border-bottom: 1px solid #000; text-align: left; padding: 6px 4px; background: #f2f2f2 !important; -webkit-print-color-adjust: exact; }
          td { padding: 4px; vertical-align: top; border-bottom: 0.5px solid #eee; }
          
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }

          .mode-section-title { 
            font-weight: bold; 
            background: #e0e0e0 !important; 
            padding: 5px; 
            margin: 15px 0 5px 0; 
            border-left: 5px solid #000; 
            -webkit-print-color-adjust: exact; 
          }
          
          .total-row td { font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; }

          /* Bottom Summary Block (Matching your Image) */
          .summary-wrapper { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 30px; 
            page-break-inside: avoid; 
            border-top: 1.5px solid #000; 
            padding-top: 15px; 
          }
          
          .calculation-block { width: 50%; }
          .calc-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 0.5px solid #ccc; }
          .calc-row.main-bold { font-weight: bold; border-bottom: 1.5px solid #000; padding-top: 8px; }
          
          /* Right Side Dynamic Grid */
          .mode-grid-box { 
            width: 45%; 
            border: 1px solid #000; 
            padding: 10px; 
            display: grid; 
            grid-template-columns: 1fr 1fr; /* Two columns */
            gap: 8px 15px; 
            align-content: start;
          }
          .grid-item { display: flex; justify-content: space-between; font-size: 8.5pt; border-bottom: 0.5px dashed #aaa; padding-bottom: 2px; }
          .grid-label { font-weight: 600; color: #333; }

          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>LORDS DIAGNOSTIC</h2>
          <p>13/3, CIRCULAR 2ND BYE LANE, HOWRAH</p>
          <div class="report-title">CASH REGISTER REPORT</div>
        </div>

        <div class="meta-info">
          <span>Date From: ${startDate?.split("-").reverse().join("/") || '---'}</span>
          <span>Date To: ${endDate?.split("-").reverse().join("/") || '---'}</span>
          <span>Print: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>

        ${modeWise.map(mode => `
          <div class="mode-section-title">${mode.paymentMode.toUpperCase()} [DIAGNOSTIC]</div>
          <table>
            <thead>
              <tr>
                <th style="width: 20%;">Receipt / Date</th>
                <th style="width: 15%;">Case No</th>
                <th style="width: 25%;">Patient Name</th>
                <th style="width: 12%; text-align:right;">Bill</th>
                <th style="width: 12%; text-align:right;">Income</th>
                <th style="width: 16%;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${mode.receipts.map(r => `
                <tr>
                  <td>${r.ReceiptNo}<br/><small>${new Date(r.ReceiptDate).toLocaleDateString('en-GB')}</small></td>
                  <td>${r.CaseNo}</td>
                  <td>${r.PatientName}</td>
                  <td style="text-align:right;">${r.BillAmount?.toFixed(2) || '0.00'}</td>
                  <td style="text-align:right;">${r.PaidAmount.toFixed(2)}</td>
                  <td><small>${r.Remarks || '-'}</small></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align:right;">${mode.paymentMode.toUpperCase()} TOTAL:</td>
                <td style="text-align:right;">${mode.totalAmount.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `).join('')}

        <div class="summary-wrapper">
          <div class="calculation-block">
            <div class="calc-row">
              <span>TOTAL Receipt:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <div class="calc-row">
              <span>LESS TOTAL NON-CASH Receipt:</span>
              <span>${totalNonCash.toFixed(2)}</span>
            </div>
            <div class="calc-row main-bold">
              <span>NET CASH Receipt:</span>
              <span>${cashTotal.toFixed(2)}</span>
            </div>
            <div class="calc-row">
              <span>LESS TOTAL EXPENSES:</span>
              <span>0.00</span>
            </div>
            <div class="calc-row main-bold" style="background:#f9f9f9; padding: 8px 5px;">
              <span>NET CASH BALANCE:</span>
              <span>${cashTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="mode-grid-box">
            ${modeWise.map(m => `
              <div class="grid-item">
                <span class="grid-label">Total ${m.paymentMode}:</span>
                <span>${m.totalAmount.toFixed(2)}</span>
              </div>
            `).join('')}
            ${modeWise.length % 2 !== 0 ? '<div></div>' : ''}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => { window.frameElement.remove(); }, 100);
          };
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
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary rounded shadow mb-4">
        <span className="navbar-brand ms-2 h5">Monthly Bill Register</span>
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
              // onClick={handlePrint}
              onClick={() => {
                // console.log(data)
            handlePrint(data, startDate, endDate)
              }}
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

export default MonthlyBill;
