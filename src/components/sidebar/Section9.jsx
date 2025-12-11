import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section9 = () => {
  const { section9State, toggleMainSection9Dropdown, layoutPosition, dropdownOpen, mainSection9Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section9State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection9Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection9Dropdown}>
Section 9
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section9 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/section9-item1" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-folder"></i></span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section9-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-folder"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section9;