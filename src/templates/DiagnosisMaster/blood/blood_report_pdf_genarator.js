// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import axiosInstance from "../../../axiosInstance";
// import JsBarcode from "jsbarcode";

// // Helper: check if a value has meaningful data
// const hasValue = (val) => {
//   if (val === null || val === undefined || val === "") return false;
//   if (typeof val === "number" && val === 0) return false;
//   if (typeof val === "string" && (val.trim() === "" || val.trim() === "0")) return false;
//   return true;
// };

// export const handlePrint = async (data, Remarks) => {
//   console.log("Get Data: ", data);
//   console.log("Remarks Data: ", Remarks);

//   const doc = new jsPDF("p", "mm", "a4");

//   let doctorName = "NA";
//   let doctorRegNo = "NA";
//   try {
//     const doctorData = await axiosInstance.get(`/doctormaster/${data.DoctorId}`);
//     doctorName = doctorData?.data?.data?.Doctor || doctorData?.Doctor || "NA";
//     doctorRegNo = doctorData?.data?.data?.RegistrationNo || doctorData?.RegistrationNo || "NA";
//   } catch (e) {
//     console.log("Error fetching doctor:", e);
//   }

//   doc.setFont("times", "normal");
//   doc.setFontSize(10);

//   const leftMargin = 15;
//   const rightColumnX = 130;
//   let currentY = 15;

//   currentY += 40;

//   // --- 1. BARCODE SECTION ---
//   const caseNumber = data?.CaseNo || "NA";
//   const canvas = document.createElement("canvas");

//   JsBarcode(canvas, caseNumber, {
//     format: "CODE128",
//     displayValue: true,
//     background: "#e6e6e6",
//     lineColor: "#000000",
//     width: 2,
//     height: 40,
//     margin: 0,
//   });

//   const barcodeImg = canvas.toDataURL("image/png");

//   doc.setFillColor(230, 230, 230);
//   doc.rect(leftMargin, currentY, 50, 14, "F");
//   doc.addImage(barcodeImg, "PNG", leftMargin + 2, currentY + 1, 46, 9);

//   currentY += 18;

//   const rowH = 4.5;
//   const labelWidth = 30;

//   // --- 2. RIGHT SIDE HEADER ---
//   let rightY = currentY;
//   const drawPair = (x, y, label, value, labelOffset = 25) => {
//     doc.setFont("times", "bold");
//     doc.text(label, x, y);
//     doc.setFont("times", "normal");
//     doc.text(":", x + labelOffset, y);
//     doc.text(value, x + labelOffset + 2, y);
//   };

//   drawPair(rightColumnX, rightY, "Age", `${data?.Age || ""} Y`, 8);
//   drawPair(rightColumnX + 25, rightY, "Sex", data?.Sex || "NA", 8);

//   rightY += rowH;
//   drawPair(
//     rightColumnX,
//     rightY,
//     "Collection Date",
//     new Date().toLocaleDateString("en-GB")
//   );

//   rightY += rowH;
//   drawPair(
//     rightColumnX,
//     rightY,
//     "Reporting Date",
//     data.ReportDt?.split("T")[0]?.split("-")?.reverse()?.join("/") ||
//       new Date().toLocaleDateString("en-GB")
//   );

//   // --- 3. LEFT SIDE HEADER ---
//   const drawLeftPair = (label, value) => {
//     if (!hasValue(value)) return;
//     doc.setFont("times", "bold");
//     doc.text(label, leftMargin, currentY);
//     doc.setFont("times", "normal");
//     doc.text(":", leftMargin + labelWidth, currentY);
//     doc.text(value?.toUpperCase() || "", leftMargin + labelWidth + 2, currentY);
//     currentY += rowH;
//   };

//   drawLeftPair("Patient's Name", data?.PatientName || "NA");
//   drawLeftPair("Patient's ID", data?.PatientId || "NA");
//   drawLeftPair("Ref. By", doctorName);
//   drawLeftPair("Dr. Reg. No.", doctorRegNo);

//   // --- 4. TITLE SECTION ---
//   currentY += 3;
//   doc.setFont("times", "bold");
//   doc.setFontSize(11);
//   doc.text("HAEMATOLOGICAL EXAMINATION", 105, currentY, { align: "center" });

//   const titleWidth = doc.getTextWidth("HAEMATOLOGICAL EXAMINATION");
//   doc.setLineWidth(0.3);
//   doc.line(
//     105 - titleWidth / 2,
//     currentY + 1,
//     105 + titleWidth / 2,
//     currentY + 1
//   );

//   currentY += 6;

//   // --- 5. BUILD TABLE BODY (only rows with data) ---
//   const tableBody = [];

//   // Haemoglobin
//   if (hasValue(data.Himoglobin2)) {
//     tableBody.push([
//       {
//         content: `HAEMOGLOBIN\n(Cyanmethemoglobin)`,
//         styles: { fontStyle: "bold" },
//       },
//       `${data.Himoglobin2} gm/dL`,
//       `Males: 12-16\nFemales: 11-15\nChildren: 14-18\nNeonatal: 16-22`,
//     ]);
//   }

//   // Total Count header - only show if any of the sub-fields have data
//   const hasTCData =
//     hasValue(data.Erythrocytes) ||
//     hasValue(data.Leucocytes) ||
//     hasValue(data.NucleatedRBC) ||
//     hasValue(data.CorrectedWBCCount) ||
//     hasValue(data.PalletsCount);

//   if (hasTCData) {
//     tableBody.push([
//       { content: `TOTAL COUNT(TC)`, styles: { fontStyle: "bold" } },
//       ``,
//       ``,
//     ]);
//   }

//   if (hasValue(data.Erythrocytes)) {
//     tableBody.push([
//       `Erythrocyte [RBC]:`,
//       `${data.Erythrocytes} ${data.ErythrocytesUnit || ""}`,
//       `4.5 - 5.5`,
//     ]);
//   }

//   if (hasValue(data.Leucocytes)) {
//     tableBody.push([
//       `Leucocyte [WBC]:`,
//       `${data.Leucocytes} ${data.LeucocytesUnit || ""}`,
//       `4,000 - 10,500 /cumm`,
//     ]);
//   }

//   if (hasValue(data.NucleatedRBC)) {
//     tableBody.push([
//       `Nucleate RBC:`,
//       `${data.NucleatedRBC} ${data.NucleatedRBCUnit || ""}`,
//       ``,
//     ]);
//   }

//   if (hasValue(data.CorrectedWBCCount)) {
//     tableBody.push([
//       `Corrected WBC:`,
//       `${data.CorrectedWBCCount} ${data.CorrectedWBCCountUnit || ""}`,
//       `Per cmm`,
//     ]);
//   }

//   if (hasValue(data.PalletsCount)) {
//     tableBody.push([
//       `Thrombocyte [Platelet]:`,
//       `${data.PalletsCount} ${data.PalateCountUnit || ""}`,
//       `1.5 - 4.0 Lakh/cmm`,
//     ]);
//   }

//   // Differential Count - only show header if any DC field has data
//   const hasDCData =
//     hasValue(data.Neutrophils) ||
//     hasValue(data.Lymphocytes) ||
//     hasValue(data.Monocytes) ||
//     hasValue(data.Eosinophils) ||
//     hasValue(data.Basophils);

//   if (hasDCData) {
//     tableBody.push([
//       {
//         content: `DIFFERENTIAL LEUCOCYTIC COUNT (DC)`,
//         styles: { fontStyle: "bold" },
//       },
//       ``,
//       ``,
//     ]);
//   }

//   if (hasValue(data.Neutrophils)) {
//     tableBody.push([`Neutrophil:`, `${data.Neutrophils} %`, `(40 - 75)`]);
//   }
//   if (hasValue(data.Lymphocytes)) {
//     tableBody.push([`Lymphocyte:`, `${data.Lymphocytes} %`, `(20 - 40)`]);
//   }
//   if (hasValue(data.Monocytes)) {
//     tableBody.push([`Monocytes:`, `${data.Monocytes} %`, `(2 - 4)`]);
//   }
//   if (hasValue(data.Eosinophils)) {
//     tableBody.push([`Eosinophils:`, `${data.Eosinophils} %`, `(2 - 4)`]);
//   }
//   if (hasValue(data.Basophils)) {
//     tableBody.push([`Basophils:`, `${data.Basophils} %`, `( <1 )`]);
//   }

//   // ESR
//   if (hasValue(data["1StHrsCount"])) {
//     tableBody.push([
//       {
//         content: `ERYTHROCYTE SEDIMENTATION RATE[ESR]:`,
//         styles: { fontStyle: "bold" },
//       },
//       `${data["1StHrsCount"]} 1ST/hr`,
//       `Males: 5-15 mm/hr\nFemales: 5-20 mm/hr`,
//     ]);
//   }

//   // PCV, MCV, MCH, MCHC
//   if (hasValue(data.PCV)) {
//     tableBody.push([
//       `PCV`,
//       `${data.PCV} ${data.PCVUnit || ""}`,
//       `M: 42-52%\nF: 42-52%`,
//     ]);
//   }
//   if (hasValue(data.MCV)) {
//     tableBody.push([
//       `MCV`,
//       `${data.MCV} ${data.MCVUnit || ""}`,
//       `78 - 100 cu\u00B5`,
//     ]);
//   }
//   if (hasValue(data.MCH)) {
//     tableBody.push([
//       `MCH`,
//       `${data.MCH} ${data.MCHUnit || ""}`,
//       `27 - 31 \u00B5\u00B5gr`,
//     ]);
//   }
//   if (hasValue(data.MCHC)) {
//     tableBody.push([
//       `MCHC`,
//       `${data.MCHC} ${data.MCHCUnit || ""}`,
//       `30 - 35%`,
//     ]);
//   }

//   // RDW
//   if (hasValue(data.RDW)) {
//     tableBody.push([
//       `RDW(CV)`,
//       `${data.RDW} ${data.RDWUnit || ""}`,
//       `11 - 15`,
//     ]);
//   }

//   // PDW
//   if (hasValue(data.PDW)) {
//     tableBody.push([
//       `PDW(CV)`,
//       `${data.PDW} ${data.PDWUnit || ""}`,
//       ``,
//     ]);
//   }

//   // Reticulocyte count
//   if (hasValue(data.ReticulocyCount)) {
//     tableBody.push([
//       `Reticulocyte Count`,
//       `${data.ReticulocyCount}`,
//       ``,
//     ]);
//   }

//   // Ab. Eosinophils Count
//   if (hasValue(data.AdEosCount)) {
//     tableBody.push([
//       `Ab. Eosinophils Count`,
//       `${data.AdEosCount}`,
//       ``,
//     ]);
//   }

//   // Malaria Parasite
//   if (hasValue(data.MaleriaParasite)) {
//     tableBody.push([
//       `Malaria Parasite`,
//       `${data.MaleriaParasite}`,
//       ``,
//     ]);
//   }

//   // Bleeding Time
//   if (hasValue(data.BleedTimeMin) || hasValue(data.BleedTimeSec)) {
//     tableBody.push([
//       `Bleeding Time`,
//       `${data.BleedTimeMin || 0} min ${data.BleedTimeSec || 0} sec`,
//       `2-7 min`,
//     ]);
//   }

//   // Coagulation Time
//   if (hasValue(data.CoagulMin) || hasValue(data.CoagulSec)) {
//     tableBody.push([
//       `Coagulation Time`,
//       `${data.CoagulMin || 0} min ${data.CoagulSec || 0} sec`,
//       `5-15 min`,
//     ]);
//   }

//   // Peripheral Smear Study
//   const smearParts = [data.SemearStudy1, data.SemearStudy2, data.SemearStudy3]
//     .filter((s) => hasValue(s));
//   if (smearParts.length > 0) {
//     tableBody.push([
//       {
//         content: `PERIPHERAL SMEAR STUDY:`,
//         styles: { fontStyle: "bold" },
//       },
//       { content: smearParts.join("\n"), colSpan: 2 },
//     ]);
//   }

//   // Abnormal Cells
//   const abnCells = [];
//   for (let i = 1; i <= 6; i++) {
//     const name = data[`AbnCell${i}`];
//     const val = data[`AbnCell${i}Val`];
//     if (hasValue(name) && hasValue(val)) {
//       abnCells.push(`${name}: ${val}%`);
//     }
//   }
//   if (abnCells.length > 0) {
//     tableBody.push([
//       {
//         content: `ABNORMAL CELLS:`,
//         styles: { fontStyle: "bold" },
//       },
//       { content: abnCells.join(",  "), colSpan: 2 },
//     ]);
//   }

//   // Remarks - always at the end if present
//   if (hasValue(Remarks)) {
//     tableBody.push([
//       { content: `Remarks: ${Remarks}`, styles: { fontStyle: "italic" }, colSpan: 3 },
//     ]);
//   }

//   // --- 6. RENDER TABLE ---
//   autoTable(doc, {
//     startY: currentY,
//     head: [["INVESTIGATION", "RESULT", "REFERENCE RANGE"]],
//     body: tableBody,
//     theme: "plain",
//     styles: {
//       font: "times",
//       fontSize: 9.5,
//       cellPadding: 1.2,
//       textColor: [0, 0, 0],
//     },
//     headStyles: {
//       fontStyle: "bold",
//       borderBottomWidth: 0.5,
//     },
//     columnStyles: {
//       0: { cellWidth: 80 },
//       1: { cellWidth: 40 },
//       2: { cellWidth: 50, halign: "left" },
//     },
//     margin: { left: leftMargin, right: 15 },
//   });

//   const pdfBlob = doc.output("blob");
//   const blobUrl = URL.createObjectURL(pdfBlob);
//   window.open(blobUrl, "_blank");
//   setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
// };
















import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../../axiosInstance";
import JsBarcode from "jsbarcode";

// Helper: check if a value has meaningful data
const hasValue = (val) => {
  if (val === null || val === undefined || val === "") return false;
  if (typeof val === "number" && val === 0) return false;
  if (typeof val === "string" && (val.trim() === "" || val.trim() === "0")) return false;
  return true;
};

export const handlePrint = async (data, Remarks) => {
  console.log("Get Data: ", data);
  console.log("Remarks Data: ", Remarks);

  const doc = new jsPDF("p", "mm", "a4");

  let doctorName = "NA";
  let doctorRegNo = "NA";
  try {
    const doctorData = await axiosInstance.get(`/doctormaster/${data.DoctorId}`);
    doctorName = doctorData?.data?.data?.Doctor || doctorData?.Doctor || "";
    doctorRegNo = doctorData?.data?.data?.RegistrationNo || doctorData?.RegistrationNo || "";
  } catch (e) {
    console.log("Error fetching doctor:", e);
  }

  doc.setFont("times", "normal");
  // সাইজ ১০ থেকে সামান্য বাড়িয়ে ১১ করা হলো
  doc.setFontSize(11);

  const leftMargin = 15;
  const rightColumnX = 130;
  let currentY = 15;

  currentY += 40;

  // --- 1. BARCODE SECTION ---
  const caseNumber = data?.CaseNo || "NA";
  const canvas = document.createElement("canvas");

  JsBarcode(canvas, caseNumber, {
    format: "CODE128",
    displayValue: true,
    background: "#e6e6e6",
    lineColor: "#000000",
    width: 2,
    height: 40,
    margin: 0,
  });

  const barcodeImg = canvas.toDataURL("image/png");

  doc.setFillColor(230, 230, 230);
  doc.rect(leftMargin, currentY, 50, 14, "F");
  doc.addImage(barcodeImg, "PNG", leftMargin + 2, currentY + 1, 46, 9);

  currentY += 18;

  // স্পেসিং ৪.৫ থেকে সামান্য বাড়িয়ে ৫ করা হলো
  const rowH = 5;
  const labelWidth = 32;

  // --- 2. RIGHT SIDE HEADER ---
  let rightY = currentY;
  const drawPair = (x, y, label, value, labelOffset = 27) => {
    doc.setFont("times", "bold");
    doc.text(label, x, y);
    doc.setFont("times", "normal");
    doc.text(":", x + labelOffset, y);
    doc.text(value, x + labelOffset + 2, y);
  };

  drawPair(rightColumnX, rightY, "Age", `${data?.Age || ""} Y`, 9);
  drawPair(rightColumnX + 26, rightY, "Sex", data?.Sex || "NA", 9);

  rightY += rowH;
  drawPair(
    rightColumnX,
    rightY,
    "Collection Date",
    new Date().toLocaleDateString("en-GB")
  );

  rightY += rowH;
  drawPair(
    rightColumnX,
    rightY,
    "Reporting Date",
    data.ReportDt?.split("T")[0]?.split("-")?.reverse()?.join("/") ||
      new Date().toLocaleDateString("en-GB")
  );

  // --- 3. LEFT SIDE HEADER ---
  const drawLeftPair = (label, value) => {
    if (!hasValue(value)) return;
    doc.setFont("times", "bold");
    doc.text(label, leftMargin, currentY);
    doc.setFont("times", "normal");
    doc.text(":", leftMargin + labelWidth, currentY);
    doc.text(value?.toUpperCase() || "", leftMargin + labelWidth + 2, currentY);
    currentY += rowH;
  };

  drawLeftPair("Patient's Name", data?.PatientName || "NA");
  drawLeftPair("Patient's ID", data?.PatientId || "NA");
  drawLeftPair("Ref. By", doctorName);
  drawLeftPair("Dr. Reg. No.", doctorRegNo);

  // --- 4. TITLE SECTION ---
  currentY += 4;
  doc.setFont("times", "bold");
  // টাইটেলের সাইজ ১১ থেকে সামান্য বাড়িয়ে ১২ করা হলো
  doc.setFontSize(12);
  doc.text("HAEMATOLOGICAL EXAMINATION", 105, currentY, { align: "center" });

  const titleWidth = doc.getTextWidth("HAEMATOLOGICAL EXAMINATION");
  doc.setLineWidth(0.3);
  doc.line(
    105 - titleWidth / 2,
    currentY + 1,
    105 + titleWidth / 2,
    currentY + 1
  );

  currentY += 7;

  // --- 5. BUILD TABLE BODY (only rows with data) ---
  const tableBody = [];

  if (hasValue(data.Himoglobin2)) {
    tableBody.push([
      {
        content: `HAEMOGLOBIN\n(Cyanmethemoglobin)`,
        styles: { fontStyle: "bold" },
      },
      `${data.Himoglobin2} gm/dL`,
      `Males: 12-16\nFemales: 11-15\nChildren: 14-18\nNeonatal: 16-22`,
    ]);
  }

  const hasTCData =
    hasValue(data.Erythrocytes) ||
    hasValue(data.Leucocytes) ||
    hasValue(data.NucleatedRBC) ||
    hasValue(data.CorrectedWBCCount) ||
    hasValue(data.PalletsCount);

  if (hasTCData) {
    tableBody.push([
      { content: `TOTAL COUNT(TC)`, styles: { fontStyle: "bold" } },
      ``,
      ``,
    ]);
  }

  if (hasValue(data.Erythrocytes)) {
    tableBody.push([
      `Erythrocyte [RBC]:`,
      `${data.Erythrocytes} ${data.ErythrocytesUnit || ""}`,
      `4.5 - 5.5`,
    ]);
  }

  if (hasValue(data.Leucocytes)) {
    tableBody.push([
      `Leucocyte [WBC]:`,
      `${data.Leucocytes} ${data.LeucocytesUnit || ""}`,
      `4,000 - 10,500 /cumm`,
    ]);
  }

  if (hasValue(data.NucleatedRBC)) {
    tableBody.push([
      `Nucleate RBC:`,
      `${data.NucleatedRBC} ${data.NucleatedRBCUnit || ""}`,
      ``,
    ]);
  }

  if (hasValue(data.CorrectedWBCCount)) {
    tableBody.push([
      `Corrected WBC:`,
      `${data.CorrectedWBCCount} ${data.CorrectedWBCCountUnit || ""}`,
      `Per cmm`,
    ]);
  }

  if (hasValue(data.PalletsCount)) {
    tableBody.push([
      `Thrombocyte [Platelet]:`,
      `${data.PalletsCount} ${data.PalateCountUnit || ""}`,
      `1.5 - 4.0 Lakh/cmm`,
    ]);
  }

  const hasDCData =
    hasValue(data.Neutrophils) ||
    hasValue(data.Lymphocytes) ||
    hasValue(data.Monocytes) ||
    hasValue(data.Eosinophils) ||
    hasValue(data.Basophils);

  if (hasDCData) {
    tableBody.push([
      {
        content: `DIFFERENTIAL LEUCOCYTIC COUNT (DC)`,
        styles: { fontStyle: "bold" },
      },
      ``,
      ``,
    ]);
  }

  if (hasValue(data.Neutrophils)) {
    tableBody.push([`Neutrophil:`, `${data.Neutrophils} %`, `(40 - 75)`]);
  }
  if (hasValue(data.Lymphocytes)) {
    tableBody.push([`Lymphocyte:`, `${data.Lymphocytes} %`, `(20 - 40)`]);
  }
  if (hasValue(data.Monocytes)) {
    tableBody.push([`Monocytes:`, `${data.Monocytes} %`, `(2 - 4)`]);
  }
  if (hasValue(data.Eosinophils)) {
    tableBody.push([`Eosinophils:`, `${data.Eosinophils} %`, `(2 - 4)`]);
  }
  if (hasValue(data.Basophils)) {
    tableBody.push([`Basophils:`, `${data.Basophils} %`, `( <1 )`]);
  }

  if (hasValue(data["1StHrsCount"])) {
    tableBody.push([
      {
        content: `ERYTHROCYTE SEDIMENTATION RATE[ESR]:`,
        styles: { fontStyle: "bold" },
      },
      `${data["1StHrsCount"]} 1ST/hr`,
      `Males: 5-15 mm/hr\nFemales: 5-20 mm/hr`,
    ]);
  }

  if (hasValue(data.PCV)) {
    tableBody.push([
      `PCV`,
      `${data.PCV} ${data.PCVUnit || ""}`,
      `M: 42-52%\nF: 42-52%`,
    ]);
  }
  if (hasValue(data.MCV)) {
    tableBody.push([
      `MCV`,
      `${data.MCV} ${data.MCVUnit || ""}`,
      `78 - 100 cu\u00B5`,
    ]);
  }
  if (hasValue(data.MCH)) {
    tableBody.push([
      `MCH`,
      `${data.MCH} ${data.MCHUnit || ""}`,
      `27 - 31 \u00B5\u00B5gr`,
    ]);
  }
  if (hasValue(data.MCHC)) {
    tableBody.push([
      `MCHC`,
      `${data.MCHC} ${data.MCHCUnit || ""}`,
      `30 - 35%`,
    ]);
  }

  if (hasValue(data.RDW)) {
    tableBody.push([
      `RDW(CV)`,
      `${data.RDW} ${data.RDWUnit || ""}`,
      `11 - 15`,
    ]);
  }

  if (hasValue(data.PDW)) {
    tableBody.push([
      `PDW(CV)`,
      `${data.PDW} ${data.PDWUnit || ""}`,
      ``,
    ]);
  }

  if (hasValue(data.ReticulocyCount)) {
    tableBody.push([
      `Reticulocyte Count`,
      `${data.ReticulocyCount}`,
      ``,
    ]);
  }

  if (hasValue(data.AdEosCount)) {
    tableBody.push([
      `Ab. Eosinophils Count`,
      `${data.AdEosCount}`,
      ``,
    ]);
  }

  if (hasValue(data.MaleriaParasite)) {
    tableBody.push([
      `Malaria Parasite`,
      `${data.MaleriaParasite}`,
      ``,
    ]);
  }

  if (hasValue(data.BleedTimeMin) || hasValue(data.BleedTimeSec)) {
    tableBody.push([
      `Bleeding Time`,
      `${data.BleedTimeMin || 0} min ${data.BleedTimeSec || 0} sec`,
      `2-7 min`,
    ]);
  }

  if (hasValue(data.CoagulMin) || hasValue(data.CoagulSec)) {
    tableBody.push([
      `Coagulation Time`,
      `${data.CoagulMin || 0} min ${data.CoagulSec || 0} sec`,
      `5-15 min`,
    ]);
  }

  const smearParts = [data.SemearStudy1, data.SemearStudy2, data.SemearStudy3]
    .filter((s) => hasValue(s));
  if (smearParts.length > 0) {
    tableBody.push([
      {
        content: `PERIPHERAL SMEAR STUDY:`,
        styles: { fontStyle: "bold" },
      },
      { content: smearParts.join("\n"), colSpan: 2 },
    ]);
  }

  const abnCells = [];
  for (let i = 1; i <= 6; i++) {
    const name = data[`AbnCell${i}`];
    const val = data[`AbnCell${i}Val`];
    if (hasValue(name) && hasValue(val)) {
      abnCells.push(`${name}: ${val}%`);
    }
  }
  if (abnCells.length > 0) {
    tableBody.push([
      {
        content: `ABNORMAL CELLS:`,
        styles: { fontStyle: "bold" },
      },
      { content: abnCells.join(",  "), colSpan: 2 },
    ]);
  }

  if (hasValue(Remarks)) {
    tableBody.push([
      { content: `Remarks: ${Remarks}`, styles: { fontStyle: "italic" }, colSpan: 3 },
    ]);
  }

  // --- 6. RENDER TABLE ---
  autoTable(doc, {
    startY: currentY,
    head: [["INVESTIGATION", "RESULT", "REFERENCE RANGE"]],
    body: tableBody,
    theme: "plain",
    styles: {
      font: "times",
      // টেবিলের ফন্ট সাইজ ৯.৫ থেকে সামান্য বাড়িয়ে ১০.৫ করা হলো
      fontSize: 10.5,
      // প্যাডিং ১.২ থেকে সামান্য বাড়িয়ে ১.৩ করা হলো
      cellPadding: 1.3,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fontStyle: "bold",
      borderBottomWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40 },
      2: { cellWidth: 50, halign: "left" },
    },
    margin: { left: leftMargin, right: 15 },
  });

  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, "_blank");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};


