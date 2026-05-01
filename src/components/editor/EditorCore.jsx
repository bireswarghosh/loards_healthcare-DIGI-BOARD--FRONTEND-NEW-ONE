import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { FontFamily } from "@tiptap/extension-font-family";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { HardBreak } from "@tiptap/extension-hard-break";
import { CharacterCount } from "@tiptap/extension-character-count";
import { copySelectionToClipboard, cutSelectionToClipboard, DEFAULT_DOCUMENT_CONTENT, pasteFromClipboard } from "./utils";
import "./editor.css";

const BASE_PAGE_WIDTH = 816;
const BASE_PAGE_HEIGHT = 1056;

const EditorCore = ({ onEditorReady, onContentChange, initialContent, zoom = 100, showRuler = false, showGridlines = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        horizontalRule: false,
        hardBreak: false,
      }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true, handleWidth: 5, cellMinWidth: 50, lastColumnResizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" } }),
      Placeholder.configure({ placeholder: "Start typing your document here..." }),
      FontFamily,
      TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      HardBreak,
      CharacterCount,
    ],
    content: initialContent || DEFAULT_DOCUMENT_CONTENT,
    editorProps: {
      attributes: {
        class: "ProseMirror",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onContentChange?.({ html: currentEditor.getHTML(), text: currentEditor.getText() });
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      onEditorReady?.(editor);
      onContentChange?.({ html: editor.getHTML(), text: editor.getText() });
    }
    return () => onEditorReady?.(null);
  }, [editor]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (!editor) return;

    const menu = document.createElement("div");
    menu.style.cssText = "position:fixed;z-index:9999;background:#fff;border:1px solid #d1d5db;box-shadow:0 4px 6px rgba(0,0,0,0.1);border-radius:4px;padding:4px 0;min-width:180px;font-size:12px";
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const items = [
      { label: "Cut", shortcut: "Ctrl+X", action: () => void cutSelectionToClipboard(editor) },
      { label: "Copy", shortcut: "Ctrl+C", action: () => void copySelectionToClipboard(editor) },
      { label: "Paste", shortcut: "Ctrl+V", action: () => void pasteFromClipboard(editor) },
      { label: "---" },
      { label: "Select All", shortcut: "Ctrl+A", action: () => editor.chain().focus().selectAll().run() },
      { label: "---" },
      { label: "Bold", shortcut: "Ctrl+B", action: () => editor.chain().focus().toggleBold().run() },
      { label: "Italic", shortcut: "Ctrl+I", action: () => editor.chain().focus().toggleItalic().run() },
      { label: "Underline", shortcut: "Ctrl+U", action: () => editor.chain().focus().toggleUnderline().run() },
      { label: "---" },
      { label: "Insert Link", shortcut: "", action: () => { const url = prompt("Enter URL:"); if (url) editor.chain().focus().setLink({ href: url }).run(); } },
      { label: "Insert Horizontal Rule", shortcut: "", action: () => editor.chain().focus().setHorizontalRule().run() },
    ];

    items.forEach((item) => {
      if (item.label === "---") {
        const sep = document.createElement("div");
        sep.style.cssText = "border-top:1px solid #e5e7eb;margin:4px 0";
        menu.appendChild(sep);
      } else {
        const btn = document.createElement("button");
        btn.style.cssText = "width:100%;text-align:left;padding:6px 12px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:space-between";
        btn.innerHTML = `<span>${item.label}</span><span style="color:#9ca3af;font-size:10px">${item.shortcut}</span>`;
        btn.onmouseenter = () => btn.style.background = "#eff6ff";
        btn.onmouseleave = () => btn.style.background = "transparent";
        btn.onclick = () => { item.action(); menu.remove(); };
        menu.appendChild(btn);
      }
    });

    document.body.appendChild(menu);
    const removeMenu = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener("click", removeMenu); } };
    setTimeout(() => document.addEventListener("click", removeMenu), 0);
  }, [editor]);

  const pageScale = zoom / 100;
  const rulerHeight = showRuler ? 24 : 0;
  const scaledPageHeight = BASE_PAGE_HEIGHT * pageScale + rulerHeight;

  return (
    <div style={{ background: "#E8E8E8", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowY: "scroll", overflowX: "auto" }}
      id="editor-scroll-container"
    >
      <div style={{ display: "flex", justifyContent: "center", padding: "24px", minHeight: "100%" }}>
        <div style={{ width: `${BASE_PAGE_WIDTH * pageScale}px`, minHeight: `${scaledPageHeight}px`, paddingBottom: "32px", flexShrink: 0 }}>
          <div
            style={{
              width: `${BASE_PAGE_WIDTH}px`,
              minHeight: `${BASE_PAGE_HEIGHT}px`,
              background: "#fff",
              boxShadow: "0 0 10px rgba(0,0,0,0.15)",
              transform: `scale(${pageScale})`,
              transformOrigin: "top left",
              backgroundImage: showGridlines
                ? "linear-gradient(to right, rgba(24,90,189,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,90,189,0.08) 1px, transparent 1px)"
                : undefined,
              backgroundSize: showGridlines ? "24px 24px" : undefined,
            }}
            onContextMenu={handleContextMenu}
          >
            {showRuler && (
              <div style={{ height: "24px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 8px" }}>
                <div style={{ flex: 1, position: "relative", height: "16px", background: "#F0F0F0", borderRadius: "4px", overflow: "hidden" }}>
                  {Array.from({ length: 17 }, (_, i) => (
                    <div key={i} style={{ position: "absolute", top: 0, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", left: `${(i / 16) * 100}%` }}>
                      <div style={{ width: "1px", height: i % 2 === 0 ? "12px" : "8px", background: i % 2 === 0 ? "#4b5563" : "#9ca3af" }} />
                      {i % 2 === 0 && <span style={{ fontSize: "7px", color: "#6b7280", lineHeight: 1 }}>{i / 2}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorCore;
