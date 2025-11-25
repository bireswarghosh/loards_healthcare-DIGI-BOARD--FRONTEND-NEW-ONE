import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// minimal EMR-style quill fixes
const customStyles = `
  .ql-editor {
    min-height: 180px;
    max-height: 320px;
    overflow-y: auto;
  }
  .quill-container {
    margin-bottom: 15px;
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = customStyles;
  document.head.appendChild(style);
}

const AppTermsSettings = () => {
  const [settings, setSettings] = useState({
    terms_content: "",
    privacy_policy: "",
    about_us: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/app-terms");
      if (response.data.success && response.data.data) {
        setSettings({
          terms_content: response.data.data.terms_content || "",
          privacy_policy: response.data.data.privacy_policy || "",
          about_us: response.data.data.about_us || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleQuillChange = (value, field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const t = settings.terms_content.replace(/<[^>]*>/g, "").trim();
    const p = settings.privacy_policy.replace(/<[^>]*>/g, "").trim();
    const a = settings.about_us.replace(/<[^>]*>/g, "").trim();

    if (!t || !p || !a) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.put("/app-terms", settings);
      if (response.data.success) {
        toast.success("Terms updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
  ];

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">App Terms & Settings</h5>
            <small className="text-muted">
              Manage Terms & Conditions, Privacy Policy, and About Us content
            </small>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={loading || saving}
            onClick={fetchSettings}
          >
            Refresh
          </button>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" />
              <p className="mt-2 text-muted">Loading...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* TERMS */}
              <div className="mb-4">
                <label className="form-label">Terms & Conditions *</label>
                <div className="quill-container">
                  <ReactQuill
                    theme="snow"
                    value={settings.terms_content}
                    onChange={(v) => handleQuillChange(v, "terms_content")}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter Terms & Conditions..."
                  />
                </div>
              </div>

              {/* PRIVACY */}
              <div className="mb-4">
                <label className="form-label">Privacy Policy *</label>
                <div className="quill-container">
                  <ReactQuill
                    theme="snow"
                    value={settings.privacy_policy}
                    onChange={(v) => handleQuillChange(v, "privacy_policy")}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter Privacy Policy..."
                  />
                </div>
              </div>

              {/* ABOUT US */}
              <div className="mb-4">
                <label className="form-label">About Us *</label>
                <div className="quill-container">
                  <ReactQuill
                    theme="snow"
                    value={settings.about_us}
                    onChange={(v) => handleQuillChange(v, "about_us")}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter About Us..."
                  />
                </div>
              </div>

              <div className="alert alert-info">
                <strong>Note:</strong> This content will appear in your mobile app.  
                Please ensure accuracy and compliance.
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={loading || saving}
                  onClick={fetchSettings}
                >
                  Reset
                </button>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppTermsSettings;
