import { useEffect, useMemo, useState, useRef } from "react";
import { RichTextEditorComponent, Toolbar, Link, Image, HtmlEditor, Table, QuickToolbar, PasteCleanup, ImportExport, FormatPainter, EmojiPicker, Audio, Video, Count } from '@syncfusion/ej2-react-richtexteditor';
import { Inject as RteInject } from '@syncfusion/ej2-react-richtexteditor';
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import JsBarcode from "jsbarcode";

const CaseTestDataModal = ({
  open,
  onClose,
  caseId,
  testId,
  PatientName,
  formData2,
  htmlContent,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ htmlContent: "" });
  const [editId, setEditId] = useState(null);
  const rteRef = useRef(null);

  /* ================= BARCODE ================= */
  const barcodeImg = useMemo(() => {
    if (!formData2?.CaseNo) return "";
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, formData2.CaseNo, {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: true,
    });
    return canvas.toDataURL("image/png");
  }, [formData2?.CaseNo]);

  const [doctorsMap, setDoctorsMap] = useState({});

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors");
      if (res.data.success) {
        let data = res.data.data;
        let hashMap = {};
        for (let i = 0; i < data.length; i++) {
          hashMap[data[i].DoctorId] = data[i].Doctor;
        }
        setDoctorsMap(hashMap);
      } else {
        setDoctorsMap({});
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  /* ================= TOOLBAR CONFIG ================= */
  const rteToolbarSettings = {
    items: [
      'Undo', 'Redo', '|',
      'ImportWord', 'ExportWord', 'ExportPdf', '|',
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
      'Formats', 'Alignments', 'Blockquote', '|',
      'NumberFormatList', 'BulletFormatList', '|',
      'Outdent', 'Indent', '|',
      'CreateLink', 'Image', 'CreateTable', '|',
      'FormatPainter', 'ClearFormat', '|',
      'EmojiPicker', '|',
      'SourceCode', 'FullScreen'
    ],
  };

  const rteImportWord = {
    serviceUrl: 'https://services.syncfusion.com/react/production/api/RichTextEditor/ImportFromWord',
  };

  const rteExportWord = {
    serviceUrl: 'https://services.syncfusion.com/react/production/api/RichTextEditor/ExportToDocx',
    fileName: 'test-report.docx',
  };

  const rteExportPdf = {
    serviceUrl: 'https://services.syncfusion.com/react/production/api/RichTextEditor/ExportToPdf',
    fileName: 'test-report.pdf',
  };

  const rteInsertImageSettings = {
    saveUrl: 'https://services.syncfusion.com/react/production/api/RichTextEditor/SaveFile',
    path: 'https://services.syncfusion.com/react/production/api/RichTextEditor/GetImage',
  };

  const handleEditorChange = () => {
    if (rteRef.current) {
      setFormData({ htmlContent: rteRef.current.value });
    }
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (open && caseId && testId) {
      fetchAndLoad();
    }
  }, [open, caseId, testId]);

  const fetchAndLoad = async () => {
    try {
      const res = await axiosInstance.get(
        `/case-test-data?caseId=${caseId}&testId=${testId}`
      );
      const list = res.data.data || [];
      setRecords(list);

      if (list.length > 0) {
        const latest = list[list.length - 1];
        setEditId(latest.id);
        setFormData({ htmlContent: latest.html_content || "" });
      } else {
        setEditId(null);
        setFormData({ htmlContent: htmlContent || "" });
      }
    } catch {
      toast.error("Failed to load data");
      setEditId(null);
      setFormData({ htmlContent: htmlContent || "" });
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await axiosInstance.get(
        `/case-test-data?caseId=${caseId}&testId=${testId}`
      );
      setRecords(res.data.data || []);
    } catch {
      toast.error("Failed to load data");
    }
  };

  /* ================= SAVE ================= */
  const handleSubmit = async () => {
    if (!formData.htmlContent.trim()) {
      toast.warn("Content required");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("caseId", caseId);
      fd.append("testId", testId);
      fd.append("htmlContent", formData.htmlContent);

      if (editId) {
        await axiosInstance.put(`/case-test-data/${editId}`, fd);
        toast.success("Updated successfully");
      } else {
        const res = await axiosInstance.post(`/case-test-data`, fd);
        toast.success("Saved successfully");
        const newId = res.data?.data?.id;
        if (newId) setEditId(newId);
      }

      fetchRecords();
    } catch {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRINT ================= */
  const handlePrint = () => {
    if (!records?.length) {
      toast.warn("No content to print");
      return;
    }

    const contentHtml = (rteRef.current ? rteRef.current.value : formData.htmlContent) || records?.at(-1)?.html_content || "";

    const pName = formData2?.PatientName || PatientName || "";
    const age = (formData2?.Age || "") + (formData2?.AgeType || "");
    const cNo = formData2?.CaseNo || "";
    const sex = formData2?.Sex || "";
    const refBy = doctorsMap[formData2?.DoctorId || ""] || "";
    const bDate = new Date().toISOString().split("T")[0];
    const addr = [formData2?.Add1, formData2?.Add2, formData2?.Add3].filter(Boolean).join(", ");
    const rDate = records[0]?.created_at?.split("T")[0] || "";

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:10mm}
body{padding:18mm 8mm 8mm 8mm;font-family:"Times New Roman",serif;font-size:13px;color:#000}
.bc{text-align:right;margin-bottom:4px}
.bc img{height:45px}
.pi{width:100%;border:1px solid #000;border-collapse:collapse;font-size:11px}
.pi td{border:none;padding:2px 4px}
hr.sep{border:none;border-top:1px solid #000;margin:6px 0}
.cc{font-family:"Times New Roman",serif;font-size:13px;line-height:1.6}
.cc p{margin:0 0 3px}
.cc strong{font-weight:bold}
.cc table{width:100%;border-collapse:collapse;margin:8px 0}
.cc table td,.cc table th{border:1px solid #bfbfbf;padding:4px 6px;vertical-align:middle}
.cc h2{font-size:1.4em;margin:6px 0}
.cc h3{font-size:1.2em;margin:5px 0}
.cc ul,.cc ol{padding-left:18px;margin:3px 0}
.cc img{max-width:100%;height:auto}
</style>
</head>
<body>
<div class="bc"><img src="${barcodeImg}" /></div>
<table class="pi">
<tr><td style="width:13%"><b>Patient</b></td><td style="width:37%">: ${pName}</td><td style="width:13%"><b>Age</b></td><td style="width:37%">: ${age}</td></tr>
<tr><td><b>Case No</b></td><td>: ${cNo}</td><td><b>Sex</b></td><td>: ${sex}</td></tr>
<tr><td><b>Ref. By</b></td><td>: ${refBy}</td><td><b>Billing Date</b></td><td>: ${bDate}</td></tr>
<tr><td><b>Address</b></td><td>: ${addr}</td><td><b>Report Date</b></td><td>: ${rDate}</td></tr>
</table>
<hr class="sep">
<div class="cc">${contentHtml}</div>
</body>
</html>`);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  if (!open) return null;

  return (
    <>
      {/* ================= BACKDROP ================= */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999998,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      />

      {/* ================= MODAL ================= */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "80%",
          zIndex: 999999,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
        }}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
          <h6 className="m-0 fw-bold">
            Case: {caseId} | Test: {testId} | {PatientName}
          </h6>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {/* BODY - Editor */}
        <div className="flex-grow-1 p-2" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="mb-1">
            <strong className="small">✏️ Editor</strong>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <RichTextEditorComponent
              ref={rteRef}
              value={formData.htmlContent || htmlContent || ""}
              change={handleEditorChange}
              toolbarSettings={rteToolbarSettings}
              importWord={rteImportWord}
              exportWord={rteExportWord}
              exportPdf={rteExportPdf}
              insertImageSettings={rteInsertImageSettings}
              height="100%"
              enableResize={false}
            >
              <RteInject services={[Toolbar, Link, Image, HtmlEditor, Table, QuickToolbar, PasteCleanup, ImportExport, FormatPainter, EmojiPicker, Audio, Video, Count]} />
            </RichTextEditorComponent>
          </div>
        </div>

        {/* FOOTER */}
        <div className="d-flex justify-content-end gap-2 px-3 py-2 border-top bg-light">
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {editId ? "Update" : "Save"}
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            Print
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default CaseTestDataModal;
