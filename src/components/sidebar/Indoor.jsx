import { NavLink, Link } from 'react-router-dom';
import { useContext } from 'react';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const Indoor = () => {
  const {
    indoorState,
    toggleMainIndoorDropdown,
    layoutPosition,
    dropdownOpen,
    mainIndoorRef
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = indoorState;

  // Check if user is super admin
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  // Hide entire section if no indoor permission and not super admin
  if (!isSuperAdmin && !permissions?.indoor) {
    return null;
  }

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
        
        {/* Patient Admission List */}
        {(isSuperAdmin || permissions?.indoor_admissionList !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/PatientRegistrationList" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{' '}
              <span className="sidebar-txt">Patient Admission List</span>
            </NavLink>
          </li>
        )}

        {/* Money Receipt List */}
        {(isSuperAdmin || permissions?.indoor_moneyReceipt !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/sampleReceipts" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{' '}
              <span className="sidebar-txt">Money Receipt List</span>
            </NavLink>
          </li>
        )}

        {/* Other Charges */}
        {(isSuperAdmin || permissions?.indoor_otherCharges !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/othercharges" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{' '}
              <span className="sidebar-txt">Other Charges</span>
            </NavLink>
          </li>
        )}

        {/* OT Billing List */}
        {(isSuperAdmin || permissions?.indoor_otBillingList !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/OTBillingIpd" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{' '}
              <span className="sidebar-txt">OTBilling</span>
            </NavLink>
          </li>
        )}

    

        {/* Doctor Visit */}
        {(isSuperAdmin || permissions?.indoor_doctorVisit !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/DoctorVisit" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{' '}
              <span className="sidebar-txt">Doctor Visit</span>
            </NavLink>
          </li>
        )}

        {/* Final Bill Query */}
        {(isSuperAdmin || permissions?.indoor_finalBillQuery !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/fina-bill-list2" className="sidebar-link">
              <span className="nav-icon">
                <i className="fa-light fa-user-headset"></i>
              </span>{' '}
              <span className="sidebar-txt">Final Bill Query</span>
            </NavLink>
          </li>
        )}

      </ul>
    </li>
  );
};

export default Indoor;