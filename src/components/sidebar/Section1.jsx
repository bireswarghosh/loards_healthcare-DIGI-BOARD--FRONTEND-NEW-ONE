import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section1 = () => {
  const {
    section1State,
    toggleMainSection1Dropdown,
    layoutPosition,
    dropdownOpen,
    mainSection1Ref
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = section1State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection1Ref : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainSection1Dropdown}
      >
diagnosis
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section1 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

     <li className="sidebar-dropdown-item">
          <NavLink to="/section1-item1" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-circle"></i>
            </span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>

     <li className="sidebar-dropdown-item">
          <NavLink to="/section1-item2" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-circle"></i>
            </span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default Section1;