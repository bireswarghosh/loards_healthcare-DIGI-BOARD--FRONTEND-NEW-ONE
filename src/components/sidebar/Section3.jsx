import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section3 = () => {
  const { section3State, toggleMainSection3Dropdown, layoutPosition, dropdownOpen, mainSection3Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section3State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection3Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection3Dropdown}>
Section 3
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section3 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      
     <li className="sidebar-dropdown-item">
          <NavLink to="/" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Admission Register
</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/date-wise-registration-charge

" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Datewise Admision Register


</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/discharge-pateint-reg" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Discharge Patient Register
</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/datawise-moneyreceipt  
" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Datewise Money Receipt
</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/section3-item2" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Item 2</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section3;