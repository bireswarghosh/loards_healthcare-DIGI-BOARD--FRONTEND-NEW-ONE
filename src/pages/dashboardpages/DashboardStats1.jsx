import React from "react";
import StatCard from "./StatCard";

const DashboardStats1 = ({ config = [] }) => {
  return (
    <div className="row g-4 mt-2">
      {config.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
};

export default DashboardStats1;
