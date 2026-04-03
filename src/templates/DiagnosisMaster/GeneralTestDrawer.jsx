import { tr } from "date-fns/locale";
import ApiSelect from "./ApiSelect";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import JsBarcode from "jsbarcode";
import { useEffect, useMemo, useState } from "react";
import useAxiosFetch from "./Fetch";

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
  const handlePrint = () => {
    if (!tests.length) {
      toast.error("No tests found");
      return;
    }

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

      // BARCODE
      doc.setFillColor(230, 230, 230);
      doc.rect(L, y, 60, 14, "F");

      doc.setFont("times", "bold");
      doc.text(formData2?.CaseNo || "", L + 4, y + 10);

      if (barcodeImg) {
        doc.addImage(barcodeImg, "PNG", L, y, 60, 14);
      }

      const baseY = y + 18;

      // LEFT
      doc.setFont("times", "normal");
      doc.text("Patient's Name", L, baseY);
      doc.text(":", L + 36, baseY);

      doc.setFont("times", "bold");
      doc.text(formData2?.PatientName || "", L + 40, baseY);

      doc.setFont("times", "normal");
      doc.text("Case No.", L, baseY + 5);
      doc.text(":", L + 36, baseY + 5);

      doc.setFont("times", "bold");
      doc.text(formData2?.CaseNo || "", L + 40, baseY + 5);

      doc.setFont("times", "normal");
      doc.text("Referred By", L, baseY + 10);
      doc.text(":", L + 36, baseY + 10);

      doc.setFont("times", "bold");
      doc.text(`${doctorMap[formData2.DoctorId] || ""}`, L + 40, baseY + 10);

      // RIGHT
      doc.setFont("times", "normal");
      doc.text("Age", R, baseY);
      doc.text(":", R + 12, baseY);

      doc.setFont("times", "bold");
      doc.text(`${formData2?.Age || ""} Y`, R + 16, baseY);

      doc.setFont("times", "normal");
      doc.text("Sex", R + 30, baseY);
      doc.text(":", R + 38, baseY);

      doc.setFont("times", "bold");
      doc.text(formData2?.Sex || "", R + 42, baseY);

      doc.setFont("times", "normal");
      doc.text("Collection Date", R, baseY + 5);
      doc.text(":", R + 40, baseY + 5);

      doc.setFont("times", "bold");
      doc.text(new Date().toISOString().split("T")[0], R + 44, baseY + 5);

      doc.setFont("times", "normal");
      doc.text("Reporting Date", R, baseY + 10);
      doc.text(":", R + 40, baseY + 10);

      doc.setFont("times", "bold");
      doc.text(
        selectedTest?.ReportDate?.split("T")[0] || "",
        R + 44,
        baseY + 10
      );

      // LINE
      doc.line(L, baseY + 18, pageWidth - marginRight, baseY + 18);

      return baseY + 25; // 👉 content start point
    };

    // 🔥 HEADER FIRST PAGE
    const headerEndY = drawHeader();
    let y = headerEndY;
 doc.text(SubDepartmentMap[tests[0].SubDepartmentId] || "", pageWidth / 2, y, {
      align: "center",
    });
    /* ================= LOOP TEST ================= */
    tests.forEach((test) => {
      const testData = allTestProperties[test.TestId];
      if (!testData) return;

      const { propertyList, propertyValueMap } = testData;

      /* ===== TITLE ===== */
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      // doc.text(test.Test, pageWidth / 2, y, { align: "center" });

      y += 6;

      /* ===== TABLE ===== */
      autoTable(doc, {
        startY: y,

        margin: {
          top: headerEndY, // 🔥 SAME for all pages
          left: L,
          right: marginRight,
          bottom: bottomMargin,
        },

        pageBreak: "auto",

        theme: "plain",

        headStyles: {
          fontStyle: "bold",
        },

        styles: {
          fontSize: 9,
          cellPadding: 2,
        },

        head: [["INVESTIGATION", "RESULT", "UNIT", "REFERENCE RANGE"]],

        body: propertyList.map((prop) => {
          const pv = propertyValueMap[prop.TestPropertyId];

          return [
            prop.TestProperty || "",
            pv?.value ?? "",
            prop.Uom || "",
            getReferenceRange(prop),
          ];
        }),

        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 60 },
        },

        // 🔥 HEADER EVERY PAGE (BEFORE CONTENT)
        willDrawPage: () => {
          drawHeader();
        },
      });

      y = doc.lastAutoTable.finalY + 10;
    });

    /* ================= FOOTER ================= */
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(9);
    doc.text("** End of Report **", pageWidth / 2, finalY, {
      align: "center",
    });

    /* ================= OPEN PDF ================= */
    const blobUrl = URL.createObjectURL(doc.output("blob"));
    window.open(blobUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };
  return (
    <>
      {/* ================= BASIC INFO ================= */}
      <div className="row g-2 mb-2 align-items-end">
        <div className="col-md-2">
          <label className="form-label mb-0">Case No.pppppp</label>
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
      <div className="table-responsive mb-3">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Report Date</th>
              <th>Test Detail</th>
              <th>Special Remarks</th>
              <th>Value</th>
              <th>Report Time</th>
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
                <td>No test found</td>
              </tr>
            ) : (
              tests.map((test, index) => (
                <tr
                  key={index}
                   style={{
                    cursor: "pointer",
                    backgroundColor:
                      test.TestId === selectedTest?.TestId
                        ? "yellow"
                        : "transparent",
                  }}
                  onClick={async () => {
                    setSelectedTest(test);

                    const props = await fetchPropertyList(test?.TestId);
                    const values = await fetchPropertyValues(
                      formData2?.CaseId,
                      test?.TestId
                    );

                    // 🔥 ekhane main logic
                    setAllTestProperties((prev) => ({
                      ...prev,
                      [test.TestId]: {
                        propertyList: props || [],
                        propertyValueMap: values || {},
                      },
                    }));
                  }}
                >
                  <td>{test?.Test}</td>
                  <td>{test?.ReportDate?.split("T")[0]}</td>
                  <td className="text-primary">
                    Click Here Before Print & Enter Result
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
      <div className="table-responsive mb-3">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Test Property</th>
              <th>Value</th>
              <th>UOM</th>
              <th>LIS Val</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {propertyList.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No property found
                </td>
              </tr>
            ) : (
              propertyList.map((prop, index) => (
                <tr key={index}>
                  <td>{prop.TestProperty}</td>
                  <td>
                    <input
                      className="form-control form-control-sm"
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
                  <td>{prop.Uom}</td>

                  <td>
                    <input
                      className="form-control form-control-sm"
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
                  <td>
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
      <div>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handlePrint}
        >
          Print
        </button>

        <div className="d-flex justify-content-end mb-2">
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary "
              onClick={createAllProperties}
            >
              Save All
            </button>
            {/* <button
              type="submit"
              className="btn btn-primary w-50"
              onClick={saveAllProperties}
            >
              Update
            </button> */}
          </div>
        </div>
      </div>
      {/* ================= ACTION BUTTONS ================= */}
    </>
  );
};

export default GeneralTestDrawer;
