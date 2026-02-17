import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateRegistrationChargePDF = (data, fromDate, toDate) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const getUserName = (visit) => {
    return visit.UserName || visit.UserId || '';
  };
  
  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("LORDS DIAGNOSTIC", pageWidth / 2, 15, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("13/3, CIRCULAR 2ND BYE LANE,", pageWidth / 2, 20, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(11);
  doc.text("DATE WISE REGISTRATION CHARGE REGISTER", pageWidth / 2, 30, { align: "center" });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`Date : ${fromDate} to : ${toDate}`, pageWidth / 2, 40, { align: "center" });
  doc.text(`Page 1 of 1`, pageWidth - 30, 40);
  
  // Table Header
  autoTable(doc, {
    head: [['Registration No', 'Patient Name', 'VisitId', 'Amount', 'Entry By']],
    body: [],
    startY: 45,
    theme: 'grid',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 }
    },
    margin: { left: 10, right: 10 }
  });
  
  let currentY = doc.lastAutoTable.finalY + 5;
  
  // Group by Visit Type and Registration Date
  const groupedData = data.reduce((acc, visit) => {
    const visitType = visit.VisitTypeName || 'UNKNOWN';
    const regDate = visit.RegistrationDate || visit.VDate || fromDate;
    
    if (!acc[visitType]) {
      acc[visitType] = {};
    }
    if (!acc[visitType][regDate]) {
      acc[visitType][regDate] = [];
    }
    acc[visitType][regDate].push(visit);
    return acc;
  }, {});
  
  let grandTotal = 0;
  
  Object.entries(groupedData).forEach(([visitType, dateGroups]) => {
    // Visit Type Header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Visit Type : ${visitType}`, 10, currentY);
    currentY += 5;
    
    Object.entries(dateGroups).forEach(([regDate, visits]) => {
      // Registration Date Header
      doc.setFont("helvetica", "normal");
      doc.text(`Registration Date : ${regDate}`, 10, currentY);
      currentY += 5;
      
      const visitData = visits.map(visit => {
        const regNo = visit.RegistrationNo || visit.RegNo || `S-${visit.VNo}/23-24`;
        const amount = visit.RegCh || 0;
        grandTotal += amount;
        
        return [
          regNo,
          visit.PatientName || '',
          visit.VNo || '',
          amount.toFixed(2),
          getUserName(visit)
        ];
      });
      
      autoTable(doc, {
        body: visitData,
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 60, halign: 'left' },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 }
        },
        margin: { left: 10, right: 10 }
      });
      
      currentY = doc.lastAutoTable.finalY + 2;
      
      // DAYWISE Sub Total
      const dayTotal = visits.reduce((sum, v) => sum + (v.RegCh || 0), 0);
      
      autoTable(doc, {
        body: [[
          { content: 'DAYWISE Sub Total :', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: dayTotal.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
          ''
        ]],
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.5 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 }
        },
        margin: { left: 10, right: 10 }
      });
      
      currentY = doc.lastAutoTable.finalY + 5;
    });
    
    // Visit Type Sub Total
    const visitTypeTotal = Object.values(dateGroups).flat().reduce((sum, v) => sum + (v.RegCh || 0), 0);
    
    autoTable(doc, {
      body: [[
        { content: 'Visit Type Sub Total :', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] } },
        { content: visitTypeTotal.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } },
        ''
      ]],
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.5 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 }
      },
      margin: { left: 10, right: 10 }
    });
    
    currentY = doc.lastAutoTable.finalY + 8;
  });
  
  // Grand Total
  autoTable(doc, {
    body: [[
      { content: 'Grand Total :', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: grandTotal.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, lineColor: [255, 0, 0], lineWidth: 1 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 }
    },
    margin: { left: 10, right: 10 }
  });
  
  // Print Date & Time
  const now = new Date();
  const printDate = now.toLocaleDateString('en-GB');
  const printTime = now.toLocaleTimeString('en-GB', { hour12: false });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Print Date & Time : ${printDate} ${printTime}`, 10, pageHeight - 10);
  
  return doc;
};
