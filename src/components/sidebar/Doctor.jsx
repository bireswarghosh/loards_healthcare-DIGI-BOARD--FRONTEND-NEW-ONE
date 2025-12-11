import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Doctor = () => {
  const { isNavExpanded, layoutPosition } = useContext(DigiContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li className={`sidebar-item ${isOpen ? 'open' : ''}`}>
      <a 
        href="#" 
        className="sidebar-link has-sub" 
        onClick={(e) => {
          e.preventDefault();
          toggleDropdown();
        }}
      >
        <span className="nav-icon">
          <i className="fa-light fa-user-doctor"></i>
        </span>
        <span className="sidebar-txt">Doctor Section</span>
        <span className="sidebar-arrow">
          <i className="fa-regular fa-angle-right"></i>
        </span>
      </a>
      <ul className={`sidebar-dropdown-menu ${isOpen ? 'open' : ''}`}>
        <li className="sidebar-dropdown-item">
          <Link to="/active-doctors" className="sidebar-link">
            Active Doctors
          </Link>
        </li>
        <li className="sidebar-dropdown-item">
          <Link to="/department" className="sidebar-link">
            Department
          </Link>
        </li>
        <li className="sidebar-dropdown-item">
          <Link to="/doctor" className="sidebar-link">
            Doctor
          </Link>
        </li>
        <li className="sidebar-dropdown-item">
          <Link to="/doctor-wise-appointments" className="sidebar-link">
            Doctor Wise Appointments
          </Link>
        </li>
      </ul>
    </li>
  );
};

export default Doctor;