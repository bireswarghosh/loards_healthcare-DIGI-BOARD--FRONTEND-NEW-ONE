import { jsPDF } from 'jspdf';

export const generatePatientHistoryPDF = (data) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const { registration, visits, emr, religion } = data;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LORDS DIAGNOSTIC", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("13/3, CIRCULAR 2ND BYE LANE, KOLKATA", pageWidth / 2, 27, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT HISTORY REPORT", pageWidth / 2, 37, { align: "center" });

  // Patient Information Section
  let yPos = 50;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT INFORMATION", 20, yPos);

  yPos += 10;
  doc.setFontSize(9);
  
  // Row 1
  doc.setFont("helvetica", "bold");
  doc.text("Registration No:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(registration.RegistrationNo || '', 55, yPos);
  
  doc.setFont("helvetica", "bold");
  doc.text("Reg. Date:", 110, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(registration.RegistrationDate).toLocaleDateString('en-GB'), 135, yPos);
  
  doc.setFont("helvetica", "bold");
  doc.text("Time:", 165, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(registration.RegistrationTime || '', 180, yPos);

  // Row 2
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Patient Name:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${registration.PPr || ''} ${registration.PatientName || ''}`, 55, yPos);
  
  doc.setFont("helvetica", "bold");
  doc.text("Age/Sex:", 110, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${registration.Age} ${registration.AgeType} / ${registration.Sex}`, 135, yPos);
  
  doc.setFont("helvetica", "bold");
  doc.text("M.Status:", 165, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(registration.MStatus || '', 180, yPos);

  // Row 3
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Address:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(registration.Add1 || '', 55, yPos);
  
  doc.setFont("helvetica", "bold");
  doc.text("Phone:", 110, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(registration.PhoneNo || '', 135, yPos);
  
  doc.setFont("helvetica", "bold");
  doc.text("Religion:", 165, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(religion?.Religion || '', 180, yPos);

  // Visits
  yPos += 15;
  visits?.forEach((visit, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Visit Header
    doc.setFillColor(230, 240, 255);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`VISIT #${index + 1} - ${visit.VNo || ''}`, 20, yPos);

    yPos += 10;
    doc.setFontSize(9);
    
    // Visit Details
    doc.setFont("helvetica", "bold");
    doc.text("Visit Date:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(visit.PVisitDate).toLocaleDateString('en-GB')} ${visit.vTime}`, 50, yPos);
    
    doc.setFont("helvetica", "bold");
    doc.text("Doctor:", 110, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(visit.DoctorName || '', 135, yPos);

    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Speciality:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(visit.SpecialityName || '', 50, yPos);
    
    doc.setFont("helvetica", "bold");
    doc.text("Visit Type:", 110, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(visit.VisitTypeName || '', 135, yPos);

    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Vitals:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`BP: ${visit.BpMax}/${visit.BpMin} mmHg, Weight: ${visit.Weight} kg`, 50, yPos);

    if (visit.Remarks) {
      yPos += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Remarks:", 20, yPos);
      doc.setFont("helvetica", "normal");
      const remarkLines = doc.splitTextToSize(visit.Remarks, 145);
      doc.text(remarkLines, 50, yPos);
      yPos += remarkLines.length * 5;
    }

    // EMR Data
    const visitEmr = {
      complaints: emr?.complaints?.filter(c => c.VisitId === visit.PVisitId) || [],
      pastHistory: emr?.pastHistory?.filter(p => p.VisitId === visit.PVisitId) || [],
      diagnosis: emr?.diagnosis?.filter(d => d.VisitId === visit.PVisitId) || [],
      investigations: emr?.investigations?.filter(i => i.VisitId === visit.PVisitId) || [],
      medicine: emr?.medicine?.filter(m => m.VisitId === visit.PVisitId) || [],
      adviceMedicine: emr?.adviceMedicine?.filter(a => a.VisitId === visit.PVisitId) || []
    };

    if (visitEmr.complaints.length > 0) {
      yPos += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Chief Complaints:", 20, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      visitEmr.complaints.forEach(c => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(`• ${c.chief}`, 25, yPos);
        yPos += 5;
      });
    }

    if (visitEmr.pastHistory.length > 0) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Past History:", 20, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      visitEmr.pastHistory.forEach(p => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(`• ${p.pasthistory}`, 25, yPos);
        yPos += 5;
      });
    }

    if (visitEmr.diagnosis.length > 0) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Diagnosis:", 20, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      visitEmr.diagnosis.forEach(d => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(`• ${d.diagonisis}`, 25, yPos);
        yPos += 5;
      });
    }

    if (visitEmr.investigations.length > 0) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Investigations:", 20, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      visitEmr.investigations.forEach(i => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(`• ${i.Invest}`, 25, yPos);
        yPos += 5;
      });
    }

    if (visitEmr.medicine.length > 0) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Medicine:", 20, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      visitEmr.medicine.forEach(m => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(`• ${m.Medicine}`, 25, yPos);
        yPos += 5;
      });
    }

    if (visitEmr.adviceMedicine.length > 0) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Prescribed Medicine:", 20, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      visitEmr.adviceMedicine.forEach(a => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(`• ${a.advmed} - ${a.dose} ${a.dunit} for ${a.nodays} days`, 25, yPos);
        yPos += 5;
      });
    }

    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, pageWidth - 20, 287, { align: "right" });
  }

  return doc;
};
