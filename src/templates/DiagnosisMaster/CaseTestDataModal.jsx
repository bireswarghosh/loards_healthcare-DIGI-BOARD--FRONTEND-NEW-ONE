












// show doctor sign in descriptive test in CaseTestDataModal.jsx



import { useEffect, useMemo, useState, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import JsBarcode from "jsbarcode";
import DocumentEditor from "../../components/editor/DocumentEditor";

const CaseTestDataModal = ({
  open,
  onClose,
  caseId,
  testId,
  SubDepartmentId,
  PatientName,
  formData2,
  htmlContent,
}) => {
  console.log("Sub dep :", SubDepartmentId)
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ htmlContent: "" });
  const [editId, setEditId] = useState(null);
  const editorContentRef = useRef("");
  const [editorKey, setEditorKey] = useState(0);
  const [editorInitHtml, setEditorInitHtml] = useState("");
  const [printData, setPrintData] = useState({});

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = dateStr.split("T")[0];
    const [y, m, dd] = d.split("-");
    return `${dd}-${m}-${y}`;
  };

  const buildPatientHeaderHtml = () => {
    const pName = formData2?.PatientName || PatientName || "";
    const age = (formData2?.Age || "") + (formData2?.AgeType || "");
    const cNo = formData2?.CaseNo || "";
    const sex = formData2?.Sex || "";
    const bDate = formData2?.CaseDate ? formatDate(formData2.CaseDate) : "";
    const rDate = formData2?.ReportDate ? formatDate(formData2.ReportDate) : formatDate(new Date().toISOString());
    const refBy = doctorsMap[formData2?.DoctorId] || "";
    return `<div style="text-align:right;margin-bottom:4px"><img src="${barcodeImg}" style="height:45px" /></div><table style="width:100%;border:1px solid #000;border-collapse:collapse;font-size:16px;font-weight:900;-webkit-text-stroke:1px #000;margin-bottom:8px"><tr><td style="padding:4px 6px;width:13%;border:none"><b>Patient</b></td><td style="padding:4px 6px;width:20%;border:none">: ${pName}</td><td style="padding:4px 6px;width:10%;border:none"><b>Age</b></td><td style="padding:4px 6px;width:20%;border:none">: ${age}</td><td style="padding:4px 6px;width:10%;border:none"><b>Sex</b></td><td style="padding:4px 6px;width:27%;border:none">: ${sex}</td></tr><tr><td style="padding:4px 6px;border:none"><b>Case No</b></td><td style="padding:4px 6px;border:none">: ${cNo}</td><td style="padding:4px 6px;border:none"><b>Billing Date</b></td><td colspan="3" style="padding:4px 6px;border:none">: ${bDate}</td></tr><tr><td style="padding:4px 6px;border:none"><b>Ref. By</b></td><td style="padding:4px 6px;border:none">: ${refBy}</td><td style="padding:4px 6px;border:none"><b>Report Date</b></td><td colspan="3" style="padding:4px 6px;border:none">: ${rDate}</td></tr></table><hr style="border:none;border-top:2px solid #000;margin:8px 0" />`;
  };

  const buildEditorContent = (bodyContent) => {
    return buildPatientHeaderHtml() + (bodyContent || "");
  };


const getSignatureBase64 = (signatureObj) => {
  if (!signatureObj || !signatureObj.data || !Array.isArray(signatureObj.data)) return "";
  const binary = new Uint8Array(signatureObj.data);
  if (binary.length < 4) return "";
  let binaryString = "";
  for (let i = 0; i < binary.length; i++) {
    binaryString += String.fromCharCode(binary[i]);
  }
  const mime = (binary[0] === 0x89 && binary[1] === 0x50) ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${btoa(binaryString)}`;
};

let pathologist = JSON.parse(localStorage.getItem("SelectedPathologistData")) || {};
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



  /* ================= INIT PRINT DATA ================= */
  useEffect(() => {
    setPrintData({
      PatientName: formData2?.PatientName || PatientName || "",
      Age: (formData2?.Age || "") + (formData2?.AgeType || ""),
      CaseNo: formData2?.CaseNo || "",
      Sex: formData2?.Sex || "",
      ReferredBy: "",
      BillingDate: formData2?.CaseDate ? formatDate(formData2.CaseDate) : "",
      ReportDate: formData2?.ReportDate ? formatDate(formData2.ReportDate) : "",
    });
  }, [open, formData2, PatientName]);

  // Update ReferredBy once doctors loaded
  useEffect(() => {
    if (Object.keys(doctorsMap).length && formData2?.DoctorId) {
      setPrintData((prev) => ({ ...prev, ReferredBy: prev.ReferredBy || doctorsMap[formData2.DoctorId] || "" }));
    }
  }, [doctorsMap, formData2?.DoctorId]);

  // Update ReportDate once records loaded
  useEffect(() => {
    if (records.length) {
      setPrintData((prev) => ({ ...prev, ReportDate: prev.ReportDate || formatDate(records[0]?.created_at) || "" }));
    }
  }, [records]);

  // Rebuild editor header when doctorsMap loads (so Ref. By, dates etc. are filled)
  useEffect(() => {
    if (Object.keys(doctorsMap).length && editorInitHtml) {
      const body = editorContentRef.current || formData.htmlContent || "";
      const rebuilt = buildEditorContent(body);
      setEditorInitHtml(rebuilt);
      setEditorKey((k) => k + 1);
    }
  }, [doctorsMap]);

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
        const content = latest.html_content || "";
        const withHeader = buildEditorContent(content);
        setFormData({ htmlContent: content });
        editorContentRef.current = content;
        setEditorInitHtml(withHeader);
      } else {
        setEditId(null);
        const content = htmlContent || "";
        const withHeader = buildEditorContent(content);
        setFormData({ htmlContent: content });
        editorContentRef.current = content;
        setEditorInitHtml(withHeader);
      }
      setEditorKey((k) => k + 1);
    } catch {
      toast.error("Failed to load data");
      setEditId(null);
      const content = htmlContent || "";
      const withHeader = buildEditorContent(content);
      setFormData({ htmlContent: content });
      editorContentRef.current = content;
      setEditorInitHtml(withHeader);
      setEditorKey((k) => k + 1);
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
  // Strip the baked-in patient header so only body content is stored in DB
  const stripHeader = (html) => {
    if (!html) return html;
    const hrIdx = html.indexOf('<hr');
    if (hrIdx >= 0) {
      const closeIdx = html.indexOf('>', hrIdx);
      if (closeIdx >= 0) return html.substring(closeIdx + 1);
    }
    return html;
  };

  const handleSubmit = async () => {
    const currentHtml = editorContentRef.current || formData.htmlContent;
    if (!currentHtml.trim()) {
      toast.warn("Content required");
      return;
    }
    // Save only the body (without header) so header doesn't duplicate
    const bodyOnly = stripHeader(currentHtml);
    setFormData({ htmlContent: bodyOnly });
    editorContentRef.current = bodyOnly;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("caseId", caseId);
      fd.append("testId", testId);
      fd.append("htmlContent", bodyOnly);

      if (editId) {
        await axiosInstance.put(`/case-test-data/${editId}`, fd);
        toast.success("Updated successfully");
      } else {
        const res = await axiosInstance.post(`/case-test-data`, fd);
        toast.success("Saved successfully");
        const newId = res.data?.data?.id;
        if (newId) setEditId(newId);
      }

      // Rebuild editor with fresh header + saved body
      const rebuilt = buildEditorContent(bodyOnly);
      setEditorInitHtml(rebuilt);
      setEditorKey((k) => k + 1);
      fetchRecords();
    } catch {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BUILD PRINT HTML ================= */
  const buildPrintHtml = () => {
    const rawContent = editorContentRef.current || formData.htmlContent || records?.at(-1)?.html_content || "";
    // Strip old baked-in header and build fresh one with current data
    const hrIdx = rawContent.indexOf('<hr');
    const bodyOnly = hrIdx >= 0 ? rawContent.substring(rawContent.indexOf('>', hrIdx) + 1) : rawContent;
    const pName = formData2?.PatientName || PatientName || "";
    const age = (formData2?.Age || "") + (formData2?.AgeType || "");
    const cNo = formData2?.CaseNo || "";
    const sex = formData2?.Sex || "";
    const bDate = formData2?.CaseDate ? formatDate(formData2.CaseDate) : "";
    const rDate = formData2?.ReportDate ? formatDate(formData2.ReportDate) : formatDate(new Date().toISOString());
    const refBy = doctorsMap[formData2?.DoctorId] || "";
    const freshHeader = `<div style="text-align:right;margin-bottom:4px"><img src="${barcodeImg}" style="height:45px" /></div><table style="width:100%;border:1px solid #000;border-collapse:collapse;font-size:16px;font-weight:900;-webkit-text-stroke:1px #000;margin-bottom:8px"><tr><td style="padding:4px 6px;width:13%;border:none"><b>Patient</b></td><td style="padding:4px 6px;width:20%;border:none">: ${pName}</td><td style="padding:4px 6px;width:10%;border:none"><b>Age</b></td><td style="padding:4px 6px;width:20%;border:none">: ${age}</td><td style="padding:4px 6px;width:10%;border:none"><b>Sex</b></td><td style="padding:4px 6px;width:27%;border:none">: ${sex}</td></tr><tr><td style="padding:4px 6px;border:none"><b>Case No</b></td><td style="padding:4px 6px;border:none">: ${cNo}</td><td style="padding:4px 6px;border:none"><b>Billing Date</b></td><td colspan="3" style="padding:4px 6px;border:none">: ${bDate}</td></tr><tr><td style="padding:4px 6px;border:none"><b>Ref. By</b></td><td style="padding:4px 6px;border:none">: ${refBy}</td><td style="padding:4px 6px;border:none"><b>Report Date</b></td><td colspan="3" style="padding:4px 6px;border:none">: ${rDate}</td></tr></table><hr style="border:none;border-top:2px solid #000;margin:8px 0" />`;
    const fullContent = freshHeader + bodyOnly;
    const signatureBase64 = (SubDepartmentId == 19 || SubDepartmentId == 21)
      ? ""
      : (pathologist?.SignatureBase64 || (pathologist?.Signature ? getSignatureBase64(pathologist.Signature) : ""));
    const isCardioOrUSG = (SubDepartmentId == 19 || SubDepartmentId == 21);
    const topPad = isCardioOrUSG ? '20mm' : '50mm';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:10mm}
body{padding:${topPad} 8mm 0 8mm;font-family:"Times New Roman",serif;font-size:13px;color:#000;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
p{margin:0 0 3px}
strong{font-weight:bold}
table{width:100%;border-collapse:collapse}
td,th{padding:3px 5px;vertical-align:middle}
h2{font-size:1.4em;margin:6px 0}
h3{font-size:1.2em;margin:5px 0}
ul,ol{padding-left:18px;margin:3px 0}
img{max-width:100%;height:auto}
hr{border:none;border-top:1px solid #000;margin:6px 0}
.footer{position:fixed;bottom:65mm;${Number(pathologist?.PathologistId) === 3 ? 'left:10mm' : Number(pathologist?.PathologistId) === 4 ? 'left:80mm' : 'right:10mm'};text-align:center}
@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style>
</head>
<body>
${fullContent}
<div class="footer">
    ${signatureBase64 ? `<img src="${signatureBase64}" style="height:65px;"/>` : ''}
</div>
<script>
window.addEventListener('beforeprint',function(){
  var body=document.body;
  var pageH=297-20;
  var usedH=body.scrollHeight * 0.264583;
  if(usedH>pageH){
    var scale=Math.max(0.85, pageH/usedH);
    body.style.transform='scale('+scale.toFixed(3)+')';
    body.style.transformOrigin='top left';
    body.style.width=(100/scale)+'%';
  }
});
</script>
</body>
</html>`;
  };

  /* ================= PRINT (WYSIWYG - editor CSS embedded) ================= */
  const doPrint = (target) => {
    const editorSurface = document.querySelector(".ProseMirror");
    if (!editorSurface) return;
    const cloned = editorSurface.cloneNode(true);
    cloned.removeAttribute("contenteditable");
    cloned.removeAttribute("role");
    const signatureBase64 = (SubDepartmentId == 19 || SubDepartmentId == 21) ? "" : (pathologist?.SignatureBase64 || (pathologist?.Signature ? getSignatureBase64(pathologist.Signature) : ""));
    if (signatureBase64) { const sigDiv = document.createElement("div"); sigDiv.style.cssText = `position:fixed;bottom:65mm;${Number(pathologist?.PathologistId) === 3 ? 'left:10mm' : Number(pathologist?.PathologistId) === 4 ? 'left:80mm' : 'right:10mm'};text-align:center;`; sigDiv.innerHTML = `<img src="${signatureBase64}" style="height:65px;"/>`; cloned.appendChild(sigDiv); }
    const isCardioOrUSG = (SubDepartmentId == 19 || SubDepartmentId == 21);
    const topPad = isCardioOrUSG ? "20mm" : "50mm";
    const printHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Print</title>
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{margin:0;padding:0;background:#fff;overflow:visible!important;height:auto!important}
#print-root{width:210mm;margin:0;padding:${topPad} 8mm 10mm 8mm;background:#fff;overflow:visible!important}
.ProseMirror{outline:none!important;min-height:auto!important;padding:0!important;margin:0!important;font-family:Calibri,sans-serif;font-size:11pt;line-height:1.15;overflow:visible!important;white-space:pre-wrap;word-wrap:break-word;width:100%!important;height:auto!important;max-height:none!important;border:0!important;box-shadow:none!important;transform:none!important;background:transparent!important}
.ProseMirror table{border-collapse:collapse;width:100%}
.ProseMirror td,.ProseMirror th{border:1px solid #999;padding:6px 8px;vertical-align:top;white-space:pre-wrap}
.ProseMirror img{max-width:100%;height:auto}
.ProseMirror p{margin:0 0 3px}
.ProseMirror hr{border:none;border-top:2px solid #000;margin:8px 0}
.ProseMirror strong,.ProseMirror b{font-weight:bold}
.ProseMirror h1{font-size:2em;margin:6px 0}.ProseMirror h2{font-size:1.5em;margin:6px 0}.ProseMirror h3{font-size:1.17em;margin:5px 0}
.ProseMirror ul,.ProseMirror ol{padding-left:18px;margin:3px 0}
.ProseMirror mark,[style*="background"]{-webkit-print-color-adjust:exact;print-color-adjust:exact}
@media print{html,body{margin:0!important;padding:0!important;background:#fff!important}#print-root{width:210mm!important;margin:0!important;padding:${topPad} 8mm 10mm 8mm!important;background:#fff!important;overflow:visible!important}}
</style></head><body>
<div id="print-root"></div>
<script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close()},150)},300)};<\/script>
</body></html>`;
    target.document.open();
    target.document.write(printHtml);
    target.document.close();
    const mount = () => { const root = target.document.getElementById("print-root"); if (!root) { setTimeout(mount, 50); return; } root.innerHTML = ""; root.appendChild(cloned); };
    mount();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;
    doPrint(printWindow);
  };

  /* ================= PDF (same as print, opens in new tab for Save as PDF) ================= */
  const handlePdf = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    doPrint(win);
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

      {/* ================= MODAL DRAWER ================= */}
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
        {/* HEADER - minimal */}
        <div className="d-flex justify-content-between align-items-center px-3 py-1 border-bottom bg-light" style={{ flexShrink: 0 }}>
          <span className="fw-bold" style={{ fontSize: "0.85rem" }}>
            {PatientName} | {formData2?.CaseNo}
          </span>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {/* BODY - DocumentEditor (same DOCX-style as /test-editor) */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <DocumentEditor
            key={editorKey}
            initialContent={editorInitHtml || buildEditorContent(formData.htmlContent || htmlContent || "")}
            documentTitle={`Case ${caseId} - Test ${testId}`}
            onSave={(data) => {
              editorContentRef.current = data.html;
              handleSubmit();
            }}
            onContentChange={(html) => {
              editorContentRef.current = html;
            }}
          />
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
          <button className="btn btn-warning" onClick={handlePdf}>
            PDF
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

