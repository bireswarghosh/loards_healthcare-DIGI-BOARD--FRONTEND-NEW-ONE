import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { DigiContext } from "../../context/DigiContext";
import { useAuth } from '../../context/AuthContext';

const AiPart = () => {
  const context = useContext(DigiContext);
  const { permissions } = useAuth();
  const aiState = context?.aiState || {};
  const toggleAiDropdown = context?.toggleAiDropdown || (() => {});
  const dropdownOpen = context?.dropdownOpen || {};
  const layoutPosition = context?.layoutPosition || {};
  const mainAiRef = context?.mainAiRef;
  const { isMainDropdownOpen = false } = aiState;

  // Hide AI section - always return null
  return null;
};

export default AiPart;
