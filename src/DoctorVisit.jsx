import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../axiosInstance"; // Assuming the same path as d.txt

const DoctorVisit = () => {
  // State management following the d.txt pattern
  const [loading, setLoading] = useState(false);
  const [findBy, setFindBy] = useState("no");
  const [formData, setFormData] = useState({
    VisitDate: new Date().toISOString().slice(0, 10),
    DoctorName: "",
    Rate: 0,
    NoOfVisit: 1,
    Amount: 0,
    DocPayAmt: 0,
    Package: "N",
    VisitType: "DOCTOR VISIT"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="main-content" style={{ backgroundColor: '#D6E4F0', minHeight: '100vh' }}>
      <ToastContainer />

      <div className="panel">
        {/* Header - Styled like d.txt panel-header */}
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>Doctor Visit</h5>
        </div>

        <div className="panel-body">
          <div className="row g-3">
            {/* LEFT COLUMN (3/4 Width) */}
            <div className="col-md-9">
              
              {/* TOP SECTION – BILL DETAIL */}
              <div className="panel border rounded p-3 mb-2 bg-neutral-50">
                <div className="row g-2 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">Patient Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      style={{ backgroundColor: '#fffec' }} // Highlight from n.txt
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Admission No</label>
                    <input type="text" className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-5">
                    <div className="d-flex gap-3 justify-content-end mb-1">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="findBy" checked={findBy === "name"} onChange={() => setFindBy("name")} />
                        <label className="form-check-label">Find By Name</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="findBy" checked={findBy === "no"} onChange={() => setFindBy("no")} />
                        <label className="form-check-label">Find By No.</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PATIENT DETAIL SECTION */}
              <div className="panel border rounded p-3 mb-2 bg-neutral-50">
                <h6 className="dropdown-txt mb-2">Patient Detail</h6>
                <div className="row g-2">
                  <div className="col-md-12">
                    <label className="form-label">Address</label>
                    <textarea className="form-control form-control-sm mb-1" style={{ height: '40px', resize: 'none' }} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Age</label>
                    <div className="d-flex gap-1">
                      <input type="text" className="form-control form-control-sm" />
                      <select className="form-select form-select-sm" style={{ width: '60px' }}><option>Y</option></select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sex</label>
                    <select className="form-select form-select-sm"><option>Male</option></select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Bed No.</label>
                    <input type="text" className="form-control form-control-sm" />
                  </div>
                </div>
              </div>

              {/* DOCTOR VISIT DETAIL SECTION */}
              <div className="panel border rounded p-3 mb-2 bg-neutral-50">
                <h6 className="dropdown-txt mb-2">Doctor Visit Detail</h6>
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label text-danger fw-bold">Doctor Name</label>
                    <input type="text" name="DoctorName" className="form-control form-control-sm" onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-danger fw-bold">Rate</label>
                    <input type="number" name="Rate" className="form-control form-control-sm text-end" onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">No of Visit</label>
                    <div className="input-group input-group-sm">
                      <input type="text" className="form-control" defaultValue="1" />
                      <span className="input-group-text">/ VISIT</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control form-control-sm" defaultValue={formData.VisitDate} />
                  </div>
                </div>
              </div>

              {/* PREVIOUS DETAIL TABLE (Using OverlayScrollbarsComponent from d.txt) */}
              <OverlayScrollbarsComponent style={{ height: '200px', border: '1px solid #dee2e6' }}>
                <table className="table table-striped table-hover table-dashed table-sm">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Rate</th>
                      <th>No of Visit</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Visit Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#ffffcc' }}>
                      <td>Dr. A.K. Sharma</td>
                      <td>500.00</td>
                      <td>1</td>
                      <td>500.00</td>
                      <td>20/12/2024</td>
                      <td>Normal</td>
                    </tr>
                  </tbody>
                </table>
              </OverlayScrollbarsComponent>
            </div>

            {/* RIGHT COLUMN (1/4 Width) */}
            <div className="col-md-3">
              <div className="d-flex flex-column gap-2 h-100">
                <div className="flex-grow-1">
                  <label className="dropdown-txt w-100 p-1">Advice</label>
                  <textarea className="form-control" style={{ height: '180px', resize: 'none' }}></textarea>
                </div>
                <div className="flex-grow-1">
                  <label className="dropdown-txt w-100 p-1">Procedure</label>
                  <textarea className="form-control" style={{ height: '180px', resize: 'none' }}></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar - Matching d.txt style buttons */}
        <div className="panel-footer bg-light d-flex gap-2 p-2 border-top">
          <button className="btn btn-sm btn-primary">New</button>
          <button className="btn btn-sm btn-secondary">Edit</button>
          <button className="btn btn-sm btn-success" disabled>Save</button>
          <button className="btn btn-sm btn-danger">Delete</button>
          <button className="btn btn-sm btn-warning">Undo</button>
          <button className="btn btn-sm btn-info">Find</button>
          <button className="btn btn-sm btn-outline-dark">Print</button>
          <button className="btn btn-sm btn-dark ms-auto">Exit</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorVisit;