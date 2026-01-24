import React, { useState, useContext, useEffect } from "react";
import Footer from "../components/footer/Footer";
import { DEFAULT_USER_ID } from "../lib/utils";
import { DigiContext } from "../context/DigiContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const AiHealthAnalytics = () => {
  const { aiState } = useContext(DigiContext);
  const navigate = useNavigate();

  // Tabs
  const [activeTab, setActiveTab] = useState("overview");

  // Overview data
  const [overviewData, setOverviewData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Health Trends data
  const [trendAlerts, setTrendAlerts] = useState([]);
  const [activeConditions, setActiveConditions] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  // Predictions data
  const [predictions, setPredictions] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  // User data
  const [userData, setUserData] = useState(null);

  const currentUserId = DEFAULT_USER_ID;
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Load overview data when tab is selected
  useEffect(() => {
    if (activeTab === "overview") {
      loadOverviewData();
    } else if (activeTab === "trends") {
      loadHealthTrends();
    } else if (activeTab === "predictions") {
      loadPredictions();
    }
  }, [activeTab]);

  // Load user medical data
  const loadUserData = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/ai/health-analytics/user-data/${currentUserId}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        return data;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    return null;
  };

  // Load overview data
  const loadOverviewData = async () => {
    setLoadingOverview(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/ai/health-analytics/overview/${currentUserId}`
      );
      if (response.ok) {
        const data = await response.json();
        setOverviewData(data);
      }
    } catch (error) {
      console.error("Error loading overview data:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load overview data",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-sm btn-primary",
        },
      });
    } finally {
      setLoadingOverview(false);
    }
  };

  // Generate AI insights
  const generateInsights = async () => {
    if (!aiState.aiSettings.apiKey) {
      Swal.fire({
        title: "API Key Required",
        text: "Please set your OpenAI API key in AI Settings.",
        icon: "warning",
        confirmButtonText: "Go to Settings",
        customClass: {
          confirmButton: "btn btn-sm btn-primary",
        },
      }).then(() => {
        navigate("/aisettings");
      });
      return;
    }

    setLoadingInsights(true);
    try {
      let data = userData;
      if (!data) {
        data = await loadUserData();
      }

      const response = await fetch(
        `${apiBaseUrl}/api/ai/health-analytics/insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userData: data,
            userId: currentUserId,
            apiKey: aiState.aiSettings.apiKey,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setInsights(result.insights);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate insights");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to generate AI insights",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-sm btn-primary",
        },
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  // Load health trends
  const loadHealthTrends = async () => {
    if (!aiState.aiSettings.apiKey) {
      Swal.fire({
        title: "API Key Required",
        text: "Please set your OpenAI API key in AI Settings.",
        icon: "warning",
        confirmButtonText: "Go to Settings",
        customClass: {
          confirmButton: "btn btn-sm btn-primary",
        },
      }).then(() => {
        navigate("/aisettings");
      });
      return;
    }

    setLoadingTrends(true);
    try {
      let data = userData;
      if (!data) {
        data = await loadUserData();
      }

      const response = await fetch(
        `${apiBaseUrl}/api/ai/health-analytics/trends`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userData: data,
            userId: currentUserId,
            apiKey: aiState.aiSettings.apiKey,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTrendAlerts(result.trendAlerts || []);
        setActiveConditions(result.activeConditions || []);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to load health trends");
      }
    } catch (error) {
      console.error("Error loading health trends:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to load health trends",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-sm btn-primary",
        },
      });
    } finally {
      setLoadingTrends(false);
    }
  };

  // Load predictions
  const loadPredictions = async () => {
    if (!aiState.aiSettings.apiKey) {
      Swal.fire({
        title: "API Key Required",
        text: "Please set your OpenAI API key in AI Settings.",
        icon: "warning",
        confirmButtonText: "Go to Settings",
        customClass: {
          confirmButton: "btn btn-sm btn-primary",
        },
      }).then(() => {
        navigate("/aisettings");
      });
      return;
    }

    setLoadingPredictions(true);
    try {
      let data = userData;
      if (!data) {
        data = await loadUserData();
      }

      const response = await fetch(
        `${apiBaseUrl}/api/ai/health-analytics/predictions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userData: data,
            userId: currentUserId,
            apiKey: aiState.aiSettings.apiKey,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setPredictions(result);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to load predictions");
      }
    } catch (error) {
      console.error("Error loading predictions:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to load AI predictions",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-sm btn-primary",
        },
      });
    } finally {
      setLoadingPredictions(false);
    }
  };

  // Get severity badge color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "secondary";
    }
  };

  // Get risk level badge color
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "danger";
      case "monitoring":
        return "warning";
      case "resolved":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="main-content">
      {/* Inline Styles for Markdown Content */}
      <style>{`
        .markdown-content h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #e0be14ff;
        }
        .markdown-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #e0be14ff;
        }
        .markdown-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #e0be14ff;
        }
        .markdown-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.4rem;
          line-height: 1.5;
        }
        .markdown-content strong {
          font-weight: 600;
          color: #e0be14ff;
        }
        .markdown-content code {
          background-color: #f8f9fa;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .markdown-content pre {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 5px;
          overflow-x: auto;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="breadcrumb-area">
        <h5 className="breadcrumb-title">AI Health Analytics Dashboard</h5>
        <ul className="breadcrumb-list">
          <li></li>
        </ul>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header d-flex align-items-center">
              <div className="btn-box d-flex gap-2">
                <button
                  className={`btn btn-sm ${
                    activeTab === "overview"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  <i className="fa-solid fa-chart-line me-1"></i>
                  Overview
                </button>
                <button
                  className={`btn btn-sm ${
                    activeTab === "trends"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setActiveTab("trends")}
                >
                  <i className="fa-solid fa-chart-area me-1"></i>
                  Health Trends
                </button>
                <button
                  className={`btn btn-sm ${
                    activeTab === "predictions"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setActiveTab("predictions")}
                >
                  <i className="fa-solid fa-brain me-1"></i>
                  AI Predictions
                </button>
              </div>
            </div>

            <div className="panel-body">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="overview-content">
                  {/* Statistics Cards */}
                  {loadingOverview ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading overview data...</p>
                    </div>
                  ) : overviewData ? (
                    <>
                      <div className="row mb-4">
                        <div className="col-xl-3 col-lg-6 col-sm-6">
                          <div className="card card-hover border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <h6 className="text-muted mb-2">
                                    Active Appointments
                                  </h6>
                                  <h2 className="mb-0 fw-bold">
                                    {overviewData.activeAppointments}
                                  </h2>
                                </div>
                                <div className="icon-box bg-primary-subtle rounded-circle p-3">
                                  <i className="fa-solid fa-calendar-check fa-2x text-primary"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-3 col-lg-6 col-sm-6">
                          <div className="card card-hover border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <h6 className="text-muted mb-2">
                                    Medical Documents
                                  </h6>
                                  <h2 className="mb-0 fw-bold">
                                    {overviewData.medicalDocumentsAnalyzed}
                                  </h2>
                                </div>
                                <div className="icon-box bg-success-subtle rounded-circle p-3">
                                  <i className="fa-solid fa-file-medical fa-2x text-success"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-3 col-lg-6 col-sm-6">
                          <div className="card card-hover border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <h6 className="text-muted mb-2">
                                    Analysis Reports
                                  </h6>
                                  <h2 className="mb-0 fw-bold">
                                    {overviewData.analysisReportsGenerated}
                                  </h2>
                                </div>
                                <div className="icon-box bg-info-subtle rounded-circle p-3">
                                  <i className="fa-solid fa-chart-bar fa-2x text-info"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-3 col-lg-6 col-sm-6">
                          <div className="card card-hover border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <h6 className="text-muted mb-2">
                                    Conditions Detected
                                  </h6>
                                  <h2 className="mb-0 fw-bold">
                                    {overviewData.conditionsDetected}
                                  </h2>
                                </div>
                                <div className="icon-box bg-warning-subtle rounded-circle p-3">
                                  <i className="fa-solid fa-stethoscope fa-2x text-warning"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI-Powered Insights */}
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="fa-solid fa-brain me-2"></i>
                            AI-Powered Insights
                          </h5>
                          <button
                            className="btn btn-sm btn-light"
                            onClick={generateInsights}
                            disabled={loadingInsights}
                          >
                            {loadingInsights ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Generating...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-refresh me-2"></i>
                                Generate Insights
                              </>
                            )}
                          </button>
                        </div>
                        <div className="card-body">
                          {loadingInsights ? (
                            <div className="text-center py-5">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <p className="mt-3">
                                Analyzing your health data...
                              </p>
                            </div>
                          ) : insights ? (
                            <div className="insights-content">
                              <div className="alert alert-info">
                                <i className="fa-solid fa-info-circle me-2"></i>
                                These insights are generated by AI and should be
                                reviewed by a healthcare professional.
                              </div>
                              <div className="mt-3 markdown-content">
                                <ReactMarkdown>{insights}</ReactMarkdown>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-5 text-muted">
                              <i className="fa-solid fa-brain fa-3x mb-3 opacity-50"></i>
                              <p>
                                Click "Generate Insights" to analyze your health
                                data with AI
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="fa-solid fa-chart-line fa-3x mb-3 opacity-50"></i>
                      <p>No overview data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Health Trends Tab */}
              {activeTab === "trends" && (
                <div className="trends-content">
                  {loadingTrends ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Analyzing health trends...</p>
                    </div>
                  ) : (
                    <>
                      {/* Recent Trend Alerts */}
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-gradient-warning text-white">
                          <h5 className="mb-0">
                            <i className="fa-solid fa-triangle-exclamation me-2"></i>
                            Recent Trend Alerts
                          </h5>
                        </div>
                        <div className="card-body">
                          {trendAlerts.length > 0 ? (
                            <div className="list-group list-group-flush">
                              {trendAlerts.map((alert, index) => (
                                <div
                                  key={index}
                                  className="list-group-item border-0 border-bottom"
                                >
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">
                                        <span
                                          className={`badge bg-${getSeverityColor(
                                            alert.severity
                                          )} me-2`}
                                        >
                                          {alert.severity}
                                        </span>
                                        {alert.title}
                                      </h6>
                                      <p className="mb-1 text-muted">
                                        {alert.description}
                                      </p>
                                      {alert.date && (
                                        <small className="text-muted">
                                          <i className="fa-solid fa-calendar me-1"></i>
                                          {new Date(
                                            alert.date
                                          ).toLocaleDateString()}
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted">
                              <i className="fa-solid fa-check-circle fa-2x mb-2 text-success"></i>
                              <p>No trend alerts at this time</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Active Conditions */}
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-gradient-info text-white">
                          <h5 className="mb-0">
                            <i className="fa-solid fa-heartbeat me-2"></i>
                            Active Conditions
                          </h5>
                        </div>
                        <div className="card-body">
                          {activeConditions.length > 0 ? (
                            <div className="list-group list-group-flush">
                              {activeConditions.map((condition, index) => (
                                <div
                                  key={index}
                                  className="list-group-item border-0 border-bottom d-flex justify-content-between align-items-start"
                                >
                                  <div className="flex-grow-1">
                                    <h6 className="mb-2">
                                      <i className="fa-solid fa-circle-dot me-2 text-primary"></i>
                                      {condition.condition}
                                    </h6>
                                    <div className="d-flex align-items-center gap-3">
                                      <span
                                        className={`badge bg-${getStatusColor(
                                          condition.status
                                        )}`}
                                      >
                                        <i className="fa-solid fa-signal me-1"></i>
                                        {condition.status}
                                      </span>
                                      {condition.notes && (
                                        <small className="text-muted">
                                          <i className="fa-solid fa-note-sticky me-1"></i>
                                          {condition.notes}
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted">
                              <i className="fa-solid fa-info-circle fa-2x mb-2"></i>
                              <p>No active conditions detected</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* AI Predictions Tab */}
              {activeTab === "predictions" && (
                <div className="predictions-content">
                  {loadingPredictions ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Generating AI predictions...</p>
                    </div>
                  ) : predictions ? (
                    <>
                      {/* Overall Risk Assessment */}
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-gradient-primary text-white">
                          <h5 className="mb-0">
                            <i className="fa-solid fa-clipboard-check me-2"></i>
                            Overall Risk Assessment
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-info">
                            <i className="fa-solid fa-info-circle me-2"></i>
                            These predictions are based on AI analysis and
                            should be discussed with your healthcare provider.
                          </div>
                          <p className="lead">
                            {predictions.overallRiskAssessment}
                          </p>
                        </div>
                      </div>

                      {/* Predictions */}
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-gradient-danger text-white">
                          <h5 className="mb-0">
                            <i className="fa-solid fa-exclamation-triangle me-2"></i>
                            Health Risk Predictions
                          </h5>
                        </div>
                        <div className="card-body">
                          {predictions.predictions?.length > 0 ? (
                            <div className="row">
                              {predictions.predictions.map(
                                (prediction, index) => (
                                  <div key={index} className="col-md-6 mb-3">
                                    <div className="card h-100 border shadow-sm">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title mb-0">
                                            {prediction.title}
                                          </h6>
                                          <span
                                            className={`badge bg-${getRiskColor(
                                              prediction.riskLevel
                                            )}`}
                                          >
                                            {prediction.riskLevel}
                                          </span>
                                        </div>
                                        <p className="card-text text-muted small">
                                          {prediction.description}
                                        </p>
                                        <div className="mb-3">
                                          <strong>Probability:</strong>
                                          <div
                                            className="progress mt-1"
                                            style={{ height: "20px" }}
                                          >
                                            <div
                                              className={`progress-bar bg-${getRiskColor(
                                                prediction.riskLevel
                                              )}`}
                                              style={{
                                                width: `${prediction.probability}%`,
                                              }}
                                            >
                                              {prediction.probability}%
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mb-2">
                                          <strong>Timeframe:</strong>
                                          <span className="badge bg-secondary ms-2">
                                            {prediction.timeframe}
                                          </span>
                                        </div>
                                        {prediction.indicators?.length > 0 && (
                                          <div className="mb-2">
                                            <strong>Indicators:</strong>
                                            <ul className="small mb-0 mt-1">
                                              {prediction.indicators.map(
                                                (ind, i) => (
                                                  <li key={i}>{ind}</li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                        {prediction.preventiveMeasures?.length >
                                          0 && (
                                          <div>
                                            <strong className="text-success">
                                              <i className="fa-solid fa-shield-alt me-1"></i>
                                              Preventive Measures:
                                            </strong>
                                            <ul className="small mb-0 mt-1">
                                              {prediction.preventiveMeasures.map(
                                                (measure, i) => (
                                                  <li key={i}>{measure}</li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted">
                              <i className="fa-solid fa-check-circle fa-2x mb-2 text-success"></i>
                              <p>No significant health risks predicted</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      {predictions.recommendedActions?.length > 0 && (
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-gradient-success text-white">
                            <h5 className="mb-0">
                              <i className="fa-solid fa-list-check me-2"></i>
                              Recommended Actions
                            </h5>
                          </div>
                          <div className="card-body">
                            <ul className="list-group list-group-flush">
                              {predictions.recommendedActions.map(
                                (action, index) => (
                                  <li
                                    key={index}
                                    className="list-group-item d-flex align-items-start"
                                  >
                                    <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                    <span>{action}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="fa-solid fa-brain fa-3x mb-3 opacity-50"></i>
                      <p>No predictions available yet</p>
                      <p className="small">
                        Load this tab to generate AI predictions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AiHealthAnalytics;
