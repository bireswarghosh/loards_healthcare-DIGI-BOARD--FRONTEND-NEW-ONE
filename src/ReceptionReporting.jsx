import { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const ReceptionReporting = () => {
  // --- State ---
  const [caseNo, setCaseNo] = useState("");
  
  // Mock Data
  const [caseList] = useState([]);
  const [reportList] = useState([]);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden",  }}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header py-1 px-2 border-bottom"    >
          <div style={{ width: "20px" }}>
             {/* Icon Placeholder */}
           
          </div>
          
        </div>

        <div className="panel-body p-2 d-flex flex-column flex-grow-1"  >
            
            {/* ------------------------------------------------
                TOP INPUT SECTION
                ------------------------------------------------ */}
            <div className="d-flex justify-content-center align-items-center mb-2 mt-2">
                <label className="form-label m-0 fw-bold  me-2" style={{ fontSize: "1rem" }}>Case No.</label>
                <input 
                    type="text" 
                    className="form-control form-control-sm rounded-0 border-secondary" 
                    style={{ width: "200px",  }} 
                    value={caseNo}
                    onChange={(e) => setCaseNo(e.target.value)}
                />
            </div>

            {/* ------------------------------------------------
                PRIMARY GRID (CASE LIST)
                ------------------------------------------------ */}
            <div className="border border-dark mb-3" style={{ height: "120px",   }}>
                <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                    <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.85rem", borderColor: "#008080" }}>
                        <thead style={{   color: "white", position: "sticky", top: 0 }}>
                            <tr>
                                <th style={{ width: "10%" }}>Case No</th>
                                <th style={{ width: "5%" }}>Slip</th>
                                <th style={{ width: "10%" }}>Case Date</th>
                                <th style={{ width: "20%" }}>Patient Name</th>
                                <th style={{ width: "25%" }}>Address</th>
                                <th style={{ width: "20%" }}>Doctor</th>
                                <th style={{ width: "5%" }}>Patient Id</th>
                                <th style={{ width: "5%" }}>RptPrnt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Empty Grid Rows to match visual style */}
                            <tr style={{ height: "25px" }}><td colSpan={8}></td></tr>
                            <tr style={{ height: "25px" }}><td colSpan={8}></td></tr>
                            <tr style={{ height: "25px" }}><td colSpan={8}></td></tr>
                        </tbody>
                    </table>
                </OverlayScrollbarsComponent>
            </div>

            {/* ------------------------------------------------
                SECONDARY GRID (REPORT LIST)
                ------------------------------------------------ */}
            <div className="d-flex justify-content-center flex-grow-1">
                <div className="d-flex flex-column align-items-center" style={{ width: "70%" }}>
                    
                    <div className="border border-dark w-100 mb-2" style={{ height: "250px",  }}>
                        <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                            <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.85rem", borderColor: "#008080" }}>
                                <thead style={{   color: "white", position: "sticky", top: 0 }}>
                                    <tr>
                                        <th style={{ width: "50%" }}>Reports</th>
                                        <th style={{ width: "25%" }}>Approved By</th>
                                        <th style={{ width: "25%" }}>Approved Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Empty Grid Rows */}
                                    <tr style={{ height: "25px" }}><td colSpan={3}></td></tr>
                                    <tr style={{ height: "25px" }}><td colSpan={3}></td></tr>
                                    <tr style={{ height: "25px" }}><td colSpan={3}></td></tr>
                                    <tr style={{ height: "25px" }}><td colSpan={3}></td></tr>
                                    <tr style={{ height: "25px" }}><td colSpan={3}></td></tr>
                                </tbody>
                            </table>
                        </OverlayScrollbarsComponent>
                    </div>

                    {/* ------------------------------------------------
                        FOOTER ACTION BUTTONS
                        ------------------------------------------------ */}
                    <div className="d-flex gap-2 justify-content-center w-100">
                        <button className="btn btn-sm btn-primary" style={{   minWidth: "80px" }}>
                            Clear All
                        </button>
                        <button className="btn btn-sm btn-primary" style={{   minWidth: "80px" }}>
                            Close
                        </button>
                    </div>

                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ReceptionReporting;