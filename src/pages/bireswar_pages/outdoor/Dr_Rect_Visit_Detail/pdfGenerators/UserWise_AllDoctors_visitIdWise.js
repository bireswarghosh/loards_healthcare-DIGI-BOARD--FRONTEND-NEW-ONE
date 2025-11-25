import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateUserWiseAllDoctorsVisitIdWisePDF = (data, fromDate, toDate) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentPage = 1;
  let totalPages = 1;
  
  const formatValue = (value) => {
    return value === 0 ? '' : value.toFixed(2);
  };
  
  // Get user name from API response
  const getUserName = (visit) => {
    return visit.UserName || visit.UserId || '';
  };
  
  const addHeader = (pageNum) => {
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
    doc.text("DATE WISE VISIT ID WISE DETAIL", pageWidth / 2, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Date : ${fromDate}`, 15, 40);
    doc.text(`To : ${toDate}`, 80, 40);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, 40);
    
    autoTable(doc, {
      head: [['Visit No', 'Patient Name', 'Doctor Name', 'DoctorCh', 'ScCharge', 'Rate', 'Adv. Amt', 'Discount', 'Amount', 'Entry By']],
      body: [],
      startY: 45,
      theme: 'grid',
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      styles: { fontSize: 7, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 18 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 18 },
        7: { cellWidth: 18 },
        8: { cellWidth: 18 },
        9: { cellWidth: 18 }
      },
      margin: { left: 5, right: 5 }
    });
  };
  
  let grandTotalDoctorCh = 0;
  let grandTotalScCharge = 0;
  let grandTotalRate = 0;
  let grandTotalAdvAmt = 0;
  let grandTotalDiscount = 0;
  let grandTotalAmount = 0;
  
  addHeader(currentPage);
  let currentY = doc.lastAutoTable.finalY + 5;
  
  // Visit Date header
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Visit Date : ${fromDate}`, 10, currentY);
  currentY += 5;
  
  const visitData = data.map(visit => {
    const doctorCh = visit.Rate || 0;
    const scCharge = visit.ServiceCh || 0;
    const rate = doctorCh + scCharge;
    const advAmt = visit.AdvAmt || 0;
    const discount = visit.Discount || 0;
    const amount = visit.TotAmount || 0;
    
    grandTotalDoctorCh += doctorCh;
    grandTotalScCharge += scCharge;
    grandTotalRate += rate;
    grandTotalAdvAmt += advAmt;
    grandTotalDiscount += discount;
    grandTotalAmount += amount;
    
    return [
      visit.VNo || '',
      visit.PatientName || '',
      visit.DoctorName || '',
      formatValue(doctorCh),
      formatValue(scCharge),
      formatValue(rate),
      formatValue(advAmt),
      formatValue(discount),
      formatValue(amount),
      getUserName(visit)
    ];
  });
  
  autoTable(doc, {
    body: visitData,
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 30, halign: 'left' },
      2: { cellWidth: 28, halign: 'left' },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 }
    },
    margin: { left: 5, right: 5 }
  });
  
  currentY = doc.lastAutoTable.finalY + 2;
  
  // Day Total
  autoTable(doc, {
    body: [[
      { content: 'Day Total :', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalDoctorCh), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalScCharge), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalRate), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalAdvAmt), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalDiscount), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalAmount), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.5 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 30 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 }
    },
    margin: { left: 5, right: 5 }
  });
  
  currentY = doc.lastAutoTable.finalY + 2;
  
  // Grand Total
  autoTable(doc, {
    body: [[
      { content: 'Grand Total :', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalDoctorCh), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalScCharge), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalRate), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalAdvAmt), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalDiscount), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: formatValue(grandTotalAmount), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1, lineColor: [255, 0, 0], lineWidth: 1 },
    columnStyles: {
      0: { cellWidth: 18 },
        1: { cellWidth: 30 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 }
    },
    margin: { left: 5, right: 5 }
  });
  
  // Print Date & Time
  const now = new Date();
  const printDate = now.toLocaleDateString('en-GB');
  const printTime = now.toLocaleTimeString('en-GB', { hour12: false });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Print Date & Time : ${printDate} ${printTime}`, 10, pageHeight - 10);
  
  // Update page numbers
  totalPages = currentPage;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, 40);
  }
  
  return doc;
};