import React, { useState, useRef } from 'react';
import axiosInstance from '../../../../axiosInstance';
import { generatePatientHistoryPDF } from './patientHistoryPDF';

const PatientHistory = () => {
  const regNoRef = useRef();
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);

  const handleShowReport = async () => {
    const regNo = regNoRef.current?.value;
    
    if (!regNo) {
      alert('Please enter Registration No');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axiosInstance.get(`/patient-complete-data/${regNo}`);
      const result = response.data;
      
      if (!result.success || !result.data) {
        alert('No patient history found for this Registration No');
        setLoading(false);
        return;
      }
      
      setPatientData(result.data);
      const doc = generatePatientHistoryPDF(result.data);
      window.open(doc.output('bloburl'), '_blank');
    } catch (error) {
      console.error('Error fetching patient history:', error);
      alert('Error fetching patient history from server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4"> 
          <div className="panel-body p-4 p-md-5"> 
            <h4 className="mb-4 text-center">📋 Patient History</h4>
            
            <div className="row g-3 mb-4 align-items-center justify-content-center">
              <div className="col-md-3 text-md-end">
                <label className="form-label fw-semibold">Registration No:</label>
              </div>
              
              <div className="col-md-5">
                <input 
                  type="text" 
                  className="form-control" 
                  ref={regNoRef}
                  placeholder="Enter Registration No (e.g., 002107/23-24)"
                />
                <small className="text-muted">Enter patient registration number</small>
              </div>
            </div>

            <div className="text-center mt-4">
              <button 
                className="btn btn-primary btn-lg px-5 me-3" 
                onClick={handleShowReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fa-light fa-print me-2"></i>
                    Print Report
                  </>
                )}
              </button>
              
              <button 
                className="btn btn-secondary btn-lg px-5" 
                onClick={() => window.close()}
              >
                <i className="fa-light fa-times me-2"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {patientData && (
        <div style={{display: 'none'}}>
          <div style={{textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '15px'}}>
            <h2 style={{margin: '0', fontSize: '24px', fontWeight: 'bold'}}>LORDS DIAGNOSTIC</h2>
            <p style={{margin: '5px 0', fontSize: '12px'}}>13/3, CIRCULAR 2ND BYE LANE, KOLKATA</p>
            <h3 style={{margin: '10px 0', fontSize: '18px', fontWeight: 'bold'}}>PATIENT HISTORY REPORT</h3>
          </div>

          <div style={{backgroundColor: '#f5f5f5', padding: '10px', marginBottom: '15px', border: '1px solid #ddd'}}>
            <h4 style={{margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold'}}>PATIENT INFORMATION</h4>
            <table style={{width: '100%', fontSize: '11px', borderCollapse: 'collapse'}}>
              <tbody>
                <tr>
                  <td style={{padding: '4px', width: '20%'}}><strong>Registration No:</strong></td>
                  <td style={{padding: '4px', width: '30%'}}>{patientData.registration.RegistrationNo}</td>
                  <td style={{padding: '4px', width: '15%'}}><strong>Reg. Date:</strong></td>
                  <td style={{padding: '4px', width: '15%'}}>{new Date(patientData.registration.RegistrationDate).toLocaleDateString('en-GB')}</td>
                  <td style={{padding: '4px', width: '10%'}}><strong>Time:</strong></td>
                  <td style={{padding: '4px', width: '10%'}}>{patientData.registration.RegistrationTime}</td>
                </tr>
                <tr>
                  <td style={{padding: '4px'}}><strong>Patient Name:</strong></td>
                  <td style={{padding: '4px'}}>{patientData.registration.PPr} {patientData.registration.PatientName}</td>
                  <td style={{padding: '4px'}}><strong>Age/Sex:</strong></td>
                  <td style={{padding: '4px'}}>{patientData.registration.Age} {patientData.registration.AgeType} / {patientData.registration.Sex}</td>
                  <td style={{padding: '4px'}}><strong>M.Status:</strong></td>
                  <td style={{padding: '4px'}}>{patientData.registration.MStatus}</td>
                </tr>
                <tr>
                  <td style={{padding: '4px'}}><strong>Address:</strong></td>
                  <td style={{padding: '4px'}}>{patientData.registration.Add1}</td>
                  <td style={{padding: '4px'}}><strong>Phone:</strong></td>
                  <td style={{padding: '4px'}}>{patientData.registration.PhoneNo}</td>
                  <td style={{padding: '4px'}}><strong>Religion:</strong></td>
                  <td style={{padding: '4px'}}>{patientData.religion?.Religion}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {patientData.visits?.map((visit, index) => (
            <div key={visit.PVisitId} style={{marginBottom: '20px', pageBreakInside: 'avoid'}}>
              <div style={{backgroundColor: '#e6f2ff', padding: '8px', marginBottom: '10px', border: '1px solid #ccc'}}>
                <h4 style={{margin: '0', fontSize: '13px', fontWeight: 'bold'}}>VISIT #{index + 1} - {visit.VNo}</h4>
              </div>
              <table style={{width: '100%', fontSize: '11px', marginBottom: '10px', borderCollapse: 'collapse'}}>
                <tbody>
                  <tr>
                    <td style={{padding: '4px', width: '20%'}}><strong>Visit Date:</strong></td>
                    <td style={{padding: '4px', width: '30%'}}>{new Date(visit.PVisitDate).toLocaleDateString('en-GB')} {visit.vTime}</td>
                    <td style={{padding: '4px', width: '15%'}}><strong>Doctor:</strong></td>
                    <td style={{padding: '4px', width: '35%'}}>{visit.DoctorName}</td>
                  </tr>
                  <tr>
                    <td style={{padding: '4px'}}><strong>Speciality:</strong></td>
                    <td style={{padding: '4px'}}>{visit.SpecialityName}</td>
                    <td style={{padding: '4px'}}><strong>Visit Type:</strong></td>
                    <td style={{padding: '4px'}}>{visit.VisitTypeName}</td>
                  </tr>
                  <tr>
                    <td style={{padding: '4px'}}><strong>Vitals:</strong></td>
                    <td colSpan="3" style={{padding: '4px'}}>BP: {visit.BpMax}/{visit.BpMin} mmHg, Weight: {visit.Weight} kg</td>
                  </tr>
                  {visit.Remarks && (
                    <tr>
                      <td style={{padding: '4px'}}><strong>Remarks:</strong></td>
                      <td colSpan="3" style={{padding: '4px'}}>{visit.Remarks}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {patientData.emr?.complaints?.filter(c => c.VisitId === visit.PVisitId).length > 0 && (
                <div style={{marginBottom: '8px'}}>
                  <strong style={{fontSize: '11px'}}>Chief Complaints:</strong>
                  <ul style={{margin: '4px 0', paddingLeft: '20px', fontSize: '10px'}}>
                    {patientData.emr.complaints.filter(c => c.VisitId === visit.PVisitId).map((c, i) => (
                      <li key={i}>{c.chief}</li>
                    ))}
                  </ul>
                </div>
              )}

              {patientData.emr?.pastHistory?.filter(p => p.VisitId === visit.PVisitId).length > 0 && (
                <div style={{marginBottom: '8px'}}>
                  <strong style={{fontSize: '11px'}}>Past History:</strong>
                  <ul style={{margin: '4px 0', paddingLeft: '20px', fontSize: '10px'}}>
                    {patientData.emr.pastHistory.filter(p => p.VisitId === visit.PVisitId).map((p, i) => (
                      <li key={i}>{p.pasthistory}</li>
                    ))}
                  </ul>
                </div>
              )}

              {patientData.emr?.diagnosis?.filter(d => d.VisitId === visit.PVisitId).length > 0 && (
                <div style={{marginBottom: '8px'}}>
                  <strong style={{fontSize: '11px'}}>Diagnosis:</strong>
                  <ul style={{margin: '4px 0', paddingLeft: '20px', fontSize: '10px'}}>
                    {patientData.emr.diagnosis.filter(d => d.VisitId === visit.PVisitId).map((d, i) => (
                      <li key={i}>{d.diagonisis}</li>
                    ))}
                  </ul>
                </div>
              )}

              {patientData.emr?.investigations?.filter(inv => inv.VisitId === visit.PVisitId).length > 0 && (
                <div style={{marginBottom: '8px'}}>
                  <strong style={{fontSize: '11px'}}>Investigations:</strong>
                  <ul style={{margin: '4px 0', paddingLeft: '20px', fontSize: '10px'}}>
                    {patientData.emr.investigations.filter(inv => inv.VisitId === visit.PVisitId).map((inv, i) => (
                      <li key={i}>{inv.Invest}</li>
                    ))}
                  </ul>
                </div>
              )}

              {patientData.emr?.medicine?.filter(m => m.VisitId === visit.PVisitId).length > 0 && (
                <div style={{marginBottom: '8px'}}>
                  <strong style={{fontSize: '11px'}}>Medicine:</strong>
                  <ul style={{margin: '4px 0', paddingLeft: '20px', fontSize: '10px'}}>
                    {patientData.emr.medicine.filter(m => m.VisitId === visit.PVisitId).map((m, i) => (
                      <li key={i}>{m.Medicine}</li>
                    ))}
                  </ul>
                </div>
              )}

              {patientData.emr?.adviceMedicine?.filter(a => a.VisitId === visit.PVisitId).length > 0 && (
                <div style={{marginBottom: '8px'}}>
                  <strong style={{fontSize: '11px'}}>Prescribed Medicine:</strong>
                  <ul style={{margin: '4px 0', paddingLeft: '20px', fontSize: '10px'}}>
                    {patientData.emr.adviceMedicine.filter(a => a.VisitId === visit.PVisitId).map((a, i) => (
                      <li key={i}>{a.advmed} - {a.dose} {a.dunit} for {a.nodays} days</li>
                    ))}
                  </ul>
                </div>
              )}

              <hr style={{border: '1px solid #ccc', margin: '15px 0'}} />
            </div>
          ))}

          <div style={{textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#666'}}>
            <p>Generated on: {new Date().toLocaleString('en-GB')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
