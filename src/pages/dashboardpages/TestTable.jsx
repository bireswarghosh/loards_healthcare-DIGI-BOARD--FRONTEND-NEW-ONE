import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

const TestTable = ({ data, totalTests }) => {
  return (
    <>
      {/* 🎨 SAME ULTRA CSS */}
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
        }

        .ad-badge {
          background: white;
          color: #333;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
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

        .ad-rank {
          background: #eef2ff;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #4e73df;
        }

        .scroll-area::-webkit-scrollbar {
          width: 6px;
        }

        .scroll-area::-webkit-scrollbar-thumb {
          background: linear-gradient(#4e73df, #1cc88a);
          border-radius: 10px;
        }

        .badge {
          font-size: 11px;
          padding: 5px 7px;
          border-radius: 6px;
        }
      `}</style>

      <div className="container-fluid mt-4">
        <div className="ad-ultra-card">
          <div className="ad-inner">
            {/* Header */}
            <div className="ad-header">
              <h5>🧪 Patient Test List</h5>
              <span className="ad-badge">Total: {totalTests}</span>
            </div>

            {/* Table */}
            <div
              className="table-responsive scroll-area"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table className="table ad-table mb-0 text-start">
                <thead className="sticky-top">
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Case ID</th>
                    <th>Tests</th>
                  </tr>
                </thead>

                <tbody>
                  {data?.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <span className="ad-rank">#{index + 1}</span>
                        </td>

                        <td className="fw-semibold">{item.PatientName}</td>

                        <td className="fw-bold text-primary">{item.CaseId}</td>

                        <td>
                          {item.tests?.slice(0, 2).map((test, i) => (
                            <span
                              key={i}
                              className={`badge ${
                                test.Cancel == null || test.Cancel == 0
                                  ? "bg-success"
                                  : test.Cancel == 2
                                    ? "bg-warning text-dark"
                                    : "bg-danger"
                              } me-1 mb-1`}
                            >
                              {test.TestName}
                            </span>
                          ))}

                          {item.tests?.length > 3 && (
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              rootClose
                              overlay={
                                <Popover>
                                  <Popover.Header as="h6">
                                    All Tests
                                  </Popover.Header>
                                  <Popover.Body>
                                    {item.tests.map((test, i) => (
                                      <span
                                        key={i}
                                        className={`badge ${
                                          test.Cancel == null ||
                                          test.Cancel == 0
                                            ? "bg-success"
                                            : test.Cancel == 2
                                              ? "bg-warning text-dark"
                                              : "bg-danger"
                                        } me-1 mb-1`}
                                      >
                                        {test.TestName}
                                      </span>
                                    ))}
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <span
                                className="badge bg-secondary me-1 mb-1"
                                style={{ cursor: "pointer" }}
                              >
                                +{item.tests.length - 3}
                              </span>
                            </OverlayTrigger>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-muted">
                        🚫 No Data Found
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

export default TestTable;
