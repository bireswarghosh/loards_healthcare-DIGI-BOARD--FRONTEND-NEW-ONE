import React, { useState, useRef } from 'react';
import axiosInstance from '../../../../axiosInstance';
import { getPDFGenerator } from './pdfGenerators';

const DrRectVisitDetail = () => {
  const fromDateRef = useRef();
  const toDateRef = useRef();
  const [viewOption, setViewOption] = useState('UserWise');
  const [reportType, setReportType] = useState('All');
  const [loading, setLoading] = useState(false);
  const [entryBySelect, setEntryBySelect] = useState('allUsers');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [doctorSelect, setDoctorSelect] = useState('allDoctors');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(8);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [visitTypeSelect, setVisitTypeSelect] = useState('allVisitTypes');
  const [selectedVisitTypes, setSelectedVisitTypes] = useState([]);
  const [visitTypeList, setVisitTypeList] = useState([]);
  const [refDoctorSelect, setRefDoctorSelect] = useState('allDoctors');
  const [selectedRefDoctors, setSelectedRefDoctors] = useState([]);
  const [refWiseSelect, setRefWiseSelect] = useState('allReferals');
  const [selectedRefWise, setSelectedRefWise] = useState([]);
  const [refDoctorSearchTerm, setRefDoctorSearchTerm] = useState('');
  const [filteredRefDoctors, setFilteredRefDoctors] = useState([]);
  const [refDoctorCurrentPage, setRefDoctorCurrentPage] = useState(1);
  const [refWiseSearchTerm, setRefWiseSearchTerm] = useState('');
  const [filteredRefWise, setFilteredRefWise] = useState([]);
  const [refWiseCurrentPage, setRefWiseCurrentPage] = useState(1);
  const [referalList, setReferalList] = useState([]);
  const [advanceBookingSelect, setAdvanceBookingSelect] = useState('allReferals');
  const [selectedAdvanceBooking, setSelectedAdvanceBooking] = useState([]);
  const [advanceBookingSearchTerm, setAdvanceBookingSearchTerm] = useState('');
  const [filteredAdvanceBooking, setFilteredAdvanceBooking] = useState([]);
  const [advanceBookingCurrentPage, setAdvanceBookingCurrentPage] = useState(1);

  // Helper function to format date from YYYY-MM-DD (native date input format) to DD/MM/YYYY
  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return '';
    const [year, month, day] = dateValue.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper function to update the input's value and reference when date picker is used
  const handleDateChange = (e, ref, visibleInputId) => {
    const nativeValue = e.target.value; // YYYY-MM-DD
    const displayValue = formatDisplayDate(nativeValue); // DD/MM/YYYY
    
    // Update the visible text input field's value
    const visibleInput = document.getElementById(visibleInputId);
    if (visibleInput) {
      visibleInput.value = displayValue;
    }
    
    // Also update the ref itself, which is used for API calls
    if (ref.current) {
      ref.current.value = displayValue;
    }
  };


  const handleUserCheckboxChange = (user) => {
    setSelectedUsers(prev => {
      if (prev.includes(user)) {
        return prev.filter(u => u !== user);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleDoctorCheckboxChange = (doctor) => {
    setSelectedDoctors(prev => {
      if (prev.includes(doctor)) {
        return prev.filter(d => d !== doctor);
      } else {
        return [...prev, doctor];
      }
    });
  };

  const handleVisitTypeCheckboxChange = (visitType) => {
    setSelectedVisitTypes(prev => {
      if (prev.includes(visitType)) {
        return prev.filter(vt => vt !== visitType);
      } else {
        return [...prev, visitType];
      }
    });
  };

  const handleRefDoctorCheckboxChange = (doctor) => {
    setSelectedRefDoctors(prev => {
      if (prev.includes(doctor)) {
        return prev.filter(d => d !== doctor);
      } else {
        return [...prev, doctor];
      }
    });
  };

  const handleRefWiseCheckboxChange = (ref) => {
    setSelectedRefWise(prev => {
      if (prev.includes(ref)) {
        return prev.filter(r => r !== ref);
      } else {
        return [...prev, ref];
      }
    });
  };

  const handleAdvanceBookingCheckboxChange = (ref) => {
    setSelectedAdvanceBooking(prev => {
      if (prev.includes(ref)) {
        return prev.filter(r => r !== ref);
      } else {
        return [...prev, ref];
      }
    });
  };

  // Fetch users and doctors on component mount
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setUserList(response.data.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUserList([]);
      }
    };
    
    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get('/doctors');
        setDoctorList(response.data.data || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctorList([]);
      }
    };
    
    const fetchVisitTypes = async () => {
      try {
        const response = await axiosInstance.get('/visit-types');
        console.log('Visit Types Response:', response.data);
        setVisitTypeList(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error fetching visit types:', error);
        // Fallback with common visit types
        setVisitTypeList([
          { VisitType: 'CONSULTATION' },
          { VisitType: 'DIAGNOSIS' },
          { VisitType: 'REPORTING' },
          { VisitType: 'FOLLOW UP' }
        ]);
      }
    };
    
    const fetchReferals = async () => {
      try {
        const response = await axiosInstance.get('/referals');
        setReferalList(response.data.data || []);
      } catch (error) {
        console.error('Error fetching referals:', error);
        setReferalList([]);
      }
    };
    
    fetchUsers();
    fetchDoctors();
    fetchVisitTypes();
    fetchReferals();
  }, []);

  // Filter doctors based on search term
  React.useEffect(() => {
    const filtered = doctorList.filter(doctor => 
      doctor.Doctor.toLowerCase().includes(doctorSearchTerm.toLowerCase())
    );
    setFilteredDoctors(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [doctorList, doctorSearchTerm]);

  // Filter ref doctors based on search term
  React.useEffect(() => {
    const filtered = doctorList.filter(doctor => 
      doctor.Doctor.toLowerCase().includes(refDoctorSearchTerm.toLowerCase())
    );
    setFilteredRefDoctors(filtered);
    setRefDoctorCurrentPage(1);
  }, [doctorList, refDoctorSearchTerm]);

  // Filter ref wise based on search term
  React.useEffect(() => {
    const filtered = referalList.filter(referal => 
      referal.Referal.toLowerCase().includes(refWiseSearchTerm.toLowerCase())
    );
    setFilteredRefWise(filtered);
    setRefWiseCurrentPage(1);
  }, [referalList, refWiseSearchTerm]);

  // Filter advance booking based on search term
  React.useEffect(() => {
    const filtered = referalList.filter(referal => 
      referal.Referal.toLowerCase().includes(advanceBookingSearchTerm.toLowerCase())
    );
    setFilteredAdvanceBooking(filtered);
    setAdvanceBookingCurrentPage(1);
  }, [referalList, advanceBookingSearchTerm]);

  // Convert dd/mm/yyyy to yyyy-mm-dd for API
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
    
    // Convert dd/mm/yyyy to yyyy-mm-dd for API
    const fromDate = convertDateForAPI(fromDateInput);
    const toDate = convertDateForAPI(toDateInput);
    
    if ((viewOption !== 'UserWise' && viewOption !== 'DoctorWise' && viewOption !== 'Visit Type' && viewOption !== 'RefDoctorWise' && viewOption !== 'Ref wise' && viewOption !== 'Advance Booking') || (reportType !== 'All' && reportType !== 'Only Doctor Ch.' && reportType !== 'Only Service Ch.' && reportType !== "Doctor's Ch. (Summary)" && reportType !== 'Visit ID Wise' && reportType !== 'Visit Type Wise' && reportType !== 'Visit Type User Wise' && reportType !== 'Registration No Wise' && reportType !== 'Visit Type grp Wise' && reportType !== 'COMPANY WISE')) {
      alert('Please select: View Options = UserWise, DoctorWise, Visit Type, RefDoctorWise, Ref wise, or Advance Booking, Report Type = All, Only Doctor Ch., Only Service Ch., Doctor\'s Ch. (Summary), Visit ID Wise, Visit Type Wise, Visit Type User Wise, Registration No Wise, Visit Type grp Wise, or COMPANY WISE');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axiosInstance.get(`/patient-visits-enhanced/date-range?fromDate=${fromDate}&toDate=${toDate}`);
      let apiData = response.data.data;
      
      if (!apiData || apiData.length === 0) {
        alert('No data found for the selected date range');
        setLoading(false);
        return;
      }
      
      // Filter by selected users if selective users is chosen
      if (viewOption === 'UserWise' && entryBySelect === 'selectiveUsers' && selectedUsers.length > 0) {
        apiData = apiData.filter(visit => selectedUsers.includes(visit.UserName));
        
        if (apiData.length === 0) {
          alert('No data found for the selected users in the date range');
          setLoading(false);
          return;
        }
      }
      
      // Filter by selected doctors if selective doctors is chosen
      if (viewOption === 'DoctorWise' && doctorSelect === 'selectiveDoctors' && selectedDoctors.length > 0) {
        apiData = apiData.filter(visit => selectedDoctors.includes(visit.DoctorName));
        
        if (apiData.length === 0) {
          alert('No data found for the selected doctors in the date range');
          setLoading(false);
          return;
        }
      }
      
      // Filter by selected visit types if selective visit types is chosen
      if (viewOption === 'Visit Type' && visitTypeSelect === 'selectiveVisitTypes' && selectedVisitTypes.length > 0) {
        apiData = apiData.filter(visit => selectedVisitTypes.includes(visit.VisitTypeName));
        
        if (apiData.length === 0) {
          alert('No data found for the selected visit types in the date range');
          setLoading(false);
          return;
        }
      }
      
      // Filter by selected ref doctors if selective ref doctors is chosen
      if (viewOption === 'RefDoctorWise' && refDoctorSelect === 'selectiveDoctors' && selectedRefDoctors.length > 0) {
        apiData = apiData.filter(visit => selectedRefDoctors.includes(visit.DoctorName));
        
        if (apiData.length === 0) {
          alert('No data found for the selected ref doctors in the date range');
          setLoading(false);
          return;
        }
      }
      
      // Filter by selected ref wise if selective referals is chosen
      if (viewOption === 'Ref wise' && refWiseSelect === 'selectiveReferals' && selectedRefWise.length > 0) {
        apiData = apiData.filter(visit => selectedRefWise.includes(visit.Referalid));
        
        if (apiData.length === 0) {
          alert('No data found for the selected referals in the date range');
          setLoading(false);
          return;
        }
      }
      
      // Filter by selected advance booking if selective referals is chosen
      if (viewOption === 'Advance Booking' && advanceBookingSelect === 'selectiveReferals' && selectedAdvanceBooking.length > 0) {
        apiData = apiData.filter(visit => selectedAdvanceBooking.includes(visit.Referalid));
        
        if (apiData.length === 0) {
          alert('No data found for the selected advance booking referals in the date range');
          setLoading(false);
          return;
        }
      }
      
      let selectionOption;
      if (viewOption === 'DoctorWise') {
        selectionOption = doctorSelect === 'selectiveDoctors' ? 'selectiveDoctors' : 'allDoctors';
      } else if (viewOption === 'Visit Type') {
        selectionOption = visitTypeSelect === 'selectiveVisitTypes' ? 'selectiveVisitTypes' : 'allVisitTypes';
      } else if (viewOption === 'RefDoctorWise') {
        selectionOption = refDoctorSelect === 'selectiveDoctors' ? 'selectiveDoctors' : 'allDoctors';
      } else if (viewOption === 'Ref wise') {
        selectionOption = refWiseSelect === 'selectiveReferals' ? 'selectiveReferals' : 'allReferals';
      } else if (viewOption === 'Advance Booking') {
        selectionOption = advanceBookingSelect === 'selectiveReferals' ? 'selectiveReferals' : 'allReferals';
      } else {
        selectionOption = 'allDoctors';
      }
      const pdfGenerator = getPDFGenerator(viewOption, selectionOption, reportType);
      const doc = pdfGenerator(apiData, fromDateInput, toDateInput);
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
      {/* Custom CSS for date input removed */}
      
      <div className="container my-5">
        {/* Replaced 'card' and 'card-body' with 'panel' and 'panel-body' for dark theme compatibility */}
        <div className="panel shadow-lg border-0 rounded-4"> 
          <div className="panel-body p-4 p-md-5"> 
            {/* Date Range - CORRECTED STRUCTURE */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-2 text-md-end">
                <label className="form-label fw-semibold">Date Range:</label>
              </div>
              
              {/* FROM DATE INPUT */}
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
                  
                  {/* Calendar Icon - Triggers the native date picker */}
                  <span 
                    className="input-group-text" 
                    style={{cursor: 'pointer'}} 
                    onClick={() => document.getElementById('nativeFromDate').showPicker()}
                  >
                    <i className="fas fa-calendar-alt"></i>
                  </span>

                  {/* Native Date Input Field (Functional but Hidden) */}
                  <input 
                    type="date" 
                    id="nativeFromDate"
                    // Set native input to be visually hidden but functionally accessible
                    // Overlay it on the text input area so clicking the text input also opens the picker (optional but good UX)
                    style={{
                        position: 'absolute', 
                        left: '0', 
                        opacity: 0, 
                        width: 'calc(100% - 38px)', /* width of text input only */
                        height: '100%', 
                        cursor: 'pointer'
                    }}
                    // When the user selects a date, format it and put it into the visible text input
                    onChange={(e) => handleDateChange(e, fromDateRef, 'fromDate')}
                  />
                </div>
                <small className="text-muted">From Date (dd/mm/yyyy)</small>
              </div>
              
              <div className="col-md-1 text-center fw-semibold d-none d-md-block">- To -</div>
              
              {/* TO DATE INPUT */}
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
                  
                  {/* Calendar Icon - Triggers the native date picker */}
                  <span 
                    className="input-group-text" 
                    style={{cursor: 'pointer'}} 
                    onClick={() => document.getElementById('nativeToDate').showPicker()}
                  >
                    <i className="fas fa-calendar-alt"></i>
                  </span>

                  {/* Native Date Input Field (Functional but Hidden) */}
                  <input 
                    type="date" 
                    id="nativeToDate"
                    // Set native input to be visually hidden but functionally accessible
                    style={{
                        position: 'absolute', 
                        left: '0', 
                        opacity: 0, 
                        width: 'calc(100% - 38px)', /* width of text input only */
                        height: '100%', 
                        cursor: 'pointer'
                    }}
                    // When the user selects a date, format it and put it into the visible text input
                    onChange={(e) => handleDateChange(e, toDateRef, 'toDate')}
                  />
                </div>
                <small className="text-muted">To Date (dd/mm/yyyy)</small>
              </div>
            </div>

            {/* View Options */}
            <div className="mb-4 border rounded-3 p-3 shadow-sm">
              <h6 className="fw-bold mb-3">View Options</h6>
              <div className="row g-3">
                {['UserWise', 'DoctorWise', 'Visit Type', 'RefDoctorWise', 'Ref wise', 'Advance Booking'].map((opt, index) => (
                  <div className="col-md-6 col-lg-4" key={index}>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="viewOption" 
                        id={`viewOpt-${index}`} 
                        checked={viewOption === opt}
                        onChange={() => setViewOption(opt)}
                      />
                      <label className="form-check-label" htmlFor={`viewOpt-${index}`}>
                        {opt}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Entry By Selection - Only show for UserWise */}
            {viewOption === 'UserWise' && (
              <div className="mb-4 border rounded-3 p-3 shadow-sm">
                <h6 className="fw-bold mb-3">Entry By Selection</h6>
                {/* ADDED: d-flex flex-nowrap to keep radio buttons on one line */}
                <div className="mb-3 d-flex flex-nowrap">
                  <div className="form-check form-check-inline me-4">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="entryBySelect" 
                      id="allUsers" 
                      checked={entryBySelect === 'allUsers'}
                      onChange={() => setEntryBySelect('allUsers')}
                    />
                    <label className="form-check-label" htmlFor="allUsers">All Users</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="entryBySelect" 
                      id="selectiveUsers" 
                      checked={entryBySelect === 'selectiveUsers'}
                      onChange={() => setEntryBySelect('selectiveUsers')}
                    />
                    <label className="form-check-label" htmlFor="selectiveUsers">Selective Users</label>
                  </div>
                </div>

                {entryBySelect === 'selectiveUsers' && (
                  <div className="row mt-2 g-2 overflow-auto border p-2 rounded" style={{ maxHeight: '180px' }}>
                    {userList.map((user, i) => (
                      <div className="col-md-6 col-lg-4" key={i}>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`user-${i}`}
                            checked={selectedUsers.includes(user.UserName)}
                            onChange={() => handleUserCheckboxChange(user.UserName)}
                          />
                          <label className="form-check-label" htmlFor={`user-${i}`}>
                            {user.UserName} (ID: {user.UserId})
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Doctor Selection - Only show for DoctorWise */}
            {viewOption === 'DoctorWise' && (
              <div className="mb-4 border rounded-3 p-3 shadow-sm">
                <h6 className="fw-bold mb-3">Doctor Selection</h6>
                <div className="mb-3">
                  <div className="form-check form-check-inline me-4">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="doctorSelect" 
                      id="allDoctors" 
                      checked={doctorSelect === 'allDoctors'}
                      onChange={() => setDoctorSelect('allDoctors')}
                    />
                    <label className="form-check-label" htmlFor="allDoctors">All Doctors</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="doctorSelect" 
                      id="selectiveDoctors" 
                      checked={doctorSelect === 'selectiveDoctors'}
                      onChange={() => setDoctorSelect('selectiveDoctors')}
                    />
                    <label className="form-check-label" htmlFor="selectiveDoctors">Selective Doctors</label>
                  </div>
                </div>

                {doctorSelect === 'selectiveDoctors' && (
                  <div>
                    <div className="mb-3">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search doctor by name..."
                        value={doctorSearchTerm}
                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="row mt-2 g-2 overflow-auto border p-2 rounded" style={{ maxHeight: '180px' }}>
                      {filteredDoctors.slice((currentPage - 1) * doctorsPerPage, currentPage * doctorsPerPage).map((doctor, i) => (
                        <div className="col-md-6 col-lg-4" key={i}>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`doctor-${i}`}
                              checked={selectedDoctors.includes(doctor.Doctor)}
                              onChange={() => handleDoctorCheckboxChange(doctor.Doctor)}
                            />
                            <label className="form-check-label" htmlFor={`doctor-${i}`}>
                              {doctor.Doctor}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredDoctors.length > doctorsPerPage && (
                      <nav className="mt-3">
                        <ul className="pagination pagination-sm justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              ← Prev
                            </button>
                          </li>
                          {(() => {
                            const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
                            const maxVisible = 5;
                            let startPage = Math.max(1, currentPage - 2);
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                            
                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                  <button className="page-link" onClick={() => setCurrentPage(i)}>{i}</button>
                                </li>
                              );
                            }
                            return pages;
                          })()}
                          <li className={`page-item ${currentPage === Math.ceil(filteredDoctors.length / doctorsPerPage) ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDoctors.length / doctorsPerPage)))}
                              disabled={currentPage === Math.ceil(filteredDoctors.length / doctorsPerPage)}
                            >
                              Next →
                            </button>
                          </li>
                        </ul>
                        <div className="text-center mt-2 text-muted small">
                          Showing {Math.min((currentPage - 1) * doctorsPerPage + 1, filteredDoctors.length)} to {Math.min(currentPage * doctorsPerPage, filteredDoctors.length)} of {filteredDoctors.length} doctors
                        </div>
                      </nav>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Visit Type Selection - Only show for Visit Type */}
            {viewOption === 'Visit Type' && (
              <div className="mb-4 border rounded-3 p-3 shadow-sm">
                <h6 className="fw-bold mb-3">Visit Type Selection</h6>
                <div className="mb-3">
                  <div className="form-check form-check-inline me-4">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="visitTypeSelect" 
                      id="allVisitTypes" 
                      checked={visitTypeSelect === 'allVisitTypes'}
                      onChange={() => setVisitTypeSelect('allVisitTypes')}
                    />
                    <label className="form-check-label" htmlFor="allVisitTypes">All Visit Types</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="visitTypeSelect" 
                      id="selectiveVisitTypes" 
                      checked={visitTypeSelect === 'selectiveVisitTypes'}
                      onChange={() => setVisitTypeSelect('selectiveVisitTypes')}
                    />
                    <label className="form-check-label" htmlFor="selectiveVisitTypes">Selective Visit Types</label>
                  </div>
                </div>

                {visitTypeSelect === 'selectiveVisitTypes' && (
                  <div>
                    {visitTypeList.length === 0 ? (
                      <div className="text-muted">Loading visit types...</div>
                    ) : (
                      <div className="row mt-2 g-2 overflow-auto border p-2 rounded" style={{ maxHeight: '180px' }}>
                        {visitTypeList.map((visitType, i) => (
                          <div className="col-md-6 col-lg-4" key={i}>
                            <div className="form-check">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id={`visitType-${i}`}
                                checked={selectedVisitTypes.includes(visitType.VisitType)}
                                onChange={() => handleVisitTypeCheckboxChange(visitType.VisitType)}
                              />
                              <label className="form-check-label" htmlFor={`visitType-${i}`}>
                                {visitType.VisitType}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* RefDoctorWise Selection - Only show for RefDoctorWise */}
            {viewOption === 'RefDoctorWise' && (
              <div className="mb-4 border rounded-3 p-3 shadow-sm">
                <h6 className="fw-bold mb-3">Doctor Selection</h6>
                <div className="mb-3">
                  <div className="form-check form-check-inline me-4">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="refDoctorSelect" 
                      id="allRefDoctors" 
                      checked={refDoctorSelect === 'allDoctors'}
                      onChange={() => setRefDoctorSelect('allDoctors')}
                    />
                    <label className="form-check-label" htmlFor="allRefDoctors">All Doctors</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="refDoctorSelect" 
                      id="selectiveRefDoctors" 
                      checked={refDoctorSelect === 'selectiveDoctors'}
                      onChange={() => setRefDoctorSelect('selectiveDoctors')}
                    />
                    <label className="form-check-label" htmlFor="selectiveRefDoctors">Selective Doctors</label>
                  </div>
                </div>

                {refDoctorSelect === 'selectiveDoctors' && (
                  <div>
                    <div className="mb-3">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search doctor by name..."
                        value={refDoctorSearchTerm}
                        onChange={(e) => setRefDoctorSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="row mt-2 g-2 overflow-auto border p-2 rounded" style={{ maxHeight: '180px' }}>
                      {filteredRefDoctors.slice((refDoctorCurrentPage - 1) * doctorsPerPage, refDoctorCurrentPage * doctorsPerPage).map((doctor, i) => (
                        <div className="col-md-6 col-lg-4" key={i}>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`refDoctor-${i}`}
                              checked={selectedRefDoctors.includes(doctor.Doctor)}
                              onChange={() => handleRefDoctorCheckboxChange(doctor.Doctor)}
                            />
                            <label className="form-check-label" htmlFor={`refDoctor-${i}`}>
                              {doctor.Doctor}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredRefDoctors.length > doctorsPerPage && (
                      <nav className="mt-3">
                        <ul className="pagination pagination-sm justify-content-center">
                          <li className={`page-item ${refDoctorCurrentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setRefDoctorCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={refDoctorCurrentPage === 1}
                            >
                              ← Prev
                            </button>
                          </li>
                          {(() => {
                            const totalPages = Math.ceil(filteredRefDoctors.length / doctorsPerPage);
                            const maxVisible = 5;
                            let startPage = Math.max(1, refDoctorCurrentPage - 2);
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                            
                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <li key={i} className={`page-item ${refDoctorCurrentPage === i ? 'active' : ''}`}>
                                  <button className="page-link" onClick={() => setRefDoctorCurrentPage(i)}>{i}</button>
                                </li>
                              );
                            }
                            return pages;
                          })()}
                          <li className={`page-item ${refDoctorCurrentPage === Math.ceil(filteredRefDoctors.length / doctorsPerPage) ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setRefDoctorCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRefDoctors.length / doctorsPerPage)))}
                              disabled={refDoctorCurrentPage === Math.ceil(filteredRefDoctors.length / doctorsPerPage)}
                            >
                              Next →
                            </button>
                          </li>
                        </ul>
                        <div className="text-center mt-2 text-muted small">
                          Showing {Math.min((refDoctorCurrentPage - 1) * doctorsPerPage + 1, filteredRefDoctors.length)} to {Math.min(refDoctorCurrentPage * doctorsPerPage, filteredRefDoctors.length)} of {filteredRefDoctors.length} doctors
                        </div>
                      </nav>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* Ref wise Selection - Only show for Ref wise */}
            {viewOption === 'Ref wise' && (
              <div className="mb-4 border rounded-3 p-3 shadow-sm">
                <h6 className="fw-bold mb-3">Referral Selection</h6>
                <div className="mb-3">
                  <div className="form-check form-check-inline me-4">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="refWiseSelect" 
                      id="allReferals" 
                      checked={refWiseSelect === 'allReferals'}
                      onChange={() => setRefWiseSelect('allReferals')}
                    />
                    <label className="form-check-label" htmlFor="allReferals">All Referrals</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="refWiseSelect" 
                      id="selectiveReferals" 
                      checked={refWiseSelect === 'selectiveReferals'}
                      onChange={() => setRefWiseSelect('selectiveReferals')}
                    />
                    <label className="form-check-label" htmlFor="selectiveReferals">Selective Referrals</label>
                  </div>
                </div>

                {refWiseSelect === 'selectiveReferals' && (
                  <div>
                    <div className="mb-3">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search referral by name..."
                        value={refWiseSearchTerm}
                        onChange={(e) => setRefWiseSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="row mt-2 g-2 overflow-auto border p-2 rounded" style={{ maxHeight: '180px' }}>
                      {filteredRefWise.slice((refWiseCurrentPage - 1) * doctorsPerPage, refWiseCurrentPage * doctorsPerPage).map((referal, i) => (
                        <div className="col-md-6 col-lg-4" key={i}>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`refWise-${i}`}
                              checked={selectedRefWise.includes(referal.Referal)}
                              onChange={() => handleRefWiseCheckboxChange(referal.Referal)}
                            />
                            <label className="form-check-label" htmlFor={`refWise-${i}`}>
                              {referal.Referal}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredRefWise.length > doctorsPerPage && (
                      <nav className="mt-3">
                        <ul className="pagination pagination-sm justify-content-center">
                          <li className={`page-item ${refWiseCurrentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setRefWiseCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={refWiseCurrentPage === 1}
                            >
                              ← Prev
                            </button>
                          </li>
                          {(() => {
                            const totalPages = Math.ceil(filteredRefWise.length / doctorsPerPage);
                            const maxVisible = 5;
                            let startPage = Math.max(1, refWiseCurrentPage - 2);
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                            
                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <li key={i} className={`page-item ${refWiseCurrentPage === i ? 'active' : ''}`}>
                                  <button className="page-link" onClick={() => setRefWiseCurrentPage(i)}>{i}</button>
                                </li>
                              );
                            }
                            return pages;
                          })()}
                          <li className={`page-item ${refWiseCurrentPage === Math.ceil(filteredRefWise.length / doctorsPerPage) ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setRefWiseCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRefWise.length / doctorsPerPage)))}
                              disabled={refWiseCurrentPage === Math.ceil(filteredRefWise.length / doctorsPerPage)}
                            >
                              Next →
                            </button>
                          </li>
                        </ul>
                        <div className="text-center mt-2 text-muted small">
                          Showing {Math.min((refWiseCurrentPage - 1) * doctorsPerPage + 1, filteredRefWise.length)} to {Math.min(refWiseCurrentPage * doctorsPerPage, filteredRefWise.length)} of {filteredRefWise.length} referrals
                        </div>
                      </nav>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Advance Booking Selection - Only show for Advance Booking */}
            {viewOption === 'Advance Booking' && (
              <div className="mb-4 border rounded-3 p-3 shadow-sm">
                <h6 className="fw-bold mb-3">Advance Booking Referral Selection</h6>
                <div className="mb-3">
                  <div className="form-check form-check-inline me-4">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="advanceBookingSelect" 
                      id="allAdvanceBookings" 
                      checked={advanceBookingSelect === 'allReferals'}
                      onChange={() => setAdvanceBookingSelect('allReferals')}
                    />
                    <label className="form-check-label" htmlFor="allAdvanceBookings">All Referrals</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="advanceBookingSelect" 
                      id="selectiveAdvanceBookings" 
                      checked={advanceBookingSelect === 'selectiveReferals'}
                      onChange={() => setAdvanceBookingSelect('selectiveReferals')}
                    />
                    <label className="form-check-label" htmlFor="selectiveAdvanceBookings">Selective Referrals</label>
                  </div>
                </div>

                {advanceBookingSelect === 'selectiveReferals' && (
                  <div>
                    <div className="mb-3">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search referral by name..."
                        value={advanceBookingSearchTerm}
                        onChange={(e) => setAdvanceBookingSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="row mt-2 g-2 overflow-auto border p-2 rounded" style={{ maxHeight: '180px' }}>
                      {filteredAdvanceBooking.slice((advanceBookingCurrentPage - 1) * doctorsPerPage, advanceBookingCurrentPage * doctorsPerPage).map((referal, i) => (
                        <div className="col-md-6 col-lg-4" key={i}>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`advanceBooking-${i}`}
                              checked={selectedAdvanceBooking.includes(referal.Referal)}
                              onChange={() => handleAdvanceBookingCheckboxChange(referal.Referal)}
                            />
                            <label className="form-check-label" htmlFor={`advanceBooking-${i}`}>
                              {referal.Referal}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredAdvanceBooking.length > doctorsPerPage && (
                      <nav className="mt-3">
                        <ul className="pagination pagination-sm justify-content-center">
                          <li className={`page-item ${advanceBookingCurrentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setAdvanceBookingCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={advanceBookingCurrentPage === 1}
                            >
                              ← Prev
                            </button>
                          </li>
                          {(() => {
                            const totalPages = Math.ceil(filteredAdvanceBooking.length / doctorsPerPage);
                            const maxVisible = 5;
                            let startPage = Math.max(1, advanceBookingCurrentPage - 2);
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                            
                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <li key={i} className={`page-item ${advanceBookingCurrentPage === i ? 'active' : ''}`}>
                                  <button className="page-link" onClick={() => setAdvanceBookingCurrentPage(i)}>{i}</button>
                                </li>
                              );
                            }
                            return pages;
                          })()}
                          <li className={`page-item ${advanceBookingCurrentPage === Math.ceil(filteredAdvanceBooking.length / doctorsPerPage) ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setAdvanceBookingCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAdvanceBooking.length / doctorsPerPage)))}
                              disabled={advanceBookingCurrentPage === Math.ceil(filteredAdvanceBooking.length / doctorsPerPage)}
                            >
                              Next →
                            </button>
                          </li>
                        </ul>
                        <div className="text-center mt-2 text-muted small">
                          Showing {Math.min((advanceBookingCurrentPage - 1) * doctorsPerPage + 1, filteredAdvanceBooking.length)} to {Math.min(advanceBookingCurrentPage * doctorsPerPage, filteredAdvanceBooking.length)} of {filteredAdvanceBooking.length} referrals
                        </div>
                      </nav>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Report Type */}
            <div className="mb-4 border rounded-3 p-3 shadow-sm">
              <h6 className="fw-bold mb-3">Report Type</h6>
              <div className="row g-3">
                {['All', 'Only Doctor Ch.', 'Only Service Ch.', "Doctor's Ch. (Summary)", 'Visit ID Wise', 'Visit Type Wise', 'Visit Type User Wise', 'Registration No Wise', 'Visit Type grp Wise', 'COMPANY WISE'].map((type, index) => (
                  <div className="col-md-6 col-lg-4" key={index}>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="reportType" 
                        id={`reportType-${index}`} 
                        checked={reportType === type}
                        onChange={() => setReportType(type)}
                      />
                      <label className="form-check-label" htmlFor={`reportType-${index}`}>
                        {type}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Button */}
            <div className="text-center mt-5">
              <button
                className="btn btn-primary btn-lg px-5 py-2 rounded-pill shadow-sm"
                onClick={handlePrintReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-print me-2"></i> Print Report
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

export default DrRectVisitDetail;