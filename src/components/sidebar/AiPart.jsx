import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { DigiContext } from "../../context/DigiContext";
import { useAuth } from '../../context/AuthContext';

const AiPart = () => {
  const context = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const aiState = context?.aiState || {};
  const toggleAiDropdown = context?.toggleAiDropdown || (() => {});
  const mainAiRef = context?.mainAiRef;
  const { isMainDropdownOpen = false } = aiState;

  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';

  // Hide entire section if no ai permission and not super admin
  if (!isSuperAdmin && permissions?.ai === false) {
    return null;
  }

  return (
    <li className="sidebar-item" ref={mainAiRef}>
      <a
        role="button"
        className={`sidebar-link ${isMainDropdownOpen ? "active" : ""}`}
        onClick={toggleAiDropdown}
      >
        <i className="fa-light fa-robot"></i>
        <span className="sidebar-txt">AI Features</span>
      </a>
      <ul
        className={`sidebar-dropdown-menu ${isMainDropdownOpen ? "show" : ""}`}
        style={{ display: isMainDropdownOpen ? "block" : "none" }}
      >
        {(isSuperAdmin || permissions?.ai_appointmentHistory !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiAppointmentHistory" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-history"></i></span>
              <span className="sidebar-txt">Appointment History (Admin)</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_userChat !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiUserChat" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-robot"></i></span>
              <span className="sidebar-txt">AI Assistance</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_userBookings !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/userAiBookings" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-user-check"></i></span>
              <span className="sidebar-txt">My Appointments</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_doctorChat !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiDoctorChat" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-user-doctor"></i></span>
              <span className="sidebar-txt">AI Chat (Doctor)</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_prescription !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiPrescription" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-prescription"></i></span>
              <span className="sidebar-txt">Prescription</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_medicalImaging !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiMedicalImaging" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-file-medical"></i></span>
              <span className="sidebar-txt">Medical Imaging</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_treatmentPlan !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiTreatmentPlan" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-clipboard-list"></i></span>
              <span className="sidebar-txt">Treatment Plan</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_drugInteraction !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiDrugInteraction" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-pills"></i></span>
              <span className="sidebar-txt">Drug Interaction</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_healthAnalytics !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiHealthAnalytics" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-chart-mixed"></i></span>
              <span className="sidebar-txt">Health Analytics</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_scribe !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiScribe" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-notes-medical"></i></span>
              <span className="sidebar-txt">Clinical Scribe</span>
            </NavLink>
          </li>
        )}

        {(isSuperAdmin || permissions?.ai_settings !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/aiSettings" className="sidebar-link">
              <span className="nav-icon"><i className="fa-light fa-cog"></i></span>
              <span className="sidebar-txt">Settings</span>
            </NavLink>
          </li>
        )}
      </ul>
    </li>
  );
};

export default AiPart;
