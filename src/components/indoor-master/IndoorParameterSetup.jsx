import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const IndoorParameterSetup = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchParameters = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/parameters");

      if (response.data.success && response.data.data) {
        setConfig(response.data.data);
      } else {
        setConfig({
          DoctotVisitInBill: "Y",
          DoctotVisitInEst: "Y",
          AddServiceMed: "Y",
          ServiceMedPer: 115,
          AddServiceDiag: "Y",
          ServiceDiagPer: 115,
          ChkOutTime: "1 PM",
          FixedServiceBed: 0,
          MedBillShow: "Y",
          AddServiceOT: "Y",
          CopSCH: 20,
          EditTime: "Y",
          MedAdd: "Y",
          AddSrvDr: "Y",
          CM: "Y",
          COMM: "N",
          RecColl: "Y",
          FBYN: "Y",
          SMoneyYN: "Y",
          AdmChkTime: "Y",
          GChkTime: "12:00 PM",
          MedP: 2,
          DagP: 101,
          AdmTime: "1:00 PM",
          DIRA: "N",
          DIRF: "N",
          DuplicateMR: "N",
          Nirnoy: "N",
          DIROP: "N",
          OTDtlYN: "Y",
          dcareeditYN: "N",
          otherchargeheadingyn: "N",
          tpaotherchargeyn: "N",
          backdateentryyn: "Y",
          fbillc: "Y",
          bedcal: "Y",
          admineditamtchange: "N",
          MedAdv: "N",
          DisFinalBill: "Y",
          MRD: "N",
          fbillprint: "Y",
          pbedcal: "Y",
          PtntNameYN: "Y",
          sdatewisebed: "Y",
          IndrDBName: "HOSPITAL_DBhh",
          monthwiseadmno: "Y",
          NoRec: "N",
          MaxCashRec: 841460,
          RefundRecYN: "Y",
          GSTP: 18,
          HealthCardP: 5,
        });
      }
    } catch {
      alert("Error connecting to server.");
    }
    setLoading(false);
  };

  const saveParameters = async () => {
    setSaving(true);
    try {
      await axiosInstance.put("/parameters", config);
      alert("Saved Successfully!");
    } catch {
      alert("Save Failed!");
    }
    setSaving(false);
  };

  const updateParameter = async (key, value) => {
    try {
      await axiosInstance.put(`/parameters/${key}`, { value });
    } catch {}
  };

  const handleToggle = (key) => {
    const newVal = config[key] === "Y" ? "N" : "Y";
    setConfig((prev) => ({ ...prev, [key]: newVal }));
    updateParameter(key, newVal);
  };

  const handleInputChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    updateParameter(key, value);
  };

  const configSections = [
  {
    title: "🏥 Doctor Visit Configuration",
    icon: "👨‍⚕️",
    items: [
      { key: "DoctotVisitInBill", label: "Include Doctor Visit In Final Bill", type: "toggle" },
      { key: "DoctotVisitInEst", label: "Include Doctor Visit In Estimate", type: "toggle" },
      { key: "AddServiceMed", label: "Add Medicine Amount In Estimate/Final Bill", type: "toggle" },
      { key: "MedBillShow", label: "Show MEDICINE BILL In Final Bill", type: "toggle" },
      { key: "MedAdd", label: "Add Medicine Amount For Company", type: "toggle" },
    ],
  },

  {
    title: "💊 Service Charges",
    icon: "💰",
    items: [
      { key: "ServiceMedPer", label: "Medicine Service Charge", type: "number", suffix: "%" },
      { key: "ServiceDiagPer", label: "Diagnostic Service Charge", type: "number", suffix: "%" },
      { key: "AddServiceDiag", label: "Add Service Charge In Diagnostic", type: "toggle" },
      { key: "AddServiceOT", label: "Add Service Charge In OT", type: "toggle" },
      { key: "AddSrvDr", label: "Add Service Charge In Doctor Visit", type: "toggle" },
    ],
  },

  {
    title: "⏰ Time & Schedule Settings",
    icon: "🕐",
    items: [
      { key: "ChkOutTime", label: "Check Out Time", type: "time" },
      { key: "AdmTime", label: "Admission Time", type: "time" },
      { key: "GChkTime", label: "Grace Period Check Out Time", type: "time" },
      { key: "EditTime", label: "Admission 'BILL Time' Editable", type: "toggle" },
      { key: "AdmChkTime", label: "Admission Time In Check Out Time", type: "toggle" },
    ],
  },

  {
    title: "🧾 Billing & Receipt Settings",
    icon: "📋",
    items: [
      { key: "SMoneyYN", label: "Single Facility Money Receipt", type: "toggle" },
      { key: "DisFinalBill", label: "Final Bill without discharge", type: "toggle" },
      { key: "fbillprint", label: "Final Bill Print", type: "toggle" },
      { key: "fbillc", label: "Final Bill Format 'C'", type: "toggle" },
      { key: "RecColl", label: "Receipt Column In Final Bill", type: "toggle" },
    ],
  },

  {
    title: "💳 Financial Configuration",
    icon: "💎",
    items: [
      { key: "CopSCH", label: "Corporate Payable Service Charge", type: "number" },
      { key: "MedP", label: "Medicine Percentage", type: "number" },
      { key: "DagP", label: "Diagnostic Percentage", type: "number" },
      { key: "GSTP", label: "GST Percentage", type: "number", suffix: "%" },
      { key: "HealthCardP", label: "Health Card Discount", type: "number", suffix: "%" },
      { key: "MaxCashRec", label: "Maximum Cash Receipt", type: "number" },
    ],
  },

  {
    title: "⚙️ Advanced Settings",
    icon: "🔧",
    items: [
      { key: "OTDtlYN", label: "OT Detail Required", type: "toggle" },
      { key: "bedcal", label: "24 Hr Bed Calculation", type: "toggle" },
      { key: "PtntNameYN", label: "Patient Name wise searching", type: "toggle" },
      { key: "monthwiseadmno", label: "Month Wise Admission No", type: "toggle" },
      { key: "backdateentryyn", label: "Back Date Entry", type: "toggle" },
      { key: "IndrDBName", label: "Database Name", type: "text" },
    ],
  },
];


  useEffect(() => {
    fetchParameters();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3">Loading parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content p-3">

      {/* EMR THEME TOP PANEL */}
      <div
        className="panel mb-4"
        style={{
          background: "#0a1735",
          borderRadius: "12px",
          padding: "20px 25px",
          color: "white",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">🏥 Indoor Parameter Setup</h4>

          <button
            className="btn btn-primary btn-sm px-4"
            onClick={saveParameters}
            disabled={saving}
            style={{
              borderRadius: "8px",
              background: "#1e88e5",
              fontWeight: "600",
            }}
          >
            {saving ? "Saving..." : "💾 Save All"}
          </button>
        </div>
      </div>

      {/* CONFIG CARDS */}
      <div className="row g-4">
        {configSections.map((section, index) => (
          <div key={index} className="col-lg-6">
            <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
              <div
                className="card-header text-white"
                style={{
                  background: "#0a1735",
                  borderRadius: "12px 12px 0 0",
                  padding: "12px 18px",
                }}
              >
                <h6 className="fw-bold mb-0">
                  {section.icon} {section.title}
                </h6>
              </div>

              <div className="card-body p-4">
                {section.items.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                    <label className="fw-semibold">{item.label}</label>

                    {item.type === "toggle" ? (
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={config[item.key] === "Y"}
                          onChange={() => handleToggle(item.key)}
                        />
                      </div>
                    ) : item.type === "number" ? (
                      <div className="input-group" style={{ width: "120px" }}>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          value={config[item.key]}
                          onChange={(e) => handleInputChange(item.key, parseFloat(e.target.value))}
                        />
                        {item.suffix && (
                          <span className="input-group-text">{item.suffix}</span>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ width: "150px" }}
                        value={config[item.key]}
                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SAVE BUTTON */}
      <div className="text-center mt-4">
        <button
          className="btn btn-primary px-5 py-2"
          onClick={saveParameters}
          disabled={saving}
          style={{
            borderRadius: "8px",
            background: "#0a1735",
            fontWeight: "600",
          }}
        >
          {saving ? "Saving..." : "💾 Save All Parameters"}
        </button>
      </div>
    </div>
  );
};

export default IndoorParameterSetup;
