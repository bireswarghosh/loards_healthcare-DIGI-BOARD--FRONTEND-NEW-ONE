


import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';


const OutDoor = () => {
  const {
    outdoorState,
    toggleMainOutdoorDropdown,
    layoutPosition,
    dropdownOpen,
    mainOutdoorRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = outdoorState;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainOutdoorRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainOutdoorDropdown}
      >
       Outdoor(OPD)
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.outdoor ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

        {/* visit entry */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/visit_entry" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">Visit Entry</span>
          </NavLink>
        </li>

        {/* visit list */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/table-data" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">Visit List</span>
          </NavLink>
        </li>

        {/* Dr Rect visit detail */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/dr-rect-visit-detail" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">Dr Rect Visit Detail</span>
          </NavLink>
        </li>

        {/* emr */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/emr" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">EMR</span>
          </NavLink>
        </li>

        {/* other charge */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/other_charges" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">Other Charge</span>
          </NavLink>
        </li>

        {/* ivf bio data master */}
        <li className="sidebar-dropdown-item">
          <NavLink to="IVFBiodataMaster" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{" "}
            <span className="sidebar-txt">IVFBiodataMASTER</span>
          </NavLink>
        </li>


 
      </ul>
    </li>
  );
};


export default OutDoor;
