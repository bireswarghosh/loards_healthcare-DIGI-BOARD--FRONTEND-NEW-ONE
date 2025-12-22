import React, { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const AgentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    address1: "",
    address2: "",
    address3: "",
    phoneNo: "",
    opBalance: "0.00",
    emailId: "",
    creditLimit: "0.00",
    commissionType: "C",
    company: "LORDS HEALTHCARE",
    underMarketing: "N",
    marketingText: "",
    isDiscountable: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="main-content">
      {/* WINDOW CONTAINER */}
      <div className="panel" style={{ maxWidth: "800px", margin: "10px auto" }}>
        {/* WINDOW HEADER */}
        <div className="panel-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Agent</span>
          </div>
          
        </div>

        <div className="panel-body p-3">
          <OverlayScrollbarsComponent>
            <div className="form-container">
              
              {/* Name & Short Name */}
              <div className="row mb-1 align-items-center">
                <div className="col-md-2"><label className="form-label fw-bold">Name</label></div>
                <div className="col-md-10">
                  <input type="text" name="name" className="form-control form-control-sm" value={formData.name} onChange={handleChange} />
                </div>
              </div>

              <div className="row mb-1 align-items-center">
                <div className="col-md-2"><label className="form-label fw-bold">Short Name</label></div>
                <div className="col-md-10">
                  <input type="text" name="shortName" className="form-control form-control-sm" value={formData.shortName} onChange={handleChange} />
                </div>
              </div>

              {/* Address Stack */}
              <div className="row mb-2 align-items-start">
                <div className="col-md-2"><label className="form-label fw-bold">Address</label></div>
                <div className="col-md-10">
                  <input type="text" name="address1" className="form-control form-control-sm mb-1" value={formData.address1} onChange={handleChange} />
                  <input type="text" name="address2" className="form-control form-control-sm mb-1" value={formData.address2} onChange={handleChange} />
                  <input type="text" name="address3" className="form-control form-control-sm" value={formData.address3} onChange={handleChange} />
                </div>
              </div>

              {/* Phone & OP Balance */}
              <div className="row mb-1 align-items-center">
                <div className="col-md-2"><label className="form-label fw-bold">Phone No.</label></div>
                <div className="col-md-4">
                  <input type="text" name="phoneNo" className="form-control form-control-sm" value={formData.phoneNo} onChange={handleChange} />
                </div>
                <div className="col-md-3 text-end"><label className="form-label fw-bold">OP Balance</label></div>
                <div className="col-md-3">
                  <input type="text" name="opBalance" className="form-control form-control-sm text-end" value={formData.opBalance} onChange={handleChange} />
                </div>
              </div>

              {/* Email & Credit Limit */}
              <div className="row mb-1 align-items-center">
                <div className="col-md-2"><label className="form-label fw-bold">Email Id</label></div>
                <div className="col-md-4">
                  <input type="text" name="emailId" className="form-control form-control-sm" value={formData.emailId} onChange={handleChange} />
                </div>
                <div className="col-md-3 text-end"><label className="form-label fw-bold">Credit Limit</label></div>
                <div className="col-md-3">
                  <input type="text" name="creditLimit" className="form-control form-control-sm text-end" value={formData.creditLimit} onChange={handleChange} />
                </div>
              </div>

              {/* Commission Section */}
              <div className="row mb-1 align-items-center mt-2">
                <div className="col-md-3"><label className="form-label fw-bold mb-0">Commission % On [C]ompany</label></div>
                <div className="col-md-1">
                  <select name="commissionType" className="form-select form-select-sm" value={formData.commissionType} onChange={handleChange}>
                    <option value="C">C</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <input type="text" name="company" className="form-control form-control-sm" value={formData.company} onChange={handleChange} />
                </div>
              </div>

              {/* Marketing Section */}
              <div className="row mb-1 align-items-center">
                <div className="col-md-3"><label className="form-label fw-bold mb-0">Under Marketing</label></div>
                <div className="col-md-1">
                  <select name="underMarketing" className="form-select form-select-sm" value={formData.underMarketing} onChange={handleChange}>
                    <option value="N">N</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <input type="text" name="marketingText" className="form-control form-control-sm" value={formData.marketingText} onChange={handleChange} />
                </div>
              </div>

              {/* Checkbox */}
              <div className="row mb-3 mt-2">
                <div className="col-md-3 offset-md-2">
                  <div className="form-check">
                    <input type="checkbox" name="isDiscountable" className="form-check-input" checked={formData.isDiscountable} onChange={handleChange} id="discCheck" />
                    <label className="form-check-label fw-bold" htmlFor="discCheck">Is Discountable</label>
                  </div>
                </div>
              </div>

            </div>
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
        {/* FOOTER BUTTON BAR */}
        <div className="panel-footer border-top bg---rt-color-dark p-2">
          
        </div>
      </div>
    </div>
  );
};

export default AgentForm;