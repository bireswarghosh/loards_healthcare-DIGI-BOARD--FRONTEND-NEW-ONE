import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../../../axiosInstance";
import Footer from "../../../../components/footer/Footer";

const CaseFlowExplorer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseIdParam = searchParams.get("caseId");

  // Search & Patient States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  
  // Tab/Visualization Mode: 'flow' | 'tree' | 'schema'
  const [vizMode, setVizMode] = useState("flow");
  
  // Loaded Data for Selected Patient/Case
  const [caseDetails, setCaseDetails] = useState([]); // from /casedtl01
  const [moneyReceipts, setMoneyReceipts] = useState([]); // from /money-receipt01/search?ReffId
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  
  // Interactive Panel / Drawer States
  const [activeDrawer, setActiveDrawer] = useState(null); // 'test' | 'receipt' | null
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  
  // Sub-items (dynamic loading in drawers)
  const [testProperties, setTestProperties] = useState([]);
  const [testValues, setTestValues] = useState({});
  const [agentName, setAgentName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  
  // Expand/Collapse state for hierarchical tree nodes
  const [expandedNodes, setExpandedNodes] = useState({
    patient: true,
    lab: true,
    finance: true,
    tests: {},
    receipts: {}
  });

  const searchTimeout = useRef(null);

  // Parse CaseId from URL parameters on mount
  useEffect(() => {
    if (caseIdParam) {
      const loadCaseFromParam = async () => {
        setLoadingWorkflow(true);
        try {
          const res = await axiosInstance.get(`/case01/${encodeURIComponent(caseIdParam)}`);
          if (res.data?.success && res.data.data) {
            handleSelectCase(res.data.data);
          } else {
            // Fallback to searching if get by ID directly is restricted
            const searchRes = await axiosInstance.get(`/case01/search?caseNo=${encodeURIComponent(caseIdParam)}`);
            if (searchRes.data?.success && searchRes.data.data?.length > 0) {
              handleSelectCase(searchRes.data.data[0]);
            }
          }
        } catch (error) {
          console.error("Error loading case from query param:", error);
        } finally {
          setLoadingWorkflow(false);
        }
      };
      loadCaseFromParam();
    }
  }, [caseIdParam]);

  // Debounced Search Patients / Cases
  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axiosInstance.get(`/case01/search?search=${encodeURIComponent(searchTerm)}&limit=10`);
        if (response.data?.success) {
          setSearchResults(response.data.data || []);
        }
      } catch (error) {
        console.error("Error searching patients:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  // Load Full Case Workflow Diagram Data
  const handleSelectCase = async (caseItem) => {
    setSearchTerm("");
    setSearchResults([]);
    setLoadingWorkflow(true);
    setSelectedCase(caseItem);
    setActiveDrawer(null);
    setSelectedDrawerItem(null);

    try {
      // Fetch Doctor Name
      if (caseItem.DoctorId) {
        try {
          const docRes = await axiosInstance.get(`/doctors`);
          if (docRes.data?.success) {
            const doc = docRes.data.data.find(d => String(d.DoctorId) === String(caseItem.DoctorId));
            setDoctorName(doc ? doc.Doctor : `Dr. ID: ${caseItem.DoctorId}`);
          }
        } catch (e) {
          console.error("Failed to load doctor name", e);
        }
      } else {
        setDoctorName("N/A");
      }

      // Fetch Agent Name
      if (caseItem.AgentId) {
        try {
          const agentRes = await axiosInstance.get(`/agents?page=1&limit=1000`);
          if (agentRes.data?.data) {
            const agent = agentRes.data.data.find(a => String(a.AgentId) === String(caseItem.AgentId));
            setAgentName(agent ? agent.Agent : `Agent ID: ${caseItem.AgentId}`);
          }
        } catch (e) {
          console.error("Failed to load agent name", e);
        }
      } else {
        setAgentName("Direct Admission");
      }

      // Fetch Case Details (tests)
      const detailsRes = await axiosInstance.get(`/casedtl01/${encodeURIComponent(caseItem.CaseId)}`);
      if (detailsRes.data?.success) {
        const rawTests = detailsRes.data.data || [];
        const enriched = await Promise.all(rawTests.map(async (t) => {
          try {
            const nameRes = await axiosInstance.get(`/tests/${t.TestId}`);
            return {
              ...t,
              TestName: nameRes?.data?.data?.Test || `Test ID: ${t.TestId}`,
              DescFormat: nameRes?.data?.data?.DescFormat,
              htmlContent: nameRes?.data?.data?.html_content || ""
            };
          } catch {
            return { ...t, TestName: `Test ID: ${t.TestId}` };
          }
        }));
        setCaseDetails(enriched);
      }

      // Fetch Money Receipts
      const receiptRes = await axiosInstance.get(`/money-receipt01/search?ReffId=${encodeURIComponent(caseItem.CaseId)}`);
      if (receiptRes.data?.success) {
        setMoneyReceipts(receiptRes.data.data || []);
      }

    } catch (error) {
      console.error("Error loading workflow details:", error);
    } finally {
      setLoadingWorkflow(false);
    }
  };

  // Open Test Drawer and fetch property values
  const handleOpenTestDrawer = async (testItem) => {
    setActiveDrawer('test');
    setSelectedDrawerItem(testItem);
    setDrawerLoading(true);
    setTestProperties([]);
    setTestValues({});

    try {
      const propRes = await axiosInstance.get(`/testproperty?testId=${testItem.TestId}&limit=50`);
      const properties = propRes?.data?.data || [];
      setTestProperties(properties);

      const valRes = await axiosInstance.get(`/testproval/search?CaseId=${encodeURIComponent(selectedCase.CaseId)}&TestId=${testItem.TestId}&page=1`);
      const valuesList = valRes?.data?.data || [];
      const valMap = {};
      valuesList.forEach((item) => {
        valMap[item.TestPropertyId] = {
          value: item.TestProVal,
          lis: item.LISVal,
          alert: item.Alart,
          barcode: item.BarCodeNo
        };
      });
      setTestValues(valMap);
    } catch (error) {
      console.error("Error loading test drawer parameters:", error);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Open Money Receipt Drawer
  const handleOpenReceiptDrawer = (receiptItem) => {
    setActiveDrawer('receipt');
    setSelectedDrawerItem(receiptItem);
  };

  // Toggle expand/collapse for tree nodes
  const toggleNode = (nodePath) => {
    setExpandedNodes(prev => {
      const keys = nodePath.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: !prev[keys[0]] };
      } else {
        const parentKey = keys[0];
        const childKey = keys[1];
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: !prev[parentKey][childKey]
          }
        };
      }
    });
  };

  // Calculate dynamic workflow totals
  const totalBilled = selectedCase ? Number(selectedCase.GrossAmt || selectedCase.Total || 0) : 0;
  const totalPaid = moneyReceipts.reduce((acc, curr) => acc + Number(curr.Amount || 0), 0);
  const remainingDue = Math.max(0, totalBilled - totalPaid);
  const paidPercent = totalBilled > 0 ? Math.min(100, Math.round((totalPaid / totalBilled) * 100)) : 0;

  return (
    <div className="main-content">
      {/* Dynamic Styling Block */}
      <style dangerouslySetInnerHTML={{ __html: `
        .workflow-canvas {
          position: relative;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.04) 0%, rgba(228, 230, 235, 0.02) 100%), #ffffff;
          border-radius: 24px;
          min-height: 550px;
          border: 1px solid rgba(224, 224, 224, 0.8);
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
        }
        .flow-node {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 8px 30px rgba(31, 38, 135, 0.04);
          border-radius: 18px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }
        .flow-node:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 12px 35px rgba(99, 102, 241, 0.1);
        }
        .flow-node.origin-node {
          border-left: 6px solid #4f46e5;
        }
        .flow-node.finance-node {
          border-left: 6px solid #10b981;
        }
        .flow-node.lab-node {
          border-left: 6px solid #f59e0b;
        }
        .pulsing-line {
          stroke-dasharray: 8, 4;
          animation: neon-pulse-animation 2s linear infinite;
        }
        @keyframes neon-pulse-animation {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .detail-drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: 500px;
          max-width: 95vw;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(20px);
          box-shadow: -10px 0 45px rgba(0, 0, 0, 0.08);
          z-index: 9999;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .detail-drawer.open {
          transform: translateX(0);
        }
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(4px);
          z-index: 9998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .drawer-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
        .badge-glow-success {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.15);
        }
        .badge-glow-warning {
          background-color: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.15);
        }
        .viz-tab-btn {
          padding: 8px 18px;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .viz-tab-btn.active {
          background-color: #4f46e5;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }

        /* Tree Styles */
        .tree-container {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tree-branch {
          position: relative;
          padding-left: 24px;
          border-left: 2px dashed #cbd5e1;
          margin-left: 14px;
        }
        .tree-branch::before {
          content: "";
          position: absolute;
          top: 15px;
          left: 0;
          width: 18px;
          height: 2px;
          border-top: 2px dashed #cbd5e1;
        }
        .tree-node-title {
          padding: 10px 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          font-weight: 600;
        }
        .tree-node-title:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateX(2px);
        }

        /* Schema Table Mappings CSS */
        .schema-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .schema-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 16px;
          font-weight: bold;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .schema-fields {
          padding: 10px 16px;
          font-family: Consolas, monospace;
          font-size: 11px;
        }
        .schema-field-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
        }
        .pk-key { color: #4f46e5; font-weight: bold; }
        .fk-key { color: #f59e0b; font-weight: bold; }
      ` }} />

      <div className="row">
        <div className="col-12">
          {/* Main Action Header */}
          <div className="panel mb-4">
            <div className="panel-body d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                  <i className="fa-duotone fa-network-wired fa-2x"></i>
                </div>
                <div>
                  <h4 className="m-0 fw-bold">Case Workflow Explorer</h4>
                  <p className="text-muted m-0 small">Unified visual relationship explorer & database tree visualizer</p>
                </div>
              </div>

              {/* Patient Selector Input */}
              <div className="position-relative" style={{ width: "360px" }}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    {isSearching ? (
                      <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                    ) : (
                      <i className="fa-light fa-magnifying-glass text-muted"></i>
                    )}
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search Patient Name, Phone or Case No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Dropdown Autocomplete */}
                {searchResults.length > 0 && (
                  <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 p-2" style={{ zIndex: 1000, maxHeight: "280px", overflowY: "auto" }}>
                    <h6 className="dropdown-header small text-muted px-2 py-1">Matching Admissions</h6>
                    {searchResults.map((item) => (
                      <div
                        key={item.CaseId}
                        className="p-2 rounded hover-bg-light cursor-pointer border-bottom small d-flex justify-content-between align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectCase(item)}
                      >
                        <div>
                          <div className="fw-bold text-dark">{item.PatientName}</div>
                          <div className="text-muted small">Case: {item.CaseNo} | Slip: {item.SlipNo}</div>
                        </div>
                        <span className="badge bg-primary bg-opacity-10 text-primary">₹{item.GrossAmt || item.Total}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedCase && (
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-between align-items-center bg-white p-2.5 rounded-3 border">
            {/* View Selector Tabs */}
            <div className="d-flex gap-2">
              <button
                className={`viz-tab-btn btn btn-sm ${vizMode === "flow" ? "active" : "btn-light text-muted"}`}
                onClick={() => setVizMode("flow")}
              >
                <i className="fa-duotone fa-chart-network me-2"></i>Workflow Diagram
              </button>
              <button
                className={`viz-tab-btn btn btn-sm ${vizMode === "tree" ? "active" : "btn-light text-muted"}`}
                onClick={() => setVizMode("tree")}
              >
                <i className="fa-duotone fa-tree-large me-2"></i>Relational Tree View
              </button>
              <button
                className={`viz-tab-btn btn btn-sm ${vizMode === "schema" ? "active" : "btn-light text-muted"}`}
                onClick={() => setVizMode("schema")}
              >
                <i className="fa-duotone fa-database me-2"></i>Database Schema Map
              </button>
            </div>

            {/* Print Action Buttons */}
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="fa-light fa-arrow-left me-1.5"></i>Back
              </button>
              <button className="btn btn-sm btn-primary" onClick={() => navigate(`/CaseEntry/${encodeURIComponent(selectedCase.CaseId)}/edit`)}>
                <i className="fa-light fa-edit me-1.5"></i>Edit Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Render Content */}
      <div className="row">
        <div className="col-12">
          {loadingWorkflow ? (
            <div className="panel workflow-canvas d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status"></div>
              <h5 className="fw-bold text-muted">Building Interactive Node Tree...</h5>
              <p className="text-muted small">Loading admissions, bills, and test results</p>
            </div>
          ) : selectedCase ? (
            <div className="panel workflow-canvas p-4">
              
              {/* VIZ MODE 1: Interactive SVG Workflow Diagram */}
              {vizMode === "flow" && (
                <>
                  {/* SVG paths calculations for curves */}
                  <div className="position-absolute top-0 left-0 w-100 h-100" style={{ pointerEvents: "none", zIndex: 1 }}>
                    <svg width="100%" height="100%">
                      <path d="M 330 200 C 400 200, 400 150, 480 150" fill="none" stroke="#10b981" strokeWidth="2.5" className="pulsing-line" />
                      {caseDetails.map((_, i) => {
                        const startY = 220;
                        const endY = 80 + i * 90;
                        return (
                          <path
                            key={i}
                            d={`M 330 ${startY} C 440 ${startY}, 420 ${endY}, 520 ${endY}`}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            className="pulsing-line"
                          />
                        );
                      })}
                      {moneyReceipts.map((_, i) => {
                        const startX = 720;
                        const startY = 410;
                        const endY = 320 + i * 90;
                        return (
                          <path
                            key={i}
                            d={`M ${startX} ${startY} C ${startX + 60} ${startY}, ${startX + 40} ${endY}, ${startX + 120} ${endY}`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            className="pulsing-line"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <div className="row g-4 position-relative" style={{ zIndex: 2 }}>
                    {/* Admission Node */}
                    <div className="col-md-4 d-flex flex-column justify-content-center" style={{ minHeight: "440px" }}>
                      <div className="flow-node origin-node p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-bold">🏥 Admission Info (case01)</span>
                          <span className="text-muted small">ID: {selectedCase.CaseId}</span>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">{selectedCase.PatientName}</h4>
                        <p className="text-muted small mb-3"><i className="fa-light fa-id-card me-1.5"></i>Case No: <span className="fw-semibold text-dark">{selectedCase.CaseNo}</span></p>
                        
                        <div className="border-top pt-3">
                          <div className="row g-2 mb-2.5">
                            <div className="col-6">
                              <span className="text-muted small d-block">Age / Gender</span>
                              <span className="fw-semibold text-dark-emphasis small">{selectedCase.Age} {selectedCase.AgeType} / {selectedCase.Sex}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small d-block">Slip Number</span>
                              <span className="fw-semibold text-dark-emphasis small">{selectedCase.SlipNo || "N/A"}</span>
                            </div>
                          </div>
                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <span className="text-muted small d-block">Reference Doctor</span>
                              <span className="fw-semibold text-dark-emphasis small text-truncate d-block">{doctorName}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small d-block">Marketing Agent</span>
                              <span className="fw-semibold text-dark-emphasis small text-truncate d-block">{agentName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2 border-top pt-3">
                          <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => navigate(`/CaseEntry/${encodeURIComponent(selectedCase.CaseId)}/view`)}>
                            <i className="fa-light fa-eye me-1.5"></i>View Case
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Labs and Billing Summary */}
                    <div className="col-md-4 d-flex flex-column justify-content-between gap-4" style={{ minHeight: "440px" }}>
                      <div className="d-flex flex-column gap-3 justify-content-center flex-fill">
                        <h6 className="fw-bold text-muted uppercase small tracking-wider mb-0"><i className="fa-light fa-flask me-2 text-warning"></i>Laboratory Queries ({caseDetails.length})</h6>
                        <OverlayScrollbarsComponent style={{ maxHeight: "250px" }}>
                          <div className="d-flex flex-column gap-2.5 pe-2">
                            {caseDetails.map((test, index) => (
                              <div
                                key={test.CaseDtlId || index}
                                className="flow-node lab-node p-3 cursor-pointer d-flex justify-content-between align-items-center"
                                onClick={() => handleOpenTestDrawer(test)}
                              >
                                <div className="text-truncate me-2">
                                  <span className="fw-bold text-dark d-block text-truncate small">{test.TestName}</span>
                                  <span className="text-muted small">Table: casedtl01 | Code: {test.TestId}</span>
                                </div>
                                <span className={`badge ${test.Delivery === "Y" ? "badge-glow-success" : "badge-glow-warning"} py-1 px-2.5 small`}>
                                  {test.Delivery === "Y" ? "Delivered" : "Pending"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </OverlayScrollbarsComponent>
                      </div>

                      {/* Billing Node */}
                      <div className="flow-node finance-node p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-1.5 rounded-pill small fw-bold">💰 Billing Summary</span>
                          <span className="fw-bold text-success font-monospace">₹{totalBilled}</span>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between text-muted small mb-1">
                            <span>Paid: ₹{totalPaid}</span>
                            <span>Due: ₹{remainingDue}</span>
                          </div>
                          <div className="progress" style={{ height: "8px", borderRadius: "10px" }}>
                            <div
                              className={`progress-bar rounded ${paidPercent === 100 ? "bg-success" : "bg-primary"}`}
                              role="progressbar"
                              style={{ width: `${paidPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="row text-center pt-2.5 border-top g-2">
                          <div className="col-4">
                            <span className="text-muted small d-block">Advance</span>
                            <span className="fw-bold text-dark small">₹{selectedCase.Advance || 0}</span>
                          </div>
                          <div className="col-4 border-start border-end">
                            <span className="text-muted small d-block">Discount</span>
                            <span className="fw-bold text-dark small">₹{selectedCase.DiscAmt || selectedCase.Discount || 0}</span>
                          </div>
                          <div className="col-4">
                            <span className="text-muted small d-block">Gross Amt</span>
                            <span className="fw-bold text-dark small">₹{selectedCase.GrossAmt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Money Receipts */}
                    <div className="col-md-4 d-flex flex-column justify-content-center gap-3" style={{ minHeight: "440px" }}>
                      <h6 className="fw-bold text-muted uppercase small tracking-wider mb-0"><i className="fa-light fa-receipt me-2 text-success"></i>Money Receipts ({moneyReceipts.length})</h6>
                      
                      <OverlayScrollbarsComponent style={{ maxHeight: "360px" }}>
                        <div className="d-flex flex-column gap-2.5 pe-2">
                          {moneyReceipts.map((receipt, index) => (
                            <div
                              key={receipt.ReceiptId || index}
                              className="flow-node finance-node p-3 cursor-pointer"
                              onClick={() => handleOpenReceiptDrawer(receipt)}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-dark small">No: {receipt.ReceiptNo}</span>
                                <span className="badge bg-success bg-opacity-10 text-success py-1.5 font-monospace small">₹{receipt.Amount}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>Table: moneyreceipt01</span>
                                <span className="badge bg-light text-dark px-2">{receipt.MRType === "B" ? "Cheque/Bank" : receipt.MRType === "D" ? "UPI" : "Cash"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </OverlayScrollbarsComponent>
                    </div>
                  </div>
                </>
              )}

              {/* VIZ MODE 2: Hierarchical Tree View (Branch-by-Branch) */}
              {vizMode === "tree" && (
                <div className="tree-container align-items-start">
                  {/* Root Node: Case/Patient */}
                  <div>
                    <div className="tree-node-title border-primary" style={{ borderLeft: "4px solid #4f46e5" }} onClick={() => toggleNode('patient')}>
                      <i className={`fa-light ${expandedNodes.patient ? "fa-folder-open text-primary" : "fa-folder text-muted"}`}></i>
                      <span>Patient Root Case: {selectedCase.PatientName} ({selectedCase.CaseNo})</span>
                    </div>

                    {expandedNodes.patient && (
                      <div className="tree-branch">
                        
                        {/* BRANCH 1: Laboratory Query Branch */}
                        <div>
                          <div className="tree-node-title mt-3 border-warning" style={{ borderLeft: "4px solid #f59e0b" }} onClick={() => toggleNode('lab')}>
                            <i className={`fa-light ${expandedNodes.lab ? "fa-folder-open text-warning" : "fa-folder text-muted"}`}></i>
                            <span>Laboratory Queries Department (casedtl01)</span>
                          </div>

                          {expandedNodes.lab && (
                            <div className="tree-branch">
                              {caseDetails.map((test, index) => (
                                <div key={index} className="mt-2.5">
                                  <div className="tree-node-title bg-light" onClick={() => handleOpenTestDrawer(test)}>
                                    <i className="fa-light fa-flask text-warning"></i>
                                    <span>Test: {test.TestName} [ID: {test.TestId}]</span>
                                    <span className="badge bg-secondary bg-opacity-10 text-dark small">{test.Delivery === "Y" ? "Delivered" : "Pending"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* BRANCH 2: Financial Receipts Branch */}
                        <div>
                          <div className="tree-node-title mt-4 border-success" style={{ borderLeft: "4px solid #10b981" }} onClick={() => toggleNode('finance')}>
                            <i className={`fa-light ${expandedNodes.finance ? "fa-folder-open text-success" : "fa-folder text-muted"}`}></i>
                            <span>Financial Money Receipts (moneyreceipt01)</span>
                          </div>

                          {expandedNodes.finance && (
                            <div className="tree-branch">
                              {moneyReceipts.map((receipt, index) => (
                                <div key={index} className="mt-2.5">
                                  <div className="tree-node-title bg-light" onClick={() => handleOpenReceiptDrawer(receipt)}>
                                    <i className="fa-light fa-receipt text-success"></i>
                                    <span>Receipt: {receipt.ReceiptNo} (Paid ₹{receipt.Amount})</span>
                                    <span className="badge bg-light text-dark font-monospace">{receipt.MRType === "B" ? "Cheque/Bank" : receipt.MRType === "D" ? "UPI App" : "Cash"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIZ MODE 3: Database Relational Tree / Schema Map */}
              {vizMode === "schema" && (
                <div className="p-2">
                  <div className="alert alert-info border-0 p-3 mb-4 rounded-3 d-flex align-items-center gap-3" style={{ background: "rgba(13, 110, 253, 0.08)", color: "#0d6efd" }}>
                    <i className="fa-solid fa-circle-info fs-4"></i>
                    <div>
                      <strong>Interactive System Model Map:</strong> This diagram illustrates the precise primary and foreign key constraints linking patient transactions and reports in the PostgreSQL/MS SQL database system.
                    </div>
                  </div>

                  <div className="row g-4 justify-content-center">
                    {/* Table 1: Case01 */}
                    <div className="col-md-4">
                      <div className="schema-card">
                        <div className="schema-header">
                          <span>📋 table: case01</span>
                          <span className="badge bg-primary">Primary</span>
                        </div>
                        <div className="schema-fields">
                          <div className="schema-field-row"><span className="pk-key">🔑 CaseId</span> <span>VARCHAR (PK)</span></div>
                          <div className="schema-field-row"><span>CaseNo</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span>PatientName</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span>Age</span> <span>INT</span></div>
                          <div className="schema-field-row"><span>Sex</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span>Phone</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 DoctorId</span> <span>INT (FK)</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 AgentId</span> <span>INT (FK)</span></div>
                          <div className="schema-field-row"><span>Total</span> <span>DECIMAL</span></div>
                          <div className="schema-field-row"><span>GrossAmt</span> <span>DECIMAL</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Table 2: CaseDtl01 */}
                    <div className="col-md-4">
                      <div className="schema-card">
                        <div className="schema-header">
                          <span>🔬 table: casedtl01</span>
                          <span className="badge bg-warning text-dark">One-to-Many</span>
                        </div>
                        <div className="schema-fields">
                          <div className="schema-field-row"><span className="pk-key">🔑 CaseDtlId</span> <span>INT (PK)</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 CaseId</span> <span>VARCHAR (FK)</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 TestId</span> <span>VARCHAR (FK)</span></div>
                          <div className="schema-field-row"><span>Rate</span> <span>DECIMAL</span></div>
                          <div className="schema-field-row"><span>Delivery</span> <span>CHAR(1)</span></div>
                          <div className="schema-field-row"><span>DeliveryDate</span> <span>DATETIME</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Table 3: MoneyReceipt01 */}
                    <div className="col-md-4">
                      <div className="schema-card">
                        <div className="schema-header">
                          <span>💵 table: moneyreceipt01</span>
                          <span className="badge bg-success">One-to-Many</span>
                        </div>
                        <div className="schema-fields">
                          <div className="schema-field-row"><span className="pk-key">🔑 ReceiptId</span> <span>VARCHAR (PK)</span></div>
                          <div className="schema-field-row"><span>ReceiptNo</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 ReffId</span> <span>VARCHAR (FK)</span></div>
                          <div className="schema-field-row"><span>Amount</span> <span>DECIMAL</span></div>
                          <div className="schema-field-row"><span>DiscAmt</span> <span>DECIMAL</span></div>
                          <div className="schema-field-row"><span>ReceiptDate</span> <span>DATETIME</span></div>
                          <div className="schema-field-row"><span>MRType</span> <span>CHAR(1)</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schema Layer 2 */}
                  <div className="row g-4 mt-1 justify-content-center">
                    {/* Table 4: Test */}
                    <div className="col-md-4">
                      <div className="schema-card">
                        <div className="schema-header">
                          <span>🏷️ table: test</span>
                          <span className="badge bg-secondary">Catalog</span>
                        </div>
                        <div className="schema-fields">
                          <div className="schema-field-row"><span className="pk-key">🔑 TestId</span> <span>VARCHAR (PK)</span></div>
                          <div className="schema-field-row"><span>TestName</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span>Rate</span> <span>DECIMAL</span></div>
                          <div className="schema-field-row"><span>DescFormat</span> <span>INT</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Table 5: TestProperty */}
                    <div className="col-md-4">
                      <div className="schema-card">
                        <div className="schema-header">
                          <span>⚙️ table: testproperty</span>
                          <span className="badge bg-secondary">Catalog</span>
                        </div>
                        <div className="schema-fields">
                          <div className="schema-field-row"><span className="pk-key">🔑 TestPropertyId</span> <span>INT (PK)</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 TestId</span> <span>VARCHAR (FK)</span></div>
                          <div className="schema-field-row"><span>TestProperty</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span>UOM</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span>MinVal</span> <span>DECIMAL</span></div>
                          <div className="schema-field-row"><span>MaxVal</span> <span>DECIMAL</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Table 6: TestProVal */}
                    <div className="col-md-4">
                      <div className="schema-card">
                        <div className="schema-header">
                          <span>📝 table: testproval</span>
                          <span className="badge bg-danger">Dynamic Results</span>
                        </div>
                        <div className="schema-fields">
                          <div className="schema-field-row"><span className="pk-key">🔑 TestProValId</span> <span>INT (PK)</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 CaseId</span> <span>VARCHAR (FK)</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 TestId</span> <span>VARCHAR (FK)</span></div>
                          <div className="schema-field-row"><span className="fk-key">🔗 TestPropertyId</span> <span>INT (FK)</span></div>
                          <div className="schema-field-row"><span>TestProVal</span> <span>VARCHAR</span></div>
                          <div className="schema-field-row"><span>LISVal</span> <span>VARCHAR</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Dashboard Home / Empty State */
            <div className="panel workflow-canvas py-5 px-4 text-center d-flex flex-column align-items-center justify-content-center">
              <div className="p-4 bg-primary bg-opacity-10 rounded-circle text-primary mb-4" style={{ width: "96px", height: "96px" }}>
                <i className="fa-duotone fa-network-wired fa-3x"></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">Case Workflow Explorer</h3>
              <p className="text-muted max-w-md mx-auto mb-4" style={{ maxWidth: "480px" }}>
                Explore live admissions, lab queries, test properties, and money receipts in a unified interactive flow tree. Use the search bar above or click "Trace Flow" on any case list to begin.
              </p>
              
              <div className="row g-3 max-w-lg justify-content-center mt-2" style={{ maxWidth: "720px" }}>
                <div className="col-md-4">
                  <div className="p-3 bg-white border rounded-3 h-100 shadow-sm">
                    <i className="fa-duotone fa-magnifying-glass text-primary fa-lg mb-2"></i>
                    <h6 className="fw-bold text-dark small">1. Find Patient</h6>
                    <p className="text-muted small mb-0">Search via Name, Phone Number, or Case ID.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-white border rounded-3 h-100 shadow-sm">
                    <i className="fa-duotone fa-chart-network text-success fa-lg mb-2"></i>
                    <h6 className="fw-bold text-dark small">2. Trace Workflow</h6>
                    <p className="text-muted small mb-0">View full test status and payment receipts tree.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-white border rounded-3 h-100 shadow-sm">
                    <i className="fa-duotone fa-flask-potion text-warning fa-lg mb-2"></i>
                    <h6 className="fw-bold text-dark small">3. Open Drawers</h6>
                    <p className="text-muted small mb-0">Interact with nodes to inspect parameters and values.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* DETAILED GLASSMORPHIC SIDEBAR PANEL */}
      <div className={`drawer-overlay ${activeDrawer ? 'show' : ''}`} onClick={() => setActiveDrawer(null)}></div>
      <div className={`detail-drawer p-4 d-flex flex-column ${activeDrawer ? 'open' : ''}`}>
        
        {/* Drawer Header */}
        <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
          <h5 className="fw-bold text-dark m-0">
            {activeDrawer === 'test' ? (
              <><i className="fa-duotone fa-flask me-2 text-warning"></i>Lab Test Details</>
            ) : (
              <><i className="fa-duotone fa-receipt me-2 text-success"></i>Receipt Breakdown</>
            )}
          </h5>
          <button className="btn-close" onClick={() => setActiveDrawer(null)}></button>
        </div>

        {/* Drawer Body Scroll */}
        <OverlayScrollbarsComponent className="flex-grow-1">
          {activeDrawer === 'test' && selectedDrawerItem && (
            <div>
              <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-20 rounded-3 mb-4">
                <h6 className="fw-bold text-dark mb-1">{selectedDrawerItem.TestName}</h6>
                <div className="text-muted small">Test Code: <span className="text-dark fw-semibold">{selectedDrawerItem.TestId}</span></div>
                <div className="text-muted small">Report Date: <span className="text-dark fw-semibold">{selectedDrawerItem.ReportDate ? selectedDrawerItem.ReportDate.slice(0, 10) : "Pending"}</span></div>
                <div className="text-muted small">Status: <span className={`badge ${selectedDrawerItem.Delivery === "Y" ? "bg-success" : "bg-warning"} ms-1.5`}>{selectedDrawerItem.Delivery === "Y" ? "Report Delivered" : "Pending Approval"}</span></div>
              </div>

              <h6 className="fw-bold text-dark mb-2.5">Test Parameters & Property Values (testproval)</h6>
              {drawerLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                  <div className="text-muted small">Loading properties...</div>
                </div>
              ) : testProperties.length === 0 ? (
                <div className="alert alert-info py-2 px-3 small">No test properties configured for this test.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-dashed table-striped align-middle" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Value</th>
                        <th>UOM / Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testProperties.map((prop) => {
                        const valObj = testValues[prop.TestPropertyId] || {};
                        return (
                          <tr key={prop.TestPropertyId}>
                            <td className="text-dark fw-semibold">{prop.TestProperty}</td>
                            <td className="fw-bold text-primary font-monospace">{valObj.value ?? <span className="text-muted small font-normal fw-normal">Pending</span>}</td>
                            <td>
                              <div className="text-muted small">{prop.UOM || "N/A"}</div>
                              <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Range: {prop.MinVal || 0} - {prop.MaxVal || 0}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeDrawer === 'receipt' && selectedDrawerItem && (
            <div>
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold text-dark mb-0">Receipt: {selectedDrawerItem.ReceiptNo}</h6>
                  <span className="badge bg-success font-monospace fw-bold">₹{selectedDrawerItem.Amount}</span>
                </div>
                <div className="text-muted small">Date: <span className="text-dark fw-semibold">{selectedDrawerItem.ReceiptDate?.slice(0, 10)}</span></div>
                <div className="text-muted small">Remarks: <span className="text-dark fw-semibold">{selectedDrawerItem.Remarks || "Regular Payment"}</span></div>
              </div>

              <h6 className="fw-bold text-dark mb-2.5">Transaction Overview</h6>
              <table className="table table-bordered table-sm small">
                <tbody>
                  <tr>
                    <th>Receipt ID</th>
                    <td className="font-monospace">{selectedDrawerItem.ReceiptId}</td>
                  </tr>
                  <tr>
                    <th>Billed Bill Amt</th>
                    <td className="font-monospace">₹{selectedDrawerItem.BillAmount}</td>
                  </tr>
                  <tr>
                    <th>Discount Given</th>
                    <td className="font-monospace text-danger">₹{selectedDrawerItem.DiscAmt || 0}</td>
                  </tr>
                  <tr>
                    <th>Payment Mode</th>
                    <td>
                      <span className="badge bg-secondary">
                        {selectedDrawerItem.MRType === "B" ? "Cheque/Bank" : selectedDrawerItem.MRType === "D" ? "UPI App" : "Cash"}
                      </span>
                    </td>
                  </tr>
                  {selectedDrawerItem.MRType === "B" && (
                    <>
                      <tr>
                        <th>Bank Name</th>
                        <td>{selectedDrawerItem.BankName || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Cheque/Draft No</th>
                        <td>{selectedDrawerItem.ChequeNo || "N/A"}</td>
                      </tr>
                    </>
                  )}
                  {selectedDrawerItem.MRType === "D" && (
                    <>
                      <tr>
                        <th>UPI App Name</th>
                        <td>{selectedDrawerItem.BankName || "UPI Application"}</td>
                      </tr>
                      <tr>
                        <th>UTR Number</th>
                        <td className="font-monospace">{selectedDrawerItem.ChequeNo || "N/A"}</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <th>Narration</th>
                    <td>{selectedDrawerItem.Narration || "Payment entry recorded"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </OverlayScrollbarsComponent>

        {/* Drawer Actions */}
        <div className="pt-3 border-top mt-3 d-flex gap-2">
          <button className="btn btn-outline-secondary flex-fill" onClick={() => setActiveDrawer(null)}>
            Close
          </button>
          {activeDrawer === 'test' && selectedDrawerItem && (
            <button className="btn btn-primary flex-fill" onClick={() => navigate(`/LaboratoryQuery`)}>
              <i className="fa-light fa-flask me-1.5"></i>Laboratory Panel
            </button>
          )}
          {activeDrawer === 'receipt' && selectedDrawerItem && (
            <button className="btn btn-primary flex-fill" onClick={() => navigate(`/moneyreceipt`)}>
              <i className="fa-light fa-receipt me-1.5"></i>Receipt Ledger
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseFlowExplorer;
