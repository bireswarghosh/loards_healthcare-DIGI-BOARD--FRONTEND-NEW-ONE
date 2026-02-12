import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const Doctor = () => {
  const {
    doctorState,
    toggleMainDoctorDropdown,
    layoutPosition,
    dropdownOpen,
    mainDoctorRef
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = doctorState;

  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  if (!isSuperAdmin && !permissions?.doctor) {
    return null;
  }

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

        {(isSuperAdmin || permissions?.doctor_activeDoctors !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/active-doctors" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-doctor"></i>
              </span>{" "}
              <span className="sidebar-txt">Active Doctors</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.doctor_department !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/department" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-building"></i>
              </span>{" "}
              <span className="sidebar-txt">Department</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.doctor_doctor !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/doctor" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-stethoscope"></i>
              </span>{" "}
              <span className="sidebar-txt">Doctor</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.doctor_appointments !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/doctor-wise-appointments" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-calendar-check"></i>
              </span>{" "}
              <span className="sidebar-txt">Doctor Wise Appointments</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.doctor_speciality !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/SpecialityMaster" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-star"></i>
              </span>{" "}
              <span className="sidebar-txt">Speciality Master</span>
            </NavLink>
          </li>
        )}

      </ul>
    </li>
  );
};

export default Doctor;