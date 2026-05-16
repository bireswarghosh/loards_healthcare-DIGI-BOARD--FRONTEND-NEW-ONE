import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Table, Image, Link2, Minus, FileText, Type, Clock, Grid3X3, Columns, LayoutTemplate,
  Search, Replace, Ruler, PanelBottom, Maximize, FileDown, FileUp, Printer, FilePlus, Save, ChevronDown,
} from "lucide-react";
import { importDocx, exportDocx, exportHtml, exportTxt, printDocument } from "./utils";
import { applyEditorPageLayout } from "./editor-page-layout";

const ToolButton = ({ onClick, active, title, children, className = "", disabled }) => (
  <button onClick={onClick} title={title} disabled={disabled} className={`p-1.5 rounded hover:bg-[#DEEAF6] transition-colors flex flex-col items-center gap-0.5 ${active ? "bg-[#B4D6F5] shadow-inner" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}>
    {children}
  </button>
);

const SPECIAL_CHARS = ["©", "®", "™", "€", "£", "¥", "¢", "§", "¶", "†", "‡", "•", "…", "—", "–", "°", "±", "×", "÷", "≠", "≤", "≥", "∞", "µ", "α", "β", "γ", "δ", "π", "Ω", "←", "→", "↑", "↓", "↔", "♠", "♣", "♥", "♦", "★", "☆", "✓", "✗", "✦", "❤"];

const RibbonInsertTab = ({ editor, activeTab, documentTitle, onDocumentTitleChange, onFindOpen, onSaveDraft, onSubmit, showRuler, onToggleRuler, showGridlines, onToggleGridlines, showStatusBar, onToggleStatusBar }) => {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const exportMenuRef = useRef(null);
  const tablePickerRef = useRef(null);
  const specialCharsRef = useRef(null);
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });

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
      onDocumentTitleChange(file.name.replace(/\.docx$/i, ""));
    } catch (err) {
      console.error("Import error:", err);
      alert("This file could not be opened. Please try another DOCX file.");
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

  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  const handleInsertTable = useCallback((rows, cols) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTablePicker(false);
  }, [editor]);

  const handleInsertDateTime = useCallback(() => {
    if (!editor) return;
    const now = new Date();
    const formatted = now.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    editor.chain().focus().insertContent(formatted).run();
  }, [editor]);

  if (!editor) return null;

  if (activeTab === "insert") {
    return (
      <div className="flex items-center gap-1 py-1 px-2 flex-wrap">
        <div className="relative" ref={tablePickerRef}>
          <ToolButton onClick={() => setShowTablePicker(v => !v)} title="Insert Table"><Table size={18} /><span className="text-[9px]">Table</span></ToolButton>
          {showTablePicker && (
            <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 shadow-lg rounded p-2 mt-1">
              <div className="text-xs text-gray-500 mb-1 text-center">{tableHover.rows > 0 ? `${tableHover.rows} × ${tableHover.cols}` : "Insert Table"}</div>
              <div className="grid grid-cols-8 gap-0.5">
                {Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (_, col) => (
                  <button key={`${row}-${col}`} className={`w-5 h-5 border ${row < tableHover.rows && col < tableHover.cols ? "bg-blue-200 border-blue-400" : "bg-white border-gray-300"}`} onMouseEnter={() => setTableHover({ rows: row + 1, cols: col + 1 })} onMouseLeave={() => setTableHover({ rows: 0, cols: 0 })} onClick={() => handleInsertTable(row + 1, col + 1)} />
                )))}
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <ToolButton onClick={() => imageInputRef.current?.click()} title="Insert Image"><Image size={18} /><span className="text-[9px]">Picture</span></ToolButton>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleInsertImage} className="hidden" />
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <ToolButton onClick={handleInsertLink} title="Insert Link"><Link2 size={18} /><span className="text-[9px]">Link</span></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link" disabled={!editor.isActive("link")}><Link2 size={18} className="opacity-50" /><span className="text-[9px]">Unlink</span></ToolButton>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line"><Minus size={18} /><span className="text-[9px]">Line</span></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setHardBreak().run()} title="Line Break"><FileText size={18} /><span className="text-[9px]">Break</span></ToolButton>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <div className="relative" ref={specialCharsRef}>
          <ToolButton onClick={() => setShowSpecialChars(v => !v)} title="Special Characters"><Type size={18} /><span className="text-[9px]">Symbol</span></ToolButton>
          {showSpecialChars && (
            <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 shadow-lg rounded p-2 mt-1">
              <div className="grid grid-cols-10 gap-1">
                {SPECIAL_CHARS.map((char) => (
                  <button key={char} onClick={() => { editor.chain().focus().insertContent(char).run(); setShowSpecialChars(false); }} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-blue-50 text-sm">{char}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <ToolButton onClick={handleInsertDateTime} title="Insert Date & Time"><Clock size={18} /><span className="text-[9px]">Date</span></ToolButton>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        {editor.isActive("table") && (
          <>
            <ToolButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row Below"><Grid3X3 size={16} /><span className="text-[9px]">+Row</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column Right"><Columns size={16} /><span className="text-[9px]">+Col</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row"><Grid3X3 size={16} className="text-red-500" /><span className="text-[9px] text-red-500">-Row</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column"><Columns size={16} className="text-red-500" /><span className="text-[9px] text-red-500">-Col</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table"><Table size={16} className="text-red-500" /><span className="text-[9px] text-red-500">Del</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().mergeCells().run()} title="Merge Cells"><LayoutTemplate size={16} /><span className="text-[9px]">Merge</span></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().splitCell().run()} title="Split Cell"><LayoutTemplate size={16} /><span className="text-[9px]">Split</span></ToolButton>
          </>
        )}
      </div>
    );
  }

  if (activeTab === "layout") {
    return (
      <div className="flex items-center gap-1 py-1 px-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-gray-500 mb-0.5">Margins</span>
            <select className="h-[26px] border border-gray-300 rounded text-xs px-1 bg-white" onChange={(e) => {
              const val = e.target.value;
              if (val === "normal") applyEditorPageLayout({ marginTopMm: 25, marginRightMm: 25, marginBottomMm: 25, marginLeftMm: 25 });
              else if (val === "narrow") applyEditorPageLayout({ marginTopMm: 12, marginRightMm: 12, marginBottomMm: 12, marginLeftMm: 12 });
              else if (val === "moderate") applyEditorPageLayout({ marginTopMm: 19, marginRightMm: 19, marginBottomMm: 19, marginLeftMm: 19 });
              else if (val === "wide") applyEditorPageLayout({ marginTopMm: 32, marginRightMm: 32, marginBottomMm: 32, marginLeftMm: 32 });
            }}>
              <option value="normal">Normal (1")</option>
              <option value="narrow">Narrow (0.5")</option>
              <option value="moderate">Moderate (0.75")</option>
              <option value="wide">Wide (1.25")</option>
            </select>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-gray-500 mb-0.5">Orientation</span>
            <select className="h-[26px] border border-gray-300 rounded text-xs px-1 bg-white" onChange={(e) => applyEditorPageLayout({ orientation: e.target.value === "landscape" ? "landscape" : "portrait" })}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-gray-500 mb-0.5">Size</span>
            <select className="h-[26px] border border-gray-300 rounded text-xs px-1 bg-white" onChange={(e) => applyEditorPageLayout({ size: e.target.value })}>
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="Letter">Letter (8.5 × 11")</option>
              <option value="Legal">Legal (8.5 × 14")</option>
            </select>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-gray-500 mb-0.5">Columns</span>
            <select className="h-[26px] border border-gray-300 rounded text-xs px-1 bg-white" onChange={(e) => applyEditorPageLayout({ columns: parseInt(e.target.value) })}>
              <option value="1">One</option>
              <option value="2">Two</option>
              <option value="3">Three</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "view") {
    return (
      <div className="flex items-center gap-1 py-1 px-2 flex-wrap">
        <ToolButton onClick={() => onFindOpen("find")} title="Find (Ctrl+F)"><Search size={18} /><span className="text-[9px]">Find</span></ToolButton>
        <ToolButton onClick={() => onFindOpen("replace")} title="Replace (Ctrl+H)"><Replace size={18} /><span className="text-[9px]">Replace</span></ToolButton>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <ToolButton onClick={onToggleRuler} title="Toggle Ruler" active={showRuler}><Ruler size={18} /><span className="text-[9px]">Ruler</span></ToolButton>
        <ToolButton onClick={onToggleGridlines} title="Toggle Gridlines" active={showGridlines}><Grid3X3 size={18} /><span className="text-[9px]">Grid</span></ToolButton>
        <ToolButton onClick={onToggleStatusBar} title="Toggle Status Bar" active={showStatusBar}><PanelBottom size={18} /><span className="text-[9px]">Status</span></ToolButton>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <ToolButton onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen?.(); }} title="Full Screen"><Maximize size={18} /><span className="text-[9px]">Full Screen</span></ToolButton>
      </div>
    );
  }

  if (activeTab === "file") {
    return (
      <div className="flex items-center gap-1 py-1 px-2 flex-wrap">
        <ToolButton onClick={() => { if (confirm("Create a new document?")) { editor.commands.clearContent(true); onDocumentTitleChange("Untitled Document"); } }} title="New Document"><FilePlus size={18} /><span className="text-[9px]">New</span></ToolButton>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <ToolButton onClick={() => fileInputRef.current?.click()} title="Open DOCX"><FileUp size={18} /><span className="text-[9px]">Open</span></ToolButton>
        <input ref={fileInputRef} type="file" accept=".docx" onChange={handleImportDocx} className="hidden" />
        <ToolButton onClick={onSaveDraft} title="Save Draft"><Save size={18} /><span className="text-[9px]">Save</span></ToolButton>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <div className="relative" ref={exportMenuRef}>
          <ToolButton onClick={() => setShowExportMenu(v => !v)} title="Export"><FileDown size={18} /><span className="text-[9px] flex items-center gap-0.5">Save As <ChevronDown size={8} /></span></ToolButton>
          {showExportMenu && (
            <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 shadow-lg rounded mt-1 py-1 min-w-[180px]">
              <button onClick={() => { void exportDocx(editor.getHTML(), documentTitle); setShowExportMenu(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2"><FileDown size={14} /> Word Document (.docx)</button>
              <button onClick={() => { printDocument(editor.getHTML(), documentTitle); setShowExportMenu(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2"><Printer size={14} /> PDF (Print to PDF)</button>
              <button onClick={() => { exportHtml(editor.getHTML(), documentTitle); setShowExportMenu(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2"><FileDown size={14} /> Web Page (.html)</button>
              <button onClick={() => { exportTxt(editor.getText(), documentTitle); setShowExportMenu(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2"><FileDown size={14} /> Plain Text (.txt)</button>
            </div>
          )}
        </div>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <ToolButton onClick={() => printDocument(editor.getHTML(), documentTitle)} title="Print (Ctrl+P)"><Printer size={18} /><span className="text-[9px]">Print</span></ToolButton>
      </div>
    );
  }

  return null;
};

export default RibbonInsertTab;
