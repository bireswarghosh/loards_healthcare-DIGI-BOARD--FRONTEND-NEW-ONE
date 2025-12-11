import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section10 = () => {
  const { section10State, toggleMainSection10Dropdown, layoutPosition, dropdownOpen, mainSection10Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section10State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection10Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection10Dropdown}>
Section 10
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section10 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/section10-item1" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-chart-line"></i></span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section10-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-chart-line"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section10;