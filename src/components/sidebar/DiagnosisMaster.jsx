// import React, { useContext } from 'react';
// import { NavLink, Link } from 'react-router-dom';
// import { DigiContext } from '../../context/DigiContext';

// const DiagnosisMaster = () => {

//   const { 
//     diagnosisMasterState,
//     toggleMainDiagnosisMasterDropdown,
//     layoutPosition,
//     dropdownOpen,
//     mainDiagnosisMasterRef
//   } = useContext(DigiContext);

//   const { isMainDropdownOpen } = diagnosisMasterState;

//   return (
//     <li
//       className="sidebar-item"
//       ref={layoutPosition.horizontal ? mainDiagnosisMasterRef : null}
//     >
//       {/* MAIN TITLE */}
//       <Link
//         role="button"
//         className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? "show" : ""}`}
//         onClick={toggleMainDiagnosisMasterDropdown}
//       >
//         Diagnosis Master
//       </Link>

//       {/* SUB MENU */}
//       <ul
//         className={`sidebar-link-group ${
//           layoutPosition.horizontal
//             ? dropdownOpen.diagnosisMaster
//               ? "d-block"
//               : ""
//             : isMainDropdownOpen
//             ? "d-none"
//             : ""
//         }`}
//       >

//         <li className="sidebar-dropdown-item">
//           <NavLink to="/GodownMaster" className="sidebar-link">
//             Godown Management
//           </NavLink>
//         </li>

//         <li className="sidebar-dropdown-item">
//           <NavLink to="/CategoryMaster" className="sidebar-link">
//             Category Management
//           </NavLink>
//         </li>

//         <li className="sidebar-dropdown-item">
//           <NavLink to="/ItemGroupMaster" className="sidebar-link">
//             Item Group Management
//           </NavLink>
//         </li>

//         <li className="sidebar-dropdown-item">
//           <NavLink to="/RemarksMaster" className="sidebar-link">
//             Remarks
//           </NavLink>
//         </li>

//         <li className="sidebar-dropdown-item">
//           <NavLink to="/CultureMedicine" className="sidebar-link">
//             Culture Medicine
//           </NavLink>
//         </li>

//         <li className="sidebar-dropdown-item">
//           <NavLink to="/Test" className="sidebar-link">
//             Test
//           </NavLink>
//         </li>

//       </ul>
//     </li>
//   );
// };

// export default DiagnosisMaster;







import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { DigiContext } from "../../context/DigiContext";

const DiagnosisMaster = () => {
  const {
    diagnosisMasterState,
    toggleMainDiagnosisMasterDropdown,
    layoutPosition,
    dropdownOpen,
    mainDiagnosisMasterRef,
  } = useContext(DigiContext);

  const { isMainDropdownOpen } = diagnosisMasterState;

  return (
    <li
      className="sidebar-item"
      ref={layoutPosition.horizontal ? mainDiagnosisMasterRef : null}
    >
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${
          isMainDropdownOpen ? "show" : ""
        }`}
        onClick={toggleMainDiagnosisMasterDropdown}
      >
        Diagnosis Master
      </Link>

      <ul
        className={`sidebar-link-group ${
          layoutPosition.horizontal
            ? dropdownOpen.diagnosisMaster
              ? "d-block"
              : ""
            : isMainDropdownOpen
            ? "d-none"
            : ""
        }`}
      >


    <li className="sidebar-dropdown-item">
          <NavLink to="/DiagnosticParameterSetup" className="sidebar-link">
          Diagnostic Parameter
          </NavLink>
        </li>


        {/* 1 Godown */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/GodownMaster" className="sidebar-link">
            Godown Management
          </NavLink>
        </li>

        {/* 2 Category */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/CategoryMaster" className="sidebar-link">
            Category Management
          </NavLink>
        </li>

        {/* 3 Item Group */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/ItemGroupMaster" className="sidebar-link">
            Item Group Management
          </NavLink>
        </li>

        {/* 4 Composition */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/Composition" className="sidebar-link">
            Composition Master
          </NavLink>
        </li>

        {/* 5 Company */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyMaster" className="sidebar-link">
            Company Master
          </NavLink>
        </li>

        {/* 6 Item Master */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/ItemMaster" className="sidebar-link">
            Item Master
          </NavLink>
        </li>

        {/* 7 Batch */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/Batch" className="sidebar-link">
            Batch Master
          </NavLink>
        </li>

        {/* 8 Opening Balance */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/OpeningBalance" className="sidebar-link">
            Opening Balance (Item)
          </NavLink>
        </li>

        {/* 9 Sub Company */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/SubCompany" className="sidebar-link">
            Sub Company
          </NavLink>
        </li>

        {/* 10 Remarks */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/RemarksMaster" className="sidebar-link">
            Remarks
          </NavLink>
        </li>

        {/* 11 Culture Medicine */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/CultureMedicine" className="sidebar-link">
            Culture Medicine
          </NavLink>
        </li>

        {/* 12 Test */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/TestMaster" className="sidebar-link">
            Test Master
          </NavLink>
        </li>

        {/* 13 Test Property */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/TestProperty" className="sidebar-link">
            Test Property
          </NavLink>
        </li>

        {/* 14 Test Parameter */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/TestPara" className="sidebar-link">
            Test Parameter
          </NavLink>
        </li>

        {/* 15 Test Property Group */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/TestPropertyGroup" className="sidebar-link">
            Test Property Group
          </NavLink>
        </li>

        {/* 16 Special Property */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/SpecialProperty" className="sidebar-link">
            Special Property
          </NavLink>
        </li>

        {/* 17 Sample Type */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/SampleType" className="sidebar-link">
            Sample Type
          </NavLink>
        </li>

        {/* 18 Edit Test Rate */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/EditTestRate" className="sidebar-link">
            Edit Test Rate
          </NavLink>
        </li>

        {/* 19 Edit Marketing Executive */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/EditMarketingExecutive" className="sidebar-link">
            Edit Marketing Executive
          </NavLink>
        </li>

        {/* 20 Profile */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiagProfile" className="sidebar-link">
            Profile Master
          </NavLink>
        </li>

        {/* 21 Package */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/PackageMaster" className="sidebar-link">
            Package Master
          </NavLink>
        </li>

        {/* 22 Test Reporting Sequence */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/TestReportingSequence" className="sidebar-link">
            Test Reporting Sequence
          </NavLink>
        </li>

        {/* 23 Edit Company Test Rate */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/EditCompanyTestRate" className="sidebar-link">
            Edit Company Test Rate
          </NavLink>
        </li>

        {/* 24 Edit Doctor Test Rate */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/EditDoctorTestRate" className="sidebar-link">
            Edit Doctor Test Rate
          </NavLink>
        </li>

        {/* 25 Health Card */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/HealthCard" className="sidebar-link">
            Health Card
          </NavLink>
        </li>

        {/* 26 Formula */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/Formula" className="sidebar-link">
            Formula
          </NavLink>
        </li>

        {/* 27 BOM */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/BOM" className="sidebar-link">
            BOM
          </NavLink>
        </li>

        {/* 28 Collector */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/Collector" className="sidebar-link">
            Collector
          </NavLink>
        </li>

        {/* 29 Agent */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/AgentMaster" className="sidebar-link">
            Agent
          </NavLink>
        </li>

        {/* 30 Due On Account */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/DueOnAccount" className="sidebar-link">
            Due On Account
          </NavLink>
        </li>

        {/* 31 Pathologist */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/Pathologist" className="sidebar-link">
            Pathologist (Report Signatory)
          </NavLink>
        </li>

        {/* 32 Report Heading */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/ReportHeading" className="sidebar-link">
            Report Heading
          </NavLink>
        </li>

        {/* 33 Discount Allowed */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiscountAllowedMasterDiagnosticParameterSetup" className="sidebar-link">
            Discount Allowed
          </NavLink>
        </li>

        {/* 34 DR IP Category */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/DRIPCategory" className="sidebar-link">
            Dr. IP Category
          </NavLink>
        </li>

        {/* 35 Agent Business Setup */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/AgentBusinessSetup" className="sidebar-link">
            Agent Business Setup
          </NavLink>
        </li>

        {/* 36 Doctor Business Setup */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/DoctorBusinessSetup" className="sidebar-link">
            Doctor Business Setup
          </NavLink>
        </li>

        {/* 37 Doctor Business Setup Agent-wise */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/DoctorBusinessSetupAgenWise" className="sidebar-link">
            Doctor Business Setup (Agent Wise)
          </NavLink>
        </li>

        {/* 38 Company Test Rate Setup */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyTestRateSetup" className="sidebar-link">
            Company Test Rate Setup
          </NavLink>
        </li>

        {/* 39 Cash Payment Head */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/CashPaymentHead" className="sidebar-link">
            Cash Payment Head
          </NavLink>
        </li>

        {/* 40 Type of Service */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/TypeOfService" className="sidebar-link">
            Type of Service
          </NavLink>
        </li>

        {/* 41 Culture Medicine Head */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/CultureMedicine" className="sidebar-link">
            Culture Medicine Head
          </NavLink>
        </li>

        {/* 42 Salutation (Another route) */}
        <li className="sidebar-dropdown-item">
          <NavLink to="/Saluation" className="sidebar-link">
            Salutation
          </NavLink>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/DiagProfile" className="sidebar-link">
            Profile
          </NavLink>
        </li>

      </ul>
    </li>
  );
};

export default DiagnosisMaster;