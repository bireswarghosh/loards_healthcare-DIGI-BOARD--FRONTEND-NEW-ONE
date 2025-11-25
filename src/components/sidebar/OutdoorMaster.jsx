import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const OutdoorMaster = () => {
  const { 
    state, 
    toggleCrmDropdown, 
    toggleHrmDropdown, 
    toggleEcommerceDropdown, 
    toggleMainDropdown, 
    toggleSubDropdown,
    layoutPosition, 
    dropdownOpen,
    mainAppsDropdownRef,
    isExpanded,
    isNavExpanded,
    isSmallScreen
  } = useContext(DigiContext);
  const { 
    isMainDropdownOpen, 
    isCrmDropdownOpen, 
    isHrmDropdownOpen, 
    isEcommerceDropdownOpen, 
    isSubDropdownOpen 
  } = state;
  
  const handleSubNavLinkClick = () => {
    if (!isSubDropdownOpen) {
      toggleSubDropdown(); // Open the sub-dropdown
    }
  };
  return (
    <li className="sidebar-item" ref={isExpanded || isNavExpanded.isSmall || layoutPosition.horizontal || (layoutPosition.twoColumn && isExpanded) || (layoutPosition.twoColumn && isSmallScreen) ? mainAppsDropdownRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainDropdown}
      >
        Outdoor Master
      </Link>
      <ul className={`sidebar-link-group 
      ${layoutPosition.horizontal ? (dropdownOpen.apps ? 'd-block' : 'd-none') : (isMainDropdownOpen ? 'd-none' : '')}
      `}>       

        <li className="sidebar-dropdown-item">
          <NavLink to="/OutdoorParameterSetup" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Outdoor Parameter Setup
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ServiceMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Service Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/OutdoorOtherChargeMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Outdoor Other Charge Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/RoomNoMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Room No Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisitTypeGrpMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Visit Type Group Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ChiefMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Chief Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiagoMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Diagnosis Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/PastHistoryMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Past History Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DoseMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Dose Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/AdviceMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Advice Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisitourMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Visitor Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisittypegrpMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Visit Type Group Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisittypeMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Visit Type Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanymstMaster" className="sidebar-link" onClick={handleSubNavLinkClick}>
            Company Master
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default OutdoorMaster;
