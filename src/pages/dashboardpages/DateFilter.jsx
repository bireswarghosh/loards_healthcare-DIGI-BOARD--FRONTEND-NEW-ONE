import React from "react";

const DateFilter = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApply,
}) => {
  return (
    <>
      {/* 🎨 Custom CSS */}
      <style>{`
        .filter-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.06);
          transition: 0.3s;
        }

        .filter-card:hover {
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }

        .filter-title {
          font-weight: 600;
          color: #4e73df;
          margin-bottom: 12px;
        }

        .filter-input {
          border-radius: 10px;
          padding: 8px 10px;
          border: 1px solid #e0e6ff;
          transition: 0.2s;
        }

        .filter-input:focus {
          border-color: #4e73df;
          box-shadow: 0 0 0 0.1rem rgba(78,115,223,0.25);
        }

        .filter-btn {
          border-radius: 10px;
          font-weight: 500;
          transition: 0.2s;
        }

        .filter-btn:hover {
          transform: translateY(-1px);
        }

      .filter-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
  pointer-events: none;   /* 🔥 main fix */
}

        .input-wrapper {
          position: relative;
        }
      `}</style>

      <div className="filter-card mb-4">
        {/* Title */}
        <div className="filter-title">📅 Date Filter</div>

        <div className="row g-3 align-items-end">
          {/* From */}
          <div className="col-md-3">
            <label className="form-label small text-muted">From Date</label>

            <div className="input-wrapper">
              <input
                type="date"
                className="form-control filter-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="filter-icon">📅</span>
            </div>
          </div>

          {/* To */}
          <div className="col-md-3">
            <label className="form-label small text-muted">To Date</label>

            <div className="input-wrapper">
              <input
                type="date"
                className="form-control filter-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <span className="filter-icon">📅</span>
            </div>
          </div>

          {/* Buttons */}
          {/* <div className="col-md-3 d-flex gap-2">
            <button
              className="btn btn-primary filter-btn w-100"
              onClick={onApply}
            >
              🔍 Apply
            </button>

            <button
              className="btn btn-outline-secondary filter-btn w-100"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Reset
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default DateFilter;
