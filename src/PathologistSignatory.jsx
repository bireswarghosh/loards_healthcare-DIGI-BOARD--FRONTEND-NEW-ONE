import { useState } from "react";

const PathologistSignatory = () => {
  // --- State ---
  const [formData, setFormData] = useState({
    name: "DR. S.ROY CHOUDHURY",
    qualification: "M.B.B.S,D.C.P(PATH)",
    qual2: "",
    qual3: "",
    qual4: "",
    designation: "CONSULTANT PATHOLOGIST",
    password: "",
    registrationNo: ""
  });

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Pathologist(Report Signatory)</h6>
          </div>
          
          {/* Window Buttons */}
          
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1 bg---rt-color-dark">
            
            {/* ------------------------------------------------
                DETAIL FORM CONTAINER
                ------------------------------------------------ */}
            <div className="flex-grow-1 p-3 border-top bg---rt-color-dark d-flex flex-column justify-content-center align-items-center">
                
                {/* Main Content Box */}
                <div className="border p-3 bg---rt-color-dark w-100" style={{ maxWidth: "600px", border: "2px solid #ccc" }}>
                    
                    {/* Name */}
                    <div className="row mb-1 align-items-center">
                        <div className="col-md-3">
                            <label className="form-label m-0 fw-bold small">Name</label>
                        </div>
                        <div className="col-md-9">
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg---rt-color-dark" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Qualification (Main) */}
                    <div className="row mb-1 align-items-center">
                        <div className="col-md-3">
                            <label className="form-label m-0 fw-bold small">Qualification</label>
                        </div>
                        <div className="col-md-9">
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg---rt-color-dark"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Additional Qualification Lines (Stacked) */}
                    <div className="row mb-1">
                         <div className="col-md-3"></div> {/* Spacer */}
                         <div className="col-md-9">
                            <input type="text" className="form-control form-control-sm mb-1 bg---rt-color-dark" name="qual2" value={formData.qual2} onChange={handleChange} />
                            <input type="text" className="form-control form-control-sm mb-1 bg---rt-color-dark" name="qual3" value={formData.qual3} onChange={handleChange} />
                            <input type="text" className="form-control form-control-sm bg---rt-color-dark" name="qual4" value={formData.qual4} onChange={handleChange} />
                         </div>
                    </div>

                    {/* Designation & Color Button */}
                    <div className="row mb-2 align-items-center">
                        <div className="col-md-3">
                            <label className="form-label m-0 fw-bold small">Designation</label>
                        </div>
                        <div className="col-md-8">
                             <input 
                                type="text" 
                                className="form-control form-control-sm bg---rt-color-dark"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                            />
                        </div>
                         <div className="col-md-1 px-0">
                            {/* Small Green Indicator Button */}
                            <button className="btn btn-sm w-100 p-0 border" style={{ backgroundColor: "#00c000", height: "24px", minWidth: "30px" }}>...</button>
                        </div>
                    </div>

                    {/* Signature / Image Area */}
                    <div className="row mb-2">
                        <div className="col-md-3"></div> {/* Spacer */}
                        <div className="col-md-9 d-flex gap-2 align-items-start">
                            {/* Image Panel */}
                            <div className="border bg---rt-color-dark flex-grow-1" style={{ height: "120px", border: "2px inset #eee" }}></div>
                            
                            {/* Select Picture Button */}
                            <button className="btn btn-sm btn-light border shadow-sm fw-bold px-2 py-1 border-dark" style={{ borderStyle: "dotted" }}>
                                Select Picture
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="row mb-1 align-items-center">
                        <div className="col-md-3">
                            <label className="form-label m-0 fw-bold small">PassWord</label>
                        </div>
                        <div className="col-md-9">
                            <input 
                                type="password" 
                                className="form-control form-control-sm bg---rt-color-dark" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Registration No */}
                    <div className="row align-items-center">
                        <div className="col-md-3">
                            <label className="form-label m-0 fw-bold small">Registration No</label>
                        </div>
                        <div className="col-md-9">
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg---rt-color-dark"
                                name="registrationNo"
                                value={formData.registrationNo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* ------------------------------------------------
                FOOTER BUTTON BAR
                ------------------------------------------------ */}
                
            <div className="panel-footer p-2 mt-3 d-flex gap-1 justify-content-center bg---rt-color-dark d-flex justify-content-center">
                <button className="btn btn-sm btn-primary" >New</button>
            <button className="btn btn-sm btn-primary" >Edit</button>
            <button className="btn btn-sm btn-primary">Save</button>
            <button className="btn btn-sm btn-primary" >Delete</button>
            <button className="btn btn-sm btn-primary">Undo</button>
            <button className="btn btn-sm btn-primary" >Find</button>
            <button className="btn btn-sm btn-primary" >Print</button>
            <button className="btn btn-sm btn-primary">Exit</button>

               
            </div>

        </div>
      </div>
    </div>
  );
};

export default PathologistSignatory;