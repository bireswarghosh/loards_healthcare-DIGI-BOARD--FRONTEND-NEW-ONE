import React, { useState } from 'react';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from './components/footer/Footer';

const TestPropertyGroup = () => {
  const [activeTab, setActiveTab] = useState('detail');

  return (
    <div className="main-content">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          
          <div className="panel rounded-3 shadow-sm">
            {/* 1. Modern Header */}
            <div className="panel-header d-flex justify-content-between align-items-center bg-rt-color-dark text-white p-3 rounded-top">
              <h5 className="mb-0 ">
                <i className="fa-solid fa-flask-vial me-2"></i>Test Property Group
              </h5>
               
            </div>

            <div className="panel-body p-4">
              
             
              {activeTab === 'detail' && (
                <>
                  {/* 3. Detail Form Section */}
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <div className="input-group">
                        <span className="input-group-text rt-color-dark">Test Name</span>
                        <input 
                          type="text" 
                          className="form-control" 
                          value="24 HRS URINARY ALBUMIN(MICRO)" 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Split Grid Area - CONVERTED TO TABLE */}
                  <div className="table-responsive border rounded mb-3" style={{ minHeight: '300px' }}>
                    <table className="table table-bordered table-layout-fixed mb-0 h-100">
                      <thead className="table">
                        <tr>
                          <th style={{ width: '40%' }} className="text-uppercase text-muted small fw-bold">Test Property Group</th>
                          <th style={{ width: '60%' }} className="text-uppercase text-muted small fw-bold">Test Property</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ height: '300px' }}>
                          
                          {/* Left Column: Property Group List */}
                          <td className="p-0 align-top bg-rt-color-dark border-end">
                            <div className="list-group list-group-flush">
                              <button className="list-group-item list-group-item-action   border-0 rounded-0">
                                mynewg
                              </button>
                            </div>
                          </td>

                          {/* Right Column: Test Property & Popup */}
                          <td className="p-0 align-top position-relative rt-color-dark-subtle">
                            
                            {/* Input Area */}
                            <div className="bg-rt-color-dark p-2 border-bottom d-flex align-items-center">
                              <div className="flex-grow-1 text-muted fst-italic border border-dashed p-1 rounded bg-rt-color-dark small">
                                To View Test Property Click The Cell
                              </div>
                              <button className="btn btn-sm btn-outline-secondary ms-2">
                                <i className="fa-solid fa-ellipsis"></i>
                              </button>
                            </div>

                           

                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* 6. Footer Button Bar */}
            <div className="panel-footer p-3 bg-rt-color-dark border-top rounded-bottom">
              <div className="d-flex justify-content-center flex-wrap gap-2">
                 
                 

                  <button className="btn btn-sm btn-primary">New</button>
                     <button className="btn btn-sm btn-primary">Edit</button>
                     <button className="btn btn-sm btn-primary" >Save</button>
                     <button className="btn btn-sm btn-primary">Delete</button>
                     <button className="btn btn-sm btn-primary" >Undo</button>
                     <button className="btn btn-sm btn-primary">Print</button>
               
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPropertyGroup;