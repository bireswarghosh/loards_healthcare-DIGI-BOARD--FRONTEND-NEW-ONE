import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks, IndentDecrease, IndentIncrease,
  Paintbrush, RemoveFormatting, Clipboard, Copy, Scissors,
  Undo, Redo, ChevronDown, Type,
} from "lucide-react";
import {
  FONT_FAMILIES, FONT_SIZES, HEADING_STYLES, TEXT_COLORS, HIGHLIGHT_COLORS, LINE_SPACINGS,
  copySelectionToClipboard, cutSelectionToClipboard, pasteFromClipboard,
} from "./utils";

const ToolButton = ({ onClick, active, title, children, className = "" }) => (
  <button onClick={onClick} title={title} className={`p-1.5 rounded hover:bg-[#DEEAF6] transition-colors ${active ? "bg-[#B4D6F5] shadow-inner" : ""} ${className}`}>
    {children}
  </button>
);

const ColorPicker = ({ colors, onSelect, currentColor }) => (
  <div className="grid grid-cols-10 gap-0.5 p-2">
    {colors.map((color) => (
      <button key={color} onClick={() => onSelect(color)} className={`w-5 h-5 rounded-sm border hover:scale-110 transition-transform ${currentColor === color ? "ring-2 ring-blue-500" : "border-gray-300"}`} style={{ backgroundColor: color }} title={color} />
    ))}
  </div>
);

const RibbonHomeTab = ({ editor, formatPainterActive, onFormatPainterToggle }) => {
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlightColor, setShowHighlightColor] = useState(false);
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentHighlight, setCurrentHighlight] = useState("#FFFF00");
  const textColorRef = useRef(null);
  const highlightRef = useRef(null);
  const lineSpacingRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (textColorRef.current && !textColorRef.current.contains(event.target)) setShowTextColor(false);
      if (highlightRef.current && !highlightRef.current.contains(event.target)) setShowHighlightColor(false);
      if (lineSpacingRef.current && !lineSpacingRef.current.contains(event.target)) setShowLineSpacing(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentFontFamily = useCallback(() => {
    if (!editor) return "Calibri";
    const attrs = editor.getAttributes("textStyle");
    return attrs.fontFamily || "Calibri";
  }, [editor]);

  const getCurrentFontSize = useCallback(() => {
    if (!editor) return "11";
    const attrs = editor.getAttributes("textStyle");
    if (attrs.fontSize) return String(attrs.fontSize).replace("pt", "").replace("px", "").replace("rem", "");
    return "11";
  }, [editor]);

  const getCurrentHeading = useCallback(() => {
    if (!editor) return "Normal";
    for (let i = 1; i <= 6; i++) { if (editor.isActive("heading", { level: i })) return `Heading ${i}`; }
    return "Normal";
  }, [editor]);

  const setFontSize = useCallback((size) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(`${size}pt`).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 py-1 px-2 flex-wrap">
      {/* Clipboard */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-2">
        <ToolButton onClick={() => void pasteFromClipboard(editor)} title="Paste (Ctrl+V)"><Clipboard size={16} /></ToolButton>
        <ToolButton onClick={() => void cutSelectionToClipboard(editor)} title="Cut (Ctrl+X)"><Scissors size={14} /></ToolButton>
        <ToolButton onClick={() => void copySelectionToClipboard(editor)} title="Copy (Ctrl+C)"><Copy size={14} /></ToolButton>
        <ToolButton onClick={onFormatPainterToggle} active={formatPainterActive} title="Format Painter"><Paintbrush size={14} /></ToolButton>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-2">
        <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)"><Undo size={14} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)"><Redo size={14} /></ToolButton>
      </div>

      {/* Heading */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300 mr-2">
        <select value={getCurrentHeading()} onChange={(e) => {
          const val = e.target.value;
          if (val === "Normal") editor.chain().focus().setParagraph().run();
          else { const level = parseInt(val.replace("Heading ", ""), 10); editor.chain().focus().setHeading({ level }).run(); }
        }} className="h-[28px] border border-gray-300 rounded text-xs px-1 w-[100px] bg-white focus:outline-none focus:border-blue-500" title="Styles">
          {HEADING_STYLES.map((s) => <option key={s.label} value={s.label}>{s.label}</option>)}
        </select>
      </div>

      {/* Font */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300 mr-2">
        <select value={getCurrentFontFamily()} onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} className="h-[28px] border border-gray-300 rounded text-xs px-1 w-[130px] bg-white focus:outline-none focus:border-blue-500" title="Font Family">
          {FONT_FAMILIES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
        <select value={getCurrentFontSize()} onChange={(e) => setFontSize(e.target.value)} className="h-[28px] border border-gray-300 rounded text-xs px-1 w-[52px] bg-white focus:outline-none focus:border-blue-500" title="Font Size">
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <ToolButton onClick={() => { const current = getCurrentFontSize(); const idx = FONT_SIZES.indexOf(current); const next = idx >= 0 && idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : FONT_SIZES[FONT_SIZES.length - 1]; setFontSize(next); }} title="Grow Font"><Type size={16} /></ToolButton>
        <ToolButton onClick={() => { const current = getCurrentFontSize(); const idx = FONT_SIZES.indexOf(current); const prev = idx > 0 ? FONT_SIZES[idx - 1] : FONT_SIZES[0]; setFontSize(prev); }} title="Shrink Font"><Type size={12} /></ToolButton>
      </div>

      {/* Formatting */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-2">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><Bold size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><Italic size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><Underline size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript"><Subscript size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript"><Superscript size={15} /></ToolButton>

        {/* Text Color */}
        <div className="relative" ref={textColorRef}>
          <div className="flex items-center">
            <button onClick={() => editor.chain().focus().setColor(currentTextColor).run()} className="p-1.5 rounded-l hover:bg-[#DEEAF6] transition-colors" title="Font Color">
              <div className="flex flex-col items-center"><Type size={14} /><div className="w-4 h-1 mt-0.5 rounded-sm" style={{ backgroundColor: currentTextColor }} /></div>
            </button>
            <button onClick={() => { setShowTextColor(v => !v); setShowHighlightColor(false); }} className="px-0.5 py-1.5 rounded-r hover:bg-[#DEEAF6] transition-colors"><ChevronDown size={10} /></button>
          </div>
          {showTextColor && (
            <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 shadow-lg rounded mt-1">
              <ColorPicker colors={TEXT_COLORS} currentColor={currentTextColor} onSelect={(color) => { setCurrentTextColor(color); editor.chain().focus().setColor(color).run(); setShowTextColor(false); }} />
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative" ref={highlightRef}>
          <div className="flex items-center">
            <button onClick={() => editor.chain().focus().toggleHighlight({ color: currentHighlight }).run()} className="p-1.5 rounded-l hover:bg-[#DEEAF6] transition-colors" title="Highlight Color">
              <div className="flex flex-col items-center"><Paintbrush size={14} /><div className="w-4 h-1 mt-0.5 rounded-sm" style={{ backgroundColor: currentHighlight }} /></div>
            </button>
            <button onClick={() => { setShowHighlightColor(v => !v); setShowTextColor(false); }} className="px-0.5 py-1.5 rounded-r hover:bg-[#DEEAF6] transition-colors"><ChevronDown size={10} /></button>
          </div>
          {showHighlightColor && (
            <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 shadow-lg rounded mt-1">
              <ColorPicker colors={HIGHLIGHT_COLORS} currentColor={currentHighlight} onSelect={(color) => { setCurrentHighlight(color); editor.chain().focus().toggleHighlight({ color }).run(); setShowHighlightColor(false); }} />
            </div>
          )}
        </div>

        <ToolButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting"><RemoveFormatting size={15} /></ToolButton>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 mr-2">
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left"><AlignLeft size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center"><AlignCenter size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right"><AlignRight size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify size={15} /></ToolButton>

        {/* Line Spacing */}
        <div className="relative" ref={lineSpacingRef}>
          <button onClick={() => setShowLineSpacing(v => !v)} className="p-1.5 rounded hover:bg-[#DEEAF6] transition-colors flex items-center gap-0.5" title="Line Spacing">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="9" y2="6" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="18" x2="9" y2="18" /></svg>
            <ChevronDown size={10} />
          </button>
          {showLineSpacing && (
            <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 shadow-lg rounded mt-1 py-1 min-w-[80px]">
              {LINE_SPACINGS.map((ls) => (
                <button key={ls.label} onClick={() => { const editorEl = document.querySelector(".ProseMirror"); if (editorEl) editorEl.style.lineHeight = String(ls.value); setShowLineSpacing(false); }} className="w-full text-left px-3 py-1 text-xs hover:bg-blue-50">{ls.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List"><ListOrdered size={15} /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task List"><ListChecks size={15} /></ToolButton>
        <ToolButton onClick={() => { if (editor.isActive("bulletList") || editor.isActive("orderedList")) editor.chain().focus().liftListItem("listItem").run(); }} title="Decrease Indent"><IndentDecrease size={15} /></ToolButton>
        <ToolButton onClick={() => { if (editor.isActive("bulletList") || editor.isActive("orderedList")) editor.chain().focus().sinkListItem("listItem").run(); }} title="Increase Indent"><IndentIncrease size={15} /></ToolButton>
      </div>
    </div>
  );
};

export default RibbonHomeTab;
