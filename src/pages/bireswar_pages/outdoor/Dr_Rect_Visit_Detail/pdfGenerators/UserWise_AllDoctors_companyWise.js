import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateUserWiseAllDoctorsCompanyWisePDF = (data, fromDate, toDate) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentPage = 1;
  let totalPages = 1;
  
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
    doc.text("DATE WISE COMPANY WISE DETAIL", pageWidth / 2, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Date : ${fromDate}`, 15, 40);
    doc.text(`To : ${toDate}`, 80, 40);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, 40);
    
    autoTable(doc, {
      head: [['Visit No', 'Patient Name', 'Doctor Name', 'Company', 'DoctorCh', 'Amount', 'Entry By']],
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
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 }
      },
      margin: { left: 5, right: 5 }
    });
  };
  
  // Group data by company
  const groupedByCompany = data.reduce((acc, visit) => {
    const companyName = visit.CompanyName || 'CASH';
    if (!acc[companyName]) {
      acc[companyName] = [];
    }
    acc[companyName].push(visit);
    return acc;
  }, {});
  
  let grandTotalDoctorCh = 0;
  let grandTotalAmount = 0;
  
  addHeader(currentPage);
  let currentY = doc.lastAutoTable.finalY + 5;
  
  // Visit Date header
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Visit Date : ${fromDate}`, 10, currentY);
  currentY += 5;
  
  Object.entries(groupedByCompany).forEach(([companyName, visits]) => {
    // Company header
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Company : ${companyName}`, 10, currentY);
    currentY += 5;
    
    const companyData = visits.map(visit => {
      const doctorCh = visit.Rate || 0;
      const amount = visit.TotAmount || 0;
      
      grandTotalDoctorCh += doctorCh;
      grandTotalAmount += amount;
      
      return [
        visit.VNo || '',
        visit.PatientName || '',
        visit.DoctorName || '',
        companyName,
        doctorCh.toFixed(2),
        amount.toFixed(2),
        getUserName(visit)
      ];
    });
    
    autoTable(doc, {
      body: companyData,
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40, halign: 'left' },
        2: { cellWidth: 35, halign: 'left' },
        3: { cellWidth: 30, halign: 'left' },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 }
      },
      margin: { left: 5, right: 5 }
    });
    
    currentY = doc.lastAutoTable.finalY + 2;
    
    const companyTotalDoctorCh = visits.reduce((sum, v) => sum + (v.Rate || 0), 0);
    const companyTotalAmount = visits.reduce((sum, v) => sum + (v.TotAmount || 0), 0);
    
    // Company Total
    autoTable(doc, {
      body: [[
        { content: 'Company Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: companyTotalDoctorCh.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: companyTotalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } },
        ''
      ]],
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.5 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 }
      },
      margin: { left: 5, right: 5 }
    });
    
    currentY = doc.lastAutoTable.finalY + 8;
  });
  
  // Grand Total
  autoTable(doc, {
    body: [[
      { content: 'Grand Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right', fillColor: [255, 255, 255] } },
      { content: grandTotalDoctorCh.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      { content: grandTotalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 255] } },
      ''
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [255, 0, 0], lineWidth: 1 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 25 }
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
  
  return doc;
};