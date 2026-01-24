import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const OutdoorReport = () => {
  const {
    outdoorReportState,
    toggleMainOutdoorReportDropdown,
    layoutPosition,
    dropdownOpen,
    mainOutdoorReportRef
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = outdoorReportState;

  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  if (!isSuperAdmin && !permissions?.outdoorReport) {
    return null;
  }

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainOutdoorReportRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainOutdoorReportDropdown}
      >
        Outdoor Report
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.outdoorReport ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>

        {(isSuperAdmin || permissions?.outdoorReport_dateWiseReg !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/date-wise-registration-charge" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-file-chart-column"></i>
              </span>
              <span className="sidebar-txt">Date Wise Registration Charge</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_doctorVisit !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dr-rect-visit-detail" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-file-medical"></i>
              </span>
              <span className="sidebar-txt">Date Wise Doctor Wise Visit Detail</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_patientHistory !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/patient-history" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-clock-rotate-left"></i>
              </span>
              <span className="sidebar-txt">Patient History</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_billRegister !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/others-bill-register" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-receipt"></i>
              </span>
              <span className="sidebar-txt">Others Bill Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_cashRegister !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/cash-register" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-cash-register"></i>
              </span>
              <span className="sidebar-txt">CASH REGISTER</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_cashRegisterList !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/cash-register-list" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-list"></i>
              </span>
              <span className="sidebar-txt">Cash Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_cashPayment !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/cash-payment-register" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-money-bill-wave"></i>
              </span>
              <span className="sidebar-txt">Cash Payment Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_dateWiseCash !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/date-wise-cash-register" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-calendar-days"></i>
              </span>
              <span className="sidebar-txt">Date Wise Cash Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_staffRegister !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/staff-register" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-users"></i>
              </span>
              <span className="sidebar-txt">Staff Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.outdoorReport_visitTypeReport !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/visit-type-group-wise-report" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-chart-pie"></i>
              </span>
              <span className="sidebar-txt">Visit Type Group Wise Report</span>
            </NavLink>
          </li>
        )}

      </ul>
    </li>
  );
};

export default OutdoorReport;
