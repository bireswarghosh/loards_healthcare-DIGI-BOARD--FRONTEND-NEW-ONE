import { NavLink, Link } from 'react-router-dom';
import { useContext } from 'react';
import { DigiContext } from '../../context/DigiContext';

const Indoor = () => {
  const {
    indoorState,
    toggleMainIndoorDropdown,
    layoutPosition,
    dropdownOpen,
    mainIndoorRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = indoorState;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainIndoorRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainIndoorDropdown}
      >
        Indoor(IPD)
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.indoor ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>       
        
     
     
        <li className="sidebar-dropdown-item">
          <NavLink to="/PatientRegistrationList" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Patient Admission List</span>
          </NavLink>
        </li>

        {/* <li className="sidebar-dropdown-item">
          <NavLink to="/PatientAdmissionDetail" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Patient Admission Detail</span>
          </NavLink>
        </li> */}

        <li className="sidebar-dropdown-item">
          <NavLink to="/sampleReceipts" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Money Receipt List</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/othercharges" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Other Charges</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTBillingList" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">OTBilling List</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTBillingDetail" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">OT Billing Detail</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OTNoteProcedure" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">OT Note Procedure</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DoctorVisit" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Doctor Visit</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/BedTransfer" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Bed Transfer</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Estimate" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Estimate</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DischargeAndAdvise" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Discharge Advise</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DischargeAndAdvise_details" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Discharge And Advise</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DischargeAdvise" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Advise</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DischargeMrd" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Discharge MRD</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/FinalBillQuery" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Final Bill Query</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/FinalBillingDetail" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Final Billing Detail</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/FinalBillingList" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Final Billing List</span>
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/PatientEnquiryDetail" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-user-headset"></i>
            </span>{' '}
            <span className="sidebar-txt">Patient Enquiry Detail</span>
          </NavLink>
        </li></ul>
    </li>
  );
};

export default Indoor;