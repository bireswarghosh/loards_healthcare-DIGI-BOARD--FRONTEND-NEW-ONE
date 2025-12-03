import React, { useState, useRef } from 'react';
import axiosInstance from '../../../../axiosInstance';
import { generateOthersBillPDF } from './othersBillPDF';

const OthersBillRegister = () => {
  const fromDateRef = useRef();
  const toDateRef = useRef();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('All');
  const [chargeSelection, setChargeSelection] = useState('All');
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [chargesList, setChargesList] = useState([]);

  React.useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await axiosInstance.get('/outdoor-other-charges');
        setChargesList(response.data.data || []);
      } catch (error) {
        console.error('Error fetching charges:', error);
      }
    };
    fetchCharges();
  }, []);

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

  const handleChargeToggle = (chargeName) => {
    setSelectedCharges(prev => 
      prev.includes(chargeName) 
        ? prev.filter(c => c !== chargeName)
        : [...prev, chargeName]
    );
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
      const response = await axiosInstance.get(`/opd-other-charges-with-items/search/date-range?startDate=${fromDate}&endDate=${toDate}&limit=100`);
      let apiData = response.data.data || [];
      
      if (!apiData || apiData.length === 0) {
        alert('No data found for the selected date range');
        setLoading(false);
        return;
      }
      
      // Filter by selected charges if Selective
      if (reportType === 'Other Charge' && chargeSelection === 'Selective' && selectedCharges.length > 0) {
        apiData = apiData.filter(bill => 
          bill.items?.some(item => selectedCharges.includes(item.ChargeName))
        );
      }
      
      if (apiData.length === 0) {
        alert('No data found for selected charges');
        setLoading(false);
        return;
      }
      
      const doc = generateOthersBillPDF(apiData, fromDateInput, toDateInput, reportType, selectedCharges);
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
            <h4 className="mb-4 text-center">📊 Others Bill Register</h4>
            
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-2 text-md-end">
                <label className="form-label fw-semibold">Date Range:</label>
              </div>
              
              <div className="col-md-4">
                <div className="input-group" style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="fromDate" 
                    ref={fromDateRef}
                    placeholder="dd/mm/yyyy"
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
                    style={{position: 'absolute', left: '0', opacity: 0, width: 'calc(100% - 38px)', height: '100%', cursor: 'pointer'}}
                    onChange={(e) => handleDateChange(e, fromDateRef, 'fromDate')}
                  />
                </div>
                <small className="text-muted">From Date</small>
              </div>
              
              <div className="col-md-1 text-center fw-semibold d-none d-md-block">- To -</div>
              
              <div className="col-md-4">
                <div className="input-group" style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="toDate" 
                    ref={toDateRef}
                    placeholder="dd/mm/yyyy"
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
                    style={{position: 'absolute', left: '0', opacity: 0, width: 'calc(100% - 38px)', height: '100%', cursor: 'pointer'}}
                    onChange={(e) => handleDateChange(e, toDateRef, 'toDate')}
                  />
                </div>
                <small className="text-muted">To Date</small>
              </div>
            </div>

            <div className="mb-4 border rounded-3 p-3 shadow-sm">
              <h6 className="fw-bold mb-3">Report Type</h6>
              <div className="d-flex gap-4">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="reportType" 
                    id="reportAll" 
                    checked={reportType === 'All'}
                    onChange={() => setReportType('All')}
                  />
                  <label className="form-check-label" htmlFor="reportAll">All</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="reportType" 
                    id="reportOtherCharge" 
                    checked={reportType === 'Other Charge'}
                    onChange={() => setReportType('Other Charge')}
                  />
                  <label className="form-check-label" htmlFor="reportOtherCharge">Other Charge</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="reportType" 
                    id="reportOt" 
                    checked={reportType === 'Ot'}
                    onChange={() => setReportType('Ot')}
                  />
                  <label className="form-check-label" htmlFor="reportOt">Ot</label>
                </div>
              </div>
            </div>

            {reportType === 'Other Charge' && (
              <div className="mb-4 border rounded-3 p-3 shadow-sm">
                <h6 className="fw-bold mb-3">Charge Selection</h6>
                <div className="d-flex gap-4 mb-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="chargeSelection" 
                      id="chargeAll" 
                      checked={chargeSelection === 'All'}
                      onChange={() => setChargeSelection('All')}
                    />
                    <label className="form-check-label" htmlFor="chargeAll">All</label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="chargeSelection" 
                      id="chargeSelective" 
                      checked={chargeSelection === 'Selective'}
                      onChange={() => setChargeSelection('Selective')}
                    />
                    <label className="form-check-label" htmlFor="chargeSelective">Selective</label>
                  </div>
                </div>

                {chargeSelection === 'Selective' && (
                  <div className="row g-2 overflow-auto border p-2 rounded" style={{ maxHeight: '300px' }}>
                    {chargesList.map((charge, i) => (
                      <div className="col-md-6 col-lg-4" key={i}>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`charge-${i}`}
                            checked={selectedCharges.includes(charge.ChargeName || charge.Charge)}
                            onChange={() => handleChargeToggle(charge.ChargeName || charge.Charge)}
                          />
                          <label className="form-check-label" htmlFor={`charge-${i}`}>
                            {charge.ChargeName || charge.Charge}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                    Windows Print
                  </>
                )}
              </button>
              <button 
                className="btn btn-secondary btn-lg px-5 ms-3" 
                onClick={() => window.close()}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OthersBillRegister;
