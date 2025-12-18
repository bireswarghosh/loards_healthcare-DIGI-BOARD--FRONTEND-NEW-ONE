import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';

const OutdoorMaster = () => {
  const { 
    outdoorMasterState,
    toggleMainOutdoorMasterDropdown,
    layoutPosition, 
    dropdownOpen,
    mainOutdoorMasterRef
  } = useContext(DigiContext);
  const { isMainDropdownOpen } = outdoorMasterState;

  return (
    <li className="sidebar-item" ref={layoutPosition.horizontal ? mainOutdoorMasterRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainOutdoorMasterDropdown}
      >
        Outdoor Master
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.outdoorMaster ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>       

        <li className="sidebar-dropdown-item">
          <NavLink to="/OutdoorParameterSetup" className="sidebar-link">
            Parameter Setup
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ServiceMaster" className="sidebar-link">
            SERVICE
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ServiceOtherCharge" className="sidebar-link">
            SERVICE OTHERCHARGE
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/OTMaster" className="sidebar-link">
            OT Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/OTType" className="sidebar-link">
            OT Type
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/OTSlotMaster" className="sidebar-link">
            O.T. Slot Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/RoomNoMaster" className="sidebar-link">
            Room Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ChiefMaster" className="sidebar-link">
            Chief Complant
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiagoMaster" className="sidebar-link">
            Diagnosis Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/PastHistoryMaster" className="sidebar-link">
            Past History
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DoseMaster" className="sidebar-link">
            Dose
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/AdviceMaster" className="sidebar-link">
            Advise
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisitHourMaster" className="sidebar-link">
            Visit Hour Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisitTypeGrpMaster" className="sidebar-link">
            VISIT TYPE GRP MASTER
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisittypeMaster" className="sidebar-link">
            Visit Type Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ReferalMaster" className="sidebar-link">
            Referal Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DoctorSetup" className="sidebar-link">
            Doctor Set Up
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/StaffMaster" className="sidebar-link">
            Staff Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/MedicinMaster" className="sidebar-link">
            Medicin Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/CashPaymentHead" className="sidebar-link">
            Cash Payment Head
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/OutdoorOtherChargeMaster" className="sidebar-link">
            Outdoor Other Charges Master
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default OutdoorMaster;
