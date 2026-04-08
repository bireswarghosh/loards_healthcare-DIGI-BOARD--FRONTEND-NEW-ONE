// import { tr } from "date-fns/locale";
// import ApiSelect from "./ApiSelect";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import axiosInstance from "../../axiosInstance";
// import { toast } from "react-toastify";
// import JsBarcode from "jsbarcode";
// import { useEffect, useMemo, useState } from "react";
// import useAxiosFetch from "./Fetch";
// import { DateFormatter } from "./DateFormatter";

// const GeneralTestDrawer = ({
//   formData2,
//   tests = [],
//   propertyList = [],
//   propertyValueMap = {},
//   handlePropertyChange,
//   fetchPropertyList,
//   fetchPropertyValues,
//   fetchTestDetails,
// }) => {
//   const barcodeImg = useMemo(() => {
//     if (!formData2.CaseNo) return "";
//     const canvas = document.createElement("canvas");
//     JsBarcode(canvas, formData2.CaseNo, {
//       format: "CODE128",
//       width: 2,
//       height: 40,
//       displayValue: true,
//     });
//     return canvas.toDataURL("image/png");
//   }, [formData2?.CaseNo]);


//   const [selectedTests, setSelectedTests] = useState([]);
// const handleSelectTest = (test) => {
//   setSelectedTests((prev) => {
//     const exists = prev.find((t) => t.TestId === test.TestId);

//     if (exists) {
//       // remove
//       return prev.filter((t) => t.TestId !== test.TestId);
//     } else {
//       // add
//       return [...prev, test];
//     }
//   });
// };
//   const { data: doctors } = useAxiosFetch(
//     "/doctormaster?page=1&limit=10000",
//     []
//   );


//   const { data: subDeps } = useAxiosFetch(
//     "/subdepartment",
//     []
//   );

//   let SubDepartmentMap = useMemo(() => {
//     const map = {};
//     (subDeps || []).forEach((sd) => {
//       map[sd.SubDepartmentId] = sd.SubDepartment;
//     });
//     return map;
//   }, [subDeps]);
//   //  console.log("doctors",doctors);
//   const doctorMap = useMemo(() => {
//     const map = {};
//     (doctors || []).forEach((d) => {
//       map[d.DoctorId] = d.Doctor;
//     });
//     return map;
//   }, [doctors]);

//   const [selectedTest, setSelectedTest] = useState(null);
//     const [allTestProperties, setAllTestProperties] = useState({});


//   const [pathologistId, setPathologistId] = useState(null);
//   const [pathologistName, setPathologistName] = useState("");

//   const [pathologistList, setPathologistList] = useState([]);

//   useEffect(() => {
//     fetch("/pathologist")
//       .then((res) => res.json())
//       .then((data) => {
//         setPathologistList(Array.isArray(data) ? data : data.data || []);
//       });
//   }, []);

//   const saveProperty = async (prop) => {
//     const pv = propertyValueMap[prop.TestPropertyId];
//     if (!pv) return;

//     const payload = {
//       CaseId: formData2.CaseId,
//       TestId: selectedTest?.TestId,
//       TestPropertyId: prop.TestPropertyId,
//       TestProVal: pv.value,
//       BarCodeNo: pv.barcode,
//       LISVal: pv.lis,
//       Alart: pv.alert,
//     };

//     try {
//       {
//         // await axiosInstance.put(
//         //   `/testproval/${formData2.TestId}/${prop.TestPropertyId}/${formData2.CaseId}`,
//         //   payload
//         // );
//         await axiosInstance.post(`/testproval`, payload);
//         toast.success("Property saved successfully ");
//       }
//     } catch (err) {
//       console.error("Save failed", err);
//       toast.error("Failed to save property ");
//     }
//   };

//   const saveAllProperties = async () => {
//     if (!selectedTest) {
//       toast.error("Please select a test first");
//       return;
//     }
//     if (!propertyList.length) return;

//     try {
//       const requests = propertyList.map((prop) => {
//         const pv = propertyValueMap[prop.TestPropertyId];
//         if (!pv) return null;

//         const payload = {
//           CaseId: formData2.CaseId,
//           TestId: selectedTest?.TestId,
//           TestPropertyId: prop.TestPropertyId,
//           TestProVal: pv.value,
//           BarCodeNo: pv.barcode,
//           LISVal: pv.lis,
//           Alart: pv.alert,
//         };

//         return axiosInstance.put(
//           `/testproval/${selectedTest?.TestId}/${prop.TestPropertyId}/${formData2?.CaseId}`,
//           payload
//         );
//       });

//       // 🔥 null remove + parallel save
//       await Promise.all(requests.filter(Boolean));

//       toast.success("All properties Edited successfully");
//     } catch (err) {
//       console.error("Save all failed", err);
//       toast.error("Failed to edited all properties");
//     }
//   };
//   const createAllProperties = async () => {
//     // if (!propertyList.length) return;
//     if (!selectedTest) {
//       toast.error("Please select a test first");
//       return;
//     }

//     try {
//       const requests = propertyList.map((prop) => {
//         const pv = propertyValueMap[prop.TestPropertyId];
//         if (!pv) return null;

//         const payload = {
//           CaseId: formData2.CaseId,
//           TestId: selectedTest?.TestId,
//           TestPropertyId: prop.TestPropertyId,
//           TestProVal: pv.value,
//           BarCodeNo: pv.barcode,
//           LISVal: pv.lis,
//           Alart: pv.alert,
//         };

//         return axiosInstance.post(`/testproval`, payload);
//       });

//       // 🔥 null remove + parallel save
//       await Promise.all(requests.filter(Boolean));
//       const now = new Date().toISOString();
//       await axiosInstance.put(
//         `/case-dtl-01/${formData2.CaseId}/${selectedTest?.TestId}`,
//         {
//           ReportDate: now,
//         }
//       );
//       await fetchPropertyList(selectedTest?.TestId);
//       await fetchPropertyValues(formData2?.CaseId, selectedTest?.TestId);

//       await fetchTestDetails(formData2?.CaseId); // ⭐ MAIN FIX 

//       setSelectedTest((prev) => ({
//         ...prev,
//         ReportDate: now,
//       }));

//       toast.success("All properties created successfully");
//     } catch (err) {
//       console.error("Save all failed", err);
//       toast.error("Failed to create all properties");
//     }
//   };
//   // const getReferenceRange = (prop) => {
//   //   if (prop.ComMin != "" || prop.ComMax != "") {
//   //     return `${prop.ComMin ?? ""} - ${prop.ComMax ?? ""}`;
//   //   }

//   //   if ((prop.MaleMin != "" || prop.MaleMax != "") && formData2?.Sex == "M") {
//   //     return `${prop.MaleMin ?? ""} - ${prop.MaleMax ?? ""}`;
//   //   }

//   //   if (
//   //     (prop.FemaleMin != "" || (prop.FemaleMax != "" && formData2?.Sex)) &&
//   //     formData2?.Sex == "F"
//   //   ) {
//   //     return `${prop.FemaleMin ?? ""} - ${prop.FemaleMax ?? ""}`;
//   //   }

//   //   if (prop.ChildMin != "" || prop.ChildMax != "") {
//   //     return `${prop.ChildMin ?? ""} - ${prop.ChildMax ?? ""}`;
//   //   }

//   //   if (prop.Others) {
//   //     return prop.Others;
//   //   }

//   //   return "";
//   // };



// // const getReferenceRange = (prop) => {
// //     if ((prop.ComMin != "" && prop.ComMin != null) || (prop.ComMax != "" && prop.ComMax != null)) {
// //       return `${prop.ComMin ?? ""} - ${prop.ComMax ?? ""}`;
// //     }

// //     if ((prop.MaleMin != "" && prop.MaleMin != null) || (prop.MaleMax != "" && prop.MaleMax != null)) {
// //       return `${prop.MaleMin ?? ""} - ${prop.MaleMax ?? ""}-${prop.Others ?? ""}`;
// //     }

// //     if (
// //       (prop.FemaleMin != "" && prop.FemaleMin != null) || (prop.FemaleMax != "" && prop.FemaleMax != null && formData2?.Sex == "F")
// //     ) {
// //       return `${prop.FemaleMin ?? ""} - ${prop.FemaleMax ?? ""}-${prop.Others ?? ""}`;
// //     }

// //     if ((prop.ChildMin != "" && prop.ChildMin != null) || (prop.ChildMax != "" && prop.ChildMax != null)) {
// //       return `${prop.ChildMin ?? ""} - ${prop.ChildMax ?? ""}`;
// //     }

// //     if (prop.Others) {
// //       return prop.Others;
// //     }

// //     return "";
// //   };

// const getReferenceRange = (prop) => {
//     const {
//       ComMin,
//       ComMax,
//       MaleMin,
//       MaleMax,
//       FemaleMin,
//       FemaleMax,
//       ChildMin,
//       ChildMax,
//       Others,
//     } = prop || {};

//     const formatRange = (min, max) => {
//       if (min && max) return `${min} - ${max}`;
//       if (min) return `${min}`;
//       if (max) return `${max}`;
//       return "";
//     };

//     let result = [];

//     // Common range
//     const common = formatRange(ComMin, ComMax);
//     if (common) result.push(common);

//     // Gender based
//     if (formData2?.Sex === "M") {
//       const male = formatRange(MaleMin, MaleMax);
//       if (male) result.push(male);
//     }

//     if (formData2?.Sex === "F") {
//       const female = formatRange(FemaleMin, FemaleMax);
//       if (female) result.push(female);
//     }

//     // Others
//     if (Others) result.push(Others);

//     return result.join(" "); // clean join
//   };

//   // const handlePrint = () => { 
//   //   if (!selectedTest) {
//   //     toast.error("Please select a test first");
//   //     return;
//   //   }
//   //   console.log("hole", selectedTest);

//   //   const doc = new jsPDF("p", "mm", "a4");

//   //   doc.setFont("times", "normal");
//   //   doc.setFontSize(9);

//   //   const L = 15;
//   //   const R = 135;
//   //   let y = 75;

//   //   /* ================= BARCODE PLACEHOLDER ================= */
//   //   doc.setFillColor(230, 230, 230);
//   //   doc.rect(L, y, 60, 14, "F");
//   //   doc.setTextColor(0, 0, 0);

//   //   doc.text(formData2?.CaseNo || "", L + 4, y + 10);

//   //   /* ================= RIGHT AGE / SEX ================= */

//   //   // ================= AFTER BARCODE =================
//   //   const baseY = y + 18; // common baseline for both sides

//   //   // ===== LEFT SIDE =====
//   //   const labelX = L;
//   //   const colonX = L + 36;
//   //   const valueX = L + 40;

//   //   doc.text("Patient's Name", labelX, baseY);
//   //   doc.text(":", colonX, baseY);
//   //   doc.text(formData2?.PatientName || "", valueX, baseY);

//   //   doc.text("Case No.", labelX, baseY + 5);
//   //   doc.text(":", colonX, baseY + 5);
//   //   doc.text(formData2?.CaseNo || "", valueX, baseY + 5);
//   //   doc.addImage(barcodeImg, "PNG", L, y, 60, 14);

//   //   doc.text("Referred By", labelX, baseY + 10);
//   //   doc.text(":", colonX, baseY + 10);
//   //   doc.text(`${doctorMap[formData2.DoctorId] || ""}`, valueX, baseY + 10);

//   //   // ===== RIGHT SIDE =====
//   //   const rLabelX = R;
//   //   const rColonX = R + 40;
//   //   const rValueX = R + 44;

//   //   // Age / Sex (same row as Patient Name)
//   //   doc.text("Age", rLabelX, baseY);
//   //   doc.text(":", rColonX - 28, baseY);
//   //   doc.text(`${formData2?.Age || ""} Y`, rColonX - 24, baseY);

//   //   doc.text("Sex", rColonX - 2, baseY);
//   //   doc.text(":", rColonX + 8, baseY);
//   //   doc.text(formData2?.Sex || "", rColonX + 12, baseY);

//   //   // Dates (same rows as Case No / Referred By)
//   //   doc.text("Collection Date", rLabelX, baseY + 5);
//   //   doc.text(":", rColonX, baseY + 5);
//   //   // doc.text(selectedTest?.DeliveryDate || "", rValueX, baseY + 5);
//   //   doc.text(new Date().toISOString().split("T")[0], rValueX, baseY + 5);

//   //   doc.text("Reporting Date", rLabelX, baseY + 10);
//   //   doc.text(":", rColonX, baseY + 10);
//   //   doc.text(
//   //     selectedTest?.ReportDate?.split("T")[0] || "",
//   //     rValueX,
//   //     baseY + 10
//   //   );

//   //   // ===== MOVE CURSOR AFTER BOTH SIDES =====
//   //   y = baseY + 18;

//   //   /* ================= SEPARATOR LINE ================= */
//   //   doc.line(L, y, 195, y);

//   //   y += 8;

//   //   /* ================= TITLE ================= */
//   //   doc.setFont("times", "bold");
//   //   doc.text(selectedTest.Test, 105, y, { align: "center" });

//   //   y += 6;

//   //   /* ================= TABLE ================= */
//   //   doc.setFont("times", "normal");

//   //   autoTable(doc, {
//   //     startY: y,
//   //     theme: "plain",
//   //     styles: {
//   //       fontSize: 9,
//   //       cellPadding: 2,
//   //     },
//   //     head: [["INVESTIGATION", "RESULT", "UNIT", "REFERENCE RANGE"]],
//   //     body: propertyList.map((prop) => {
//   //       const pv = propertyValueMap[prop.TestPropertyId];
//   //       return [
//   //         prop.TestProperty || "",
//   //         pv?.value ?? "",
//   //         prop.Uom || "",
//   //         // pv?.lis ?? "-",
//   //         getReferenceRange(prop),
//   //         ,
//   //       ];
//   //     }),

//   //     columnStyles: {
//   //       0: { cellWidth: 70 },
//   //       1: { cellWidth: 25 },
//   //       2: { cellWidth: 20 },
//   //       3: { cellWidth: 60 },
//   //     },
//   //     didDrawPage: () => {
//   //       // header border
//   //       doc.rect(L, y - 1, 180, 8);
//   //     },
//   //   });

//   //   const finalY = doc.lastAutoTable.finalY + 10;

//   //   /* ================= FOOTER ================= */
//   //   doc.setFontSize(9);
//   //   doc.text("** End of Report **", 105, finalY, { align: "center" });

//   //   // doc.save(`${formData2?.CaseNo || "clinical_report"}.pdf`);

//   //   /* ====== OPEN AS BLOB ====== */
//   //   const pdfBlob = doc.output("blob");
//   //   const blobUrl = URL.createObjectURL(pdfBlob);

//   //   window.open(blobUrl, "_blank");

//   //   setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
//   // };
// //   const handlePrint = () => {
// //     if (!tests.length) {
// //       toast.error("No tests found");
// //       return;
// //     }

// //     const doc = new jsPDF("p", "mm", "a4");

// //     // ===== CONFIG =====
// //     const pageHeight = 297;
// //     const bottomMargin = 70;
// //     const topMargin = 50;
// //     const pageWidth = 210;
// //     const L = 15;
// //     const marginRight = 35;
// //     const R = 110;

// //     /* ================= HEADER ================= */
// //     const drawHeader = () => {
// //       let y = topMargin;

// //       doc.setFont("times", "normal");
// //       doc.setFontSize(10);

// //       // BARCODE
// //       doc.setFillColor(230, 230, 230);
// //       doc.rect(L, y, 60, 14, "F");

// //       doc.setFont("times", "bold");
// //       doc.text(formData2?.CaseNo || "", L + 4, y + 10);

// //       if (barcodeImg) {
// //         doc.addImage(barcodeImg, "PNG", L, y, 60, 14);
// //       }

// //       const baseY = y + 18;

// //       // LEFT
// //       doc.setFont("times", "normal");
// //       doc.text("Patient's Name", L, baseY);
// //       doc.text(":", L + 36, baseY);

// //       doc.setFont("times", "bold");
// //       doc.text(formData2?.PatientName || "", L + 40, baseY);

// //       doc.setFont("times", "normal");
// //       doc.text("Case No.", L, baseY + 5);
// //       doc.text(":", L + 36, baseY + 5);

// //       doc.setFont("times", "bold");
// //       doc.text(formData2?.CaseNo || "", L + 40, baseY + 5);

// //       doc.setFont("times", "normal");
// //       doc.text("Referred By", L, baseY + 10);
// //       doc.text(":", L + 36, baseY + 10);

// //       doc.setFont("times", "bold");
// //       doc.text(`${doctorMap[formData2.DoctorId] || ""}`, L + 40, baseY + 10);

// //       // RIGHT
// //       doc.setFont("times", "normal");
// //       doc.text("Age", R, baseY);
// //       doc.text(":", R + 12, baseY);

// //       doc.setFont("times", "bold");
// //       doc.text(`${formData2?.Age || ""} Y`, R + 16, baseY);

// //       doc.setFont("times", "normal");
// //       doc.text("Sex", R + 30, baseY);
// //       doc.text(":", R + 38, baseY);

// //       doc.setFont("times", "bold");
// //       doc.text(formData2?.Sex || "", R + 42, baseY);

// //       doc.setFont("times", "normal");
// //       doc.text("Collection Date", R, baseY + 5);
// //       doc.text(":", R + 40, baseY + 5);

// //       doc.setFont("times", "bold");
// //       doc.text(new Date().toISOString().split("T")[0], R + 44, baseY + 5);

// //       doc.setFont("times", "normal");
// //       doc.text("Reporting Date", R, baseY + 10);
// //       doc.text(":", R + 40, baseY + 10);

// //       doc.setFont("times", "bold");
// //       doc.text(
// //         selectedTest?.ReportDate?.split("T")[0] || "",
// //         R + 44,
// //         baseY + 10
// //       );

// //       // LINE
// //       doc.line(L, baseY + 18, pageWidth - marginRight, baseY + 18);

// //       return baseY + 25; // 👉 content start point
// //     };

// //     // 🔥 HEADER FIRST PAGE
// //     const headerEndY = drawHeader();
// //     let y = headerEndY;
// //  doc.text(SubDepartmentMap[tests[0].SubDepartmentId] || "", pageWidth / 2, y, {
// //       align: "center",
// //     });
// //     /* ================= LOOP TEST ================= */
// //     tests.forEach((test) => {
// //       const testData = allTestProperties[test.TestId];
// //       if (!testData) return;

// //       const { propertyList, propertyValueMap } = testData;

// //       /* ===== TITLE ===== */
// //       doc.setFont("times", "bold");
// //       doc.setFontSize(12);
// //       // doc.text(test.Test, pageWidth / 2, y, { align: "center" });

// //       y += 6;

// //       /* ===== TABLE ===== */
// //       autoTable(doc, {
// //         startY: y,

// //         margin: {
// //           top: headerEndY, // 🔥 SAME for all pages
// //           left: L,
// //           right: marginRight,
// //           bottom: bottomMargin,
// //         },

// //         pageBreak: "auto",

// //         theme: "plain",

// //         headStyles: {
// //           fontStyle: "bold",
// //         },

// //         styles: {
// //           fontSize: 9,
// //           cellPadding: 2,
// //         },

// //         head: [["INVESTIGATION", "RESULT", "UNIT", "REFERENCE RANGE"]],

// //         body: propertyList.map((prop) => {
// //           const pv = propertyValueMap[prop.TestPropertyId];

// //           return [
// //             prop.TestProperty || "",
// //             pv?.value ?? "",
// //             prop.Uom || "",
// //             getReferenceRange(prop),
// //           ];
// //         }),

// //         columnStyles: {
// //           0: { cellWidth: 70 },
// //           1: { cellWidth: 25 },
// //           2: { cellWidth: 20 },
// //           3: { cellWidth: 60 },
// //         },

// //         // 🔥 HEADER EVERY PAGE (BEFORE CONTENT)
// //         willDrawPage: () => {
// //           drawHeader();
// //         },
// //       });

// //       y = doc.lastAutoTable.finalY + 10;
// //     });

// //     /* ================= FOOTER ================= */
// //     // const finalY = doc.lastAutoTable.finalY + 10;
// //         const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 10;


// //     doc.setFontSize(9);
// //     doc.text("** End of Report **", pageWidth / 2, finalY, {
// //       align: "center",
// //     });

// //     /* ================= OPEN PDF ================= */
// //     const blobUrl = URL.createObjectURL(doc.output("blob"));
// //     window.open(blobUrl, "_blank");

// //     setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
// //   };

// // 4/4/2026-----
// const handlePrint = () => {
//     if (!selectedTests.length) {
//       toast.error("No tests found");
//       return;
//     }

//     const doc = new jsPDF("p", "mm", "a4");

//     // ===== CONFIG =====
//     const pageHeight = 297;
//     const bottomMargin = 70;
//     const topMargin = 50;
//     const pageWidth = 210;
//     const L = 15;
//     const marginRight = 35;
//     const R = 110;

//     /* ================= HEADER ================= */
//     const drawHeader = () => {
//       let y = topMargin;

//       doc.setFont("times", "normal");
//       doc.setFontSize(10);

//       doc.setFillColor(230, 230, 230);
//       doc.rect(L, y, 60, 14, "F");

//       doc.setFont("times", "bold");
//       doc.text(formData2?.CaseNo || "", L + 4, y + 10);

//       if (barcodeImg) {
//         doc.addImage(barcodeImg, "PNG", L, y, 60, 14);
//       }

//       const baseY = y + 18;

//       doc.setFont("times", "normal");
//       doc.text("Patient's Name", L, baseY);
//       doc.text(":", L + 36, baseY);

//       doc.setFont("times", "bold");
//       doc.text(formData2?.PatientName || "", L + 40, baseY);

//       doc.setFont("times", "normal");
//       doc.text("Case No.", L, baseY + 5);
//       doc.text(":", L + 36, baseY + 5);

//       doc.setFont("times", "bold");
//       doc.text(formData2?.CaseNo || "", L + 40, baseY + 5);

//       doc.setFont("times", "normal");
//       doc.text("Referred By", L, baseY + 10);
//       doc.text(":", L + 36, baseY + 10);

//       doc.setFont("times", "bold");
//       doc.text(`${doctorMap[formData2.DoctorId] || ""}`, L + 40, baseY + 10);

//       doc.setFont("times", "normal");
//       doc.text("Age", R, baseY);
//       doc.text(":", R + 12, baseY);

//       doc.setFont("times", "bold");
//       doc.text(`${formData2?.Age || ""} Y`, R + 16, baseY);

//       doc.setFont("times", "normal");
//       doc.text("Sex", R + 30, baseY);
//       doc.text(":", R + 38, baseY);

//       doc.setFont("times", "bold");
//       doc.text(formData2?.Sex || "", R + 42, baseY);

//       doc.setFont("times", "normal");
//       doc.text("Collection Date", R, baseY + 5);
//       doc.text(":", R + 40, baseY + 5);

//       doc.setFont("times", "bold");
//       doc.text(DateFormatter(new Date()), R + 44, baseY + 5);

//       doc.setFont("times", "normal");
//       doc.text("Reporting Date", R, baseY + 10);
//       doc.text(":", R + 40, baseY + 10);

//       doc.setFont("times", "bold");
//       doc.text(DateFormatter(selectedTest?.ReportDate), R + 44, baseY + 10);

//       doc.line(L, baseY + 18, pageWidth - marginRight, baseY + 18);

//       return baseY + 25;
//     };

//     // HEADER FIRST PAGE
//     const headerEndY = drawHeader();
//     let y = headerEndY;

//     doc.text(
//       SubDepartmentMap[tests[0].SubDepartmentId] || "",
//       pageWidth / 2,
//       y,
//       { align: "center" }
//     );

//     y += 6;

//     /* ================= 🔥 SINGLE TABLE ================= */

//     const finalBody = [];

//     selectedTests.forEach((test) => {
//       const testData = allTestProperties[test.TestId];
//       if (!testData) return;

//       const { propertyList, propertyValueMap } = testData;

//       // Test Name Row
//       // finalBody.push([
//       //   { content: test.Test, colSpan: 4, styles: { fontStyle: "bold" } },
//       // ]);

//       propertyList.forEach((prop) => {
//         const pv = propertyValueMap[prop.TestPropertyId];

//         finalBody.push([
//           prop.TestProperty || "",
//           pv?.value ?? "",
//           prop.Uom || "",
//           getReferenceRange(prop),
//         ]);
//       });
//     });

//     autoTable(doc, {
//       startY: y,

//       margin: {
//         top: headerEndY,
//         left: L,
//         right: marginRight,
//         bottom: bottomMargin,
//       },

//       theme: "plain",

//       head: [["INVESTIGATION", "RESULT", "UNIT", "REFERENCE RANGE"]],

      
//       showHead: "everyPage",

//       styles: {
//         fontSize: 9,
//         cellPadding: 2,
//       },

//       columnStyles: {
//         0: { cellWidth: 70 },
//         1: { cellWidth: 25 },
//         2: { cellWidth: 20 },
//         3: { cellWidth: 60 },
//       },

//       body: finalBody,

//       willDrawPage: () => {
//         drawHeader();
//       },
//     });

//     /* ================= FOOTER ================= */
//     const finalY = doc.lastAutoTable.finalY + 10;

//     doc.setFontSize(9);
//     doc.text("** End of Report **", pageWidth / 2, finalY, {
//       align: "center",
//     });

//     /* ================= OPEN PDF ================= */
//     const blobUrl = URL.createObjectURL(doc.output("blob"));
//     window.open(blobUrl, "_blank");

//     setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
//   };
//   return (
//     <>
//       {/* ================= BASIC INFO ================= */}
//       <div className="row g-2 mb-2 align-items-end">
//         <div className="col-md-2">
//           <label className="form-label mb-0">Case No.pppppp</label>
//           <input
//             value={formData2?.CaseNo || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-2">
//           <label className="form-label mb-0">Patient Id</label>
//           <input
//             value={formData2?.PatientId || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-3">
//           <label className="form-label mb-0">Patient Name</label>
//           <input
//             value={formData2?.PatientName || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-3 ms-auto text-end">
//           {barcodeImg && <img src={barcodeImg} alt="barcode" />}
//         </div>
//       </div>

//       {/* ================= PATHOLOGIST ================= */}
//       <div className="row g-2 mb-3">
//         <div className="col-md-4">
//           <label className="form-label mb-0">Pathologist</label>
//           <ApiSelect
//             api="/pathologist"
//             labelKey="Pathologist"
//             valueKey="PathologistId"
//             value={pathologistId}
//             onChange={(val) => {
//               setPathologistId(val);

//               const selected = pathologistList.find(
//                 (p) => p.PathologistId === val
//               );

//               setPathologistName(selected?.Pathologist || "");
//             }}
//           />
//         </div>
//       </div>

//       {/* ================= TEST TABLE ================= */}
//       <div className="table-responsive mb-3 shadow-sm rounded">
//         <table className="table table-hover align-middle text-center mb-1">
//           <thead className="table-info">
//             <tr>
//               <th className="fw-semibold">Print</th>
//               <th className="fw-semibold">Test Name</th>
//               <th className="fw-semibold">Report Date</th>
//               <th className="fw-semibold">Test Detail</th>
//               <th className="fw-semibold">Special Remarks</th>
//               <th className="fw-semibold">Value</th>
//               <th className="fw-semibold">Report Time</th>
//             </tr>
//           </thead>

//           {/* <tbody>
//             <tr>
//               <td>{formData2?.Test}</td>
//               <td>{formData2?.ReportDate}</td>
//               <td className="text-primary">Click Here To Enter Result</td>
//               <td></td>
//               <td></td>
//               <td>{formData2?.ReportTime}</td>
//             </tr>

//             <tr>
//               <td colSpan={6} style={{ height: 120 }}></td>
//             </tr>
//           </tbody> */}
//           <tbody>
//             {tests.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="text-muted py-4">No test found</td>
//               </tr>
//             ) : (
//               tests.map((test, index) => (
//                 <tr
//                   className={`${
//                     test.TestId === selectedTest?.TestId ? "table-warning" : ""
//                   }`}
//                   key={index}
//                   style={{
//                     cursor: "pointer",
//                   }}
//                   onClick={async () => {
//                     setSelectedTest(test);

//                     const props = await fetchPropertyList(test?.TestId);
//                     const values = await fetchPropertyValues(
//                       formData2?.CaseId,
//                       test?.TestId
//                     );

                  
//                     setAllTestProperties((prev) => ({
//                       ...prev,
//                       [test.TestId]: {
//                         propertyList: props || [],
//                         propertyValueMap: values || {},
//                       },
//                     }));
//                   }}
//                 >
//                   <td >
//                     <input
//                       type="checkbox"
//                       checked={selectedTests.some(
//                         (t) => t.TestId === test.TestId
//                       )}
//                       onChange={() => handleSelectTest(test)}
//                     />
//                   </td>
//                   <td className="fw-medium text-start">{test?.Test}</td>
//                   <td  className="text-muted">{test?.ReportDate?.split("T")[0]}</td>
//                  <td className="badge bg-danger text-white  px-2 py-3 rounded-3">
//                     Click Here Before Entery
//                   </td>
//                   <td></td>
//                   <td></td>
//                   <td>{test?.ReportTime}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ================= PROPERTY PANEL ================= */}
//       <div className="table-responsive mb-3 shadow-sm rounded">
//         <table className="table table-hover align-middle mb-0">
//           <thead table-dark text-center>
//             <tr>
//               <th className="fw-semibold text-start">Test Property</th>
//               <th className="fw-semibold">Value</th>
//               <th className="fw-semibold">UOM</th>
//               <th className="fw-semibold">LIS Val</th>
//               <th className="fw-semibold">action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {propertyList.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="text-center text-muted py-3">
//                   No property found
//                 </td>
//               </tr>
//             ) : (
//               propertyList.map((prop, index) => (
//                 <tr key={index}>
//                   <td  className="fw-medium text-start">{prop.TestProperty}</td>
//                   <td style={{ minWidth: "150px" }}>
//                     <input
//                       className="form-control form-control-sm  border-primary-subtle"
//                       type="text"
//                       value={propertyValueMap[prop.TestPropertyId]?.value ?? ""}
//                       onChange={(e) =>
//                         handlePropertyChange(
//                           prop.TestPropertyId,
//                           "value",
//                           e.target.value
//                         )
//                       }
//                     />
//                     {/* {propertyValueMap[prop.TestPropertyId]?.value ?? ""} */}
//                   </td>
//                   <td className="text-muted fw-semibold">{prop.Uom}</td>

//                   <td style={{ minWidth: "150px" }}>
//                     <input
//                       className="form-control form-control-sm border-success-subtle"
//                       value={propertyValueMap[prop.TestPropertyId]?.lis ?? ""}
//                       onChange={(e) =>
//                         handlePropertyChange(
//                           prop.TestPropertyId,
//                           "lis",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </td>
//                   <td className="text-center">
//                     <button
//                       className="btn btn-sm btn-success"
//                       onClick={() => saveProperty(prop)}
//                     >
//                       Edit & Save
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//       <div>
//         <button
//           className="btn btn-sm btn-outline-primary"
//           onClick={handlePrint}
//         >
//           Print
//         </button>

//         {/* <div className="d-flex justify-content-end mb-2">
//           <label className="text-danger" htmlFor="">
//             Always Use This for First Time Entry:
//           </label>
//           <div className="d-flex gap-2 mt-4">
//             <button
//               type="submit"
//               className="btn btn-primary "
//               onClick={createAllProperties}
//             >
//               Save All
//             </button>
            
//           </div>
//         </div> */}
//         <div className="d-flex justify-content-end mb-3">
//   <div className="bg-light border rounded p-3 shadow-sm text-end">
    
//     <div className="text-danger fw-semibold small mb-2">
//       ⚠️ Always Use This for First Time Entry
//     </div>

//     <div className="d-flex justify-content-end gap-2">
//       <button
//         type="submit"
//         className="btn btn-primary btn-sm"
//         onClick={createAllProperties}
//       >
//         💾 Save All
//       </button>

      
//     </div>

//   </div>
// </div>
//       </div>
//       {/* ================= ACTION BUTTONS ================= */}
//     </>
//   );
// };

// export default GeneralTestDrawer;





















// 


import { tr } from "date-fns/locale";
import ApiSelect from "./ApiSelect";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import JsBarcode from "jsbarcode";
import { useEffect, useMemo, useState } from "react";
import useAxiosFetch from "./Fetch";
import { DateFormatter } from "./DateFormatter";

const GeneralTestDrawer = ({
  formData2,
  tests = [],
  propertyList = [],
  propertyValueMap = {},
  handlePropertyChange,
  fetchPropertyList,
  fetchPropertyValues,
  fetchTestDetails,
}) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printData, setPrintData] = useState({});
  const [editableResults, setEditableResults] = useState([]);

  const barcodeImg = useMemo(() => {
    if (!formData2.CaseNo) return "";
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, formData2.CaseNo, {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: true,
    });
    return canvas.toDataURL("image/png");
  }, [formData2?.CaseNo]);


let pathologist = JSON.parse(localStorage.getItem("SelectedPathologistData")) || {};

const getSignatureBase64 = (signatureObj) => {
  if (!signatureObj || !signatureObj.data || !Array.isArray(signatureObj.data)) return "";
  const binary = new Uint8Array(signatureObj.data);
  let binaryString = "";
  for (let i = 0; i < binary.length; i++) {
    binaryString += String.fromCharCode(binary[i]);
  }
  return `data:image/jpeg;base64,${btoa(binaryString)}`;
};

const signatureBase64ForPrint = pathologist?.SignatureBase64 || (pathologist?.Signature ? getSignatureBase64(pathologist.Signature) : "");


  const [selectedTests, setSelectedTests] = useState([]);
const handleSelectTest = (test) => {
  setSelectedTests((prev) => {
    const exists = prev.find((t) => t.TestId === test.TestId);

    if (exists) {
      // remove
      return prev.filter((t) => t.TestId !== test.TestId);
    } else {
      // add
      return [...prev, test];
    }
  });
};
  const { data: doctors } = useAxiosFetch(
    "/doctormaster?page=1&limit=10000",
    []
  );


  const { data: subDeps } = useAxiosFetch(
    "/subdepartment",
    []
  );

  let SubDepartmentMap = useMemo(() => {
    const map = {};
    (subDeps || []).forEach((sd) => {
      map[sd.SubDepartmentId] = sd.SubDepartment;
    });
    return map;
  }, [subDeps]);
  //  console.log("doctors",doctors);
  const doctorMap = useMemo(() => {
    const map = {};
    (doctors || []).forEach((d) => {
      map[d.DoctorId] = d.Doctor;
    });
    return map;
  }, [doctors]);

  const [selectedTest, setSelectedTest] = useState(null);
    const [allTestProperties, setAllTestProperties] = useState({});


  const [pathologistId, setPathologistId] = useState(null);
  const [pathologistName, setPathologistName] = useState("");

  const [pathologistList, setPathologistList] = useState([]);

  useEffect(() => {
    fetch("/pathologist")
      .then((res) => res.json())
      .then((data) => {
        setPathologistList(Array.isArray(data) ? data : data.data || []);
      });
  }, []);

  const saveProperty = async (prop) => {
    const pv = propertyValueMap[prop.TestPropertyId];
    if (!pv) return;

    const payload = {
      CaseId: formData2.CaseId,
      TestId: selectedTest?.TestId,
      TestPropertyId: prop.TestPropertyId,
      TestProVal: pv.value,
      BarCodeNo: pv.barcode,
      LISVal: pv.lis,
      Alart: pv.alert,
    };

    try {
      {
        // await axiosInstance.put(
        //   `/testproval/${formData2.TestId}/${prop.TestPropertyId}/${formData2.CaseId}`,
        //   payload
        // );
        await axiosInstance.post(`/testproval`, payload);
        toast.success("Property saved successfully ");
      }
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save property ");
    }
  };

  const saveAllProperties = async () => {
    if (!selectedTest) {
      toast.error("Please select a test first");
      return;
    }
    if (!propertyList.length) return;

    try {
      const requests = propertyList.map((prop) => {
        const pv = propertyValueMap[prop.TestPropertyId];
        if (!pv) return null;

        const payload = {
          CaseId: formData2.CaseId,
          TestId: selectedTest?.TestId,
          TestPropertyId: prop.TestPropertyId,
          TestProVal: pv.value,
          BarCodeNo: pv.barcode,
          LISVal: pv.lis,
          Alart: pv.alert,
        };

        return axiosInstance.put(
          `/testproval/${selectedTest?.TestId}/${prop.TestPropertyId}/${formData2?.CaseId}`,
          payload
        );
      });

      // 🔥 null remove + parallel save
      await Promise.all(requests.filter(Boolean));

      toast.success("All properties Edited successfully");
    } catch (err) {
      console.error("Save all failed", err);
      toast.error("Failed to edited all properties");
    }
  };
  const createAllProperties = async () => {
    // if (!propertyList.length) return;
    if (!selectedTest) {
      toast.error("Please select a test first");
      return;
    }

    try {
      const requests = propertyList.map((prop) => {
        const pv = propertyValueMap[prop.TestPropertyId];
        if (!pv) return null;

        const payload = {
          CaseId: formData2.CaseId,
          TestId: selectedTest?.TestId,
          TestPropertyId: prop.TestPropertyId,
          TestProVal: pv.value,
          BarCodeNo: pv.barcode,
          LISVal: pv.lis,
          Alart: pv.alert,
        };

        return axiosInstance.post(`/testproval`, payload);
      });

      // 🔥 null remove + parallel save
      await Promise.all(requests.filter(Boolean));
      const now = new Date().toISOString();
      await axiosInstance.put(
        `/case-dtl-01/${formData2.CaseId}/${selectedTest?.TestId}`,
        {
          ReportDate: now,
        }
      );
      await fetchPropertyList(selectedTest?.TestId);
      await fetchPropertyValues(formData2?.CaseId, selectedTest?.TestId);

      await fetchTestDetails(formData2?.CaseId); // ⭐ MAIN FIX 

      setSelectedTest((prev) => ({
        ...prev,
        ReportDate: now,
      }));

      toast.success("All properties created successfully");
    } catch (err) {
      console.error("Save all failed", err);
      toast.error("Failed to create all properties");
    }
  };
  // const getReferenceRange = (prop) => {
  //   if (prop.ComMin != "" || prop.ComMax != "") {
  //     return `${prop.ComMin ?? ""} - ${prop.ComMax ?? ""}`;
  //   }

  //   if ((prop.MaleMin != "" || prop.MaleMax != "") && formData2?.Sex == "M") {
  //     return `${prop.MaleMin ?? ""} - ${prop.MaleMax ?? ""}`;
  //   }

  //   if (
  //     (prop.FemaleMin != "" || (prop.FemaleMax != "" && formData2?.Sex)) &&
  //     formData2?.Sex == "F"
  //   ) {
  //     return `${prop.FemaleMin ?? ""} - ${prop.FemaleMax ?? ""}`;
  //   }

  //   if (prop.ChildMin != "" || prop.ChildMax != "") {
  //     return `${prop.ChildMin ?? ""} - ${prop.ChildMax ?? ""}`;
  //   }

  //   if (prop.Others) {
  //     return prop.Others;
  //   }

  //   return "";
  // };



// const getReferenceRange = (prop) => {
//     if ((prop.ComMin != "" && prop.ComMin != null) || (prop.ComMax != "" && prop.ComMax != null)) {
//       return `${prop.ComMin ?? ""} - ${prop.ComMax ?? ""}`;
//     }

//     if ((prop.MaleMin != "" && prop.MaleMin != null) || (prop.MaleMax != "" && prop.MaleMax != null)) {
//       return `${prop.MaleMin ?? ""} - ${prop.MaleMax ?? ""}-${prop.Others ?? ""}`;
//     }

//     if (
//       (prop.FemaleMin != "" && prop.FemaleMin != null) || (prop.FemaleMax != "" && prop.FemaleMax != null && formData2?.Sex == "F")
//     ) {
//       return `${prop.FemaleMin ?? ""} - ${prop.FemaleMax ?? ""}-${prop.Others ?? ""}`;
//     }

//     if ((prop.ChildMin != "" && prop.ChildMin != null) || (prop.ChildMax != "" && prop.ChildMax != null)) {
//       return `${prop.ChildMin ?? ""} - ${prop.ChildMax ?? ""}`;
//     }

//     if (prop.Others) {
//       return prop.Others;
//     }

//     return "";
//   };

const getReferenceRange = (prop) => {
    const {
      ComMin,
      ComMax,
      MaleMin,
      MaleMax,
      FemaleMin,
      FemaleMax,
      ChildMin,
      ChildMax,
      Others,
    } = prop || {};

    const formatRange = (min, max) => {
      if (min && max) return `${min} - ${max}`;
      if (min) return `${min}`;
      if (max) return `${max}`;
      return "";
    };

    let result = [];

    // Common range
    const common = formatRange(ComMin, ComMax);
    if (common) result.push(common);

    // Gender based
    if (formData2?.Sex === "M") {
      const male = formatRange(MaleMin, MaleMax);
      if (male) result.push(male);
    }

    if (formData2?.Sex === "F") {
      const female = formatRange(FemaleMin, FemaleMax);
      if (female) result.push(female);
    }

    // Others
    if (Others) result.push(Others);

    return result.join(" "); // clean join
  };

  // const handlePrint = () => { 
  //   if (!selectedTest) {
  //     toast.error("Please select a test first");
  //     return;
  //   }
  //   console.log("hole", selectedTest);

  //   const doc = new jsPDF("p", "mm", "a4");

  //   doc.setFont("times", "normal");
  //   doc.setFontSize(9);

  //   const L = 15;
  //   const R = 135;
  //   let y = 75;

  //   /* ================= BARCODE PLACEHOLDER ================= */
  //   doc.setFillColor(230, 230, 230);
  //   doc.rect(L, y, 60, 14, "F");
  //   doc.setTextColor(0, 0, 0);

  //   doc.text(formData2?.CaseNo || "", L + 4, y + 10);

  //   /* ================= RIGHT AGE / SEX ================= */

  //   // ================= AFTER BARCODE =================
  //   const baseY = y + 18; // common baseline for both sides

  //   // ===== LEFT SIDE =====
  //   const labelX = L;
  //   const colonX = L + 36;
  //   const valueX = L + 40;

  //   doc.text("Patient's Name", labelX, baseY);
  //   doc.text(":", colonX, baseY);
  //   doc.text(formData2?.PatientName || "", valueX, baseY);

  //   doc.text("Case No.", labelX, baseY + 5);
  //   doc.text(":", colonX, baseY + 5);
  //   doc.text(formData2?.CaseNo || "", valueX, baseY + 5);
  //   doc.addImage(barcodeImg, "PNG", L, y, 60, 14);

  //   doc.text("Referred By", labelX, baseY + 10);
  //   doc.text(":", colonX, baseY + 10);
  //   doc.text(`${doctorMap[formData2.DoctorId] || ""}`, valueX, baseY + 10);

  //   // ===== RIGHT SIDE =====
  //   const rLabelX = R;
  //   const rColonX = R + 40;
  //   const rValueX = R + 44;

  //   // Age / Sex (same row as Patient Name)
  //   doc.text("Age", rLabelX, baseY);
  //   doc.text(":", rColonX - 28, baseY);
  //   doc.text(`${formData2?.Age || ""} Y`, rColonX - 24, baseY);

  //   doc.text("Sex", rColonX - 2, baseY);
  //   doc.text(":", rColonX + 8, baseY);
  //   doc.text(formData2?.Sex || "", rColonX + 12, baseY);

  //   // Dates (same rows as Case No / Referred By)
  //   doc.text("Collection Date", rLabelX, baseY + 5);
  //   doc.text(":", rColonX, baseY + 5);
  //   // doc.text(selectedTest?.DeliveryDate || "", rValueX, baseY + 5);
  //   doc.text(new Date().toISOString().split("T")[0], rValueX, baseY + 5);

  //   doc.text("Reporting Date", rLabelX, baseY + 10);
  //   doc.text(":", rColonX, baseY + 10);
  //   doc.text(
  //     selectedTest?.ReportDate?.split("T")[0] || "",
  //     rValueX,
  //     baseY + 10
  //   );

  //   // ===== MOVE CURSOR AFTER BOTH SIDES =====
  //   y = baseY + 18;

  //   /* ================= SEPARATOR LINE ================= */
  //   doc.line(L, y, 195, y);

  //   y += 8;

  //   /* ================= TITLE ================= */
  //   doc.setFont("times", "bold");
  //   doc.text(selectedTest.Test, 105, y, { align: "center" });

  //   y += 6;

  //   /* ================= TABLE ================= */
  //   doc.setFont("times", "normal");

  //   autoTable(doc, {
  //     startY: y,
  //     theme: "plain",
  //     styles: {
  //       fontSize: 9,
  //       cellPadding: 2,
  //     },
  //     head: [["INVESTIGATION", "RESULT", "UNIT", "REFERENCE RANGE"]],
  //     body: propertyList.map((prop) => {
  //       const pv = propertyValueMap[prop.TestPropertyId];
  //       return [
  //         prop.TestProperty || "",
  //         pv?.value ?? "",
  //         prop.Uom || "",
  //         // pv?.lis ?? "-",
  //         getReferenceRange(prop),
  //         ,
  //       ];
  //     }),

  //     columnStyles: {
  //       0: { cellWidth: 70 },
  //       1: { cellWidth: 25 },
  //       2: { cellWidth: 20 },
  //       3: { cellWidth: 60 },
  //     },
  //     didDrawPage: () => {
  //       // header border
  //       doc.rect(L, y - 1, 180, 8);
  //     },
  //   });

  //   const finalY = doc.lastAutoTable.finalY + 10;

  //   /* ================= FOOTER ================= */
  //   doc.setFontSize(9);
  //   doc.text("** End of Report **", 105, finalY, { align: "center" });

  //   // doc.save(`${formData2?.CaseNo || "clinical_report"}.pdf`);

  //   /* ====== OPEN AS BLOB ====== */
  //   const pdfBlob = doc.output("blob");
  //   const blobUrl = URL.createObjectURL(pdfBlob);

  //   window.open(blobUrl, "_blank");

  //   setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  // };
//   const handlePrint = () => {
//     if (!tests.length) {
//       toast.error("No tests found");
//       return;
//     }

//     const doc = new jsPDF("p", "mm", "a4");

//     // ===== CONFIG =====
//     const pageHeight = 297;
//     const bottomMargin = 70;
//     const topMargin = 50;
//     const pageWidth = 210;
//     const L = 15;
//     const marginRight = 35;
//     const R = 110;

//     /* ================= HEADER ================= */
//     const drawHeader = () => {
//       let y = topMargin;

//       doc.setFont("times", "normal");
//       doc.setFontSize(10);

//       // BARCODE
//       doc.setFillColor(230, 230, 230);
//       doc.rect(L, y, 60, 14, "F");

//       doc.setFont("times", "bold");
//       doc.text(formData2?.CaseNo || "", L + 4, y + 10);

//       if (barcodeImg) {
//         doc.addImage(barcodeImg, "PNG", L, y, 60, 14);
//       }

//       const baseY = y + 18;

//       // LEFT
//       doc.setFont("times", "normal");
//       doc.text("Patient's Name", L, baseY);
//       doc.text(":", L + 36, baseY);

//       doc.setFont("times", "bold");
//       doc.text(formData2?.PatientName || "", L + 40, baseY);

//       doc.setFont("times", "normal");
//       doc.text("Case No.", L, baseY + 5);
//       doc.text(":", L + 36, baseY + 5);

//       doc.setFont("times", "bold");
//       doc.text(formData2?.CaseNo || "", L + 40, baseY + 5);

//       doc.setFont("times", "normal");
//       doc.text("Referred By", L, baseY + 10);
//       doc.text(":", L + 36, baseY + 10);

//       doc.setFont("times", "bold");
//       doc.text(`${doctorMap[formData2.DoctorId] || ""}`, L + 40, baseY + 10);

//       // RIGHT
//       doc.setFont("times", "normal");
//       doc.text("Age", R, baseY);
//       doc.text(":", R + 12, baseY);

//       doc.setFont("times", "bold");
//       doc.text(`${formData2?.Age || ""} Y`, R + 16, baseY);

//       doc.setFont("times", "normal");
//       doc.text("Sex", R + 30, baseY);
//       doc.text(":", R + 38, baseY);

//       doc.setFont("times", "bold");
//       doc.text(formData2?.Sex || "", R + 42, baseY);

//       doc.setFont("times", "normal");
//       doc.text("Collection Date", R, baseY + 5);
//       doc.text(":", R + 40, baseY + 5);

//       doc.setFont("times", "bold");
//       doc.text(new Date().toISOString().split("T")[0], R + 44, baseY + 5);

//       doc.setFont("times", "normal");
//       doc.text("Reporting Date", R, baseY + 10);
//       doc.text(":", R + 40, baseY + 10);

//       doc.setFont("times", "bold");
//       doc.text(
//         selectedTest?.ReportDate?.split("T")[0] || "",
//         R + 44,
//         baseY + 10
//       );

//       // LINE
//       doc.line(L, baseY + 18, pageWidth - marginRight, baseY + 18);

//       return baseY + 25; // 👉 content start point
//     };

//     // 🔥 HEADER FIRST PAGE
//     const headerEndY = drawHeader();
//     let y = headerEndY;
//  doc.text(SubDepartmentMap[tests[0].SubDepartmentId] || "", pageWidth / 2, y, {
//       align: "center",
//     });
//     /* ================= LOOP TEST ================= */
//     tests.forEach((test) => {
//       const testData = allTestProperties[test.TestId];
//       if (!testData) return;

//       const { propertyList, propertyValueMap } = testData;

//       /* ===== TITLE ===== */
//       doc.setFont("times", "bold");
//       doc.setFontSize(12);
//       // doc.text(test.Test, pageWidth / 2, y, { align: "center" });

//       y += 6;

//       /* ===== TABLE ===== */
//       autoTable(doc, {
//         startY: y,

//         margin: {
//           top: headerEndY, // 🔥 SAME for all pages
//           left: L,
//           right: marginRight,
//           bottom: bottomMargin,
//         },

//         pageBreak: "auto",

//         theme: "plain",

//         headStyles: {
//           fontStyle: "bold",
//         },

//         styles: {
//           fontSize: 9,
//           cellPadding: 2,
//         },

//         head: [["INVESTIGATION", "RESULT", "UNIT", "REFERENCE RANGE"]],

//         body: propertyList.map((prop) => {
//           const pv = propertyValueMap[prop.TestPropertyId];

//           return [
//             prop.TestProperty || "",
//             pv?.value ?? "",
//             prop.Uom || "",
//             getReferenceRange(prop),
//           ];
//         }),

//         columnStyles: {
//           0: { cellWidth: 70 },
//           1: { cellWidth: 25 },
//           2: { cellWidth: 20 },
//           3: { cellWidth: 60 },
//         },

//         // 🔥 HEADER EVERY PAGE (BEFORE CONTENT)
//         willDrawPage: () => {
//           drawHeader();
//         },
//       });

//       y = doc.lastAutoTable.finalY + 10;
//     });

//     /* ================= FOOTER ================= */
//     // const finalY = doc.lastAutoTable.finalY + 10;
//         const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 10;


//     doc.setFontSize(9);
//     doc.text("** End of Report **", pageWidth / 2, finalY, {
//       align: "center",
//     });

//     /* ================= OPEN PDF ================= */
//     const blobUrl = URL.createObjectURL(doc.output("blob"));
//     window.open(blobUrl, "_blank");

//     setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
//   };

// Open editable preview instead of direct PDF
const openPrintPreview = () => {
    if (!selectedTests.length) {
      toast.error("No tests found");
      return;
    }

    // Build editable results from allTestProperties
    const rows = [];
    selectedTests.forEach((test) => {
      const testData = allTestProperties[test.TestId];
      if (!testData) return;
      const { propertyList: pl, propertyValueMap: pvm } = testData;
      pl.forEach((prop) => {
        const pv = pvm[prop.TestPropertyId];
        rows.push({
          testName: test.Test,
          investigation: prop.TestProperty || "",
          result: pv?.value ?? "",
          unit: prop.Uom || "",
          referenceRange: getReferenceRange(prop),
        });
      });
    });

    setPrintData({
      PatientName: formData2?.PatientName || "",
      CaseNo: formData2?.CaseNo || "",
      Age: formData2?.Age || "",
      Sex: formData2?.Sex || "",
      ReferredBy: doctorMap[formData2?.DoctorId] || "",
      CollectionDate: DateFormatter(new Date()),
      ReportingDate: DateFormatter(selectedTest?.ReportDate),
      SubDepartment: SubDepartmentMap[tests[0]?.SubDepartmentId] || "",
    });
    setEditableResults(rows);
    setShowPrintPreview(true);
  };

const handleEditableResultChange = (index, field, value) => {
    setEditableResults((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

// 4/4/2026-----
const handlePrint = () => {
    const signatureBase64 = signatureBase64ForPrint;
    const doc = new jsPDF("p", "mm", "a4");

    // ===== CONFIG =====
    const pageHeight = 297;
    const bottomMargin = 70;
    const topMargin = 50;
    const pageWidth = 210;
    const L = 15;
    const marginRight = 35;
    const R = 110;

    /* ================= HEADER ================= */
    const drawHeader = () => {
      let y = topMargin;

      doc.setFont("times", "normal");
      doc.setFontSize(10);

      doc.setFillColor(230, 230, 230);
      doc.rect(L, y, 60, 14, "F");

      doc.setFont("times", "bold");
      doc.text(formData2?.CaseNo || "", L + 4, y + 10);

      if (barcodeImg) {
        doc.addImage(barcodeImg, "PNG", L, y, 60, 14);
      }

      const baseY = y + 18;

      doc.setFont("times", "normal");
      doc.text("Patient's Name", L, baseY);
      doc.text(":", L + 36, baseY);

      doc.setFont("times", "bold");
      doc.text(printData.PatientName || "", L + 40, baseY);

      doc.setFont("times", "normal");
      doc.text("Case No.", L, baseY + 5);
      doc.text(":", L + 36, baseY + 5);

      doc.setFont("times", "bold");
      doc.text(printData.CaseNo || "", L + 40, baseY + 5);

      doc.setFont("times", "normal");
      doc.text("Referred By", L, baseY + 10);
      doc.text(":", L + 36, baseY + 10);

      doc.setFont("times", "bold");
      doc.text(printData.ReferredBy || "", L + 40, baseY + 10);

      doc.setFont("times", "normal");
      doc.text("Age", R, baseY);
      doc.text(":", R + 12, baseY);

      doc.setFont("times", "bold");
      doc.text(`${printData.Age || ""} Y`, R + 16, baseY);

      doc.setFont("times", "normal");
      doc.text("Sex", R + 30, baseY);
      doc.text(":", R + 38, baseY);

      doc.setFont("times", "bold");
      doc.text(printData.Sex || "", R + 42, baseY);

      doc.setFont("times", "normal");
      doc.text("Collection Date", R, baseY + 5);
      doc.text(":", R + 40, baseY + 5);

      doc.setFont("times", "bold");
      doc.text(printData.CollectionDate || "", R + 44, baseY + 5);

      doc.setFont("times", "normal");
      doc.text("Reporting Date", R, baseY + 10);
      doc.text(":", R + 40, baseY + 10);

      doc.setFont("times", "bold");
      doc.text(printData.ReportingDate || "", R + 44, baseY + 10);

      doc.line(L, baseY + 18, pageWidth - marginRight, baseY + 18);

      return baseY + 25;
    };

    // HEADER FIRST PAGE
    const headerEndY = drawHeader();
    let y = headerEndY;

    doc.text(
      printData.SubDepartment || "",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 6;

    /* ================= 🔥 SINGLE TABLE from editableResults ================= */

    const finalBody = editableResults.map((row) => [
      row.investigation,
      row.result,
      row.unit,
      row.referenceRange,
    ]);

    autoTable(doc, {
      startY: y,

      margin: {
        top: headerEndY,
        left: L,
        right: marginRight,
        bottom: bottomMargin,
      },

      theme: "plain",

      head: [["INVESTIGATION", "RESULT", "UNIT", "REFERENCE RANGE"]],

      
      showHead: "everyPage",

      styles: {
        fontSize: 9,
        cellPadding: 2,
      },

      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 60 },
      },

      body: finalBody,

      willDrawPage: () => {
        drawHeader();
      },
    });

    /* ================= FOOTER ================= */
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(9);
    doc.text("** End of Report **", pageWidth / 2, finalY, {
      align: "center",
    });
// ===== SIGNATURE ADD ON EVERY PAGE =====
if (signatureBase64) {
  const sigWidth = 30;
  const sigHeight = 18;
  const sigY = 297 - 60 - sigHeight; // ~6cm from bottom
  const pId = Number(pathologist.PathologistId);
  const sigX = pId === 3 ? 10 : pId === 4 ? 80 : 140;

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.addImage(signatureBase64, "JPEG", sigX, sigY, sigWidth, sigHeight);
  }
}



    /* ================= OPEN PDF ================= */
    const blobUrl = URL.createObjectURL(doc.output("blob"));
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    setShowPrintPreview(false);
  };
  return (
    <>
      {/* ================= BASIC INFO ================= */}
      <div className="row g-2 mb-2 align-items-end">
        <div className="col-md-2">
          <label className="form-label mb-0">Case No.</label>
          <input
            value={formData2?.CaseNo || ""}
            readOnly
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-2">
          <label className="form-label mb-0">Patient Id</label>
          <input
            value={formData2?.PatientId || ""}
            readOnly
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-3">
          <label className="form-label mb-0">Patient Name</label>
          <input
            value={formData2?.PatientName || ""}
            readOnly
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-3 ms-auto text-end">
          {barcodeImg && <img src={barcodeImg} alt="barcode" />}
        </div>
      </div>

      {/* ================= PATHOLOGIST ================= */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label className="form-label mb-0">Pathologist</label>
          <ApiSelect
            api="/pathologist"
            labelKey="Pathologist"
            valueKey="PathologistId"
            value={pathologistId}
            onChange={(val) => {
              setPathologistId(val);

              const selected = pathologistList.find(
                (p) => p.PathologistId === val
              );

              setPathologistName(selected?.Pathologist || "");
            }}
          />
        </div>
      </div>

      {/* ================= TEST TABLE ================= */}
      <div className="table-responsive mb-3 shadow-sm rounded">
        <table className="table table-hover align-middle text-center mb-1">
          <thead className="table-info">
            <tr>
              <th className="fw-semibold">Print</th>
              <th className="fw-semibold">Test Name</th>
              <th className="fw-semibold">Report Date</th>
              <th className="fw-semibold">Test Detail</th>
              <th className="fw-semibold">Special Remarks</th>
              <th className="fw-semibold">Value</th>
              <th className="fw-semibold">Report Time</th>
            </tr>
          </thead>

          {/* <tbody>
            <tr>
              <td>{formData2?.Test}</td>
              <td>{formData2?.ReportDate}</td>
              <td className="text-primary">Click Here To Enter Result</td>
              <td></td>
              <td></td>
              <td>{formData2?.ReportTime}</td>
            </tr>

            <tr>
              <td colSpan={6} style={{ height: 120 }}></td>
            </tr>
          </tbody> */}
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted py-4">No test found</td>
              </tr>
            ) : (
              tests.map((test, index) => (
                <tr
                  className={`${
                    test.TestId === selectedTest?.TestId ? "table-warning" : ""
                  }`}
                  key={index}
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    setSelectedTest(test);

                    const props = await fetchPropertyList(test?.TestId);
                    const values = await fetchPropertyValues(
                      formData2?.CaseId,
                      test?.TestId
                    );

                  
                    setAllTestProperties((prev) => ({
                      ...prev,
                      [test.TestId]: {
                        propertyList: props || [],
                        propertyValueMap: values || {},
                      },
                    }));
                  }}
                >
                  <td >
                    <input
                      type="checkbox"
                      checked={selectedTests.some(
                        (t) => t.TestId === test.TestId
                      )}
                      onChange={() => handleSelectTest(test)}
                    />
                  </td>
                  <td className="fw-medium text-start">{test?.Test}</td>
                  <td  className="text-muted">{test?.ReportDate?.split("T")[0]}</td>
                 <td className="badge bg-danger text-white  px-2 py-3 rounded-3">
                    Click Here Before Entery
                  </td>
                  <td></td>
                  <td></td>
                  <td>{test?.ReportTime}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PROPERTY PANEL ================= */}
      <div className="table-responsive mb-3 shadow-sm rounded">
        <table className="table table-hover align-middle mb-0">
          <thead table-dark text-center>
            <tr>
              <th className="fw-semibold text-start">Test Property</th>
              <th className="fw-semibold">Value</th>
              <th className="fw-semibold">UOM</th>
              <th className="fw-semibold">LIS Val</th>
              <th className="fw-semibold">action</th>
            </tr>
          </thead>
          <tbody>
            {propertyList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-3">
                  No property found
                </td>
              </tr>
            ) : (
              propertyList.map((prop, index) => (
                <tr key={index}>
                  <td  className="fw-medium text-start">{prop.TestProperty}</td>
                  <td style={{ minWidth: "150px" }}>
                    <input
                      className="form-control form-control-sm  border-primary-subtle"
                      type="text"
                      value={propertyValueMap[prop.TestPropertyId]?.value ?? ""}
                      onChange={(e) =>
                        handlePropertyChange(
                          prop.TestPropertyId,
                          "value",
                          e.target.value
                        )
                      }
                    />
                    {/* {propertyValueMap[prop.TestPropertyId]?.value ?? ""} */}
                  </td>
                  <td className="text-muted fw-semibold">{prop.Uom}</td>

                  <td style={{ minWidth: "150px" }}>
                    <input
                      className="form-control form-control-sm border-success-subtle"
                      value={propertyValueMap[prop.TestPropertyId]?.lis ?? ""}
                      onChange={(e) =>
                        handlePropertyChange(
                          prop.TestPropertyId,
                          "lis",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => saveProperty(prop)}
                    >
                      Edit & Save
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* ================= EDITABLE PRINT PREVIEW MODAL ================= */}
      {showPrintPreview && (
        <>
          <div
            onClick={() => setShowPrintPreview(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100000,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          />
          <div
            style={{
              position: "fixed", top: "5%", left: "10%", right: "10%", bottom: "5%",
              zIndex: 100001, backgroundColor: "#fff", borderRadius: 8,
              overflowY: "auto", padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0 fw-bold text-primary">📝 Edit Report Before Print</h5>
              <button className="btn btn-sm btn-danger" onClick={() => setShowPrintPreview(false)}>✕ Close</button>
            </div>

            {/* Patient Details - Editable */}
            <div className="row g-2 mb-3">
              {[
                { label: "Patient Name", key: "PatientName", col: 4 },
                { label: "Case No.", key: "CaseNo", col: 2 },
                { label: "Age", key: "Age", col: 1 },
                { label: "Sex", key: "Sex", col: 1 },
                { label: "Referred By", key: "ReferredBy", col: 4 },
                { label: "Collection Date", key: "CollectionDate", col: 3 },
                { label: "Reporting Date", key: "ReportingDate", col: 3 },
                { label: "Sub Department", key: "SubDepartment", col: 3 },
              ].map((f) => (
                <div className={`col-md-${f.col}`} key={f.key}>
                  <label className="form-label mb-0 small fw-bold">{f.label}</label>
                  <input
                    className="form-control form-control-sm"
                    value={printData[f.key] || ""}
                    onChange={(e) => setPrintData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {/* Test Results - Editable Table */}
            <div className="table-responsive mb-3">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Investigation</th>
                    <th>Result</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                  </tr>
                </thead>
                <tbody>
                  {editableResults.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <input className="form-control form-control-sm" value={row.investigation}
                          onChange={(e) => handleEditableResultChange(i, "investigation", e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm border-primary" value={row.result}
                          onChange={(e) => handleEditableResultChange(i, "result", e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={row.unit}
                          onChange={(e) => handleEditableResultChange(i, "unit", e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={row.referenceRange}
                          onChange={(e) => handleEditableResultChange(i, "referenceRange", e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintPreview(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨️ Generate PDF</button>
            </div>
          </div>
        </>
      )}

      <div>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={openPrintPreview}
        >
          Print
        </button>

        {/* <div className="d-flex justify-content-end mb-2">
          <label className="text-danger" htmlFor="">
            Always Use This for First Time Entry:
          </label>
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary "
              onClick={createAllProperties}
            >
              Save All
            </button>
            
          </div>
        </div> */}
        <div className="d-flex justify-content-end mb-3">
  <div className="bg-light border rounded p-3 shadow-sm text-end">
    
    <div className="text-danger fw-semibold small mb-2">
      ⚠️ Always Use This for First Time Entry
    </div>

    <div className="d-flex justify-content-end gap-2">
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        onClick={createAllProperties}
      >
        💾 Save All
      </button>

      
    </div>

  </div>
</div>
      </div>
      {/* ================= ACTION BUTTONS ================= */}
    </>
  );
};

export default GeneralTestDrawer;

