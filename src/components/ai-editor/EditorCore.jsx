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
import {
  copySelectionToClipboard,
  cutSelectionToClipboard,
  DEFAULT_DOCUMENT_CONTENT,
  pasteFromClipboard,
} from "./utils";

const BASE_PAGE_WIDTH = 816;
const BASE_PAGE_HEIGHT = 1056;

const EditorCore = ({ onEditorReady, onContentChange, initialContent, zoom, showRuler, showGridlines }) => {
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
        class: "outline-none min-h-[1056px] px-[96px] py-[72px] font-[Calibri] text-[11pt] leading-[1.15]",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onContentChange({ html: currentEditor.getHTML(), text: currentEditor.getText() });
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
      onContentChange({ html: editor.getHTML(), text: editor.getText() });
    }
    return () => onEditorReady(null);
  }, [editor, onEditorReady, onContentChange]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (!editor) return;
    const menu = document.createElement("div");
    menu.className = "fixed z-[9999] bg-white border border-gray-300 shadow-lg rounded py-1 min-w-[180px] text-xs";
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
    ];
    items.forEach((item) => {
      if (item.label === "---") {
        const sep = document.createElement("div");
        sep.className = "border-t border-gray-200 my-1";
        menu.appendChild(sep);
      } else {
        const btn = document.createElement("button");
        btn.className = "w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between";
        btn.innerHTML = `<span>${item.label}</span><span class="text-gray-400 text-[10px]">${item.shortcut || ""}</span>`;
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
    <div className="bg-[#E8E8E8] flex-1 min-h-0 overflow-auto overscroll-contain print:bg-white print:p-0" id="editor-scroll-container">
      <div className="mx-auto flex min-h-full w-full justify-center px-4 py-6">
        <div className="shrink-0" style={{ width: `${BASE_PAGE_WIDTH * pageScale}px`, minHeight: `${scaledPageHeight}px`, paddingBottom: "32px" }}>
          <div
            className="bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] print:shadow-none print:transform-none"
            style={{
              width: `${BASE_PAGE_WIDTH}px`,
              minHeight: `${BASE_PAGE_HEIGHT}px`,
              transform: `scale(${pageScale})`,
              transformOrigin: "top left",
              backgroundImage: showGridlines ? "linear-gradient(to right, rgba(24,90,189,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,90,189,0.08) 1px, transparent 1px)" : undefined,
              backgroundSize: showGridlines ? "24px 24px" : undefined,
            }}
            onContextMenu={handleContextMenu}
          >
            {showRuler && (
              <div className="h-[24px] bg-white border-b border-gray-200 flex items-center px-2 print:hidden">
                <div className="flex-1 relative h-[16px] bg-[#F0F0F0] rounded overflow-hidden">
                  {Array.from({ length: 17 }, (_, i) => (
                    <div key={i} className="absolute top-0 h-full flex flex-col items-center justify-end" style={{ left: `${(i / 16) * 100}%` }}>
                      <div className={`w-px ${i % 2 === 0 ? "h-3 bg-gray-600" : "h-2 bg-gray-400"}`} />
                      {i % 2 === 0 && <span className="text-[7px] text-gray-500 leading-none">{i / 2}</span>}
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
