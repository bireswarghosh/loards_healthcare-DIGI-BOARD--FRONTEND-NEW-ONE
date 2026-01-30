import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { toast } from "react-toastify";

import useAxiosFetch from "./DiagnosisMaster/Fetch";
import axiosInstance from "../axiosInstance";

const DischargeNewAdvice = () => {
  const { id } = useParams();
  const { data: emrData } = useAxiosFetch(id ? `/emr/D-${id}` : null, [id]);

  const { data: medData } = useAxiosFetch(
    id ? `/discertdtl/by-id/${encodeURIComponent(id)}` : null,
    [id]
  );
  const { data: dischargeData } = useAxiosFetch(id ? `/discert/${id}` : null, [
    id,
  ]);

  const [formData, setFormData] = useState({
    pastHistory: [{ SlNo: 1, pasthistory: "" }],
    significantFindings: "",
    investigationResults: "",
    investigations: [{ SlNo: 1, Invest: "" }],
    conditionAtDischarge: "",
    followUpDate: "",
    adviceMedicine: [
      { SlNo: 1, Type: "", Medicine: "", dose: "", unit: "", days: "" },
    ],
    generalFormat: [{ test: "", rate: "", testPro: "", provalue: "" }],
    bloodFormat: [{ slno: 1, proName: "", value: "" }],
    notesNarration: "",
    diagnosis: [{ SlNo: 1, diagonisis: "" }],
    complaints: [{ SlNo: 1, chief: "" }],
  });

  const addRow = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "pastHistory"
          ? { SlNo: prev[field].length + 1, pasthistory: "" }
          : field === "investigations"
            ? { SlNo: prev[field].length + 1, Invest: "" }
            : field === "adviceMedicine"
              ? {
                  SlNo: prev[field].length + 1,
                  Type: "",
                  Medicine: "",
                  dose: "",
                  unit: "",
                  days: "",
                }
              : field === "generalFormat"
                ? { test: "", rate: "", testPro: "", provalue: "" }
                : field === "bloodFormat"
                  ? { slno: prev[field].length + 1, proName: "", value: "" }
                  : field === "diagnosis"
                    ? { SlNo: prev[field].length + 1, diagonisis: "" }
                    : field === "complaints"
                      ? { SlNo: prev[field].length + 1, chief: "" }
                      : {},
      ],
    }));
  };

  const updateRow = (field, index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const [addEditState, setAddEditState] = useState(true);

  useEffect(() => {
    if (addEditState === true) return;
    if (!emrData) return;

    setFormData((prev) => ({
      ...prev,

      // Past History
      pastHistory:
        emrData.pastHistory?.length > 0
          ? emrData.pastHistory
              ?.sort((a, b) => a.SlNo - b.SlNo)
              .map((item, i) => ({
                SlNo: item.SlNo,
                pasthistory: item.pasthistory || "",
              }))
          : [],

      // Significant Findings (from diagnosis)
      significantFindings: dischargeData?.G,
      followUpDate: dischargeData?.E,
      // ?.map((d) => d.Diagnosis || d.diagnosis || "")
      // .join("\n") || prev.significantFindings,
      conditionAtDischarge: dischargeData?.F,
      // Investigation Results
      investigationResults:
        emrData.investigations
          ?.map((i) => i.Invest || i.invest || "")
          .join("\n") || prev.investigationResults,

      // Treatment Done (from medicine)
      investigations:
        emrData.investigations?.length > 0
          ? emrData.investigations
              ?.sort((a, b) => a.SlNo - b.SlNo)
              .map((item, index) => ({
                SlNo: item.SlNo,
                Invest: item.Invest || "",
              }))
          : [],

      // =====advicemed====
      adviceMedicine: medData
        ? medData
            .sort((a, b) => a.SlNo - b.SlNo)
            .map((item) => ({
              SlNo: item.SlNo,
              Type: item.Type,
              Medicine: item.Medicine,
              dose: item.dose,
              unit: item.unit,
              days: item.days,
            }))
        : [],
      diagnosis:
        emrData.diagnosis?.length > 0
          ? emrData.diagnosis
              .sort((a, b) => a.SlNo - b.SlNo)
              .map((item) => ({
                SlNo: item.SlNo,
                diagonisis: item.diagonisis || "",
              }))
          : [],

      complaints:
        emrData.complaints?.length > 0
          ? emrData.complaints
              .sort((a, b) => a.SlNo - b.SlNo)
              .map((item) => ({
                SlNo: item.SlNo,
                chief: item.chief || "",
              }))
          : [],

      // Notes / Narration (from complaints)
      // notesNarration:
      //   emrData.complaints
      //     ?.map((c) => c.chief || c.Complaint || "")
      //     .join("\n") || prev.notesNarration,
      notesNarration: dischargeData?.C,
    }));
  }, [addEditState, emrData, medData, dischargeData]);

  const handleSave = async () => {
    try {
      const payload = {
        RegistrationId: `D-${id}`,
        admissionid: null,
        VisitId: "null",
        pastHistory: formData.pastHistory,
        // significantFindings: formData.significantFindings,
        // investigationResults: formData.investigationResults,
        complaints: formData.complaints,
        diagnosis: formData.diagnosis,
        investigations: formData.investigations,
        // conditionAtDischarge: formData.conditionAtDischarge,
        // followUpDate: formData.followUpDate,
        // adviceMedicine: formData.adviceMedicine,
        // generalFormat: formData.generalFormat,
        // bloodFormat: formData.bloodFormat,
        // notesNarration: formData.notesNarration,
      };
      // const advicePayload = formData.adviceMedicine.map((item) => ({
      //   SlNo: item.SlNo || "",
      //   Type: item.Type || "",
      //   Medicine: item.Medicine || "",
      //   dose: item.dose || "",
      //   unit: item.unit || "",
      //   days: item.days || "",
      //   DisCerId: `D-${id}`,
      // }));

      let res;
      if (addEditState) {
        const res = await axiosInstance.post(`/emr/bulk`, payload);
      } else {
        res = await axiosInstance.put(`/emr/bulk`, payload);
      }

      // ----- ADVICE MEDICINE -----
      const advicePayload = {
        records: formData.adviceMedicine.map((item) => ({
          DisCerId: `${id}`,
          Medicine: item.Medicine || "",
          unit: item.unit || "",
          days: item.days || "",
          dose: item.dose || "",
          Type: item.Type || "",
        })),
      };

      let res2;
      if (addEditState) {
        res2 = await axiosInstance.post(`/discertdtl/bulk`, advicePayload);
      } else {
        res2 = await axiosInstance.put(
          `/discertdtl/bulk/${encodeURIComponent(id)}`,
          advicePayload
        );
      }
      // ---- DISCHARGE MAIN TABLE UPDATE ----
      const dischargePayload = {
        G: formData.significantFindings || "",
        E: formData.followUpDate || "",
        F: formData.conditionAtDischarge || "",
        C: formData.notesNarration || "",
      };
{(formData.significantFindings ||
  formData.followUpDate ||
  formData.conditionAtDischarge ||
  formData.notesNarration) &&
  (await axiosInstance.put(`/discert/${id}`, dischargePayload));}
      

      toast.success("Updated Successfully!");
      
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      toast.error("Something went wrong ???!");
    }
  };

  return (
    <>
      <style>
        {`
    .main-content, .panel, .panel-body {
      position: relative !important;
      z-index: 1 !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
    }

    /* Force remove any full-screen overlay from external CSS */
    .main-content::before,
    .main-content::after,
    .panel::before,
    .panel::after,
    .panel-body::before,
    .panel-body::after {
      content: none !important;
      display: none !important;
    }
  `}
      </style>
      <div
        className="main-content"
        style={{
          position: "relative",
          zIndex: 1,
          overflow: "visible",
        }}
      >
        <div className="panel">
          <div className="panel-header">
            <h5>Discharge Summary</h5>
            <button
              type="button"
              onClick={() => {
                const newState = !addEditState;
                setAddEditState(newState);

                if (newState === true) {
                  // jodi Add mode e jay → field reset
                  setFormData({
                    pastHistory: [{ SlNo: 1, pasthistory: "" }],
                    significantFindings: "",
                    investigationResults: "",
                    investigations: [{ SlNo: 1, Invest: "" }],
                    conditionAtDischarge: "",
                    followUpDate: "",
                    diagnosis: [{ SlNo: 1, diagonisis: "" }],
                    complaints: [{ SlNo: 1, chief: "" }],
                    adviceMedicine: [
                      {
                        SlNo: 1,
                        Type: "",
                        Medicine: "",
                        dose: "",
                        unit: "",
                        days: "",
                      },
                    ],
                    generalFormat: [
                      { test: "", rate: "", testPro: "", provalue: "" },
                    ],
                    bloodFormat: [{ slno: 1, proName: "", value: "" }],
                    notesNarration: "",
                  });
                }
              }}
            >
              {addEditState ? "Add" : "Edit"}
            </button>
          </div>

          <div
            className="panel-body"
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              height: "auto",
              overflow: "visible",
            }}
          >
            <div className="row g-2">
              {/* ================= LEFT COLUMN ================= */}
              <div className="col-md-6">
                {/* diagnosis========================= */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                      borderBottom: "1px solid #000",
                    }}
                  >
                    Diagnosis
                  </div>
                  <div style={{ backgroundColor: "#fff" }}>
                    <table
                      className="table table-bordered mb-0"
                      style={{ fontSize: "12px" }}
                    >
                      <thead style={{ backgroundColor: "#F19C49" }}>
                        <tr>
                          <th style={{ width: "50px" }}>slno</th>
                          <th>Diagnosis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.diagnosis.map((row, index) => (
                          <tr key={index}>
                            <td style={{ backgroundColor: "#F19C49" }}>
                              {row.SlNo}
                            </td>
                            <td>
                              <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                value={row.diagonisis}
                                onChange={(e) =>
                                  updateRow(
                                    "diagnosis",
                                    index,
                                    "diagonisis",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", resize: "none" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {addEditState && (
                      <button
                        className="btn btn-sm btn-success m-1"
                        onClick={() => addRow("diagnosis")}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Past History */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                      borderBottom: "1px solid #000",
                    }}
                  >
                    Past History
                  </div>
                  <div style={{ backgroundColor: "#fff" }}>
                    <table
                      className="table table-bordered mb-0"
                      style={{ fontSize: "12px" }}
                    >
                      <thead style={{ backgroundColor: "#F19C49" }}>
                        <tr>
                          <th style={{ width: "50px" }}>slno</th>
                          <th>Past History</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.pastHistory.map((row, index) => (
                          <tr key={index}>
                            <td style={{ backgroundColor: "#F19C49" }}>
                              {row.SlNo}
                            </td>
                            <td>
                              <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                value={row.pasthistory}
                                onChange={(e) =>
                                  updateRow(
                                    "pastHistory",
                                    index,
                                    "pasthistory",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", resize: "none" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {addEditState && (
                      <button
                        className="btn btn-sm btn-success m-1"
                        onClick={() => addRow("pastHistory")}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Significant Findings */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                    }}
                  >
                    Significant Findings
                  </div>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    value={formData.significantFindings}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        significantFindings: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: "#c0c0c0" }}
                  />
                </div>

                {/* Investigation Results */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                    }}
                  >
                    Investigation Results
                  </div>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    // value={formData.investigationResults}
                    // onChange={(e) =>
                    //   setFormData((prev) => ({
                    //     ...prev,
                    //     investigationResults: e.target.value,
                    //   }))
                    // }
                    style={{ backgroundColor: "#c0c0c0" }}
                  />
                </div>

                {/* Treatment Done */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                      borderBottom: "1px solid #000",
                    }}
                  >
                    Treatment Done / Procedure
                  </div>
                  <div style={{ backgroundColor: "#fff" }}>
                    <table
                      className="table table-bordered mb-0"
                      style={{ fontSize: "12px" }}
                    >
                      <thead style={{ backgroundColor: "#F19C49" }}>
                        <tr>
                          <th style={{ width: "50px" }}>slno</th>
                          <th>Advice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.investigations.map((row, index) => (
                          <tr key={index}>
                            <td style={{ backgroundColor: "#F19C49" }}>
                              {row.SlNo}
                            </td>
                            <td>
                              <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                value={row.Invest}
                                onChange={(e) =>
                                  updateRow(
                                    "investigations",
                                    index,
                                    "Invest",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", resize: "none" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {addEditState && (
                      <button
                        className="btn btn-sm btn-success m-1"
                        onClick={() => addRow("investigations")}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Condition At Discharge */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                    }}
                  >
                    Condition At Discharge
                  </div>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    value={formData.conditionAtDischarge}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        conditionAtDischarge: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: "#c0c0c0" }}
                  />
                </div>

                {/* Follow Up */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                    }}
                  >
                    Follow Up Date
                  </div>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    value={formData.followUpDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        followUpDate: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: "#c0c0c0" }}
                  />
                </div>

                {/* Advice on Discharge */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                      borderBottom: "1px solid #000",
                    }}
                  >
                    Advice on Discharge
                  </div>
                  <div style={{ backgroundColor: "#fff" }}>
                    <table
                      className="table table-bordered mb-0 "
                      style={{ fontSize: "11px", tableLayout: "fixed" }}
                    >
                      <thead style={{ backgroundColor: "#F19C49" }}>
                        <tr>
                          <th style={{ width: "40px" }}>slno</th>
                          <th>Type</th>
                          <th>Medicine</th>
                          <th>Dose</th>
                          <th>Unit</th>
                          <th>Day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.adviceMedicine.map((row, index) => (
                          <tr key={index}>
                            <td style={{ backgroundColor: "#F19C49" }}>
                              {row.SlNo}
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.Type}
                                onChange={(e) =>
                                  updateRow(
                                    "adviceMedicine",
                                    index,
                                    "Type",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.Medicine}
                                onChange={(e) =>
                                  updateRow(
                                    "adviceMedicine",
                                    index,
                                    "Medicine",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.dose}
                                onChange={(e) =>
                                  updateRow(
                                    "adviceMedicine",
                                    index,
                                    "dose",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.unit}
                                onChange={(e) =>
                                  updateRow(
                                    "adviceMedicine",
                                    index,
                                    "unit",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.days}
                                onChange={(e) =>
                                  updateRow(
                                    "adviceMedicine",
                                    index,
                                    "days",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {addEditState && (
                      <button
                        className="btn btn-sm btn-success m-1"
                        onClick={() => addRow("adviceMedicine")}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= RIGHT COLUMN ================= */}
              <div className="col-md-6">
                {/* complaints================================ */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                      borderBottom: "1px solid #000",
                    }}
                  >
                    Chief Complaint
                  </div>
                  <div style={{ backgroundColor: "#fff" }}>
                    <table
                      className="table table-bordered mb-0"
                      style={{ fontSize: "12px" }}
                    >
                      <thead style={{ backgroundColor: "#F19C49" }}>
                        <tr>
                          <th style={{ width: "50px" }}>slno</th>
                          <th>Chief Complaint</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.complaints.map((row, index) => (
                          <tr key={index}>
                            <td style={{ backgroundColor: "#F19C49" }}>
                              {row.SlNo}
                            </td>
                            <td>
                              <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                value={row.chief}
                                onChange={(e) =>
                                  updateRow(
                                    "complaints",
                                    index,
                                    "chief",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", resize: "none" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {addEditState && (
                      <button
                        className="btn btn-sm btn-success m-1"
                        onClick={() => addRow("complaints")}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
                {/* General Format */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    General Format
                  </div>
                  <div style={{ backgroundColor: "#fff" }}>
                    <table
                      className="table table-bordered mb-0"
                      style={{ fontSize: "11px", tableLayout: "fixed" }}
                    >
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Rate</th>
                          <th
                            style={{
                              backgroundColor: "#0080ff",
                              color: "#fff",
                            }}
                          >
                            TestPro
                          </th>
                          <th
                            style={{
                              backgroundColor: "#0080ff",
                              color: "#fff",
                            }}
                          >
                            Provalue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.generalFormat.map((row, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.test}
                                onChange={(e) =>
                                  updateRow(
                                    "generalFormat",
                                    index,
                                    "test",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.rate}
                                onChange={(e) =>
                                  updateRow(
                                    "generalFormat",
                                    index,
                                    "rate",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                            <td style={{ backgroundColor: "#0080ff" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.testPro}
                                onChange={(e) =>
                                  updateRow(
                                    "generalFormat",
                                    index,
                                    "testPro",
                                    e.target.value
                                  )
                                }
                                style={{
                                  border: "none",
                                  fontSize: "11px",
                                  backgroundColor: "transparent",
                                  color: "#fff",
                                }}
                              />
                            </td>
                            <td style={{ backgroundColor: "#0080ff" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.provalue}
                                onChange={(e) =>
                                  updateRow(
                                    "generalFormat",
                                    index,
                                    "provalue",
                                    e.target.value
                                  )
                                }
                                style={{
                                  border: "none",
                                  fontSize: "11px",
                                  backgroundColor: "transparent",
                                  color: "#fff",
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      className="btn btn-sm btn-success m-1"
                      onClick={() => addRow("generalFormat")}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Blood Format */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Blood Format
                  </div>
                  <div style={{ backgroundColor: "#fff" }}>
                    <table
                      className="table table-bordered mb-0"
                      style={{ fontSize: "11px" }}
                    >
                      <thead>
                        <tr>
                          <th style={{ width: "50px" }}>SlNo</th>
                          <th>Pro Name</th>
                          <th
                            style={{
                              backgroundColor: "#0080ff",
                              color: "#fff",
                            }}
                          >
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.bloodFormat.map((row, index) => (
                          <tr key={index}>
                            <td>{row.slno}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.proName}
                                onChange={(e) =>
                                  updateRow(
                                    "bloodFormat",
                                    index,
                                    "proName",
                                    e.target.value
                                  )
                                }
                                style={{ border: "none", fontSize: "11px" }}
                              />
                            </td>
                            <td style={{ backgroundColor: "#0080ff" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={row.value}
                                onChange={(e) =>
                                  updateRow(
                                    "bloodFormat",
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                style={{
                                  border: "none",
                                  fontSize: "11px",
                                  backgroundColor: "transparent",
                                  color: "#fff",
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      className="btn btn-sm btn-success m-1"
                      onClick={() => addRow("bloodFormat")}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div
                  className="mb-2"
                  style={{
                    backgroundColor: "#0080FF",
                    padding: "5px",
                    border: "2px solid #000",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "5px",
                    }}
                  >
                    Notes / Narration
                  </div>
                  <textarea
                    className="form-control form-control-sm"
                    rows="8"
                    value={formData.notesNarration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notesNarration: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: "#c0c0c0" }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button onClick={handleSave} className="btn btn-primary">
                <i className="fa-light fa-save me-2"></i>Save
              </button>
              {/* <button className="btn btn-secondary">
                <i className="fa-light fa-print me-2"></i>Print
              </button> */}
              {/* <button className="btn btn-danger">
                <i className="fa-light fa-times me-2"></i>Clearrrrr
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DischargeNewAdvice;