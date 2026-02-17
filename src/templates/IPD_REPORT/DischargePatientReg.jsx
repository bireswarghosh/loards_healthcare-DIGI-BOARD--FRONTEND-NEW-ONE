import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";

const DischargePatientReg = () => {
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [disData, setDisData] = useState([]);
  const [patientData, setPatientData] = useState([]);

  const [docData, setDocData] = useState([]);

  const fetchDis = async (from, to) => {
    try {
      const res = await axiosInstance.get(
        `/discert?startDate=${from}&endDate=${to}`,
      );
      console.log("data: ", res.data.data);

      res.data.success ? setDisData(res.data.data) : setDisData([]);
    } catch (error) {
      console.log("Error fetching ipd adm data: ", error);
    }
  };

  const fethPatientAdmData = async (data) => {
    try {
      const ids = data.map((item) => item.AdmitionId);
      console.log("ids: ", ids);

      const apiPromises = ids.map((id) =>
        axiosInstance.get(`/admission/${id}`),
      );

      const responses = await Promise.all(apiPromises);
      const patients = responses.map((item) => item.data.data);
      console.log("Patients: ", patients);
      setPatientData(patients);
      const res_doc = await axiosInstance("/doctors");
      res_doc.data.success ? setDocData(res_doc.data.data) : setDocData([]);
    } catch (error) {
      console.log("error fetching adm: ", error);
    }
  };

  useEffect(() => {
    if (disData.length == 0) {
      return;
    }
    fethPatientAdmData(disData);
  }, [disData]);

  //   const handlePrint = (from, to, count) => {
  //     const printContent = `
  //     <html>
  //       <head>
  //         <title>Admission Register</title>
  //         <style>
  //           body {
  //             font-family: Arial, sans-serif;
  //             margin: 40px;
  //           }

  //           .center {
  //             text-align: center;
  //             font-weight: bold;
  //           }

  //           .title-red {
  //             color: red;
  //             font-weight: bold;
  //             text-align: center;
  //             margin-top: 20px;
  //           }

  //           .section {
  //             margin-top: 30px;
  //             margin-left: 50px;
  //             font-size: 16px;
  //           }

  //           .total-box {
  //             margin-top: 40px;
  //             border: 1px solid #000;
  //             padding: 10px;
  //             width: 300px;
  //             margin-left: 50px;
  //             font-weight: bold;
  //           }

  //           p {
  //             margin: 6px 0;
  //           }
  //         </style>
  //       </head>

  //       <body>
  //         <div class="center">
  //           LORDS DIAGNOSTIC <br />
  //           13/3, CIRCULAR 2ND BYE LANE,
  //         </div>

  //         <div class="title-red">DEPARTMENT-WISE ADMISSION REGISTER</div>

  //         <div class="center" style="margin-top: 10px;">
  //           From: ${from} To : ${to}
  //         </div>

  //         <div class="section">
  //           <p>1 &nbsp; ADDITIONAL BED (OPD / DAYCARE) : 0</p>
  //           <p>2 &nbsp; DOUBLE SHARING (AC) : 0</p>
  //           <p>3 &nbsp; GEN BED (AC) : 0</p>
  //           <p>4 &nbsp; ICCU / ITU : 0</p>
  //           <p>5 &nbsp; NON-AC CABIN W/O ATTACHED BATH : 0</p>
  //           <p>6 &nbsp; SINGLE AC ROOM (EXECUTIVE) : 0</p>
  //           <p>7 &nbsp; SINGLE AC ROOM (DELUXE) : 0</p>
  //           <p>8 &nbsp; SINGLE AC ROOM (ECONOMY) : 0</p>
  //           <p>9 &nbsp; SUITE : 0</p>
  //           <p>10 TRIPLE SHARING AC ROOM (AC) : 0</p>
  //         </div>

  //         <div class="total-box">
  //           TOTAL ADMISSIONS : ${count}
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //     const printWindow = window.open("", "_blank");
  //     printWindow.document.open();
  //     printWindow.document.write(printContent);
  //     printWindow.document.close();

  //     printWindow.onload = () => {
  //       printWindow.focus();
  //       printWindow.print();
  //       printWindow.close();
  //     };
  //   };

  const handlePrint = (
    admissions,
    metaData = { fromDate, toDate },
    docData,
  ) => {
    // 1. Process Data: Map your raw DB names to the Report format
    const reportData = admissions.map((item) => {
      return {
        // Mapping fields from your specific JSON structure
        patientName: item.PatientName || "",
        // Your data has Doctor IDs (UCDoctor1Id), not names. Using ID or placeholder.
        doctor: item.UCDoctor1Id ? `${item.UCDoctor1Id}` : "",
        billNo: item.AdmitionId || "",
        // Formatting ISO Date (2023-06-19...) to DD/MM/YYYY
        dischDate: formatDate(item.oprationdate), // Using oprationdate as Disch placeholder
        admNo: item.AdmitionNo || "",
        admDate: formatDate(item.AdmitionDate),

        // FINANCIALS: These fields are missing in your raw data.
        // defaults are set to 0.00 to match the layout.
        billAmt: 0.0,
        discAmt: 0.0,
        recAmtTotal: 0.0,
        dueAmt: 0.0,
        refunded: 0.0,

        // RECEIPTS: Your data doesn't have a receipts array.
        // This is an empty array so the loop doesn't crash.
        receipts: [],
      };
    });

    // Default Meta Data if not provided
    const meta = {
      asOn: metaData.asOn || formatDate(new Date().toISOString()),
      fromDate:
        metaData.fromDate?.split("-").reverse().join("/") || "26/Jan/2026",
      toDate: metaData.toDate?.split("-").reverse().join("/") || "26/Jan/2026",
    };

    generatePdfContent(reportData, meta, docData);
  };

  /**
   * Helper: Formats ISO date string to DD/MM/YYYY
   */
  function formatDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Helper: Formats numbers to Currency (e.g., 12,345.00)
   */
  function formatCurrency(num) {
    if (num === null || num === undefined) return "0.00";
    return Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Generates HTML and triggers Window.print
   */
  function generatePdfContent(data, meta) {
    // CSS Styles exactly matching the uploaded image
    const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
      
      body { font-family: 'Roboto', sans-serif; font-size: 11px; color: #000; margin: 0; padding: 20px; }
      
      /* Headers */
      .header { text-align: center; margin-bottom: 20px; }
      .header h1 { font-size: 14px; margin: 0; text-transform: uppercase; font-weight: bold; }
      .header p { margin: 2px 0; font-size: 11px; }
      .title-red { color: red; font-weight: bold; font-size: 14px; margin-top: 10px; text-transform: uppercase; }

      /* Meta Data Row */
      .meta-row { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px; padding-bottom: 5px; }

      /* Table Styles */
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; vertical-align: top; padding: 4px 2px; }
      
      /* Utilities */
      .text-right { text-align: right; }
      .text-red { color: red; }
      .text-blue { color: blue; }
      .text-magenta { color: #800080; font-weight: bold; }
      .bold { font-weight: bold; }
      
      /* Table Header */
      thead th {
        font-weight: bold;
        border-top: 1px solid #999;
        border-bottom: 4px solid #999;
        padding: 8px 2px;
        white-space: nowrap;
      }
      
      /* Rows */
      .main-row td { padding-top: 10px; }
      .sub-text { font-size: 10px; color: #333; margin-top: 2px; display: block; }

      /* Receipt Rows (Nested) */
      .receipt-row td { padding: 2px; font-size: 10px; color: #444; }

      /* Summary Row (The Dashed Box) */
      .summary-row td {
        border-top: 1px dashed #008080; 
        border-bottom: 1px dashed #008080;
        font-weight: bold;
        padding: 5px 2px;
        margin-top: 5px;
      }
      .spacer-row td { height: 10px; }
    </style>
  `;

    // Build Table Rows
    let rowsHtml = "";

    data.forEach((item, index) => {
      // 1. Main Patient Row
      rowsHtml += `
      <tr class="main-row">
        <td>${index + 1}</td>
        <td>
          ${item.dischDate}<br>
          <span class="sub-text">${item.billNo}</span>
        </td>
        <td>
          ${item.patientName}<br>
         
          <span class="sub-text">${docData.find((doc) => doc.DoctorId == item.doctor)?.Doctor || ""}</span>
        </td>
        <td style={{font-size:6px;}}>${item.admNo}</td>
        <td>${item.admDate}</td>
        <td class="text-right text-magenta">${formatCurrency(item.billAmt)}</td>
        <td class="text-right"></td>
        <td class="text-right"></td>
        <td class="text-right"></td>
        <td class="text-right"></td>
      </tr>
    `;

      // 2. Receipt Rows (Iterate if data exists)
      if (item.receipts && item.receipts.length > 0) {
        item.receipts.forEach((rcpt) => {
          rowsHtml += `
          <tr class="receipt-row">
            <td></td><td></td><td></td>
            <td>${rcpt.receiptNo}</td>
            <td>${rcpt.date}</td>
            <td></td><td></td>
            <td class="text-right">${formatCurrency(rcpt.amount)}</td>
            <td></td><td></td>
          </tr>
        `;
        });
      }

      // 3. Summary Row (Dashed Lines)
      rowsHtml += `
      <tr class="summary-row">
        <td></td><td></td><td></td><td></td><td></td>
        <td class="text-right text-magenta">${formatCurrency(item.billAmt)}</td>
        <td class="text-right">${formatCurrency(item.discAmt)}</td>
        <td class="text-right bold">${formatCurrency(item.recAmtTotal)}</td>
        <td class="text-right text-red">${formatCurrency(item.dueAmt)}</td>
        <td class="text-right text-blue">${formatCurrency(item.refunded)}</td>
      </tr>
      <tr class="spacer-row"><td colspan="10"></td></tr>
    `;
    });

    // Construct Final HTML
    const htmlContent = `
    <html>
      <head>
        <title>Discharge Patient Register</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <h1>LORDS DIAGNOSTIC</h1>
          <p>13/3, CIRCULAR 2ND BYE LANE,</p>
          <h1 class="title-red">DISCHARGE PATIENT REGISTER</h1>
        </div>
        <div class="meta-row">
          <div>As On : ${meta.asOn}</div>
          <div>From : ${meta.fromDate} &nbsp;&nbsp; To : ${meta.toDate}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th width="3%">SL<br>No.</th>
              <th width="10%">Disch Date<br>Bill No.</th>
              <th width="25%">Patient Name<br>Doctor</th>
              <th width="15%">Adm. No.<br>Receipt No</th>
              <th width="10%">Adm Date<br>Date</th>
              <th width="10%" class="text-right">Bill Amt</th>
              <th width="8%" class="text-right">Disc Amt</th>
              <th width="10%" class="text-right">RecAmt</th>
              <th width="10%" class="text-right text-red">Due Amt</th>
              <th width="5%" class="text-right text-blue">Refunded</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

    // Open Print Window
    const printWindow = window.open("", "", "height=600,width=1000");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchDis(fromDate, toDate);
    }, 500);
    return () => clearTimeout(timeOut);

    // fetchDis();
  }, [fromDate, toDate]);

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4">
          <div className="panel-body p-4 p-md-5">
            <h4 className="mb-4 text-center">
              📊 Date Wise Admission Register
            </h4>

            {/* Date Range */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-2 text-md-end">
                <label className="form-label fw-semibold">Date Range:</label>
              </div>

              {/* FROM DATE */}
              <div className="col-md-4">
                <div className="input-group" style={{ position: "relative" }}>
                  <input
                    className="form-control form-control"
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      //   console.log(e.target.value);
                      setFromDate(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="col-md-1 text-center fw-semibold d-none d-md-block">
                - To -
              </div>

              {/* TO DATE */}
              <div className="col-md-4">
                <div className="input-group" style={{ position: "relative" }}>
                  <input
                    className="form-control form-control"
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      //   console.log(e.target.value);
                      setToDate(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="text-center mt-4">
              <button
                className="btn btn-primary btn-lg px-5"
                onClick={() => {
                  if (patientData.length == 0) {
                    console.log("No data to print");
                    return;
                  }
                  handlePrint(patientData, { fromDate, toDate }, docData);
                }}
              >
                <i className="fa-light fa-print me-2"></i>
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DischargePatientReg;
