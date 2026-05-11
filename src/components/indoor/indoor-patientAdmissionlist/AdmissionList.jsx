import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';

const AdmissionList = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  useEffect(() => { 
    // Only fetch on page change, not on search query change
    if (!searchQuery && !dateFrom && !dateTo) {
      fetchAdmissions(); 
    }
  }, [pagination.page]);

  // Remove auto-fetch on date changes - only fetch when search button is clicked

  const fetchAdmissionsUsingDate = async () => {
    try {
      setLoading(true);
      let url = `/admission/filter-details?startDate=${dateFrom}&endDate=${dateTo}`;
      
      // Add search parameters if search is active
      if (searchQuery && searchType) {
        url += `&search=${encodeURIComponent(searchQuery)}&searchType=${searchType}`;
      }
      
      console.log('Date filter URL:', url);
      const response = await axiosInstance.get(url);
      if (response.data?.success) {
        setAdmissions(response.data.data || []);
        setPagination(prev => ({ ...prev, pages: 1, total: response.data.data?.length || 0 }));
      } else { setAdmissions([]); }
    } catch (error) { console.error('Error:', error); setAdmissions([]); }
    finally { setLoading(false); }
  };

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      let url;
      
      if (searchQuery) {
        // If there's a search query, use search endpoint with type parameter
        const searchParam = searchType === 'all' ? 'all' : searchType;
        url = `/admission/with-details?search=${encodeURIComponent(searchQuery)}&searchType=${searchParam}&page=${pagination.page}&limit=${pagination.limit}`;
        console.log('Search URL:', url);
      } else {
        // No search query, get all records
        url = `/admission/with-details?page=${pagination.page}&limit=${pagination.limit}`;
        console.log('All records URL:', url);
      }
      
      const response = await axiosInstance.get(url);
      console.log('API Response:', response.data);
      if (response.data?.success) {
        setAdmissions(response.data.data || []);
        if (response.data.pagination) setPagination(prev => ({ ...prev, ...response.data.pagination }));
      } else { setAdmissions([]); }
    } catch (error) { 
      console.error('Error:', error); 
      setAdmissions([]); 
    }
    finally { setLoading(false); }
  };

  const handleSearchInput = (e) => { setTempSearchQuery(e.target.value); };
  const handleSearchClick = () => { 
    console.log('Search clicked:', { searchType, tempSearchQuery, dateFrom, dateTo });
    setSearchQuery(tempSearchQuery); 
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Trigger search based on what filters are set
    setTimeout(() => {
      if (dateFrom && dateTo) {
        fetchAdmissionsUsingDate();
      } else {
        fetchAdmissions();
      }
    }, 100);
  };
  const handleSearchKeyPress = (e) => { if (e.key === 'Enter') handleSearchClick(); };
  
  const getPlaceholderText = () => {
    switch(searchType) {
      case 'name': return 'Search by patient name...';
      case 'phone': return 'Search by phone number...';
      case 'reg': return 'Search by registration number...';
      case 'bed': return 'Search by bed name...';
      case 'doctor': return 'Search by doctor name...';
      case 'marketing': return 'Search by marketing executive...';
      case 'dept': return 'Search by department...';
      default: return 'Search...';
    }
  };
  const handlePageChange = (n) => { if (n > 0 && n <= pagination.pages) setPagination(prev => ({ ...prev, page: n })); };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission?')) return;
    try {
      const res = await axiosInstance.delete(`/admission/${id}`);
      if (res.data.success) { alert('Deleted!'); fetchAdmissions(); }
    } catch (e) { alert('Error deleting'); }
  };

  const handlePrint = () => {
    const dateRange = dateFrom && dateTo ? `${formatDate(dateFrom)} to ${formatDate(dateTo)}` : 'All Records';
    const win = window.open('', '', 'width=1600,height=1000');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Registration Report - Lords Health Care</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; font-size: 11px; color: #333; background: #fff; }
          .header { text-align: center; border-bottom: 3px solid #1a73e8; padding: 20px 0; margin-bottom: 15px; }
          .header h1 { color: #1a73e8; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .header h2 { color: #666; font-size: 16px; margin-bottom: 3px; }
          .header p { color: #888; font-size: 12px; }
          .report-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: #f8f9ff; border-radius: 5px; }
          .report-info .left { font-weight: bold; color: #1a73e8; }
          .report-info .right { font-size: 10px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: linear-gradient(135deg, #1a73e8, #0d47a1); color: #fff; padding: 10px 6px; text-align: left; font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #0d47a1; }
          td { padding: 8px 6px; border: 1px solid #ddd; font-size: 10px; vertical-align: top; }
          tr:nth-child(even) { background: #f9f9ff; }
          tr:hover { background: #e3f2fd; }
          .reg-no { font-weight: bold; color: #1a73e8; }
          .patient-name { font-weight: bold; color: #1a237e; }
          .status-active { background: #e8f5e9; color: #2e7d32; padding: 2px 6px; border-radius: 8px; font-weight: bold; }
          .status-closed { background: #fce4ec; color: #c62828; padding: 2px 6px; border-radius: 8px; font-weight: bold; }
          .insurance-yes { background: #fff3e0; color: #e65100; padding: 2px 6px; border-radius: 6px; font-weight: bold; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          .summary { background: #f0f4ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
          .summary-item { display: inline-block; margin-right: 20px; font-weight: bold; }
          @page { size: landscape; margin: 15mm; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 LORDS HEALTH CARE</h1>
          <h2>Patient Registration Report</h2>
          <p>A Unit of MJJ Enterprises Pvt. Ltd.</p>
        </div>
        
        <div class="report-info">
          <div class="left">📊 Report Period: ${dateRange}</div>
          <div class="right">
            Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${admissions.length}
          </div>
        </div>

        <div class="summary">
          <div class="summary-item">📋 Total Patients: ${admissions.length}</div>
          <div class="summary-item">👨 Male: ${admissions.filter(a => a.Sex === 'M').length}</div>
          <div class="summary-item">👩 Female: ${admissions.filter(a => a.Sex === 'F').length}</div>
          <div class="summary-item">🏥 Active: ${admissions.filter(a => a.Status === 'O').length}</div>
          <div class="summary-item">💳 Insured: ${admissions.filter(a => a.CashLess === 'Y').length}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:8%">Reg No</th>
              <th style="width:7%">Date</th>
              <th style="width:12%">Patient Name</th>
              <th style="width:6%">Age/Sex</th>
              <th style="width:8%">Phone</th>
              <th style="width:12%">Address</th>
              <th style="width:10%">Department</th>
              <th style="width:6%">Bed</th>
              <th style="width:10%">Doctor</th>
              <th style="width:8%">Marketing Exec</th>
              <th style="width:7%">Insurance</th>
              <th style="width:6%">Status</th>
            </tr>
          </thead>
          <tbody>
            ${admissions.map(a => `
              <tr>
                <td><span class="reg-no">${a.AdmitionNo || '-'}</span></td>
                <td>${formatDate(a.AdmitionDate)}<br><small style="color:#888">${a.AdmitionTime || ''}</small></td>
                <td><span class="patient-name">${a.PatientName || '-'}</span></td>
                <td>${a.Age || ''}${a.AgeType === 'Y' ? 'Y' : a.AgeType === 'M' ? 'M' : 'D'}/${a.Sex === 'M' ? '♂' : a.Sex === 'F' ? '♀' : a.Sex || ''}</td>
                <td>${a.PhoneNo || '-'}</td>
                <td>${[a.Add1, a.Add2, a.Add3].filter(Boolean).join(', ') || '-'}</td>
                <td>${a.DepartmentName || '-'}</td>
                <td>${a.BedName || '-'}</td>
                <td>${a.DoctorName || '-'}</td>
                <td>${a.MarketingExecutive || '-'}</td>
                <td>${a.CashLess === 'Y' ? `<span class="insurance-yes">${a.CashLessName || 'Yes'}</span>` : '—'}</td>
                <td><span class="${a.Status === 'O' ? 'status-active' : 'status-closed'}">${a.Status === 'O' ? 'Active' : 'Closed'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Lords Health Care</strong> | Patient Registration Report | Page 1 of 1</p>
          <p>This is a computer-generated report. For any queries, contact the administration.</p>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 800);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="container-fluid py-3 px-lg-4">
      <style>{`
        .adm-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
        .adm-header { background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
        .adm-header h4 { color: #fff; margin: 0; font-weight: 700; font-size: 1.2rem; letter-spacing: 0.5px; }
        .adm-header .btn-group-custom .btn { border-radius: 8px; font-weight: 600; font-size: 13px; padding: 8px 16px; border: none; margin-left: 8px; transition: all 0.2s; }
        .adm-header .btn-new { background: #fff; color: #1a73e8; }
        .adm-header .btn-new:hover { background: #e3f2fd; transform: translateY(-1px); }
        .adm-header .btn-print { background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.3); }
        .adm-header .btn-print:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
        .adm-header .btn-refresh { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
        .adm-header .btn-refresh:hover { background: rgba(255,255,255,0.25); }
        .filter-section { padding: 16px 24px; background: #f8faff; border-bottom: 1px solid #e8edf5; }
        .search-box { position: relative; }
        .search-box input { border-radius: 10px; border: 2px solid #e0e7ff; padding: 10px 16px; font-size: 13px; transition: all 0.2s; width: 200px; }
        .search-box input:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.1); outline: none; }
        .btn-search { background: linear-gradient(135deg, #1a73e8, #0d47a1); color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .btn-search:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,115,232,0.3); }
        .radio-group { display: flex; gap: 12px; align-items: center; }
        .radio-group label { font-size: 12px; font-weight: 500; color: #555; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .radio-group input[type="radio"] { accent-color: #1a73e8; }
        .date-filter { display: flex; align-items: center; gap: 8px; }
        .date-filter input { border-radius: 8px; border: 2px solid #e0e7ff; padding: 8px 12px; font-size: 12px; }
        .date-filter input:focus { border-color: #1a73e8; outline: none; }
        .date-filter span { font-size: 12px; font-weight: 600; color: #666; }
        .btn-clear { background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-clear:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(238,90,36,0.3); }
        .table-wrapper { padding: 0; max-height: 560px; overflow: auto; }
        .table-wrapper::-webkit-scrollbar { width: 6px; height: 6px; }
        .table-wrapper::-webkit-scrollbar-thumb { background: #c5cae9; border-radius: 3px; }
        .adm-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; }
        .adm-table thead { position: sticky; top: 0; z-index: 10; }
        .adm-table th { background: linear-gradient(180deg, #f1f5ff 0%, #e8edf8 100%); color: #1a237e; font-weight: 700; padding: 12px 8px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #c5cae9; white-space: nowrap; }
        .adm-table td { padding: 10px 8px; border-bottom: 1px solid #f0f2f8; vertical-align: middle; transition: all 0.15s; }
        .adm-table tbody tr { transition: all 0.15s; }
        .adm-table tbody tr:hover { background: linear-gradient(90deg, #e3f2fd, #f3e5f5); transform: scale(1.001); }
        .adm-table tbody tr:nth-child(even) { background: #fafbff; }
        .adm-table tbody tr:nth-child(even):hover { background: linear-gradient(90deg, #e3f2fd, #f3e5f5); }
        .patient-name { font-weight: 700; color: #1a237e; font-size: 12px; }
        .reg-no { font-weight: 600; color: #1a73e8; font-size: 11px; background: #e8f0fe; padding: 3px 8px; border-radius: 6px; display: inline-block; }
        .badge-status { padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
        .badge-open { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); color: #1b5e20; }
        .badge-closed { background: linear-gradient(135deg, #fce4ec, #f8bbd0); color: #880e4f; }
        .badge-cashless { background: linear-gradient(135deg, #fff3e0, #ffe0b2); color: #e65100; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
        .badge-no { color: #9e9e9e; font-size: 10px; }
        .btn-action { border: none; border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-view { background: linear-gradient(135deg, #00bcd4, #0097a7); color: #fff; }
        .btn-view:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,188,212,0.4); }
        .btn-edit { background: linear-gradient(135deg, #ff9800, #f57c00); color: #fff; }
        .btn-edit:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(255,152,0,0.4); }
        .btn-del { background: linear-gradient(135deg, #f44336, #d32f2f); color: #fff; }
        .btn-del:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(244,67,54,0.4); }
        .pagination-bar { padding: 16px 24px; background: #f8faff; border-top: 1px solid #e8edf5; display: flex; justify-content: space-between; align-items: center; }
        .pagination-bar .page-info { font-size: 13px; color: #555; font-weight: 500; }
        .pagination-bar .page-info strong { color: #1a73e8; }
        .pagination-bar .btn-page { background: #fff; border: 2px solid #e0e7ff; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600; color: #1a73e8; cursor: pointer; transition: all 0.2s; }
        .pagination-bar .btn-page:hover:not(:disabled) { background: #1a73e8; color: #fff; border-color: #1a73e8; }
        .pagination-bar .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
        .loading-row td { text-align: center; padding: 40px; }
        .loading-spinner { display: inline-block; width: 30px; height: 30px; border: 3px solid #e0e7ff; border-top-color: #1a73e8; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cell-address { max-width: 140px; font-size: 11px; color: #555; line-height: 1.3; }
        .cell-doctor { font-size: 11px; color: #333; font-weight: 500; max-width: 120px; }
        .cell-marketing { font-size: 11px; color: #6a1b9a; font-weight: 600; background: #f3e5f5; padding: 3px 8px; border-radius: 6px; display: inline-block; }
        .cell-bed { background: #ede7f6; color: #4527a0; padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; display: inline-block; }
        .cell-dept { font-size: 11px; color: #00695c; font-weight: 500; }
        .cell-phone { font-family: 'Courier New', monospace; font-size: 12px; color: #333; }
      `}</style>

      <div className="adm-card">
        {/* HEADER */}
        <div className="adm-header">
          <h4>🏥 Patient Registration List</h4>
          <div className="btn-group-custom">
            <button className="btn btn-new" onClick={() => navigate('/PatientRegistrationDetail')}>+ New Patient</button>
            <button className="btn btn-print" onClick={handlePrint}>📄 Print Report</button>
            <button className="btn btn-refresh" onClick={fetchAdmissions}>⟳ Refresh</button>
          </div>
        </div>

        {/* FILTER */}
        <div className="filter-section">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="radio-group">
                <label><input type="radio" name="stype" checked={searchType === 'name'} onChange={() => setSearchType('name')} /> Name</label>
                <label><input type="radio" name="stype" checked={searchType === 'phone'} onChange={() => setSearchType('phone')} /> Phone</label>
                <label><input type="radio" name="stype" checked={searchType === 'reg'} onChange={() => setSearchType('reg')} /> Reg No</label>
                <label><input type="radio" name="stype" checked={searchType === 'bed'} onChange={() => setSearchType('bed')} /> Bed</label>
                <label><input type="radio" name="stype" checked={searchType === 'doctor'} onChange={() => setSearchType('doctor')} /> Doctor</label>
                <label><input type="radio" name="stype" checked={searchType === 'marketing'} onChange={() => setSearchType('marketing')} /> Marketing Exec</label>
                <label><input type="radio" name="stype" checked={searchType === 'dept'} onChange={() => setSearchType('dept')} /> Department</label>
              </div>
              <div className="search-box d-flex align-items-center gap-2">
                <input 
                  type="text" 
                  placeholder={getPlaceholderText()} 
                  value={tempSearchQuery} 
                  onChange={handleSearchInput}
                  onKeyPress={handleSearchKeyPress}
                  style={{width: '200px'}}
                />
                <button className="btn-search" onClick={handleSearchClick}>🔍 Search</button>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="date-filter">
                <span>From</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <span>To</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <button className="btn-clear" onClick={() => { 
                setSearchQuery(''); 
                setTempSearchQuery(''); 
                setDateFrom(''); 
                setDateTo(''); 
                // Auto-fetch all records when cleared
                setTimeout(() => fetchAdmissions(), 100);
              }}>✕ Clear</button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-wrapper" ref={printRef}>
          <table className="adm-table">
            <thead>
              <tr>
                <th className="no-print">Actions</th>
                <th>Reg No</th>
                <th>Date</th>
                <th>Patient Name</th>
                <th>Age/Sex</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Department</th>
                <th>Bed</th>
                <th>Doctor</th>
                <th>Marketing Exec</th>
                <th>Insurance</th>
                <th>Status</th>
                <th>Bed Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row"><td colSpan="14"><div className="loading-spinner"></div><p style={{marginTop:10,color:'#666'}}>Loading patients...</p></td></tr>
              ) : admissions.length === 0 ? (
                <tr><td colSpan="14" style={{textAlign:'center',padding:'40px',color:'#999'}}>No records found</td></tr>
              ) : (
                admissions.map((a, i) => (
                  <tr key={a.AdmitionId || i}>
                    <td className="no-print" style={{whiteSpace:'nowrap'}}>
                      <button className="btn-action btn-view me-1" onClick={() => navigate(`/PatientRegistrationDetail/${encodeURIComponent(a.AdmitionId)}?mode=view`)}>View</button>
                      <button className="btn-action btn-edit me-1" onClick={() => navigate(`/PatientRegistrationDetail/${encodeURIComponent(a.AdmitionId)}?mode=edit`)}>Edit</button>
                      <button className="btn-action btn-del me-1" onClick={() => handleDelete(a.AdmitionId)}>Del</button>
                      <button className="btn-action me-1" style={{background:'linear-gradient(135deg,#4caf50,#388e3c)',color:'#fff'}} onClick={() => navigate(`/sampleReceipts`)}>MR</button>
                      <button className="btn-action" style={{background:'linear-gradient(135deg,#9c27b0,#7b1fa2)',color:'#fff'}} onClick={() => navigate(`/initialFormData?admId=${a.AdmitionId}`)}>Receipt</button>
                    </td>
                    <td><span className="reg-no">{a.AdmitionNo}</span></td>
                    <td style={{whiteSpace:'nowrap'}}>{formatDate(a.AdmitionDate)}<br/><small style={{color:'#888'}}>{a.AdmitionTime || ''}</small></td>
                    <td><span className="patient-name">{a.PatientName || '-'}</span></td>
                    <td style={{whiteSpace:'nowrap'}}>{a.Age || ''}{a.AgeType === 'Y' ? 'Y' : a.AgeType === 'M' ? 'M' : 'D'} / {a.Sex === 'M' ? '♂' : a.Sex === 'F' ? '♀' : a.Sex}</td>
                    <td><span className="cell-phone">{a.PhoneNo || '-'}</span></td>
                    <td><div className="cell-address">{[a.Add1, a.Add2, a.Add3].filter(Boolean).join(', ') || '-'}</div></td>
                    <td><span className="cell-dept">{a.DepartmentName || '-'}</span></td>
                    <td>{a.BedName ? <span className="cell-bed">{a.BedName}</span> : '-'}</td>
                    <td><span className="cell-doctor">{a.DoctorName || '-'}</span></td>
                    <td>{a.MarketingExecutive ? <span className="cell-marketing">{a.MarketingExecutive}</span> : '-'}</td>
                    <td>{a.CashLess === 'Y' ? <span className="badge-cashless">{a.CashLessName || 'Yes'}</span> : <span className="badge-no">—</span>}</td>
                    <td><span className={`badge-status ${a.Status === 'O' ? 'badge-open' : 'badge-closed'}`}>{a.Status === 'O' ? '● Active' : '● Closed'}</span></td>
                    <td style={{fontWeight:600,color:'#1a237e'}}>₹{a.BedRate || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination-bar">
          <div className="page-info">
            {dateFrom && dateTo ? (
              <span>📅 Date Range Results: <strong>{admissions.length}</strong> patients from {formatDate(dateFrom)} to {formatDate(dateTo)}
              {searchQuery && <span> | 🔍 Search: "{searchQuery}" in {searchType}</span>}</span>
            ) : (
              <span>Showing page <strong>{pagination.page}</strong> of <strong>{pagination.pages || 1}</strong> &nbsp;|&nbsp; Total: <strong>{pagination.total?.toLocaleString()}</strong> patients
              {searchQuery && <span> | 🔍 Search: "{searchQuery}" in {searchType}</span>}</span>
            )}
          </div>
          <div className="d-flex gap-2">
            <button className="btn-page" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1 || loading}>← Previous</button>
            <button className="btn-page" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages || loading || !pagination.total}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionList;