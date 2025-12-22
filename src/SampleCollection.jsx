import { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const SampleCollection = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("List");
  const [searchType, setSearchType] = useState("Case No.");
  const [statusFilter, setStatusFilter] = useState("Complete");
  const [dateFrom, setDateFrom] = useState("2023-12-20");
  const [dateTo, setDateTo] = useState("2025-12-20");

  // Mock Data for Grids to visualize layout
  const [mainGridData, setMainGridData] = useState([]);
  const [patientList1, setPatientList1] = useState([
    { caseNo: "OP/2324/09604", name: "NAZIBUL" },
    { caseNo: "OP/2324/09601", name: "SUBHRA" },
    
   
  ]);
  const [patientList2, setPatientList2] = useState([
    { caseNo: "OP/2324/08915", name: "SOMNATH" },
    { caseNo: "IP/2324/09603", name: "ANNAPURN" },
    
  ]);

  // --- Handlers ---
  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden",  }}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1 px-2 border-bottom" >
          <div className="d-flex align-items-center gap-2">
            <i className="#"></i> 
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Sample Collection</h6>
          </div>
         
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1" style={{ backgroundColor: "rt-color-dark" }}>
            
            {/* ------------------------------------------------
                FILTER SECTION (TOP)
                ------------------------------------------------ */}
            <div className="p-1 border-top border-bottom  bg----rt-color-dark">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    
                    {/* Search Radio Options */}
                    <div className="d-flex gap-3">
                        {["Lab No.", "Case No.", "Barcode No."].map(label => (
                             <div className="form-check m-0" key={label}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="searchType"
                                    id={`rad-${label.replace(/\s/g, '')}`}
                                    checked={searchType === label}
                                    onChange={() => setSearchType(label)}
                                />
                                <label className="form-check-label small fw-bold" htmlFor={`rad-${label.replace(/\s/g, '')}`}>
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Status Radio Options (Center) */}
                    <div className="border px-2 py-0 d-flex gap-3  bg----rt-color-dark" style={{ borderRadius: "4px" }}>
                        {["All", "Pending", "Complete"].map(label => (
                             <div className="form-check m-0" key={label}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="statusFilter"
                                    id={`stat-${label.replace(/\s/g, '')}`}
                                    checked={statusFilter === label}
                                    onChange={() => setStatusFilter(label)}
                                />
                                <label className="form-check-label small fw-bold" htmlFor={`stat-${label.replace(/\s/g, '')}`}>
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: Fields */}
                <div className="d-flex align-items-center gap-2 mt-1">
                    <label className="form-label m-0 fw-bold small">Case No.</label>
                    <input type="text" className="form-control form-control-sm" style={{ width: "120px" }} />
                    <button className="btn btn-sm btn-light border shadow-sm fw-bold px-3">Find</button>

                    <div className="ms-4 d-flex align-items-center gap-2">
                        <label className="form-label m-0 fw-bold small">Date From</label>
                        <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: "110px" }} />
                        
                        <label className="form-label m-0 fw-bold small">Date To</label>
                        <input type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: "110px" }} />
                    </div>

                    {/* Spacer to align headers right */}
                    <div className="flex-grow-1"></div>
                    <div className="d-flex gap-2 text-center" style={{ minWidth: "35%" }}>
                         <div className="fw-bold small flex-grow-1">Patient List on Date Range</div>
                         <div className="fw-bold small flex-grow-1">Patient List on Date Range</div>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------
                MAIN CONTENT (SPLIT GRIDS)
                ------------------------------------------------ */}
            <div className="flex-grow-1 d-flex p-1 gap-1" style={{ overflow: "hidden" }}>
                
                {/* LEFT: MAIN RADIOLOGY LIST GRID */}
                 
                
                <div className="d-flex gap-1 border bg----rt-color-dark   d-flex flex-column" style={{ width: "65%", border: "2px solid #db6e6eff" }}>
                    <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                        <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.8rem" }}>
                            <thead className="bg----rt-color-dark " style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                <tr>
                                    <th>Lab No</th>
                                    <th>Date</th>
                                    <th>Case No</th>
                                    <th>Case Date</th>
                                    <th>Patient</th>
                                    <th>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Empty Grid Area */}
                                <tr style={{ height: "100%" }}><td colSpan="6"></td></tr>
                            </tbody>
                        </table>
                    </OverlayScrollbarsComponent>
                </div>

                {/* RIGHT: PATIENT LIST PANELS */}
                <div className="d-flex gap-1" style={{ width: "35%" }}>
                    
                    {/* Panel 1 */}
                    <div className="flex-grow-1 border  bg----rt-color-dark d-flex flex-column">
                        <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                            <table className="table table-sm table-bordered table-striped mb-0" style={{ fontSize: "0.75rem" }}>
                                <thead className="bg-primary text-white" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                    <tr>
                                        <th>CaseNo</th>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patientList1.map((row, idx) => (
                                        <tr key={idx} className={idx === 2 ? "table-light border border-dark" : ""}>
                                            <td>{row.caseNo}</td>
                                            <td>{row.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </OverlayScrollbarsComponent>
                    </div>

                    {/* Panel 2 */}
                    <div className="flex-grow-1 border  bg----rt-color-dark d-flex flex-column">
                        <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                            <table className="table table-sm table-bordered table-striped mb-0" style={{ fontSize: "0.75rem" }}>
                                <thead className="bg-primary text-white" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                    <tr>
                                        <th>CaseNo</th>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patientList2.map((row, idx) => (
                                        <tr key={idx}>
                                            <td>{row.caseNo}</td>
                                            <td>{row.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </OverlayScrollbarsComponent>
                    </div>

                </div>

            </div>

            {/* ------------------------------------------------
                FOOTER BUTTON BAR
                ------------------------------------------------ */}
            <div className="panel-footer p-2 bg----rt-color-dark bg-opacity-50 d-flex justify-content-center border-top">
                 <div className="d-flex gap-1 flex-wrap justify-content-center">
                     <button className="btn btn-sm btn-primary">New</button>
                     <button className="btn btn-sm btn-primary">Edit</button>
                     <button className="btn btn-sm btn-primary"  >Save</button>
                     <button className="btn btn-sm btn-primary">Delete</button>
                     <button className="btn btn-sm btn-primary"  >Undo</button>
                     <button className="btn btn-sm btn-primary">Print</button>
 
                     
                     {/* Specific Print Buttons */}
                     <button className="btn btn-sm btn-primary">PP-Print</button>
                     <button className="btn btn-sm btn-primary">F-Print</button>
                     <button className="btn btn-sm btn-primary">Dtl Barcode Print</button>
                      <button className="btn btn-sm btn-primary">Exit</button>
                     
                    
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SampleCollection;