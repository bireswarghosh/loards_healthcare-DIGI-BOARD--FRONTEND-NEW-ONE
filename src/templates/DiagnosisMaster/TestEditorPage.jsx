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
  const [loading, setLoading] = useState(true);
  const editorContentRef = useRef("");

  useEffect(() => {
    if (testId) fetchContent();
  }, [testId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tests/${testId}/html-content`);
      if (response.data.success && response.data.data) {
        const { htmlContent: content } = response.data.data;
        setHtmlContent(content || "");
        editorContentRef.current = content || "";
      }
      // fetch test name
      const testRes = await axiosInstance.get(`/tests/${testId}`);
      if (testRes.data?.data?.Test) setTestName(testRes.data.data.Test);
    } catch (error) {
      console.error("Error:", error);
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
      {/* Top bar with back button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 12px", background: "#f8f9fa", borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>{testName}</span>
        </div>
      </div>
      {/* Editor takes full remaining space */}
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
    </div>
  );
};

export default TestEditorPage;
