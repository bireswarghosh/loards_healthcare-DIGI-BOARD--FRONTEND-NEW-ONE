import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const DiagnosisMaster = () => {

  const { 
    diagnosisMasterState,
    toggleMainDiagnosisMasterDropdown,
    layoutPosition,
    dropdownOpen,
    mainDiagnosisMasterRef
  } = useContext(DigiContext);

  const { isMainDropdownOpen } = diagnosisMasterState;

  return (
    <li
      className="sidebar-item"
      ref={layoutPosition.horizontal ? mainDiagnosisMasterRef : null}
    >
      {/* MAIN TITLE */}
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? "show" : ""}`}
        onClick={toggleMainDiagnosisMasterDropdown}
      >
        Diagnosis Master
      </Link>

      {/* SUB MENU */}
      <ul
        className={`sidebar-link-group ${
          layoutPosition.horizontal
            ? dropdownOpen.diagnosisMaster
              ? "d-block"
              : ""
            : isMainDropdownOpen
            ? "d-none"
            : ""
        }`}
      >

        <li className="sidebar-dropdown-item">
          <NavLink to="/GodownMaster" className="sidebar-link">
            Godown Management
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CategoryMaster" className="sidebar-link">
            Category Management
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/ItemGroupMaster" className="sidebar-link">
            Item Group Management
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/RemarksMaster" className="sidebar-link">
            Remarks
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CultureMedicine" className="sidebar-link">
            Culture Medicine
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Test" className="sidebar-link">
            Test
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default DiagnosisMaster;
