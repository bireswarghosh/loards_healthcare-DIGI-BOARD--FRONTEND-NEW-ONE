import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../axiosInstance';

const getNodeIcon = (node) => {
  const label = node.label.toLowerCase();
  
  if (label.startsWith('action:') || label.startsWith('action: ')) {
    if (label.includes('delete')) {
      return <i className="fa-light fa-trash-can" style={{ color: '#ef4444', fontSize: '13px' }}></i>;
    }
    if (label.includes('add') || label.includes('create')) {
      return <i className="fa-light fa-plus" style={{ color: '#10b981', fontSize: '13px' }}></i>;
    }
    if (label.includes('edit')) {
      return <i className="fa-light fa-pen-to-square" style={{ color: '#3b82f6', fontSize: '13px' }}></i>;
    }
    if (label.includes('view')) {
      return <i className="fa-light fa-eye" style={{ color: '#06b6d4', fontSize: '13px' }}></i>;
    }
    if (label.includes('print') || label.includes('receipt')) {
      return <i className="fa-light fa-print" style={{ color: '#64748b', fontSize: '13px' }}></i>;
    }
    if (label.includes('whatsapp') || label.includes('send')) {
      return <i className="fa-light fa-paper-plane" style={{ color: '#10b981', fontSize: '13px' }}></i>;
    }
    if (label.includes('search') || label.includes('filter')) {
      return <i className="fa-light fa-magnifying-glass" style={{ color: '#f59e0b', fontSize: '13px' }}></i>;
    }
    return <i className="fa-light fa-bolt" style={{ color: '#f59e0b', fontSize: '13px' }}></i>;
  }
  
  if (node.children && node.children.length > 0) {
    return <i className="fa-light fa-folder-open" style={{ color: '#eab308', fontSize: '14px' }}></i>;
  }
  
  return <i className="fa-light fa-file-lines" style={{ color: '#64748b', fontSize: '14px' }}></i>;
};

const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case 'Dashboard Sections':
      return <i className="fa-light fa-chart-simple me-2" style={{ color: '#3b82f6', fontSize: '14px' }}></i>;
    case 'Outdoor (OPD)':
      return <i className="fa-light fa-stethoscope me-2" style={{ color: '#10b981', fontSize: '14px' }}></i>;
    case 'Outdoor Master':
      return <i className="fa-light fa-sliders me-2" style={{ color: '#6366f1', fontSize: '14px' }}></i>;
    case 'Outdoor Report':
      return <i className="fa-light fa-file-chart-column me-2" style={{ color: '#f59e0b', fontSize: '14px' }}></i>;
    case 'Indoor (IPD)':
      return <i className="fa-light fa-bed me-2" style={{ color: '#06b6d4', fontSize: '14px' }}></i>;
    case 'Indoor Master':
      return <i className="fa-light fa-database me-2" style={{ color: '#8b5cf6', fontSize: '14px' }}></i>;
    case 'Indoor Report':
      return <i className="fa-light fa-file-invoice me-2" style={{ color: '#ec4899', fontSize: '14px' }}></i>;
    case 'Diagnosis':
      return <i className="fa-light fa-vial me-2" style={{ color: '#14b8a6', fontSize: '14px' }}></i>;
    case 'Diagnosis Master':
      return <i className="fa-light fa-flask me-2" style={{ color: '#a855f7', fontSize: '14px' }}></i>;
    case 'Diagnosis Report':
      return <i className="fa-light fa-file-medical-chart me-2" style={{ color: '#f43f5e', fontSize: '14px' }}></i>;
    case 'Booking App':
      return <i className="fa-light fa-calendar-check me-2" style={{ color: '#3b82f6', fontSize: '14px' }}></i>;
    case 'Doctor Section':
      return <i className="fa-light fa-user-doctor me-2" style={{ color: '#10b981', fontSize: '14px' }}></i>;
    case 'Marketing':
      return <i className="fa-light fa-bullhorn me-2" style={{ color: '#eab308', fontSize: '14px' }}></i>;
    case 'AI Features':
      return <i className="fa-light fa-brain me-2" style={{ color: '#6366f1', fontSize: '14px' }}></i>;
    case 'WhatsApp API':
      return <i className="fa-light fa-comments me-2" style={{ color: '#25d366', fontSize: '14px' }}></i>;
    case 'Admin Setting & Logs':
      return <i className="fa-light fa-gears me-2" style={{ color: '#64748b', fontSize: '14px' }}></i>;
    default:
      return <i className="fa-light fa-folder me-2" style={{ color: '#64748b', fontSize: '14px' }}></i>;
  }
};

const TreeNode = ({ node, permissions, onPermissionChange, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isChild = depth > 0;
  const isAction = node.label.startsWith('Action:') || node.label.startsWith('Action: ');
  const hasChildren = node.children && node.children.length > 0;

  // Determine if parent is disabled
  const parts = node.key.split('_');
  let isDisabled = false;
  let currentParent = '';
  for (let i = 0; i < parts.length - 1; i++) {
    currentParent = currentParent ? `${currentParent}_${parts[i]}` : parts[i];
    if (permissions[currentParent] === false) {
      isDisabled = true;
      break;
    }
  }

  const cleanLabel = node.label.replace('Action: ', '').replace('Action:', '');

  return (
    <div style={{ marginLeft: isChild ? '20px' : '0' }}>
      <div 
        className="d-flex align-items-center justify-content-between py-2 px-3 my-1"
        style={{
          borderRadius: '8px',
          background: isDisabled ? '#f8fafc' : isChild ? '#ffffff' : '#f8fafc',
          border: isChild ? '1px solid #f1f5f9' : '1px solid #e2e8f0',
          transition: 'all 0.15s ease',
          opacity: isDisabled ? 0.45 : 1,
        }}
      >
        <div className="d-flex align-items-center gap-2">
          {hasChildren ? (
            <button 
              className="btn btn-link p-0 text-muted d-flex align-items-center justify-content-center border-0" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
              style={{ width: '20px', height: '20px', textDecoration: 'none', background: '#f1f5f9', borderRadius: '4px' }}
            >
              <i className={`fa-light fa-chevron-${isOpen ? 'down' : 'right'}`} style={{ fontSize: '10px', color: '#475569' }}></i>
            </button>
          ) : (
            <div style={{ width: '20px' }} />
          )}
          <span className="d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
            {getNodeIcon(node)}
          </span>
          <span 
            className="ms-1"
            style={{ 
              fontSize: '13px', 
              fontWeight: isChild ? (isAction ? 500 : 600) : 700,
              color: isAction ? '#64748b' : '#1e293b'
            }}
          >
            {cleanLabel}
          </span>
        </div>

        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            checked={permissions[node.key] !== false}
            onChange={() => onPermissionChange(node.key)}
            disabled={isDisabled}
            style={{ 
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transform: 'scale(1.1)'
            }}
          />
        </div>
      </div>

      {hasChildren && isOpen && (
        <div 
          style={{ 
            borderLeft: '1.5px dashed #cbd5e1', 
            marginLeft: '9px', 
            paddingLeft: '12px',
            marginTop: '2px',
            marginBottom: '4px'
          }}
        >
          {node.children.map(child => (
            <TreeNode 
              key={child.key} 
              node={child} 
              permissions={permissions} 
              onPermissionChange={onPermissionChange} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const sections = [
  { category: 'Dashboard Sections', items: [
    { key: 'dashboard_opd', label: 'OPD Dashboard' },
    { key: 'dashboard_ipd', label: 'IPD Dashboard' },
    { key: 'dashboard_diagnostic', label: 'Diagnostic Dashboard' },
  ]},
  { category: 'Outdoor (OPD)', items: [
    { key: 'outdoor', label: 'Outdoor Section' },
    { key: 'outdoor_visitEntry', label: 'Visit Entry' },
    { key: 'outdoor_visitList', label: 'Visit List' },
    { key: 'outdoor_visitList_search', label: 'Action: Search & Filter' },
    { key: 'outdoor_visitList_create', label: 'Action: Add New Visit' },
    { key: 'outdoor_visitList_view', label: 'Action: View Details' },
    { key: 'outdoor_visitList_edit', label: 'Action: Edit Visit' },
    { key: 'outdoor_visitList_delete', label: 'Action: Delete Visit' },
    { key: 'outdoor_visitList_receipt', label: 'Action: Print Money Receipt' },
    { key: 'outdoor_visitList_drPress', label: 'Action: Print Dr Press' },
    { key: 'outdoor_visitList_whatsapp', label: 'Action: Send WhatsApp' },
    { key: 'outdoor_drRectVisit', label: 'Dr Rect Visit Detail' },
    { key: 'outdoor_emr', label: 'EMR' },
    { key: 'outdoor_otherCharge', label: 'Other Charge' },
    { key: 'outdoor_otherCharge_search', label: 'Action: Search & Filter' },
    { key: 'outdoor_otherCharge_create', label: 'Action: Add Charge' },
    { key: 'outdoor_otherCharge_view', label: 'Action: View Charge' },
    { key: 'outdoor_otherCharge_edit', label: 'Action: Edit Charge' },
    { key: 'outdoor_otherCharge_delete', label: 'Action: Delete Charge' },
    { key: 'outdoor_ivfBiodata', label: 'IVF Biodata' },
  ]},
  { category: 'Outdoor Master', items: [
    { key: 'outdoorMaster', label: 'Outdoor Master Section' },
    { key: 'outdoorMaster_parameterSetup', label: 'Parameter Setup' },
    { key: 'outdoorMaster_service', label: 'SERVICE' },
    { key: 'outdoorMaster_serviceOtherCharge', label: 'SERVICE OTHERCHARGE' },
    { key: 'outdoorMaster_otMaster', label: 'OT Master' },
    { key: 'outdoorMaster_otType', label: 'OT Type' },
    { key: 'outdoorMaster_otSlot', label: 'O.T. Slot Master' },
    { key: 'outdoorMaster_roomMaster', label: 'Room Master' },
    { key: 'outdoorMaster_chiefComplaint', label: 'Chief Complaint' },
    { key: 'outdoorMaster_diagnosis', label: 'Diagnosis Master' },
    { key: 'outdoorMaster_pastHistory', label: 'Past History' },
    { key: 'outdoorMaster_dose', label: 'Dose' },
    { key: 'outdoorMaster_advise', label: 'Advise' },
    { key: 'outdoorMaster_visitHour', label: 'Visit Hour Master' },
    { key: 'outdoorMaster_visitTypeGrp', label: 'VISIT TYPE GRP MASTER' },
    { key: 'outdoorMaster_visitType', label: 'Visit Type Master' },
    { key: 'outdoorMaster_referal', label: 'Referral Master' },
    { key: 'outdoorMaster_doctorSetup', label: 'Doctor Setup' },
    { key: 'outdoorMaster_staff', label: 'Staff Master' },
    { key: 'outdoorMaster_medicine', label: 'Medicine Master' },
    { key: 'outdoorMaster_cashPayment', label: 'Cash Payment Head' },
    { key: 'outdoorMaster_otherCharges', label: 'Outdoor Other Charges Master' },
  ]},
  { category: 'Outdoor Report', items: [
    { key: 'outdoorReport', label: 'Outdoor Report Section' },
    { key: 'outdoorReport_opdReportCenter', label: 'OPD Report Center' },
    { key: 'outdoorReport_dateWiseReg', label: 'Date Wise Registration Charge' },
    { key: 'outdoorReport_doctorVisit', label: 'Date Wise Doctor Wise Visit Detail' },
    { key: 'outdoorReport_patientHistory', label: 'Patient History' },
    { key: 'outdoorReport_billRegister', label: 'Others Bill Register' },
    { key: 'outdoorReport_cashRegister', label: 'CASH REGISTER' },
    { key: 'outdoorReport_cashRegisterList', label: 'Cash Register' },
    { key: 'outdoorReport_cashPayment', label: 'Cash Payment Register' },
    { key: 'outdoorReport_dateWiseCash', label: 'Date Wise Cash Register' },
    { key: 'outdoorReport_staffRegister', label: 'Staff Register' },
    { key: 'outdoorReport_billReport', label: 'Date Range Bill Report' },
    { key: 'outdoorReport_otherChargesBillReport', label: 'Date Range Other Charges Bill Report' },
  ]},
  { category: 'Indoor (IPD)', items: [
    { key: 'indoor', label: 'Indoor Section' },
    { key: 'indoor_admissionList', label: 'Patient Admission List' },
    { key: 'indoor_admissionList_search', label: 'Action: Search & Filter' },
    { key: 'indoor_admissionList_create', label: 'Action: Add New Patient' },
    { key: 'indoor_admissionList_view', label: 'Action: View Details' },
    { key: 'indoor_admissionList_edit', label: 'Action: Edit Patient' },
    { key: 'indoor_admissionList_delete', label: 'Action: Delete Patient' },
    { key: 'indoor_admissionList_print', label: 'Action: Print Report' },
    { key: 'indoor_admissionList_mr', label: 'Action: MR' },
    { key: 'indoor_admissionList_receipt', label: 'Action: Receipt' },
    { key: 'indoor_moneyReceipt', label: 'Money Receipt List' },
    { key: 'indoor_moneyReceipt_search', label: 'Action: Search & Filter' },
    { key: 'indoor_moneyReceipt_create', label: 'Action: Add Receipt' },
    { key: 'indoor_moneyReceipt_view', label: 'Action: View Details' },
    { key: 'indoor_moneyReceipt_edit', label: 'Action: Edit Receipt' },
    { key: 'indoor_moneyReceipt_delete', label: 'Action: Delete Receipt' },
    { key: 'indoor_otherCharges', label: 'Other Charges' },
    { key: 'indoor_otherCharges_search', label: 'Action: Search & Filter' },
    { key: 'indoor_otherCharges_create', label: 'Action: Add Charge' },
    { key: 'indoor_otherCharges_edit', label: 'Action: Edit Charge' },
    { key: 'indoor_otherCharges_delete', label: 'Action: Delete Charge' },
    { key: 'indoor_otBillingList', label: 'OTBilling' },
    { key: 'indoor_otBillingList_search', label: 'Action: Search & Filter' },
    { key: 'indoor_otBillingList_create', label: 'Action: Add Invoice' },
    { key: 'indoor_otBillingList_view', label: 'Action: View Invoice' },
    { key: 'indoor_otBillingList_edit', label: 'Action: Edit Invoice' },
    { key: 'indoor_otBillingList_delete', label: 'Action: Delete Invoice' },
    { key: 'indoor_otBillingList_print', label: 'Action: Print PDF' },
    { key: 'indoor_doctorVisit', label: 'Doctor Visit' },
    { key: 'indoor_doctorVisit_search', label: 'Action: Search & Filter' },
    { key: 'indoor_doctorVisit_create', label: 'Action: Add/Save Visit' },
    { key: 'indoor_doctorVisit_view', label: 'Action: View Details' },
    { key: 'indoor_doctorVisit_edit', label: 'Action: Edit Visit' },
    { key: 'indoor_doctorVisit_delete', label: 'Action: Delete Visit' },
    { key: 'indoor_bedTransfer', label: 'Bed Transfer' },
    { key: 'indoor_bedTransfer_search', label: 'Action: Search & Filter' },
    { key: 'indoor_bedTransfer_create', label: 'Action: Add/Save Bed Transfer' },
    { key: 'indoor_bedTransfer_view', label: 'Action: View Details' },
    { key: 'indoor_bedTransfer_edit', label: 'Action: Edit Bed Transfer' },
    { key: 'indoor_bedTransfer_delete', label: 'Action: Delete Bed Transfer' },
    { key: 'indoor_dischargeAdvise', label: 'Discharge' },
    { key: 'indoor_dischargeAdvise_search', label: 'Action: Search & Filter' },
    { key: 'indoor_dischargeAdvise_create', label: 'Action: New Discharge' },
    { key: 'indoor_dischargeAdvise_view', label: 'Action: View Details' },
    { key: 'indoor_dischargeAdvise_edit', label: 'Action: Edit Discharge' },
    { key: 'indoor_dischargeAdvise_delete', label: 'Action: Delete Discharge' },
    { key: 'indoor_dischargeAdvise_print', label: 'Action: Print' },
    { key: 'indoor_finalBillQuery', label: 'Final Bill Query' },
    { key: 'indoor_finalBillQuery_search', label: 'Action: Search & Filter' },
    { key: 'indoor_finalBillQuery_create', label: 'Action: New Final Bill' },
    { key: 'indoor_finalBillQuery_view', label: 'Action: View Details' },
    { key: 'indoor_finalBillQuery_edit', label: 'Action: Edit Final Bill' },
    { key: 'indoor_finalBillQuery_delete', label: 'Action: Delete Final Bill' },
  ]},
  { category: 'Indoor Master', items: [
    { key: 'indoorMaster', label: 'Indoor Master Section' },
    { key: 'indoorMaster_parameterSetup', label: 'Parameter Setup' },
    { key: 'indoorMaster_departmentGroup', label: 'Department Group' },
    { key: 'indoorMaster_bedMaster', label: 'Bed Master' },
    { key: 'indoorMaster_religionMaster', label: 'Religion Master' },
    { key: 'indoorMaster_nurseMaster', label: 'Nurse Master' },
    { key: 'indoorMaster_nurseStationMaster', label: 'Nurse Station Master' },
    { key: 'indoorMaster_nurseStationDetail', label: 'Nurse Station Detail Master' },
    { key: 'indoorMaster_dayCareBedRate', label: 'Day Care Bed Rate' },
    { key: 'indoorMaster_otMaster', label: 'O.T. Master' },
    { key: 'indoorMaster_otSlotMaster', label: 'O.T. Slot Master' },
    { key: 'indoorMaster_otType', label: 'OT Type' },
    { key: 'indoorMaster_otCategory', label: 'OT Category' },
    { key: 'indoorMaster_otItem', label: 'OT Item' },
    { key: 'indoorMaster_cashlessMaster', label: 'Cashless Master' },
    { key: 'indoorMaster_consentMaster', label: 'Consent Master' },
    { key: 'indoorMaster_billPrintHead', label: 'Bill Print Head' },
    { key: 'indoorMaster_otherChargesMaster', label: 'Other Charges Master' },
    { key: 'indoorMaster_packageMaster', label: 'Indoor Package Master' },
    { key: 'indoorMaster_companyBedRate', label: 'Company Wise Bed Rate' },
    { key: 'indoorMaster_companyOtItemRate', label: 'Company Wise OT Item Rate' },
    { key: 'indoorMaster_companyOtherCharges', label: 'Company Wise Others Charges' },
    { key: 'indoorMaster_companyTestRate', label: 'Company Wise Referral Test' },
    { key: 'indoorMaster_referalMaster', label: 'Referral Master' },
    { key: 'indoorMaster_profileMaster', label: 'Profile Master' },
    { key: 'indoorMaster_diseaseMaster', label: 'Disease Master' },
    { key: 'indoorMaster_cashPaymentHead', label: 'Cash Payment Headmaster' },
    { key: 'indoorMaster_agentMaster', label: 'Agent Master' },
  ]},
  { category: 'Diagnosis', items: [
    { key: 'diagnosis', label: 'Diagnosis Section' },
    { key: 'diagnosis_caseEntry', label: 'Case Entry' },
    { key: 'diagnosis_caseEntry_search', label: 'Action: Search & Filter' },
    { key: 'diagnosis_caseEntry_create', label: 'Action: Add New Case' },
    { key: 'diagnosis_caseEntry_view', label: 'Action: View Details' },
    { key: 'diagnosis_caseEntry_edit', label: 'Action: Edit Case' },
    { key: 'diagnosis_caseEntry_delete', label: 'Action: Delete Case' },
    { key: 'diagnosis_caseEntry_bill', label: 'Action: Print Bill' },
    { key: 'diagnosis_caseEntry_comBill', label: 'Action: Print Com Bill' },
    { key: 'diagnosis_caseEntry_depPrint', label: 'Action: Print Dep' },
    { key: 'diagnosis_moneyReceipt', label: 'Money Receipt' },
    { key: 'diagnosis_moneyReceipt_search', label: 'Action: Search & Filter' },
    { key: 'diagnosis_moneyReceipt_create', label: 'Action: Create/Refund' },
    { key: 'diagnosis_moneyReceipt_view', label: 'Action: View/Print' },
    { key: 'diagnosis_moneyReceipt_edit', label: 'Action: Edit Receipt' },
    { key: 'diagnosis_laboratoryQuery', label: 'Laboratory Query' },
    { key: 'diagnosis_laboratoryQuery_search', label: 'Action: Search & Filter' },
    { key: 'diagnosis_laboratoryQuery_view', label: 'Action: View Details' },
    { key: 'diagnosis_caseFlowExplorer', label: 'Case Flow Explorer' },
    { key: 'diagnosis_pathLogin', label: 'Path Login' },
    { key: 'diagnosis_download', label: 'Download' },
    { key: 'diagnosis_booking', label: 'Booking' },
    { key: 'diagnosis_opd', label: 'OPD' },
    { key: 'diagnosis_sampleCollection', label: 'Sample Collection' },
    { key: 'diagnosis_addIns', label: 'Add Ins' },
    { key: 'diagnosis_pos', label: 'Pos' },
    { key: 'diagnosis_radiologyRequisition', label: 'Radiology Requisition' },
  ]},
  { category: 'Diagnosis Master', items: [
    { key: 'diagnosisMaster', label: 'Diagnosis Master Section' },
    { key: 'diagnosisMaster_parameterSetup', label: 'Parameter Setup' },
    { key: 'diagnosisMaster_godownMaster', label: 'Godown Master' },
    { key: 'diagnosisMaster_category', label: 'Category' },
    { key: 'diagnosisMaster_composition', label: 'Composition Master' },
    { key: 'diagnosisMaster_companyMaster', label: 'Company Master' },
    { key: 'diagnosisMaster_itemMaster', label: 'Item Master' },
    { key: 'diagnosisMaster_batch', label: 'Batch Master' },
    { key: 'diagnosisMaster_openingBalance', label: 'Opening Balance (Item)' },
    { key: 'diagnosisMaster_department', label: 'Department' },
    { key: 'diagnosisMaster_subDepartment', label: 'Sub-Department' },
    { key: 'diagnosisMaster_subCompany', label: 'Sub Company' },
    { key: 'diagnosisMaster_remarks', label: 'Remarks' },
    { key: 'diagnosisMaster_cultureMedicine', label: 'Culture Medicine' },
    { key: 'diagnosisMaster_test', label: 'Test' },
    { key: 'diagnosisMaster_testProperty', label: 'Test Property' },
    { key: 'diagnosisMaster_testParameter', label: 'TEST PARAMETER' },
    { key: 'diagnosisMaster_testPropertyGroup', label: 'Test Property Group' },
    { key: 'diagnosisMaster_specialProperty', label: 'Special Property' },
    { key: 'diagnosisMaster_sampleType', label: 'Sample Type' },
    { key: 'diagnosisMaster_editTestRate', label: 'Edit Test Rate' },
    { key: 'diagnosisMaster_editMarketingExecutive', label: 'Edit Marketing Executive' },
    { key: 'diagnosisMaster_profile', label: 'Profile' },
    { key: 'diagnosisMaster_packageMaster', label: 'Package Master' },
    { key: 'diagnosisMaster_testReportingSequence', label: 'Test Reporting Sequence' },
    { key: 'diagnosisMaster_editCompanyTestRate', label: 'Edit Company Test Rate' },
    { key: 'diagnosisMaster_editDoctorTestRate', label: 'Edit Doctor Test Rate' },
    { key: 'diagnosisMaster_healthCard', label: 'Health Card' },
    { key: 'diagnosisMaster_formula', label: 'Formula' },
    { key: 'diagnosisMaster_bom', label: 'BOM' },
    { key: 'diagnosisMaster_marketingExecutive', label: 'Marketing Executive' },
    { key: 'diagnosisMaster_collector', label: 'Collector' },
    { key: 'diagnosisMaster_agent', label: 'Agent' },
    { key: 'diagnosisMaster_dueOnAccount', label: 'Due On Account' },
    { key: 'diagnosisMaster_pathologist', label: 'Pathologist' },
    { key: 'diagnosisMaster_reportHeading', label: 'Report Heading' },
    { key: 'diagnosisMaster_discountAllowed', label: 'Discount Allowed' },
    { key: 'diagnosisMaster_drIpCategory', label: 'Dr.IP Category' },
    { key: 'diagnosisMaster_agentBusinessSetup', label: 'Agent Business Setup' },
    { key: 'diagnosisMaster_doctorBusinessSetup', label: 'Doctor Business Setup' },
    { key: 'diagnosisMaster_doctorBusinessSetupAgenWise', label: 'Doctor Business Setup Agent Wise' },
    { key: 'diagnosisMaster_companyTestRateSetup', label: 'Company Test Rate Setup' },
    { key: 'diagnosisMaster_cashPaymentHead', label: 'Cash Payment Head' },
    { key: 'diagnosisMaster_typeOfService', label: 'Type of Service' },
    { key: 'diagnosisMaster_culMedHdMaster', label: 'Culture Medicine Head' },
    { key: 'diagnosisMaster_salutation', label: 'Salutation' },
  ]},
  { category: 'Indoor Report', items: [
    { key: 'indoorReport', label: 'Indoor Report Section' },
    { key: 'indoorReport_admissionRegister', label: 'Datewise Admission Register' },
    { key: 'indoorReport_dischargePatient', label: 'Discharge Patient Register' },
    { key: 'indoorReport_moneyReceipt', label: 'Datewise Money Receipt' },
    { key: 'indoorReport_finalBill', label: 'Final Bill Register' },
    { key: 'indoorReport_otherCharges', label: 'Other Charges Register' },
    { key: 'indoorReport_otherChargesDetail', label: 'Other Charges Detail' },
    { key: 'indoorReport_drCharges', label: 'Dr. Charges Detail' },
    { key: 'indoorReport_bedCharges', label: 'Bed Charges' },
    { key: 'indoorReport_billReport', label: 'Bill Report' },
  ]},
  { category: 'Diagnosis Report', items: [
    { key: 'diagReport', label: 'Diagnosis Report Section' },
    { key: 'diagReport_patientId', label: 'Patient Id Report' },
    { key: 'diagReport_testSchedule', label: 'Test Schedule Report' },
    { key: 'diagReport_caseWiseLab', label: 'Case Wise Lab' },
    { key: 'diagReport_doctorList', label: 'Doctor List' },
    { key: 'diagReport_monthlyBill', label: 'Monthly Bill' },
    { key: 'diagReport_cancelTest', label: 'Cancel Test' },
    { key: 'diagReport_deptWiseTest', label: 'Dept. Wise Test Report' },
    { key: 'diagReport_agentWiseSale', label: 'Agent Wise Sale Report' },
  ]},
  { category: 'Booking App', items: [
    { key: 'bookingApp', label: 'Booking App Section' },
    { key: 'bookingApp_patientList', label: 'All Patient List' },
    { key: 'bookingApp_ambulanceCategory', label: 'Ambulance Category' },
    { key: 'bookingApp_ambulanceBooking', label: 'Ambulance Booking Requests' },
    { key: 'bookingApp_nursingCareCategory', label: 'Nursing Care Category' },
    { key: 'bookingApp_nursingBooking', label: 'Nursing Booking' },
    { key: 'bookingApp_diagnosticBookings', label: 'Diagnostic Bookings' },
    { key: 'bookingApp_packageBooking', label: 'Package Booking List' },
    { key: 'bookingApp_prescriptionDelivery', label: 'Prescription Delivery' },
    { key: 'bookingApp_genericMedicine', label: 'Generic Medicine Management' },
    { key: 'bookingApp_razorpaySettings', label: 'Razorpay Settings' },
    { key: 'bookingApp_appTerms', label: 'App Terms & Conditions' },
    { key: 'bookingApp_appBanner', label: 'App Banner Management' },
    { key: 'bookingApp_socialMedia', label: 'Social Media Management' },
  ]},
  { category: 'Doctor Section', items: [
    { key: 'doctor', label: 'Doctor Section' },
    { key: 'doctor_activeDoctors', label: 'Active Doctors' },
    { key: 'doctor_department', label: 'Department' },
    { key: 'doctor_doctor', label: 'Doctor' },
    { key: 'doctor_appointments', label: 'Doctor Wise Appointments' },
  ]},
  { category: 'Marketing', items: [
    { key: 'marketing', label: 'Marketing Section' },
    { key: 'marketing_dailyActivity', label: 'Daily Manager Activity' },
    { key: 'marketing_campingManagement', label: 'Camping Management' },
  ]},
  { category: 'AI Features', items: [
    { key: 'ai', label: 'AI Section' },
    { key: 'ai_appointmentHistory', label: 'AI Appointment History (Admin)' },
    { key: 'ai_userChat', label: 'AI Assistance' },
    { key: 'ai_userBookings', label: 'My Appointments' },
    { key: 'ai_doctorChat', label: 'AI Chat (Doctor)' },
    { key: 'ai_scribe', label: 'AI Clinical Scribe' },
    { key: 'ai_settings', label: 'AI Settings' },
    { key: 'ai_prescription', label: 'AI Prescription' },
    { key: 'ai_medicalImaging', label: 'AI Medical Imaging' },
    { key: 'ai_treatmentPlan', label: 'AI Treatment Plan' },
    { key: 'ai_drugInteraction', label: 'AI Drug Interaction' },
    { key: 'ai_healthAnalytics', label: 'AI Health Analytics' },
  ]},
  { category: 'WhatsApp API', items: [
    { key: 'whatsapp', label: 'WhatsApp Section' },
    { key: 'whatsapp_sendText', label: 'Send Text' },
    { key: 'whatsapp_sendMedia', label: 'Send Media' },
    { key: 'whatsapp_sendButton', label: 'Send Button' },
    { key: 'whatsapp_sendPoll', label: 'Send Poll' },
    { key: 'whatsapp_sendList', label: 'Send List' },
    { key: 'whatsapp_sendLocation', label: 'Send Location' },
    { key: 'whatsapp_sendVcard', label: 'Send VCard' },
    { key: 'whatsapp_sendSticker', label: 'Send Sticker' },
    { key: 'whatsapp_sendProduct', label: 'Send Product' },
    { key: 'whatsapp_sendChannel', label: 'Send to Channel' },
    { key: 'whatsapp_checkNumber', label: 'Check Number' },
    { key: 'whatsapp_userManagement', label: 'User Management' },
    { key: 'whatsapp_deviceManagement', label: 'Device Management' },
  ]},
  { category: 'Admin Setting & Logs', items: [
    { key: 'userManagement', label: 'Setting Section' },
    { key: 'userManagement_users', label: 'User Management' },
    { key: 'userManagement_access', label: 'Access Control' },
    { key: 'userManagement_activity', label: 'Activity Log' },
  ]}
];

const DEFAULT_PERMISSIONS = {
  dashboard_opd: true,
  dashboard_ipd: true,
  dashboard_diagnostic: true,
  outdoor: true,
  outdoor_visitEntry: true,
  outdoor_visitList: true,
  outdoor_visitList_search: true,
  outdoor_visitList_create: true,
  outdoor_visitList_view: true,
  outdoor_visitList_edit: true,
  outdoor_visitList_delete: true,
  outdoor_visitList_receipt: true,
  outdoor_visitList_drPress: true,
  outdoor_visitList_whatsapp: true,
  outdoor_drRectVisit: true,
  outdoor_emr: true,
  outdoor_otherCharge: true,
  outdoor_otherCharge_create: true,
  outdoor_otherCharge_view: true,
  outdoor_otherCharge_edit: true,
  outdoor_otherCharge_delete: true,
  outdoor_otherCharge_search: true,
  outdoor_ivfBiodata: true,
  outdoorMaster: true,
  outdoorReport: true,
  indoor: true,
  indoor_admissionList: true,
  indoor_admissionList_search: true,
  indoor_admissionList_create: true,
  indoor_admissionList_view: true,
  indoor_admissionList_edit: true,
  indoor_admissionList_delete: true,
  indoor_admissionList_print: true,
  indoor_admissionList_mr: true,
  indoor_admissionList_receipt: true,
  indoor_moneyReceipt: true,
  indoor_moneyReceipt_search: true,
  indoor_moneyReceipt_create: true,
  indoor_moneyReceipt_view: true,
  indoor_moneyReceipt_edit: true,
  indoor_moneyReceipt_delete: true,
  indoor_otherCharges: true,
  indoor_otherCharges_search: true,
  indoor_otherCharges_create: true,
  indoor_otherCharges_edit: true,
  indoor_otherCharges_delete: true,
  indoor_otBillingList: true,
  indoor_otBillingList_search: true,
  indoor_otBillingList_create: true,
  indoor_otBillingList_view: true,
  indoor_otBillingList_edit: true,
  indoor_otBillingList_delete: true,
  indoor_otBillingList_print: true,
  indoor_doctorVisit: true,
  indoor_doctorVisit_search: true,
  indoor_doctorVisit_create: true,
  indoor_doctorVisit_view: true,
  indoor_doctorVisit_edit: true,
  indoor_doctorVisit_delete: true,
  indoor_bedTransfer: true,
  indoor_bedTransfer_search: true,
  indoor_bedTransfer_create: true,
  indoor_bedTransfer_view: true,
  indoor_bedTransfer_edit: true,
  indoor_bedTransfer_delete: true,
  indoor_dischargeAdvise: true,
  indoor_dischargeAdvise_search: true,
  indoor_dischargeAdvise_create: true,
  indoor_dischargeAdvise_view: true,
  indoor_dischargeAdvise_edit: true,
  indoor_dischargeAdvise_delete: true,
  indoor_dischargeAdvise_print: true,
  indoor_finalBillQuery: true,
  indoor_finalBillQuery_search: true,
  indoor_finalBillQuery_create: true,
  indoor_finalBillQuery_view: true,
  indoor_finalBillQuery_edit: true,
  indoor_finalBillQuery_delete: true,
  indoorMaster: true,
  indoorMaster_packageMaster: true,
  indoorMaster_agentMaster: true,
  indoorReport: true,
  diagnosis: true,
  diagnosis_caseEntry: true,
  diagnosis_caseEntry_search: true,
  diagnosis_caseEntry_create: true,
  diagnosis_caseEntry_view: true,
  diagnosis_caseEntry_edit: true,
  diagnosis_caseEntry_delete: true,
  diagnosis_caseEntry_bill: true,
  diagnosis_caseEntry_comBill: true,
  diagnosis_caseEntry_depPrint: true,
  diagnosis_moneyReceipt: true,
  diagnosis_moneyReceipt_create: true,
  diagnosis_moneyReceipt_view: true,
  diagnosis_moneyReceipt_edit: true,
  diagnosis_moneyReceipt_search: true,
  diagnosis_laboratoryQuery: true,
  diagnosis_laboratoryQuery_search: true,
  diagnosis_laboratoryQuery_view: true,
  diagnosis_caseFlowExplorer: true,
  diagnosis_pathLogin: true,
  diagnosisMaster: true,
  diagReport: true,
  bookingApp: true,
  doctor: true,
  marketing: true,
  ai: true,
  whatsapp: true,
  userManagement: false,
  userManagement_users: false,
  userManagement_access: false,
  userManagement_activity: false
};

const AccessControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const [searchTerm, setSearchTerm] = useState('');

  const handleExpandAll = () => {
    const newExpanded = {};
    sections.forEach(cat => {
      newExpanded[cat.category] = true;
    });
    setExpandedSections(newExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedSections({});
  };

  const buildTree = (items) => {
    const map = {};
    const roots = [];

    // Initialize nodes
    items.forEach(item => {
      map[item.key] = { ...item, children: [] };
    });

    // Link children to parents
    items.forEach(item => {
      const node = map[item.key];
      const parts = item.key.split('_');
      if (parts.length > 1) {
        const parentKey = parts.slice(0, -1).join('_');
        const parentNode = map[parentKey];
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    
    return sections.map(cat => {
      // Find all items that match directly
      const matchedKeys = new Set();
      cat.items.forEach(item => {
        if (item.label.toLowerCase().includes(term) || item.key.toLowerCase().includes(term)) {
          matchedKeys.add(item.key);
          
          // Add all ancestor keys of this matched item
          const parts = item.key.split('_');
          let ancestorKey = '';
          for (let i = 0; i < parts.length - 1; i++) {
            ancestorKey = ancestorKey ? `${ancestorKey}_${parts[i]}` : parts[i];
            matchedKeys.add(ancestorKey);
          }
        }
      });
      
      // Filter items to keep only matched ones and their ancestors
      const filteredItems = cat.items.filter(item => matchedKeys.has(item.key));
      return { ...cat, items: filteredItems };
    }).filter(cat => cat.items.length > 0);
  }, [searchTerm, sections]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/auth/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setExpandedSections({});
    try {
      const response = await axiosInstance.get(`/auth/users/${user.UserId}/permissions`);
      if (response.data.success) {
        setPermissions({
          ...DEFAULT_PERMISSIONS,
          ...response.data.data
        });
      }
    } catch (err) {
      console.log('No permissions found, using defaults');
    }
  };

  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handlePermissionChange = (section) => {
    setPermissions(prev => {
      const newPerms = { ...prev };
      const targetVal = !prev[section];
      newPerms[section] = targetVal;
      
      // Cascade down recursively: turn ON or OFF all children & grandchildren
      Object.keys(newPerms).forEach(key => {
        if (key.startsWith(section + '_')) {
          newPerms[key] = targetVal;
        }
      });
      
      // Cascade up recursively: turn on all parent levels
      if (targetVal) {
        const parts = section.split('_');
        let currentParent = '';
        for (let i = 0; i < parts.length - 1; i++) {
          currentParent = currentParent ? `${currentParent}_${parts[i]}` : parts[i];
          newPerms[currentParent] = true;
        }
      }
      
      return newPerms;
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await axiosInstance.put(`/auth/users/${selectedUser.UserId}/permissions`, permissions);
      alert('Permissions updated successfully!');
    } catch (err) {
      alert('Failed to update permissions');
    }
  };

  // sections array has been moved to file/module scope

  return (
    <div className="row" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="col-md-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
          <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <i className="fa-light fa-user-circle" style={{ color: '#3b82f6' }}></i>
              <span>Select User</span>
            </h5>
            <small style={{ color: '#64748b' }}>Select a user to modify their permission parameters</small>
          </div>
          <div className="card-body px-4 pb-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }}></div>
              </div>
            ) : (
              <div className="list-group" style={{ gap: '8px' }}>
                {users.map(user => (
                  <button
                    key={user.UserId}
                    className={`list-group-item list-group-item-action border-0 px-3 py-3 d-flex justify-content-between align-items-center`}
                    style={{
                      borderRadius: '12px',
                      background: selectedUser?.UserId === user.UserId ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#f8fafc',
                      color: selectedUser?.UserId === user.UserId ? '#fff' : '#334155',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onClick={() => handleUserSelect(user)}
                  >
                    <span>{user.UserName}</span>
                    <span 
                      className="badge border-0" 
                      style={{ 
                        background: user.Active === 'Y' ? '#dcfce7' : '#f1f5f9',
                        color: user.Active === 'Y' ? '#15803d' : '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '6px 10px',
                        borderRadius: '20px'
                      }}
                    >
                      {user.Active === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
          <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <i className="fa-light fa-shield-halved" style={{ color: '#10b981' }}></i>
              <span>{selectedUser ? `Access Control: ${selectedUser.UserName}` : 'Access Control Parameters'}</span>
            </h5>
            <small style={{ color: '#64748b' }}>Configure roles and fine-grained menu permission settings</small>
          </div>
          <div className="card-body px-4 pb-4">
            {selectedUser ? (
              <>
                <div 
                  className="alert border-0 mb-4 px-4 py-3 d-flex align-items-center gap-3" 
                  style={{ background: '#f0f9ff', color: '#0369a1', borderRadius: '12px' }}
                >
                  <i className="fa-light fa-circle-info fa-lg"></i>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>
                    Configure user access rights using the tree directory below. <strong>Parent OFF = all children OFF</strong> recursively.
                  </div>
                </div>

                {/* Search & Collapse controls */}
                <div className="d-flex gap-2 mb-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border py-2.5 px-3"
                    style={{ borderRadius: '10px', fontSize: '13px', borderColor: '#e2e8f0' }}
                    placeholder="🔍 Search permissions (e.g. create, delete, list)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button 
                    className="btn btn-sm btn-light border px-3 text-nowrap" 
                    style={{ borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#475569' }}
                    onClick={handleExpandAll}
                  >
                    📂 Expand All
                  </button>
                  <button 
                    className="btn btn-sm btn-light border px-3 text-nowrap" 
                    style={{ borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#475569' }}
                    onClick={handleCollapseAll}
                  >
                    📁 Collapse All
                  </button>
                </div>
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredSections.map((category, idx) => {
                    const treeData = buildTree(category.items);
                    return (
                      <div 
                        key={idx} 
                        className="card border-0" 
                        style={{ 
                          borderRadius: '12px', 
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden'
                        }}
                      >
                        <div 
                          className="card-header border-0 px-4 py-3 d-flex justify-content-between align-items-center" 
                          style={{ cursor: 'pointer', background: '#f1f5f9' }}
                          onClick={() => toggleSection(category.category)}
                        >
                          <h6 className="mb-0 fw-bold d-flex align-items-center" style={{ color: '#334155', fontSize: '13px', letterSpacing: '0.3px' }}>
                            {getCategoryIcon(category.category)}
                            <span>{category.category} ({category.items.length})</span>
                          </h6>
                          <i 
                            className={`fa-light fa-chevron-${expandedSections[category.category] ? 'up' : 'down'}`}
                            style={{ color: '#64748b', fontSize: '12px' }}
                          ></i>
                        </div>
                        {expandedSections[category.category] && (
                          <div className="card-body p-3 bg-white border-top" style={{ borderColor: '#e2e8f0' }}>
                            {treeData.map(node => (
                              <TreeNode 
                                key={node.key} 
                                node={node} 
                                permissions={permissions} 
                                onPermissionChange={handlePermissionChange} 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-end mt-4 pt-2">
                  <button 
                    className="btn border-0 py-2.5 px-4 text-white" 
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      fontWeight: 600,
                      fontSize: '13px',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
                    }} 
                    onClick={handleSave}
                  >
                    <i className="fa-light fa-floppy-disk me-2"></i>Save Permission Configuration
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted py-5 my-4">
                <i className="fa-light fa-shield-keyhole fa-3x mb-3" style={{ color: '#cbd5e1' }}></i>
                <h6 className="fw-bold" style={{ color: '#64748b' }}>Select a User Profile</h6>
                <p className="small mb-0" style={{ color: '#94a3b8' }}>Please select a user from the left pane to manage their access rights.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
