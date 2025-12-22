import { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const ItemMaster = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("Detail");
  
  // Grid Data (Mocking the empty state with one active row)
  const [unitData, setUnitData] = useState([
    { pack: "", unit: "", factor: "" } // Initial empty editable row
  ]);

  // --- Handlers ---
  const handleTabClick = (tab) => setActiveTab(tab);

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
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Item Master</h6>
          </div>
          
          {/* Window Buttons */}
          
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1  bg---rt-color-dark">
            
            {/* ------------------------------------------------
                TAB SECTION
                ------------------------------------------------ */}
            

            {/* ------------------------------------------------
                DETAIL FORM CONTAINER
                ------------------------------------------------ */}
            <div className="flex-grow-1 p-3 border-top  bg---rt-color-dark d-flex flex-column">
                
                {/* Main Form Box */}
                <div className="border p-3  bg---rt-color-dark mx-auto w-100" style={{ maxWidth: "850px", border: "2px solid #d65e5eff" }}>
                    
                    {/* --- TOP SECTION: Full Width Fields --- */}
                    
                    {/* Item Name */}
                    <div className="row mb-1 align-items-center">
                        <div className="col-md-3 text-md-end">  
                            <label className="form-label m-0 fw-bold small">Item Name</label>
                        </div>
                        <div className="col-md-9">
                            <input type="text" className="form-control form-control-sm  bg---rt-color-dark" />
                        </div>
                    </div>

                    {/* Under Category */}
                    <div className="row mb-1 align-items-center">
                        <div className="col-md-3 text-md-end">
                            <label className="form-label m-0 fw-bold small">Under Category</label>
                        </div>
                        <div className="col-md-9">
                            <input type="text" className="form-control form-control-sm  bg---rt-color-dark" />
                        </div>
                    </div>

                    {/* Mfg. company */}
                    <div className="row mb-1 align-items-center">
                        <div className="col-md-3 text-md-end">
                            <label className="form-label m-0 fw-bold small">Mfg. company</label>
                        </div>
                        <div className="col-md-9">
                            <input type="text" className="form-control form-control-sm  bg---rt-color-dark" />
                        </div>
                    </div>

                    {/* Composition */}
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3 text-md-end">
                            <label className="form-label m-0 fw-bold small">Composition</label>
                        </div>
                        <div className="col-md-9">
                            <input type="text" className="form-control form-control-sm  bg---rt-color-dark" />
                        </div>
                    </div>

                    {/* --- BOTTOM SECTION: Split Layout (Inputs vs Grid) --- */}
                    <div className="row g-3">
                        
                        {/* LEFT COL: Numeric Fields */}
                        <div className="col-md-5">
                            
                            {/* Min. Stock */}
                            <div className="row mb-1 align-items-center">
                                <div className="col-7 text-md-end">
                                    <label className="form-label m-0 fw-bold small">Min. Stock</label>
                                </div>
                                <div className="col-5">
                                    <input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" />
                                </div>
                            </div>

                            {/* Spacer to match grid header height roughly */}
                            <div style={{ height: "35px" }}></div>

                            {/* Vat % */}
                            <div className="row mb-1 align-items-center">
                                <div className="col-7 text-md-end">
                                    <label className="form-label m-0 fw-bold small">Vat %</label>
                                </div>
                                <div className="col-5">
                                    <input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" />
                                </div>
                            </div>

                            {/* C.S.T. % */}
                            <div className="row mb-1 align-items-center">
                                <div className="col-7 text-md-end">
                                    <label className="form-label m-0 fw-bold small">C.S.T. %</label>
                                </div>
                                <div className="col-5">
                                    <input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" />
                                </div>
                            </div>

                            {/* Stock/Con Unit */}
                            <div className="row mb-1 align-items-center">
                                <div className="col-7 text-md-end">
                                    <label className="form-label m-0 fw-bold small">Stock/Con Unit</label>
                                </div>
                                <div className="col-5">
                                    <input type="text" className="form-control form-control-sm" />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COL: Unit Detail Grid */}
                        <div className="col-md-7">
                            <div className="border p-1" style={{ position: "relative", paddingTop: "10px", height: "100%" }}>
                                {/* Label mimicking legend */}
                                <span className=" bg---rt-color-dark px-1 small fw-bold" style={{ position: "absolute", top: "-10px", left: "10px" }}>
                                    Unit Detail
                                </span>
                                
                                <div className="bg-secondary bg-opacity-50 border h-100" style={{ minHeight: "150px" }}>
                                    <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                                        <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.85rem" }}>
                                            <thead className="bg---rt-color-dark ">
                                                <tr>
                                                    <th className="text-center">Pack</th>
                                                    <th className="text-center">Purchase Unit</th>
                                                    <th className="text-center">Factor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Editable Row (Yellow) */}
                                                <tr style={{ backgroundColor: "#f8f88cff" }}>
                                                    <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent text-center" /></td>
                                                    <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent text-center" /></td>
                                                    <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent text-center" /></td>
                                                </tr>
                                                {/* Empty rows visualization */}
                                            </tbody>
                                        </table>
                                    </OverlayScrollbarsComponent>
                                </div>
                            </div>
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

        </div> 

            

        </div>
      </div>
    </div>
  );
};

export default ItemMaster;