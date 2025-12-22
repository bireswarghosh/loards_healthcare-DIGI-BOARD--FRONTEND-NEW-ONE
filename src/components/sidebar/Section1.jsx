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
Diagnosis
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.section1 ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>      

     {/* <li className="sidebar-dropdown-item">
          <NavLink to="/section1-item1" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-circle"></i>
            </span>{" "}
            <span className="sidebar-txt">Item 1</span>
          </NavLink>
        </li> */}







   <li className="sidebar-dropdown-item">
          <NavLink to="/CaseList" className="sidebar-link">
            Case Entry 
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink to="/moneyreceipt" className="sidebar-link">
            Money Receipt
          </NavLink>
        </li>



<li className="sidebar-dropdown-item">
          <NavLink to="/LaboratoryQuery" className="sidebar-link">
     Laboratory Query
          </NavLink>
        </li>




<li className="sidebar-dropdown-item">
          <NavLink to="/lab_query" className="sidebar-link">
            Download
          </NavLink>
        </li>




<li className="sidebar-dropdown-item">
          <NavLink to="/DiagBooking" className="sidebar-link">
            Booking
          </NavLink>
        </li>




<li className="sidebar-dropdown-item">
          <NavLink to="/lab_query" className="sidebar-link">
            OPD
          </NavLink>
        </li>




<li className="sidebar-dropdown-item">
          <NavLink to="/SampleCollection" className="sidebar-link">
            Sample Collection
          </NavLink>
        </li>





<li className="sidebar-dropdown-item">
          <NavLink to="/lab_query" className="sidebar-link">
            Add Ins
          </NavLink>
        </li>





<li className="sidebar-dropdown-item">
          <NavLink to="/lab_query" className="sidebar-link">
          Pos
          </NavLink>
        </li>






<li className="sidebar-dropdown-item">
          <NavLink to="/RadiologyRequisition" className="sidebar-link">
            Readiology Requiaition
          </NavLink>
        </li>








    

      </ul>
    </li>
  );
};

export default Section1;