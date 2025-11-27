


import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';


const Marketing = () => {
  const {
    marketingState,
    toggleMainMarketingDropdown,
    layoutPosition,
    dropdownOpen,
    mainMarketingRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = marketingState;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainMarketingRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainMarketingDropdown}
      >
Marketing
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.marketing ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      




     <li className="sidebar-dropdown-item">
          <NavLink to="/patient-actions" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">Daily Manager Activity</span>
          </NavLink>
        </li>




     <li className="sidebar-dropdown-item">
          <NavLink to="/CampingManagement" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">Camping Management</span>
          </NavLink>
        </li>


 
      </ul>
    </li>
  );
};


export default Marketing;
