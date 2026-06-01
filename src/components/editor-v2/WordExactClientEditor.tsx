import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { renderAsync } from "docx-preview";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  FileDown,
  FileUp,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Minus,
  Plus,
  Printer,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Send,
  Table,
  Underline,
  Undo2,
  ZoomIn,
} from "lucide-react";

const SubmitDialog = lazy(() => import("./SubmitDialog"));

const DOCX_OPTIONS = {
  className: "docx",
  inWrapper: true,
  ignoreWidth: false,
  ignoreHeight: false,
  ignoreFonts: false,
  breakPages: true,
  ignoreLastRenderedPageBreak: false,
  experimental: true,
  trimXmlDeclaration: true,
  useBase64URL: true,
  renderHeaders: true,
  renderFooters: true,
  renderFootnotes: true,
  renderEndnotes: true,
  renderComments: true,
  renderChanges: true,
  debug: false,
};

type WordExactClientEditorProps = { initialTitle?: string; initialHtml?: string; onSave?: (data: { title: string; html: string }) => void; onContentChange?: (html: string) => void; onPrint?: () => void; };
type TabId = "file" | "home" | "insert" | "layout" | "table" | "view";
type FindMode = "find" | "replace";
type TableResizeMode = "column" | "row" | "table";
type TableResizeState = {
  mode: TableResizeMode;
  table: HTMLTableElement;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  columnIndex?: number;
  row?: HTMLTableRowElement;
  cells?: HTMLTableCellElement[];
};

type TextStats = {
  words: number;
  chars: number;
  charsNoSpaces: number;
  lines: number;
  pages: number;
};

const LS_KEY = "word_exact_client_editor_draft_v2";
const PENDING_DOCX_KEY = "word_exact_pending_docx_v1";
const PENDING_HTML_KEY = "word_exact_pending_html_v1";

const exec = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const downloadTextFile = (
  filename: string,
  content: string,
  type = "text/html;charset=utf-8",
) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const cleanFileName = (name: string) =>
  (name || "document").replace(/[\\/:*?"<>|]+/g, "-");

const dataUrlToFile = (dataUrl: string, filename: string, mimeType: string) => {
  const parts = dataUrl.split(",");
  const header = parts[0] || "";
  const data = parts[1] || "";
  const resolvedMime = header.match(/data:([^;]+)/)?.[1] || mimeType;
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: resolvedMime });
};

const cleanupHtmlForDocxDownload = (root: HTMLElement | null) => {
  if (!root) return "<p></p>";
  const clone = root.cloneNode(true) as HTMLElement;

  clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
    el.removeAttribute("contenteditable");
    el.removeAttribute("spellcheck");
    el.classList.remove("word-active-cell");
    // Browser editor helper styles should not go inside downloaded DOCX
    if (el.className && String(el.className).includes("word-")) {
      el.className = String(el.className)
        .split(/\s+/)
        .filter((c) => !c.startsWith("word-"))
        .join(" ");
    }
  });

  // docx-preview renders page wrappers. For edited DOCX download we keep only real page content.
  const sections = Array.from(clone.querySelectorAll<HTMLElement>(".docx section"));
  if (sections.length) {
    return sections
      .map((section, index) => {
        const pageBreak = index > 0 ? '<br style="page-break-before: always;" />' : "";
        return `${pageBreak}<div>${section.innerHTML}</div>`;
      })
      .join("");
  }

  return clone.innerHTML || "<p></p>";
};

const buildWordCompatibleHtml = (title: string, body: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page WordSection1 {
      size: A4;
      margin: 0.5in 0.5in 0.5in 0.5in;
    }

    body {
      margin: 0;
      padding: 0;
      background: white;
      color: black;
      font-family: Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.15;
    }

    .WordSection1 {
      page: WordSection1;
    }

    p {
      margin: 0 0 6pt 0;
      color: black;
    }

    span, div {
      color: black;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 0 0 8pt 0;
    }

    td, th {
      border: 1px solid #000;
      padding: 4pt 6pt;
      vertical-align: top;
      color: black;
    }

    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="WordSection1">
    ${body}
  </div>
</body>
</html>`;
};

const countTextStats = (root: HTMLElement | null): TextStats => {
  const text = root?.innerText || "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const lines = text.split("\n").length;
  const pages = root?.querySelectorAll(".docx section").length || 1;
  return { words, chars, charsNoSpaces, lines, pages };
};

const isCell = (node: Node | null): node is HTMLTableCellElement => {
  return !!node && node instanceof HTMLTableCellElement;
};

const closestCell = (node: Node | null): HTMLTableCellElement | null => {
  if (!node) return null;
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  return (element?.closest("td,th") as HTMLTableCellElement | null) || null;
};

const cellIndexInRow = (cell: HTMLTableCellElement) => {
  const cells = Array.from(cell.parentElement?.children || []).filter((el) =>
    el.matches("td,th"),
  );
  return Math.max(0, cells.indexOf(cell));
};

const isNearRightEdge = (e: MouseEvent, rect: DOMRect, gap = 8) =>
  rect.right - e.clientX <= gap && e.clientX >= rect.left;

const isNearBottomEdge = (e: MouseEvent, rect: DOMRect, gap = 8) =>
  rect.bottom - e.clientY <= gap && e.clientY >= rect.top;

const getColumnCells = (table: HTMLTableElement, columnIndex: number) =>
  Array.from(table.rows)
    .map((row) => row.cells[columnIndex] as HTMLTableCellElement | undefined)
    .filter(Boolean) as HTMLTableCellElement[];

const getSelectionCell = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const node = sel.anchorNode || sel.getRangeAt(0).startContainer;
  return closestCell(node);
};

const createEmptyCell = (tagName: "td" | "th" = "td") => {
  const cell = document.createElement(tagName);
  cell.innerHTML = "<p><br></p>";
  cell.setAttribute("contenteditable", "true");
  cell.setAttribute("spellcheck", "false");
  cell.classList.add("word-editable-cell");
  return cell;
};

const focusInside = (el: HTMLElement | null) => {
  if (!el) return;
  const target = (el.querySelector("p,div,span") as HTMLElement | null) || el;
  target.focus();
  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
};

const WordExactClientEditor: React.FC<WordExactClientEditorProps> = ({
  initialTitle = "Untitled Document",
  initialHtml,
  onSave,
  onContentChange,
  onPrint,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const lastFileRef = useRef<File | null>(null);
  const tableResizeRef = useRef<TableResizeState | null>(null);

  const [title, setTitle] = useState(initialTitle);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRuler, setShowRuler] = useState(true);
  const [showGridlines, setShowGridlines] = useState(false);
  const [showTableBoxes, setShowTableBoxes] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [findMode, setFindMode] = useState<FindMode>("find");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [statsTick, setStatsTick] = useState(0);
  const [selectedCell, setSelectedCell] = useState<HTMLTableCellElement | null>(
    null,
  );
  const [insertRows, setInsertRows] = useState(2);
  const [insertCols, setInsertCols] = useState(2);

  const stats = useMemo(
    () => countTextStats(hostRef.current),
    [statsTick, hasDocument],
  );

  const normalizeTables = useCallback(() => {
    const root = hostRef.current;
    if (!root) return;

    root.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      table.classList.add("word-doc-table");
      table.setAttribute("contenteditable", "true");
      if (!table.querySelector("tbody") && table.rows.length) {
        const tbody = document.createElement("tbody");
        Array.from(table.rows).forEach((row) => tbody.appendChild(row));
        table.appendChild(tbody);
      }
    });

    root.querySelectorAll<HTMLTableCellElement>("td,th").forEach((cell) => {
      cell.setAttribute("contenteditable", "true");
      cell.setAttribute("spellcheck", "false");
      cell.classList.add("word-editable-cell");
      if (!cell.innerHTML.trim()) cell.innerHTML = "<p><br></p>";
    });
  }, []);

  useEffect(() => {
    const root = hostRef.current;
    if (!root) return;

    const getResizeTarget = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const cell = closestCell(target);
      const table = (cell?.closest("table") as HTMLTableElement | null) || null;

      if (!cell || !table || !root.contains(table)) return null;

      const cellRect = cell.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();

      const nearRight = isNearRightEdge(e, cellRect);
      const nearBottom = isNearBottomEdge(e, cellRect);

      const row = cell.parentElement as HTMLTableRowElement;
      const isLastRow = row === table.rows[table.rows.length - 1];
      const isLastCell = cellIndexInRow(cell) === row.cells.length - 1;

      // Bottom-right last cell: full table resize
      if (nearRight && nearBottom && isLastRow && isLastCell) {
        return {
          mode: "table" as const,
          table,
          cursor: "nwse-resize",
          startWidth: tableRect.width,
          startHeight: tableRect.height,
        };
      }

      // Right border: column resize
      if (nearRight) {
        const columnIndex = cellIndexInRow(cell);
        const cells = getColumnCells(table, columnIndex);

        return {
          mode: "column" as const,
          table,
          cursor: "col-resize",
          columnIndex,
          cells,
          startWidth: cellRect.width,
          startHeight: cellRect.height,
        };
      }

      // Bottom border: row resize
      if (nearBottom) {
        return {
          mode: "row" as const,
          table,
          cursor: "row-resize",
          row,
          startWidth: cellRect.width,
          startHeight: cellRect.height,
        };
      }

      return null;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (tableResizeRef.current) return;

      const target = getResizeTarget(e);
      root.style.cursor = target?.cursor || "";
    };

    const onMouseLeave = () => {
      if (!tableResizeRef.current) {
        root.style.cursor = "";
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const target = getResizeTarget(e);
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();

      root.style.cursor = target.cursor;

      tableResizeRef.current = {
        mode: target.mode,
        table: target.table,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: target.startWidth,
        startHeight: target.startHeight,
        columnIndex: target.columnIndex,
        row: target.row,
        cells: target.cells,
      };

      document.body.classList.add("word-table-resizing");
    };

    const onWindowMove = (e: MouseEvent) => {
      const state = tableResizeRef.current;
      if (!state) return;

      e.preventDefault();

      // Column resize
      if (state.mode === "column") {
        const width = Math.max(
          28,
          Math.round(state.startWidth + e.clientX - state.startX),
        );

        state.table.style.tableLayout = "fixed";

        state.cells?.forEach((cell) => {
          cell.style.width = `${width}px`;
          cell.style.minWidth = `${width}px`;
        });
      }

      // Row resize
      if (state.mode === "row" && state.row) {
        const height = Math.max(
          20,
          Math.round(state.startHeight + e.clientY - state.startY),
        );

        state.row.style.height = `${height}px`;

        Array.from(state.row.cells).forEach((cell) => {
          const td = cell as HTMLTableCellElement;
          td.style.height = `${height}px`;
          td.style.minHeight = `${height}px`;
        });
      }

      // Full table resize from bottom-right
      if (state.mode === "table") {
        const width = Math.max(
          120,
          Math.round(state.startWidth + e.clientX - state.startX),
        );

        const height = Math.max(
          40,
          Math.round(state.startHeight + e.clientY - state.startY),
        );

        state.table.style.width = `${width}px`;
        state.table.style.minWidth = `${Math.min(width, 120)}px`;
        state.table.style.height = `${height}px`;
        state.table.style.minHeight = `${height}px`;
      }
    };

    const stopResize = () => {
      if (!tableResizeRef.current) return;

      tableResizeRef.current = null;
      root.style.cursor = "";
      document.body.classList.remove("word-table-resizing");
    };

    root.addEventListener("mousemove", onMouseMove);
    root.addEventListener("mouseleave", onMouseLeave);
    root.addEventListener("mousedown", onMouseDown);

    window.addEventListener("mousemove", onWindowMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      root.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("mouseleave", onMouseLeave);
      root.removeEventListener("mousedown", onMouseDown);

      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("mouseup", stopResize);

      document.body.classList.remove("word-table-resizing");
    };
  }, [hasDocument]);

  const makeEditable = useCallback(() => {
    const root = hostRef.current;
    if (!root) return;

    root
      .querySelectorAll<HTMLElement>(
        ".docx, .docx section, .docx p, .docx span, .docx table, .docx td, .docx th, .docx div",
      )
      .forEach((el) => {
        el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "false");
      });

    root.querySelectorAll<HTMLElement>(".docx-wrapper").forEach((el) => {
      el.style.background = "#e8e8e8";
      el.style.padding = "24px 0 48px";
    });

    root.querySelectorAll<HTMLElement>(".docx section").forEach((page) => {
      page.setAttribute("contenteditable", "true");
      page.style.outline = "none";
      page.style.cursor = "text";
      page.style.boxShadow = "0 0 10px rgba(0,0,0,.18)";
      page.style.margin = "0 auto 18px";
      page.style.transformOrigin = "top center";
    });

    normalizeTables();
    setStatsTick((v) => v + 1);
  }, [normalizeTables]);

  const renderDocxFile = useCallback(
    async (file: File) => {
      if (!hostRef.current) return;
      setLoading(true);
      setError(null);
      setSelectedCell(null);
      try {
        hostRef.current.innerHTML = "";
        await renderAsync(file, hostRef.current, undefined, DOCX_OPTIONS);
        makeEditable();
        lastFileRef.current = file;
        setTitle(file.name.replace(/\.docx$/i, "") || "Document");
        setHasDocument(true);
        setLastSavedAt(null);
      } catch (err) {
        console.error(err);
        setError(
          "DOCX open nahi ho paya. File corrupt/protected ho sakti hai.",
        );
      } finally {
        setLoading(false);
      }
    },
    [makeEditable],
  );

  const getHtml = useCallback(() => hostRef.current?.innerHTML || "", []);

  const saveDraft = useCallback(() => {
    const html = getHtml();
    if (onSave) {
      onSave({ title, html });
    } else {
      const payload = {
        title,
        html,
        savedAt: new Date().toISOString(),
        showTableBoxes,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    }
    setLastSavedAt(new Date());
  }, [getHtml, title, showTableBoxes, onSave]);

  const restoreDraft = useCallback(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw || !hostRef.current) return;
    try {
      const draft = JSON.parse(raw);
      setTitle(draft.title || initialTitle);
      hostRef.current.innerHTML = draft.html || "";
      setHasDocument(Boolean(draft.html));
      setLastSavedAt(draft.savedAt ? new Date(draft.savedAt) : null);
      if (typeof draft.showTableBoxes === "boolean")
        setShowTableBoxes(draft.showTableBoxes);
      setTimeout(makeEditable, 0);
    } catch {}
  }, [initialTitle, makeEditable]);

  useEffect(() => {
    // If initialHtml prop is provided, use it directly (embedded mode)
    if (initialHtml !== undefined && hostRef.current) {
      hostRef.current.innerHTML = `<div class="docx-wrapper" style="background:#e8e8e8;padding:24px 0 48px"><div class="docx"><section contenteditable="true" spellcheck="false" style="outline:none;cursor:text;box-shadow:0 0 10px rgba(0,0,0,.18);margin:0 auto 18px;padding:40px 50px;min-height:600px;background:#fff;width:210mm;transform-origin:top center">${initialHtml || "<p><br></p>"}</section></div></div>`;
      setTitle(initialTitle);
      setHasDocument(true);
      setLastSavedAt(null);
      setTimeout(makeEditable, 0);
      return;
    }

    const pendingDocx = localStorage.getItem(PENDING_DOCX_KEY);
    const pendingHtml = localStorage.getItem(PENDING_HTML_KEY);

    if (pendingDocx) {
      try {
        const payload = JSON.parse(pendingDocx) as {
          title?: string;
          dataUrl?: string;
          mimeType?: string;
        };
        if (payload.dataUrl) {
          localStorage.removeItem(PENDING_DOCX_KEY);
          const file = dataUrlToFile(
            payload.dataUrl,
            payload.title || "document.docx",
            payload.mimeType ||
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          );
          void renderDocxFile(file);
          return;
        }
      } catch (err) {
        console.error("Pending DOCX load failed", err);
        localStorage.removeItem(PENDING_DOCX_KEY);
      }
    }

    if (pendingHtml) {
      try {
        const payload = JSON.parse(pendingHtml) as {
          title?: string;
          html?: string;
        };
        localStorage.removeItem(PENDING_HTML_KEY);
        if (hostRef.current) {
          hostRef.current.innerHTML = payload.html || "<p><br></p>";
          setTitle(payload.title || initialTitle);
          setHasDocument(true);
          setLastSavedAt(null);
          setTimeout(makeEditable, 0);
          return;
        }
      } catch (err) {
        console.error("Pending HTML load failed", err);
        localStorage.removeItem(PENDING_HTML_KEY);
      }
    }

    restoreDraft();
  }, [initialTitle, makeEditable, renderDocxFile, restoreDraft]);

  useEffect(() => {
    const root = hostRef.current;
    if (!root) return;
    root.style.setProperty("--word-exact-zoom", String(zoom / 100));
  }, [zoom]);

  useEffect(() => {
    const onSelection = () => {
      const cell = getSelectionCell();
      if (cell && hostRef.current?.contains(cell)) {
        setSelectedCell(cell);
        hostRef.current
          .querySelectorAll(".word-active-cell")
          .forEach((el) => el.classList.remove("word-active-cell"));
        cell.classList.add("word-active-cell");
      }
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        onPrint ? onPrint() : window.print();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindMode("find");
        setFindOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setFindMode("replace");
        setFindOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveDraft]);

  const openFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await renderDocxFile(file);
    e.target.value = "";
  };

  const saveHtml = () => {
    const safe = cleanFileName(title);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${safe}</title></head><body>${getHtml()}</body></html>`;
    downloadTextFile(`${safe}.html`, html);
    setLastSavedAt(new Date());
  };
const getCleanHtmlForWordDownload = (root: HTMLElement | null) => {
  if (!root) return "";

  const clone = root.cloneNode(true) as HTMLElement;

  // Remove UI / editor-only elements
  clone.querySelectorAll(
    ".word-ruler, .word-find-box, script, style, button, input, textarea, select"
  ).forEach((el) => el.remove());

  // docx-preview wrapper ko unwrap karo
  clone.querySelectorAll<HTMLElement>(".docx-wrapper").forEach((wrapper) => {
    const parent = wrapper.parentNode;
    if (!parent) return;

    while (wrapper.firstChild) {
      parent.insertBefore(wrapper.firstChild, wrapper);
    }

    wrapper.remove();
  });

  // Sections ko normal Word pages jaisa readable block banao
  clone.querySelectorAll<HTMLElement>("section").forEach((section) => {
    section.removeAttribute("contenteditable");
    section.style.width = "auto";
    section.style.minHeight = "auto";
    section.style.height = "auto";
    section.style.margin = "0";
    section.style.padding = "0";
    section.style.boxShadow = "none";
    section.style.background = "white";
    section.style.color = "black";
    section.style.position = "relative";
    section.style.overflow = "visible";
  });

  // Editable attributes remove
  clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
    el.removeAttribute("contenteditable");
    el.removeAttribute("spellcheck");
    el.removeAttribute("data-gramm");
    el.removeAttribute("data-placeholder");

    // White text issue avoid
    const color = window.getComputedStyle(el).color;
    if (!el.style.color || el.style.color === "white" || el.style.color === "#fff") {
      el.style.color = color && color !== "rgba(0, 0, 0, 0)" ? color : "black";
    }

    el.style.maxWidth = "100%";
    el.style.boxSizing = "border-box";
  });

  // Tables ko Word ke andar visible boxes do
  clone.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
    table.style.borderCollapse = "collapse";
    table.style.width = table.style.width || "100%";
    table.style.border = "1px solid #000";
  });

  clone.querySelectorAll<HTMLTableCellElement>("td, th").forEach((cell) => {
    cell.style.border = "1px solid #000";
    cell.style.padding = cell.style.padding || "4px 6px";
    cell.style.verticalAlign = "top";
    cell.style.color = "black";
  });

  // Images preserve
  clone.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    img.style.maxWidth = "100%";
    img.style.height = "auto";
  });

  return clone.innerHTML;
};
const downloadAsEditedDocx = async () => {
  const safe = cleanFileName(title);

  const cleanBody = getCleanHtmlForWordDownload(hostRef.current);

  if (!cleanBody || cleanBody.replace(/<[^>]*>/g, "").trim().length === 0) {
    setError("Document empty aa raha hai. Pehle DOCX open/import karo, phir download karo.");
    return;
  }

  const html = buildWordCompatibleHtml(safe, cleanBody);

  try {
    const mod: any = await import("html-docx-js-typescript");

    const asBlob =
      mod.asBlob ||
      mod.default?.asBlob ||
      mod.default;

    if (!asBlob) {
      throw new Error("html-docx-js-typescript asBlob function nahi mila");
    }

    const blob = await asBlob(html, {
      orientation: "portrait",
      margins: {
        top: 720,
        right: 720,
        bottom: 720,
        left: 720,
      },
    });

    downloadBlob(`${safe}.docx`, blob as Blob);
    setError(null);
  } catch (err) {
    console.error(err);

    const fallbackBlob = new Blob([html], {
      type: "application/msword;charset=utf-8",
    });

    downloadBlob(`${safe}.doc`, fallbackBlob);
    setError(
      "Proper .docx generate nahi hua, fallback .doc download hua. Terminal me npm i html-docx-js-typescript run karke dev server restart karo."
    );
  }

  setLastSavedAt(new Date());
};
  const downloadOriginalDocx = () => {
    const file = lastFileRef.current;
    if (!file) return;
    downloadBlob(file.name || `${cleanFileName(title)}.docx`, file);
  };

  const insertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      exec(
        "insertHTML",
        `<img src="${reader.result}" style="max-width:100%;height:auto;" />`,
      );
      setStatsTick((v) => v + 1);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const insertTable = () => {
    const rows = Math.max(1, Math.min(30, Number(insertRows) || 2));
    const cols = Math.max(1, Math.min(20, Number(insertCols) || 2));
    const cells = Array.from({ length: rows })
      .map(() => {
        const tds = Array.from({ length: cols })
          .map(
            () =>
              `<td class="word-editable-cell" style="border:1px solid #6b7280;padding:6px;min-width:60px;vertical-align:top"><p><br></p></td>`,
          )
          .join("");
        return `<tr>${tds}</tr>`;
      })
      .join("");
    exec(
      "insertHTML",
      `<table class="word-doc-table" style="width:100%;border-collapse:collapse;table-layout:auto"><tbody>${cells}</tbody></table><p><br></p>`,
    );
    setTimeout(() => {
      normalizeTables();
      setStatsTick((v) => v + 1);
    }, 0);
  };

  const getActiveCell = () =>
    selectedCell && hostRef.current?.contains(selectedCell)
      ? selectedCell
      : getSelectionCell();

  const updateTable = (focusCell?: HTMLElement | null) => {
    normalizeTables();
    setStatsTick((v) => v + 1);
    if (focusCell) setTimeout(() => focusInside(focusCell), 0);
  };

  const addRow = (where: "above" | "below") => {
    const cell = getActiveCell();
    const row = cell?.parentElement as HTMLTableRowElement | null;
    if (!cell || !row) return;
    const cols = row.cells.length || 1;
    const newRow = document.createElement("tr");
    for (let i = 0; i < cols; i += 1)
      newRow.appendChild(
        createEmptyCell(cell.tagName.toLowerCase() === "th" ? "th" : "td"),
      );
    if (where === "above") row.parentElement?.insertBefore(newRow, row);
    else row.parentElement?.insertBefore(newRow, row.nextSibling);
    updateTable(newRow.cells[0] as HTMLElement);
  };

  const deleteRow = () => {
    const cell = getActiveCell();
    const row = cell?.parentElement as HTMLTableRowElement | null;
    const table = row?.closest("table") as HTMLTableElement | null;
    if (!cell || !row || !table) return;
    const nextFocus = (row.nextElementSibling?.querySelector("td,th") ||
      row.previousElementSibling?.querySelector("td,th")) as HTMLElement | null;
    if (table.rows.length <= 1) {
      table.remove();
      setSelectedCell(null);
      updateTable(null);
      return;
    }
    row.remove();
    updateTable(nextFocus);
  };

  const addColumn = (where: "left" | "right") => {
    const cell = getActiveCell();
    const table = cell?.closest("table") as HTMLTableElement | null;
    if (!cell || !table) return;
    const index = cellIndexInRow(cell) + (where === "right" ? 1 : 0);
    let focusTarget: HTMLElement | null = null;
    Array.from(table.rows).forEach((row) => {
      const refCell = row.cells[Math.min(index, row.cells.length - 1)] as
        | HTMLTableCellElement
        | undefined;
      const tag = refCell?.tagName.toLowerCase() === "th" ? "th" : "td";
      const newCell = createEmptyCell(tag as "td" | "th");
      const before = row.cells[index] || null;
      row.insertBefore(newCell, before);
      if (!focusTarget) focusTarget = newCell;
    });
    updateTable(focusTarget);
  };

  const deleteColumn = () => {
    const cell = getActiveCell();
    const table = cell?.closest("table") as HTMLTableElement | null;
    if (!cell || !table) return;
    const index = cellIndexInRow(cell);
    let nextFocus: HTMLElement | null = null;
    Array.from(table.rows).forEach((row) => {
      if (row.cells.length <= 1) return;
      const target = row.cells[index] || row.cells[row.cells.length - 1];
      if (!nextFocus)
        nextFocus = (target.nextElementSibling ||
          target.previousElementSibling) as HTMLElement | null;
      target?.remove();
    });
    updateTable(nextFocus);
  };

  const clearCell = () => {
    const cell = getActiveCell();
    if (!cell) return;
    cell.innerHTML = "<p><br></p>";
    updateTable(cell);
  };

  const toggleHeaderRow = () => {
    const cell = getActiveCell();
    const row = cell?.parentElement as HTMLTableRowElement | null;
    if (!row) return;
    const shouldHeader = Array.from(row.cells).some(
      (c) => c.tagName.toLowerCase() === "td",
    );
    Array.from(row.cells).forEach((oldCell) => {
      const newCell = document.createElement(
        shouldHeader ? "th" : "td",
      ) as HTMLTableCellElement;
      newCell.innerHTML = oldCell.innerHTML || "<p><br></p>";
      Array.from(oldCell.attributes).forEach((attr) =>
        newCell.setAttribute(attr.name, attr.value),
      );
      newCell.classList.add("word-editable-cell");
      oldCell.replaceWith(newCell);
    });
    updateTable(row.cells[0] as HTMLElement | null);
  };

  const findNext = () => {
    if (!findText) return;
    window.find(findText, false, false, true, false, false, false);
  };

  const replaceOne = () => {
    if (!findText) return;
    const sel = window.getSelection()?.toString();
    if (sel !== findText) findNext();
    exec("insertText", replaceText);
    setStatsTick((v) => v + 1);
  };

  const replaceAll = () => {
    if (!findText || !hostRef.current) return;
    const walker = document.createTreeWalker(
      hostRef.current,
      NodeFilter.SHOW_TEXT,
    );
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    nodes.forEach((n) => {
      n.nodeValue = (n.nodeValue || "").split(findText).join(replaceText);
    });
    setStatsTick((v) => v + 1);
  };

  const Tool = ({
    children,
    onClick,
    disabled,
    title: t,
    small = false,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
    small?: boolean;
  }) => (
    <button
      className={`word-tool-btn ${small ? "compact" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={t}
    >
      {children}
    </button>
  );

  const renderTabContent = () => {
    const disabled = !hasDocument;
    const noCell = disabled || !selectedCell;

    if (activeTab === "file")
      return (
        <>
          <Tool onClick={() => fileInputRef.current?.click()} title="Open DOCX">
            <FileUp size={17} />
            <span>Open</span>
          </Tool>
          <Tool onClick={saveDraft} disabled={disabled} title="Save draft">
            <Save size={17} />
            <span>Draft</span>
          </Tool>
          <Tool
            onClick={downloadAsEditedDocx}
            disabled={disabled}
            title="Download edited DOCX"
          >
            <FileDown size={17} />
            <span>Edited DOCX</span>
          </Tool>
          <Tool
            onClick={downloadOriginalDocx}
            disabled={disabled || !lastFileRef.current}
            title="Download original DOCX"
          >
            <FileDown size={17} />
            <span>Original</span>
          </Tool>
          <Tool onClick={saveHtml} disabled={disabled} title="Download HTML">
            <Save size={17} />
            <span>HTML</span>
          </Tool>
          <Tool
            onClick={() => onPrint ? onPrint() : window.print()}
            disabled={disabled}
            title="Print"
          >
            <Printer size={17} />
            <span>Print/PDF</span>
          </Tool>
          <Tool
            onClick={() => setSubmitOpen(true)}
            disabled={disabled}
            title="Submit"
          >
            <Send size={17} />
            <span>Submit</span>
          </Tool>
        </>
      );

    if (activeTab === "insert")
      return (
        <>
          <Tool
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            title="Insert image"
          >
            <ImageIcon size={17} />
            <span>Image</span>
          </Tool>
          <div className="word-table-picker">
            <span>Rows</span>
            <input
              type="number"
              min={1}
              max={30}
              value={insertRows}
              onChange={(e) => setInsertRows(Number(e.target.value))}
              disabled={disabled}
            />
            <span>Cols</span>
            <input
              type="number"
              min={1}
              max={20}
              value={insertCols}
              onChange={(e) => setInsertCols(Number(e.target.value))}
              disabled={disabled}
            />
          </div>
          <Tool onClick={insertTable} disabled={disabled} title="Insert table">
            <Table size={17} />
            <span>Table</span>
          </Tool>
          <Tool
            onClick={() => exec("insertHorizontalRule")}
            disabled={disabled}
            title="Line"
          >
            <Minus size={17} />
            <span>Line</span>
          </Tool>
          <Tool
            onClick={() =>
              exec("insertHTML", '<div style="page-break-after:always"></div>')
            }
            disabled={disabled}
            title="Page break"
          >
            <span className="text-lg">↵</span>
            <span>Break</span>
          </Tool>
        </>
      );

    if (activeTab === "layout")
      return (
        <>
          <label className="word-mini-label">
            <input
              type="checkbox"
              checked={showRuler}
              onChange={() => setShowRuler((v) => !v)}
            />{" "}
            Ruler
          </label>
          <label className="word-mini-label">
            <input
              type="checkbox"
              checked={showGridlines}
              onChange={() => setShowGridlines((v) => !v)}
            />{" "}
            Gridlines
          </label>
          <label className="word-mini-label">
            <input
              type="checkbox"
              checked={showTableBoxes}
              onChange={() => setShowTableBoxes((v) => !v)}
            />{" "}
            Table boxes
          </label>
          <Tool
            onClick={() => setZoom(100)}
            disabled={disabled}
            title="Actual size"
          >
            <ZoomIn size={17} />
            <span>100%</span>
          </Tool>
        </>
      );

    if (activeTab === "table")
      return (
        <>
          <Tool
            onClick={() => addRow("above")}
            disabled={noCell}
            title="Add row above"
          >
            <Plus size={17} />
            <span>Row ↑</span>
          </Tool>
          <Tool
            onClick={() => addRow("below")}
            disabled={noCell}
            title="Add row below"
          >
            <Plus size={17} />
            <span>Row ↓</span>
          </Tool>
          <Tool onClick={deleteRow} disabled={noCell} title="Delete row">
            <Minus size={17} />
            <span>Row</span>
          </Tool>
          <div className="word-sep" />
          <Tool
            onClick={() => addColumn("left")}
            disabled={noCell}
            title="Add column left"
          >
            <Plus size={17} />
            <span>Col ←</span>
          </Tool>
          <Tool
            onClick={() => addColumn("right")}
            disabled={noCell}
            title="Add column right"
          >
            <Plus size={17} />
            <span>Col →</span>
          </Tool>
          <Tool onClick={deleteColumn} disabled={noCell} title="Delete column">
            <Minus size={17} />
            <span>Col</span>
          </Tool>
          <div className="word-sep" />
          <Tool
            onClick={toggleHeaderRow}
            disabled={noCell}
            title="Toggle header row"
          >
            <Bold size={17} />
            <span>Header</span>
          </Tool>
          <Tool
            onClick={clearCell}
            disabled={noCell}
            title="Clear selected cell"
          >
            <span className="text-base">⌫</span>
            <span>Cell</span>
          </Tool>
          <span className="word-table-hint">
            Table ke andar click karo, phir row/column add-minus chalega.
          </span>
        </>
      );

    if (activeTab === "view")
      return (
        <>
          <label className="word-mini-label">
            <input
              type="checkbox"
              checked={showStatusBar}
              onChange={() => setShowStatusBar((v) => !v)}
            />{" "}
            Status bar
          </label>
          <Tool
            onClick={() => setFindMode("find") || setFindOpen(true)}
            disabled={disabled}
            title="Find"
          >
            <Search size={17} />
            <span>Find</span>
          </Tool>
          <Tool
            onClick={() => setFindMode("replace") || setFindOpen(true)}
            disabled={disabled}
            title="Replace"
          >
            <Search size={17} />
            <span>Replace</span>
          </Tool>
          <Tool
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            disabled={disabled}
            small
            title="Zoom out"
          >
            <Minus size={17} />
          </Tool>
          <span className="min-w-[46px] text-center text-xs self-center">
            {zoom}%
          </span>
          <Tool
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            disabled={disabled}
            small
            title="Zoom in"
          >
            <Plus size={17} />
          </Tool>
        </>
      );

    return (
      <>
        <Tool
          onClick={() => exec("undo")}
          disabled={disabled}
          small
          title="Undo"
        >
          <Undo2 size={17} />
        </Tool>
        <Tool
          onClick={() => exec("redo")}
          disabled={disabled}
          small
          title="Redo"
        >
          <Redo2 size={17} />
        </Tool>
        <div className="word-sep" />
        <Tool
          onClick={() => exec("bold")}
          disabled={disabled}
          small
          title="Bold"
        >
          <Bold size={17} />
        </Tool>
        <Tool
          onClick={() => exec("italic")}
          disabled={disabled}
          small
          title="Italic"
        >
          <Italic size={17} />
        </Tool>
        <Tool
          onClick={() => exec("underline")}
          disabled={disabled}
          small
          title="Underline"
        >
          <Underline size={17} />
        </Tool>
        <select
          className="word-select"
          disabled={disabled}
          onChange={(e) => exec("fontName", e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Font
          </option>
          <option>Calibri</option>
          <option>Times New Roman</option>
          <option>Arial</option>
          <option>Verdana</option>
        </select>
        <select
          className="word-select w-[70px]"
          disabled={disabled}
          onChange={(e) => exec("fontSize", e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Size
          </option>
          <option value="1">8</option>
          <option value="2">10</option>
          <option value="3">12</option>
          <option value="4">14</option>
          <option value="5">18</option>
          <option value="6">24</option>
          <option value="7">36</option>
        </select>
        <input
          type="color"
          className="word-color"
          disabled={disabled}
          onChange={(e) => exec("foreColor", e.target.value)}
          title="Text color"
        />
        <input
          type="color"
          className="word-color"
          disabled={disabled}
          onChange={(e) => exec("hiliteColor", e.target.value)}
          title="Highlight color"
        />
        <div className="word-sep" />
        <Tool
          onClick={() => exec("justifyLeft")}
          disabled={disabled}
          small
          title="Left"
        >
          <AlignLeft size={17} />
        </Tool>
        <Tool
          onClick={() => exec("justifyCenter")}
          disabled={disabled}
          small
          title="Center"
        >
          <AlignCenter size={17} />
        </Tool>
        <Tool
          onClick={() => exec("justifyRight")}
          disabled={disabled}
          small
          title="Right"
        >
          <AlignRight size={17} />
        </Tool>
        <Tool
          onClick={() => exec("insertUnorderedList")}
          disabled={disabled}
          small
          title="Bullets"
        >
          <List size={17} />
        </Tool>
        <Tool
          onClick={() => exec("insertOrderedList")}
          disabled={disabled}
          small
          title="Numbers"
        >
          <ListOrdered size={17} />
        </Tool>
        <Tool
          onClick={() => exec("outdent")}
          disabled={disabled}
          small
          title="Outdent"
        >
          <span>←</span>
        </Tool>
        <Tool
          onClick={() => exec("indent")}
          disabled={disabled}
          small
          title="Indent"
        >
          <span>→</span>
        </Tool>
        <div className="word-sep" />
        <Tool
          onClick={() => setFindMode("find") || setFindOpen(true)}
          disabled={disabled}
          title="Find"
        >
          <Search size={17} />
          <span>Find</span>
        </Tool>
        <Tool
          onClick={() =>
            lastFileRef.current && renderDocxFile(lastFileRef.current)
          }
          disabled={disabled || !lastFileRef.current}
          title="Reload original"
        >
          <RotateCcw size={17} />
          <span>Reload</span>
        </Tool>
      </>
    );
  };

  return (
    <div
      className={`word-exact-app ${initialHtml !== undefined ? 'h-full' : 'h-screen'} min-h-0 flex flex-col bg-[#e8e8e8] text-[#1f1f1f] ${showTableBoxes ? "word-show-table-borders" : ""}`}
      style={initialHtml !== undefined ? { height: '100%', minHeight: 0 } : undefined}
    >
      <div className="bg-[#F3F3F3] border-b border-gray-300 flex-shrink-0 print:hidden">
        <div className="flex items-center h-[32px] bg-[#185ABD] px-3 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M15.5 1.5v13h-15v-13h15zm-1 1h-13v11h13v-11z" />
              <path d="M4.5 5.5h2l1 3 1-3h2l-2 5h-2l-2-5z" />
            </svg>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-white text-xs border-none outline-none px-1 py-0.5 rounded hover:bg-white/10 focus:bg-white/20 max-w-[340px]"
            />
          </div>
          <button
            onClick={saveDraft}
            className="text-white/90 text-[11px] px-2 py-1 rounded hover:bg-white/10"
          >
            Save
          </button>
          <button
            onClick={() => setSubmitOpen(true)}
            disabled={!hasDocument}
            className="text-white text-[11px] px-3 py-1 rounded bg-white/15 hover:bg-white/25 disabled:opacity-40"
          >
            Submit
          </button>
        </div>
        <div className="flex items-center h-[30px] bg-[#F3F3F3] border-b border-gray-300 px-1">
          {(
            ["file", "home", "insert", "layout", "table", "view"] as TabId[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-xs font-medium transition-colors rounded-t capitalize ${activeTab === tab ? "bg-white text-[#185ABD] border-t-2 border-t-[#185ABD] border-x border-gray-300" : "text-gray-600 hover:bg-gray-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bg-white border-b border-gray-300 min-h-[54px] flex items-center gap-1 px-2 py-1 overflow-x-auto">
          {renderTabContent()}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={openFile}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={insertImage}
        className="hidden"
      />

      <div className="word-exact-scroll flex-1 min-h-0 overflow-auto relative" style={{ minHeight: 0, flex: '1 1 0%', overflow: 'auto' }}>
        {showRuler && hasDocument && (
          <div className="word-ruler print:hidden" />
        )}
        {findOpen && (
          <div className="word-find-box print:hidden">
            <div className="flex items-center justify-between mb-2">
              <b>{findMode === "replace" ? "Find & Replace" : "Find"}</b>
              <button onClick={() => setFindOpen(false)}>×</button>
            </div>
            <input
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find text"
              className="word-find-input"
            />
            {findMode === "replace" && (
              <input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with"
                className="word-find-input"
              />
            )}
            <div className="flex gap-2 mt-2">
              <button className="word-small-blue" onClick={findNext}>
                Find
              </button>
              {findMode === "replace" && (
                <>
                  <button className="word-small-blue" onClick={replaceOne}>
                    Replace
                  </button>
                  <button className="word-small-blue" onClick={replaceAll}>
                    All
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {!hasDocument && !loading && (
          <div className="h-full flex items-center justify-center p-6 print:hidden">
            <div className="bg-white rounded-xl shadow p-8 max-w-md text-center border border-gray-200">
              <div className="text-lg font-semibold mb-2">DOCX open karo</div>
              <p className="text-sm text-gray-600 mb-5">
                Exact DOCX view/edit mode + full ribbon + table row/column
                controls.
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => fileInputRef.current?.click()}
              >
                Open DOCX
              </button>
            </div>
          </div>
        )}
        {loading && (
          <div className="h-full flex items-center justify-center text-sm text-gray-600 print:hidden">
            DOCX loading...
          </div>
        )}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded print:hidden">
            {error}
          </div>
        )}
        <div
          ref={hostRef}
          onInput={() => {
            normalizeTables();
            setStatsTick((v) => v + 1);
            if (onContentChange) onContentChange(hostRef.current?.innerHTML || "");
          }}
          onMouseUp={() => setSelectedCell(getSelectionCell())}
          onKeyUp={() => setSelectedCell(getSelectionCell())}
          className={`word-exact-host ${showGridlines ? "word-gridlines" : ""}`}
        />
      </div>

      {showStatusBar && (
        <div className="h-[26px] bg-[#185ABD] text-white flex items-center justify-between px-3 text-[11px] select-none flex-shrink-0 print:hidden gap-3">
          <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <span className="font-medium">
              {lastSavedAt
                ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Ready"}
            </span>
            <span>
              Page {stats.pages} of {stats.pages}
            </span>
            <span>{stats.words} words</span>
            <span>{stats.chars} characters</span>
            <span>{stats.charsNoSpaces} characters (no spaces)</span>
            <span>{stats.lines} lines</span>
            {selectedCell && <span>Table cell selected</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="hover:bg-white/20 rounded p-0.5"
            >
              <Minus size={14} />
            </button>
            <input
              type="range"
              min={50}
              max={200}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-[100px] h-1 accent-white cursor-pointer"
            />
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="hover:bg-white/20 rounded p-0.5"
            >
              <Plus size={14} />
            </button>
            <span className="w-[40px] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(100)}
              className="hover:bg-white/20 rounded p-0.5"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      )}
      {!initialHtml && (
        <Suspense fallback={null}>
          <SubmitDialog
            open={submitOpen}
            onClose={() => setSubmitOpen(false)}
            documentTitle={title}
            documentHtml={getHtml()}
          />
        </Suspense>
      )}
    </div>
  );
};

export default WordExactClientEditor;
