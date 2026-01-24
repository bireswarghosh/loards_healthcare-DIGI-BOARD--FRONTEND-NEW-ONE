import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const Section2 = () => {
  const {
    section2State,
    toggleMainSection2Dropdown,
    layoutPosition,
    dropdownOpen,
    mainSection2Ref
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = section2State;

  // Check if user is super admin
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  // Hide entire section if no userManagement permission and not super admin
  if (!isSuperAdmin && !permissions?.userManagement) {
    return null;
  }

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection2Ref : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainSection2Dropdown}
      >
        Setting
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section2 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

        {/* Show User Management link for super admin or users with permission */}
        {(isSuperAdmin || permissions?.userManagement_users !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/user-management" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-users"></i>
              </span>{" "}
              <span className="sidebar-txt">User Management</span>
            </NavLink>
          </li>
        )}

        {/* Show Access Control link for super admin or users with permission */}
        {(isSuperAdmin || permissions?.userManagement_access !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/access-control" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-shield-check"></i>
              </span>{" "}
              <span className="sidebar-txt">Access Control</span>
            </NavLink>
          </li>
        )}

      </ul>
    </li>
  );
};

export default Section2;