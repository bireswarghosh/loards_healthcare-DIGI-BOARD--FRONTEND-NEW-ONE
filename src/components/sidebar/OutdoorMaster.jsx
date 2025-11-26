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
            Outdoor Parameter Setup
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ServiceMaster" className="sidebar-link">
            Service Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/OutdoorOtherChargeMaster" className="sidebar-link">
            Outdoor Other Charge Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/RoomNoMaster" className="sidebar-link">
            Room No Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisitTypeGrpMaster" className="sidebar-link">
            Visit Type Group Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/ChiefMaster" className="sidebar-link">
            Chief Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiagoMaster" className="sidebar-link">
            Diagnosis Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/PastHistoryMaster" className="sidebar-link">
            Past History Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DoseMaster" className="sidebar-link">
            Dose Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/AdviceMaster" className="sidebar-link">
            Advice Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisitourMaster" className="sidebar-link">
            Visitor Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisittypegrpMaster" className="sidebar-link">
            Visit Type Group Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/VisittypeMaster" className="sidebar-link">
            Visit Type Master
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanymstMaster" className="sidebar-link">
            Company Master
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default OutdoorMaster;
