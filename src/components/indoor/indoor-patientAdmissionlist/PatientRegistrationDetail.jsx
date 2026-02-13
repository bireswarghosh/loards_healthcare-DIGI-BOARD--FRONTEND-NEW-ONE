import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Barcode from "react-barcode"; // Assuming usage from File A
import axiosInstance from "../../../axiosInstance";
import { toast } from "react-toastify";

const PatientAdmission = () => {
  const { id } = useParams(); // To handle Edit mode
  const navigate = useNavigate();

  // --- State from File A ---
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get("mode");
    if (id) {
      return modeParam || "view";
    }
    return "create";
  });

  // Pagination & Drawers State
  const [doctorsPerPage] = useState(8);
  const [showDoctorDrawer, setShowDoctorDrawer] = useState(false);
  const [selectedDoctorField, setSelectedDoctorField] = useState("");
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [currentDoctorPage, setCurrentDoctorPage] = useState(1);

  const [bedsPerPage] = useState(8);
  const [showBedDrawer, setShowBedDrawer] = useState(false);
  const [bedSearchQuery, setBedSearchQuery] = useState("");
  const [currentBedPage, setCurrentBedPage] = useState(1);
  const [totalBedPages, setTotalBedPages] = useState(1);
  const [drawerBeds, setDrawerBeds] = useState([]);

  const [opdPerPage] = useState(20);
  const [showOPDDrawer, setShowOPDDrawer] = useState(false);
  const [opdSearchQuery, setOPDSearchQuery] = useState("");
  const [currentOPDPage, setCurrentOPDPage] = useState(1);
  const [totalOPDPages, setTotalOPDPages] = useState(1);
  const [drawerOPDs, setDrawerOPDs] = useState([]);

  // Data Lists State
  const [doctors, setDoctors] = useState([]);
  const [district, setDistrict] = useState([]);
  const [diet, setDiet] = useState([]);
  const [religion, setReligion] = useState([]);
  const [department, setDepartment] = useState([]);
  const [mExecutives, setMExecutives] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [bed, setBed] = useState([]);
  const [selectedBedName, setSelectedBedName] = useState("");
  const [fetchedCashLess, setFetchedCashLess] = useState([]);
  const [fetchedCompany, setFetchedCompany] = useState([]);
  const [fetchedInsCompany, setFetchedInsCompany] = useState([]);
  const [referral, setReferral] = useState([]);
  const [dayCare, setDayCare] = useState([]);
  const [rmo, setRmo] = useState([]);
  const [packages, setPackages] = useState([]);
  const [fetchedState, setFetchedState] = useState([]);

  const [selBed, setSelBed] = useState("")

  // Main Form Data
  const [formData, setFormData] = useState({
    AdmitionDate: new Date().toISOString().split("T")[0],
    AdmitionTime: "13:15",
    BillTime: "12:00",
    OPD: "Y",
    OPDId: "",
    Booking: "N",
    BookingId: null,
    PatientName: "",
    Add1: "",
    Add2: "",
    Add3: "",
    Age: 0,
    AgeType: "Y",
    Sex: "M",
    MStatus: "U",
    PhoneNo: "",
    AreaId: "",
    ReligionId: "",
    GurdianName: "",
    Relation: "",
    RelativeName: "",
    RelativePhoneNo: "",
    Company: "N",
    CompanyId: "",
    DepartmentId: "",
    BedId: "",
    UCDoctor1Id: "",
    UCDoctor2Id: "",
    UCDoctor3Id: 0,
    DiseaseId: "",
    RMOId: "",
    Referral: "N",
    ReferralId: 0,
    RefDoctorId: 0,
    Package: "N",
    PackageId: "",
    PackageAmount: 0,
    CashLess: "Y",
    CashLessId: "",
    UserId: 42,
    Status: "O",
    Discharge: "N",
    AdmitionNo: "",
    AdmitionNo1: "",
    Rename: null,
    AdmType: 0,
    InsComp: null,
    DayCareYN: "N",
    BedRate: 0,
    DayCareId: 0,
    PatientId: "",
    Remarks: "",
    SpRemarks: "",
    IdentNo: "",
    PolcNo: "",
    CCNNo: "",
    CardNo: "",
    PPN: 0,
    BillDone: "N",
    Occupation: "",
    Passport: "INDIAN",
    DietChartId: "",
    tpaper: null,
    PanNo: "",
    PackageCHK: 0,
    nameemployer: "",
    refdate: "",
    Nameemp: "",
    empcode: "",
    RefDoctorId2: 0,
    packagevalid: "",
    optdiagoinc: 0,
    optmediinc: 0,
    optotherchargeinc: 0,
    Weight: "0",
    oprationdate: "",
    optime: "",
    AgeD: 0,
    AgeTypeD: "M",
    AgeN: 0,
    AgeTypeN: "D",
    URN: "",
    packagestart: "",
    AcGenLedCompany: 0,
    optotinc: 0,
    MEXECUTIVE: "",
    PackageId2: null,
    PackageId3: null,
    PackageId4: null,
    PackageAmount2: null,
    PackageAmount3: null,
    PackageAmount4: null,
    Dob: "", // Calculated field
  });

  // --- Handlers & Effects from File A ---

  useEffect(() => {
    if (id) {
      fetchAdmission();
    } else {
      // Create mode fetches
      fetchDietChart();
      fetchDepartment();
      fetchDoctors();
      fetchState();
      fetchDistrict();
      fetchReligion();
      fetchMExecutive();
      fetchDiseases();
      fetcheBed();
      fetchCashLess();
      fetchCompany();
      fetchInsCompany();
      fetchReferral();
      fetchDayCare();
      fetchRMO();
      fetchPackages();
    }
  }, [id]);

  // useEffect(() => {
  //   console.log("Form data changed: ", formData);
  // }, [formData]);

  // API Functions
  const fetchDietChart = async () => {
    try {
      const dietData = await axiosInstance.get("/dietchart?page=1&limit=20");
      if (dietData.data.success) setDiet(dietData.data.data);
    } catch (error) {
      console.error("Error fetching diet chart:", error);
    }
  };

  const fetchReligion = async () => {
    try {
      const religionData = await axiosInstance.get("/religion");
      if (religionData.data.success) {
        setReligion([
          { ReligionId: 0, Religion: "---Select---" },
          ...religionData.data.data,
        ]);
      }
    } catch (error) {
      console.error("Error fetching religion:", error);
    }
  };

  const fetchDepartment = async () => {
    try {
      const departmentData = await axiosInstance.get("/departmentIndoor");
      if (departmentData.data.success) setDepartment(departmentData.data.data);
    } catch (error) {
      console.error("Error fetching department:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const fetchedDoctors = await axiosInstance.get("/doctors");
      if (fetchedDoctors.data.success) setDoctors(fetchedDoctors.data.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchDistrict = async () => {
    try {
      const fetchedDistrict = await axiosInstance.get("/zone");
      setDistrict([
        { ZoneId: null, Zone: "-- Select --" },
        ...fetchedDistrict.data,
      ]);
    } catch (error) {
      console.error("Error fetching zone:", error);
    }
  };

  const fetchState = async () => {
    try {
      const fetchedState = await axiosInstance.get("/zone");
      setFetchedState([
        { ZoneId: 0, Zone: "-- Select --" },
        ...fetchedState.data,
      ]);
    } catch (error) {
      console.error("Error fetching zone:", error);
    }
  };

  const fetchMExecutive = async () => {
    try {
      const res = await axiosInstance.get("/mexecutive");
      setMExecutives(res.data);
    } catch (error) {
      console.error("Error fetching mexecutive:", error);
    }
  };

  const fetchDiseases = async () => {
    try {
      const res = await axiosInstance.get("/disease");
      setDiseases([
        { DiseaseId: 0, Disease: "--- Select ---", Diseasecode: "" },
        ...res.data,
      ]);
    } catch (error) {
      console.error("Error fetching diseases:", error);
    }
  };

  const fetcheBed = async () => {
    try {
      const res = await axiosInstance.get("/bedMaster");
      if (res.data.success) setBed(res.data.data);
    } catch (error) {
      console.error("Error fetching bed:", error);
    }
  };

  const fetchBedById = async (bedId) => {
    if (!bedId) return;
    try {
      const response = await axiosInstance.get(`/bedMaster/${bedId}`);
      if (response.data.success) setSelectedBedName(response.data.data.Bed);
    } catch (error) {
      console.error("Error fetching bed by id:", error);
    }
  };

  const fetchDrawerBeds = async (page = 1, search = "") => {
    try {
      let url = `/bedMaster?page=${page}&limit=${bedsPerPage}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (formData.DepartmentId)
        url += `&DepartmentId=${formData.DepartmentId}`;
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        setDrawerBeds(response.data.data);
        setTotalBedPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching drawer beds:", error);
    }
  };

  const fetchDrawerOPDs = async (page = 1, search = "") => {
    try {
      setLoading(true);
      let url = `/patient-visits?page=${page}&limit=${opdPerPage}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        setDrawerOPDs(response.data.data || []);
        setTotalOPDPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching OPD:", error);
      setDrawerOPDs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOPDPatientData = async (registrationId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/patient-visits/registration?registrationId=${registrationId}`
      );
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const patientData = response.data.data[0];
        console.log("gg ", patientData);
        setFormData((prev) => ({
          ...prev,
          OPDId: registrationId,
          PatientName: patientData.PatientName || "",
          Add1: patientData.PatientAdd1 || "",
          Add2: patientData.PatientAdd2 || "",
          Add3: patientData.PatientAdd3 || "",
          Age: patientData.Age || 0,
          AgeD: patientData.AgeD || 0,
          AgeN: patientData.AgeN || 0,
          Sex: patientData.Sex || "M",
          PhoneNo: patientData.PhoneNo || "",
          MStatus: patientData.MStatus || "U",
          GurdianName: patientData.GurdianName || "",
          AreaId: patientData.AreaId || "",
          ReligionId: patientData.ReligionId || "",
          Weight: patientData.PatientWeight || patientData.Weight || "0",
          PatientId: patientData.RegistrationId || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching OPD patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashLess = async () => {
    try {
      const cashless = await axiosInstance.get("/cashless");
      if (cashless.data.success) {
        const newArr = [
          { CashlessId: 0, Cashless: "--- Select ---" },
          ...cashless.data.data,
        ];
        setFetchedCashLess(newArr);
      }
    } catch (error) {
      console.error("Error fetching CashLess:", error);
    }
  };

  const fetchCompany = async () => {
    try {
      const companies = await axiosInstance.get("/cashless");
      if (companies.data.success) {
        const newArr = [
          { CashlessId: 0, Cashless: "--- Select ---" },
          ...companies.data.data,
        ];
        setFetchedCompany(newArr);
      }
    } catch (error) {
      console.error("Error fetching Company:", error);
    }
  };

  const fetchInsCompany = async () => {
    try {
      const companies = await axiosInstance.get("/cashless");
      if (companies.data.success) {
        const newArr = [
          { CashlessId: 0, Cashless: "--- Select ---" },
          ...companies.data.data,
        ];
        setFetchedInsCompany(newArr);
      }
    } catch (error) {
      console.error("Error fetching Company:", error);
    }
  };

  const fetchReferral = async () => {
    try {
      const fetchedRefferal = await axiosInstance.get("/referal");
      setReferral([
        { ReferalId: 0, Referal: "--- Select ---" },
        ...fetchedRefferal.data,
      ]);
    } catch (error) {
      console.log("Error fetching Referral:", error);
    }
  };

  const fetchDayCare = async () => {
    try {
      const fetchedDayCare = await axiosInstance.get("/dayCare");
      setDayCare([
        { DayCareId: 0, DayCare: "--- Select", Rate: null },
        ...fetchedDayCare.data.data,
      ]);
    } catch (error) {
      console.error("Error fetching DayCare:", error);
    }
  };

  const fetchRMO = async () => {
    try {
      const fetchedRMO = await axiosInstance.get("/doctormaster/rmo");
      if (fetchedRMO.data.success) setRmo(fetchedRMO.data.data);
    } catch (error) {
      console.error("Error fetching RMO:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const fetchedPackages = await axiosInstance.get("/packages");
      if (fetchedPackages.data.success) {
        setPackages([
          { PackageId: 0, Package: "--- Select ---", Rate: 0 },
          ...fetchedPackages.data.data,
        ]);
      }
    } catch (error) {
      console.log("error fetching packages: ", error);
    }
  };

  const fetchAdmission = async () => {
    try {
      setLoading(true);
      const decodedId = decodeURIComponent(id);
      const response = await axiosInstance.get(`/admission/${decodedId}`);
      if (response.data.success) {
        const apiData = response.data.data;
        console.log("fetched data: ", apiData);

        if(apiData.BedId){
        const res = await axiosInstance.get(`/bedMaster/${apiData.BedId}`)
        if(res.data.success){
  console.log("selected bed: ",res.data.data.Bed)
  setSelBed(res.data.data.Bed || "")
}
      }
        setFormData(prev=>({...prev, BedId:apiData.BedId}))

        let calculatedDob = apiData.Dob ? apiData.Dob.substring(0, 10) : "";
        if (
          !calculatedDob &&
          apiData.AdmitionDate &&
          (apiData.Age || apiData.AgeD || apiData.AgeN)
        ) {
          try {
            const admDate = new Date(apiData.AdmitionDate);
            const years = parseInt(apiData.Age) || 0;
            const months = parseInt(apiData.AgeD) || 0;
            const days = parseInt(apiData.AgeN) || 0;
            const birthDate = new Date(admDate);
            birthDate.setFullYear(birthDate.getFullYear() - years);
            birthDate.setMonth(birthDate.getMonth() - months);
            birthDate.setDate(birthDate.getDate() - days);
            if (!isNaN(birthDate.getTime()))
              calculatedDob = birthDate.toISOString().substring(0, 10);
          } catch (e) {}
        }

        setFormData({
          ...apiData,
          AdmitionDate: apiData.AdmitionDate
            ? apiData.AdmitionDate.substring(0, 10)
            : "",
          OPD: apiData.OPD || "Y",
          Dob: calculatedDob,
          oprationdate: apiData.oprationdate
            ? apiData.oprationdate.substring(0, 10)
            : "",
          packagevalid: apiData.packagevalid
            ? apiData.packagevalid.substring(0, 10)
            : "",
          packagestart: apiData.packagestart
            ? apiData.packagestart.substring(0, 10)
            : "",
          refdate: apiData.refdate ? apiData.refdate.substring(0, 10) : "",
        });

        // Trigger fetches for edit mode
        fetchDietChart();
        fetchDepartment();
        fetchDoctors();
        fetchState();
        fetchDistrict();
        fetchReligion();
        fetchMExecutive();
        fetchDiseases();
        fetcheBed();
        fetchCashLess();
        fetchCompany();
        fetchInsCompany();
        fetchReferral();
        fetchDayCare();
        fetchRMO();
        fetchPackages();

        if (apiData.BedId) fetchBedById(apiData.BedId);
      }
    } catch (error) {
      console.error("Error fetching admission:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const calDayCareBedRate = (dayCareId) => {
    const result = dayCare.find((item) => item.DayCareId == dayCareId);
    // simplified logic from reference
  };

  const calPackageAmount = (id) => {
    const item = packages.find((pkg) => pkg.PackageId == id);
    if (item) setFormData((prev) => ({ ...prev, PackageAmount: item.Rate }));
  };

  const calDiseaseCode = (id) => {
    const item = diseases.find((d) => d.DiseaseId == id);
    // logic placeholder
  };

  // Input Handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDobChange = (value) => {
    if (value && formData.AdmitionDate) {
      try {
        const birthDate = new Date(value);
        const admDate = new Date(formData.AdmitionDate);
        if (!isNaN(birthDate.getTime()) && !isNaN(admDate.getTime())) {
          let years = admDate.getFullYear() - birthDate.getFullYear();
          let months = admDate.getMonth() - birthDate.getMonth();
          let days = admDate.getDate() - birthDate.getDate();
          if (days < 0) {
            months--;
            const lastMonth = new Date(
              admDate.getFullYear(),
              admDate.getMonth(),
              0
            );
            days += lastMonth.getDate();
          }
          if (months < 0) {
            years--;
            months += 12;
          }
          setFormData((prev) => ({
            ...prev,
            Dob: value,
            Age: years,
            AgeD: months,
            AgeN: days,
          }));
        }
      } catch (error) {
        setFormData((prev) => ({ ...prev, Dob: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, Dob: value }));
    }
  };

  const handleAgeChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Reverse calc DOB from age logic could be added here similar to file A
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const cleanData = { ...formData };
      // Clean up fields not in DB
      delete cleanData.Dob;
      delete cleanData.District;
      delete cleanData.State;

      const response =
        mode === "create"
          ? await axiosInstance.post("/admission", cleanData)
          : await axiosInstance.put(`/admission/${id}`, cleanData);

      if (response.data.success) {
        toast.success(
          `Admission ${mode === "create" ? "created" : "updated"} successfully!`
        );
        // alert(
        //   `Admission ${mode === "create" ? "created" : "updated"} successfully!`
        // );
        if (mode === "create") navigate("/PatientRegistrationList");
        else setMode("view");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Error saving admission");
      // alert("Error saving admission");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      setLoading(true);
      const response = await axiosInstance.delete(
        `/admission/${decodeURIComponent(id)}`
      );
      if (response.data.success) {
        alert("Deleted!");
        navigate("/PatientAdmission");
      }
    } catch (error) {
      alert("Error deleting");
    } finally {
      setLoading(false);
    }
  };


const handlePrint = (data) => {
    // 1. Open a new window
    const printWindow = window.open("", "", "height=800,width=1000");

    if (!printWindow) {
      alert("Please allow popups to print the document.");
      return;
    }

    // 2. Define the HTML content
    const htmlContent = `<!DOCTYPE html>
<html>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>

   <head>
      <title>Admission Form Print</title>
      <style>
         @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
         body {
         font-family: 'Roboto', sans-serif;
         font-size: 11px;
         margin: 0;
         padding: 20px;
         color: #000;
         }
         /* Utility Classes */
         .text-center { text-align: center; }
         .text-right { text-align: right; }
         .font-bold { font-weight: 700; }
         .text-red { color: red; }
         .uppercase { text-transform: uppercase; }
         .flex { display: flex; }
         .justify-between { justify-content: space-between; }
         .items-center { align-items: center; }
         .w-full { width: 100%; }
         .mt-2 { margin-top: 8px; }
         .mb-1 { margin-bottom: 4px; }
         /* Layout Structure */
         .container {
         width: 100%;
         max-width: 900px;
         margin: 0 auto;
         }
         /* Header */
         .header-grid {
         display: grid;
         grid-template-columns: 1fr 3fr 1fr;
         gap: 10px;
         align-items: center;
         margin-bottom: 10px;
         }
         .hospital-title { font-size: 24px; font-weight: bold; margin: 0; }
         .hospital-details { font-size: 10px; line-height: 1.4; }
         /* Barcode Placeholder */
         .barcode-box {
         text-align: center;
         }
         .barcode-lines {
         display: inline-block;
         height: 30px;
         width: 150px;
         background: repeating-linear-gradient(
         to right,
         black 0px, black 2px,
         white 2px, white 4px
         );
         }
         /* Form Sections */
         .form-title {
         text-align: center;
         font-size: 16px;
         font-weight: bold;
         color: red;
         margin: 10px 0;
         text-decoration: uppercase;
         }
         .meta-row {
         display: flex;
         justify-content: space-between;
         font-weight: bold;
         margin-bottom: 5px;
         font-size: 12px;
         }
         .section-box {
         border: 1px solid #000;
         padding: 5px 10px;
         margin-bottom: 5px;
         }
         /* Grid for key-value pairs inside boxes */
         .info-grid {
         display: grid;
         grid-template-columns: 100px 1fr 80px 1fr ;
         gap: 5px 10px;
         }
         .info-grid-2 {
         display: grid;
         grid-template-columns: 100px 1fr;
         gap: 5px 10px;
         }
         .label { font-weight: bold; }
         /* Terms and Footer */
         .terms-box {
         border: 1px solid #000;
         padding: 10px;
         font-size: 10px;
         line-height: 1.4;
         margin-top: 5px;
         }
         .terms-list { margin: 5px 0 0 15px; padding: 0; }
         .footer-box {
         margin-top: 20px;
       
         padding-top: 5px;
         }
         .checkbox {
         display: inline-block;
         width: 12px;
         height: 12px;
         border: 1px solid #000;
         margin-right: 5px;
         vertical-align: middle;
         position: relative;
         }
         /* Simulate checked state */
         .checkbox.checked::after {
         content: '✓';
         position: absolute;
         top: -4px;
         left: 1px;
         font-size: 12px;
         font-weight: bold;
         }
         .signature-row {
         display: flex;
         justify-content: space-between;
         margin-top: 40px;
         align-items: flex-end;
         }
         .signature-line {
         border-top: 1px solid #000;
         width: 200px;
         text-align: center;
         padding-top: 2px;
         }

.logo-img {
  height: 60px;     /* You can set any small size */
  width: auto;
}

.logo-wrapper {
  height: 60px;
  display: inline-block;
}



         /* Print Specifics */
         @media print {
         @page { margin: 0.5cm; }
         body { -webkit-print-color-adjust: exact; }
         }
      </style>
   </head>
   <body>
      <div class="container">
         <div class="header-grid">
           
             <div class="logo-wrapper">
   <img 
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLBp8HRkxkrAD3J_42s4lQdr95CDxPS-aQCQ&s" 
      alt="logo"
      class="logo-img"
   />
</div>


            
            <div class="text-center">
               <h1 class="hospital-title">${data.hospital.name}</h1>
               <div class="hospital-details">
                  ${data.hospital.address}<br>
                  Phone No.: ${data.hospital.phone} HELPLINE - 7003378414, Toll Free No. 1800-309-0895<br>
                  E-mail: ${data.hospital.email}, Website: ${data.hospital.website}
               </div>
            </div>
            <div class="barcode-box">
   <svg id="barcode"></svg>
   <div style="font-size:10px;">${data.meta.barcodeValue}</div>
</div>

         </div>
         <div class="form-title">ADMISSION FORM</div>
         <div class="flex justify-between font-bold mb-1">
            <span>UHID : ${data.meta.uhid}</span>
         </div>
         <div class="meta-row">
            <span>ADMISSION NO. : <span class="text-red">${data.meta.admissionNo}</span></span>
            <span>ADMISSION DATE : ${data.meta.admissionDate}</span>
            <span>ADMISSION TIME : ${data.meta.admissionTime}</span>
         </div>
         <div class="section-box">
            <div class="info-grid">

               <span class="label">PATIENT NAME</span> <span>: ${data.patient.name}</span>
               <span class="label">AGE</span> <span>: ${data.patient.age}</span>
               <span class="label">ADDRESS</span> <span>: ${data.patient.address}</span>
               <span class="label">GENDER</span> <span>: ${data.patient.gender}</span>
               <span class="label">AREA</span> <span>: ${data.patient.area}</span>
               <span class="label">RELIGION</span> <span>: ${data.patient.religion}</span>
               <span class="label">OCCUPATION</span> <span>: ${data.patient.occupation}</span>
               <span class="label">STATUS</span> <span>: ${data.patient.status}</span>
               
               <span class="label">PHONE NO.</span> <span>: ${data.patient.phone}</span>
              
               <span class="label">NATIONALITY</span> <span>: ${data.patient.nationality}</span>
               
            </div>
         </div>
         <div class="section-box">
            <div class="info-grid">
               <span class="label">W/O S/O D/O</span> <span>: ${data.relative.relatedToName}</span>
               <span class="label">RELATION</span> <span>: ${data.relative.relation}</span>
               <span class="label">RELATIVE NAME</span> <span>: ${data.relative.relativeName}</span>
               <span class="label">PHONE NO.</span> <span>: ${data.relative.phone}</span>
            </div>
         </div>
         <div class="section-box">
            <div class="info-grid">
               <span class="label">BED NO.</span> <span>: ${data.admissionDetails.bedNo}</span>
               <span class="label">DEPARTMENT</span> <span>: ${data.admissionDetails.department}</span>
            </div>
            <div class="info-grid-2 mt-2">
               <span class="label">UNDER CARE</span> <span>: ${data.admissionDetails.underCare}</span>
            </div>
         </div>
         <div class="section-box">
            <div class="info-grid">
               <span class="label">TPA</span> <span>: ${data.insurance.tpa}</span>
               <span class="label">COMPANY</span> <span>: ${data.insurance.company}</span>
            </div>
         </div>
         <div class="terms-box">
            <span style="margin:0; font-weight:bold;">I do hereby give my full consent to undertake treatment of above Patient by Medical Management, Surgical Management, Intensive Care at this Nursing Home.</span>
            <br>I ..................................................................... in my full sense hereby authorize Dr. ......................................................... & Such Associates, Doctors, Consultants, Nurses & Paramedical staff of Hospital to conduct all necessary Investigation, Medical/Surgical/Procedure on me/my patient under General or religional anaesthesia as deemed suitable for the same.
            <br>I agree to pay all the bills and when submitted by hospital authority for my/my patient's treatment , and clear all the dues of Nursing Home 
            incurred for the treatment of the patient before discharge /DORB.
            <br>I shall not hold the institution, it's staff and the doctors responsible for any unwanted consequences during the course of medical treatment 
            and the surgery administration of anaesthesia/drug or investigation/treatment etc..
            <br>I have been fully explained the consequences of the procedures and their risks.
            <strong style="display:block; margin-top:10px;">GENERAL NORMS FOR PATIENT ADMISSION:</strong>
            <ol class="terms-list">
               <li>An ADVANCE PAYMENT should be made at the time of admission accordingly. <br> a) Rs. 10000/- For GENERAL WARD. <br> b) Rs. 12000/- For CABINS. <br> c) Rs. 15000/- For ICU.</li>
               <li>A minimum of 80% to 85% amount of the surgery package must be paid before the operation.</li>
               <li>Patient should NOT bear any cash, valuables, mobile phone etc. during his/her stay in the Nursing Home.</li>
               <li>Only two persons are allowed during visiting hours, childrens are allowed only on Sunday evening.</li>
               <li>No foods from outside are allowed without prior permission.</li>
               <li>Patient availing cash less facility should submit  His/Her documents at the Insurance Desk.</li>
               <li>Patient Party should enquire about there outstanding payment regularly  from the respective counters, so that maximum outstanding does  
                  not exceeds Rs.10,000/
               </li>
               <li> Shifting from ICU to Ward depends on bed availiabilty.</li>
               <li> PATIENT / PARTIES ID DOCUMENT IS MANDATARY . PLEASE PROVIDE US AT THE EARLIEST.</li>
            </ol>
         </div>
         <div class="signature-row" style="margin-top:20px;">
            <div>
               <strong>Witness Signature with relation</strong><br>
               Contact No :
            </div>
         </div>
         <div class="footer-box">

         <div style=" display: flex;
  justify-content: space-between;">
        <div class="text-red font-bold text-center mb-1" style="font-size:10px;">
            Full charge on the day of the admission. No charge if the patient leaves before 11:30 am on the day of discharge.
         </div> 
         
         <div class="flex justify-between items-center" style="margin-top:-15px;">
            <div></div>
            <div class="signature-line">Signature of Patient / Party</div>
         </div>
         
         </div>

            <div class="text-center font-bold text-blue-900" style="margin: 10px 0; color: darkblue; border-top: 1px solid #000;">FOR OFFICE USE</div>
            <div class="flex justify-between font-bold" style="font-size:10px;">
               <span>Date of Admission: ${data.meta.admissionDate}</span>
               <span>Admission Time: ${data.meta.admissionTime}</span>
               <span class="text-red">Admission No: ${data.meta.admissionNo}</span>
               <span>Bed No: ${data.admissionDetails.bedNo}</span>
            </div>
            <div class="mt-2" style="font-size:10px;">
               <strong>Under Care Doctor:</strong> ${data.admissionDetails.underCare}
            </div>
            <div class="flex mt-2" style="gap: 20px; align-items:center;">
               <div class="text-red font-bold">VEGETARIAN :</div>
               <div><span class="checkbox"></span> YES</div>
               <div><span class="checkbox"></span> NO</div>
               <div class="text-red font-bold ml-4">Insurance / TPA :</div>
            </div>
            <div class="flex mt-2" style="gap: 20px; align-items:center;">
               <div class="text-red font-bold">Patient's History :</div>
               <div><span class="checkbox"></span> Diabetic</div>
               <div><span class="checkbox"></span> HTN</div>
              
               <div><span class="checkbox"></span> Asthma</div>
               <div><span class="checkbox"></span> Cardiac</div>
              
            </div>
            <div class="flex mt-2" style="gap: 20px; align-items:center;">
               <div class="text-red font-bold">Allergies to Food and/or Drugs :</div>
               <div><span class="checkbox "></span> Asprin/Ecosprin</div>
               <div><span class="checkbox "></span> Clopitogril</div>
              
               <div><span class="checkbox"></span> Others</div>
          
              
            </div>
            <div class="signature-row" style="margin-top:20px;">
               <div>Signature of the Front Office Executive : SANJAY ST.</div>
               <div>_____________________________________________________________________</div>
               <div class="text-right">DATE : ${data.meta.admissionDate}</div>
            </div>
         </div>
      </div>
      <script>
window.onload = function () {
   JsBarcode("#barcode", "${data.meta.barcodeValue}", {
      format: "CODE128",
      lineColor: "#000",
      width: 1,
      height: 25,
      displayValue: false
   });

   // Print after barcode is ready
   window.print();
   window.close();
};
</script>

   </body>
</html>`;

    // 3. Write content and print
    printWindow.document.write(htmlContent);
    printWindow.document.close(); // Necessary for some browsers to finish loading
    printWindow.focus(); // Focus on the new window

    // Wait slightly for styles to apply before printing
    setTimeout(() => {
      printWindow.print();
      // Optional: printWindow.close(); // Auto-close after print
    }, 250);
  };



  // Styles from File B
  const inputStyle = {
    fontSize: "0.85rem",
    padding: "0px 4px",
    height: "24px",
    borderRadius: "0px",
    color: "var(--secondary-color)",
  };
  const labelStyle = {
    fontSize: "0.7rem",
    fontWeight: "bold",
    margin: "0",
    whiteSpace: "nowrap",
    color: "var(--secondary-color)",
  };

  return (
    <div className="main-content">
      <div
        className="panel"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "Tahoma, sans-serif",
          border: "1px solid #bf1f1fff",
        }}
      >
        {/* HEADER */}
        <div
          className="panel-header d-flex justify-content-between align-items-center px-2 border-bottom"
          style={{ height: "35px", flexShrink: 0 }}
        >
          {/* Left Side: Title */}
          <div className="d-flex align-items-center ">
            <h6
              className="m-0 fw-bold"
              style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}
            >
              Patient Admission
            </h6>
            {/* {console.log("for: ",formData)} */}
            {/* 
            {formData.AdmitionId && (
              <Barcode
                value={formData.AdmitionNo}
                format="CODE128"
                width={1}
                height={25}
                displayValue={false} // Match PatientRegistrationDetail-1.jsx
                margin={5}
              />
            )} */}
          </div>

          <div>
            {formData.AdmitionId && (
              <Barcode
                value={formData.AdmitionNo}
                format="CODE128"
                width={1}
                height={25}
                displayValue={false} // Match PatientRegistrationDetail-1.jsx
                margin={5}
              />
            )}
            {"  "}
            {/* Right Side: Button (Moved outside the inner div) */}
            <button
              className="btn btn-sm btn-primary pb-3 pt-0"
              onClick={() => navigate("/PatientRegistrationList")}
              style={{ fontSize: "0.75rem", height: "26px" }}
            >
              ← Back
            </button>
          </div>
        </div>

        <div
          className="panel-body p-0 d-flex flex-column flex-grow-1"
          style={{ overflow: "hidden" }}
        >
          {/* MAIN SCROLLABLE CONTENT */}
          <div
            className="flex-grow-1 bg-rt-color-dark position-relative"
            style={{ overflow: "hidden" }}
          >
            <OverlayScrollbarsComponent
              style={{ height: "100%", width: "100%" }}
            >
              {/* --- ADMISSION DETAIL --- */}
              <div className="p-2 border-bottom">
                <div className="d-flex flex-wrap gap-2">
                  <div className="flex-grow-1">
                    {/* Header Line */}
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Admission Detail
                      </label>
                      <div className="border-bottom flex-grow-1 border-primary"></div>
                    </div>

                    {/* Fields Row 1 */}
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <div className="d-flex align-items-center gap-1">
                        <label style={{ ...labelStyle, width: "80px" }}>
                          Admission No
                        </label>
                        <input
                          type="text"
                          name="AdmitionNo"
                          value={formData.AdmitionNo}
                          onChange={handleInputChange}
                          readOnly
                          style={{ ...inputStyle, width: "120px" }}
                        />
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <label style={{ ...labelStyle }}>Date</label>
                        <input
                          type="date"
                          name="AdmitionDate"
                          value={formData.AdmitionDate}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, width: "110px" }}
                        />
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <label style={{ ...labelStyle }}>Bill Time</label>
                        <input
                          type="text"
                          name="BillTime"
                          value={formData.BillTime}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, width: "80px" }}
                        />
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <label style={{ ...labelStyle }}>Adm. Time</label>
                        <input
                          type="text"
                          name="AdmitionTime"
                          value={formData.AdmitionTime}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, width: "80px" }}
                        />
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <label style={{ ...labelStyle, width: "80px" }}>
                          O.P.D. [Y/N]
                        </label>
                        <select
                          name="OPD"
                          value={formData.OPD}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            width: "50px",
                            padding: "0 2px",
                          }}
                        >
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                        <button
                          className="btn btn-sm btn-primary rounded-0"
                          style={{
                            height: "24px",
                            fontSize: "0.7rem",
                            padding: "0 5px",
                          }}
                          onClick={async () => {
                            if (mode !== "view" && formData.OPD === "Y") {
                              setShowOPDDrawer(true);
                              setCurrentOPDPage(1);
                              setOPDSearchQuery("");
                              await fetchDrawerOPDs(1, "");
                            }
                          }}
                        >
                          ...
                        </button>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <label style={{ ...labelStyle }}>Booking [Y/N]</label>
                        <select
                          name="Booking"
                          value={formData.Booking}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            width: "50px",
                            padding: "0 2px",
                          }}
                        >
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <label style={{ ...labelStyle }}>Patient Id</label>
                        <input
                          type="text"
                          name="PatientId"
                          value={formData.PatientId}
                          // onChange={handleInputChange}
                          style={{ ...inputStyle, width: "100px" }}
                        />
                        <button
                          className="btn btn-sm btn-primary rounded-0"
                          style={{ height: "24px", fontSize: "0.7rem" }}
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- BLUE BODY SECTION --- */}
              <div className="p-2">
                {/* PATIENT DETAIL SECTION */}
                <div className="row g-2 mb-2">
                  <div className="col-12 border-bottom border-secondary mb-1">
                    <span style={{ fontSize: "0.75rem" }}>Patient Detail</span>
                  </div>

                  {/* Left Column */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Patient's Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="PatientName"
                        value={formData.PatientName}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="Add1"
                        value={formData.Add1}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Area
                      </label>
                      <input
                        type="text"
                        name="Add2"
                        value={formData.Add2}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Pin Code
                      </label>
                      <input
                        type="text"
                        name="Add3"
                        value={formData.Add3}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="Occupation"
                        value={formData.Occupation}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Middle Column */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        DOB <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        name="Dob"
                        value={formData.Dob}
                        onChange={(e) => handleDobChange(e.target.value)}
                        style={{ ...inputStyle, width: "95px" }}
                      />
                      <div className="d-flex align-items-center gap-1 ms-1">
                        <label style={{ ...labelStyle }}>Age</label>
                        <input
                          type="text"
                          name="Age"
                          className="form-control form-control-sm rounded-0 text-center"
                          value={formData.Age}
                          onChange={(e) =>
                            handleAgeChange("Age", e.target.value)
                          }
                          style={{ ...inputStyle, width: "25px" }}
                        />{" "}
                        Y
                        <input
                          type="text"
                          name="AgeD"
                          className="form-control form-control-sm rounded-0 text-center"
                          value={formData.AgeD}
                          onChange={(e) =>
                            handleAgeChange("AgeD", e.target.value)
                          }
                          style={{ ...inputStyle, width: "25px" }}
                        />{" "}
                        M
                        <input
                          type="text"
                          name="AgeN"
                          className="form-control form-control-sm rounded-0 text-center"
                          value={formData.AgeN}
                          onChange={(e) =>
                            handleAgeChange("AgeN", e.target.value)
                          }
                          style={{ ...inputStyle, width: "25px" }}
                        />{" "}
                        D
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="PhoneNo"
                        value={formData.PhoneNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        ID Proof <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="IdentNo"
                        value={formData.IdentNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Aadhaar
                      </label>
                      <input
                        type="text"
                        name="CardNo"
                        value={formData.CardNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        District/PS
                      </label>
                      <select
                        name="AreaId"
                        value={formData.AreaId}
                        onChange={handleInputChange}
                        style={inputStyle}
                      >
                        {district.map((d, i) => (
                          <option key={i} value={d.ZoneId}>
                            {d.Zone}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        URN
                      </label>
                      <input
                        type="text"
                        name="URN"
                        value={formData.URN}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        Sex <span className="text-danger">*</span>
                      </label>
                      <select
                        name="Sex"
                        value={formData.Sex}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, padding: "0 2px" }}
                      >
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="O">O</option>
                      </select>
                      <label style={{ ...labelStyle, marginLeft: "4px" }}>
                        Status
                      </label>
                      <select
                        name="MStatus"
                        value={formData.MStatus}
                        onChange={handleInputChange}
                        className="form-select form-select-sm rounded-0 w-25"
                        style={{ ...inputStyle, padding: "0 2px" }}
                      >
                        <option value="U">U</option>
                        <option value="M">M</option>
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        Religion
                      </label>
                      <select
                        name="ReligionId"
                        value={formData.ReligionId}
                        onChange={handleInputChange}
                        style={inputStyle}
                      >
                        {religion.map((d, i) => (
                          <option key={i} value={d.ReligionId}>
                            {d.Religion}
                          </option>
                        ))}
                      </select>
                      <div className="form-check ms-1 m-0 p-0 d-flex align-items-center">
                        <input
                          className="form-check-input m-0"
                          type="checkbox"
                          style={{ width: "12px", height: "12px" }}
                        />
                        <label
                          className="small fw-bold ms-1"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Pkg
                        </label>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        PAN No
                      </label>
                      <input
                        type="text"
                        name="PanNo"
                        value={formData.PanNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                      <button
                        className="btn btn-sm btn-primary rounded-0 py-0 ms-1"
                        style={{
                          height: "24px",
                          fontSize: "0.7rem",
                          minWidth: "40px",
                        }}
                      >
                        EMR
                      </button>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        State
                      </label>
                      <select
                        name="AreaId"
                        value={formData.AreaId}
                        onChange={handleInputChange}
                        style={inputStyle}
                      >
                        {fetchedState.map((d, i) => (
                          <option key={i} value={d.ZoneId}>
                            {d.Zone}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="Passport"
                        value={formData.Passport}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        Weight
                      </label>
                      <input
                        type="text"
                        name="Weight"
                        value={formData.Weight}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* GUARDIAN DETAIL */}
                <div className="row g-2 mb-2 border-top border-secondary pt-1">
                  <div className="col-12">
                    <span style={{ fontSize: "0.75rem" }}>Guardian Detail</span>
                  </div>

                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        W/O S/O D/O
                      </label>
                      <input
                        type="text"
                        name="GurdianName"
                        value={formData.GurdianName}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Relative Name
                      </label>
                      <input
                        type="text"
                        name="RelativeName"
                        value={formData.RelativeName}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Company [Y/N]
                      </label>
                      <select
                        name="Company"
                        value={formData.Company}
                        onChange={handleInputChange}
                        style={{
                          ...inputStyle,
                          width: "50px",
                          padding: "0 2px",
                        }}
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Relation
                      </label>
                      <input
                        type="text"
                        name="Relation"
                        value={formData.Relation}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Phone No.
                      </label>
                      <input
                        type="text"
                        name="RelativePhoneNo"
                        value={formData.RelativePhoneNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Admn Type <span className="text-danger">*</span>
                      </label>
                      <select
                        name="AdmType"
                        value={formData.AdmType}
                        onChange={handleInputChange}
                        className="form-select form-select-sm rounded-0 w-25"
                        style={{ ...inputStyle, padding: "0 2px" }}
                      >
                        <option value="0">None</option>
                        <option value="1">Police Case</option>
                        <option value="2">Accident Case</option>
                        <option value="3">Born Case</option>
                        <option value="4">Suicide Case</option>
                        <option value="5">Insurance</option>
                        <option value="6">Blood Requition</option>
                        <option value="7">Hospital Case</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        Diet
                      </label>
                      <select
                        name="DietChartId"
                        value={formData.DietChartId}
                        onChange={handleInputChange}
                        style={{
                          ...inputStyle,
                          width: "80px",
                          padding: "0 2px",
                        }}
                      >
                        {diet.map((d, i) => (
                          <option key={i} value={d.DietChartId}>
                            {d.DietChart}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        Employer
                      </label>
                      <input
                        type="text"
                        name="nameemployer"
                        value={formData.nameemployer}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <label style={{ ...labelStyle, width: "70px" }}>
                        Ref Date
                      </label>
                      <input
                        type="date"
                        name="refdate"
                        value={formData.refdate}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* OTHERS DETAIL */}
                <div className="row g-2 border-top border-secondary pt-1">
                  <div className="col-12">
                    <span style={{ fontSize: "0.75rem" }}>Others Detail</span>
                  </div>

                  {/* Col 1 */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Department <span className="text-danger">*</span>
                      </label>
                      <select
                        name="DepartmentId"
                        value={formData.DepartmentId}
                        onChange={handleInputChange}
                        style={inputStyle}
                      >
                        {department.map((d, i) => (
                          <option key={i} value={d.DepartmentId}>
                            {d.Department}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Under Care Dr <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          doctors.find(
                            (d) => d.DoctorId == formData.UCDoctor1Id
                          )?.Doctor || ""
                        }
                        onClick={() => {
                          if (mode !== "view") {
                            setSelectedDoctorField("UCDoctor1Id");
                            setShowDoctorDrawer(true);
                            setCurrentDoctorPage(1);
                            setDoctorSearchQuery("");
                          }
                        }}
                        readOnly
                        style={{ ...inputStyle, cursor: "pointer" }}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Referral [Y/N]
                      </label>
                      <select
                        name="Referral"
                        value={formData.Referral}
                        onChange={handleInputChange}
                        style={{
                          ...inputStyle,
                          width: "50px",
                          padding: "0 2px",
                        }}
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Package [Y/N]
                      </label>
                      <select
                        name="Package"
                        value={formData.Package}
                        onChange={handleInputChange}
                        style={{
                          ...inputStyle,
                          width: "50px",
                          padding: "0 2px",
                        }}
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                      <button style={inputStyle}>Show</button>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        valid till
                      </label>
                      <input
                        type="date"
                        name="packagevalid"
                        value={formData.packagevalid}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "80px" }}
                      />
                      <label style={labelStyle}>Start</label>
                      <input
                        type="date"
                        name="packagestart"
                        value={formData.packagestart}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "80px" }}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        CashLess [Y/N]
                      </label>
                      <select
                        name="CashLess"
                        value={formData.CashLess}
                        onChange={handleInputChange}
                        style={{
                          ...inputStyle,
                          width: "50px",
                          padding: "0 2px",
                        }}
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Ins. Comp.
                      </label>
                      <select
                        name="InsComp"
                        value={formData.InsComp}
                        onChange={handleInputChange}
                        className="form-select form-select-sm rounded-0 w-50"
                        style={{ ...inputStyle, padding: "0 2px" }}
                      >
                        {fetchedInsCompany.map((d, i) => (
                          <option key={i} value={d.CashlessId}>
                            {d.Cashless}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Notes (PKG)
                      </label>
                      <input
                        type="text"
                        name="SpRemarks"
                        value={formData.SpRemarks}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Remarks
                      </label>
                      <input
                        type="text"
                        name="Remarks"
                        value={formData.Remarks}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Admission By
                      </label>
                      <input
                        type="text"
                        value={
                          localStorage.getItem("user")
                            ? JSON.parse(localStorage.getItem("user")).name ||
                              "Admin"
                            : "Admin"
                        }
                        disabled
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Bed No. <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          selectedBedName ||
                          bed.find((b) => b.BedId == formData.BedId)?.Bed ||
                          ""
                        }
                        onClick={async () => {
                          if (mode !== "view" && formData.DepartmentId) {
                            setShowBedDrawer(true);
                            setCurrentBedPage(1);
                            setBedSearchQuery("");
                            await fetchDrawerBeds(1, "");
                          } else if (!formData.DepartmentId)
                            alert("Please select a Department first!");
                        }}
                        readOnly
                        style={{ ...inputStyle, cursor: "pointer" }}
                      />
                      <label style={labelStyle}>Rate</label>
                      <input
                        className=" w-50 py-1"
                        type="text"
                        name="BedRate"
                        value={formData.BedRate}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Day Care [Y/N]
                      </label>
                      <select
                        className="  "
                        name="DayCareYN"
                        value={formData.DayCareYN}
                        onChange={handleInputChange}
                        style={{
                          ...inputStyle,
                          width: "50px",
                          padding: "0 2px",
                        }}
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                      <label style={labelStyle}>Particular</label>
                      <select
                        name="DayCareId"
                        value={formData.DayCareId}
                        onChange={(e) => {
                          handleInputChange(e);
                          calDayCareBedRate(e.target.value);
                        }}
                        style={{ ...inputStyle, width: "80px" }}
                      >
                        {dayCare.map((d, i) => (
                          <option key={i} value={d.DayCareId}>
                            {d.DayCare}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Day Care Rate
                      </label>
                      <input
                        type="text"
                        className="rounded-0   py-0"
                        disabled
                        value={formData.BedRate || "0"}
                        style={inputStyle}
                      />
                      <label style={labelStyle}>Employee</label>
                      <input
                        type="text"
                        name="Nameemp"
                        value={formData.Nameemp}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Disease <span className="text-danger">*</span>
                      </label>
                      <select
                        className=" py-1"
                        name="DiseaseId"
                        value={formData.DiseaseId}
                        onChange={(e) => {
                          handleInputChange(e);
                          calDiseaseCode(e.target.value);
                        }}
                        // className="form-control form-control-sm"
                        style={inputStyle}
                      >
                        {diseases.map((d, i) => (
                          <option key={i} value={d.DiseaseId}>
                            {d.Disease}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        R.M.O.{" "}
                      </label>
                      <select
                        name="RMOId"
                        value={formData.RMOId}
                        onChange={handleInputChange}
                        style={inputStyle}
                      >
                        {rmo.map((d, i) => (
                          <option key={i} value={d.DoctorId}>
                            {d.Doctor}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Ref Doctor<span className="text-danger">*</span>
                      </label>
                      <select
                        name="RefDoctorId"
                        value={formData.RefDoctorId}
                        onChange={handleInputChange}
                        className=" w-50 py-1"
                        style={inputStyle}
                      >
                        {doctors.map((d, i) => (
                          <option key={i} value={d.DoctorId}>
                            {d.Doctor}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Ref Doctor2<span className="text-danger">*</span>
                      </label>
                      <select
                        className=" w-50 py-1"
                        name="RefDoctorId2"
                        value={formData.RefDoctorId2}
                        onChange={handleInputChange}
                        style={inputStyle}
                      >
                        {doctors.map((d, i) => (
                          <option key={i} value={d.DoctorId}>
                            {d.Doctor}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Pkg Amount
                      </label>
                      <input
                        type="text"
                        name="PackageAmount"
                        value={formData.PackageAmount}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Total Pkg
                      </label>
                      <input
                        type="text"
                        name="PackageAmount"
                        value={formData.PackageAmount}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "90px" }}>
                        Current User
                      </label>
                      <input
                        type="text"
                        value={
                          localStorage.getItem("user")
                            ? JSON.parse(localStorage.getItem("user")).name ||
                              "Admin"
                            : "Admin"
                        }
                        readOnly
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Col 3 */}
                  <div className="col-12 col-md-6 col-lg-4">
                    {/* <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Nursing Chg
                      </label>
                      <input type="text" style={inputStyle} />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        RMO Chg
                      </label>
                      <input type="text" style={inputStyle} />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Emp Code
                      </label>
                      <input
                        type="text"
                        name="empcode"
                        value={formData.empcode}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Ins Policy No
                      </label>
                      <input
                        type="text"
                        name="PolcNo"
                        value={formData.PolcNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Card No.
                      </label>
                      <input
                        type="text"
                        name="CardNo"
                        value={formData.CardNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        CCN No
                      </label>
                      <input
                        type="text"
                        name="CCNNo"
                        value={formData.CCNNo}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Diseasecode
                      </label>
                      <input
                        type="text"
                        value={
                          diseases.find(
                            (d) => d.DiseaseId == formData.DiseaseId
                          )?.Diseasecode || ""
                        }
                        readOnly
                        style={inputStyle}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Discharge DT
                      </label>
                      <input type="text" style={inputStyle} />
                    </div> */}
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Final Bill DT
                      </label>
                      <input type="text" style={inputStyle} />
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label style={{ ...labelStyle, width: "80px" }}>
                        Operat.Date
                      </label>
                      <input
                        type="date"
                        name="oprationdate"
                        value={formData.oprationdate}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-1">
                      <label
                        style={{
                          ...labelStyle,
                          width: "80px",
                          color: "#000080",
                        }}
                      >
                        Operation Time
                      </label>
                      <input
                        type="text"
                        name="optime"
                        value={formData.optime}
                        onChange={handleInputChange}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Checkboxes Group */}
                <div className="d-flex flex-wrap align-items-center gap-3 ms-1 mb-1">
                  <div
                    className="d-flex align-items-center"
                    style={{ minHeight: "16px" }}
                  >
<div className="me-2">
  <label >M Executive:</label>
<select value={formData.MEXECUTIVE}
name = "MEXECUTIVE"
onChange={handleInputChange}
disabled={mode === "view" }
>
  <option value={""}>---</option>
  {mExecutives.map((d,i)=>(
    <option key={d.MExecutiveId} value={d.MExecutiveId}>{d.MExecutive}</option>
  ))}
</select>
</div>

                    <input
                      type="checkbox"
                      className="m-0"
                      style={{ width: "12px", height: "12px" }}
                      checked={formData.optdiagoinc}
                      onChange={() => {
                        const val = !formData.optdiagoinc ? 1 : 0;
                        setFormData((prev) => ({
                          ...prev,
                          optdiagoinc: val,
                        }));
                      }}
                    />
                    <label
                      className="small fw-bold ms-1"
                      style={{ fontSize: "0.7rem", lineHeight: "1" }}
                    >
                      Diag inc in pkg
                    </label>
                  </div>
                  <div
                    className="d-flex align-items-center"
                    style={{ minHeight: "16px" }}
                  >
                    <input
                      type="checkbox"
                      className="m-0"
                      style={{ width: "12px", height: "12px" }}
                      checked={formData.optmediinc}
                      onChange={() => {
                        const val = !formData.optmediinc ? 1 : 0;
                        setFormData((prev) => ({
                          ...prev,
                          optmediinc: val,
                        }));
                      }}
                    />
                    <label
                      className="small fw-bold ms-1"
                      style={{ fontSize: "0.7rem", lineHeight: "1" }}
                    >
                      Medi inc in pkg
                    </label>
                  </div>
                  <div
                    className="d-flex align-items-center"
                    style={{ minHeight: "16px" }}
                  >
                    <input
                      type="checkbox"
                      className="m-0"
                      style={{ width: "12px", height: "12px" }}
                      checked={formData.optotherchargeinc}
                      onChange={() => {
                        const val = !formData.optotherchargeinc ? 1 : 0;
                        setFormData((prev) => ({
                          ...prev,
                          optotherchargeinc: val,
                        }));
                      }}
                    />
                    <label
                      className="small fw-bold ms-1"
                      style={{ fontSize: "0.7rem", lineHeight: "1" }}
                    >
                      OtherCharge inc
                    </label>
                  </div>
                  <div
                    className="d-flex align-items-center"
                    style={{ minHeight: "16px" }}
                  >
                    <input
                      type="checkbox"
                      className="m-0"
                      style={{ width: "12px", height: "12px" }}
                      checked={formData.optotinc}
                      onChange={() => {
                        const val = !formData.optotinc ? 1 : 0;
                        setFormData((prev) => ({
                          ...prev,
                          optotinc: val,
                        }));
                      }}
                    />
                    <label
                      className="small fw-bold ms-1"
                      style={{ fontSize: "0.7rem", lineHeight: "1" }}
                    >
                      OT IN PKG
                    </label>
                  </div>
                  <div className="d-flex align-items-center justify-content-end gap-1 mb-1">
                    <input
                      type="checkbox"
                      className="m-0"
                      style={{ width: "12px", height: "12px" }}
                      checked={formData.PackageCHK}
                      onChange={() => {
                        const val = !formData.PackageCHK ? 1 : 0;
                        setFormData((prev) => ({
                          ...prev,
                          PackageCHK: val,
                        }));
                      }}
                    />{" "}
                    <label
                      className="small fw-bold"
                      style={{ fontSize: "0.7rem", lineHeight: "1" }}
                    >
                      PKG+CONS
                    </label>
                  </div>
                </div>
              </div>
            </OverlayScrollbarsComponent>
          </div>

          {/* FOOTER BUTTON BAR */}
          <div
            className="panel-footer p-2 border-top bg-rt-color-dark d-flex justify-content-center"
            style={{ flexShrink: 0, minHeight: "45px", height: "auto" }}
          >
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              {/* <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  window.location.href = "/PatientAdmission";
                }}
                disabled={loading}
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                New
              </button> */}
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setMode("edit")}
                disabled={loading || mode === "create"}
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSubmit}
                disabled={loading || mode === "view"}
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                Save
              </button>
              {/* <button
                className="btn btn-sm btn-primary"
                onClick={handleDelete}
                disabled={loading || mode === "create"}
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                Delete
              </button> */}
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setMode("view");
                  fetchAdmission();
                }}
                disabled={loading || mode === "create"}
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                Undo
              </button>
              <button
                className="btn btn-sm btn-primary"
                style={{ fontSize: "0.75rem", height: "26px" }}
                onClick={() => {
                  handlePrint({
                    meta: {
                      admissionNo: formData.AdmitionNo,
                      admissionDate: formData.AdmitionDate?.split("-").reverse().join("-"),
                      admissionTime: new Date(`1970-01-01T${formData.AdmitionTime}`).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),
                      uhid: "", // Empty in source
                      barcodeValue: formData.AdmitionNo,
                    },
                    hospital: {
                      name: "LORDS HEALTH CARE",
                      address:
                        "13/3, Circular 2nd Bye Lane, Kona Expressway, Nabanna (Near Jumanabala Balika Vidyalaya) Shibpur, Howrah - 711 102, W.B.",
                      phone: "8272904444",
                      email: "patientdesk@lordshealthcare.org",
                      website: "www.lordshealthcare.org",
                    },
                    patient: {
                      name: formData.PatientName,
                      age: `${formData.Age} Y`,
                      gender: formData.Sex === "M" ? "MALE" : formData.Sex === "F" ? "FEMALE" : "OTHER",
                      address:[formData.Add1, formData.Add2, formData.Add3].filter(Boolean).join(", "),
                      religion: religion.find(item=>item.ReligionId==formData.ReligionId)?.Religion || "",
                      status: formData.MStatus === "U" ? "UNMARRIED" : "MARRIED",
                      area: formData.Add3,
                      phone: formData.PhoneNo,
                      occupation: formData.Occupation,
                      nationality: formData.Passport,
                    },
                    relative: {
                      type: "", 
                      relatedToName: formData.GurdianName,
                      relativeName: formData.RelativeName,
                      relation: formData.Relation,
                      phone:formData.RelativePhoneNo,
                    },
                    admissionDetails: {
                      bedNo: selBed || "",
                      // department: "GENERAL-WARD-FEMALE",
                      department: department.find(item=>item.DepartmentId==formData.DepartmentId)?.Department,
                      // underCare: "Dr. SOMA KOLEY",
                      underCare: `${doctors.find(item=>item.DoctorId===formData.UCDoctor1Id)?.Doctor}, ${doctors.find(item=>item.DoctorId===formData.UCDoctor2Id)?.Doctor}, ${doctors.find(item=>item.DoctorId===formData.UCDoctor3Id)?.Doctor}`,
                    },
                    insurance: {
                      tpa: fetchedCompany.find(item=>item.CashlessId==formData.CashLessId)?.Cashless || "",
                      company: fetchedCompany.find(item=>item.CashlessId==formData.CompanyId).Cashless|| "",
                    },
                    
                  })
                }
                }
              >
                Print
              </button>
              {/* <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate("/PatientRegistrationList")}
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
               ← Back
              </button> */}
              {/* <button
                className="btn btn-sm btn-primary"
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                Barcode
              </button> */}
              {/* <button
                className="btn btn-sm btn-primary"
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                H Risk Consent
              </button> */}
              {/* <button
                className="btn btn-sm btn-primary"
                style={{ fontSize: "0.75rem", height: "26px" }}
              >
                Consent
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* --- DRAWERS AND MODALS (Hidden Logic layers) --- */}
      {/* DOCTOR DRAWER */}
      {showDoctorDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDoctorDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "520px",
              right: 0,
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDoctorDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  backgroundColor: "#0a1735",
                  color: "white",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                Doctor Selection
              </div>
              <div
                style={{ height: "calc(100% - 70px)", overflowY: "auto" }}
                className="p-3"
              >
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Search..."
                  value={doctorSearchQuery}
                  onChange={(e) => {
                    setDoctorSearchQuery(e.target.value);
                    setCurrentDoctorPage(1);
                  }}
                />
                <div className="row g-2">
                  {doctors
                    .filter((d) =>
                      d.Doctor.toLowerCase().includes(
                        doctorSearchQuery.toLowerCase()
                      )
                    )
                    .slice(
                      (currentDoctorPage - 1) * doctorsPerPage,
                      currentDoctorPage * doctorsPerPage
                    )
                    .map((doctor, i) => (
                      <div className="col-12" key={i}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="doctorSelection"
                            checked={
                              formData[selectedDoctorField] == doctor.DoctorId
                            }
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                [selectedDoctorField]: doctor.DoctorId,
                              }));
                              setShowDoctorDrawer(false);
                            }}
                          />
                          <label className="form-check-label">
                            {doctor.Doctor}
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
                {/* Simplified Pagination logic for drawer */}
                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() =>
                      setCurrentDoctorPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentDoctorPage === 1}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setCurrentDoctorPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* BED DRAWER */}
      {showBedDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowBedDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "520px",
              right: 0,
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowBedDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  backgroundColor: "#0a1735",
                  color: "white",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                Bed Selection
              </div>
              <div
                style={{ height: "calc(100% - 70px)", overflowY: "auto" }}
                className="p-3"
              >
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Search bed..."
                  value={bedSearchQuery}
                  onChange={(e) => {
                    setBedSearchQuery(e.target.value);
                    setCurrentBedPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchDrawerBeds(1, bedSearchQuery);
                  }}
                />
                <div className="row g-2">
                  {drawerBeds.map((bedItem, i) => (
                    <div className="col-12" key={i}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="bedSelection"
                          checked={formData.BedId == bedItem.BedId}
                          onChange={() => {
                            setFormData((prev) => ({
                              ...prev,
                              BedId: bedItem.BedId,
                              BedRate: bedItem.BedCh,
                            }));
                            setSelectedBedName(bedItem.Bed);
                            setShowBedDrawer(false);
                          }}
                        />
                        <label className="form-check-label">
                          {bedItem.Bed}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      const n = currentBedPage - 1;
                      setCurrentBedPage(n);
                      fetchDrawerBeds(n, bedSearchQuery);
                    }}
                    disabled={currentBedPage === 1}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      const n = currentBedPage + 1;
                      setCurrentBedPage(n);
                      fetchDrawerBeds(n, bedSearchQuery);
                    }}
                    disabled={currentBedPage === totalBedPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* OPD DRAWER */}
      {showOPDDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowOPDDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "700px",
              right: 0,
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowOPDDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  backgroundColor: "#0a1735",
                  color: "white",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                OPD Visit Selection
              </div>
              <div
                style={{ height: "calc(100% - 70px)", overflowY: "auto" }}
                className="p-3"
              >
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Search..."
                  value={opdSearchQuery}
                  onChange={(e) => {
                    setOPDSearchQuery(e.target.value);
                    setCurrentOPDPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchDrawerOPDs(1, opdSearchQuery);
                  }}
                />
                <table className="table table-hover table-sm">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawerOPDs.map((visit, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="opdSelection"
                            checked={formData.OPDId === visit.RegistrationId}
                            onChange={async () => {
                              await fetchOPDPatientData(visit.RegistrationId);
                              setShowOPDDrawer(false);
                            }}
                          />
                        </td>
                        <td>{visit.RegistrationId}</td>
                        <td>{visit.PatientName}</td>
                        <td>{visit.VisitDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      const n = currentOPDPage - 1;
                      setCurrentOPDPage(n);
                      fetchDrawerOPDs(n, opdSearchQuery);
                    }}
                    disabled={currentOPDPage === 1}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      const n = currentOPDPage + 1;
                      setCurrentOPDPage(n);
                      fetchDrawerOPDs(n, opdSearchQuery);
                    }}
                    disabled={currentOPDPage === totalOPDPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientAdmission;
