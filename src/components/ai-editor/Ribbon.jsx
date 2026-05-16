import React, { useState } from "react";
import RibbonHomeTab from "./RibbonHomeTab";
import RibbonInsertTab from "./RibbonInsertTab";

const TABS = [
  { id: "file", label: "File" },
  { id: "home", label: "Home" },
  { id: "insert", label: "Insert" },
  { id: "layout", label: "Layout" },
  { id: "view", label: "View" },
];

const Ribbon = ({ editor, documentTitle, onDocumentTitleChange, formatPainterActive, onFormatPainterToggle, onFindOpen, onSaveDraft, onSubmit, showRuler, onToggleRuler, showGridlines, onToggleGridlines, showStatusBar, onToggleStatusBar }) => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="bg-[#F3F3F3] border-b border-gray-300 flex-shrink-0 print:hidden">
      <div className="flex items-center h-[32px] bg-[#185ABD] px-3 gap-2">
        <div className="flex items-center gap-2 flex-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M15.5 1.5v13h-15v-13h15zm-1 1h-13v11h13v-11z" />
            <path d="M4.5 5.5h2l1 3 1-3h2l-2 5h-2l-2-5z" />
          </svg>
          <input
            value={documentTitle}
            onChange={(e) => onDocumentTitleChange(e.target.value)}
            className="bg-transparent text-white text-xs border-none outline-none px-1 py-0.5 rounded hover:bg-white/10 focus:bg-white/20 max-w-[300px]"
            title="Document Title"
          />
        </div>
        <button onClick={onSaveDraft} className="text-white/90 text-[11px] px-2 py-1 rounded hover:bg-white/10" title="Save draft">Save</button>
        {onSubmit && <button onClick={onSubmit} className="text-white text-[11px] px-3 py-1 rounded bg-white/15 hover:bg-white/25" title="Submit document">Submit</button>}
      </div>

      <div className="flex items-center h-[30px] bg-[#F3F3F3] border-b border-gray-300 px-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-1 text-xs font-medium transition-colors rounded-t ${activeTab === tab.id ? "bg-white text-[#185ABD] border-t-2 border-t-[#185ABD] border-x border-gray-300" : "text-gray-600 hover:bg-gray-200"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border-b border-gray-300 min-h-[44px]">
        {activeTab === "home" && <RibbonHomeTab editor={editor} formatPainterActive={formatPainterActive} onFormatPainterToggle={onFormatPainterToggle} />}
        {(activeTab === "insert" || activeTab === "layout" || activeTab === "view" || activeTab === "file") && (
          <RibbonInsertTab editor={editor} activeTab={activeTab} documentTitle={documentTitle} onDocumentTitleChange={onDocumentTitleChange} onFindOpen={onFindOpen} onSaveDraft={onSaveDraft} onSubmit={onSubmit} showRuler={showRuler} onToggleRuler={onToggleRuler} showGridlines={showGridlines} onToggleGridlines={onToggleGridlines} showStatusBar={showStatusBar} onToggleStatusBar={onToggleStatusBar} />
        )}
      </div>
    </div>
  );
};

export default Ribbon;
