


import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosInstance';

const OutDoor = () => {
  const {
    outdoorState,
    toggleMainOutdoorDropdown,
    layoutPosition,
    dropdownOpen,
    mainOutdoorRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = outdoorState;
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const username = user?.username || localStorage.getItem('username');

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.userId) {
        try {
          const response = await axiosInstance.get(`/auth/users/${user.userId}/permissions`);
          if (response.data.success) {
            setPermissions(response.data.data);
          }
        } catch (err) {
          console.log('No permissions');
        }
      }
    };
    fetchPermissions();
  }, [user]);

  const canView = (section) => {
    if (username === 'lords') return true;
    if (!permissions) return true;
    return permissions[section] !== false;
  };

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

        {canView('outdoor_visitEntry') && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/visit_entry" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Visit Entry</span>
            </NavLink>
          </li>
        )}

        {canView('outdoor_visitList') && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/table-data" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Visit List</span>
            </NavLink>
          </li>
        )}

        {canView('outdoor_drRectVisit') && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/dr-rect-visit-detail" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Dr Rect Visit Detail</span>
            </NavLink>
          </li>
        )}

        {canView('outdoor_emr') && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/emr" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">EMR</span>
            </NavLink>
          </li>
        )}

        {canView('outdoor_otherCharge') && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/Opd_Other_Charges" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{" "}
              <span className="sidebar-txt">Other Charge</span>
            </NavLink>
          </li>
        )}

        {canView('outdoor_ivfBiodata') && (
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
