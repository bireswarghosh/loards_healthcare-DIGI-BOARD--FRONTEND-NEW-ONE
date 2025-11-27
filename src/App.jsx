import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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

import Emr from "./pages/bireswar_pages/outdoor/Emr/Emr.jsx";



import VisitEntry from "./pages/bireswar_pages/outdoor/Visit_Entry/VisitEntry.jsx";
import DrRectVisitDetail from "./pages/bireswar_pages/outdoor/Dr_Rect_Visit_Detail/DrRectVisitDetail.jsx";
import OtherCharges from "./pages/bireswar_pages/outdoor/Other_Charges/OtherCharges.jsx";
import IVFBIODATAMASTER from "./pages/bireswar_pages/outdoor/IVF/IVFBIODATAMASTER.jsx";
import VisitList from "./pages/bireswar_pages/outdoor/Visit_List/VisitList.jsx";
import DPackageMaster from "./pages/bireswar_pages/IndoorMaster/DPackageMaster/DPackageMaster.jsx";




import AdmissionList from "./components/indoor/indoor-patientAdmissionlist/AdmissionList.jsx";
import PatientAdmissionDetail from "./components/indoor/PatientAdmissionDetail/PatientAdmissionDetail.jsx";
import SampleReceipt from "./components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleReceipt.jsx";
import OtherCharges_indoor from "./components/indoor/PatientAdmissionDetail/OtherCharges/OtherCharges.jsx";
import OTBillingList from "./components/indoor/PatientAdmissionDetail/OTBillingList.jsx";
import OTBillingDetail from "./components/indoor/OTBillingDetail.jsx";
import OTNoteProcedure from "./components/indoor/OTNoteProcedure.jsx";
import DoctorVisit from "./components/indoor/DoctorVisit.jsx";
import BedTransfer from "./components/indoor/BedTransfer.jsx";
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
import RemarksMaster from "./templates/OUTDOOR MASTER/RemarksMaster.jsx"
import VisitourMaster from "./templates/OUTDOOR MASTER/VisitourMaster.jsx"
import VisitTypeGrpMaster from "./templates/OUTDOOR MASTER/VisitTypeGrpMaster.jsx"
import VisittypeMaster from "./templates/OUTDOOR MASTER/VisittypeMaster.jsx"
import RoomNoMaster from "./templates/OUTDOOR MASTER/RoomNoMaster.jsx"
import ServiceMaster from "./templates/OUTDOOR MASTER/ServiceMaster.jsx"
import OutdoorOtherChargeMaster from "./templates/OUTDOOR MASTER/OutdoorOtherChargeMaster.jsx"
import OutdoorParameterSetup from "./templates/OUTDOOR MASTER/OutdoorParameterSetup.jsx"
import CategoryMaster from "./templates/DiagnosisMaster/CategoryMaster.jsx"


import CulMedHdMaster from "./templates/DiagnosisMaster/CulMedHd.jsx"
import GodownMaster from "./templates/DiagnosisMaster/GodownMaster.jsx"
import ItemGroupMaster from "./templates/DiagnosisMaster/ItemGroupMaster.jsx"
import RemarksM from "./templates/DiagnosisMaster/RemarksMaster.jsx"
import TestMaster from "./templates/DiagnosisMaster/Test.jsx"
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
import NurshingBookingList from "./components/bookingApp/NurshingBooking/NurshingBookingList.jsx";import AppSocialMediaSettings from "./components/bookingApp/AppSocialMediaSettings/AppSocialMediaSettings.jsx";


// import AddAmbulance from "./components/Ambulance";
import AddAmbulance from "./components/Ambulance/AddAmbulance.jsx";
import AmbulanceList from "./components/Ambulance/AmbulanceList.jsx";
import PickupRequestList from "./components/Ambulance/PickupRequestList.jsx";
import CampingManagement from "./pages/Emr dummy/CampingManagement.jsx";
import PatientActions from "./pages/Emr dummy/PatientActions.jsx";



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
          <Route path="/emr" element={<ProtectedRoute><Emr /></ProtectedRoute>} />

       

          {/* newly added routes */}
          <Route path="/visit_entry" element={<ProtectedRoute><VisitEntry /></ProtectedRoute>} />
          <Route path="/table-data" element={<ProtectedRoute><VisitList /></ProtectedRoute>} />
          <Route path="/dr-rect-visit-detail" element={<ProtectedRoute><DrRectVisitDetail /></ProtectedRoute>} />
          <Route path="/other_charges" element={<ProtectedRoute><OtherCharges /></ProtectedRoute>} />
          <Route path="/IVFBiodataMaster" element={<ProtectedRoute><IVFBIODATAMASTER /></ProtectedRoute>} />
          <Route path="/dpackage-master" element={<ProtectedRoute><DPackageMaster /></ProtectedRoute>} />

          {/* newly added routes end here */}


{/* indoor route start---------------------------------  */}
          <Route path="/PatientRegistrationList" element={<ProtectedRoute><AdmissionList /></ProtectedRoute>} />
          <Route path="/PatientAdmissionDetail" element={<ProtectedRoute><PatientAdmissionDetail /></ProtectedRoute>}/>
          <Route path="/sampleReceipts" element={<ProtectedRoute><SampleReceipt /></ProtectedRoute>} />
          <Route path="/othercharges" element={<ProtectedRoute><OtherCharges /></ProtectedRoute>} />
          <Route path="/OTBillingList" element={<ProtectedRoute><OTBillingList /></ProtectedRoute>} />
          <Route path="/OTBillingDetail" element={<ProtectedRoute><OTBillingDetail /></ProtectedRoute>} />
          <Route path="/OTNoteProcedure" element={<ProtectedRoute><OTNoteProcedure /></ProtectedRoute>} />
          <Route path="/DoctorVisit" element={<ProtectedRoute><DoctorVisit /></ProtectedRoute>} />
          <Route path="/BedTransfer" element={<ProtectedRoute><BedTransfer /></ProtectedRoute>} />
          <Route path="/Estimate" element={<ProtectedRoute><Estimate /></ProtectedRoute>} />
          <Route path="/DischargeAndAdvise"element={<ProtectedRoute><DischargeAndAdvice_Details /></ProtectedRoute>}/>
          <Route path="/DischargeAndAdvise_details" element={<ProtectedRoute><DischargeAndAdvise /></ProtectedRoute>}/>
          <Route path="/DischargeAdvise" element={<ProtectedRoute><DischargeAdvise /></ProtectedRoute>} />
          <Route path="/DischargeMrd" element={<ProtectedRoute><DischargeMrd/></ProtectedRoute>}/>
          <Route path="/FinalBillQuery" element={<ProtectedRoute><FinalBillQuery/></ProtectedRoute>} />
          <Route path="/FinalBillingDetail" element={<ProtectedRoute><FinalBillingDetail/></ProtectedRoute>} />
          <Route path="/FinalBillingList" element={<ProtectedRoute><FinalBillingList/></ProtectedRoute>} />
          <Route path="/PatientEnquiryDetail" element={<ProtectedRoute><PatientEnquiryDetail/></ProtectedRoute>} />
          {/* indoor route end---------------------------------  */}






{/* master */}



 <Route path="/AdviceMaster" element={<ProtectedRoute><AdviceMaster/></ProtectedRoute>}/>
 <Route path="/ChiefMaster" element={<ProtectedRoute><ChiefMaster/></ProtectedRoute>}/>
 <Route path="/CompanymstMaster" element={<ProtectedRoute><CompanymstMaster/></ProtectedRoute>}/>
 <Route path="/DiagoMaster" element={<ProtectedRoute><DiagoMaster/></ProtectedRoute>}/>
 <Route path="/DoseMaster" element={<ProtectedRoute><DoseMaster/></ProtectedRoute>}/>
 <Route path="/PastHistoryMaster" element={<ProtectedRoute><PastHistoryMaster/></ProtectedRoute>}/>
 <Route path="/RemarksMaster" element={<ProtectedRoute><RemarksMaster/></ProtectedRoute>}/>
 <Route path="/VisitourMaster" element={<ProtectedRoute><VisitourMaster/></ProtectedRoute>}/>
 <Route path="/VisitTypeGrpMaster" element={<ProtectedRoute><VisitTypeGrpMaster/></ProtectedRoute>}/>
 <Route path="/VisittypeMaster" element={<ProtectedRoute><VisittypeMaster/></ProtectedRoute>}/>
 <Route path="/RoomNoMaster" element={<ProtectedRoute><RoomNoMaster/></ProtectedRoute>}/>
 <Route path="/ServiceMaster" element={<ProtectedRoute><ServiceMaster/></ProtectedRoute>}/>
 <Route path="/OutdoorOtherChargeMaster" element={<ProtectedRoute><OutdoorOtherChargeMaster/></ProtectedRoute>}/>
 <Route path="/OutdoorParameterSetup" element={<ProtectedRoute><OutdoorParameterSetup/></ProtectedRoute>}/>
 <Route path="/CategoryMaster" element={<ProtectedRoute><CategoryMaster/></ProtectedRoute>}/>
 <Route path="/CulMedHdMaster" element={<ProtectedRoute><CulMedHdMaster/></ProtectedRoute>}/>
 <Route path="/GodownMaster" element={<ProtectedRoute><GodownMaster/></ProtectedRoute>}/>
 <Route path="/ItemGroupMaster" element={<ProtectedRoute><ItemGroupMaster/></ProtectedRoute>}/>
 <Route path="/RemarksM" element={<ProtectedRoute><RemarksM/></ProtectedRoute>}/>
 <Route path="/TestMaster" element={<ProtectedRoute><TestMaster/></ProtectedRoute>}/>





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
        <Route path="/comingSoon" element={<ComingSoon />} />
        <Route path="/comingSoon2" element={<ComingSoon2 />} />
        <Route path="/pricingTable" element={<PricingTable />} />
        <Route path="/pricingTable2" element={<PricingTable2 />} />
        <Route path="/underConstruction" element={<UnderConstruction />} />
      </Routes>
    </Router>
  );
}

export default App;
