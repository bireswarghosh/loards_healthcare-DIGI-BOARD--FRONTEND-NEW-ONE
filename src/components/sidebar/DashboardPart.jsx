import React, { useContext } from 'react';
import { NavLink , Link} from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const DashboardPart = () => {
  const { dashState,toggleMainDashDropdown,dropdownOpen,layoutPosition,mainDashboardRef } = useContext(DigiContext);
  const { 
    isMainDropdownOpen, 
  } = dashState;
  return (
    <li className='sidebar-item open' ref={layoutPosition.horizontal? mainDashboardRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainDashDropdown}
      >
        Dashboard
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.dashboard ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>  



       <li className="sidebar-dropdown-item">
          <NavLink to="/OpdDashboard" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-stethoscope"></i>
            </span>{' '}
            <span className="sidebar-txt">OPD</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/IpdDashboard" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-bed"></i>
            </span>{' '}
            <span className="sidebar-txt">IPD</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiagnosticDashboard" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-microscope"></i>
            </span>{' '}
            <span className="sidebar-txt">Diagnostic</span>
          </NavLink>
        </li>



        
      </ul>
    </li>
  );
};

export default DashboardPart;
