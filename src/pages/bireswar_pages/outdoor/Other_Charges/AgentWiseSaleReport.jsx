import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance";
import Footer from "../../../../components/footer/Footer";
import { useNavigate } from "react-router-dom";

const today = new Date().toISOString().slice(0, 10);
const fmt = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};
const num = (v) => parseFloat(v || 0).toFixed(2);

const AgentWiseSaleReport = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const dropdownRef = useRef();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [agentGroups, setAgentGroups] = useState([]);
  const [grandTotals, setGrandTotals] = useState({ bill: 0, disc: 0, net: 0, receipt: 0, balance: 0 });
  const [allAgents, setAllAgents] = useState([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
  const [agentSearch, setAgentSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dueFilter, setDueFilter] = useState("all"); // "all" | "due" | "nodue"

  useEffect(() => {
    axiosInstance.get("/agents?page=1&limit=1000").then((res) => {
      setAllAgents(res.data?.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleAgent = (id) => {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredAgents = allAgents.filter((a) =>
    a.Agent?.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Split date range into 31-day chunks to avoid API limit
      const chunks = [];
      let chunkStart = new Date(startDate);
      const end = new Date(endDate);
      while (chunkStart <= end) {
        let chunkEnd = new Date(chunkStart);
        chunkEnd.setDate(chunkEnd.getDate() + 30);
        if (chunkEnd > end) chunkEnd = end;
        chunks.push({ from: chunkStart.toISOString().slice(0, 10), to: chunkEnd.toISOString().slice(0, 10) });
        chunkStart = new Date(chunkEnd);
        chunkStart.setDate(chunkStart.getDate() + 1);
      }

      let allGroups = [];
      for (const chunk of chunks) {
        let url = `/case-dtl-01/agent-wise-report?fromDate=${chunk.from}&toDate=${chunk.to}`;
        if (selectedAgentIds.length > 0) {
          url += `&agentIds=${selectedAgentIds.join(",")}`;
        }
        const res = await axiosInstance.get(url);
        const data = res.data?.data || [];
        // Merge by agentName
        data.forEach((g) => {
          const existing = allGroups.find((x) => x.agentName === g.agentName);
          if (existing) {
            existing.cases.push(...g.cases);
          } else {
            allGroups.push({ ...g, cases: [...g.cases] });
          }
        });
      }

      const groups = allGroups;

      let gBill = 0, gDisc = 0, gNet = 0, gReceipt = 0, gBalance = 0;
      groups.forEach((g) => {
        g.cases.forEach((c) => {
          gBill += c.Total;
          gDisc += c.DescAmt;
          gNet += c.GrossAmt;
          gReceipt += c.Advance;
          gBalance += c.GrossAmt - c.Advance;
        });
      });

      setAgentGroups(groups);
      setGrandTotals({ bill: gBill, disc: gDisc, net: gNet, receipt: gReceipt, balance: gBalance });
      setDueFilter("all");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter groups based on due filter
  const getFilteredGroups = () => {
    if (dueFilter === "all") return agentGroups;
    return agentGroups.map(g => ({
      ...g,
      cases: g.cases.filter(c => {
        const bal = c.GrossAmt - c.Advance;
        return dueFilter === "due" ? bal > 0 : bal <= 0;
      })
    })).filter(g => g.cases.length > 0);
  };

  const filteredGroups = getFilteredGroups();

  // Recalculate grand totals for filtered data
  const filteredTotals = (() => {
    let bill = 0, disc = 0, net = 0, receipt = 0, balance = 0;
    filteredGroups.forEach(g => g.cases.forEach(c => {
      const cancelAmt = c.tests.reduce((s, t) => s + (t.CancelTast === "1" ? parseFloat(t.Rate || 0) : 0), 0);
      bill += c.Total - cancelAmt; disc += c.DescAmt; net += c.GrossAmt - cancelAmt;
      receipt += c.Advance; balance += (c.GrossAmt - cancelAmt) - c.Advance;
    }));
    return { bill, disc, net, receipt, balance };
  })();

  const handlePrint = () => {
    const headerEl = document.getElementById("print-header");
    headerEl.style.display = "block";
    const content = printRef.current.innerHTML;
    headerEl.style.display = "none";
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Agent Wise Sale Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 3px 6px; }
        .text-center { text-align: center; }
        .text-end { text-align: right; }
        .fw-bold { font-weight: bold; }
        .agent-header { color: red; font-weight: bold; margin: 8px 0 4px; }
        .test-total { color: red; font-style: italic; }
        .sub-total { color: blue; font-weight: bold; border-top: 1px dashed #999; border-bottom: 1px dashed #999; }
        .grand-total { color: red; font-weight: bold; border: 2px solid red; }
        .header { text-align: center; margin-bottom: 10px; }
        .col-header { border-top: 1px solid #000; border-bottom: 1px solid #000; font-weight: bold; }
        @media print { body { margin: 10px; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <div className="main-content">
        <div className="panel">
          <div className="panel-header d-flex justify-content-between align-items-center">
            <h5>Agent Wise Sale Report (Detail)</h5>
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  {selectedAgentIds.length === 0 ? "All Agents" : `${selectedAgentIds.length} Agent(s)`}
                  <span className="ms-1">▾</span>
                </button>
                {dropdownOpen && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, zIndex: 9999,
                    background: "#fff", border: "1px solid #ccc", borderRadius: 4,
                    minWidth: 240, maxHeight: 280, overflowY: "auto", padding: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="Search agent..."
                      value={agentSearch}
                      onChange={(e) => setAgentSearch(e.target.value)}
                      autoFocus
                    />
                    <div className="mb-1">
                      <button className="btn btn-xs btn-link p-0 small text-danger"
                        onClick={() => setSelectedAgentIds([])}>
                        Clear All
                      </button>
                    </div>
                    {filteredAgents.map((a) => (
                      <label key={a.AgentId} className="d-flex align-items-center gap-2 py-1 px-1"
                        style={{ cursor: "pointer", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        <input type="checkbox"
                          checked={selectedAgentIds.includes(a.AgentId)}
                          onChange={() => toggleAgent(a.AgentId)}
                        />
                        {a.Agent}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <label className="mb-0 small fw-bold">From:</label>
              <input type="date" className="form-control form-control-sm" style={{ width: 140 }}
                value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <label className="mb-0 small fw-bold">To:</label>
              <input type="date" className="form-control form-control-sm" style={{ width: 140 }}
                value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <button className="btn btn-sm btn-primary" onClick={fetchReport} disabled={loading}>
                {loading ? "Loading..." : "Generate"}
              </button>
              {agentGroups.length > 0 && (
                <button className="btn btn-sm btn-success" onClick={handlePrint}>
                  <i className="fa-light fa-print me-1"></i>Print
                </button>
              )}
              {agentGroups.length > 0 && (
                <select className="form-select form-select-sm" style={{ width: 120 }}
                  value={dueFilter} onChange={(e) => setDueFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="due">Due Only</option>
                  <option value="nodue">No Due</option>
                </select>
              )}
              <button className="btn btn-sm btn-danger" onClick={() => navigate(-1)}>Back</button>
            </div>
          </div>

          <div className="panel-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Generating report...</p>
              </div>
            ) : agentGroups.length === 0 ? (
              <div className="text-center text-muted py-5">Click Generate to load report</div>
            ) : (
              <div ref={printRef}>
                <div className="header text-center mb-3" id="print-header" style={{ display: "none" }}>
                  <div className="fw-bold fs-5">LORDS HEALTH CARE (NURSING HOME)</div>
                  <div className="small fw-bold">(A UNIT of MJJ Enterprises Pvt. Ltd.)</div>
                  <div className="small">13/3, Circular 2nd Bye Lane, Kona Expressway,</div>
                  <div className="small">(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.</div>
                  <div className="small">E-mail: patientdesk@lordshealthcare.org</div>
                  <div className="small">Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895</div>
                  <div className="fw-bold text-danger mt-1" style={{ fontSize: "1rem" }}>
                    AGENT WISE SALE REPORT (DETAIL)
                  </div>
                  <div className="d-flex justify-content-between mt-1 small">
                    <span>As On : {fmt(today)}</span>
                    <span>From : {fmt(startDate)} &nbsp;&nbsp; To : {fmt(endDate)}</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>

                <table className="table table-sm mb-0" style={{ fontSize: "0.82rem" }}>
                  <thead>
                    <tr className="col-header" style={{ borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
                      <th style={{ width: "12%" }}>Case No</th>
                      <th style={{ width: "9%" }}>Date</th>
                      <th style={{ width: "25%" }}>
                        Patient Name<br />
                        <span className="fw-normal">Doctor</span><br />
                        <em>Test Details</em>
                      </th>
                      <th></th>
                      <th className="text-end" style={{ width: "9%" }}>Bill Amt</th>
                      <th className="text-end" style={{ width: "9%" }}>DiscCancel</th>
                      <th className="text-end" style={{ width: "8%" }}>NetAmt</th>
                      <th className="text-end" style={{ width: "9%" }}>Receipt</th>
                      <th className="text-end" style={{ width: "9%" }}>Balance</th>
                    </tr>
                  </thead>
                </table>

                {filteredGroups.map((group, gi) => {
                  let subBill = 0, subDisc = 0, subNet = 0, subReceipt = 0, subBalance = 0;
                  group.cases.forEach((c) => {
                    const cancelAmt = c.tests.reduce((s, t) => s + (t.CancelTast === "1" ? parseFloat(t.Rate || 0) : 0), 0);
                    subBill += c.Total - cancelAmt;
                    subDisc += c.DescAmt;
                    subNet += c.GrossAmt - cancelAmt;
                    subReceipt += c.Advance;
                    subBalance += (c.GrossAmt - cancelAmt) - c.Advance;
                  });

                  return (
                    <div key={gi} className="mb-2">
                      <div className="fw-bold" style={{ color: "red", fontSize: "0.85rem", padding: "4px 0" }}>
                        AGENT NAME : &nbsp;
                        <span style={{ color: "#8B0000" }}>{group.agentName}</span>
                      </div>

                      <table className="table table-sm mb-0" style={{ fontSize: "0.82rem" }}>
                        <tbody>
                          {group.cases.map((c, ci) => {
                            const cancelledAmt = c.tests.reduce((sum, t) => sum + (t.CancelTast === "1" ? parseFloat(t.Rate || 0) : 0), 0);
                            const cBill = c.Total - cancelledAmt;
                            const cNet = c.GrossAmt - cancelledAmt;
                            const cReceipt = c.Advance;
                            const cBalance = cNet - cReceipt;

                            return (
                              <React.Fragment key={ci}>
                                <tr>
                                  <td style={{ width: "12%" }} className="fw-bold text-primary">{c.CaseNo}</td>
                                  <td style={{ width: "9%" }}>{fmt(c.CaseDate)}</td>
                                  <td style={{ width: "25%" }} className="fw-bold">{c.PatientName}</td>
                                  <td></td>
                                  <td></td><td></td><td></td><td></td><td></td>
                                </tr>
                                <tr>
                                  <td></td><td></td>
                                  <td style={{ color: "#555" }}>Dr. {c.DoctorName || ""}</td>
                                  <td></td>
                                  <td></td><td></td><td></td><td></td><td></td>
                                </tr>
                                {c.tests.map((t, ti) => {
                                  const isCancelled = t.CancelTast === "1";
                                  return (
                                    <tr key={ti} style={isCancelled ? { color: "red", fontWeight: "bold" } : {}}>
                                      <td></td><td></td>
                                      <td><em>{t.TestName}{isCancelled && " (Cancel)"}</em></td>
                                      <td></td>
                                      <td className="text-end">{num(isCancelled ? 0 : t.Rate)}</td>
                                      <td></td><td></td><td></td><td></td>
                                    </tr>
                                  );
                                })}
                                <tr style={{ color: "red", fontStyle: "italic" }}>
                                  <td></td><td></td><td></td>
                                  <td className="text-end fw-bold"><em>Test TOTAL :</em></td>
                                  <td className="text-end">{num(cBill)}</td>
                                  <td className="text-end">{num(c.DescAmt)}</td>
                                  <td className="text-end">{num(cNet)}</td>
                                  <td className="text-end">{num(cReceipt)}</td>
                                  <td className="text-end">{num(cBalance)}</td>
                                </tr>
                              </React.Fragment>
                            );
                          })}

                          <tr style={{ color: "blue", fontWeight: "bold", borderTop: "1px dashed #aaa", borderBottom: "1px dashed #aaa" }}>
                            <td></td><td></td><td></td>
                            <td className="text-end">SUB TOTAL :</td>
                            <td className="text-end">{num(subBill)}</td>
                            <td className="text-end">{num(subDisc)}</td>
                            <td className="text-end">{num(subNet)}</td>
                            <td className="text-end">{num(subReceipt)}</td>
                            <td className="text-end">{num(subBalance)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}

                <table className="table table-sm mt-2" style={{ fontSize: "0.82rem" }}>
                  <tbody>
                    <tr style={{ color: "red", fontWeight: "bold", border: "2px solid red" }}>
                      <td style={{ width: "55%" }}></td>
                      <td className="text-end fw-bold">Grand Total :</td>
                      <td className="text-end">{num(filteredTotals.bill)}</td>
                      <td className="text-end">{num(filteredTotals.disc)}</td>
                      <td className="text-end">{num(filteredTotals.net)}</td>
                      <td className="text-end">{num(filteredTotals.receipt)}</td>
                      <td className="text-end">{num(filteredTotals.balance)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-3 small fw-bold">
                  Print Date &amp; Time : {fmt(today)} &nbsp;&nbsp;
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AgentWiseSaleReport;
