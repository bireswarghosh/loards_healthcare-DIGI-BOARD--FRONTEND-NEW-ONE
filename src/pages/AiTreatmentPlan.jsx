import React, { useState, useContext, useEffect } from "react";
import Footer from "../components/footer/Footer";
import { getAITreatmentPlan } from "../lib/ai";
import { generateTreatmentPlanPDF } from "../lib/export-pdf";
import {
  DEFAULT_USER_ID,
  DEFAULT_DOCTOR_ID,
  getUserTimezone,
  SAMPLE_PATIENTS,
  SAMPLE_DOCTORS,
  formatDate,
  formatTime,
  createHistoryLoader,
} from "../lib/utils";
import { DigiContext } from "../context/DigiContext";
import AiHistoryTable from "../components/tables/AiHistoryTable";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";

const AiTreatmentPlan = () => {
  const { aiState } = useContext(DigiContext);
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [currentSeverity, setCurrentSeverity] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  // Severity options mapping
  const severityOptions = [
    { label: "Low", value: 25 },
    { label: "Medium", value: 50 },
    { label: "High", value: 75 },
  ];
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);

  const [activeTab, setActiveTab] = useState("symptoms");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const currentUserId = DEFAULT_USER_ID; // TODO: get from auth context
  const currentDoctorId = DEFAULT_DOCTOR_ID; // TODO: get from auth context
  const userTimezone = getUserTimezone();
  // Sample options - replace with real data as needed
  const patients = SAMPLE_PATIENTS;
  const doctors = SAMPLE_DOCTORS;

  const analyzeSymptoms = async () => {
    try {
      setIsAnalyzing(true);
      const symptomText = symptoms
        .map((s) => `${s.symptom} (severity ${s.severity})`)
        .join(", ");
      const messages = [
        {
          role: "system",
          content:
            "You are a specialized medical AI assistant for treatment planning. Based on the patient's symptoms and severities, suggest a comprehensive treatment plan including probable condition, clinical findings, analysis, recommendations (lab tests, diet, exercise, medications, follow-up), notes, and disclaimer. Use simple, understandable language.",
        },
        { role: "user", content: `Patient symptoms: ${symptomText}` },
      ];

      const result = await getAITreatmentPlan(
        symptoms,
        aiState.aiSettings.model,
        aiState.aiSettings.apiKey,
        selectedPatientId || currentUserId,
        selectedDoctor ? doctors.indexOf(selectedDoctor) + 1 : currentDoctorId
      );
      setAnalysisResult(result);

      const meta = {
        generatedAt: new Date().toISOString(),
        analysisId: result.planId || `#${Date.now()}`,
        patientId: selectedPatientId || "-",
        patientName: selectedPatient || "-",
        doctorName: selectedDoctor || "-",
      };
      setAnalysisMeta(meta);
      setActiveTab("plan");
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
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
        setAnalysisResult("Error analyzing symptoms. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addSymptom = () => {
    if (currentSymptom.trim() && currentSeverity) {
      setSymptoms([
        ...symptoms,
        { symptom: currentSymptom.trim(), severity: parseInt(currentSeverity) },
      ]);
      setCurrentSymptom("");
      setCurrentSeverity("");
    }
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const updateSymptom = (index, field, value) => {
    const updatedSymptoms = [...symptoms];
    updatedSymptoms[index][field] = value;
    setSymptoms(updatedSymptoms);
  };

  const loadHistory = createHistoryLoader(
    "treatment",
    setHistory,
    setLoadingHistory,
    userTimezone
  );

  const loadHistoryItem = async (id) => {
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiBaseUrl}/api/ai/treatment/${id}`, {
        headers: {
          "x-timezone": userTimezone,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedHistoryItem(data);
        setShowHistoryModal(true);
      }
    } catch (error) {
      console.error("Error loading history item:", error);
    }
  };

  function getNextAnalysisId() {
    try {
      const key = "ai_treatment_plan_last_id";
      const last = parseInt(localStorage.getItem(key) || "0", 10) || 0;
      const next = last + 1;
      localStorage.setItem(key, String(next));
      return next;
    } catch (e) {
      return Date.now();
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const exportToPDF = async () => {
    if (!analysisResult) return;
    const pdfBlob = await generateTreatmentPlanPDF(
      analysisResult,
      analysisMeta,
      symptoms,
      aiState.aiSettings
    );
    const element = document.createElement("a");
    element.href = URL.createObjectURL(pdfBlob);
    element.download = "treatment_plan.pdf";
    document.body.appendChild(element);
    element.click();

    Swal.fire({
      title: "PDF Exported",
      text: "Treatment plan analysis has been exported to PDF successfully.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

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

  return (
    <div className="main-content">
      <div className="dashboard-breadcrumb dashboard-panel-header mb-30">
        <h2>AI Treatment Plan</h2>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>
                <i className="fa-light fa-clipboard-list me-2"></i>
                Treatment Plan Generation
              </h5>
            </div>
            <div className="panel-body">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "symptoms" ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab("symptoms")}
                  >
                    <i className="fa-light fa-notes-medical me-1"></i>
                    Enter Symptoms
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "plan" ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab("plan")}
                  >
                    <i className="fa-light fa-file-medical me-1"></i>
                    Suggested Treatment Plan
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
                <div
                  className={`tab-pane ${
                    activeTab === "symptoms" ? "active show" : "fade"
                  }`}
                  role="tabpanel"
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
                        onChange={(e) => setSelectedDoctor(e.target.value)}
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

                  <div className="card mb-3">
                    <div className="card-header">Add Symptoms</div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter symptom"
                            value={currentSymptom}
                            onChange={(e) => setCurrentSymptom(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <select
                            className="form-select"
                            value={currentSeverity}
                            onChange={(e) => setCurrentSeverity(e.target.value)}
                          >
                            <option value="">Select Severity</option>
                            {severityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <button
                            className="btn btn-primary w-100"
                            onClick={addSymptom}
                          >
                            Add Symptom
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {symptoms.length > 0 && (
                    <div className="card">
                      <div className="card-header">Entered Symptoms</div>
                      <div className="card-body">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Symptom</th>
                              <th>Severity (%)</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {symptoms.map((s, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={s.symptom}
                                    onChange={(e) =>
                                      updateSymptom(
                                        index,
                                        "symptom",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    value={s.severity}
                                    onChange={(e) =>
                                      updateSymptom(
                                        index,
                                        "severity",
                                        e.target.value
                                      )
                                    }
                                  >
                                    {severityOptions.map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label} ({option.value}%)
                                      </option>
                                    ))}
                                  </select>
                                  {s.error && (
                                    <small className="text-danger">
                                      {s.error}
                                    </small>
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => removeSymptom(index)}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="card border-primary mt-3">
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
                                <i className="fa-solid fa-notes-medical fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 0
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Reading Symptoms
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
                                <i className="fa-solid fa-brain fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 1
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Analyzing Symptoms
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
                                <i className="fa-solid fa-clipboard-list fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 2
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Generating Plan
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
                                Finalizing Results
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
                          This usually takes 10-30 seconds depending on symptom
                          complexity
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary mt-3"
                    onClick={analyzeSymptoms}
                    disabled={symptoms.length === 0 || isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Generate Treatment Plan"}
                  </button>
                </div>

                <div
                  className={`tab-pane ${
                    activeTab === "plan" ? "active show" : "fade"
                  }`}
                  role="tabpanel"
                >
                  {analysisResult && typeof analysisResult === "object" ? (
                    <div className="mt-3">
                      <h5 className="mb-3">Treatment Plan Summary</h5>
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
                          <i className="fa-light fa-stethoscope me-2"></i>
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
                          <p>
                            <strong>Lab Tests:</strong>{" "}
                            {analysisResult.recommendations.labTests}
                          </p>
                          <p>
                            <strong>Diet:</strong>{" "}
                            {analysisResult.recommendations.diet}
                          </p>
                          <p>
                            <strong>Exercise:</strong>{" "}
                            {analysisResult.recommendations.exercise}
                          </p>
                          <p>
                            <strong>Medications:</strong>{" "}
                            {analysisResult.recommendations.medications}
                          </p>
                          <p>
                            <strong>Follow-Up:</strong>{" "}
                            {analysisResult.recommendations.followUp}
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

                      <div className="alert alert-warning mt-3 d-flex align-items-start small">
                        <i
                          className="fa-light fa-circle-exclamation me-2"
                          aria-hidden="true"
                        ></i>
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
                    </div>
                  ) : analysisResult ? (
                    <div className="alert alert-danger mt-3">
                      <p>{analysisResult}</p>
                    </div>
                  ) : (
                    <div className="alert alert-warning mt-3">
                      <p>
                        No treatment plan available. Please enter symptoms and
                        generate first.
                      </p>
                    </div>
                  )}
                </div>

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
                        title="Treatment Plan Analysis History"
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
                            field: "probable_condition",
                            header: "Probable Condition",
                            type: "truncate",
                            maxLength: 30,
                            sortable: true,
                          },
                          {
                            field: "symptoms",
                            header: "Symptoms",
                            render: (value) => {
                              if (!value) return "N/A";
                              try {
                                const s =
                                  typeof value === "string"
                                    ? JSON.parse(value)
                                    : value;
                                if (Array.isArray(s))
                                  return (
                                    s
                                      .map((x) => x.symptom || x)
                                      .slice(0, 2)
                                      .join(", ") + (s.length > 2 ? "..." : "")
                                  );
                                return String(s).substring(0, 40);
                              } catch {
                                return String(value).substring(0, 40);
                              }
                            },
                            sortable: false,
                          },
                          {
                            field: "clinical_findings",
                            header: "Clinical Findings",
                            type: "truncate",
                            maxLength: 50,
                            sortable: true,
                          },
                          {
                            field: "analysis",
                            header: "Analysis",
                            type: "truncate",
                            maxLength: 50,
                            sortable: true,
                          },
                          {
                            field: "recommendations",
                            header: "Treatment Steps",
                            render: (value) => {
                              if (!value) return "N/A";
                              try {
                                const plan =
                                  typeof value === "string"
                                    ? JSON.parse(value)
                                    : value;
                                return Array.isArray(plan)
                                  ? plan.length + " steps"
                                  : "N/A";
                              } catch {
                                return value.substring(0, 30) + "...";
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
                            field: "model",
                            header: "Model",
                            sortable: true,
                          },
                        ]}
                        searchableFields={[
                          "probable_condition",
                          "symptoms",
                          "clinical_findings",
                          "recommendations",
                          "notes",
                        ]}
                        filterableFields={[
                          { field: "model", label: "All Models" },
                        ]}
                        sortableFields={[
                          "created_at",
                          "doctor_id",
                          "patient_id",
                          "probable_condition",
                          "clinical_findings",
                          "notes",
                          "model",
                        ]}
                        onViewDetails={(item) => {
                          setSelectedHistoryItem(item);
                          setShowHistoryModal(true);
                        }}
                        onRefresh={loadHistory}
                        showExport={true}
                        onExport={() => {
                          // TODO: Implement export functionality
                          console.log("Export treatment plan history");
                        }}
                        renderDetailsModal={(item) => (
                          <div className="row g-3 align-items-stretch">
                            {/* Top row - Two cards side by side */}
                            <div className="col-md-6"></div>

                            <div className="col-md-6">
                              <div className="card border-info h-100">
                                <div className="card-header bg-info text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-brain me-2"></i>
                                    Analysis Details
                                  </h6>
                                </div>
                                <div className="card-body p-3">
                                  <div className="row g-2">
                                    <div className="col-12">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">
                                          <i className="fa-light fa-calendar me-1"></i>
                                          Date:
                                        </span>
                                        <span className="fw-medium small">
                                          {formatDate(item.created_at)}{" "}
                                          {formatTime(item.created_at)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-12">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">
                                          <i className="fa-light fa-cogs me-1"></i>
                                          Model:
                                        </span>
                                        <span className="fw-medium">
                                          {item.model}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom card - Treatment Plan Details */}
                            <div className="col-12">
                              <div className="card border-success">
                                <div className="card-header bg-success text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-file-medical me-2"></i>
                                    Treatment Plan Details
                                  </h6>
                                </div>
                                <div
                                  className="card-body p-3"
                                  style={{
                                    maxHeight: "45vh",
                                    overflowY: "auto",
                                  }}
                                >
                                  <div className="row g-3">
                                    {/* Clinical Findings */}
                                    <div className="col-12">
                                      <div className="border-bottom pb-2 mb-2">
                                        <h6 className="text-success mb-2">
                                          <i className="fa-light fa-stethoscope me-2"></i>
                                          Clinical Findings
                                        </h6>
                                        <p className="mb-0">
                                          {item.clinical_findings}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Treatment Plan */}
                                    <div className="col-12">
                                      <div className="border-bottom pb-2 mb-2">
                                        <h6 className="text-success mb-2">
                                          <i className="fa-light fa-clipboard-list me-2"></i>
                                          Recommendations
                                        </h6>
                                        <div className="mb-0">
                                          {(() => {
                                            try {
                                              const recommendationsData =
                                                typeof item.recommendations ===
                                                "string"
                                                  ? JSON.parse(
                                                      item.recommendations
                                                    )
                                                  : item.recommendations;

                                              if (
                                                typeof recommendationsData ===
                                                  "object" &&
                                                recommendationsData !== null
                                              ) {
                                                return (
                                                  <div className="row g-2">
                                                    {recommendationsData.labTests && (
                                                      <div className="col-12">
                                                        <strong>
                                                          Lab Tests:
                                                        </strong>{" "}
                                                        {
                                                          recommendationsData.labTests
                                                        }
                                                      </div>
                                                    )}
                                                    {recommendationsData.diet && (
                                                      <div className="col-12">
                                                        <strong>Diet:</strong>{" "}
                                                        {
                                                          recommendationsData.diet
                                                        }
                                                      </div>
                                                    )}
                                                    {recommendationsData.exercise && (
                                                      <div className="col-12">
                                                        <strong>
                                                          Exercise:
                                                        </strong>{" "}
                                                        {
                                                          recommendationsData.exercise
                                                        }
                                                      </div>
                                                    )}
                                                    {recommendationsData.medications && (
                                                      <div className="col-12">
                                                        <strong>
                                                          Medications:
                                                        </strong>{" "}
                                                        {
                                                          recommendationsData.medications
                                                        }
                                                      </div>
                                                    )}
                                                    {recommendationsData.followUp && (
                                                      <div className="col-12">
                                                        <strong>
                                                          Follow-up:
                                                        </strong>{" "}
                                                        {
                                                          recommendationsData.followUp
                                                        }
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              }
                                              return String(
                                                recommendationsData
                                              );
                                            } catch (e) {
                                              return String(
                                                item.recommendations
                                              );
                                            }
                                          })()}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Symptoms */}
                                    {item.symptoms && (
                                      <div className="col-12">
                                        <div className="border-bottom pb-2 mb-2">
                                          <h6 className="text-success mb-2">
                                            <i className="fa-light fa-exclamation-triangle me-2"></i>
                                            Symptoms
                                          </h6>
                                          <div className="mb-0">
                                            {(() => {
                                              try {
                                                const symptomsData =
                                                  typeof item.symptoms ===
                                                  "string"
                                                    ? JSON.parse(item.symptoms)
                                                    : item.symptoms;

                                                if (
                                                  Array.isArray(symptomsData)
                                                ) {
                                                  return (
                                                    <div className="row g-2">
                                                      {symptomsData.map(
                                                        (symptom, index) => (
                                                          <div
                                                            key={index}
                                                            className="col-md-6 col-sm-12"
                                                          >
                                                            <div
                                                              className="d-flex justify-content-between align-items-center p-2 border rounded"
                                                              style={{
                                                                background:
                                                                  "rgba(255,255,255,0.03)",
                                                              }}
                                                            >
                                                              <span className="fw-medium text-light">
                                                                {
                                                                  symptom.symptom
                                                                }
                                                              </span>
                                                              <span
                                                                className={`badge text-uppercase py-1 px-2 ${
                                                                  symptom.severity ===
                                                                  "high"
                                                                    ? "bg-danger"
                                                                    : symptom.severity ===
                                                                      "moderate"
                                                                    ? "bg-warning text-dark"
                                                                    : "bg-info text-dark"
                                                                }`}
                                                                style={{
                                                                  fontSize:
                                                                    "0.75rem",
                                                                }}
                                                              >
                                                                {
                                                                  symptom.severity
                                                                }
                                                              </span>
                                                            </div>
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  );
                                                }
                                                return (
                                                  <p className="text-dark mb-0">
                                                    {String(symptomsData)}
                                                  </p>
                                                );
                                              } catch (e) {
                                                return (
                                                  <p className="text-dark mb-0">
                                                    {String(item.symptoms)}
                                                  </p>
                                                );
                                              }
                                            })()}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Notes */}
                                    {item.notes && (
                                      <div className="col-12">
                                        <h6 className="text-success mb-2">
                                          <i className="fa-light fa-sticky-note me-2"></i>
                                          Notes
                                        </h6>
                                        <p className="mb-0">{item.notes}</p>
                                      </div>
                                    )}
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

export default AiTreatmentPlan;
