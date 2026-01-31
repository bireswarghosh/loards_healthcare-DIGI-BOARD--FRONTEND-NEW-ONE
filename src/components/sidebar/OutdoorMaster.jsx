import React, { useContext} from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { useAuth } from '../../context/AuthContext';

const OutdoorMaster = () => {
  const { 
    outdoorMasterState,
    toggleMainOutdoorMasterDropdown,
    layoutPosition, 
    dropdownOpen,
    mainOutdoorMasterRef
  } = useContext(DigiContext);
  const { permissions, user } = useAuth();
  const { isMainDropdownOpen } = outdoorMasterState;

  // Check if user is super admin
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  // Hide entire section if no outdoorMaster permission and not super admin
  if (!isSuperAdmin && !permissions?.outdoorMaster) {
    return null;
  }

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

        {/* Parameter Setup */}
        {(isSuperAdmin || permissions?.outdoorMaster_parameterSetup !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/OutdoorParameterSetup" className="sidebar-link">
              Parameter Setup
            </NavLink>
          </li>
        )}

        {/* Service Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_service !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/ServiceMaster" className="sidebar-link">
              SERVICE
            </NavLink>
          </li>
        )}

        {/* Service Other Charge */}
        {(isSuperAdmin || permissions?.outdoorMaster_serviceOtherCharge !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/OutdoorOtherChargeMaster" className="sidebar-link">
              SERVICE OTHERCHARGE
            </NavLink>
          </li>
        )}

        {/* OT Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_otMaster !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/OTMasterOutdoor" className="sidebar-link">
              OT Master
            </NavLink>
          </li>
        )}

        {/* OT Type */}
        {(isSuperAdmin || permissions?.outdoorMaster_otType !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/OTTypeOutdoor" className="sidebar-link">
              OT Type
            </NavLink>
          </li>
        )}

        {/* OT Slot */}
        {(isSuperAdmin || permissions?.outdoorMaster_otSlot !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/OTSlotMasterOutdoor" className="sidebar-link">
              O.T. Slot Master
            </NavLink>
          </li>
        )}

        {/* Room Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_roomMaster !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/RoomMaster" className="sidebar-link">
              Room Master
            </NavLink>
          </li>
        )}

        {/* Chief Complaint */}
        {(isSuperAdmin || permissions?.outdoorMaster_chiefComplaint !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/ChiefMaster" className="sidebar-link">
              Chief Complant
            </NavLink>
          </li>
        )}

        {/* Diagnosis Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_diagnosis !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/DiagoMaster" className="sidebar-link">
              Diagnosis Master
            </NavLink>
          </li>
        )}

        {/* Past History */}
        {(isSuperAdmin || permissions?.outdoorMaster_pastHistory !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/PastHistoryMaster" className="sidebar-link">
              Past History
            </NavLink>
          </li>
        )}

        {/* Dose */}
        {(isSuperAdmin || permissions?.outdoorMaster_dose !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/DoseMaster" className="sidebar-link">
              Dose
            </NavLink>
          </li>
        )}

        {/* Advise */}
        {(isSuperAdmin || permissions?.outdoorMaster_advise !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/AdviceMaster" className="sidebar-link">
              Advise
            </NavLink>
          </li>
        )}

        {/* Visit Hour Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_visitHour !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/VisitourMaster" className="sidebar-link">
              Visit Hour Master
            </NavLink>
          </li>
        )}

        {/* Visit Type Group */}
        {(isSuperAdmin || permissions?.outdoorMaster_visitTypeGrp !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/VisitTypeGrpMaster" className="sidebar-link">
              VISIT TYPE GRP MASTER
            </NavLink>
          </li>
        )}

        {/* Visit Type */}
        {(isSuperAdmin || permissions?.outdoorMaster_visitType !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/VisitTypeMaster" className="sidebar-link">
              Visit Type Master
            </NavLink>
          </li>
        )}

        {/* Referal Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_referal !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/ReferalMasterOutdoor" className="sidebar-link">
              Referal Master
            </NavLink>
          </li>
        )}

        {/* Doctor Setup */}
        {(isSuperAdmin || permissions?.outdoorMaster_doctorSetup !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/DoctorMaster" className="sidebar-link">
              Doctor Set Up
            </NavLink>
          </li>
        )}

        {/* Staff Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_staff !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/StaffMaster" className="sidebar-link">
              Staff Master
            </NavLink>
          </li>
        )}

        {/* Medicine Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_medicine !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/MedicinMaster" className="sidebar-link">
              Medicin Master
            </NavLink>
          </li>
        )}

        {/* Cash Payment Head */}
        {(isSuperAdmin || permissions?.outdoorMaster_cashPayment !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/CashPaymentHead" className="sidebar-link">
              Cash Payment Head
            </NavLink>
          </li>
        )}

        {/* Other Charges Master */}
        {(isSuperAdmin || permissions?.outdoorMaster_otherCharges !== false) && (
          <li className="sidebar-dropdown-item">
            <NavLink to="/OutdoorOtherChargeMaster" className="sidebar-link">
              Outdoor Other Charges Master
            </NavLink>
          </li>
        )}

      </ul>
    </li>
  );
};

export default OutdoorMaster;
