import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Barcode from "react-barcode";
import axios from "axios";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance";

const CaseEntry = () => {
  const { id, Modex } = useParams();
  const orgId = id ? decodeURIComponent(id) : "undefined";

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(Modex || "create");

  const [companyYN, setCompanyYN] = useState("N");
  const [bookingYN, setBookingYN] = useState("N");
  const [companyData, setCompanyData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [opdData, setOpdData] = useState([]);
  const [indoorData, setIndoorData] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [collectorData, setCollectorData] = useState([]);

  // form data state
  const [formData, setFormData] = useState({
    PatientS: "1",
    CaseTime: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    CaseDate: new Date().toISOString().slice(0, 10),
    CaseP: "",
    CaseNo: "",
    CaseS: "",
    PatientP: "",
    PatientId: "",
    PatientName: "",
    Add1: "",
    Add2: "",
    Add3: "",
    Phone: "",
    Email: "",
    Age: "",
    AgeType: "Y",
    Sex: "",
    AgentId: "",
    DoctorId: "",
    BookingId: "",
    UserId: "",
    DeliveryDate: "",
    OnDelivery: "",
    AfterDelivery: "",
    Total: "0",
    ServiceChg: "",
    Desc: "",
    DescAmt: "",
    Amount: "0",
    GrossAmt: "0",
    CTestAmt: "",
    Balance: "0",
    PaymentType: "C",
    CollectorId: "",
    CompanyId: "",
    ReportDate: "",
    PathologistId: "",
    LabId: "",
    BillId: "",
    Advance: "0",
    Clearing: "",
    ClearingDate: "",
    Remarks: "",
    CancelTest: "",
    CancelDate: "",
    CancelR: "",
    PathologistId1: "",
    PathologistId2: "",
    PathologistId3: "",
    AdmitionYN: "N",
    AdmitionId: "",
    SlipNo: "",
    BankName: "",
    ChequeNo: "",
    Narration: "",
    Referance: "",
    DispCode: "",
    EmpCode: "",
    SubCompanyId: "",
    AreaId: "",
    AdmDate: "",
    NrHome: "",
    RelsDate: "",
    EmpName: "",
    PPr: "",
    MonthId: "",
    OutSideSmple: "",
    IP: "",
    PatientDisc: "",
    ApprovNo: "",
    ValueEntryBy: "",
    CN: "",
    OPDYN: "N",
    OPDID: "",
    CardNo: "",
    FName: "",
    CHM: "",
    CHF: "",
    req: "0",
    AddPort: "",
    MobileNo: "",
    CollDt: "",
    CollTime: "",
    AgeD: "",
    AgeTypeD: "",
    Area: "",
    Collector: "",
    CollectorDate: "",
    WFPathologistId1: "",
    WFPathologistId2: "",
    WFPathologistId3: "",
    reportdone: "",
    DueBillPrint: "",
    PrintYN: "0",
  });

  // thess states are only for searching of IPD (admission)
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTest, setSelectedTest] = useState("");

  // these states are only for search of OPD
  const [searchResultsOPD, setSearchResultsOPD] = useState([]);
  const [isSearchingOPD, setIsSearchingOPD] = useState(false);
  const [selectedTestOPD, setSelectedTestOPD] = useState("");

  // Test management states
  const [tests, setTests] = useState([]);
  const [testMasterData, setTestMasterData] = useState([]);
  const [selectedTestMaster, setSelectedTestMaster] = useState(null);
  const [testSearchResults, setTestSearchResults] = useState([]);
  const [isSearchingTest, setIsSearchingTest] = useState(false);

  // this function is only for searching the IPD (Admission)
  const searchTests = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);

    try {
      console.log("Indoor searching: ", searchTerm);
      const res = await axiosInstance.get(
        `/admissions?page=1&limit=20&search=${encodeURIComponent(searchTerm)}`,
      );
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.error("IPD search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // this function is only for searching the OPD
  const searchTestsOPD = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResultsOPD([]);
      return;
    }
    setIsSearchingOPD(true);
    try {
      const res = await axiosInstance.get(
        `/patient-visits?page=1&limit=20&patientName=${encodeURIComponent(
          searchTerm,
        )}`,
      );
      setSearchResultsOPD(res.data.data || []);
    } catch (err) {
      console.error("OPD search error:", err);
      setSearchResultsOPD([]);
    } finally {
      setIsSearchingOPD(false);
    }
  };

  // fetch company type-d
  const fetchCompany = async () => {
    try {
      const res = await axiosInstance("/acgenled?partyType=D");
      if (res.data.success) {
        const arr = res.data.data;
        const newArr = [
          {
            DescId: 0,
            Desc: "--select--",
          },
          ...arr,
        ];
        setCompanyData(newArr);
      }
    } catch (error) {
      console.log("Error fetching company data: ", error);
    }
  };

  // fetch booking
  const fetchBooking = async () => {
    try {
      // const res = await axiosInstance("/acgenled?partyType=D");
      // if (res.data.success) {
      //   const arr = res.data.data;
      //   const newArr = [
      //     {
      //       DescId: 0,
      //       Desc: "--select--",
      //     },
      //     ...arr,
      //   ];
      //   setCompanyData(newArr);
      // }
      const arr = [
        { bookingId: 0, booking: "--select--" },
        { bookingId: 1, booking: "hello" },
      ];
      setBookingData(arr);
    } catch (error) {
      console.log("Error fetching booking data: ", error);
    }
  };
  const calculateServiceTotal = () => {
    return services
      .reduce((acc, curr) => acc + (parseFloat(curr.serviceRate) || 0), 0)
      .toFixed(2);
  };

  // --- Service Table State ---
  const [services, setServices] = useState([
    { serviceType: "", serviceRate: "" },
  ]);

  // fetch opd
  const fetchOPD = async () => {
    try {
      // const res = await axiosInstance.get('')
      //     if(res.data.success){
      // const arr = res.data.data;

      //     }

      const arr = [
        { opdId: 0, opdValue: "--select--" },
        { opdId: 1, opdValue: "hwllo" },
      ];
      setOpdData(arr);
    } catch (error) {
      console.log("Error fetching OPD data: ", error);
    }
  };

  // will fetch data when ordgId is available
  const fetchData = async () => {
    try {
      if (orgId) {
        const res = await axiosInstance.get(`/case01/search?CaseId=${orgId}`);
        if (res.data.success) {
          console.log(res.data.data[0]);
          setFormData(res.data.data[0]);

          // if company id present it should be Y
          if (res.data.data[0].CompanyId) {
            setCompanyYN("Y");
          }

          // if AdmitionId present (for IPD)
          if (res.data.data[0].AdmitionId && res.data.data[0].AdmitionId != 0) {
            const admId = res.data.data[0].AdmitionId;
            try {
              const adm = await axiosInstance.get(`/admissions/${admId}`);
              if (adm.data.success) {
                const admission = adm.data.data.admission;

                const value = admission.AdmitionId;
                const label = `${admission.PatientName} (${admission.AdmitionNo})`;

                setSelectedTest({ value, label });
              }
            } catch (error) {
              console.log(error);
            }
          }

          // if PatientId present (for OPD) incomplete
          if (res.data.data[0].PatientId && res.data.data[0].PatientId != 0) {
            const opdId = res.data.data[0].PatientId;
            try {
              const opd = await axiosInstance.get(`/patient-visits?page=1
&limit=20&registrationId=${opdId}`);
              // if (adm.data.success) {
              //   const admission = adm.data.data.admission;

              //   const value = admission.AdmitionId;
              //   const label = `${admission.PatientName} (${admission.AdmitionNo})`;

              //   setSelectedTest({ value, label });
              // }
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
      return;
    } catch (error) {
      console.log("Error fetching form data: ", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`name: ${name}, value: ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // fetch doctors
  const fetchDoctor = async () => {
    try {
      const data = await axiosInstance.get("/doctors");
      // console.log("hi:", data);
      if (data.data.success) {
        const arr = data.data.data;
        const newArr = [
          {
            DoctorId: 0,
            Doctor: "--select--",
          },
          ...arr,
        ];
        setDoctorData(newArr);
      }
    } catch (error) {
      console.log("error fetching doctor:", error);
    }
  };

  // fetch collector
  const fetchCollector = async () => {
    try {
      const data = await axiosInstance.get("/collector");
      if (data.data.success) {
        const arr = data.data.data;
        const newArr = [{ CollectorId: 0, Collector: "--select--" }, ...arr];
        setCollectorData(newArr);
      }
    } catch (error) {
      console.log("error fetching collector:", error);
    }
  };

  // Fetch test master data
  const fetchTestMaster = async () => {
    try {
      const res = await axiosInstance.get(
        "/tests/search/advanced?page=1&limit=50",
      );
      if (res.data.success) {
        setTestMasterData(res.data.data || []);
      }
    } catch (error) {
      console.log("Error fetching test master:", error);
    }
  };

  // Search tests
  const searchTestMaster = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setTestSearchResults([]);
      return;
    }
    setIsSearchingTest(true);
    try {
      const res = await axiosInstance.get(
        `/tests/search/advanced?test=${encodeURIComponent(searchTerm)}&page=1&limit=50`,
      );
      setTestSearchResults(res.data.data || []);
    } catch (err) {
      console.error("Test search error:", err);
      setTestSearchResults([]);
    } finally {
      setIsSearchingTest(false);
    }
  };

  // Add test to list
  const handleAddTest = () => {
    if (!selectedTestMaster) {
      alert("Please select a test");
      return;
    }

    const newTest = {
      id: Date.now(),
      TestId: selectedTestMaster.TestId,
      TestName: selectedTestMaster.Test, // API returns 'Test' field
      Rate: selectedTestMaster.Rate || 0,
      NetRate: selectedTestMaster.Rate || 0,
      DeliveryDate: new Date().toISOString().slice(0, 10),
      DeliveryTime: "07:00 PM",
      Profile: "N",
      ComYN: "Y",
    };

    setTests([...tests, newTest]);
    setSelectedTestMaster(null);
    calculateTotal([...tests, newTest]);
  };

  // Remove test from list
  const handleRemoveTest = (id) => {
    const updatedTests = tests.filter((t) => t.id !== id);
    setTests(updatedTests);
    calculateTotal(updatedTests);
  };

  // Calculate total amount
  const calculateTotal = (testList) => {
    const total = testList.reduce(
      (sum, test) => sum + parseFloat(test.NetRate || 0),
      0,
    );
    setFormData((prev) => ({
      ...prev,
      Total: total,
      Amount: total,
      GrossAmt: total,
      Balance: total - parseFloat(prev.Advance || 0),
    }));
  };

  // Fetch tests for existing case
  const fetchCaseTests = async (caseId) => {
    try {
      const res = await axiosInstance.get(`/case-bill-dtl/case/${caseId}`);
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        const testsData = await Promise.all(
          res.data.data.map(async (t, index) => {
            // Fetch test name from test master
            let testName = "Unknown Test";
            if (t.TestId) {
              try {
                const testRes = await axiosInstance.get(`/tests/${t.TestId}`);
                if (testRes.data.success && testRes.data.data) {
                  testName = testRes.data.data.Test;
                }
              } catch (err) {
                console.log("Error fetching test name:", err);
              }
            }
            return {
              id: t.CaseBillDtlId || index,
              TestId: t.TestId,
              TestName: testName,
              Rate: t.Rate || 0,
              NetRate: t.NetRate || t.Rate || 0,
              DeliveryDate: t.DeliveryDate ? new Date(t.DeliveryDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              DeliveryTime: t.DeliveryTime || "07:00 PM",
              Profile: t.Profile || "N",
              ComYN: t.ComYN || "Y",
            };
          }),
        );
        setTests(testsData);
        calculateTotal(testsData);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.log("Error fetching case tests:", error);
      setTests([]);
    }
  };

  // Handle Save (CREATE or UPDATE)
  const handleSave = async () => {
    try {
      setLoading(true);

      if (mode === "create" || !orgId || orgId === "undefined") {
        // CREATE new case with tests
        if (tests.length === 0) {
          alert("Please add at least one test");
          setLoading(false);
          return;
        }

        // Step 1: Create Case
        const caseRes = await axiosInstance.post("/case01", formData);
        if (caseRes.data.success) {
          const newCaseId = caseRes.data.data.CaseId;

          // Step 2: Create Billing Details and Test Details
          for (const test of tests) {
            // Create Billing Detail
            await axiosInstance.post("/case-bill-dtl", {
              CaseId: newCaseId,
              TestId: test.TestId || null,
              Rate: test.Rate || null,
              Remarks: null,
              DeliveryDate: test.DeliveryDate || null,
              DeliveryTime: test.DeliveryTime || null,
              ReportDate: null,
              PathologistId: null,
              ValueEntry: null,
              Delivery: null,
              DeliveryDt: null,
              CancelTast: null,
              Profile: test.Profile || null,
              SlNo: null,
              NetRate: test.NetRate || null,
              ComYN: test.ComYN || null,
              CaseBillDtlId: null,
            });

            // Create Test Detail
            await axiosInstance.post("/case-dtl-01", {
              CaseId: newCaseId,
              TestId: test.TestId || null,
              Rate: test.Rate || null,
              Remarks: null,
              DeliveryDate: test.DeliveryDate || null,
              DeliveryTime: test.DeliveryTime || null,
              ReportDate: null,
              PathologistId: null,
              ValueEntry: null,
              Delivery: null,
              DeliveryDt: null,
              CancelTast: null,
              LabId: null,
              Profile: null,
              SlNo: null,
              PrintUser: null,
              LISData: null,
              CollDate: null,
              CollTime: null,
              PPBarCode: null,
              Approve: null,
              ApprovedPathologist: null,
              ApproveDate: null,
              ProfileID: null,
              LabRcptDate: null,
              LabRcptTime: null,
              ReportTime: null,
              LabSlNo: null,
              Checked: null,
              Printed: null,
              reported: null,
              ComYN: test.ComYN || null,
              CaseDtlId: null,
            });
          }

          alert(`Case created successfully! Case ID: ${newCaseId}`);
          navigate("/CaseList");
        }
      } else if (mode === "edit" && orgId && orgId !== "undefined") {
        // UPDATE existing case
        
        // Step 1: Update case master data
        const res = await axiosInstance.put(`/case01/${orgId}`, formData);
        if (res.data.success) {
          // Step 2: Delete existing test records
          try {
            await axiosInstance.delete(`/case-bill-dtl/case/${orgId}`);
            await axiosInstance.delete(`/case-dtl-01/case/${orgId}`);
          } catch (err) {
            console.log("Error deleting old tests:", err);
          }

          // Step 3: Create new test records
          for (const test of tests) {
            // Create Billing Detail
            await axiosInstance.post("/case-bill-dtl", {
              CaseId: orgId,
              TestId: test.TestId || null,
              Rate: test.Rate || null,
              Remarks: null,
              DeliveryDate: test.DeliveryDate || null,
              DeliveryTime: test.DeliveryTime || null,
              ReportDate: null,
              PathologistId: null,
              ValueEntry: null,
              Delivery: null,
              DeliveryDt: null,
              CancelTast: null,
              Profile: test.Profile || null,
              SlNo: null,
              NetRate: test.NetRate || null,
              ComYN: test.ComYN || null,
            });

            // Create Test Detail
            await axiosInstance.post("/case-dtl-01", {
              CaseId: orgId,
              TestId: test.TestId || null,
              Rate: test.Rate || null,
              Remarks: null,
              DeliveryDate: test.DeliveryDate || null,
              DeliveryTime: test.DeliveryTime || null,
              ReportDate: null,
              PathologistId: null,
              ValueEntry: null,
              Delivery: null,
              DeliveryDt: null,
              CancelTast: null,
              LabId: null,
              Profile: null,
              SlNo: null,
              PrintUser: null,
              LISData: null,
              CollDate: null,
              CollTime: null,
              PPBarCode: null,
              Approve: null,
              ApprovedPathologist: null,
              ApproveDate: null,
              ProfileID: null,
              LabRcptDate: null,
              LabRcptTime: null,
              ReportTime: null,
              LabSlNo: null,
              Checked: null,
              Printed: null,
              reported: null,
              ComYN: test.ComYN || null,
            });
          }

          alert("Case updated successfully!");
          setMode("view");
          fetchData();
          fetchCaseTests(orgId);
        }
      }
    } catch (error) {
      console.error("Error saving case:", error);
      alert(
        "Failed to save case: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!orgId) {
      alert("No case to delete");
      return;
    }

    if (window.confirm("Are you sure you want to delete this case?")) {
      try {
        setLoading(true);
        const res = await axiosInstance.delete(`/case01/${orgId}`);
        if (res.data.success) {
          alert("Case deleted successfully!");
          navigate("/CaseList");
        }
      } catch (error) {
        console.error("Error deleting case:", error);
        alert(
          "Failed to delete case: " +
            (error.response?.data?.message || error.message),
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle New
  const handleNew = () => {
    setMode("create");
    setTests([]);
    setFormData({
      PatientS: "1",
      CaseTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      CaseDate: new Date().toISOString().slice(0, 10),
      CaseP: "",
      CaseNo: "",
      CaseS: "",
      PatientP: "",
      PatientId: "",
      PatientName: "",
      Add1: "",
      Add2: "",
      Add3: "",
      Phone: "",
      Email: "",
      Age: "",
      AgeType: "Y",
      Sex: "",
      AgentId: "",
      DoctorId: "",
      BookingId: "",
      UserId: "",
      DeliveryDate: "",
      OnDelivery: "",
      AfterDelivery: "",
      Total: "0",
      ServiceChg: "",
      Desc: "",
      DescAmt: "",
      Amount: "0",
      GrossAmt: "0",
      CTestAmt: "",
      Balance: "0",
      PaymentType: "C",
      CollectorId: "",
      CompanyId: "",
      ReportDate: "",
      PathologistId: "",
      LabId: "",
      BillId: "",
      Advance: "0",
      Clearing: "",
      ClearingDate: "",
      Remarks: "",
      CancelTest: "",
      CancelDate: "",
      CancelR: "",
      PathologistId1: "",
      PathologistId2: "",
      PathologistId3: "",
      AdmitionYN: "N",
      AdmitionId: "",
      SlipNo: "",
      BankName: "",
      ChequeNo: "",
      Narration: "",
      Referance: "",
      DispCode: "",
      EmpCode: "",
      SubCompanyId: "",
      AreaId: "",
      AdmDate: "",
      NrHome: "",
      RelsDate: "",
      EmpName: "",
      PPr: "",
      MonthId: "",
      OutSideSmple: "",
      IP: "",
      PatientDisc: "",
      ApprovNo: "",
      ValueEntryBy: "",
      CN: "",
      OPDYN: "N",
      OPDID: "",
      CardNo: "",
      FName: "",
      CHM: "",
      CHF: "",
      req: "0",
      AddPort: "",
      MobileNo: "",
      CollDt: "",
      CollTime: "",
      AgeD: "",
      AgeTypeD: "",
      Area: "",
      Collector: "",
      CollectorDate: "",
      WFPathologistId1: "",
      WFPathologistId2: "",
      WFPathologistId3: "",
      reportdone: "",
      DueBillPrint: "",
      PrintYN: "0",
    });
    setSelectedTest("");
    setSelectedTestOPD("");
    setCompanyYN("N");
    setBookingYN("N");
  };

  const footerActions = [
    { label: "New", variant: "primary", onClick: handleNew },
    {
      label: "Edit",
      variant: "primary",
      onClick: () => setMode("edit"),
      disabled: mode !== "view" || !orgId || orgId === "undefined",
    },
    {
      label: "Save",
      variant: "success",
      onClick: handleSave,
      disabled: mode === "view" || loading,
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: handleDelete,
      disabled: !orgId || orgId === "undefined" || loading,
    },
    {
      label: "Undo",
      variant: "warning",
      onClick: fetchData,
      disabled: !orgId || orgId === "undefined",
    },
    { label: "Bill", variant: "info" },
    { label: "Com Bill", variant: "info" },
    { label: "Dep Print", variant: "info" },
    { label: "Exit", variant: "secondary", onClick: () => navigate(-1) },
  ];

  useEffect(() => {
    fetchCompany();
    fetchBooking();
    fetchOPD();
    fetchDoctor();
    fetchCollector();
    fetchTestMaster();

    // Fetch data and tests only if valid orgId exists
    if (orgId && orgId !== "undefined") {
      fetchData();
      fetchCaseTests(orgId);
    }
  }, []);

  // this is for IPD
  useEffect(() => {
    const id = selectedTest?.value;
    if (id) {
      setFormData((prev) => ({
        ...prev,
        AdmitionId: id,
      }));
      console.log("IPD changed", selectedTest);
    }
  }, [selectedTest]);

  // this is for OPD
  useEffect(() => {
    const id = selectedTestOPD?.value;
    if (id) {
      setFormData((prev) => ({
        ...prev,
        PatientId: id,
      }));
      console.log("OPD changed", selectedTestOPD);
    }
  }, [selectedTestOPD]);

  // Custom styles for high-density view
  const denseStyle = {
    fontSize: "11px",
    fontWeight: "500",
  };

  const inputClass =
    "form-control form-control-sm rounded-0 p-1 border-secondary";
  const selectClass =
    "form-select form-select-sm rounded-0 p-1 border-secondary";
  const labelClass = "text-secondary fw-bold text-nowrap me-2";

  // React-select custom styles to make it compact
  const compactSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "28px",
      height: "28px",
      fontSize: "11px",
      borderRadius: 0,
      borderColor: "#6c757d",
    }),
    valueContainer: (base) => ({ ...base, padding: "0 4px", height: "28px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: "28px" }),
    dropdownIndicator: (base) => ({ ...base, padding: 2 }),
    clearIndicator: (base) => ({ ...base, padding: 2 }),
  };

  // --- Styles ---
  const inputStyle = {
    fontSize: "0.7rem",
    padding: "0px 4px",
    fontWeight: "bold",
    height: "24px",
    borderRadius: "0px",
    color: "var(--secondary-color)",
    border: "1px solid #0d0551ff",
    backgroundColor: "white",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "0.70rem",
    fontWeight: "bold",
    margin: "0",
    whiteSpace: "nowrap",
    color: "#000080",
    minWidth: "80px", // Fixed width for alignment
    textAlign: "right",
    marginRight: "3px",
  };

  const tableHeaderStyle = {
    //backgroundColor: "#00ffff",
    color: "black",
    fontSize: "0.70rem",
    fontWeight: "bold",
    padding: "2px",
    border: "1px solid gray",
    textAlign: "center",
  };

  const tableCellStyle = {
    color: "white",
    fontSize: "0.75rem",
    padding: "0",
    border: "1px solid #555",
  };

  const tableInputStyle = {
    width: "100%",
    height: "20px",
    fontSize: "0.70rem",
    border: "none",
    backgroundColor: "transparent",
    color: "white",
    padding: "0 4px",
  };

  return (
    <div className="main-content">
      {/* Main Panel 
          - height: 100vh ensures full screen
          - display: flex + flex-column allows header/footer to be fixed height 
            while body takes remaining space
      */}
      <div
        className="panel"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "Tahoma, sans-serif",
          border: "2px solid #000080",
          backgroundColor: "#afc4c3ff",
        }}
      >
        {/* HEADER */}
        <div
          className="panel-header d-flex justify-content-between align-items-center px-2 border-bottom bg-primary text-white"
          style={{ height: "28px", flexShrink: 0 }}
        >
          <div className="d-flex align-items-center gap-2">
            <h6 className="m-0 fw-bold" style={{ fontSize: "0.85rem" }}>
              Case Entry {id ? `- ${id}` : ""}
            </h6>
          </div>
          <div className="d-flex gap-1">
            <button
              className="btn btn-sm btn-danger py-0"
              style={{ lineHeight: 1 }}
              onClick={() => navigate(-1)}
            >
              X
            </button>
          </div>
        </div>

        {/* MAIN BODY SCROLLABLE AREA */}
        <div
          className="panel-body p-1 flex-grow-1 position-relative"
          style={{ overflow: "hidden" }}
        >
          <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
            {/* === TOP ROW === */}
            <div className="row g-1 mb-1">
              {/* SECTION 1: FLAGS */}
              <div className="col-12 col-md-4 col-lg-4">
                <div className="border border-secondary p-1 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label
                      style={{
                        ...labelStyle,
                        textAlign: "left",
                        width: "auto",
                      }}
                    >
                      Company
                    </label>

                    <select
                      className={selectClass}
                      style={{ width: "90px" }}
                      disabled={mode === "view"}
                      value={companyYN}
                      onChange={(e) => {
                        setCompanyYN(e.target.value);
                        if (e.target.value === "N")
                          setFormData((prev) => ({ ...prev, CompanyId: 0 }));
                      }}
                    >
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>

                    <select
                      className={`${selectClass} flex-grow-1 ms-1`}
                      name="CompanyId"
                      value={formData.CompanyId}
                      onChange={handleInputChange}
                      disabled={companyYN === "N"}
                    >
                      {companyData.map((d, i) => (
                        <option key={i} value={d.DescId}>
                          {d.Desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Col 1: Company / Booking */}

                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label
                      style={{
                        ...labelStyle,
                        textAlign: "left",
                        width: "auto",
                      }}
                    >
                      Booking
                    </label>
                    <select
                      className={selectClass}
                      style={{ width: "90px" }}
                      disabled={mode === "view"}
                      value={bookingYN}
                      onChange={(e) => {
                        setBookingYN(e.target.value);
                        if (e.target.value === "N")
                          setFormData((prev) => ({ ...prev, BookingId: 0 }));
                      }}
                    >
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                    <select
                      className={`${selectClass} flex-grow-1 ms-1`}
                      name="BookingId"
                      value={formData.BookingId}
                      onChange={handleInputChange}
                      disabled={bookingYN === "N"}
                    >
                      {bookingData.map((d, i) => (
                        <option key={i} value={d.bookingId}>
                          {d.booking}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label
                      style={{
                        ...labelStyle,
                        textAlign: "left",
                        width: "auto",
                      }}
                    >
                      Indoor
                    </label>
                    <select
                      className={selectClass}
                      style={{ width: "60px" }}
                      disabled={mode === "view"}
                      name="AdmitionYN"
                      value={formData.AdmitionYN}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (e.target.value === "N")
                          setFormData((prev) => ({ ...prev, AdmitionId: 0 }));
                      }}
                    >
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                    <div
                      className="flex-grow-1 ms-1"
                      style={{ height: "28px" }}
                    >
                      {mode === "view" ? (
                        <input
                          disabled
                          className={inputClass}
                          value={selectedTest?.label}
                        />
                      ) : (
                        // <Select
                        //   styles={compactSelectStyles}
                        //   value={selectedTest}
                        //   onChange={setSelectedTest}
                        //   onInputChange={searchTests}
                        //   options={searchResults.map((i) => ({
                        //     value: i.AdmitionId,
                        //     label: `${i.PatientName} (${i.AdmitionNo})`,
                        //   }))}
                        //   placeholder="Search Indoor..."
                        //   isClearable
                        //   isLoading={isSearching}
                        // />
                        <Select
                          styles={compactSelectStyles}
                          value={selectedTest}
                          onChange={setSelectedTest}
                          onInputChange={(inputValue) => {
                            searchTests(inputValue); // Just call, DO NOT return anything
                          }}
                          options={searchResults.map((i) => ({
                            value: i.AdmitionId,
                            label: `${i.PatientName} (${i.AdmitionNo})`,
                          }))}
                          placeholder="Search Indoor..."
                          isClearable
                          isLoading={isSearching}
                        />
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label
                      style={{
                        ...labelStyle,
                        textAlign: "left",
                        width: "auto",
                      }}
                    >
                      OPD
                    </label>
                    <select
                      className={selectClass}
                      style={{ width: "60px" }}
                      disabled={mode === "view"}
                      name="OPDYN"
                      value={formData.OPDYN}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (e.target.value === "N")
                          setFormData((prev) => ({ ...prev, OPDID: 0 }));
                      }}
                    >
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                    <div
                      className="flex-grow-1 ms-1"
                      style={{ height: "28px" }}
                    >
                      {mode === "view" ? (
                        <input
                          disabled
                          className={inputClass}
                          value={selectedTestOPD?.label}
                        />
                      ) : (
                        <Select
                          styles={compactSelectStyles}
                          value={selectedTestOPD}
                          onChange={setSelectedTestOPD}
                          onInputChange={(inputValue) => {
                            searchTestsOPD(inputValue);
                          }}
                          options={searchResultsOPD.map((i) => ({
                            value: i.RegistrationId,
                            label: `${i.PatientName} (${i.RegistrationNo})`,
                          }))}
                          placeholder="Search Outdoor..."
                          isClearable
                          isLoading={isSearchingOPD}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CASE INFO */}
              <div className="col-12 col-md-9 col-lg-5">
                <div className="border border-secondary p-1 h-100 ">
                  <div className="d-flex flex-wrap align-items-center  mb-1">
                    <label style={{ ...labelStyle }}>Time</label>
                    <input
                      type="text"
                      name="CaseTime"
                      value={formData.CaseTime}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "60px" }}
                    />

                    <label style={{ ...labelStyle }}>Date</label>
                    <input
                      type="date"
                      name="CaseDate"
                      value={formData.CaseDate}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "100px" }}
                    />

                    <label style={{ ...labelStyle }}>Clear Date</label>
                    <input
                      type="date"
                      name="ClearingDate"
                      value={formData.ClearingDate}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "90px" }}
                    />
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <button
                      className="btn btn-sm btn-light border shadow-sm"
                      style={{
                        fontSize: "0.75rem",
                        height: "26px",
                        fontWeight: "bold",
                      }}
                    >
                      ...
                    </button>

                    <label style={{ ...labelStyle, width: "auto" }}>
                      Case No
                    </label>
                    <input
                      type="text"
                      name="CaseNo"
                      value={formData.CaseNo}
                      readOnly
                      style={{ ...inputStyle, flex: 1, width: "80px" }}
                    />

                    <label style={{ ...labelStyle, width: "auto" }}>
                      Sample ID
                    </label>
                    <input
                      type="text"
                      name="CaseS"
                      value={formData.CaseS}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <label style={{ ...labelStyle, width: "auto" }}>
                      Received By
                    </label>
                    <input
                      type="text"
                      name="ValueEntryBy"
                      value={formData.ValueEntryBy || ""}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, flex: 1, width: "70px" }}
                    />

                    <label style={{ ...labelStyle, width: "auto" }}>
                      Current User
                    </label>
                    <input
                      type="text"
                      value="Admin"
                      disabled
                      style={{ ...inputStyle, width: "60px" }}
                    />

                    <label style={{ ...labelStyle, width: "auto" }}>
                      Slip No
                    </label>
                    <input
                      type="text"
                      name="SlipNo"
                      value={formData.SlipNo}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "80px" }}
                    />
                    <input type="checkbox" className="" />
                    <label>New UID</label>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Sidebar & Barcode */}
              <div className="col-12 col-lg-3">
                <Barcode
                  value={formData.CaseNo}
                  height={40}
                  width={1}
                  fontSize={12}
                />{" "}
                <div className="text-center small fw-bold">
                  Test Instruction
                </div>
              </div>
            </div>

            {/* === MIDDLE ROW: PATIENT DETAILS === */}
            <div className="row g-1 mb-1">
              <div className="col-12 col-lg-9">
                <div
                  className="border border-white p-1"
                  style={{ backgroundColor: "#dcd6fc" }}
                >
                  {/* Card Row */}
                  <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                    <div className="d-flex flex-column">
                      <label style={{ ...labelStyle, width: "auto" }}>
                        Card No
                      </label>
                      <span
                        className="text-danger"
                        style={{ fontSize: "0.6rem", fontWeight: "bold" }}
                      >
                        For Cardno list F1
                      </span>
                    </div>
                    <input
                      name="CardNo"
                      value={formData.CardNo}
                      onChange={handleInputChange}
                      type="text"
                      style={{ ...inputStyle, width: "100px" }}
                    />
                    <input
                      type="date"
                      style={{ ...inputStyle, width: "110px" }}
                    />

                    <div
                      style={{
                        backgroundColor: "orange",
                        padding: "0 4px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        border: "1px solid gray",
                      }}
                    >
                      Card Expiry Date :
                    </div>
                    <button
                      className="btn btn-sm btn-secondary py-0"
                      style={{ height: "22px", fontSize: "0.7rem" }}
                    >
                      Ph?
                    </button>
                    <button
                      className="btn btn-sm btn-secondary py-0"
                      style={{ height: "22px", fontSize: "0.7rem" }}
                    >
                      Name?
                    </button>

                    <label style={{ ...labelStyle, width: "auto" }}>P Id</label>
                    <input
                      type="text"
                      name="PatientId"
                      value={formData.PatientId}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "80px" }}
                    />
                    <input
                      type="text"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>

                  {/* Patient Name / Address Row */}
                  <div className="row g-1">
                    {/* Left Column: Details */}
                    <div className="col-12 col-md-7">
                      <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                        <label style={labelStyle}>Patient Name</label>
                        <select
                          name="PPr"
                          value={formData.PPr}
                          onChange={handleInputChange}
                        >
                          <option value={""}>---</option>
                          <option value={"MAST"}>Mast.</option>
                          <option value={"MISS"}>Miss.</option>
                          <option value={"MR"}>Mr.</option>
                          <option value={"MRS"}>Mrs.</option>
                        </select>

                        <input
                          type="text"
                          name="PatientName"
                          value={formData.PatientName}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, flex: 1, minWidth: "150px" }}
                        />
                        <span className="text-danger fw-bold">**</span>
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                        <label style={labelStyle}>Age</label>

                        <input
                          type="text"
                          name="Age"
                          value={formData.Age}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            width: "50px",
                            textAlign: "right",
                          }}
                        />
                        <select
                          name="AgeType"
                          value={formData.AgeType}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, width: "50px" }}
                        >
                          <option value={""}>---</option>
                          <option value={"Y"}>Y</option>
                          <option value={"M"}>M</option>
                          <option value={"D"}>D</option>
                        </select>

                        <input
                          type="text"
                          name="AgeType1"
                          value={formData.AgeType1}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            width: "50px",
                            textAlign: "right",
                          }}
                        />

                        <select
                          name="AgeType2"
                          value={formData.AgeType2}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, width: "50px" }}
                        >
                          <option value={""}>---</option>
                          <option value={"Y"}>Y</option>
                          <option value={"M"}>M</option>
                          <option value={"D"}>D</option>
                        </select>
                        <span className="text-danger fw-bold">**</span>

                        <label
                          style={{
                            ...labelStyle,
                            width: "auto",
                            marginLeft: "5px",
                          }}
                        >
                          Sex
                        </label>
                        <select
                          name="Sex"
                          value={formData.Sex}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, width: "50px", padding: 0 }}
                        >
                          <option value="M">M</option>
                          <option value="F">F</option>
                          <option value="T">T</option>
                        </select>
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                        <label style={labelStyle}>Mobile No.</label>

                        <input
                          type="tel"
                          name="MobileNo"
                          value={formData.MobileNo}
                          onChange={handleInputChange}
                          maxLength={10}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <span className="text-danger fw-bold">**</span>

                        <div className="d-flex flex-column ms-1">
                          <label style={{ ...labelStyle, width: "auto" }}>
                            C/O Phone
                          </label>
                        </div>
                        <input
                          type="tel"
                          name="Phone"
                          value={formData.Phone}
                          onChange={handleInputChange}
                          maxLength={10}
                          style={{ ...inputStyle, width: "120px" }}
                        />
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                        <label style={labelStyle}>e-mail</label>
                        <input
                          type="text"
                          name="Email"
                          value={formData.Email}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, flex: 1, Width: "80px" }}
                        />

                        <label style={{ ...labelStyle, width: "auto" }}>
                          Due on A/c
                        </label>
                        <input
                          type="text"
                          name="DueOnAc"
                          value={formData.DueOnAc}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, width: "60px" }}
                        />
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                        <label style={labelStyle}>Husband Name</label>
                        <input
                          type="text"
                          name="HusbandName"
                          value={formData.HusbandName}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-1 mb-1 bg-light border p-1">
                        <label style={{ ...labelStyle, width: "auto" }}>
                          No of Child (M)
                        </label>
                        <input
                          type="text"
                          name="CHM"
                          value={formData.CHM}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            width: "30px",
                            textAlign: "center",
                          }}
                        />

                        <label
                          style={{
                            ...labelStyle,
                            width: "auto",
                            marginLeft: "5px",
                          }}
                        >
                          No of Child (F)
                        </label>
                        <input
                          type="text"
                          name="CHF"
                          value={formData.CHF}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            width: "30px",
                            textAlign: "center",
                          }}
                        />

                        <div className="d-flex align-items-center ms-2">
                          <input
                            type="checkbox"
                            name="ReportUpload"
                            checked={formData.ReportUpload === "Y"}
                            onChange={handleInputChange}
                          />
                          <label
                            style={{
                              ...labelStyle,
                              width: "auto",
                              color: "green",
                              marginLeft: "4px",
                            }}
                          >
                            Report Upload on Portal
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Address (3 fields) & Notes */}
                    <div className="col-12 col-md-5">
                      <div className="d-flex flex-column h-100">
                        {/* ADDRESS FIELD 1 */}
                        <div className="d-flex gap-1 mb-1">
                          <label style={labelStyle}>Address</label>
                          <input
                            type="text"
                            name="Add1"
                            value={formData.Add1}
                            onChange={handleInputChange}
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="Address Line 1"
                          />
                          <span className="text-danger fw-bold">**</span>
                        </div>
                        {/* ADDRESS FIELD 2 */}
                        <div className="d-flex gap-1 mb-1">
                          {/* Empty label for alignment */}
                          <div
                            style={{ minWidth: "80px", marginRight: "4px" }}
                          ></div>
                          <input
                            type="text"
                            name="Add2"
                            value={formData.Add2}
                            onChange={handleInputChange}
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="Address Line 2"
                          />
                          {/* Spacer for the ** column */}
                          <div style={{ width: "15px" }}></div>
                        </div>
                        {/* ADDRESS FIELD 3 */}
                        <div className="d-flex gap-1 mb-1">
                          <div
                            style={{ minWidth: "80px", marginRight: "4px" }}
                          ></div>
                          <input
                            type="text"
                            name="Add3"
                            value={formData.Add3}
                            onChange={handleInputChange}
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="Address Line 3"
                          />
                          <div style={{ width: "15px" }}></div>
                        </div>

                        {/* NOTES FIELD */}
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <label style={labelStyle}>Notes</label>
                          <input
                            type="text"
                            name="Remarks"
                            value={formData.Remarks}
                            onChange={handleInputChange}
                            style={{ ...inputStyle, flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: HELPER PANEL */}
              <div className="col-12 col-lg-3">
                <div className="border border-white p-2 h-100">
                  <div className="d-flex justify-content-end   mb-2">
                    <input type="checkbox" />{" "}
                    <label style={{ ...labelStyle, width: "auto" }}>All</label>
                  </div>
                  <button
                    className="btn btn-sm btn-primary w-100 mb-1"
                    style={{
                      height: "24px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    Details
                  </button>
                  <button
                    className="btn btn-sm btn-danger w-100 mb-2"
                    style={{
                      height: "24px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    Cancel Test
                  </button>

                  <div className="small fw-bold mb-2">
                    <div>** -{">"} Mandatory Field</div>
                    <div className="bg-primary text-white px-1">
                      PH? -{">"} Phone Search
                    </div>
                    <div className="bg-primary text-white px-1 mt-1">
                      Name? -{">"} Patient Name Search
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-1 mt-2">
                    <label style={{ ...labelStyle, width: "auto" }}>
                      Total No of Test :
                    </label>
                    <input
                      type="text"
                      value={tests.length}
                      readOnly
                      style={{
                        ...inputStyle,
                        width: "50px",
                        backgroundColor: "#8080ff",
                      }}
                    />
                  </div>
                  <div className="d-flex align-items-center gap-1 mt-1">
                    <label style={{ ...labelStyle, width: "auto" }}>
                      Collector:
                    </label>
                    <select
                      name="CollectorId"
                      value={formData.CollectorId}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, flex: 1, padding: 0 }}
                    >
                      {collectorData.map((c) => (
                        <option key={c.CollectorId} value={c.CollectorId}>
                          {c.Collector}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex align-items-center gap-1 mt-1">
                    <label style={{ ...labelStyle, width: "auto" }}>
                      Collector Dt:
                    </label>
                    <input
                      type="date"
                      name="CollDt"
                      value={formData.CollDt}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                  <div className="d-flex align-items-center gap-1 mt-1">
                    <label style={{ ...labelStyle, width: "auto" }}>
                      Area:
                    </label>
                    <input
                      type="text"
                      name="Area"
                      value={formData.Area}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* === SECTION 7: BRANCH & DOCTOR === */}
            <div className="border border-secondary p-1 mb-1 bg-white">
              <div className="d-flex flex-wrap align-items-center gap-1">
                <label style={{ ...labelStyle, width: "auto" }}>
                  Branch Name
                </label>
                <select
                  name="BranchName"
                  value={formData.BranchName}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, width: "40px", padding: 0 }}
                >
                  <option value="N">N</option>
                  <option value="Y">Y</option>
                </select>
                <input type="text" style={{ ...inputStyle, width: "150px" }} />

                <label
                  style={{ ...labelStyle, width: "auto", marginLeft: "10px" }}
                >
                  Doctor Name
                </label>
                <select
                  name="DoctorId"
                  value={formData.DoctorId}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, flex: 1, minWidth: "150px" }}
                >
                  {doctorData.map((d) => (
                    <option key={d.DoctorId} value={d.DoctorId}>
                      {d.Doctor}
                    </option>
                  ))}
                </select>

                <div className="bg-black text-danger fw-bold px-1 d-flex align-items-center ms-2">
                  <input
                    type="checkbox"
                    name="Requisition"
                    checked={formData.Requisition === "1"}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        Requisition: e.target.checked ? "1" : "0",
                      }))
                    }
                    className="me-1"
                  />{" "}
                  Requisition
                </div>
                <span className="text-danger fw-bold ms-1">**</span>
                <span className="text-danger fw-bold ms-1">**</span>
                <input
                  type="checkbox"
                  name="OS"
                  checked={formData.OS === "1"}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      OS: e.target.checked ? "1" : "0",
                    }))
                  }
                  className="ms-1"
                />
                <label style={{ ...labelStyle, width: "auto" }}>O.S</label>
              </div>
            </div>

            {/* === MAIN WORK AREA (TABLES & BILLING) === */}
            <div className="row g-1 mb-1" style={{ Height: "220px" }}>
              {/* SECTION 8: TEST ENTRY TABLE */}
              <div className="col-12 col-md-6">
                <div
                  className="table-responsive flex-grow-1"
                  style={{ overflowY: "auto" }}
                >
                  <table
                    className="table table-bordered table-sm table-striped table-hover mb-0"
                    style={{ fontSize: "10px" }}
                  >
                    <thead
                      className="table-light sticky-top"
                      style={{ top: 0, zIndex: 1 }}
                    >
                      <tr>
                        <th style={{ ...tableHeaderStyle, width: "30px" }}>
                          Pr
                        </th>
                        <th style={tableHeaderStyle}>Test Name</th>
                        <th style={{ ...tableHeaderStyle, width: "50px" }}>
                          Rate
                        </th>
                        <th style={tableHeaderStyle}>Delivery Date</th>
                        <th style={tableHeaderStyle}>Delivery Time</th>
                        <th style={tableHeaderStyle}>Net Rate</th>
                        <th style={{ ...tableHeaderStyle, width: "30px" }}>
                          IsisDisc
                        </th>
                        <th style={{ ...tableHeaderStyle, width: "30px" }}>
                          Type
                        </th>
                        <th style={{ ...tableHeaderStyle, width: "30px" }}>
                          Del
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.length > 0 ? (
                        tests.map((test, index) => (
                          <tr
                            key={index}
                            style={{ backgroundColor: "#ffffcc" }}
                          >
                            <td
                              style={{
                                ...tableCellStyle,
                                color: "black",
                                textAlign: "center",
                              }}
                            >
                              {index + 1}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.TestName}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.Rate}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.DeliveryDate}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.DeliveryTime}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.NetRate}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              N
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              Test
                            </td>

                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveTest(test.id)}
                                disabled={mode === "view"}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ backgroundColor: "#ffffcc" }}>
                          <td
                            style={{
                              ...tableCellStyle,
                              color: "black",
                              textAlign: "center",
                            }}
                          >
                            N
                          </td>
                          <td
                            colSpan="6"
                            style={{ ...tableCellStyle, color: "black" }}
                          >
                            No tests added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 9: BILL SUMMARY */}
              <div className="col-12 col-md-3">
                <div className="p-1 h-100 d-flex flex-column gap-1">
                   <Select
                      styles={compactSelectStyles}
                      value={selectedTestMaster}
                      onChange={setSelectedTestMaster}
                      onInputChange={(inputValue) => {
                        searchTestMaster(inputValue);
                      }}
                      options={testSearchResults.map((item) => ({
                        value: item.TestId,
                        label: `${item.Test} - ₹${item.Rate}`,
                        ...item,
                      }))}
                      placeholder="Search test..."
                      isSearchable
                      isClearable
                      isLoading={isSearchingTest}
                      isDisabled={mode === "view"}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue.length < 2
                          ? "Type at least 2 characters"
                          : "No test found"
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                      style={{ width: "280px" }} // ⬅ search box width increased (change anytime)
                    />
                  <div className="d-flex align-items-start">
                    {/* <Select
                      styles={compactSelectStyles}
                      value={selectedTestMaster}
                      onChange={setSelectedTestMaster}
                      onInputChange={(inputValue) => {
                        searchTestMaster(inputValue);
                      }}
                      options={testSearchResults.map((item) => ({
                        value: item.TestId,
                        label: `${item.Test} - ₹${item.Rate}`,
                        ...item,
                      }))}
                      placeholder="Search test..."
                      isSearchable
                      isClearable
                      isLoading={isSearchingTest}
                      isDisabled={mode === "view"}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue.length < 2
                          ? "Type at least 2 characters"
                          : "No test found"
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                    /> */}
                    <button
                      className="btn btn-success btn-sm py-1 px-1"
                      onClick={handleAddTest}
                      disabled={mode === "view" || !selectedTestMaster}
                      style={{ fontSize: "11px" }}
                    >
                      Add Test
                    </button>

                   
                    {/* <button
                      className="btn btn-success btn-sm py-0"
                      onClick={handleAddTest}
                      disabled={mode === "view" || !selectedTestMaster}
                      style={{ fontSize: "11px" }}
                    >
                      Add Test (+)
                    </button> */}

                    <div className="flex-grow-1 ms-1">
                      <div className="d-flex justify-content-end align-items-center mb-1">
                        <label style={labelStyle}>Total</label>
                        <input
                          type="text"
                          name="Total"
                          value={formData.Total}
                          onChange={handleInputChange}
                          className="text-end fw-bold ms-1"
                          style={{ ...inputStyle, width: "80px" }}
                        />
                      </div>
                      <div className="d-flex justify-content-end align-items-center mb-1">
                        <label style={labelStyle}>GST</label>
                        <input
                          type="text"
                          name="ServiceChg"
                          value={formData.ServiceChg}
                          onChange={handleInputChange}
                          className="text-end fw-bold ms-1"
                          style={{ ...inputStyle, width: "80px" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end align-items-center">
                    <label style={labelStyle}>Collection Chg.</label>
                    <input
                      type="text"
                      defaultValue="0.00"
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label style={labelStyle}>Discount</label>
                    <input
                      type="text"
                      name="Desc"
                      value={formData.Desc}
                      onChange={handleInputChange}
                      className="text-end ms-1"
                      style={{ ...inputStyle, width: "40px" }}
                    />
                    <span className="text-danger fw-bold mx-1">%</span>
                    <label style={labelStyle}>Amount</label>
                    <input
                      type="text"
                      name="DescAmt"
                      value={formData.DescAmt}
                      onChange={handleInputChange}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label
                      style={{ ...labelStyle, backgroundColor: "#ffcccc" }}
                    >
                      Patient Disc
                    </label>
                    <input
                      type="text"
                      name="PatientDisc"
                      value={formData.PatientDisc}
                      onChange={handleInputChange}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label style={labelStyle}>Cancel Test Amount</label>
                    <input
                      type="text"
                      name="CTestAmt"
                      value={formData.CTestAmt}
                      onChange={handleInputChange}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label style={labelStyle}>Adv</label>
                    <input
                      type="text"
                      name="Advance"
                      value={formData.Advance}
                      onChange={handleInputChange}
                      className="text-end ms-1"
                      style={{ ...inputStyle, width: "40px" }}
                    />
                    <label style={{ ...labelStyle, marginLeft: "4px" }}>
                      G Total
                    </label>
                    <input
                      type="text"
                      name="GrossAmt"
                      value={formData.GrossAmt}
                      onChange={handleInputChange}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label style={{ ...labelStyle, color: "red" }}>
                      Receipt Amt
                    </label>
                    <input
                      type="text"
                      defaultValue="0.00"
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label style={labelStyle}>Balance</label>
                    <input
                      type="text"
                      name="Balance"
                      value={formData.Balance}
                      onChange={handleInputChange}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 10: SERVICE TYPE TABLE */}
              <div className="col-12 col-md-3">
                <div
                  className="border border-secondary h-100 bg-dark d-flex flex-column"
                  style={{ minHeight: "150px" }}
                >
                  <table
                    className="w-100"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>Service Type</th>
                        <th style={tableHeaderStyle}>Service Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Highlighted Row Effect */}
                      <tr
                        style={{ backgroundColor: "#00ffff", height: "15px" }}
                      >
                        <td colSpan="2"></td>
                      </tr>

                      {services.map((row, index) => (
                        <tr key={index}>
                          <td style={tableCellStyle}>
                            <input
                              type="text"
                              style={tableInputStyle}
                              value={row.serviceType}
                              onChange={(e) =>
                                handleServiceChange(
                                  index,
                                  "serviceType",
                                  e.target.value,
                                )
                              }
                              onKeyDown={(e) => handleServiceKeyDown(e, index)}
                            />
                          </td>
                          <td style={tableCellStyle}>
                            <input
                              type="number"
                              style={{ ...tableInputStyle, textAlign: "right" }}
                              value={row.serviceRate}
                              onChange={(e) =>
                                handleServiceChange(
                                  index,
                                  "serviceRate",
                                  e.target.value,
                                )
                              }
                              onKeyDown={(e) => handleServiceKeyDown(e, index)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-auto bg-white text-end p-1 border-top border-secondary fw-bold">
                    {calculateServiceTotal()}
                  </div>
                </div>
              </div>
            </div>

            {/* === BOTTOM SECTION: PAYMENT, RECEIPT, BARCODE === */}
            <div className="row g-1">
              {/* SECTION 11 & 12 */}
              <div className="col-12 col-md-8">
                <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                  <label style={{ ...labelStyle, width: "auto" }}>
                    Payment Mode
                  </label>
                  <select
                    name="PaymentType"
                    value={formData.PaymentType}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, width: "50px", padding: 0 }}
                  >
                    <option value="C">C</option>
                    <option value="R">R</option>
                    <option value="B">B</option>
                  </select>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "purple",
                      fontWeight: "bold",
                    }}
                  >
                    [C]ash/[C]R[edit]/[B]ank/Card/[P]/Complementary
                  </span>
                </div>
                <div
                  className="d-flex flex-wrap border border-secondary p-0"
                  style={{ backgroundColor: "#dcd6fc" }}
                >
                  <div
                    className="bg-success text-white small fw-bold p-1 d-flex align-items-center"
                    style={{ width: "60px", lineHeight: 1.1 }}
                  >
                    Receipt Detail
                  </div>
                  <div className="d-flex flex-grow-1 flex-wrap align-items-center gap-1 p-1">
                    <label
                      style={{ ...labelStyle, width: "auto", color: "red" }}
                    >
                      Narration
                    </label>
                    <input
                      type="text"
                      name="Narration"
                      value={formData.Narration}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, flex: 1, minWidth: "150px" }}
                    />

                    <label style={{ ...labelStyle, width: "auto" }}>
                      Coll Dt.
                    </label>
                    <input
                      type="date"
                      name="CollDt"
                      value={formData.CollDt}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "80px" }}
                    />

                    <label style={{ ...labelStyle, width: "auto" }}>
                      Coll Time
                    </label>
                    <input
                      type="text"
                      name="CollTime"
                      value={formData.CollTime}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, width: "60px" }}
                    />
                  </div>
                </div>
              </div>
              {/* SECTION 13: BARCODE */}
              <div className="col-12 col-md-4">
                <div
                  className="border border-secondary p-1"
                  style={{ backgroundColor: "#ffcccc" }}
                >
                  <div className="small fw-bold mb-1">BarCode Print</div>
                  <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-1">
                      <label style={{ ...labelStyle, width: "auto" }}>
                        No of Copy
                      </label>
                      <input
                        type="text"
                        defaultValue="0"
                        style={{ ...inputStyle, width: "40px" }}
                      />

                      <button
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "orange",
                          color: "white",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          border: "1px solid #cc8400",
                        }}
                      >
                        BarCode Print
                      </button>

                      <input
                        type="checkbox"
                        name="DueBillPrint"
                        checked={formData.DueBillPrint === "Y"}
                        onChange={handleInputChange}
                      />
                      <label style={{ ...labelStyle, width: "auto" }}>
                        Due Bill Print
                      </label>
                    </div>{" "}
                  </div>
                </div>
              </div>
            </div>
          </OverlayScrollbarsComponent>
        </div>

        {/* FOOTER BUTTON BAR */}
        <div
          className="panel-footer p-1 border-top d-flex justify-content-center flex-wrap gap-1"
          style={{
            backgroundColor: "#f0f0f0",
            minHeight: "40px",
            flexShrink: 0,
          }}
        >
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            New
          </button>
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            Edit
          </button>
          <button
            onClick={handleSave}
            className="btn btn-sm btn-light border shadow-sm"
            style={{
              fontSize: "0.75rem",
              height: "26px",
              fontWeight: "bold",
              color: "black",
            }}
            disabled={loading}
          >
            Save
          </button>
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{
              fontSize: "0.75rem",
              height: "26px",
              fontWeight: "bold",
              color: "black",
            }}
          >
            Delete
          </button>
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            Undo
          </button>
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            Bill
          </button>
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            Com Bill
          </button>
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            Dep Print
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            Exit
          </button>

          <div className="border-end mx-1"></div>
          {["Work Sheet", "D-Work Sheet", "F-Form"].map((btn) => (
            <button
              key={btn}
              className="btn btn-sm btn-light border shadow-sm"
              style={{
                fontSize: "0.7rem",
                height: "26px",
                whiteSpace: "normal",
                lineHeight: 1,
              }}
            >
              {btn}
            </button>
          ))}
          <div className="border-end mx-1"></div>
          {["<<", "Prev", "Next", ">>"].map((btn) => (
            <button
              key={btn}
              className="btn btn-sm btn-light border shadow-sm"
              style={{ fontSize: "0.75rem", height: "26px" }}
            >
              {btn}
            </button>
          ))}
          <div className="d-flex flex-column">
            <button
              className="btn btn-sm btn-light border shadow-sm p-0 px-1"
              style={{ fontSize: "0.6rem" }}
            >
              IP
            </button>
            <button
              className="btn btn-sm btn-light border shadow-sm p-0 px-1"
              style={{ fontSize: "0.6rem" }}
            >
              CN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseEntry;


