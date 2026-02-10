import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminOnlyRoute from "./components/AdminOnlyRoute";
import PermissionRoute from "./components/PermissionRoute";
import Dashboard from "./pages/Dashboard";
import CrmDashboard from "./pages/CrmDashboard";
import HrmDashboard from "./pages/HrmDashboard";
import Audience from "./pages/Audience";
import Company from "./pages/Company";
import Task from "./pages/Task";
import Leads from "./pages/Leads";
import Customer from "./pages/Customer";
import AddEmployee from "./pages/AddEmployee";
import AllEmployee from "./pages/AllEmployee";
import Attendance from "./pages/Attendance";
import AllCustomer from "./pages/AllCustomer";
import AddNewProduct from "./pages/AddNewProduct";
import AllProduct from "./pages/AllProduct";
import Category from "./pages/Category";
import Order from "./pages/Order";
import Chat from "./pages/Chat";
import Email from "./pages/Email";
import Calendar from "./pages/Calendar";
import Invoices from "./pages/Invoices";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import Login2 from "./pages/Login2";
import Registration from "./pages/Registration";
import Registration2 from "./pages/Registration2";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import LoginStatus from "./pages/LoginStatus";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Utility from "./pages/Utility";
import SweetAlert from "./pages/SweetAlert";
import NestableList from "./pages/NestableList";
import Animation from "./pages/Animation";
import SwiperSlider from "./pages/SwiperSlider";
import Form from "./pages/Form";
import Table from "./pages/Table";
import Charts from "./pages/Charts";
import Icon from "./pages/Icon";
import Map from "./pages/Map";
import FileManager from "./pages/FileManager";
import Layout from "./components/layout/Layout";
import Login3 from "./pages/Login3";
import Error400 from "./pages/Error400";
import Error403 from "./pages/Error403";
import Error404 from "./pages/Error404";
import Error408 from "./pages/Error408";
import Error500 from "./pages/Error500";
import Error503 from "./pages/Error503";
import Error504 from "./pages/Error504";
import ComingSoon from "./pages/ComingSoon";
import ComingSoon2 from "./pages/ComingSoon2";
import PricingTable from "./pages/PricingTable";
import PricingTable2 from "./pages/PricingTable2";
import UnderConstruction from "./pages/UnderConstruction";
import UserManagement from "./pages/UserManagement";
import AccessControl from "./pages/AccessControl";

import Emr from "./pages/bireswar_pages/outdoor/Emr/Emr.jsx";



import VisitEntry from "./pages/bireswar_pages/outdoor/Visit_Entry/VisitEntry.jsx";
import DrRectVisitDetail from "./pages/bireswar_pages/outdoor/Dr_Rect_Visit_Detail/DrRectVisitDetail.jsx";
import OtherCharges from "./pages/bireswar_pages/outdoor/Other_Charges/OtherCharges.jsx";
import OtherChargesIPD from "./pages/bireswar_pages/outdoor/Other_Charges/OtherChargesIPD.jsx";
import CaseList from "./pages/bireswar_pages/outdoor/Other_Charges/CaseList.jsx";
import DateWiseRegistrationCharge from "./pages/bireswar_pages/outdoor/DateWiseRegistrationCharge/DateWiseRegistrationCharge.jsx";
import PatientHistory from "./pages/bireswar_pages/outdoor/PatientHistory/PatientHistory.jsx";
import IVFBIODATAMASTER from "./pages/bireswar_pages/outdoor/IVF/IVFBIODATAMASTER.jsx";
import OthersBillRegister from "./pages/bireswar_pages/outdoor/OthersBillRegister/OthersBillRegister.jsx";
import VisitList from "./pages/bireswar_pages/outdoor/Visit_List/VisitList.jsx";
import DPackageMaster from "./pages/bireswar_pages/IndoorMaster/DPackageMaster/DPackageMaster.jsx";
// import DiagnosticParameterSetup from "./pages/bireswar_pages/IndoorMaster/DiagnosticParameterSetup/DiagnosticParameterSetup.jsx";




// !  INDOOR

import PatientRegistrationDetail from "./components/indoor/indoor-patientAdmissionlist/PatientRegistrationDetail.jsx";








import AdmissionList from "./components/indoor/indoor-patientAdmissionlist/AdmissionList.jsx";
import PatientAdmissionDetail from "./components/indoor/PatientAdmissionDetail/PatientAdmissionDetail.jsx";
import SampleReceipt from "./components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/SampleReceipt.jsx";
import OtherCharges_indoor from "./components/indoor/PatientAdmissionDetail/OtherCharges/OtherCharges.jsx";
import OTBillingList from "./components/indoor/PatientAdmissionDetail/OTBillingList.jsx";
import OTBillingDetail from "./components/indoor/OTBillingDetail.jsx";
import OTNoteProcedure from "./components/indoor/OTNoteProcedure.jsx";
// import DoctorVisit from "./components/indoor/DoctorVisit.jsx";

import Estimate from "./components/indoor/Estimate.jsx";
import DischargeAndAdvice_Details from "./components/indoor/DischargeAndAdvise_details.jsx";
import DischargeAndAdvise from "./components/indoor/DischargeAndAdvise.jsx";
import DischargeAdvise from "./components/indoor/DischargeAdvise.jsx";
import DischargeMrd from "./components/indoor/DischargeMrd.jsx";
import FinalBillQuery from "./components/indoor/FinalBillQuery.jsx";
import FinalBillingDetail from "./components/indoor/FinalBillingDetail.jsx";
import FinalBillingList from "./components/indoor/FinalBillingList.jsx";
import PatientEnquiryDetail from "./components/indoor/PatientEnquiryDetail.jsx";




//master imports

import AdviceMaster from "./templates/OUTDOOR MASTER/AdviceMaster.jsx"
import ChiefMaster from "./templates/OUTDOOR MASTER/ChiefMaster.jsx"
import CompanymstMaster from "./templates/OUTDOOR MASTER/CompanymstMaster.jsx"
import DiagoMaster from "./templates/OUTDOOR MASTER/DiagoMaster.jsx"
import DoseMaster from "./templates/OUTDOOR MASTER/DoseMaster.jsx"
import PastHistoryMaster from "./templates/OUTDOOR MASTER/PastHistoryMaster.jsx"
// import RemarksMaster from "./templates/OUTDOOR MASTER/RemarksMaster.jsx"
import VisitourMaster from "./templates/OUTDOOR MASTER/VisitourMaster.jsx"
import VisitTypeGrpMaster from "./templates/OUTDOOR MASTER/VisitTypeGrpMaster.jsx"
import VisittypeMaster from "./templates/OUTDOOR MASTER/VisittypeMaster.jsx"
import RoomNoMaster from "./templates/OUTDOOR MASTER/RoomNoMaster.jsx"
import ServiceMaster from "./templates/OUTDOOR MASTER/ServiceMaster.jsx"
import OutdoorOtherChargeMaster from "./templates/OUTDOOR MASTER/OutdoorOtherChargeMaster.jsx"
import OutdoorParameterSetup from "./templates/OUTDOOR MASTER/OutdoorParameterSetup.jsx"
import MedicinMaster from "./templates/OUTDOOR MASTER/MedicinMaster.jsx"
import CashPaymentHead from "./templates/OUTDOOR MASTER/CashPaymentHead.jsx"
import CategoryMaster from "./templates/DiagnosisMaster/CategoryMaster.jsx"


import CulMedHdMaster from "./templates/DiagnosisMaster/CulMedHd.jsx"
import GodownMaster from "./templates/DiagnosisMaster/GodownMaster.jsx"
import ItemGroupMaster from "./templates/DiagnosisMaster/ItemGroupMaster.jsx"
// import RemarksM from "./templates/DiagnosisMaster/RemarksMaster.jsx"
// import TestMaster from "./templates/DiagnosisMaster/Test.jsx"
import PatientList from "./templates/Booking App/PatientList.jsx";



// ! indoor master imports end here
import IndoorParameterSetup from "./components/indoor-master/IndoorParameterSetup.jsx";
import DepartmentGroup from "./components/indoor-master/DepartmentGroup.jsx";
import BedMaster from "./components/indoor-master/BedMaster.jsx";
import ReligionMaster from "./components/indoor-master/ReligionMaster.jsx";
import NurseMaster from "./components/indoor-master/NurseMaster.jsx";
import NurseStationMaster from "./components/indoor-master/NurseStationMaster.jsx";
import NurseStationDetailMaster from "./components/indoor-master/NurseStationDetailMaster.jsx";
import DayCareBedRate from "./components/indoor-master/DayCareBedRate.jsx";
import OTMaster from "./components/indoor-master/OTMaster.jsx";
import OTSlotMaster from "./components/indoor-master/OTSlotMaster.jsx";
import OTType from "./components/indoor-master/OTType.jsx";
import OTCategory from "./components/indoor-master/OTCategory.jsx";
import OTItemMaster from "./components/indoor-master/OTItemMaster.jsx";
import CashlessMaster from "./components/indoor-master/CashlessMaster.jsx";
import ConsentMaster from "./components/indoor-master/ConsentMaster.jsx";
import BillPrintHeadMaster from "./components/indoor-master/BillPrintHeadMaster.jsx";
import AgentMaster from "./components/indoor-master/AgentMaster.jsx";







// !  indoor master imports end here


import ProfileMaster from "./components/indoor-master/profile_master/ProfileMaster.jsx";
import ReferalMaster from "./components/indoor-master/ReferalMaster/ReferalMaster.jsx";
import CompanyTestRate from "./components/indoor-master/CompanyTestRate/CompanyTestRate.jsx";
import CompanyWiseOtherChargesRate from "./components/indoor-master/CompanyWiseOtherChargesRate/CompanyWiseOtherChargesRate.jsx";
import CompanyWiseOtItemRate from "./components/indoor-master/CompanyWiseOtItemRate/CompanyWiseOtItemRate.jsx";
import CompanyWiseBedRate from "./components/indoor-master/CompanyWiseBedRate/CompanyWiseBedRate.jsx";
import OtherChargesMaster from "./components/indoor-master/OtherChargesMaster/OtherChargesMaster.jsx";






// !   booking   app  deb



// import AmbulanceList from "./templates/Booking App/ambulance";



// import AmbulanceList from "./templates/Booking App/ambulance/AmbulanceList";
// import AddAmbulance from "./templates/Booking App/ambulance/AddAmbulance";
// import EditAmbulance from "./templates/Booking App/ambulance/EditAmbulance";
// import PickupRequestList from "./templates/Booking App/ambulance/PickupRequestList";




import DiagnosticBookingList from "./components/bookingApp/DiagnosticBookingList.jsx";
import PackageManagement from "./components/bookingApp/PackageManagement.jsx";
import PrescriptionDelivery from "./components/bookingApp/PrescriptionDelivery.jsx";
import GenericMedicineManagement from "./components/bookingApp/GenericMedicineManagement.jsx";
import RazorpaySettings from "./components/bookingApp/RazorpaySettings.jsx";
import AppTermsSettings from "./components/bookingApp/AppTermsSettings.jsx";
import AppBannerSettings from "./components/bookingApp/AppBannerSettings.jsx";





import NurshingCare from "./components/bookingApp/NurshingCare/NurshingCare.jsx";
import NurshingBookingList from "./components/bookingApp/NurshingBooking/NurshingBookingList.jsx";
import AppSocialMediaSettings from "./components/bookingApp/AppSocialMediaSettings/AppSocialMediaSettings.jsx";


// import AddAmbulance from "./components/Ambulance";
import AddAmbulance from "./components/Ambulance/AddAmbulance.jsx";
import AmbulanceList from "./components/Ambulance/AmbulanceList.jsx";
import PickupRequestList from "./components/Ambulance/PickupRequestList.jsx";
import CampingManagement from "./pages/Emr dummy/CampingManagement.jsx";
import PatientActions from "./pages/Emr dummy/PatientActions.jsx";




// !  deb dia  mas
import OTBillingIpd from "./templates/OTBillingIpd.jsx";
import OtherChargesss from "./templates/DiagnosisMaster/OtherCharges.jsx";
import MoneyReceipt from "./templates/DiagnosisMaster/MoneyReceipt.jsx";
import Refund from "./templates/DiagnosisMaster/Refund.jsx";

import TestReportSeq from "./templates/DiagnosisMaster/TestReportSeq.jsx";
import ActiveDoctors from "./templates/DiagnosisMaster/ActiveDoctors.jsx";
import Saluation from "./templates/DiagnosisMaster/Saluation.jsx";
import SampleType from "./templates/DiagnosisMaster/SampleType.jsx";
import SubCompany from "./templates/DiagnosisMaster/SubCompany.jsx";
import DiagProfile from "./templates/DiagnosisMaster/DiagProfile.jsx";
import Collector from "./templates/DiagnosisMaster/Collector.jsx";
import ReportHeading from "./templates/DiagnosisMaster/ReportHeading.jsx";
import EditMarketingExecutive from "./templates/DiagnosisMaster/EditMarketingExecutive.jsx";
import Composition from "./templates/DiagnosisMaster/Composition.jsx";
import CompanyMaster from "./templates/DiagnosisMaster/CompanyMaster.jsx";
import Batch from "./templates/DiagnosisMaster/Batch.jsx";
import TestMaster from "./templates/DiagnosisMaster/Test.jsx";
import SpecialProperty from "./templates/DiagnosisMaster/SpecialProperty.jsx";
import TypeOfService from "./templates/DiagnosisMaster/TypeOfService.jsx";

// ! soum dia  mas
import RemarksMaster from "./templates/DiagnosisMaster/RemarksMaster.jsx"
import TestParameter from "./templates/DiagnosisMaster/TestParameter.jsx";

import DiscountAllowedMaster from "./templates/DiagnosisMaster/DiscountAllowedMaster.jsx";

import DiagnosticParameterSetup from "./templates/DiagnosisMaster/DiagnosticParameterSetup.jsx";
import DrIPCategory from "./templates/DiagnosisMaster/DrIPCategory.jsx";
import InitialFormData from "./components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/InitialFormData.jsx";
import DepartmentSubdepartment from "./components/outdoor/DeptSubDept.jsx";
import DoctorManagement from "./components/outdoor/DoctorManagement.jsx";
import DoctorWiseAppointments from "./components/outdoor/DoctorWiseAppointments.jsx";
import EditTestRate from "./templates/DiagnosisMaster/EditTestRate.jsx";
import PackageMaster from "./templates/DiagnosisMaster/PackageMaster.jsx";
import Formula from "./templates/DiagnosisMaster/Formula.jsx";

// !  sir  given

// import DiagBooking from "./DiagBooking"
import TestReportingSequence from "./TestReportingSequence"
import TestPropertyGroup from "./TestPropertyGroup"
import AgentBusiness from "./AgentBusiness"
import AgentForm from "./AgentForm"
import DoctorBusiness from "./DoctorBusiness"
// import BookingListView from "./DiagBookingList"
// import DiagBookingList from "./DiagBookingList"
import CompanyTestRateSetup from "./CompanyTestRateSetup"
import DueOnAccount from "./DueOnAccount"
import ItemMaster from "./ItemMaster"
import OpeningBalanceItem from "./OpeningBalanceItem"
import PathologistSignatory from "./PathologistSignatory"
import RadiologyRequisition from "./RadiologyRequisition"
import RadiologyRequisitionDetail from "./RadiologyRequisitionDetail"
import SubDepartment from "./SubDepartment"
// import SpecialProperty from "./SpecialProperty"
import SampleCollection from "./SampleCollection"
import SampleCollectionDetails from "./SampleCollectionDetails"
import ReceptionReporting from "./ReceptionReporting"
import CaseEntryForm from "./pages/bireswar_pages/outdoor/Other_Charges/CaseEntry.jsx";
import BedTransfer from "./components/indoor/BedTransfer.jsx";
import BedTransferList from "./components/indoor/BedTransferList.jsx";
import CaseTestData from "./pages/bireswar_pages/outdoor/CaseTestData/CaseTestData.jsx";
// soumo  import for diag booking

import DiagBookingList from "././components/DiagnosisBooking/DiagBookingList.jsx";
import DiagBooking from "././components/DiagnosisBooking/DiagBooking.jsx";
import DiagBookingAdd from "././components/DiagnosisBooking/DiagBookingAdd.jsx";

import LaboratoryQuery from "./templates/DiagnosisMaster/LabrotaryQuery.jsx";

import BloodReport from "./templates/DiagnosisMaster/blood/BloodReport.jsx";
import BloodReportAdd from "./templates/DiagnosisMaster/blood/BloodReportAdd.jsx";

import LeagcyPos from "./templates/DiagnosisMaster/LegacyPOS.jsx"
import CashPaymentHeadMaster from "./pages/bireswar_pages/IndoorMaster/CashPaymentHeadMaster.jsx";
import DiseaseMaster from "./pages/bireswar_pages/IndoorMaster/DiseaseMaster.jsx";
import Discharge from "./templates/Discharge.jsx";
import DischargeLayout from "./templates/DischargeLayout.jsx";
import DischargeDetails from "./templates/DischargeDetails.jsx";
import DischargePrint from "./templates/DischargePrint.jsx";








// !  ai  
import AiChat from "./pages/AiChat";
import AiChatDoctor from "./pages/AiChatDoctor";
import AiSettings from "./pages/AiSettings";
import AiPrescription from "./pages/AiPrescription";
import AiMedicalImaging from "./pages/AiMedicalImaging";
import AiTreatmentPlan from "./pages/AiTreatmentPlan";
import AiAppointmentHistory from "./pages/AiAppointmentHistory";
import AiDrugInteraction from "./pages/AiDrugInteraction";
import AiHealthAnalytics from "./pages/AiHealthAnalytics";
import AiScribe from "./pages/AiScribe";
import UserAiBookings from "./pages/UserAiBookings";
import AiChatOld from "./pages/AiChatOld";
import DateWiseAdmReg from "./pages/DateWiseAdmReg.jsx";
import DoctorVisit from "./DoctorVisit.jsx";
import DischargeNewAdvice from "./templates/DischargeNewAdvice.jsx";
import DatewiseMoneyReceipt from "./pages/DatewiseMoneyReceipt.jsx";

// WhatsApp API imports
import SendText from "./pages/WhatsAppAPI/SendText";
import SendMedia from "./pages/WhatsAppAPI/SendMedia";
import SendButton from "./pages/WhatsAppAPI/SendButton";
import SendPoll from "./pages/WhatsAppAPI/SendPoll";
import SendList from "./pages/WhatsAppAPI/SendList";
import SendLocation from "./pages/WhatsAppAPI/SendLocation";
import SendVCard from "./pages/WhatsAppAPI/SendVCard";
import SendSticker from "./pages/WhatsAppAPI/SendSticker";
import SendProduct from "./pages/WhatsAppAPI/SendProduct";
import SendTextChannel from "./pages/WhatsAppAPI/SendTextChannel";
import CheckNumber from "./pages/WhatsAppAPI/CheckNumber";
import UserManagementWA from "./pages/WhatsAppAPI/UserManagementWA";
import DeviceManagement from "./pages/WhatsAppAPI/DeviceManagement";
import CaseWiseLab from "./templates/CaseWiseLab.jsx";
import TestCalculation from "./templates/TestCalculation.jsx";







function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/fileManager" element={<FileManager />} />
          <Route path="/crmDashboard" element={<CrmDashboard />} />
          <Route path="/hrmDashboard" element={<HrmDashboard />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/company" element={<Company />} />
          <Route path="/task" element={<Task />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/addEmployee" element={<AddEmployee />} />
          <Route path="/allEmployee" element={<AllEmployee />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/allCustomer" element={<AllCustomer />} />
          <Route path="/addNewProduct" element={<AddNewProduct />} />
          <Route path="/allProduct" element={<AllProduct />} />
          <Route path="/category" element={<Category />} />
          <Route path="/order" element={<Order />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/email" element={<Email />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editProfile" element={<EditProfile />} />
          <Route path="/utility" element={<Utility />} />
          <Route path="/sweetAlert" element={<SweetAlert />} />
          <Route path="/nestableList" element={<NestableList />} />
          <Route path="/animation" element={<Animation />} />
          <Route path="/swiperSlider" element={<SwiperSlider />} />
          <Route path="/form" element={<Form />} />
          <Route path="/table" element={<Table />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/icon" element={<Icon />} />
          <Route path="/map" element={<Map />} />
          <Route path="/user-management" element={<AdminOnlyRoute><UserManagement /></AdminOnlyRoute>} />
          <Route path="/access-control" element={<AdminOnlyRoute><AccessControl /></AdminOnlyRoute>} />

       

          {/* newly added routes */}
          <Route path="/visit_entry" element={<PermissionRoute section="outdoor_visitEntry"><VisitEntry /></PermissionRoute>} />
          <Route path="/table-data" element={<PermissionRoute section="outdoor_visitList"><VisitList /></PermissionRoute>} />
          <Route path="/dr-rect-visit-detail" element={<PermissionRoute section="outdoor_drRectVisit"><DrRectVisitDetail /></PermissionRoute>} />
          <Route path="/emr" element={<PermissionRoute section="outdoor_emr"><Emr /></PermissionRoute>} />
          <Route path="/Opd_Other_Charges" element={<PermissionRoute section="outdoor_otherCharge"><OtherChargesss /></PermissionRoute>} />
          <Route path="/IVFBiodataMaster" element={<PermissionRoute section="outdoor_ivfBiodata"><IVFBIODATAMASTER /></PermissionRoute>} />
          <Route path="/other_charges" element={<PermissionRoute section="outdoor"><OtherCharges /></PermissionRoute>} />
          <Route path="/date-wise-registration-charge" element={<PermissionRoute section="outdoor"><DateWiseRegistrationCharge /></PermissionRoute>} />

<Route
            path="/datawise-moneyreceipt"
            element={
              <>
                <DatewiseMoneyReceipt/>
              </>
            }
          />


          <Route path="/patient-history" element={<PermissionRoute section="outdoor"><PatientHistory /></PermissionRoute>} />
          <Route path="/others-bill-register" element={<PermissionRoute section="outdoor"><OthersBillRegister /></PermissionRoute>} />
          <Route path="/IVFBiodataMaster" element={<PermissionRoute section="outdoor"><IVFBIODATAMASTER /></PermissionRoute>} />
          <Route path="/dpackage-master" element={<PermissionRoute section="outdoor"><DPackageMaster /></PermissionRoute>} />


<Route path="/legacy_pos" element={<LeagcyPos/>}/>
<Route path="/CashPaymentHeadMaster" element={<CashPaymentHeadMaster />}/>      

<Route path="/DiseaseMaster" element={<DiseaseMaster />} />
    {/* newly added routes end here */}


{/* indoor route start---------------------------------  */}
          <Route path="/PatientRegistrationList" element={<ProtectedRoute><AdmissionList /></ProtectedRoute>} />
          <Route path="/PatientAdmissionDetail" element={<ProtectedRoute><PatientAdmissionDetail /></ProtectedRoute>}/>


<Route path="/PatientRegistrationDetail" element={<PatientRegistrationDetail />} />
          <Route path="/PatientRegistrationDetail/:id" element={<PatientRegistrationDetail />} />



          <Route path="/sampleReceipts" element={<ProtectedRoute><SampleReceipt /></ProtectedRoute>} />
<Route path="/initialFormData" element={<InitialFormData />} />
<Route path="/initialFormData/:id" element={<InitialFormData />} />

 <Route path="/other-charges" element={<ProtectedRoute><OtherChargesIPD /></ProtectedRoute>} />

<Route path="/CaseList" element={<CaseList />} />

<Route path="/CaseEntry" element={<CaseEntryForm />} />
<Route path="/CaseEntry/:id/:Modex" element={<CaseEntryForm />} />
<Route path="/case-test-data" element={<ProtectedRoute><CaseTestData /></ProtectedRoute>} />



          <Route path="/othercharges" element={<ProtectedRoute><OtherCharges /></ProtectedRoute>} />
          <Route path="/OTBillingList" element={<ProtectedRoute><OTBillingList /></ProtectedRoute>} />
          <Route path="/OTBillingDetail" element={<ProtectedRoute><OTBillingDetail /></ProtectedRoute>} />
          <Route path="/OTNoteProcedure" element={<ProtectedRoute><OTNoteProcedure /></ProtectedRoute>} />
          <Route path="/DoctorVisit" element={<ProtectedRoute><DoctorVisit/></ProtectedRoute>} />
         
          <Route path="/Estimate" element={<ProtectedRoute><Estimate /></ProtectedRoute>} />
          <Route path="/DischargeAndAdvise"element={<ProtectedRoute><DischargeAndAdvice_Details /></ProtectedRoute>}/>
          <Route path="/DischargeAndAdvise_details" element={<ProtectedRoute><DischargeAndAdvise /></ProtectedRoute>}/>
          <Route path="/DischargeAdvise" element={<ProtectedRoute><DischargeAdvise /></ProtectedRoute>} />
          <Route path="/DischargeMrd" element={<ProtectedRoute><DischargeMrd/></ProtectedRoute>}/>
          <Route path="/FinalBillQuery" element={<ProtectedRoute><FinalBillQuery/></ProtectedRoute>} />
          <Route path="/FinalBillingDetail" element={<ProtectedRoute><FinalBillingDetail/></ProtectedRoute>} />
          <Route path="/FinalBillingList" element={<ProtectedRoute><FinalBillingList/></ProtectedRoute>} />
          <Route path="/PatientEnquiryDetail" element={<ProtectedRoute><PatientEnquiryDetail/></ProtectedRoute>} />



<Route path="/BedTransfer" element={<ProtectedRoute><BedTransferList /></ProtectedRoute>} />
          <Route path="/Bed-Transfer" element={<ProtectedRoute><BedTransfer /></ProtectedRoute>} />
          <Route path="/Bed-Transfer/:id/:mode" element={<ProtectedRoute><BedTransfer /></ProtectedRoute>} />


<Route
            path="/dateWiseAdmReg"
            element={
              <>
                <DateWiseAdmReg />
              </>
            }
          />


          {/* indoor route end---------------------------------  */}






{/* master */}


{/* dia booking start */}

          <Route path="/DiagBookingList" element={<DiagBookingList/>} />

          <Route path="/DiagBooking" element={<DiagBooking />} />
          <Route path="/DiagBooking/:id/:mode" element={<DiagBooking />} />
          <Route path="/DiagBooking/:mode" element={<DiagBookingAdd/>} />

          {/* dia booking end */}






<Route path="/TestCalculation" element={<ProtectedRoute><TestCalculation/></ProtectedRoute>}/>

<Route path="/caseWiseLab" element={<ProtectedRoute><CaseWiseLab/></ProtectedRoute>}/>
<Route path="/discharge" element={<DischargeLayout/>}>
<Route index element={ <Discharge/>}/>
<Route path="add" element={<DischargeDetails mode="add"/> } />
<Route path=":id" element={<DischargeDetails mode="view"/>}/>
<Route path=":id/edit" element={<DischargeDetails mode="edit"/>}/>
<Route path=":id/advice" element={<DischargeNewAdvice/>}/>
<Route path="/discharge/:id/print" element={<DischargePrint />}/>
<Route path=":id/mrd" element={<DischargeMrd/>}/>
</Route>
 <Route path="/AdviceMaster" element={<ProtectedRoute><AdviceMaster/></ProtectedRoute>}/>
 <Route path="/ChiefMaster" element={<ProtectedRoute><ChiefMaster/></ProtectedRoute>}/>
 <Route path="/CompanymstMaster" element={<ProtectedRoute><CompanymstMaster/></ProtectedRoute>}/>
 <Route path="/DiagoMaster" element={<ProtectedRoute><DiagoMaster/></ProtectedRoute>}/>
 <Route path="/DoseMaster" element={<ProtectedRoute><DoseMaster/></ProtectedRoute>}/>
 <Route path="/PastHistoryMaster" element={<ProtectedRoute><PastHistoryMaster/></ProtectedRoute>}/>
 {/* <Route path="/RemarksMaster" element={<ProtectedRoute><RemarksMaster/></ProtectedRoute>}/> */}
 <Route path="/VisitourMaster" element={<ProtectedRoute><VisitourMaster/></ProtectedRoute>}/>
 <Route path="/VisitTypeGrpMaster" element={<ProtectedRoute><VisitTypeGrpMaster/></ProtectedRoute>}/>
 <Route path="/VisittypeMaster" element={<ProtectedRoute><VisittypeMaster/></ProtectedRoute>}/>
 <Route path="/RoomNoMaster" element={<ProtectedRoute><RoomNoMaster/></ProtectedRoute>}/>
 <Route path="/ServiceMaster" element={<ProtectedRoute><ServiceMaster/></ProtectedRoute>}/>
 <Route path="/OutdoorOtherChargeMaster" element={<ProtectedRoute><OutdoorOtherChargeMaster/></ProtectedRoute>}/>
 <Route path="/OutdoorParameterSetup" element={<ProtectedRoute><OutdoorParameterSetup/></ProtectedRoute>}/>
 <Route path="/MedicinMaster" element={<ProtectedRoute><MedicinMaster/></ProtectedRoute>}/>
 <Route path="/CashPaymentHead" element={<ProtectedRoute><CashPaymentHead/></ProtectedRoute>}/>
 <Route path="/CategoryMaster" element={<ProtectedRoute><CategoryMaster/></ProtectedRoute>}/>
 <Route path="/CulMedHdMaster" element={<ProtectedRoute><CulMedHdMaster/></ProtectedRoute>}/>
 <Route path="/GodownMaster" element={<ProtectedRoute><GodownMaster/></ProtectedRoute>}/>
 <Route path="/ItemGroupMaster" element={<ProtectedRoute><ItemGroupMaster/></ProtectedRoute>}/>
 {/* <Route path="/RemarksM" element={<ProtectedRoute><RemarksM/></ProtectedRoute>}/> */}
 {/* <Route path="/TestMaster" element={<ProtectedRoute><TestMaster/></ProtectedRoute>}/> */}
 {/* <Route path="/DiagnosticParameterSetup" element={<ProtectedRoute><DiagnosticParameterSetup/></ProtectedRoute>}/> */}





 {/* booking  app  */}

<Route path="/Patient-list" element={<ProtectedRoute><PatientList/></ProtectedRoute>}/>

{/* <Route path="/ambulance-list" element={<Amb />} />
<Route path="/add-ambulance" element={<AddAmbulance />} />
<Route path="/edit-ambulance/:id" element={<EditAmbulance />} />
<Route path="/pickup-requests" element={<PickupRequestList />} /> */}






{/* //!   indoor  master */}


{/* indoor master from first---------------------  */}
          <Route path="/IndoorParameterSetup" element={<ProtectedRoute><IndoorParameterSetup /></ProtectedRoute>} />
          <Route path="/DepartmentGroup" element={<ProtectedRoute><DepartmentGroup/></ProtectedRoute>} />
          <Route path="/BedMaster" element={<ProtectedRoute><BedMaster/></ProtectedRoute>} />
          <Route path="/ReligionMaster" element={<ProtectedRoute><ReligionMaster/></ProtectedRoute>} />
          <Route path="/NurseMaster" element={<ProtectedRoute><NurseMaster/></ProtectedRoute>} />
          <Route path="/NurseStationMaster" element={<ProtectedRoute><NurseStationMaster/></ProtectedRoute>} />
          <Route path="/NurseStationDetailMaster" element={<ProtectedRoute><NurseStationDetailMaster/></ProtectedRoute>} />
          <Route path="/DayCareBedRate" element={<ProtectedRoute><DayCareBedRate/></ProtectedRoute>} />
          <Route path="/OTMaster" element={<ProtectedRoute><OTMaster/></ProtectedRoute>} />
          <Route path="/OTSlotMaster" element={<ProtectedRoute><OTSlotMaster/></ProtectedRoute>} />
          <Route path="/OTType" element={<ProtectedRoute><OTType /></ProtectedRoute>} />
          <Route path="/OTCategory" element={<ProtectedRoute><OTCategory/></ProtectedRoute>} />
          <Route path="/OTItemMaster" element={<ProtectedRoute><OTItemMaster/></ProtectedRoute>} />
          
          <Route path="/CashlessMaster" element={<ProtectedRoute><CashlessMaster/></ProtectedRoute>}/>
          <Route path="/ConsentMaster" element={<ProtectedRoute><ConsentMaster/></ProtectedRoute>}/>
          <Route path="/BillPrintHeadMaster" element={<ProtectedRoute><BillPrintHeadMaster/></ProtectedRoute>}/>
          <Route path="/AgentMaster" element={<ProtectedRoute><AgentMaster/></ProtectedRoute>}/>



{/*      */}


{/* // Soumajit  */}



 <Route path="/profile-master" element={<ProfileMaster />} />
          <Route path="/ReferalMaster" element={<ReferalMaster />} />
          <Route path="/CompanyTestRate" element={<CompanyTestRate />} />
          <Route
            path="/CompanyWiseOtherChargesRate"
            element={<CompanyWiseOtherChargesRate />}
          />
          <Route
            path="/CompanyWiseOtItemRate"
            element={<CompanyWiseOtItemRate />}
          />
          <Route
            path="/CompanyWiseBedRateNew"
            element={<CompanyWiseBedRate />}
          />
          <Route path="/OtherChargesMaster" element={<OtherChargesMaster />} />


{/* // Soumajit end  */}




{/* BOOKING  APP -- DEB */}

{/* 
<Route path="/ambulance-list" element={<AmbulanceList />} />
<Route path="/add-ambulance" element={<AddAmbulance />} />
<Route path="/edit-ambulance/:id" element={<EditAmbulance />} />
<Route path="/pickup-requests" element={<PickupRequestList />} /> */}


{/* ambulance------------------------  */}
<Route path="/AddAmbulance" element={<AddAmbulance/>}/>
<Route path="/ambulance-list" element={<AmbulanceList/>}/>
<Route path="/pickup-requests" element={<PickupRequestList/>}/>
          {/* newly added routes end here */}

{/* bookingapp----------------------------  */}




          <Route path="/DiagnosticBookingList" element={<DiagnosticBookingList/>}/>
          <Route path="/PackageManagement" element={<PackageManagement/>}/>
          <Route path="/prescription-delivery" element={<PrescriptionDelivery/>}/>
          <Route path="/GenericMedicineManagement" element={<GenericMedicineManagement/>}/>
          <Route path="/razorpay-settings" element={<RazorpaySettings/>}/>
          <Route path="/app-terms-settings" element={<AppTermsSettings/>}/>
          <Route path="/app-banner-settings" element={<AppBannerSettings/>}/>
          {/* -----------------------------------------------------  */}


 <Route path="/nurshing_care" element={<NurshingCare />} />
          <Route path="/nursing-bookings" element={<NurshingBookingList />} />
          <Route path="/app-social-media-settings" element={<AppSocialMediaSettings/>} />



<Route path="/CampingManagement" element={<CampingManagement/>} />
<Route path="/patient-actions" element={<PatientActions/>} />




{/* deb  dia mass */}

<Route path="/LaboratoryQuery" element={<ProtectedRoute><LaboratoryQuery/></ProtectedRoute>}/>
<Route path="/OTBillingIpd" element={<ProtectedRoute><OTBillingIpd/></ProtectedRoute>}/>




<Route path="/TestReportSeq" element={<ProtectedRoute><TestReportSeq/></ProtectedRoute>}/>
<Route path="/Formula" element={<Formula />} />
<Route path="/TypeOfService" element={<ProtectedRoute><TypeOfService/></ProtectedRoute>}/>
<Route path="/active-doctors" element={<ProtectedRoute><ActiveDoctors/></ProtectedRoute>} />
<Route path="/CultureMedicine" element={<ProtectedRoute><CulMedHdMaster/></ProtectedRoute>}/>
  <Route path="/Saluation" element={<ProtectedRoute><Saluation/></ProtectedRoute>}/> 
  <Route path="/SampleType" element={<ProtectedRoute><SampleType/></ProtectedRoute>}/>
   <Route path="/SubCompany" element={<ProtectedRoute><SubCompany/></ProtectedRoute>}/>
   <Route path="/DiagProfile" element={<ProtectedRoute><DiagProfile/></ProtectedRoute>}/>
    <Route path="/Collector" element={<ProtectedRoute><Collector/></ProtectedRoute>}/>
   <Route path="/ReportHeading" element={<ProtectedRoute><ReportHeading/></ProtectedRoute>}/>
  <Route path="/EditMarketingExecutive" element={<ProtectedRoute><EditMarketingExecutive/></ProtectedRoute>}/>
  <Route path="/Composition" element={<ProtectedRoute><Composition/></ProtectedRoute>}/>
   <Route path="/CompanyMaster" element={<ProtectedRoute><CompanyMaster/></ProtectedRoute>}/>
      <Route path="/Batch" element={<ProtectedRoute><Batch/></ProtectedRoute>}/>  <Route path="/TestMaster" element={<ProtectedRoute><TestMaster/></ProtectedRoute>}/>

 <Route path="/department" element={<DepartmentSubdepartment/>}/>
 <Route path="/doctor" element={<DoctorManagement/>}/>
<Route path="/doctor-wise-appointments" element={<DoctorWiseAppointments />} />
<Route path="/MoneyReceipt" element={<ProtectedRoute><MoneyReceipt/></ProtectedRoute>}/>
<Route path="/Refund" element={<ProtectedRoute><Refund/></ProtectedRoute>}/>
 <Route path="/Opd_Other_Charges" element={<ProtectedRoute><OtherChargesss/></ProtectedRoute>}/>

      {/* sou dia  mas */}

{/* blood report format start */}
          <Route
            path="/BloodReport"
            element={ 
              <ProtectedRoute>
                <BloodReport />
              </ProtectedRoute>
            }
          />  
          <Route
            path="/BloodReport/Add"
            element={ 
              <ProtectedRoute>
                <BloodReportAdd />
              </ProtectedRoute>
            }
          />  
          <Route
            path="/BloodReport/:id/:mode"
            element={ 
              <ProtectedRoute>
                <BloodReport />
              </ProtectedRoute>
            }
          />  

{/* blood report format end */}




<Route path="/RemarksMaster" element={<ProtectedRoute><RemarksMaster/></ProtectedRoute>}/>

 <Route path="/TestPara" element={<TestParameter/>}/>

 <Route path="/DiscountAllowedMaster" element={<DiscountAllowedMaster/>}/>

 <Route path="/DiagnosticParameterSetup" element={<DiagnosticParameterSetup/>}/>
 <Route path="/DrIPCategory" element={<ProtectedRoute><DrIPCategory/></ProtectedRoute>}/>
  
 <Route path="/EditTestRate" element={<EditTestRate />} />

<Route path="/PackageMaster" element={<PackageMaster/>}/>
  <Route path="/*" element={<ComingSoon />} />


 










{/* //!   sir  given  */}

        
          {/* <Route path="/DiagBooking" element={<DiagBooking/>}/> */}
          <Route path="/TestReportingSequence" element={<TestReportingSequence/>}/>
          <Route path="/TestPropertyGroup" element={<TestPropertyGroup/>}/>
          <Route path="/AgentBusiness" element={<AgentBusiness/>}/>     
          <Route path="/AgentForm" element={<AgentForm/>}/>     
          <Route path="/DoctorBusiness" element={<DoctorBusiness/>}/>    
           {/* <Route path="/DiagBookingList" element={<DiagBookingList/>}/>  */}

           
              
 <Route path="/CompanyTestRateSetup" element={<CompanyTestRateSetup/>}/>    
 <Route path="/DueOnAccount" element={<DueOnAccount/>}/>   
<Route path="/ItemMaster" element={<ItemMaster/>}/>   
<Route path="/LaboratoryQuery" element={<LaboratoryQuery/>}/>  
<Route path="/OpeningBalanceItem" element={<OpeningBalanceItem/>}/>  
{/* <Route path="/SpecialProperty" element={<SpecialProperty/>}/>   */}
 
<Route path="/SampleCollection" element={<SampleCollection/>}/>  
<Route path="/SampleCollectionDetails" element={<SampleCollectionDetails/>}/>  

<Route path="/PathologistSignatory" element={<PathologistSignatory/>}/>  
<Route path="/RadiologyRequisition" element={<RadiologyRequisition/>}/>  
<Route path="/RadiologyRequisitionDetail" element={<RadiologyRequisitionDetail/>}/>  

<Route path="/SubDepartment" element={<SubDepartment/>}/>  

<Route path="/ReceptionReporting" element={<ReceptionReporting/>}/>  




{/* ai */}

 <Route path="/" element={<AiChat />} />
          <Route
            path="/aiAppointmentHistory"
            element={<AiAppointmentHistory />}
          />
          <Route path="/userAiBookings" element={<UserAiBookings />} />
          <Route path="/aiUserChat" element={<AiChat />} />
          <Route path="/aiDoctorChat" element={<AiChatDoctor />} />
          <Route path="/aiChatOld" element={<AiChatOld />} />
          <Route path="/aiSettings" element={<AiSettings />} />
          <Route path="/aiPrescription" element={<AiPrescription />} />
          <Route path="/aiMedicalImaging" element={<AiMedicalImaging />} />
          <Route path="/aiTreatmentPlan" element={<AiTreatmentPlan />} />
          <Route path="/aiDrugInteraction" element={<AiDrugInteraction />} />
          <Route path="/aiHealthAnalytics" element={<AiHealthAnalytics />} />
          <Route path="/aiScribe" element={<AiScribe />} />
{/* ai */}

{/* WhatsApp API routes */}
          <Route path="/whatsapp/send-text" element={<ProtectedRoute><SendText /></ProtectedRoute>} />
          <Route path="/whatsapp/send-media" element={<ProtectedRoute><SendMedia /></ProtectedRoute>} />
          <Route path="/whatsapp/send-button" element={<ProtectedRoute><SendButton /></ProtectedRoute>} />
          <Route path="/whatsapp/send-poll" element={<ProtectedRoute><SendPoll /></ProtectedRoute>} />
          <Route path="/whatsapp/send-list" element={<ProtectedRoute><SendList /></ProtectedRoute>} />
          <Route path="/whatsapp/send-location" element={<ProtectedRoute><SendLocation /></ProtectedRoute>} />
          <Route path="/whatsapp/send-vcard" element={<ProtectedRoute><SendVCard /></ProtectedRoute>} />
          <Route path="/whatsapp/send-sticker" element={<ProtectedRoute><SendSticker /></ProtectedRoute>} />
          <Route path="/whatsapp/send-product" element={<ProtectedRoute><SendProduct /></ProtectedRoute>} />
          <Route path="/whatsapp/send-channel" element={<ProtectedRoute><SendTextChannel /></ProtectedRoute>} />
          <Route path="/whatsapp/check-number" element={<ProtectedRoute><CheckNumber /></ProtectedRoute>} />
          <Route path="/whatsapp/user-management" element={<ProtectedRoute><UserManagementWA /></ProtectedRoute>} />
          <Route path="/whatsapp/device-management" element={<ProtectedRoute><DeviceManagement /></ProtectedRoute>} />
{/* WhatsApp API routes end */}










    
        </Route>
        <Route path="/login" element={<Login3 />} />
        <Route path="/login2" element={<Login2 />} />
        <Route path="/login3" element={<Login3 />} />
        <Route path="/login-old" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/registration2" element={<Registration2 />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/updatePassword" element={<UpdatePassword />} />
        <Route path="/loginStatus" element={<LoginStatus />} />
        <Route path="/error400" element={<Error400 />} />
        <Route path="/error403" element={<Error403 />} />
        <Route path="/error404" element={<Error404 />} />
        <Route path="/error408" element={<Error408 />} />
        <Route path="/error500" element={<Error500 />} />
        <Route path="/error503" element={<Error503 />} />
        <Route path="/error504" element={<Error504 />} />
        {/* <Route path="/*" element={<ComingSoon />} /> */}
        <Route path="/comingSoon2" element={<ComingSoon2 />} />
        <Route path="/pricingTable" element={<PricingTable />} />
        <Route path="/pricingTable2" element={<PricingTable2 />} />
        <Route path="/underConstruction" element={<UnderConstruction />} />
      </Routes>
    </Router>
  );
}

export default App;
