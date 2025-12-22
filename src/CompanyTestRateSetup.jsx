import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const CompanyTestRateSetup = () => {
  // --- State ---
  const [testData, setTestData] = useState([]);
  
  // Mock Data Loading matching the screenshot
  useEffect(() => {
    const mockData = [
      { sl: 1616, name: "X-RAY NASOPHARYNX", dept: "X-RAY", subDept: "X RAY", percent: "220.00", p: "N", rate: 0, if: "" },
      { sl: 1617, name: "X-RAY NOSE LAT VEIW (DIGITAL)", dept: "X-RAY", subDept: "X RAY", percent: "640.00", p: "N", rate: 0, if: "" },
      { sl: 1618, name: "X-RAY OF CHALONGIOGRAM", dept: "X-RAY", subDept: "X RAY", percent: "3000.00", p: "N", rate: 0, if: "" },
      { sl: 1619, name: "X-RAY OF K.U.B. (DIGITAL)", dept: "X-RAY", subDept: "X RAY", percent: "420.00", p: "N", rate: 0, if: "" },
      { sl: 1620, name: "X-RAY OF NASOPHARYNX LAT VIEW", dept: "X-RAY", subDept: "X RAY", percent: "420.00", p: "N", rate: 0, if: "" },
      { sl: 1621, name: "X-RAY OF", dept: "X-RAY", subDept: "X RAY", percent: "540.00", p: "N", rate: 0, if: "" },
      { sl: 1622, name: "X-RAY REVERSE TOWNES VIEW", dept: "X-RAY", subDept: "X RAY", percent: "220.00", p: "N", rate: 0, if: "" },
      { sl: 1623, name: "X-RAY SOFT TISSUE NECK", dept: "X-RAY", subDept: "X RAY", percent: "220.00", p: "N", rate: 0, if: "" },
      { sl: 1624, name: "X-RAY SOFT TISSUE NECK AP/LAT", dept: "X-RAY", subDept: "X RAY", percent: "420.00", p: "N", rate: 0, if: "" },
      { sl: 1625, name: "X-RAY T.M. JOINT CLOSE MOUTH", dept: "X-RAY", subDept: "X RAY", percent: "220.00", p: "N", rate: 0, if: "" },
      { sl: 1626, name: "X-RAY T.M. JOINT OPEN MOUTH", dept: "X-RAY", subDept: "X RAY", percent: "220.00", p: "N", rate: 0, if: "" },
      { sl: 1627, name: "X-RAY THUMB AP/LAT DIGITAL", dept: "X-RAY", subDept: "X RAY", percent: "320.00", p: "N", rate: 0, if: "" },
      { sl: 1628, name: "EXECUTIVE HEALTH CHECK UP", dept: "PATHOLOGY", subDept: "HAEMATOLOGY.", percent: "1500.00", p: "Y", rate: 0, if: "" },
      { sl: 1629, name: "FLUID TEST PACKAGE", dept: "PATHOLOGY", subDept: "HAEMATOLOGY.", percent: "600.00", p: "Y", rate: 0, if: "" },
      { sl: 1630, name: "TOTAL PROTEIN", dept: "PATHOLOGY", subDept: "HAEMATOLOGY.", percent: "70.00", p: "Y", rate: 0, if: "" },
    ];
    setTestData(mockData);
  }, []);

  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", maxWidth: "100%", overflow: "hidden" }}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1 px-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <i className="fa fa-e me-1 text-danger"></i> 
            <h6 className="m-0 fw-bold " style={{ fontSize: "0.9rem" }}>Company Test Rate Setup</h6>
          </div>
        </div>

        <div className="panel-body p-2 d-flex flex-column flex-grow-1 bg---rt-color-dark-light">
            
            {/* ------------------------------------------------
                TOP FORM SECTION
                ------------------------------------------------ */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2 flex-grow-1 me-3">
                    <label className="form-label m-0 fw-bold small" style={{ width: "40px" }}>Name</label>
                    <input 
                        type="text" 
                        className="form-control form-control-sm bg---rt-color-dark" 
                        value="EASTERN RAILWAY HOSPITAL" 
                        readOnly 
                        style={{ maxWidth: "400px" }}
                    />
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-light border shadow-sm text-nowrap">Copy Current List From Other Companies</button>
                    <button className="btn btn-sm btn-light border shadow-sm fw-bold">New Test</button>
                </div>
            </div>

            {/* ------------------------------------------------
                RATE / PERCENT CONFIGURATION SECTION (Bordered Box)
                ------------------------------------------------ */}
            <div className="border p-2 mb-2 bg---rt-color-dark bg-opacity-10" style={{ border: "1px solid #d32020ff" }}>
                
                {/* Row 1: Fixed Percent */}
                <div className="row g-1 align-items-center mb-1">
                    <div className="col-auto">
                        <label className="form-label m-0 small">Fixed Percent For All Test</label>
                    </div>
                    <div className="col-auto">
                        <select className="form-select form-select-sm py-0" style={{ width: "50px" }}>
                            <option>N</option>
                        </select>
                    </div>
                    <div className="col-auto">
                        <label className="form-label m-0 small">All Test</label>
                    </div>
                    <div className="col-auto">
                         <input type="text" className="form-control form-control-sm py-0" style={{ width: "80px" }} />
                    </div>
                    <div className="col-auto">
                        <label className="form-label m-0 small">%</label>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-sm btn-light border py-0 px-3">OK</button>
                    </div>
                    
                    {/* Right Aligned Button */}
                    <div className="col text-end">
                        <button className="btn btn-sm btn-light border shadow-sm px-4 fw-bold">Load Test And Profile</button>
                    </div>
                </div>

                {/* Row 2: Rate */}
                <div className="row g-1 align-items-center mb-1">
                    <div className="col-auto" style={{ minWidth: "145px" }}>
                        <label className="form-label m-0 small">Rate</label>
                    </div>
                    <div className="col-auto">
                        <select className="form-select form-select-sm py-0" style={{ width: "50px" }}>
                            <option>N</option>
                        </select>
                    </div>
                    <div className="col-auto ms-2">
                        <label className="form-label m-0 small">Rate</label>
                    </div>
                    <div className="col-auto flex-grow-1">
                         <input type="text" className="form-control form-control-sm py-0" />
                    </div>
                    <div className="col-auto">
                        <label className="form-label m-0 small">Rate</label>
                    </div>
                    <div className="col-auto">
                         <input type="text" className="form-control form-control-sm py-0" style={{ width: "80px" }} />
                    </div>
                    <div className="col-auto">
                        <label className="form-label m-0 small">Rate</label>
                    </div>
                    <div className="col-auto">
                         <input type="text" className="form-control form-control-sm py-0" style={{ width: "80px" }} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-sm btn-light border py-0 px-3">OK</button>
                    </div>
                </div>

                {/* Row 3: Department Wise */}
                <div className="row g-1 align-items-center">
                    <div className="col-auto" style={{ minWidth: "145px" }}>
                        <label className="form-label m-0 small">Department Wise</label>
                    </div>
                    <div className="col-auto">
                        <select className="form-select form-select-sm py-0" style={{ width: "50px" }}>
                            <option>N</option>
                        </select>
                    </div>
                     <div className="col-auto flex-grow-1">
                         <input type="text" className="form-control form-control-sm py-0" />
                    </div>
                    <div className="col-auto">
                        <label className="form-label m-0 small">Percent</label>
                    </div>
                    <div className="col-auto">
                         <input type="text" className="form-control form-control-sm py-0" style={{ width: "80px" }} />
                    </div>
                    <div className="col-auto">
                        <label className="form-label m-0 small">SubDep</label>
                    </div>
                    <div className="col-auto">
                         <input type="text" className="form-control form-control-sm py-0" style={{ width: "50px" }} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-sm btn-light border py-0 px-3">OK</button>
                    </div>
                </div>

            </div>

            {/* ------------------------------------------------
                MAIN DATA GRID
                ------------------------------------------------ */}
            <div className="flex-grow-1 border bg---rt-color-dark d-flex flex-column" style={{ minHeight: "0" }}>
                <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                    <table className="table table-sm table-bordered table-striped table-hover mb-0" style={{ fontSize: "0.85rem" }}>
                        
                        {/* UPDATED HEADER: Removed bg-light, added bg---rt-color-dark to match container */}
                        <thead className="bg---rt-color-dark" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ width: "50px" }}>Sl.No.</th>
                                <th>Test Name</th>
                                <th>Department</th>
                                <th>Sub Department</th>
                                <th className="text-end">Percent[%]</th>
                                <th style={{ width: "30px" }}>P</th>
                                <th className="text-end">Rate(Rs.)</th>
                                <th style={{ width: "40px" }}>IF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testData.map((row, index) => (
                                <tr 
                                    key={row.sl} 
                                    onClick={() => setSelectedRow(index)}
                                    className={selectedRow === index ? "table-primary" : ""}
                                    style={{ cursor: "default" }}
                                >
                                    <td className="bg-secondary bg-opacity-10">{row.sl}</td>
                                    <td>{row.name}</td>
                                    <td>{row.dept}</td>
                                    <td>{row.subDept}</td>
                                    <td className="text-end">{row.percent}</td>
                                    <td>{row.p}</td>
                                    <td className="text-end">{row.rate}</td>
                                    <td>{row.if}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </OverlayScrollbarsComponent>
            </div>

            {/* ------------------------------------------------
                FOOTER BUTTON BAR
                ------------------------------------------------ */}
            <div className="panel-footer mt-2 d-flex gap-1 justify-content-center">
                 <button className="btn btn-sm btn-light border shadow-sm fw-bold px-3">New</button>
                 <button className="btn btn-sm btn-light border shadow-sm fw-bold px-3">Edit</button>
                 <button className="btn btn-sm btn-light border text-muted px-3" disabled>Save</button>
                 <button className="btn btn-sm btn-light border shadow-sm fw-bold px-3">Delete</button>
                 <button className="btn btn-sm btn-light border text-muted px-3" disabled>Undo</button>
                 <button className="btn btn-sm btn-light border shadow-sm fw-bold px-3 border-dark" style={{ borderStyle: "dotted" }}>Find</button>
                 <button className="btn btn-sm btn-light border shadow-sm fw-bold px-3">Print</button>
                 <button className="btn btn-sm btn-light border shadow-sm fw-bold px-3">Exit</button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CompanyTestRateSetup;