import React, { useContext } from 'react';
import { NavLink , Link} from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const DashboardPart = () => {
  const { dashState,toggleMainDashDropdown,dropdownOpen,layoutPosition,mainDashboardRef } = useContext(DigiContext);
  const { 
    isMainDropdownOpen, 
  } = dashState;
  return (
    <li className='sidebar-item open' ref={layoutPosition.horizontal? mainDashboardRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainDashDropdown}
      >
        Dashboard
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.dashboard ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>       
       <li className="sidebar-dropdown-item">
          <NavLink to="/" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-cart-shopping-fast"></i>
            </span>{' '}
            <span className="sidebar-txt">eCommerce</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink
            to="/crmDashboard"
            className="sidebar-link"
          >
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">CRM</span>
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink
            to="/hrmDashboard"
            className="sidebar-link"
          >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">HRM</span>
          </NavLink>
        </li>




{/* //!  castom  route */}

  <li className="sidebar-dropdown-item">
          <NavLink
            to="/DoctorVisit"
            className="sidebar-link"
          >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">DoctorVisit</span>
          </NavLink>
        </li>
<li className="sidebar-dropdown-item">
          <NavLink
            to="/DiagBooking"
            className="sidebar-link"
          >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">DiagBooking</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink
            to="/TestReportingSequence"
            className="sidebar-link"
          >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">TestReportingSequence</span>
          </NavLink>
        </li>
        
<li className="sidebar-dropdown-item">
          <NavLink
            to="/TestPropertyGroup"
            className="sidebar-link"
          >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">TestPropertyGroup</span>
          </NavLink>
        </li>


<li className="sidebar-dropdown-item">
          <NavLink             to="/AgentBusiness"             className="sidebar-link"           >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">AgentBusiness</span>
          </NavLink>
        </li>

        
<li className="sidebar-dropdown-item">
          <NavLink  to="/AgentForm"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">AgentForm</span>
          </NavLink>
        </li>
         
         <li className="sidebar-dropdown-item">
          <NavLink  to="/DoctorBusiness"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">DoctorBusiness</span>
          </NavLink>
        </li>
           <li className="sidebar-dropdown-item">
          <NavLink  to="/DiagBookingList"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">DiagBookingList</span>
          </NavLink>
        </li>
        
         <li className="sidebar-dropdown-item">
          <NavLink  to="/CompanyTestRateSetup"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">CompanyTestRateSetup</span>
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink  to="/DueOnAccount"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">DueOnAccount</span>
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink  to="/ItemMaster"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">ItemMaster</span>
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink  to="/LaboratoryQuery"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">LaboratoryQuery</span>
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink  to="/OpeningBalanceItem"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">OpeningBalanceItem</span>
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink  to="/PathologistSignatory"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">PathologistSignatory</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink  to="/RadiologyRequisition"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">RadiologyRequisition</span>
          </NavLink>
        </li>

 <li className="sidebar-dropdown-item">
          <NavLink  to="/RadiologyRequisitionDetail"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">Radiology Requisition Detail</span>
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink  to="/SubDepartment"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">Sub Department</span>
          </NavLink>
        </li>
        

        <li className="sidebar-dropdown-item">
          <NavLink  to="/SpecialProperty"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">Special Property</span>
          </NavLink>
        </li>

        
        <li className="sidebar-dropdown-item">
          <NavLink  to="/SampleCollection"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">Sample Collection</span>
          </NavLink>
        </li>
        
<li className="sidebar-dropdown-item">
          <NavLink  to="/SampleCollectionDetails"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">Sample Collection Details</span>
          </NavLink>
        </li>

<li className="sidebar-dropdown-item">
          <NavLink  to="/ReceptionReporting"    className="sidebar-link" >
            <span className="nav-icon">
              <i className="fa-light fa-user-tie"></i>
            </span>{' '}
            <span className="sidebar-txt">Reception Reporting</span>
          </NavLink>
        </li>


      </ul>
    </li>
  );
};

export default DashboardPart;
