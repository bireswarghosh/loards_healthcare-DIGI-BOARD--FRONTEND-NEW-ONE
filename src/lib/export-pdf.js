import { jsPDF } from "jspdf";

/**
 * Enhanced Professional Medical PDF Report Generator
 * Features: Headers, footers, color schemes, borders, improved typography
 */

// Shared styling constants
const COLORS = {
  primary: [41, 128, 185], // Professional Blue
  secondary: [52, 73, 94], // Dark Blue-Gray
  accent: [26, 188, 156], // Teal
  text: [44, 62, 80], // Dark Gray
  lightGray: [236, 240, 241], // Light Background
  border: [189, 195, 199], // Border Gray
  success: [39, 174, 96], // Green
  warning: [243, 156, 18], // Orange
  danger: [231, 76, 60], // Red
};

// Helper function to convert URL to base64 using img and canvas
async function urlToBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Try to handle CORS
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(
        new Error(
          `Failed to load image from ${url}: ${
            error.message || "Image load error"
          }`
        )
      );
    };
    img.src = url;
  });
}

// Helper functions
function addPageHeader(doc, title, pageNum, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 25, "F");

  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 12, { align: "center" });
}

function addPageFooter(doc, yPos) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Footer line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

  // Footer text
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const footerText = `Generated on ${new Date().toLocaleString()} | AI-Assisted Medical Analysis`;
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
}

function addSectionHeader(doc, title, yPos, pageWidth) {
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 10, 2, 2, "F");

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, yPos + 2);

  return yPos + 12;
}

function addKeyValuePair(doc, key, value, yPos, pageWidth) {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.secondary);
  doc.text(key + ":", 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const lines = doc.splitTextToSize(value, pageWidth - 80);
  doc.text(lines, 70, yPos);

  return yPos + lines.length * 5 + 3;
}

function addWrappedContent(doc, content, yPos, pageWidth, fontSize = 10) {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const lines = doc.splitTextToSize(content, pageWidth - 40);
  doc.text(lines, 20, yPos);
  return yPos + lines.length * (fontSize * 0.4) + 5;
}

function checkPageBreak(doc, yPos, minSpace, pageHeight) {
  if (yPos > pageHeight - minSpace) {
    doc.addPage();
    return 30; // Start after header
  }
  return yPos;
}

/**
 * Generates an enhanced professional prescription analysis PDF
 */
export async function generatePrescriptionPDF(
  prescriptionData,
  patientInfo,
  doctorInfo,
  hospitalSettings = {},
  imageData = []
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 30;
  let pageNum = 1;

  // Add header
  addPageHeader(doc, "MEDICAL PRESCRIPTION", pageNum, 1);

  // Hospital Header with colored background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, yPosition - 5, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  if (
    hospitalSettings.orgLogoUrl ||
    hospitalSettings.orgLogo ||
    prescriptionData.hospital?.logo
  ) {
    console.log(
      "Logo source:",
      hospitalSettings.orgLogoUrl ||
        hospitalSettings.orgLogo ||
        prescriptionData.hospital?.logo
    );
    try {
      let logoData;
      if (hospitalSettings.orgLogoUrl) {
        logoData = await urlToBase64(hospitalSettings.orgLogoUrl);
      } else {
        logoData = hospitalSettings.orgLogo || prescriptionData.hospital?.logo;
      }
      console.log("Logo data loaded, length:", logoData.length);
      const logoWidth = 35;
      const logoHeight = 17.5;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoData, logoX, yPosition + 2, logoWidth, logoHeight);
      console.log("Logo added to PDF");
    } catch (e) {
      console.error("Failed to load logo:", e);
      // Fallback to text if logo fails
      doc.text(
        hospitalSettings.orgName ||
          prescriptionData.hospital?.name ||
          "Medical Center",
        pageWidth / 2,
        yPosition + 22,
        { align: "center" }
      );
    }
  } else {
    console.log("No logo source, using text");
    doc.text(
      hospitalSettings.orgName ||
        prescriptionData.hospital?.name ||
        "Medical Center",
      pageWidth / 2,
      yPosition + 22,
      { align: "center" }
    );
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (hospitalSettings.orgAddress || prescriptionData.hospital?.address) {
    doc.text(
      hospitalSettings.orgAddress || prescriptionData.hospital?.address,
      pageWidth / 2,
      yPosition + 27,
      { align: "center" }
    );
  }
  if (
    hospitalSettings.orgPhone ||
    hospitalSettings.orgEmail ||
    prescriptionData.hospital?.phone ||
    prescriptionData.hospital?.email
  ) {
    const contact = [
      hospitalSettings.orgPhone || prescriptionData.hospital?.phone,
      hospitalSettings.orgEmail || prescriptionData.hospital?.email,
    ]
      .filter(Boolean)
      .join(" | ");
    doc.text(contact, pageWidth / 2, yPosition + 32, { align: "center" });
  }
  yPosition += 45;

  // Patient Demographics Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, yPosition, pageWidth - 30, 35, 2, 2, "F");

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT INFORMATION", 20, yPosition + 7);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");

  // Left column
  let infoY = yPosition + 14;
  doc.text(`Name: ${patientInfo.patientName || "N/A"}`, 20, infoY);
  infoY += 7;
  doc.text(`ID: ${patientInfo.patientId || "N/A"}`, 20, infoY);

  // Right column
  infoY = yPosition + 14;
  doc.text(
    `Age: ${
      patientInfo.patientAge ? patientInfo.patientAge + " years" : "N/A"
    }`,
    pageWidth / 2 + 10,
    infoY
  );
  infoY += 7;
  doc.text(
    `Sex: ${patientInfo.patientSex || "N/A"}`,
    pageWidth / 2 + 10,
    infoY
  );

  doc.setFont("helvetica", "bold");
  doc.text(
    `Referring Physician: ${doctorInfo.doctorName || "N/A"}`,
    20,
    infoY + 7
  );
  yPosition += 43;

  // Prescription Metadata
  yPosition = addSectionHeader(
    doc,
    "PRESCRIPTION DETAILS",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Date",
    prescriptionData?.date
      ? new Date(prescriptionData.date).toLocaleDateString()
      : "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Analysis ID",
    prescriptionData?.analysisId || "N/A",
    yPosition,
    pageWidth
  );
  yPosition += 8;

  // Uploaded Prescriptions
  if (imageData.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 100, pageHeight);
    yPosition = addSectionHeader(
      doc,
      "UPLOADED PRESCRIPTIONS",
      yPosition,
      pageWidth
    );

    imageData.forEach((imgBase64, index) => {
      yPosition = checkPageBreak(doc, yPosition, 100, pageHeight);

      const imgWidth = 120;
      const imgHeight = 90;
      const imgX = (pageWidth - imgWidth) / 2;

      // Image border
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.5);
      doc.rect(imgX - 2, yPosition - 2, imgWidth + 4, imgHeight + 4);

      doc.addImage(imgBase64, "JPEG", imgX, yPosition, imgWidth, imgHeight);

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.text(
        `Prescription ${index + 1} of ${imageData.length}`,
        pageWidth / 2,
        yPosition + imgHeight + 8,
        { align: "center" }
      );

      yPosition += imgHeight + 15;
    });
  }

  // Clinical Sections
  const sections = [
    {
      title: "CLINICAL FINDINGS",
      content: prescriptionData?.clinicalFindings || "N/A",
      color: COLORS.accent,
    },
    {
      title: "DIAGNOSIS & ANALYSIS",
      content: prescriptionData?.analysis || "N/A",
      color: COLORS.secondary,
    },
    {
      title: "TREATMENT RECOMMENDATIONS",
      content: prescriptionData?.recommendations || "N/A",
      color: COLORS.success,
    },
  ];

  sections.forEach((section) => {
    yPosition = checkPageBreak(doc, yPosition, 50, pageHeight);

    // Colored section header
    doc.setFillColor(...section.color);
    doc.roundedRect(15, yPosition - 5, pageWidth - 30, 10, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, 20, yPosition + 2);
    yPosition += 12;

    yPosition = addWrappedContent(doc, section.content, yPosition, pageWidth);
    yPosition += 10;
  });

  // Clinical Notes
  if (prescriptionData?.notes) {
    yPosition = checkPageBreak(doc, yPosition, 40, pageHeight);
    yPosition = addSectionHeader(doc, "CLINICAL NOTES", yPosition, pageWidth);
    yPosition = addWrappedContent(
      doc,
      prescriptionData.notes,
      yPosition,
      pageWidth,
      9
    );
    yPosition += 8;
  }

  // Signature Section
  if (prescriptionData?.signature) {
    yPosition = checkPageBreak(doc, yPosition, 35, pageHeight);

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, yPosition, pageWidth - 30, 25, 2, 2, "F");

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signature:", 20, yPosition + 8);

    doc.setFont("helvetica", "italic");
    doc.text(prescriptionData.signature, 20, yPosition + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `Date: ${
        prescriptionData.date
          ? new Date(prescriptionData.date).toLocaleDateString()
          : "N/A"
      }`,
      20,
      yPosition + 21
    );

    yPosition += 30;
  }

  // Disclaimer
  if (prescriptionData?.disclaimer) {
    yPosition = checkPageBreak(doc, yPosition, 45, pageHeight);

    doc.setFillColor(255, 245, 245);
    doc.setDrawColor(...COLORS.danger);
    doc.roundedRect(15, yPosition, pageWidth - 30, 30, 2, 2, "FD");

    doc.setTextColor(...COLORS.danger);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DISCLAIMER", 20, yPosition + 7);

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(
      prescriptionData.disclaimer,
      pageWidth - 40
    );
    doc.text(lines, 20, yPosition + 13);
  }

  addPageFooter(doc, yPosition);

  return doc.output("blob");
}

/**
 * Generates an enhanced professional medical imaging PDF
 */
export async function generateMedicalImagePDF(
  analysisResult,
  analysisMeta,
  uploadedFiles = [],
  uploadedImages = [],
  imageData = [],
  orgSettings = {}
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 30;
  let pageNum = 1;

  // Add header
  addPageHeader(doc, "MEDICAL IMAGING ANALYSIS", pageNum, 1);

  // Organization Header with colored background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, yPosition - 5, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  if (orgSettings.orgLogoUrl || orgSettings.orgLogo) {
    console.log("Logo source:", orgSettings.orgLogoUrl || orgSettings.orgLogo);
    try {
      let logoData;
      if (orgSettings.orgLogoUrl) {
        logoData = await urlToBase64(orgSettings.orgLogoUrl);
      } else {
        logoData = orgSettings.orgLogo;
      }
      console.log("Logo data loaded, length:", logoData.length);
      const logoWidth = 35;
      const logoHeight = 17.5;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoData, logoX, yPosition + 2, logoWidth, logoHeight);
      console.log("Logo added to PDF");
    } catch (e) {
      console.error("Failed to load logo:", e);
      // Fallback to text
      doc.text(
        orgSettings.orgName || "Medical Imaging Center",
        pageWidth / 2,
        yPosition + 22,
        { align: "center" }
      );
    }
  } else {
    console.log("No logo source, using text");
    doc.text(
      orgSettings.orgName || "Medical Imaging Center",
      pageWidth / 2,
      yPosition + 22,
      { align: "center" }
    );
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (orgSettings.orgAddress) {
    doc.text(orgSettings.orgAddress, pageWidth / 2, yPosition + 27, {
      align: "center",
    });
  }
  if (orgSettings.orgPhone || orgSettings.orgEmail) {
    const contact = [orgSettings.orgPhone, orgSettings.orgEmail]
      .filter(Boolean)
      .join(" | ");
    doc.text(contact, pageWidth / 2, yPosition + 32, { align: "center" });
  }
  yPosition += 45;

  // Patient Demographics Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, yPosition, pageWidth - 30, 35, 2, 2, "F");

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT INFORMATION", 20, yPosition + 7);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");

  // Left column
  let infoY = yPosition + 14;
  doc.text(`Name: ${analysisMeta.patientName}`, 20, infoY);
  infoY += 7;
  doc.text(`ID: ${analysisMeta.patientId}`, 20, infoY);

  // Right column
  infoY = yPosition + 14;
  doc.text(`Age: ${analysisMeta.patientAge} years`, pageWidth / 2 + 10, infoY);
  infoY += 7;
  doc.text(`Sex: ${analysisMeta.patientSex}`, pageWidth / 2 + 10, infoY);

  doc.setFont("helvetica", "bold");
  doc.text(`Referring Physician: ${analysisMeta.doctorName}`, 20, infoY + 7);
  yPosition += 43;

  // Analysis Metadata
  yPosition = addSectionHeader(
    doc,
    "EXAMINATION DETAILS",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Study Date",
    analysisMeta?.generatedAt
      ? new Date(analysisMeta.generatedAt).toLocaleDateString()
      : "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Analysis ID",
    analysisMeta?.analysisId || "N/A",
    yPosition,
    pageWidth
  );
  yPosition += 8;

  // Uploaded Images with borders
  if (imageData.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 100, pageHeight);
    yPosition = addSectionHeader(doc, "IMAGING STUDIES", yPosition, pageWidth);

    imageData.forEach((imgBase64, index) => {
      yPosition = checkPageBreak(doc, yPosition, 100, pageHeight);

      const imgWidth = 120;
      const imgHeight = 90;
      const imgX = (pageWidth - imgWidth) / 2;

      // Image border
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.5);
      doc.rect(imgX - 2, yPosition - 2, imgWidth + 4, imgHeight + 4);

      doc.addImage(imgBase64, "JPEG", imgX, yPosition, imgWidth, imgHeight);

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.text(
        `Image ${index + 1} of ${imageData.length}`,
        pageWidth / 2,
        yPosition + imgHeight + 8,
        { align: "center" }
      );

      yPosition += imgHeight + 15;
    });
  }

  // Clinical Analysis Sections
  const sections = [
    {
      title: "IMAGE MODALITY",
      content: analysisResult?.imageType || "N/A",
      color: COLORS.primary,
    },
    {
      title: "CLINICAL FINDINGS",
      content: analysisResult?.clinicalFindings || "N/A",
      color: COLORS.accent,
    },
    {
      title: "IMPRESSION & ANALYSIS",
      content: analysisResult?.analysis || "N/A",
      color: COLORS.secondary,
    },
    {
      title: "PROBABLE DIAGNOSIS",
      content: analysisResult?.probableCondition || "N/A",
      color: COLORS.primary,
    },
    {
      title: "RECOMMENDATIONS",
      content: analysisResult?.recommendations || "N/A",
      color: COLORS.success,
    },
  ];

  sections.forEach((section) => {
    yPosition = checkPageBreak(doc, yPosition, 50, pageHeight);

    // Colored section header
    doc.setFillColor(...section.color);
    doc.roundedRect(15, yPosition - 5, pageWidth - 30, 10, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, 20, yPosition + 2);
    yPosition += 12;

    yPosition = addWrappedContent(doc, section.content, yPosition, pageWidth);
    yPosition += 10;
  });

  // Confidence Score
  if (analysisResult?.confidenceScore) {
    yPosition = checkPageBreak(doc, yPosition, 30, pageHeight);
    const score = parseFloat(analysisResult.confidenceScore) || 0;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text("Diagnostic Confidence:", 20, yPosition);

    const barWidth = (pageWidth - 90) * (score / 100);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(70, yPosition - 4, pageWidth - 90, 7, 2, 2, "F");

    const barColor =
      score >= 75
        ? COLORS.success
        : score >= 50
        ? COLORS.warning
        : COLORS.danger;
    doc.setFillColor(...barColor);
    doc.roundedRect(70, yPosition - 4, barWidth, 7, 2, 2, "F");

    doc.setTextColor(...barColor);
    doc.text(`${score}%`, pageWidth - 20, yPosition, { align: "right" });
    yPosition += 12;
  }

  // Clinical Notes
  if (analysisResult?.notes) {
    yPosition = checkPageBreak(doc, yPosition, 40, pageHeight);
    yPosition = addSectionHeader(doc, "CLINICAL NOTES", yPosition, pageWidth);
    yPosition = addWrappedContent(
      doc,
      analysisResult.notes,
      yPosition,
      pageWidth,
      9
    );
    yPosition += 8;
  }

  // Disclaimer
  if (analysisResult?.disclaimer) {
    yPosition = checkPageBreak(doc, yPosition, 45, pageHeight);

    doc.setFillColor(255, 245, 245);
    doc.setDrawColor(...COLORS.danger);
    doc.roundedRect(15, yPosition, pageWidth - 30, 30, 2, 2, "FD");

    doc.setTextColor(...COLORS.danger);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DISCLAIMER", 20, yPosition + 7);

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(
      analysisResult.disclaimer,
      pageWidth - 40
    );
    doc.text(lines, 20, yPosition + 13);
  }

  addPageFooter(doc, yPosition);

  return doc.output("blob");
}

/**
 * Generates an enhanced professional treatment plan PDF
 */
export async function generateTreatmentPlanPDF(
  analysisResult,
  analysisMeta,
  symptoms = [],
  orgSettings = {}
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 30;

  addPageHeader(doc, "TREATMENT PLAN", 1, 1);

  // Organization Header with colored background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, yPosition - 5, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  if (orgSettings.orgLogoUrl || orgSettings.orgLogo) {
    console.log("Logo source:", orgSettings.orgLogoUrl || orgSettings.orgLogo);
    try {
      let logoData;
      if (orgSettings.orgLogoUrl) {
        logoData = await urlToBase64(orgSettings.orgLogoUrl);
      } else {
        logoData = orgSettings.orgLogo;
      }
      console.log("Logo data loaded, length:", logoData.length);
      const logoWidth = 35;
      const logoHeight = 17.5;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoData, logoX, yPosition + 2, logoWidth, logoHeight);
      console.log("Logo added to PDF");
    } catch (e) {
      console.error("Failed to load logo:", e);
      // Fallback to text
      doc.text(
        orgSettings.orgName || "Medical Center",
        pageWidth / 2,
        yPosition + 22,
        { align: "center" }
      );
    }
  } else {
    console.log("No logo source, using text");
    doc.text(
      orgSettings.orgName || "Medical Center",
      pageWidth / 2,
      yPosition + 22,
      { align: "center" }
    );
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (orgSettings.orgAddress) {
    doc.text(orgSettings.orgAddress, pageWidth / 2, yPosition + 27, {
      align: "center",
    });
  }
  if (orgSettings.orgPhone || orgSettings.orgEmail) {
    const contact = [orgSettings.orgPhone, orgSettings.orgEmail]
      .filter(Boolean)
      .join(" | ");
    doc.text(contact, pageWidth / 2, yPosition + 32, { align: "center" });
  }
  yPosition += 45;

  // Title Section
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(15, yPosition, pageWidth - 30, 18, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AI Treatment Plan", pageWidth / 2, yPosition + 12, {
    align: "center",
  });
  yPosition += 26;

  // Patient Information
  yPosition = addSectionHeader(doc, "PATIENT DETAILS", yPosition, pageWidth);
  yPosition = addKeyValuePair(
    doc,
    "Patient Name",
    analysisMeta?.patientName || "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Patient ID",
    analysisMeta?.patientId || "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Attending Physician",
    analysisMeta?.doctorName || "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Date",
    analysisMeta?.generatedAt
      ? new Date(analysisMeta.generatedAt).toLocaleDateString()
      : "N/A",
    yPosition,
    pageWidth
  );
  yPosition += 10;

  // Symptoms Section with severity bars
  if (symptoms.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 60, pageHeight);
    yPosition = addSectionHeader(
      doc,
      "REPORTED SYMPTOMS",
      yPosition,
      pageWidth
    );

    symptoms.forEach((s) => {
      yPosition = checkPageBreak(doc, yPosition, 15, pageHeight);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.text);
      doc.text(s.symptom, 20, yPosition);

      // Severity bar
      const severity = parseFloat(s.severity) || 0;
      const barWidth = (pageWidth - 100) * (severity / 100);

      doc.setFillColor(240, 240, 240);
      doc.roundedRect(20, yPosition + 3, pageWidth - 100, 5, 1, 1, "F");

      const severityColor =
        severity >= 70
          ? COLORS.danger
          : severity >= 40
          ? COLORS.warning
          : COLORS.success;
      doc.setFillColor(...severityColor);
      doc.roundedRect(20, yPosition + 3, barWidth, 5, 1, 1, "F");

      doc.setFontSize(9);
      doc.setTextColor(...severityColor);
      doc.text(`${severity}%`, pageWidth - 30, yPosition + 6, {
        align: "right",
      });

      yPosition += 12;
    });
    yPosition += 8;
  }

  // Diagnosis
  yPosition = checkPageBreak(doc, yPosition, 40, pageHeight);
  yPosition = addSectionHeader(doc, "DIAGNOSIS", yPosition, pageWidth);
  yPosition = addWrappedContent(
    doc,
    analysisResult?.probableCondition || "N/A",
    yPosition,
    pageWidth
  );
  yPosition += 10;

  // Clinical Findings
  yPosition = checkPageBreak(doc, yPosition, 40, pageHeight);
  yPosition = addSectionHeader(doc, "CLINICAL FINDINGS", yPosition, pageWidth);
  yPosition = addWrappedContent(
    doc,
    analysisResult?.clinicalFindings || "N/A",
    yPosition,
    pageWidth
  );
  yPosition += 10;

  // Treatment Recommendations
  const recommendations = analysisResult?.recommendations || {};

  const treatmentSections = [
    {
      title: "LABORATORY TESTS",
      content: recommendations.labTests,
      icon: "test-tube",
    },
    {
      title: "MEDICATIONS",
      content: recommendations.medications,
      icon: "pills",
    },
    {
      title: "DIETARY RECOMMENDATIONS",
      content: recommendations.diet,
      icon: "diet",
    },
    {
      title: "EXERCISE PLAN",
      content: recommendations.exercise,
      icon: "exercise",
    },
    {
      title: "FOLLOW-UP CARE",
      content: recommendations.followUp,
      icon: "calendar",
    },
  ];

  treatmentSections.forEach((section) => {
    if (section.content && section.content !== "N/A") {
      yPosition = checkPageBreak(doc, yPosition, 50, pageHeight);

      doc.setFillColor(...COLORS.lightGray);
      doc.roundedRect(15, yPosition - 5, pageWidth - 30, 10, 2, 2, "F");

      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 20, yPosition + 2);
      yPosition += 12;

      yPosition = addWrappedContent(
        doc,
        section.content,
        yPosition,
        pageWidth,
        10
      );
      yPosition += 10;
    }
  });

  // Additional Notes
  if (analysisResult?.notes) {
    yPosition = checkPageBreak(doc, yPosition, 40, pageHeight);
    yPosition = addSectionHeader(doc, "CLINICAL NOTES", yPosition, pageWidth);
    yPosition = addWrappedContent(
      doc,
      analysisResult.notes,
      yPosition,
      pageWidth
    );
    yPosition += 10;
  }

  // Disclaimer
  if (analysisResult?.disclaimer) {
    yPosition = checkPageBreak(doc, yPosition, 50, pageHeight);

    doc.setFillColor(255, 250, 240);
    doc.setDrawColor(...COLORS.warning);
    doc.roundedRect(15, yPosition, pageWidth - 30, 35, 2, 2, "FD");

    doc.setTextColor(...COLORS.danger);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("MEDICAL DISCLAIMER", 20, yPosition + 7);

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(
      analysisResult.disclaimer,
      pageWidth - 40
    );
    doc.text(lines, 20, yPosition + 13);
    yPosition += 40;
  }

  // Signature Section
  yPosition = checkPageBreak(doc, yPosition, 50, pageHeight);

  addPageFooter(doc, yPosition);

  return doc.output("blob");
}

/**
 * Generates an enhanced professional drug interaction PDF
 */
export async function generateDrugInteractionPDF(
  analysisResult,
  analysisMeta,
  medications = [],
  orgSettings = {}
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 30;

  addPageHeader(doc, "DRUG INTERACTION ANALYSIS", 1, 1);

  // Organization Header with colored background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, yPosition - 5, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  if (orgSettings.orgLogoUrl || orgSettings.orgLogo) {
    try {
      const logoBase64 = await urlToBase64(
        orgSettings.orgLogoUrl || orgSettings.orgLogo
      );
      doc.addImage(logoBase64, "PNG", 15, yPosition + 5, 30, 30);
      doc.text(
        orgSettings.orgName || "Medical Center",
        55,
        yPosition + 22,
        { align: "left" }
      );
    } catch (e) {
      console.log("Logo load failed, using text only");
      doc.text(
        orgSettings.orgName || "Medical Center",
        pageWidth / 2,
        yPosition + 22,
        { align: "center" }
      );
    }
  } else {
    doc.text(
      orgSettings.orgName || "Medical Center",
      pageWidth / 2,
      yPosition + 22,
      { align: "center" }
    );
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (orgSettings.orgAddress) {
    doc.text(orgSettings.orgAddress, pageWidth / 2, yPosition + 27, {
      align: "center",
    });
  }
  if (orgSettings.orgPhone || orgSettings.orgEmail) {
    const contact = [
      orgSettings.orgPhone,
      orgSettings.orgEmail,
    ]
      .filter(Boolean)
      .join(" | ");
    doc.text(contact, pageWidth / 2, yPosition + 32, { align: "center" });
  }
  yPosition += 45;

  // Title Section
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(15, yPosition, pageWidth - 30, 18, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Drug Interaction Analysis Report", pageWidth / 2, yPosition + 12, {
    align: "center",
  });
  yPosition += 26;

  // Patient Information
  yPosition = addSectionHeader(doc, "PATIENT DETAILS", yPosition, pageWidth);
  yPosition = addKeyValuePair(
    doc,
    "Patient Name",
    analysisMeta?.patientName || "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Patient ID",
    analysisMeta?.patientId || "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Attending Physician",
    analysisMeta?.doctorName || "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Analysis Date",
    analysisMeta?.generatedAt
      ? new Date(analysisMeta.generatedAt).toLocaleDateString()
      : "N/A",
    yPosition,
    pageWidth
  );
  yPosition = addKeyValuePair(
    doc,
    "Analysis ID",
    analysisMeta?.analysisId || "N/A",
    yPosition,
    pageWidth
  );
  yPosition += 10;

  // Medications Section
  if (medications.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 40, pageHeight);
    yPosition = addSectionHeader(doc, "MEDICATIONS ANALYZED", yPosition, pageWidth);

    medications.forEach((med, index) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.secondary);
      doc.text(`${index + 1}. ${med.drugName}`, 20, yPosition);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      const medDetails = `Dosage: ${med.dosage} | Frequency: ${med.frequency} | Purpose: ${med.purpose}`;
      doc.text(medDetails, 25, yPosition + 5);

      yPosition += 12;
    });
    yPosition += 8;
  }

  // Clinical Analysis Sections
  const sections = [
    {
      title: "DRUG-DRUG INTERACTIONS",
      content: analysisResult?.drugDrugInteractions || "N/A",
      color: COLORS.warning,
    },
    {
      title: "DRUG-DISEASE INTERACTIONS",
      content: analysisResult?.drugDiseaseInteractions || "N/A",
      color: COLORS.danger,
    },
    {
      title: "CONTRAINDICATIONS",
      content: analysisResult?.contraindications || "N/A",
      color: COLORS.danger,
    },
    {
      title: "OVERALL ANALYSIS",
      content: analysisResult?.overallAnalysis || "N/A",
      color: COLORS.secondary,
    },
    {
      title: "RECOMMENDATIONS",
      content: analysisResult?.recommendations || "N/A",
      color: COLORS.success,
    },
    {
      title: "ALTERNATIVE MEDICATION SUGGESTIONS",
      content: analysisResult?.alternativeSuggestions || "N/A",
      color: COLORS.accent,
    },
  ];

  sections.forEach((section) => {
    yPosition = checkPageBreak(doc, yPosition, 50, pageHeight);

    // Colored section header
    doc.setFillColor(...section.color);
    doc.roundedRect(15, yPosition - 5, pageWidth - 30, 10, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, 20, yPosition + 2);
    yPosition += 12;

    yPosition = addWrappedContent(doc, section.content, yPosition, pageWidth);
    yPosition += 10;
  });

  // Clinical Notes
  if (analysisResult?.notes) {
    yPosition = checkPageBreak(doc, yPosition, 40, pageHeight);
    yPosition = addSectionHeader(doc, "CLINICAL NOTES", yPosition, pageWidth);
    yPosition = addWrappedContent(
      doc,
      analysisResult.notes,
      yPosition,
      pageWidth,
      9
    );
    yPosition += 8;
  }

  // Disclaimer
  if (analysisResult?.disclaimer) {
    yPosition = checkPageBreak(doc, yPosition, 45, pageHeight);

    doc.setFillColor(255, 245, 245);
    doc.setDrawColor(...COLORS.danger);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPosition, pageWidth - 30, 20, 2, 2);

    doc.setTextColor(...COLORS.danger);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("AI ANALYSIS DISCLAIMER", 20, yPosition + 7);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(
      analysisResult.disclaimer,
      pageWidth - 40
    );
    doc.text(lines, 20, yPosition + 13);
    yPosition += 25;
  }

  addPageFooter(doc, yPosition);

  return doc.output("blob");
}
