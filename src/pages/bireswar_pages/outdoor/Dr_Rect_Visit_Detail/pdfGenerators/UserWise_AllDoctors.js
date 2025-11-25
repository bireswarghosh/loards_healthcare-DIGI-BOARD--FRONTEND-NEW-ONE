import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateUserWiseAllDoctorsPDF = (data, fromDate, toDate) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentPage = 1;
  let totalPages = 1;
  
  // User ID to name mapping
  const getUserName = (userId) => {
    const userMap = {
      '1': 'admin',
      '42': 'SANJAY ST.',
      '39': 'MADHU MISH',
      '43': 'LABONI'
    };
    return userMap[userId] || userId || '';
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
    doc.text("DATE WISE DOCTOR WISE VISIT (ALL_DETAIL)", pageWidth / 2, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Date : ${fromDate}`, 15, 40);
    doc.text(`To : ${toDate}`, 80, 40);
    // doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 40, 40);


  // Update page numbers
  // totalPages = currentPage;
  // for (let i = 1; i <= totalPages; i++) {
  //   doc.setPage(i);
  //   doc.setFontSize(9);
  //   doc.setTextColor(0, 0, 0);
  //   doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, 40);
  // }




    
    autoTable(doc, {
      head: [['Visit No', 'Patient Name', 'Cancel', 'Booking', 'Prof.Chrg', 'Discount', 'Total Amt.', 'recamt', 'Entry By']],
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
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 12 },
        3: { cellWidth: 12 },
        4: { cellWidth: 18 },
        5: { cellWidth: 15 },
        6: { cellWidth: 18 },
        7: { cellWidth: 15 },
        8: { cellWidth: 20 }
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
  
  let totalProfChrg = 0;
  let totalDiscount = 0;
  let totalAmount = 0;
  let totalRecAmt = 0;
  
  addHeader(currentPage);
  let currentY = doc.lastAutoTable.finalY + 5;
  
  Object.entries(groupedByDoctor).forEach(([doctorName, visits]) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentPage++;
      addHeader(currentPage);
      currentY = doc.lastAutoTable.finalY + 5;
    }
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Visit Date : ${fromDate}`, 10, currentY);
    currentY += 5;
    
    doc.setFont("helvetica", "bold");
    doc.text(`Consultant ${doctorName}`, 10, currentY);
    currentY += 5;
    
    doc.text("CASH", 10, currentY);
    currentY += 3;
    
    const patientData = visits.map(visit => [
      visit.VNo || '',
      visit.PatientName || '',
      visit.CancelYN || '',
       visit.BookingYN ||'',
      (visit.Rate || 0).toFixed(2),
      (visit.Discount || 0).toFixed(2),
      (visit.TotAmount || 0).toFixed(2),
      (visit.RecAmt || 0).toFixed(2),
      getUserName(visit.UserId)
    ]);
    
    autoTable(doc, {
      body: patientData,
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 37},
        2: { cellWidth: 16 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 27 },
        7: { cellWidth: 15 },
        8: { cellWidth: 20 }
      },
      margin: { left: 10, right: 10 }
    });
    
    currentY = doc.lastAutoTable.finalY + 2;
    
    const doctorProfChrg = visits.reduce((sum, v) => sum + (v.Rate || 0), 0);
    const doctorDiscount = visits.reduce((sum, v) => sum + (v.Discount || 0), 0);
    const doctorTotalAmt = visits.reduce((sum, v) => sum + (v.TotAmount || 0), 0);
    const doctorRecAmt = visits.reduce((sum, v) => sum + (v.RecAmt || 0), 0);
    
    totalProfChrg += doctorProfChrg;
    totalDiscount += doctorDiscount;
    totalAmount += doctorTotalAmt;
    totalRecAmt += doctorRecAmt;
    
    // Paymode Total
    autoTable(doc, {
      body: [[
        { content: 'Paymode Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: doctorProfChrg.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: doctorDiscount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: doctorTotalAmt.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: doctorRecAmt.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        ''
      ]],
       startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 0.2, lineColor: [255, 0, 0], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 37 },
        2: { cellWidth: 16 },
        3: { cellWidth: 2 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 27 },
        7: { cellWidth: 15 },
        8: { cellWidth: 20 }
      },
      margin: { left: 10, right: 10 }
    });
    
    currentY = doc.lastAutoTable.finalY + 1;
    
    // Doctor Total
    autoTable(doc, {
      body: [[
        { content: 'Doctor Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: doctorProfChrg.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: doctorDiscount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: doctorTotalAmt.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: doctorRecAmt.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
       ''
      ]],
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 0.2, lineColor: [255, 0, 0], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 37 },
        2: { cellWidth: 16 },
        3: { cellWidth: 2 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 27 },
        7: { cellWidth: 15 },
        8: { cellWidth: 20 }
      },
      margin: { left: 10, right: 10 }
    });
    
    currentY = doc.lastAutoTable.finalY + 8;
  });
  
  // Day Total
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    currentY = doc.lastAutoTable.finalY + 5;
  }
  
  autoTable(doc, {
    body: [[
      { content: 'Day Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: totalProfChrg.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: totalDiscount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: totalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: totalRecAmt.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 0.2, lineColor: [255, 0, 0], lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 37 },
      2: { cellWidth: 16 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 27 },
      7: { cellWidth: 15 },
      8: { cellWidth: 20 }
    },
    margin: { left: 10, right: 10 }
  });
  
  currentY = doc.lastAutoTable.finalY + 1;
  
  // Grand Total
  autoTable(doc, {
    body: [[
      { content: 'Grand Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: totalProfChrg.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: totalDiscount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: totalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: totalRecAmt.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 0.2, lineColor: [255, 0, 0], lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 37 },
      2: { cellWidth: 16 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 27 },
      7: { cellWidth: 15 },
      8: { cellWidth: 20 }
    },
    margin: { left: 10, right: 10 }
  });
  
  currentY = doc.lastAutoTable.finalY + 5;
  
  // Payment Summary Box
  const boxStartY = currentY;
  const boxHeight = 25;
  const boxWidth = pageWidth - 20;
  
  // Draw red border box
  doc.setDrawColor(255, 0, 0);
  doc.setLineWidth(0.1);
  doc.rect(10, boxStartY, boxWidth, boxHeight);
  
  // Payment details inside box
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 0, 0);
  doc.text('Total Amount :', 12, boxStartY + 5);
  doc.text('Net Total Amount After cancel:', 12, boxStartY + 10);
  
  doc.setTextColor(0, 0, 0);
  doc.text(totalAmount.toFixed(2), 80, boxStartY + 5);
  doc.text(totalAmount.toFixed(2), 80, boxStartY + 10);
  
  // Payment modes on right side
  doc.setTextColor(255, 0, 0);
  doc.text('BANK', 120, boxStartY + 5);
  doc.text('CARD', 120, boxStartY + 10);
  doc.text('CASH:', 120, boxStartY + 15);
  
  doc.setTextColor(0, 0, 0);
  doc.text('0.00', 150, boxStartY + 5);
  doc.text('0.00', 150, boxStartY + 10);
  doc.text(totalRecAmt.toFixed(2), 150, boxStartY + 15);
  
  // Phone number on far right
  doc.setTextColor(0, 0, 0);
  doc.text('9836490858', pageWidth - 30, boxStartY + 5);
  
  const now = new Date();
  const printDate = now.toLocaleDateString('en-GB');
  const printTime = now.toLocaleTimeString('en-GB', { hour12: false });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Print Date & Time : ${printDate} ${printTime}`, 10, pageHeight - 10);
  

  
  return doc;
};











