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
import type { Editor } from "@tiptap/react";

export const LOCAL_STORAGE_KEY = "document-editor-draft-v2";

export const DEFAULT_DOCUMENT_TITLE = "Untitled Document";
export const PENDING_IMPORT_STORAGE_KEY = "testi;"
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

export interface StoredDraft {
  title: string;
  html: string;
  savedAt: string;
}

// Font list for the editor
export const FONT_FAMILIES = [
  "Arial",
  "Arial Black",
  "Book Antiqua",
  "Calibri",
  "Cambria",
  "Century Gothic",
  "Comic Sans MS",
  "Consolas",
  "Constantia",
  "Corbel",
  "Courier New",
  "Franklin Gothic Medium",
  "Garamond",
  "Georgia",
  "Impact",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Palatino Linotype",
  "Segoe UI",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
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

export function sanitizeFileName(name: string) {
  return (name || DEFAULT_DOCUMENT_TITLE)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export function saveDraftToStorage(title: string, html: string) {
  if (typeof window === "undefined") return;
  const payload: StoredDraft = {
    title: title || DEFAULT_DOCUMENT_TITLE,
    html: html || DEFAULT_DOCUMENT_CONTENT,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

export function loadDraftFromStorage(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
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

export function savePendingImportToStorage(payload: { title: string; html: string }) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_IMPORT_STORAGE_KEY, JSON.stringify({
    title: payload.title || DEFAULT_DOCUMENT_TITLE,
    html: payload.html || DEFAULT_DOCUMENT_CONTENT,
    savedAt: new Date().toISOString(),
  }));
}

export function consumePendingImportFromStorage(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PENDING_IMPORT_STORAGE_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(PENDING_IMPORT_STORAGE_KEY);

  try {
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
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

export async function copySelectionToClipboard(editor: Editor) {
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, "\n");

  if (!selectedText) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(selectedText);
      return true;
    }
  } catch {
    // Fall back below.
  }

  if (document.queryCommandSupported?.("copy")) {
    return document.execCommand("copy");
  }

  return false;
}

export async function cutSelectionToClipboard(editor: Editor) {
  const copied = await copySelectionToClipboard(editor);
  if (copied) {
    editor.chain().focus().deleteSelection().run();
  }
  return copied;
}

export async function pasteFromClipboard(editor: Editor) {
  try {
    if (navigator.clipboard?.readText) {
      const text = await navigator.clipboard.readText();
      if (text) {
        editor.chain().focus().insertContent(text).run();
        return true;
      }
    }
  } catch {
    // Fall back below.
  }

  if (document.queryCommandSupported?.("paste")) {
    return document.execCommand("paste");
  }

  return false;
}

// Import DOCX file
function normalizeImportedHtml(html: string): string {
  if (typeof DOMParser === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const getMeaningfulText = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim();

  doc.querySelectorAll("table").forEach((table) => {
    table.removeAttribute("width");
    table.removeAttribute("style");
    table.classList.add("imported-docx-table");

    const rows = Array.from(table.querySelectorAll("tr"));
    const maxCols = Math.max(
      1,
      ...rows.map((row) =>
        Array.from(row.querySelectorAll(":scope > td, :scope > th")).reduce((sum, cell) => {
          const span = Number.parseInt(cell.getAttribute("colspan") || "1", 10);
          return sum + (Number.isFinite(span) && span > 0 ? span : 1);
        }, 0)
      )
    );

    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll(":scope > td, :scope > th"));
      if (cells.length === 0) return;

      const meaningfulCells = cells.filter((cell) => {
        const text = getMeaningfulText(cell);
        return Boolean(text) || Boolean(cell.querySelector("img, table, br"));
      });

      if (meaningfulCells.length === 1 && cells.length > 1) {
        const mainCell = meaningfulCells[0];
        mainCell.setAttribute("colspan", String(maxCols));
        cells.forEach((cell) => {
          if (cell !== mainCell) cell.remove();
        });
      }

      cells.forEach((cell) => {
        const text = getMeaningfulText(cell);
        const widthAttr = cell.getAttribute("width") || "";
        const styleWidth = (cell as HTMLElement).style.width || "";
        const widthValue = `${widthAttr} ${styleWidth}`.trim();

        if (text.length > 24 && widthValue) {
          const percentMatch = widthValue.match(/(\d+(?:\.\d+)?)%/);
          const pixelMatch = widthValue.match(/(\d+(?:\.\d+)?)px/);
          const tooNarrowPercent = percentMatch && Number.parseFloat(percentMatch[1]) < 12;
          const tooNarrowPixels = pixelMatch && Number.parseFloat(pixelMatch[1]) < 120;
          if (tooNarrowPercent || tooNarrowPixels) {
            cell.removeAttribute("width");
            (cell as HTMLElement).style.width = "";
          }
        }

        (cell as HTMLElement).style.whiteSpace = "normal";
        (cell as HTMLElement).style.wordBreak = "normal";
        (cell as HTMLElement).style.overflowWrap = "break-word";
      });
    });
  });

  doc.querySelectorAll("p, td, th, div, li").forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.whiteSpace = "normal";
    htmlEl.style.wordBreak = "normal";
    htmlEl.style.overflowWrap = "break-word";
  });

  return doc.body.innerHTML;
}

export async function importDocx(file: File): Promise<string> {
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

// Helper to parse HTML content for export
type DocxSectionChild = Paragraph | Table;

function parseHtmlToDocxElements(html: string): DocxSectionChild[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const children: DocxSectionChild[] = [];

  function getTextRuns(node: Node): TextRun[] {
    const runs: TextRun[] = [];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text) return runs;

      const parent = node.parentElement;
      const bold = parent?.closest("strong, b") !== null;
      const italics = parent?.closest("em, i") !== null;
      const underline = parent?.closest("u") !== null ? { type: "single" as const } : undefined;
      const strike = parent?.closest("s, del, strike") !== null;
      const superScript = parent?.closest("sup") !== null;
      const subScript = parent?.closest("sub") !== null;

      let color: string | undefined;
      const colorEl = parent?.closest("[style*='color']");
      if (colorEl) {
        const style = (colorEl as HTMLElement).style.color;
        if (style) color = style.replace("#", "");
      }

      let fontSize: number | undefined;
      const fontSizeEl = parent?.closest("[style*='font-size']");
      if (fontSizeEl) {
        const fs = (fontSizeEl as HTMLElement).style.fontSize;
        if (fs) fontSize = Math.round(parseFloat(fs) * 2);
      }

      let font: string | undefined;
      const fontEl = parent?.closest("[style*='font-family']");
      if (fontEl) {
        font = (fontEl as HTMLElement).style.fontFamily?.replace(/[\'"]/g, "");
      }

      runs.push(
        new TextRun({
          text,
          bold,
          italics,
          underline,
          strike,
          superScript,
          subScript,
          color: color || undefined,
          size: fontSize || undefined,
          font: font || undefined,
        })
      );

      return runs;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

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

  function getParagraphAlignment(el: HTMLElement) {
    const style = el.style?.textAlign;
    if (style === "center") return AlignmentType.CENTER;
    if (style === "right") return AlignmentType.RIGHT;
    if (style === "justify") return AlignmentType.JUSTIFIED;
    return undefined;
  }

  function getCellParagraphs(cell: Element): Paragraph[] {
    const blockChildren = Array.from(cell.children).filter((child) =>
      ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI"].includes(child.tagName)
    );

    if (blockChildren.length === 0) {
      return [
        new Paragraph({
          children: getTextRuns(cell),
          alignment: getParagraphAlignment(cell as HTMLElement),
        }),
      ];
    }

    return blockChildren.map((child) =>
      new Paragraph({
        children: getTextRuns(child),
        alignment: getParagraphAlignment(child as HTMLElement),
      })
    );
  }

  function processElement(el: Element) {
    const tag = el.tagName.toLowerCase();

    if (tag === "table") {
      const rows = Array.from(el.querySelectorAll(":scope > tbody > tr, :scope > tr"));
      if (rows.length === 0) return;

      const maxCols = Math.max(
        1,
        ...rows.map((row) =>
          Array.from(row.querySelectorAll(":scope > td, :scope > th")).reduce((sum, cell) => {
            const span = Number.parseInt(cell.getAttribute("colspan") || "1", 10);
            return sum + (Number.isFinite(span) && span > 0 ? span : 1);
          }, 0)
        )
      );

      const tableRows = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll(":scope > td, :scope > th"));
        const docxCells = cells.map((cell) => {
          const span = Number.parseInt(cell.getAttribute("colspan") || "1", 10);
          const safeSpan = Number.isFinite(span) && span > 0 ? span : 1;
          const cellOptions: any = {
            children: getCellParagraphs(cell),
            width: {
              size: Math.max(5, Math.round((safeSpan / maxCols) * 100)),
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          };

          if (safeSpan > 1) {
            cellOptions.columnSpan = safeSpan;
          }

          return new TableCell(cellOptions);
        });

        return new TableRow({ children: docxCells });
      });

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
      return;
    }

    let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
    if (tag === "h1") heading = HeadingLevel.HEADING_1;
    else if (tag === "h2") heading = HeadingLevel.HEADING_2;
    else if (tag === "h3") heading = HeadingLevel.HEADING_3;
    else if (tag === "h4") heading = HeadingLevel.HEADING_4;
    else if (tag === "h5") heading = HeadingLevel.HEADING_5;
    else if (tag === "h6") heading = HeadingLevel.HEADING_6;

    if (["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote", "div"].includes(tag)) {
      const runs = getTextRuns(el);
      if (runs.length > 0 || tag !== "div") {
        children.push(
          new Paragraph({
            children: runs.length > 0 ? runs : [new TextRun("")],
            heading,
            alignment: getParagraphAlignment(el as HTMLElement),
          })
        );
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

// Export as DOCX
export async function exportDocx(html: string, title: string) {
  const children = parseHtmlToDocxElements(html);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFileName(title || "document")}.docx`);
}


// Export as DOCX
export async function exportDocxFile(html: string) {
  const children = parseHtmlToDocxElements(html);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
  // saveAs(blob, `${sanitizeFileName(title || "document")}.docx`);
}


// Export as HTML
export function exportHtml(html: string, title: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

// Export as TXT
export function exportTxt(text: string, title: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${sanitizeFileName(title || "document")}.txt`);
}

// Print document
// export function printDocument(html?: string, title?: string) {
//   if (!html) {
//     window.print();
//     return;
//   }

//   // const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");
//   // if (!printWindow) {
//     window.print();
//   //   return;
//   // }

//   const safeTitle = title || DEFAULT_DOCUMENT_TITLE;
// //   printWindow.document.open();
// //   printWindow.document.write(`<!DOCTYPE html>
// // <html lang="en">
// // <head>
// //   <meta charset="UTF-8" />
// //   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
// //   <title>${safeTitle}</title>
// //   <style>
// //     // @page { size: A4 }
// //     // * { box-sizing: border-box; }
// //     // html, body { margin: 0; padding: 0; background: #fff; color: #111; }
// //     // body { font-family: Calibri, "Segoe UI", sans-serif; font-size: 11pt; line-height: 1.2; }
// //     // .print-root { width: 100%; max-width: none; margin: 0 auto; }
// //     // table { width: 100%; border-collapse: collapse; table-layout: auto; page-break-inside: auto; }
// //     // tr, td, th { page-break-inside: avoid; }
// //     // td, th { border: 1px solid #999; padding: 6px 8px; vertical-align: top; white-space: normal; word-break: normal; overflow-wrap: break-word; }
// //     // p, li, div { white-space: normal; word-break: normal; overflow-wrap: break-word; }
// //     // img { max-width: 100%; height: auto; }
// //   </style>
// // </head>
// // <body>
// //   // <div class="print-root">${html}</div>
// //   <script>
// //     window.addEventListener('load', function () {
// //       setTimeout(function () {
// //         window.print();
// //         setTimeout(function () { window.close(); }, 150);
// //       }, 250);
// //     });
// //   </script>
// // </body>
// // </html>`);
// //   printWindow.document.close();
// }

// Get word count from text
export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Get character count
export function getCharCount(text: string, withSpaces: boolean = true): number {
  if (withSpaces) return text.length;
  return text.replace(/\s/g, "").length;
}
export function printDocument(html?: string, title: string = "Print") {
  const source =
    document.querySelector("#editor-scroll-container > div") ||
    document.querySelector(".editor-page-layout") ||
    document.querySelector(".editor-page-layout-content") ||
    document.querySelector(".page-content") ||
    document.querySelector(".ProseMirror") ||
    document.querySelector("[contenteditable='true']");

  if (!source && !html) {
    alert("Print content not found.");
    return;
  }

  const oldFrame = document.getElementById("print-iframe-frame");
  if (oldFrame) oldFrame.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "print-iframe-frame";
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.border = "0";
  iframe.style.background = "#fff";

  document.body.appendChild(iframe);

  const printDoc = iframe.contentDocument || iframe.contentWindow?.document;
  const printWin = iframe.contentWindow;

  if (!printDoc || !printWin) {
    iframe.remove();
    alert("Print iframe create nahi hua.");
    return;
  }

  printDoc.open();
  printDoc.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>

  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    * {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      width: 210mm !important;
      min-height: 297mm !important;
      background: #ffffff !important;
    }

    #print-root {
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      overflow: visible !important;
    }

    /*
      IMPORTANT:
      Yaha children ka padding/margin force remove nahi karna.
      Kyunki same visible editor layout chahiye.
    */
    .print-page {
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      background: #ffffff !important;
      box-shadow: none !important;
      overflow: visible !important;
      transform: none !important;
      zoom: 1 !important;
    }

    .print-page * {
      visibility: visible !important;
    }

    img,
    canvas,
    svg {
      max-width: 100% !important;
      height: auto !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    table {
      border-collapse: collapse;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    tr,
    td,
    th {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    button,
    input,
    textarea,
    select,
    header,
    nav,
    .ribbon,
    .status-bar,
    .toolbar,
    .editor-toolbar,
    .print-hide,
    .print\\:hidden {
      display: none !important;
    }

   @media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html,
  body,
  #root {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body {
    overflow: visible !important;
  }

  .print\:hidden,
  header,
  nav,
  .status-bar,
  .ribbon,
  .toolbar,
  .editor-toolbar,
  .print-hide {
    display: none !important;
  }

  #editor-scroll-container {
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /*
    IMPORTANT:
    Page wrapper ka padding remove mat karo.
    Same visible layout ke liye original padding rehna chahiye.
  */
  #editor-scroll-container > div {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 auto !important;
    background: #ffffff !important;
    box-shadow: none !important;
    transform: none !important;
    zoom: 1 !important;
    overflow: visible !important;
    page-break-after: avoid !important;
    break-after: avoid-page !important;
  }

  /*
    IMPORTANT:
    ProseMirror ka padding/margin force 0 mat karo.
    Isi se content top-left chipak raha tha.
  */
  .ProseMirror {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    outline: none !important;
    box-shadow: none !important;
    border: 0 !important;
    transform: none !important;
    zoom: 1 !important;
    font-family: "Calibri", "Segoe UI", sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.15 !important;
    color: #333 !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
  }

  .ProseMirror p {
    margin: 0 0 0.15em 0 !important;
  }

  .ProseMirror h1 {
    font-size: 24pt !important;
    font-weight: 700 !important;
    margin: 0.5em 0 0.3em 0 !important;
    color: #1a1a2e !important;
  }

  .ProseMirror h2 {
    font-size: 18pt !important;
    font-weight: 600 !important;
    margin: 0.4em 0 0.25em 0 !important;
    color: #185ABD !important;
  }

  .ProseMirror h3 {
    font-size: 14pt !important;
    font-weight: 600 !important;
    margin: 0.35em 0 0.2em 0 !important;
    color: #333 !important;
  }

  .ProseMirror h4 {
    font-size: 12pt !important;
    font-weight: 600 !important;
    margin: 0.3em 0 0.15em 0 !important;
  }

  .ProseMirror h5 {
    font-size: 11pt !important;
    font-weight: 600 !important;
    margin: 0.25em 0 0.1em 0 !important;
  }

  .ProseMirror h6 {
    font-size: 10pt !important;
    font-weight: 600 !important;
    margin: 0.2em 0 0.1em 0 !important;
    color: #666 !important;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding-left: 1.5em !important;
    margin: 0.3em 0 !important;
  }

  .ProseMirror ul {
    list-style-type: disc !important;
  }

  .ProseMirror ol {
    list-style-type: decimal !important;
  }

  .ProseMirror li {
    margin: 0.1em 0 !important;
  }

  .ProseMirror li p {
    margin: 0 !important;
  }

  .ProseMirror blockquote {
    border-left: 3px solid #185ABD !important;
    padding-left: 1em !important;
    margin: 0.5em 0 !important;
    color: #555 !important;
    font-style: italic !important;
  }

  .ProseMirror table {
    width: 100% !important;
    border-collapse: collapse !important;
    table-layout: auto !important;
    margin: 0.5em 0 !important;
    overflow: visible !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .ProseMirror tr,
  .ProseMirror td,
  .ProseMirror th {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    vertical-align: top !important;
  }

  .ProseMirror td,
  .ProseMirror th {
    border: 1px solid #bbb !important;
    padding: 6px 8px !important;
    vertical-align: top !important;
    min-width: 50px !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
  }

  .ProseMirror th {
    background-color: #f0f0f0 !important;
    font-weight: 600 !important;
  }

  .ProseMirror td > *,
  .ProseMirror th > * {
    margin: 0 !important;
  }

  .ProseMirror img,
  .ProseMirror canvas,
  .ProseMirror svg {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .page-content,
  .editor-page-layout-content,
  [contenteditable="true"] {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    outline: none !important;
    box-shadow: none !important;
    transform: none !important;
    zoom: 1 !important;
  }
}
  </style>
</head>

<body>
  <div id="print-root"></div>
</body>
</html>
  `);
  printDoc.close();

  const root = printDoc.getElementById("print-root");

  if (!root) {
    iframe.remove();
    alert("Print root create nahi hua.");
    return;
  }

  if (html && html.trim()) {
    const wrapper = printDoc.createElement("div");
    wrapper.className = "print-page";
    wrapper.innerHTML = html;
    root.appendChild(wrapper);
  } else if (source) {
    const cloned = source.cloneNode(true) as HTMLElement;

    /*
      Sabse important:
      Same visible layout ke liye computed CSS copy kar rahe hain.
      Isse editor ke andar ka margin, padding, font, width same rahega.
    */
    copyComputedStyles(source as HTMLElement, cloned, printDoc);

    cloned.classList.add("print-page");

    /*
      Canvas fix:
      cloneNode canvas ka drawing copy nahi karta.
      Agar PDF/canvas preview hai to blank ho jata hai.
      Isliye canvas ko image me convert kar rahe hain.
    */
    replaceCanvasWithImages(source as HTMLElement, cloned, printDoc);

    root.appendChild(cloned);
  }

  const hasContent =
    root.children.length > 0 ||
    root.innerText.trim().length > 0 ||
    Boolean(root.querySelector("img, canvas, svg, table, p, div"));

  if (!hasContent) {
    iframe.remove();
    alert("Print content empty aa raha hai.");
    return;
  }

  setTimeout(() => {
    waitForImages(printDoc, () => {
      setTimeout(() => {
        printWin.focus();
        printWin.print();

        setTimeout(() => {
          iframe.remove();
        }, 1200);
      }, 300);
    });
  }, 300);
}

function copyComputedStyles(
  sourceNode: Element,
  targetNode: Element,
  targetDoc: Document
) {
  if (!(sourceNode instanceof HTMLElement) || !(targetNode instanceof HTMLElement)) {
    return;
  }

  const computed = window.getComputedStyle(sourceNode);

  const importantProps = [
    "display",
    "position",
    "width",
    "max-width",
    "min-width",
    "height",
    "min-height",
    "max-height",

    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",

    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",

    "font",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "line-height",
    "letter-spacing",
    "text-align",
    "text-decoration",
    "text-transform",

    "color",
    "background",
    "background-color",
    "border",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-radius",

    "white-space",
    "word-break",
    "overflow-wrap",

    "list-style",
    "list-style-type",
    "vertical-align",
    "text-indent",
  ];

  importantProps.forEach((prop) => {
    const value = computed.getPropertyValue(prop);
    if (value) {
      targetNode.style.setProperty(prop, value, "important");
    }
  });

  /*
    Print me ye cheeze force correct rakho.
    Hidden/scroll/transform ki wajah se blank ya mismatch hota hai.
  */
  targetNode.style.setProperty("visibility", "visible", "important");
  targetNode.style.setProperty("opacity", "1", "important");
  targetNode.style.setProperty("transform", "none", "important");
  targetNode.style.setProperty("zoom", "1", "important");

  const sourceChildren = Array.from(sourceNode.children);
  const targetChildren = Array.from(targetNode.children);

  sourceChildren.forEach((sourceChild, index) => {
    const targetChild = targetChildren[index];
    if (sourceChild && targetChild) {
      copyComputedStyles(sourceChild, targetChild, targetDoc);
    }
  });
}

function replaceCanvasWithImages(
  sourceRoot: HTMLElement,
  clonedRoot: HTMLElement,
  targetDoc: Document
) {
  const sourceCanvasList = Array.from(sourceRoot.querySelectorAll("canvas"));
  const clonedCanvasList = Array.from(clonedRoot.querySelectorAll("canvas"));

  sourceCanvasList.forEach((sourceCanvas, index) => {
    const clonedCanvas = clonedCanvasList[index];
    if (!clonedCanvas) return;

    try {
      const image = targetDoc.createElement("img");

      image.src = sourceCanvas.toDataURL("image/png");
      image.style.display = "block";
      image.style.width = `${sourceCanvas.offsetWidth || sourceCanvas.width}px`;
      image.style.maxWidth = "100%";
      image.style.height = "auto";

      clonedCanvas.replaceWith(image);
    } catch {
      try {
        clonedCanvas.width = sourceCanvas.width;
        clonedCanvas.height = sourceCanvas.height;

        const ctx = clonedCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(sourceCanvas, 0, 0);
        }
      } catch {
        console.warn("Canvas copy failed.");
      }
    }
  });
}

function waitForImages(doc: Document, callback: () => void) {
  const images = Array.from(doc.images || []);

  if (!images.length) {
    callback();
    return;
  }

  let loaded = 0;

  const done = () => {
    loaded++;
    if (loaded >= images.length) callback();
  };

  images.forEach((img) => {
    if (img.complete) {
      done();
    } else {
      img.onload = done;
      img.onerror = done;
    }
  });
}

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
// export function printDocument(html?: string, title?: string) {
//   const editorSurface =
//     document.querySelector(".ProseMirror") ||
//     document.querySelector(".page-content") ||
//     document.querySelector("[contenteditable='true']");

//   if (!editorSurface) {
//     window.print();
//     return;
//   }

//   const printWindow = window.open("", "_blank", "width=1200,height=900");
//   if (!printWindow) return;

//   const cloned = editorSurface.cloneNode(true) as HTMLElement;

//   printWindow.document.open();
//   printWindow.document.write(`
//    <!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="UTF-8" />
//     <title>Print</title>
//    <style>
//   @page {
//     size: A4;
//     margin: 0;
//   }

//   html,
//   body {
//     margin: 0;
//     padding: 0;
//     background: #ffffff;
//     overflow: visible !important;
//     height: auto !important;
//   }

//   * {
//     box-sizing: border-box;
//     -webkit-print-color-adjust: exact;
//     print-color-adjust: exact;
//   }

//   body {
//     font-family: Calibri, "Segoe UI", sans-serif;
//     font-size: 9pt;
//     line-height: 1.0;
//   }

//   .print-root {
//     width: 210mm;
//     min-height: auto;
//     margin: 0;
//     padding: 4mm 12mm 12mm 12mm;
//     background: #fff;
//     overflow: visible !important;
//     page-break-after: avoid !important;
//     break-after: avoid-page !important;
//     display: block !important;
//   }

//   .print-root > *:first-child,
//   .print-root .page-content > *:first-child,
//   .print-root .editor-page-layout-content > *:first-child {
//     margin-top: 0 !important;
//   }

//   .print-root p {
//     margin-top: 0 !important;
//     margin-bottom: 0.1em !important;
//     white-space: normal;
//     word-break: normal;
//     overflow-wrap: break-word;
//   }

//   .print-root div,
//   .print-root li {
//     white-space: normal;
//     word-break: normal;
//     overflow-wrap: break-word;
//   }

//   .print-root .ProseMirror,
//   .print-root .page-content,
//   .print-root .editor-page-layout-content,
//   .print-root [contenteditable="true"] {
//     width: 100% !important;
//     height: auto !important;
//     min-height: auto !important;
//     max-height: none !important;
//     overflow: visible !important;
//     outline: none !important;
//     border: 0 !important;
//     box-shadow: none !important;
//     padding: 0 !important;
//     margin: 0 !important;
//     transform: none !important;
//     zoom: 1 !important;
//     background: transparent !important;
//   }

//   .print-root table {
//     width: 100%;
//     margin-top: 0 !important;
//     border-collapse: collapse;
//     table-layout: fixed;
//     page-break-inside: avoid !important;
//     break-inside: avoid !important;
//   }

//   .print-root tr,
//   .print-root td,
//   .print-root th {
//     page-break-inside: avoid !important;
//     break-inside: avoid !important;
//     vertical-align: top;
//   }

//   .print-root td,
//   .print-root th {
//     border: 1px solid #999;
//     padding: 4px 5px;
//     white-space: normal;
//     word-break: normal;
//     overflow-wrap: break-word;
//   }

//   .print-root td > *,
//   .print-root th > * {
//     margin-top: 0 !important;
//     margin-bottom: 0 !important;
//   }

//   .print-root img {
//     max-width: 100%;
//     height: auto;
//   }

//   .print-root > *:last-child {
//     page-break-after: avoid !important;
//     break-after: avoid-page !important;
//   }

//   @media print {
//     html,
//     body {
//       margin: 0 !important;
//       padding: 0 !important;
//       overflow: visible !important;
//       height: auto !important;
//       background: #fff !important;
//     }

//     .print-root {
//       width: 210mm !important;
//       margin: 0 !important;
//       padding: 4mm 12mm 12mm 12mm !important;
//       min-height: auto !important;
//       background: #fff !important;
//       overflow: visible !important;
//     }
//   }
// </style>
//   </head>
//   <body>
//     <div class="print-root" id="print-root"></div>
//     <script>
//       window.onload = function () {
//         setTimeout(function () {
//           window.print();
//           setTimeout(function () {
//             window.close();
//           }, 150);
//         }, 300);
//       };
//     </script>
//   </body>
// </html>
//   `);
//   printWindow.document.close();

//   const mount = () => {
//     const root = printWindow.document.getElementById("print-root");
//     if (!root) {
//       setTimeout(mount, 50);
//       return;
//     }
//     root.innerHTML = "";
//     root.appendChild(cloned);
//   };

//   mount();
// }