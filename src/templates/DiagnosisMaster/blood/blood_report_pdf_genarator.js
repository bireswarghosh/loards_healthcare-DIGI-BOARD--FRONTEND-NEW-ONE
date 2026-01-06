import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../../axiosInstance";

export const handlePrint = async (data) => {
  const doc = new jsPDF("p", "mm", "a4");
  console.log("get data : ", data);
  const doctorData = await axiosInstance.get(`/doctormaster/${data.DoctorId}`);

  // --- Font & Settings ---
  doc.setFont("times", "normal");
  doc.setFontSize(10);

  const leftMargin = 15;
  const rightColumnX = 130;
  let currentY = 20;

  // --- 1. BARCODE SECTION (Simulated Visual) ---
  doc.setFillColor(230, 230, 230); // Light Gray
  doc.rect(leftMargin, currentY, 50, 12, "F");

  doc.setLineWidth(0.5);
  let barX = leftMargin + 2;
  for (let i = 0; i < 40; i++) {
    let w = Math.random() * 1.5;
    doc.line(barX, currentY + 2, barX, currentY + 9);
    barX += w + 0.5;
  }

  doc.setFontSize(8);
  doc.text(data?.CaseNo || "NA", leftMargin + 2, currentY + 15);

  // --- Move down for Patient Details Section ---
  currentY += 20;
  const leftRowH = 5;
  const rightRowH = 5;
  const labelWidth = 30;

  // --- 2. RIGHT SIDE HEADER (Age, Sex, Dates) ---
  let rightY = currentY;

  // Helper to draw label : value
  const drawPair = (x, y, label, value, labelOffset = 25) => {
    doc.setFont("times", "bold");
    doc.text(label, x, y);
    doc.setFont("times", "normal");
    doc.text(":", x + labelOffset, y);
    doc.text(value, x + labelOffset + 3, y);
  };

  drawPair(rightColumnX, rightY, "Age", `${data?.Age || "75"} Y`, 8);

  drawPair(rightColumnX + 25, rightY, "Sex", data?.Sex || "NA", 8);

  rightY += rightRowH;
  drawPair(
    rightColumnX,
    rightY,
    "Collection Date",
    data.ReportDt?.split("T")[0] || new Date().toLocaleDateString("en-GB")
  );

  rightY += rightRowH;
  drawPair(
    rightColumnX,
    rightY,
    "Reporting Date",
    new Date().toLocaleDateString("en-GB")
  );

  // --- 3. LEFT SIDE HEADER (Patient Details) ---
  const drawLeftPair = (label, value) => {
    doc.setFont("times", "bold");
    doc.text(label, leftMargin, currentY);
    doc.setFont("times", "normal");
    doc.text(":", leftMargin + labelWidth, currentY);
    doc.text(value?.toUpperCase() || "", leftMargin + labelWidth + 3, currentY);
    currentY += leftRowH;
  };

  drawLeftPair("Patient's Name", data?.PatientName || "NA");
  drawLeftPair("Patient's ID", data?.PatientId || "NA");
  drawLeftPair("Ref. By", doctorData.Doctor || "NA");
  drawLeftPair("Dr. Reg. No.", doctorData.RegistrationNo || "NA");

  // --- 4. TITLE SECTION ---

  currentY += 5;
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("HAEMATOLOGICAL EXAMINATION", 105, currentY, { align: "center" });

  // Underline the title
  const titleWidth = doc.getTextWidth("HAEMATOLOGICAL EXAMINATION");
  doc.setLineWidth(0.5);
  doc.line(
    105 - titleWidth / 2,
    currentY + 1,
    105 + titleWidth / 2,
    currentY + 1
  );

  currentY += 10;

  // --- 5. TABLE SECTION ---
  const tableBody = [
    [
      {
        content: `HAEMOGLOBIN\n(Cyanmethemoglobin)`,
        styles: { fontStyle: "bold" },
      },
      {
        content: `${data.Himoglobin1 || ""} gm/dL`,
        styles: { halign: "center", fontStyle: "bold" },
      },
      {
        content: ``,
        styles: { halign: "center", fontStyle: "bold" },
      },
      {
        content: `Males:   12 - 16\nFemales:   11 - 15\nChildren:   14 - 18\nNeonatal     :   16 - 22`,
      },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["INVESTIGATION", "RESULT", " ", "REFERENCE RANGE"]],
    body: tableBody,
    theme: "plain",
    styles: {
      font: "times",
      fontSize: 10,
      cellPadding: 3,
      textColor: [0, 0, 0],
      valign: "top",
    },
    headStyles: {
      fontStyle: "bold",
      fontSize: 10,
      borderBottomWidth: 1,
      borderBottomColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 24 },
      2: {
        cellWidth: "auto",
        cellPadding: { top: 3, right: 3, bottom: 3, left: 30 },
      },
    },
    margin: { left: leftMargin, right: 15 },
  });

  // --- SAVE PDF ---
  // doc.save(`Blood_Report_${caseNO || "Print"}.pdf`);

  /* ====== OPEN AS BLOB ====== */
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);

  window.open(blobUrl, "_blank");

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};
