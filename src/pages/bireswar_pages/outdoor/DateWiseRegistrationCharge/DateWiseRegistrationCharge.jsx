import React, { useState, useRef } from 'react';
import axiosInstance from '../../../../axiosInstance';
import { generateRegistrationChargePDF } from './registrationChargePDF';

const DateWiseRegistrationCharge = () => {
  const fromDateRef = useRef();
  const toDateRef = useRef();
  const [loading, setLoading] = useState(false);

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return '';
    const [year, month, day] = dateValue.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (e, ref, visibleInputId) => {
    const nativeValue = e.target.value;
    const displayValue = formatDisplayDate(nativeValue);
    
    const visibleInput = document.getElementById(visibleInputId);
    if (visibleInput) {
      visibleInput.value = displayValue;
    }
    
    if (ref.current) {
      ref.current.value = displayValue;
    }
  };

  const convertDateForAPI = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const handlePrintReport = async () => {
    const fromDateInput = fromDateRef.current?.value;
    const toDateInput = toDateRef.current?.value;
    
    if (!fromDateInput || !toDateInput) {
      alert('Please select both From and To dates');
      return;
    }
    
    const fromDate = convertDateForAPI(fromDateInput);
    const toDate = convertDateForAPI(toDateInput);
    
    setLoading(true);
    
    try {
      const response = await axiosInstance.get(`/patient-visits-enhanced/date-range?fromDate=${fromDate}&toDate=${toDate}`);
      let apiData = response.data.data;
      
      if (!apiData || apiData.length === 0) {
        alert('No data found for the selected date range');
        setLoading(false);
        return;
      }
      
      // Filter where RegCh !== 0
      apiData = apiData.filter(visit => visit.RegCh && visit.RegCh !== 0);
      
      if (apiData.length === 0) {
        alert('No registration charges found for the selected date range');
        setLoading(false);
        return;
      }
      
      const doc = generateRegistrationChargePDF(apiData, fromDateInput, toDateInput);
      window.open(doc.output('bloburl'), '_blank');
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data from server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4"> 
          <div className="panel-body p-4 p-md-5"> 
            <h4 className="mb-4 text-center">📊 Date Wise Registration Charge Report</h4>
            
            {/* Date Range */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-2 text-md-end">
                <label className="form-label fw-semibold">Date Range:</label>
              </div>
              
              {/* FROM DATE */}
              <div className="col-md-4">
                <div className="input-group" style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="fromDate" 
                    ref={fromDateRef}
                    placeholder="dd/mm/yyyy"
                    pattern="\d{2}/\d{2}/\d{4}"
                    maxLength="10"
                    onInput={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length >= 2 && value.length < 4) {
                        value = value.substring(0,2) + '/' + value.substring(2);
                      } else if (value.length >= 4) {
                        value = value.substring(0,2) + '/' + value.substring(2,4) + '/' + value.substring(4,8);
                      }
                      e.target.value = value;
                    }}
                  />
                  
                  <span 
                    className="input-group-text" 
                    style={{cursor: 'pointer'}} 
                    onClick={() => document.getElementById('nativeFromDate').showPicker()}
                  >
                    <i className="fas fa-calendar-alt"></i>
                  </span>

                  <input 
                    type="date" 
                    id="nativeFromDate"
                    style={{
                        position: 'absolute', 
                        left: '0', 
                        opacity: 0, 
                        width: 'calc(100% - 38px)',
                        height: '100%', 
                        cursor: 'pointer'
                    }}
                    onChange={(e) => handleDateChange(e, fromDateRef, 'fromDate')}
                  />
                </div>
                <small className="text-muted">From Date (dd/mm/yyyy)</small>
              </div>
              
              <div className="col-md-1 text-center fw-semibold d-none d-md-block">- To -</div>
              
              {/* TO DATE */}
              <div className="col-md-4">
                <div className="input-group" style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="toDate" 
                    ref={toDateRef}
                    placeholder="dd/mm/yyyy"
                    pattern="\d{2}/\d{2}/\d{4}"
                    maxLength="10"
                    onInput={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length >= 2 && value.length < 4) {
                        value = value.substring(0,2) + '/' + value.substring(2);
                      } else if (value.length >= 4) {
                        value = value.substring(0,2) + '/' + value.substring(2,4) + '/' + value.substring(4,8);
                      }
                      e.target.value = value;
                    }}
                  />
                  
                  <span 
                    className="input-group-text" 
                    style={{cursor: 'pointer'}} 
                    onClick={() => document.getElementById('nativeToDate').showPicker()}
                  >
                    <i className="fas fa-calendar-alt"></i>
                  </span>

                  <input 
                    type="date" 
                    id="nativeToDate"
                    style={{
                        position: 'absolute', 
                        left: '0', 
                        opacity: 0, 
                        width: 'calc(100% - 38px)',
                        height: '100%', 
                        cursor: 'pointer'
                    }}
                    onChange={(e) => handleDateChange(e, toDateRef, 'toDate')}
                  />
                </div>
                <small className="text-muted">To Date (dd/mm/yyyy)</small>
              </div>
            </div>

            {/* Print Button */}
            <div className="text-center mt-4">
              <button 
                className="btn btn-primary btn-lg px-5" 
                onClick={handlePrintReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fa-light fa-print me-2"></i>
                    Print Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateWiseRegistrationCharge;
