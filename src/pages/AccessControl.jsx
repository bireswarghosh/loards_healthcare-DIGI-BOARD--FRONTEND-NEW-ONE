import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';

const AccessControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [permissions, setPermissions] = useState({
    outdoor: true,
    outdoorMaster: true,
    outdoorReport: true,
    diagnosis: true,
    indoor: true,
    indoorMaster: true, 
    diagnosisMaster: true,
    bookingApp: true,
    doctor: true,
    marketing: true,
    userManagement: false
  });

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
        setPermissions(response.data.data || permissions);
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
      const newPerms = { ...prev, [section]: !prev[section] };
      
      if (!newPerms[section] && !section.includes('_')) {
        Object.keys(newPerms).forEach(key => {
          if (key.startsWith(section + '_')) {
            newPerms[key] = false;
          }
        });
      }
      
      if (newPerms[section] && section.includes('_')) {
        const parent = section.split('_')[0];
        newPerms[parent] = true;
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

  const sections = [
    { category: 'Outdoor (OPD)', items: [
      { key: 'outdoor', label: 'Outdoor Section' },
      { key: 'outdoor_visitEntry', label: 'Visit Entry' },
      { key: 'outdoor_visitList', label: 'Visit List' },
      { key: 'outdoor_drRectVisit', label: 'Dr Rect Visit Detail' },
      { key: 'outdoor_emr', label: 'EMR' },
      { key: 'outdoor_otherCharge', label: 'Other Charge' },
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
      { key: 'outdoorMaster_chiefComplaint', label: 'Chief Complant' },
      { key: 'outdoorMaster_diagnosis', label: 'Diagnosis Master' },
      { key: 'outdoorMaster_pastHistory', label: 'Past History' },
      { key: 'outdoorMaster_dose', label: 'Dose' },
      { key: 'outdoorMaster_advise', label: 'Advise' },
      { key: 'outdoorMaster_visitHour', label: 'Visit Hour Master' },
      { key: 'outdoorMaster_visitTypeGrp', label: 'VISIT TYPE GRP MASTER' },
      { key: 'outdoorMaster_visitType', label: 'Visit Type Master' },
      { key: 'outdoorMaster_referal', label: 'Referal Master' },
      { key: 'outdoorMaster_doctorSetup', label: 'Doctor Set Up' },
      { key: 'outdoorMaster_staff', label: 'Staff Master' },
      { key: 'outdoorMaster_medicine', label: 'Medicin Master' },
      { key: 'outdoorMaster_cashPayment', label: 'Cash Payment Head' },
      { key: 'outdoorMaster_otherCharges', label: 'Outdoor Other Charges Master' },
    ]},
    { category: 'Outdoor Report', items: [
      { key: 'outdoorReport', label: 'Outdoor Report Section' },
      { key: 'outdoorReport_dateWiseReg', label: 'Date Wise Registration Charge' },
      { key: 'outdoorReport_doctorVisit', label: 'Date Wise Doctor Wise Visit Detail' },
      { key: 'outdoorReport_patientHistory', label: 'Patient History' },
      { key: 'outdoorReport_billRegister', label: 'Others Bill Register' },
      { key: 'outdoorReport_cashRegister', label: 'CASH REGISTER' },
      { key: 'outdoorReport_cashRegisterList', label: 'Cash Register' },
      { key: 'outdoorReport_cashPayment', label: 'Cash Payment Register' },
      { key: 'outdoorReport_dateWiseCash', label: 'Date Wise Cash Register' },
      { key: 'outdoorReport_staffRegister', label: 'Staff Register' },
      { key: 'outdoorReport_visitTypeReport', label: 'Visit Type Group Wise Report' },
    ]},
    { category: 'Indoor (IPD)', items: [
      { key: 'indoor', label: 'Indoor Section' },
      { key: 'indoor_admissionList', label: 'Patient Admission List' },
      { key: 'indoor_moneyReceipt', label: 'Money Receipt List' },
      { key: 'indoor_otherCharges', label: 'Other Charges' },
      { key: 'indoor_otBillingList', label: 'OTBilling List' },
      { key: 'indoor_otBillingDetail', label: 'OT Billing Detail' },
      { key: 'indoor_otNoteProcedure', label: 'OT Note Procedure' },
      { key: 'indoor_doctorVisit', label: 'Doctor Visit' },
      { key: 'indoor_bedTransfer', label: 'Bed Transfer' },
      { key: 'indoor_estimate', label: 'Estimate' },
      { key: 'indoor_dischargeAdvise', label: 'Discharge Advise' },
      { key: 'indoor_dischargeAndAdvise', label: 'Discharge And Advise' },
      { key: 'indoor_advise', label: 'Advise' },
      { key: 'indoor_dischargeMrd', label: 'Discharge MRD' },
      { key: 'indoor_finalBillQuery', label: 'Final Bill Query' },
      { key: 'indoor_finalBillingDetail', label: 'Final Billing Detail' },
      { key: 'indoor_finalBillingList', label: 'Final Billing List' },
      { key: 'indoor_patientEnquiry', label: 'Patient Enquiry Detail' },
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
      { key: 'indoorMaster_companyBedRate', label: 'Company Wise Bed Rate' },
      { key: 'indoorMaster_companyOtItemRate', label: 'Company Wise OT Item Rate' },
      { key: 'indoorMaster_companyOtherCharges', label: 'Company Wise Others Charges' },
      { key: 'indoorMaster_companyTestRate', label: 'Company Wise Referral Test' },
      { key: 'indoorMaster_referalMaster', label: 'Referral Master' },
      { key: 'indoorMaster_profileMaster', label: 'Profile Master' },
      { key: 'indoorMaster_diseaseMaster', label: 'Disease Master' },
      { key: 'indoorMaster_cashPaymentHead', label: 'Cash Payment Headmaster' },
    ]},
    { category: 'Diagnosis', items: [
      { key: 'diagnosis', label: 'Diagnosis Section' },
      { key: 'diagnosis_caseEntry', label: 'Case Entry' },
      { key: 'diagnosis_moneyReceipt', label: 'Money Receipt' },
      { key: 'diagnosis_laboratoryQuery', label: 'Laboratory Query' },
      { key: 'diagnosis_download', label: 'Download' },
      { key: 'diagnosis_booking', label: 'Booking' },
      { key: 'diagnosis_opd', label: 'OPD' },
      { key: 'diagnosis_sampleCollection', label: 'Sample Collection' },
      { key: 'diagnosis_addIns', label: 'Add Ins' },
      { key: 'diagnosis_pos', label: 'Pos' },
      { key: 'diagnosis_radiologyRequisition', label: 'Readiology Requiaition' },
    ]},
    { category: 'Diagnosis Master', items: [
      { key: 'diagnosisMaster', label: 'Diagnosis Master Section' },
      { key: 'diagnosisMaster_parameterSetup', label: 'ParaMeter Setup' },
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
      { key: 'diagnosisMaster_pathologist', label: 'Pathologist (Report Signatory)' },
      { key: 'diagnosisMaster_reportHeading', label: 'Report Heading' },
      { key: 'diagnosisMaster_discountAllowed', label: 'Discount Allowed' },
      { key: 'diagnosisMaster_drIpCategory', label: 'Dr.IP Category' },
      { key: 'diagnosisMaster_agentBusinessSetup', label: 'Agent Business Setup' },
      { key: 'diagnosisMaster_doctorBusinessSetup', label: 'Doctor Business Setup' },
      { key: 'diagnosisMaster_doctorBusinessSetupAgenWise', label: 'Doctor Business Setup Agen Wise' },
      { key: 'diagnosisMaster_companyTestRateSetup', label: 'Company Test Rate Setup' },
      { key: 'diagnosisMaster_cashPaymentHead', label: 'Cash Payment Head' },
      { key: 'diagnosisMaster_typeOfService', label: 'Type of Service' },
      { key: 'diagnosisMaster_culMedHdMaster', label: 'Culture Medicine Head' },
      { key: 'diagnosisMaster_salutation', label: 'Salutation' },
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
      { key: 'ai_prescription', label: 'AI Prescription' },
      { key: 'ai_medicalImaging', label: 'AI Medical Imaging' },
      { key: 'ai_treatmentPlan', label: 'AI Treatment Plan' },
      { key: 'ai_drugInteraction', label: 'AI Drug Interaction' },
      { key: 'ai_healthAnalytics', label: 'AI Health Analytics' },
      { key: 'ai_scribe', label: 'AI Clinical Scribe' },
      { key: 'ai_settings', label: 'AI Settings' },
    ]},
    { category: 'Admin', items: [
      { key: 'userManagement', label: 'User Management' },
    ]}
  ];

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Select User</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <div className="list-group">
                {users.map(user => (
                  <button
                    key={user.UserId}
                    className={`list-group-item list-group-item-action ${selectedUser?.UserId === user.UserId ? 'active' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{user.UserName}</span>
                      <span className={`badge ${user.Active === 'Y' ? 'bg-success' : 'bg-secondary'}`}>
                        {user.Active === 'Y' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              {selectedUser ? `Access Control for ${selectedUser.UserName}` : 'Select a user to manage access'}
            </h5>
          </div>
          <div className="card-body">
            {selectedUser ? (
              <>
                <div className="alert alert-info mb-3">
                  <i className="fa fa-info-circle me-2"></i>
                  Click category headers to expand/collapse. Parent OFF = all children OFF.
                </div>

                {sections.map((category, idx) => (
                  <div key={idx} className="card mb-3">
                    <div 
                      className="card-header" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleSection(category.category)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{category.category}</h6>
                        <i className={`fa fa-chevron-${expandedSections[category.category] ? 'up' : 'down'}`}></i>
                      </div>
                    </div>
                    {expandedSections[category.category] && (
                    <div className="card-body p-0">
                      <table className="table table-sm mb-0">
                        <tbody>
                          {category.items.map(item => {
                            const isChild = item.key.includes('_');
                            const parent = isChild ? item.key.split('_')[0] : null;
                            const isDisabled = isChild && permissions[parent] === false;
                            
                            return (
                            <tr key={item.key}>
                              <td className="ps-3" style={{ opacity: isDisabled ? 0.5 : 1 }}>
                                {isChild && <span className="ms-3">└─ </span>}
                                {item.label}
                              </td>
                              <td className="text-center" style={{ width: '100px' }}>
                                <div className="form-check form-switch d-flex justify-content-center">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={permissions[item.key] !== false}
                                    onChange={() => handlePermissionChange(item.key)}
                                    disabled={isDisabled}
                                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                    )}
                  </div>
                ))}

                <div className="text-end mt-3">
                  <button className="btn btn-primary" onClick={handleSave}>
                    <i className="fa fa-save me-2"></i>Save Permissions
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted py-5">
                <i className="fa fa-user-shield fa-3x mb-3"></i>
                <p>Select a user from the list to manage their access permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
