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
            ParaMeter Setup
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/GodownMaster" className="sidebar-link">
            Godown Master
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CategoryMaster" className="sidebar-link">
            Category
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Composition" className="sidebar-link">
            Composition Master
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyMaster" className="sidebar-link">
            Company Master
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/ItemMaster" className="sidebar-link">
            Item Master
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Batch" className="sidebar-link">
            Batch Master
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/OpeningBalance" className="sidebar-link">
            Opening Balance (Item)
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/department" className="sidebar-link">
            Department
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/SubDepartment" className="sidebar-link">
            Sub-Department
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/SubCompany" className="sidebar-link">
            Sub Company
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/RemarksMaster" className="sidebar-link">
            Remarks
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CultureMedicine" className="sidebar-link">
            Culture Medicine
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/TestMaster" className="sidebar-link">
            Test
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/TestProperty" className="sidebar-link">
            Test Property
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/TestPara" className="sidebar-link">
            TEST PARAMETER
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/TestPropertyGroup" className="sidebar-link">
            Test Property Group
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/SpecialProperty" className="sidebar-link">
            Special Property
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/SampleType" className="sidebar-link">
            Sample Type
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/EditTestRate" className="sidebar-link">
            Edit Test Rate
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/EditMarketingExecutive" className="sidebar-link">
            Edit Marketing Executive
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DiagProfile" className="sidebar-link">
            Profile
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/PackageMaster" className="sidebar-link">
            Package Master
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/TestReportingSequence" className="sidebar-link">
            Test Reporting Sequence
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/EditCompanyTestRate" className="sidebar-link">
            Edit Company Test Rate
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/EditDoctorTestRate" className="sidebar-link">
            Edit Doctor Test Rate
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/HealthCard" className="sidebar-link">
            Health Card
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Formula" className="sidebar-link">
            Formula
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/BOM" className="sidebar-link">
            BOM
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/MarketingExecutive" className="sidebar-link">
            Marketing Executive
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Collector" className="sidebar-link">
            Collector
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Agent" className="sidebar-link">
            Agent
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DueOnAccount" className="sidebar-link">
            Due On Account
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Pathologist" className="sidebar-link">
            Pathologist (Report Signatory)
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/ReportHeading" className="sidebar-link">
            Report Heading
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DiscountAllowedMaster" className="sidebar-link">
            Discount Allowed
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DrIPCategory" className="sidebar-link">
            Dr.IP Category
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/AgentBusinessSetup" className="sidebar-link">
            Agent Business Setup
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DoctorBusinessSetup" className="sidebar-link">
            Doctor Business Setup
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/DoctorBusinessSetupAgenWise" className="sidebar-link">
            Doctor Business Setup Agen Wise
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CompanyTestRateSetup" className="sidebar-link">
            Company Test Rate Setup
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CashPaymentHead" className="sidebar-link">
            Cash Payment Head
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/TypeOfService" className="sidebar-link">
            Type of Service
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/CulMedHdMaster" className="sidebar-link">
            Culture Medicine Head
          </NavLink>
        </li>

        <li className="sidebar-dropdown-item">
          <NavLink to="/Saluation" className="sidebar-link">
            Salutation
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default DiagnosisMaster;