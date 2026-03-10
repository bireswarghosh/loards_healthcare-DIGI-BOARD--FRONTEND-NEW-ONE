import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import useAxiosFetch from "../../templates/DiagnosisMaster/Fetch";
import CountUp from "react-countup";
import TestTable from "./TestTable";
import ZLoader from "../../templates/DiagnosisMaster/ZLoader";

const PathologyDashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const fetchTests = async () => {
    try {
      setLoading(true);
      if (startDate && endDate) {
        const res = await axiosInstance.get(
          `/case01/cases-with-details?page=1&limit=999&startDate=${startDate}&endDate=${endDate}`
        );
        // const totalTests = res.data.totalTests;
        setResponse(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTests();
  }, [startDate, endDate]);

  return (
    <>
      <div>
        {loading ? (
          <ZLoader/>
        ) : (
          <div className="">
            <div className="mx-5 my-5">
              <div className="row g-20">
                <div className="col-md-3">
                  <label className="form-label">Date From</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Date To</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="row g-5 mt-2">
                <div className="col-md-3">
                  <div className="card text-white bg-warning mb-3">
                    <div className="card-header text-black">Header</div>
                    <div className="card-body text-black">
                      <h5 className="card-title">TOTAL TEST</h5>
                      <h1>
                        {response ? (
                          <CountUp end={response.meta.numberTests.totalTests} />
                        ) : (
                          0
                        )}
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card   text-bg-success mb-3">
                    <div className="card-header text-white">Header</div>
                    <div className="card-body">
                      <h5 className="card-title">SUCCESSFUL TEST</h5>
                      <h1>
                        {response ? (
                          <CountUp
                            end={response.meta.numberTests.activeTests}
                          />
                        ) : (
                          0
                        )}
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-white bg-danger mb-3">
                    <div className="card-header text-white ">Header</div>
                    <div className="card-body ">
                      <h5 className="card-title">CANCEL TEST</h5>

                      <h1>
                        {" "}
                        {response ? (
                          <CountUp
                            end={response.meta.numberTests.cancelledTests}
                          />
                        ) : (
                          0
                        )}
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-black bg-light mb-3">
                    <div className="card-header text-black">Header</div>
                    <div className="card-body">
                      <h5 className="card-title">Total Revenue</h5>

                      <h1>
                        {response ? (
                          <>
                            ₹<CountUp end={response.meta.totalGrossAmt} />
                          </>
                        ) : (
                          0
                        )}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <TestTable data={response.data} totalTests={response.totalTests} />
          </div>
        )}
      </div>
    </>
  );
};

export default PathologyDashboard;
