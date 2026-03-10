import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section4 = () => {
  const { section4State, toggleMainSection4Dropdown, layoutPosition, dropdownOpen, mainSection4Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section4State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection4Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection4Dropdown}>
dia  report
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section4 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      


<li className="sidebar-dropdown-item">
  <NavLink to="/PatientIdReport" className="sidebar-link">
    <span className="nav-icon">
      <i className="fa-light fa-diamond"></i>
    </span>
    <span className="sidebar-txt">Patient Id Report</span>
  </NavLink>
</li>

<li className="sidebar-dropdown-item">
  <NavLink to="/TestScheduleReport" className="sidebar-link">
    <span className="nav-icon">
      <i className="fa-light fa-diamond"></i>
    </span>
    <span className="sidebar-txt">Test Schedule Report</span>
  </NavLink>
</li>

<li className="sidebar-dropdown-item">
  <NavLink to="/caseWiseLab" className="sidebar-link">
    <span className="nav-icon">
      <i className="fa-light fa-diamond"></i>
    </span>
    <span className="sidebar-txt">Case Wise Lab</span>
  </NavLink>
</li>

<li className="sidebar-dropdown-item">
  <NavLink to="/DoctorList" className="sidebar-link">
    <span className="nav-icon">
      <i className="fa-light fa-diamond"></i>
    </span>
    <span className="sidebar-txt">Doctor List</span>
  </NavLink>
</li>

<li className="sidebar-dropdown-item">
  <NavLink to="/MonthlyBill" className="sidebar-link">
    <span className="nav-icon">
      <i className="fa-light fa-diamond"></i>
    </span>
    <span className="sidebar-txt">Monthly Bill</span>
  </NavLink>
</li>

<li className="sidebar-dropdown-item">
  <NavLink to="/CancelTest" className="sidebar-link">
    <span className="nav-icon">
      <i className="fa-light fa-diamond"></i>
    </span>
    <span className="sidebar-txt">Cancel Test</span>
  </NavLink>
</li>





      </ul>
    </li>
  );
};

export default Section4;