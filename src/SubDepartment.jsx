import { useState } from "react";

const SubDepartment = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("Detail");
  const [formData, setFormData] = useState({
    subDepartment: "",
    department: "ABG",
    reportFooter: false
  });

  // --- Handlers ---
  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" ,}}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1 px-2 border-bottom" >
          <div className="d-flex align-items-center gap-2">
            <i className="#"></i> 
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Sub-Department</h6>
          </div>
           
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1" >
            
            
            {/* ------------------------------------------------
                MAIN FORM AREA
                ------------------------------------------------ */}
            <div className="flex-grow-1 d-flex justify-content-center align-items-center p-3 border-top bg-rt-color-dark" >
                
                {/* Inner Form Panel */}
                <div className="border p-4  bg-rt-color-dark w-100" style={{ maxWidth: "600px", border: "2px solid #35a9adff", borderRadius: "2px" }}>
                    
                    {/* Sub Department */}
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-4 text-md-end">
                            <label className="form-label m-0 fw-bold small">Sub Department</label>
                        </div>
                        <div className="col-md-8">
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg-rt-color-dark" 
                                value={formData.subDepartment}
                                onChange={(e) => setFormData({...formData, subDepartment: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Department */}
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-4 text-md-end">
                            <label className="form-label m-0 fw-bold small">Department</label>
                        </div>
                        <div className="col-md-8">
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg-rt-color-dark" 
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Report Footer Checkbox */}
                    <div className="row mb-2">
                        <div className="col-md-4"></div> {/* Spacer */}
                        <div className="col-md-8">
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="chkReportFooter"
                                    checked={formData.reportFooter}
                                    onChange={(e) => setFormData({...formData, reportFooter: e.target.checked})}
                                />
                                <label className="form-check-label small fw-bold" htmlFor="chkReportFooter">
                                    Report Footer
                                </label>
                            </div>
                        </div>
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

export default SubDepartment;