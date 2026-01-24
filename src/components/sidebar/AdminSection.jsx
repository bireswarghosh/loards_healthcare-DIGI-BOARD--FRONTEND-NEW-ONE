import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const AdminSection = () => {
  const {
    adminSectionState,
    toggleMainAdminSectionDropdown,
    layoutPosition,
    dropdownOpen,
    mainAdminSectionRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = adminSectionState;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainAdminSectionRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainAdminSectionDropdown}
      >
        Admin
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.adminSection ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

        <li className="sidebar-dropdown-item">
          <NavLink to="/user-management" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-users"></i>
            </span>{" "}
            <span className="sidebar-txt">User Management</span>
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default AdminSection;
