import React, { useState, useCallback, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import Footer from "../components/footer/Footer";
import { getAIPrescriptionResponse, fileToBase64 } from "../lib/ai";
import {
  DEFAULT_USER_ID,
  DEFAULT_DOCTOR_ID,
  getUserTimezone,
  SAMPLE_PATIENTS,
  SAMPLE_DOCTORS,
  formatDate,
  formatTime,
  createRemoveFileHandler,
  createHistoryLoader,
  createProgressAnimator,
} from "../lib/utils";
import { generatePrescriptionPDF } from "../lib/export-pdf";
import AiHistoryTable from "../components/tables/AiHistoryTable";
import { DigiContext } from "../context/DigiContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AiPrescription = () => {
  const { aiState } = useContext(DigiContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const currentUserId = DEFAULT_USER_ID; // TODO: get from auth context
  const currentDoctorId = DEFAULT_DOCTOR_ID; // TODO: get from auth context
  const userTimezone = getUserTimezone();
  // Sample options - replace with real data as needed
  const patients = SAMPLE_PATIENTS;
  const doctors = SAMPLE_DOCTORS;
  const [previews, setPreviews] = useState([]); // object URLs for image previews

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  // Progress animation effect
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setProgress(0);
      setCurrentStep(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 3 + 1; // Random increment between 1-4%
          if (newProgress >= 25) setCurrentStep(1);
          if (newProgress >= 50) setCurrentStep(2);
          if (newProgress >= 75) setCurrentStep(3);
          if (newProgress >= 99) {
            setCurrentStep(4);
            return 99; // Cap at 99% until actual completion
          }
          return Math.min(newProgress, 99);
        });
      }, 800); // Update every 800ms
    } else {
      // Analysis completed - set to 100% if it was at 99%
      setProgress((prev) => (prev >= 99 ? 100 : prev));
      setCurrentStep(4);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const loadHistory = createHistoryLoader(
    "prescription",
    setHistory,
    setLoadingHistory,
    userTimezone
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  // Keep previews in sync with `files` and manage object URLs
  useEffect(() => {
    // Revoke existing urls
    previews.forEach((url) => URL.revokeObjectURL(url));
    const next = files.map((f) =>
      f.type && f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    );
    setPreviews(next);
    return () => {
      next.forEach((url) => url && URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const removeFile = createRemoveFileHandler(setFiles, previews, setPreviews);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const analyzeFiles = async () => {
    setIsAnalyzing(true);
    try {
      // Separate text and image files
      const textFiles = files.filter((file) => file.type.startsWith("text/"));
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (textFiles.length === 0 && imageFiles.length === 0) {
        setAnalysisResult(
          "No supported files found. Please upload text or image files."
        );
        return;
      }

      // Read text file contents
      const textContents = await Promise.all(
        textFiles.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(`${file.name}:\n${e.target.result}`);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        })
      );

      // Read image file contents as data URLs
      const imageContents = await Promise.all(
        imageFiles.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) =>
              resolve({ name: file.name, url: e.target.result });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Build message content
      const content = [];

      if (textContents.length > 0) {
        const combinedText = textContents.join("\n\n");
        const maxTextLength = 5000; // Limit text to avoid token issues
        const truncatedText =
          combinedText.length > maxTextLength
            ? combinedText.substring(0, maxTextLength) + "..."
            : combinedText;
        content.push({
          type: "text",
          text: `Medical Records:\n${truncatedText}`,
        });
      } else {
        content.push({
          type: "text",
          text: "Please analyze the uploaded medical images.",
        });
      }

      // Add images
      imageContents.forEach((img) => {
        content.push({ type: "image_url", image_url: { url: img.url } });
      });

      const messages = [
        {
          role: "system",
          content:
            "You are a medical AI assistant. Analyze the provided medical records and images and provide a structured prescription recommendation.",
        },
        { role: "user", content },
      ];

      // Get AI response - use prescription analyze
      const result = await getAIPrescriptionResponse(
        files,
        aiState.aiSettings.model,
        aiState.aiSettings.apiKey,
        selectedPatientId || currentUserId,
        selectedDoctor ? doctors.indexOf(selectedDoctor) + 1 : currentDoctorId
      );
      setAnalysisResult(result);

      // Create analysis metadata
      const meta = {
        generatedAt: new Date().toISOString(),
        analysisId: result.prescriptionId || `#${Date.now()}`,
        patientId: selectedPatientId || "-",
        patientName: selectedPatient || "-",
        doctorName: selectedDoctor || "-",
      };
      setAnalysisMeta(meta);

      // Switch to the Analysis Report tab when analysis completes
      setActiveTab("report");
    } catch (error) {
      console.error("Error analyzing files:", error);
      if (error.message.includes("API key not set")) {
        Swal.fire({
          title: "API Key Required",
          text: "Please set your OpenAI API key in AI Settings.",
          icon: "warning",
          confirmButtonText: "Go to Settings",
          confirmButtonClass: "btn btn-sm btn-primary",
        }).then(() => {
          navigate("/aisettings");
        });
        setAnalysisResult(
          "API key not set. Please configure it in AI Settings."
        );
      } else {
        setAnalysisResult("Error analyzing files. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToPDF = async () => {
    if (!analysisResult) return;
    const patientInfo = {
      patientName: selectedPatient || "N/A",
      patientId: selectedPatientId || "N/A",
      patientAge: patients.find((p) => p.id == selectedPatientId)?.age || "N/A",
      patientSex:
        patients.find((p) => p.id == selectedPatientId)?.gender || "N/A",
    };
    const doctorInfo = {
      doctorName: selectedDoctor || "N/A",
    };
    const hospitalSettings = {
      orgName: aiState.aiSettings?.orgName || "",
      orgAddress: aiState.aiSettings?.orgAddress || "",
      orgPhone: aiState.aiSettings?.orgPhone || "",
      orgEmail: aiState.aiSettings?.orgEmail || "",
      orgLogoUrl: aiState.aiSettings?.orgLogoUrl || "",
    };
    const imageData = await Promise.all(
      files
        .filter((f) => f.type && f.type.startsWith("image/"))
        .map(async (file) => {
          return await fileToBase64(file);
        })
    );
    const prescriptionData = {
      ...analysisResult,
      analysisId: analysisMeta?.analysisId,
      date: analysisMeta?.generatedAt,
    };
    const pdfBlob = await generatePrescriptionPDF(
      prescriptionData,
      patientInfo,
      doctorInfo,
      hospitalSettings,
      imageData
    );
    const element = document.createElement("a");
    element.href = URL.createObjectURL(pdfBlob);
    element.download = "prescription_analysis.pdf";
    document.body.appendChild(element);
    element.click();

    Swal.fire({
      title: "PDF Exported",
      text: "Prescription analysis has been exported to PDF successfully.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="main-content">
      <div className="dashboard-breadcrumb dashboard-panel-header mb-30">
        <h2>AI Prescription</h2>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>
                <i className="fa-light fa-prescription me-2"></i>
                Prescription Analysis
              </h5>
            </div>
            <div className="panel-body">
              {/* Tabs: Upload / Analysis Report / History */}
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "upload" ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab("upload")}
                  >
                    <i className="fa-light fa-cloud-arrow-up me-1"></i>
                    Upload
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "report" ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab("report")}
                  >
                    <i className="fa-light fa-file-medical me-1"></i>
                    Analysis Report
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "history" ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab("history")}
                  >
                    <i className="fa-light fa-history me-1"></i>
                    History
                  </button>
                </li>
              </ul>

              <div className="tab-content mt-3">
                {/* Upload Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "upload" ? "active show" : "fade"
                  }`}
                  role="tabpanel"
                >
                  {isAnalyzing ? (
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h5 className="card-title text-primary mb-4">
                          <i className="fa-solid fa-brain fa-2x me-3"></i>
                          AI Analysis in Progress
                        </h5>
                        <div
                          className="progress mb-4"
                          style={{ height: "12px" }}
                        >
                          <div
                            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                            role="progressbar"
                            style={{ width: `${progress}%` }}
                            aria-valuenow={progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <div className="mb-3">
                          <span className="badge bg-primary fs-6">
                            {Math.round(progress)}% Complete
                          </span>
                        </div>
                        <div className="row text-center mb-4">
                          <div className="col-3">
                            <div className="d-flex flex-column align-items-center">
                              {currentStep >= 0 ? (
                                currentStep > 0 ? (
                                  <i className="fa-solid fa-check-circle fa-3x text-success mb-2"></i>
                                ) : (
                                  <div
                                    className="spinner-border text-primary mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-file fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 0
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Reading Files
                              </small>
                            </div>
                          </div>
                          <div className="col-3">
                            <div className="d-flex flex-column align-items-center">
                              {currentStep >= 1 ? (
                                currentStep > 1 ? (
                                  <i className="fa-solid fa-check-circle fa-3x text-success mb-2"></i>
                                ) : (
                                  <div
                                    className="spinner-border text-primary mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-pills fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 1
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Analyzing Prescription
                              </small>
                            </div>
                          </div>
                          <div className="col-3">
                            <div className="d-flex flex-column align-items-center">
                              {currentStep >= 2 ? (
                                currentStep > 2 ? (
                                  <i className="fa-solid fa-check-circle fa-3x text-success mb-2"></i>
                                ) : (
                                  <div
                                    className="spinner-border text-primary mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-chart-line fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 2
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Generating Insights
                              </small>
                            </div>
                          </div>
                          <div className="col-3">
                            <div className="d-flex flex-column align-items-center">
                              {currentStep >= 3 ? (
                                currentStep > 3 ? (
                                  <i className="fa-solid fa-check-circle fa-3x text-success mb-2"></i>
                                ) : (
                                  <div
                                    className="spinner-border text-primary mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-save fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 3
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Saving Results
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-inline-flex align-items-center">
                            <span className="badge bg-primary me-3 fs-6">
                              AI Working
                            </span>
                            <div className="d-flex gap-1">
                              <div
                                className="spinner-grow text-primary"
                                role="status"
                                style={{ animationDelay: "0s" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <div
                                className="spinner-grow text-primary"
                                role="status"
                                style={{ animationDelay: "0.1s" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <div
                                className="spinner-grow text-primary"
                                role="status"
                                style={{ animationDelay: "0.2s" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted mb-0">
                          <i className="fa-solid fa-clock me-2"></i>
                          This usually takes 10-30 seconds depending on file
                          complexity
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-header">
                        Upload Prescription Records
                      </div>
                      <div
                        className={`card-body ${
                          isDragActive ? "dropzone-active" : ""
                        }`}
                      >
                        <div className="row mb-3">
                          <div className="col-md-6 mb-2">
                            <label className="form-label">Select Patient</label>
                            <select
                              className="form-select"
                              value={selectedPatientId}
                              onChange={(e) => {
                                const id = e.target.value;
                                setSelectedPatientId(id);
                                const p = patients.find(
                                  (x) => String(x.id) === String(id)
                                );
                                setSelectedPatient(p ? p.name : "");
                              }}
                            >
                              <option value="">Select patient</option>
                              {patients.map((p) => (
                                <option
                                  key={p.id}
                                  value={p.id}
                                >{`ID: ${p.id} - ${p.name} (${p.age}, ${p.gender})`}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-2">
                            <label className="form-label">Select Doctor</label>
                            <select
                              className="form-select"
                              value={selectedDoctor}
                              onChange={(e) =>
                                setSelectedDoctor(e.target.value)
                              }
                            >
                              <option value="">Select doctor</option>
                              {doctors.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Drop files below (images uploaded here are sent to AI) */}

                        <form
                          className="dropzone dz-component"
                          id="prescription-upload"
                          {...getRootProps()}
                        >
                          <input {...getInputProps()} />
                          {isDragActive ? (
                            <div className="dz-default dz-message">
                              <button className="dz-button" type="button">
                                <i className="fa-light fa-cloud-arrow-up"></i>
                                <span>Drop files here or click to upload</span>
                              </button>
                            </div>
                          ) : (
                            <div className="dz-default dz-message">
                              <button className="dz-button" type="button">
                                <i className="fa-light fa-cloud-arrow-up"></i>
                                <span>
                                  Drop prescription records here or click to
                                  upload
                                </span>
                              </button>
                            </div>
                          )}

                          {/* Image previews for files uploaded via dropzone */}
                          {files.length > 0 && (
                            <div className="mt-3 d-flex gap-2 flex-wrap">
                              {files.map((file, idx) =>
                                file.type && file.type.startsWith("image/") ? (
                                  <div
                                    key={idx}
                                    className="position-relative"
                                    style={{ width: 96 }}
                                  >
                                    <img
                                      src={previews[idx]}
                                      alt={file.name}
                                      style={{
                                        width: 96,
                                        height: 96,
                                        objectFit: "cover",
                                      }}
                                      className="rounded"
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger position-absolute"
                                      style={{ top: 2, right: 2 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(idx);
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : null
                              )}
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  )}

                  {!isAnalyzing && files.length > 0 && (
                    <div className="mt-3">
                      <h6>Uploaded Files:</h6>
                      <ul className="list-group">
                        {files.map((file, index) => (
                          <li key={index} className="list-group-item">
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!isAnalyzing && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={analyzeFiles}
                      disabled={
                        files.length === 0 ||
                        isAnalyzing ||
                        !selectedPatient ||
                        !selectedDoctor
                      }
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                    </button>
                  )}
                </div>

                {/* Report Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "report" ? "active show" : "fade"
                  }`}
                  role="tabpanel"
                >
                  {analysisResult && typeof analysisResult === "object" ? (
                    <div className="mt-3">
                      <h5 className="mb-3">Analysis Summary</h5>

                      {analysisMeta && (
                        <div className="card mb-3">
                          <div className="card-header">
                            <i className="fa-light fa-info-circle me-2"></i>
                            Analysis Metadata
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <p className="mb-1">
                                  <strong>Generated:</strong>{" "}
                                  {new Date(
                                    analysisMeta.generatedAt
                                  ).toLocaleString()}
                                </p>
                                <p className="mb-1">
                                  <strong>Analysis ID:</strong>{" "}
                                  {analysisMeta.analysisId}
                                </p>
                              </div>
                              <div className="col-md-6">
                                <p className="mb-1">
                                  <strong>Patient ID:</strong>{" "}
                                  {analysisMeta.patientId}
                                </p>
                                <p className="mb-1">
                                  <strong>Patient:</strong>{" "}
                                  {analysisMeta.patientName}
                                </p>
                                <p className="mb-0">
                                  <strong>Doctor:</strong>{" "}
                                  {analysisMeta.doctorName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-notes-medical me-2"></i>
                          Clinical Findings
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.clinicalFindings}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-brain me-2"></i>Analysis
                        </div>
                        <div className="card-body">
                          <p className="mb-0">{analysisResult.analysis}</p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-list-check me-2"></i>
                          Recommendations
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.recommendations}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-sticky-note me-2"></i>Notes
                        </div>
                        <div className="card-body">
                          <p className="mb-0">{analysisResult.notes}</p>
                        </div>
                      </div>

                      {/* Disclaimer removed from here and placed near export button */}

                      <div className="row">
                        <div className="col-md-6">
                          <div className="card mb-3">
                            <div className="card-header">
                              <i className="fa-light fa-user-doctor me-2"></i>
                              Clinician
                            </div>
                            <div className="card-body">
                              <p className="mb-1">
                                <strong>Doctor's Signature:</strong>{" "}
                                {analysisResult.signature}
                              </p>
                              <p className="mb-0">
                                <strong>Date:</strong> {analysisResult.date}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card mb-3">
                            <div className="card-header">
                              <i className="fa-light fa-hospital me-2"></i>
                              Hospital Information
                            </div>
                            <div className="card-body">
                              <p className="mb-1">
                                <strong>Name:</strong>{" "}
                                {analysisResult.hospital?.name || "-"}
                              </p>
                              <p className="mb-1">
                                <strong>Address:</strong>{" "}
                                {analysisResult.hospital?.address || "-"}
                              </p>
                              <p className="mb-1">
                                <strong>Phone:</strong>{" "}
                                {analysisResult.hospital?.phone || "-"}
                              </p>
                              <p className="mb-0">
                                <strong>Email:</strong>{" "}
                                {analysisResult.hospital?.email || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="alert alert-danger mt-3">
                      <p>{analysisResult}</p>
                    </div>
                  ) : (
                    <div className="alert alert-warning mt-3">
                      <p>
                        No analysis report available. Please upload and analyze
                        files first.
                      </p>
                    </div>
                  )}

                  {analysisResult && typeof analysisResult === "object" && (
                    <>
                      <div
                        className="alert alert-warning mt-3 d-flex align-items-start small"
                        role="alert"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <i
                          className="fa-light fa-circle-exclamation me-2"
                          aria-hidden="true"
                        />
                        <div>
                          <strong>AI Analysis Disclaimer</strong>
                          <div className="mt-1">
                            {analysisResult.disclaimer}
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-success mt-3"
                        onClick={exportToPDF}
                      >
                        <i className="fa-light fa-file-export me-1"></i>
                        Export as PDF
                      </button>
                    </>
                  )}
                </div>

                {/* History Tab */}
                <div
                  className={`tab-pane ${
                    activeTab === "history" ? "active show" : "fade"
                  }`}
                  role="tabpanel"
                >
                  {loadingHistory ? (
                    <div className="text-center mt-3">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <AiHistoryTable
                        title="Prescription Analysis History"
                        data={history}
                        loading={loadingHistory}
                        columns={[
                          {
                            field: "date",
                            header: "Prescription Date",
                            type: "date",
                            sortable: true,
                          },
                          {
                            field: "created_at",
                            header: "Created",
                            type: "datetime",
                            sortable: true,
                          },
                          {
                            field: "doctor_id",
                            header: "Doctor ID",
                            sortable: true,
                          },
                          {
                            field: "patient_id",
                            header: "Patient ID",
                            sortable: true,
                          },
                          {
                            field: "clinical_findings",
                            header: "Clinical Findings",
                            type: "truncate",
                            maxLength: 50,
                            sortable: true,
                          },
                          {
                            field: "recommendations",
                            header: "Medications",
                            render: (value, item) => {
                              // try direct field, fallback to recommendations.medications
                              let medsField = value;
                              try {
                                if (
                                  !medsField &&
                                  item &&
                                  item.recommendations
                                ) {
                                  const rec =
                                    typeof item.recommendations === "string"
                                      ? JSON.parse(item.recommendations)
                                      : item.recommendations;
                                  medsField = rec && rec.medications;
                                }
                              } catch (e) {
                                medsField = medsField || null;
                              }

                              if (!medsField) return "N/A";
                              try {
                                const meds =
                                  typeof medsField === "string"
                                    ? JSON.parse(medsField)
                                    : medsField;
                                return Array.isArray(meds)
                                  ? meds.length + " medications"
                                  : String(meds).substring(0, 40) + "...";
                              } catch {
                                return (
                                  String(medsField).substring(0, 40) + "..."
                                );
                              }
                            },
                            sortable: false,
                          },
                          {
                            field: "signature",
                            header: "Signature",
                            type: "truncate",
                            maxLength: 30,
                            sortable: true,
                          },
                          {
                            field: "hospital",
                            header: "Hospital",
                            render: (value) => {
                              if (!value) return "N/A";
                              try {
                                const hosp =
                                  typeof value === "string"
                                    ? JSON.parse(value)
                                    : value;
                                return hosp.name || hosp.hospital_name || "N/A";
                              } catch {
                                return String(value).substring(0, 30) + "...";
                              }
                            },
                            sortable: false,
                          },
                          {
                            field: "notes",
                            header: "Notes",
                            type: "truncate",
                            maxLength: 40,
                            sortable: true,
                          },
                          {
                            field: "attached_files",
                            header: "Attachments",
                            render: (value, item) => {
                              let filesField = value;
                              if (
                                (!filesField || filesField.length === 0) &&
                                item
                              ) {
                                filesField =
                                  item.attached_files ||
                                  item.files ||
                                  item.files_json;
                              }
                              if (!filesField) return "None";
                              try {
                                const arr =
                                  typeof filesField === "string"
                                    ? JSON.parse(filesField)
                                    : filesField;
                                if (Array.isArray(arr))
                                  return arr.length + " file(s)";
                                return "1 file";
                              } catch {
                                return "1 file";
                              }
                            },
                            sortable: false,
                          },
                          {
                            field: "model",
                            header: "Model",
                            sortable: true,
                          },
                        ]}
                        searchableFields={[
                          "clinical_findings",
                          "recommendations",
                          "notes",
                          "signature",
                          "hospital",
                        ]}
                        filterableFields={[
                          { field: "model", label: "All Models" },
                        ]}
                        sortableFields={[
                          "date",
                          "created_at",
                          "doctor_id",
                          "patient_id",
                          "clinical_findings",
                          "notes",
                          "signature",
                          "model",
                        ]}
                        onViewDetails={(item) => {
                          // Modal handled by AiHistoryTable component
                        }}
                        onRefresh={loadHistory}
                        showExport={true}
                        onExport={() => {
                          // TODO: Implement export functionality
                          console.log("Export prescription history");
                        }}
                        renderDetailsModal={(item) => (
                          <div className="row g-3 align-items-stretch">
                            <div className="col-md-6">
                              <div className="card border-primary h-100">
                                <div className="card-header bg-primary text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-users me-2"></i>
                                    Patient & Doctor Info
                                  </h6>
                                </div>
                                <div className="card-body p-3">
                                  <div className="row g-2">
                                    <div className="col-12 d-flex justify-content-between">
                                      <span className="text-muted small">
                                        Patient ID:
                                      </span>
                                      <span className="fw-medium">
                                        {item.patient_id}
                                      </span>
                                    </div>
                                    <div className="col-12 d-flex justify-content-between">
                                      <span className="text-muted small">
                                        Doctor ID:
                                      </span>
                                      <span className="fw-medium">
                                        {item.doctor_id}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="card border-info h-100">
                                <div className="card-header bg-info text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-file-alt me-2"></i>
                                    Analysis Details
                                  </h6>
                                </div>
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">
                                      Date:
                                    </span>
                                    <span className="fw-medium small">
                                      {formatDate(item.date)}{" "}
                                      {formatTime(item.date)}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span className="text-muted small">
                                      Model:
                                    </span>
                                    <span className="fw-medium">
                                      {item.model}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="card border-success">
                                <div className="card-header bg-success text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-file-medical me-2"></i>
                                    Prescription Details
                                  </h6>
                                </div>
                                <div
                                  className="card-body p-3"
                                  style={{
                                    maxHeight: "50vh",
                                    overflowY: "auto",
                                  }}
                                >
                                  <div className="mb-3">
                                    <h6 className="text-success mb-1">
                                      Clinical Findings
                                    </h6>
                                    <p className="mb-0">
                                      {item.clinical_findings}
                                    </p>
                                  </div>

                                  <div className="mb-3">
                                    <h6 className="text-success mb-1">
                                      Analysis
                                    </h6>
                                    <p className="mb-0">{item.analysis}</p>
                                  </div>

                                  <div className="mb-3">
                                    <h6 className="text-success mb-1">
                                      Recommendations
                                    </h6>
                                    {(() => {
                                      try {
                                        const rec =
                                          typeof item.recommendations ===
                                          "string"
                                            ? JSON.parse(item.recommendations)
                                            : item.recommendations;
                                        if (rec && typeof rec === "object") {
                                          return (
                                            <div className="row">
                                              {rec.labTests && (
                                                <div className="col-12 mb-2">
                                                  <strong className="text-muted small">
                                                    Lab Tests:
                                                  </strong>
                                                  <div>{rec.labTests}</div>
                                                </div>
                                              )}
                                              {rec.diet && (
                                                <div className="col-12 mb-2">
                                                  <strong className="text-muted small">
                                                    Diet:
                                                  </strong>
                                                  <div>{rec.diet}</div>
                                                </div>
                                              )}
                                              {rec.exercise && (
                                                <div className="col-12 mb-2">
                                                  <strong className="text-muted small">
                                                    Exercise:
                                                  </strong>
                                                  <div>{rec.exercise}</div>
                                                </div>
                                              )}
                                              {rec.medications && (
                                                <div className="col-12 mb-2">
                                                  <strong className="text-muted small">
                                                    Medications:
                                                  </strong>
                                                  <div>
                                                    {typeof rec.medications ===
                                                    "string"
                                                      ? rec.medications
                                                      : JSON.stringify(
                                                          rec.medications
                                                        )}
                                                  </div>
                                                </div>
                                              )}
                                              {rec.followUp && (
                                                <div className="col-12 mb-2">
                                                  <strong className="text-muted small">
                                                    Follow Up:
                                                  </strong>
                                                  <div>{rec.followUp}</div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                        return (
                                          <p className="mb-0">
                                            {String(item.recommendations)}
                                          </p>
                                        );
                                      } catch (e) {
                                        return (
                                          <p className="mb-0">
                                            {String(item.recommendations)}
                                          </p>
                                        );
                                      }
                                    })()}
                                  </div>

                                  {item.notes && (
                                    <div className="mb-0">
                                      <h6 className="text-success mb-1">
                                        Notes
                                      </h6>
                                      <p className="mb-0">{item.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AiPrescription;
