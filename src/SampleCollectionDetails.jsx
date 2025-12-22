import { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const SampleCollectionDetails = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("Detail");
  const [searchDate, setSearchDate] = useState("2025-12-19");
  
  // Mock Data for Detail Grid
  const [testGridData, setTestGridData] = useState([]);

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
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Radiology Requisition</h6>
          </div>
           
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1" >
            
          

            {/* ------------------------------------------------
                TOP FILTER & FORM SECTION
                ------------------------------------------------ */}
            <div className="p-2 border-top border-bottom" >
                
                {/* Search By Case Date */}
                <div className="d-flex align-items-center mb-2">
                    <label className="form-label m-0 fw-bold small me-2 text-nowrap">Search By Case Date</label>
                    <input 
                        type="date" 
                        className="form-control form-control-sm  bg----rt-color-dark" 
                        value={searchDate} 
                        onChange={(e) => setSearchDate(e.target.value)} 
                        style={{ width: "130px" }}
                    />
                </div>

                <div className="d-flex gap-2">
                    {/* LEFT & MIDDLE FORM FIELDS */}
                    <div className="flex-grow-1">
                        
                        {/* Row 1: Collection ID | Lab Receiving Date | Lab Receiving Time */}
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <label className="form-label m-0 fw-bold small text-nowrap" style={{ width: "90px", textAlign: "right" }}>Collection ID</label>
                            <input type="text" className="form-control form-control-sm  bg----rt-color-dark" style={{ width: "120px" }} />
                            
                            <label className="form-label m-0 fw-bold small text-nowrap ms-3">Lab Receiving Date</label>
                            <input type="date" className="form-control form-control-sm  bg----rt-color-dark" style={{ width: "110px" }} />
                            
                            <label className="form-label m-0 fw-bold small text-nowrap ms-3">Lab Receiving Time</label>
                            <div className="d-flex align-items-center  bg----rt-color-dark border rounded px-1" style={{ height: "24px", width: "80px" }}>
                                <span className="small text-muted me-1">: :</span>
                                <span className="small text-muted">AM</span>
                            </div>
                        </div>

                        {/* Row 2: Regst No | Case Date */}
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <label className="form-label m-0 fw-bold small text-nowrap" style={{ width: "90px", textAlign: "right" }}>Regst No</label>
                            <input type="text" className="form-control form-control-sm  bg----rt-color-dark" style={{ width: "120px" }} />
                            
                            <label className="form-label m-0 fw-bold small text-nowrap ms-3" style={{ width: "115px", textAlign: "right" }}>Case Date</label>
                            <input type="date" className="form-control form-control-sm  bg----rt-color-dark" style={{ width: "110px" }} />
                        </div>

                        {/* Row 3: Patient Name | Sex | Age */}
                        <div className="d-flex align-items-center gap-2 mb-1">
                             <label className="form-label m-0 fw-bold small text-nowrap" style={{ width: "90px", textAlign: "right" }}>Patient Name</label>
                             <input type="text" className="form-control form-control-sm  bg----rt-color-dark" style={{ width: "350px" }} />
                             
                             <label className="form-label m-0 fw-bold small text-nowrap ms-2">Sex</label>
                             <span className="small fw-bold text-white">**</span>
                             
                             <label className="form-label m-0 fw-bold small text-nowrap ms-4">Age</label>
                             <span className="small fw-bold text-white">**</span>
                             <span className="small fw-bold text-white ms-2">**</span>
                        </div>

                         {/* Row 4: Department | Pre Printed BarCode ID */}
                        <div className="d-flex align-items-center gap-2">
                             <label className="form-label m-0 fw-bold small text-nowrap" style={{ width: "90px", textAlign: "right" }}>Department</label>
                             <select className="form-select form-select-sm bg-rt-color-dark" style={{ width: "200px" }}></select>
                             
                             <label className="form-label m-0 fw-bold small text-nowrap ms-2">Pre Printed BarCode ID</label>
                             <input type="text" className="form-control form-control-sm bg-rt-color-dark" style={{ width: "150px" }} />
                        </div>

                    </div>

                    {/* RIGHT: IMAGE / PREVIEW PANEL */}
                    <div className="border bg-light" style={{ width: "250px", height: "100px", border: "2px solid #fff", backgroundColor: "#e0e0e0" }}>
                        {/* Placeholder for image/scan */}
                    </div>

                </div>
            </div>

            {/* ------------------------------------------------
                TEST / PROCEDURE GRID
                ------------------------------------------------ */}
            <div className="flex-grow-1 border p-1" style={{  border: "2px solid #fff" }}>
                 <div className="border  bg-opacity-25 h-100 w-100" style={{ border: "1px solid #aaa" }}>
                    <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                        <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.8rem" }}>
                            <thead className="" style={{  position: "sticky", top: 0, zIndex: 10 }}>
                                <tr>
                                    <th>Test</th>
                                    <th>Procedure Dt.</th>
                                    <th>Time</th>
                                    <th>RadReqRptDt.</th>
                                    <th>RadReqRptTm.</th>
                                    <th>BarCode No.</th>
                                    <th>Profile Name</th>
                                    <th>Sample Type</th>
                                    <th>SampleTypeI</th>
                                    <th>SmplSlNo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Empty Grid Area */}
                                <tr style={{ height: "100%" }}><td colSpan="10"></td></tr>
                            </tbody>
                        </table>
                    </OverlayScrollbarsComponent>
                 </div>
            </div>

            {/* ------------------------------------------------
                FOOTER BUTTON BAR
                ------------------------------------------------ */}
            <div className="panel-footer p-2 d-flex justify-content-center border-top" >
                 <div className="d-flex gap-1 flex-wrap justify-content-center">
                     <button className="btn btn-sm btn-primary">New</button>
                     <button className="btn btn-sm btn-primary">Edit</button>
                     <button className="btn btn-sm btn-primary" >Save</button>
                     <button className="btn btn-sm btn-primary">Delete</button>
                     <button className="btn btn-sm btn-primary" >Undo</button>
                     <button className="btn btn-sm btn-primary">Print</button>
                     
                     {/* Specific Print Buttons */}
                     <button className="btn btn-sm btn-primary">PP-Print</button>
                     <button className="btn btn-sm btn-primary">F-Print</button>
                     <button className="btn btn-sm btn-primary">Dtl Barcode Print</button>
                     
                     <div className="mx-2"></div>
                     <button className="btn btn-sm btn-primary">Exit</button>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SampleCollectionDetails;