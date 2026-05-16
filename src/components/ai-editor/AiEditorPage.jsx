import React, { useState, useCallback, useEffect, useRef } from "react";
import Ribbon from "./Ribbon";
import EditorCore from "./EditorCore";
import FindReplace from "./FindReplace";
import StatusBar from "./StatusBar";
import {
  DEFAULT_DOCUMENT_CONTENT,
  DEFAULT_DOCUMENT_TITLE,
  consumePendingImportFromStorage,
  loadDraftFromStorage,
  printDocument,
  saveDraftToStorage,
} from "./utils";
import { applyEditorPageLayout } from "./editor-page-layout";

const initialDraft = typeof window !== "undefined" ? (consumePendingImportFromStorage() || loadDraftFromStorage()) : null;

const formatSavedAt = (date) => {
  if (!date) return "Ready";
  return `Saved ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const AiEditorPage = () => {
  const [editor, setEditor] = useState(null);
  const [documentTitle, setDocumentTitle] = useState(initialDraft?.title || DEFAULT_DOCUMENT_TITLE);
  const [documentHtml, setDocumentHtml] = useState(initialDraft?.html || DEFAULT_DOCUMENT_CONTENT);
  const [zoom, setZoom] = useState(100);
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findReplaceMode, setFindReplaceMode] = useState("find");
  const [showRuler, setShowRuler] = useState(true);
  const [showGridlines, setShowGridlines] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(initialDraft?.savedAt ? new Date(initialDraft.savedAt) : null);
  const formatPainterMarks = useRef(null);

  const handleEditorReady = useCallback((ed) => { setEditor(ed); }, []);

  const handleContentChange = useCallback((payload) => { setDocumentHtml(payload.html); }, []);

  const handleSaveDraft = useCallback(() => {
    const htmlToSave = editor?.getHTML() || documentHtml;
    saveDraftToStorage(documentTitle, htmlToSave);
    setLastSavedAt(new Date());
  }, [editor, documentHtml, documentTitle]);

  const handleFormatPainterToggle = useCallback(() => {
    if (!editor) return;
    if (!formatPainterActive) {
      const marks = {};
      if (editor.isActive("bold")) marks.bold = true;
      if (editor.isActive("italic")) marks.italic = true;
      if (editor.isActive("underline")) marks.underline = true;
      if (editor.isActive("strike")) marks.strike = true;
      const textStyle = editor.getAttributes("textStyle");
      if (textStyle.fontFamily) marks.fontFamily = textStyle.fontFamily;
      if (textStyle.fontSize) marks.fontSize = textStyle.fontSize;
      const color = editor.getAttributes("textStyle").color;
      if (color) marks.color = color;
      formatPainterMarks.current = marks;
      setFormatPainterActive(true);
    } else {
      formatPainterMarks.current = null;
      setFormatPainterActive(false);
    }
  }, [editor, formatPainterActive]);

  useEffect(() => {
    if (!editor) return;
    applyEditorPageLayout({ marginTopMm: 20, marginRightMm: 20, marginBottomMm: 20, marginLeftMm: 20, orientation: "portrait", size: "A4", columns: 1 });
  }, [editor]);

  useEffect(() => {
    if (!editor || !formatPainterActive) return;
    const handleMouseUp = () => {
      if (!formatPainterMarks.current) return;
      const marks = formatPainterMarks.current;
      editor.chain().focus().unsetAllMarks().run();
      if (marks.bold) editor.chain().focus().setBold().run();
      if (marks.italic) editor.chain().focus().setItalic().run();
      if (marks.underline) editor.chain().focus().setUnderline().run();
      if (marks.strike) editor.chain().focus().setStrike().run();
      if (marks.fontFamily) editor.chain().focus().setFontFamily(marks.fontFamily).run();
      if (marks.fontSize) editor.chain().focus().setFontSize(String(marks.fontSize)).run();
      if (marks.color) editor.chain().focus().setColor(marks.color).run();
      formatPainterMarks.current = null;
      setFormatPainterActive(false);
    };
    const editorEl = document.querySelector(".ProseMirror");
    editorEl?.addEventListener("mouseup", handleMouseUp);
    return () => editorEl?.removeEventListener("mouseup", handleMouseUp);
  }, [editor, formatPainterActive]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") { e.preventDefault(); setFindReplaceMode("find"); setFindReplaceOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === "h") { e.preventDefault(); setFindReplaceMode("replace"); setFindReplaceOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); if (editor) printDocument(editor.getHTML(), documentTitle); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSaveDraft(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [documentTitle, editor, handleSaveDraft]);

  useEffect(() => {
    if (!editor) return;
    const timer = window.setTimeout(() => { handleSaveDraft(); }, 900);
    return () => window.clearTimeout(timer);
  }, [documentHtml, documentTitle, editor, handleSaveDraft]);

  const handleFindOpen = useCallback((mode) => { setFindReplaceMode(mode); setFindReplaceOpen(true); }, []);

  return (
    <div className="h-screen min-h-0 flex flex-col bg-[#E8E8E8] overflow-hidden">
      <Ribbon
        editor={editor}
        documentTitle={documentTitle}
        onDocumentTitleChange={setDocumentTitle}
        formatPainterActive={formatPainterActive}
        onFormatPainterToggle={handleFormatPainterToggle}
        onFindOpen={handleFindOpen}
        onSaveDraft={handleSaveDraft}
        showRuler={showRuler}
        onToggleRuler={() => setShowRuler((v) => !v)}
        showGridlines={showGridlines}
        onToggleGridlines={() => setShowGridlines((v) => !v)}
        showStatusBar={showStatusBar}
        onToggleStatusBar={() => setShowStatusBar((v) => !v)}
      />
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <FindReplace editor={editor} isOpen={findReplaceOpen} onClose={() => setFindReplaceOpen(false)} mode={findReplaceMode} />
        <EditorCore onEditorReady={handleEditorReady} onContentChange={handleContentChange} initialContent={documentHtml} zoom={zoom} showRuler={showRuler} showGridlines={showGridlines} />
      </div>
      {showStatusBar && <StatusBar editor={editor} zoom={zoom} onZoomChange={setZoom} saveStatusLabel={formatSavedAt(lastSavedAt)} />}
    </div>
  );
};

export default AiEditorPage;
