import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const DiagnosisMaster = () => {

  const { 
    state, 
    toggleMainDropdown,
    toggleSubDropdown,
    layoutPosition,
    dropdownOpen,
    mainAppsDropdownRef,
    isExpanded,
    isNavExpanded,
    isSmallScreen,
  } = useContext(DigiContext);

  const { 
    isMainDropdownOpen, 
    isSubDropdownOpen 
  } = state;

  const handleSubNavLinkClick = () => {
    if (!isSubDropdownOpen) {
      toggleSubDropdown();
    }
  };

  return (
    <li
      className="sidebar-item"
      ref={
        isExpanded || 
        isNavExpanded.isSmall ||
        layoutPosition.horizontal || 
        (layoutPosition.twoColumn && isExpanded) || 
        (layoutPosition.twoColumn && isSmallScreen)
          ? mainAppsDropdownRef
          : null
      }
    >
      {/* MAIN TITLE */}
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? "show" : ""}`}
        onClick={toggleMainDropdown}
      >
        Diagnosis Master
      </Link>

      {/* SUB MENU */}
      <ul
        className={`sidebar-link-group 
          ${
            layoutPosition.horizontal
              ? dropdownOpen.apps
                ? "d-block"
                : "d-none"
              : isMainDropdownOpen
              ? "d-none"
              : ""
          }
        `}
      >

        <li className="sidebar-dropdown-item">
          <NavLink to="/GodownMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Godown Management
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CategoryMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Category Management
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/ItemGroupMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Item Group Management
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/RemarksMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Remarks
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CultureMedicine" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Culture Medicine
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Test" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Test
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default DiagnosisMaster;
