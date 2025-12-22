import { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const SpecialProperty = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("Detail");
  const [testName, setTestName] = useState("ANTI CARDIOLIPIN ANTIBODY");

  // Mock Data for the property grid
  const [properties] = useState([
    { property: "ATG NEW", format: "Click Here To View" }
  ]);

  // --- Handlers ---
  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden",   }}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1 px-2 border-bottom"  >
          <div className="d-flex align-items-center gap-2">
            <i className="#"></i> 
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Special Property</h6>
          </div>
           
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1"  >
            
           
            {/* ------------------------------------------------
                MAIN FORM AREA
                ------------------------------------------------ */}
            <div className="flex-grow-1 d-flex justify-content-center p-3 border-top bg-rt-color-dark"  >
                
                {/* Inner Form Panel */}
                <div className="border p-2 bg-rt-color-dark w-100 d-flex flex-column" style={{ maxWidth: "750px", border: "2px solid #aaa", borderRadius: "2px" }}>
                    
                    {/* Top Section: Test Name */}
                    <div className="border p-3 mb-2" style={{ border: "1px solid #af4646ff" }}>
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <label className="form-label m-0 fw-bold small">Test Name</label>
                            </div>
                            <div className="col">
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm bg-rt-color-dark fw-bold" 
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grid Section */}
                    <div className="flex-grow-1 border   bg-opacity-25" style={{ border: "2px solid #fff", minHeight: "200px" }}>
                        <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                            <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.85rem" }}>
                                <thead className="bg-rt-color-dark sticky-top" style={{ zIndex: 10 }}>
                                    <tr>
                                        <th style={{ width: "40%" }}>Test Property</th>
                                        <th style={{ width: "60%" }}>Format</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Data Rows */}
                                    {properties.map((row, idx) => (
                                        <tr key={idx}  >
                                            <td className="p-0 ps-1 align-middle">{row.property}</td>
                                            <td className="p-0 position-relative">
                                                <div className="d-flex w-100 h-100 align-items-center">
                                                    <span className="flex-grow-1 ps-1 border-0 bg-transparent" style={{ outline: "none" }}>
                                                        {row.format}
                                                    </span>
                                                    <button className="btn btn-sm btn-light border py-0 px-1 m-0" style={{ height: "100%", borderRadius: 0 }}>...</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Empty Grid Filling */}
                                    <tr style={{ height: "100%" }}>
                                        <td colSpan="2" className="border-0"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </OverlayScrollbarsComponent>
                    </div>

                </div>
            </div>

            {/* ------------------------------------------------
                FOOTER BUTTON BAR
                ------------------------------------------------ */}
             
       
                     

                      <div className="panel-footer p-2 border-top bg-rt-color-dark d-flex justify-content-center"  >
                 <div className="d-flex gap-2 flex-wrap justify-content-center">

               
                     

                      <button className="btn btn-sm btn-primary">New</button>
                     <button className="btn btn-sm btn-primary">Edit</button>
                     <button className="btn btn-sm btn-primary" >Save</button>
                     <button className="btn btn-sm btn-primary">Delete</button>
                     <button className="btn btn-sm btn-primary" >Undo</button>
                     <button className="btn btn-sm btn-primary">Print</button>
                     <button className="btn btn-sm btn-primary">Exit</button>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SpecialProperty;