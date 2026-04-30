import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Table, Image, Link2, Minus, FileText, Type, Clock, Grid3X3, Columns,
  LayoutTemplate, FileDown, FileUp, Printer, FilePlus, Save, ChevronDown,
} from "lucide-react";
import { importDocx, exportDocx, exportHtml, printDocument } from "./utils";

const ToolButton = ({ onClick, active, title, children, disabled }) => (
  <button onClick={onClick} title={title} disabled={disabled}
    style={{ padding: "6px", borderRadius: "4px", border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, background: active ? "#B4D6F5" : "transparent", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "2px" }}
    onMouseEnter={(e) => { if (!active && !disabled) e.currentTarget.style.background = "#DEEAF6"; }}
    onMouseLeave={(e) => { if (!active && !disabled) e.currentTarget.style.background = "transparent"; }}
  >
    {children}
  </button>
);

const SPECIAL_CHARS = ["©", "®", "™", "€", "£", "¥", "¢", "§", "¶", "†", "‡", "•", "…", "—", "–", "°", "±", "×", "÷", "≠", "≤", "≥", "∞", "µ", "α", "β", "γ", "δ", "π", "Ω", "←", "→", "↑", "↓", "↔", "♠", "♣", "♥", "♦", "★", "☆", "✓", "✗", "✦", "❤"];

const RibbonInsertTab = ({ editor, activeTab, documentTitle, onDocumentTitleChange, onSaveDraft }) => {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });
  const exportMenuRef = useRef(null);
  const tablePickerRef = useRef(null);
  const specialCharsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) setShowExportMenu(false);
      if (tablePickerRef.current && !tablePickerRef.current.contains(event.target)) setShowTablePicker(false);
      if (specialCharsRef.current && !specialCharsRef.current.contains(event.target)) setShowSpecialChars(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImportDocx = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const html = await importDocx(file);
      editor.commands.setContent(html);
      onDocumentTitleChange?.(file.name.replace(/\.docx$/i, ""));
    } catch (err) {
      console.error("Import error:", err);
      alert("This file could not be opened.");
    }
    e.target.value = "";
  }, [editor, onDocumentTitleChange]);

  const handleInsertImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") editor.chain().focus().setImage({ src: reader.result, alt: file.name }).run(); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [editor]);

  if (!editor) return null;

  if (activeTab === "insert") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", flexWrap: "wrap" }}>
        <div ref={tablePickerRef} style={{ position: "relative" }}>
          <ToolButton onClick={() => setShowTablePicker(!showTablePicker)} title="Insert Table">
            <Table size={18} /><span style={{ fontSize: "9px" }}>Table</span>
          </ToolButton>
          {showTablePicker && (
            <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "4px", padding: "8px", marginTop: "4px" }}>
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px", textAlign: "center" }}>
                {tableHover.rows > 0 ? `${tableHover.rows} × ${tableHover.cols}` : "Insert Table"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "2px" }}>
                {Array.from({ length: 64 }, (_, idx) => {
                  const row = Math.floor(idx / 8); const col = idx % 8;
                  return (
                    <button key={idx}
                      style={{ width: "20px", height: "20px", border: "1px solid", borderColor: row < tableHover.rows && col < tableHover.cols ? "#93c5fd" : "#d1d5db", background: row < tableHover.rows && col < tableHover.cols ? "#bfdbfe" : "#fff", cursor: "pointer" }}
                      onMouseEnter={() => setTableHover({ rows: row + 1, cols: col + 1 })}
                      onMouseLeave={() => setTableHover({ rows: 0, cols: 0 })}
                      onClick={() => { editor.chain().focus().insertTable({ rows: row + 1, cols: col + 1, withHeaderRow: true }).run(); setShowTablePicker(false); }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <ToolButton onClick={() => imageInputRef.current?.click()} title="Insert Image"><Image size={18} /><span style={{ fontSize: "9px" }}>Picture</span></ToolButton>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleInsertImage} style={{ display: "none" }} />
        <ToolButton onClick={() => { const url = prompt("Enter URL:"); if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run(); }} title="Insert Link"><Link2 size={18} /><span style={{ fontSize: "9px" }}>Link</span></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line"><Minus size={18} /><span style={{ fontSize: "9px" }}>Line</span></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setHardBreak().run()} title="Line Break"><FileText size={18} /><span style={{ fontSize: "9px" }}>Break</span></ToolButton>
        <div ref={specialCharsRef} style={{ position: "relative" }}>
          <ToolButton onClick={() => setShowSpecialChars(!showSpecialChars)} title="Special Characters"><Type size={18} /><span style={{ fontSize: "9px" }}>Symbol</span></ToolButton>
          {showSpecialChars && (
            <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "4px", padding: "8px", marginTop: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "4px" }}>
                {SPECIAL_CHARS.map((char) => (
                  <button key={char} onClick={() => { editor.chain().focus().insertContent(char).run(); setShowSpecialChars(false); }}
                    style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", borderRadius: "4px", cursor: "pointer", fontSize: "14px", background: "transparent" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >{char}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <ToolButton onClick={() => { const now = new Date(); editor.chain().focus().insertContent(now.toLocaleString()).run(); }} title="Date & Time"><Clock size={18} /><span style={{ fontSize: "9px" }}>Date</span></ToolButton>
        {editor.isActive("table") && (
          <>
            <ToolButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row"><Grid3X3 size={16} /><span style={{ fontSize: "9px" }}>+Row</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column"><Columns size={16} /><span style={{ fontSize: "9px" }}>+Col</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row"><Grid3X3 size={16} color="red" /><span style={{ fontSize: "9px", color: "red" }}>-Row</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column"><Columns size={16} color="red" /><span style={{ fontSize: "9px", color: "red" }}>-Col</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table"><Table size={16} color="red" /><span style={{ fontSize: "9px", color: "red" }}>Del</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().mergeCells().run()} title="Merge"><LayoutTemplate size={16} /><span style={{ fontSize: "9px" }}>Merge</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().splitCell().run()} title="Split"><LayoutTemplate size={16} /><span style={{ fontSize: "9px" }}>Split</span></ToolButton>
          </>
        )}
      </div>
    );
  }

  if (activeTab === "file") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", flexWrap: "wrap" }}>
        <ToolButton onClick={() => { if (confirm("Create new document?")) { editor.commands.clearContent(true); onDocumentTitleChange?.("Untitled Document"); } }} title="New"><FilePlus size={18} /><span style={{ fontSize: "9px" }}>New</span></ToolButton>
        <ToolButton onClick={() => fileInputRef.current?.click()} title="Open DOCX"><FileUp size={18} /><span style={{ fontSize: "9px" }}>Open</span></ToolButton>
        <input ref={fileInputRef} type="file" accept=".docx" onChange={handleImportDocx} style={{ display: "none" }} />
        <ToolButton onClick={onSaveDraft} title="Save"><Save size={18} /><span style={{ fontSize: "9px" }}>Save</span></ToolButton>
        <div ref={exportMenuRef} style={{ position: "relative" }}>
          <ToolButton onClick={() => setShowExportMenu(!showExportMenu)} title="Export">
            <FileDown size={18} /><span style={{ fontSize: "9px", display: "flex", alignItems: "center", gap: "2px" }}>Save As <ChevronDown size={8} /></span>
          </ToolButton>
          {showExportMenu && (
            <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "4px", marginTop: "4px", padding: "4px 0", minWidth: "180px" }}>
              <button onClick={() => { void exportDocx(editor.getHTML(), documentTitle); setShowExportMenu(false); }} style={{ width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <FileDown size={14} /> Word (.docx)
              </button>
              <button onClick={() => { printDocument(editor.getHTML()); setShowExportMenu(false); }} style={{ width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <Printer size={14} /> PDF (Print)
              </button>
              <button onClick={() => { exportHtml(editor.getHTML(), documentTitle); setShowExportMenu(false); }} style={{ width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <FileDown size={14} /> HTML (.html)
              </button>
            </div>
          )}
        </div>
        <ToolButton onClick={() => printDocument(editor.getHTML())} title="Print"><Printer size={18} /><span style={{ fontSize: "9px" }}>Print</span></ToolButton>
      </div>
    );
  }

  return null;
};

export default RibbonInsertTab;
