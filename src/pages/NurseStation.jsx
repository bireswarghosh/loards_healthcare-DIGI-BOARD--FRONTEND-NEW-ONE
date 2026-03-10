import React, { useState } from 'react';
import NurseStationFinalBilling from './NurseStationFinalBilling';

const NurseStation = () => {
  const [selectedBed, setSelectedBed] = useState('01 ICU');
  const [isBedListOpen, setIsBedListOpen] = useState(false);

  // --- MODERN THEME STYLES (Based on MoneyReceipt) ---
  const styles = `
    :root {
      --primary-color: #0d6efd;
      --secondary-color: #6c757d;
      --success-color: #198754;
      --danger-color: #dc3545;
      --light-bg: #205e9cff;
      --dark-bg: #212529;
      --border-color: #72879cff;
      --panel-bg: #bb0909ff;
      --sidebar-width: 220px;
      --action-panel-width: 160px;
      --header-height: 50px;
      --footer-height: 60px;
    }

    * { box-sizing: border-box; }

    body, html {
      margin: 0; padding: 0;
      height: 100vh; width: 100vw;
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px; /* Slightly legible font size */
    //background-color: #344557ff; /* Dashboard background */
      overflow: hidden; /* Prevent global scroll */
    }

    /* --- LAYOUT GRID --- */
    .nurse-station-layout {
      display: grid;
      grid-template-columns: var(--sidebar-width) 1fr var(--action-panel-width);
      grid-template-rows: 100vh;
      height: 100vh;
      overflow: hidden;
    }

    /* --- COMMON UTILS --- */
    .panel {
      background: var(--panel-bg);
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .form-control-sm {
      height: 24px;
      padding: 2px 6px;
      font-size: 11px;
      border: 1px solid var(--border-color);
      border-radius: 3px;
      width: 100%;
      display: block;
    }
    
    .form-control-sm:focus {
      border-color: #86b7fe;
      outline: 0;
      box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.25);
    }

    .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 1px;
      font-size: 11px;
      white-space: nowrap;
    }

    .btn-action {
     // width: 100%;
      margin-bottom: 6px;
      font-size: 11px;
      padding: 8px;
      text-align: center;
      background-color: #f9fbe9ff;
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }
    .btn-action:hover {
      background-color: var(--primary-color);
      color: white;
    }

    /* --- LEFT PANEL: BED LIST --- */
    .bed-panel {
      background: #fff;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      z-index: 10;
    }
    
    .bed-header {
      padding: 10px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bed-list-scroll {
      overflow-y: auto;
      flex: 1;
      padding: 5px;
    }

    .bed-item {
      padding: 8px 10px;
      margin-bottom: 2px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      border-left: 3px solid transparent;
      color: #333;
    }
    .bed-item:hover { background-color: #f2f0f3; }
    .bed-item.selected {
      background-color: #e8f2ff;
      border-left-color: var(--primary-color);
      color: var(--primary-color);
    }

    .bed-footer {
      padding: 10px;
      border-top: 1px solid var(--border-color);
      background: #f8f9fa;
    }

    /* --- CENTER PANEL: WORKSTATION --- */
    .center-panel {
      display: flex;
      flex-direction: column;
      padding: 10px;
      gap: 10px;
      overflow-y: auto;
      background: #eef2f6;
    }

    .section-card {
      background: primary;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 8px;
      position: relative;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-color);
      text-transform: uppercase;
      margin-bottom: 8px;
      border-bottom: 1px solid #eee;
      padding-bottom: 4px;
    }

    /* Grid Helpers */
    .row-flex { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .col-flex { display: flex; flex-direction: column; gap: 2px; }
    .flex-1 { flex: 1; }
    
    /* Search Bar */
    .top-search-bar {
      display: flex;
      gap: 8px;
      align-items: center;
      background: #fff;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }

    /* Patient Grid Split */
    .patient-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    /* Package Bar */
    .package-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #e9ecef;
      padding: 6px;
      border-radius: 4px;
      font-size: 11px;
    }

    /* Tables */
    .table-container {
      border: 1px solid var(--border-color);
      background: #fff;
      height: 180px;
     // overflow: hidden;
      display: grid;
      grid-template-columns: 40% 60%;
    }
    .table-scroll { overflow: auto; height: 100%; }
    
    .modern-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .modern-table th {
      background: #f8f9fa;
     position: sticky;
      top: 0;
      padding: 6px;
      text-align: left;
      border-bottom: 2px solid var(--border-color);
      color: #495057;
    }
    .modern-table td {
      padding: 6px;
      border-bottom: 1px solid #b81919ff;
      color: #212529;
    }
    .modern-table tr:hover { background-color: #88898aff; }
    .modern-table .selected-row { background-color: #e8f2ff; }

    /* Footer Stats */
    .footer-stats {
     display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 55px;
      align-items: end;
    }
    .stat-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      color: white;
      text-align: center;
      min-width: 40px;
    }
    .bg-green { background-color: var(--success-color); }
    .bg-blue { background-color: var(--primary-color); }

    /* --- RIGHT PANEL: ACTIONS --- */
    .action-panel {
      background: #fff;
      border-left: 1px solid var(--border-color);
      padding: 10px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 5px;
    }

    /* --- RESPONSIVE ADJUSTMENTS --- */
    @media (max-width: 1024px) {
      .nurse-station-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      /* 1. Bed List Collapsible Header */
      .bed-panel {
        flex-shrink: 0;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
        max-height: ${isBedListOpen ? '40vh' : '40px'};
        transition: max-height 0.3s ease;
      }
      .bed-header { padding: 8px 15px; height: 40px; }
      
      /* 2. Main Content Scrollable Area */
      .center-panel {
        flex: 1; /* Takes all available space */
        overflow-y: auto;
        padding-bottom: 80px; /* Padding for fixed footer */
      }
      
      /* Collapse Grids */
      .patient-grid { grid-template-columns: 1fr; gap: 10px; }
      .table-container { grid-template-columns: 1fr; height: auto; }
      .table-scroll { max-height: 200px; border-bottom: 1px solid #e60707ff; }
      .footer-stats { grid-template-columns: 1fr; gap: 10px; }

      /* 3. FIXED FOOTER ACTION PANEL */
      .action-panel {
        //position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
       // height: 70px; /* Fixed height footer */
       // flex-direction: row;
        padding: 5px;
        background: #513333ff;
        border-top: 1px solid var(--border-color);
        box-shadow: 0 -2px 10px rgba(231, 25, 25, 0.05);
        overflow-x: auto; /* Horizontal scroll for buttons */
        white-space: nowrap;
        gap: 8px;
        z-index: 100;
      }
      
      .btn-action {
        width: auto;
        height: 100%;
        margin: 0;
        padding: 0 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0; /* Don't squash buttons */
        white-space: normal;
        font-size: 10px;
        line-height: 1.2;
      }
    }
  `;

  // --- MOCK DATA ---
  const bedList = ["01 ICU", "0100", "0100-2", "1", "1 ICU", "10 GWF", "11 GWF", "110 GWM A/C", "115 GWM A/C", "12 GWM A/C", "12 ICU", "134 GWM", "136 GWM", "141 GWM"];

  return (
    <>
      <style>{styles}</style>
      <div className="nurse-station-layout">
        
        {/* === LEFT SIDEBAR: BED LIST === */}
        <div className="bed-panel">
          <div className="bed-header bg-primary" onClick={() => setIsBedListOpen(!isBedListOpen)}>
            <span>🛏️ Bed List</span>
            <span style={{fontSize:'12px'}}>{isBedListOpen ? '▲' : '▼'}</span>
          </div>
          
          <div className="bed-list-scroll">
            {bedList.map((bed, i) => (
                <div key={i} className={`bed-item ${selectedBed === bed ? 'bg-primary text-white' : ''}`} onClick={() => setSelectedBed(bed)}>
                    {bed}
                </div>
            ))}
          </div>

          <div className="bed-footer">
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="cashlessOnly" />
                <label className="form-check-label" htmlFor="cashlessOnly" style={{fontSize: '11px', fontWeight: '600', color: '#dc3545'}}>Only Cashless</label>
            </div>
          </div>
        </div>

        {/* === CENTER PANEL: MAIN CONTENT === */}
        <NurseStationFinalBilling/>

        {/* === RIGHT PANEL: ACTIONS (BECOMES FOOTER ON MOBILE) === */}
        <div className="action-panel">
            <button className="btn-action">Diagnosis Case Entry</button>
            <button className="btn-action">Diagnosis Requisition</button>
            <button className="btn-action">Medicine Requisition</button>
            <button className="btn-action">Issue To Indoor</button>
            <button className="btn-action">Others Service</button>
            <button className="btn-action">Discharge And Advice</button>
            <button className="btn-action">Doctor Visit</button>
            <button className="btn-action">Diagnosis Query</button>
            <button className="btn-action">Medicine Return</button>
            <button className="btn-action">Money Receipt</button>
            <button className="btn-action">Final Bill</button>
        </div>

      </div>
    </>
  );
};

export default NurseStation;
