import { useNavigate, useLocation } from 'react-router-dom';
import React from "react";
import { NavLink, useParams } from "react-router-dom";

const steps = [
  { path: "/discharge", label: "List", icon: "📋", exact: true },
  { path: (id) => `/discharge/${encodeURIComponent(id)}`, label: "Detail", icon: "🔍", needsId: true },
  { path: (id) => `/discharge/${encodeURIComponent(id)}/edit`, label: "Edit", icon: "✏️", needsId: true },
  { path: (id) => `/discharge/${encodeURIComponent(id)}/advice`, label: "Advice", icon: "📝", needsId: true },
  { path: (id) => `/discharge/${encodeURIComponent(id)}/mrd`, label: "MRD", icon: "📁", needsId: true },
];

const DischargeNav = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const getStepIndex = () => {
    const p = location.pathname;
    if (id && p.includes("/advice")) return 3;
    if (id && p.includes("/edit")) return 2;
    if (id && p.includes("/mrd")) return 4;
    if (id && !p.includes("/edit") && !p.includes("/advice") && !p.includes("/mrd") && !p.includes("/print")) return 1;
    return 0;
  };

  const currentStep = getStepIndex();

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
      {/* Wizard Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
        {steps.map((step, i) => {
          if (step.needsId && !id) return null;
          const to = typeof step.path === "function" ? step.path(id) : step.path;
          const isActive = currentStep === i;
          const isPast = currentStep > i;

          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{
                  width: 40, height: 2,
                  background: isPast ? "#4caf50" : "#e0e0e0",
                  transition: "background 0.3s"
                }} />
              )}
              <NavLink
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 20,
                  textDecoration: "none", fontSize: 12, fontWeight: 600,
                  transition: "all 0.3s",
                  background: isActive ? "linear-gradient(135deg, #1a237e, #283593)" : isPast ? "#e8f5e9" : "#f5f5f5",
                  color: isActive ? "#fff" : isPast ? "#2e7d32" : "#666",
                  border: isActive ? "2px solid #1a237e" : isPast ? "2px solid #4caf50" : "2px solid #e0e0e0",
                  boxShadow: isActive ? "0 2px 8px rgba(26,35,126,0.3)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 11,
                  background: isActive ? "#fff" : isPast ? "#4caf50" : "#e0e0e0",
                  color: isActive ? "#1a237e" : isPast ? "#fff" : "#999",
                  fontWeight: 700,
                }}>
                  {isPast ? "✓" : step.icon}
                </span>
                {step.label}
              </NavLink>
            </React.Fragment>
          );
        })}
      </div>

      <button
        className="btn btn-sm btn-outline-danger"
        style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
    </div>
  );
};

export default DischargeNav;
