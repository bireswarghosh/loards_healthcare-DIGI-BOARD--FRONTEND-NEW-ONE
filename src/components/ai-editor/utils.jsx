import mammoth from "mammoth";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

export const LOCAL_STORAGE_KEY = "document-editor-draft-v2";
export const DEFAULT_DOCUMENT_TITLE = "Untitled Document";
export const PENDING_IMPORT_STORAGE_KEY = "testi;";
export const DEFAULT_DOCUMENT_CONTENT = `
  <h1>Welcome to Document Editor</h1>
  <p>This is a full-featured document editor similar to Microsoft Word. Start typing to create your document.</p>
  <p></p>
  <h2>Features</h2>
  <ul>
    <li>Rich text formatting (Bold, Italic, Underline, Strikethrough)</li>
    <li>Multiple font families and sizes</li>
    <li>Text and highlight colors</li>
    <li>Paragraph alignment and spacing</li>
    <li>Bullet lists, numbered lists, and task lists</li>
    <li>Tables with full editing capabilities</li>
    <li>Image insertion</li>
    <li>Import and export DOCX files</li>
    <li>Find and Replace</li>
    <li>And much more...</li>
  </ul>
  <p></p>
`;

export const FONT_FAMILIES = [
  "Arial", "Arial Black", "Book Antiqua", "Calibri", "Cambria",
  "Century Gothic", "Comic Sans MS", "Consolas", "Constantia", "Corbel",
  "Courier New", "Franklin Gothic Medium", "Garamond", "Georgia", "Impact",
  "Lucida Console", "Lucida Sans Unicode", "Palatino Linotype", "Segoe UI",
  "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana",
];

export const FONT_SIZES = [
  "8", "9", "10", "10.5", "11", "12", "14", "16", "18", "20",
  "22", "24", "26", "28", "36", "48", "72", "96",
];

export const HEADING_STYLES = [
  { label: "Normal", value: "paragraph", level: 0 },
  { label: "Heading 1", value: "heading", level: 1 },
  { label: "Heading 2", value: "heading", level: 2 },
  { label: "Heading 3", value: "heading", level: 3 },
  { label: "Heading 4", value: "heading", level: 4 },
  { label: "Heading 5", value: "heading", level: 5 },
  { label: "Heading 6", value: "heading", level: 6 },
];

export const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#CCCCCC", "#D9D9D9", "#EFEFEF", "#F3F3F3", "#FFFFFF",
  "#980000", "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#4A86E8", "#0000FF", "#9900FF", "#FF00FF",
  "#E6B8AF", "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#C9DAF8", "#CFE2F3", "#D9D2E9", "#EAD1DC",
  "#DD7E6B", "#EA9999", "#F9CB9C", "#FFE599", "#B6D7A8", "#A2C4C9", "#A4C2F4", "#9FC5E8", "#B4A7D6", "#D5A6BD",
  "#CC4125", "#E06666", "#F6B26B", "#FFD966", "#93C47D", "#76A5AF", "#6D9EEB", "#6FA8DC", "#8E7CC3", "#C27BA0",
  "#A61C00", "#CC0000", "#E69138", "#F1C232", "#6AA84F", "#45818E", "#3C78D8", "#3D85C6", "#674EA7", "#A64D79",
  "#85200C", "#990000", "#B45F06", "#BF9000", "#38761D", "#134F5C", "#1155CC", "#0B5394", "#351C75", "#741B47",
];

export const HIGHLIGHT_COLORS = [
  "#FFFF00", "#00FF00", "#00FFFF", "#FF00FF", "#0000FF",
  "#FF0000", "#000080", "#008080", "#008000", "#800080",
  "#800000", "#808000", "#808080", "#C0C0C0", "#FFFFFF",
];

export const LINE_SPACINGS = [
  { label: "1.0", value: 1 },
  { label: "1.15", value: 1.15 },
  { label: "1.5", value: 1.5 },
  { label: "2.0", value: 2 },
  { label: "2.5", value: 2.5 },
  { label: "3.0", value: 3 },
];

export function sanitizeFileName(name) {
  return (name || DEFAULT_DOCUMENT_TITLE)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export function saveDraftToStorage(title, html) {
  if (typeof window === "undefined") return;
  const payload = {
    title: title || DEFAULT_DOCUMENT_TITLE,
    html: html || DEFAULT_DOCUMENT_CONTENT,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

export function loadDraftFromStorage() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.html !== "string") return null;
    return {
      title: parsed.title || DEFAULT_DOCUMENT_TITLE,
      html: parsed.html || DEFAULT_DOCUMENT_CONTENT,
      savedAt: parsed.savedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearDraftFromStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function savePendingImportToStorage(payload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_IMPORT_STORAGE_KEY, JSON.stringify({
    title: payload.title || DEFAULT_DOCUMENT_TITLE,
    html: payload.html || DEFAULT_DOCUMENT_CONTENT,
    savedAt: new Date().toISOString(),
  }));
}

export function consumePendingImportFromStorage() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PENDING_IMPORT_STORAGE_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(PENDING_IMPORT_STORAGE_KEY);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.html !== "string") return null;
    return {
      title: parsed.title || DEFAULT_DOCUMENT_TITLE,
      html: parsed.html || DEFAULT_DOCUMENT_CONTENT,
      savedAt: parsed.savedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function copySelectionToClipboard(editor) {
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, "\n");
  if (!selectedText) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(selectedText);
      return true;
    }
  } catch { }
  if (document.queryCommandSupported?.("copy")) {
    return document.execCommand("copy");
  }
  return false;
}

export async function cutSelectionToClipboard(editor) {
  const copied = await copySelectionToClipboard(editor);
  if (copied) {
    editor.chain().focus().deleteSelection().run();
  }
  return copied;
}

export async function pasteFromClipboard(editor) {
  try {
    if (navigator.clipboard?.readText) {
      const text = await navigator.clipboard.readText();
      if (text) {
        editor.chain().focus().insertContent(text).run();
        return true;
      }
    }
  } catch { }
  if (document.queryCommandSupported?.("paste")) {
    return document.execCommand("paste");
  }
  return false;
}

function normalizeImportedHtml(html) {
  if (typeof DOMParser === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("table").forEach((table) => {
    table.removeAttribute("width");
    table.removeAttribute("style");

    const rows = Array.from(table.querySelectorAll("tr"));
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll(":scope > td, :scope > th"));
      cells.forEach((cell) => {
        cell.style.whiteSpace = "normal";
        cell.style.wordBreak = "normal";
        cell.style.overflowWrap = "break-word";
      });
    });
  });

  doc.querySelectorAll("p, td, th, div, li").forEach((el) => {
    el.style.whiteSpace = "normal";
    el.style.wordBreak = "normal";
    el.style.overflowWrap = "break-word";
  });

  return doc.body.innerHTML;
}

export async function importDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      includeDefaultStyleMap: true,
      preserveEmptyParagraphs: true,
      ignoreEmptyParagraphs: false,
    }
  );
  return normalizeImportedHtml(result.value);
}

function parseHtmlToDocxElements(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const children = [];

  function getTextRuns(node) {
    const runs = [];
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text) return runs;
      const parent = node.parentElement;
      const bold = parent?.closest("strong, b") !== null;
      const italics = parent?.closest("em, i") !== null;
      const underline = parent?.closest("u") !== null ? { type: "single" } : undefined;
      const strike = parent?.closest("s, del, strike") !== null;
      const superScript = parent?.closest("sup") !== null;
      const subScript = parent?.closest("sub") !== null;
      let color;
      const colorEl = parent?.closest("[style*='color']");
      if (colorEl) {
        const style = colorEl.style.color;
        if (style) color = style.replace("#", "");
      }
      let fontSize;
      const fontSizeEl = parent?.closest("[style*='font-size']");
      if (fontSizeEl) {
        const fs = fontSizeEl.style.fontSize;
        if (fs) fontSize = Math.round(parseFloat(fs) * 2);
      }
      let font;
      const fontEl = parent?.closest("[style*='font-family']");
      if (fontEl) {
        font = fontEl.style.fontFamily?.replace(/['"]/g, "");
      }
      runs.push(new TextRun({ text, bold, italics, underline, strike, superScript, subScript, color: color || undefined, size: fontSize || undefined, font: font || undefined }));
      return runs;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      if (el.tagName === "BR") {
        runs.push(new TextRun({ break: 1 }));
        return runs;
      }
      Array.from(el.childNodes).forEach((child) => {
        runs.push(...getTextRuns(child));
      });
    }
    return runs;
  }

  function getParagraphAlignment(el) {
    const style = el.style?.textAlign;
    if (style === "center") return AlignmentType.CENTER;
    if (style === "right") return AlignmentType.RIGHT;
    if (style === "justify") return AlignmentType.JUSTIFIED;
    return undefined;
  }

  function processElement(el) {
    const tag = el.tagName.toLowerCase();
    if (tag === "table") {
      const rows = Array.from(el.querySelectorAll(":scope > tbody > tr, :scope > tr"));
      if (rows.length === 0) return;
      const maxCols = Math.max(1, ...rows.map((row) =>
        Array.from(row.querySelectorAll(":scope > td, :scope > th")).reduce((sum, cell) => {
          const span = parseInt(cell.getAttribute("colspan") || "1", 10);
          return sum + (Number.isFinite(span) && span > 0 ? span : 1);
        }, 0)
      ));
      const tableRows = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll(":scope > td, :scope > th"));
        const docxCells = cells.map((cell) => {
          const span = parseInt(cell.getAttribute("colspan") || "1", 10);
          const safeSpan = Number.isFinite(span) && span > 0 ? span : 1;
          const cellOptions = {
            children: [new Paragraph({ children: getTextRuns(cell), alignment: getParagraphAlignment(cell) })],
            width: { size: Math.max(5, Math.round((safeSpan / maxCols) * 100)), type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
          };
          if (safeSpan > 1) cellOptions.columnSpan = safeSpan;
          return new TableCell(cellOptions);
        });
        return new TableRow({ children: docxCells });
      });
      children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      return;
    }
    let heading;
    if (tag === "h1") heading = HeadingLevel.HEADING_1;
    else if (tag === "h2") heading = HeadingLevel.HEADING_2;
    else if (tag === "h3") heading = HeadingLevel.HEADING_3;
    else if (tag === "h4") heading = HeadingLevel.HEADING_4;
    else if (tag === "h5") heading = HeadingLevel.HEADING_5;
    else if (tag === "h6") heading = HeadingLevel.HEADING_6;
    if (["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote", "div"].includes(tag)) {
      const runs = getTextRuns(el);
      if (runs.length > 0 || tag !== "div") {
        children.push(new Paragraph({ children: runs.length > 0 ? runs : [new TextRun("")], heading, alignment: getParagraphAlignment(el) }));
      }
      return;
    }
    if (tag === "ul" || tag === "ol") {
      Array.from(el.children).forEach((child) => processElement(child));
      return;
    }
    if (tag === "hr") {
      children.push(new Paragraph({ children: [new TextRun("─".repeat(50))] }));
      return;
    }
    Array.from(el.children).forEach((child) => processElement(child));
  }

  Array.from(doc.body.children).forEach((child) => processElement(child));
  if (children.length === 0) {
    children.push(new Paragraph({ children: [new TextRun("")] }));
  }
  return children;
}

export async function exportDocx(html, title) {
  const children = parseHtmlToDocxElements(html);
  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFileName(title || "document")}.docx`);
}

export async function exportDocxFile(html) {
  const children = parseHtmlToDocxElements(html);
  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
  });
  const blob = await Packer.toBlob(doc);
  return blob;
}

export function exportHtml(html, title) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title || "Document"}</title>
  <style>
    body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.15; max-width: 816px; margin: 0 auto; padding: 96px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #000; padding: 8px; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  saveAs(blob, `${sanitizeFileName(title || "document")}.html`);
}

export function exportTxt(text, title) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${sanitizeFileName(title || "document")}.txt`);
}

export function printDocument(html, title) {
  const editorSurface =
    document.querySelector(".ProseMirror") ||
    document.querySelector(".page-content") ||
    document.querySelector("[contenteditable='true']");

  if (!editorSurface) {
    window.print();
    return;
  }

  const printWindow = window.open("", "_blank", "width=1200,height=900");
  if (!printWindow) return;

  const cloned = editorSurface.cloneNode(true);

  printWindow.document.open();
  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Print</title>
<style>
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; background: #ffffff; overflow: visible !important; height: auto !important; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Calibri, "Segoe UI", sans-serif; font-size: 9pt; line-height: 1.0; }
.print-root { width: 210mm; min-height: auto; margin: 0; padding: 4mm 12mm 12mm 12mm; background: #fff; overflow: visible !important; }
.print-root p { margin-top: 0 !important; margin-bottom: 0.1em !important; white-space: normal; word-break: normal; overflow-wrap: break-word; }
.print-root table { width: 100%; margin-top: 0 !important; border-collapse: collapse; table-layout: fixed; page-break-inside: avoid !important; }
.print-root td, .print-root th { border: 1px solid #999; padding: 4px 5px; white-space: normal; word-break: normal; overflow-wrap: break-word; vertical-align: top; }
.print-root img { max-width: 100%; height: auto; }
@media print { html, body { margin: 0 !important; padding: 0 !important; } .print-root { width: 210mm !important; margin: 0 !important; padding: 4mm 12mm 12mm 12mm !important; } }
</style>
</head>
<body>
<div class="print-root" id="print-root"></div>
<script>
window.onload = function () { setTimeout(function () { window.print(); setTimeout(function () { window.close(); }, 150); }, 300); };
</script>
</body>
</html>`);
  printWindow.document.close();

  const mount = () => {
    const root = printWindow.document.getElementById("print-root");
    if (!root) { setTimeout(mount, 50); return; }
    root.innerHTML = "";
    root.appendChild(cloned);
  };
  mount();
}

export function getWordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getCharCount(text, withSpaces = true) {
  if (withSpaces) return text.length;
  return text.replace(/\s/g, "").length;
}
