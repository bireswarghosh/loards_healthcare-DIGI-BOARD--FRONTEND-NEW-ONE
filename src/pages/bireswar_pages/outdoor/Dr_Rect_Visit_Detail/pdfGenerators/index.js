







// PDF Generator Files Mapping (English)
// Current Selection → PDF File Used
// View Option	Entry/Doctor Selection	Report Type	PDF File Used
// UserWise  -	All Users -	All                     ---          UserWise_AllDoctors_all.js
// UserWise  -	All Users -	Only Doctor Ch.         ---        	UserWise_AllDoctors_summary.js
// UserWise  -	All Users -	Only Service Ch.        ---         	UserWise_AllDoctors_onlyServiceCh.js
// UserWise  -	All Users -	Doctor's Ch. (Summary)  ---          UserWise_AllDoctors_doctorSummary.js
// UserWise  -	All Users -	Visit ID Wise           ---      	  UserWise_AllDoctors_visitIdWise.js
// UserWise  -	All Users -	Visit Type Wise         ---        	UserWise_AllDoctors_visitTypeWise.js
// UserWise  -	All Users -	Visit Type User Wise    ---         	UserWise_AllDoctors_visitTypeUserWise.js
// UserWise  -	All Users -	Registration No Wise    ---         	UserWise_AllDoctors_registrationNoWise.js
// UserWise  -	All Users -	Visit Type grp Wise     ---        	UserWise_AllDoctors_visitTypeGrpWise.js
// UserWise  -	All Users -	COMPANY WISE            ---        	UserWise_AllDoctors_companyWise.js

// RefDoctorWise - All Doctors - All --- UserWise_AllDoctors_all.js
// RefDoctorWise - All Doctors - Only Doctor Ch. --- UserWise_AllDoctors_summary.js
// RefDoctorWise - All Doctors - Only Service Ch. --- UserWise_AllDoctors_onlyServiceCh.js
// RefDoctorWise - All Doctors - Doctor's Ch. (Summary) --- UserWise_AllDoctors_doctorSummary.js
// RefDoctorWise - All Doctors - Visit ID Wise --- UserWise_AllDoctors_visitIdWise.js
// RefDoctorWise - All Doctors - Visit Type Wise --- UserWise_AllDoctors_visitTypeWise.js
// RefDoctorWise - All Doctors - Visit Type User Wise --- UserWise_AllDoctors_visitTypeUserWise.js
// RefDoctorWise - All Doctors - Registration No Wise --- UserWise_AllDoctors_registrationNoWise.js
// RefDoctorWise - All Doctors - Visit Type grp Wise --- UserWise_AllDoctors_visitTypeGrpWise.js
// RefDoctorWise - All Doctors - COMPANY WISE --- UserWise_AllDoctors_companyWise.js

// Ref wise - All Referals - All --- UserWise_AllDoctors_all.js
// Ref wise - All Referals - Only Doctor Ch. --- UserWise_AllDoctors_summary.js
// Ref wise - All Referals - Only Service Ch. --- UserWise_AllDoctors_onlyServiceCh.js
// Ref wise - All Referals - Doctor's Ch. (Summary) --- UserWise_AllDoctors_doctorSummary.js
// Ref wise - All Referals - Visit ID Wise --- UserWise_AllDoctors_visitIdWise.js
// Ref wise - All Referals - Visit Type Wise --- UserWise_AllDoctors_visitTypeWise.js
// Ref wise - All Referals - Visit Type User Wise --- UserWise_AllDoctors_visitTypeUserWise.js
// Ref wise - All Referals - Registration No Wise --- UserWise_AllDoctors_registrationNoWise.js
// Ref wise - All Referals - Visit Type grp Wise --- UserWise_AllDoctors_visitTypeGrpWise.js
// Ref wise - All Referals - COMPANY WISE --- UserWise_AllDoctors_companyWise.js

// Advance Booking - All Referals - All --- UserWise_AllDoctors_all.js
// Advance Booking - All Referals - Only Doctor Ch. --- UserWise_AllDoctors_summary.js
// Advance Booking - All Referals - Only Service Ch. --- UserWise_AllDoctors_onlyServiceCh.js
// Advance Booking - All Referals - Doctor's Ch. (Summary) --- UserWise_AllDoctors_doctorSummary.js
// Advance Booking - All Referals - Visit ID Wise --- UserWise_AllDoctors_visitIdWise.js
// Advance Booking - All Referals - Visit Type Wise --- UserWise_AllDoctors_visitTypeWise.js
// Advance Booking - All Referals - Visit Type User Wise --- UserWise_AllDoctors_visitTypeUserWise.js
// Advance Booking - All Referals - Registration No Wise --- UserWise_AllDoctors_registrationNoWise.js
// Advance Booking - All Referals - Visit Type grp Wise --- UserWise_AllDoctors_visitTypeGrpWise.js
// Advance Booking - All Referals - COMPANY WISE --- UserWise_AllDoctors_companyWise.js


























// PDF Generator Index - Import all PDF formats
import { generateUserWiseAllDoctorsPDF } from './UserWise_AllDoctors_all';
import { generateUserWiseAllDoctorsSummaryPDF } from './UserWise_AllDoctors_summary';
import { generateUserWiseAllDoctorsOnlyServiceChPDF } from './UserWise_AllDoctors_onlyServiceCh';
import { generateUserWiseAllDoctorsDoctorSummaryPDF } from './UserWise_AllDoctors_doctorSummary';
import { generateUserWiseAllDoctorsVisitIdWisePDF } from './UserWise_AllDoctors_visitIdWise';
import { generateUserWiseAllDoctorsVisitTypeWisePDF } from './UserWise_AllDoctors_visitTypeWise';
import { generateUserWiseAllDoctorsVisitTypeUserWisePDF } from './UserWise_AllDoctors_visitTypeUserWise';
import { generateUserWiseAllDoctorsRegistrationNoWisePDF } from './UserWise_AllDoctors_registrationNoWise';
import { generateUserWiseAllDoctorsVisitTypeGrpWisePDF } from './UserWise_AllDoctors_visitTypeGrpWise';
import { generateUserWiseAllDoctorsCompanyWisePDF } from './UserWise_AllDoctors_companyWise';
import { generateDoctorWiseAllDoctorsSummaryPDF } from './DoctorWise_AllDoctors_summary';

// PDF Generator mapping based on View Options and Doctor Selection
export const getPDFGenerator = (viewOption, doctorSelect, reportType) => {
  const key = `${viewOption}_${doctorSelect}_${reportType}`;
  console.log('PDF Generator Key:', key); // Debug log
  
  const generators = {
    'UserWise_allDoctors_All': generateUserWiseAllDoctorsPDF,
    'UserWise_allDoctors_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'UserWise_allDoctors_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'UserWise_allDoctors_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'UserWise_allDoctors_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'UserWise_allDoctors_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'UserWise_allDoctors_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'UserWise_allDoctors_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'UserWise_allDoctors_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'UserWise_allDoctors_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'DoctorWise_allDoctors_All': generateUserWiseAllDoctorsPDF,
    'DoctorWise_selectiveDoctors_All': generateUserWiseAllDoctorsPDF,
    'DoctorWise_allDoctors_Only Doctor Ch.': generateDoctorWiseAllDoctorsSummaryPDF,
    'DoctorWise_selectiveDoctors_Only Doctor Ch.': generateDoctorWiseAllDoctorsSummaryPDF,
    'DoctorWise_allDoctors_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'DoctorWise_selectiveDoctors_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'DoctorWise_allDoctors_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'DoctorWise_selectiveDoctors_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'DoctorWise_allDoctors_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'DoctorWise_selectiveDoctors_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'DoctorWise_allDoctors_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'DoctorWise_selectiveDoctors_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'DoctorWise_allDoctors_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'DoctorWise_selectiveDoctors_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'DoctorWise_allDoctors_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'DoctorWise_selectiveDoctors_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'DoctorWise_allDoctors_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'DoctorWise_selectiveDoctors_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'DoctorWise_allDoctors_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'DoctorWise_selectiveDoctors_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'Visit Type_allVisitTypes_All': generateUserWiseAllDoctorsPDF,
    'Visit Type_selectiveVisitTypes_All': generateUserWiseAllDoctorsPDF,
    'Visit Type_allVisitTypes_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'Visit Type_selectiveVisitTypes_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'Visit Type_allVisitTypes_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'Visit Type_selectiveVisitTypes_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'Visit Type_allVisitTypes_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'Visit Type_selectiveVisitTypes_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'Visit Type_allVisitTypes_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'Visit Type_selectiveVisitTypes_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'Visit Type_allVisitTypes_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'Visit Type_selectiveVisitTypes_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'Visit Type_allVisitTypes_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'Visit Type_selectiveVisitTypes_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'Visit Type_allVisitTypes_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'Visit Type_selectiveVisitTypes_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'Visit Type_allVisitTypes_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'Visit Type_selectiveVisitTypes_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'Visit Type_allVisitTypes_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'Visit Type_selectiveVisitTypes_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'RefDoctorWise_allDoctors_All': generateUserWiseAllDoctorsPDF,
    'RefDoctorWise_selectiveDoctors_All': generateUserWiseAllDoctorsPDF,
    'RefDoctorWise_allDoctors_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'RefDoctorWise_selectiveDoctors_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'RefDoctorWise_allDoctors_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'RefDoctorWise_selectiveDoctors_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'RefDoctorWise_allDoctors_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'RefDoctorWise_selectiveDoctors_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'RefDoctorWise_allDoctors_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'RefDoctorWise_selectiveDoctors_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'RefDoctorWise_allDoctors_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'RefDoctorWise_selectiveDoctors_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'RefDoctorWise_allDoctors_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'RefDoctorWise_selectiveDoctors_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'RefDoctorWise_allDoctors_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'RefDoctorWise_selectiveDoctors_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'RefDoctorWise_allDoctors_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'RefDoctorWise_selectiveDoctors_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'RefDoctorWise_allDoctors_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'RefDoctorWise_selectiveDoctors_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'Ref wise_allReferals_All': generateUserWiseAllDoctorsPDF,
    'Ref wise_selectiveReferals_All': generateUserWiseAllDoctorsPDF,
    'Ref wise_allReferals_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'Ref wise_selectiveReferals_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'Ref wise_allReferals_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'Ref wise_selectiveReferals_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'Ref wise_allReferals_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'Ref wise_selectiveReferals_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'Ref wise_allReferals_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'Ref wise_selectiveReferals_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'Ref wise_allReferals_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'Ref wise_selectiveReferals_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'Ref wise_allReferals_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'Ref wise_selectiveReferals_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'Ref wise_allReferals_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'Ref wise_selectiveReferals_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'Ref wise_allReferals_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'Ref wise_selectiveReferals_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'Ref wise_allReferals_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'Ref wise_selectiveReferals_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'Advance Booking_allReferals_All': generateUserWiseAllDoctorsPDF,
    'Advance Booking_selectiveReferals_All': generateUserWiseAllDoctorsPDF,
    'Advance Booking_allReferals_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'Advance Booking_selectiveReferals_Only Doctor Ch.': generateUserWiseAllDoctorsSummaryPDF,
    'Advance Booking_allReferals_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'Advance Booking_selectiveReferals_Only Service Ch.': generateUserWiseAllDoctorsOnlyServiceChPDF,
    'Advance Booking_allReferals_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'Advance Booking_selectiveReferals_Doctor\'s Ch. (Summary)': generateUserWiseAllDoctorsDoctorSummaryPDF,
    'Advance Booking_allReferals_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'Advance Booking_selectiveReferals_Visit ID Wise': generateUserWiseAllDoctorsVisitIdWisePDF,
    'Advance Booking_allReferals_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'Advance Booking_selectiveReferals_Visit Type Wise': generateUserWiseAllDoctorsVisitTypeWisePDF,
    'Advance Booking_allReferals_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'Advance Booking_selectiveReferals_Visit Type User Wise': generateUserWiseAllDoctorsVisitTypeUserWisePDF,
    'Advance Booking_allReferals_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'Advance Booking_selectiveReferals_Registration No Wise': generateUserWiseAllDoctorsRegistrationNoWisePDF,
    'Advance Booking_allReferals_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'Advance Booking_selectiveReferals_Visit Type grp Wise': generateUserWiseAllDoctorsVisitTypeGrpWisePDF,
    'Advance Booking_allReferals_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    'Advance Booking_selectiveReferals_COMPANY WISE': generateUserWiseAllDoctorsCompanyWisePDF,
    // Add more generators here as needed
    // 'DoctorWise_allDoctors_All': generateDoctorWiseAllDoctorsPDF,
    // 'UserWise_selectiveDoctors_All': generateUserWiseSelectiveDoctorsPDF,
    // etc...
  };
  
  return generators[key] || generateUserWiseAllDoctorsPDF; // Default fallback
};

// List of all available PDF formats
export const availablePDFFormats = [
  'UserWise_AllDoctors_All',
  'DoctorWise_AllDoctors_All', 
  'UserWise_SelectiveDoctors_All',
  'DoctorWise_SelectiveDoctors_All',
  'VisitType_AllDoctors_All',
  'RefDoctorWise_AllDoctors_All',
  'RefWise_AllDoctors_All',
  'AdvanceBooking_AllDoctors_All',
  'UserWise_AllDoctors_OnlyDoctorCh',
  'UserWise_AllDoctors_OnlyServiceCh',
  'UserWise_AllDoctors_DoctorChSummary',
  'UserWise_AllDoctors_VisitIDWise',
  'UserWise_AllDoctors_CompanyWise'
];