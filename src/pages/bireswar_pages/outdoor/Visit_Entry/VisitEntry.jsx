import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../axiosInstance";
// Removed unused CSS import: import './OutdoorVisitDetail_Compact.css';

const VisitEntry = () => {

  // for modal and multiple member in same phone number
const [searchResults, setSearchResults] = useState([]);
const [showModal, setShowModal] = useState(false);
const [cashlessData, setCashlessData] = useState([]);




  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { mode, patientData } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [religions, setReligions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([
    {
      type: "0", // 0=Cash, 1=UPI, 2=Cheque
      amount: "",
      upiApp: "",
      utrNumber: "",
      bankName: "",
      chequeNumber: "",
    },
  ]);

  // Helper to get initial time in HH:MM (24-hour) format
  const getInitialTime = () => new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({

    
    // Booking fields
    Booking: "N",
    RegistrationDate: new Date().toISOString().split("T")[0],
    RegistrationTime: getInitialTime(), // State holds HH:MM (24h)
    quota: false,
    queueNo: 0,
    // Registration fields
    OPD: "",
    PatientName: "",
    PhoneNo: "",
    RegistrationId: "",
    registrationNo: "",
    // Patient fields
    PPr: "",
    GurdianName: "",
    Relation: "",
    Sex: "",
    MStatus: "",
    dob: "",
    Age: "",
    AgeD: "", // months
    AgeN: "", // days
    Add1: "",
    Add2: "",
    Add3: "",
    fullAddress: "",
    email: "",
    ReligionId: "",
    Weight: "",
    Height: "",
    BpMin: "",
    BpMax: "",
    BloodGroup: "",
    Company: "",
    emergencyContact: "",
    // Doctor fields
    DepartmentId: "",
    SpecialityId: "",
    doctorId: "",
    dept: "",
    docName: "",
    // Billing fields
    VNo: "",
    OutBillDate: new Date().toISOString().split("T")[0],
    RegCh: "",
    Rate: "",
    svrCh: "",
    pDisc: "",
    Discount: "",
    proffDisc: "",
    proffDiscAmt: "",
    discp: "",
    srvChDisc: "",
    billAmt: "",
    narration: "",
    // Payment fields (mostly handled by paymentMethods state now)
    receiptAmount: "",
    dueamt: '',
    receiptType: "CASH",
    paidamt: "",
    bankName: "",
    chequeCard: "",
    PolcNo: "",
    CCNNo: "",
    CardNo: "",

    "Cashless": "N",
    CashLessName: "",      // ⭐ ADD THIS
  CompanyYN: "",         // ⭐ ADD THIS
  CompanyName: "",  
  });




useEffect(() => {
 const fetchCashLess = async () => {
  try {
    const cashless = await axiosInstance.get("/cashless");
    if(cashless.data.success){
      setCashlessData(cashless.data.data)
      console.log("CashLess Data:", cashless.data.data);
    }
  } catch (error) {
    console.error("Error fetching CashLess:", error);
  }
}

  fetchCashLess();
}, []);




  // Fetch religions and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch religions
        const religionResponse = await axiosInstance.get("/religion", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (religionResponse.data && religionResponse.data.success) {
          setReligions(religionResponse.data.data || []);
        }

        // Fetch departments
        const deptResponse = await axiosInstance.get("/speciality", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (deptResponse.data && deptResponse.data.success) {
          setDepartments(deptResponse.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const loadPatientData = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      if (patientData) {
        data = patientData;
      } else if (id) {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get('/admission/search?name=${name}&phone=${phone}', {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = response.data.data;
      }

      if (data) {
        const token = localStorage.getItem("token");
        let doctorName = "";

        if (data.outdoorbills?.[0]) {
          const billData = data.outdoorbills[0];

          if (billData.DoctorId) {
            try {
              const doctorResponse = await axiosInstance.get(
                `/doctormaster/${billData.DoctorId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (doctorResponse.data && doctorResponse.data.success) {
                doctorName = doctorResponse.data.data.Doctor;
              }
            } catch (error) {
              console.error("Error fetching doctor details:", error);
            }
          }

          if (billData.department) {
            try {
              const deptResponse = await axiosInstance.get(
                `/speciality/${billData.department}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (deptResponse.data && deptResponse.data.success) {
                setDepartmentName(deptResponse.data.data.Speciality);
              }

              const doctorsResponse = await axiosInstance.get(
                `/doctormaster/department/${billData.department}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (doctorsResponse.data && doctorsResponse.data.success) {
                setDoctors(doctorsResponse.data.data || []);
              }
            } catch (error) {
              console.error("Error fetching department details:", error);
            }
          }
        }

        setFormData({
          // Patient Visit fields
          PVisitId: data.PVisitId,
          RegistrationId: data.RegistrationId || "",
          PVisitDate: data.PVisitDate
            ? data.PVisitDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          vTime: data.vTime || getInitialTime(),
          // Patient Registration fields
          PatientName: data.PatientName || "",
          PhoneNo: data.PhoneNo || "",
          Age: data.Age?.toString() || "",
          Sex: data.Sex || "",
          Add1: data.PatientAdd1 || data.Add1 || "",
          Add2: data.PatientAdd2 || data.Add2 || "",
          Add3: data.PatientAdd3 || data.Add3 || "",
          fullAddress: data.PatientAdd1 || data.Add1 || "",
          PPr: data.PPr || "",
          GurdianName: data.GurdianName || "",
          Relation: data.Relation || "",
          MStatus: data.MStatus || "",
          dob: data.Dob ? data.Dob.split("T")[0] : "",
          AgeD: data.AgeD?.toString() || "",
          AgeN: data.AgeN?.toString() || "",
          email: data.EMailId || "",
          ReligionId: data.ReligionId?.toString() || "",
          Weight:
            data.Weight?.toString() || data.PatientWeight?.toString() || "",
          Height: data.Height?.toString() || "",
          BpMin: data.BpMin?.toString() || data.bpmin?.toString() || "",
          BpMax: data.BpMax?.toString() || data.bpmax?.toString() || "",
          BloodGroup: data.BloodGroup || "",
          // Doctor and Department fields
          DepartmentId: data.SpecialityId?.toString() || "",
          doctorId: data.DoctorId?.toString() || "",
          docName: data.DoctorName || doctorName,

          
          // Billing fields from PatientVisit
          VNo: data.VNo || "",
          OutBillDate: data.PVisitDate
            ? data.PVisitDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          RegistrationTime: data.vTime || getInitialTime(),
          RegCh: data.RegCh?.toString() || "0.00",
          Rate: data.Rate?.toString() || "0.00",
          svrCh: data.ServiceCh?.toString() || "0.00",
          pDisc: "0.00",
          Discount: data.Discount?.toString() || "0.00",
          discp: data.discp?.toString() || "0.00",
          srvChDisc: data.SrvChDisc?.toString() || "0.00",
          billAmt: data.TotAmount?.toString() || "0.00",
          narration: data.Remarks || data.Narration || "",
          dueamt: data.DueAmt?.toString() || "",
          paidamt: data.RecAmt?.toString() || "",
          // Booking fields
          Booking: "N",
          quota: false,
          queueNo: data.QNo || 0,
          OPD: "Y",
        });

        // Load existing payment methods from patient visit data
        if (data.paymentMethods && Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
          const existingPayments = data.paymentMethods.map(pm => ({
            type: pm.type?.toString() || "0",
            amount: pm.amount?.toString() || "",
            upiApp: pm.upiApp || "",
            utrNumber: pm.utrNumber || "",
            bankName: pm.bankName || "",
            chequeNumber: pm.chequeNumber || "",
          }));
          setPaymentMethods(existingPayments);
        } else if (data.RecAmt && parseFloat(data.RecAmt) > 0) {
          // Fallback for old single payment format
          const paymentMethod = {
            type: data.PaymentType?.toString() || "0",
            amount: data.RecAmt?.toString() || "",
            upiApp: data.PaymentType === 1 ? data.BANK || "" : "",
            utrNumber: data.PaymentType === 1 ? data.Cheque || "" : "",
            bankName: data.PaymentType === 2 ? data.BANK || "" : "",
            chequeNumber: data.PaymentType === 2 ? data.Cheque || "" : "",
          };
          setPaymentMethods([paymentMethod]);
        }
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
      alert("Error loading patient data");
    } finally {
      setIsLoading(false);
    }
  }, [id, patientData]);

  // Fetch existing data if in view/edit mode
  useEffect(() => {
    if (id || patientData) {
      loadPatientData();
    }
  }, [id, patientData, loadPatientData]);

  // Auto-calculate DOB when age fields change
  useEffect(() => {
    const years = parseInt(formData.Age) || 0;
    const months = parseInt(formData.AgeD) || 0;
    const days = parseInt(formData.AgeN) || 0;

    if (
      (years || months || days) &&
      !formData.dob &&
      formData.RegistrationDate
    ) {
      try {
        const regDate = new Date(formData.RegistrationDate);
        if (!isNaN(regDate.getTime())) {
          const birthDate = new Date(regDate);
          birthDate.setFullYear(birthDate.getFullYear() - years);
          birthDate.setMonth(birthDate.getMonth() - months);
          birthDate.setDate(birthDate.getDate() - days);
          if (!isNaN(birthDate.getTime())) {
            const dobString = birthDate.toISOString().split("T")[0];
            setFormData((prev) => ({ ...prev, dob: dobString }));
          }
        }
      } catch (error) {
        console.error("Error calculating DOB:", error);
      }
    }
  }, [
    formData.Age,
    formData.AgeD,
    formData.AgeN,
    formData.RegistrationDate,
    formData.dob,
  ]);

  // Auto-calculate age when DOB changes
  const handleDobChange = (value) => {
    if (value && formData.RegistrationDate) {
      try {
        const birthDate = new Date(value);
        const regDate = new Date(formData.RegistrationDate);

        if (!isNaN(birthDate.getTime()) && !isNaN(regDate.getTime())) {
          let years = regDate.getFullYear() - birthDate.getFullYear();
          let months = regDate.getMonth() - birthDate.getMonth();
          let days = regDate.getDate() - birthDate.getDate();

          if (days < 0) {
            months--;
            const lastMonth = new Date(
              regDate.getFullYear(),
              regDate.getMonth(),
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
            dob: value,
            Age: years.toString(),
            AgeD: months.toString(),
            AgeN: days.toString(),
          }));
        }
      } catch (error) {
        console.error("Error calculating age:", error);
        setFormData((prev) => ({ ...prev, dob: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, dob: value }));
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Payment Methods Functions
  const addPaymentMethod = () => {
    setPaymentMethods([
      ...paymentMethods,
      {
        type: "0",
        amount: "",
        upiApp: "",
        utrNumber: "",
        bankName: "",
        chequeNumber: "",
      },
    ]);
  };

  const removePaymentMethod = (index) => {
    const newMethods = paymentMethods.filter((_, i) => i !== index);
    setPaymentMethods(newMethods);
  };

  const updatePaymentMethod = (index, field, value) => {
    const newMethods = [...paymentMethods];
    newMethods[index][field] = value;
    setPaymentMethods(newMethods);
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Fetch doctors when department changes
    if (name === "DepartmentId" && value) {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get(
          `/doctormaster/department/${value}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && response.data.success) {
          setDoctors(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      }
    }

    // Update doctor name when doctor is selected
    if (name === "doctorId" && value) {
      const selectedDoctor = doctors.find(
        (doc) => doc.DoctorId.toString() === value
      );
      if (selectedDoctor) {
        setFormData((prev) => ({ ...prev, docName: selectedDoctor.Doctor }));
      }
    }

    // ------cashlesh----- 
// CASHLESS LOGIC


// When user manually selects a cashless name


// When user selects company



  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate total payment and due amount
      const totalPaidAmount = paymentMethods.reduce(
        (sum, p) => sum + parseFloat(p.amount || 0),
        0
      );
      const totalBillAmount = parseFloat(formData.billAmt || 0);
      const dueAmount = totalBillAmount - totalPaidAmount;

      // For billing information, use patient visit API
   const visitData = {
  RegistrationDate: formData.RegistrationDate,
  RegistrationTime: formData.RegistrationTime,
  PatientName: formData.PatientName,
  Add1: formData.Add1,
  Add2: formData.Add2,
  Add3: formData.Add3,

  // AGE
  Age: parseInt(formData.Age) || 0,
  AgeType: "Y",
  AgeD: parseInt(formData.AgeD) || 0,
  AgeTypeD: "M",
  AgeN: parseInt(formData.AgeN) || 0,
  AgeTypeN: "D",
  Dob: formData.dob,

  // BASIC INFO
  Sex: formData.Sex,
  MStatus: formData.MStatus,
  PhoneNo: formData.PhoneNo,
  AreaId: null, // if you have it add it
  ReligionId: parseInt(formData.ReligionId) || null,
  UserId: localStorage.getItem("userId") ?? 0,
  EMailId: formData.email,
  PPr: formData.PPr,
  CareOf: formData.Relation,
  GurdianName: formData.GurdianName,

  // VITALS
  Height: parseInt(formData.Height) || 0,
  Hight: parseInt(formData.Height) || 0, // backend spelling mistake
  Weight: parseInt(formData.Weight) || 0,
  BloodGroup: formData.BloodGroup,
  bpmin: parseInt(formData.BpMin) || 0,
  bpmax: parseInt(formData.BpMax) || 0,
  BpMin: parseInt(formData.BpMin) || 0,
  BpMax: parseInt(formData.BpMax) || 0,
  Temperatare: null,

  // VISIT
  PVisitDate: formData.RegistrationDate,
  vTime: formData.RegistrationTime,
  BTime: formData.RegistrationTime,
  BDate: formData.RegistrationDate,
  BookingYN: formData.Booking,
  VisitTypeId: 1,
  Rate: parseFloat(formData.Rate) || 0,
  Discount: parseFloat(formData.Discount) || 0,
  TotAmount: parseFloat(formData.billAmt) || 0,
  AdvAmt: 0,
  ServiceCh: parseFloat(formData.svrCh) || 0,
  SrvChDisc: parseFloat(formData.srvChDisc) || 0,
  RegCh: Number(formData.RegCh),
  NewRegYN: "Y",

  // QUEUE
  QNo: formData.queueNo,
  Quota: formData.quota ? 1 : 0,

  // DOCTOR
  SpecialityId: parseInt(formData.DepartmentId),
  DoctorId: parseInt(formData.doctorId),

  // REMARKS
  Remarks: formData.narration,
  Narration: formData.narration,

  // PAYMENT - Multiple payment methods
  paymentMethods: paymentMethods.map(pm => ({
    type: pm.type,
    amount: parseFloat(pm.amount) || 0,
    upiApp: pm.upiApp || "",
    utrNumber: pm.utrNumber || "",
    bankName: pm.bankName || "",
    chequeNumber: pm.chequeNumber || "",
  })),
  PaymentType: paymentMethods[0]?.type,
  BANK: paymentMethods[0]?.bankName || paymentMethods[0]?.upiApp || "",
  Cheque: paymentMethods[0]?.chequeNumber || paymentMethods[0]?.utrNumber || "",
  RecAmt: totalPaidAmount,
  DueAmt: dueAmount,
  FinalRecAmt: totalPaidAmount,

  // EXTRA FIELDS
  REG: "Y",
  Asst1YN: "N",
  Asst1: 0,
  Asst2YN: "N",
  Asst2: 0,
  Asst3YN: "N",
  Asst3: 0,
  CancelYN: null,
  CancelDt: null,
  ReferralId: 0,
  Referalid: 0,
  CompanyId: 0,
  m_CompanyId: 0,
  
  admissionid: " ",
  Admissionno: null,
  Clearing: "N",
};


      // if (!visitData.RegistrationId || !visitData.PVisitDate) {
      //   alert("Registration ID and Visit Date are required");
      //   return;
      // }

      let response;

      if (mode === "edit" && (id || formData.PVisitId)) {
        const visitId = id || formData.PVisitId;
        console.log("Sending Data to Backend:", visitData);

        response = await axiosInstance.put(
          `/patient-visits/${visitId}`,
          visitData
        );
      } else {
        response = await axiosInstance.post("/patient-visits", visitData);
      }

      if (response.data && response.data.success) {
        alert(`Visit ${mode === "edit" ? "updated" : "created"} successfully!`);
        navigate("/table-data");
      } else {
        alert(response.data?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };







const autoFillForm = async (data) => {
  setFormData((prev) => ({
    ...prev,

    // BASIC DETAILS
    RegistrationId: data.RegistrationId || "",
    PatientName: data.PatientName || "",
    PhoneNo: data.PhoneNo || "",
    Sex: data.Sex || "",
    MStatus: data.MStatus || "",
    PPr: data.PPr || "",
    GurdianName: data.GurdianName || "",
    Relation: data.CareOf || "",
    email: data.EMailId || "",

    // ADDRESS
    Add1: data.PatientAdd1 || "",
    Add2: data.PatientAdd2 || "",
    Add3: data.PatientAdd3 || "",
    fullAddress: `${data.PatientAdd1 || ""} ${data.PatientAdd2 || ""} ${data.PatientAdd3 || ""}`.trim(),

    // AGE
    Age: data.Age?.toString() || "",
    AgeD: data.AgeD?.toString() || "",
    AgeN: data.AgeN?.toString() || "",
    dob: data.Dob ? data.Dob.split("T")[0] : "",

    // RELIGION
    ReligionId: data.ReligionId?.toString() || "",

    // DOCTOR & DEPARTMENT
    DepartmentId: data.SpecialityId?.toString() || "",
    doctorId: data.DoctorId?.toString() || "",
    docName: data.DoctorName || "",

    // VITALS
    Weight: data.Weight?.toString() || data.PatientWeight?.toString() || "",
    Height: data.Hight?.toString() || data.Height?.toString() || "",
    BpMin: data.bpmin?.toString() || data.BpMin?.toString() || "",
    BpMax: data.bpmax?.toString() || data.BpMax?.toString() || "",
    BloodGroup: data.BloodGroup || "",

    // VISIT DETAILS
    RegistrationDate: data.RegistrationDate
      ? data.RegistrationDate.split("T")[0]
      : "",
    RegistrationTime: data.RegistrationTime || "",
    VNo: data.VNo || "",
    OutBillDate: data.PVisitDate ? data.PVisitDate.split("T")[0] : "",
    Rate: data.Rate?.toString() || "",
    RegCh: data.RegCh?.toString() || "",
    svrCh: data.ServiceCh?.toString() || "",
    Discount: data.Discount?.toString() || "",
    srvChDisc: data.SrvChDisc?.toString() || "",
    billAmt: data.TotAmount?.toString() || "",
    narration: data.Narration || data.Remarks || "",
    queueNo: data.QNo || 0,







  }));

  // ⭐ Load doctors for that department
  if (data.SpecialityId) {
    const res = await axiosInstance.get(
      `/doctormaster/department/${data.SpecialityId}`
    );
    setDoctors(res.data.data || []);
  }
};




// search---------------------------------------------------------------------- 
const searchExistingPatient = async () => {
  const name = formData.PatientName?.trim();
  const phone = formData.PhoneNo?.trim();

  if (!name && !phone) {
    alert("Enter Name or Phone Number");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await axiosInstance.get("/patient-visits/search", {
      params: { name, phone },
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("SEARCH RESPONSE:", res.data);

    // ✔ Extract the FIRST object from "data" array
    const patient = res.data?.data?.[0];

    if (!patient) {
      alert("No matching patient found");
      return;
    }

    autoFillForm(patient);

    // ⭐ Department & Doctor auto-load
   const selectedDept = patient?.SpecialityId
    ? String(patient.SpecialityId)
    : null;

    if (selectedDept) {
      setFormData(prev => ({ ...prev, DepartmentId: selectedDept }));

      const resDept = await axiosInstance.get(
        `/doctormaster/department/${selectedDept}`,
        // {
        //   headers: { Authorization: `Bearer ${token}` },
        // }
      );
console.log((resDept.data.data || []));
      setDoctors(resDept.data.data || []);
    }

  } catch (error) {
    console.error("Search Error:", error);
    alert("Error searching patient");
  }
};


// bill calculation---------------------------------------- 
useEffect(() => {
  const RegCh = parseFloat(formData.RegCh) || 0;
  const Rate = parseFloat(formData.Rate) || 0;
  const svrCh = parseFloat(formData.svrCh) || 0;
  const Discount = parseFloat(formData.Discount) || 0;
  const srvChDisc = parseFloat(formData.srvChDisc) || 0;

  const total =
    RegCh +
    Rate +
    svrCh -
    Discount -
    srvChDisc;

  setFormData(prev => ({
    ...prev,
    billAmt: total.toFixed(2)
  }));

}, [
  formData.RegCh,
  formData.Rate,
  formData.svrCh,
  formData.Discount,
  formData.srvChDisc
]);




  // ------------------------------------
  // Due Amount Calculation Logic
  // ------------------------------------
  const totalPaid = paymentMethods.reduce(
    (sum, p) => sum + parseFloat(p.amount || 0),
    0
  );
  const billAmount = parseFloat(formData.billAmt || 0);

  const calculatedDueAmount = billAmount - totalPaid;
  const isDueAmountPositive = calculatedDueAmount > 0;





  return (
    <div>
      <div className="container-fluid py-3">
        {/* Adopting the panel structure from Emr.jsx */}
        <div className="panel">
          {/* Header */}
          <div className="panel-header">
            {/* Using d-flex and justify-content-between to place the button on the right */}
            <div className="d-flex justify-content-between align-items-center w-100">
              <h5 className="mb-0">
                {mode === "view" ? "View" : mode === "edit" ? "Edit" : "New"}{" "}
                Patient
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => navigate("/table-data")}
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="panel-body p-3">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading patient data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Booking Detail */}
                <h6 className="text-primary fw-bold border-bottom pb-1 mb-3">
                  Booking Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label">Advance Booking</label>
                    <select
                      name="Booking"
                      className="form-control"
                      value={formData.Booking}
                      onChange={handleChange}
                    >
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Visit Date</label>
                    <input
                      type="date"
                      name="RegistrationDate"
                      className="form-control"
                      value={formData.RegistrationDate || ""}
                      onChange={handleChange}
                    disabled={formData.Booking === "N"}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Visit Time</label>
                    {/* Time input expects HH:MM (24-hour) string */}
                    <input
                      type="time"
                      name="RegistrationTime"
                      className="form-control"
                      value={formData.RegistrationTime}
                      onChange={handleChange}
                                          disabled={formData.Booking === "N"}

                    />
                    {console.log(formData.RegistrationTime)
                    }
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Quota</label>
                    <div className="form-check pt-2">
                      <input
                        type="checkbox"
                        name="quota"
                        className="form-check-input"
                        checked={formData.quota}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">Enable</label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Queue No.</label>
                    <input
                      type="number"
                      name="queueNo"
                      className="form-control"
                      value={formData.queueNo || ""}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>

                {/* Registration Detail */}
                <h6 className="text-primary fw-bold border-bottom pb-1 mt-4 mb-3">
                  Registration
                </h6>
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label">Registration Type</label>
                    <select
                      name="OPD"
                      className="form-control"
                      value={formData.OPD}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Y">New Registration</option>
                      <option value="N">Existing Patient</option>
                    </select>
                  </div>





 <div className="col-md-1">
                    <label className="form-label">Prefix</label>
                    <select
                      name="PPr"
                      className="form-control"
                      value={formData.PPr}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>









                  <div className="col-md-2">

















                    
                    
    <label className="form-label">Patient Name</label>
    
    <input
      name="PatientName"
      className="form-control"
      value={formData.PatientName || ""}
      onChange={handleChange}
      style={{ textTransform: "uppercase" }}
    />
  </div>
  <div className="col-md-2">
    <label className="form-label">Phone Number</label>
    <input
      name="PhoneNo"
      className="form-control"
      maxLength="10"
      value={formData.PhoneNo || ""}
      onChange={handleChange}
    />
  </div>
   {/* 🔥 Search Button — show ONLY if Existing Patient */}
  {formData.OPD === "N" && (
    <div className="col-md-2 d-flex align-items-end">
      <button
        type="button"
        className="btn btn-sm btn-primary w-100"
        onClick={searchExistingPatient}
      >
        🔍 Search
      </button>
    </div>
  )}
  <div className="col-md-2">
                    <label className="form-label">Registration No</label>
                    <input
                      className="form-control"
                      value={formData.RegistrationId || "Auto-generated"}
                      readOnly
                    />
                  </div>
                 <div className="row g-3">
  

  

 
</div>

                
                  
                </div>

                {/* Patient Detail */}
                <h6 className="text-primary fw-bold border-bottom pb-1 mt-4 mb-3">
                  Patient Detail
                </h6>
                <div className="row g-3">
                 
                  <div className="col-md-2">
                    <label className="form-label">Guardian Name</label>
                    <input
                      name="GurdianName"
                      className="form-control"
                      style={{ textTransform: "uppercase" }}
                      value={formData.GurdianName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Care Of</label>
                    <select
                      name="Relation"
                      className="form-control"
                      value={formData.Relation}
                      onChange={handleChange}
                    >
                     <option value="">Select</option>
                      <option value="HUSBANd">W/O</option>
                      {formData.Sex !== "F" &&
                      <option value="FATHER">S/O</option>}
                     {formData.Sex !== "M" &&
                      <option value="FATHER">D/O</option>}
                      
                      
                    </select>
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Gender</label>
                    <select
                      name="Sex"
                      className="form-control"
                      value={formData.Sex}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="M">MALE</option>
                      <option value="F">FEMALE</option>
                      <option value="O">OTHER</option>
                    </select>
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Marital Status</label>
                    <select
                      name="MStatus"
                      className="form-control"
                      value={formData.MStatus}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="M">MARRIED</option>
                      <option value="U">UNMARRIED</option>
                    
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Patient ID</label>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">
                        {formData.RegistrationId || "Auto-gen"}
                      </small>
                    </div>
                  </div>
{/* Address & Contact */}
                  <div className="col-md-6">
                    <label className="form-label">Complete Address</label>
                    <input
                      name="fullAddress"
                      className="form-control"
                      value={formData.fullAddress || ""}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Religion</label>
                    <select
                      name="ReligionId"
                      className="form-control"
                      value={formData.ReligionId}
                      onChange={handleChange}
                    >
                      <option value="">Select Religion</option>
                      {religions.map((religion) => (
                        <option
                          key={religion.ReligionId}
                          value={religion.ReligionId}
                        >
                          {religion.Religion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {/* DOB & Age Row */}
                  <div className="col-md-2">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={formData.dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                    />
                    {formData.dob && (
                      <small className="text-muted">
                        {formatDate(formData.dob)}
                      </small>
                    )}
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Age (Years)</label>
                    <input
                      type="number"
                      name="Age"
                      className="form-control"
                      value={formData.Age}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          Age: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Months</label>
                    <input
                      type="number"
                      name="AgeD"
                      className="form-control"
                      value={formData.AgeD}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          AgeD: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Days</label>
                    <input
                      type="number"
                      name="AgeN"
                      className="form-control"
                      value={formData.AgeN}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          AgeN: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      name="Weight"
                      type="number"
                      className="form-control"
                      value={formData.Weight}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Physical Measurements */}
                  <div className="col-md-1">
                    <label className="form-label">Height (cm)</label>
                    <input
                      name="Height"
                      type="number"
                      className="form-control"
                      value={formData.Height}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">BP Max</label>
                    <input
                      name="BpMax"
                      type="number"
                      className="form-control"
                      value={formData.BpMax}
                      onChange={handleChange}
                      placeholder="120"
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">BP Min</label>
                    <input
                      name="BpMin"
                      type="number"
                      className="form-control"
                      value={formData.BpMin}
                      onChange={handleChange}
                      placeholder="80"
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Blood Group</label>
                    <select
                      name="BloodGroup"
                      className="form-control"
                      value={formData.BloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  
                </div>




{/* Cashless + Cashless Name + Company (Y/N) + Company Name */}

  <div className="row g-3 mt-3">


{/* new cashless-----  */}
 <div className="col-md-2">
      <label className="form-label">Cashless (Y/N)</label>
       <select
        name="Cashless"
        className="form-control"
        value={formData.Cashless}
        onChange={handleChange}
      >
        <option value="">Select</option>
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
     </div>
   {/* Cashless Name with Suggestion */}
 <div className="col-md-4">
      <label className="form-label">Cashless Name</label>
     <input
        list="cashlessList"
        type="text"
        className="form-control"
        name="CashLessName"
        value={formData.CashLessName || ""}
        onChange={handleChange}
        placeholder="Select Cashless"
        disabled={formData.Cashless !== "Y"}
      />

       {/* Suggestion List */}
  <datalist id="cashlessList">
    {cashlessData.map((item) => (
      <option key={item.id} value={item.cashless} />
    ))}
  </datalist>
</div>

    {/* Cashless Y/N
    <div className="col-md-2">
      <label className="form-label">Cashless (Y/N)</label>
      <select
        name="CashLess"
        className="form-control"
        value={formData.CashLess}
        onChange={handleChange}
      >
        <option value="">--</option>
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
    </div> */}

    {/* Cashless Name with Suggestion */}
    {/* <div className="col-md-4">
      <label className="form-label">Cashless Name</label>

      <input
        list="cashlessList"
        type="text"
        className="form-control"
        name="CashLessName"
        value={formData.CashLessName || ""}
        onChange={handleChange}
        placeholder="Select Cashless"
      />

      <datalist id="cashlessList">
        {cashlessData.map((item) => (
          <option key={item.id} value={item.cashless} />
        ))}
      </datalist>
    </div> */}

    {/* Company Y/N */}
    {/* <div className="col-md-2">
      <label className="form-label">Company (Y/N)</label>
      <select
        name="CompanyYN"
        className="form-control"
        value={formData.CompanyYN || ""}
        onChange={handleChange}
      >
        <option value="">--</option>
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
    </div> */}

    {/* Company Name with Suggestion */}
    {/* <div className="col-md-4">
      <label className="form-label">Company Name</label>

      <input
        list="companyList"
        type="text"
        className="form-control"
        name="CompanyName"
        value={formData.CompanyName || ""}
        onChange={handleChange}
        placeholder="Select Company"
      />

      <datalist id="companyList">
        {cashlessData.map((item) => (
          <option key={item.id} value={item.company} />
        ))}
      </datalist>
    </div> */}

  </div>










                {/* Doctor & Department */}
                <h6 className="text-primary fw-bold border-bottom pb-1 mt-4 mb-3">
                  Doctor & Department
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Department</label>
                    {mode === "view" ? (
                      <input
                        className="form-control"
                        value={
      departmentName ||
      departments.find(d => d.SpecialityId == formData.DepartmentId)?.Speciality ||
      ""
    }
                        
                        readOnly
                      />
                    ) : (
                      <select
                        name="DepartmentId"
                        className="form-control"
                        value={formData.DepartmentId}
                        onChange={handleChange}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option
                            key={dept.SpecialityId}
                            value={dept.SpecialityId}
                          >
                            {dept.Speciality}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Doctor</label>
                    {mode === "view" ? (
                      <input
                        className="form-control"
                        value={formData.docName}
                        readOnly
                      />
                    ) : (
                      <select
                        name="doctorId"
                        className="form-control"
                        value={formData.doctorId}
                        onChange={handleChange}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.DoctorId} value={doctor.DoctorId}>
                            {doctor.Doctor}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Doctor Name</label>
                    <input
                      name="docName"
                      className="form-control"
                      value={formData.docName}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>

                {/* Billing Details */}
                <h6 className="text-primary fw-bold border-bottom pb-1 mt-4 mb-3">
                  Billing
                </h6>
                <div className="row g-3">
                  <div className="col-md-1">
                    <label className="form-label">Bill No</label>
                    <input
                      name="VNo"
                      className="form-control"
                      value={formData.VNo}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Bill Date</label>
                    <input
                      type="date"
                      name="OutBillDate"
                      className="form-control"
                      value={formData.OutBillDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Bill Time</label>
                    <input
                      type="time"
                      name="RegistrationTime"
                      className="form-control"
                      value={formData.RegistrationTime}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Registration Charge </label>
                    <input
                      type="number"
                      name="RegCh"
                      className="form-control"
                      value={formData.RegCh}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Professional Charge</label>
                    <input
                      type="number"
                      name="Rate"
                      className="form-control"
                      value={formData.Rate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Service Charge</label>
                    <input
                      type="number"
                      name="svrCh"
                      className="form-control"
                      value={formData.svrCh}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Professional Disc. (%)</label>
                    <input
                      type="number"
                      name="discp"
                      className="form-control"
                      value={formData.discp}
                      onChange={(e) => {
                        const percent = parseFloat(e.target.value) || 0;
                        const amount =
                          ((parseFloat(formData.Rate) || 0) * percent) / 100;
                        setFormData((prev) => ({
                          ...prev,
                          discp: e.target.value,
                          Discount: amount.toFixed(2),
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Professional Disc. Amt</label>
                    <input
                      type="number"
                      name="Discount"
                      className="form-control"
                      value={formData.Discount}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        const percent =
                          parseFloat(formData.Rate) > 0
                            ? (amount / parseFloat(formData.Rate)) * 100
                            : 0;
                        setFormData((prev) => ({
                          ...prev,
                          Discount: e.target.value,
                          discp: percent.toFixed(2),
                        }));
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Service Discount</label>
                    <input
                      type="number"
                      name="srvChDisc"
                      className="form-control"
                      value={formData.srvChDisc}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Total Bill Amount</label>
                    <input
                      type="number"
                      name="billAmt"
                      className="form-control"
                      value={formData.billAmt}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Narration</label>
                    <input
                      name="narration"
                      className="form-control"
                      value={formData.narration}
                      onChange={handleChange}
                      placeholder="Enter billing notes"
                    />
                  </div>
                </div>

                {/* Payment Details */}
                <h6 className="text-primary fw-bold border-bottom pb-1 mt-4 mb-3">
                  Payment
                </h6>

                {/* Payment Summary */}
                <div className="row g-3 mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Total Bill Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.billAmt}
                      disabled
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Total Paid Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={paymentMethods.reduce(
                        (sum, p) => sum + parseFloat(p.amount || 0),
                        0
                      )}
                      readOnly
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Due Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={
                        calculatedDueAmount.toFixed(2)
                      }
                      readOnly
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label d-block">&nbsp;</label>{" "}
                    {/* Placeholder label for alignment */}
                    {isDueAmountPositive &&  <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={addPaymentMethod}
                    >
                      + Add Payment
                    </button> }
                   
                  </div>
                </div>

                {/* Multiple Payment Methods */}
                {paymentMethods.map((payment, index) => (
                  <div key={index} className="payment-card card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <small className="mb-0 fw-bold">
                        Payment #{index + 1}
                      </small>
                      {paymentMethods.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removePaymentMethod(index)}
                        >
                          <i className="fa-light fa-trash-can"></i>
                        </button>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-2">
                          <label className="form-label">Payment Type</label>
                          <select
                            className="form-control"
                            value={payment.type}
                            onChange={(e) =>
                              updatePaymentMethod(index, "type", e.target.value)
                            }
                          >
                            <option value="0">CASH</option>
                            <option value="1">UPI/PHONE PE</option>
                            <option value="2">CHEQUE</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            value={payment.amount}
                            onChange={(e) =>
                              updatePaymentMethod(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* Conditional fields based on payment type */}
                        {payment.type === "1" && (
                          <>
                            <div className="col-md-2">
                              <label className="form-label">UPI App</label>
                              <input
                                className="form-control"
                                value={payment.upiApp}
                                placeholder="PHONE PE - RAHUL BAR"
                                onChange={(e) =>
                                  updatePaymentMethod(
                                    index,
                                    "upiApp",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">UTR Number</label>
                              <input
                                className="form-control"
                                value={payment.utrNumber}
                                placeholder="211839452746"
                                onChange={(e) =>
                                  updatePaymentMethod(
                                    index,
                                    "utrNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </>
                        )}

                        {payment.type === "2" && (
                          <>
                            <div className="col-md-2">
                              <label className="form-label">Bank Name</label>
                              <input
                                className="form-control"
                                value={payment.bankName}
                                onChange={(e) =>
                                  updatePaymentMethod(
                                    index,
                                    "bankName",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">
                                Cheque Number
                              </label>
                              <input
                                className="form-control"
                                value={payment.chequeNumber}
                                onChange={(e) =>
                                  updatePaymentMethod(
                                    index,
                                    "chequeNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </>
                        )}

                        {payment.type === "0" && (
                          <div className="col-md-4">
                            <label className="form-label">Cash Payment</label>
                            <input
                              className="form-control"
                              value="Cash Payment"
                              readOnly
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="text-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => navigate("/table-data")}
                  >
                    Cancel
                  </button>
                  {mode !== "view" && (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Processing..."
                        : mode === "edit"
                        ? "Update"
                        : "Save"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitEntry;