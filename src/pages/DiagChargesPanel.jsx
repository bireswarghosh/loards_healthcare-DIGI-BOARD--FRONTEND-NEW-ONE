import React, { useState } from "react";
import axiosInstance from "../axiosInstance";

const DiagChargesPanel = ({ diagData, allTests, styles }) => {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [mrData, setMrData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClick = async (idx, caseId) => {
    if (expandedIdx === idx) { setExpandedIdx(null); setMrData([]); return; }
    setExpandedIdx(idx);
    setLoading(true);
    try {
      const r = await axiosInstance.get(`/money-receipt01/search?ReffId=${caseId}`);
      setMrData(r.data.success ? r.data.data : []);
    } catch { setMrData([]); }
    setLoading(false);
  };

  const fmtDate = (raw) => {
    if (!raw) return "";
    const d = raw.includes("T") ? raw.split("T")[0] : raw.split(" ")[0];
    return d ? d.split("-").reverse().join("/") : "";
  };

  if (!diagData || diagData.length === 0) {
    return <div style={{ padding: "20px", color: "#999", textAlign: "center", fontSize: "12px" }}>No diagnostic data found.</div>;
  }

  const totals = diagData.reduce((acc, r) => {
    const total = Number(r.GrossAmt || 0);
    const disc = Number(r.DescAmt || r.Desc || 0);
    const payment = total - Number(r.Balance || 0);
    const due = total - payment;
    return { total: acc.total + total, disc: acc.disc + disc, payment: acc.payment + payment, due: acc.due + due };
  }, { total: 0, disc: 0, payment: 0, due: 0 });

  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e3f2fd" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a237e, #3f51b5)", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>🧪 Diagnostic Charges ({diagData.length})</span>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px" }}>Click row to expand</span>
      </div>

      {/* Table */}
      <table className="table table-sm mb-0" style={{ fontSize: "11px" }}>
        <thead>
          <tr style={{ background: "#e8eaf6" }}>
            <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1a237e", fontSize: "10px" }}>Date</th>
            <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1a237e", fontSize: "10px" }}>Case No.</th>
            <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1a237e", fontSize: "10px" }} className="text-end">Total</th>
            <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1a237e", fontSize: "10px" }} className="text-end">Disc</th>
            <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1a237e", fontSize: "10px" }} className="text-end">Paid</th>
            <th style={{ padding: "6px 8px", fontWeight: 700, color: "#1a237e", fontSize: "10px" }} className="text-end">Due</th>
          </tr>
        </thead>
        <tbody>
          {diagData.map((row, idx) => {
            const total = Number(row.GrossAmt || 0);
            const disc = Number(row.DescAmt || row.Desc || 0);
            const payment = total - Number(row.Balance || 0);
            const due = total - payment;
            const isExp = expandedIdx === idx;
            return (
              <React.Fragment key={idx}>
                <tr
                  onClick={() => handleClick(idx, row.CaseId)}
                  style={{
                    cursor: "pointer",
                    background: isExp ? "linear-gradient(90deg, #e3f2fd, #bbdefb)" : idx % 2 === 0 ? "#fff" : "#f8f9fa",
                    transition: "all 0.2s",
                    borderLeft: isExp ? "3px solid #3f51b5" : "3px solid transparent",
                  }}
                >
                  <td style={{ padding: "6px 8px", fontSize: "11px" }}>{fmtDate(row.CaseDate)}</td>
                  <td style={{ padding: "6px 8px", fontSize: "11px", fontWeight: 600 }}>
                    <span style={{ display: "inline-block", width: "14px", textAlign: "center", color: "#3f51b5", fontSize: "9px" }}>{isExp ? "\u25BC" : "\u25B6"}</span>
                    {row.CaseNo || ""}
                  </td>
                  <td className="text-end" style={{ padding: "6px 8px", fontWeight: 600 }}>{total.toLocaleString()}</td>
                  <td className="text-end" style={{ padding: "6px 8px", color: disc > 0 ? "#e65100" : "#999" }}>{disc}</td>
                  <td className="text-end" style={{ padding: "6px 8px", color: "#2e7d32", fontWeight: 600 }}>{payment.toLocaleString()}</td>
                  <td className="text-end" style={{ padding: "6px 8px", color: due < 0 ? "#d32f2f" : due > 0 ? "#e65100" : "#2e7d32", fontWeight: 700 }}>{due}</td>
                </tr>

                {isExp && (
                  <tr>
                    <td colSpan="6" style={{ padding: 0 }}>
                      <div style={{ background: "linear-gradient(180deg, #f5f5f5, #fff)", borderTop: "1px solid #e0e0e0", borderBottom: "2px solid #3f51b5" }}>
                        
                        {/* Tests Section */}
                        {row.tests && row.tests.length > 0 && (
                          <div style={{ padding: "10px 14px", borderBottom: "1px dashed #e0e0e0" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "#1a237e", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ background: "#3f51b5", color: "#fff", borderRadius: "4px", padding: "1px 6px", fontSize: "9px" }}>{row.tests.length}</span>
                              Tests
                            </div>
                            <div style={{ display: "grid", gap: "2px" }}>
                              {row.tests.map((t, ti) => (
                                <div key={ti} style={{
                                  display: "flex", justifyContent: "space-between", alignItems: "center",
                                  fontSize: "10px", padding: "3px 10px",
                                  background: t.CancelTast == 1 ? "#ffebee" : ti % 2 === 0 ? "#ede7f6" : "#fff",
                                  borderRadius: "4px", borderLeft: t.CancelTast == 1 ? "2px solid #d32f2f" : "2px solid #7c4dff",
                                }}>
                                  <span style={{ fontWeight: 500 }}>
                                    {allTests[t.TestId]?.Test || t.TestId}
                                    {t.CancelTast == 1 && <span style={{ color: "#d32f2f", fontWeight: 700, marginLeft: "6px", fontSize: "9px", background: "#ffcdd2", padding: "0 4px", borderRadius: "3px" }}>CANCEL</span>}
                                  </span>
                                  <span style={{ fontWeight: 700, color: t.CancelTast == 1 ? "#d32f2f" : "#1a237e" }}>
                                    {t.CancelTast == 1 ? "0" : `₹${t.Rate || 0}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Payment History Section */}
                        <div style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: "10px", fontWeight: 800, color: "#1a237e", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ background: "#2e7d32", color: "#fff", borderRadius: "4px", padding: "1px 6px", fontSize: "9px" }}>{mrData.length}</span>
                            Payment History
                          </div>
                          {loading ? (
                            <div style={{ fontSize: "10px", color: "#666", padding: "6px" }}>Loading...</div>
                          ) : mrData.length === 0 ? (
                            <div style={{ fontSize: "10px", color: "#999", padding: "6px", background: "#fff3e0", borderRadius: "6px", textAlign: "center" }}>No payments found for this case</div>
                          ) : (
                            <div style={{ display: "grid", gap: "4px" }}>
                              {mrData.map((mr, mi) => (
                                <div key={mi} style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "6px 10px", borderRadius: "8px",
                                  background: "linear-gradient(90deg, #e8f5e9, #fff)",
                                  border: "1px solid #c8e6c9",
                                  transition: "all 0.2s",
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{
                                      background: "linear-gradient(135deg, #2e7d32, #4caf50)", color: "#fff",
                                      borderRadius: "50%", width: "20px", height: "20px",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: "9px", fontWeight: 800, boxShadow: "0 2px 4px rgba(46,125,50,0.3)",
                                    }}>{mi + 1}</span>
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: "11px", color: "#1b5e20" }}>{mr.ReceiptNo || ""}</div>
                                      <div style={{ fontSize: "9px", color: "#666" }}>{fmtDate(mr.ReceiptDate)}</div>
                                    </div>
                                    {Number(mr.DiscAmt || 0) > 0 && (
                                      <span style={{ fontSize: "9px", color: "#e65100", background: "#fff3e0", padding: "1px 6px", borderRadius: "10px", fontWeight: 600 }}>Disc: ₹{mr.DiscAmt}</span>
                                    )}
                                  </div>
                                  <span style={{
                                    fontWeight: 800, fontSize: "12px",
                                    color: Number(mr.Amount) < 0 ? "#d32f2f" : "#2e7d32",
                                    background: Number(mr.Amount) < 0 ? "#ffebee" : "#e8f5e9",
                                    padding: "2px 8px", borderRadius: "6px",
                                  }}>
                                    {Number(mr.Amount) < 0 ? "-" : ""}₹{Math.abs(Number(mr.Amount || 0)).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Totals Footer */}
      <div style={{
        background: "linear-gradient(135deg, #1a237e, #283593)",
        padding: "8px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", fontWeight: 700 }}>TOTAL</span>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Amount</div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#fff" }}>₹{totals.total.toLocaleString()}</div>
          </div>
          {totals.disc > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Disc</div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffcc80" }}>₹{totals.disc.toLocaleString()}</div>
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Paid</div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#a5d6a7" }}>₹{totals.payment.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Due</div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: totals.due <= 0 ? "#a5d6a7" : "#ef9a9a" }}>₹{totals.due.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagChargesPanel;
