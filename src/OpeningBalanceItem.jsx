import { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const OpeningBalanceItem = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("Detail");

  // Mock Data: One editable row for the entry line
  const [rows] = useState([
    { item: "", uom: "", batch: "", qty: "", amount: "" }
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
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.9rem" }}>Opening Balance (Item)</h6>
          </div>
          
          
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1 bg---rt-color-dark">
            

            {/* ------------------------------------------------
                DETAIL FORM CONTAINER
                ------------------------------------------------ */}
            <div className="flex-grow-1 p-3 border-top bg---rt-color-dark d-flex flex-column">
                
                {/* Main Content Box mimicking the border in screenshot */}
                <div className="border p-2 d-flex flex-column h-100 bg---rt-color-dark" style={{ border: "2px solid #ccc" }}>
                    
                    {/* Godown Field */}
                    <div className="d-flex align-items-center mb-2 px-1">
                        <label className="form-label m-0 fw-bold small me-3" style={{ minWidth: "60px" }}>Godown</label>
                        <input type="text" className="form-control form-control-sm bg---rt-color-dark" />
                    </div>

                    {/* OPENING BALANCE GRID */}
                    <div className="flex-grow-1 border  bg-opacity-50" style={{ position: "relative" }}>
                        <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                            <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.85rem" }}>
                                <thead className="bg---rt-color-dark sticky-top" style={{ zIndex: 10 }}>
                                    <tr>
                                        <th style={{ width: "35%" }}>Item</th>
                                        <th style={{ width: "10%" }}>UOM</th>
                                        <th style={{ width: "25%" }}>Batch-&gt;(F1 For New)</th>
                                        <th style={{ width: "10%" }} className="text-end">Qty.</th>
                                        <th style={{ width: "20%" }} className="text-end">Amount(Rs.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Editable Row (Yellow Highlight) */}
                                    <tr style={{ backgroundColor: "#ffffd0" }}>
                                        <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent" /></td>
                                        <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent" /></td>
                                        <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent" /></td>
                                        <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent text-end" /></td>
                                        <td className="p-0"><input type="text" className="form-control form-control-sm border-0 bg-transparent text-end" /></td>
                                    </tr>
                                    {/* The remaining area is gray via the container background, mimicking empty grid */}
                                </tbody>
                            </table>
                        </OverlayScrollbarsComponent>
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

export default OpeningBalanceItem;