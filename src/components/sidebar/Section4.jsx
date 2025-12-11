import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section4 = () => {
  const { section4State, toggleMainSection4Dropdown, layoutPosition, dropdownOpen, mainSection4Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section4State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection4Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection4Dropdown}>
Section 4
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section4 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/section4-item1" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-diamond"></i></span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section4-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-diamond"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section4;