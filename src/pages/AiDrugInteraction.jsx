import React, { useState, useContext, useEffect } from "react";
import Footer from "../components/footer/Footer";
import { getAIDrugInteraction } from "../lib/ai";
import { generateDrugInteractionPDF } from "../lib/export-pdf";
import {
  DEFAULT_USER_ID,
  DEFAULT_DOCTOR_ID,
  getUserTimezone,
  SAMPLE_PATIENTS,
  SAMPLE_DOCTORS,
  formatDate,
  formatTime,
  createHistoryLoader,
  createRemoveFileHandler,
} from "../lib/utils";
import { DigiContext } from "../context/DigiContext";
import AiHistoryTable from "../components/tables/AiHistoryTable";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AiDrugInteraction = () => {
  const { aiState } = useContext(DigiContext);
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [currentMedication, setCurrentMedication] = useState({
    drugName: "",
    dosage: "",
    frequency: "",
    purpose: "",
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [activeTab, setActiveTab] = useState("medications");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const currentUserId = DEFAULT_USER_ID;
  const currentDoctorId = DEFAULT_DOCTOR_ID;
  const userTimezone = getUserTimezone();

  // Sample options - replace with real data as needed
  const patients = SAMPLE_PATIENTS;
  const doctors = SAMPLE_DOCTORS;

  const analyzeMedications = async () => {
    try {
      setIsAnalyzing(true);

      const result = await getAIDrugInteraction(
        medications,
        aiState.aiSettings.model,
        aiState.aiSettings.apiKey,
        selectedPatientId || currentUserId,
        selectedDoctor ? doctors.indexOf(selectedDoctor) + 1 : currentDoctorId
      );
      setAnalysisResult(result);

      const meta = {
        generatedAt: new Date().toISOString(),
        analysisId: result.analysisId || `#${Date.now()}`,
        patientId: selectedPatientId || "-",
        patientName: selectedPatient || "-",
        doctorName: selectedDoctor || "-",
      };
      setAnalysisMeta(meta);
      setActiveTab("analysis");
    } catch (error) {
      console.error("Error analyzing medications:", error);
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
        setAnalysisResult("Error analyzing medications. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addMedication = () => {
    if (
      currentMedication.drugName.trim() &&
      currentMedication.dosage.trim() &&
      currentMedication.frequency.trim() &&
      currentMedication.purpose.trim()
    ) {
      setMedications([...medications, { ...currentMedication }]);
      setCurrentMedication({
        drugName: "",
        dosage: "",
        frequency: "",
        purpose: "",
      });
    } else {
      Swal.fire({
        title: "Incomplete Information",
        text: "Please fill in all medication fields.",
        icon: "warning",
        confirmButtonClass: "btn btn-sm btn-primary",
      });
    }
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const loadHistory = createHistoryLoader(
    "drug-interaction",
    setHistory,
    setLoadingHistory,
    userTimezone
  );

  const exportToPDF = async () => {
    if (!analysisResult || !analysisMeta) {
      Swal.fire({
        title: "No Analysis Available",
        text: "Please perform an analysis first before exporting to PDF.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const pdfBlob = await generateDrugInteractionPDF(
        analysisResult,
        analysisMeta,
        medications,
        aiState.aiSettings
      );

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `drug-interaction-analysis-${
        analysisMeta.analysisId || Date.now()
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Swal.fire({
        title: "PDF Exported",
        text: "Drug interaction analysis has been exported to PDF successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Swal.fire({
        title: "Export Failed",
        text: "Failed to export PDF. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
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
        <h2>AI Drug Interaction Checker</h2>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>
                <i className="fa-light fa-pills me-2"></i>
                Drug Interaction Analysis
              </h5>
            </div>
            <div className="panel-body">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "medications" ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab("medications")}
                  >
                    <i className="fa-light fa-prescription-bottle-medical me-1"></i>
                    Enter Medications
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "analysis" ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab("analysis")}
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
                <div
                  className={`tab-pane ${
                    activeTab === "medications" ? "active show" : "fade"
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
                    <div className="card-header">Add Medication</div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-3 mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Drug Name"
                            value={currentMedication.drugName}
                            onChange={(e) =>
                              setCurrentMedication({
                                ...currentMedication,
                                drugName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-3 mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Dosage (e.g., 500mg)"
                            value={currentMedication.dosage}
                            onChange={(e) =>
                              setCurrentMedication({
                                ...currentMedication,
                                dosage: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-3 mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Frequency (e.g., Twice daily)"
                            value={currentMedication.frequency}
                            onChange={(e) =>
                              setCurrentMedication({
                                ...currentMedication,
                                frequency: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-3 mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Purpose"
                            value={currentMedication.purpose}
                            onChange={(e) =>
                              setCurrentMedication({
                                ...currentMedication,
                                purpose: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={addMedication}
                      >
                        <i className="fa-light fa-plus me-1"></i>
                        Add Medication
                      </button>
                    </div>
                  </div>

                  {medications.length > 0 && (
                    <div className="card">
                      <div className="card-header">Entered Medications</div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Drug Name</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Purpose</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {medications.map((med, index) => (
                                <tr key={index}>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={med.drugName}
                                      onChange={(e) =>
                                        updateMedication(
                                          index,
                                          "drugName",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={med.dosage}
                                      onChange={(e) =>
                                        updateMedication(
                                          index,
                                          "dosage",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={med.frequency}
                                      onChange={(e) =>
                                        updateMedication(
                                          index,
                                          "frequency",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={med.purpose}
                                      onChange={(e) =>
                                        updateMedication(
                                          index,
                                          "purpose",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => removeMedication(index)}
                                    >
                                      <i className="fa-light fa-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
                                <i className="fa-solid fa-pills fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 0
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Reading Medications
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
                                <i className="fa-solid fa-flask fa-3x text-secondary mb-2"></i>
                              )}
                              <small
                                className={`fw-bold ${
                                  currentStep >= 1
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                Analyzing Interactions
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
                          This usually takes 10-30 seconds depending on
                          medication complexity
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary mt-3"
                    onClick={analyzeMedications}
                    disabled={medications.length === 0 || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="fa-light fa-microscope me-1"></i>
                        Analyze Drug Interactions
                      </>
                    )}
                  </button>
                </div>

                <div
                  className={`tab-pane ${
                    activeTab === "analysis" ? "active show" : "fade"
                  }`}
                  role="tabpanel"
                >
                  {analysisResult && typeof analysisResult === "object" ? (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                          Drug Interaction Analysis Report
                        </h5>
                      </div>
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
                          <i className="fa-light fa-pills me-2"></i>
                          Medications Listed
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Drug Name</th>
                                  <th>Dosage</th>
                                  <th>Frequency</th>
                                  <th>Purpose</th>
                                </tr>
                              </thead>
                              <tbody>
                                {medications.map((med, index) => (
                                  <tr key={index}>
                                    <td>{med.drugName}</td>
                                    <td>{med.dosage}</td>
                                    <td>{med.frequency}</td>
                                    <td>{med.purpose}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header bg-warning text-dark">
                          <i className="fa-light fa-triangle-exclamation me-2"></i>
                          Potential Drug-Drug Interactions
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.drugDrugInteractions}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header bg-danger text-white">
                          <i className="fa-light fa-heart-pulse me-2"></i>
                          Drug-Disease Interactions
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.drugDiseaseInteractions}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header bg-danger text-white">
                          <i className="fa-light fa-ban me-2"></i>
                          Contraindications
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.contraindications}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-brain me-2"></i>
                          Overall Analysis
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.overallAnalysis}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header bg-success text-white">
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
                        <div className="card-header bg-info text-white">
                          <i className="fa-light fa-lightbulb me-2"></i>
                          Alternative Medication Suggestions
                        </div>
                        <div className="card-body">
                          <p className="mb-0">
                            {analysisResult.alternativeSuggestions}
                          </p>
                        </div>
                      </div>

                      <div className="card mb-3">
                        <div className="card-header">
                          <i className="fa-light fa-sticky-note me-2"></i>
                          Notes
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
                        No analysis available. Please enter medications and
                        analyze first.
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
                        title="Drug Interaction Analysis History"
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
                            field: "medications",
                            header: "Medications",
                            render: (value) => {
                              if (!value) return "N/A";
                              try {
                                const meds =
                                  typeof value === "string"
                                    ? JSON.parse(value)
                                    : value;
                                if (Array.isArray(meds))
                                  return (
                                    meds
                                      .map((x) => x.drugName || x)
                                      .slice(0, 3)
                                      .join(", ") +
                                    (meds.length > 3 ? "..." : "")
                                  );
                                return String(meds).substring(0, 40);
                              } catch {
                                return String(value).substring(0, 40);
                              }
                            },
                            sortable: false,
                          },
                          {
                            field: "drug_drug_interactions",
                            header: "Drug-Drug Interactions",
                            type: "truncate",
                            maxLength: 50,
                            sortable: true,
                          },
                          {
                            field: "contraindications",
                            header: "Contraindications",
                            type: "truncate",
                            maxLength: 50,
                            sortable: true,
                          },
                          {
                            field: "overall_analysis",
                            header: "Overall Analysis",
                            type: "truncate",
                            maxLength: 50,
                            sortable: true,
                          },
                          {
                            field: "model",
                            header: "Model",
                            sortable: true,
                          },
                        ]}
                        searchableFields={[
                          "medications",
                          "drug_drug_interactions",
                          "drug_disease_interactions",
                          "contraindications",
                          "overall_analysis",
                          "recommendations",
                        ]}
                        filterableFields={[
                          { field: "model", label: "All Models" },
                        ]}
                        sortableFields={[
                          "created_at",
                          "doctor_id",
                          "patient_id",
                          "drug_drug_interactions",
                          "contraindications",
                          "overall_analysis",
                          "model",
                        ]}
                        onViewDetails={(item) => {
                          setSelectedHistoryItem(item);
                        }}
                        onRefresh={loadHistory}
                        showExport={true}
                        onExport={() => {
                          console.log("Export drug interaction history");
                        }}
                        renderDetailsModal={(item) => (
                          <div className="row g-3 align-items-stretch">
                            {/* Analysis Info Card */}
                            <div className="col-md-6">
                              <div className="card border-info h-100">
                                <div className="card-header bg-info text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-info-circle me-2"></i>
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

                            {/* Medications Card */}
                            <div className="col-md-6">
                              <div className="card border-primary h-100">
                                <div className="card-header bg-primary text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-pills me-2"></i>
                                    Medications
                                  </h6>
                                </div>
                                <div
                                  className="card-body p-3"
                                  style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {(() => {
                                    try {
                                      const meds =
                                        typeof item.medications === "string"
                                          ? JSON.parse(item.medications)
                                          : item.medications;
                                      if (Array.isArray(meds)) {
                                        return (
                                          <div className="list-group">
                                            {meds.map((med, idx) => (
                                              <div
                                                key={idx}
                                                className="list-group-item"
                                              >
                                                <strong>{med.drugName}</strong>
                                                <br />
                                                <small>
                                                  {med.dosage}, {med.frequency}
                                                </small>
                                                <br />
                                                <small className="text-muted">
                                                  {med.purpose}
                                                </small>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      return <p>{String(meds)}</p>;
                                    } catch {
                                      return <p>{String(item.medications)}</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Full Analysis Details */}
                            <div className="col-12">
                              <div className="card border-success">
                                <div className="card-header bg-success text-white py-2">
                                  <h6 className="card-title mb-0">
                                    <i className="fa-light fa-file-medical me-2"></i>
                                    Complete Analysis
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
                                    {/* Drug-Drug Interactions */}
                                    {item.drug_drug_interactions && (
                                      <div className="col-12">
                                        <div className="border-bottom pb-2 mb-2">
                                          <h6 className="text-warning mb-2">
                                            <i className="fa-light fa-triangle-exclamation me-2"></i>
                                            Drug-Drug Interactions
                                          </h6>
                                          <p className="mb-0">
                                            {item.drug_drug_interactions}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Drug-Disease Interactions */}
                                    {item.drug_disease_interactions && (
                                      <div className="col-12">
                                        <div className="border-bottom pb-2 mb-2">
                                          <h6 className="text-danger mb-2">
                                            <i className="fa-light fa-heart-pulse me-2"></i>
                                            Drug-Disease Interactions
                                          </h6>
                                          <p className="mb-0">
                                            {item.drug_disease_interactions}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Contraindications */}
                                    {item.contraindications && (
                                      <div className="col-12">
                                        <div className="border-bottom pb-2 mb-2">
                                          <h6 className="text-danger mb-2">
                                            <i className="fa-light fa-ban me-2"></i>
                                            Contraindications
                                          </h6>
                                          <p className="mb-0">
                                            {item.contraindications}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Overall Analysis */}
                                    {item.overall_analysis && (
                                      <div className="col-12">
                                        <div className="border-bottom pb-2 mb-2">
                                          <h6 className="text-info mb-2">
                                            <i className="fa-light fa-brain me-2"></i>
                                            Overall Analysis
                                          </h6>
                                          <p className="mb-0">
                                            {item.overall_analysis}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Recommendations */}
                                    {item.recommendations && (
                                      <div className="col-12">
                                        <div className="border-bottom pb-2 mb-2">
                                          <h6 className="text-success mb-2">
                                            <i className="fa-light fa-list-check me-2"></i>
                                            Recommendations
                                          </h6>
                                          <p className="mb-0">
                                            {item.recommendations}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Alternative Suggestions */}
                                    {item.alternative_suggestions && (
                                      <div className="col-12">
                                        <div className="border-bottom pb-2 mb-2">
                                          <h6 className="text-primary mb-2">
                                            <i className="fa-light fa-lightbulb me-2"></i>
                                            Alternative Medication Suggestions
                                          </h6>
                                          <p className="mb-0">
                                            {item.alternative_suggestions}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Notes */}
                                    {item.notes && (
                                      <div className="col-12">
                                        <h6 className="text-secondary mb-2">
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

export default AiDrugInteraction;
