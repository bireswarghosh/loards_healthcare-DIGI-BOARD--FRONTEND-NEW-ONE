import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateOpdReportPDF = (data, activeTab, fromDate, toDate, summary) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // landscape
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');

  let title = 'OPD Visit Entry Report';
  if (activeTab === 'otherCharges') title = 'OPD Other Charges Report';
  if (activeTab === 'tableData') title = 'Patient Registration Report';

  doc.text(title, 14, 12);
  doc.setFontSize(9);
  doc.text(`Date: ${fromDate} to ${toDate} | Records: ${data.length}`, 14, 18);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - 80, 12);

  // Summary line
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  let summaryText = '';
  if (activeTab === 'visit') {
    summaryText = `Total: ₹${summary.totalAmount?.toFixed(0)} | RegCh: ₹${summary.totalRegCh?.toFixed(0)} | ServiceCh: ₹${summary.totalServiceCh?.toFixed(0)} | Disc: ₹${summary.totalDiscount?.toFixed(0)} | Received: ₹${summary.totalRecAmt?.toFixed(0)} | Due: ₹${summary.totalDue?.toFixed(0)}`;
  } else if (activeTab === 'otherCharges') {
    summaryText = `Amount: ₹${summary.totalAmount?.toFixed(0)} | G.Total: ₹${summary.totalGTotal?.toFixed(0)} | Paid: ₹${summary.totalPaid?.toFixed(0)} | Due: ₹${summary.totalDue?.toFixed(0)} | Disc: ₹${summary.totalDisc?.toFixed(0)}`;
  }
  if (summaryText) doc.text(summaryText, 14, 28);

  // Table
  let columns = [];
  let rows = [];

  if (activeTab === 'visit') {
    columns = ['#', 'VisitID', 'RegID', 'Patient', 'Doctor', 'VisitType', 'Date', 'Rate', 'RegCh', 'SrvCh', 'Disc', 'Total', 'Rec', 'Due', 'User'];
    rows = data.map((r, i) => [
      i + 1, r.PVisitId, r.RegistrationId, r.PatientName || '-', r.DoctorName || '-',
      r.VisitTypeName || '-', r.PVisitDate ? new Date(r.PVisitDate).toLocaleDateString('en-IN') : '-',
      r.Rate?.toFixed(0) || '0', r.RegCh?.toFixed(0) || '0', r.ServiceCh?.toFixed(0) || '0',
      r.Discount?.toFixed(0) || '0', r.TotAmount?.toFixed(0) || '0',
      r.RecAmt?.toFixed(0) || '0', r.DueAmt?.toFixed(0) || '0', r.UserName || '-'
    ]);
  } else if (activeTab === 'otherCharges') {
    columns = ['#', 'BillID', 'BillNo', 'RegID', 'Patient', 'Phone', 'Date', 'Amount', 'Disc', 'G.Total', 'Paid', 'Due'];
    rows = data.map((r, i) => [
      i + 1, r.OutBillId, r.OutBillNo || '-', r.RegistrationId, r.PatientName || '-',
      r.PhoneNo || '-', r.OutBillDate ? new Date(r.OutBillDate).toLocaleDateString('en-IN') : '-',
      r.Amount?.toFixed(0) || '0', r.DiscAmt?.toFixed(0) || '0', r.GTotal?.toFixed(0) || '0',
      r.paidamt?.toFixed(0) || '0', r.dueamt?.toFixed(0) || '0'
    ]);
  } else if (activeTab === 'tableData') {
    columns = ['#', 'RegID', 'Patient', 'Phone', 'Age', 'Sex', 'Address', 'RegDate', 'Bills'];
    rows = data.map((r, i) => [
      i + 1, r.RegistrationId, r.PatientName || '-', r.PhoneNo || '-',
      r.Age || '-', r.Sex === 'M' ? 'Male' : r.Sex === 'F' ? 'Female' : r.Sex || '-',
      r.Add1 || '-', r.RegDate ? new Date(r.RegDate).toLocaleDateString('en-IN') : '-',
      r.billCount || 0
    ]);
  }

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 32,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    margin: { left: 8, right: 8 },
  });

  window.open(doc.output('bloburl'), '_blank');
};
