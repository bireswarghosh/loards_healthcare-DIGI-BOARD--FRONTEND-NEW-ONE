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

  /* ================= FETCH ================= */
  useEffect(() => {
    if (open && caseId && testId) {
      fetchRecords();
      resetForm();
    }
  }, [open, caseId, testId]);

  const fetchRecords = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/case-test-data?caseId=${caseId}&testId=${testId}`
        // `case-test-data/{id}`
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

  const resetForm = () => {
    setFormData({ htmlContent: "" });
    setEditId(null);
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
        await axiosInstance.post(`/case-test-data`, fd);
        toast.success("Saved successfully");
      }

      fetchRecords();
      resetForm();
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
    window.print();
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
              <CKEditor
                editor={ClassicEditor}
                data={formData.htmlContent}
                onChange={handleEditorChange}
              />

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
      <div id="print-wrapper">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <img src={barcodeImg} alt="barcode" />
          <div>
            <div>
              <b>Patient:</b> {formData2?.PatientName}
            </div>
            <div>
              <b>Case No:</b> {formData2?.CaseNo}
            </div>
            <div>
              <b>Age / Sex:</b> {formData2?.Age} / {formData2?.Sex}
            </div>
            <div>
              <b>Ref By:</b> {formData2?.RefBy}
            </div>
          </div>
        </div>

        <hr />

        <h4 style={{ textAlign: "center" }}>CLINICAL PATHOLOGY</h4>

        <div
          dangerouslySetInnerHTML={{
            __html: records?.at(-1)?.html_content || "",
          }}
        />
      </div>
    </>
  );
};

export default CaseTestDataModal;