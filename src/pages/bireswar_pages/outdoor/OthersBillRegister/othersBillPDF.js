import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateOthersBillPDF = (data, fromDate, toDate, reportType, selectedCharges) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LORDS DIAGNOSTIC', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('13/3, CIRCULAR 2ND BYE LANE,', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('OUTDOOR BILL LEDGER', pageWidth / 2, 32, { align: 'center' });

  // Date and User info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date From    ${fromDate}    Date To    ${toDate}`, 15, 42);
  doc.text(`01/12/2025    8:29:46AM`, pageWidth - 15, 42, { align: 'right' });
  doc.text('USER :    Admin', 15, 48);

  // Group data by registration
  const groupedData = {};
  data.forEach(bill => {
    const regId = bill.RegistrationId || 'Unknown';
    if (!groupedData[regId]) {
      groupedData[regId] = {
        registration: bill,
        bills: []
      };
    }
    groupedData[regId].bills.push(bill);
  });

  let yPos = 55;
  let grandTotal = 0;
  let grandDiscount = 0;
  let grandBillTotal = 0;

  Object.keys(groupedData).forEach(regId => {
    const group = groupedData[regId];
    const reg = group.registration;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Registration header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`SERNO :    ${reg.RegistrationNo || regId}    Total Visits Patient`, 15, yPos);
    doc.text(`Bill NO    Particular    Unit    Rate    paid    Qty    due    Amount`, 15, yPos + 5);
    yPos += 10;

    group.bills.forEach(bill => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'normal');
      const billDate = bill.OutBillDate ? new Date(bill.OutBillDate).toLocaleDateString('en-GB') : '';
      doc.text(`${billDate}  ${bill.OutBillNo || ''}    ${bill.PatientName || ''}    ${bill.OutBillId || ''}    CASH`, 15, yPos);
      yPos += 5;

      let billTotal = 0;
      let billDiscount = 0;

      // Items - handle both old and new data structure
      const items = bill.items || bill.chargeItems || [];
      if (items && items.length > 0) {
        items.forEach(item => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          const rate = item.Rate || item.rate || 0;
          const qty = item.Qty || item.qty || 1;
          const chargeName = item.ChargeName || item.OtherCharge || item.chargeName || '';
          const itemTotal = rate * qty;
          billTotal += itemTotal;

          doc.text(`0.00    ${chargeName}    ${qty}    ${rate.toFixed(2)}    ${qty}    ${rate.toFixed(2)}    ${itemTotal.toFixed(2)}    0.00`, 15, yPos);
          yPos += 5;
        });
      }

      billDiscount = bill.DiscAmt || 0;
      const billGrandTotal = billTotal - billDiscount;

      // Bill totals
      doc.setFont('helvetica', 'bold');
      doc.text(`${billTotal.toFixed(2)}`, 15, yPos);
      doc.text(`0`, 80, yPos);
      doc.text(`TOTAL :`, 120, yPos);
      doc.text(`${billTotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
      yPos += 5;

      doc.text(`Discount :`, 120, yPos);
      doc.text(`${billDiscount.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
      yPos += 5;

      doc.text(`BILL TOTAL :`, 120, yPos);
      doc.text(`${billGrandTotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
      yPos += 8;

      grandTotal += billTotal;
      grandDiscount += billDiscount;
      grandBillTotal += billGrandTotal;
    });

    // Draw separator
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;
  });

  // Grand totals
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total`, 80, yPos);
  doc.text(`${grandTotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 6;

  doc.text(`Total Discount`, 80, yPos);
  doc.text(`${grandDiscount.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 6;

  doc.text(`Grand Total`, 80, yPos);
  doc.text(`${grandBillTotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

  return doc;
};
