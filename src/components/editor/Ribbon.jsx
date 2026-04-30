import React, { useState } from "react";
import RibbonHomeTab from "./RibbonHomeTab";
import RibbonInsertTab from "./RibbonInsertTab";

const TABS = [
  { id: "file", label: "File" },
  { id: "home", label: "Home" },
  { id: "insert", label: "Insert" },
];

const Ribbon = ({ editor, documentTitle, onDocumentTitleChange, formatPainterActive, onFormatPainterToggle, onSaveDraft }) => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div style={{ background: "#F3F3F3", borderBottom: "1px solid #d1d5db", flexShrink: 0 }}>
      {/* Title bar */}
      <div style={{ display: "flex", alignItems: "center", height: "32px", background: "#185ABD", padding: "0 12px", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M15.5 1.5v13h-15v-13h15zm-1 1h-13v11h13v-11z" /><path d="M4.5 5.5h2l1 3 1-3h2l-2 5h-2l-2-5z" /></svg>
          <input value={documentTitle} onChange={(e) => onDocumentTitleChange?.(e.target.value)}
            style={{ background: "transparent", color: "#fff", fontSize: "12px", border: "none", outline: "none", padding: "2px 4px", borderRadius: "4px", maxWidth: "300px" }}
          />
        </div>
        <button onClick={onSaveDraft} style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "none", background: "transparent", cursor: "pointer" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          Save
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "center", height: "30px", background: "#F3F3F3", borderBottom: "1px solid #d1d5db", padding: "0 4px" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: "4px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "4px 4px 0 0", border: activeTab === tab.id ? "1px solid #d1d5db" : "none", borderBottom: activeTab === tab.id ? "1px solid #fff" : "none", background: activeTab === tab.id ? "#fff" : "transparent", color: activeTab === tab.id ? "#185ABD" : "#4b5563", cursor: "pointer" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: "#fff", borderBottom: "1px solid #d1d5db", minHeight: "44px" }}>
        {activeTab === "home" && <RibbonHomeTab editor={editor} formatPainterActive={formatPainterActive} onFormatPainterToggle={onFormatPainterToggle} />}
        {(activeTab === "insert" || activeTab === "file") && (
          <RibbonInsertTab editor={editor} activeTab={activeTab} documentTitle={documentTitle} onDocumentTitleChange={onDocumentTitleChange} onSaveDraft={onSaveDraft} />
        )}
      </div>
    </div>
  );
};

export default Ribbon;
