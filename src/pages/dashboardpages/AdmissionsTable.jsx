import React from "react";

const AdmissionsTable = ({ data = [], totalPatients = 0 }) => {
  return (
    <>
      {/* 🎨 Advanced CSS */}
      <style>{`
        .ad-ultra-card {
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(135deg, #4e73df, #1cc88a, #36b9cc);
          padding: 2px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .ad-ultra-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.15);
        }

        .ad-inner {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          overflow: hidden;
        }

        .ad-header {
          background: linear-gradient(45deg, #4e73df, #224abe);
          color: white;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ad-header h5 {
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .ad-badge {
          background: white;
          color: #333;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .ad-table thead {
          background: #f1f5ff;
          color: #4e73df;
          font-size: 13px;
          border-bottom: 2px solid #e0e6ff;
        }

        .ad-table tbody tr {
          transition: all 0.25s ease;
        }

        .ad-table tbody tr:hover {
          background: #eef4ff;
          transform: scale(1.01);
          box-shadow: inset 4px 0 0 #4e73df;
        }

        .ad-table td, .ad-table th {
          padding: 12px 10px;
          vertical-align: middle;
        }

        .ad-id {
          font-weight: 700;
          color: #4e73df;
        }

        .ad-name {
          font-weight: 500;
        }

        .ad-date {
          font-size: 13px;
          color: #888;
        }

        .ad-phone {
          font-size: 13px;
          color: #666;
        }

        .ad-rank {
          background: #eef2ff;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #4e73df;
        }

        .no-data {
          padding: 40px;
          text-align: center;
          color: #bbb;
          font-weight: 500;
        }

        .scroll-area::-webkit-scrollbar {
          width: 6px;
        }

        .scroll-area::-webkit-scrollbar-thumb {
          background: linear-gradient(#4e73df, #1cc88a);
          border-radius: 10px;
        }
      `}</style>

      <div className="container-fluid mt-4">
        <div className="ad-ultra-card">
          <div className="ad-inner">
            {/* Header */}
            <div className="ad-header">
              <h5>📋 Admission Dashboard</h5>
              <span className="ad-badge">👨‍⚕️ {totalPatients} Patients</span>
            </div>

            {/* Table */}
            <div
              className="table-responsive scroll-area"
              style={{ maxHeight: "420px", overflowY: "auto" }}
            >
              <table className="table ad-table mb-0">
                <thead className="sticky-top">
                  <tr>
                    <th>#</th>
                    <th>Admission</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Contact</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={item.AdmitionID}>
                        <td>
                          <span className="ad-rank">#{index + 1}</span>
                        </td>

                        <td className="ad-id">{item.AdmitionNo}</td>

                        <td className="ad-name">{item.PatientName}</td>

                        <td className="ad-date"> {item.AdmitionDate?.split("T")[0]}</td>

                        <td className="ad-phone">📞 {item.PhoneNo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        🚫 No Admission Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdmissionsTable;
