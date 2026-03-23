import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const PatientCompareGraph = ({
  today,
  yesterday,
  thisMonth,
  lastMonth,
  thisYear,
  lastYear,
}) => {
  const [mode, setMode] = useState("daily");

  const getValues = () => {
    if (mode === "monthly") return { current: thisMonth, previous: lastMonth };
    if (mode === "yearly") return { current: thisYear, previous: lastYear };
    return { current: today, previous: yesterday };
  };

  const values = getValues();
  const current = Number(values.current) || 0;
  const previous = Number(values.previous) || 0;

  const difference = current - previous;

  const percent =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : ((difference / previous) * 100).toFixed(2);

  const data = [
    { label: "Previous", patients: previous },
    { label: "Current", patients: current },
  ];

  return (
    <>
      {/* 🎨 SAME CSS */}
      <style>{`
        .premium-card {
          border-radius: 16px;
          padding: 2px;
          background: linear-gradient(135deg, #4e73df, #1cc88a, #36b9cc);
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .premium-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.18);
        }

        .premium-inner {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
        }

        .premium-header {
          background: linear-gradient(45deg, #4e73df, #224abe);
          color: #fff;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .premium-header h6 {
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .premium-badge {
          background: #fff;
          color: #333;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 600;
        }

        .premium-body {
          padding: 12px;
        }

        .mode-btn {
          border: none;
          background: #f1f3f7;
          padding: 4px 10px;
          border-radius: 20px;
          margin-left: 5px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .mode-btn.active {
          background: #4e73df;
          color: #fff;
        }
      `}</style>

      <div className="premium-card m-2 mt-4">
        <div className="premium-inner">
          {/* HEADER */}
          <div className="premium-header">
            <h6>📊 Patient Comparison</h6>

            <div>
              <span className="premium-badge me-2">{mode.toUpperCase()}</span>

              <button
                className={`mode-btn ${mode === "daily" ? "active" : ""}`}
                onClick={() => setMode("daily")}
              >
                D
              </button>

              <button
                className={`mode-btn ${mode === "monthly" ? "active" : ""}`}
                onClick={() => setMode("monthly")}
              >
                M
              </button>

              <button
                className={`mode-btn ${mode === "yearly" ? "active" : ""}`}
                onClick={() => setMode("yearly")}
              >
                Y
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="premium-body">
            {/* ANALYTICS */}
            <div className="d-flex justify-content-around text-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">{current}</h5>
                <small className="text-muted">Current</small>
              </div>

              <div>
                <h5
                  className="fw-bold mb-0"
                  style={{ color: difference >= 0 ? "#1cc88a" : "#e74a3b" }}
                >
                  {difference >= 0 ? "+" : ""}
                  {difference}
                </h5>
                <small className="text-muted">Diff</small>
              </div>

              <div>
                <h5
                  className="fw-bold mb-0"
                  style={{ color: difference >= 0 ? "#1cc88a" : "#e74a3b" }}
                >
                  {percent}%
                </h5>
                <small className="text-muted">Change</small>
              </div>
            </div>

            {/* GRAPH */}
            <ResponsiveContainer width="100%" minHeight={310}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="2 2" opacity={0.2} />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />

                <YAxis tick={{ fontSize: 12 }} />

                <Tooltip
                  formatter={(value) => [`${value} Patients`, ""]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#4e73df"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  animationDuration={800}
                >
                  <LabelList
                    dataKey="patients"
                    position="top"
                    style={{
                      fill: "#333",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientCompareGraph;
