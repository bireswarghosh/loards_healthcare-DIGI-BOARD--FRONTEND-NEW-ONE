import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { DigiContext } from "../../context/DigiContext";

const AiPart = () => {
  const context = useContext(DigiContext);
  const aiState = context?.aiState || {};
  const toggleAiDropdown = context?.toggleAiDropdown || (() => {});
  const dropdownOpen = context?.dropdownOpen || {};
  const layoutPosition = context?.layoutPosition || {};
  const mainAiRef = context?.mainAiRef;
  const { isMainDropdownOpen = false } = aiState;
  return (
    <li
      className="sidebar-item open"
      ref={layoutPosition.horizontal ? mainAiRef : null}
    >
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${
          isMainDropdownOpen ? "show" : ""
        }`}
        onClick={toggleAiDropdown}
      >
        AI
      </Link>
      <ul
        className={`sidebar-link-group ${
          layoutPosition.horizontal
            ? dropdownOpen.ai
              ? "d-block"
              : ""
            : isMainDropdownOpen
            ? "d-none"
            : ""
        }`}
      >
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiAppointmentHistory" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-history"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Appointment History (Admin)</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/aiUserChat" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-robot"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Assistance</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/userAiBookings" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-check"></i>
            </span>{" "}
            <span className="sidebar-txt">My Appointments</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiDoctorChat" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-doctor"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Chat (Doctor)</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiPrescription" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-prescription"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Prescription</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiMedicalImaging" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-file-medical"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Medical Imaging</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiTreatmentPlan" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-clipboard-list"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Treatment Plan</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiDrugInteraction" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-pills"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Drug Interaction</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiHealthAnalytics" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-chart-mixed"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Health Analytics</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiScribe" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-notes-medical"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Clinical Scribe</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/aiSettings" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-cog"></i>
            </span>{" "}
            <span className="sidebar-txt">AI Settings</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default AiPart;
