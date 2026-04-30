import React, { useState, useCallback, useEffect, useRef } from "react";
import Ribbon from "./Ribbon";
import EditorCore from "./EditorCore";
import StatusBar from "./StatusBar";
import { DEFAULT_DOCUMENT_CONTENT, saveDraftToStorage, printDocument } from "./utils";

const DocumentEditor = ({ initialContent = "", documentTitle: initialTitle = "Untitled Document", onSave, onClose, onContentChange: onContentChangeProp }) => {
  const [editor, setEditor] = useState(null);
  const [documentTitle, setDocumentTitle] = useState(initialTitle);
  const [documentHtml, setDocumentHtml] = useState(initialContent || DEFAULT_DOCUMENT_CONTENT);
  const [zoom, setZoom] = useState(100);
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
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
  }, [editor, documentHtml, documentTitle, onSave]);

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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleSaveDraft]);

  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column", background: "#E8E8E8", overflow: "hidden" }}>
      <Ribbon
        editor={editor}
        documentTitle={documentTitle}
        onDocumentTitleChange={setDocumentTitle}
        formatPainterActive={formatPainterActive}
        onFormatPainterToggle={handleFormatPainterToggle}
        onSaveDraft={handleSaveDraft}
      />
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        <EditorCore
          onEditorReady={handleEditorReady}
          onContentChange={handleContentChange}
          initialContent={initialContent || DEFAULT_DOCUMENT_CONTENT}
          zoom={zoom}
        />
      </div>
      <StatusBar editor={editor} zoom={zoom} onZoomChange={setZoom} />
    </div>
  );
};

export default DocumentEditor;
