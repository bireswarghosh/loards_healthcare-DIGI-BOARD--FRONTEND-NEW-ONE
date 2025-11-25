import React, { useState, useEffect, useCallback } from "react"; // ADDED React IMPORT
import { useSearchParams } from "react-router-dom";
// New Imports from ReferalMaster.jsx theme
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../../components/footer/Footer";
import axiosInstance from "../../../axiosInstance";
import { set } from "date-fns";

// Helper to check for small screens, mirroring logic in ReferalMaster.jsx
const isBelowLg = window.innerWidth < 1200;

const CompanyTestRate = () => {
  const [showSubDep, setShowSubDep] = useState(false);
  const [showDeptWise, setShowDeptWise] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false)

  const toggle = (showState) => {
    if (showState === "subdep") {
      setShowSubDep(true);
      setShowDeptWise(false);
        setShowGlobal(false)
    } else if (showState === "dept") {
      setShowDeptWise(true);
      setShowSubDep(false);
      setShowGlobal(false)
    } else {
        setShowGlobal(true)
      setShowSubDep(false);
      setShowDeptWise(false);
    }
  };

  const [searchParams] = useSearchParams();
  const [referals, setReferals] = useState([]);
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [testRates, setTestRates] = useState({});
  const [selectedReferalId, setSelectedReferalId] = useState(
    searchParams.get("referalId") || ""
  );
  const [selectedReferalName, setSelectedReferalName] = useState(
    decodeURIComponent(searchParams.get("referalName") || "")
  );
  const [globalPercent, setGlobalPercent] = useState("");
  const [globalYN, setGlobalYN] = useState("N");
  const [deptPercent, setDeptPercent] = useState("");
  const [deptRate, setDeptRate] = useState("");
  const [deptYN, setDeptYN] = useState("N");
  const [subDeptPercent, setSubDeptPercent] = useState("");
  const [subDeptYN, setSubDeptYN] = useState("N");
  const [activeMode, setActiveMode] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [modifiedTests, setModifiedTests] = useState(new Set());
  const [error, setError] = useState(null);

  // Wrapping fetch functions in useCallback for consistency with ReferalMaster.jsx
  const fetchReferals = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/referal");
      if (response.data)
        setReferals(
          Array.isArray(response.data)
            ? response.data
            : response.data.data || []
        );
    } catch (error) {
      console.error("Error:", error);
      setError("Error fetching referals list.");
    }
  }, []);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/diagnostic/tests");
      if (response.data.success) {
        setTests(response.data.data);

        const ratesObj = {};
        response.data.data.forEach((test) => {
          ratesObj[test.TestId] = {
            percent: 0,
            rate: test.Rate || 0,
            id: null,
            defaultRate: test.Rate || 0,
          };
        });
        setTestRates(ratesObj);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error fetching diagnostic tests.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/department");
      if (response.data)
        setDepartments(
          Array.isArray(response.data)
            ? response.data
            : response.data.data || []
        );
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  const fetchSubDepartments = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/subdepartment");
      if (response.data)
        setSubDepartments(
          Array.isArray(response.data)
            ? response.data
            : response.data.data || []
        );
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  const loadReferalData = useCallback(
    async (referalId) => {
      if (referalId && tests.length > 0) {
        try {
          const res = await axiosInstance.get(
            `/company-test-rate?referalId=${referalId}`
          );
          if (res.data.success) {
            const ratesObj = {};
            // Initialize rates with defaults/zeros
            tests.forEach((test) => {
              ratesObj[test.TestId] = {
                percent: 0,
                rate: test.Rate || 0,
                id: null,
                defaultRate: test.Rate || 0,
              };
            });

            // Overwrite with saved rates
            res.data.data.forEach((r) => {
              if (ratesObj[r.test_id]) {
                ratesObj[r.test_id].percent = r.percent;
                ratesObj[r.test_id].rate = r.rate;
                ratesObj[r.test_id].id = r.id;
              }
            });

            setTestRates(ratesObj);
          }
        } catch (error) {
          console.error("Error:", error);
          setError("Error loading referal specific rates.");
        }
      }
    },
    [tests]
  ); // Dependency on tests ensures we have the base test list

  useEffect(() => {
    fetchReferals();
    fetchTests();
    fetchDepartments();
    fetchSubDepartments();

    const referalId = searchParams.get("referalId");
    if (referalId) {
      setSelectedReferalId(referalId);
      setSelectedReferalName(
        decodeURIComponent(searchParams.get("referalName") || "")
      );
    }
  }, [
    searchParams,
    fetchReferals,
    fetchTests,
    fetchDepartments,
    fetchSubDepartments,
  ]);

  useEffect(() => {
    if (selectedReferalId) {
      loadReferalData(selectedReferalId);
    }
  }, [selectedReferalId, loadReferalData]);

  const handleReferalSelect = (referal) => {
    setSelectedReferalId(referal.ReferalId);
    setSelectedReferalName(referal.Referal);
    // loadReferalData will be called via useEffect due to selectedReferalId change
  };

  const handlePercentChange = (testId, value) => {
    setTestRates((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], percent: value },
    }));
    setModifiedTests((prev) => new Set(prev).add(testId));
  };

  const handleRateChange = (testId, value) => {
    setTestRates((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], rate: value },
    }));
    setModifiedTests((prev) => new Set(prev).add(testId));
  };

  const applyGlobalPercent = () => {
    if (globalYN !== "Y") {
      alert("Please select Y to apply percent");
      return;
    }
    if (!globalPercent) {
      alert("Please enter percent value");
      return;
    }
    const updatedRates = {};
    const modified = new Set();
    tests.forEach((test) => {
      updatedRates[test.TestId] = {
        ...testRates[test.TestId],
        percent: globalPercent,
      };
      modified.add(test.TestId.toString());
    });
    setTestRates((prev) => ({ ...prev, ...updatedRates }));
    setModifiedTests(modified);
    alert(`Applied ${globalPercent}% to all tests!`);
  };

  const applyDeptPercent = () => {
    if (deptYN !== "Y") {
      alert("Please select Y to apply department wise percent");
      return;
    }
    if (!selectedDepartment) {
      alert("Please select a department");
      return;
    }
    if (!deptPercent && !deptRate) {
      alert("Please enter percent or rate value");
      return;
    }
    const updatedRates = {};
    const modified = new Set(modifiedTests);
    const selectedDept = departments.find(
      (d) => d.Department === selectedDepartment
    );
    tests
      .filter((t) => {
        const testSubDept = subDepartments.find(
          (sd) => sd.SubDepartmentId === t.SubDepartmentId
        );
        return testSubDept?.DepartmentId === selectedDept?.DepartmentId;
      })
      .forEach((test) => {
        updatedRates[test.TestId] = {
          ...testRates[test.TestId],
          percent: deptPercent || 0,
          // If deptRate is provided, use it, otherwise keep the current rate (or default rate)
          rate: deptRate
            ? parseFloat(deptRate)
            : testRates[test.TestId]?.rate || test.Rate,
        };
        modified.add(test.TestId.toString());
      });
    setTestRates((prev) => ({ ...prev, ...updatedRates }));
    setModifiedTests(modified);
    alert(`Applied to ${selectedDepartment} department!`);
  };

  const applySubDeptPercent = () => {
    if (subDeptYN !== "Y") {
      alert("Please select Y to apply subdepartment wise percent");
      return;
    }
    if (!selectedSubDepartment) {
      alert("Please select a subdepartment");
      return;
    }
    if (!subDeptPercent) {
      alert("Please enter percent value");
      return;
    }
    const updatedRates = {};
    const modified = new Set(modifiedTests);
    tests
      .filter((t) => {
        const testSubDept = subDepartments.find(
          (sd) => sd.SubDepartmentId === t.SubDepartmentId
        );
        return testSubDept?.SubDepartment === selectedSubDepartment;
      })
      .forEach((test) => {
        updatedRates[test.TestId] = {
          ...testRates[test.TestId],
          percent: subDeptPercent,
        };
        modified.add(test.TestId.toString());
      });
    setTestRates((prev) => ({ ...prev, ...updatedRates }));
    setModifiedTests(modified);
    alert(`Applied to ${selectedSubDepartment} subdepartment!`);
  };

  const handleSave = async () => {
    if (!selectedReferalId) {
      alert("Please select referal");
      return;
    }

    // Filter tests to include only modified ones OR those with an existing ID (for delete)
    const dataToSave = [];

    // Check all tests, not just modified ones, to handle scenarios where a rate is reset to default
    tests.forEach((test) => {
      const testId = test.TestId.toString();
      const data = testRates[testId] || testRates[test.TestId];

      if (data) {
        const isModified = modifiedTests.has(testId);
        const defaultRate = test.Rate || 0;

        const currentPercent = parseFloat(data.percent) || 0;
        const currentRate = parseFloat(data.rate) || 0;

        if (isModified || data.id) {
          // Include if modified OR if it has an existing rate (to allow for updating/deleting)
          dataToSave.push({
            referalId: selectedReferalId,
            testId: testId,
            percent: currentPercent,
            rate: currentRate,
            id: data.id, // Include ID for update/delete handling on backend
          });
        }
      }
    });

    if (dataToSave.length === 0) {
      alert("No changes to save");
      return;
    }

    try {
      setLoading(true);
      // Send all data in ONE request
      await axiosInstance.post("/company-test-rate/bulk-save", {
        data: dataToSave,
      });

      alert(`Saved ${dataToSave.length} test(s) successfully!`);
      setModifiedTests(new Set());
      await loadReferalData(selectedReferalId); // Re-load data to ensure consistency
    } catch (error) {
      console.error("Error:", error);
      setError("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    const groupedTests = {};
    tests.forEach((test) => {
      const subDept = subDepartments.find(
        (sd) => sd.SubDepartmentId === test.SubDepartmentId
      );
      const dept = departments.find(
        (d) => d.DepartmentId === subDept?.DepartmentId
      );
      const deptName = dept?.Department || "Others";
      const subDeptName = subDept?.SubDepartment || "Others";
      const key = `${deptName}|${subDeptName}`;
      if (!groupedTests[key]) groupedTests[key] = [];
      groupedTests[key].push(test);
    });

    let slNo = 0;

    return (
      <table className="table table-dashed table-hover digi-dataTable table-striped mb-0">
        <thead className="sticky-top">
          <tr>
            <th>Sl.No.</th>
            <th>Test Name</th>
            <th>Department</th>
            <th>Sub Department</th>
            <th className="text-end">Percent[%]</th>
            <th className="text-end">Rate[₹]</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center py-4">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="text-muted mt-2">Loading Tests...</p>
              </td>
            </tr>
          ) : tests.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4">
                No tests found
              </td>
            </tr>
          ) : (
            Object.entries(groupedTests).map(([key, testsInGroup]) => {
              const [dept, subDept] = key.split("|");
              return (
                // Changed React.Fragment to shorthand <>
                <React.Fragment key={key}>
                  <tr className="fw-bold">
                    <td colSpan="6">
                      {dept} - {subDept}
                    </td>
                  </tr>
                  {testsInGroup.map((test) => {
                    slNo++;
                    const isModified = modifiedTests.has(
                      test.TestId.toString()
                    );
                    const currentRateData = testRates[test.TestId];
                    const rowClass = isModified ? "table-warning" : "";

                    return (
                      <tr key={test.TestId} className={rowClass}>
                        <td>{slNo}</td>
                        <td>{test.Test}</td>
                        <td>{dept}</td>
                        <td>{subDept}</td>
                        <td className="text-end">
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            style={{ width: "80px" }}
                            value={currentRateData?.percent || 0}
                            onChange={(e) =>
                              handlePercentChange(
                                test.TestId.toString(),
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="text-end">
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            style={{ width: "100px" }}
                            value={currentRateData?.rate || test.Rate || 0}
                            onChange={(e) =>
                              handleRateChange(
                                test.TestId.toString(),
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    );
  };

  return (
    // Updated Main Structure to match ReferalMaster.jsx
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <div className="panel">
            <div className="panel-header">
              <h5>
                🧪 Company Test Rate - {selectedReferalName || "Select Referal"}
              </h5>
            </div>

            <div className="panel-body">
              {/* Referal Selection */}
              <div className="row mb-4 align-items-end g-3">
                <div className="col-md-3">
                  <label className="form-label fw-bold">🧑‍🤝‍🧑 Referal Name</label>
                  <select
                    className="form-select" // Changed from form-control to form-select
                    value={selectedReferalId}
                    onChange={(e) => {
                      const referal = referals.find(
                        (r) => r.ReferalId === parseInt(e.target.value)
                      );
                      if (referal) handleReferalSelect(referal);
                    }}
                    disabled={loading}
                  >
                    <option value="">Select Referal</option>
                    {referals.map((r) => (
                      <option key={r.ReferalId} value={r.ReferalId}>
                        {r.Referal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rate Application Controls */}
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="col g-3">
                    {/* Global Percent */}
                    <div className="col-md-3">
                      <label className="form-label">Global Percent</label>
                      <div className="input-group">
                        <select
                          className="form-select"
                          style={{ maxWidth: "60px" }}
                          value={globalYN}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGlobalYN(val);
                            if (val === "Y") {
                              setDeptYN("N");
                              setSubDeptYN("N");
                              setActiveMode("global");
                              toggle("global");
                            } else {
                              setActiveMode(null);
                              setShowGlobal(false)
                            }
                          }}
                          disabled={loading}
                        >
                          <option value="N">N</option>
                          <option value="Y">Y</option>
                        </select>
                        {showGlobal && (<>
                         <input
                          type="number"
                          className="form-control"
                          placeholder="Percent"
                          value={globalPercent}
                          onChange={(e) => setGlobalPercent(e.target.value)}
                          disabled={globalYN !== "Y" || loading}
                        />
                        <span className="input-group-text">%</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={applyGlobalPercent}
                          disabled={globalYN !== "Y" || loading}
                        >
                          OK
                        </button>
                        </>)}
                        
                       
                      </div>
                    </div>
                    {/* Department Percent/Rate */}
                    <div className="col-md-4">
                      <label className="form-label mt-3">Department Wise</label>
                      <div className="input-group">
                        <select
                          className="form-select"
                          style={{ maxWidth: "60px" }}
                          value={deptYN}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDeptYN(val);
                            if (val === "Y") {
                              setGlobalYN("N");
                              setSubDeptYN("N");
                              setActiveMode("dept");
                              toggle("dept");
                            } else {
                              setActiveMode(null);
                              setShowDeptWise(false);
                            }
                          }}
                          disabled={loading}
                        >
                          <option value="N">N</option>
                          <option value="Y">Y</option>
                        </select>
                        {showDeptWise && (
                          <>
                            <select
                              className="form-select"
                              value={selectedDepartment}
                              onChange={(e) =>
                                setSelectedDepartment(e.target.value)
                              }
                              disabled={deptYN !== "Y" || loading}
                            >
                              <option value="">Select Department</option>
                              {departments.map((d) => (
                                <option
                                  key={d.DepartmentId}
                                  value={d.Department}
                                >
                                  {d.Department}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              className="form-control"
                              placeholder="%"
                              style={{ maxWidth: "60px" }}
                              value={deptPercent}
                              onChange={(e) => setDeptPercent(e.target.value)}
                              disabled={deptYN !== "Y" || loading}
                            />
                            <span className="input-group-text">%</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Rate"
                              style={{ maxWidth: "60px" }}
                              value={deptRate}
                              onChange={(e) => setDeptRate(e.target.value)}
                              disabled={deptYN !== "Y" || loading}
                            />
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={applyDeptPercent}
                              disabled={deptYN !== "Y" || loading}
                            >
                              OK
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* SubDepartment Percent */}
                    <div className="col-md-5">
                      <label className="form-label mt-3">SubDep. Wise</label>
                      <div className="input-group">
                        <select
                          className="form-select"
                          style={{ maxWidth: "60px" }}
                          value={subDeptYN}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubDeptYN(val);
                            if (val === "Y") {
                              toggle("subdep");
                              setGlobalYN("N");
                              setDeptYN("N");
                              setActiveMode("subdept");
                            } else {
                              setShowSubDep(false);
                              setActiveMode(null);
                            }
                          }}
                          disabled={loading}
                        >
                          <option value="N">N</option>
                          <option value="Y">Y</option>
                        </select>
                        {showSubDep && (
                          <>
                            <select
                              className="form-select"
                              value={selectedSubDepartment}
                              onChange={(e) =>
                                setSelectedSubDepartment(e.target.value)
                              }
                              disabled={subDeptYN !== "Y" || loading}
                            >
                              <option value="">Select SubDepartment</option>
                              {subDepartments.map((sd) => (
                                <option
                                  key={sd.SubDepartmentId}
                                  value={sd.SubDepartment}
                                >
                                  {sd.SubDepartment}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              className="form-control"
                              placeholder="Percent"
                              style={{ maxWidth: "80px" }}
                              value={subDeptPercent}
                              onChange={(e) =>
                                setSubDeptPercent(e.target.value)
                              }
                              disabled={subDeptYN !== "Y" || loading}
                            />
                            <span className="input-group-text">%</span>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={applySubDeptPercent}
                              disabled={subDeptYN !== "Y" || loading}
                            >
                              OK
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table of Tests */}
              <div className="card">
                <div className="card-body p-0">
                  <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    {isBelowLg ? (
                      <OverlayScrollbarsComponent
                        options={{ scrollbars: { autoHide: "scroll" } }}
                      >
                        {renderTable()}
                      </OverlayScrollbarsComponent>
                    ) : (
                      renderTable()
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-3 text-center">
                <button
                  className="btn btn-success me-2"
                  onClick={handleSave}
                  disabled={loading || modifiedTests.size === 0}
                >
                  {loading ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyTestRate;
