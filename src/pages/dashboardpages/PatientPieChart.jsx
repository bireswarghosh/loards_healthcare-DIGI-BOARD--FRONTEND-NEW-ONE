import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PatientPieChart = ({
  total = 0,
  insured = 0,
  title = "Insured Patients",
}) => {
  const nonInsured = total - insured;

  const data = [
    { name: "Insured", value: insured },
    { name: "Others", value: nonInsured },
  ];

  const COLORS = ["#1cc88a", "#4e73df"];

  return (
    <>
      {/* 🎨 SAME STYLE */}
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
          position: relative;
        }

        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .pie-center h4 {
          margin: 0;
          font-weight: 700;
          color: #333;
        }

        .pie-center span {
          font-size: 12px;
          color: #888;
        }

        .legend-row {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
          font-size: 13px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }
      `}</style>

      <div className="premium-card m-2 mt-4">
        <div className="premium-inner">
          {/* Header */}
          <div className="premium-header">
            <h6>📊 {title}</h6>
            <span className="premium-badge">Overview</span>
          </div>

          {/* Body */}
          <div className="premium-body">
            {/* Center Text */}
            <div className="pie-center">
              <h4>{total}</h4>
              <span>Total</span>
            </div>

            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index]}
                      style={{
                        filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.1))",
                      }}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="legend-row">
              <div>
                <span className="dot" style={{ background: COLORS[0] }}></span>
                Insured ({insured})
              </div>

              <div>
                <span className="dot" style={{ background: COLORS[1] }}></span>
                Others ({nonInsured})
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientPieChart;
