import React from 'react';
import Footer from "./components/footer/Footer";
const DiagBooking = () => {
  return (
    <div className="main-content" >
      
     
       
    
            {/* Header Design from Table.jsx */}
            <div className="panel-header">
              <h5>Booking</h5>
            </div>    

    
     

      <div className="panel p-2 bg-neutral-50" style={{ border: '1px solid #7F9DB9', borderRadius: '0' }}>
        
        {/* TOP SECTION: CASE INFO */}
        <div className="row g-1 mb-2">
          <div className="col-md-9">
            <div className="row g-2 align-items-center">
              <div className="col-md-2">
                <label>OPD</label>
                <select className="form-select form-select-sm"><option>N</option></select>
              </div>
              <div className="col-md-2">
                <label>Date</label>
                <input type="text" className="form-control form-control-sm" defaultValue="28/05/2024" />
              </div>
              <div className="col-md-2">
                <label>Time</label>
                <input type="text" className="form-control form-control-sm" defaultValue="10:45:00" />
              </div>
              <div className="col-md-3">
                <label>Case No.</label>
                <input type="text" className="form-control form-control-sm" />
              </div>
              <div className="col-md-3">
                <label>Card No</label>
                <input type="text" className="form-control form-control-sm" />
              </div>
            </div>
          </div>
          <div className="col-md-3 border-start ps-2">
            <label>Booking For</label>
            <input type="date" className="form-control form-control-sm mb-1" />
            <label>Booking Time</label>
            <input type="text" className="form-control form-control-sm" />
          </div>
        </div>

        {/* PATIENT / BOOKING INFO */}
        <div className="row g-2 mb-2">
          <div className="col-md-8">
            <div className="panel border p-2 mb-2">
              <div className="row g-2">
                <div className="col-md-4">
                  <label>Booking No</label>
                  <input type="text" className="form-control form-control-sm bg-neutral-200" readOnly />
                </div>
                <div className="col-md-8">
                  <label className="text-danger">Patient Name</label>
                  <div className="d-flex gap-1">
                    <select className="form-select form-select-sm" style={{ width: '70px' }}><option>Mr.</option></select>
                    <input type="text" className="form-control form-control-sm" />
                  </div>
                </div>
                <div className="col-md-4">
                  <label>Age</label>
                  <div className="d-flex gap-1">
                    <input type="text" className="form-control form-control-sm" />
                    <select className="form-select form-select-sm"><option>Y</option></select>
                  </div>
                </div>
                <div className="col-md-4">
                  <label>Sex</label>
                  <select className="form-select form-select-sm"><option>Male</option></select>
                </div>
                <div className="col-md-4">
                  <label>Phone</label>
                  <input type="text" className="form-control form-control-sm" />
                </div>
                <div className="col-md-12">
                  <label>Address</label>
                  <textarea className="form-control form-control-sm" style={{ height: '40px', resize: 'none' }}></textarea>
                </div>
              </div>
            </div>

            {/* TEST LIST GRID */}
            <div className="bg-neutral-800" style={{ height: '180px', border: '1px solid #000', overflowY: 'scroll' }}>
              <table className="table table-sm table-bordered mb-0" style={{ fontSize: '11px', color: '#fff' }}>
                <thead className="bg-neutral-600 text-white">
                  <tr>
                    <th style={{ width: '40px' }}>Pr</th>
                    <th>Test Name</th>
                    <th style={{ width: '100px' }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#D1FFD1', color: '#000' }}>
                    <td>1</td>
                    <td>COMPLETE BLOOD COUNT (CBC)</td>
                    <td className="text-end">450.00</td>
                  </tr>
                  {[...Array(8)].map((_, i) => (
                    <tr key={i}><td colSpan="3" style={{ height: '20px' }}></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT SIDE: BILLING & PAYMENT */}
          <div className="col-md-4">
            <div className="panel border p-2 mb-2 bg-neutral-100">
              <label className="dropdown-txt w-100 mb-2">Billing Detail</label>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end"><label className="mb-0">Total</label></div>
                <div className="col-6"><input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" /></div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end"><label className="mb-0">Service Chg.</label></div>
                <div className="col-6"><input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" /></div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end"><label className="mb-0">Amount</label></div>
                <div className="col-6"><input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" /></div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end"><label className="mb-0">Discount (%)</label></div>
                <div className="col-6"><input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" /></div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end"><label className="mb-0 fw-bold">Grand Total</label></div>
                <div className="col-6"><input type="text" className="form-control form-control-sm text-end fw-bold bg-warning-50" defaultValue="0.00" /></div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end"><label className="mb-0">Advance</label></div>
                <div className="col-6"><input type="text" className="form-control form-control-sm text-end" defaultValue="0.00" /></div>
              </div>
            </div>

            <div className="panel border p-2 bg-neutral-100">
              <label className="dropdown-txt w-100 mb-2">Bank Detail</label>
              <label>Bank Name</label>
              <input type="text" className="form-control form-control-sm mb-1" />
              <label>Cheque / Card</label>
              <input type="text" className="form-control form-control-sm mb-1" />
              <label>Payment Mode</label>
              <select className="form-select form-select-sm">
                <option>Cash</option>
                <option>Credit</option>
                <option>Bank</option>
                <option>Card</option>
              </select>
            </div>
          </div>
        </div>

        {/* REMARKS AND METADATA */}
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label>Remarks</label>
            <textarea className="form-control" style={{ height: '60px', resize: 'none' }}></textarea>
          </div>
          <div className="col-md-7">
            <div className="row g-2">
              <div className="col-md-6">
                <label>Doctor Name</label>
                <input type="text" className="form-control form-control-sm" />
              </div>
              <div className="col-md-3">
                <label>Agent</label>
                <select className="form-select form-select-sm"><option>N</option></select>
              </div>
              <div className="col-md-3">
                <label>Company</label>
                <select className="form-select form-select-sm"><option>N</option></select>
              </div>
              <div className="col-md-4"><small>Received By: <b>Admin</b></small></div>
              <div className="col-md-4"><small>Current User: <b>Admin</b></small></div>
              <div className="col-md-4"><small>Lab: <b>Main Lab</b></small></div>
            </div>
          </div>
        </div>

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
          <Footer />
     </div>
    
  );
};
 

export default DiagBooking;