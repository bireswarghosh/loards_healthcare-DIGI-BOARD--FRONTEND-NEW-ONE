import { tr } from "date-fns/locale";
import ApiSelect from "./ApiSelect";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";



const GeneralTestDrawer = ({
  formData2,
  tests = [],
  propertyList = [],
  propertyValueMap = {},
  handlePropertyChange,
  fetchPropertyList,
  fetchPropertyValues,
}) => {
  const saveProperty = async (prop) => {
    const pv = propertyValueMap[prop.TestPropertyId];
    if (!pv) return;

    const payload = {
      CaseId: formData2.CaseId,
      TestId: formData2.TestId,
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
await axiosInstance.post(
          `/testproval`,
          payload)
        toast.success("Property saved successfully ");
      }
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save property ");
    }
  };


  const saveAllProperties = async () => {
    if (!propertyList.length) return;

    try {
      const requests = propertyList.map((prop) => {
        const pv = propertyValueMap[prop.TestPropertyId];
        if (!pv) return null;

        const payload = {
          CaseId: formData2.CaseId,
          TestId: formData2.TestId,
          TestPropertyId: prop.TestPropertyId,
          TestProVal: pv.value,
          BarCodeNo: pv.barcode,
          LISVal: pv.lis,
          Alart: pv.alert,
        };

        return axiosInstance.put(
          `/testproval/${formData2.TestId}/${prop.TestPropertyId}/${formData2.CaseId}`,
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

    try {
      const requests = propertyList.map((prop) => {
        const pv = propertyValueMap[prop.TestPropertyId];
        if (!pv) return null;

        const payload = {
          CaseId: formData2.CaseId,
          TestId: formData2.TestId,
          TestPropertyId: prop.TestPropertyId,
          TestProVal: pv.value,
          BarCodeNo: pv.barcode,
          LISVal: pv.lis,
          Alart: pv.alert,
        };

        return axiosInstance.post(
          `/testproval`,
          payload
        );
      });

      // 🔥 null remove + parallel save
      await Promise.all(requests.filter(Boolean));

      toast.success("All properties created successfully");
    } catch (err) {
      console.error("Save all failed", err);
      toast.error("Failed to create all properties");
    }
  };
  const handlePrint = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFont("times", "normal");
    doc.setFontSize(9);

    const L = 15;
    const R = 135;
    let y = 15;

    /* ================= BARCODE PLACEHOLDER ================= */
    doc.setFillColor(230, 230, 230);
    doc.rect(L, y, 60, 14, "F");
    doc.setTextColor(0, 0, 0);
    doc.text(formData2?.CaseNo || "", L + 4, y + 10);

    /* ================= RIGHT AGE / SEX ================= */

    // ================= AFTER BARCODE =================
    const baseY = y + 18; // common baseline for both sides

    // ===== LEFT SIDE =====
    const labelX = L;
    const colonX = L + 36;
    const valueX = L + 40;

    doc.text("Patient's Name", labelX, baseY);
    doc.text(":", colonX, baseY);
    doc.text(formData2?.PatientName || "", valueX, baseY);

    doc.text("Case No.", labelX, baseY + 5);
    doc.text(":", colonX, baseY + 5);
    doc.text(formData2?.CaseNo || "", valueX, baseY + 5);

    doc.text("Referred By", labelX, baseY + 10);
    doc.text(":", colonX, baseY + 10);
    doc.text(formData2?.RefBy || "", valueX, baseY + 10);

    // ===== RIGHT SIDE =====
    const rLabelX = R;
    const rColonX = R + 40;
    const rValueX = R + 44;

    // Age / Sex (same row as Patient Name)
    doc.text("Age", rLabelX, baseY);
    doc.text(":", rColonX - 28, baseY);
    doc.text(`${formData2?.Age || ""} Y`, rColonX - 24, baseY);

    doc.text("Sex", rColonX - 2, baseY);
    doc.text(":", rColonX + 8, baseY);
    doc.text(formData2?.Sex || "", rColonX + 12, baseY);

    // Dates (same rows as Case No / Referred By)
    doc.text("Collection Date", rLabelX, baseY + 5);
    doc.text(":", rColonX, baseY + 5);
    doc.text(formData2?.CollectionDate || "", rValueX, baseY + 5);

    doc.text("Reporting Date", rLabelX, baseY + 10);
    doc.text(":", rColonX, baseY + 10);
    doc.text(formData2?.ReportDate || "", rValueX, baseY + 10);

    // ===== MOVE CURSOR AFTER BOTH SIDES =====
    y = baseY + 18;

    /* ================= SEPARATOR LINE ================= */
    doc.line(L, y, 195, y);

    y += 8;

    /* ================= TITLE ================= */
    doc.setFont("times", "bold");
    doc.text("CLINICAL PATHOLOGY.", 105, y, { align: "center" });

    y += 6;

    /* ================= TABLE ================= */
    doc.setFont("times", "normal");

    autoTable(doc, {
      startY: y,
      theme: "plain",
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
          // pv?.lis ?? "-",
          `${prop.ComMin?? ""} - ${prop.ComMax ?? ""}`,
        ];
      }),

      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 60 },
      },
      didDrawPage: () => {
        // header border
        doc.rect(L, y - 1, 180, 8);
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    /* ================= FOOTER ================= */
    doc.setFontSize(9);
    doc.text("** End of Report **", 105, finalY, { align: "center" });

    // doc.save(`${formData2?.CaseNo || "clinical_report"}.pdf`);

    /* ====== OPEN AS BLOB ====== */
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);

    window.open(blobUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
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
          <div className="border px-2 py-1 fw-bold text-center">
            {formData2?.CaseNo}
          </div>
        </div>
      </div>

      {/* ================= PATHOLOGIST ================= */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label className="form-label mb-0">Pathologist</label>
          <ApiSelect
            api="https://lords-backend.onrender.com/api/v1/pathologist"
            labelKey="Pathologist"
            valueKey="PathologistId"
            placeholder="Select Pathologist"
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
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    fetchPropertyList(test?.TestId);
                    fetchPropertyValues(formData2?.CaseId, test?.TestId);
                  }}
                >
                  <td>{test?.Test}</td>
                  <td>{test?.ReportDate}</td>
                  <td className="text-primary">Click Here To Enter Result</td>
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
                  <td className="fw-bold text-primary">
                    <input
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
                      Save
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
              create
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
