import { useState } from "react";

const DueOnAccount = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("Detail");
  
  // Form State
  const [formData, setFormData] = useState({
    name: "BISWAYAN DIAGNOSTIC",
    address1: "",
    address2: "",
    address3: "",
    mktExecType: "N", // Dropdown N
    mktExecName: "",
    debtorCreditor: "D" // D = Debtor
  });

  // --- Handlers ---
  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", maxWidth: "100%", overflow: "hidden" }}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1 px-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            {/* Legacy Icon Placeholder */}
            <i className="fa fa-e me-1 text-danger"></i> 
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Due On Account</h6>
          </div>
          
          {/* Window Buttons */}
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-light border py-0 px-2" style={{ lineHeight: "1" }}>_</button>
            <button className="btn btn-sm btn-light border py-0 px-2" style={{ lineHeight: "1" }}>□</button>
            <button className="btn btn-sm btn-danger py-0 px-2" style={{ lineHeight: "1" }}>X</button>
          </div>
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1 bg---rt-color-dark">
            
            

            {/* ------------------------------------------------
                DETAIL FORM SECTION
                ------------------------------------------------ */}
            <div className="flex-grow-1 p-3 border-top bg---rt-color-dark">
                
                {/* Main Frame/Group Box styling */}
                <div className="border p-4 bg---rt-color-dark" style={{ maxWidth: "700px", margin: "0 auto", border: "2px solid #ccc" }}>
                    
                    {/* Name */}
                    <div className="row mb-2 align-items-center">
                        <div className="col-md-3">
                            <label className="form-label m-0 fw-bold small">Name</label>
                        </div>
                        <div className="col-md-9">
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg---rt-color-dark" 
                                value={formData.name}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Address (Stacked) */}
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label className="form-label m-0 fw-bold small mt-1">Address</label>
                        </div>
                        <div className="col-md-9">
                            <input type="text" className="form-control form-control-sm mb-1" />
                            <input type="text" className="form-control form-control-sm mb-1" />
                            <input type="text" className="form-control form-control-sm" />
                        </div>
                    </div>

                    {/* Divider Line */}
                    <hr className="my-3 border-secondary" />

                    {/* ACCOUNT CONFIGURATION SECTION */}
                    
                    {/* Under Marketing Executive */}
                    <div className="row mb-2 align-items-center">
                        <div className="col-md-4">
                            <label className="form-label m-0 fw-bold small">Under Marketing Executive</label>
                        </div>
                        <div className="col-md-8 d-flex gap-1">
                            <select className="form-select form-select-sm" style={{ width: "50px" }}>
                                <option>N</option>
                            </select>
                            <input type="text" className="form-control form-control-sm flex-grow-1" />
                        </div>
                    </div>

                    {/* [D]ebtor / [C]reditor */}
                    <div className="row align-items-center">
                         <div className="col-md-4">
                            <label className="form-label m-0 fw-bold small">[D]ebtor / [C]reditor</label>
                        </div>
                        <div className="col-md-2">
                             <select 
                                className="form-select form-select-sm" 
                                value={formData.debtorCreditor}
                                onChange={(e) => setFormData({...formData, debtorCreditor: e.target.value})}
                            >
                                <option value="D">D</option>
                                <option value="C">C</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>

            {/* ------------------------------------------------
                FOOTER BUTTON BAR
                ------------------------------------------------ */}

         
            

                     <div className="panel-footer mt-3 d-flex gap-1 justify-content-center bg---rt-color-dark p-2 border">
         

           <button className="btn btn-sm btn-primary" >New</button>
            <button className="btn btn-sm btn-primary" >Edit</button>
            <button className="btn btn-sm btn-primary">Save</button>
            <button className="btn btn-sm btn-primary" >Delete</button>
            <button className="btn btn-sm btn-primary">Undo</button>
            <button className="btn btn-sm btn-primary" >Find</button>
            <button className="btn btn-sm btn-primary" >Print</button>
            <button className="btn btn-sm btn-primary">Exit</button>

        </div></div>
      </div>
    </div>
  );
};

export default DueOnAccount;