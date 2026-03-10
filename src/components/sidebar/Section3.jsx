import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const Section3 = () => {
  const { section3State, toggleMainSection3Dropdown, layoutPosition, dropdownOpen, mainSection3Ref } = useContext(DigiContext);
  const { isMainDropdownOpen } = section3State;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainSection3Ref : null}>
      <Link role="button" className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`} onClick={toggleMainSection3Dropdown}>
Indoor Report
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section3 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

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
          <NavLink to="/dateWiseFinalBillRegPdf" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Final Bill Register</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/dateWiseOtherChargesReg" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Other Charges Register</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/dateWiseFinalBillOtherChargesReg" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Other Charges Detail</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/dateWiseDrChargesDetailPdf" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Dr.Charges Detail</span>
          </NavLink>
        </li>
     <li className="sidebar-dropdown-item">
          <NavLink to="/dateWiseBedChargesPdf" className="sidebar-link">
            <span className="nav-icon"><i className="fa-light fa-triangle"></i></span>{" "}
            <span className="sidebar-txt">Bed Charges</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default Section3;