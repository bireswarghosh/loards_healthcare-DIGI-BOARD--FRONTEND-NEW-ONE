import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const Marketing = () => {
  const {
    marketingState,
    toggleMainMarketingDropdown,
    layoutPosition,
    dropdownOpen,
    mainMarketingRef
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = marketingState;

  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  if (!isSuperAdmin && !permissions?.marketing) {
    return null;
  }

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




        {(isSuperAdmin || permissions?.marketing_dailyActivity !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/patient-actions" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Daily Manager Activity</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.marketing_campingManagement !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/CampingManagement" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Camping Management</span>
            </NavLink>
          </li>
        )}


 
      </ul>
    </li>
  );
};


export default Marketing;
