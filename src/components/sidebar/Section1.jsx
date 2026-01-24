import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const Section1 = () => {
  const {
    section1State,
    toggleMainSection1Dropdown,
    layoutPosition,
    dropdownOpen,
    mainSection1Ref
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = section1State;

  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  if (!isSuperAdmin && !permissions?.diagnosis) {
    return null;
  }

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection1Ref : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainSection1Dropdown}
      >
Diagnosis
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section1 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

     {/* <li className="sidebar-dropdown-item">
          <NavLink to="/section1-item1" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-circle"></i>
            </span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li> */}







        {(isSuperAdmin || permissions?.diagnosis_caseEntry !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/CaseList" className="sidebar-link">
              Case Entry 
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_moneyReceipt !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/moneyreceipt" className="sidebar-link">
              Money Receipt
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_laboratoryQuery !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/LaboratoryQuery" className="sidebar-link">
              Laboratory Query
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_download !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/lab_query" className="sidebar-link">
              Download
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_booking !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/DiagBookingList" className="sidebar-link">
              Booking
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_opd !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/lab_query" className="sidebar-link">
              OPD
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_sampleCollection !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/SampleCollection" className="sidebar-link">
              Sample Collection
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_addIns !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/lab_query" className="sidebar-link">
              Add Ins
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_pos !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/legacy_pos" className="sidebar-link">
              Pos
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.diagnosis_radiologyRequisition !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/RadiologyRequisition" className="sidebar-link">
              Readiology Requiaition
            </NavLink>
          </li>
        )}








    

      </ul>
    </li>
  );
};

export default Section1;