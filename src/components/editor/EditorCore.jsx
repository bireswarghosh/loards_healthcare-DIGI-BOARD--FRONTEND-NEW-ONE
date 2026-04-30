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
import { DEFAULT_DOCUMENT_CONTENT } from "./utils";
import "./editor.css";

const EditorCore = ({ onEditorReady, onContentChange, initialContent, zoom = 100 }) => {
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
      Link.configure({ openOnClick: false }),
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
  });

  useEffect(() => {
    if (editor) {
      onEditorReady?.(editor);
      onContentChange?.({ html: editor.getHTML(), text: editor.getText() });
    }
    return () => onEditorReady?.(null);
  }, [editor]);

  const pageScale = zoom / 100;

  return (
    <div style={{ background: "#E8E8E8", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowY: "scroll", overflowX: "auto" }}
      id="editor-scroll-container"
    >
      <div style={{ display: "flex", justifyContent: "center", padding: "24px", minHeight: "100%" }}>
        <div style={{ width: `${816 * pageScale}px`, paddingBottom: "32px", flexShrink: 0 }}>
          <div
            style={{
              width: "816px",
              minHeight: "1056px",
              background: "#fff",
              boxShadow: "0 0 10px rgba(0,0,0,0.15)",
              transform: `scale(${pageScale})`,
              transformOrigin: "top left",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorCore;
