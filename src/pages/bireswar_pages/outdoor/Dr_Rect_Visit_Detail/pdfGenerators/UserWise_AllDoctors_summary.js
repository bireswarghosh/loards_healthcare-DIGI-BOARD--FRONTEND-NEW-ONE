import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateUserWiseAllDoctorsSummaryPDF = (data, fromDate, toDate) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentPage = 1;
  let totalPages = 1;
  
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
    doc.text("DATE WISE DOCTOR WISE VISIT (DOCTORS' DETAIL)", pageWidth / 2, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Date : ${fromDate}`, 15, 40);
    doc.text(`To : ${toDate}`, 80, 40);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, 40);
    
    autoTable(doc, {
      head: [['Visit No', 'Patient Name', 'DoctorCh', 'Dscount', 'Amount', 'Entry By']],
      body: [],
      startY: 45,
      theme: 'grid',
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      },
      margin: { left: 10, right: 10 }
    });
  };
  
  // Group data by doctor
  const groupedByDoctor = data.reduce((acc, visit) => {
    const doctorName = visit.DoctorName || 'Unknown Doctor';
    if (!acc[doctorName]) {
      acc[doctorName] = [];
    }
    acc[doctorName].push(visit);
    return acc;
  }, {});
  
  let grandTotalDoctorCh = 0;
  let grandTotalDiscount = 0;
  let grandTotalAmount = 0;
  
  addHeader(currentPage);
  let currentY = doc.lastAutoTable.finalY + 5;
  
  Object.entries(groupedByDoctor).forEach(([doctorName, visits]) => {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentPage++;
      addHeader(currentPage);
      currentY = doc.lastAutoTable.finalY + 5;
    }
    
    // Visit Date
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Visit Date : ${fromDate}`, 10, currentY);
    currentY += 5;
    
    // Consultant name
    doc.setFont("helvetica", "bold");
    doc.text(`Consultant ${doctorName}`, 10, currentY);
    currentY += 5;
    
    const patientData = visits.map(visit => [
      visit.VNo || '',
      visit.PatientName || '',
      (visit.Rate || 0).toFixed(2),
      (visit.Discount || 0).toFixed(2),
      (visit.TotAmount || 0).toFixed(2),
      getUserName(visit)
    ]);
    
    autoTable(doc, {
      body: patientData,
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50, halign: 'left' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 35 }
      },
      margin: { left: 10, right: 10 }
    });
    
    currentY = doc.lastAutoTable.finalY + 2;
    
    const doctorTotalCh = visits.reduce((sum, v) => sum + (v.Rate || 0), 0);
    const doctorTotalDiscount = visits.reduce((sum, v) => sum + (v.Discount || 0), 0);
    const doctorTotalAmount = visits.reduce((sum, v) => sum + (v.TotAmount || 0), 0);
    
    grandTotalDoctorCh += doctorTotalCh;
    grandTotalDiscount += doctorTotalDiscount;
    grandTotalAmount += doctorTotalAmount;
    
    // Doctor Total with dashed border
    doc.setLineDash([2, 2]);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(10, currentY, pageWidth - 20, 8);
    doc.setLineDash([]);
    
    // Doctor Total values inside dashed box
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text('Doctor Total :', 5, currentY + 5);
    doc.text(doctorTotalCh.toFixed(2), 125, currentY + 5);
    doc.text(doctorTotalDiscount.toFixed(2), 150, currentY + 5);
    doc.text(doctorTotalAmount.toFixed(2), 175, currentY + 5);
    
    currentY += 15;
  });
  
  // Day Total
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    currentY = doc.lastAutoTable.finalY + 5;
  }
  
  // Day Total
  autoTable(doc, {
    body: [[
      { content: 'Day Total :', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: grandTotalDoctorCh.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: grandTotalDiscount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: grandTotalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.5 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 35 }
    },
    margin: { left: 10, right: 10 }
  });
  
  currentY = doc.lastAutoTable.finalY + 2;
  
  // Grand Total
  autoTable(doc, {
    body: [[
      { content: 'Grand Total :', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: grandTotalDoctorCh.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: grandTotalDiscount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: grandTotalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [255, 0, 0], lineWidth: 1 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 35 }
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
  
  // Update page numbers
  // totalPages = currentPage;
  // for (let i = 1; i <= totalPages; i++) {
  //   doc.setPage(i);
  //   doc.setFontSize(9);
  //   doc.setTextColor(0, 0, 0);
  //   doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, 40);
  // }
  
  return doc;
};