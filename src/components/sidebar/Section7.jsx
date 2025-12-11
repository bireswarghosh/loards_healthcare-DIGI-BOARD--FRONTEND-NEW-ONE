import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section7 = () => {
  const { section7State, toggleMainSection7Dropdown, layoutPosition, dropdownOpen, mainSection7Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section7State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection7Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection7Dropdown}>
Section 7
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section7 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/section7-item1" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-bell"></i></span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section7-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-bell"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section7;