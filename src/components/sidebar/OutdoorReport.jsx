import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const OutdoorReport = () => {
  const {
    outdoorReportState,
    toggleMainOutdoorReportDropdown,
    layoutPosition,
    dropdownOpen,
    mainOutdoorReportRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = outdoorReportState;

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

        <li className="sidebar-dropdown-item">
          <NavLink to="/date-wise-registration-charge" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-file-chart-column"></i>
            </span>
            <span className="sidebar-txt">Date Wise Registration Charge</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/dr-rect-visit-detail" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-file-medical"></i>
            </span>
            <span className="sidebar-txt">Date Wise Doctor Wise Visit Detail</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/patient-history" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-clock-rotate-left"></i>
            </span>
            <span className="sidebar-txt">Patient History</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/others-bill-register" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-receipt"></i>
            </span>
            <span className="sidebar-txt">Others Bill Register</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/cash-register" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-cash-register"></i>
            </span>
            <span className="sidebar-txt">CASH REGISTER</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/cash-register-list" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-list"></i>
            </span>
            <span className="sidebar-txt">Cash Register</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/cash-payment-register" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-money-bill-wave"></i>
            </span>
            <span className="sidebar-txt">Cash Payment Register</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/date-wise-cash-register" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-calendar-days"></i>
            </span>
            <span className="sidebar-txt">Date Wise Cash Register</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/staff-register" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-users"></i>
            </span>
            <span className="sidebar-txt">Staff Register</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/visit-type-group-wise-report" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-chart-pie"></i>
            </span>
            <span className="sidebar-txt">Visit Type Group Wise Report</span>
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default OutdoorReport;
