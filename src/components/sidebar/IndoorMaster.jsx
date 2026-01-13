import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { DigiContext } from "../../context/DigiContext";

const IndoorMaster = () => {
  const {
    indoorMasterState,
    toggleMainIndoorMasterDropdown,
    dropdownOpen,
    layoutPosition,
    mainIndoorMasterRef
  } = useContext(DigiContext);

  const { isMainDropdownOpen } = indoorMasterState;

  return (
    <li
      className="sidebar-item"
      ref={layoutPosition.horizontal ? mainIndoorMasterRef : null}
    >
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${
          isMainDropdownOpen ? "show" : ""
        }`}
        onClick={toggleMainIndoorMasterDropdown}
      >
        Indoor Master (IPD)
      </Link>

      <ul
        className={`sidebar-link-group ${
          layoutPosition.horizontal
            ? dropdownOpen.indoorMaster
              ? "d-block"
              : ""
            : isMainDropdownOpen
            ? "d-none"
            : ""
        }`}
      >
        {/* ---------------- MENU START ---------------- */}

        <li className="sidebar-dropdown-item">
          <NavLink to="/IndoorParameterSetup" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-cog"></i></span>
            <span className="sidebar-txt">Parameter Setup</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DepartmentGroup" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-layer-group"></i></span>
            <span className="sidebar-txt">Department Group</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/BedMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-bed"></i></span>
            <span className="sidebar-txt">Bed Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/ReligionMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-om"></i></span>
            <span className="sidebar-txt">Religion Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/NurseMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-user-nurse"></i></span>
            <span className="sidebar-txt">Nurse Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/NurseStationMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-hospital"></i></span>
            <span className="sidebar-txt">Nurse Station Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/NurseStationDetailMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-hospital-user"></i></span>
            <span className="sidebar-txt">Nurse Station Detail Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DayCareBedRate" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-money-check"></i></span>
            <span className="sidebar-txt">Day Care Bed Rate</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-hospital-alt"></i></span>
            <span className="sidebar-txt">O.T. Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTSlotMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-clock"></i></span>
            <span className="sidebar-txt">O.T. Slot Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTType" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-list"></i></span>
            <span className="sidebar-txt">OT Type</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTCategory" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-list-tree"></i></span>
            <span className="sidebar-txt">OT Category</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTItemMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-box"></i></span>
            <span className="sidebar-txt">OT Item</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CashlessMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-credit-card"></i></span>
            <span className="sidebar-txt">Cashless Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/ConsentMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-file-signature"></i></span>
            <span className="sidebar-txt">Consent Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/BillPrintHeadMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-print"></i></span>
            <span className="sidebar-txt">Bill Print Head</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OtherChargesMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-sack-dollar"></i></span>
            <span className="sidebar-txt">Other Charges Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyWiseBedRateNew" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-hotel"></i></span>
            <span className="sidebar-txt">Company Wise Bed Rate</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyWiseOtItemRate" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-box-dollar"></i></span>
            <span className="sidebar-txt">Company Wise OT Item Rate</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyWiseOtherChargesRate" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-sack"></i></span>
            <span className="sidebar-txt">Company Wise Others Charges</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyTestRate" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-vial"></i></span>
            <span className="sidebar-txt">Company Wise Referral Test</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/ReferalMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-user-doctor"></i></span>
            <span className="sidebar-txt">Referral Master</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/profile-master" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-user"></i></span>
            <span className="sidebar-txt">Profile Master</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiseaseMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-user"></i></span>
            <span className="sidebar-txt">Disease Master</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/CashPaymentHeadMaster" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-user"></i></span>
            <span className="sidebar-txt">Cash Payment Headmaster</span>
          </NavLink>
        </li>

        {/* ---------------- MENU END ---------------- */}
      </ul>
    </li>
  );
};

export default IndoorMaster;