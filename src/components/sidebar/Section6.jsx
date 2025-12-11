import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section6 = () => {
  const { section6State, toggleMainSection6Dropdown, layoutPosition, dropdownOpen, mainSection6Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section6State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection6Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection6Dropdown}>
Section 6
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section6 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/section6-item1" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-heart"></i></span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section6-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-heart"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section6;