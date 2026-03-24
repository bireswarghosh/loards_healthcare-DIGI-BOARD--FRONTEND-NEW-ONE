import { useEffect, useMemo, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
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
  htmlContent
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    htmlContent: "",
  });

  const [editId, setEditId] = useState(null);

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

  const [doctorsMap, setDoctorsMap] = useState({})

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get('/doctors')
      if (res.data.success){

        let data = res.data.data
        if(data.length==0){setDoctorsMap({})}
        let hashMap ={}
        for(let i=0; i<data.length;i++){
          hashMap[data[i].DoctorId]= data[i].Doctor
        }
setDoctorsMap(hashMap)
      }
      else{
        setDoctorsMap({})
      }
    } catch (error) {
      console.log("Error fetching doctors:",error)
    }
  }
  


  /* ================= FETCH ================= */
  useEffect(() => {
fetchDoctors()
}, [])

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

  /* ================= FORM ================= */
  const handleEditorChange = (_, editor) => {
    setFormData({ htmlContent: editor.getData() });
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

  /* ================= EDIT / DELETE ================= */
  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData({ htmlContent: r.html_content });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await axiosInstance.delete(`/case-test-data/${id}`);
    toast.success("Deleted");
    fetchRecords();
  };

  /* ================= PRINT ================= */
const handlePrint = () => {
  if (!records?.[0]?.html_content) {
    toast.warn("No content to print");
    return;
  }

  setTimeout(() => {
    window.print();
  }, 300);
};

  if (!open) return null;

  return (
    <>
      {/* ================= PRINT CSS ================= */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #print-wrapper, #print-wrapper * {
            visibility: visible;
          }

          #print-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15mm;
            font-family: "Times New Roman";
            font-size: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #000;
            padding: 4px;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ================= MODAL ================= */}
      <div className="modal-backdrop fade show no-print"></div>

      <div className="modal fade show d-block no-print">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5>
                Case: {caseId} | Test: {testId} | {PatientName}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <label className="fw-bold">Description</label>
              <div style={{ height: "700px" }}>
              <CKEditor
                editor={ClassicEditor}
                data={formData.htmlContent || htmlContent || ""}
                onChange={handleEditorChange}
              />
              </div>

              <button
                className="btn btn-success mt-3"
                onClick={handleSubmit}
                disabled={loading}
              >
                {editId ? "Update" : "Save"}
              </button>

              <hr />
              {/* 
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Content</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td
                        dangerouslySetInnerHTML={{
                          __html: r.html_content.slice(0, 80) + "...",
                        }}
                      />
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => handleEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(r.id)}
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table> */}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handlePrint}>
                Print
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PRINT CONTENT ================= */}

      {open &&
       <div id="print-wrapper" style={{ color: "black" }}>
        {/* --- Barcode Section --- */}
        <div
          style={{ marginTop: "10px", textAlign: "right", marginBottom: "10px" }}
        >
          <img src={barcodeImg} alt="barcode" style={{ maxHeight: "60px" }} />
        </div>

        {/* --- Patient Info Table (Borders Removed) --- */}
        <table
          style={{
            width: "100%",
            border: "1px solid #000",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ border: "none", width: "15%", padding: "2px 4px" }}>
                <b>Patient</b>
              </td>
              <td style={{ border: "none", width: "35%", padding: "2px 4px" }}>
                : {formData2?.PatientName || PatientName}
              </td>
              <td style={{ border: "none", width: "15%", padding: "2px 4px" }}>
                <b>Age</b>
              </td>
              <td style={{ border: "none", width: "35%", padding: "2px 4px" }}>
                : {formData2?.Age || ""}
                {formData2?.AgeType || ""}
              </td>
            </tr>
            <tr>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <b>Case No</b>
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                : {formData2?.CaseNo || ""}
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <b>Sex</b>
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                : {formData2?.Sex || ""}
              </td>
            </tr>
            <tr>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <b>Ref. By</b>
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                : {doctorsMap[formData2?.DoctorId||""] || ""}
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <b>Billing Date</b>
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                : {new Date().toISOString().split("T")[0]}
              </td>
            </tr>
            <tr>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <b>Address</b>
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                :{" "}
                {formData2?.Add1
                  ? `${formData2?.Add1}`
                  : "" + formData2?.Add2
                    ? `, ${formData2?.Add2}`
                    : "" + formData2?.Add3
                      ? `, ${formData2?.Add3}`
                      : "" || ""}
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <b>Report Date</b>
              </td>
                <td style={{ border: "none", padding: "2px 4px" }}>
                : {records[0]?.created_at?.split("T")[0] || ""}
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                : {formData2?.RefBy || ""}
              </td>
            </tr>
          </tbody>
        </table>

        <hr style={{ border: "0.5px solid #000", marginTop: "15px" }} />

        {/* --- Clinical Content --- */}
        <div
          style={{ marginTop: "20px" }}
          dangerouslySetInnerHTML={{
            __html: records?.at(-1)?.html_content || "",
          }}
        />
      </div>}
    </>
  );
};

export default CaseTestDataModal;
