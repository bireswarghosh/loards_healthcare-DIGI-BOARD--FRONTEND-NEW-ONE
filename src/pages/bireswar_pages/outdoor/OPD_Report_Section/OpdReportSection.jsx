import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axiosInstance from '../../../../axiosInstance';
import { generateOpdReportPDF } from './opdReportPDF';

const OpdReportSection = () => {
  const [activeTab, setActiveTab] = useState('visit');
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [visitTypeList, setVisitTypeList] = useState([]);

  // Filters
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterVisitType, setFilterVisitType] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [searchText, setSearchText] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Fetch master data on mount
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [docs, users, vTypes] = await Promise.all([
          axiosInstance.get('/doctors'),
          axiosInstance.get('/users'),
          axiosInstance.get('/visit-types')
        ]);
        setDoctorList(docs.data.data || []);
        setUserList(users.data.data || []);
        setVisitTypeList(vTypes.data.data || []);
      } catch (e) { console.error(e); }
    };
    fetchMasters();
  }, []);

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    setPage(1);
    try {
      let res;
      if (activeTab === 'visit') {
        res = await axiosInstance.get(`/patient-visits-enhanced/date-range?fromDate=${fromDate}&toDate=${toDate}`);
      } else if (activeTab === 'otherCharges') {
        res = await axiosInstance.get(`/opd-other-charges/search/date-range?startDate=${fromDate}&endDate=${toDate}`);
      } else if (activeTab === 'tableData') {
        res = await axiosInstance.get(`/patient-with-bills?page=1&limit=5000&date=${fromDate}`);
      }
      setData(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, fromDate, toDate]);

  // Filtered + searched data (memoized for performance)
  const filteredData = useMemo(() => {
    let d = [...data];
    if (activeTab === 'visit') {
      if (filterDoctor) d = d.filter(r => r.DoctorName === filterDoctor);
      if (filterUser) d = d.filter(r => r.UserName === filterUser);
      if (filterVisitType) d = d.filter(r => r.VisitTypeName === filterVisitType);
      if (filterPayment) d = d.filter(r => String(r.PaymentType) === filterPayment);
      if (searchText) {
        const s = searchText.toLowerCase();
        d = d.filter(r => r.PatientName?.toLowerCase().includes(s) || r.RegistrationId?.toLowerCase().includes(s) || r.PhoneNo?.includes(s));
      }
    } else if (activeTab === 'otherCharges') {
      if (filterDoctor) d = d.filter(r => String(r.DoctorId) === filterDoctor);
      if (searchText) {
        const s = searchText.toLowerCase();
        d = d.filter(r => r.PatientName?.toLowerCase().includes(s) || r.RegistrationId?.toLowerCase().includes(s));
      }
    } else if (activeTab === 'tableData') {
      if (searchText) {
        const s = searchText.toLowerCase();
        d = d.filter(r => r.PatientName?.toLowerCase().includes(s) || r.RegistrationId?.toLowerCase().includes(s) || r.PhoneNo?.includes(s));
      }
    }
    return d;
  }, [data, filterDoctor, filterUser, filterVisitType, filterPayment, searchText, activeTab]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Summary calculations
  const summary = useMemo(() => {
    if (activeTab === 'visit') {
      return {
        totalRecords: filteredData.length,
        totalAmount: filteredData.reduce((s, r) => s + (r.TotAmount || 0), 0),
        totalRegCh: filteredData.reduce((s, r) => s + (r.RegCh || 0), 0),
        totalServiceCh: filteredData.reduce((s, r) => s + (r.ServiceCh || 0), 0),
        totalDiscount: filteredData.reduce((s, r) => s + (r.Discount || 0), 0),
        totalRecAmt: filteredData.reduce((s, r) => s + (r.RecAmt || 0), 0),
        totalDue: filteredData.reduce((s, r) => s + (r.DueAmt || 0), 0),
      };
    } else if (activeTab === 'otherCharges') {
      return {
        totalRecords: filteredData.length,
        totalAmount: filteredData.reduce((s, r) => s + (r.Amount || 0), 0),
        totalGTotal: filteredData.reduce((s, r) => s + (r.GTotal || 0), 0),
        totalPaid: filteredData.reduce((s, r) => s + (r.paidamt || 0), 0),
        totalDue: filteredData.reduce((s, r) => s + (r.dueamt || 0), 0),
        totalDisc: filteredData.reduce((s, r) => s + (r.DiscAmt || 0), 0),
      };
    }
    return { totalRecords: filteredData.length };
  }, [filteredData, activeTab]);

  const handlePDF = () => {
    if (filteredData.length === 0) { alert('No data to generate PDF'); return; }
    generateOpdReportPDF(filteredData, activeTab, fromDate, toDate, summary);
  };

  const tabs = [
    { id: 'visit', label: '🏥 Visit Entry', icon: 'fa-user-doctor' },
    { id: 'otherCharges', label: '💰 OPD Other Charges', icon: 'fa-file-invoice-dollar' },
    { id: 'tableData', label: '📋 Patient Table', icon: 'fa-table' },
  ];

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px', padding: '24px 32px', marginBottom: '20px',
        boxShadow: '0 10px 40px rgba(102,126,234,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: '0.5px' }}>
              📊 OPD Report Center
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: '13px' }}>
              All OPD reports in one place • Fast & Efficient
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px' }} />
            <span style={{ color: '#fff', fontWeight: 600 }}>→</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px' }} />
            <button onClick={fetchData} disabled={loading}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#fff', color: '#764ba2', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              {loading ? '⏳ Loading...' : '🔍 Fetch'}
            </button>
            <button onClick={handlePDF} disabled={filteredData.length === 0}
              style={{ padding: '8px 20px', borderRadius: '8px', border: '2px solid #fff', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              📄 PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setData([]); setSearchText(''); setFilterDoctor(''); setFilterUser(''); setFilterVisitType(''); setFilterPayment(''); }}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === t.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0',
              color: activeTab === t.id ? '#fff' : '#555', boxShadow: activeTab === t.id ? '0 4px 15px rgba(102,126,234,0.4)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search name / reg / phone..." value={searchText} onChange={e => setSearchText(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', minWidth: '200px', flex: 1 }} />
        {activeTab === 'visit' && (
          <>
            <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px' }}>
              <option value="">All Doctors</option>
              {doctorList.map(d => <option key={d.DoctorId} value={d.Doctor}>{d.Doctor}</option>)}
            </select>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px' }}>
              <option value="">All Users</option>
              {userList.map(u => <option key={u.UserId} value={u.UserName}>{u.UserName}</option>)}
            </select>
            <select value={filterVisitType} onChange={e => setFilterVisitType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px' }}>
              <option value="">All Visit Types</option>
              {visitTypeList.map(v => <option key={v.VisitTypeId} value={v.VisitType}>{v.VisitType}</option>)}
            </select>
            <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px' }}>
              <option value="">All Payment</option>
              <option value="0">Cash</option>
              <option value="1">Card/Bank</option>
              <option value="2">UPI</option>
            </select>
          </>
        )}
        <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>
          {filteredData.length} records
        </span>
      </div>

      {/* Summary Cards */}
      {data.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {activeTab === 'visit' && (
            <>
              <SummaryCard label="Total Records" value={summary.totalRecords} color="#667eea" />
              <SummaryCard label="Total Amount" value={`₹${summary.totalAmount?.toFixed(0)}`} color="#4caf50" />
              <SummaryCard label="Reg Charge" value={`₹${summary.totalRegCh?.toFixed(0)}`} color="#ff9800" />
              <SummaryCard label="Service Ch" value={`₹${summary.totalServiceCh?.toFixed(0)}`} color="#9c27b0" />
              <SummaryCard label="Discount" value={`₹${summary.totalDiscount?.toFixed(0)}`} color="#f44336" />
              <SummaryCard label="Received" value={`₹${summary.totalRecAmt?.toFixed(0)}`} color="#2196f3" />
              <SummaryCard label="Due" value={`₹${summary.totalDue?.toFixed(0)}`} color="#e91e63" />
            </>
          )}
          {activeTab === 'otherCharges' && (
            <>
              <SummaryCard label="Total Bills" value={summary.totalRecords} color="#667eea" />
              <SummaryCard label="Amount" value={`₹${summary.totalAmount?.toFixed(0)}`} color="#4caf50" />
              <SummaryCard label="Grand Total" value={`₹${summary.totalGTotal?.toFixed(0)}`} color="#ff9800" />
              <SummaryCard label="Paid" value={`₹${summary.totalPaid?.toFixed(0)}`} color="#2196f3" />
              <SummaryCard label="Due" value={`₹${summary.totalDue?.toFixed(0)}`} color="#e91e63" />
              <SummaryCard label="Discount" value={`₹${summary.totalDisc?.toFixed(0)}`} color="#f44336" />
            </>
          )}
          {activeTab === 'tableData' && (
            <SummaryCard label="Total Patients" value={summary.totalRecords} color="#667eea" />
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '60vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                {getHeaders(activeTab).map((h, i) => (
                  <th key={i} style={{ padding: '10px 12px', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={20} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>⏳ Loading data...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={20} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>📭 No data found. Click "Fetch" to load.</td></tr>
              ) : (
                paginatedData.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fafbff' : '#fff' }}>
                    {getRowCells(r, activeTab, (page - 1) * pageSize + idx + 1)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', borderTop: '1px solid #f0f0f0' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>← Prev</button>
            <span style={{ fontSize: '12px', color: '#666' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '16px', fontWeight: 800, color }}>{value}</div>
  </div>
);

// Table headers based on tab
const getHeaders = (tab) => {
  if (tab === 'visit') return ['#', 'Visit ID', 'Reg ID', 'Patient', 'Phone', 'Doctor', 'Visit Type', 'Date', 'Rate', 'RegCh', 'ServiceCh', 'Discount', 'Total', 'Received', 'Due', 'User'];
  if (tab === 'otherCharges') return ['#', 'Bill ID', 'Bill No', 'Reg ID', 'Patient', 'Phone', 'Date', 'Amount', 'Discount', 'G.Total', 'Paid', 'Due', 'Doctor'];
  if (tab === 'tableData') return ['#', 'Reg ID', 'Patient', 'Phone', 'Age', 'Sex', 'Address', 'Reg Date', 'Bills'];
  return [];
};

// Table row cells based on tab
const getRowCells = (r, tab, idx) => {
  const td = (v) => <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{v ?? '-'}</td>;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

  if (tab === 'visit') {
    return [
      td(idx), td(r.PVisitId), td(r.RegistrationId), td(r.PatientName), td(r.PhoneNo),
      td(r.DoctorName), td(r.VisitTypeName), td(fmtDate(r.PVisitDate)),
      td(r.Rate?.toFixed(0)), td(r.RegCh?.toFixed(0)), td(r.ServiceCh?.toFixed(0)),
      td(r.Discount?.toFixed(0)), td(r.TotAmount?.toFixed(0)), td(r.RecAmt?.toFixed(0)),
      td(r.DueAmt?.toFixed(0)), td(r.UserName),
    ];
  }
  if (tab === 'otherCharges') {
    return [
      td(idx), td(r.OutBillId), td(r.OutBillNo), td(r.RegistrationId), td(r.PatientName),
      td(r.PhoneNo), td(fmtDate(r.OutBillDate)), td(r.Amount?.toFixed(0)),
      td(r.DiscAmt?.toFixed(0)), td(r.GTotal?.toFixed(0)), td(r.paidamt?.toFixed(0)),
      td(r.dueamt?.toFixed(0)), td(r.DoctorId),
    ];
  }
  if (tab === 'tableData') {
    return [
      td(idx), td(r.RegistrationId), td(r.PatientName), td(r.PhoneNo),
      td(r.Age), td(r.Sex === 'M' ? 'Male' : r.Sex === 'F' ? 'Female' : r.Sex),
      td(r.Add1), td(fmtDate(r.RegDate)), td(r.billCount),
    ];
  }
  return [];
};

export default OpdReportSection;
