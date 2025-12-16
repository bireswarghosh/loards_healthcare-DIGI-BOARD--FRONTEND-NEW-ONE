import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import axiosInstance from "../../../axiosInstance";
import { tr } from "date-fns/locale";
import { set, setDay } from "date-fns";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const PatientRegistrationDetail = () => {
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

  const [doctors, setDoctors] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get("mode");
    if (id) {
      return modeParam || "view"; 
    }
    return "create";
  });
  const [loading, setLoading] = useState(false);
  const [district, setDistrict] = useState([]);
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
    Passport: "",
    DietChartId: "",
    tpaper: null,
    PanNo: "",
    PackageCHK: 0,
    nameemployer: "",
    refdate: "",
    Nameemp: "",
    empcode: "",
    RefDoctorId2: 0,
    packagevalid: "2000-01-01",
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
    packagestart: "2000-01-01",
    AcGenLedCompany: 0,
    optotinc: 0,
    MEXECUTIVE: "",
    PackageId2: null,
    PackageId3: null,
    PackageId4: null,
    PackageAmount2: null,
    PackageAmount3: null,
    PackageAmount4: null,

  });
  const [diet, setDiet] = useState([]);
  const [religion, setReligion] = useState([]);
  const [department, setDepartment] = useState([]);
  const [mExecutives, setMExecutives] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [showBedModal, setShowBedModal] = useState(false);
  const [bed, setBed] = useState([]);
  const [filteredBed, setFilteredBed] = useState([]);
  const [selectedBedName, setSelectedBedName] = useState("");
  const [fetchedCashLess, setFetchedCashLess] = useState([]);
  const [fetchedCompany, setFetchedCompany] = useState([]);
  const [fetchedInsCompany, setFetchedInsCompany] = useState([]);
  const [referral, setReferral] = useState([]);
  const [dayCare, setDayCare] = useState([]);
  const [dayCareBedRate, setDayCareBedRate] = useState("");
  const [rmo, setRmo] = useState([]);
  const [packages, setPackages] = useState([]);
  const [fetchedState, setFetchedState] = useState([]);

  useEffect(() => {
    if (id) {
      fetchAdmission();
    } else {
      // In create mode, fetch all dropdown data
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

  const fetchDietChart = async () => {
    try {
      const dietData = await axiosInstance.get("/dietchart?page=1&limit=20");
      if (dietData.data.success) {
        setDiet(dietData.data.data);
        // console.log("Diet Chart Data:", dietData.data.data);
      }
    } catch (error) {
      console.error("Error fetching diet chart:", error);
    }
  };

  const fetchReligion = async () => {
    try {
      const religionData = await axiosInstance.get("/religion");
      // console.log("Religion Response:", religionData.data.data);
      if (religionData.data.success) {
        const arr = religionData.data.data;
        const newArr = [{ ReligionId: 0, Religion: "---Select---" }, ...arr];

        setReligion(newArr);
        // console.log("Religion Data:", religionData.data.data);
      }
    } catch (error) {
      console.error("Error fetching religion:", error);
    }
  };

  const fetchDepartment = async () => {
    try {
      const departmentData = await axiosInstance.get("/departmentIndoor");
      if (departmentData.data.success) {
        setDepartment(departmentData.data.data);
        // console.log("department Data:", departmentData.data.data);
      }
    } catch (error) {
      console.error("Error fetching department:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const fetchedDoctors = await axiosInstance.get("/doctors");
      if (fetchedDoctors.data.success) {
        setDoctors(fetchedDoctors.data.data);
        // console.log("Doctors Data:", fetchedDoctors.data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };
  const fetchDistrict = async () => {
    try {
      const fetchedDistrict = await axiosInstance.get("/zone");
      // console.log("State Response:", fetchedDistrict.data);
      const arr = fetchedDistrict.data;
      const newArr = [{ ZoneId: null, Zone: "-- Select --" }, ...arr];
      setDistrict(newArr);
    } catch (error) {
      console.error("Error fetching zone:", error);
    }
  };
  const fetchState = async () => {
    try {
      const fetchedState = await axiosInstance.get("/zone");
      // console.log("State Response:", fetchedDistrict.data);
      const arr = fetchedState.data;
      const newArr = [{ ZoneId: 0, Zone: "-- Select --" }, ...arr];
      setFetchedState(newArr);
    } catch (error) {
      console.error("Error fetching zone:", error);
    }
  };

  const fetchMExecutive = async () => {
    try {
      const fetchedMExecutive = await axiosInstance.get("/mexecutive");
      setMExecutives(fetchedMExecutive.data);
      // console.log("MExecutive Response:", fetchedMExecutive.data);
    } catch (error) {
      console.error("Error fetching mexecutive:", error);
    }
  };

  const fetchDiseases = async () => {
    try {
      const fetchedDiseases = await axiosInstance.get("/disease");
      const arr = fetchedDiseases.data;
      const newArr = [
        { DiseaseId: 0, Disease: "--- Select ---", Diseasecode: "" },
        ...arr,
      ];
      // console.log("Diseases Response:", newArr);
      setDiseases(newArr);
    } catch (error) {
      console.error("Error fetching diseases:", error);
    }
  };

  const fetcheBed = async () => {
    try {
      const fetchedBed = await axiosInstance.get("/bedMaster");
      if (fetchedBed.data.success) {
        setBed(fetchedBed.data.data);
      }
    } catch (error) {
      console.error("Error fetching bed:", error);
    }
  };

  const fetchBedById = async (bedId) => {
    if (!bedId) return;
    try {
      const response = await axiosInstance.get(`/bedMaster/${bedId}`);
      if (response.data.success) {
        setSelectedBedName(response.data.data.Bed);
      }
    } catch (error) {
      console.error("Error fetching bed by id:", error);
    }
  };

  const fetchDrawerBeds = async (page = 1, search = "") => {
    try {
      let url = `/bedMaster?page=${page}&limit=${bedsPerPage}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (formData.DepartmentId) {
        url += `&DepartmentId=${formData.DepartmentId}`;
      }
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        setDrawerBeds(response.data.data);
        setTotalBedPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching drawer beds:", error);
    }
  };

  const handleFilterBed = (dataArray, deptId) => {
    const targetId = Number(deptId);
    return dataArray.filter((item) => item.DepartmentId === targetId);
  };

  const fetchCashLess = async () => {
    try {
      const cashless = await axiosInstance.get("/cashless");
      if (cashless.data.success) {
        const arr = cashless.data.data;
        const newArr = [
          {
            CashlessId: 0,
            Cashless: "--- Select ---",
            Add1: "",
            Add2: "",
            Phone: "",
            Company: null,
            Add3: "",
            emailid: "",
            contactperson: "",
            cPhone: "",
            servicecharge: "",
            AcGenLedCompany: null,
            AcGenLedDesc: "",
            SubGrp: null,
            ACGroup: null,
            ACHead: null,
          },
          ...arr,
        ];
        setFetchedCashLess(newArr);
        // console.log("CashLess Data:", cashless.data.data);
      }
    } catch (error) {
      console.error("Error fetching CashLess:", error);
    }
  };

  const fetchCompany = async () => {
    try {
      const companies = await axiosInstance.get("/cashless");
      if (companies.data.success) {
        const arr = companies.data.data;
        const newArr = [
          {
            CashlessId: 0,
            Cashless: "--- Select ---",
            Add1: "",
            Add2: "",
            Phone: "",
            Company: null,
            Add3: "",
            emailid: "",
            contactperson: "",
            cPhone: "",
            servicecharge: "",
            AcGenLedCompany: null,
            AcGenLedDesc: "",
            SubGrp: null,
            ACGroup: null,
            ACHead: null,
          },
          ...arr,
        ];
        setFetchedCompany(newArr);
        // console.log("Company Data:", companies.data.data);
      }
    } catch (error) {
      console.error("Error fetching Company:", error);
    }
  };

  const fetchInsCompany = async () => {
    try {
      const companies = await axiosInstance.get("/cashless");
      if (companies.data.success) {
        const arr = companies.data.data;
        const newArr = [
          {
            CashlessId: 0,
            Cashless: "--- Select ---",
            Add1: "",
            Add2: "",
            Phone: "",
            Company: null,
            Add3: "",
            emailid: "",
            contactperson: "",
            cPhone: "",
            servicecharge: "",
            AcGenLedCompany: null,
            AcGenLedDesc: "",
            SubGrp: null,
            ACGroup: null,
            ACHead: null,
          },
          ...arr,
        ];
        setFetchedInsCompany(newArr);
        // console.log("Company Data:", companies.data.data);
      }
    } catch (error) {
      console.error("Error fetching Company:", error);
    }
  };

  const fetchReferral = async () => {
    try {
      const fetchedRefferal = await axiosInstance.get("/referal");
      const arr = fetchedRefferal.data;
      const newArr = [
        {
          ReferalId: 0,
          Referal: "--- Select ---",
          PhoneNo: "0",
          MExecutiveId: 0,
          mexecutive: {
            MExecutiveId: 0,
            MExecutive: "",
            Add1: "",
            Add2: "",
            Add3: "",
            Phone: "",
          },
        },
        ...arr,
      ];
      // console.log("Referral Response:", fetchedRefferal.data);
      setReferral(newArr);
    } catch (error) {
      console.log("Error fetching Referral:", error);
    }
  };

  const fetchDayCare = async () => {
    try {
      const fetchedDayCare = await axiosInstance.get("/dayCare");
      // console.log("DayCare Response:", fetchedDayCare.data.data);
      const arr = fetchedDayCare.data.data;
      const newArr = [
        { DayCareId: 0, DayCare: "--- Select", Rate: null },
        ...arr,
      ];
      setDayCare(newArr);
    } catch (error) {
      console.error("Error fetching DayCare:", error);
    }
  };

  const fetchRMO = async () => {
    try {
      const fetchedRMO = await axiosInstance.get("/doctormaster/rmo");
      // console.log("RMO Response:", fetchedRMO.data.data);
      if (fetchedRMO.data.success) {
        setRmo(fetchedRMO.data.data);
      }
    } catch (error) {
      console.error("Error fetching RMO:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const fetchedPackages = await axiosInstance.get("/packages");
      if (fetchedPackages.data.success) {
        // console.log("fetched packages : ", fetchedPackages.data.data);

        const arr = fetchedPackages.data.data;

        //         const arr =
        // {PackageId: 4, Package: 'HIP REPLACEMENT', DescId: null, Rate: 10, GSTAmt: null}

        const newArr = [
          {
            PackageId: 0,
            Package: "--- Select ---",
            DescId: null,
            Rate: 0,
            GSTAmt: null,
          },
          ...arr,
        ];

        setPackages(newArr);
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
        
        // Calculate DOB from age if not present
        let calculatedDob = apiData.Dob ? apiData.Dob.substring(0, 10) : "";
        if (!calculatedDob && apiData.AdmitionDate && (apiData.Age || apiData.AgeD || apiData.AgeN)) {
          try {
            const admDate = new Date(apiData.AdmitionDate);
            const years = parseInt(apiData.Age) || 0;
            const months = parseInt(apiData.AgeD) || 0;
            const days = parseInt(apiData.AgeN) || 0;
            
            const birthDate = new Date(admDate);
            birthDate.setFullYear(birthDate.getFullYear() - years);
            birthDate.setMonth(birthDate.getMonth() - months);
            birthDate.setDate(birthDate.getDate() - days);
            
            if (!isNaN(birthDate.getTime())) {
              calculatedDob = birthDate.toISOString().substring(0, 10);
            }
          } catch (error) {
            console.error("Error calculating DOB:", error);
          }
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
        if (apiData.DiseaseId) {
          calDiseaseCode(apiData.DiseaseId);
        }
        if (apiData.BedId) {
          fetchBedById(apiData.BedId);
        }
        // let DOB = `${String(new Date().getDate()).padStart(2,"0")}-${String(new Date().getMonth()+1).padStart(2,"0")}-${new Date().getFullYear()-formData.Age}`
      }
    } catch (error) {
      console.error("Error fetching admission:", error);
    } finally {
      setLoading(false);
    }
  };

  const calDayCareBedRate = (dayCareId) => {
    const result = dayCare.find((item) => item.DayCareId == dayCareId);
    // console.log("DayCare Bed Rate Calculation:", result.Rate);
  };

  const calPackageAmount = (id) => {
    // console.log("Package id: ", id);
    // console.log("packages array->", packages);
    const item = packages.find((pkg) => pkg.PackageId == id);
    // console.log("Package amount: ", item.Rate);
    setFormData((prev) => ({ ...prev, PackageAmount: item.Rate }));
  };

  const calDiseaseCode = (id) => {
    const item = diseases.find((disease) => disease.DiseaseId == id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-calculate age when DOB changes
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
            const lastMonth = new Date(admDate.getFullYear(), admDate.getMonth(), 0);
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
        console.error("Error calculating age:", error);
        setFormData((prev) => ({ ...prev, Dob: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, Dob: value }));
    }
  };

  // Auto-calculate DOB when age fields change
  const handleAgeChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (formData.AdmitionDate) {
      try {
        const years = parseInt(field === 'Age' ? value : formData.Age) || 0;
        const months = parseInt(field === 'AgeD' ? value : formData.AgeD) || 0;
        const days = parseInt(field === 'AgeN' ? value : formData.AgeN) || 0;

        if (years || months || days) {
          const admDate = new Date(formData.AdmitionDate);
          if (!isNaN(admDate.getTime())) {
            const birthDate = new Date(admDate);
            birthDate.setFullYear(birthDate.getFullYear() - years);
            birthDate.setMonth(birthDate.getMonth() - months);
            birthDate.setDate(birthDate.getDate() - days);
            if (!isNaN(birthDate.getTime())) {
              const dobString = birthDate.toISOString().split("T")[0];
              setFormData((prev) => ({ ...prev, Dob: dobString }));
            }
          }
        }
      } catch (error) {
        console.error("Error calculating DOB:", error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Remove any fields that don't exist in database
      const cleanData = { ...formData };
      delete cleanData.Dob; // DOB is calculated field, not in DB
      delete cleanData.DateOfBirth;
      delete cleanData.District;
      delete cleanData.State;
      delete cleanData.Nationality;
      delete cleanData.PinCode;
      delete cleanData.BillNo;
      delete cleanData.RegistrationNo;
      delete cleanData.EMRNo;
      delete cleanData.Particular;
      delete cleanData.HealthCardNo;
      delete cleanData.PatientsDoctor;
      delete cleanData.TotalPackage;
      delete cleanData.DischargeDate;
      delete cleanData.FinalBillDate;
      delete cleanData.FFN;
      delete cleanData.BedYN;
      
      console.log("Submitting Form Data:", cleanData);
      const response =
        mode === "create"
          ? await axiosInstance.post("/admission", cleanData)
          : await axiosInstance.put(`/admission/${id}`, cleanData);

      if (response.data.success) {
        alert(
          `Admission ${mode === "create" ? "created" : "updated"} successfully!`
        );
        if (mode === "create") {
          navigate("/patient-registration");
        } else {
          setMode("view");
        }
      }
    } catch (error) {
      console.error("Error saving admission:", error);
      alert("Error saving admission");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this admission?"))
      return;

    try {
      setLoading(true);
      const response = await axiosInstance.delete(
        `/admission/${decodeURIComponent(id)}`
      );
      if (response.data.success) {
        alert("Admission deleted successfully!");
        navigate("/patient-registration");
      }
    } catch (error) {
      console.error("Error deleting admission:", error);
      alert("Error deleting admission");
    } finally {
      setLoading(false);
    }
  };

  const headerTabs = [
    // Note: Replaced Detail variant with outline-light as Detail is the current view
    {
      label: "List",
      onClick: () => navigate("/PatientRegistrationList"),
      variant: "primary",
    },
    { label: "Detail", variant: "primary" },
    { label: "MRD", variant: "primary" },
  ];

  const footerActions = [
    {
      label: "New",
      onClick: () => {
        window.location.href = "/PatientRegistrationDetail";
      },
      variant: "primary",
      disabled: loading,
    },
    {
      label: "Edit",
      onClick: () => setMode("edit"),
      variant: "primary",
      disabled: loading || mode === "create",
    },
    {
      label: "Save",
      onClick: handleSubmit,
      variant: "primary",
      disabled: loading || mode === "view",
    },
    {
      label: "Delete",
      onClick: handleDelete,
      variant: "primary",
      disabled: loading || mode === "create",
    },
    {
      label: "Undo",
      onClick: () => {
        setMode("view");
        fetchAdmission();
      },
      variant: "primary",
      disabled: loading || mode === "create",
    },
    { label: "Print", variant: "primary" },
    {
      label: "Exit",
      onClick: () => navigate("/PatientRegistrationList"),
      variant: "primary",
    },
  ];

  return (
    <>
      <div className="container-fluid py-4 px-lg-4">
        <div className="panel">
          {/* ================== HEADER (Panel-Header Style) ================== */}
          <div className="panel-header d-flex justify-content-between align-items-center">
            <div className="panel-title fw-bold">
              Patient Registration - Detail
            </div>

            <div className="tabs d-flex gap-2">
              {headerTabs.map((tab, index) => (
                <button
                  key={index}
                  // Using btn-outline-light for List/MRD and btn-primary for Detail
                  className={`btn btn-sm ${
                    tab.label === "Detail"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={tab.onClick}
                  disabled={tab.disabled}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ================== BODY (Panel-Body Style) ================== */}
          <div className="panel-body">
            {/* ==== Admission Detail ==== */}
            <h5 className="fw-bold text-info mb-3">Admission Detail</h5>
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label small">Admission No</label>
                <input
                  type="text"
                  name="AdmitionNo"
                  className="form-control form-control-sm"
                  value={formData.AdmitionNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Date</label>
                <input
                  type="date"
                  name="AdmitionDate"
                  className="form-control form-control-sm"
                  value={formData.AdmitionDate}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Bill Time</label>
                <input
                  type="text"
                  name="BillTime"
                  className="form-control form-control-sm"
                  value={formData.BillTime}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Admission Time</label>
                <input
                  type="text"
                  name="AdmitionTime"
                  className="form-control form-control-sm"
                  value={formData.AdmitionTime}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">O.P.D. [Y/N]</label>
                {mode == "view" ? (
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.OPD}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                ) : (
                  <select
                    name="OPD"
                    className="form-control form-control-sm"
                    value={formData.OPD}
                    onChange={handleInputChange}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                )}
              </div>

              <div className="col-md-2">
                <label className="form-label small">O.P.D. Id</label>

                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.OPDId}
                  onChange={handleInputChange}
                  disabled={mode === "view" || formData.OPD === "N"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Booking [Y/N]</label>
                {mode == "view" ? (
                  <input
                    name="Booking"
                    className="form-control form-control-sm"
                    value={formData.Booking}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                ) : (
                  <select
                    name="Booking"
                    className="form-control form-control-sm"
                    value={formData.Booking}
                    onChange={handleInputChange}
                  >
                    <option value="N">N</option>
                    <option value="Y">Y</option>
                  </select>
                )}
              </div>

              {/* Patient Id and Package fields */}
              <div className="col-md-2">
                <label className="form-label small">Patient Id</label>
                <input
                  type="text"
                  name="PatientId"
                  className="form-control form-control-sm"
                  value={formData.PatientId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
            </div>

            {/* BARCODE (Moved to end of Admission Detail) */}
            <div className="text-end mt-3">
              {formData.AdmitionNo && (
                <>
                  <Barcode
                    value={formData.AdmitionNo}
                    format="CODE128"
                    width={2}
                    height={40}
                    displayValue={false} // Match PatientRegistrationDetail-1.jsx
                    margin={5}
                  />
                  {/* Display value separately */}
                  <div className="fw-bold">{formData.AdmitionNo}</div>
                </>
              )}
            </div>

            <hr className="my-4" />

            {/* ==== Patient Detail ==== */}
            <h5 className="fw-bold text-info mb-3">Patient Detail</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small">Patient's Name</label>
                <input
                  type="text"
                  name="PatientName"
                  className="form-control form-control-sm"
                  value={formData.PatientName}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Address</label>
                <input
                  type="text"
                  name="Add1"
                  className="form-control form-control-sm"
                  value={formData.Add1}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Area</label>
                <input
                  type="text"
                  name="Add2"
                  className="form-control form-control-sm"
                  value={formData.Add2}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Pin Code</label>
                <input
                  type="text"
                  name="Add3"
                  className="form-control form-control-sm"
                  value={formData.Add3}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              {/* DOB & Age */}
              <div className="col-md-2">
                <label className="form-label small">Date of Birth</label>
                <input
                  type="date"
                  name="Dob"
                  className="form-control form-control-sm"
                  value={formData.Dob ? formData.Dob.split("T")[0] : ""}
                  onChange={(e) => handleDobChange(e.target.value)}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Age (Y/M/D)</label>
                <div className="input-group">
                  <span className="input-group-text p-1">Y</span>
                  <input
                    type="number"
                    name="Age"
                    className="form-control"
                    placeholder="Y"
                    value={formData.Age}
                    onChange={(e) => handleAgeChange('Age', e.target.value)}
                    disabled={mode === "view"}
                  />

                  <span className="input-group-text p-1">M</span>
                  <input
                    type="number"
                    name="AgeD"
                    className="form-control"
                    placeholder="M"
                    value={formData.AgeD}
                    onChange={(e) => handleAgeChange('AgeD', e.target.value)}
                    disabled={mode === "view"}
                  />

                  <span className="input-group-text p-1">D</span>
                  <input
                    type="number"
                    name="AgeN"
                    className="form-control"
                    placeholder="D"
                    value={formData.AgeN}
                    onChange={(e) => handleAgeChange('AgeN', e.target.value)}
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <div className="col-md-1">
                <label className="form-label small">Sex</label>
                <select
                  name="Sex"
                  className="form-control form-control-sm"
                  value={formData.Sex}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="">---Select---</option>

                  <option value="M">M</option>
                  <option value="F">F</option>
                  <option value="O">O</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Marital Status</label>
                {/* <input
                  type="text"
                  name="MStatus"
                  className="form-control form-control-sm"
                  value={formData.MStatus}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}

                <select
                  name="MStatus"
                  className="form-control form-control-sm"
                  value={formData.MStatus}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="">---Select---</option>
                  <option value="M">M</option>
                  <option value="U">U</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  name="PhoneNo"
                  className="form-control form-control-sm"
                  value={formData.PhoneNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">
                  ID Proof(Aadhaar/Passport)
                </label>
                <input
                  type="text"
                  name="IdentNo"
                  className="form-control form-control-sm"
                  value={formData.IdentNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small">Religion</label>
                <select
                  name="ReligionId"
                  className="form-control form-control-sm"
                  value={formData.ReligionId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {religion.map((d, indx) => (
                    <option key={indx} value={d.ReligionId}>
                      {d.Religion}
                    </option>
                  ))}
                </select>
                {/* <input
                  type="text"
                  name="ReligionId"
                  className="form-control form-control-sm"
                  value={formData.ReligionId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}
              </div>
              <div className="col-md-2">
                <label className="form-label small">PAN No</label>
                <input
                  type="text"
                  name="PanNo"
                  className="form-control form-control-sm"
                  value={formData.PanNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">District/PS</label>
                <select
                  name="AreaId"
                  className="form-control form-control-sm"
                  value={formData.AreaId || ""}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {district.map((d, indx) => (
                    <option key={indx} value={d.ZoneId}>
                      {d.Zone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">State</label>
                <select
                  name="AreaId"
                  className="form-control form-control-sm"
                  value={formData.AreaId || ""}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {fetchedState.map((d, indx) => (
                    <option key={indx} value={d.ZoneId}>
                      {d.Zone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Nationality</label>
                <input
                  type="text"
                  name="Passport"
                  className="form-control form-control-sm"
                  value={formData.Passport}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Weight</label>
                <input
                  type="text"
                  name="Weight"
                  className="form-control form-control-sm"
                  value={formData.Weight}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">URN</label>
                <input
                  type="text"
                  name="URN"
                  className="form-control form-control-sm"
                  value={formData.URN}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Occupation </label>
                <input
                  type="text"
                  name="Occupation"
                  className="form-control form-control-sm"
                  value={formData.Occupation}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* ==== Guardian Detail ==== */}
            <h5 className="fw-bold text-info mb-3">Guardian Detail</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small">W/O S/O D/O</label>
                <input
                  type="text"
                  name="GurdianName"
                  className="form-control form-control-sm"
                  value={formData.GurdianName}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Relation</label>
                <input
                  type="text"
                  name="Relation"
                  className="form-control form-control-sm"
                  value={formData.Relation}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Relative Name</label>
                <input
                  type="text"
                  name="RelativeName"
                  className="form-control form-control-sm"
                  value={formData.RelativeName}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Phone No</label>
                <input
                  type="tel"
                  maxLength={10}
                  name="RelativePhoneNo"
                  className="form-control form-control-sm"
                  value={formData.RelativePhoneNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Company [Y/N]</label>
                <select
                  name="Company"
                  className="form-control form-control-sm"
                  value={formData.Company}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Company Name</label>
                {/* <input
                  type="text"
                  name="CompanyId"
                  className="form-control form-control-sm"
                  value={formData.CompanyId}
                  onChange={handleInputChange}
                  disabled={mode === "view" || formData.Company === "N"}
                /> */}
                {/* <select
                  name="CashLessId"
                  className="form-control form-control-sm"
                  value={formData.CashLessId}
                  onChange={handleInputChange}
                  disabled={mode === "view" || formData.Company === "N"}
                >
                  {fetchedCashLess.map((d, indx) => (
                    <option key={indx} value={d.CashlessId}>
                      {d.Cashless}
                    </option>
                  ))}
                </select> */}
                <select
                  name="CompanyId"
                  className="form-control form-control-sm"
                  value={formData.CompanyId}
                  onChange={handleInputChange}
                  disabled={mode === "view" || formData.Company === "N"}
                >
                  {formData.Company === "Y" ? (
                    fetchedCompany.map((d, indx) => (
                      <option key={indx} value={d.CashlessId}>
                        {d.Cashless}
                      </option>
                    ))
                  ) : (
                    <option>---Select---</option>
                  )}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Name of Employer</label>
                <input
                  type="text"
                  name="nameemployer"
                  className="form-control form-control-sm"
                  value={formData.nameemployer}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Admission Type</label>
                <select
                  name="AdmType"
                  className="form-control form-control-sm"
                  value={formData.AdmType}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
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
              <div className="col-md-3">
                <label className="form-label small">Diet</label>

                <select
                  name="DietChartId"
                  className="form-control form-control-sm"
                  value={formData.DietChartId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {diet.map((d, indx) => (
                    <option key={indx} value={d.DietChartId}>
                      {d.DietChart}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small">Ref Date</label>
                <input
                  type="date"
                  name="refdate"
                  className="form-control form-control-sm"
                  value={formData.refdate}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* ==== Other Details ==== */}
            <h5 className="fw-bold text-info mb-3">Other Details</h5>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small">Department</label>
                <select
                  name="DepartmentId"
                  className="form-control form-control-sm"
                  value={formData.DepartmentId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {department.map((d, indx) => (
                    <option key={indx} value={d.DepartmentId}>
                      {d.Department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small">Under Care Dr. 1</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={doctors.find(d => d.DoctorId == formData.UCDoctor1Id)?.Doctor || ""}
                  onClick={() => {
                    if (mode !== "view") {
                      setSelectedDoctorField("UCDoctor1Id");
                      setShowDoctorDrawer(true);
                      setCurrentDoctorPage(1);
                      setDoctorSearchQuery("");
                    }
                  }}
                  disabled={mode === "view"}
                  readOnly
                  style={{ cursor: mode === "view" ? "default" : "pointer" }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Under Care Dr. 2</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={doctors.find(d => d.DoctorId == formData.UCDoctor2Id)?.Doctor || ""}
                  onClick={() => {
                    if (mode !== "view") {
                      setSelectedDoctorField("UCDoctor2Id");
                      setShowDoctorDrawer(true);
                      setCurrentDoctorPage(1);
                      setDoctorSearchQuery("");
                    }
                  }}
                  disabled={mode === "view"}
                  readOnly
                  style={{ cursor: mode === "view" ? "default" : "pointer" }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Under Care Dr. 3</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={doctors.find(d => d.DoctorId == formData.UCDoctor3Id)?.Doctor || ""}
                  onClick={() => {
                    if (mode !== "view") {
                      setSelectedDoctorField("UCDoctor3Id");
                      setShowDoctorDrawer(true);
                      setCurrentDoctorPage(1);
                      setDoctorSearchQuery("");
                    }
                  }}
                  disabled={mode === "view"}
                  readOnly
                  style={{ cursor: mode === "view" ? "default" : "pointer" }}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Referral [Y/N]</label>
                {/* <input
                  type="text"
                  name="Referral"
                  className="form-control form-control-sm"
                  value={formData.Referral}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}
                <select
                  name="Referral"
                  className="form-control form-control-sm"
                  value={formData.Referral}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="N">N</option>
                  <option value="Y">Y</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Referral Name</label>
                <select
                  name="ReferralId"
                  className="form-control form-control-sm"
                  value={formData.ReferralId}
                  onChange={handleInputChange}
                  disabled={mode === "view" || formData.Referral === "N"}
                >
                  {formData.Referral === "Y" ? (
                    referral.map((d, indx) => (
                      <option key={indx} value={d.ReferalId}>
                        {d.Referal}
                      </option>
                    ))
                  ) : (
                    <option>---Select---</option>
                  )}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Package [Y/N]</label>

                <select
                  name="Package"
                  className="form-control form-control-sm"
                  value={formData.Package}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Package Name</label>

                <select
                  name="PackageId"
                  className="form-control form-control-sm"
                  value={formData.PackageId}
                  onChange={(e) => {
                    handleInputChange(e);
                    calPackageAmount(e.target.value);
                  }}
                  disabled={mode === "view" || formData.Package === "N"}
                >
                  {formData.Package === "Y" ? (
                    packages.map((d, indx) => (
                      <option key={indx} value={d.PackageId}>
                        {d.Package}
                      </option>
                    ))
                  ) : (
                    <option>---Select---</option>
                  )}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Valid Till</label>
                <input
                  type="date"
                  name="packagevalid"
                  className="form-control form-control-sm"
                  value={formData.packagevalid}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Start Date</label>
                <input
                  type="date"
                  name="packagestart"
                  className="form-control form-control-sm"
                  value={formData.packagestart}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Cashless[Y/N]</label>

                <select
                  name="CashLess"
                  className="form-control form-control-sm"
                  value={formData.CashLess}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Cashless</label>

                <select
                  name="CashLessId"
                  className="form-control form-control-sm"
                  value={formData.CashLessId}
                  onChange={handleInputChange}
                  disabled={mode === "view" || formData.CashLess === "N"}
                >
                  {/* {fetchedCashLess.map((d, indx) => (
                    <option key={indx} value={d.CashlessId}>
                      {d.Cashless}
                    </option>
                  ))} */}
                  {formData.CashLess === "Y" ? (
                    fetchedCashLess.map((d, indx) => (
                      <option key={indx} value={d.CashlessId}>
                        {d.Cashless}
                      </option>
                    ))
                  ) : (
                    <option>---Select---</option>
                  )}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Insurance Company</label>
                {/* <input
                  type="text"
                  name="InsComp"
                  className="form-control form-control-sm"
                  value={formData.InsComp}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}

                <select
                  name="InsComp"
                  className="form-control form-control-sm"
                  value={formData.InsComp}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {fetchedInsCompany.map((d, indx) => (
                    <option key={indx} value={d.CashlessId}>
                      {d.Cashless}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small">MF Executive</label>
                <select
                  name="MEXECUTIVE"
                  className="form-control form-control-sm"
                  value={formData.MEXECUTIVE || ""}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="">-- Select --</option>
                  {mExecutives.map((d, indx) => (
                    <option key={indx} value={d.MExecutiveId}>
                      {d.MExecutive}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small">Bed No.</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedBedName || bed.find(b => b.BedId == formData.BedId)?.Bed || ""}
                  onClick={async () => {
                    if (mode !== "view" && formData.DepartmentId) {
                      setShowBedDrawer(true);
                      setCurrentBedPage(1);
                      setBedSearchQuery("");
                      await fetchDrawerBeds(1, "");
                    } else if (!formData.DepartmentId) {
                      alert("Please select a Department first!");
                    }
                  }}
                  disabled={mode === "view"}
                  readOnly
                  style={{ cursor: mode === "view" ? "default" : "pointer" }}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Bed Rate</label>
                <input
                  type="text"
                  name="BedRate"
                  className="form-control form-control-sm"
                  value={formData.BedRate || "0"}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small">Day Care [Y/N]</label>
                <select
                  name="DayCareYN"
                  className="form-control form-control-sm"
                  value={formData.DayCareYN}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small">Particular</label>
                <select
                  name="DayCareId"
                  className="form-control form-control-sm"
                  value={formData.DayCareId || "0"}
                  onChange={(e) => {
                    handleInputChange(e);
                    calDayCareBedRate(e.target.value);
                  }}
                  disabled={mode === "view" || formData.DayCareYN === "N"}
                >
                  {dayCare.map((d, indx) => (
                    <option key={indx} value={d.DayCareId}>
                      {d.DayCare} {d.Rate ? `--- ${d.Rate}` : ""}
                    </option>
                  ))}
                </select>
              </div>


              <div className="col-md-2">
                <label className="form-label small">Employee</label>
                <input
                  type="text"
                  name="Nameemp"
                  className="form-control form-control-sm"
                  value={formData.Nameemp}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Emp Code</label>
                <input
                  type="text"
                  name="empcode"
                  className="form-control form-control-sm"
                  value={formData.empcode}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Disease</label>
                {/* <input
                  type="text"
                  name="DiseaseId"
                  className="form-control form-control-sm"
                  value={formData.DiseaseId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}
                <select
                  name="DiseaseId"
                  className="form-control form-control-sm"
                  value={formData.DiseaseId}
                  onChange={(e) => {
                    handleInputChange(e);
                    calDiseaseCode(e.target.value);
                  }}
                  disabled={mode === "view"}
                >
                  {diseases.map((d, indx) => (
                    <option key={indx} value={d.DiseaseId}>
                      {d.Disease}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small">R.M.O.</label>
                {/* <input
                  type="text"
                  name="RMOId"
                  className="form-control form-control-sm"
                  value={formData.RMOId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}
                <select
                  name="RMOId"
                  className="form-control form-control-sm"
                  value={formData.RMOId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {rmo.map((d, indx) => (
                    <option key={indx} value={d.DoctorId}>
                      {d.Doctor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small">Referring Doctor</label>
                {/* <input
                  type="text"
                  name="RefDoctorId"
                  className="form-control form-control-sm"
                  value={formData.RefDoctorId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}
                <select
                  name="RefDoctorId"
                  className="form-control form-control-sm"
                  value={formData.RefDoctorId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {doctors.map((d, indx) => (
                    <option key={indx} value={d.DoctorId}>
                      {d.Doctor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small">Referring Doctor 2</label>
                {/* <input
                  type="text"
                  name="RefDoctorId2"
                  className="form-control form-control-sm"
                  value={formData.RefDoctorId2}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}
                <select
                  name="RefDoctorId2"
                  className="form-control form-control-sm"
                  value={formData.RefDoctorId2}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  {doctors.map((d, indx) => (
                    <option key={indx} value={d.DoctorId}>
                      {d.Doctor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small">Package Amount</label>
                <input
                  type="text"
                  name="PackageAmount"
                  className="form-control form-control-sm"
                  value={formData.PackageAmount}
                  // onChange={handleInputChange}
                  disabled={mode === "view" || formData.Package === "N"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Total Package</label>
                {/* don't delete the comment */}
                {/* <input
                  type="text"
                  name="TotalPackage"
                  className="form-control form-control-sm"
                  value={formData.TotalPackage}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                /> */}
                <input
                  type="text"
                  name="PackageAmount"
                  className="form-control form-control-sm"
                  value={formData.PackageAmount}
                  // onChange={handleInputChange}
                  disabled={mode === "view" || formData.Package === "N"}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small">Card No</label>
                <input
                  type="text"
                  name="CardNo"
                  className="form-control form-control-sm"
                  value={formData.CardNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small">CCN No</label>
                <input
                  type="text"
                  name="CCNNo"
                  className="form-control form-control-sm"
                  value={formData.CCNNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small">Ins. Policy No</label>
                <input
                  type="text"
                  name="PolcNo"
                  className="form-control form-control-sm"
                  value={formData.PolcNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small">Admission By</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name || 'Admin' : 'Admin'}
                  disabled
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Current User</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name || 'Admin' : 'Admin'}
                  disabled
                />
              </div>


              <div className="col-md-3">
                <label className="form-label small">Operation Date</label>
                <input
                  type="date"
                  name="oprationdate"
                  className="form-control form-control-sm"
                  value={formData.oprationdate}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Operation Time</label>
                <input
                  type="text"
                  name="optime"
                  className="form-control form-control-sm"
                  value={formData.optime}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label small">Remarks</label>
                <textarea
                  name="Remarks"
                  className="form-control form-control-sm"
                  rows="2"
                  value={formData.Remarks}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                ></textarea>
              </div>

              <div className="col-md-12">
                <label className="form-label small">Notes</label>
                <textarea
                  name="SpRemarks"
                  className="form-control form-control-sm"
                  rows="2"
                  value={formData.SpRemarks}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                ></textarea>
              </div>
            </div>
          </div>

          {/* ================== FOOTER (Panel-Footer Style) ================== */}
          <div className="panel-footer d-flex justify-content-end flex-wrap gap-2 p-3">
            <div className="btn-group">
              {footerActions.map((btn, i) => (
                <button
                  key={i}
                  className={`btn btn-sm btn-${btn.variant}`}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {/* Additional buttons from Admission Detail example */}
            <div className="btn-group">
              <button className="btn btn-sm btn-secondary">Barcode</button>
              <button className="btn btn-sm btn-secondary">
                H Risk Consent
              </button>
              <button className="btn btn-sm btn-secondary">Consent</button>
            </div>
          </div>
        </div>
      </div>

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
            <button className="right-bar-close" onClick={() => setShowDoctorDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div className="dropdown-txt" style={{ backgroundColor: "#0a1735", color: "white", position: "sticky", top: 0, zIndex: 10 }}>
                Doctor Selection
              </div>
              <div style={{ height: "calc(100% - 70px)", overflowY: "auto" }} className="p-3">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search doctor by name..."
                    value={doctorSearchQuery}
                    onChange={(e) => {
                      setDoctorSearchQuery(e.target.value);
                      setCurrentDoctorPage(1);
                    }}
                  />
                </div>

                <div className="mb-4 border rounded-3 p-3 shadow-sm">
                  <div className="row g-2 overflow-auto" style={{ maxHeight: "400px" }}>
                    {doctors
                      .filter((d) =>
                        d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                      )
                      .slice(
                        (currentDoctorPage - 1) * doctorsPerPage,
                        currentDoctorPage * doctorsPerPage
                      )
                      .map((doctor, i) => (
                        <div className="col-md-6 col-lg-4" key={i}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="doctorSelection"
                              id={`doctor-${i}`}
                              checked={formData[selectedDoctorField] == doctor.DoctorId}
                              onChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  [selectedDoctorField]: doctor.DoctorId,
                                }));
                                setShowDoctorDrawer(false);
                              }}
                            />
                            <label className="form-check-label" htmlFor={`doctor-${i}`}>
                              {doctor.Doctor}
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              {doctors.filter((d) =>
                d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
              ).length > doctorsPerPage && (
                <nav className="mt-3">
                  <ul className="pagination pagination-sm justify-content-center">
                    <li className={`page-item ${currentDoctorPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentDoctorPage((p) => Math.max(p - 1, 1))}
                        disabled={currentDoctorPage === 1}
                      >
                        ← Prev
                      </button>
                    </li>
                    {(() => {
                      const filteredDoctors = doctors.filter((d) =>
                        d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                      );
                      const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentDoctorPage - 2);
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                      const pages = [];
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <li key={i} className={`page-item ${currentDoctorPage === i ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setCurrentDoctorPage(i)}>
                              {i}
                            </button>
                          </li>
                        );
                      }
                      return pages;
                    })()}
                    <li
                      className={`page-item ${
                        currentDoctorPage ===
                        Math.ceil(
                          doctors.filter((d) =>
                            d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                          ).length / doctorsPerPage
                        )
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentDoctorPage((p) =>
                            Math.min(
                              p + 1,
                              Math.ceil(
                                doctors.filter((d) =>
                                  d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                                ).length / doctorsPerPage
                              )
                            )
                          )
                        }
                        disabled={
                          currentDoctorPage ===
                          Math.ceil(
                            doctors.filter((d) =>
                              d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                            ).length / doctorsPerPage
                          )
                        }
                      >
                        Next →
                      </button>
                    </li>
                  </ul>
                  <div className="text-center mt-2 text-muted small">
                    Showing{" "}
                    {Math.min(
                      (currentDoctorPage - 1) * doctorsPerPage + 1,
                      doctors.filter((d) =>
                        d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                      ).length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentDoctorPage * doctorsPerPage,
                      doctors.filter((d) =>
                        d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                      ).length
                    )}{" "}
                    of{" "}
                    {doctors.filter((d) =>
                      d.Doctor.toLowerCase().includes(doctorSearchQuery.toLowerCase())
                    ).length}{" "}
                    doctors
                  </div>
                </nav>
              )}
              </div>
            </div>
          </div>
        </>
      )}

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
            <button className="right-bar-close" onClick={() => setShowBedDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div className="dropdown-txt" style={{ backgroundColor: "#0a1735", color: "white", position: "sticky", top: 0, zIndex: 10 }}>
                Bed Selection
              </div>
              <div style={{ height: "calc(100% - 70px)", overflowY: "auto" }} className="p-3">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search bed by name..."
                    value={bedSearchQuery}
                    onChange={(e) => {
                      setBedSearchQuery(e.target.value);
                      setCurrentBedPage(1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        fetchDrawerBeds(1, bedSearchQuery);
                      }
                    }}
                  />
                </div>

                <div className="mb-4 border rounded-3 p-3 shadow-sm">
                  <div className="row g-2 overflow-auto" style={{ maxHeight: "400px" }}>
                    {drawerBeds.map((bedItem, i) => (
                      <div className="col-md-6 col-lg-4" key={i}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="bedSelection"
                            id={`bed-${i}`}
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
                          <label className="form-check-label" htmlFor={`bed-${i}`}>
                            {bedItem.Bed}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              {totalBedPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination pagination-sm justify-content-center">
                    <li className={`page-item ${currentBedPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => {
                          const newPage = currentBedPage - 1;
                          setCurrentBedPage(newPage);
                          fetchDrawerBeds(newPage, bedSearchQuery);
                        }}
                        disabled={currentBedPage === 1}
                      >
                        ← Prev
                      </button>
                    </li>
                    {(() => {
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentBedPage - 2);
                      let endPage = Math.min(totalBedPages, startPage + maxVisible - 1);

                      const pages = [];
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <li key={i} className={`page-item ${currentBedPage === i ? "active" : ""}`}>
                            <button className="page-link" onClick={() => {
                              setCurrentBedPage(i);
                              fetchDrawerBeds(i, bedSearchQuery);
                            }}>
                              {i}
                            </button>
                          </li>
                        );
                      }
                      return pages;
                    })()}
                    <li className={`page-item ${currentBedPage === totalBedPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => {
                          const newPage = currentBedPage + 1;
                          setCurrentBedPage(newPage);
                          fetchDrawerBeds(newPage, bedSearchQuery);
                        }}
                        disabled={currentBedPage === totalBedPages}
                      >
                        Next →
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
              </div>
            </div>
          </div>
        </>
      )}

      {showBedModal && (
        <>
          {/* dark backdrop */}
          <div
            onClick={() => setShowBedModal(false)}
            className="modal-backdrop fade show"
            style={{ zIndex: 9998 }}
          ></div>

          {/* centered modal */}
          <div
            className="d-flex  w-100 h-80"
            style={{
              position: "fixed",
              inset: 200,
              zIndex: 9999,
            }}
          >
            <div
              className="profile-right-sidebar"
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
                maxHeight: "90vh",

                borderRadius: "10px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                className="top-panel"
                style={{
                  height: "100%",
                  paddingTop: "10px",
                }}
              >
                <div
                  className="dropdown-txt"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,

                    padding: "10px",
                  }}
                >
                  Bed Selection
                </div>

                <OverlayScrollbarsComponent style={{ maxHeight: "70vh" }}>
                  <div className="p-3">
                    <form>
                      <div className="mb-3">
                        {/* SCROLL WRAPPER */}
                        <div
                          style={{
                            maxHeight: "170px", // vertical scroll height
                            overflowY: "auto", // vertical scroll
                            overflowX: "auto", // horizontal scroll
                            borderRadius: "6px",
                          }}
                        >
                          <table
                            className="table table-bordered table-striped mb-0"
                            style={{ minWidth: "600px" }}
                          >
                            <thead>
                              <tr>
                                <th>Bed</th>
                                <th>Bed Charge</th>
                                <th>Attendant Charge</th>
                                <th>RMO Charge</th>
                              </tr>
                            </thead>

                            <tbody className="text-center">
                              {filteredBed.map((bed, indx) => (
                                <tr key={indx}>
                                  <td>{bed.Bed}</td>
                                  <td>{bed.BedCh}</td>
                                  <td>{bed.AtttndantCh}</td>
                                  <td>{bed.RMOCh}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-3">
                        <button
                          onClick={() => setShowBedModal(false)}
                          type="button"
                          className="btn btn-secondary w-50"
                        >
                          Cancel
                        </button>

                        <button type="submit" className="btn btn-primary w-50">
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </OverlayScrollbarsComponent>
              </div>
            </div>
          </div>
        </>
      )}

    </>
  );
};

export default PatientRegistrationDetail;
