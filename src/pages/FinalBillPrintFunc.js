// this print final bill summary
export const handlePrint1 = (data) => {
  // CSS Styles to replicate the PDF look (A4, borders, fonts)
  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
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
      .company-name { font-size: 22px; font-weight: bold; color: #000000; margin: 0; }
      .company-address { font-size: 10px; margin-bottom: 5px; }
      .company-contact { font-size: 10px; font-weight: bold; }
     
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; }
     
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
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
          <img src="/public/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
          <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div>
        </td>
     
     
       <td >        
          <img src="/public/assets/nabh.png" style="width:120px;" />
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
      style="position:absolute; left:0; width:200px; height:50px; "
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
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${data.bedNo}</span></div>
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
       <div class="total-row" style="justify-content: flex-start; margin-top: 10px; font-weight: normal;">
        Non Payble Other Chrg: ${data.nonPayable}
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
            body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 20px; }
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
            td { padding: 4px; vertical-align: top; font-size: 9pt; }


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






.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
  text-align: center;
}


.header img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}








        </style>
    `;


  // 3. Generate HTML Content
  let tableRows = "";


  let grandTotal = 0;


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
                    <td><small style="margin-right:3px;">${index + 1}</small>  ${test.TestName}</td>
                    <td>${test.DeliveryDate}</td>
                    <td class="rate-col">${test.Rate || 0}</td>
                    <td class="amount-col"></td>
                </tr>
            `;
    });


    // calculate subtotal
    const sum = group.tests.reduce(
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
           <div class="header">
    <img src="/assets/lords.png" alt="Hospital Logo" />


    <div>
        <div class="hospital-name">${invoiceData.hospital.name}</div>
        <div class="hospital-info">
            ${invoiceData.hospital.address}<br>
            Phone No.: ${invoiceData.hospital.phone} HELPLINE-${invoiceData.hospital.helpline}<br>
            E-mail: ${invoiceData.hospital.email}, Website: ${invoiceData.hospital.website}
        </div>
    </div>
</div>




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




// this print final bill patient copy
export const handlePrint3 = (data) => {
  // CSS Styles to replicate the PDF look (A4, borders, fonts)
  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
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
      .company-name { font-size: 22px; font-weight: bold; color: #000000; margin: 0; }
      .company-address { font-size: 10px; margin-bottom: 5px; }
      .company-contact { font-size: 10px; font-weight: bold; }
     
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; }
     
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
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
          <img src="/public/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
          <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div>
        </td>
     
     
       <td >        
          <img src="/public/assets/nabh.png" style="width:120px;" />
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
      style="position:absolute; left:0; width:200px; height:50px; "
    />


    <!-- BILL SUMMARY TEXT -->
    <div style="font-weight:bold; font-size:14px; text-decoration:underline; text-align:center;">
      TAX INVOICE - CUM BILL
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
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${data.bedNo}</span></div>
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
       <div class="total-row" style="justify-content: flex-start; margin-top: 10px; font-weight: normal;">
        Non Payble Other Chrg: ${data.nonPayable}
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




// this print final bill Indoor Copy
export const handlePrint4 = (data) => {
  // CSS Styles to replicate the PDF look (A4, borders, fonts)
  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
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
      .company-name { font-size: 22px; font-weight: bold; color: #000000; margin: 0; }
      .company-address { font-size: 10px; margin-bottom: 5px; }
      .company-contact { font-size: 10px; font-weight: bold; }
     
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; }
     
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
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
          <img src="/public/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
          <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div>
        </td>
     
     
       <td >        
          <img src="/public/assets/nabh.png" style="width:120px;" />
        </td>
      </tr>
    </table>
    <!--
   
    <div style="text-align: center; font-weight: bold; margin: 10px 0; font-size: 14px; text-decoration: underline;">FINAL BILL TPA</div>
    -->
  `;


  html += `
  <div style="display:flex; align-items:center; justify-content:center; position:relative; margin:10px 0; margin-bottom:10px">


    <!-- BARCODE LEFT -->
    <img
      src="https://barcode.tec-it.com/barcode.ashx?data=${data.ipdNo}&code=Code128&dpi=96"
      alt="barcode"
      style="position:absolute; left:0; width:200px; height:50px; "
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
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${data.bedNo}</span></div>
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
       <div class="total-row" style="justify-content: flex-start; margin-top: 10px; font-weight: normal;">
        Non Payble Other Chrg: ${data.nonPayable}
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

