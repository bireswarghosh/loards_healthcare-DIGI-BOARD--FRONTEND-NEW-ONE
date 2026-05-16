import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const Section3 = () => {
  const { section3State, toggleMainSection3Dropdown, layoutPosition, dropdownOpen, mainSection3Ref } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = section3State;

  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';

  if (!isSuperAdmin && permissions?.indoorReport === false) {
    return null;
  }

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection3Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection3Dropdown}>
        Indoor Report
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section3 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>

        {(isSuperAdmin || permissions?.indoorReport_admissionRegister !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/date-wise-registration-charge" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Datewise Admision Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_dischargePatient !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/discharge-pateint-reg" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Discharge Patient Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_moneyReceipt !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/datawise-moneyreceipt" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Datewise Money Receipt</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_finalBill !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dateWiseFinalBillRegPdf" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Final Bill Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_otherCharges !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dateWiseOtherChargesReg" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Other Charges Register</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_otherChargesDetail !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dateWiseFinalBillOtherChargesReg" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Other Charges Detail</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_drCharges !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dateWiseDrChargesDetailPdf" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Dr.Charges Detail</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_bedCharges !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dateWiseBedChargesPdf" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Bed Charges</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.indoorReport_billReport !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/daterangebillipd" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>
              <span className="sidebar-txt">Bill Report</span>
            </NavLink>
          </li>
        )}

      </ul>
    </li>
  );
};

export default Section3;
