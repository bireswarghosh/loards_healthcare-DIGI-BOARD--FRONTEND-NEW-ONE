import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAxiosFetch from "./DiagnosisMaster/Fetch";
import axiosInstance from "../axiosInstance";

const SectionCard = ({ title, icon, color, children }) => (
  <div className="discharge-card" style={{ "--card-color": color }}>
    <div className="discharge-card-header">
      <span className="discharge-card-icon">{icon}</span>{title}
    </div>
    <div className="discharge-card-body">{children}</div>
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

  return (
    <textarea
      ref={ref}
      className="form-control discharge-textarea"
      rows={rows}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => { if (!readOnly && !e.target.value) onChange("1. "); }}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      placeholder={readOnly ? "" : placeholder || "Type here... Press Enter for new numbered line"}
      style={{ background: readOnly ? "#f8f9fa" : "#fff" }}
    />
  );
};

const PlainTextArea = ({ value, onChange, readOnly, placeholder, rows = 3 }) => (
  <textarea
    className="form-control discharge-textarea"
    rows={rows}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    readOnly={readOnly}
    placeholder={readOnly ? "" : placeholder}
    style={{ background: readOnly ? "#f8f9fa" : "#fff" }}
  />
);

const arrayToText = (arr, key) => {
  if (!arr || arr.length === 0) return "";
  return arr.sort((a, b) => (a.SlNo || 0) - (b.SlNo || 0)).map((item, i) => `${i + 1}. ${item[key] || ""}`).join("\n");
};

const textToArray = (text, key) => {
  if (!text || !text.trim()) return [];
  return text.split("\n").filter(l => l.trim()).map((line, i) => ({
    SlNo: i + 1,
    [key]: line.replace(/^\d+\.\s*/, "").trim(),
  })).filter(item => item[key]);
};

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
  const { data: emrData, loading: emrLoading } = useAxiosFetch(id ? `/emr/D-${id}` : null, [id]);
  const { data: medData, loading: medLoading } = useAxiosFetch(id ? `/discertdtl/by-id/${encodeURIComponent(id)}` : null, [id]);
  const { data: dischargeData, loading: disLoading } = useAxiosFetch(id ? `/discert/${id}` : null, [id]);

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

  const set = useCallback((key) => (val) => setForm((p) => ({ ...p, [key]: val })), []);

  // Load from API — wait until all fetches complete
  useEffect(() => {
    // Wait until all 3 API calls finish loading
    if (emrLoading || medLoading || disLoading) return;

    const hasEmr = emrData && (emrData.diagnosis?.length || emrData.complaints?.length || emrData.pastHistory?.length || emrData.investigations?.length);
    const hasMed = Array.isArray(medData) && medData.length > 0;
    const hasDis = dischargeData && (dischargeData.G || dischargeData.C || dischargeData.E || dischargeData.F || dischargeData.DisCerId);

    if (!hasEmr && !hasMed && !hasDis) return;

    setForm({
      diagnosis: arrayToText(emrData?.diagnosis, "diagonisis"),
      complaints: arrayToText(emrData?.complaints, "chief"),
      pastHistory: arrayToText(emrData?.pastHistory, "pasthistory"),
      investigations: arrayToText(emrData?.investigations, "Invest"),
      adviceMedicine: medArrayToText(Array.isArray(medData) ? medData : []),
      significantFindings: dischargeData?.G || "",
      investigationResults: dischargeData?.C || "",
      conditionAtDischarge: dischargeData?.F || "",
      followUpDate: dischargeData?.E || "",
    });

    if (hasEmr || hasMed) {
      setIsEditMode(false);
    }
  }, [emrData, medData, dischargeData, emrLoading, medLoading, disLoading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // EMR — always POST (backend now does DELETE+INSERT)
      const emrPayload = {
        RegistrationId: `D-${id}`,
        admissionid: savedAdmitionId,
        VisitId: "null",
        pastHistory: textToArray(form.pastHistory, "pasthistory"),
        complaints: textToArray(form.complaints, "chief"),
        diagnosis: textToArray(form.diagnosis, "diagonisis"),
        investigations: textToArray(form.investigations, "Invest"),
      };
      await axiosInstance.post(`/emr/bulk`, emrPayload);

      // Advice Medicine — bulkUpdate does DELETE+INSERT
      const medLines = form.adviceMedicine ? form.adviceMedicine.split("\n").filter(l => l.trim()) : [];
      const advicePayload = {
        records: medLines.map((line) => ({
          DisCerId: `${id}`,
          DisCerDate: new Date().toISOString().split("T")[0],
          DisCerTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          AdmitionId: savedAdmitionId,
          Medicine: line.replace(/^\d+\.\s*/, "").trim(),
          unit: "", days: "", dose: "", Type: "",
        })).filter(r => r.Medicine),
      };

      if (advicePayload.records.length > 0) {
        await axiosInstance.put(`/discertdtl/bulk/${encodeURIComponent(id)}`, advicePayload);
      } else {
        // Clear all medicine if empty
        await axiosInstance.put(`/discertdtl/bulk/${encodeURIComponent(id)}`, { records: [] });
      }

      // Discharge main fields
      const dp = {
        AdmitionId: savedAdmitionId,
        G: form.significantFindings || "",
        E: form.followUpDate || "",
        F: form.conditionAtDischarge || "",
        C: form.investigationResults || "",
      };
      await axiosInstance.put(`/discert/${id}`, dp);

      toast.success("Saved Successfully!");
      setIsEditMode(false);
    } catch (error) {
      console.error("SAVE ERROR:", error);
      toast.error("Something went wrong!");
    } finally {
      setSaving(false);
    }
  };

  const ro = !isEditMode;

  return (
    <>
      <style>{`
        .discharge-page { background: #f4f6f9; min-height: 80vh; padding-bottom: 30px; }
        .discharge-header { background: linear-gradient(135deg, #1e3a5f, #2d5a87); color: #fff; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(30,58,95,0.2); }
        .discharge-header h5 { margin: 0; font-weight: 700; font-size: 16px; }
        .discharge-mode-bar { text-align: center; padding: 6px; font-weight: 600; font-size: 11px; border-radius: 6px; margin-bottom: 16px; transition: all 0.3s; }
        .discharge-mode-bar.edit { background: #fff3e0; color: #e65100; border: 1px solid #ffcc80; }
        .discharge-mode-bar.view { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
        .discharge-card { border-radius: 8px; overflow: hidden; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e8ecf0; transition: transform 0.2s, box-shadow 0.2s; }
        .discharge-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .discharge-card-header { background: var(--card-color); color: #fff; padding: 8px 14px; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .discharge-card-icon { font-size: 16px; }
        .discharge-card-body { background: #fff; padding: 10px 12px; }
        .discharge-textarea { border: 1px solid #e0e0e0; border-radius: 6px; resize: vertical; font-size: 13px; line-height: 1.7; font-family: 'Segoe UI', sans-serif; white-space: pre-wrap; transition: border-color 0.2s, box-shadow 0.2s; }
        .discharge-textarea:focus { border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.1); }
        .discharge-textarea[readonly] { border: none; background: #f8f9fa; }
        .discharge-save-btn { border-radius: 25px; font-weight: 600; padding: 10px 40px; font-size: 14px; box-shadow: 0 4px 12px rgba(46,125,50,0.25); transition: all 0.3s; border: none; }
        .discharge-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46,125,50,0.35); }
        .discharge-save-btn:disabled { opacity: 0.7; }
        .btn-mode { border-radius: 20px; font-size: 12px; font-weight: 600; padding: 5px 14px; transition: all 0.2s; }
      `}</style>

      <div className="discharge-page">
        <div className="discharge-header">
          <div>
            <h5>📝 Discharge Summary & Advice</h5>
            <small style={{ opacity: 0.8, fontSize: 11 }}>ID: {id}</small>
          </div>
          <div className="d-flex gap-2">
            <button className={`btn btn-sm btn-mode ${isEditMode ? "btn-warning" : "btn-outline-light"}`} onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? "🔒 View" : "✏️ Edit"}
            </button>
            {!ro && <button className="btn btn-sm btn-mode btn-success" onClick={handleSave} disabled={saving}>{saving ? "⏳..." : "💾 Save"}</button>}
            <button className="btn btn-sm btn-mode btn-outline-light" onClick={() => navigate(`/discharge/${encodeURIComponent(id)}/print`)}>🖨 Print</button>
          </div>
        </div>

        <div className={`discharge-mode-bar ${isEditMode ? "edit" : "view"}`}>
          {isEditMode ? "✏️ EDIT MODE — Press Enter for new numbered line" : "👁️ VIEW MODE — Read only"}
        </div>

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
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button className="btn btn-success discharge-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "⏳ Saving..." : "💾 Save Discharge Summary"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DischargeNewAdvice;
