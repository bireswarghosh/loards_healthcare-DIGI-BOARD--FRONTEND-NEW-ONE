import React, { useState, useCallback, useEffect, useRef } from "react";
import Ribbon from "./Ribbon";
import EditorCore from "./EditorCore";
import StatusBar from "./StatusBar";
import FindReplace from "./FindReplace";
import { DEFAULT_DOCUMENT_CONTENT, saveDraftToStorage, printDocument } from "./utils";

const DocumentEditor = ({ initialContent = "", documentTitle: initialTitle = "Untitled Document", onSave, onClose, onContentChange: onContentChangeProp }) => {
  const [editor, setEditor] = useState(null);
  const [documentTitle, setDocumentTitle] = useState(initialTitle);
  const [documentHtml, setDocumentHtml] = useState(initialContent || DEFAULT_DOCUMENT_CONTENT);
  const [zoom, setZoom] = useState(100);
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [showGridlines, setShowGridlines] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [findOpen, setFindOpen] = useState(false);
  const [findMode, setFindMode] = useState("find");
  const [saveStatusLabel, setSaveStatusLabel] = useState("");
  const formatPainterMarks = useRef(null);

  const handleEditorReady = useCallback((ed) => { setEditor(ed); }, []);
  const handleContentChange = useCallback((payload) => {
    setDocumentHtml(payload.html);
    onContentChangeProp?.(payload.html);
  }, [onContentChangeProp]);

  const handleSaveDraft = useCallback(() => {
    const htmlToSave = editor?.getHTML() || documentHtml;
    if (onSave) {
      onSave({ title: documentTitle, html: htmlToSave });
    } else {
      saveDraftToStorage(documentTitle, htmlToSave);
    }
    setSaveStatusLabel("Saved");
    setTimeout(() => setSaveStatusLabel(""), 2000);
  }, [editor, documentHtml, documentTitle, onSave]);

  const handleFindOpen = useCallback((mode) => {
    setFindMode(mode);
    setFindOpen(true);
  }, []);

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
      if (textStyle.color) marks.color = textStyle.color;
      formatPainterMarks.current = marks;
      setFormatPainterActive(true);
    } else {
      formatPainterMarks.current = null;
      setFormatPainterActive(false);
    }
  }, [editor, formatPainterActive]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        if (editor) printDocument(editor.getHTML());
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        handleFindOpen("find");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        handleFindOpen("replace");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleSaveDraft, handleFindOpen]);

  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column", background: "#E8E8E8", overflow: "hidden" }}>
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
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        <EditorCore
          onEditorReady={handleEditorReady}
          onContentChange={handleContentChange}
          initialContent={initialContent || DEFAULT_DOCUMENT_CONTENT}
          zoom={zoom}
          showRuler={showRuler}
          showGridlines={showGridlines}
        />
        <FindReplace
          editor={editor}
          isOpen={findOpen}
          onClose={() => setFindOpen(false)}
          mode={findMode}
        />
      </div>
      {showStatusBar && <StatusBar editor={editor} zoom={zoom} onZoomChange={setZoom} saveStatusLabel={saveStatusLabel} />}
    </div>
  );
};

export default DocumentEditor;
