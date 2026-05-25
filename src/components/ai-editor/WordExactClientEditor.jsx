import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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

import SubmitDialog from "./SubmitDialog";

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

const LS_KEY = "word_exact_client_editor_draft_v2";
const PENDING_DOCX_KEY = "word_exact_pending_docx_v1";
const PENDING_HTML_KEY = "word_exact_pending_html_v1";

const exec = (command, value) => {
  document.execCommand(command, false, value);
};

const downloadBlob = (filename, blob) => {
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
  filename,
  content,
  type = "text/html;charset=utf-8"
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

const cleanFileName = (name) =>
  (name || "document").replace(/[\\/:*?"<>|]+/g, "-");

const dataUrlToFile = (dataUrl, filename, mimeType) => {
  const parts = dataUrl.split(",");

  const header = parts[0] || "";
  const data = parts[1] || "";

  const resolvedMime =
    header.match(/data:([^;]+)/)?.[1] || mimeType;

  const binary = atob(data);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, {
    type: resolvedMime,
  });
};

const WordExactClientEditor = ({
  initialTitle = "Untitled Document",
}) => {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const hostRef = useRef(null);
  const lastFileRef = useRef(null);

  const [title, setTitle] = useState(initialTitle);
  const [activeTab, setActiveTab] = useState("home");
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);
  const [error, setError] = useState(null);

  const renderDocxFile = useCallback(async (file) => {
    if (!hostRef.current) return;

    setLoading(true);
    setError(null);

    try {
      hostRef.current.innerHTML = "";

      await renderAsync(
        file,
        hostRef.current,
        undefined,
        DOCX_OPTIONS
      );

      lastFileRef.current = file;

      setTitle(
        file.name.replace(/\.docx$/i, "") || "Document"
      );

      setHasDocument(true);
    } catch (err) {
      console.error(err);

      setError(
        "DOCX open nahi ho paya. File corrupt/protected ho sakti hai."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getHtml = useCallback(() => {
    return hostRef.current?.innerHTML || "";
  }, []);

  const saveDraft = useCallback(() => {
    const payload = {
      title,
      html: getHtml(),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      LS_KEY,
      JSON.stringify(payload)
    );
  }, [getHtml, title]);

  useEffect(() => {
    const pendingDocx =
      localStorage.getItem(PENDING_DOCX_KEY);

    if (pendingDocx) {
      try {
        const payload = JSON.parse(pendingDocx);

        if (payload.dataUrl) {
          localStorage.removeItem(PENDING_DOCX_KEY);

          const file = dataUrlToFile(
            payload.dataUrl,
            payload.title || "document.docx",
            payload.mimeType ||
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );

          renderDocxFile(file);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [renderDocxFile]);

  const openFile = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    await renderDocxFile(file);

    e.target.value = "";
  };

  const saveHtml = () => {
    const safe = cleanFileName(title);

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${safe}</title>
      </head>
      <body>
        ${getHtml()}
      </body>
      </html>
    `;

    downloadTextFile(`${safe}.html`, html);
  };

  const downloadOriginalDocx = () => {
    const file = lastFileRef.current;

    if (!file) return;

    downloadBlob(
      file.name || `${cleanFileName(title)}.docx`,
      file
    );
  };

  const insertImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      exec(
        "insertHTML",
        `<img src="${reader.result}" style="max-width:100%;height:auto;" />`
      );
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  return (
    <div className="word-exact-app h-screen flex flex-col bg-[#e8e8e8]">
      <div className="bg-[#F3F3F3] border-b border-gray-300">
        <div className="flex items-center h-[32px] bg-[#185ABD] px-3 gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-white text-xs border-none outline-none"
          />

          <button
            onClick={saveDraft}
            className="text-white text-xs"
          >
            Save
          </button>
        </div>

        <div className="flex items-center h-[30px] bg-[#F3F3F3] border-b border-gray-300 px-1">
          {[
            "file",
            "home",
            "insert",
            "layout",
            "table",
            "view",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-xs capitalize ${
                activeTab === tab
                  ? "bg-white text-[#185ABD]"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white border-b border-gray-300 min-h-[54px] flex items-center gap-2 px-2 py-1">
          <button
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="border px-2 py-1 rounded"
          >
            <FileUp size={16} />
          </button>

          <button
            onClick={saveHtml}
            disabled={!hasDocument}
            className="border px-2 py-1 rounded"
          >
            <Save size={16} />
          </button>

          <button
            onClick={downloadOriginalDocx}
            disabled={!lastFileRef.current}
            className="border px-2 py-1 rounded"
          >
            <FileDown size={16} />
          </button>

          <button
            onClick={() =>
              imageInputRef.current?.click()
            }
            className="border px-2 py-1 rounded"
          >
            <ImageIcon size={16} />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
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

      <div className="flex-1 overflow-auto relative">
        {!hasDocument && !loading && (
          <div className="h-full flex items-center justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              Open DOCX
            </button>
          </div>
        )}

        {loading && (
          <div className="h-full flex items-center justify-center">
            DOCX loading...
          </div>
        )}

        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <div
          ref={hostRef}
          className="word-exact-host"
        />
      </div>

      <SubmitDialog
        open={false}
        onClose={() => {}}
        documentTitle={title}
        documentHtml={getHtml()}
      />
    </div>
  );
};

export default WordExactClientEditor;
