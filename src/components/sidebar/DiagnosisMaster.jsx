import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { DigiContext } from "../../context/DigiContext";
import { useAuth } from '../../context/AuthContext';

const DiagnosisMaster = () => {
  const {
    diagnosisMasterState,
    toggleMainDiagnosisMasterDropdown,
    layoutPosition,
    dropdownOpen,
    mainDiagnosisMasterRef,
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = diagnosisMasterState;

  // Check if user is super admin
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  // Hide entire section if no diagnosisMaster permission and not super admin
  if (!isSuperAdmin && !permissions?.diagnosisMaster) {
    return null;
  }

  return (
    <li
      className="sidebar-item"
      ref={layoutPosition.horizontal ? mainDiagnosisMasterRef : null}
    >
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${
          isMainDropdownOpen ? "show" : ""
        }`}
        onClick={toggleMainDiagnosisMasterDropdown}
      >
        Diagnosis Master
      </Link>

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
        {/* Parameter Setup */}
        {(isSuperAdmin || permissions?.diagnosisMaster_parameterSetup !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/DiagnosticParameterSetup" className="sidebar-link">
              ParaMeter Setup
            </NavLink>
          </li>
        )}

        {/* Category */}
        {(isSuperAdmin || permissions?.diagnosisMaster_category !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/CategoryMaster" className="sidebar-link">
              Category
            </NavLink>
          </li>
        )}

        {/* Test Master */}
        {(isSuperAdmin || permissions?.diagnosisMaster_test !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/TestMaster" className="sidebar-link">
              Test 
            </NavLink>
          </li>
        )}

          {(isSuperAdmin || permissions?.diagnosisMaster_testCalculation !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/TestCalculation" className="sidebar-link">
              Test Calculation
            </NavLink>
          </li>
        )}

        {/* Package Master */}
        {(isSuperAdmin || permissions?.diagnosisMaster_packageMaster !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/PackageMaster" className="sidebar-link">
              Package Master
            </NavLink>
          </li>
        )}

        {/* Sample Type */}
        {(isSuperAdmin || permissions?.diagnosisMaster_sampleType !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/SampleType" className="sidebar-link">
              Sample Type
            </NavLink>
          </li>
        )}

      </ul>
    </li>
  );
};

export default DiagnosisMaster;