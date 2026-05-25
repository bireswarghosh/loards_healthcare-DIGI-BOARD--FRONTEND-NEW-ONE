import React, { useEffect, useState } from "react";
import { loadTemplateContext } from "./submissionStorage";
import { exportDocxFile } from "./utils";

const SubmitDialog = ({
  open,
  onClose,
  documentTitle,
  documentHtml,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const context = loadTemplateContext();

  useEffect(() => {
    if (!open) {
      setMessage("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setMessage("Name, email aur phone required hai.");
      return;
    }

    setBusy(true);

    try {
      const formData = new FormData();
      formData.append("templateId", String(context?.templateId ?? ""));
      formData.append("customerName", customerName.trim());
      formData.append("customerEmail", customerEmail.trim());
      formData.append("customerPhone", customerPhone.trim());
      formData.append("notes", notes.trim());
      formData.append("documentTitle", documentTitle);
      formData.append("document_html", documentHtml);
      console.log(documentHtml);

      let generatedDocx = await exportDocxFile(documentHtml);
      formData.append("file", generatedDocx);

      // Submit to your API endpoint here
      // const result = await submitDocument(formData);
      // setMessage(result.message || "Submitted successfully");

      setMessage("Submitted successfully");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setNotes("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Submit Document</h2>
            <p className="mt-1 text-sm text-slate-500">
              Customer details fill karke document submit karo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone no"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Extra details"
            className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            DOCX file:{" "}
            <span className="font-medium text-slate-800">
              {"Not available"}
            </span>
          </div>

          {message && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-[#185ABD] py-3 text-sm font-medium text-white hover:bg-[#144c9d]"
          >
            {busy ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitDialog;
