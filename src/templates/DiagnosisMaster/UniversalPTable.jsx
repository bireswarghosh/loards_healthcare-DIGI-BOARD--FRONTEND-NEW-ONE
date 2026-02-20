import React from "react";
import ZLoader from "./ZLoader";
// import ZLoader from "./ZLoader";

const UniversalPTable = ({
  columns = [],
  data = [],
  loading = false,
  ref1,
  emptyMessage = "No Data Found",
}) => {
  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover">
          <thead className="">
            <tr>
              {columns.map((col, index) => (
                <th key={index} style={{ width: col.width || "auto" }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-3">
                  <div className="d-flex justify-content-center align-items-center">
                    <ZLoader />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-danger"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div ref={ref1} style={{ height: "50px", background: "transparent" }}>
        Loading...
      </div>
    </>
  );
};

export default UniversalPTable;