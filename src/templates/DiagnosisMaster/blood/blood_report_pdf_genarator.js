import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../../axiosInstance";
import JsBarcode from "jsbarcode";

export const handlePrint = async (data, Remarks) => {
  console.log("Get Data: ", data);
  console.log("Remarks Data: ", Remarks);

  const doc = new jsPDF("p", "mm", "a4");
  const doctorData = await axiosInstance.get(`/doctormaster/${data.DoctorId}`);

  doc.setFont("times", "normal");
  doc.setFontSize(10);

  const leftMargin = 15;
  const rightColumnX = 130;
  let currentY = 15; // Reduced top margin

  currentY += 40;

  // --- 1. BARCODE SECTION ---
  // doc.setFillColor(230, 230, 230);
  // doc.rect(leftMargin, currentY, 50, 10, "F"); // Reduced height

  // doc.setLineWidth(0.5);
  // let barX = leftMargin + 2;
  // for (let i = 0; i < 40; i++) {
  //   let w = Math.random() * 1.5;
  //   doc.line(barX, currentY + 1, barX, currentY + 8);
  //   barX += w + 0.5;
  // }

  // Bar_code

  // --- 1. FUNCTIONAL BARCODE SECTION ---
  const caseNumber = data?.CaseNo || "OP/000/0000"; //

  // Create a hidden canvas to generate the scannable barcode
  const canvas = document.createElement("canvas");

  // You can use JsBarcode directly as it is the engine behind react-barcode

  JsBarcode(canvas, caseNumber, {
    format: "CODE128",
    displayValue: true, // We manually place the text below for better PDF styling
    background: "#e6e6e6", // Matches your doc.setFillColor(230, 230, 230)
    lineColor: "#000000",
    width: 2,
    height: 40,
    margin: 0,
  });

  const barcodeImg = canvas.toDataURL("image/png");

  // Draw the background box
  doc.setFillColor(230, 230, 230);
  doc.rect(leftMargin, currentY, 50, 14, "F");

  // Add the real, scannable barcode image
  // Parameters: image, format, x, y, width, height
  doc.addImage(barcodeImg, "PNG", leftMargin + 2, currentY + 1, 46, 9);

  // Show the Case Number text clearly below the bars
  doc.setFontSize(8);
  doc.setFont("times", "bold");
  // doc.text(caseNumber, leftMargin + 25, currentY + 12.5, { align: "center" });

  currentY += 18; // Move to the next section [cite: 2]

  // doc.setFontSize(8);
  // doc.text(data?.CaseNo || "NA", leftMargin + 2, currentY + 13);

  // --- Move down for Patient Details ---
  // currentY += 16; // Reduced spacing
  const rowH = 4.5; // Reduced line height
  const labelWidth = 30;

  // --- 2. RIGHT SIDE HEADER ---
  let rightY = currentY;
  const drawPair = (x, y, label, value, labelOffset = 25) => {
    doc.setFont("times", "bold");
    doc.text(label, x, y);
    doc.setFont("times", "normal");
    doc.text(":", x + labelOffset, y);
    doc.text(value, x + labelOffset + 2, y);
  };

  drawPair(rightColumnX, rightY, "Age", `${data?.Age || "75"} Y`, 8);
  drawPair(rightColumnX + 25, rightY, "Sex", data?.Sex || "NA", 8);

  rightY += rowH;
  drawPair(
    rightColumnX,
    rightY,
    "Collection Date",
    data.ReportDt?.split("T")[0] || new Date().toLocaleDateString("en-GB")
  );

  rightY += rowH;
  drawPair(
    rightColumnX,
    rightY,
    "Reporting Date",
    new Date().toLocaleDateString("en-GB")
  );

  // --- 3. LEFT SIDE HEADER ---
  const drawLeftPair = (label, value) => {
    doc.setFont("times", "bold");
    doc.text(label, leftMargin, currentY);
    doc.setFont("times", "normal");
    doc.text(":", leftMargin + labelWidth, currentY);
    doc.text(value?.toUpperCase() || "", leftMargin + labelWidth + 2, currentY);
    currentY += rowH;
  };

  drawLeftPair("Patient's Name", data?.PatientName || "NA");
  drawLeftPair("Patient's ID", data?.PatientId || "NA");
  drawLeftPair("Ref. By", doctorData.Doctor || "NA");
  drawLeftPair("Dr. Reg. No.", doctorData.RegistrationNo || "NA");

  // --- 4. TITLE SECTION ---
  currentY += 3; // Reduced spacing
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("HAEMATOLOGICAL EXAMINATION", 105, currentY, { align: "center" });

  const titleWidth = doc.getTextWidth("HAEMATOLOGICAL EXAMINATION");
  doc.setLineWidth(0.3);
  doc.line(
    105 - titleWidth / 2,
    currentY + 1,
    105 + titleWidth / 2,
    currentY + 1
  );

  currentY += 6; // Reduced spacing

  // --- 5. TABLE SECTION ---
  // const tableBody = [
  //   [
  //     {
  //       content: `HAEMOGLOBIN\n(Cyanmethemoglobin)`,
  //       styles: { fontStyle: "bold" },
  //     },
  //     `${data.Himoglobin2 || ""} gm/dL`,
  //     ``,
  //     `Males: 12-16\nFemales: 11-15\nChildren: 14-18\nNeonatal: 16-22`,
  //   ],
  //   [{ content: `TOTAL COUNT(TC)`, styles: { fontStyle: "bold" } }, ``, ``, ""],
  //   [
  //     `Erythrocyte [RBC]:`,
  //     `${data.Erythrocytes || ""} ${data.ErythrocytesUnit || ""}`,
  //     ``,
  //     `4.5 - 5.5`,
  //   ],
  //   [
  //     `Leucocyte [WBC]:`,
  //     `${data.Leucocytes || ""} ${data.LeucocytesUnit || ""}`,
  //     ``,
  //     `4,000 - 10,500 /cumm`,
  //   ],
  //   [
  //     `Nucleate RBC:`,
  //     `${data.NucleatedRBC || ""} ${data.NucleatedRBCUnit || ""}`,
  //     ``,
  //     ``,
  //   ],
  //   [
  //     `Corrected WBC:`,
  //     `${data.CorrectedWBCCount || ""} ${data.CorrectedWBCCountUnit || ""}`,
  //     ``,
  //     `Per cmm`,
  //   ],
  //   [
  //     `Thrombocyte [Platelet]:`,
  //     `${data.PalletsCount || 0} ${data.PalateCountUnit || ""}`,
  //     ``,
  //     `1.5 - 4.0 Lakh/cmm`,
  //   ],
  //   [
  //     {
  //       content: `DIFFERENTIAL LEUCOCYTIC COUNT (DC)`,
  //       styles: { fontStyle: "bold" },
  //     },
  //     ``,
  //     ``,
  //     ``,
  //   ],
  //   [`Neutrophil:`, `${data.Neutrophils || 0} %`, ``, `(40 - 75)`],
  //   [`Lymphocyte:`, `${data.Lymphocytes || 0} %`, ``, `(20 - 40)`],
  //   [`Monocytes:`, `${data.Monocytes || 0} %`, ``, `(2 - 4)`],
  //   [`Eosinophils:`, `${data.Eosinophils || 0} %`, ``, `(2 - 4)`],
  //   [`Basophils:`, `${data.Basophils || 0} %`, ``, `( <1 )`],
  //   [
  //     {
  //       content: `ERYTHROCYTE SEDIMENTATION RATE[ESR]:`,
  //       styles: { fontStyle: "bold" },
  //     },
  //     `${data["1StHrsCount"] || 0} 1ST/hr`,
  //     ``,
  //     `Males: 5-15 mm/hr\nFemales: 5-20 mm/hr`,
  //   ],
  //   [`PCV`, `${data.PCV || 0} ${data.PCVUnit}`, ``, `M: 42-52% | F: 42-52%`], // Inline reference
  //   [`MCV`, `${data.MCV || 0} ${data.MCVUnit}`, ``, `78 - 100 cuμ`],
  //   [`MCH`, `${data.MCH || 0} ${data.MCHUnit}`, ``, `27 - 31 μμgr`],
  //   [`MCHC`, `${data.MCHC || 0} ${data.MCHCUnit}`, ``, `30 - 35%`],
  //   [
  //     { content: `${Remarks || ""}`, styles: { fontStyle: "italic" } },
  //     ``,
  //     ``,
  //     ``,
  //   ],
  //   [`RDW(CV)`, `${data.RDW || 0} ${data.RDWUnit}`, ``, `11 - 15`],
  // ];

  const tableBody = [
    [
      {
        content: `HAEMOGLOBIN\n(Cyanmethemoglobin)`,
        styles: { fontStyle: "bold" },
      },
      `${data.Himoglobin2 || ""} gm/dL`,

      `Males: 12-16\nFemales: 11-15\nChildren: 14-18\nNeonatal: 16-22`,
    ],
    [{ content: `TOTAL COUNT(TC)`, styles: { fontStyle: "bold" } }, ``, ""],
    [
      `Erythrocyte [RBC]:`,
      `${data.Erythrocytes || ""} ${data.ErythrocytesUnit || ""}`,

      `4.5 - 5.5`,
    ],
    [
      `Leucocyte [WBC]:`,
      `${data.Leucocytes || ""} ${data.LeucocytesUnit || ""}`,

      `4,000 - 10,500 /cumm`,
    ],
    [
      `Nucleate RBC:`,
      `${data.NucleatedRBC || ""} ${data.NucleatedRBCUnit || ""}`,

      ``,
    ],
    [
      `Corrected WBC:`,
      `${data.CorrectedWBCCount || ""} ${data.CorrectedWBCCountUnit || ""}`,

      `Per cmm`,
    ],
    [
      `Thrombocyte [Platelet]:`,
      `${data.PalletsCount || 0} ${data.PalateCountUnit || ""}`,

      `1.5 - 4.0 Lakh/cmm`,
    ],
    [
      {
        content: `DIFFERENTIAL LEUCOCYTIC COUNT (DC)`,
        styles: { fontStyle: "bold" },
      },
      ``,

      ``,
    ],
    [`Neutrophil:`, `${data.Neutrophils || 0} %`, `(40 - 75)`],
    [`Lymphocyte:`, `${data.Lymphocytes || 0} %`, `(20 - 40)`],
    [`Monocytes:`, `${data.Monocytes || 0} %`, `(2 - 4)`],
    [`Eosinophils:`, `${data.Eosinophils || 0} %`, `(2 - 4)`],
    [`Basophils:`, `${data.Basophils || 0} %`, `( <1 )`],
    [
      {
        content: `ERYTHROCYTE SEDIMENTATION RATE[ESR]:`,
        styles: { fontStyle: "bold" },
      },
      `${data["1StHrsCount"] || 0} 1ST/hr`,

      `Males: 5-15 mm/hr\nFemales: 5-20 mm/hr`,
    ],
    [`PCV`, `${data.PCV || 0} ${data.PCVUnit}`, `M: 42-52%\nF: 42-52%`], // Inline reference
    [`MCV`, `${data.MCV || 0} ${data.MCVUnit}`, `78 - 100 cu\u00B5`],
    [`MCH`, `${data.MCH || 0} ${data.MCHUnit}`, `27 - 31 \u00B5\u00B5gr`],
    [`MCHC`, `${data.MCHC || 0} ${data.MCHCUnit}`, `30 - 35%`],
    [{ content: `${Remarks || ""}`, styles: { fontStyle: "italic" } }, ``, ``],
    [`RDW(CV)`, `${data.RDW || 0} ${data.RDWUnit}`, `11 - 15`],
  ];

  autoTable(doc, {
    startY: currentY,
    // head: [["INVESTIGATION", "RESULT", " ", "REFERENCE RANGE"]],
    head: [["INVESTIGATION", "RESULT", "REFERENCE RANGE"]],
    body: tableBody,
    theme: "plain",
    styles: {
      font: "times",
      fontSize: 9.5, // Slightly smaller font
      // cellPadding: 1.5, // Reduced padding
      cellPadding: 1.2, // Reduced padding
      textColor: [0, 0, 0],
      // valign: "middle",
    },
    headStyles: {
      fontStyle: "bold",
      borderBottomWidth: 0.5,
    },
    columnStyles: {
      // 0: { cellWidth: 70 },
      0: { cellWidth: 80 },
      // 1: { cellWidth: 30 },
      1: { cellWidth: 40 },
      // 2: { cellWidth: 5 },
      // 3: { cellWidth: 50 },
      2: { cellWidth: 50, halign: "left" },
    },
    margin: { left: leftMargin, right: 15 },
    // rowPageBreak: "avoid", // Prevent rows from breaking across pages
  });

  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, "_blank");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};