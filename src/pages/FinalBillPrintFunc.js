

// Sort rows by date - smallest first
// Handles formats: "dd/mm/yyyy", "DD 00:00:00/MM/YYYY", "dd/mm/yyyy to dd/mm/yyyy"
function parseDateValue(d) {
  if (!d) return 99999999;
  const s = String(d).trim();
  // Format: "DD 00:00:00/MM/YYYY" or "DD HH:MM:SS/MM/YYYY"
  const match1 = s.match(/^(\d{1,2})\s+\d{2}:\d{2}:\d{2}\/(\d{2})\/(\d{4})/);
  if (match1) return Number(match1[3] + match1[2] + match1[1].padStart(2, '0'));
  // Format: "dd/mm/yyyy"
  const parts = s.split("/");
  if (parts.length === 3 && parts[2].length === 4) return Number(parts[2] + parts[1] + parts[0].padStart(2, '0'));
  // Format: "dd/mm/yyyy to dd/mm/yyyy" - use first date
  const rangeMatch = s.match(/^(\d{1,2})\/(\d{2})\/(\d{4})/);
  if (rangeMatch) return Number(rangeMatch[3] + rangeMatch[2] + rangeMatch[1].padStart(2, '0'));
  return 99999999;
}

function sortRowsByDate(rows) {
  if (!rows || !rows.length) return rows;
  return [...rows].sort((a, b) => parseDateValue(a[0]) - parseDateValue(b[0]));
}

function mergeConsecutive(arr) {
  const result = [];

  let i = 0;

  while (i < arr.length) {
    let start = arr[i];
    let j = i + 1;

    let count = 1;
    let totalAmount = start[4];

    while (
      j < arr.length &&
      arr[j][1] === start[1] // same element check
    ) {
      count++;
      totalAmount += arr[j][4];
      j++;
    }

    if (count > 1) {
      result.push([
        `${start[0]} to ${arr[j - 1][0]}`, // date range
        start[1],
        String(count), // count as string
        start[3],
        totalAmount,
      ]);
    } else {
      result.push(start);
    }

    i = j;
  }

  return result;
}

// this print final bill summary (done)
export const handlePrint1 = (data) => {
  data.services.rows = sortRowsByDate(data.services.rows);
  data.doctorVisits.rows = sortRowsByDate(data.doctorVisits.rows);
  data.investigations.rows = sortRowsByDate(data.investigations.rows);
  data.serviceCharges.rows = sortRowsByDate(data.serviceCharges.rows);
  if (data.otCharges?.rows) data.otCharges.rows = sortRowsByDate(data.otCharges.rows);
  let arr = mergeConsecutive(data.bedCharges.rows);
  data.bedCharges.rows = arr;
  // console.log("data.bedCharges.rows", data.bedCharges.rows)
  // CSS Styles to replicate the PDF look (A4, borders, fonts)
  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        font-weight:700;
        color: #000;
        line-height: 1.3;
        -webkit-print-color-adjust: exact;
      }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
     
      /* Header Section */
      .header-table { width: 100%; border: none; margin-bottom: 10px; }
      .header-table td { border: none; vertical-align: top; }
      .logo-section { text-align: center; width: 15%; }
      .logo-triangle {
        width: 0; height: 0;
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 50px solid #006400; /* Dark Green */
        margin: 0 auto;
        position: relative;
      }
      .logo-text { font-size: 8px; font-weight: bold; text-align: center; margin-top: 5px; color: #006400; }
     
      .company-info { text-align: center; width: 70%; }
      .company-name { font-size: 22px; font-weight: 700; color: #000000; margin: 0; }
      .company-pvt { font-size: 18px; font-weight: 700;}
      .company-address { font-size: 10px; font-weight: 700;  }
      .company-contact { font-size: 10px; font-weight: bold; }
     
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; font-weight: 700; }
     
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; font-weight: bold;}
      table.data-table th, table.data-table td { border: 1px solid #000; padding: 3px 5px; }
      table.data-table th { background-color: #f0f0f0; text-align: left; font-weight: bold; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .important-row {
     
  font-weight: 700;
  background: #fafafa;
}
  table.data-table td {
  font-weight: 700;
}
     
      /* Footer Totals */
      .footer-totals { width: 100%; margin-top: 20px; border-top: 1px solid #000; padding-top: 5px; }
      .total-row { display: flex; justify-content: flex-end; font-weight: bold; font-size: 12px; margin-bottom: 5px; }
      .total-label { margin-right: 20px; }
     
      /* Signature */
      .signature-section { margin-top: 40px; text-align: right; font-size: 11px; }
      .admin-sig { margin-top: 30px; }
     
      /* Utilities */
      .page-break { page-break-before: always; }
      .urn-box { position: absolute; top: 10px; right: 10px; border: 1px solid #000; padding: 2px; font-size: 9px; }
    </style>
  `;

  // HTML Construction
  let html = `<html><head><title>Final Bill</title>${styles}</head><body><div class="container">`;

  // --- HEADER ---
  html += `
    <table class="header-table">
      <tr>
        <td >        
          <img src="/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
         <!-- <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div> -->

           <h1 class="company-name">LORDS HEALTH CARE (NURSING HOME)</h1>
          <div class="company-pvt">(A UNIT of MJJ Enterprises Pvt. Ltd.)</div>
          <div class="company-address">13/3, Circular 2nd Bye Lane, Kona Expressway,</div>
          <div class="company-address">(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.</div>
          <div class="company-contact">
E-mail: patientdesk@lordshealthcare.org <br>
Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
          </div>
        </td>
     
     
       <td >        
          <img src="/assets/nabh.png" style="width:120px;" />
        </td>
      </tr>
    </table>
    <!--
   
    <div style="text-align: center; font-weight: bold; margin: 10px 0; font-size: 14px; text-decoration: underline;">BILL SUMMARY</div>
    -->
  `;

  html += `
  <div style="display:flex; align-items:center; justify-content:center; position:relative; margin:10px 0; margin-bottom:10px">

    <!-- BARCODE LEFT -->
    <img
      src="https://barcode.tec-it.com/barcode.ashx?data=${data.ipdNo}&code=Code128&dpi=96"
      alt="barcode"
      style="position:absolute;top:1.5; left:0; width:200px; height:45px; "
    />

    <!-- BILL SUMMARY TEXT -->
    <div style="font-weight:bold; font-size:14px; text-decoration:underline; text-align:center;">
      BILL SUMMARY
    </div>

  </div>
`;

  // --- PATIENT INFO ---
  html += `
    <div class="info-box" >
      <div class="info-row">
        <div class="info-col"><span class="label">COMPANY TPA</span>: <span class="value"><b></b></span></div>
        <div class="info-col"><span class="label"></span><span class="value"></span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">PATIENT NAME</span>: <span class="value"><b>${data.patient.name}</b></span></div>
        <div class="info-col"><span class="label">FINAL BILL NO.</span>: <span class="value">${data.billNo}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">ADDRESS</span>: <span class="value">${data.patient.address}</span></div>
        <div class="info-col"><span class="label">Bill Date</span>: <span class="value">${data.billDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address2}</span></div>
        <div class="info-col"><span class="label">ADMISSION DATE</span>: <span class="value">${data.admissionDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address3}</span></div>
         <div class="info-col"><span class="label">CONTACT NO</span>: <span class="value">${data.patient.contact}</span></div>
      </div>
       
      <div class="info-row">
        <div class="info-col"><span class="label">Age</span>: <span class="value">${data.patient.age}</span></div>
                <div class="info-col"><span class="label">Sex</span>: <span class="value">${data.patient.sex}</span></div>
      </div>
      <div class="info-row">
       
        <div class="info-col"><span class="label">DISCHARGE TYPE</span>: <span class="value">${data.dischargeType}</span></div>
        <div class="info-col"><span class="label">DISCHARGE DATE</span>: <span class="value">${data.dischargeDate}</span></div>
       
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">IPD NO</span>: <span class="value">${data.ipdNo}</span></div>
          <div class="info-col"><span class="label">UNDER DOCTOR</span>: <span class="value">${data.doctor}</span></div>
      </div>
       <div class="info-row">
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${
          data?.bedCharges?.rows?.length
            ? data.bedCharges.rows[data.bedCharges.rows.length - 1]?.[1] || ""
            : ""
        }</span></div>
        <div class="info-col">
        <div style="border: 1px dotted black; width:100px; height:30px; display: flex; justify-content: center; ">
        <div style=" font-size: 12px; font-weight: 700;">URN NO</div>
        <div></div>
        </div>
        </div>
      </div>
    </div>
  `;

  // --- TABLE BUILDER HELPER ---
  const buildTable = (title, headers, rows, total) => {
    let tHtml = `<div class="section-title">${title}</div>`;
    tHtml += `<table class="data-table"><thead><tr>`;
    headers.forEach((h) => (tHtml += `<th>${h}</th>`));
    tHtml += `</tr></thead><tbody>`;

    rows.forEach((row) => {
      tHtml += `<tr class="important-row">`;
      row.forEach((cell, index) => {
        // Align amounts to right (usually the last columns)
        const alignClass = index >= row.length - 2 ? "text-right" : "";
        tHtml += `<td class="${alignClass}" style="font-weight:600">${cell}</td>`;
      });
      tHtml += `</tr>`;
    });

    if (total) {
      tHtml += `<tr><td colspan="${headers.length - 1}" class="text-right"><b>Total:</b></td><td class="text-right"><b>${total}</b></td></tr>`;
    }
    tHtml += `</tbody></table>`;
    return tHtml;
  };

  // --- RENDER SECTIONS ---

  // 1. Bed Charges
  html += buildTable(
    "BED CHARGES",
    ["DATE", "BED NO", "DAY", "BED RATE", "AMOUNT"],
    data.bedCharges.rows,
    data.bedCharges.total,
  );

  // 2. Doctor Visit
  html += buildTable(
    "DOCTOR VISIT",
    ["DATE", "DOCTOR'S VISIT", "QTY", "RATE", "AMOUNT"],
    data.doctorVisits.rows,
    data.doctorVisits.total,
  );

  // 3. Services (Split into general and medicine/investigation if needed, following PDF flow)
  // Page 1 ends roughly here in original, but we flow continuously for web print

  // AMT IN (Critical Care) section from PDF
  if (data.criticalCare && data.criticalCare.rows.length > 0) {
    html += buildTable(
      "AMT. IN (Rs.)",
      ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
      data.criticalCare.rows,
      data.criticalCare.total,
    );
  }

  // this is for ot charges
  console.log("ot charges data is : ", data.otCharges);
  if (Number(data.otCharges.total) > 0) {
    console.log("inside ot charges");
    html += buildTable(
      "O.T. CHARGES",
      ["DATE", "O.T. Bill", "AMOUNT"],
      data.otCharges.rows,
      data.otCharges.total,
    );
  }

  // General Services (Attendant, O2, etc)
  html += buildTable(
    "OTHER SERVICES & PROCEDURES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.services.rows,
    data.services.total,
  );

  // Medicine
  // html += buildTable(
  //   "MEDICINE",
  //   ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
  //   data.medicine.rows,
  //   data.medicine.total,
  // );

  // Investigation
  html += buildTable(
    "INVESTIGATION",
    // ["DATE", "SERVICE (PATHOLOGY & RADIOLOGY)", "QTY", "RATE", "AMOUNT"],
    ["DATE", "Case No", "AMOUNT"],
    data.investigations.rows,
    data.investigations.total,
  );

  // Service Charges
  html += buildTable(
    "SERVICE CHARGES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.serviceCharges.rows,
    data.serviceCharges.total,
  );

  // --- FOOTER / TOTALS ---
  html += `
    <div class="footer-totals">
      <div class="total-row">
        <span class="total-label">Grand Total :</span>
        <span>${data.grandTotal}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Less Advance Paid :</span>
        <span>${data.advancePaid}</span>
      </div>
      <div class="total-row">
        <span class="total-label">INSURANCE APPROVAL AMOUNT:</span>
        <span>${data.insuranceApproval}</span>
      </div>
         <div class="total-row">
        <span class="total-label">Discount:</span>
        <span>${data?.discount || 0}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Due:</span>
        <span>${data?.due || 0}</span>
      </div>
     
    </div>
    <!--
     <div class="signature-section">
        <div>For: <b>LORDS HEALTH CARE</b></div>
        <div style="margin-top: 5px;">E. & O. E.</div>
        <div class="admin-sig">Billed By: ${data.billedBy}</div>
    </div>
    -->
<div style="margin-top:30px; display:flex; align-items:center; gap:100px;">
  <span>For:</span>
  <span style="margin-top:0; margin-left:350px;">E. & O. E.</span>
  <span style="margin-top:0;">Billed By: ${data.billedBy}</span>
</div>


  `;

  html += `</div></body></html>`;

  // Create Window and Print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Allow styles to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    alert("Pop-up blocked. Please allow pop-ups for this website to print.");
  }
};

// this print final bill diagnosis report
export const handlePrint2 = (invoiceData) => {
  // 1. Create a hidden iframe for printing
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // 2. Define Styles (Replicating PDF Layout)
  const styles = `
        <style>
            @media print { @page { margin: 10mm; } }
            body { font-family: 'Arial', sans-serif; font-size: 11pt;  font-weight:700; color: #000; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .hospital-name { font-size: 20pt; font-weight: bold; margin-bottom: 2px; }
            .hospital-info { font-size: 9pt; line-height: 1.3; }

            .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 10pt; }
            .grid-item { display: flex; }
            .label { font-weight: bold; width: 120px; }
            .separator { margin-right: 5px; }

            .title { text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 15px; font-size: 12pt; }

           
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 8px 4px; text-align: left; font-size: 9pt; }
            td { padding: 4px; vertical-align: top; font-size: 11pt;font-weight: bold; }

            .group-header-row td { border-top: 1px dashed #ccc; padding-top: 10px; font-weight: bold; }
           .amount-col {
  text-align: right;
  width: 100px;

}
           .amount-col1 {
  text-align: right;
  width: 100px;
  font-weight: 600;
}

            .rate-col { text-align: right; width: 80px; }

            .footer { margin-top: 30px; font-size: 10pt; }
            .grand-total { text-align: right; font-weight: bold; font-size: 12pt; border-top: 1px solid #000; padding-top: 5px; }
            .footer-bottom { display: flex; justify-content: space-between; margin-top: 50px; font-size: 9pt; }



.header-table { width: 100%; border: none; margin-bottom: 10px; }
.header-table td { border: none; vertical-align: top; }

.company-info { text-align: center; width: 70%; }
.company-name { font-size: 22px; font-weight: 700; color: #000000; margin: 0; }
.company-pvt { font-size: 18px; font-weight: 700;}
.company-address { font-size: 10px; font-weight: 700; }
.company-contact { font-size: 10px; font-weight: bold; }



        </style>
    `;

  // 3. Generate HTML Content
  let tableRows = "";

  let grandTotal = 0;

  // Sort groups by CaseDate ascending
  invoiceData.groups.sort((a, b) => {
    const dA = new Date(a.CaseDate || 0);
    const dB = new Date(b.CaseDate || 0);
    return dA - dB;
  });

  invoiceData.groups.forEach((group) => {
    // Group Header Row (Case Date/No)
    tableRows += `
            <tr class="group-header-row">
                <td>${group.CaseDate?.split("T")[0]?.split("-")?.reverse()?.join("/")}</td>
                <td colspan="3">${group.CaseNo}</td>
                <td class="amount-col"></td>
            </tr>
        `;

    // Test Rows
    group.tests.forEach((test, index) => {
      tableRows += `
                <tr>
                    <td></td>
                    <td><small style="margin-right:3px;">${index + 1}</small>  ${test.TestName} ${test.CancelTast == 1 ? "(cancel)" : ""}</td>
                    <td>${test.DeliveryDate}</td>
                    <td class="rate-col">${test.Rate || 0}</td>
                    <td class="amount-col"></td>
                </tr>
            `;
    });

    // calculate subtotal
    const nonCancelTests = group.tests.filter((item) => item.CancelTast != 1);
    const sum = nonCancelTests.reduce(
      (acc, item) => acc + Number(item.Rate || 0),
      0,
    );

    grandTotal += sum;

    tableRows += `  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="rate-col"></td>
                    <td class="amount-col1">${sum}</td>
                </tr>
            `;
  });

  const htmlContent = `
        <html>
        <head>${styles}</head>
        <body>
          <!-- <div class="header">
    <img src="/assets/lords.png" alt="Hospital Logo" />

    <div>
        <div class="hospital-name">${invoiceData.hospital.name}</div>
        <div class="hospital-info">
            ${invoiceData.hospital.address}<br>
            Phone No.: ${invoiceData.hospital.phone} HELPLINE-${invoiceData.hospital.helpline}<br>
            E-mail: ${invoiceData.hospital.email}, Website: ${invoiceData.hospital.website}
        </div>
    </div>
</div> -->

<table class="header-table">
  <tr>
    <td>
      <img src="/assets/lords.png" style="width:80px;" />
    </td>

    <td class="company-info">
      <h1 class="company-name">LORDS HEALTH CARE (NURSING HOME)</h1>
      <div class="company-pvt">(A UNIT of MJJ Enterprises Pvt. Ltd.)</div>
      <div class="company-address">13/3, Circular 2nd Bye Lane, Kona Expressway,</div>
      <div class="company-address">(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.</div>
      <div class="company-contact">
        E-mail: patientdesk@lordshealthcare.org <br>
        Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
      </div>
    </td>

    <td>
      <img src="/assets/nabh.png" style="width:120px;" />
    </td>
  </tr>
</table>

<hr style="border: 1px solid #000; margin: 8px 0 15px 0;" />

            <div class="patient-grid">
                <div>
                    <div class="grid-item"><span class="label">Patient Name</span><span class="separator">:</span> <span>${invoiceData.patient.name}</span></div>
                    <div class="grid-item"><span class="label">Address</span><span class="separator">:</span> <span>${invoiceData.patient.address}</span></div>
                    <div class="grid-item"><span class="label">Under Dr.</span><span class="separator">:</span> <span>${invoiceData.patient.doctor}</span></div>
                    <div class="grid-item"><span class="label">Final Bill No.</span><span class="separator">:</span> <span>${invoiceData.patient.billNo}</span></div>
                </div>
                <div style="padding-left: 50px;">
                    <div class="grid-item"><span class="label">Age</span><span class="separator">:</span> <span>${invoiceData.patient.age}</span></div>
                    <div class="grid-item"><span class="label">Sex</span><span class="separator">:</span> <span>${invoiceData.patient.sex}</span></div>
                    <div class="grid-item"><span class="label">Adm. Date</span><span class="separator">:</span> <span>${invoiceData.patient.admDate}</span></div>
                    <div class="grid-item"><span class="label">Dis. Date</span><span class="separator">:</span> <span>${invoiceData.patient.disDate}</span></div>
                    <div class="grid-item"><span class="label">Regd. No.</span><span class="separator">:</span> <span>${invoiceData.patient.regdNo}</span></div>
                    <div class="grid-item"><span class="label">Bill Date</span><span class="separator">:</span> <span>${invoiceData.patient.billDate}</span></div>
                </div>
            </div>

            <div class="title">DIAGNOSTIC BREAK-UP (FINAL COPY)</div>

            <table>
                <thead>
                    <tr>
                        <th>Case Date</th>
                        <th>CaseNo / Test</th>
                        <th>Delivery Date</th>
                        <th class="rate-col">Test Rate</th>
                        <th class="amount-col">AMOUNT IN (Rs.)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="grand-total">Grand Total: ${grandTotal}</div>

            <div class="footer-bottom">
                <div>Printed By: ${invoiceData?.printBy || ""}</div>
                <div>E. & O. E.</div>
            </div>
        </body>
        </html>
    `;

  //   // 4. Write to iframe and print
  //   doc.open();
  //   doc.write(htmlContent);
  //   doc.close();

  //   iframe.contentWindow.focus();
  //   setTimeout(() => {
  //     iframe.contentWindow.print();
  //     document.body.removeChild(iframe); // Cleanup
  //   }, 500);

  // Create Window and Print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Allow styles to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    alert("Pop-up blocked. Please allow pop-ups for this website to print.");
  }
};

// this print final bill patient copy (done)
export const handlePrint3 = (data) => {
  data.services.rows = sortRowsByDate(data.services.rows);
  data.doctorVisits.rows = sortRowsByDate(data.doctorVisits.rows);
  data.investigations.rows = sortRowsByDate(data.investigations.rows);
  data.serviceCharges.rows = sortRowsByDate(data.serviceCharges.rows);
  if (data.otCharges?.rows) data.otCharges.rows = sortRowsByDate(data.otCharges.rows);
  let arr = mergeConsecutive(data.bedCharges.rows);
  data.bedCharges.rows = arr;
  // CSS Styles to replicate the PDF look (A4, borders, fonts)
  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
         font-weight:700;
        color: #000;
        line-height: 1.3;
        -webkit-print-color-adjust: exact;
      }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
     
      /* Header Section */
      .header-table { width: 100%; border: none; margin-bottom: 10px; }
      .header-table td { border: none; vertical-align: top; }
      .logo-section { text-align: center; width: 15%; }
      .logo-triangle {
        width: 0; height: 0;
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 50px solid #006400; /* Dark Green */
        margin: 0 auto;
        position: relative;
      }
      .logo-text { font-size: 8px; font-weight: bold; text-align: center; margin-top: 5px; color: #006400; }
     
   .company-info { text-align: center; width: 70%; }
      .company-name { font-size: 22px; font-weight: 700; color: #000000; margin: 0; }
      .company-pvt { font-size: 18px; font-weight: 700; }
      .company-address { font-size: 10px; font-weight: 700; }
      .company-contact { font-size: 10px; font-weight: bold; }
     
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; font-weight: 700; }
     
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;  font-weight:bold; }
      table.data-table th, table.data-table td { border: 1px solid #000; padding: 3px 5px; }
      table.data-table th { background-color: #f0f0f0; text-align: left; font-weight: bold; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
     
      /* Footer Totals */
      .footer-totals { width: 100%; margin-top: 20px; border-top: 1px solid #000; padding-top: 5px; }
      .total-row { display: flex; justify-content: flex-end; font-weight: bold; font-size: 12px; margin-bottom: 5px; }
      .total-label { margin-right: 20px; }
     
      /* Signature */
      .signature-section { margin-top: 40px; text-align: right; font-size: 11px; }
      .admin-sig { margin-top: 30px; }
     
      /* Utilities */
      .page-break { page-break-before: always; }
      .urn-box { position: absolute; top: 10px; right: 10px; border: 1px solid #000; padding: 2px; font-size: 9px; }
    </style>
  `;

  // HTML Construction
  let html = `<html><head><title>Final Bill</title>${styles}</head><body><div class="container">`;

  // --- HEADER ---
  html += `
    <table class="header-table">
      <tr>
        <td >        
          <img src="/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
         <!-- <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div> -->

           <h1 class="company-name">LORDS HEALTH CARE (NURSING HOME)</h1>
          <div class="company-pvt">(A UNIT of MJJ Enterprises Pvt. Ltd.)</div>
          <div class="company-address">13/3, Circular 2nd Bye Lane, Kona Expressway,</div>
          <div class="company-address">(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.</div>
          <div class="company-contact">
E-mail: patientdesk@lordshealthcare.org <br>
Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
          </div>
        </td>
     
     
       <td >        
          <img src="/assets/nabh.png" style="width:120px;" />
        </td>
      </tr>
    </table>
    <!--
   
    <div style="text-align: center; font-weight: bold; margin: 10px 0; font-size: 14px; text-decoration: underline;">BILL SUMMARY</div>
    -->
  `;

  html += `
  <div style="display:flex; align-items:center; justify-content:center; position:relative; margin:10px 0; margin-bottom:10px">

   <!-- BARCODE LEFT -->
    <img
      src="https://barcode.tec-it.com/barcode.ashx?data=${data.ipdNo}&code=Code128&dpi=96"
      alt="barcode"
      style="position:absolute;top:1.5; left:0; width:200px; height:45px; "
    />

    <!-- BILL SUMMARY TEXT -->
    <div style="font-weight:bold; font-size:14px; text-decoration:underline; text-align:center;">
      NET BILL
    </div>

  </div>
`;

  // --- PATIENT INFO ---
  html += `
    <div class="info-box" >
      <div class="info-row">
        <div class="info-col"><span class="label">COMPANY TPA</span>: <span class="value"><b></b></span></div>
        <div class="info-col"><span class="label"></span><span class="value"></span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">PATIENT NAME</span>: <span class="value"><b>${data.patient.name}</b></span></div>
        <div class="info-col"><span class="label">FINAL BILL NO.</span>: <span class="value">${data.billNo}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">ADDRESS</span>: <span class="value">${data.patient.address}</span></div>
        <div class="info-col"><span class="label">Bill Date</span>: <span class="value">${data.billDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address2}</span></div>
        <div class="info-col"><span class="label">ADMISSION DATE</span>: <span class="value">${data.admissionDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address3}</span></div>
         <div class="info-col"><span class="label">CONTACT NO</span>: <span class="value">${data.patient.contact}</span></div>
      </div>
       
      <div class="info-row">
        <div class="info-col"><span class="label">Age</span>: <span class="value">${data.patient.age}</span></div>
                <div class="info-col"><span class="label">Sex</span>: <span class="value">${data.patient.sex}</span></div>
      </div>
      <div class="info-row">
       
        <div class="info-col"><span class="label">DISCHARGE TYPE</span>: <span class="value">${data.dischargeType}</span></div>
        <div class="info-col"><span class="label">DISCHARGE DATE</span>: <span class="value">${data.dischargeDate}</span></div>
       
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">IPD NO</span>: <span class="value">${data.ipdNo}</span></div>
          <div class="info-col"><span class="label">UNDER DOCTOR</span>: <span class="value">${data.doctor}</span></div>
      </div>
       <div class="info-row">
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${
          data?.bedCharges?.rows?.length
            ? data.bedCharges.rows[data.bedCharges.rows.length - 1]?.[1] || ""
            : ""
        }</span></div>
        <div class="info-col">
        <div style="border: 1px dotted black; width:100px; height:30px; display: flex; justify-content: center; ">
        <div style=" font-size: 12px; font-weight: 700;">URN NO</div>
        <div></div>
        </div>
        </div>
      </div>
    </div>
  `;

  // --- TABLE BUILDER HELPER ---
  const buildTable = (title, headers, rows, total) => {
    let tHtml = `<div class="section-title">${title}</div>`;
    tHtml += `<table class="data-table"><thead><tr>`;
    headers.forEach((h) => (tHtml += `<th>${h}</th>`));
    tHtml += `</tr></thead><tbody>`;

    rows.forEach((row) => {
      tHtml += `<tr>`;
      row.forEach((cell, index) => {
        // Align amounts to right (usually the last columns)
        const alignClass = index >= row.length - 2 ? "text-right" : "";
        tHtml += `<td class="${alignClass}">${cell}</td>`;
      });
      tHtml += `</tr>`;
    });

    if (total) {
      tHtml += `<tr><td colspan="${headers.length - 1}" class="text-right"><b>Total:</b></td><td class="text-right"><b>${total}</b></td></tr>`;
    }
    tHtml += `</tbody></table>`;
    return tHtml;
  };

  // --- RENDER SECTIONS ---

  // 1. Bed Charges
  html += buildTable(
    "BED CHARGES",
    ["DATE", "BED NO", "DAY", "BED RATE", "AMOUNT"],
    data.bedCharges.rows,
    data.bedCharges.total,
  );

  // 2. Doctor Visit
  html += buildTable(
    "DOCTOR VISIT",
    ["DATE", "DOCTOR'S VISIT", "QTY", "RATE", "AMOUNT"],
    data.doctorVisits.rows,
    data.doctorVisits.total,
  );

  // 3. Services (Split into general and medicine/investigation if needed, following PDF flow)
  // Page 1 ends roughly here in original, but we flow continuously for web print

  // AMT IN (Critical Care) section from PDF
  if (data.criticalCare && data.criticalCare.rows.length > 0) {
    html += buildTable(
      "AMT. IN (Rs.)",
      ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
      data.criticalCare.rows,
      data.criticalCare.total,
    );
  }

  // this is for ot charges
  console.log("ot charges data is : ", data.otCharges);
  if (Number(data.otCharges.total) > 0) {
    console.log("inside ot charges");
    html += buildTable(
      "O.T. CHARGES",
      ["DATE", "O.T. Bill", "AMOUNT"],
      data.otCharges.rows,
      data.otCharges.total,
    );
  }

  // General Services (Attendant, O2, etc)
  html += buildTable(
    "OTHER SERVICES & PROCEDURES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.services.rows,
    data.services.total,
  );

  // Medicine
  // html += buildTable(
  //   "MEDICINE",
  //   ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
  //   data.medicine.rows,
  //   data.medicine.total,
  // );

  // Investigation
  html += buildTable(
    "INVESTIGATION",
    // ["DATE", "SERVICE (PATHOLOGY & RADIOLOGY)", "QTY", "RATE", "AMOUNT"],
    ["DATE", "Case No", "AMOUNT"],
    data.investigations.rows,
    data.investigations.total,
  );

  // Service Charges
  html += buildTable(
    "SERVICE CHARGES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.serviceCharges.rows,
    data.serviceCharges.total,
  );

  // --- FOOTER / TOTALS ---
  html += `
    <div class="footer-totals">
      <div class="total-row">
        <span class="total-label">Grand Total :</span>
        <span>${data.grandTotal}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Less Advance Paid :</span>
        <span>${data.advancePaid}</span>
      </div>
      <div class="total-row">
        <span class="total-label">INSURANCE APPROVAL AMOUNT:</span>
        <span>${data.insuranceApproval}</span>
      </div>

         <div class="total-row">
        <span class="total-label">Discount:</span>
        <span>${data?.discount || 0}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Due:</span>
        <span>${data?.due || 0}</span>
      </div>
   
    </div>
    <!--
     <div class="signature-section">
        <div>For: <b>LORDS HEALTH CARE</b></div>
        <div style="margin-top: 5px;">E. & O. E.</div>
        <div class="admin-sig">Billed By: ${data.billedBy}</div>
    </div>
    -->
<div style="margin-top:30px; display:flex; align-items:center; gap:100px;">
  <span>For:</span>
  <span style="margin-top:0; margin-left:350px;">E. & O. E.</span>
  <span style="margin-top:0;">Billed By: ${data.billedBy}</span>
</div>


  `;

  html += `</div></body></html>`;

  // Create Window and Print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Allow styles to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    alert("Pop-up blocked. Please allow pop-ups for this website to print.");
  }
};

// this print final bill Indoor Copy (done)
export const handlePrint4 = (data) => {
  data.services.rows = sortRowsByDate(data.services.rows);
  data.doctorVisits.rows = sortRowsByDate(data.doctorVisits.rows);
  data.investigations.rows = sortRowsByDate(data.investigations.rows);
  data.serviceCharges.rows = sortRowsByDate(data.serviceCharges.rows);
  if (data.otCharges?.rows) data.otCharges.rows = sortRowsByDate(data.otCharges.rows);
  let arr = mergeConsecutive(data.bedCharges.rows);
  data.bedCharges.rows = arr;
  // CSS Styles to replicate the PDF look (A4, borders, fonts)
  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        font-weight: bold;
        color: #000;
        line-height: 1.3;
        -webkit-print-color-adjust: exact;
      }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
     
      /* Header Section */
      .header-table { width: 100%; border: none; margin-bottom: 10px; }
      .header-table td { border: none; vertical-align: top; }
      .logo-section { text-align: center; width: 15%; }
      .logo-triangle {
        width: 0; height: 0;
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 50px solid #006400; /* Dark Green */
        margin: 0 auto;
        position: relative;
      }
      .logo-text { font-size: 8px; font-weight: bold; text-align: center; margin-top: 5px; color: #006400; }
     
      .company-info { text-align: center; width: 70%; }
      .company-name { font-size: 22px; font-weight: 700; color: #000000; margin: 0; }
      .company-pvt { font-size: 18px; font-weight: 700; }
      .company-address { font-size: 10px; font-weight: 700;  }
      .company-contact { font-size: 10px; font-weight: bold; }
     
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; font-weight: 700;}
     
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; font-weight: bold; }
      table.data-table th, table.data-table td { border: 1px solid #000; padding: 3px 5px; }
      table.data-table th { background-color: #f0f0f0; text-align: left; font-weight: bold; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
     
      /* Footer Totals */
      .footer-totals { width: 100%; margin-top: 20px; border-top: 1px solid #000; padding-top: 5px; }
      .total-row { display: flex; justify-content: flex-end; font-weight: bold; font-size: 12px; margin-bottom: 5px; }
      .total-label { margin-right: 20px; }
     
      /* Signature */
      .signature-section { margin-top: 40px; text-align: right; font-size: 11px; }
      .admin-sig { margin-top: 30px; }
     
      /* Utilities */
      .page-break { page-break-before: always; }
      .urn-box { position: absolute; top: 10px; right: 10px; border: 1px solid #000; padding: 2px; font-size: 9px; }
    </style>
  `;

  // HTML Construction
  let html = `<html><head><title>Final Bill</title>${styles}</head><body><div class="container">`;

  // --- HEADER ---
  html += `
    <table class="header-table">
      <tr>
        <td >        
          <img src="/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
         <!-- <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div> -->

           <h1 class="company-name">LORDS HEALTH CARE (NURSING HOME)</h1>
          <div class="company-pvt">(A UNIT of MJJ Enterprises Pvt. Ltd.)</div>
          <div class="company-address">13/3, Circular 2nd Bye Lane, Kona Expressway,</div>
          <div class="company-address">(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.</div>
          <div class="company-contact">
E-mail: patientdesk@lordshealthcare.org <br>
Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
          </div>
        </td>
     
     
       <td >        
          <img src="/assets/nabh.png" style="width:120px;" />
        </td>
      </tr>
    </table>
    <!--
   
    <div style="text-align: center; font-weight: bold; margin: 10px 0; font-size: 14px; text-decoration: underline;">BILL SUMMARY</div>
    -->
  `;

  html += `
  <div style="display:flex; align-items:center; justify-content:center; position:relative; margin:10px 0; margin-bottom:10px">

    <!-- BARCODE LEFT -->
    <img
      src="https://barcode.tec-it.com/barcode.ashx?data=${data.ipdNo}&code=Code128&dpi=96"
      alt="barcode"
      style="position:absolute;top:1.5; left:0; width:200px; height:45px; "
    />

    <!-- BILL SUMMARY TEXT -->
    <div style="font-weight:bold; font-size:14px; text-decoration:underline; text-align:center;">
   FINAL BILL (TPA)
    </div>

  </div>
`;

  // --- PATIENT INFO ---
  html += `
    <div class="info-box" >
      <div class="info-row">
        <div class="info-col"><span class="label">COMPANY TPA</span>: <span class="value"><b></b></span></div>
        <div class="info-col"><span class="label"></span><span class="value"></span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">PATIENT NAME</span>: <span class="value"><b>${data.patient.name}</b></span></div>
        <div class="info-col"><span class="label">FINAL BILL NO.</span>: <span class="value">${data.billNo}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">ADDRESS</span>: <span class="value">${data.patient.address}</span></div>
        <div class="info-col"><span class="label">Bill Date</span>: <span class="value">${data.billDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address2}</span></div>
        <div class="info-col"><span class="label">ADMISSION DATE</span>: <span class="value">${data.admissionDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address3}</span></div>
         <div class="info-col"><span class="label">CONTACT NO</span>: <span class="value">${data.patient.contact}</span></div>
      </div>
       
      <div class="info-row">
        <div class="info-col"><span class="label">Age</span>: <span class="value">${data.patient.age}</span></div>
                <div class="info-col"><span class="label">Sex</span>: <span class="value">${data.patient.sex}</span></div>
      </div>
      <div class="info-row">
       
        <div class="info-col"><span class="label">DISCHARGE TYPE</span>: <span class="value">${data.dischargeType}</span></div>
        <div class="info-col"><span class="label">DISCHARGE DATE</span>: <span class="value">${data.dischargeDate}</span></div>
       
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">IPD NO</span>: <span class="value">${data.ipdNo}</span></div>
          <div class="info-col"><span class="label">UNDER DOCTOR</span>: <span class="value">${data.doctor}</span></div>
      </div>
       <div class="info-row">
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${
          data?.bedCharges?.rows?.length
            ? data.bedCharges.rows[data.bedCharges.rows.length - 1]?.[1] || ""
            : ""
        }</span></div>
        <div class="info-col">
        <div style="border: 1px dotted black; width:100px; height:30px; display: flex; justify-content: center; ">
        <div style=" font-size: 12px; font-weight: 700;">URN NO</div>
        <div></div>
        </div>
        </div>
      </div>
    </div>
  `;

  // --- TABLE BUILDER HELPER ---
  const buildTable = (title, headers, rows, total) => {
    let tHtml = `<div class="section-title">${title}</div>`;
    tHtml += `<table class="data-table"><thead><tr>`;
    headers.forEach((h) => (tHtml += `<th>${h}</th>`));
    tHtml += `</tr></thead><tbody>`;

    rows.forEach((row) => {
      tHtml += `<tr>`;
      row.forEach((cell, index) => {
        // Align amounts to right (usually the last columns)
        const alignClass = index >= row.length - 2 ? "text-right" : "";
        tHtml += `<td class="${alignClass}">${cell}</td>`;
      });
      tHtml += `</tr>`;
    });

    if (total) {
      tHtml += `<tr><td colspan="${headers.length - 1}" class="text-right"><b>Total:</b></td><td class="text-right"><b>${total}</b></td></tr>`;
    }
    tHtml += `</tbody></table>`;
    return tHtml;
  };

  // --- RENDER SECTIONS ---

  // 1. Bed Charges
  html += buildTable(
    "BED CHARGES",
    ["DATE", "BED NO", "DAY", "BED RATE", "AMOUNT"],
    data.bedCharges.rows,
    data.bedCharges.total,
  );

  // 2. Doctor Visit
  html += buildTable(
    "DOCTOR VISIT",
    ["DATE", "DOCTOR'S VISIT", "QTY", "RATE", "AMOUNT"],
    data.doctorVisits.rows,
    data.doctorVisits.total,
  );

  // 3. Services (Split into general and medicine/investigation if needed, following PDF flow)
  // Page 1 ends roughly here in original, but we flow continuously for web print

  // AMT IN (Critical Care) section from PDF
  if (data.criticalCare && data.criticalCare.rows.length > 0) {
    html += buildTable(
      "AMT. IN (Rs.)",
      ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
      data.criticalCare.rows,
      data.criticalCare.total,
    );
  }

  // General Services (Attendant, O2, etc)
  html += buildTable(
    "OTHER SERVICES & PROCEDURES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.services.rows,
    data.services.total,
  );

  // Medicine
  // html += buildTable(
  //   "MEDICINE",
  //   ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
  //   data.medicine.rows,
  //   data.medicine.total,
  // );

  // Investigation
  html += buildTable(
    "INVESTIGATION",
    // ["DATE", "SERVICE (PATHOLOGY & RADIOLOGY)", "QTY", "RATE", "AMOUNT"],
    ["DATE", "Case No", "AMOUNT"],
    data.investigations.rows,
    data.investigations.total,
  );

  // Service Charges
  html += buildTable(
    "SERVICE CHARGES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.serviceCharges.rows,
    data.serviceCharges.total,
  );

  // --- FOOTER / TOTALS ---
  html += `
    <div class="footer-totals">
      <div class="total-row">
        <span class="total-label">Grand Total :</span>
        <span>${data.grandTotal}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Less Advance Paid :</span>
        <span>${data.advancePaid}</span>
      </div>
      <div class="total-row">
        <span class="total-label">INSURANCE APPROVAL AMOUNT:</span>
        <span>${data.insuranceApproval}</span>
      </div>

         <div class="total-row">
        <span class="total-label">Discount:</span>
        <span>${data?.discount || 0}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Due:</span>
        <span>${data?.due || 0}</span>
      </div>

   
    </div>
    <!--
     <div class="signature-section">
        <div>For: <b>LORDS HEALTH CARE</b></div>
        <div style="margin-top: 5px;">E. & O. E.</div>
        <div class="admin-sig">Billed By: ${data.billedBy}</div>
    </div>
    -->
<div style="margin-top:30px; display:flex; align-items:center; gap:100px;">
  <span>For:</span>
  <span style="margin-top:0; margin-left:350px;">E. & O. E.</span>
  <span style="margin-top:0;">Billed By: ${data.billedBy}</span>
</div>


  `;

  html += `</div></body></html>`;

  // Create Window and Print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Allow styles to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    alert("Pop-up blocked. Please allow pop-ups for this website to print.");
  }
};

// this is for new bill summary for add form
// this print final bill summary
export const handlePrint5 = (data) => {
  // CSS Styles to replicate the PDF look (A4, borders, fonts)
  console.log("data is : ", data);
  console.log("only bed data is:", data.bedCharges.rows);

  data.services.rows = sortRowsByDate(data.services.rows);
  data.doctorVisits.rows = sortRowsByDate(data.doctorVisits.rows);
  data.investigations.rows = sortRowsByDate(data.investigations.rows);
  data.serviceCharges.rows = sortRowsByDate(data.serviceCharges.rows);
  if (data.otCharges?.rows) data.otCharges.rows = sortRowsByDate(data.otCharges.rows);
  let arr = mergeConsecutive(data.bedCharges.rows);
  data.bedCharges.rows = arr;

  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        color: #000;
        font-weight: bold;
        line-height: 1.3;
        -webkit-print-color-adjust: exact;
      }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
     
      /* Header Section */
      .header-table { width: 100%; border: none; margin-bottom: 10px; }
      .header-table td { border: none; vertical-align: top; }
      .logo-section { text-align: center; width: 15%; }
      .logo-triangle {
        width: 0; height: 0;
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 50px solid #006400; /* Dark Green */
        margin: 0 auto;
        position: relative;
      }
      .logo-text { font-size: 8px; font-weight: bold; text-align: center; margin-top: 5px; color: #006400; }
     
       .company-info { text-align: center; width: 70%; }
      .company-name { font-size: 22px; font-weight: 700; color: #000000; margin: 0; }
      .company-pvt { font-size: 18px; font-weight: 700;  }
      .company-address { font-size: 10px; font-weight: 700;  }
      .company-contact { font-size: 10px; font-weight: bold; }
     
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; font-weight: 700;}
     
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; font-weight: bold; }
      table.data-table th, table.data-table td { border: 1px solid #000; padding: 3px 5px; }
      table.data-table th { background-color: #f0f0f0; text-align: left; font-weight: bold; }
      .text-right { text-align: right; }
      .text-left { text-align: left; }
      .text-center { text-align: center; }
     
      /* Footer Totals */
      .footer-totals { width: 100%; margin-top: 20px; border-top: 1px solid #000; padding-top: 5px; }
      .total-row { display: flex; justify-content: flex-end; font-weight: bold; font-size: 12px; margin-bottom: 5px; }
      .total-label { margin-right: 20px; }
     
      /* Signature */
      .signature-section { margin-top: 40px; text-align: right; font-size: 11px; }
      .admin-sig { margin-top: 30px; }
     
      /* Utilities */
      .page-break { page-break-before: always; }
      .urn-box { position: absolute; top: 10px; right: 10px; border: 1px solid #000; padding: 2px; font-size: 9px; }
    </style>
  `;

  // HTML Construction
  let html = `<html><head><title>Final Bill</title>${styles}</head><body><div class="container">`;
  // --- HEADER ---
  html += `
    <table class="header-table">
      <tr>
        <td >        
          <img src="/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
         <!-- <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div> -->

           <h1 class="company-name">LORDS HEALTH CARE (NURSING HOME)</h1>
          <div class="company-pvt">(A UNIT of MJJ Enterprises Pvt. Ltd.)</div>
          <div class="company-address">13/3, Circular 2nd Bye Lane, Kona Expressway,</div>
          <div class="company-address">(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.</div>
          <div class="company-contact">
E-mail: patientdesk@lordshealthcare.org <br>
Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
          </div>
        </td>
     
     
       <td >        
          <img src="/assets/nabh.png" style="width:120px;" />
        </td>
      </tr>
    </table>
    <!--
   
    <div style="text-align: center; font-weight: bold; margin: 10px 0; font-size: 14px; text-decoration: underline;">BILL SUMMARY</div>
    -->
  `;

  html += `
  <div style="display:flex; align-items:center; justify-content:center; position:relative; margin:10px 0; margin-bottom:10px">

     <!-- BARCODE LEFT -->
    <img
      src="https://barcode.tec-it.com/barcode.ashx?data=${data.ipdNo}&code=Code128&dpi=96"
      alt="barcode"
      style="position:absolute;top:1.5; left:0; width:200px; height:45px; "
    />

    <!-- BILL SUMMARY TEXT -->
    <div style="font-weight:bold; font-size:14px; text-decoration:underline; text-align:center;">
      Estimate
    </div>

  </div>
`;

  // --- PATIENT INFO ---
  html += `
    <div class="info-box" >
      <div class="info-row">
        <div class="info-col"><span class="label">COMPANY TPA</span>: <span class="value"><b></b></span></div>
        <div class="info-col"><span class="label"></span><span class="value"></span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">PATIENT NAME</span>: <span class="value"><b>${data.patient.name}</b></span></div>
        <div class="info-col"><span class="label">FINAL BILL NO.</span>: <span class="value">${data.billNo}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">ADDRESS</span>: <span class="value">${data.patient.address}</span></div>
        <div class="info-col"><span class="label">Bill Date</span>: <span class="value">${data.billDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address2}</span></div>
        <div class="info-col"><span class="label">ADMISSION DATE</span>: <span class="value">${data.admissionDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address3}</span></div>
         <div class="info-col"><span class="label">CONTACT NO</span>: <span class="value">${data.patient.contact}</span></div>
      </div>
       
      <div class="info-row">
        <div class="info-col"><span class="label">Age</span>: <span class="value">${data.patient.age}</span></div>
                <div class="info-col"><span class="label">Sex</span>: <span class="value">${data.patient.sex}</span></div>
      </div>
      <div class="info-row">
       
      <!--  <div class="info-col"><span class="label">DISCHARGE TYPE</span>: <span class="value">${data.dischargeType}</span></div> -->
        <!--
       
        <div class="info-col"><span class="label">DISCHARGE DATE</span>: <span class="value">${data.dischargeDate}</span></div>
        -->
       
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">IPD NO</span>: <span class="value">${data.ipdNo}</span></div>
          <div class="info-col"><span class="label">UNDER DOCTOR</span>: <span class="value">${data.doctor}</span></div>
      </div>
       <div class="info-row">
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${
          data?.bedCharges?.rows?.length
            ? data.bedCharges.rows[data.bedCharges.rows.length - 1]?.[1] || ""
            : ""
        }</span></div>
        <div class="info-col">
        <div style="border: 1px dotted black; width:100px; height:30px; display: flex; justify-content: center; ">
        <div style=" font-size: 12px; font-weight: 700;">URN NO</div>
        <div></div>
        </div>
        </div>
      </div>
    </div>
  `;

  // --- TABLE BUILDER HELPER ---
  const buildTable = (title, headers, rows, total) => {
    let tHtml = `<div class="section-title">${title}</div>`;
    tHtml += `<table class="data-table"><thead><tr>`;

    if (title != "INVESTIGATION") {
      headers.forEach((h) => (tHtml += `<th>${h}</th>`));
    } else {
      tHtml += `<th>DATE</th>
      <th class="text-left">SERVICE (PATHOLOGY & RADIOLOGY)</th>
      <th>AMOUNT)</th>
      `;
    }
    tHtml += `</tr></thead><tbody>`;
    if (title != "INVESTIGATION") {
      rows.forEach((row) => {
        tHtml += `<tr>`;
        row.forEach((cell, index) => {
          // Align amounts to right (usually the last columns)
          const alignClass = index >= row.length - 2 ? "text-right" : "";
          tHtml += `<td class="${alignClass}">${cell}</td>`;
        });
        tHtml += `</tr>`;
      });

      if (total) {
        tHtml += `<tr><td colspan="${headers.length - 1}" class="text-right"><b>Total:</b></td><td class="text-right"><b>${total}</b></td></tr>`;
      }
    } else {
      rows.forEach((row) => {
        tHtml += `<tr>`;
        row.forEach((cell, index) => {
          // Align amounts to right (usually the last columns)
          const alignClass =
            index == row.length - 1 ? "text-right" : "text-left";
          tHtml += `<td class="${alignClass}">${cell}</td>`;
        });
        tHtml += `</tr>`;
      });

      if (total) {
        tHtml += `<tr><td colspan="${headers.length - 1}" class="text-right"><b>Total:</b></td><td class="text-right"><b>${total}</b></td></tr>`;
      }
    }

    tHtml += `</tbody></table>`;
    return tHtml;
  };

  // --- RENDER SECTIONS ---

  // 1. Bed Charges
  html += buildTable(
    "BED CHARGES",
    ["DATE", "BED NO", "DAY", "BED RATE", "AMOUNT"],
    data.bedCharges.rows,
    data.bedCharges.total,
  );

  // 2. Doctor Visit
  html += buildTable(
    "DOCTOR VISIT",
    ["DATE", "DOCTOR'S VISIT", "QTY", "RATE", "AMOUNT"],
    data.doctorVisits.rows,
    data.doctorVisits.total,
  );

  // 3. Services (Split into general and medicine/investigation if needed, following PDF flow)
  // Page 1 ends roughly here in original, but we flow continuously for web print

  // this is for ot charges
  console.log("ot charges data is : ", data.otCharges);
  if (Number(data.otCharges.total) > 0) {
    console.log("inside ot charges");
    html += buildTable(
      "O.T. CHARGES",
      ["DATE", "O.T. Bill", "AMOUNT"],
      data.otCharges.rows,
      data.otCharges.total,
    );
  }
  // AMT IN (Critical Care) section from PDF
  if (data.criticalCare && data.criticalCare.rows.length > 0) {
    html += buildTable(
      "AMT. IN (Rs.)",
      ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
      data.criticalCare.rows,
      data.criticalCare.total,
    );
  }

  // General Services (Attendant, O2, etc)
  html += buildTable(
    "OTHER SERVICES & PROCEDURES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.services.rows,
    data.services.total,
  );

  // Medicine
  // html += buildTable(
  //   "MEDICINE",
  //   ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
  //   data.medicine.rows,
  //   data.medicine.total,
  // );

  // Investigation
  html += buildTable(
    "INVESTIGATION",
    ["DATE", "SERVICE (PATHOLOGY & RADIOLOGY)", "AMOUNT"],
    // ["DATE", "Case No", "AMOUNT"],
    data.investigations.rows,
    data.investigations.total,
  );

  // Service Charges
  html += buildTable(
    "SERVICE CHARGES",
    ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
    data.serviceCharges.rows,
    data.serviceCharges.total,
  );

  // --- FOOTER / TOTALS ---
  html += `
    <div class="footer-totals">
      <div class="total-row">
        <span class="total-label">Grand Total :</span>
        <span>${data.grandTotal}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Less Advance Paid :</span>
        <span>${data.advancePaid}</span>
      </div>
      <div class="total-row">
        <span class="total-label">INSURANCE APPROVAL AMOUNT:</span>
        <span>${data.insuranceApproval}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Discount:</span>
        <span>${data?.discount || 0}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Due:</span>
        <span>${data?.due || 0}</span>
      </div>
      
    </div>
    <!--
     <div class="signature-section">
        <div>For: <b>LORDS HEALTH CARE</b></div>
        <div style="margin-top: 5px;">E. & O. E.</div>
        <div class="admin-sig">Billed By: ${data.billedBy}</div>
    </div>
    -->
<div style="margin-top:30px; display:flex; align-items:center; gap:100px;">
  <span>For:</span>
  <span style="margin-top:0; margin-left:350px;">E. & O. E.</span>
  <span style="margin-top:0;">Billed By: ${data.billedBy}</span>
</div>


  `;

  html += `</div></body></html>`;

  // Create Window and Print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Allow styles to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    alert("Pop-up blocked. Please allow pop-ups for this website to print.");
  }
};

// Date-wise all charges print (sorted small date → big date, with per-date & overall totals)
export const handlePrint7 = (data) => {
  let allRows = [];

  // Bed Charges
  if (data.bedCharges?.rows) {
    data.bedCharges.rows.forEach((row) => {
      allRows.push({ date: row[0], section: "BED CHARGES", desc: row[1], qty: row[2], rate: row[3], amount: Number(row[4]) || 0 });
    });
  }
  // Doctor Visits
  if (data.doctorVisits?.rows) {
    data.doctorVisits.rows.forEach((row) => {
      allRows.push({ date: row[0], section: "DOCTOR VISIT", desc: row[1], qty: row[2], rate: row[3], amount: Number(row[4]) || 0 });
    });
  }
  // OT Charges
  if (data.otCharges?.rows && Number(data.otCharges.total) > 0) {
    data.otCharges.rows.forEach((row) => {
      allRows.push({ date: row[0], section: "O.T. CHARGES", desc: row[1], qty: "1", rate: row[2], amount: Number(row[2]) || 0 });
    });
  }
  // Other Services
  if (data.services?.rows) {
    data.services.rows.forEach((row) => {
      allRows.push({ date: row[0], section: "OTHER CHARGES", desc: row[1], qty: row[2], rate: row[3], amount: Number(row[4]) || 0 });
    });
  }
  // Investigations
  if (data.investigations?.rows) {
    data.investigations.rows.forEach((row) => {
      allRows.push({ date: row[0], section: "INVESTIGATION", desc: row[1], qty: "1", rate: row[2], amount: Number(row[2]) || 0 });
    });
  }
  // Service Charges
  if (data.serviceCharges?.rows) {
    data.serviceCharges.rows.forEach((row) => {
      allRows.push({ date: row[0], section: "SERVICE CHARGES", desc: row[1], qty: row[2], rate: row[3], amount: Number(row[4]) || 0 });
    });
  }

  const parseDate = (d) => {
    return parseDateValue(d);
  };

  allRows.sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const grouped = {};
  allRows.forEach((row) => {
    const key = row.date || "N/A";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  const overallTotal = allRows.reduce((s, r) => s + r.amount, 0);

  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body { font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; color: #000; line-height: 1.3; }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
      .header-table { width: 100%; border: none; margin-bottom: 10px; }
      .header-table td { border: none; vertical-align: top; }
      .company-info { text-align: center; width: 70%; }
      .company-name { font-size: 22px; font-weight: 700; margin: 0; }
      .company-pvt { font-size: 18px; font-weight: 700; }
      .company-address { font-size: 10px; font-weight: 700; }
      .company-contact { font-size: 10px; font-weight: bold; }
      .info-box { margin-top:20px; width: 100%; border: 1px solid #000; padding: 4px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 130px; }
      .value { flex: 1; font-weight: 700; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 10px; font-weight: bold; }
      table.data-table th, table.data-table td { border: 1px solid #000; padding: 3px 5px; }
      table.data-table th { background-color: #f0f0f0; text-align: left; }
      .text-right { text-align: right; }
      .date-header { background: #e0e0e0; font-weight: bold; font-size: 11px; padding: 4px 5px; }
      .date-total { background: #d0d0d0; font-weight: bold; }
      .footer-totals { width: 100%; margin-top: 15px; border-top: 2px solid #000; padding-top: 5px; }
      .total-row { display: flex; justify-content: flex-end; font-weight: bold; font-size: 12px; margin-bottom: 5px; }
      .total-label { margin-right: 20px; }
    </style>
  `;

  let html = `<html><head><title>Date Wise Bill</title>${styles}</head><body><div class="container">`;

  html += `
    <table class="header-table"><tr>
      <td><img src="/assets/lords.png" style="width:80px;" /></td>
      <td class="company-info">
        <h1 class="company-name">LORDS HEALTH CARE (NURSING HOME)</h1>
        <div class="company-pvt">(A UNIT of MJJ Enterprises Pvt. Ltd.)</div>
        <div class="company-address">13/3, Circular 2nd Bye Lane, Kona Expressway,</div>
        <div class="company-address">(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.</div>
        <div class="company-contact">E-mail: patientdesk@lordshealthcare.org<br>Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895</div>
      </td>
      <td><img src="/assets/nabh.png" style="width:120px;" /></td>
    </tr></table>
  `;

  html += `<div style="text-align:center;font-weight:bold;font-size:14px;text-decoration:underline;margin:10px 0;">DATE WISE BILL DETAILS</div>`;

  html += `
    <div class="info-box">
      <div class="info-row"><div class="info-col"><span class="label">PATIENT NAME</span>: <span class="value">${data.patient?.name || ""}</span></div><div class="info-col"><span class="label">BILL NO.</span>: <span class="value">${data.billNo || ""}</span></div></div>
      <div class="info-row"><div class="info-col"><span class="label">IPD NO</span>: <span class="value">${data.ipdNo || ""}</span></div><div class="info-col"><span class="label">Bill Date</span>: <span class="value">${data.billDate || ""}</span></div></div>
      <div class="info-row"><div class="info-col"><span class="label">ADMISSION DATE</span>: <span class="value">${data.admissionDate || ""}</span></div><div class="info-col"><span class="label">DISCHARGE DATE</span>: <span class="value">${data.dischargeDate || ""}</span></div></div>
    </div>
  `;

  html += `<table class="data-table"><thead><tr><th>Section</th><th>Description</th><th>Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead><tbody>`;

  const sortedDates = Object.keys(grouped).sort((a, b) => parseDate(a) - parseDate(b));

  sortedDates.forEach((date) => {
    const rows = grouped[date];
    const dateTotal = rows.reduce((s, r) => s + r.amount, 0);
    html += `<tr><td colspan="5" class="date-header">${date}</td></tr>`;
    rows.forEach((r) => {
      html += `<tr><td>${r.section}</td><td>${r.desc || ""}</td><td>${r.qty || ""}</td><td class="text-right">${r.rate || ""}</td><td class="text-right">${r.amount.toFixed(2)}</td></tr>`;
    });
    html += `<tr class="date-total"><td colspan="4" class="text-right">Date Total:</td><td class="text-right">${dateTotal.toFixed(2)}</td></tr>`;
  });

  html += `</tbody></table>`;

  html += `
    <div class="footer-totals">
      <div class="total-row"><span class="total-label">Grand Total :</span><span>${overallTotal.toFixed(2)}</span></div>
      <div class="total-row"><span class="total-label">Less Advance Paid :</span><span>${data.advancePaid || 0}</span></div>
      <div class="total-row"><span class="total-label">Insurance Approval :</span><span>${data.insuranceApproval || 0}</span></div>
      <div class="total-row"><span class="total-label">Discount :</span><span>${data.discount || 0}</span></div>
      <div class="total-row"><span class="total-label">Due :</span><span>${data.due || 0}</span></div>
    </div>
  `;

  html += `<div style="margin-top:30px;display:flex;align-items:center;gap:100px;"><span>For:</span><span style="margin-left:350px;">E. & O. E.</span><span>Billed By: ${data.billedBy || ""}</span></div>`;

  html += `</div></body></html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  } else {
    alert("Pop-up blocked. Please allow pop-ups for this website to print.");
  }
};

// this is for print ot pdf
export function handleprint6(otObjDetails, otChargeDetails) {
  // --- Helper Functions ---
 
  // Format Date to DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Format Current Date and Time
  const getCurrentDateTime = () => {
    const d = new Date();
    const date = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    return `${date} ${time}`;
  };

  // Convert Number to Words (Rupees format)
  const numberToWords = (num) => {
    const a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    const b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
   
    const convert = (n) => {
      if (n === 0) return 'zero';
      let str = '';
      if ((n = n.toString()).length > 9) return 'overflow';
      const parsed = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!parsed) return;
      str += (parsed[1] != 0) ? (a[Number(parsed[1])] || b[parsed[1][0]] + ' ' + a[parsed[1][1]]) + 'crore ' : '';
      str += (parsed[2] != 0) ? (a[Number(parsed[2])] || b[parsed[2][0]] + ' ' + a[parsed[2][1]]) + 'lakh ' : '';
      str += (parsed[3] != 0) ? (a[Number(parsed[3])] || b[parsed[3][0]] + ' ' + a[parsed[3][1]]) + 'thousand ' : '';
      str += (parsed[4] != 0) ? (a[Number(parsed[4])] || b[parsed[4][0]] + ' ' + a[parsed[4][1]]) + 'hundred ' : '';
      str += (parsed[5] != 0) ? ((str != '') ? '' : '') + (a[Number(parsed[5])] || b[parsed[5][0]] + ' ' + a[parsed[5][1]]) : '';
      return str.trim();
    };

    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);
   
    let words = `Rupees ${convert(wholePart)}`;
    if (decimalPart > 0) {
      words += ` and ${convert(decimalPart)} paise only`;
    } else {
      words += ` and zero paise only`;
    }
   
    // Capitalize first letter to match image exactly
    return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
  };


  // --- Data Processing ---
 
  // Group charges by category
  const groupedCharges = otChargeDetails.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { items: [], total: 0 };
    acc[item.category].items.push(item);
    acc[item.category].total += item.Amount;
    return acc;
  }, {});

  // Calculations
  const baseOtAmount = otObjDetails.OTAmt || 0;
  let itemsTotal = 0;
  for (const cat in groupedCharges) {
    itemsTotal += groupedCharges[cat].total;
  }
 
  const totalOtCharge = baseOtAmount + itemsTotal;
  const totalOtMedicine = otObjDetails.MedicineAmt || 0;
  const netOtBillAmount = totalOtCharge + totalOtMedicine;


  // --- HTML Template Construction ---

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>O.T. Break Up - ${otObjDetails.OtBillNo}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 13px;
          color: #000;
          margin: 0;
          padding: 20px;
        }
        /* Header Styling */
        .header {
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
          margin-bottom: 20px;
        }
        .logo-placeholder {
          position: absolute;
          left: 0;
          top: 0;
          width: 80px;
          height: 60px;
          border: 1px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #888;
        }
        .header h1 {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .header p {
          margin: 3px 0;
          font-size: 12px;
        }
        .doc-title {
          font-weight: bold;
          font-size: 14px;
          margin-top: 10px;
        }
       
        /* Patient Details Box */
        .patient-box {
          border: 1px solid #000;
          padding: 8px 12px;
          margin-bottom: 10px;
          line-height: 1.6;
        }
       
        /* Main Table Layout */
        table {
          width: 100%;
          border-collapse: collapse;
        }
        .border-top { border-top: 1px solid #000; }
        .border-bottom { border-bottom: 1px solid #000; }
       
        th {
          padding: 8px 0;
          font-weight: normal;
        }
        td {
          padding: 4px 0;
          vertical-align: top;
        }
       
        /* Flex rows inside table cells to match layout structure */
        .flex-row {
          display: flex;
          justify-content: space-between;
        }
        .flex-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
       
        .category-name {
          color: #555;
          font-size: 12px;
          margin-top: 15px;
        }
        .item-name {
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
        }
       
        /* Totals Area */
        .totals-table {
          width: 100%;
          margin-top: 20px;
        }
        .totals-table td {
          padding: 6px 0;
        }
        .amount-in-words {
          text-align: right;
          font-size: 13px;
        }
       
        /* Footer */
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
       
        @media print {
          body { -webkit-print-color-adjust: exact; padding: 0; }
        }
      </style>
    </head>
    <body>

      <div class="header">
      <!--  <div class="logo-placeholder">LOGO HERE</div> -->
       <div class="logo-placeholder"> <img src="/assets/lords.png" style="width:80px;" /> </div>
        <div>
          <h1>LORDS HEALTH CARE (NURSING HOME)</h1>
          <p>13/3, Circular 2nd Bye Lane, Kona Expressway,</p>
          <p>(Near Jumanabala Balika Vidyalaya) Shibpur, Howrah - 711 102, W.B.</p>
          <p>Phone No.: 8272904444 HELPLINE - 7003378414</p>
          <p>E-mail:patientdesk@lordshealthcare.org, Website: www.lordshealthcare.org</p>
          <div class="doc-title">O.T. BREAK UP</div>
        </div>
      </div>

      <div class="patient-box">
        <div>Admission No &nbsp;: ${otObjDetails.AdmitionId || ""}</div>
        <div>Patient Name &nbsp;: ${otObjDetails.PatientName || ""}</div>
      </div>

      <table class="border-top border-bottom">
        <thead>
          <tr class="border-bottom">
            <th colspan="3">DESCRIPTION</th>
            <th style="text-align: right; width: 15%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" style="padding-top: 10px;">
              <div class="flex-row">
                <div class="flex-col" style="width: 33.33%;">
                  <div><strong>O.T. Bill No.</strong> &nbsp;: <span style="font-size:12px;">${otObjDetails.OtBillNo || ""}</span></div>
                  <div><strong>O.T. Type</strong> &nbsp;&nbsp;&nbsp;&nbsp;: ${otObjDetails.OTType || ""}</div>
                </div>
                <div class="flex-col" style="width: 33.33%;">
                  <div><strong>O.T. Name</strong> &nbsp;&nbsp;&nbsp;&nbsp;: <span style="font-size:12px;">${otObjDetails.OTname || ""}</span></div>
                </div>
                <div class="flex-col" style="width: 33.33%;">
                  <div><strong>O.T. Slot</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span style="font-size:12px;">${otObjDetails.OTslotName || ""}</span></div>
                  <div><strong>O.T Date</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${formatDate(otObjDetails.BillDate) || ""}</div>
                </div>
              </div>
            </td>
            <td style="text-align: right; padding-top: 32px;">${baseOtAmount.toFixed(2)}</td>
          </tr>

          ${Object.keys(groupedCharges).map(category => `
            <tr>
              <td colspan="4">
                <div class="category-name">${category}</div>
              </td>
            </tr>
            ${groupedCharges[category].items.map(item => `
              <tr>
                <td style="width: 45%;" class="item-name">${item.name}</td>
                <td style="width: 25%; text-align: center;">${item.Qty}${item.Unit.replace('PER HOUR','PER HO')} @ &nbsp;&nbsp;&nbsp;${item.Rate.toFixed(2)}</td>
                <td style="width: 15%; text-align: right;">${item.Amount.toFixed(2)}</td>
                <td style="width: 15%;"></td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3"></td>
              <td style="text-align: right; padding-top: 10px;">${groupedCharges[category].total.toFixed(2)}</td>
            </tr>
          `).join('')}
         
          <tr><td colspan="4" style="height: 20px;"></td></tr>
        </tbody>
      </table>

      <table class="totals-table border-top">
        <tr>
          <td style="text-align: right; width: 85%;">Total OT Charge :</td>
          <td style="text-align: right; width: 15%;">${totalOtCharge.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="text-align: right;">Total OT Medicine :</td>
          <td style="text-align: right;">${totalOtMedicine.toFixed(2)}</td>
        </tr>
        <tr class="border-top border-bottom">
          <td style="text-align: right;">
            <div class="flex-row">
              <span class="amount-in-words">(${numberToWords(netOtBillAmount)})</span>
              <span><strong>NET OT Bill Amount (With OT Medicine):</strong></span>
            </div>
          </td>
          <td style="text-align: right;"><strong>${netOtBillAmount.toFixed(2)}</strong></td>
        </tr>
      </table>

      <div class="footer">
        <div>Print Date & Time : ${getCurrentDateTime()}</div>
        <div style="padding-right: 50px;">For :</div>
      </div>

    </body>
    </html>
  `;

  // --- Print Execution ---
 
  // Open a new window and write the generated HTML into it
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
   
    // Wait for the window to finish loading content before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    console.error("Popup blocked. Please allow popups for this site to print the bill.");
  }
}

