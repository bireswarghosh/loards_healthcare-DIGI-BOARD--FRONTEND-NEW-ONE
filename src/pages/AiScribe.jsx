import React, { useState, useEffect, useContext } from "react";
import Footer from "../components/footer/Footer";
import { getAIScribeResponse } from "../lib/ai";
import AiHistoryTable from "../components/tables/AiHistoryTable";
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
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";

const AiScribe = () => {
  const { aiState } = useContext(DigiContext);
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("scribe");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const currentUserId = DEFAULT_USER_ID;
  const currentDoctorId = DEFAULT_DOCTOR_ID;
  const userTimezone = getUserTimezone();

  // Speech-to-text states
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recognition, setRecognition] = useState(null);

  // Editable SOAP note fields
  const [editableSubjective, setEditableSubjective] = useState("");
  const [editableObjective, setEditableObjective] = useState("");
  const [editableAssessment, setEditableAssessment] = useState("");
  const [editablePlan, setEditablePlan] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sample options - replace with real data as needed
  const patients = SAMPLE_PATIENTS;
  const doctors = SAMPLE_DOCTORS;

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  // Speech-to-text functions
  const initSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      Swal.fire({
        title: "Not Supported",
        text: "Speech recognition is not supported in this browser.",
        icon: "warning",
      });
      return null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }

      if (finalTranscript) {
        setTranscription((prev) => prev + finalTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      Swal.fire({
        title: "Speech Recognition Error",
        text: `Error: ${event.error}`,
        icon: "error",
      });
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    return recognitionInstance;
  };

  const startListening = () => {
    if (!recognition) {
      const rec = initSpeechRecognition();
      if (rec) {
        setRecognition(rec);
        rec.start();
      }
    } else {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const clearTranscription = () => {
    setTranscription("");
    setAnalysisResult(null);
    setEditableSubjective("");
    setEditableObjective("");
    setEditableAssessment("");
    setEditablePlan("");
  };

  const loadHistory = createHistoryLoader(
    "scribe",
    setHistory,
    setLoadingHistory,
    userTimezone
  );

  const loadHistoryItem = async (itemOrId) => {
    // Handle both item object and direct id
    const id =
      typeof itemOrId === "object" ? itemOrId.id || itemOrId.noteId : itemOrId;

    // If it's already an object with all data, just return it
    if (typeof itemOrId === "object" && itemOrId.subjective !== undefined) {
      return itemOrId;
    }

    // Otherwise fetch from backend
    try {
      console.log("Loading history item with ID:", id);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/ai/scribe/${id}`,
        {
          headers: {
            "x-timezone": userTimezone,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded history item:", data);
        return data;
      } else {
        const error = await response.json();
        console.error("Error response:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load clinical note details",
          icon: "error",
        });
        return null;
      }
    } catch (error) {
      console.error("Error loading history item:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load clinical note details",
        icon: "error",
      });
      return null;
    }
  };

  const renderHistoryDetails = (item) => {
    if (!item) return <div>Loading...</div>;

    return (
      <div>
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="info-box">
              <small className="text-muted">Note ID</small>
              <div className="fw-bold">{item.noteId || item.id}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box">
              <small className="text-muted">Patient ID</small>
              <div className="fw-bold">{item.patient_id || "N/A"}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box">
              <small className="text-muted">Doctor ID</small>
              <div className="fw-bold">{item.doctor_id || "N/A"}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-box">
              <small className="text-muted">Status</small>
              <div>
                <span
                  className={`badge ${
                    item.status === "final" ? "bg-success" : "bg-warning"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <small className="text-muted">Created At</small>
            <div>{item.created_at ? formatDate(item.created_at) : "N/A"}</div>
          </div>
          <div className="col-md-6">
            <small className="text-muted">Updated At</small>
            <div>{item.updated_at ? formatDate(item.updated_at) : "N/A"}</div>
          </div>
        </div>

        <hr />

        <div className="mb-4">
          <h6 className="text-primary mb-3">
            <i className="fa-light fa-microphone me-2"></i>
            Session Content
          </h6>
          <div
            className="p-3 rounded"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {item.session_content || "No session content available."}
          </div>
        </div>

        <hr />

        <h5 className="text-success mb-3">
          <i className="fa-light fa-file-medical me-2"></i>
          SOAP Note
        </h5>

        <div className="soap-note">
          <div className="mb-4 p-3 border rounded">
            <h6 className="text-info mb-2">
              <i className="fa-light fa-user-injured me-2"></i>
              Subjective
            </h6>
            <p className="mb-0">
              {item.subjective || "No subjective information recorded."}
            </p>
          </div>

          <div className="mb-4 p-3 border rounded">
            <h6 className="text-info mb-2">
              <i className="fa-light fa-stethoscope me-2"></i>
              Objective
            </h6>
            <p className="mb-0">
              {item.objective || "No objective findings recorded."}
            </p>
          </div>

          <div className="mb-4 p-3 border rounded">
            <h6 className="text-info mb-2">
              <i className="fa-light fa-clipboard-medical me-2"></i>
              Assessment
            </h6>
            <p className="mb-0">
              {item.assessment || "No assessment recorded."}
            </p>
          </div>

          <div className="mb-4 p-3 border rounded">
            <h6 className="text-info mb-2">
              <i className="fa-light fa-notes-medical me-2"></i>
              Plan
            </h6>
            <p className="mb-0">{item.plan || "No plan recorded."}</p>
          </div>

          {item.notes && (
            <div className="mb-3 p-3 border rounded bg-light">
              <h6 className="text-secondary mb-2">
                <i className="fa-light fa-note me-2"></i>
                Additional Notes
              </h6>
              <p className="mb-0">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const generateSOAPNote = async () => {
    if (!transcription.trim()) {
      Swal.fire({
        title: "Input Required",
        text: "Please provide transcription text before generating SOAP note.",
        icon: "warning",
      });
      return;
    }

    if (!selectedPatientId) {
      Swal.fire({
        title: "Patient Selection Required",
        text: "Please select a patient before generating SOAP note.",
        icon: "warning",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await getAIScribeResponse(
        transcription,
        "gpt-5-mini",
        aiState.aiSettings.apiKey,
        selectedPatientId || "",
        currentDoctorId
      );

      if (result && result.soap) {
        setAnalysisResult(result);
        setAnalysisMeta({
          patientId: selectedPatientId,
          doctorId: currentDoctorId,
          timestamp: new Date().toISOString(),
        });

        // Populate editable fields
        setEditableSubjective(result.soap.subjective || "");
        setEditableObjective(result.soap.objective || "");
        setEditableAssessment(result.soap.assessment || "");
        setEditablePlan(result.soap.plan || "");

        // Switch to SOAP tab to show results
        setActiveTab("soap");

        Swal.fire({
          title: "SOAP Note Generated",
          text: "Review and edit the SOAP note before saving.",
          icon: "success",
          timer: 2000,
        });
      } else {
        throw new Error("Invalid response from AI service");
      }
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      Swal.fire({
        title: "Analysis Error",
        text:
          error.message || "Failed to generate SOAP note. Please try again.",
        icon: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveSOAPNote = async () => {
    if (!analysisResult || !analysisResult.noteId) {
      Swal.fire({
        title: "No Analysis Result",
        text: "Please generate a SOAP note first before saving.",
        icon: "warning",
      });
      return;
    }

    if (
      !editableSubjective &&
      !editableObjective &&
      !editableAssessment &&
      !editablePlan
    ) {
      Swal.fire({
        title: "No Content",
        text: "Please generate or edit SOAP note before saving.",
        icon: "warning",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/ai/scribe/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-timezone": userTimezone,
          },
          body: JSON.stringify({
            noteId: analysisResult?.noteId,
            patientId: selectedPatientId || null,
            doctorId: currentDoctorId,
            sessionContent: transcription,
            subjective: editableSubjective,
            objective: editableObjective,
            assessment: editableAssessment,
            plan: editablePlan,
            status: "completed",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          title: "Saved Successfully",
          text: `Clinical note #${data.noteId} has been saved.`,
          icon: "success",
        });

        // Reset form
        clearTranscription();
        setSelectedPatientId("");
        setSelectedPatient("");

        // Refresh history if on history tab
        if (activeTab === "history") {
          loadHistory();
        }
      } else {
        throw new Error("Failed to save clinical note");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      Swal.fire({
        title: "Save Error",
        text: "Failed to save clinical note. Please try again.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>AI Clinical Scribe</h5>
              <p className="text-muted">
                Transcribe your clinical session using voice input and generate
                structured SOAP notes.
              </p>
            </div>

            <div className="panel-body">
              {/* Patient and Doctor Selection */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Select Patient</label>
                  <select
                    className="form-select"
                    value={selectedPatientId}
                    onChange={(e) => {
                      const patient = patients.find(
                        (p) => p.id == e.target.value
                      );
                      setSelectedPatientId(e.target.value);
                      setSelectedPatient(patient ? patient.name : "");
                    }}
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} (Age: {patient.age}, {patient.gender})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Select Doctor</label>
                  <select
                    className="form-select"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor, index) => (
                      <option key={index} value={doctor}>
                        {doctor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tab Navigation */}
              <ul className="nav nav-tabs" id="scribeTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "scribe" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("scribe")}
                  >
                    <i className="fa fa-microphone me-2"></i>
                    Voice Transcription
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "soap" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("soap")}
                    disabled={!analysisResult}
                  >
                    <i className="fa fa-file-medical me-2"></i>
                    SOAP Note
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "history" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("history")}
                  >
                    <i className="fa fa-history me-2"></i>
                    History
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content mt-4">
                {/* Voice Transcription Tab */}
                {activeTab === "scribe" && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-lg-8">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title mb-3">
                              Live Voice Transcription
                            </h6>

                            {/* Voice Controls */}
                            <div className="text-center mb-4">
                              {!isListening ? (
                                <button
                                  className="btn btn-success btn-lg"
                                  onClick={startListening}
                                  disabled={isAnalyzing}
                                >
                                  <i className="fa fa-microphone me-2"></i>
                                  Start Voice Transcription
                                </button>
                              ) : (
                                <button
                                  className="btn btn-danger btn-lg"
                                  onClick={stopListening}
                                >
                                  <i className="fa fa-stop me-2"></i>
                                  Stop Transcription
                                </button>
                              )}
                            </div>

                            {/* Listening Indicator */}
                            {isListening && (
                              <div className="text-center mb-3">
                                <div className="d-flex align-items-center justify-content-center">
                                  <i
                                    className="fa fa-circle text-danger me-2"
                                    style={{ animation: "pulse 1.5s infinite" }}
                                  ></i>
                                  <span className="fw-bold text-danger">
                                    Listening...
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Transcription Text Area */}
                            <div className="mb-3">
                              <label className="form-label">
                                Session Transcription:
                              </label>
                              <textarea
                                className="form-control"
                                rows="10"
                                placeholder="Your speech will appear here... You can also edit the text directly."
                                value={transcription}
                                onChange={(e) =>
                                  setTranscription(e.target.value)
                                }
                                disabled={isListening}
                              />
                              <small className="text-muted">
                                {transcription.length} characters
                              </small>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-primary"
                                onClick={generateSOAPNote}
                                disabled={
                                  isAnalyzing ||
                                  !transcription.trim() ||
                                  isListening
                                }
                              >
                                {isAnalyzing ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                    ></span>
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <i className="fa fa-brain me-2"></i>
                                    Generate SOAP Note
                                  </>
                                )}
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={clearTranscription}
                                disabled={isListening || isAnalyzing}
                              >
                                <i className="fa fa-trash me-2"></i>
                                Clear
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info Sidebar */}
                      <div className="col-lg-4">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title">
                              <i className="fa fa-info-circle me-2"></i>
                              How to Use
                            </h6>
                            <ol className="small mb-0">
                              <li className="mb-2">
                                Select patient and doctor
                              </li>
                              <li className="mb-2">
                                Click "Start Voice Transcription"
                              </li>
                              <li className="mb-2">
                                Speak naturally about your clinical session
                              </li>
                              <li className="mb-2">Click "Stop" when done</li>
                              <li className="mb-2">
                                Review and edit the transcription if needed
                              </li>
                              <li className="mb-2">
                                Click "Generate SOAP Note" to create structured
                                note
                              </li>
                              <li className="mb-0">
                                Review, edit, and save the final note
                              </li>
                            </ol>
                          </div>
                        </div>

                        {isAnalyzing && (
                          <div className="card mt-3">
                            <div className="card-body">
                              <h6 className="card-title">
                                Generating SOAP Note
                              </h6>
                              <div className="text-center">
                                <div
                                  className="spinner-border text-primary mb-2"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                                <p className="small mb-0">
                                  Analyzing transcription and generating
                                  structured clinical note...
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SOAP Note Tab */}
                {activeTab === "soap" && analysisResult && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-12">
                        <div className="card">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                              SOAP Clinical Note - Review & Edit
                            </h5>
                            <button
                              className="btn btn-success"
                              onClick={saveSOAPNote}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                  ></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="fa fa-save me-2"></i>
                                  Save Final Note
                                </>
                              )}
                            </button>
                          </div>
                          <div className="card-body">
                            {analysisMeta && (
                              <div className="alert alert-info mb-4">
                                <div className="row small">
                                  <div className="col-md-4">
                                    <strong>Patient ID:</strong>{" "}
                                    {analysisMeta.patientId || "Not specified"}
                                  </div>
                                  <div className="col-md-4">
                                    <strong>Doctor ID:</strong>{" "}
                                    {analysisMeta.doctorId}
                                  </div>
                                  <div className="col-md-4">
                                    <strong>Generated:</strong>{" "}
                                    {new Date(
                                      analysisMeta.timestamp
                                    ).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="soap-note">
                              {/* Subjective */}
                              <div className="mb-4">
                                <h6 className="text-primary border-bottom pb-2">
                                  <strong>S - Subjective</strong>
                                </h6>
                                <textarea
                                  className="form-control"
                                  rows="4"
                                  value={editableSubjective}
                                  onChange={(e) =>
                                    setEditableSubjective(e.target.value)
                                  }
                                  placeholder="Patient's subjective complaints, symptoms, and history..."
                                />
                              </div>

                              {/* Objective */}
                              <div className="mb-4">
                                <h6 className="text-primary border-bottom pb-2">
                                  <strong>O - Objective</strong>
                                </h6>
                                <textarea
                                  className="form-control"
                                  rows="4"
                                  value={editableObjective}
                                  onChange={(e) =>
                                    setEditableObjective(e.target.value)
                                  }
                                  placeholder="Observable findings, test results, vital signs..."
                                />
                              </div>

                              {/* Assessment */}
                              <div className="mb-4">
                                <h6 className="text-primary border-bottom pb-2">
                                  <strong>A - Assessment</strong>
                                </h6>
                                <textarea
                                  className="form-control"
                                  rows="4"
                                  value={editableAssessment}
                                  onChange={(e) =>
                                    setEditableAssessment(e.target.value)
                                  }
                                  placeholder="Clinical diagnosis, differential diagnoses..."
                                />
                              </div>

                              {/* Plan */}
                              <div className="mb-4">
                                <h6 className="text-primary border-bottom pb-2">
                                  <strong>P - Plan</strong>
                                </h6>
                                <textarea
                                  className="form-control"
                                  rows="4"
                                  value={editablePlan}
                                  onChange={(e) =>
                                    setEditablePlan(e.target.value)
                                  }
                                  placeholder="Treatment plan, medications, follow-up instructions..."
                                />
                              </div>
                            </div>

                            <div className="alert alert-warning">
                              <i className="fa fa-exclamation-triangle me-2"></i>
                              <strong>Important:</strong> This is an
                              AI-generated draft. Please review and edit all
                              sections carefully before saving the final
                              clinical note.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-12">
                        {loadingHistory ? (
                          <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        ) : (
                          <AiHistoryTable
                            title="Clinical Notes"
                            data={history}
                            onViewDetails={loadHistoryItem}
                            renderDetailsModal={renderHistoryDetails}
                            columns={[
                              { field: "noteId", header: "Note ID" },
                              { field: "patient_id", header: "Patient ID" },
                              { field: "doctor_id", header: "Doctor ID" },
                              { field: "status", header: "Status" },
                              { field: "created_at", header: "Created" },
                            ]}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AiScribe;
