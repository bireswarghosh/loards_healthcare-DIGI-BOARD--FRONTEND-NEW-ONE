import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const WhatsAppAPISection = () => {
  const { whatsappState, toggleWhatsAppDropdown, layoutPosition, dropdownOpen, whatsappRef } = useContext(DigiContext);
  const { isMainDropdownOpen } = whatsappState || { isMainDropdownOpen: false };

  return (
    <li className="sidebar-item" ref={layoutPosition?.horizontal ? whatsappRef : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleWhatsAppDropdown}>
        <span className="nav-icon"><i className="fa-brands fa-whatsapp"></i></span>
        <span className="sidebar-txt">WhatsApp API</span>
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition?.horizontal ? (dropdownOpen?.whatsapp ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-text" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-message"></i></span>
            <span className="sidebar-txt">Send Text</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-media" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-image"></i></span>
            <span className="sidebar-txt">Send Media</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-button" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-square-check"></i></span>
            <span className="sidebar-txt">Send Button</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-poll" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-poll"></i></span>
            <span className="sidebar-txt">Send Poll</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-list" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-list"></i></span>
            <span className="sidebar-txt">Send List</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-location" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-location-dot"></i></span>
            <span className="sidebar-txt">Send Location</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-vcard" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-address-card"></i></span>
            <span className="sidebar-txt">Send VCard</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-sticker" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-face-smile"></i></span>
            <span className="sidebar-txt">Send Sticker</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-product" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-bag-shopping"></i></span>
            <span className="sidebar-txt">Send Product</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/send-channel" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-bullhorn"></i></span>
            <span className="sidebar-txt">Send to Channel</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/check-number" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-phone-check"></i></span>
            <span className="sidebar-txt">Check Number</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/user-management" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-users"></i></span>
            <span className="sidebar-txt">User Management</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/whatsapp/device-management" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-mobile"></i></span>
            <span className="sidebar-txt">Device Management</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default WhatsAppAPISection;
