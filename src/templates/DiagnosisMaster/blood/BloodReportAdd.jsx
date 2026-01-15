import React, { useEffect, useState } from "react";
import Barcode from "react-barcode";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance";

const BloodReportAdd = () => {
  // --- STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  // State for LIS Table Data (20 empty rows for data entry)
  const [lisData, setLisData] = useState(
    Array.from({ length: 20 }, () => ({ test: "", value: "" }))
  );

  const handleLisChange = (index, field, val) => {
    const newData = [...lisData];
    newData[index][field] = val;
    setLisData(newData);
  };

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    "1StHrsCount": 0,
    "2ndHrsCount": 0,

    AbnCell1: "",
    AbnCell1Val: 0,
    AbnCell2: "",
    AbnCell2Val: 0,
    AbnCell3: "",
    AbnCell3Val: 0,
    AbnCell4: "",
    AbnCell4Val: 0,
    AbnCell5: "",
    AbnCell5Val: 0,
    AbnCell6: "",
    AbnCell6Val: 0,

    AdEosCount: 0,
    Basophils: 0,
    BleedTimeMin: 0,
    BleedTimeSec: 0,

    BloodGroup: "",
    BloodId: "",
    CaseId: "",

    CoagulMin: 0,
    CoagulSec: 0,
    CorrectedWBCCount: 0,
    CorrectedWBCCountUnit: "",

    Eosinophils: 0,
    Erythrocytes: 0,
    ErythrocytesUnit: "million/cumm.",

    Himoglobin1: 0,
    Himoglobin2: 0,
    Himoglobin3: 0,

    LabId: "",
    Leucocytes: 0,
    LeucocytesUnit: "/cumm.",
    Lymphocytes: 0,

    MaleriaParasite: "",
    MCH: 0,
    MCHC: 0,
    MCHCUnit: "gm/dl",
    MCHUnit: "",
    MCV: 0,
    MCVUnit: "",
    MeanESR: 0,
    Monocytes: 0,

    Neutrophils: 0,
    NucleatedRBC: 0,
    NucleatedRBCUnit: "",

    PalateCountUnit: "",
    PalletsCount: 0,
    PathologistId1: 0,
    PathologistId2: 0,
    PathologistId3: 0,
    PCV: 0,
    PCVUnit: "%",
    PDW: 0,
    PDWUnit: "",

    RDW: 0,
    RDWUnit: "",
    Remarks: "",
    ReportDt: "",
    ReportTime: "",
    ReticulocyCount: 0,
    RHType: "",

    SemearStudy1: "",
    SemearStudy2: "",
    SemearStudy3: "",
  });

  const [caseNO, setCaseNO] = useState("");

  const [caseData, setCaseData] = useState({});

  const [selectedCase, setSelectedCase] = useState(null);
  const [caseSearchResults, setCaseSearchResults] = useState([]);
  const [isSearchingCase, setIsSearchingCase] = useState(false);

  const [pathologistMap, setPathologistMap] = useState([]);

  const [req, setReq] = useState(true);
  const [req1, setReq1] = useState(true);

  const [data, setData] = useState({});

  const [users, setUsers] = useState([]);

  const [remarksSuggest, setRemarksSuggest] = useState([])
  
  const onChangeFormData = (e) => {
    const field = e.target.name;
    const value = e.target.value;
    console.log("Field:", field, "Value:", value);
    setFormData({ ...formData, [field]: value });
  };

  // Search Case
  const searchCase = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCaseSearchResults([]);
      return;
    }
    setIsSearchingCase(true);
    try {
      const res = await axiosInstance.get(
        `/case01?page=1&limit=20&search=${encodeURIComponent(searchTerm)}`
      );
      setCaseSearchResults(res.data.data || []);
    } catch (err) {
      console.error("Case search error:", err);
      setCaseSearchResults([]);
    } finally {
      setIsSearchingCase(false);
    }
  };

  useEffect(() => {
    console.log("Selected case no changed: ", selectedCase);
    if (selectedCase) {
      setFormData((prev) => ({
        ...prev,
        CaseId: selectedCase.CaseId,
      }));
      setCaseData(selectedCase);
      setCaseNO(selectedCase.CaseNo);
    } else {
      setFormData((prev) => ({
        ...prev,
        CaseId: "",
      }));
      setCaseData((prev) => ({}));
    }
  }, [selectedCase]);

  // useEffect(() => {
  //   console.log("form data changed : ", formData);
  // }, [formData]);

  const fetchPathologist = async () => {
    try {
      const res = await axiosInstance.get("/pathologist?page=1&limit=100");
      console.log(res.data.data);
      setPathologistMap(res.data.data);
    } catch (error) {
      console.log("Error fetching pathologist: ", error);
    }
  };

  const handleSave = async () => {
    try {
      console.log("submitting form: ", formData);

      if (!formData.CaseId) {
        toast.error("Select Case No.");
        return;
      }
      setLoading(true);

      const res = await axiosInstance.post(`/bloodformat`, formData);
      console.log("res: ", res.data);
      if (res.data.success) {
        setLoading(false);
        toast.success(res.data.message);
        // setFormData(res.data.data);
      }
      // console.log("res after edit: ", res.data);
    } catch (error) {
      console.log("error saving form data: ", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth/users");
      console.log(res.data.data);
      setUsers(res.data.data);
    } catch (error) {
      console.log("Error fetching users: ", error);
    }
  };


  const fetchRemarkShuggestions = async ()=>{
    try {
      const res = await axiosInstance.get('/remarks?page=1&limit=100')
      // console.log("fetched remarks: ",res.data)
      res.data.success? setRemarksSuggest(res.data.data): setRemarksSuggest([])
    } catch (error) {
      console.log("error fetching remarks: ",error)
    }
  }

  useEffect(() => {
    // fetchBloodFormat();
    fetchPathologist();
    fetchUsers();
        fetchRemarkShuggestions()

  }, []);

  // useEffect(() => {
  //   console.log(req);
  // }, [req]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      MCV:
        formData.Erythrocytes != 0
          ? (
              (Number(formData.PCV) * 10) /
              Number(formData.Erythrocytes)
            ).toFixed(2)
          : 0,
      MCHC:
        formData.PCV != 0
          ? (
              (Number(formData.Himoglobin1) * 100) /
              Number(formData.PCV)
            ).toFixed(2)
          : 0,
    }));
  }, [formData.PCV]);

  // --- STYLES ---

  // Styles from File B
  const inputStyle = {
    fontSize: "1.1rem",
    padding: "0px 4px",
    height: "24px",
    borderRadius: "0px",
    color: "var(--secondary-color)",
  };
  const labelStyle = {
    fontSize: "1.0rem",
    fontWeight: "bold",
    margin: "0",
    whiteSpace: "nowrap",
    color: "var(--secondary-color)",
  };

  const styles = `
    :root {
      --bg-main: ${isDarkMode ? "#2d2d2d" : "#f0f0f0"};
      --bg-panel: ${isDarkMode ? "#e0b9b9ff" : "#e6e6e6"};
      --bg-input: ${isDarkMode ? "#d81b1bff" : "#ffffff"};
      --bg-input-yellow: ${isDarkMode ? "secondary" : "secondary"};
      --border-color: ${isDarkMode ? "secondary" : "#535252ff"};
      --text-main: ${isDarkMode ? "#ddd" : "#000000"};
      --text-label: ${isDarkMode ? "#bbb" : "#333333"};
      --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      --font-size: 11px;
      --input-height: 22px;
    }

    * { box-sizing: border-box; }

    body, html {
      margin: 0; padding: 0;
      height: 100vh; width: 100vw;
      font-family: var(--font-family);
      font-size: var(--font-size);
      background-color: var(--bg-main);
      color: var(--text-main);
    //  overflow: hidden; /* Desktop default */
    }

    /* --- LAYOUT GRID --- */
    .blood-report-layout {
      display: grid;
      grid-template-columns: 1fr 300px; /* Form | Right Panel */
      grid-template-rows: 1fr 40px;     /* Content | Footer */
      height: 100vh;
      gap: 4px;
      padding: 4px;
    }

    /* --- LEFT SECTION: FORM --- */
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
      padding-right: 2px;
      min-width: 0;
    }

    /* --- COMMON FIELD STYLES --- */
    .field-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
      flex-wrap: nowrap; 
    }

    input[type="text"], input[type="number"], input[type="date"], input[type="time"], select, textarea {
      height: var(--input-height);
      font-size: 11px;
      border: 1px solid var(--border-color);
      padding: 0 4px;
      background-color: var(--bg-input);
      color: var(--text-main);
      border-radius: 0;
    }
    textarea { height: auto; resize: none; font-family: var(--font-family); }
    input.yellow-bg { background-color: var(--bg-input-yellow); }
    
    .label {
      font-weight: bold;
      white-space: nowrap;
      color: var(--text-label);
      font-size: 11px;
    }

    /* Panels */
    .panel-box {
      border: 1px solid var(--border-color);
      padding: 4px;
      background-color: var(--bg-primary);
    }
    .group-border {
      border: 1px solid var(--border-color);
      padding: 8px 4px 4px 4px;
      margin-top: 8px;
      position: relative;
    }
    .group-label {
      position: absolute; top: -8px; left: 6px;
      background-color: var(--bg-panel);
      padding: 0 4px;
      font-weight: bold; color: #f70808ff;
      font-size: 11px;
    }

    /* --- SPECIAL GRIDS --- */
    .hemo-row {
      display: flex; align-items: center; gap: 4px;
      background: primary ; border: 0px solid #fffdfdff; padding: 4px;
      flex-wrap: nowrap;
    }

    .counts-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 4px;
    }

    .abnormal-container { display: flex; flex-direction: column; gap: 2px; }
    .abnormal-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .abnormal-item { display: flex; align-items: center; gap: 2px; }

    /* --- RIGHT PANEL (LIS) --- */
    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-left: 2px solid #fff;
      padding-left: 4px;
      background-color: var(--bg-main);
      overflow-y: auto;
    }
    .barcode-box {
      border: 1px solid #000; background: #fff; height: 70px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .lis-header {
      background-color: #ff8080; color: black; font-weight: bold;
      padding: 4px; text-align: center; border: 1px solid var(--border-color);
      font-size: 11px;
    }
    .lis-table-container {
      flex: 1; border: 1px solid var(--border-color);
      background-color: #fff; overflow-y: auto; 
      min-height: 100px;
    }
    
    /* --- LIS EDITABLE TABLE --- */
    .lis-table { width: 100%; border-collapse: collapse; background: #fff; table-layout: fixed; }
    .lis-table th {
      background: #e0e0e0; border: 1px solid #999;
      padding: 2px; text-align: left; font-weight: normal;
      font-size: 11px;
      position: sticky; top: 0; z-index: 10;
    }
    .lis-table td {
      border: 1px solid #ccc;
      padding: 0; /* Remove padding for input to fill cell */
      height: 20px; /* Force row height */
    }
    
    /* Seamless Table Inputs */
    .table-input {
      width: 100%;
      height: 100%;
      border: none !important;
      outline: none;
      padding: 0 4px !important;
      font-size: 11px;
      background: transparent;
    }
    .table-input:focus {
      background-color: #e8f0fe;
    }

    /* --- ACTION BAR --- */
    .action-bar {
      grid-column: 1 / -1;
      display: flex; gap: 2px;
      background-color: var(--bg-panel);
      padding: 4px; border-top: 1px solid #fff;
      align-items: center;
      overflow-x: auto;
    }
    .legacy-btn {
      flex: 1; min-width: 50px; height: 26px;
      background: linear-gradient(to bottom, #f9f9f9 5%, #e9e9e9 100%);
      border: 1px solid #888; border-radius: 2px;
      font-weight: bold; font-size: 11px; cursor: pointer; color: black;
      white-space: nowrap;
    }
    .legacy-btn:active { background: #ccc; }

    /* --- UTILS --- */
    .w-full { width: 100%; }
    .w-short { width: 60px; }
    .w-tiny { width: 40px; }
    .text-end { text-align: right; }
    .text-center { text-align: center; }
    .blue-text { color: #000080; }
    .bold { font-weight: bold; }

    /* --- RESPONSIVE --- */
    @media (max-width: 1024px) {
      body, html { overflow: auto; height: auto; }

      .blood-report-layout {
        display: flex;
        flex-direction: column;
        height: auto;
        min-height: 100vh;
        overflow: visible;
        padding-bottom: 50px;
      }

      .field-row, .hemo-row { flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
      .form-container { overflow: visible; padding-right: 0; }
      
      input[type="text"], input[type="number"], input[type="date"], select {
        flex: 1; min-width: 80px;
      }
      .w-short, .w-tiny { width: auto; min-width: 60px; }

      .counts-grid { grid-template-columns: 1fr; }
      .abnormal-row { grid-template-columns: 1fr; gap: 4px; margin-bottom: 4px; }

      .right-panel {
        border-left: none; border-top: 4px solid #fff;
        padding: 8px 0; height: auto; flex: none;
      }
      .lis-table-container { min-height: 200px; max-height: 300px; }

      .action-bar {
        position: fixed; bottom: 0; left: 0; right: 0;
        z-index: 100; box-shadow: 0 -2px 5px rgba(0,0,0,0.2);
        padding: 6px;
      }
      .legacy-btn { flex: 0 0 auto; padding: 0 12px; height: 32px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }}>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{ opacity: 0.1, fontSize: "9px" }}
        >
          Theme
        </button>
      </div>

      <div className="blood-report-layout">
        {/* === LEFT SECTION: FORM === */}
        <div className="form-container">
          {/* HEADER */}
          <div
            className="panel-header d-flex justify-content-between align-items-center px-2 border-bottom"
            style={{ height: "35px", flexShrink: 0 }}
          >
            <div className="d-flex align-items-center gap-2">
              <h6
                className="m-0 fw-bold"
                style={{ fontSize: "1.85rem", letterSpacing: "0.5px" }}
              >
                Blood Report Format
              </h6>{" "}
            </div>
          </div>

          {/* Header */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <div className="field-row">
              <span className="" style={{ ...labelStyle }}>
                Case No.
              </span>
              {/* <input
                type="text"
                value={caseNO}
                // onChange={(e) => {
                //   setCaseNO(e.target.value);
                // }}
                style={{ ...inputStyle, padding: "0 2px" }}
              /> */}

              <Select
                value={selectedCase}
                onChange={setSelectedCase}
                onInputChange={(inputValue) => {
                  searchCase(inputValue);
                }}
                options={caseSearchResults.map((item) => ({
                  value: item.CaseId,
                  label: `${item.CaseNo} - ${item.PatientName}`,
                  ...item,
                }))}
                placeholder="Search test..."
                isSearchable
                isClearable
                isLoading={isSearchingCase}
                // isDisabled={mode === "view"}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < 2
                    ? "Type at least 2 characters"
                    : "No test found"
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />

              <span className="" style={{ ...labelStyle }}>
                Patient
              </span>
              <input
                type="text"
                value={caseData?.PatientName}
                style={{ ...inputStyle, padding: "0 2px" }}
                disabled
              />
              <span className="" style={{ ...labelStyle }}>
                Report Dt
              </span>
              <input
                type="date"
                value={formData.ReportDt?.split("T")[0]}
                name="ReportDt"
                onChange={(e) => {
                  const value = e.target.value + "T00:00:00.000Z";
                  // console.log(value)
                  const name = "ReportDt";
                  onChangeFormData({ target: { name, value } });
                }}
                style={{ width: "110px" }}
              />
            </div>

            <div className="field-row">
              <span className="" style={{ ...labelStyle, width: "80px" }}>
                Pathologist
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  flex: 3,
                  minWidth: "200px",
                }}
              >
                <select
                  className="w-full"
                  name="PathologistId1"
                  value={formData.PathologistId1}
                  onChange={onChangeFormData}
                >
                  <option value="">Select Pathologist</option>

                  {pathologistMap.map((patho, i) => (
                    <option
                      key={patho.PathologistId}
                      value={patho.PathologistId}
                    >
                      {patho.Pathologist}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full"
                  name="PathologistId2"
                  value={formData.PathologistId2}
                  onChange={onChangeFormData}
                >
                  <option value="">Select Pathologist</option>

                  {pathologistMap.map((patho, i) => (
                    <option
                      key={patho.PathologistId}
                      value={patho.PathologistId}
                    >
                      {patho.Pathologist}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full"
                  name="PathologistId3"
                  value={formData.PathologistId3}
                  onChange={onChangeFormData}
                >
                  <option value="">Select Pathologist</option>
                  {pathologistMap.map((patho, i) => (
                    <option
                      key={patho.PathologistId}
                      value={patho.PathologistId}
                    >
                      {patho.Pathologist}
                    </option>
                  ))}
                </select>
              </div>
              <span className="" style={{ ...labelStyle }}>
                Time
              </span>
              <input
                name="ReportTime"
                type="time"
                style={{ width: "110px" }}
                // value={formData.ReportTime}
                value={new Date(
                  `1970-01-01 ${formData.ReportTime}`
                ).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                onChange={(e) => {
                  console.log(e.target.value);
                  let t;
                  if (e.target.value.split(":")[0] > 12) {
                    t = `${Number(e.target.value.split(":")[0]) - 12}:${
                      e.target.value.split(":")[1]
                    }:00 PM`;
                  } else {
                    t = `${e.target.value}:00 AM`;
                  }
                  console.log("final time: ", t);
                  onChangeFormData({
                    target: { name: e.target.name, value: t },
                  });
                }}
              />
            </div>
          </div>

          {/* Haemoglobin */}
          <div className="panel-box" style={{ marginTop: "2px" }}>
            <div className="hemo-row">
              <span className="label" style={{ ...labelStyle }}>
                Haemoglobin [
              </span>
              <input
                type="number"
                className="w-short text-end"
                name="Himoglobin1"
                onChange={(e) => {
                  onChangeFormData(e);
                  const val = (
                    (formData.Himoglobin2 / e.target.value) *
                    100
                  ).toFixed(2);
                  setFormData((prev) => ({
                    ...prev,

                    PCV: (Number(e.target.value) * 0.3).toFixed(2),
                    Himoglobin3: val,
                    MCH:
                      formData.Erythrocytes !== 0
                        ? (
                            (Number(e.target.value) * 10) /
                            Number(formData.Erythrocytes)
                          ).toFixed(2)
                        : 0,
                  }));
                }}
                value={formData.Himoglobin1}
              />
              <span className="label" style={{ ...labelStyle }}>
                in 100% ]
              </span>
              <span
                className="label"
                style={{ color: "red", marginLeft: "4px" }}
              >
                [
              </span>
              <input
                type="number"
                className="w-short text-end"
                name="Himoglobin2"
                onChange={(e) => {
                  onChangeFormData(e);
                  const val = (
                    (e.target.value / formData.Himoglobin1) *
                    100
                  ).toFixed(2);
                  setFormData((prev) => ({
                    ...prev,
                    Himoglobin3: val,
                  }));
                }}
                value={formData.Himoglobin2}
              />
              <span className="label" style={{ ...labelStyle }}>
                gms per 100cm =
              </span>
              <input
                type="number"
                className="w-short text-end"
                name="Himoglobin3"
                onChange={onChangeFormData}
                value={Number(formData.Himoglobin3)?.toFixed(2)}
              />
              <span className="label" style={{ color: "red" }}>
                %]
              </span>
              <div style={{ flex: 1, minWidth: "10px" }}></div>
              <label style={{ whiteSpace: "nowrap", ...labelStyle }}>
                <input type="checkbox" defaultChecked /> Default Unit
              </label>
            </div>
          </div>

          {/* Counts & Indices */}
          <div className="counts-grid">
            {/* LEFT SUB-COLUMN */}
            <div
              className="panel-box"
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <div className="field-row">
                <span className="" style={{ ...labelStyle }}>
                  Erythrocytes(RBC)
                </span>
                <input
                  type="Number"
                  className=""
                  name="Erythrocytes"
                  value={formData.Erythrocytes}
                  onChange={(e) => {
                    onChangeFormData(e);
                    setFormData((prev) => ({
                      ...prev,
                      MCH:
                        e.target.value != 0
                          ? (
                              (Number(formData.Himoglobin1) * 10) /
                              Number(e.target.value)
                            ).toFixed(2)
                          : 0,
                    }));
                  }}
                  style={{ ...inputStyle, padding: "0 2px" }}
                />
                {/* <span className="" style={{ ...labelStyle }}>
                  million/cumm.
                </span> */}

                <input
                  type="text"
                  className=""
                  name="ErythrocytesUnit"
                  value={formData.ErythrocytesUnit}
                  onChange={onChangeFormData}
                  style={{ ...inputStyle, padding: "0 2px" }}
                />
                <span className="" style={{ ...labelStyle }}>
                  Leucocytes(WBC)
                </span>
                <input
                  className="w-short text-end"
                  type="Number"
                  name="Leucocytes"
                  value={formData.Leucocytes}
                  onChange={(e) => {
                    onChangeFormData(e);
                    setFormData((prev) => ({
                      ...prev,
                      AdEosCount: (
                        (Number(e.target.value) *
                          Number(formData.Eosinophils)) /
                        100
                      ).toFixed(2),
                    }));
                  }}
                  style={{ ...inputStyle, padding: "0 2px" }}
                />
                {/* <span className="form-label mb-0" style={{ ...labelStyle }}>
                  /cumm.
                </span> */}

                <input
                  type="text"
                  className=""
                  name="LeucocytesUnit"
                  value={formData.LeucocytesUnit}
                  onChange={onChangeFormData}
                  style={{ ...inputStyle, padding: "0 2px" }}
                />
              </div>

              <div className="field-row">
                <span className="" style={{ ...labelStyle }}>
                  Nucleated RBC
                </span>
                <input
                  type="Number"
                  name="NucleatedRBC"
                  value={formData.NucleatedRBC}
                  onChange={(e) => {
                    onChangeFormData(e);
                    setFormData((prev) => ({
                      ...prev,
                      CorrectedWBCCount: (
                        (100 * Number(formData.Leucocytes)) /
                        (100 + Number(e.target.value))
                      ).toFixed(2),
                    }));
                  }}
                  style={{ ...inputStyle, padding: "0 2px" }}
                  className="w-short text-end"
                  disabled={!req}
                />

                <input
                  type="text"
                  className=""
                  name="NucleatedRBCUnit"
                  value={formData.NucleatedRBCUnit}
                  onChange={onChangeFormData}
                  style={{ ...inputStyle, padding: "0 2px" }}
                  disabled={!req}
                />
                <div style={{ width: "20px" }}></div>
                <label>
                  <input
                    type="checkbox"
                    checked={req}
                    onChange={() => {
                      setReq((c) => !c);
                      if (req) {
                        setFormData((prev) => ({
                          ...prev,
                          NucleatedRBC: 0,
                          NucleatedRBCUnit: "",
                          CorrectedWBCCount: 0,
                          CorrectedWBCCountUnit: "",
                        }));
                      }
                    }}
                  />{" "}
                  <span className=" " style={{ ...labelStyle }}>
                    Required
                  </span>
                </label>
              </div>
              <div className="field-row">
                <span className=" " style={{ ...labelStyle }}>
                  Corrected WBC Count
                </span>
                <input
                  type="Number"
                  name="CorrectedWBCCount"
                  value={formData.CorrectedWBCCount}
                  onChange={onChangeFormData}
                  style={{ ...inputStyle, padding: "0 2px" }}
                  className="w-short text-end"
                  disabled={!req}
                />

                <input
                  type="text"
                  className=""
                  name="CorrectedWBCCountUnit"
                  value={formData.CorrectedWBCCountUnit}
                  onChange={onChangeFormData}
                  style={{ ...inputStyle, padding: "0 2px" }}
                  disabled={!req}
                />
              </div>

              <div className="group-border">
                <div className="field-row">
                  <span className="" style={{ ...labelStyle }}>
                    Neutrophils
                  </span>
                  <input
                    type="number"
                    name="Neutrophils"
                    value={formData.Neutrophils}
                    onChange={onChangeFormData}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="" style={{ ...labelStyle }}>
                    %
                  </span>
                  <span className="" style={{ ...labelStyle }}>
                    Lymphocytes
                  </span>
                  <input
                    type="number"
                    name="Lymphocytes"
                    value={formData.Lymphocytes}
                    className="w-tiny text-end"
                    onChange={onChangeFormData}
                    style={{ ...inputStyle, padding: "0 2px" }}
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    %
                  </span>
                  <span className="" style={{ ...labelStyle }}>
                    Monocytes
                  </span>
                  <input
                    type="number"
                    name="Monocytes"
                    value={formData.Monocytes}
                    onChange={onChangeFormData}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    %
                  </span>
                </div>
                <div className="field-row">
                  <span className=" " style={{ ...labelStyle }}>
                    Eosinophils
                  </span>
                  <input
                    type="number"
                    name="Eosinophils"
                    value={formData.Eosinophils}
                    onChange={(e) => {
                      onChangeFormData(e);
                      setFormData((prev) => ({
                        ...prev,
                        AdEosCount: (
                          (Number(e.target.value) *
                            Number(formData.Leucocytes)) /
                          100
                        ).toFixed(2),
                      }));
                    }}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    %
                  </span>
                  <span className="" style={{ ...labelStyle }}>
                    Basophils
                  </span>
                  <input
                    type="number"
                    name="Basophils"
                    value={formData.Basophils}
                    onChange={onChangeFormData}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    %
                  </span>
                </div>
              </div>

              {/* Abnormal Cell */}
              <div className="group-border">
                <span className="group-label">Abnormal Cell</span>
                <div className="abnormal-container">
                  <div className="abnormal-row mt-1">
                    <div className="abnormal-item">
                      <input
                        type="text"
                        placeholder="Cell Type"
                        value={formData.AbnCell1}
                        name="AbnCell1"
                        className="w-full"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        =
                      </span>
                      <input
                        type="number"
                        className="w-tiny text-end"
                        value={formData.AbnCell1Val}
                        name="AbnCell1Val"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        %
                      </span>
                    </div>
                    <div className="abnormal-item">
                      <input
                        type="text"
                        placeholder="Cell Type"
                        name="AbnCell4"
                        value={formData.AbnCell4}
                        onChange={onChangeFormData}
                        className="w-full"
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        =
                      </span>
                      <input
                        type="number"
                        className="w-tiny text-end"
                        value={formData.AbnCell4Val}
                        name="AbnCell4Val"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        %
                      </span>
                    </div>
                  </div>
                  <div className="abnormal-row">
                    <div className="abnormal-item">
                      <input
                        type="text"
                        placeholder="Cell Type"
                        value={formData.AbnCell2}
                        name="AbnCell2"
                        className="w-full"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        =
                      </span>
                      <input
                        type="number"
                        className="w-tiny text-end"
                        value={formData.AbnCell2Val}
                        name="AbnCell2Val"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        %
                      </span>
                    </div>
                    <div className="abnormal-item">
                      <input
                        type="text"
                        placeholder="Cell Type"
                        name="AbnCell5"
                        value={formData.AbnCell5}
                        onChange={onChangeFormData}
                        className="w-full"
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        =
                      </span>
                      <input
                        type="number"
                        className="w-tiny text-end"
                        value={formData.AbnCell5Val}
                        name="AbnCell5Val"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        %
                      </span>
                    </div>
                  </div>
                  <div className="abnormal-row">
                    <div className="abnormal-item">
                      <input
                        type="text"
                        placeholder="Cell Type"
                        value={formData.AbnCell3}
                        name="AbnCell3"
                        className="w-full"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        =
                      </span>
                      <input
                        type="number"
                        className="w-tiny text-end"
                        value={formData.AbnCell3Val}
                        name="AbnCell3Val"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        %
                      </span>
                    </div>
                    <div className="abnormal-item">
                      <input
                        type="text"
                        placeholder="Cell Type"
                        name="AbnCell6"
                        value={formData.AbnCell6}
                        onChange={onChangeFormData}
                        className="w-full"
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        =
                      </span>
                      <input
                        type="number"
                        className="w-tiny text-end"
                        value={formData.AbnCell6Val}
                        name="AbnCell6Val"
                        onChange={onChangeFormData}
                      />
                      <span className="label" style={{ ...labelStyle }}>
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="group-border"
                style={{ flex: 1, display: "flex" }}
              >
                <span className="group-label">Prepheral Smear Study</span>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <textarea
                    className="w-full"
                    rows={2}
                    name="SemearStudy1"
                    onChange={onChangeFormData}
                    value={formData.SemearStudy1}
                    disabled={!req1}
                  ></textarea>
                  <textarea
                    className="w-full"
                    rows={2}
                    name="SemearStudy2"
                    onChange={onChangeFormData}
                    value={formData.SemearStudy2}
                    disabled={!req1}
                  ></textarea>
                  <textarea
                    className="w-full"
                    rows={2}
                    name="SemearStudy3"
                    onChange={onChangeFormData}
                    value={formData.SemearStudy3}
                    disabled={!req1}
                  ></textarea>
                </div>
                <div
                  style={{
                    width: "25px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    writingMode: "vertical-rl",
                    fontSize: "10px",
                    color: "#008080",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={req1}
                      onChange={() => {
                        setReq1((c) => !c);
                        if (req1) {
                          setFormData((prev) => ({
                            ...prev,

                            SemearStudy1: "",
                            SemearStudy2: "",
                            SemearStudy3: "",
                          }));
                        }
                      }}
                    />{" "}
                    Required
                  </label>
                </div>
              </div>

              <div
                className="field-row"
                style={{ marginTop: "4px", alignItems: "flex-start" }}
              >
                <span
                  className="label blue-text"
                  style={{ width: "110px", marginTop: "5px", ...labelStyle }}
                >
                  Sedimentation Rate
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    borderLeft: "1px solid #ffffffff",
                    paddingLeft: "6px",
                    flex: 1,
                  }}
                >
                  <div className="field-row">
                    <span
                      className="label"
                      style={{ width: "100px", ...labelStyle }}
                    >
                      1st hour reading
                    </span>
                    <input
                      type="number"
                      value={formData["1StHrsCount"]}
                      name="1StHrsCount"
                      onChange={(e) => {
                        onChangeFormData(e);
                        setFormData((prev) => ({
                          ...prev,
                          MeanESR: (
                            (Number(e.target.value) +
                              Number(formData["2ndHrsCount"])) /
                            2
                          ).toFixed(2),
                        }));
                      }}
                      className="w-tiny text-end"
                    />{" "}
                    <span className="label" style={{ ...labelStyle }}>
                      mm
                    </span>
                  </div>
                  <div className="field-row">
                    <span
                      className="label"
                      style={{ width: "100px", ...labelStyle }}
                    >
                      2nd hour reading
                    </span>
                    <input
                      type="number"
                      value={formData["2ndHrsCount"]}
                      name="2ndHrsCount"
                      onChange={(e) => {
                        onChangeFormData(e);
                        setFormData((prev) => ({
                          ...prev,
                          MeanESR: (
                            (Number(e.target.value) +
                              Number(formData["1StHrsCount"])) /
                            2
                          ).toFixed(2),
                        }));
                      }}
                      className="w-tiny text-end"
                    />{" "}
                    <span className="label" style={{ ...labelStyle }}>
                      mm
                    </span>
                  </div>
                  <div className="field-row">
                    <span
                      className="label"
                      style={{ width: "100px", ...labelStyle }}
                    >
                      Mean E.S.R
                    </span>
                    <input
                      type="text"
                      value={formData.MeanESR}
                      name="MeanESR"
                      onChange={onChangeFormData}
                      className="w-tiny text-end"
                    />{" "}
                    <span className="label" style={{ ...labelStyle }}>
                      mm/hour
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SUB-COLUMN */}
            <div
              className="panel-box"
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <div
                className="panel-box"
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <div className="panel-box">
                  <div
                    className="field-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "32px",
                    }}
                  >
                    <span className="" style={{ ...labelStyle }}>
                      P.C.V
                    </span>
                    <input
                      type="number"
                      name="PCV"
                      value={formData.PCV}
                      onChange={onChangeFormData}
                      style={{ width: "80px" }}
                      className="w-tiny text-end"
                    />
                    <input
                      type="text"
                      name="PCVUnit"
                      value={formData.PCVUnit}
                      onChange={onChangeFormData}
                      style={{ width: "30px" }}
                      className="w-tiny text-end"
                    />
                  </div>

                  <div
                    className="field-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "30px",
                    }}
                  >
                    <span className="" style={{ ...labelStyle }}>
                      M.C.V
                    </span>
                    <input
                      type="number"
                      name="MCV"
                      value={formData.MCV}
                      onChange={onChangeFormData}
                      style={{ width: "80px" }}
                      className="w-tiny text-end"
                    />
                    <input
                      type="text"
                      name="MCVUnit"
                      value={formData.MCVUnit}
                      onChange={onChangeFormData}
                      style={{ width: "30px" }}
                      className="w-tiny text-end"
                    />
                    <span className="label" style={{ ...labelStyle }}></span>
                  </div>

                  <div
                    className="field-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "30px",
                    }}
                  >
                    <span className="" style={{ ...labelStyle, gap: "50px" }}>
                      M.C.H
                    </span>
                    <input
                      type="number"
                      name="MCH"
                      value={formData.MCH}
                      onChange={onChangeFormData}
                      style={{ width: "80px" }}
                      className="w-tiny text-end"
                    />
                    <input
                      type="text"
                      name="MCHUnit"
                      value={formData.MCHUnit}
                      onChange={onChangeFormData}
                      style={{ width: "30px" }}
                      className="w-tiny text-end"
                    />
                    <span className="label"></span>
                  </div>

                  <div
                    className="field-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <span className="" style={{ ...labelStyle, gap: "50px" }}>
                      M.C.H.C
                    </span>
                    <input
                      type="number"
                      name="MCHC"
                      value={formData.MCHC}
                      onChange={onChangeFormData}
                      style={{ width: "80px" }}
                      className="w-tiny text-end"
                    />
                    <input
                      type="text"
                      name="MCHCUnit"
                      value={formData.MCHCUnit}
                      onChange={onChangeFormData}
                      style={{ width: "50px" }}
                      className="w-tiny text-end"
                    />
                  </div>

                  <div
                    className="field-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span className="" style={{ ...labelStyle }}>
                      RDW(CV)
                    </span>
                    <input
                      type="number"
                      value={formData.RDW}
                      name="RDW"
                      onChange={onChangeFormData}
                      style={{ width: "80px" }}
                      className="w-tiny text-end"
                    />
                    <input
                      type="text"
                      name="RDWUnit"
                      value={formData.RDWUnit}
                      onChange={onChangeFormData}
                      style={{ width: "50px" }}
                      className="w-tiny text-end"
                    />
                    <span className="label"></span>
                  </div>

                  <div
                    className="field-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span className="" style={{ ...labelStyle }}>
                      PDW(CV)
                    </span>
                    <input
                      type="text"
                      name="PDW"
                      value={formData.PDW}
                      onChange={onChangeFormData}
                      style={{ width: "80px" }}
                      className="w-tiny text-end"
                    />
                    <input
                      type="text"
                      name="PDWUnit"
                      value={formData.PDWUnit}
                      onChange={onChangeFormData}
                      style={{ width: "50px" }}
                      className="w-tiny text-end"
                    />
                    <span className="label"></span>
                  </div>
                </div>
              </div>

              <div className="panel-box">
                <div className="field-row">
                  <span
                    className="label"
                    style={{ width: "110px", ...labelStyle }}
                  >
                    Platelet count
                  </span>
                  <input
                    type="number"
                    value={formData.PalletsCount}
                    name="PalletsCount"
                    onChange={onChangeFormData}
                    className="w-short text-end"
                    style={{ backgroundColor: "#e0e0e0" }}
                  />
                  <input
                    type="text"
                    name="PalateCountUnit"
                    value={formData.PalateCountUnit}
                    onChange={onChangeFormData}
                    style={{ width: "50px" }}
                    className="w-tiny text-end"
                  />
                </div>
                <div className="field-row">
                  <span
                    className="label"
                    style={{ width: "110px", ...labelStyle }}
                  >
                    Reticulocyte count
                  </span>
                  <input
                    type="number"
                    value={formData.ReticulocyCount}
                    name="ReticulocyCount"
                    onChange={onChangeFormData}
                    className="w-short text-end"
                  />
                </div>
                <div className="field-row">
                  <span
                    className="label"
                    style={{ width: "110px", ...labelStyle }}
                  >
                    Ab. Eosinophils Co
                  </span>
                  <input
                    type="number"
                    name="AdEosCount"
                    value={formData.AdEosCount}
                    onChange={onChangeFormData}
                    className="w-short text-end"
                  />
                </div>
                <div className="field-row">
                  <span
                    className="label"
                    style={{ width: "110px", ...labelStyle }}
                  >
                    Malaria Parasite
                  </span>
                  <input
                    type="text"
                    className="w-full"
                    value={formData.MaleriaParasite}
                    name="MaleriaParasite"
                    onChange={onChangeFormData}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="panel-box">
                <div className="field-row">
                  <span
                    className="label"
                    style={{ width: "80px", ...labelStyle }}
                  >
                    Bleeding Time
                  </span>
                  <input
                    type="number"
                    value={formData.BleedTimeMin}
                    name="BleedTimeMin"
                    onChange={onChangeFormData}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    min
                  </span>
                  <input
                    type="number"
                    value={formData.BleedTimeSec}
                    name="BleedTimeSec"
                    onChange={onChangeFormData}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    sec
                  </span>
                </div>
                <div className="field-row">
                  <span
                    className="label"
                    style={{ width: "80px", ...labelStyle }}
                  >
                    Colleting Time
                  </span>
                  <input
                    type="number"
                    value={formData.CoagulMin}
                    name="CoagulMin"
                    onChange={onChangeFormData}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    min
                  </span>
                  <input
                    type="number"
                    value={formData.CoagulSec}
                    name="CoagulSec"
                    onChange={onChangeFormData}
                    className="w-tiny text-end"
                  />{" "}
                  <span className="label" style={{ ...labelStyle }}>
                    sec
                  </span>
                </div>
                <div className="field-row" style={{ marginTop: "4px" }}>
                  <span
                    className="label"
                    style={{ width: "80px", ...labelStyle }}
                  >
                    Entry By
                    {console.log("case data: ", caseData)}
                  </span>
                  {/* <input
                    type="text"
                    value={""}
                    className="w-full"
                    style={{ flex: 1 }}
                  /> */}
                  <select value={caseData?.UserId}>
                    <option value={""}>---</option>
                    {users.map((user, i) => (
                      <option key={i} value={user.UserId}>
                        {user.UserName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="group-border" style={{ flex: 1 }}>
                <span className="group-label">Remarks</span>
                {
                  formData.Remarks? <textarea
                  className="w-full"
                  rows={3}
                  name="Remarks"
                  value={formData.Remarks}
                  onChange={onChangeFormData}
                ></textarea>:
                <select 
                  className="w-full"
onChange={
  (e)=>{
setFormData(prev=>({...prev, Remarks: e.target.value}))
  }
}                >
<option value={""}>---</option>
                  {remarksSuggest.map((remarks,i)=>(
                    <option value={remarks.Remarks} key={i}>{remarks.Remarks}</option>
                  ))}
                </select>
                }
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT SECTION: LIS PANEL === */}
        <div className="right-panel">
          <div className="label bold text-center">Case No.</div>
          <div className="barcode-box">
            <Barcode
              value={caseNO}
              height={40}
              width={1.5}
              fontSize={12}
              margin={0}
            />
          </div>

          <div className="label bold">Lab Sl.No.</div>
          <textarea
            style={{ height: "50px", backgroundColor: "primary" }}
            value={formData.LabId}
            name="LabId"
            onChange={onChangeFormData}
          ></textarea>

          {/* EDITABLE LIS TABLE */}
          <div className="lis-header">LIS Machine Generated Value</div>
          <div className="lis-table-container">
            <table className="lis-table">
              <thead>
                <tr>
                  <th style={{ width: "50%", ...labelStyle }}>Test Name</th>
                  <th>LIS Value</th>
                </tr>
              </thead>
              <tbody>
                {lisData.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={row.test}
                        onChange={(e) =>
                          handleLisChange(index, "test", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={row.value}
                        onChange={(e) =>
                          handleLisChange(index, "value", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* === BOTTOM ACTION BAR === */}
        <div
          className="panel-footer p-2 border-top bg-rt-color-dark d-flex justify-content-center"
          style={{ flexShrink: 0, minHeight: "45px", height: "auto" }}
        >
          <div className="d-flex gap-2 flex-wrap justify-content-center">
            {/* <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                navigate("/BloodReport/add");
              }}
            >
              New
            </button> */}

            {/* <button className="btn btn-sm btn-primary">Edit</button> */}
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
            {/* <button className="btn btn-sm btn-primary">Delete</button> */}
            {/* <button className="btn btn-sm btn-primary">Undo</button> */}

            {/* <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                // handlePrint(data);
              }}
            >
              Print
            </button> */}
            <button className="btn btn-sm btn-primary">Exit</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BloodReportAdd;
