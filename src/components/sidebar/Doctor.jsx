import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Doctor = () => {
  const {
    doctorState,
    toggleMainDoctorDropdown,
    layoutPosition,
    dropdownOpen,
    mainDoctorRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = doctorState;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainDoctorRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainDoctorDropdown}
      >
Doctor Section
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.doctor ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

     <li className="sidebar-dropdown-item">
          <NavLink to="/active-doctors" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-doctor"></i>
            </span>{" "}
            <span className="sidebar-txt">Active Doctors</span>
          </NavLink>
        </li>

     <li className="sidebar-dropdown-item">
          <NavLink to="/department" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-building"></i>
            </span>{" "}
            <span className="sidebar-txt">Department</span>
          </NavLink>
        </li>

     <li className="sidebar-dropdown-item">
          <NavLink to="/doctor" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-stethoscope"></i>
            </span>{" "}
            <span className="sidebar-txt">Doctor</span>
          </NavLink>
        </li>

     <li className="sidebar-dropdown-item">
          <NavLink to="/doctor-wise-appointments" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-calendar-check"></i>
            </span>{" "}
            <span className="sidebar-txt">Doctor Wise Appointments</span>
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default Doctor;