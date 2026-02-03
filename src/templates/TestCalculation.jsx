import React, { useState, useMemo } from "react";
import TestRow from "./TestRow";
import AsyncApiSelect from "../components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/AsyncApiSelect";
// digiboard-react-lordshealthcare-main\src\templates\DiagnosisMaster\Fetch.js
import useAxiosFetch from "..//../src/templates/DiagnosisMaster/Fetch";



const TestCalculation = () => {
  const [rows, setRows] = useState([
    { id: crypto.randomUUID(), testOption: null, rate: 0 },
  ]);

  const handleTestChange = (index, testOption) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        testOption,
        rate: 0,
      };
      return updated;
    });
  };

  const handleRateUpdate = (index, rate) => {
    setRows((prev) => {
      if (prev[index]?.rate === rate) return prev;

      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        rate,
      };
      return updated;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), testOption: null, rate: 0 },
    ]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = useMemo(() => {
    return rows.reduce((sum, row) => sum + (Number(row.rate) || 0), 0);
  }, [rows]);

  return (
    <div className="m-3">
      <h2>Test Estimate Calculation</h2>

      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Test Name</th>
            <th>Rate</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <TestRow
              key={row.id}
              row={row}
              index={index}
              onTestChange={handleTestChange}
              onRateUpdate={handleRateUpdate}
              removeRow={removeRow}
            />
          ))}
        </tbody>
      </table>

      <div className="mt-2 text-end">
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          onClick={addRow}
        >
          ➕ Add Test
        </button>
      </div>

      <hr />

      <div className="row justify-content-end mt-3">
        <div className="col-md-4">
          <div className="border rounded p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-uppercase text-muted">
                Total Payable
              </span>
              <span className="fw-bold fs-3 text-primary">₹ {totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCalculation;