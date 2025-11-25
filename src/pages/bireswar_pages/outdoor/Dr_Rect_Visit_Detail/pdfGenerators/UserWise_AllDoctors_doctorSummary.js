import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateUserWiseAllDoctorsDoctorSummaryPDF = (data, fromDate, toDate) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentPage = 1;
  let totalPages = 1;
  
  const formatValue = (value) => {
    return value === 0 ? '' : value.toFixed(2);
  };
  
  const formatCount = (value) => {
    return value === 0 ? '' : value.toString();
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
    doc.text("DATE WISE DOCTOR WISE VISIT DETAIL (SUMMARY)", pageWidth / 2, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Date : ${fromDate}`, 15, 40);
    doc.text(`To : ${toDate}`, 80, 40);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, 40);
    
    autoTable(doc, {
      head: [['Doctors\' Name', 'No. of Booking', 'Total Amt', 'ServCh', 'Regst Ch', 'Dr. Fees', 'Reporting Amount', 'No of Cancel', 'Cancel Amt.', 'Net Amount']],
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
        0: { cellWidth: 25 },
        1: { cellWidth: 15 },
        2: { cellWidth: 18 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 18 },
        6: { cellWidth: 18 },
        7: { cellWidth: 15 },
        8: { cellWidth: 15 },
        9: { cellWidth: 18 }
      },
      margin: { left: 5, right: 5 }
    });
  };
  
  // Group data by doctor and calculate summary
  const doctorSummary = data.reduce((acc, visit) => {
    const doctorName = visit.DoctorName || 'Unknown Doctor';
    if (!acc[doctorName]) {
      acc[doctorName] = {
        bookingCount: 0,
        totalAmt: 0,
        servCh: 0,
        regstCh: 0,
        drFees: 0,
        reportingAmount: 0,
        cancelCount: 0,
        cancelAmt: 0,
        netAmount: 0
      };
    }
    
    acc[doctorName].bookingCount += 1;
    acc[doctorName].totalAmt += visit.TotAmount || 0;
    acc[doctorName].servCh += visit.ServiceCh || 0;
    acc[doctorName].regstCh += visit.RegCh || 0;
    acc[doctorName].drFees += visit.Rate || 0;
    acc[doctorName].reportingAmount += visit.TotAmount || 0;
    
    if (visit.CancelYN === 'Y') {
      acc[doctorName].cancelCount += 1;
      acc[doctorName].cancelAmt += visit.TotAmount || 0;
    }
    
    acc[doctorName].netAmount = acc[doctorName].totalAmt - acc[doctorName].cancelAmt;
    
    return acc;
  }, {});
  
  let grandTotalBooking = 0;
  let grandTotalAmt = 0;
  let grandTotalServCh = 0;
  let grandTotalRegstCh = 0;
  let grandTotalDrFees = 0;
  let grandTotalReportingAmt = 0;
  let grandTotalCancelCount = 0;
  let grandTotalCancelAmt = 0;
  let grandTotalNetAmt = 0;
  
  addHeader(currentPage);
  let currentY = doc.lastAutoTable.finalY + 5;
  
  const summaryData = Object.entries(doctorSummary).map(([doctorName, summary]) => {
    grandTotalBooking += summary.bookingCount;
    grandTotalAmt += summary.totalAmt;
    grandTotalServCh += summary.servCh;
    grandTotalRegstCh += summary.regstCh;
    grandTotalDrFees += summary.drFees;
    grandTotalReportingAmt += summary.reportingAmount;
    grandTotalCancelCount += summary.cancelCount;
    grandTotalCancelAmt += summary.cancelAmt;
    grandTotalNetAmt += summary.netAmount;
    
    return [
      doctorName,
      formatCount(summary.bookingCount),
      formatValue(summary.totalAmt),
      formatValue(summary.servCh),
      formatValue(summary.regstCh),
      formatValue(summary.drFees),
      formatValue(summary.reportingAmount),
      formatCount(summary.cancelCount),
      formatValue(summary.cancelAmt),
      formatValue(summary.netAmount)
    ];
  });
  
  autoTable(doc, {
    body: summaryData,
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 27, halign: 'left' },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 18 },
      6: { cellWidth: 26 },
      7: { cellWidth: 23 },
      8: { cellWidth: 20 },
      9: { cellWidth: 21 }
    },
    margin: { left: 5, right: 5 }
  });
  
  currentY = doc.lastAutoTable.finalY + 2;
  
  // Grand Total with autoTable
  autoTable(doc, {
    body: [[
      'Grand Total :',
      formatCount(grandTotalBooking),
      formatValue(grandTotalAmt),
      formatValue(grandTotalServCh),
      formatValue(grandTotalRegstCh),
      formatValue(grandTotalDrFees),
      formatValue(grandTotalReportingAmt),
      formatCount(grandTotalCancelCount),
      formatValue(grandTotalCancelAmt),
      formatValue(grandTotalNetAmt)
    ]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1, fontStyle: 'bold', halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.5 },
    columnStyles: {
      0: { cellWidth: 27, halign: 'left' },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 18 },
      6: { cellWidth: 26 },
      7: { cellWidth: 23 },
      8: { cellWidth: 20 },
      9: { cellWidth: 21 }
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