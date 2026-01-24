import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { DigiContext } from "../../context/DigiContext";
import { useAuth } from '../../context/AuthContext';

const BookingApp = () => {
  const {
    bookingAppState,
    toggleMainBookingAppDropdown,
    dropdownOpen,
    layoutPosition,
    mainBookingAppRef
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = bookingAppState;

  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  if (!isSuperAdmin && !permissions?.bookingApp) {
    return null;
  }

  return (
    <li
      className="sidebar-item"
      ref={layoutPosition.horizontal ? mainBookingAppRef : null}
    >
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${
          isMainDropdownOpen ? "show" : ""
        }`}
        onClick={toggleMainBookingAppDropdown}
      >
        Booking App
      </Link>

      <ul
        className={`sidebar-link-group ${
          layoutPosition.horizontal
            ? dropdownOpen.bookingApp
              ? "d-block"
              : ""
            : isMainDropdownOpen
            ? "d-none"
            : ""
        }`}
      >
        {/* ---------------- MENU START ---------------- */}

        {(isSuperAdmin || permissions?.bookingApp_patientList !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/Patient-list" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-users"></i>
              </span>
              <span className="sidebar-txt">All Patient List</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_ambulanceCategory !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/ambulance-list" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-ambulance"></i>
              </span>
              <span className="sidebar-txt">Ambulance Category</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_ambulanceBooking !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/pickup-requests" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-truck-medical"></i>
              </span>
              <span className="sidebar-txt">Ambulance Booking Requests</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_nursingCareCategory !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/nurshing_care" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-nurse"></i>
              </span>
              <span className="sidebar-txt">Nursing Care Category</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_nursingBooking !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/nursing-bookings" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-file-medical"></i>
              </span>
              <span className="sidebar-txt">Nursing Booking</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_diagnosticBookings !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/DiagnosticBookingList" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-microscope"></i>
              </span>
              <span className="sidebar-txt">Diagnostic Bookings</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_packageBooking !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/PackageManagement" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-box"></i>
              </span>
              <span className="sidebar-txt">Package Booking List</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_prescriptionDelivery !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/prescription-delivery" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-prescription-bottle-medical"></i>
              </span>
              <span className="sidebar-txt">Prescription Delivery</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_genericMedicine !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/GenericMedicineManagement" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-capsules"></i>
              </span>
              <span className="sidebar-txt">Generic Medicine Management</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_razorpaySettings !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/razorpay-settings" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-credit-card"></i>
              </span>
              <span className="sidebar-txt">Razorpay Settings</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_appTerms !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/app-terms-settings" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-file-lines"></i>
              </span>
              <span className="sidebar-txt">App Terms & Conditions</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_appBanner !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/app-banner-settings" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-image"></i>
              </span>
              <span className="sidebar-txt">App Banner Management</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.bookingApp_socialMedia !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/app-social-media-settings" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-share-nodes"></i>
              </span>
              <span className="sidebar-txt">Social Media Management</span>
            </NavLink>
          </li>
        )}

        {/* ---------------- MENU END ---------------- */}
      </ul>
    </li>
  );
};

export default BookingApp;