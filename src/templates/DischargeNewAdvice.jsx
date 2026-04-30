import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAxiosFetch from "./DiagnosisMaster/Fetch";
import axiosInstance from "../axiosInstance";

const SectionCard = ({ title, icon, color, children }) => (
  <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: `1px solid ${color}30` }}>
    <div style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, color: "#fff", padding: "10px 16px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>{title}
    </div>
    <div style={{ background: "#fff", padding: 12 }}>{children}</div>
  </div>
);

const NumberedTextArea = ({ value, onChange, readOnly, placeholder, rows = 4 }) => {
  const ref = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !readOnly) {
      e.preventDefault();
      const ta = ref.current;
      const pos = ta.selectionStart;
      const text = ta.value;
      const lines = text.substring(0, pos).split("\n");
      const nextNum = lines.length + 1;
      const newText = text.substring(0, pos) + `\n${nextNum}. ` + text.substring(pos);
      onChange(newText);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = pos + `\n${nextNum}. `.length;
        ta.focus();
      }, 0);
    }
  };

  const ensureFirstNumber = (val) => {
    if (!val || val.trim() === "") return "";
    if (!/^\d+\./.test(val.trim())) return `1. ${val}`;
    return val;
  };

  return (
    <textarea
      ref={ref}
      className="form-control"
      rows={rows}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => {
        if (!readOnly && !e.target.value) onChange("1. ");
      }}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      placeholder={readOnly ? "" : placeholder || "Type here... Press Enter for new numbered line"}
      style={{
        border: readOnly ? "none" : "1px solid #ddd",
        background: readOnly ? "#f8f9fa" : "#fff",
        resize: "vertical", fontSize: 13, lineHeight: 1.8,
        fontFamily: "'Segoe UI', sans-serif",
        whiteSpace: "pre-wrap",
      }}
    />
  );
};

const PlainTextArea = ({ value, onChange, readOnly, placeholder, rows = 3 }) => (
  <textarea
    className="form-control"
    rows={rows}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    readOnly={readOnly}
    placeholder={readOnly ? "" : placeholder}
    style={{
      border: readOnly ? "none" : "1px solid #ddd",
      background: readOnly ? "#f8f9fa" : "#fff",
      resize: "vertical", fontSize: 13, lineHeight: 1.8,
      whiteSpace: "pre-wrap",
    }}
  />
);

// Convert array to numbered text
const arrayToText = (arr, key) => {
  if (!arr || arr.length === 0) return "";
  return arr.sort((a, b) => (a.SlNo || 0) - (b.SlNo || 0)).map((item, i) => `${i + 1}. ${item[key] || ""}`).join("\n");
};

// Convert numbered text to array
const textToArray = (text, key) => {
  if (!text || !text.trim()) return [];
  return text.split("\n").filter(l => l.trim()).map((line, i) => ({
    SlNo: i + 1,
    [key]: line.replace(/^\d+\.\s*/, "").trim(),
  }));
};

// Convert medicine array to text
const medArrayToText = (arr) => {
  if (!arr || arr.length === 0) return "";
  return arr.sort((a, b) => (a.SlNo || 0) - (b.SlNo || 0)).map((item, i) => {
    const parts = [item.Type, item.Medicine, item.dose, item.unit, item.days ? `${item.days} days` : ""].filter(Boolean).join(" — ");
    return `${i + 1}. ${parts || item.Medicine || ""}`;
  }).join("\n");
};

const DischargeNewAdvice = () => {
  const savedAdmitionId = sessionStorage.getItem("selectedAdmitionId");
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: emrData } = useAxiosFetch(id ? `/emr/D-${id}` : null, [id]);
  const { data: medData } = useAxiosFetch(id ? `/discertdtl/by-id/${encodeURIComponent(id)}` : null, [id]);
  const { data: dischargeData } = useAxiosFetch(id ? `/discert/${id}` : null, [id]);

  const [isEditMode, setIsEditMode] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    diagnosis: "",
    complaints: "",
    pastHistory: "",
    investigations: "",
    adviceMedicine: "",
    significantFindings: "",
    investigationResults: "",
    conditionAtDischarge: "",
    followUpDate: "",
  });

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  // Load from API
  useEffect(() => {
    if (!emrData && !dischargeData && !medData) return;

    setForm({
      diagnosis: arrayToText(emrData?.diagnosis, "diagonisis"),
      complaints: arrayToText(emrData?.complaints, "chief"),
      pastHistory: arrayToText(emrData?.pastHistory, "pasthistory"),
      investigations: arrayToText(emrData?.investigations, "Invest"),
      adviceMedicine: medArrayToText(medData),
      significantFindings: dischargeData?.G || "",
      investigationResults: dischargeData?.C || "",
      conditionAtDischarge: dischargeData?.F || "",
      followUpDate: dischargeData?.E || "",
    });

    if (emrData || medData) setIsEditMode(false);
  }, [emrData, medData, dischargeData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // EMR
      const emrPayload = {
        RegistrationId: `D-${id}`,
        admissionid: savedAdmitionId,
        VisitId: "null",
        pastHistory: textToArray(form.pastHistory, "pasthistory"),
        complaints: textToArray(form.complaints, "chief"),
        diagnosis: textToArray(form.diagnosis, "diagonisis"),
        investigations: textToArray(form.investigations, "Invest"),
      };

      if (isEditMode) {
        await axiosInstance.post(`/emr/bulk`, emrPayload);
      } else {
        await axiosInstance.put(`/emr/bulk`, emrPayload);
      }

      // Advice Medicine
      const medLines = form.adviceMedicine ? form.adviceMedicine.split("\n").filter(l => l.trim()) : [];
      const advicePayload = {
        records: medLines.map((line) => ({
          DisCerId: `${id}`,
          DisCerDate: new Date().toISOString().split("T")[0],
          DisCerTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          AdmitionId: savedAdmitionId,
          Medicine: line.replace(/^\d+\.\s*/, "").trim(),
          unit: "", days: "", dose: "", Type: "",
        })),
      };

      if (advicePayload.records.length > 0) {
        if (isEditMode) {
          await axiosInstance.post(`/discertdtl/bulk`, advicePayload);
        } else {
          await axiosInstance.put(`/discertdtl/bulk/${encodeURIComponent(id)}`, advicePayload);
        }
      }

      // Discharge main
      const dp = {
        AdmitionId: savedAdmitionId,
        G: form.significantFindings || "",
        E: form.followUpDate || "",
        F: form.conditionAtDischarge || "",
        C: form.investigationResults || "",
      };
      if (dp.G || dp.E || dp.F || dp.C) {
        await axiosInstance.put(`/discert/${id}`, dp);
      }

      toast.success("Saved Successfully!");
      sessionStorage.removeItem("selectedAdmitionId");
    } catch (error) {
      console.error("SAVE ERROR:", error);
      toast.error("Something went wrong!");
    } finally {
      setSaving(false);
    }
  };

  const ro = !isEditMode;

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", paddingBottom: 40 }}>
      <div style={{ background: "linear-gradient(135deg, #1a237e, #283593)", color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        <div>
          <h5 style={{ margin: 0, fontWeight: 700 }}>📝 Discharge Summary & Advice</h5>
          <small style={{ opacity: 0.8 }}>ID: {id}</small>
        </div>
        <div className="d-flex gap-2">
          <button className={`btn btn-sm ${isEditMode ? "btn-warning" : "btn-outline-light"}`} onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? "🔒 View Mode" : "✏️ Edit Mode"}
          </button>
          {!ro && <button className="btn btn-sm btn-success" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "💾 Save"}</button>}
          <button className="btn btn-sm btn-outline-light" onClick={() => navigate(`/discharge/${encodeURIComponent(id)}/print`)}>🖨 Print</button>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: 6, background: isEditMode ? "#fff3e0" : "#e8f5e9", fontWeight: 600, fontSize: 12, color: isEditMode ? "#e65100" : "#2e7d32" }}>
        {isEditMode ? "✏️ EDIT MODE — Press Enter for new numbered line" : "👁️ VIEW MODE — Read only"}
      </div>

      <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 16px" }}>
        <div className="row g-3">
          <div className="col-md-6">
            <SectionCard title="Diagnosis" icon="🩺" color="#2e7d32">
              <NumberedTextArea value={form.diagnosis} onChange={set("diagnosis")} readOnly={ro} placeholder="Type diagnosis..." rows={4} />
            </SectionCard>

            <SectionCard title="Past History" icon="📜" color="#e65100">
              <NumberedTextArea value={form.pastHistory} onChange={set("pastHistory")} readOnly={ro} placeholder="Type past history..." rows={3} />
            </SectionCard>

            <SectionCard title="Significant Findings (Vitals)" icon="📊" color="#0277bd">
              <PlainTextArea value={form.significantFindings} onChange={set("significantFindings")} readOnly={ro} placeholder="BP= 120/70 MM OF HG&#10;P= 78 B/MIN..." rows={4} />
            </SectionCard>

            <SectionCard title="Investigation Results" icon="🧪" color="#6a1b9a">
              <PlainTextArea value={form.investigationResults} onChange={set("investigationResults")} readOnly={ro} placeholder="ATTACHED / Enter results..." rows={2} />
            </SectionCard>

            <SectionCard title="Treatment Done / Procedure" icon="🔬" color="#7b1fa2">
              <NumberedTextArea value={form.investigations} onChange={set("investigations")} readOnly={ro} placeholder="Type treatment done..." rows={3} />
            </SectionCard>
          </div>

          <div className="col-md-6">
            <SectionCard title="Chief Complaints" icon="📋" color="#1565c0">
              <NumberedTextArea value={form.complaints} onChange={set("complaints")} readOnly={ro} placeholder="Type chief complaints..." rows={4} />
            </SectionCard>

            <SectionCard title="Advice on Discharge" icon="💊" color="#c62828">
              <NumberedTextArea value={form.adviceMedicine} onChange={set("adviceMedicine")} readOnly={ro} placeholder="TAB PARACETAMOL 500MG — 1+0+1 — 5 DAYS" rows={8} />
            </SectionCard>

            <SectionCard title="Follow Up Date / Advice" icon="📅" color="#2e7d32">
              <PlainTextArea value={form.followUpDate} onChange={set("followUpDate")} readOnly={ro} placeholder="REVIEW AFTER 7 DAYS" rows={2} />
            </SectionCard>

            <SectionCard title="Condition At Discharge" icon="🏥" color="#c62828">
              <PlainTextArea value={form.conditionAtDischarge} onChange={set("conditionAtDischarge")} readOnly={ro} placeholder="PT IS HEMODYNAMICALLY STABLE..." rows={2} />
            </SectionCard>
          </div>
        </div>

        {!ro && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button className="btn btn-lg btn-success px-5" onClick={handleSave} disabled={saving} style={{ borderRadius: 30, fontWeight: 700, boxShadow: "0 4px 12px rgba(46,125,50,0.3)" }}>
              {saving ? "⏳ Saving..." : "💾 Save Discharge Summary"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DischargeNewAdvice;
