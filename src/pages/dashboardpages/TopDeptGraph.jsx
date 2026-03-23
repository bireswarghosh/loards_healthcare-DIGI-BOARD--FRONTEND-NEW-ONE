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

const TopDeptGraph = ({ data = [] }) => {
  const colors = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

  const getRankBadge = (index) => {
    // if (index === 0) return "🥇";
    // if (index === 1) return "🥈";
    // if (index === 2) return "🥉";
    // return `#${index + 1}`;
  };

  return (
    <div className="card shadow border-4 m-2 mt-4">
      {/* Header */}
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">🏆 Top Patient Dept</h6>
        <span className="badge bg-light text-dark">Top 5</span>
      </div>

      {/* Body */}
      <div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data} // ❗ layout removed
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="2 2" opacity={0.3} />

            {/* X Axis → Category */}
            <XAxis
              dataKey="Department"
              tick={{ fontSize: 12, fontWeight: 600 }}
              tickFormatter={(value, index) =>
                `${getRankBadge(index) ||""} ${value}`
              }
            />

            {/* Y Axis → Number */}
            <YAxis tick={{ fontSize: 12 }} />

            <Tooltip
              formatter={(value) => [`${value} Patients`, "Count"]}
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />

            <Bar dataKey="totalPatients" radius={[10, 10, 0, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}

              {/* Show count on top */}
              <LabelList
                dataKey="totalPatients"
                position="top"
                style={{ fill: "#333", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopDeptGraph;
