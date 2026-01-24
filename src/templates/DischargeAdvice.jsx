import React, { useState } from 'react';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const DischargeAdvice = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('Detail');

  const [diagnosisRows, setDiagnosisRows] = useState([
    { sl: 1, diagnosis: 'HEAD INJURY WITH FOCAL PARENCHYMAL HEMORRHAGIC CONTUSIONS.' },
    { sl: 2, diagnosis: '' }
  ]);

  const [complaintRows, setComplaintRows] = useState([
    { sl: 1, complaint: 'ON ADMISSION PATIENT WAS UNCONCIOUS STATE.' },
    { sl: 2, complaint: 'ALLEGED H/O- HEAD INJURY DUE TO FALL FROM HEIGHT.' },
    { sl: 3, complaint: '' }
  ]);

  // --- HANDLERS ---
  const handleDiagnosisChange = (index, value) => {
    const newData = [...diagnosisRows];
    newData[index].diagnosis = value;
    if (index === newData.length - 1 && value.trim() !== '') {
      newData.push({ sl: newData.length + 1, diagnosis: '' });
    }
    setDiagnosisRows(newData);
  };

  const handleComplaintChange = (index, value) => {
    const newData = [...complaintRows];
    newData[index].complaint = value;
    if (index === newData.length - 1 && value.trim() !== '') {
      newData.push({ sl: newData.length + 1, complaint: '' });
    }
    setComplaintRows(newData);
  };

  // --- STYLES ---
  const inputStyle = { fontSize: "11px", padding: "0px 4px", height: "22px", borderRadius: "0px" };
  const labelStyle = { fontSize: "11px", margin: "0", whiteSpace: "nowrap", color: '#545554ff', fontWeight: '500' };
  const headerStyle = { fontSize: "12px", fontWeight: "600", margin: 0 };

  return (
    <div className="main-content d-flex flex-column" style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f0f2f5' }}>
      <div className="panel h-100 d-flex flex-column border-0 shadow-none m-0">
        
        {/* --- 1. Header (Fixed) --- */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1 px-2 flex-shrink-0">
          <h6 className="mb-0 text-white" style={{fontSize: '13px'}}>Discharge And Advise</h6>
          <div className="d-flex gap-1">
             <button className="btn btn-sm btn-outline-light py-0 border-0" style={{height:'20px', lineHeight: 1}}>-</button>
             <button className="btn btn-sm btn-danger py-0 border-0" style={{height:'20px', lineHeight: 1}}>x</button>
          </div>
        </div>

        {/* --- 2. Tabs (Fixed) --- */}
       

        {/* --- 3. Body (Flex Grow - Fills Remaining Space) --- */}
        <div className="panel-body p-2 d-flex flex-column flex-grow-1 overflow-hidden ">
          
          {/* List Tab Placeholder */}
         

          {/* DETAIL TAB (Main Form) */}
          {activeTab === 'Detail' && (
            <div className="d-flex flex-column h-100 overflow-hidden">
                
                {/* --- Form Section (Fixed Height Content) --- */}
                <div className="flex-shrink-0">
                    {/* Top Row */}
                    <div className="panel border rounded p-1  mb-1">
                        <div className="row g-1 align-items-center mb-1">
                            <div className="col-md-4 d-flex align-items-center gap-2">
                                <label style={labelStyle}>Advise No.</label>
                                <input type="text" className="form-control form-control-sm bg-warning bg-opacity-10" style={inputStyle} defaultValue="D-004271/22-23" />
                            </div>
                            <div className="col-md-4 d-flex align-items-center gap-2">
                                <label style={labelStyle}>DischargeTime</label>
                                <input type="text" className="form-control form-control-sm" style={inputStyle} defaultValue="08:15 AM" />
                            </div>
                            <div className="col-md-4 d-flex align-items-center gap-2">
                                <label style={labelStyle}>Discharge Date</label>
                                <input type="date" className="form-control form-control-sm" style={inputStyle} defaultValue="2022-12-29" />
                            </div>
                        </div>
                        <div className="row g-1 align-items-center">
                            <div className="col-md-6 d-flex align-items-center gap-2">
                                <label style={labelStyle}>Patient Name</label>
                                <input type="text" className="form-control form-control-sm fw-bold" style={inputStyle} defaultValue="TOHIT DIN" />
                                <label style={labelStyle}>Admission No.</label>
                                <input type="text" className="form-control form-control-sm" style={{...inputStyle, width: '100px'}} defaultValue="A-000876/22-23" />
                            </div>
                            <div className="col-md-6 d-flex align-items-center gap-2">
                                <label style={labelStyle}>Bed</label>
                                <input type="text" className="form-control form-control-sm" style={{...inputStyle, width: '60px'}} defaultValue="102" />
                                <label style={labelStyle}>AdmTime</label>
                                <input type="text" className="form-control form-control-sm" style={{...inputStyle, width: '80px'}} defaultValue="01:46 AM" />
                            </div>
                        </div>
                    </div>

                    {/* Patient Detail */}
                    <div className="panel border rounded-1 p-2 mb-1 position-relative">
                        <span className="position-absolute top-0 start-0 translate-middle-y ms-2 px-1  text-primary small fw-bold" style={{fontSize:'10px'}}>Patient Detail</span>
                        <div className="row g-1 pt-1">
                            <div className="col-md-9">
                                <div className="row g-1 mb-1">
                                    <div className="col-md-4 d-flex align-items-center gap-1">
                                        <label style={labelStyle}>Age</label>
                                        <input type="text" className="form-control form-control-sm" style={{...inputStyle, width: '40px'}} defaultValue="18.00" />
                                        <select className="form-select form-select-sm p-0 ps-1" style={{...inputStyle, width: '40px'}}><option>Y</option></select>
                                        <label style={labelStyle}>Sex</label>
                                        <select className="form-select form-select-sm p-0 ps-1" style={{...inputStyle, width: '50px'}}><option>M</option></select>
                                    </div>
                                    <div className="col-md-4 d-flex align-items-center gap-1">
                                        <label style={labelStyle}>Phone</label>
                                        <input type="text" className="form-control form-control-sm" style={inputStyle} defaultValue="9635427513" />
                                    </div>
                                    <div className="col-md-4 d-flex align-items-center gap-1">
                                        <label style={labelStyle}>Marital Status</label>
                                        <select className="form-select form-select-sm p-0 ps-1" style={inputStyle}><option>U</option></select>
                                    </div>
                                </div>
                                <div className="row g-1 mb-1">
                                    <div className="col-md-4 d-flex align-items-center gap-1">
                                        <label style={labelStyle}>AddmitionDate</label>
                                        <input type="date" className="form-control form-control-sm" style={inputStyle} defaultValue="2022-12-25" />
                                    </div>
                                    <div className="col-md-4 d-flex align-items-center gap-1">
                                        <label style={labelStyle}>W/O S/O</label>
                                        <input type="text" className="form-control form-control-sm" style={inputStyle} defaultValue="RAHIM DIN" />
                                    </div>
                                    <div className="col-md-4 d-flex align-items-center gap-1">
                                        <label style={labelStyle}>Relation</label>
                                        <input type="text" className="form-control form-control-sm" style={inputStyle} defaultValue="FATHER" />
                                    </div>
                                </div>
                                <div className="row g-1 align-items-center">
                                    <div className="col-md-12 d-flex align-items-center gap-1">
                                        <label style={labelStyle}>Address</label>
                                        <input type="text" className="form-control form-control-sm" style={inputStyle} defaultValue="VILL-DEBHOG, P.O-DEBHOG, EAST MIDNAPORE" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-center justify-content-center">
                                <div className="border p-2  text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center">
                                    <img src={`https://barcode.tec-it.com/barcode.ashx?data=A-000876/22-23&code=Code128&dpi=96`} alt="Barcode" style={{height:'35px', maxWidth:'100%'}} />
                                    <span className="small fw-bold mt-1" style={{fontSize: '10px'}}>A-000876/22-23</span>
                                </div>
                            </div>
                        </div>
                        <div className="row g-1 mt-1 border-top pt-1">
                            <div className="col-md-3 d-flex align-items-center gap-1">
                                <label style={labelStyle}>Nationality</label>
                                <input type="text" className="form-control form-control-sm" style={inputStyle} defaultValue="INDIAN" />
                            </div>
                            <div className="col-md-4 d-flex align-items-center gap-1">
                                <label style={labelStyle}>Under Care Dr.</label>
                                <input type="text" className="form-control form-control-sm" style={inputStyle} defaultValue="NILADRI GHOSH" />
                            </div>
                            <div className="col-md-3 d-flex align-items-center gap-1">
                                <label style={labelStyle}>Referral</label>
                                <input type="text" className="form-control form-control-sm" style={inputStyle} />
                            </div>
                            <div className="col-md-2 d-flex align-items-center gap-1">
                                <label style={labelStyle}>Corporate</label>
                                <input type="text" className="form-control form-control-sm" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Discharge Info & Remarks */}
                    <div className="row g-1 mb-1 align-items-center">
                        <div className="col-md-4 d-flex align-items-center gap-1">
                            <label style={labelStyle}>Reason Discharge</label>
                            <select className="form-select form-select-sm" style={inputStyle}><option>Normal Discharge</option></select>
                        </div>
                        <div className="col-md-3 d-flex align-items-center gap-1">
                            <label style={labelStyle}>OT Date</label>
                            <input type="date" className="form-control form-control-sm" style={inputStyle} />
                        </div>
                        <div className="col-md-5 d-flex align-items-center gap-1">
                            <label style={labelStyle}>O.T.Type</label>
                            <input type="text" className="form-control form-control-sm" style={inputStyle} />
                            <input type="text" className="form-control form-control-sm" style={{...inputStyle, width: '80px'}} />
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-2">
                        <span className="badge bg-secondary rounded-0" style={{fontSize:'11px'}}>Remarks</span>
                        <input type="text" className="form-control form-control-sm rounded-0" style={inputStyle} />
                    </div>
                </div>

                {/* --- 4. Main Tables Split (Flex Grow Area) --- */}
                {/* minHeight: 0 is CRITICAL for Flex children to shrink properly */}
                <div className="row g-2 flex-grow-1" style={{ minHeight: 0 }}>
                    
                    {/* Left: Diagnosis */}
                    <div className="col-md-6 d-flex flex-column h-100">
                        <div className="d-flex gap-1 mb-1 flex-shrink-0">
                            <button className="btn btn-sm btn-outline-primary py-0" style={{fontSize:'10px'}}>Load EMR</button>
                            <button className="btn btn-sm btn-outline-primary py-0" style={{fontSize:'10px'}}>Load Diet</button>
                        </div>
                        
                        <div className="panel border flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
                            <div className="panel-header py-1 px-2  text-center flex-shrink-0"><small style={headerStyle}>Diagnosis</small></div>
                            <div className="flex-grow-1" style={{ position: 'relative' }}>
                                <OverlayScrollbarsComponent style={{ height: '100%', width: '100%', position: 'absolute' }}>
                                    <table className="table table-bordered table-sm mb-0 small table-hover" style={{ tableLayout: 'fixed' }}>
                                        <thead className="sticky-top ">
                                            <tr>
                                                <th style={{width:'35px', textAlign:'center'}}>Sl</th>
                                                <th>Diagnosis</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {diagnosisRows.map((row, index) => (
                                                <tr key={index} className={index === diagnosisRows.length -1 ? "" : "table-warning"}>
                                                    <td className="text-center ">{row.sl}</td>
                                                    <td className="p-0">
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm border-0 rounded-0 bg-transparent h-100 w-100" 
                                                            style={{fontSize: '11px', boxShadow:'none'}}
                                                            value={row.diagnosis}
                                                            onChange={(e) => handleDiagnosisChange(index, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </OverlayScrollbarsComponent>
                            </div>
                        </div>
                    </div>

                    {/* Right: Complaints */}
                    <div className="col-md-6 d-flex flex-column h-100">
                        <div className="d-flex justify-content-between align-items-center mb-1 flex-shrink-0">
                            <span className="small fw-bold">Present Complains (Reason for Admission)</span>
                            <button className="btn btn-sm btn-outline-secondary py-0" style={{fontSize:'10px'}}>Load Disc Adv Word</button>
                        </div>

                        <div className="panel border flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
                            <div className="panel-header py-1 px-2  text-center flex-shrink-0"><small style={headerStyle}>Chief Complaint</small></div>
                            <div className="flex-grow-1" style={{ position: 'relative' }}>
                                <OverlayScrollbarsComponent style={{ height: '100%', width: '100%', position: 'absolute' }}>
                                    <table className="table table-bordered table-sm mb-0 small table-hover" style={{ tableLayout: 'fixed' }}>
                                        <thead className="sticky-top ">
                                            <tr>
                                                <th style={{width:'35px', textAlign:'center'}}>Sl</th>
                                                <th>Chief Complaint</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {complaintRows.map((row, index) => (
                                                <tr key={index} className={index === complaintRows.length -1 ? "" : "table-warning"}>
                                                    <td className="text-center ">{row.sl}</td>
                                                    <td className="p-0">
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm border-0 rounded-0 bg-transparent h-100 w-100" 
                                                            style={{fontSize: '11px', boxShadow:'none'}}
                                                            value={row.complaint}
                                                            onChange={(e) => handleComplaintChange(index, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </OverlayScrollbarsComponent>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 5. Footer (Fixed Height) --- */}
                <div className="d-flex flex-column flex-shrink-0 mt-2">
                    <div className="d-flex justify-content-center gap-4 mb-2">
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-danger fw-bold small">Discharged By</span>
                            <input type="text" className="form-control form-control-sm fw-bold" style={{...inputStyle, width:'100px'}} defaultValue="ROM" />
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-danger fw-bold small">Current User</span>
                            <input type="text" className="form-control form-control-sm fw-bold" style={{...inputStyle, width:'100px'}} defaultValue="Admin" />
                        </div>
                    </div>

                    <div className="panel-footer  p-2 border-top d-flex justify-content-center gap-2">
                        <button className="btn btn-sm btn-light border">New</button>
                        <button className="btn btn-sm btn-light border">Edit</button>
                        <button className="btn btn-sm btn-primary">Save</button>
                        <button className="btn btn-sm btn-outline-danger">Delete</button>
                        <button className="btn btn-sm btn-warning text-white">Undo</button>
                        <button className="btn btn-sm btn-info text-white">Print</button>
                        <button className="btn btn-sm btn-danger">Exit</button>
                    </div>
                </div>
            </div>
          )}

          

        

        </div>
      </div>
    </div>
  );
};

export default DischargeAdvice;