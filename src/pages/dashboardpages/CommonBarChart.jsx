import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const CommonBarChart = ({
  data = [],
  title = "Chart",
  dataKey = "name",
  valueKey = "totalPatients",
  topCount = 5,
}) => {
  const colors = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

  const getRank = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <>
      {/* 🎨 CSS */}
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

        .top-highlight {
          filter: drop-shadow(0px 0px 6px rgba(255,215,0,0.6));
        }
      `}</style>

      <div className="premium-card m-2 mt-4">
        <div className="premium-inner">
          {/* Header */}
          <div className="premium-header">
            <h6>📊 {title}</h6>
            <span className="premium-badge">Top {topCount}</span>
          </div>

          {/* Body */}
          <div className="premium-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="2 2" opacity={0.2} />

                {/* X Axis */}
                <XAxis
                  dataKey={dataKey}
                  tickFormatter={(value) => value.split(" ")[0]}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />

                {/* Y Axis */}
                <YAxis tick={{ fontSize: 12 }} />

                {/* Tooltip */}
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} Patients`,
                    props.payload[dataKey],
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                  }}
                />

                {/* Bars */}
                <Bar
                  dataKey={valueKey}
                  radius={[10, 10, 0, 0]}
                  barSize={32}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      className={index === 0 ? "top-highlight" : ""}
                    />
                  ))}

                  {/* Label */}
                  <LabelList
                    dataKey={valueKey}
                    position="top"
                    tickformatter={(value, entry, index) =>
                      `${getRank(index)} ${value}`
                    }
                    style={{
                      fill: "#333",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommonBarChart;
