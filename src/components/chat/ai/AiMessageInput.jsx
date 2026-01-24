import React, { useState, useEffect } from "react";
import { Form, Modal, Button } from "react-bootstrap";

const AiMessageInput = ({
  onSendMessage,
  loading,
  selectedFile,
  setSelectedFile,
}) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage((prev) => prev + (prev ? " " : "") + transcript);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const handleMicClick = () => {
    if (recognition && !isListening) {
      recognition.start();
    } else if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // preview state for non-image files
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewText, setPreviewText] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewModalTitle, setPreviewModalTitle] = useState("");
  const [previewType, setPreviewType] = useState(null); // 'image' | 'pdf' | 'text' | 'other'

  useEffect(() => {
    let url = null;
    setPreviewText(null);
    if (!selectedFile) return () => {};

    if (selectedFile.type.startsWith("image/")) {
      url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else if (
      selectedFile.type === "application/pdf" ||
      (selectedFile.name && selectedFile.name.toLowerCase().endsWith(".pdf"))
    ) {
      // use object URL to embed PDF
      url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else if (
      selectedFile.type.startsWith("text/") ||
      selectedFile.name.match(
        /\.(txt|md|json|js|jsx|ts|tsx|py|java|c|cpp|h|css|html|xml|yaml|yml)$/i
      )
    ) {
      // read small text files for preview (full content stored for modal)
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = String(ev.target.result || "");
        setPreviewText(text);
      };
      reader.onerror = () => setPreviewText(null);
      reader.readAsText(selectedFile);
    } else {
      // generic file: provide download via object URL
      url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || selectedFile) {
      onSendMessage(message, selectedFile);
      setMessage("");
      setSelectedFile(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="panel-body msg-type-area z-3">
      {selectedFile && (
        <div
          className="file-preview p-2 rounded"
          style={{
            position: "relative",
            zIndex: 4,
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 72,
                height: 72,
                flexShrink: 0,
                borderRadius: 8,
                overflow: "hidden",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedFile.type &&
              selectedFile.type.startsWith("image/") &&
              previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : selectedFile.type === "application/pdf" ||
                (selectedFile.name &&
                  selectedFile.name.toLowerCase().endsWith(".pdf")) ? (
                <div style={{ textAlign: "center", color: "#fff" }}>
                  <i
                    className="fa-regular fa-file-pdf"
                    style={{ fontSize: 28 }}
                  ></i>
                </div>
              ) : (selectedFile.type &&
                  selectedFile.type.startsWith("text/")) ||
                (selectedFile.name &&
                  selectedFile.name.match(
                    /\.(txt|md|json|js|jsx|ts|tsx|py|java|c|cpp|h|css|html|xml|yaml|yml)$/i
                  )) ? (
                <div style={{ textAlign: "center", color: "#fff" }}>
                  <i
                    className="fa-regular fa-file-text"
                    style={{ fontSize: 28 }}
                  ></i>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#fff" }}>
                  <i
                    className="fa-regular fa-file"
                    style={{ fontSize: 28 }}
                  ></i>
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#fff",
                  }}
                >
                  {selectedFile.name}
                </strong>
                <div
                  style={{ fontSize: 12, color: "#ccc", whiteSpace: "nowrap" }}
                >
                  {selectedFile.size
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : ""}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#bbb", marginTop: 6 }}>
                {selectedFile.type || "Unknown type"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {(previewUrl || previewText) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={() => {
                    // show modal for text preview, open new tab for url-based previews
                    // show modal preview for all supported file types
                    setPreviewModalTitle(selectedFile.name);
                    if (previewText) {
                      setPreviewType("text");
                    } else if (
                      previewUrl &&
                      selectedFile.type &&
                      selectedFile.type.startsWith("image/")
                    ) {
                      setPreviewType("image");
                    } else if (
                      previewUrl &&
                      (selectedFile.type === "application/pdf" ||
                        (selectedFile.name &&
                          selectedFile.name.toLowerCase().endsWith(".pdf")))
                    ) {
                      setPreviewType("pdf");
                    } else if (previewUrl) {
                      setPreviewType("other");
                    } else {
                      setPreviewType("other");
                    }
                    setShowPreviewModal(true);
                  }}
                >
                  Preview
                </button>
              )}
              <button className="btn btn-sm btn-danger" onClick={removeFile}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for text files */}
      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{previewModalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflow: "auto" }}>
          {previewType === "image" && previewUrl && (
            <div style={{ textAlign: "center" }}>
              <img
                src={previewUrl}
                alt={previewModalTitle}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
          {previewType === "pdf" && previewUrl && (
            <div style={{ height: "70vh" }}>
              <embed
                src={previewUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </div>
          )}
          {previewType === "text" && (
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {previewText}
            </pre>
          )}
          {previewType === "other" && (
            <div>
              <p>Preview not available for this file type.</p>
              <p style={{ fontSize: 13, color: "#666" }}>
                {selectedFile?.name}
              </p>
              <p style={{ fontSize: 13, color: "#666" }}>
                {selectedFile?.type}
              </p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-light"
              >
                Open
              </a>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {previewUrl && (
            <Button
              variant="outline-light"
              onClick={() => window.open(previewUrl, "_blank")}
            >
              Open in new tab
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setShowPreviewModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <form onSubmit={handleSubmit}>
        <div
          className="d-flex align-items-center w-100"
          style={{
            gap: 12,
            padding: "14px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
            backdropFilter: "blur(3px)",
          }}
        >
          {/* left: attachment + small action pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <label
              className="btn btn-sm btn-outline-secondary rounded-circle"
              htmlFor="chatAttachment"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Attach"
            >
              <i className="fa-light fa-link"></i>
            </label>
            <Form.Control
              type="file"
              className="chat-attachment"
              id="chatAttachment"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* center: single-line input */}
          <div style={{ flex: 1 }}>
            <Form.Control
              type="text"
              className="form-control"
              id="chat-input"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                background: "transparent",
                border: "none",
                padding: "0.375rem 0.5rem",
                outline: "none",
                boxShadow: "none",
                color: "#fff",
              }}
            />
          </div>

          {/* right: mic (if available) + send */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              className={`btn btn-sm ${
                isListening ? "btn-danger" : "btn-outline-secondary"
              }`}
              type="button"
              onClick={handleMicClick}
              disabled={!recognition || loading}
              title={
                recognition
                  ? isListening
                    ? "Stop listening"
                    : "Start voice input"
                  : "Voice input not supported"
              }
              style={{
                width: 36,
                height: 36,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
            >
              <i
                className={`fa-light ${
                  isListening ? "fa-stop" : "fa-microphone"
                }`}
              ></i>
            </button>

            <button
              className="btn btn-sm btn-primary"
              type="submit"
              disabled={loading}
              style={{
                width: 44,
                height: 44,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
            >
              <i className="fa-light fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AiMessageInput;
