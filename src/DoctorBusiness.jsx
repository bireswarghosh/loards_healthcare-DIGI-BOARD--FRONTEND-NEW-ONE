import React, { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "react-toastify/dist/ReactToastify.css";

const DoctorBusiness = () => {
  const [formData, setFormData] = useState({
    doctorName: "",
    fixedPercentAll: "N",
    percentAll: "",
    fixedPercentDept: "N",
    deptName: "",
    percentDept: "",
    rateDept: "",
    fixedPercentSubDept: "N",
    subDeptName: "",
    percentSubDept: "",
  });

  // Empty data state to match the gray void in the reference image
  const testData = []; 

  return (
    <div className="main-content">
      {/* WINDOW HEADER */}
      <div className="panel" style={{ maxWidth: "1000px", margin: "20px auto" }}>
        <div className="panel-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <img src="/e-icon.png" alt="" width="16" /> {/* Placeholder for app icon */}
            <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Doctor Business</span>
          </div>
         
        </div>

        <div className="panel-body">
          {/* TOP FORM SECTION: Row 1 */}
          <div className="row g-2 mb-2 align-items-center">
            <div className="col-md-1">
              <label className="form-label mb-0 fw-bold">Name</label>
            </div>
            <div className="col-md-5">
              <input 
                type="text" 
                className="form-control form-control-sm" 
                value={formData.doctorName}
                onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
              />
            </div>
            <div className="col-md-6 text-end d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-outline-secondary fw-bold" style={{ minWidth: "220px" }}>
                Copy Current List From Other Doctor
              </button>
              <button className="btn btn-sm btn-outline-secondary fw-bold px-4">
                New Test
              </button>
            </div>
          </div>
<div className="border p-2 mb-3 bg---rt-color-dark"> 
        
            {/* PERCENT CONFIGURATION SECTION */}
            {/* Row 1: All Test */}
            <div className="row g-2 mb-1 align-items-center">
              <div className="col-md-3"><label className="form-label mb-0">Fixed Percent For All Test</label></div>
              <div className="col-md-1">
                <select className="form-select form-select-sm"><option>N</option></select>
              </div>
              <div className="col-md-1 text-end"><label className="form-label mb-0">Percent</label></div>
              <div className="col-md-1"><input type="text" className="form-control form-control-sm" /></div>
              <div className="col-md-1"><label className="form-label mb-0">%</label></div>
              <div className="col-md-1"><button className="btn btn-sm btn-secondary w-100">OK</button></div>
              <div className="col-md-4 text-center">
                 {/* Visual spacer to match image layout balance */}
                 <span className="text-muted small">Load Test And Profile</span>
              </div>
            </div>
         
            {/* Row 2: Department Wise */}
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

            {/* Row 3: SubDep. Wise */}
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
              <div className="col-md-1 offset-md-1"><button className="btn btn-sm btn-secondary w-100">OK</button></div>
            </div>
          </div>

          {/* MAIN DATA GRID */}
          <div style={{ height: "300px", border: "1px solid #080808ff", }}>
            <OverlayScrollbarsComponent style={{ height: "100%" }}>
              <table className="table table-bordered mb-0" style={{ backgroundColor: testData.length > 0 ? "white" : "transparent" }}>
                <thead style={{ position: "sticky", top: 0,  zIndex: 1, fontSize: "0.85rem" }}>
                  <tr>
                    <th style={{ width: "60px" }}>Sl.No.</th>
                    <th>Test Name</th>
                    <th>Department</th>
                    <th>Sub Department</th>
                    <th style={{ width: "100px" }}>Percent(%)</th>
                    <th style={{ width: "40px" }}>P</th>
                    <th style={{ width: "100px" }}>Rate(Rs.)</th>
                    <th style={{ width: "80px" }}>IPD(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Empty body renders the gray background effect from container */}
                  {testData.map((item, index) => (
                    <tr key={index} style={{ backgroundColor: "white" }}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.dept}</td>
                      <td>{item.subDept}</td>
                      <td>{item.percent}</td>
                      <td>{item.p}</td>
                      <td>{item.rate}</td>
                      <td>{item.ipd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          </div>

          {/* FOOTER BUTTON BAR */}

           {/* Action Bar - Matching d.txt style buttons */}
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

export default DoctorBusiness;