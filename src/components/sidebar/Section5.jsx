import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section5 = () => {
  const { section5State, toggleMainSection5Dropdown, layoutPosition, dropdownOpen, mainSection5Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section5State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection5Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection5Dropdown}>
Section 5
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section5 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/section5-item1" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-star"></i></span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section5-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-star"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section5;