import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DocumentEditor from "../../components/editor/DocumentEditor";

const TestEditorPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState("");
  const [testName, setTestName] = useState("Document");
  const [googleDocId, setGoogleDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorContentRef = useRef("");

  // Google integration states
  const [googleConnected, setGoogleConnected] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");

  useEffect(() => {
    if (testId) {
      fetchContent();
      checkGoogleConnection();
    }
  }, [testId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_connected") === "true") {
      toast.success("Google Account connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
      checkGoogleConnection();
    }
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const res = await axiosInstance.get('/auth/google/status');
      if (res.data.success) {
        setGoogleConnected(res.data.googleConnected);
      }
    } catch (err) {
      console.error("Error checking Google connection:", err);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const currentUrl = window.location.href;
      const res = await axiosInstance.get(`/auth/google/url?frontend_url=${encodeURIComponent(currentUrl)}`);
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to get authorization URL");
      }
    } catch (err) {
      console.error("Error getting auth URL:", err);
      toast.error("Failed to connect with Google");
    }
  };

  const fetchDriveFiles = async () => {
    try {
      const res = await axiosInstance.get('/google-docs/list');
      if (res.data.success) {
        setDriveFiles(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching Google Drive files:", err);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tests/${testId}/html-content`);
      if (response.data.success && response.data.data) {
        const { htmlContent: content } = response.data.data;
        setHtmlContent(content || "");
        editorContentRef.current = content || "";
      }
      
      const testRes = await axiosInstance.get(`/tests/${testId}`);
      if (testRes.data?.data) {
        setTestName(testRes.data.data.Test || "Document");
        setGoogleDocId(testRes.data.data.google_doc_id || null);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      const exportedContent = data?.html || editorContentRef.current;
      await axiosInstance.put(`/tests/${testId}/html-content`, {
        htmlContent: exportedContent,
      });
      toast.success("Saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    }
  };

  const handleLinkDoc = async (docId) => {
    if (!docId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/link', { testId, docId });
      if (res.data.success) {
        toast.success("Google Document linked successfully!");
        setGoogleDocId(docId);
        setShowLinkModal(false);
      }
    } catch (err) {
      console.error("Error linking Google Doc:", err);
      toast.error("Failed to link Google Document");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkDoc = async () => {
    if (!window.confirm("Are you sure you want to unlink this Google Doc from the test? The local HTML template will remain saved, but editing changes in Google Doc will no longer sync until linked again.")) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/unlink', { testId });
      if (res.data.success) {
        toast.success("Google Document unlinked successfully!");
        setGoogleDocId(null);
      }
    } catch (err) {
      console.error("Error unlinking Google Doc:", err);
      toast.error("Failed to unlink Google Document");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoc = async () => {
    const title = newDocTitle.trim() || `${testName} Template`;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/create', { title, testId });
      if (res.data.success && res.data.data?.id) {
        toast.success(`Google Document "${title}" created and linked!`);
        setGoogleDocId(res.data.data.id);
        setNewDocTitle("");
        setShowLinkModal(false);
      }
    } catch (err) {
      console.error("Error creating Google Doc:", err);
      toast.error("Failed to create Google Document");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromGoogle = async () => {
    if (!googleDocId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/sync', { testId, docId: googleDocId });
      if (res.data.success) {
        toast.success("Successfully synchronized latest changes from Google Docs!");
        await fetchContent();
      }
    } catch (err) {
      console.error("Error syncing from Google Docs:", err);
      toast.error("Failed to sync from Google Docs. Ensure your Google account is connected.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ToastContainer />
      {/* Top bar with back button & tools */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "#f8f9fa", borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>
            {testName} 
            {googleDocId && <span className="badge bg-success ms-2 fw-normal"><i className="fa-brands fa-google me-1"></i>Linked</span>}
          </span>
        </div>

        {/* Actions Bar */}
        <div>
          {googleDocId ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <a 
                href={`https://docs.google.com/document/d/${googleDocId}/edit`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                <i className="fa-solid fa-up-right-from-square me-1"></i> Open Google Doc
              </a>
              <button className="btn btn-sm btn-success" onClick={handleSyncFromGoogle} disabled={loading}>
                <i className="fa-solid fa-rotate me-1"></i> Sync from Google Docs
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={handleUnlinkDoc} disabled={loading}>
                <i className="fa-solid fa-link-slash me-1"></i> Unlink
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              {googleConnected ? (
                <button 
                  className="btn btn-sm btn-outline-success" 
                  onClick={() => {
                    fetchDriveFiles();
                    setShowLinkModal(true);
                  }}
                  disabled={loading}
                >
                  <i className="fa-brands fa-google me-1"></i> Link Google Doc
                </button>
              ) : (
                <button 
                  className="btn btn-sm btn-success" 
                  onClick={handleConnectGoogle}
                  disabled={loading}
                >
                  <i className="fa-brands fa-google me-1"></i> Connect Google Account
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor takes full remaining space */}
      {googleDocId ? (
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f1f3f4" }}>
          <iframe
            src={`https://docs.google.com/document/d/${googleDocId}/edit?embedded=true`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media"
            title="Google Docs Editor"
          />
        </div>
      ) : (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <DocumentEditor
            initialContent={htmlContent}
            documentTitle={testName}
            onSave={(data) => {
              editorContentRef.current = data.html;
              handleSave(data);
            }}
          />
        </div>
      )}

      {/* Link Google Doc Modal */}
      {showLinkModal && (
        <div className="modal d-block" style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Link to Google Document</h5>
                <button type="button" className="btn-close" onClick={() => setShowLinkModal(false)}></button>
              </div>
              <div className="modal-body">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button 
                      className={`nav-link btn-sm py-1 px-3 ${activeTab === "existing" ? "active" : ""}`}
                      onClick={() => setActiveTab("existing")}
                      type="button"
                    >
                      Link Existing Doc
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link btn-sm py-1 px-3 ${activeTab === "new" ? "active" : ""}`}
                      onClick={() => setActiveTab("new")}
                      type="button"
                    >
                      Create New Doc
                    </button>
                  </li>
                </ul>
                <div className="tab-content">
                  {activeTab === "existing" ? (
                    <div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Select Document from Drive</label>
                        <select 
                          className="form-select form-select-sm"
                          value={selectedDocId}
                          onChange={(e) => setSelectedDocId(e.target.value)}
                        >
                          <option value="">-- Choose a Google Doc --</option>
                          {driveFiles.map(file => (
                            <option key={file.id} value={file.id}>{file.name}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-primary w-100" 
                        onClick={() => handleLinkDoc(selectedDocId)}
                        disabled={!selectedDocId || loading}
                      >
                        Link Selected Document
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">New Document Title</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm"
                          placeholder="E.g., Glucose Test Template"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                        />
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-success w-100" 
                        onClick={handleCreateDoc}
                        disabled={loading}
                      >
                        Create and Link Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer py-2">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowLinkModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEditorPage;
