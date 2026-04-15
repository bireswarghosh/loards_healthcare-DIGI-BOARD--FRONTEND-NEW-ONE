import React, { useState, useRef } from "react";
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
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [agentGroups, setAgentGroups] = useState([]);
  const [grandTotals, setGrandTotals] = useState({ bill: 0, disc: 0, net: 0, receipt: 0, balance: 0 });

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Fetch all cases in date range (up to 1000)
      const res = await axiosInstance.get(
        `/case01/search?startDate=${startDate}&endDate=${endDate}&page=1&limit=1000`
      );
      const cases = res.data?.data || [];

      // Fetch agents map
      const agentRes = await axiosInstance.get("/agents?page=1&limit=1000");
      const agentMap = {};
      (agentRes.data?.data || []).forEach((a) => { agentMap[a.AgentId] = a.Agent; });

      // Fetch test details for each case
      const enriched = await Promise.all(
        cases.map(async (c) => {
          try {
            const dtlRes = await axiosInstance.get(`/case-dtl-01/case/${c.CaseId}`);
            const tests = dtlRes.data?.data || [];
            // Fetch test names
            const namedTests = await Promise.all(
              tests.map(async (t) => {
                try {
                  const tRes = await axiosInstance.get(`/tests/${t.TestId}`);
                  return { ...t, TestName: tRes.data?.data?.Test || t.TestId, Rate: tRes.data?.data?.Rate || t.Rate || 0 };
                } catch {
                  return { ...t, TestName: t.TestId };
                }
              })
            );
            return { ...c, tests: namedTests };
          } catch {
            return { ...c, tests: [] };
          }
        })
      );

      // Group by AgentId
      const groups = {};
      enriched.forEach((c) => {
        const agentId = c.AgentId || 0;
        const agentName = agentMap[agentId] || "DIRECT";
        if (!groups[agentId]) groups[agentId] = { agentName, cases: [] };
        groups[agentId].cases.push(c);
      });

      // Sort agents by name
      const sorted = Object.values(groups).sort((a, b) => a.agentName.localeCompare(b.agentName));

      // Compute totals
      let gBill = 0, gDisc = 0, gNet = 0, gReceipt = 0, gBalance = 0;
      sorted.forEach((g) => {
        g.cases.forEach((c) => {
          const bill = parseFloat(c.Total || 0);
          const disc = parseFloat(c.DescAmt || 0);
          const net = parseFloat(c.GrossAmt || 0);
          const receipt = parseFloat(c.Advance || 0);
          const balance = net - receipt;
          gBill += bill; gDisc += disc; gNet += net; gReceipt += receipt; gBalance += balance;
        });
      });

      setAgentGroups(sorted);
      setGrandTotals({ bill: gBill, disc: gDisc, net: gNet, receipt: gReceipt, balance: gBalance });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
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
                {/* Report Header */}
                <div className="header text-center mb-3">
                  <div className="fw-bold fs-5">LORDS DIAGNOSTIC</div>
                  <div className="small">13/3, CIRCULAR 2ND BYE LANE,</div>
                  <div className="fw-bold text-danger mt-1" style={{ fontSize: "1rem" }}>
                    AGENT WISE SALE REPORT (DETAIL)
                  </div>
                  <div className="d-flex justify-content-between mt-1 small">
                    <span>As On : {fmt(today)}</span>
                    <span>From : {fmt(startDate)} &nbsp;&nbsp; To : {fmt(endDate)}</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>

                {/* Column Headers */}
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

                {/* Agent Groups */}
                {agentGroups.map((group, gi) => {
                  let subBill = 0, subDisc = 0, subNet = 0, subReceipt = 0, subBalance = 0;
                  group.cases.forEach((c) => {
                    subBill += parseFloat(c.Total || 0);
                    subDisc += parseFloat(c.DescAmt || 0);
                    subNet += parseFloat(c.GrossAmt || 0);
                    subReceipt += parseFloat(c.Advance || 0);
                    subBalance += parseFloat(c.GrossAmt || 0) - parseFloat(c.Advance || 0);
                  });

                  return (
                    <div key={gi} className="mb-2">
                      {/* Agent Name Header */}
                      <div className="fw-bold" style={{ color: "red", fontSize: "0.85rem", padding: "4px 0" }}>
                        AGENT NAME : &nbsp;
                        <span style={{ color: "#8B0000" }}>{group.agentName}</span>
                      </div>

                      <table className="table table-sm mb-0" style={{ fontSize: "0.82rem" }}>
                        <tbody>
                          {group.cases.map((c, ci) => {
                            const testTotal = c.tests.reduce((s, t) => s + parseFloat(t.Rate || 0), 0);
                            const cNet = parseFloat(c.GrossAmt || 0);
                            const cReceipt = parseFloat(c.Advance || 0);
                            const cBalance = cNet - cReceipt;

                            return (
                              <React.Fragment key={ci}>
                                {/* Case row */}
                                <tr>
                                  <td style={{ width: "12%" }} className="fw-bold text-primary">{c.CaseNo}</td>
                                  <td style={{ width: "9%" }}>{fmt(c.CaseDate)}</td>
                                  <td style={{ width: "25%" }} className="fw-bold">{c.PatientName}</td>
                                  <td></td>
                                  <td></td><td></td><td></td><td></td><td></td>
                                </tr>
                                {/* Doctor row */}
                                <tr>
                                  <td></td><td></td>
                                  <td style={{ color: "#555" }}>Dr. {c.DoctorName || ""}</td>
                                  <td></td>
                                  <td></td><td></td><td></td><td></td><td></td>
                                </tr>
                                {/* Test rows */}
                                {c.tests.map((t, ti) => (
                                  <tr key={ti}>
                                    <td></td><td></td>
                                    <td><em>{t.TestName}</em></td>
                                    <td></td>
                                    <td className="text-end">{num(t.Rate)}</td>
                                    <td></td><td></td><td></td><td></td>
                                  </tr>
                                ))}
                                {/* Test Total row */}
                                <tr style={{ color: "red", fontStyle: "italic" }}>
                                  <td></td><td></td><td></td>
                                  <td className="text-end fw-bold"><em>Test TOTAL :</em></td>
                                  <td className="text-end">{num(c.Total)}</td>
                                  <td className="text-end">{num(c.DescAmt)}</td>
                                  <td className="text-end">{num(0)}</td>
                                  <td className="text-end">{num(cReceipt)}</td>
                                  <td className="text-end">{num(0)}</td>
                                </tr>
                              </React.Fragment>
                            );
                          })}

                          {/* Sub Total */}
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

                {/* Grand Total */}
                <table className="table table-sm mt-2" style={{ fontSize: "0.82rem" }}>
                  <tbody>
                    <tr style={{ color: "red", fontWeight: "bold", border: "2px solid red" }}>
                      <td style={{ width: "55%" }}></td>
                      <td className="text-end fw-bold">Grand Total :</td>
                      <td className="text-end">{num(grandTotals.bill)}</td>
                      <td className="text-end">{num(grandTotals.disc)}</td>
                      <td className="text-end">{num(grandTotals.net)}</td>
                      <td className="text-end">{num(grandTotals.receipt)}</td>
                      <td className="text-end">{num(grandTotals.balance)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Print footer */}
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
