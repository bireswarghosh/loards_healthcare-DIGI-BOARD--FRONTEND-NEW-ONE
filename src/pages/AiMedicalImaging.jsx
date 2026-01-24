import React, { useState, useCallback, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import Footer from "../components/footer/Footer";
import { getAIImageResponse } from "../lib/ai";
import { generateMedicalImagePDF } from "../lib/export-pdf";
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
} from "../lib/utils";
import { DigiContext } from "../context/DigiContext";
import AiHistoryTable from "../components/tables/AiHistoryTable";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AiMedicalImaging = () => {
  const { aiState } = useContext(DigiContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientAge, setSelectedPatientAge] = useState("");
  const [selectedPatientSex, setSelectedPatientSex] = useState("");
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const currentUserId = DEFAULT_USER_ID; // TODO: get from auth context
  const currentDoctorId = DEFAULT_DOCTOR_ID; // TODO: get from auth context
  const userTimezone = getUserTimezone();
  // Sample options - replace with real data as needed
  const patients = SAMPLE_PATIENTS;
  const doctors = SAMPLE_DOCTORS;

  const loadHistory = createHistoryLoader(
    "imaging",
    setHistory,
    setLoadingHistory,
    userTimezone
  );

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  // Keep previews in sync with `files` and manage object URLs
  useEffect(() => {
    // Revoke old URLs to prevent memory leaks
    previews.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });

    // Create new URLs for current files
    const newPreviews = files.map((file) => {
      if (file.type && file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null;
    });

    setPreviews(newPreviews);

    // Cleanup function to revoke URLs when component unmounts
    return () => {
      newPreviews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  // Progress animation effect
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setProgress(0);
      setCurrentStep(0);
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + Math.random() * 4 + 1;
          if (newProgress >= 25 && currentStep === 0) {
            setCurrentStep(1);
          }
          if (newProgress >= 50 && currentStep === 1) {
            setCurrentStep(2);
          }
          if (newProgress >= 75 && currentStep === 2) {
            setCurrentStep(3);
          }
          if (newProgress >= 99) {
            setCurrentStep(4);
            return 99;
          }
          return newProgress;
        });
      }, 800);
    } else {
      setProgress(0);
      setCurrentStep(-1);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAnalyzing, currentStep]);

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
            "You are a specialized medical AI assistant for imaging analysis. Carefully analyze the uploaded medical images and any provided records to accurately detect and diagnose conditions. Identify the image type (e.g., X-ray, MRI, CT, USG, PET). Provide detailed clinical findings, a precise analysis of the condition, evidence-based recommendations, relevant notes, a disclaimer, the probable condition in simple terms, and a confidence score (e.g., 85%). Translate all medical jargon into easily understandable language for patients and non-experts. Prioritize accuracy, safety, and clarity in your structured response.",
        },
        { role: "user", content },
      ];

      // Get AI response
      const result = await getAIImageResponse(
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
        analysisId: result.analysisId || `#${Date.now()}`,
        patientId: selectedPatientId || "-",
        patientName: selectedPatient || "-",
        patientAge: selectedPatientAge || "-",
        patientSex: selectedPatientSex || "-",
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
    const uploadedFiles = files.map((f) => f.name);
    const uploadedImages = files
      .filter((f) => f.type && f.type.startsWith("image/"))
      .map((f) => f.name);
    // Get base64 data for images
    const imageData = await Promise.all(
      files
        .filter((f) => f.type && f.type.startsWith("image/"))
        .map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
    );
    const pdfBlob = await generateMedicalImagePDF(
      analysisResult,
      analysisMeta,
      uploadedFiles,
      uploadedImages,
      imageData,
      aiState.aiSettings
    );
    const element = document.createElement("a");
    element.href = URL.createObjectURL(pdfBlob);
    element.download = "medical_image_analysis.pdf";
    document.body.appendChild(element);
    element.click();

    Swal.fire({
      title: "PDF Exported",
      text: "Medical imaging analysis has been exported to PDF successfully.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="main-content">
      <div className="dashboard-breadcrumb dashboard-panel-header mb-30">
        <h2>AI Medical Imaging</h2>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>
                <i className="fa-light fa-file-medical me-2"></i>
                Medical Imaging Analysis
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
                    <div className="card border-success">
                      <div className="card-body text-center">
                        <h5 className="card-title text-success mb-4">
                          <i className="fa-solid fa-x-ray fa-2x me-3"></i>
                          Medical Imaging Analysis in Progress
                        </h5>
                        <div
                          className="progress mb-4"
                          style={{ height: "12px" }}
                        >
                          <div
                            className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                            role="progressbar"
                            style={{ width: `${progress}%` }}
                            aria-valuenow={progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <div className="mb-3">
                          <span className="badge bg-success fs-6">
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
                                    className="spinner-border text-success mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-image fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 0
                                    ? "text-success"
                                    : "text-muted"
                                }`}
                              >
                                Processing Images
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
                                    className="spinner-border text-success mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-microscope fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 1
                                    ? "text-success"
                                    : "text-muted"
                                }`}
                              >
                                Analyzing Features
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
                                    className="spinner-border text-success mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-brain fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 2
                                    ? "text-success"
                                    : "text-muted"
                                }`}
                              >
                                AI Diagnosis
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
                                    className="spinner-border text-success mb-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Processing...
                                    </span>
                                  </div>
                                )
                              ) : (
                                <i className="fa-solid fa-file-medical fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 3
                                    ? "text-success"
                                    : "text-muted"
                                }`}
                              >
                                Generating Report
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-inline-flex align-items-center">
                            <span className="badge bg-success me-3 fs-6">
                              AI Analyzing
                            </span>
                            <div className="d-flex gap-1">
                              <div
                                className="spinner-grow text-success"
                                role="status"
                                style={{ animationDelay: "0s" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <div
                                className="spinner-grow text-success"
                                role="status"
                                style={{ animationDelay: "0.1s" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <div
                                className="spinner-grow text-success"
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
                          Advanced AI analysis may take 20-60 seconds for
                          detailed medical imaging
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-header">
                        Upload Medical Image Records
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
                                setSelectedPatientAge(p ? p.age : "");
                                setSelectedPatientSex(p ? p.gender : "");
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
                                  Drop medical image records here or click to
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

                  {/* Supported Image Types */}
                  <div className="card mt-3">
                    <div className="card-header">
                      <i className="fa-light fa-image me-2"></i>
                      Supported Medical Image Types
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <ul className="list-unstyled">
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              X-ray
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              MRI
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              CT Scan
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              Ultrasound
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              PET Scan
                            </li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <ul className="list-unstyled">
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              Mammography
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              Angiography
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              Fluoroscopy
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              Echocardiogram
                            </li>
                            <li>
                              <i className="fa-light fa-check text-success me-2"></i>
                              DEXA Scan
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

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
                          Image Type
                        </div>
                        <div className="card-body">
                          <p className="mb-0">{analysisResult.imageType}</p>
                        </div>
                      </div>

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

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-notes-medical me-2"></i>
                          Probable Condition
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.probableCondition}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-percentage me-2"></i>
                          Confidence Score
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.confidenceScore}
                          </p>
                        </div>
                      </div>

                      {/* Disclaimer removed from here and placed near export button */}
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
                        title="Medical Imaging Analysis History"
                        data={history}
                        loading={loadingHistory}
                        columns={[
                          {
                            field: "created_at",
                            header: "Date & Time",
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
                            field: "image_type",
                            header: "Image Type",
                            sortable: true,
                          },
                          {
                            field: "probable_condition",
                            header: "Probable Condition",
                            type: "truncate",
                            maxLength: 30,
                            sortable: true,
                          },
                          {
                            field: "confidence_score",
                            header: "Confidence",
                            render: (value) => (value ? `${value}%` : "N/A"),
                            sortable: true,
                          },
                          {
                            field: "clinical_findings",
                            header: "Clinical Findings",
                            type: "truncate",
                            maxLength: 40,
                            sortable: true,
                          },
                          {
                            field: "files",
                            header: "Attachments",
                            render: (value, item) => {
                              // some endpoints use `files` JSON or `attached_files`
                              let filesField = value;
                              if (
                                (!filesField || filesField.length === 0) &&
                                item
                              ) {
                                filesField =
                                  item.files ||
                                  item.attached_files ||
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
                            field: "status",
                            header: "Status",
                            type: "badge",
                            badgeColor: (item) =>
                              item.status === "completed"
                                ? "success"
                                : item.status === "pending"
                                ? "warning"
                                : item.status === "error"
                                ? "danger"
                                : "secondary",
                            sortable: true,
                          },
                          {
                            field: "model",
                            header: "Model",
                            sortable: true,
                          },
                        ]}
                        searchableFields={[
                          "image_type",
                          "probable_condition",
                          "clinical_findings",
                          "analysis",
                          "recommendations",
                        ]}
                        filterableFields={[
                          { field: "status", label: "All Status" },
                          { field: "model", label: "All Models" },
                        ]}
                        sortableFields={[
                          "created_at",
                          "doctor_id",
                          "patient_id",
                          "image_type",
                          "probable_condition",
                          "confidence_score",
                          "clinical_findings",
                          "status",
                          "model",
                        ]}
                        onRefresh={loadHistory}
                        showExport={true}
                        onExport={() => {
                          // TODO: Implement export functionality
                          console.log("Export imaging history");
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
                                      {formatDate(item.created_at)}{" "}
                                      {formatTime(item.created_at)}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">
                                      Model:
                                    </span>
                                    <span className="fw-medium">
                                      {item.model}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span className="text-muted small">
                                      Status:
                                    </span>
                                    <span
                                      className={`badge ${
                                        item.status === "completed"
                                          ? "bg-success"
                                          : "bg-warning"
                                      } p-1`}
                                    >
                                      {item.status}
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
                                    Imaging Details
                                  </h6>
                                </div>
                                <div
                                  className="card-body p-3"
                                  style={{
                                    maxHeight: "50vh",
                                    overflowY: "auto",
                                  }}
                                >
                                  {item.probable_condition && (
                                    <div className="mb-3">
                                      <h6 className="text-success mb-1">
                                        Probable Condition
                                      </h6>
                                      <p className="mb-0">
                                        {item.probable_condition}
                                      </p>
                                    </div>
                                  )}

                                  {item.confidence_score && (
                                    <div className="mb-3">
                                      <h6 className="text-success mb-1">
                                        Confidence Score
                                      </h6>
                                      <div
                                        className="progress"
                                        style={{ height: "20px" }}
                                      >
                                        <div
                                          className="progress-bar bg-success"
                                          role="progressbar"
                                          style={{
                                            width: `${item.confidence_score}%`,
                                          }}
                                          aria-valuenow={item.confidence_score}
                                          aria-valuemin="0"
                                          aria-valuemax="100"
                                        >
                                          {item.confidence_score}%
                                        </div>
                                      </div>
                                    </div>
                                  )}

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
                                            <div>
                                              {rec.labTests && (
                                                <div className="mb-2">
                                                  <strong className="text-muted small">
                                                    Lab Tests:
                                                  </strong>
                                                  <div>{rec.labTests}</div>
                                                </div>
                                              )}
                                              {rec.diet && (
                                                <div className="mb-2">
                                                  <strong className="text-muted small">
                                                    Diet:
                                                  </strong>
                                                  <div>{rec.diet}</div>
                                                </div>
                                              )}
                                              {rec.exercise && (
                                                <div className="mb-2">
                                                  <strong className="text-muted small">
                                                    Exercise:
                                                  </strong>
                                                  <div>{rec.exercise}</div>
                                                </div>
                                              )}
                                              {rec.medications && (
                                                <div className="mb-2">
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

export default AiMedicalImaging;
