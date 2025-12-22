import { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const LaboratoryQuery = () => {
  // --- State ---
  const [filterType, setFilterType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("2025-12-21");
  const [toDate, setToDate] = useState("2025-12-21");
  const [signatory, setSignatory] = useState("NONE");

  // Mock Data for Grids to visualize layout
  const [cases, setCases] = useState([]); 
  const [tests, setTests] = useState([]);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1 px-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            {/* Legacy Icon Placeholder */}
            <i className="fa fa-e me-1 text-danger"></i> 
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Laboratory Query</h6>
          </div>
          
         
        </div>

        <div className="panel-body p-1 d-flex flex-column flex-grow-1  bg----rt-color-dark">
            
            {/* ------------------------------------------------
                ROW 1: FILTER BAR & STATUS INDICATORS
                ------------------------------------------------ */}
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                
                {/* Filter Type */}
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label m-0 fw-bold small text-nowrap">Filter Type</label>
                    <select 
                        className="form-select form-select-sm" 
                        style={{ width: "120px" }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option>All</option>
                    </select>
                    {/* Extra text box visible in screenshot next to filter type */}
                    <input type="text" className="form-control form-control-sm" style={{ width: "200px" }} />
                </div>

                <button className="btn btn-sm btn-light border shadow-sm fw-bold">Receipt Detail</button>

                {/* Signatory */}
                <div className="d-flex align-items-center gap-2 ms-auto">
                    <label className="form-label m-0 fw-bold small">Signatory</label>
                    <select 
                        className="form-select form-select-sm" 
                        style={{ width: "100px" }}
                        value={signatory}
                        onChange={(e) => setSignatory(e.target.value)}
                    >
                        <option>NONE</option>
                    </select>
                </div>

                {/* Status Indicators (Right Side) */}
                <div className="border d-flex flex-column text-center small fw-bold" style={{ width: "140px", fontSize: "0.7rem", lineHeight: "1.1" }}>
                    <div className="bg-success text-white">Reporting Done</div>
                    <div className="bg-warning text-dark">Reporting Partly Done</div>
                    <div className="bg-white text-dark">Reporting Pending</div>
                </div>
            </div>

            {/* ------------------------------------------------
                ROW 2: STATUS RADIO BUTTONS
                ------------------------------------------------ */}
            <div className="d-flex align-items-center gap-3 mb-1 px-1 border-bottom pb-1">
                {["All", "Pending Reporting", "Pending Delivery", "Pending Receipt", "Abnormal Report", "Previous case", "Direct case"].map((label) => (
                    <div className="form-check m-0" key={label}>
                        <input
                            className="form-check-input"
                            type="radio"
                            name="statusFilter"
                            id={`rad-${label.replace(/\s/g, '')}`}
                            checked={statusFilter === label}
                            onChange={() => setStatusFilter(label)}
                        />
                        <label className="form-check-label small fw-bold text-nowrap" htmlFor={`rad-${label.replace(/\s/g, '')}`}>
                            {label}
                        </label>
                    </div>
                ))}
            </div>

            {/* ------------------------------------------------
                ROW 3: DATE & SEARCH CONTROLS
                ------------------------------------------------ */}
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                {/* Date From */}
                <div className="d-flex align-items-center gap-1">
                    <label className="form-label m-0 fw-bold small text-nowrap">Date From</label>
                    <input type="date" className="form-control form-control-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: "130px" }} />
                </div>

                {/* Date To */}
                <div className="d-flex align-items-center gap-1">
                    <label className="form-label m-0 fw-bold small text-nowrap">Date To</label>
                    <input type="date" className="form-control form-control-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: "130px" }} />
                </div>

                {/* Total Cases Indicator */}
                <span className="fw-bold text-danger ms-2 small text-nowrap">Total Cases</span>

                {/* Spacer */}
                <div className="flex-grow-1"></div>
                
                {/* Update Section (Top Right of Date Row) */}
                <div className="d-flex align-items-center gap-1">
                    <input type="text" className="form-control form-control-sm" style={{ width: "80px" }} />
                    <button className="btn btn-sm btn-light border shadow-sm">Update</button>
                </div>
            </div>

            {/* ROW 4: BARCODE & ACTION BUTTONS */}
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <div className="d-flex align-items-center gap-1">
                    <label className="form-label m-0 fw-bold small text-nowrap">Pre Prnt BarCode</label>
                    <input type="text" className="form-control form-control-sm" style={{ width: "150px" }} />
                    <button className="btn btn-sm btn-light border shadow-sm text-nowrap">Search By BarCode</button>
                </div>

                <div className="ms-auto d-flex gap-2">
                    <button className="btn btn-sm btn-light border shadow-sm fw-bold">All E Mail</button>
                    <button className="btn btn-sm btn-light border shadow-sm fw-bold">Pathologist Login</button>
                    <button className="btn btn-sm text-dark fw-bold border shadow-sm" style={{ backgroundColor: "#ff8c00" }}>Pull Machine Data For LIS</button>
                </div>
            </div>

            {/* ------------------------------------------------
                MAIN CASE LIST GRID (TOP)
                ------------------------------------------------ */}
            <div className="flex-grow-1 border bg-secondary bg-opacity-25 mb-1" style={{ minHeight: "150px" }}>
                <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                    <table className="table table-sm table-bordered table-striped mb-0" style={{ fontSize: "0.8rem" }}>
                        <thead className="bg-primary text-white" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                            <tr>
                                <th>Case No.</th>
                                <th>Slip No.</th>
                                <th>Date</th>
                                <th>Patient Name</th>
                                <th>Doctor Name</th>
                                <th>Bill Amount</th>
                                <th>Clear Date</th>
                                <th>Agent Id</th>
                                <th className="text-center">Cancel</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                             {/* Empty State Visualization */}
                             <tr style={{ height: "100%" }}>
                                <td colSpan={10} className="p-0 border-0"></td>
                            </tr>
                        </tbody>
                    </table>
                </OverlayScrollbarsComponent>
            </div>

            {/* ------------------------------------------------
                PATIENT INFO SECTION (MIDDLE PANEL)
                ------------------------------------------------ */}
            <div className="border p-2 mb-1  bg----rt-color-dark">
                {/* Row 1 */}
                <div className="row g-1 align-items-center mb-1">
                    <div className="col-auto"><label className="form-label m-0 fw-bold small">Patient Id</label></div>
                    <div className="col-auto"><input type="text" className="form-control form-control-sm" style={{ width: "150px" }} /></div>
                    
                    <div className="col-auto"><label className="form-label m-0 fw-bold small">Age</label></div>
                    <div className="col-auto"><input type="text" className="form-control form-control-sm" style={{ width: "60px" }} /></div>
                    
                    <div className="col-auto"><label className="form-label m-0 fw-bold small">Sex</label></div>
                    <div className="col-auto"><input type="text" className="form-control form-control-sm" style={{ width: "80px" }} /></div>
                    
                    <div className="col-auto"><label className="form-label m-0 fw-bold small">Bill No</label></div>
                    <div className="col-auto"><input type="text" className="form-control form-control-sm" style={{ width: "120px" }} /></div>
                    
                    <div className="col-auto"><label className="form-label m-0 fw-bold small">Remarks</label></div>
                    <div className="col"><input type="text" className="form-control form-control-sm w-100" /></div>
                </div>

                {/* Row 2 */}
                <div className="row g-1 align-items-center">
                    <div className="col-auto"><label className="form-label m-0 fw-bold small">Company Name</label></div>
                    <div className="col-md-5"><input type="text" className="form-control form-control-sm w-100" /></div>
                    
                    <div className="col-auto"><label className="form-label m-0 fw-bold small">Lab Name</label></div>
                    <div className="col"><input type="text" className="form-control form-control-sm w-100" /></div>
                </div>
            </div>

            {/* ------------------------------------------------
                BOTTOM SECTION (SPLIT GRIDS)
                ------------------------------------------------ */}
            <div className="d-flex gap-1" style={{ height: "200px" }}>
                
                {/* TEST DETAIL GRID (BOTTOM LEFT) */}
                <div className="flex-grow-1 border  bg----rt-color-dark" style={{ width: "75%" }}>
                    <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                        <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.8rem" }}>
                            <thead className="bg-primary text-white" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Report Date</th>
                                    <th>Delivered</th>
                                    <th>Printed</th>
                                    <th>PrePrntBarCode</th>
                                    <th>User</th>
                                    <th className="text-center">Approval</th>
                                    <th>Profile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Empty State */}
                            </tbody>
                        </table>
                    </OverlayScrollbarsComponent>
                </div>

                {/* BOTTOM RIGHT PANEL */}
                <div className="border bg-secondary bg-opacity-25" style={{ width: "25%" }}>
                    <div className="p-2">
                        {/* Placeholder for the secondary panel content in screenshot */}
                        <div className="bg-primary mb-1" style={{ width: "40px", height: "20px" }}></div>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default LaboratoryQuery;