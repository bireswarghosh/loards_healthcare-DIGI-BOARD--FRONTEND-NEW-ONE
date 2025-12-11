import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section8 = () => {
  const { section8State, toggleMainSection8Dropdown, layoutPosition, dropdownOpen, mainSection8Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section8State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection8Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection8Dropdown}>
Section 8
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section8 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/section8-item1" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-gear"></i></span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section8-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-gear"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section8;