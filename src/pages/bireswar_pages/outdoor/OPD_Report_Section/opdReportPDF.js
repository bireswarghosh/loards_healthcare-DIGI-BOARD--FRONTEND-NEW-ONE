import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateOpdReportPDF = (data, activeTab, fromDate, toDate, summary, groupBy = '', subGroupBy = '') => {
  // If grouping is active, generate the special portrait grouped report
  if (groupBy) {
    generateGroupedPortraitPDF(data, fromDate, toDate, groupBy, subGroupBy, activeTab);
    return;
  }

  // Otherwise, fallback to the standard premium landscape layout
  const doc = new jsPDF('l', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // === HEADER ===
  doc.setFillColor(15, 23, 42); // Sophisticated Deep Blue
  doc.rect(0, 0, W, 28, 'F');
  doc.setFillColor(99, 102, 241); // Indigo Accent
  doc.rect(0, 28, W, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LORDS HEALTH CARE', 14, 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('13/3, Circular 2nd Bye Lane, Kona Expressway, Shibpur. Howrah - 711102, W.B.', 14, 18);
  doc.text('Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895', 14, 23);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  let title = 'OPD VISIT ENTRY REPORT';
  if (activeTab === 'otherCharges') title = 'OPD OTHER CHARGES REPORT';
  if (activeTab === 'tableData') title = 'PATIENT REGISTRATION REPORT';
  doc.text(title, W - 14, 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Range: ${formatDate(fromDate)} to ${formatDate(toDate)}`, W - 14, 16, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - 14, 21, { align: 'right' });
  doc.text(`Total Records: ${data.length}`, W - 14, 26, { align: 'right' });

  // === SUMMARY BAR ===
  const barY = 34;
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(10, barY, W - 20, 12, 3, 3, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  if (activeTab === 'visit') {
    const items = [
      `Total: ₹${fmt(summary.totalAmount)}`,
      `RegCh: ₹${fmt(summary.totalRegCh)}`,
      `ServiceCh: ₹${fmt(summary.totalServiceCh)}`,
      `Discount: ₹${fmt(summary.totalDiscount)}`,
      `Received: ₹${fmt(summary.totalRecAmt)}`,
      `Due: ₹${fmt(summary.totalDue)}`,
    ];
    doc.text(items.join('   |   '), 16, barY + 7.5);
  } else if (activeTab === 'otherCharges') {
    const items = [
      `Bills: ${data.length}`,
      `Amount: Rs.${fmt(summary.totalAmount)}`,
      `G.Total: Rs.${fmt(summary.totalGTotal)}`,
      `Paid: Rs.${fmt(summary.totalPaid)}`,
      `Due: Rs.${fmt(summary.totalDue)}`,
      `Discount: Rs.${fmt(summary.totalDisc)}`,
    ];
    doc.text(items.join('   |   '), 16, barY + 7.5);
  } else {
    doc.text(`Total Patients: ${data.length}`, 16, barY + 7.5);
  }

  // === TABLE ===
  if (activeTab === 'otherCharges') {
    const columns = ['#', 'Bill No', 'Reg ID', 'Patient', 'Phone', 'Age/Sex', 'Date', 'Charge Items', 'Amount', 'Disc', 'G.Total', 'Paid', 'Due'];
    const rows = data.map((r, i) => {
      const itemsText = r.items && r.items.length > 0
        ? r.items.map(it => `${it.ChargeName || it.OtherCharge || '-'}${it.Qty > 1 ? ' x' + it.Qty : ''} = Rs.${fmt(it.Amount)}`).join('\n')
        : '-';
      return [
        i + 1,
        r.OutBillNo || '',
        r.RegistrationId || '',
        r.PatientName || '',
        r.PhoneNo || '',
        `${r.Age || '-'}/${r.Sex || '-'}`,
        formatDate(r.OutBillDate),
        itemsText,
        fmt(r.Amount),
        fmt(r.DiscAmt),
        fmt(r.GTotal),
        fmt(r.paidamt),
        fmt(r.dueamt)
      ];
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: barY + 16,
      styles: { fontSize: 7, cellPadding: 2.5, lineColor: [220, 220, 240], lineWidth: 0.1, overflow: 'linebreak' },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 7, halign: 'center' },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 14 },
        2: { cellWidth: 22 },
        3: { cellWidth: 28 },
        4: { cellWidth: 22 },
        5: { cellWidth: 14, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 70 },
        8: { halign: 'right', cellWidth: 16 },
        9: { halign: 'right', cellWidth: 14 },
        10: { halign: 'right', cellWidth: 16, fontStyle: 'bold' },
        11: { halign: 'right', cellWidth: 16 },
        12: { halign: 'right', cellWidth: 14 },
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (d) => drawFooter(doc, W, H, d.pageNumber),
    });

    const finalY = doc.lastAutoTable.finalY + 5;
    if (finalY < H - 30) {
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(10, finalY, W - 20, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`GRAND TOTAL:  Amount: Rs.${fmt(summary.totalAmount)}  |  Discount: Rs.${fmt(summary.totalDisc)}  |  G.Total: Rs.${fmt(summary.totalGTotal)}  |  Paid: Rs.${fmt(summary.totalPaid)}  |  Due: Rs.${fmt(summary.totalDue)}`, 16, finalY + 6.5);
    }
  } else if (activeTab === 'visit') {
    const columns = ['#', 'Reg ID', 'Patient', 'Phone', 'Doctor', 'Visit Type', 'Date', 'Payment', 'Rate', 'RegCh', 'SrvCh', 'Disc', 'Total', 'Rec', 'Due', 'User'];
    const rows = data.map((r, i) => [
      i + 1, r.RegistrationId || '', r.PatientName || '', r.PhoneNo || '',
      r.DoctorName || '', r.VisitTypeName || '', formatDate(r.PVisitDate),
      payLabel(r.PaymentType),
      fmt(r.Rate), fmt(r.RegCh), fmt(r.ServiceCh), fmt(r.Discount),
      fmt(r.TotAmount), fmt(r.RecAmt), fmt(r.DueAmt), r.UserName || ''
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: barY + 16,
      styles: { fontSize: 7, cellPadding: 2.5, lineColor: [220, 220, 240], lineWidth: 0.1 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 7, halign: 'center' },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      columnStyles: { 0: { halign: 'center', cellWidth: 8 } },
      margin: { left: 10, right: 10 },
      didDrawPage: (d) => drawFooter(doc, W, H, d.pageNumber),
    });
  } else {
    const columns = ['#', 'Reg ID', 'Patient', 'Phone', 'Age', 'Sex', 'Address', 'Reg Date', 'Bills'];
    const rows = data.map((r, i) => [
      i + 1, r.RegistrationId || '', r.PatientName || '', r.PhoneNo || '',
      r.Age || '', r.Sex === 'M' ? 'Male' : r.Sex === 'F' ? 'Female' : (r.Sex || ''),
      r.Add1 || '', formatDate(r.RegDate), r.billCount || 0
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: barY + 16,
      styles: { fontSize: 7, cellPadding: 2.5, lineColor: [220, 220, 240], lineWidth: 0.1 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 7, halign: 'center' },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      columnStyles: { 0: { halign: 'center', cellWidth: 8 } },
      margin: { left: 10, right: 10 },
      didDrawPage: (d) => drawFooter(doc, W, H, d.pageNumber),
    });
  }

  window.open(doc.output('bloburl'), '_blank');
};

// ==========================================================================
// GENERATES A GROUPED REPORT (A4 PORTRAIT) MATCHING THE USER'S PRINT LAYOUT
// ==========================================================================
const performGrouping = (list, key) => {
  let groups = {};
  if (key === 'payment') {
    groups = {
      'CASH': list.filter(r => String(r.PaymentType) === '0'),
      'UPI': list.filter(r => String(r.PaymentType) === '3' || String(r.PaymentType) === '1'),
      'BANK': list.filter(r => String(r.PaymentType) === '2' || String(r.PaymentType) === '4'),
      'OTHERS': list.filter(r => !['0', '1', '2', '3', '4'].includes(String(r.PaymentType)))
    };
  } else if (key === 'doctor') {
    const uniqueDocs = [...new Set(list.map(r => r.DoctorName).filter(Boolean))].sort();
    uniqueDocs.forEach(docName => {
      groups[docName.toUpperCase()] = list.filter(r => r.DoctorName === docName);
    });
    if (list.some(r => !r.DoctorName)) {
      groups['NO DOCTOR ASSIGNED'] = list.filter(r => !r.DoctorName);
    }
  } else if (key === 'user') {
    const uniqueUsers = [...new Set(list.map(r => r.UserName).filter(Boolean))].sort();
    uniqueUsers.forEach(userName => {
      groups[`USER: ${userName.toUpperCase()}`] = list.filter(r => r.UserName === userName);
    });
    if (list.some(r => !r.UserName)) {
      groups['NO USER ASSIGNED'] = list.filter(r => !r.UserName);
    }
  } else if (key === 'date') {
    const uniqueDates = [...new Set(list.map(r => r.OutBillDate ? r.OutBillDate.split('T')[0] : (r.PVisitDate ? r.PVisitDate.split('T')[0] : (r.RegDate ? r.RegDate.split('T')[0] : 'NO DATE'))))].sort();
    uniqueDates.forEach(dVal => {
      groups[dVal] = list.filter(r => (r.OutBillDate ? r.OutBillDate.split('T')[0] : (r.PVisitDate ? r.PVisitDate.split('T')[0] : r.RegDate.split('T')[0])) === dVal);
    });
  } else if (key === 'patient') {
    const uniquePatients = [...new Set(list.map(r => r.PatientName).filter(Boolean))].sort();
    uniquePatients.forEach(pName => {
      groups[pName.toUpperCase()] = list.filter(r => r.PatientName === pName);
    });
  } else if (key === 'sex') {
    groups = {
      'MALE': list.filter(r => r.Sex === 'M' || r.Sex?.toLowerCase() === 'male'),
      'FEMALE': list.filter(r => r.Sex === 'F' || r.Sex?.toLowerCase() === 'female'),
      'OTHERS': list.filter(r => !['M', 'F', 'male', 'female'].includes(String(r.Sex)))
    };
  } else if (key === 'address') {
    const uniqueAddrs = [...new Set(list.map(r => r.Add1).filter(Boolean))].sort();
    uniqueAddrs.forEach(addr => {
      groups[addr.toUpperCase()] = list.filter(r => r.Add1 === addr);
    });
    if (list.some(r => !r.Add1)) {
      groups['NO ADDRESS PROVIDED'] = list.filter(r => !r.Add1);
    }
  } else if (key === 'charge') {
    const uniqueCharges = new Set();
    list.forEach(r => {
      (r.items || []).forEach(item => {
        const name = item.ChargeName || item.OtherCharge;
        if (name) uniqueCharges.add(name.trim().toUpperCase());
      });
    });
    const sortedCharges = [...uniqueCharges].sort();
    sortedCharges.forEach(cName => {
      groups[cName] = list.filter(r => 
        (r.items || []).some(item => 
          (item.ChargeName || item.OtherCharge)?.trim().toUpperCase() === cName
        )
      );
    });
  }
  
  // Clean empty groups
  Object.keys(groups).forEach(g => {
    if (groups[g].length === 0 && key !== 'payment' && key !== 'sex') {
      delete groups[g];
    }
  });
  return groups;
};

const generateGroupedPortraitPDF = (data, fromDate, toDate, groupBy, subGroupBy = '', activeTab = 'visit') => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 12;

  // Header Info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Date From: ${formatDate(fromDate)}`, m, 10);
  doc.text(`Date To: ${formatDate(toDate)}`, W / 2 - 20, 10);
  doc.text(`Print Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`, W - m, 10, { align: 'right' });

  doc.setLineWidth(0.3);
  doc.line(m, 12, W - m, 12);

  // Group primary data
  const primaryGroups = performGrouping(data, groupBy);

  let columns = [];
  let getRowData = (r) => [];
  let colStyles = {};

  if (activeTab === 'visit') {
    columns = ['Reg Id', 'Date', 'Patient', 'Paid', 'Trans Num'];
    getRowData = (r) => [
      r.RegistrationId || '-',
      r.PVisitDate ? r.PVisitDate.split('T')[0] : '-',
      r.PatientName || '-',
      Number(r.RecAmt || 0).toFixed(2),
      r.Cheque || '-'
    ];
    colStyles = {
      0: { cellWidth: 35 },
      1: { cellWidth: 28 },
      2: { cellWidth: 65 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 33, halign: 'center' }
    };
  } else if (activeTab === 'otherCharges') {
    columns = ['Bill No', 'Date', 'Patient', 'Paid', 'Due'];
    getRowData = (r) => [
      r.OutBillNo || '-',
      r.OutBillDate ? r.OutBillDate.split('T')[0] : '-',
      r.PatientName || '-',
      Number(r.paidamt || 0).toFixed(2),
      Number(r.dueamt || 0).toFixed(2)
    ];
    colStyles = {
      0: { cellWidth: 35 },
      1: { cellWidth: 28 },
      2: { cellWidth: 65 },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    };
  } else if (activeTab === 'tableData') {
    columns = ['Reg Id', 'Date', 'Patient', 'Gender', 'Phone'];
    getRowData = (r) => [
      r.RegistrationId || '-',
      r.RegDate ? r.RegDate.split('T')[0] : '-',
      r.PatientName || '-',
      r.Sex === 'M' ? 'Male' : r.Sex === 'F' ? 'Female' : (r.Sex || '-'),
      r.PhoneNo || '-'
    ];
    colStyles = {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 65 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 29, halign: 'center' }
    };
  }

  let y = 16;

  if (subGroupBy) {
    // Nested Grouping Rendering in PDF
    Object.entries(primaryGroups).forEach(([primaryName, primaryItems]) => {
      const subGroups = performGrouping(primaryItems, subGroupBy);
      
      if (Object.keys(subGroups).length === 0) return;

      // Check page overflow for Primary Header
      if (y > H - 35) {
        doc.addPage();
        y = 16;
      }

      // Draw Level 1 Primary Banner Header
      doc.setFillColor(180, 185, 200); // Steel Blue-grey
      doc.rect(m, y, W - (m * 2), 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`📁 PRIMARY GROUP: ${primaryName.toUpperCase()}`, m + 2.5, y + 4.5);
      y += 8.5;

      let primaryTotalPaid = 0;

      Object.entries(subGroups).forEach(([secondaryName, items]) => {
        if (items.length === 0) return;

        // Check page overflow for Secondary Header
        if (y > H - 35) {
          doc.addPage();
          y = 16;
        }

        // Draw Level 2 Secondary Banner Header
        doc.setFillColor(235, 235, 235); // Light grey
        doc.rect(m, y, W - (m * 2), 5.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.text(`↳ SUB-GROUP: ${secondaryName} (${items.length} records)`, m + 4, y + 3.8);
        y += 7.5;

        // Rows data
        const rows = items.map(r => getRowData(r));
        const subgroupTotalPaid = items.reduce((s, x) => {
          if (subGroupBy === 'charge') {
            const chargeSum = (x.items || []).reduce((sum, item) => {
              if ((item.ChargeName || item.OtherCharge)?.trim().toUpperCase() === secondaryName.trim().toUpperCase()) {
                return sum + Number(item.Amount || 0);
              }
              return sum;
            }, 0);
            return s + chargeSum;
          }
          if (groupBy === 'charge') {
            const chargeSum = (x.items || []).reduce((sum, item) => {
              if ((item.ChargeName || item.OtherCharge)?.trim().toUpperCase() === primaryName.trim().toUpperCase()) {
                return sum + Number(item.Amount || 0);
              }
              return sum;
            }, 0);
            return s + chargeSum;
          }
          return s + Number(x.RecAmt || x.paidamt || 0);
        }, 0);
        primaryTotalPaid += subgroupTotalPaid;

        // Draw Table
        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: y,
          theme: 'plain',
          styles: { fontSize: 7.5, cellPadding: 2, textColor: [0, 0, 0], fontStyle: 'normal' },
          headStyles: { fontStyle: 'bold', borderBottom: '1px solid black', cellPadding: 2 },
          columnStyles: colStyles,
          margin: { left: m, right: m }
        });

        y = doc.lastAutoTable.finalY + 1.5;

        // Secondary Subtotal Row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('SUB-TOTAL', W - m - 45, y + 2.5, { align: 'right' });
        doc.text(subgroupTotalPaid.toFixed(2), W - m - 33, y + 2.5, { align: 'right' });
        
        y += 6.5;
      });

      // Primary Grand Total Row
      if (y > H - 20) {
        doc.addPage();
        y = 16;
      }
      doc.setLineWidth(0.2);
      doc.line(m, y, W - m, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`TOTAL FOR ${primaryName}`, m + 5, y + 4.5);
      doc.text(primaryTotalPaid.toFixed(2), W - m - 33, y + 4.5, { align: 'right' });
      y += 8.5;
      doc.line(m, y - 2, W - m, y - 2);
      y += 4;
    });

  } else {
    // 1-Level Grouping Rendering in PDF
    Object.entries(primaryGroups).forEach(([groupName, items]) => {
      if (items.length === 0 && groupBy !== 'payment' && groupBy !== 'sex') return;

      if (y > H - 35) {
        doc.addPage();
        y = 16;
      }

      // Draw Group Banner/Header
      doc.setFillColor(230, 230, 230);
      doc.rect(m, y, W - (m * 2), 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      doc.text(groupName, m + 2.5, y + 4.2);
      y += 8;

      const rows = items.map(r => getRowData(r));
      const subtotal = items.reduce((s, x) => {
        if (groupBy === 'charge') {
          const chargeSum = (x.items || []).reduce((sum, item) => {
            if ((item.ChargeName || item.OtherCharge)?.trim().toUpperCase() === groupName.trim().toUpperCase()) {
              return sum + Number(item.Amount || 0);
            }
            return sum;
          }, 0);
          return s + chargeSum;
        }
        return s + Number(x.RecAmt || x.paidamt || 0);
      }, 0);

      // Draw Table
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: y,
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [0, 0, 0], fontStyle: 'normal' },
        headStyles: { fontStyle: 'bold', borderBottom: '1px solid black', cellPadding: 2 },
        columnStyles: colStyles,
        margin: { left: m, right: m }
      });

      y = doc.lastAutoTable.finalY + 1.5;

      // Group Total Row
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TOTAL', W - m - 45, y + 3, { align: 'right' });
      doc.text(subtotal.toFixed(2), W - m - 33, y + 3, { align: 'right' });
      
      y += 8;
    });
  }

  // Calculate final summary box on bottom right
  const grandTotal = data.reduce((s, x) => s + Number(x.RecAmt || x.paidamt || 0), 0);
  const cashCol = data.filter(r => String(r.PaymentType) === '0').reduce((s, x) => s + Number(x.RecAmt || x.paidamt || 0), 0);
  const upiCol = data.filter(r => String(r.PaymentType) === '3' || String(r.PaymentType) === '1').reduce((s, x) => s + Number(x.RecAmt || x.paidamt || 0), 0);
  const bankCol = data.filter(r => String(r.PaymentType) === '2' || String(r.PaymentType) === '4').reduce((s, x) => s + Number(x.RecAmt || x.paidamt || 0), 0);
  const otherCol = grandTotal - (cashCol + upiCol + bankCol);

  if (activeTab === 'visit' || activeTab === 'otherCharges') {
    if (y > H - 55) {
      doc.addPage();
      y = 20;
    } else {
      y = H - 50;
    }

    const boxW = 85;
    const boxH = 34;
    const boxX = W - m - boxW;
    const boxY = y;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0);
    doc.rect(boxX, boxY, boxW, boxH, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    const lbl = (t, val, offset) => {
      doc.setFont('helvetica', t === 'Total:' ? 'bold' : 'normal');
      doc.text(t, boxX + 4, boxY + offset);
      doc.text(val, boxX + boxW - 4, boxY + offset, { align: 'right' });
    };

    lbl('Total:', grandTotal.toFixed(2), 6);
    doc.line(boxX, boxY + 8, boxX + boxW, boxY + 8);
    lbl('Cash:', cashCol.toFixed(2), 13);
    lbl('Bank:', bankCol.toFixed(2), 19);
    lbl('UPI:', upiCol.toFixed(2), 25);
    doc.line(boxX, boxY + 28, boxX + boxW, boxY + 28);
    doc.setFont('helvetica', 'bold');
    lbl('Others:', otherCol.toFixed(2), 32);
  } else {
    // Just Patient Registration count summary
    if (y > H - 25) {
      doc.addPage();
      y = 20;
    } else {
      y = H - 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`GRAND TOTAL PATIENT REGISTRATIONS: ${data.length}`, m + 5, y + 5);
  }

  // Quick generation complete!
  window.open(doc.output('bloburl'), '_blank');
};

function drawFooter(doc, W, H, pageNumber) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, H - 8, W, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('Lords Health Care - OPD Report System', 14, H - 3);
  doc.text(`Page ${pageNumber}`, W - 14, H - 3, { align: 'right' });
}

function fmt(v) { return v != null ? Number(v).toFixed(2) : '0.00'; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-IN') : '-'; }
function payLabel(v) { return { 0: 'Cash', 1: 'Cheque', 2: 'Card', 3: 'UPI', 4: 'Online' }[v] || '-'; }
