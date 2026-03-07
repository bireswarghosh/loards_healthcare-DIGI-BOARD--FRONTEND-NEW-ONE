import React, { useMemo } from "react";
import useAxiosFetch from "../../../../templates/DiagnosisMaster/Fetch";

const SubDeptSelector = ({
  groupedTests,
  selectedSubDept,
  setSelectedSubDept,
  onClose,
  onPrint,
  depMap,
}) => {
  //  const { data: depertments } = useAxiosFetch("/subdepartment");

  //   const depMap = useMemo(() => {
  //     const map = {};
  //     (depertments || []).forEach((d) => {
  //       map[d.SubDepartmentId] = d.SubDepartment;
  //     });
  //     return map;
  //   });
  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "40%",
        zIndex: 9999,
        background: "white",
        padding: "15px",
        border: "2px solid black",
        borderRadius: "6px",
        width: "300px",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
      }}
    >
      <h5 className="fw-bold mb-2 text-center">Select Sub-Departments</h5>

      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
        {Object.keys(groupedTests).map((key) => (
          <label
            key={key}
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={selectedSubDept.includes(key)}
              onChange={() => {
                setSelectedSubDept((prev) =>
                  prev.includes(key)
                    ? prev.filter((x) => x !== key)
                    : [...prev, key]
                );
              }}
              style={{ marginRight: "8px" }}
            />
            SubDept :{depMap[key]}
          </label>
        ))}
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-sm btn-success me-2" onClick={onPrint}>
          Print
        </button>

        <button className="btn btn-sm btn-danger" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SubDeptSelector;