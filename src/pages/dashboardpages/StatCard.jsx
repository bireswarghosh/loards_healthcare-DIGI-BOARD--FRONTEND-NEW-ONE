// components/common/StatCard.jsx

import React from "react";
import CountUp from "react-countup";

const StatCard = ({ title, value, gradient, prefix = "", footer }) => {
  return (
    <div className="col-md-3">
      <div className="stat-anim">
        <div className="stat-card" style={{ background: gradient }}>
          <div className="stat-circle"></div>
          <div className="stat-circle-2"></div>

          <div className="stat-title">{title}</div>

          <div className="stat-value">
            {prefix}
            <CountUp end={value || 0} duration={1.2} />
          </div>

          <div className="stat-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
