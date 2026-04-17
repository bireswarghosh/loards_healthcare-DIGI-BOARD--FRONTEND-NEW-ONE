import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../axiosInstance";

const chipStyle = {
  display: "inline-flex", alignItems: "center", background: "#e3f2fd",
  color: "#1565c0", borderRadius: "16px", padding: "4px 10px", margin: "3px",
  fontSize: "12px", fontWeight: 500,
};
const chipRemoveStyle = {
  marginLeft: "6px", cursor: "pointer", fontWeight: "bold",
  fontSize: "14px", color: "#c62828", lineHeight: 1,
};

const DeptWiseTestReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [admissionType, setAdmissionType] = useState("");
  const [subDepartments, setSubDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);
  const [testSuggestions, setTestSuggestions] = useState([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [deptFilter, setDeptFilter] = useState("");
  const searchTimeout = useRef(null);
  const testRef = useRef(null);
  const deptRef = useRef(null);

  useEffect(() => {
    axiosInstance.get("/subdepartment").then((res) => {
      const subDepts = res.data.data || [];
      setSubDepartments(subDepts);
      const uniqueDepts = [];
      const seen = new Set();
      subDepts.forEach((sd) => {
        if (sd.Department && !seen.has(sd.Department)) {
          seen.add(sd.Department);
          uniqueDepts.push({ Department: sd.Department, DepartmentId: sd.DepartmentId });
        }
      });
      setDepartments(uniqueDepts);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (testRef.current && !testRef.current.contains(e.target)) setShowTestSuggestions(false);
      if (deptRef.current && !deptRef.current.contains(e.target)) setShowDeptDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTestSearch = (value) => {
    setTestSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value || value.length < 2) {
      setTestSuggestions([]);
      setShowTestSuggestions(false);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      axiosInstance
        .get(`/tests/search/advanced?test=${encodeURIComponent(value)}&page=1&limit=20`)
        .then((res) => {
          const already = new Set(selectedTests.map((t) => t.TestId));
          setTestSuggestions((res.data.data || []).filter((t) => !already.has(t.TestId)));
          setShowTestSuggestions(true);
        })
        .catch(() => {
          setTestSuggestions([]);
          setShowTestSuggestions(false);
        });
    }, 300);
  };

  const addTest = (test) => {
    if (!selectedTests.find((t) => t.TestId === test.TestId)) {
      setSelectedTests((prev) => [...prev, test]);
    }
    setTestSearch("");
    setTestSuggestions([]);
    setShowTestSuggestions(false);
  };

  const removeTest = (testId) => {
    setSelectedTests((prev) => prev.filter((t) => t.TestId !== testId));
  };

  const toggleDept = (dept) => {
    setSelectedDepts((prev) =>
      prev.includes(dept.Department)
        ? prev.filter((d) => d !== dept.Department)
        : [...prev, dept.Department]
    );
  };

  const removeDept = (deptName) => {
    setSelectedDepts((prev) => prev.filter((d) => d !== deptName));
  };

  const filteredDepts = departments.filter((d) =>
    d.Department.toLowerCase().includes(deptFilter.toLowerCase())
  );

  const groupData = (data) => {
    const map = {};
    data.forEach((item) => {
      if (!map[item.Department]) {
        map[item.Department] = {
          name: item.Department, tests: [],
          deptTotalQty: Number(item.deptTotalQty),
          deptTotalAmount: Number(item.deptTotalAmount),
        };
      }
      map[item.Department].tests.push(item);
    });
    return Object.values(map);
  };

  const getGrandTotal = (grouped) => {
    let totalQty = 0, totalAmount = 0;
    grouped.forEach((dept) => { totalQty += dept.deptTotalQty; totalAmount += dept.deptTotalAmount; });
    return { totalQty, totalAmount };
  };

  const handlePrint = async () => {
    if (!fromDate || !toDate) { alert("Select date range"); return; }

    let url = `/case-dtl-01/test-report?fromDate=${fromDate}&toDate=${toDate}`;
    if (selectedTests.length > 0) {
      const testNames = selectedTests.map((t) => t.Test).join(",");
      url += `&testName=${encodeURIComponent(testNames)}`;
    }
    if (selectedDepts.length > 0) {
      url += `&department=${encodeURIComponent(selectedDepts.join(","))}`;
    }
    if (admissionType) url += `&admissionType=${admissionType}`;

    const res = await axiosInstance.get(url);
    const grouped = groupData(res.data.data);
    setData(grouped);
    const grand = getGrandTotal(grouped);

    setTimeout(() => {
      const printContents = document.getElementById("print-area").innerHTML;
      const filterInfo = [
        selectedTests.length > 0 && `Tests: ${selectedTests.map((t) => t.Test).join(", ")}`,
        selectedDepts.length > 0 && `Depts: ${selectedDepts.join(", ")}`,
        admissionType && `Type: ${admissionType.toUpperCase()}`,
      ].filter(Boolean).join(" | ");

      const newWindow = window.open("", "_blank");
      newWindow.document.write(`
        <html>
          <head>
            <title>Department Report</title>
            <style>
              body { font-family: Arial; padding: 20px; }
              h2, p { text-align: center; margin: 0; }
              .date-range { text-align: center; margin: 10px 0; font-weight: bold; }
              .dept { margin-top: 20px; page-break-inside: avoid; }
              table { width: 100%; border-collapse: collapse; margin-top: 5px; }
              th, td { border: 1px solid black; padding: 6px; font-size: 12px; }
              th { background: #eee; }
              .subtotal { text-align: right; margin-top: 5px; font-weight: bold; }
              .grand-total { margin-top: 20px; font-weight: bold; text-align: right; font-size: 14px; }
              @media print { @page { size: A4; margin: 10mm; } }
            </style>
          </head>
          <body>
            <h2>LORDS DIAGNOSTIC</h2>
            <p>Department Wise Register</p>
            <div class="date-range">
              From: ${fromDate} &nbsp;&nbsp; To: ${toDate}
              ${filterInfo ? `<br/>${filterInfo}` : ""}
            </div>
            ${printContents}
            <div class="grand-total">
              Grand Total: ${grand.totalQty} / ₹${grand.totalAmount}
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.onload = function () { newWindow.focus(); setTimeout(() => newWindow.print(), 300); };
    }, 500);
  };

  const inputStyle = { width: "100%", padding: "8px", marginTop: "5px", boxSizing: "border-box", border: "1px solid #ccc", borderRadius: "4px" };
  const labelStyle = { marginBottom: "15px", display: "block" };
  const dropdownStyle = {
    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
    background: "#fff", border: "1px solid #ccc", borderRadius: "4px",
    maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  };

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ background: "#1e88e5", color: "#fff", padding: "15px 20px", fontSize: "18px", fontWeight: "bold" }}>
        Dept Wise Test Report
      </div>

      <div style={{ maxWidth: "500px", margin: "30px auto", background: "#fff", padding: "25px", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Search Filters</h3>

        <div style={labelStyle}>
          <label>Date From :</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} />
        </div>

        <div style={labelStyle}>
          <label>Date To :</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inputStyle} />
        </div>

        {/* Multiple Test Search */}
        <div style={{ ...labelStyle, position: "relative" }} ref={testRef}>
          <label>Test Name : <span style={{ color: "#888", fontSize: "11px" }}>(multiple)</span></label>
          {selectedTests.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: "5px", marginBottom: "4px" }}>
              {selectedTests.map((t) => (
                <span key={t.TestId} style={chipStyle}>
                  {t.Test}
                  <span style={chipRemoveStyle} onClick={() => removeTest(t.TestId)}>×</span>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Type to search tests..."
            value={testSearch}
            onChange={(e) => handleTestSearch(e.target.value)}
            onFocus={() => testSuggestions.length > 0 && setShowTestSuggestions(true)}
            style={inputStyle}
          />
          {showTestSuggestions && testSuggestions.length > 0 && (
            <div style={dropdownStyle}>
              {testSuggestions.map((t) => (
                <div
                  key={t.TestId}
                  onClick={() => addTest(t)}
                  style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "13px" }}
                  onMouseEnter={(e) => (e.target.style.background = "#e3f2fd")}
                  onMouseLeave={(e) => (e.target.style.background = "#fff")}
                >
                  {t.Test} <span style={{ color: "#888", fontSize: "11px" }}>₹{t.Rate}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Multiple Department Select */}
        <div style={{ ...labelStyle, position: "relative" }} ref={deptRef}>
          <label>Department : <span style={{ color: "#888", fontSize: "11px" }}>(multiple)</span></label>
          {selectedDepts.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: "5px", marginBottom: "4px" }}>
              {selectedDepts.map((d) => (
                <span key={d} style={chipStyle}>
                  {d}
                  <span style={chipRemoveStyle} onClick={() => removeDept(d)}>×</span>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Type to filter departments..."
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setShowDeptDropdown(true); }}
            onFocus={() => setShowDeptDropdown(true)}
            style={inputStyle}
          />
          {showDeptDropdown && (
            <div style={dropdownStyle}>
              {filteredDepts.length === 0 && (
                <div style={{ padding: "8px 12px", color: "#999", fontSize: "13px" }}>No departments found</div>
              )}
              {filteredDepts.map((d) => {
                const isSelected = selectedDepts.includes(d.Department);
                return (
                  <div
                    key={d.DepartmentId}
                    onClick={() => toggleDept(d)}
                    style={{
                      padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #eee",
                      fontSize: "13px", display: "flex", alignItems: "center",
                      background: isSelected ? "#e8f5e9" : "#fff",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#e3f2fd"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "#e8f5e9" : "#fff"; }}
                  >
                    <span style={{
                      width: "16px", height: "16px", border: "2px solid #1e88e5", borderRadius: "3px",
                      marginRight: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: isSelected ? "#1e88e5" : "#fff", color: "#fff", fontSize: "11px", flexShrink: 0,
                    }}>
                      {isSelected && "✓"}
                    </span>
                    {d.Department}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Admission Type :</label>
          <select value={admissionType} onChange={(e) => setAdmissionType(e.target.value)} style={inputStyle}>
            <option value="">-- All (Indoor + Outdoor) --</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>

        <button onClick={handlePrint} style={{ width: "100%", background: "#2e7d32", color: "#fff", padding: "10px", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer" }}>
          Print Report
        </button>
      </div>

      <div id="print-area" style={{ display: "none" }}>
        {data.map((dept, i) => (
          <div className="dept" key={i}>
            <h4>{dept.name}</h4>
            <table>
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dept.tests.map((t, index) => (
                  <tr key={index}>
                    <td>{t.Test}</td>
                    <td>{t.totalTestCount}</td>
                    <td>{t.Rate}</td>
                    <td>{t.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="subtotal">
              Sub Total: {dept.deptTotalQty} / ₹{dept.deptTotalAmount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeptWiseTestReport;
