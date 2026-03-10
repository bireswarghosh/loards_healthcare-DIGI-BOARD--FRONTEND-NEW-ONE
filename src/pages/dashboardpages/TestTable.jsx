import React from "react";

const TestTable = ({ data, totalTests }) => {
  return (
    <div className="container-fluid mt-4">
      <div className="card shadow border-0">
        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">Patient Test List</h5>

          
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 text-start">
              <thead className="bg-white text-danger ">
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  <th style={{ minWidth: "350px" }}>Tests</th>
                  <th>Case ID</th>
                </tr>
              </thead>

              <tbody>
                {data?.map((item, index) => (
                  <tr key={index}>
                    <td className="fw-bold text-secondary text-start">
                      {index + 1}
                    </td>

                    <td className="text-start">
                      {item.tests?.map((test, i) => (
                        <span
                          key={i}
                          className={`badge ${(test.Cancel == null || test.Cancel == 0) ? "bg-success" : "bg-danger"} me-1 mb-1`}
                        >
                          {test.TestName}
                        </span>
                      ))}
                    </td>

                    <td className="fw-semibold text-primary text-start">
                      {item.CaseId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTable;
