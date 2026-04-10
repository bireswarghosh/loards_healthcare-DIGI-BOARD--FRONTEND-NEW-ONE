import React from "react";

const DashboardSkeleton = () => {
  return (
    <>
      <style>
        {`
        .skeleton {
          background: linear-gradient(
            90deg,
            #e0e0e0 25%,
            #f5f5f5 50%,
            #e0e0e0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton-card {
          background: #fff;
          border-radius: 14px;
          padding: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.05);
        }

        .dashboard-bg {
          background: #bbd4f7;
          min-height: 100vh;
          padding: 20px;
        }
        `}
      </style>

      <div className="dashboard-bg">
        <div className="container-fluid">
          
          {/* 🔍 Filter Skeleton */}
          <div className="mb-3 skeleton-card">
            <div className="d-flex gap-3">
              <div className="skeleton" style={{ height: 40, width: 150 }}></div>
              <div className="skeleton" style={{ height: 40, width: 150 }}></div>
              <div className="skeleton" style={{ height: 40, width: 120 }}></div>
            </div>
          </div>

          {/* 📊 Table + Graph */}
          <div className="row g-4 mb-3">
            <div className="col-lg-8">
              <div className="skeleton-card">
                <div className="skeleton mb-3" style={{ height: 30, width: "40%" }}></div>

                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton mb-2" style={{ height: 20 }}></div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="skeleton-card">
                <div className="skeleton mb-3" style={{ height: 30, width: "50%" }}></div>
                <div className="skeleton" style={{ height: 200 }}></div>
              </div>
            </div>
          </div>

          {/* 📋 Another Table */}
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="skeleton-card">
                <div className="skeleton mb-3" style={{ height: 30, width: "40%" }}></div>

                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton mb-2" style={{ height: 20 }}></div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default DashboardSkeleton;