import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import axiosInstance from '../../../../axiosInstance';
import { generateOpdReportPDF } from './opdReportPDF';

const OpdReportSection = () => {
  const [activeTab, setActiveTab] = useState('visit');
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // Filters
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterVisitType, setFilterVisitType] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterCharge, setFilterCharge] = useState('');
  const [searchText, setSearchText] = useState('');
  const [groupBy, setGroupBy] = useState('');

  // Lists populated from API
  const [departmentList, setDepartmentList] = useState([]);
  const [doctorsOfDeptList, setDoctorsOfDeptList] = useState([]);
  const [chargeList, setChargeList] = useState([]);

  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Fetch initial master lists on mount
  useEffect(() => {
    // Fetch departments
    axiosInstance.get('/speciality')
      .then(res => {
        if (res.data && res.data.success) {
          setDepartmentList(res.data.data || []);
        }
      })
      .catch(err => console.error("Error loading departments:", err));

    // Fetch other charges
    axiosInstance.get('/other-charges-list')
      .then(res => setChargeList(res?.data?.data || []))
      .catch(err => console.error("Error loading other charges:", err));
  }, []);

  // Fetch doctors dynamically when a department is selected
  useEffect(() => {
    if (!selectedDeptId) {
      setDoctorsOfDeptList([]);
      setSelectedDoctorId('');
      return;
    }
    axiosInstance.get(`/doctors/opd/department/${selectedDeptId}`)
      .then(res => {
        if (res.data && res.data.success) {
          setDoctorsOfDeptList(res.data.data || []);
        }
      })
      .catch(err => {
        console.error("Error loading doctors:", err);
        setDoctorsOfDeptList([]);
      })
      .finally(() => {
        setSelectedDoctorId(''); // Reset doctor filter when department changes
      });
  }, [selectedDeptId]);

  // Derived filter options for visits
  const userList = useMemo(() => {
    if (activeTab === 'visit') return [...new Set(data.map(r => r.UserName).filter(Boolean))].sort();
    return [];
  }, [data, activeTab]);

  const visitTypeList = useMemo(() => {
    if (activeTab === 'visit') return [...new Set(data.map(r => r.VisitTypeName).filter(Boolean))].sort();
    return [];
  }, [data, activeTab]);

  // Fetch grid data from API
  const fetchData = useCallback(async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    setPage(1);
    
    // Clear filters
    setSelectedDeptId('');
    setSelectedDoctorId('');
    setFilterUser('');
    setFilterVisitType('');
    setFilterPayment('');
    setSearchText('');
    setFilterCharge('');
    
    try {
      let res;
      if (activeTab === 'visit') {
        res = await axiosInstance.get(`/patient-visits-enhanced/date-range?fromDate=${fromDate}&toDate=${toDate}`);
        setData(res?.data?.data || []);
      } else if (activeTab === 'otherCharges') {
        res = await axiosInstance.get(`/opd-other-charges/search/advanced?startDate=${fromDate}&endDate=${toDate}&limit=999999999&page=1`);
        setData(res?.data?.data || []);
      } else if (activeTab === 'tableData') {
        res = await axiosInstance.get(`/patient-with-bills?page=1&limit=100&date=${fromDate}`);
        const firstPage = res?.data?.data || [];
        const totalPg = res?.data?.pagination?.totalPages || 1;
        if (totalPg > 1) {
          const promises = [];
          for (let p = 2; p <= Math.min(totalPg, 50); p++) {
            promises.push(axiosInstance.get(`/patient-with-bills?page=${p}&limit=100&date=${fromDate}`));
          }
          const results = await Promise.all(promises);
          setData([...firstPage, ...results.flatMap(r => r?.data?.data || [])]);
        } else {
          setData(firstPage);
        }
      }
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, fromDate, toDate]);

  // Filter grid data locally
  const filteredData = useMemo(() => {
    let d = [...data];
    if (activeTab === 'visit') {
      // 1. Department Wise Filter
      if (selectedDeptId) {
        // If a specific doctor is also selected, filter by that doctor
        if (selectedDoctorId) {
          const docObj = doctorsOfDeptList.find(x => String(x.DoctorId) === selectedDoctorId);
          if (docObj) {
            d = d.filter(r => r.DoctorName?.toLowerCase() === docObj.Doctor?.toLowerCase());
          }
        } else {
          // If only department is selected, filter by all doctors belonging to this department
          const deptDocNames = doctorsOfDeptList.map(x => x.Doctor?.toLowerCase());
          d = d.filter(r => deptDocNames.includes(r.DoctorName?.toLowerCase()));
        }
      }
      
      // 2. Other Visit Filters
      if (filterUser) d = d.filter(r => r.UserName === filterUser);
      if (filterVisitType) d = d.filter(r => r.VisitTypeName === filterVisitType);
      if (filterPayment) d = d.filter(r => String(r.PaymentType) === filterPayment);
      if (searchText) {
        const s = searchText.toLowerCase();
        d = d.filter(r => r.PatientName?.toLowerCase().includes(s) || r.RegistrationId?.toLowerCase().includes(s) || r.PhoneNo?.includes(s));
      }
    } else if (activeTab === 'otherCharges') {
      if (filterCharge) d = d.filter(r => r.items?.some(it => String(it.OtherChId) === filterCharge));
      if (searchText) {
        const s = searchText.toLowerCase();
        d = d.filter(r => r.PatientName?.toLowerCase().includes(s) || r.RegistrationId?.toLowerCase().includes(s) || r.OutBillNo?.toLowerCase().includes(s));
      }
    } else if (activeTab === 'tableData') {
      if (searchText) {
        const s = searchText.toLowerCase();
        d = d.filter(r => r.PatientName?.toLowerCase().includes(s) || r.RegistrationId?.toLowerCase().includes(s) || r.PhoneNo?.includes(s));
      }
    }
    return d;
  }, [data, selectedDeptId, selectedDoctorId, doctorsOfDeptList, filterUser, filterVisitType, filterPayment, filterCharge, searchText, activeTab]);

  // Group the data dynamically for on-screen grouped rendering
  const groupedData = useMemo(() => {
    if (activeTab !== 'visit' || !groupBy) return null;
    
    let groups = {};
    if (groupBy === 'payment') {
      groups = {
        'CASH': filteredData.filter(r => String(r.PaymentType) === '0'),
        'UPI': filteredData.filter(r => String(r.PaymentType) === '3' || String(r.PaymentType) === '1'),
        'BANK': filteredData.filter(r => String(r.PaymentType) === '2' || String(r.PaymentType) === '4'),
        'OTHERS': filteredData.filter(r => !['0', '1', '2', '3', '4'].includes(String(r.PaymentType)))
      };
    } else if (groupBy === 'doctor') {
      const uniqueDocs = [...new Set(filteredData.map(r => r.DoctorName).filter(Boolean))].sort();
      uniqueDocs.forEach(docName => {
        groups[docName.toUpperCase()] = filteredData.filter(r => r.DoctorName === docName);
      });
      if (filteredData.some(r => !r.DoctorName)) {
        groups['NO DOCTOR ASSIGNED'] = filteredData.filter(r => !r.DoctorName);
      }
    } else if (groupBy === 'user') {
      const uniqueUsers = [...new Set(filteredData.map(r => r.UserName).filter(Boolean))].sort();
      uniqueUsers.forEach(userName => {
        groups[`USER: ${userName.toUpperCase()}`] = filteredData.filter(r => r.UserName === userName);
      });
      if (filteredData.some(r => !r.UserName)) {
        groups['NO USER ASSIGNED'] = filteredData.filter(r => !r.UserName);
      }
    }
    return groups;
  }, [filteredData, groupBy, activeTab]);

  const paginatedData = useMemo(() => {
    if (activeTab === 'visit' && groupBy) return filteredData;
    return filteredData.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredData, page, activeTab, groupBy]);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Compute live billing summary values
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

  // Compute dynamic financial collections breakdown (Visit Entry tab only)
  const paymentBreakdown = useMemo(() => {
    if (activeTab !== 'visit') return null;
    const totals = { cash: 0, cheque: 0, card: 0, upi: 0, online: 0 };
    filteredData.forEach(r => {
      const val = Number(r.RecAmt || 0);
      const type = String(r.PaymentType);
      if (type === '0') totals.cash += val;
      else if (type === '1') totals.cheque += val;
      else if (type === '2') totals.card += val;
      else if (type === '3') totals.upi += val;
      else if (type === '4') totals.online += val;
    });
    return totals;
  }, [filteredData, activeTab]);

  const handlePDF = () => {
    if (filteredData.length === 0) return alert('No data to generate PDF');
    generateOpdReportPDF(filteredData, activeTab, fromDate, toDate, summary, groupBy);
  };

  const tabs = [
    { id: 'visit', label: '🏥 Visit Entry' },
    { id: 'otherCharges', label: '💰 OPD Other Charges' },
    { id: 'tableData', label: '📋 Patient Table' },
  ];

  const paymentLabel = (v) => ({ '0': 'Cash', '1': 'Cheque', '2': 'Card', '3': 'UPI', '4': 'Online' }[String(v)] || '-');

  return (
    <div className="main-content">
      {/* Dynamic Premium Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .main-content {
          background: radial-gradient(circle at 50% 0%, #0d1e3d 0%, #050b18 100%) !important;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #cbd5e1;
          padding: 25px 25px 90px 25px !important;
          transition: background 0.4s ease, color 0.4s ease;
        }

        /* Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }

        .premium-dashboard-card {
          background: rgba(13, 27, 56, 0.65);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 24px;
        }

        .premium-dashboard-card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
        }

        .premium-header-bar {
          background: linear-gradient(135deg, rgba(23, 37, 84, 0.35) 0%, rgba(9, 17, 36, 0.75) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .premium-title-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: #ffffff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .premium-filter-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .premium-input-field {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #e2e8f0 !important;
          border-radius: 10px !important;
          padding: 8px 14px !important;
          font-size: 0.85rem !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .premium-input-field:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.35) !important;
          background: rgba(15, 23, 42, 0.9) !important;
        }

        select.premium-input-field {
          cursor: pointer;
        }

        select.premium-input-field option {
          background: #0f172a !important;
          color: #e2e8f0 !important;
        }

        .premium-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: white !important;
          border-radius: 10px !important;
          padding: 8px 18px !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3) !important;
          transition: all 0.25s ease !important;
          cursor: pointer;
        }

        .premium-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45) !important;
        }

        .premium-btn-pdf {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: white !important;
          border-radius: 10px !important;
          padding: 8px 18px !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3) !important;
          transition: all 0.25s ease !important;
          cursor: pointer;
        }

        .premium-btn-pdf:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.45) !important;
        }

        .premium-tab-container {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .premium-tab-button {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 10px 22px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .premium-tab-button:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .premium-tab-button.active {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
        }

        .premium-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .premium-stat-widget {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-stat-widget:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .stat-label {
          font-size: 0.68rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
        }

        /* Financial breakdown widget */
        .financial-breakdown-card {
          background: linear-gradient(135deg, rgba(23, 37, 84, 0.3) 0%, rgba(9, 17, 36, 0.6) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          padding: 18px 24px;
          margin-bottom: 24px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .breakdown-title {
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #a5b4fc;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .breakdown-pill {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 8px 16px;
          border-radius: 10px;
          flex: 1;
          min-width: 140px;
          text-align: center;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .breakdown-pill-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .breakdown-pill-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #34d399;
          text-shadow: 0 0 6px rgba(52, 211, 153, 0.15);
        }

        /* Tables */
        .premium-table-card {
          background: rgba(13, 27, 56, 0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .premium-dashboard-table {
          margin: 0 !important;
          width: 100%;
          border-collapse: collapse;
        }

        .premium-dashboard-table th {
          background: rgba(15, 23, 42, 0.5) !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          font-size: 0.76rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          padding: 16px 20px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          text-align: center;
        }

        .premium-dashboard-table td {
          padding: 14px 20px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
          color: #cbd5e1 !important;
          font-size: 0.85rem !important;
          vertical-align: middle !important;
          text-align: center;
        }

        .premium-table-row {
          transition: background-color 0.2s ease;
        }

        .premium-table-row:hover {
          background-color: rgba(255, 255, 255, 0.015) !important;
        }

        .badge-reg {
          background: rgba(99, 102, 241, 0.12) !important;
          color: #a5b4fc !important;
          border: 1px solid rgba(99, 102, 241, 0.25) !important;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .badge-amount {
          background: rgba(16, 185, 129, 0.12) !important;
          color: #34d399 !important;
          border: 1px solid rgba(16, 185, 129, 0.25) !important;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          display: inline-block;
        }

        .badge-due {
          background: rgba(239, 68, 68, 0.12) !important;
          color: #f87171 !important;
          border: 1px solid rgba(239, 68, 68, 0.25) !important;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          display: inline-block;
        }

        .item-breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 4px;
          font-size: 0.72rem;
          margin-bottom: 2px;
        }

        /* Paging */
        .premium-pg-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
        }

        /* Grouped rows styling in Dark theme */
        .premium-group-header-row {
          background: rgba(99, 102, 241, 0.12) !important;
          border-left: 4px solid #6366f1 !important;
        }
        .premium-group-header-cell {
          padding: 10px 15px !important;
          color: #a5b4fc !important;
          font-size: 0.85rem !important;
          text-align: left !important;
          font-weight: 700 !important;
        }
        .premium-group-subtotal-row {
          background: rgba(255, 255, 255, 0.01) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
        }
        .premium-group-subtotal-label {
          color: #94a3b8 !important;
          font-size: 0.78rem !important;
        }
        .premium-group-subtotal-value {
          color: #34d399 !important;
          font-size: 0.85rem !important;
          text-shadow: 0 0 6px rgba(52, 211, 153, 0.15) !important;
        }

        /* ==========================================================================
           LIGHT/WHITE THEME OVERRIDES (AUTOMATICALLY TRIGGERED BY ROOT GLOBAL CLASS)
           ========================================================================== */

        .light-theme .main-content {
          background: radial-gradient(circle at 50% 0%, #f8fafc 0%, #f1f5f9 100%) !important;
          color: #334155 !important;
        }

        .light-theme ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
        }
        .light-theme ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
        }

        .light-theme .premium-dashboard-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          color: #334155;
        }

        .light-theme .premium-dashboard-card:hover {
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 16px 48px rgba(15, 23, 42, 0.09);
        }

        .light-theme .premium-header-bar {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.85) 100%);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .light-theme .premium-title-text {
          background: linear-gradient(135deg, #0f172a 30%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .light-theme .premium-tab-button {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .light-theme .premium-tab-button:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .light-theme .premium-tab-button.active {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
          border-color: transparent;
        }

        /* Stats & Breakdown in Light Theme */
        .light-theme .premium-stat-widget {
          background: rgba(15, 23, 42, 0.015);
          border: 1px solid rgba(15, 23, 42, 0.04);
        }

        .light-theme .premium-stat-widget:hover {
          background: rgba(15, 23, 42, 0.035);
          border-color: rgba(99, 102, 241, 0.25);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .light-theme .stat-label {
          color: #64748b;
        }

        .light-theme .stat-value {
          color: #0f172a;
        }

        .light-theme .financial-breakdown-card {
          background: linear-gradient(135deg, rgba(241, 245, 249, 0.4) 0%, rgba(226, 232, 240, 0.7) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.03);
        }

        .light-theme .breakdown-title {
          color: #4f46e5;
        }

        .light-theme .breakdown-pill {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.01);
        }

        .light-theme .breakdown-pill-label {
          color: #64748b;
        }

        .light-theme .breakdown-pill-value {
          color: #059669;
          text-shadow: 0 0 6px rgba(5, 150, 105, 0.1);
        }

        /* Filter Elements in Light Theme */
        .light-theme .premium-filter-container {
          background: rgba(15, 23, 42, 0.015);
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .light-theme .premium-input-field {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #1e293b !important;
        }

        .light-theme .premium-input-field:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.18) !important;
          background: #ffffff !important;
        }

        .light-theme select.premium-input-field option {
          background: #ffffff !important;
          color: #1e293b !important;
        }

        /* Table elements in Light Theme */
        .light-theme .premium-table-card {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(15, 23, 42, 0.06);
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.03);
        }

        .light-theme .premium-dashboard-table th {
          background: rgba(241, 245, 249, 0.85) !important;
          color: #475569 !important;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
        }

        .light-theme .premium-dashboard-table td {
          border-bottom: 1px solid rgba(15, 23, 42, 0.04) !important;
          color: #334155 !important;
        }

        .light-theme .premium-table-row:hover {
          background-color: rgba(99, 102, 241, 0.025) !important;
        }

        .light-theme .badge-reg {
          background: rgba(99, 102, 241, 0.08) !important;
          color: #4f46e5 !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
        }

        .light-theme .badge-amount {
          background: rgba(16, 185, 129, 0.08) !important;
          color: #059669 !important;
          border-color: rgba(16, 185, 129, 0.2) !important;
        }

        .light-theme .badge-due {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #dc2626 !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
        }

        .light-theme .item-breakdown-row {
          background: rgba(15, 23, 42, 0.02);
          border: 1px solid rgba(15, 23, 42, 0.04);
        }

        .light-theme .item-breakdown-row span {
          color: #334155 !important;
        }

        .light-theme .premium-pg-container {
          background: #ffffff;
          border-color: #cbd5e1;
        }

        /* Grouped rows styling in Light theme */
        .light-theme .premium-group-header-row {
          background: rgba(79, 70, 229, 0.08) !important;
          border-left: 4px solid #4f46e5 !important;
        }
        .light-theme .premium-group-header-cell {
          color: #4f46e5 !important;
        }
        .light-theme .premium-group-subtotal-row {
          background: rgba(0, 0, 0, 0.005) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
        .light-theme .premium-group-subtotal-label {
          color: #64748b !important;
        }
        .light-theme .premium-group-subtotal-value {
          color: #059669 !important;
          text-shadow: none !important;
        }
      `}} />

      {/* ================= PREMIUM HEADER BAR ================= */}
      <div className="premium-dashboard-card">
        <div className="premium-header-bar">
          <div>
            <h5 className="premium-title-text">
              📊 OPD Report Center
            </h5>
            <p className="text-secondary small mb-0 mt-1">Hospital outpatient clinical registers & financial summaries</p>
          </div>

          <div className="premium-filter-container">
            <div className="d-flex align-items-center gap-1">
              <i className="fa-light fa-calendar text-muted ms-1" style={{ fontSize: '0.85rem' }}></i>
              <input
                type="date"
                className="premium-input-field"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ width: 135 }}
                title="From Date"
              />
            </div>

            <div className="d-flex align-items-center gap-1">
              <i className="fa-light fa-calendar text-muted ms-1" style={{ fontSize: '0.85rem' }}></i>
              <input
                type="date"
                className="premium-input-field"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ width: 135 }}
                title="To Date"
              />
            </div>

            <button onClick={fetchData} disabled={loading} className="premium-btn-primary">
              <i className="fa-solid fa-magnifying-glass"></i> {loading ? 'Fetching...' : 'Fetch'}
            </button>
            
            <button onClick={handlePDF} disabled={filteredData.length === 0} className="premium-btn-pdf">
              <i className="fa-solid fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="premium-tab-container">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setData([]);
              setSearchText('');
              setSelectedDeptId('');
              setSelectedDoctorId('');
              setFilterUser('');
              setFilterVisitType('');
              setFilterPayment('');
              setFilterCharge('');
              setGroupBy('');
            }}
            className={`premium-tab-button ${activeTab === t.id ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= FILTERS PANEL ================= */}
      <div className="premium-dashboard-card p-3">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-md-3">
            <input
              type="text"
              placeholder="🔍 Search name / registration / phone..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="form-control premium-input-field w-100"
            />
          </div>

          <div className="col-md-9">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              
              {/* OPD OTHER CHARGES FILTERS */}
              {activeTab === 'otherCharges' && (
                <select
                  value={filterCharge}
                  onChange={e => setFilterCharge(e.target.value)}
                  className="premium-input-field"
                  style={{ minWidth: '180px' }}
                >
                  <option value="">All Charges ({chargeList.length})</option>
                  {chargeList.map(c => (
                    <option key={c.OtherChId} value={String(c.OtherChId)}>{c.OtherCharge}</option>
                  ))}
                </select>
              )}

              {/* OPD VISIT ENTRY FILTERS */}
              {activeTab === 'visit' && (
                <>
                  {/* Department (Speciality) Select */}
                  <select
                    value={selectedDeptId}
                    onChange={e => setSelectedDeptId(e.target.value)}
                    className="premium-input-field"
                    style={{ minWidth: '160px' }}
                  >
                    <option value="">All Departments ({departmentList.length})</option>
                    {departmentList.map(dept => (
                      <option key={dept.SpecialityId} value={String(dept.SpecialityId)}>
                        {dept.Speciality}
                      </option>
                    ))}
                  </select>

                  {/* Doctor select (loaded dynamically based on Department) */}
                  <select
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                    className="premium-input-field"
                    disabled={!selectedDeptId}
                    style={{ minWidth: '160px', opacity: selectedDeptId ? 1 : 0.6 }}
                  >
                    <option value="">
                      {!selectedDeptId ? 'Select Department First' : `All Doctors (${doctorsOfDeptList.length})`}
                    </option>
                    {doctorsOfDeptList.map(doc => (
                      <option key={doc.DoctorId} value={String(doc.DoctorId)}>
                        {doc.Doctor}
                      </option>
                    ))}
                  </select>

                  {/* User Select */}
                  <select
                    value={filterUser}
                    onChange={e => setFilterUser(e.target.value)}
                    className="premium-input-field"
                    style={{ minWidth: '130px' }}
                  >
                    <option value="">All Users</option>
                    {userList.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>

                  {/* Visit Type Select */}
                  <select
                    value={filterVisitType}
                    onChange={e => setFilterVisitType(e.target.value)}
                    className="premium-input-field"
                    style={{ minWidth: '140px' }}
                  >
                    <option value="">All Visit Types</option>
                    {visitTypeList.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>

                  {/* Payment Filter */}
                  <select
                    value={filterPayment}
                    onChange={e => setFilterPayment(e.target.value)}
                    className="premium-input-field"
                    style={{ minWidth: '130px' }}
                  >
                    <option value="">All Payment</option>
                    <option value="0">Cash</option>
                    <option value="1">Cheque</option>
                    <option value="2">Card</option>
                    <option value="3">UPI</option>
                    <option value="4">Online</option>
                  </select>

                  {/* Group By Selector */}
                  <select
                    value={groupBy}
                    onChange={e => setGroupBy(e.target.value)}
                    className="premium-input-field"
                    style={{ minWidth: '150px', border: '1.5px solid #818cf8', fontWeight: 'bold' }}
                    title="Group By Layout"
                  >
                    <option value="">All (No Grouping)</option>
                    <option value="payment">Group: Payment Wise</option>
                    <option value="doctor">Group: Doctor Wise</option>
                    <option value="user">Group: User Wise</option>
                  </select>
                </>
              )}

              <span className="premium-badge-id d-inline-flex align-items-center justify-content-center">
                {filteredData.length} records
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LIVE SUMMARY CARDS ================= */}
      {data.length > 0 && (
        <div className="premium-stat-grid">
          {activeTab === 'visit' && (
            <>
              <div className="premium-stat-widget">
                <span className="stat-label">Total Visits</span>
                <span className="stat-value text-info">{summary.totalRecords}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Total Amount</span>
                <span className="stat-value text-success">₹{summary.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Reg Charges</span>
                <span className="stat-value text-warning">₹{summary.totalRegCh?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Service Fees</span>
                <span className="stat-value" style={{ color: '#c084fc' }}>₹{summary.totalServiceCh?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Discount</span>
                <span className="stat-value text-danger">₹{summary.totalDiscount?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Received</span>
                <span className="stat-value" style={{ color: '#60a5fa' }}>₹{summary.totalRecAmt?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Due Amount</span>
                <span className="stat-value" style={{ color: '#f87171' }}>₹{summary.totalDue?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </>
          )}
          {activeTab === 'otherCharges' && (
            <>
              <div className="premium-stat-widget">
                <span className="stat-label">Total Bills</span>
                <span className="stat-value text-info">{summary.totalRecords}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Subtotal</span>
                <span className="stat-value text-success">₹{summary.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Discount</span>
                <span className="stat-value text-danger">₹{summary.totalDisc?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Grand Total</span>
                <span className="stat-value text-warning">₹{summary.totalGTotal?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Received</span>
                <span className="stat-value" style={{ color: '#60a5fa' }}>₹{summary.totalPaid?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="premium-stat-widget">
                <span className="stat-label">Due Amount</span>
                <span className="stat-value text-danger">₹{summary.totalDue?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </>
          )}
          {activeTab === 'tableData' && (
            <div className="premium-stat-widget" style={{ maxWidth: '240px' }}>
              <span className="stat-label">Registered Patients</span>
              <span className="stat-value text-info">{summary.totalRecords}</span>
            </div>
          )}
        </div>
      )}

      {/* ================= FINANCIAL COLLECTION BREAKDOWN WIDGET ================= */}
      {activeTab === 'visit' && paymentBreakdown && filteredData.length > 0 && (
        <div className="financial-breakdown-card">
          <div className="breakdown-title">
            <i className="fa-solid fa-receipt"></i>
            💵 Dynamic Cashier Collection Summary (By Payment Mode)
          </div>
          <div className="breakdown-row">
            <div className="breakdown-pill">
              <div className="breakdown-pill-label">💵 Cash Collection</div>
              <div className="breakdown-pill-value">₹{paymentBreakdown.cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="breakdown-pill">
              <div className="breakdown-pill-label">📱 UPI Collection</div>
              <div className="breakdown-pill-value" style={{ color: '#818cf8' }}>₹{paymentBreakdown.upi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="breakdown-pill">
              <div className="breakdown-pill-label">💳 Card Collection</div>
              <div className="breakdown-pill-value" style={{ color: '#fbbf24' }}>₹{paymentBreakdown.card.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="breakdown-pill">
              <div className="breakdown-pill-label">🌐 Online / Net</div>
              <div className="breakdown-pill-value" style={{ color: '#60a5fa' }}>₹{paymentBreakdown.online.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="breakdown-pill">
              <div className="breakdown-pill-label">📄 Cheques</div>
              <div className="breakdown-pill-value" style={{ color: '#c084fc' }}>₹{paymentBreakdown.cheque.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DATA GRID TABLE ================= */}
      <div className="premium-table-card">
        <OverlayScrollbarsComponent style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'otherCharges' ? (
            <OtherChargesTable data={paginatedData} loading={loading} page={page} pageSize={pageSize} />
          ) : (
            <table className="table premium-dashboard-table mb-0">
              <thead>
                <tr>
                  {getHeaders(activeTab).map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={20} className="text-center text-muted py-5">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      Fetching records dynamically...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="text-center text-muted py-5">
                      <i className="fa-light fa-folder-open d-block mb-2" style={{ fontSize: '2rem' }}></i>
                      No records found. Adjust date filters and click 'Fetch'.
                    </td>
                  </tr>
                ) : activeTab === 'visit' && groupBy && groupedData ? (
                  Object.entries(groupedData).map(([groupName, items]) => {
                    if (items.length === 0 && groupBy !== 'payment') return null;
                    const groupSubtotal = items.reduce((s, x) => s + Number(x.RecAmt || 0), 0);
                    return (
                      <React.Fragment key={groupName}>
                        {/* Group Header Banner */}
                        <tr className="premium-group-header-row">
                          <td colSpan={16} className="premium-group-header-cell">
                            📁 {groupName} ({items.length} records)
                          </td>
                        </tr>
                        {/* Group Rows */}
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={16} className="text-center text-muted py-3 small" style={{ background: 'rgba(255,255,255,0.01)' }}>No records in this group</td>
                          </tr>
                        ) : (
                          items.map((r, idx) => (
                            <tr key={r.RegistrationId + '-' + idx} className="premium-table-row">
                              {getRowCells(r, activeTab, idx + 1, paymentLabel)}
                            </tr>
                          ))
                        )}
                        {/* Group Subtotal Row */}
                        <tr className="premium-group-subtotal-row">
                          <td colSpan={13} className="text-end fw-bold py-2 premium-group-subtotal-label">SUBTOTAL FOR {groupName}:</td>
                          <td className="fw-bold py-2 premium-group-subtotal-value">₹{groupSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td colSpan={2} className="py-2"></td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                ) : (
                  paginatedData.map((r, idx) => (
                    <tr key={idx} className="premium-table-row">
                      {getRowCells(r, activeTab, (page - 1) * pageSize + idx + 1, paymentLabel)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </OverlayScrollbarsComponent>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && !(activeTab === 'visit' && groupBy) && (
          <div className="d-flex justify-content-center p-3 border-top border-opacity-10" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.1)' }}>
            <div className="premium-pg-container">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="premium-btn-secondary py-1 px-3"
                style={{ minHeight: 'auto', border: 'none' }}
              >
                <i className="fa-solid fa-angle-left me-1"></i> Prev
              </button>
              
              <span className="text-secondary small px-3">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="premium-btn-secondary py-1 px-3"
                style={{ minHeight: 'auto', border: 'none' }}
              >
                Next <i className="fa-solid fa-angle-right ms-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Subcomponent for OPD Other Charges table breakdown
const OtherChargesTable = ({ data, loading, page, pageSize }) => {
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';
  const n = (v) => v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Loading Charges Breakdown...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fa-light fa-folder-open d-block mb-2" style={{ fontSize: '2rem' }}></i>
        No other charges invoices found for this date.
      </div>
    );
  }

  return (
    <table className="table premium-dashboard-table mb-0">
      <thead>
        <tr>
          {['#', 'Bill No', 'Reg ID', 'Patient', 'Phone', 'Age/Sex', 'Date', 'Charges Category (Breakdown)', 'Amount', 'Disc', 'G.Total', 'Paid', 'Due'].map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r, idx) => (
          <tr key={idx} className="premium-table-row">
            <td><span className="text-secondary">{(page - 1) * pageSize + idx + 1}</span></td>
            <td><span className="badge-reg">{r.OutBillNo || '-'}</span></td>
            <td><span className="badge-reg">{r.RegistrationId || '-'}</span></td>
            <td><span className="fw-semibold text-white">{r.PatientName || '-'}</span></td>
            <td>{r.PhoneNo || '-'}</td>
            <td>{r.Age || '-'}/{r.Sex || '-'}</td>
            <td>{fmtDate(r.OutBillDate)}</td>
            <td style={{ minWidth: '220px', textAlign: 'left' }}>
              {r.items && r.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {r.items.map((item, i) => (
                    <div key={i} className="item-breakdown-row">
                      <span className="text-white fw-medium">{item.ChargeName || item.OtherCharge || 'Charge'}</span>
                      <span className="fw-semibold text-info" style={{ marginLeft: '10px' }}>
                        {item.Qty > 1 ? `${item.Qty} × ` : ''}₹{Number(item.Amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted small">No items breakdown</span>
              )}
            </td>
            <td><span className="fw-semibold text-success">₹{n(r.Amount)}</span></td>
            <td><span className="text-danger">₹{n(r.DiscAmt)}</span></td>
            <td><span className="badge-amount">₹{n(r.GTotal)}</span></td>
            <td><span className="fw-semibold text-info">₹{n(r.paidamt)}</span></td>
            <td>
              <span className={r.dueamt > 0 ? 'badge-due' : 'badge-amount'}>
                ₹{n(r.dueamt)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const getHeaders = (tab) => {
  if (tab === 'visit') return ['#', 'Reg ID', 'Patient', 'Phone', 'Doctor', 'Visit Type', 'Date', 'Payment', 'Rate', 'RegCh', 'SrvCh', 'Disc', 'Total', 'Rec', 'Due', 'User'];
  if (tab === 'tableData') return ['#', 'Reg ID', 'Patient', 'Phone', 'Age', 'Sex', 'Address', 'Reg Date', 'BillsCount'];
  return [];
};

const getRowCells = (r, tab, idx, paymentLabel) => {
  const td = (v) => <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>{v ?? '-'}</td>;
  const tdBold = (v) => <td style={{ padding: '14px 20px', whiteSpace: 'nowrap', fontWeight: 600 }}>{v ?? '-'}</td>;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';
  const n = (v) => v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0';

  if (tab === 'visit') {
    return [
      td(idx),
      <td><span className="badge-reg">{r.RegistrationId}</span></td>,
      <td className="fw-semibold text-white">{r.PatientName}</td>,
      td(r.PhoneNo),
      tdBold(r.DoctorName),
      td(r.VisitTypeName),
      td(fmtDate(r.PVisitDate)),
      <td><span className="badge-reg" style={{ background: 'rgba(255,255,255,0.05)', color: '#a5b4fc', borderColor: 'rgba(255,255,255,0.1)' }}>{paymentLabel(r.PaymentType)}</span></td>,
      td(n(r.Rate)),
      td(n(r.RegCh)),
      td(n(r.ServiceCh)),
      <td className="text-danger">₹{n(r.Discount)}</td>,
      <td><span className="badge-amount" style={{ background: 'rgba(234, 179, 8, 0.12)', color: '#eab308', borderColor: 'rgba(234, 179, 8, 0.25)' }}>₹{n(r.TotAmount)}</span></td>,
      <td className="text-success">₹{n(r.RecAmt)}</td>,
      <td>
        <span className={Number(r.DueAmt) > 0 ? 'badge-due' : 'badge-amount'}>
          ₹{n(r.DueAmt)}
        </span>
      </td>,
      td(r.UserName)
    ];
  }
  if (tab === 'tableData') {
    return [
      td(idx),
      <td><span className="badge-reg">{r.RegistrationId}</span></td>,
      <td className="fw-semibold text-white">{r.PatientName}</td>,
      td(r.PhoneNo),
      td(r.Age),
      td(r.Sex === 'M' ? 'Male' : r.Sex === 'F' ? 'Female' : r.Sex),
      td(r.Add1),
      td(fmtDate(r.RegDate)),
      <td><span className="badge-amount">{r.billCount || 0}</span></td>
    ];
  }
  return [];
};

export default OpdReportSection;
