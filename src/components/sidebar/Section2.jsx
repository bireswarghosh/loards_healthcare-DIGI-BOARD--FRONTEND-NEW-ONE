import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section2 = () => {
  const {
    section2State,
    toggleMainSection2Dropdown,
    layoutPosition,
    dropdownOpen,
    mainSection2Ref
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = section2State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection2Ref : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainSection2Dropdown}
      >
Section 2
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section2 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

     <li className="sidebar-dropdown-item">
          <NavLink to="/section2-item1" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-square"></i>
            </span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>

     <li className="sidebar-dropdown-item">
          <NavLink to="/section2-item2" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-square"></i>
            </span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default Section2;