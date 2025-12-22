import React, { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "react-toastify/dist/ReactToastify.css";

const AgentBusiness = () => {
  const [formData, setFormData] = useState({
    agentName: "ABHIJIT LORDS",
    fixedPercentAll: "N",
    percentAll: "0.00",
    fixedPercentDept: "N",
    fixedPercentSubDept: "N",
  });

  // Mock data matching the image content
  const testData = [
    { id: 1, name: "17 KETOSTEROID", dept: "PATHOLOGY", subDept: "BIOCHEMISTRY." },
    { id: 2, name: "17-O.H.P.", dept: "PATHOLOGY", subDept: "HORMONE ASSAY" },
    { id: 3, name: "2 D ECHOCARDIOGRAPHY", dept: "USG", subDept: "ULTRASONOGRAPHY." },
    { id: 4, name: "24 HRS URINARY ALBUMIN(MICRO)", dept: "PATHOLOGY", subDept: "BIOCHEMISTRY." },
    { id: 5, name: "24 HRS URINARY AMYLASE", dept: "PATHOLOGY", subDept: "BIOCHEMISTRY." },
  ];

  return (
    <div className="main-content">
      {/* WINDOW HEADER */}
      <div className="panel" style={{ maxWidth: "1000px", margin: "20px auto" }}>
        <div className="panel-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <img src="/e-icon.png" alt="" width="16" /> 
            <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Agent Buisness</span>
          </div>
         
        </div>

        <div className="panel-body">
          {/* TOP FORM SECTION: Row 1 */}
          <div className="row g-2 mb-2 align-items-center">
            <div className="col-md-1">
              <label className="form-label mb-0">Name</label>
            </div>
            <div className="col-md-5">
              <input 
                type="text" 
                className="form-control form-control-sm" 
                value={formData.agentName}
                onChange={(e) => setFormData({...formData, agentName: e.target.value})}
              />
            </div>
            <div className="col-md-6 text-end d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-outline-secondary">Copy Current List From Other Agent</button>
              <button className="btn btn-sm btn-outline-secondary">New Test</button>
            </div>
          </div>

          <div className="border p-2 mb-3 bg---rt-color-dark">
            {/* PERCENT CONFIGURATION SECTION */}
            <div className="row g-2 mb-1 align-items-center">
              <div className="col-md-3"><label className="form-label mb-0">Fixed Percent For All Test</label></div>
              <div className="col-md-1">
                <select className="form-select form-select-sm"><option>N</option></select>
              </div>
              <div className="col-md-1 text-end"><label className="form-label mb-0">Percent</label></div>
              <div className="col-md-1"><input type="text" className="form-control form-control-sm" value="0.00" /></div>
              <div className="col-md-1"><label className="form-label mb-0">%</label></div>
              <div className="col-md-1"><button className="btn btn-sm btn-secondary w-100">OK</button></div>
            </div>

            <div className="row g-2 mb-1 align-items-center">
              <div className="col-md-3"><label className="form-label mb-0">Fixed Percent For Depertment Wise</label></div>
              <div className="col-md-1">
                <select className="form-select form-select-sm"><option>N</option></select>
              </div>
              <div className="col-md-1 text-end"><label className="form-label mb-0">Department</label></div>
              <div className="col-md-2"><input type="text" className="form-control form-control-sm" /></div>
              <div className="col-md-1 text-end"><label className="form-label mb-0">Percent</label></div>
              <div className="col-md-1"><input type="text" className="form-control form-control-sm" /></div>
              <div className="col-md-1"><label className="form-label mb-0">% Rate</label></div>
              <div className="col-md-1"><input type="text" className="form-control form-control-sm" /></div>
              <div className="col-md-1"><button className="btn btn-sm btn-secondary w-100">OK</button></div>
            </div>

            <div className="row g-2 align-items-center">
              <div className="col-md-3"><label className="form-label mb-0">Fixed Percent For SubDep. Wise</label></div>
              <div className="col-md-1">
                <select className="form-select form-select-sm"><option>N</option></select>
              </div>
              <div className="col-md-1 text-end"><label className="form-label mb-0">SubDep.</label></div>
              <div className="col-md-2"><input type="text" className="form-control form-control-sm" /></div>
              <div className="col-md-1 text-end"><label className="form-label mb-0">Percent</label></div>
              <div className="col-md-1"><input type="text" className="form-control form-control-sm" /></div>
              <div className="col-md-1"><label className="form-label mb-0">%</label></div>
              <div className="col-md-1"><button className="btn btn-sm btn-secondary w-100">OK</button></div>
            </div>
          </div>

          {/* MAIN DATA GRID */}
          <div style={{ height: "300px", border: "1px solid #050505ff" }}>
            <OverlayScrollbarsComponent style={{ height: "100%" }}>
              <table className="table  table-hover ">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "--rt-color-dark", zIndex: 1 }}>
                  <tr>
                    <th>Sl.No.</th>
                    <th>Test Name</th>
                    <th>Department</th>
                    <th>Sub Department</th>
                    <th>Percent[%]</th>
                    <th>P</th>
                    <th>Rate(Rs.)</th>
                    <th>IF</th>
                  </tr>
                </thead>
                <tbody>
                  {testData.map((item, index) => (
                    <tr key={item.id} className={index === 0 ? "table-warning" : ""}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.dept}</td>
                      <td>{item.subDept}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          </div>

          {/* FOOTER BUTTON BAR */}
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

export default AgentBusiness;