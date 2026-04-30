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
  <button onClick={onClick} title={title} className={className}
    style={{ padding: "6px", borderRadius: "4px", border: "none", cursor: "pointer", background: active ? "#B4D6F5" : "transparent", display: "inline-flex", alignItems: "center" }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#DEEAF6"; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    {children}
  </button>
);

const ColorPicker = ({ colors, onSelect, currentColor }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "2px", padding: "8px" }}>
    {colors.map((color) => (
      <button key={color} onClick={() => onSelect(color)} title={color}
        style={{ width: "20px", height: "20px", borderRadius: "2px", border: currentColor === color ? "2px solid #3b82f6" : "1px solid #d1d5db", backgroundColor: color, cursor: "pointer" }}
      />
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
    if (attrs.fontSize) return String(attrs.fontSize).replace("pt", "").replace("px", "");
    return "11";
  }, [editor]);

  const getCurrentHeading = useCallback(() => {
    if (!editor) return "Normal";
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) return `Heading ${i}`;
    }
    return "Normal";
  }, [editor]);

  const setFontSize = useCallback((size) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(`${size}pt`).run();
  }, [editor]);

  if (!editor) return null;

  const sep = <div style={{ width: "1px", height: "28px", background: "#d1d5db", margin: "0 4px" }} />;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", padding: "4px 8px", flexWrap: "wrap" }}>
      {/* Clipboard */}
      <ToolButton onClick={() => void pasteFromClipboard(editor)} title="Paste"><Clipboard size={16} /></ToolButton>
      <ToolButton onClick={() => void cutSelectionToClipboard(editor)} title="Cut"><Scissors size={14} /></ToolButton>
      <ToolButton onClick={() => void copySelectionToClipboard(editor)} title="Copy"><Copy size={14} /></ToolButton>
      <ToolButton onClick={onFormatPainterToggle} active={formatPainterActive} title="Format Painter"><Paintbrush size={14} /></ToolButton>
      {sep}
      <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={14} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={14} /></ToolButton>
      {sep}
      {/* Heading */}
      <select value={getCurrentHeading()} onChange={(e) => {
        const val = e.target.value;
        if (val === "Normal") editor.chain().focus().setParagraph().run();
        else { const level = parseInt(val.replace("Heading ", ""), 10); editor.chain().focus().setHeading({ level }).run(); }
      }} style={{ height: "28px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", padding: "0 4px", width: "100px" }}>
        {HEADING_STYLES.map((s) => <option key={s.label} value={s.label}>{s.label}</option>)}
      </select>
      {sep}
      {/* Font */}
      <select value={getCurrentFontFamily()} onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        style={{ height: "28px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", padding: "0 4px", width: "130px" }}>
        {FONT_FAMILIES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
      </select>
      <select value={getCurrentFontSize()} onChange={(e) => setFontSize(e.target.value)}
        style={{ height: "28px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", padding: "0 4px", width: "52px" }}>
        {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {sep}
      {/* Format */}
      <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><Underline size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript"><Subscript size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript"><Superscript size={15} /></ToolButton>
      {/* Text Color */}
      <div ref={textColorRef} style={{ position: "relative", display: "inline-flex" }}>
        <button onClick={() => editor.chain().focus().setColor(currentTextColor).run()} style={{ padding: "4px", border: "none", background: "transparent", cursor: "pointer" }} title="Font Color">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Type size={14} />
            <div style={{ width: "16px", height: "4px", marginTop: "2px", borderRadius: "2px", backgroundColor: currentTextColor }} />
          </div>
        </button>
        <button onClick={() => { setShowTextColor(!showTextColor); setShowHighlightColor(false); }} style={{ padding: "2px", border: "none", background: "transparent", cursor: "pointer" }}>
          <ChevronDown size={10} />
        </button>
        {showTextColor && (
          <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "4px", marginTop: "4px" }}>
            <ColorPicker colors={TEXT_COLORS} currentColor={currentTextColor} onSelect={(color) => { setCurrentTextColor(color); editor.chain().focus().setColor(color).run(); setShowTextColor(false); }} />
          </div>
        )}
      </div>
      {/* Highlight */}
      <div ref={highlightRef} style={{ position: "relative", display: "inline-flex" }}>
        <button onClick={() => editor.chain().focus().toggleHighlight({ color: currentHighlight }).run()} style={{ padding: "4px", border: "none", background: "transparent", cursor: "pointer" }} title="Highlight">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Paintbrush size={14} />
            <div style={{ width: "16px", height: "4px", marginTop: "2px", borderRadius: "2px", backgroundColor: currentHighlight }} />
          </div>
        </button>
        <button onClick={() => { setShowHighlightColor(!showHighlightColor); setShowTextColor(false); }} style={{ padding: "2px", border: "none", background: "transparent", cursor: "pointer" }}>
          <ChevronDown size={10} />
        </button>
        {showHighlightColor && (
          <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "4px", marginTop: "4px" }}>
            <ColorPicker colors={HIGHLIGHT_COLORS} currentColor={currentHighlight} onSelect={(color) => { setCurrentHighlight(color); editor.chain().focus().toggleHighlight({ color }).run(); setShowHighlightColor(false); }} />
          </div>
        )}
      </div>
      <ToolButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting"><RemoveFormatting size={15} /></ToolButton>
      {sep}
      {/* Alignment */}
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left"><AlignLeft size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center"><AlignCenter size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right"><AlignRight size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify size={15} /></ToolButton>
      {/* Line Spacing */}
      <div ref={lineSpacingRef} style={{ position: "relative" }}>
        <button onClick={() => setShowLineSpacing(!showLineSpacing)} style={{ padding: "6px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }} title="Line Spacing">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="9" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="9" y2="18"/></svg>
          <ChevronDown size={10} />
        </button>
        {showLineSpacing && (
          <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "4px", marginTop: "4px", padding: "4px 0", minWidth: "80px" }}>
            {LINE_SPACINGS.map((ls) => (
              <button key={ls.label} onClick={() => { const el = document.querySelector(".ProseMirror"); if (el) el.style.lineHeight = String(ls.value); setShowLineSpacing(false); }}
                style={{ width: "100%", textAlign: "left", padding: "4px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >{ls.label}</button>
            ))}
          </div>
        )}
      </div>
      {sep}
      {/* Lists */}
      <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List"><ListOrdered size={15} /></ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task List"><ListChecks size={15} /></ToolButton>
    </div>
  );
};

export default RibbonHomeTab;
