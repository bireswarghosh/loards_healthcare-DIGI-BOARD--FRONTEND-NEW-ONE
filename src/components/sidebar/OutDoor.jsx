import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const OutDoor = () => {
  const {
    outdoorState,
    toggleMainOutdoorDropdown,
    layoutPosition,
    dropdownOpen,
    mainOutdoorRef
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = outdoorState;

  // Check if user is super admin
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  // Hide entire section if no outdoor permission and not super admin
  if (!isSuperAdmin && !permissions?.outdoor) {
    return null;
  }

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

        {/* Visit Entry */}
        {(isSuperAdmin || permissions?.outdoor_visitEntry !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/visit_entry" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Visit Entry</span>
            </NavLink>
          </li>
        )}

        {/* Visit List */}
        {(isSuperAdmin || permissions?.outdoor_visitList !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/table-data" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Visit List</span>
            </NavLink>
          </li>
        )}

        {/* Dr Rect Visit Detail */}
        {(isSuperAdmin || permissions?.outdoor_drRectVisit !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dr-rect-visit-detail" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Dr Rect Visit Detail</span>
            </NavLink>
          </li>
        )}

        {/* EMR */}
        {(isSuperAdmin || permissions?.outdoor_emr !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/emr" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">EMR</span>
            </NavLink>
          </li>
        )}

        {/* Other Charge */}
        {(isSuperAdmin || permissions?.outdoor_otherCharge !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/Opd_Other_Charges" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Other Charge</span>
            </NavLink>
          </li>
        )}

        {/* IVF Biodata */}
        {(isSuperAdmin || permissions?.outdoor_ivfBiodata !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="IVFBiodataMaster" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">IVFBiodataMASTER</span>
            </NavLink>
          </li>
        )}
      </ul>
    </li>
  );
};

export default OutDoor;
