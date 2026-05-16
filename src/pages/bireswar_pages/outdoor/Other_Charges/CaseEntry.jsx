import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Barcode from "react-barcode";
import axios from "axios";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance";
import SubDeptSelector from "./SubDeptSelector";
import useAxiosFetch from "../../../../templates/DiagnosisMaster/Fetch";
import ReceiptDetailModal from "./ReceiptDetailModal";
import { toast } from "react-toastify";

const DepartmentModal = ({ isOpen, setIsOpen, tests = [] }) => {
  const [selectedTestIds, setSelectedTestIds] = useState([]);

  // আপনার দেওয়া নতুন ডেটা স্ট্রাকচার (html_content সহ)
  const testList = tests;

  const handleToggle = (testId) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId],
    );
  };

  // 🔥 নতুন প্রিন্ট ফাংশন
  const handlePrint = () => {
    // ১. শুধুমাত্র সিলেক্ট করা টেস্টগুলো ফিল্টার করুন যাদের html_content আছে
    const testsToPrint = testList.filter(
      (test) =>
        selectedTestIds.includes(test.TestId) &&
        test.html_content &&
        test.html_content.trim() !== "",
    );

    // ২. যদি এমন কোনো টেস্ট না থাকে, তাহলে ইউজারকে জানিয়ে দিন
    if (testsToPrint.length === 0) {
      alert("No HTML report found for the selected tests.");
      return;
    }

    // ৩. প্রিন্ট করার জন্য HTML তৈরি করুন (প্রতিটি টেস্টের পর page-break যোগ করা হয়েছে)
    const printContent = `
      <html>
        <head>
          <title>Print Reports</title>
          <style>
            @page { margin: 15mm; }
            body {
              font-family: Arial, sans-serif;
              color: #333;
            }
            /* এই ক্লাসটি পরের রিপোর্টকে নতুন পেজে নিয়ে যাবে */
            .page-break {
              page-break-after: always;
            }
            .report-header {
              text-align: center;
              border-bottom: 2px solid #000;
              margin-bottom: 20px;
              padding-bottom: 10px;
            }
          </style>
        </head>
        <body>
          ${testsToPrint
            .map(
              (test, index) => `
            <div>
              <div class="report-header">
                <h2>${test.TestName}</h2>
                <p>Test ID: ${test.TestId} | Delivery Date: ${test.DeliveryDate || "N/A"}</p>
              </div>
             
              <div class="report-body">
                ${test.html_content}
              </div>
            </div>
           
            ${index < testsToPrint.length - 1 ? '<div class="page-break"></div>' : ""}
          `,
            )
            .join("")}
        </body>
      </html>
    `;

    // ৪. নতুন উইন্ডো ওপেন করে প্রিন্ট ডায়ালগ কল করুন
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // উইন্ডোর কন্টেন্ট লোড হওয়ার পর প্রিন্ট পপআপ আসবে
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          fontFamily: "Tahoma, Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "14px", color: "#333" }}>
            Department
          </h2>
          <span
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              border: "1px solid #c3e6cb",
            }}
          >
            Test Master
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "16px" }}>
          <h3
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              borderBottom: "1px solid #eee",
              paddingBottom: "8px",
            }}
          >
            Test
          </h3>

          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {testList.map((test) => (
              <label
                key={test.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 0",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  style={{ marginRight: "10px" }}
                  checked={selectedTestIds.includes(test.TestId)}
                  onChange={() => handleToggle(test.TestId)}
                />
                <span style={{ fontSize: "13px", color: "#444" }}>
                  {test.TestName}
                  {/* যাদের HTML আছে তাদের পাশে ছোট করে আইকন বা টেক্সট দেখাতে পারেন */}
                  {test.html_content ? (
                    <span
                      style={{
                        color: "green",
                        fontSize: "10px",
                        marginLeft: "5px",
                      }}
                    >
                      (Has Report)
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "red",
                        fontSize: "10px",
                        marginLeft: "5px",
                      }}
                    >
                      (Has No Report)
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            backgroundColor: "#f8f9fa",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
          }}
        >
          <button
            onClick={handlePrint}
            className="btn btn-sm btn-light border"
            style={{ fontWeight: "bold" }}
          >
            Print Reports
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-sm btn-danger"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CaseEntry = () => {
  const { data: depertments } = useAxiosFetch("/subdepartment");
  function utcToISTDateOnly(utc) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date(utc));
  }
  const depMap = useMemo(() => {
    const map = {};
    (depertments || []).forEach((d) => {
      map[d.SubDepartmentId] = d.SubDepartment;
    });
    return map;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubDept, setSelectedSubDept] = useState([]);
  const [showSubDeptPopup, setShowSubDeptPopup] = useState(false);
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
  const [agentData, setAgentData] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isSearchingAgent, setIsSearchingAgent] = useState(false);
  const [cashLessId, setCashLessId] = useState(0);

  const [showAddTest, setShowAddTest] = useState(true);

  const [allPrevData, setAllPrevData] = useState([]);

  const [isLoaded, setIsLoaded] = useState(false); // add this by chat gpt

  // form data state
  const [formData, setFormData] = useState({
    PatientS: "1",
    CaseTime: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    // CaseDate: new Date().toISOString().slice(0, 10),
    CaseDate: utcToISTDateOnly(new Date()),
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
    ReceiptAmt: "0",
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
    OPDYN: "Y",
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

  const [barcodeCopies, setBarcodeCopies] = useState(1);

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
  const [indoor, setIndoor] = useState(false);
  const inOutRate = indoor
    ? selectedTestMaster?.BRate
    : selectedTestMaster?.Rate;

  const [show, setShow] = useState(false);
  const [receiptDetailData, setReceiptDetailData] = useState([]);

  const [dWorkTests, setDWorkTests] = useState([]);

  // this function is only for searching the IPD (Admission)
  const searchTests = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);

    try {
      const res = await axiosInstance.get(
        `/admissions?page=1&limit=20&search=${encodeURIComponent(searchTerm)}`,
      );
      setSearchResults(res.data.data || []);
    } catch (err) {
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
    } catch (error) {}
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
    } catch (error) {}
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

  // Handle service table changes
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  // Handle Enter key in service table
  const handleServiceKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === services.length - 1) {
        setServices([...services, { serviceType: "", serviceRate: "" }]);
      }
    }
  };

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
    } catch (error) {}
  };

  // will fetch data when ordgId is available
  const fetchData = async () => {
    try {
      if (orgId) {
        const res = await axiosInstance.get(`/case01/search?CaseId=${orgId}`);
        if (res.data.success) {
          const caseData = res.data.data[0];
          // console.log("Case Data: ", caseData);

          // Calculate ReceiptAmt = GrossAmt - Balance (from DB)
          const grossAmt = parseFloat(caseData.GrossAmt || 0);
          const balance = parseFloat(caseData.Balance || 0);
          const receiptAmt = grossAmt - balance;
          // console.log("Due Bal: ", balance);
          // console.log("Receipt Adv:", caseData.Advance);

          setFormData({
            ...caseData,
            // CaseDate: caseData?.CaseDate?.split("T")[0] || "",
            CaseDate: utcToISTDateOnly(caseData?.CaseDate),
            // ReceiptAmt: receiptAmt.toFixed(2),
          });

          setIsLoaded(true); // add this by chat gpt

          // if company id present it should be Y
          if (caseData.CompanyId) {
            setCompanyYN("Y");
          }

          // if AdmitionId present (for IPD)
          if (caseData.AdmitionId && caseData.AdmitionId != 0) {
            const admId = caseData.AdmitionId;
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
          if (caseData.PatientId && caseData.PatientId != 0) {
            const opdId = caseData.PatientId;
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
    // console.log(`name: ${name}, value: ${value}`);
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

  // fetch agent by id
  const fetchAgentById = async (id) => {
    try {
      const res = await axiosInstance.get(`/agents/${id}`);
      if (res.data.success) {
        const agent = res.data.data;
        setSelectedAgent({ value: agent.AgentId, label: agent.Agent });
      }
    } catch (err) {
      console.error("Error fetching agent by ID:", err);
      setSelectedAgent(null);
    }
  };

  // search agents
  const searchAgents = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setAgentData([]);
      return;
    }
    setIsSearchingAgent(true);
    try {
      const res = await axiosInstance.get(
        `/agents?page=1&limit=50&Agent=${encodeURIComponent(searchTerm)}`,
      );
      setAgentData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setAgentData([]);
    } finally {
      setIsSearchingAgent(false);
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

  // this will fetch receipt details
  const fetchReceiptDetailData = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/money-receipt01/search?ReffId=${id}`,
      );
      if (res.data.success) {
        // console.log("History data: ", res.data.data);
        const data = res.data.data;
        setAllPrevData(data);

        let newData = data.map((item) => ({
          no: item.ReceiptNo,
          date:
            item.ReceiptDate.split("T")[0]?.split("-")?.reverse()?.join("/") ||
            "",
          type: item.Remarks || "",
          disc: item.DiscAmt || 0,
          amount: item.Amount || 0,
        }));

        setReceiptDetailData(newData);
      }
    } catch (error) {
      console.log("Error fetching history:", error);
    }
  };

  // Add test to list
  const handleAddTest = (selected) => {
    const test = selected || selectedTestMaster;

    if (!test) {
      alert("Please select a test");
      return;
    }
    //  duplicate check
    const isAlreadyAdded = tests.some((t) => t.TestId === test.TestId);

    if (isAlreadyAdded) {
      toast.error("Test already added");
      // alert("");
      setSelectedTestMaster(null);
      return;
    }
    const rate = indoor ? Number(test?.BRate ?? 0) : Number(test?.Rate ?? 0);

    // const newTest = {
    //   id: Date.now(),
    //   TestId: selectedTestMaster.TestId,
    //   TestName: selectedTestMaster.Test,
    //   Rate: rate,
    //   NetRate: rate,
    //   DeliveryDate: new Date().toISOString().slice(0, 10),
    //   DeliveryTime: "07:00 PM",
    //   Profile: "N",
    //   ComYN: "Y",
    //   CancelTast: 0,
    // };

    const newTest = {
      id: Date.now(),
      TestId: test.TestId,
      TestName: test.Test,
      SubDepartmentId: test.SubDepartmentId, // ⭐ ADD THIS
      Rate: rate,
      NetRate: rate,
      // DeliveryDate: new Date().toISOString().slice(0, 10),
      DeliveryDate: utcToISTDateOnly(new Date()),
      DeliveryTime: "07:00 PM",
      Profile: "N",
      ComYN: "Y",
      // CancelTast: 0,
      CancelTast: 2,
      DescFormat: test.DescFormat,
      html_content: test.html_content,
    };

    setTests((prev) => {
      const updated = [...prev, newTest];
      calculateTotal(updated);
      return updated;
    });
    setSelectedTestMaster(null);
  };

  // this will change the rate and net rate of the test
  const handleModifyTest = (idx, val) => {
    // console.log("modex,",mode)
    let arr = structuredClone(tests);
    let a = tests[idx];
    a = { ...a, Rate: val, NetRate: val };
    arr[idx] = a;
    // console.log("arr: ", arr);
    setTests(arr);
    //  calculateTotal([...tests])
    calculateTotal([...arr]);
  };

  // Remove test from list
  const handleRemoveTest = (id) => {
    const updatedTests = tests.filter((t) => t.id !== id);
    setTests(updatedTests);
    calculateTotal(updatedTests);
  };

  // cancel test----------------
  const handleCancelTest = (id) => {
    const updatedTests = tests.map((t) =>
      t.id === id
        ? { ...t, CancelTast: Number(t.CancelTast) === 1 ? 2 : 1 }
        : t,
    );

    setTests(updatedTests);
    calculateTotal(updatedTests);
  };

  // Calculate total amount and sync with Money Receipt
  const calculateTotal = async (testList) => {
    const list = Array.isArray(testList)
      ? testList
      : Object.values(testList).flat();

    let total = 0;
    let cancelTotal = 0;

    list.forEach((test) => {
      const rate = parseFloat(test.NetRate || 0);

      total += rate;

      if (Number(test.CancelTast) === 1) {
        cancelTotal += rate; // ⭐ cancel test amount
      }
    });

    let totalReceived = 0;

    if (orgId && orgId !== "undefined") {
      try {
        const mrRes = await axiosInstance.get(`/moneyreceipt/case/${orgId}`);

        if (mrRes.data.success && mrRes.data.data) {
          totalReceived = mrRes.data.data.reduce(
            (sum, mr) => sum + parseFloat(mr.Amount || 0),
            0,
          );
        }
      } catch (err) {
        console.log("Error fetching money receipts:", err);
      }
    }

    // remove for chatGpt
    // const balance = total - formData.Advance;
    // setFormData((prev) => ({
    //   ...prev,
    //   Total: total,
    //   // Amount:ReceiptAmt ,
    //   GrossAmt: total,
    //   CTestAmt: cancelTotal,
    //   Balance: balance,
    //   // ReceiptAmt: prev.ReceiptAmt,
    // }));

    // add by chatGpt
    // setFormData((prev) => {
    //   const advance = parseFloat(prev.Advance || 0);

    //   const gross = total;
    //   const balance = gross - advance;

    //   // edit mode e DB value overwrite korbe na
    //   if (mode === "edit") {
    //     return {
    //       ...prev,
    //       CTestAmt: cancelTotal,
    //       Total: total,
    //     };
    //   }

    //   return {
    //     ...prev,
    //     Total: total,
    //     GrossAmt: gross,
    //     CTestAmt: cancelTotal,
    //     Balance: balance,
    //   };
    // });

    // add by chatGpt
    setFormData((prev) => {
      const advance = parseFloat(prev.Advance || 0);
      const discAmt = parseFloat(prev.DescAmt || 0);

      const gross = total - discAmt - cancelTotal;
      const balance = gross - advance;

      return {
        ...prev,
        Total: total,
        CTestAmt: cancelTotal,
        GrossAmt: gross,
        Balance: balance,
      };
    });
  };

  // Fetch tests for existing case
  const fetchCaseTests = async (caseId) => {
    try {
      const res = await axiosInstance.get(`/case-dtl-01/case/${caseId}`);
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
            // return {
            //   id: t.CaseBillDtlId || index,
            //   TestId: t.TestId,
            //   TestName: testName,
            //   Rate: t.Rate || 0,
            //   NetRate: t.NetRate || t.Rate || 0,
            //   DeliveryDate: t.DeliveryDate
            //     ? new Date(t.DeliveryDate).toISOString().slice(0, 10)
            //     : new Date().toISOString().slice(0, 10),
            //   DeliveryTime: t.DeliveryTime || "07:00 PM",
            //   Profile: t.Profile || "N",
            //   ComYN: t.ComYN || "Y",
            //   CancelTast: t.CancelTast || 0,
            // };

            let subDeptId = null;
            let Descf = null;
            let html = null;

            if (t.TestId) {
              try {
                const testRes = await axiosInstance.get(`/tests/${t.TestId}`);

                if (testRes.data.success && testRes.data.data) {
                  testName = testRes.data.data.Test;
                  subDeptId = testRes.data.data.SubDepartmentId; // ⭐ IMPORTANT
                  Descf = testRes.data.data.DescFormat;
                  html = testRes.data.data.html_content;
                }
              } catch (err) {
                console.log("Error fetching test name:", err);
              }
            }

            return {
              id: t.CaseBillDtlId || index,
              TestId: t.TestId,
              TestName: testName,
              SubDepartmentId: subDeptId, // ⭐ ADD THIS LINE
              Rate: t.Rate || 0,
              NetRate: t.NetRate || t.Rate || 0,
              // DeliveryDate: t.DeliveryDate
              //   ? new Date(t.DeliveryDate).toISOString().slice(0, 10)
              //   : new Date().toISOString().slice(0, 10),
              DeliveryDate: t.DeliveryDate
                ? utcToISTDateOnly(t.DeliveryDate)
                : utcToISTDateOnly(new Date()),
              DeliveryTime: t.DeliveryTime || "07:00 PM",
              Profile: t.Profile || "N",
              ComYN: t.ComYN || "Y",
              // CancelTast: t.CancelTast || 0,
              CancelTast: t.CancelTast || 2,
              DescFormat: Descf,
              html_content: html,
            };
          }),
        );
        setTests(testsData);
        await calculateTotal(testsData);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.log("Error fetching case tests:", error);
      setTests([]);
    }
  };

  const validateForm = () => {
    let errors = {};

    if (!formData.PatientName?.trim()) {
      errors.PatientName = "Patient Name is required";
    }

    if (!formData.Age || formData.Age <= 0) {
      errors.Age = "Valid Age is required";
    }

    if (!formData.Sex) {
      errors.Sex = "Sex is required";
    }

    if (
      !formData.Add1?.trim() &&
      !formData.Add2?.trim() &&
      !formData.Add3?.trim()
    ) {
      errors.Address = "At least one Address field is required";
    }

    if (tests.length === 0) {
      errors.Tests = "At least 1 test must be added";
    }

    return errors;
  };

  // Handle Save (CREATE or UPDATE)
  const handleSave = async () => {
    
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      // error show
      if (errors.PatientName) toast.error(errors.PatientName);
      else if (errors.Age) toast.error(errors.Age);
      else if (errors.Sex) toast.error(errors.Sex);
      else if (errors.Address) toast.error(errors.Address);
      else if (errors.Tests) toast.error(errors.Tests);

      return; // stop save
    }

    try {
      setLoading(true);

      if (mode === "create" || !orgId || orgId === "undefined") {
        // CREATE new case with tests
        if (tests.length === 0) {
          console.log("Please add at least one test");
          setLoading(false);
          return;
        }

        // Step 1: Create Case
        // Determine OP/IP prefix: Indoor=Y → IP, but if CashLessId=63 → OP, Outdoor → OP
        let patientType = "OP";
        if (indoor && cashLessId !== 63) {
          patientType = "IP";
        }

        let { BranchName, ...rest } = formData;
        const caseCreateData = { ...rest, patientType };

        // Convert empty strings to null
        const cleanedData = Object.fromEntries(
          Object.entries(caseCreateData).map(([key, value]) => [
            key,
            value === "" ? null : value,
          ]),
        );

        console.log("Creating case with data cleandata:", cleanedData);

        const caseRes = await axiosInstance.post("/case01", cleanedData);
        // const caseRes = {data:{success:false}} // remove this after testing
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
              // CancelTast: test.CancelTast || 0,
              CancelTast: test.CancelTast || 2,
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
              // CancelTast: null,
              // CancelTast: test.CancelTast || 0,
              CancelTast: test.CancelTast || 2,
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

          // Step 3: Create Money Receipt
          // const receiptAmt = parseFloat(formData?.receiptAmt)
          // const receiptAmt =
          // parseFloat(formData.GrossAmt || 0) - parseFloat(formData.Balance || 0);

          const receiptData = {
            ReffId: newCaseId,
            // ReceiptDate: new Date().toISOString().slice(0, 10),
            ReceiptDate: utcToISTDateOnly(new Date()),
            BillAmount: parseFloat(formData.GrossAmt || 0),
            Desc: parseFloat(formData.Desc || 0),
            DiscAmt: parseFloat(formData.DescAmt || 0),
            Amount: parseFloat(formData.Advance || 0),
            CBalAmt: 0,
            // BalanceAmt: parseFloat(formData.Balance || 0),
            BalanceAmt:
              parseFloat(formData.GrossAmt || 0) -
              parseFloat(formData.Advance || 0),
            // Remarks: formData.Remarks || null,
            Remarks: "Receipt",
            UserId: 1,
            TypeofReceipt: 1,
            DiscOtherId: 1,
            DiscChk: "Y",
            HeadId: "HEAD001",
            ReffType: "C",
            MRType: "C",
            BankName: formData.BankName || null,
            ChequeNo: formData.ChequeNo || null,
            AgentDiscId: 1,
            TDS: 0,
            AdjAmt: 0,
            CompName: null,
            Narration: formData.Narration || null,
            ReceiptTime: new Date().toLocaleTimeString("en-US"),
            CaseId: newCaseId,
            paymentMethods: [
              {
                method:
                  formData.PaymentType === "C"
                    ? "Cash"
                    : formData.PaymentType === "B"
                      ? "Bank"
                      : "Card",
                amount: parseFloat(formData.Advance || 0),
              },
            ],
          };

          try {
            await axiosInstance.post("/money-receipt01", receiptData);
            // console.log("Money receipt created successfully");
          } catch (err) {
            console.error("Error creating money receipt:", err);
            alert(
              "Case created but money receipt failed: " +
                (err.response?.data?.message || err.message),
            );
          }

          alert(
            `Case + Money Receipt Created Successfully! Case ID: ${newCaseId}`,
          );
          navigate("/CaseList");
        }
      } else if (mode === "edit" && orgId && orgId !== "undefined") {
        // UPDATE existing case

        // Step 1: Update case master data (exclude ReceiptAmt and Balance - they're UI only)
        const { BranchName, ...rest } = formData;
        const caseUpdateData = { ...rest };
        const res = await axiosInstance.put(`/case01/${orgId}`, caseUpdateData);
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
              // CancelTast: test.CancelTast || 0,
              CancelTast: test.CancelTast || 2,
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
              // CancelTast: null,
              // CancelTast: test.CancelTast || 0,
              CancelTast: test.CancelTast || 2,
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

          // this will update the 1st mr
          const firstMR = allPrevData[allPrevData.length - 1];
          const { PatientName, Phone, DoctorId, CaseDate, ReceiptId, ...res } =
            firstMR;

          const receiptData = {
            ReceiptNo: firstMR.ReceiptNo,
            ReffId: firstMR.ReffId,
            ReceiptDate: firstMR.ReceiptDate,
            BillAmount: parseFloat(formData.GrossAmt || 0),
            Desc: parseFloat(formData.Desc || 0),
            DiscAmt: parseFloat(formData.DescAmt || 0),
            Amount: parseFloat(formData.Advance || 0),
            BalanceAmt:
              parseFloat(formData.GrossAmt || 0) -
              parseFloat(formData.Advance || 0),
            CBalAmt: firstMR.CBalAmt,
            AdjAmt: firstMR.AdjAmt,
            AgentDiscId: firstMR.AgentDiscId,
            BankName: formData.BankName || firstMR.BankName,
            ChequeNo: formData.ChequeNo || firstMR.ChequeNo,
            CompName: firstMR.CompName,
            DiscChk: firstMR.DiscChk,
            DiscOtherId: firstMR.DiscOtherId,
            HeadId: firstMR.HeadId,
            MRType: formData.PaymentType,
            Narration: formData.Narration || firstMR.Narration,
            Remarks: firstMR.Remarks,
            TDS: firstMR.TDS,
            TypeofReceipt: firstMR.TypeofReceipt,
            UserId: firstMR.UserId,
            ReffType: formData.PaymentType,
            ReceiptTime: firstMR.ReceiptTime,
            paymentMethods: [
              {
                method:
                  formData.PaymentType === "C"
                    ? "Cash"
                    : formData.PaymentType === "B"
                      ? "Bank"
                      : "Card",
                amount: parseFloat(formData.Advance || 0),
              },
            ],
          };

          try {
            await axiosInstance.put(
              `/money-receipt01/${encodeURIComponent(ReceiptId)}`,
              receiptData,
            );
            // console.log("Money receipt created successfully");
          } catch (err) {
            console.error("Error updating money receipt:", err);
            alert(
              "Case updated but money receipt failed: " +
                (err.response?.data?.message || err.message),
            );
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
      // CaseDate: new Date().toISOString().slice(0, 10),
      CaseDate: utcToISTDateOnly(new Date()),
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
      OPDYN: "Y",
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
    setIndoor(false);
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

  const handleBarcodePrint = () => {
    if (!formData.CaseNo) {
      toast.warning("Case No not available");
      return;
    }

    const copies = barcodeCopies || 1;

    const qrHTML = Array.from({ length: copies })
      .map(
        (_, i) => `
    <div class="qr-item">
      <div id="qrcode${i}" class="qr"></div>
      <div class="code-text">${formData.CaseNo}</div>
    </div>
  `,
      )
      .join("");

    const printContent = `
<html>
<head>
<title>QR Code Print</title>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<style>

@page{
  margin:10mm;
}

body{
  font-family:Arial;
}

.qr-container{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.qr-item{
 
  padding:8px;

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;

  border:2px dashed #000;   /* ✂️ scissor cutting border */
  box-sizing:border-box;
  position:relative;
}

.qr{
  display:flex;
  justify-content:center;
  align-items:center;
}

.qr canvas{
  display:block;
  margin:0 auto;
}

.code-text{
  font-size:8px;
 
  margin-top:4px;
  text-align:center;
  width:100%;
}

</style>

</head>

<body>

<div class="qr-container">
${qrHTML}
</div>

<script>

const caseNo = "${formData.CaseNo}";
const copies = ${copies};

for(let i=0;i<copies;i++){
  new QRCode(document.getElementById("qrcode"+i), {
      text: caseNo,
      width: 40,
      height: 40
  });
}

window.onload = function(){
  window.print();
}

</script>

</body>
</html>
`;

    const win = window.open("", "_blank");

    win.document.open();
    win.document.write(printContent);
    win.document.close();
  };

  useEffect(() => {
    console.log("agent id changed: ", formData.AgentId);
    console.log("Branchname data: ", formData.BranchName);
    if (formData.AgentId) {
      fetchAgentById(formData.AgentId);
      setFormData((prev) => ({
        ...prev,
        BranchName: "Y",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        BranchName: "N",
      }));
    }
  }, [formData.AgentId]);

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
      // console.log("IPD changed", selectedTest);
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
      // console.log("OPD changed", selectedTestOPD);
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

  const fetchIndoorDetails = async (admId) => {
    try {
      const res = await axiosInstance.get(`/admissions/${admId}`);

      if (res.data.success) {
        const p = res.data.data.admission;

        // Store CashLessId for OP/IP prefix logic
        setCashLessId(Number(p.CashLessId || 0));

        setFormData((prev) => ({
          ...prev,
          // BASIC INFO
          AdmitionId: p.AdmitionId || "",
          PatientName: p.PatientName || "",
          Sex: p.Sex || "",
          Age: p.Age || "",
          AgeType: p.AgeType || "Y",

          DoctorId: p.UCDoctor1Id || p.UCDoctor2Id || p.UCDoctor3Id || "",

          // ADDRESS
          Add1: p.Add1 || "",
          Add2: p.Add2 || "",
          Add3: p.Add3 || "",

          // PHONE / EMAIL
          MobileNo: p.PhoneNo || "",
          Phone: p.PhoneNo || "",
          Email: p.Email || "",

          // CARD & EXTRA
          CardNo: p.CardNo || "",
          Remarks: p.Remarks || "",

          // OPD / INDOOR ID
          PatientId: p.OPDId || "",
          OPDID: p.OPDId || "",

          // ADVANCED AGES
          AgeD: p.AgeD || "",
          AgeTypeD: p.AgeTypeD || "",
        }));
      }
    } catch (err) {
      console.log("Indoor details fetch error:", err);
    }
  };

  const fetchOPDDetails = async (regId) => {
    try {
      const res = await axiosInstance.get(
        `/patient-visits?registrationId=${regId}`,
      );

      if (res.data.success && res.data.data.length > 0) {
        const p = res.data.data[0];

        setFormData((prev) => ({
          ...prev,

          // BASIC
          PatientName: p.PatientName || "",
          PPr: p.PPr || "",
          Sex: p.Sex || "",
          Age: p.Age || "",
          AgeType: p.AgeType || "Y",

          // ADDRESS
          Add1: p.PatientAdd1 || "",
          Add2: p.PatientAdd2 || "",
          Add3: p.PatientAdd3 || "",

          // CONTACT
          MobileNo: p.PhoneNo || "",
          Phone: p.PhoneNo || "",
          Email: p.EMailId || "",

          // OPD IDs
          PatientId: p.RegistrationId || "",
          OPDID: p.RegistrationId || "",

          // ADVANCED AGE FIELDS
          AgeD: p.AgeD || "",
          AgeTypeD: p.AgeTypeD || "",
          AgeN: p.AgeN || "",
          AgeTypeN: p.AgeTypeN || "",

          // EXTRA
          Remarks: p.Remarks || "",
        }));
      }
    } catch (err) {
      console.log("OPD details fetch error:", err);
    }
  };

  useEffect(() => {
    if (selectedTest?.value) {
      fetchIndoorDetails(selectedTest.value);
    }
  }, [selectedTest]);

  useEffect(() => {
    if (selectedTestOPD?.value) {
      fetchOPDDetails(selectedTestOPD.value);
    }
  }, [selectedTestOPD]);

  useEffect(() => {
    if (formData.CaseId) {
      fetchReceiptDetailData(formData.CaseId);
    }
  }, [formData.CaseId]);

  useEffect(() => {
    if (receiptDetailData.length > 1) {
      setShowAddTest(false);
    }
  }, [receiptDetailData]);

  // remove this for chatGpt
  // useEffect(() => {
  //   const total = parseFloat(formData.Total || 0);

  //   const discPerc = parseFloat(formData.Desc || 0);
  //   const discAmt = parseFloat(formData.DescAmt || 0);
  //   const advance = parseFloat(formData.Advance || 0);
  //   const cancelAmt = parseFloat(formData.CTestAmt || 0);
  //   // const receiptAmt = parseFloat(formData.ReceiptAmt || 0);

  //   let finalDiscAmt = discAmt;

  //   // jodi user % diye
  //   if (discPerc > 0) {
  //     finalDiscAmt = (total * discPerc) / 100;
  //   }

  //   const gross = total - finalDiscAmt - cancelAmt;
  //   // const balance = gross - receiptAmt;
  //   const balance = gross;
  //   setFormData((prev) => ({
  //     ...prev,
  //     DescAmt: finalDiscAmt.toFixed(2),
  //     GrossAmt: gross.toFixed(2),
  //     Balance: balance.toFixed(2),
  //   }));
  // }, [
  //   formData.Total,
  //   formData.Desc,
  //   formData.DescAmt,
  //   formData.Advance,
  //   formData.CTestAmt,
  //   // formData.ReceiptAmt,
  // ]);

  // add this By chatGpt
  useEffect(() => {
    // console.log("Modex:", Modex);
    // if (Modex === "edit") return;
    if (!isLoaded && Modex === "edit") return;

    const total = parseFloat(formData.Total || 0);
    const discPerc = parseFloat(formData.Desc || 0);
    const cancelAmt = parseFloat(formData.CTestAmt || 0);
    const advance = parseFloat(formData.Advance || 0);

    let discAmt = parseFloat(formData.DescAmt || 0);

    if (discPerc > 0) {
      discAmt = (total * discPerc) / 100;
    }
    const gross = total - discAmt - cancelAmt;
    const balance = gross - advance;

    setFormData((prev) => ({
      ...prev,
      DescAmt: discAmt.toFixed(2),
      GrossAmt: gross.toFixed(2),
      Balance: balance.toFixed(2),
    }));
  }, [
    formData.Total,
    formData.Desc,
    formData.DescAmt,
    formData.CTestAmt,
    formData.Advance,
  ]);

  useEffect(() => {
    let filteredTests = tests.filter((item) => item.DescFormat == 1);
    console.log("filteredTests:", filteredTests);
    setDWorkTests(filteredTests);
  }, [tests]);

  const groupedTests = tests.reduce((acc, t) => {
    if (!acc[t.SubDepartmentId]) acc[t.SubDepartmentId] = [];
    acc[t.SubDepartmentId].push(t);
    return acc;
  }, {});
  // console.log(groupedTests);

  const subDeptList = Object.keys(groupedTests);

  // const handleDepPrint = (selectedDept) => {
  //   const doctorName =
  //     doctorData.find((d) => d.DoctorId == formData.DoctorId)?.Doctor || "";

  //   // Filter only selected sub departments
  //   const filteredGroups = Object.keys(groupedTests)
  //     // .filter((key) => selectedDept.includes(key))
  //     .filter((key) => selectedDept.includes(Number(key)))
  //     .reduce((acc, key) => {
  //       acc[key] = groupedTests[key];
  //       return acc;
  //     }, {});

  //   if (Object.keys(filteredGroups).length === 0) {
  //     alert("Select at least one Sub-Department!");
  //     return;
  //   }

  //   setShowSubDeptPopup(false); // Close popup

  //   const printContent = `
  // <html>
  // <head>
  //   <title>Department Print</title>

  //   <style>
  //     body { font-family: Arial; padding: 20px; font-size: 13px; }

  //     .page-break { page-break-after: always; }

  //     .top-header-row {
  //       display: flex; justify-content: space-between; align-items: center;
  //     }
  //     .top-favicon img { width: 80px; }
  //     .header { text-align: center; flex-grow: 1; }
  //     .hospital-name { font-size: 20px; font-weight: bold; }
  //     .address, .contact-info { font-size:12px; line-height:1.4; }

  //     .title { font-size: 16px; text-align:center; font-weight:bold; margin-top:15px; }

  //     .patient-block {
  //       margin-top: 15px; display:flex; justify-content:space-between;
  //       gap:40px; border:1px solid #000; padding:12px; background:#fafafa;
  //     }
  //     .patient-col { width: 48%; }

  //     table { width:100%; border-collapse: collapse; margin-top:15px; }
  //     th, td { border:1px solid #333; padding:6px; font-size:13px; }
  //     th { background:#f0f0f0; }

  //     .footer { text-align:center; margin-top:20px; font-size:12px; }
  //   </style>
  // </head>

  // <body>

  // ${Object.entries(filteredGroups)
  //   .map(([subDeptId, list]) => {
  //     return `
  //     <div class="subdept-section">

  //       <!-- Header -->
  //       <div class="top-header-row">
  //         <div class="top-favicon">
  //           <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLBp8HRkxkrAD3J_42s4lQdr95CDxPS-aQCQ&s" />
  //         </div>

  //         <div class="header">
  //           <div class="hospital-name">LORDS HEALTH CARE (NURSING HOME)</div>
  //           <div class="hospital-name">(A Unit of MJJ Enterprises Pvt. Ltd.)</div>

  //           <div class="address">
  //            13/3, Circular 2nd Bye Lane, Kona Expressway,<br/>
  //            Shibpur. Howrah-711102, W.B.
  //           </div>

  //           <div class="contact-info">
  //             E-mail: patientdesk@lordshealthcare.org<br/>
  //             Phone: 8272904444 | Toll Free: 1800-309-0895
  //           </div>
  //         </div>
  //       </div>

  //       <hr/>

  //       <div class="title">CLINICAL PATHOLOGY — SubDept: ${depMap[subDeptId]}</div>

  //       <!-- Patient Details -->
  //       <div class="patient-block">
  //         <div class="patient-col">
  //           <p><b>Patient Name:</b> ${formData.PatientName}</p>
  //           <p><b>Case No:</b> ${formData.CaseNo}</p>
  //           <p><b>Phone:</b> ${formData.MobileNo}</p>
  //           <p><b>Address:</b> ${formData.Add1} ${formData.Add2} ${formData.Add3}</p>
  //         </div>

  //         <div class="patient-col">
  //           <p><b>Age:</b> ${formData.Age} ${formData.AgeType}</p>
  //           <p><b>Sex:</b> ${formData.Sex}</p>
  //           <p><b>Date:</b> ${utcToISTDateOnly(new Date())}</p>
  //           <p><b>Doctor:</b> ${doctorName}</p>
  //         </div>
  //       </div>

  //       <hr/>

  //       <!-- Table -->
  //       <table>
  //         <thead>
  //           <tr>
  //             <th>Sl No</th>
  //             <th>Test Name</th>
  //             <th style="text-align:right;">Net Rate</th>
  //           </tr>
  //         </thead>

  //         <tbody>
  //           ${list
  //             .map(
  //               (t, i) => `
  //               <tr>
  //                 <td style="text-align:center;">${i + 1}</td>
  //                 <td>${t.TestName} ${Number(t.CancelTast) === 1 ? "(Cancel)" : ""}</td>
  //                 <td style="text-align:right;">${Number(t.CancelTast) === 1 ? 0 : t.NetRate}</td>
  //               </tr>
  //             `,
  //             )
  //             .join("")}
  //         </tbody>

  //         <tfoot>
  //           <tr>
  //             <td colspan="2" style="text-align:right;font-weight:bold;">Subtotal:</td>
  //             <td style="text-align:right;font-weight:bold;">
  //               ${list.reduce((sum, x) => sum + Number(Number(x.CancelTast) === 1 ? 0 : x.NetRate), 0)}
  //             </td>
  //           </tr>
  //         </tfoot>
  //       </table>

  //       <div class="footer">** End of Report — This is a computer-generated document **</div>

  //     </div>

  //     <div class="page-break"></div>
  //     `;
  //   })
  //   .join("")}

  // </body>
  // </html>
  // `;

  //   const win = window.open("", "_blank");
  //   win.document.write(printContent);
  //   win.document.close();
  //   win.onload = () => win.print();
  // };

  const handleDepPrint = (selectedDept) => {
    const doctorName =
      doctorData.find((d) => d.DoctorId == formData.DoctorId)?.Doctor || "";

    const filteredGroups = Object.keys(groupedTests)
      .filter((key) => selectedDept.includes(Number(key)))
      .reduce((acc, key) => {
        acc[key] = groupedTests[key];
        return acc;
      }, {});

    if (Object.keys(filteredGroups).length === 0) {
      alert("Select at least one Sub-Department!");
      return;
    }

    setShowSubDeptPopup(false);

    const printContent = `
<html>
<head>
<title>Department Print</title>

<style>

@page {

  margin: 10mm;
}

body{
  font-family: Arial;
  font-size:12px;
  font-weight:700;
  margin:0;
  padding:0;
}

.page-break{
  page-break-after:always;
}

.container{
  width:100%;
}

.top-header-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.top-favicon img{
  width:55px;
}

.header{
  text-align:center;
  flex-grow:1;
}

.hospital-name{
  font-size:15px;
  font-weight:700;
}

.address,.contact-info{
  font-size:12px;
  font-weight:700;
  line-height:1.3;
}

.title{
  font-size:13px;
  text-align:center;
  font-weight:700;
  margin-top:8px;
}

.patient-block{
  margin-top:10px;
  display:flex;
  justify-content:space-between;
  gap:20px;
  border:1px solid #000;
  padding:8px;
  background:#fafafa;
}

.patient-col{
  width:48%;
}

.patient-col p{
  margin:2px 0;
}

table{
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
}

th,td{
  border:1px solid #333;
  padding:4px;
  font-size:14px;
  font-weight:700;
}

th{
  background:#f0f0f0;
}

.footer{
  text-align:center;
  margin-top:10px;
  font-size:11px;
  font-weight:700;
}

hr{
  margin:6px 0;
}

</style>
</head>

<body>

${Object.entries(filteredGroups)
  .map(([subDeptId, list]) => {
    return `

<div class="container">

<div class="top-header-row">
  <div class="top-favicon">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLBp8HRkxkrAD3J_42s4lQdr95CDxPS-aQCQ&s"/>
  </div>

  <div class="header">
    <div class="hospital-name">LORDS HEALTH CARE (NURSING HOME)</div>
    <div class="hospital-name">(A Unit of MJJ Enterprises Pvt. Ltd.)</div>

    <div class="address">
      13/3, Circular 2nd Bye Lane, Kona Expressway,<br/>
      Shibpur. Howrah-711102, W.B.
    </div>

    <div class="contact-info">
      E-mail: patientdesk@lordshealthcare.org<br/>
      Phone: 8272904444 | Toll Free: 1800-309-0895
    </div>
  </div>
</div>

<hr/>

<div class="title">
CLINICAL PATHOLOGY — SubDept: ${depMap[subDeptId] || ""}
</div>

<div class="patient-block">

  <div class="patient-col">
    <p><b>Patient Name:</b> ${formData.PatientName}</p>
    <p><b>Case No:</b> ${formData.CaseNo}</p>
    <p><b>Phone:</b> ${formData.MobileNo}</p>
    <p><b>Address:</b> ${formData.Add1} ${formData.Add2} ${formData.Add3}</p>
  </div>

  <div class="patient-col">
    <p><b>Age:</b> ${formData.Age} ${formData.AgeType}</p>
    <p><b>Sex:</b> ${formData.Sex}</p>
    <p><b>Date:</b> ${utcToISTDateOnly(new Date())}</p>
    <p><b>Doctor:</b> ${doctorName}</p>
  </div>

</div>

<hr/>

<table>

<thead>
<tr>
<th>Sl No</th>
<th>Test Name</th>
<!-- <th style="text-align:right;">Net Rate</th> -->
</tr>
</thead>

<tbody>

${list
  .map(
    (t, i) => `
<tr>
<td style="text-align:center;">${i + 1}</td>
<td>${t.TestName} ${Number(t.CancelTast) === 1 ? "(Cancel)" : ""}</td>
<!--<td style="text-align:right;">${Number(t.CancelTast) === 1 ? 0 : t.NetRate}</td>-->
</tr>
`,
  )
  .join("")}

</tbody>

<tfoot>
<!--  <tr>
<td colspan="2" style="text-align:right;font-weight:bold;">Subtotal</td>

<td style="text-align:right;font-weight:bold;">
${list.reduce(
  (sum, x) => sum + Number(Number(x.CancelTast) === 1 ? 0 : x.NetRate),
  0,
)}
</td>

</tr>  -->
</tfoot>

</table>

<div class="footer">
** End of Report — This is a computer-generated document **
</div>

</div>

<div class="page-break"></div>

`;
  })
  .join("")}

</body>
</html>
`;

    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();

    win.onload = () => win.print();
  };

  const handleBillPrint = () => {
    const logoUrl = "/assets/images/logo-small.png";

    const doctorName =
      doctorData.find((d) => d.DoctorId == formData.DoctorId)?.Doctor || "";

    const printContent = `
<html>
<head>
<title>Bill Print</title>

<style>

@page{
 
  margin:10mm;
}

body{
  font-family:Arial, sans-serif;
  font-size:12px;
  font-weigt:700
  margin:0;
}

.top-header-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.top-favicon img{
  width:60px;
}

.header{
  text-align:center;
  flex-grow:1;
}

.hospital-name{
  font-size:15px;
  font-weight:600;
  margin:2px 0;
}

.address,.contact-info{
  font-size:11px;
  font-weight:700;
  line-height:1.3;
}

.title{
  text-align:center;
  font-weight:600;
  font-size:13px;
  margin-top:8px;
}

.patient-block{
  margin-top:10px;
  display:flex;
  justify-content:space-between;
  gap:20px;
  border:1px solid #000;
  padding:8px;
  background:#fafafa;
}

.patient-col{
    margin:4px 0;
  font-size:13px;
  font-weight:bold;
}

.patient-row{
  display:flex;
  margin-bottom:3px;
}

.patient-label{
  font-weight:700;
  width:85px;
}

.patient-value{
  flex-grow:1;
}

table{
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
}

th,td{
  border:1px solid #333;
  padding:4px;
  font-size:12px;
  font-weight:700;
}

th{
  background:#f0f0f0;
}

.footer{
  text-align:center;
  margin-top:10px;
  font-size:11px;
  font-weight:700;
}

hr{
  margin:6px 0;
}

</style>

</head>

<body>

<div class="top-header-row">

<div class="top-favicon">
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLBp8HRkxkrAD3J_42s4lQdr95CDxPS-aQCQ&s"/>
</div>

<div class="header">

<div class="hospital-name">LORDS HEALTH CARE (NURSING HOME)</div>
<div class="hospital-name">(A Unit of MJJ Enterprises Pvt. Ltd.)</div>

<div class="address">
13/3, Circular 2nd Bye Lane, Kona Expressway,<br/>
(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.
</div>

<div class="contact-info">
E-mail: patientdesk@lordshealthcare.org<br/>
Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
</div>

</div>

</div>

<hr/>

<div class="title">${formData.Balance == 0 ? "Money Receipt" : "BILL"}</div>

<div class="patient-block">

<div class="patient-col">

<div class="patient-row">
<span class="patient-label">Patient</span>
<span class="patient-value">${formData.PatientName}</span>
</div>

<div class="patient-row">
<span class="patient-label">Case No</span>
<span class="patient-value">${formData.CaseNo}</span>
</div>

<div class="patient-row">
<span class="patient-label">Phone</span>
<span class="patient-value">${formData.MobileNo}</span>
</div>

<div class="patient-row">
<span class="patient-label">Address</span>
<span class="patient-value">${formData.Add1} ${formData.Add2} ${formData.Add3}</span>
</div>

</div>

<div class="patient-col">

<div class="patient-row">
<span class="patient-label">Age</span>
<span class="patient-value">${formData.Age} ${formData.AgeType}</span>
</div>

<div class="patient-row">
<span class="patient-label">Sex</span>
<span class="patient-value">${formData.Sex}</span>
</div>

<div class="patient-row">
<span class="patient-label">Date</span>
<span class="patient-value">${utcToISTDateOnly(new Date())}</span>
</div>

<div class="patient-row">
<span class="patient-label">Doctor</span>
<span class="patient-value">${doctorName}</span>
</div>

</div>

</div>

<hr/>

<table>

<thead>

<tr>
<th style="width:40px;">Sl</th>
<th>Test Name</th>
<th style="width:90px;">Delivery</th>
<th style="width:80px;text-align:right;">Net</th>
</tr>

</thead>

<tbody>

${
  tests.length
    ? tests
        .map(
          (t, i) => `
<tr>
<td style="text-align:center;">${i + 1}</td>
<td>${t.TestName} ${t.CancelTast == 1 ? "(Cancel)" : ""}</td>
<td>${t.DeliveryDate}</td>
<td style="text-align:right;">${t.CancelTast == 1 ? 0 : t.NetRate}</td>
</tr>
`,
        )
        .join("")
    : `<tr><td colspan="4" style="text-align:center;">No Test Added</td></tr>`
}

</tbody>

<tfoot>

<tr>
<td></td>
<td colspan="2" style="text-align:right;font-weight:bold;">Total Test Amount</td>
<td style="text-align:right;font-weight:bold;">${formData.GrossAmt}</td>
</tr>

<tr>
<td></td>
<td colspan="2" style="text-align:right;font-weight:bold;">Paid Amount</td>
<td style="text-align:right;font-weight:bold;">${formData.Advance}</td>
</tr>

<tr>
<td></td>
<td colspan="2" style="text-align:right;font-weight:bold;">Due Amount</td>
<td style="text-align:right;font-weight:bold;">${formData.Balance}</td>
</tr>

</tfoot>

</table>

<div class="footer">
** End of Report — This is a computer-generated document **
</div>

</body>
</html>
`;

    const win = window.open("", "_blank");

    win.document.open();
    win.document.write(printContent);
    win.document.close();

    win.onload = () => win.print();
  };

  // const handleBillPrint = () => {
  //   const logoUrl = "/assets/images/logo-small.png";
  //   const doctorName =
  //     doctorData.find((d) => d.DoctorId == formData.DoctorId)?.Doctor || "";
  //   const printContent = `
  // <html>
  // <head>
  //   <title>Department Print</title>

  //   <style>
  //     body {
  //       font-family: Arial, sans-serif;
  //       padding: 20px;
  //       font-size: 13px;
  //     }

  //     .top-header-row {
  //       display: flex;
  //       justify-content: space-between;
  //       align-items: center;
  //     }

  //     .top-favicon img {
  //       width: 80px;
  //       height: auto;
  //     }

  //     .header {
  //       text-align: center;
  //       flex-grow: 1;
  //     }

  //     .hospital-name {
  //       font-size: 20px;
  //       font-weight: bold;
  //       margin: 2px 0;
  //     }

  //     .address, .contact-info {
  //       font-size: 12px;
  //       line-height: 1.4;
  //       margin-top: 3px;
  //     }

  //     .title {
  //       text-align: center;
  //       font-weight: bold;
  //       font-size: 16px;
  //       margin-top: 15px;
  //     }

  //     /* ⭐ PATIENT DETAILS STYLE */
  //     .patient-block {
  //       margin-top: 15px;
  //       display: flex;
  //       justify-content: space-between;
  //       width: 100%;
  //       gap: 40px;
  //       border: 1px solid #000;
  //       padding: 12px;
  //       border-radius: 4px;
  //       background: #fafafa;
  //     }

  //     .patient-col {
  //       width: 48%;
  //       font-size: 13px;
  //       line-height: 1.5;
  //     }

  //     .patient-row {
  //       display: flex;
  //       margin-bottom: 6px;
  //     }

  //     .patient-label {
  //       font-weight: bold;
  //       width: 120px;
  //       display: inline-block;
  //     }

  //     .patient-value {
  //       flex-grow: 1;
  //     }

  //     table {
  //       width: 100%;
  //       border-collapse: collapse;
  //       margin-top: 15px;
  //     }

  //     th, td {
  //       border: 1px solid #333;
  //       padding: 6px;
  //       font-size: 13px;
  //     }

  //     th {
  //       background-color: #f0f0f0;
  //     }

  //     .footer {
  //       text-align: center;
  //       margin-top: 20px;
  //       font-size: 12px;
  //       color: #555;
  //     }
  //   </style>
  // </head>

  // <body>

  //   <!-- ⭐ TOP HEADER -->
  //   <div class="top-header-row">

  //     <div class="top-favicon">
  //       <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLBp8HRkxkrAD3J_42s4lQdr95CDxPS-aQCQ&s" />
  //     </div>

  //     <div class="header">
  //       <div class="hospital-name">LORDS HEALTH CARE (NURSING HOME)</div>
  //       <div class="hospital-name">(A Unit of MJJ Enterprises Pvt. Ltd.)</div>

  //       <div class="address">
  //         13/3, Circular 2nd Bye Lane, Kona Expressway,<br/>
  //         (Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711 102, W.B.
  //       </div>

  //       <div class="contact-info">
  //         E-mail: patientdesk@lordshealthcare.org, Website: www.lordshealthcare.org<br/>
  //         Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
  //       </div>
  //     </div>
  //   </div>

  //   <hr/>

  //   <!-- MAIN TITLE -->
  //   <div class="title">CLINICAL PATHOLOGY</div>

  //   <!-- ⭐ PATIENT DETAILS BLOCK -->
  //   <div class="patient-block">

  //     <div class="patient-col">
  //       <div class="patient-row">
  //         <span class="patient-label">Patient Name</span>
  //         <span class="patient-value">${formData.PatientName}</span>
  //       </div>

  //       <div class="patient-row">
  //         <span class="patient-label">Case No</span>
  //         <span class="patient-value">${formData.CaseNo}</span>
  //       </div>

  //       <div class="patient-row">
  //         <span class="patient-label">Phone</span>
  //         <span class="patient-value">${formData.MobileNo}</span>
  //       </div>

  //       <div class="patient-row">
  //         <span class="patient-label">Address</span>
  //         <span class="patient-value">${formData.Add1} ${formData.Add2} ${formData.Add3}</span>
  //       </div>
  //     </div>

  //     <div class="patient-col">
  //       <div class="patient-row">
  //         <span class="patient-label">Age</span>
  //         <span class="patient-value">${formData.Age} ${formData.AgeType}</span>
  //       </div>

  //       <div class="patient-row">
  //         <span class="patient-label">Sex</span>
  //         <span class="patient-value">${formData.Sex}</span>
  //       </div>

  //       <div class="patient-row">
  //         <span class="patient-label">Date</span>
  //         <span class="patient-value">${utcToISTDateOnly(new Date())}</span>
  //       </div>

  //        <div class="patient-row">
  //         <span class="patient-label">Doctor</span>
  //          <span class="patient-value">${doctorName}</span>

  //       </div>
  //     </div>

  //   </div>

  //   <hr/>

  //   <!-- ⭐ TABLE -->
  //   <table>
  //     <thead>
  //       <tr>
  //         <th style="width:60px;">Sl No</th>
  //         <th>Test Name</th>
  //         <th>Delivery Date</th>
  //         <th style="width:120px; text-align:right;">Net Rate</th>
  //       </tr>
  //     </thead>

  //     <tbody>
  //       ${
  //         tests.length
  //           ? tests
  //               .map(
  //                 (t, i) => `
  //       <tr>
  //         <td style="text-align:center;">${i + 1}</td>
  //         <td>${t.TestName}</td>
  //         <td>${t.DeliveryDate}</td>
  //         <td style="text-align:right;">${t.NetRate}</td>
  //       </tr>`,
  //               )
  //               .join("")
  //           : `<tr><td colspan="3" style="text-align:center;">No Test Added</td></tr>`
  //       }
  //     </tbody>
  //       <tfoot>
  //       <tr>
  //       <td/>
  //         <td colspan="2" style="text-align:right; font-weight:bold;">Total Test Amount :</td>
  //         <td style="text-align:right; font-weight:bold;">${formData.Total}</td>
  //       </tr>
  //        <tr>
  //        <td/>
  //         <td colspan="2" style="text-align:right; font-weight:bold;">Paid Amount :</td>
  //         <td style="text-align:right; font-weight:bold;">${formData.ReceiptAmt}</td>
  //       </tr>
  //        <tr>
  //        <td/>
  //         <td colspan="2" style="text-align:right; font-weight:bold;">Due Amount :</td>
  //         <td style="text-align:right; font-weight:bold;">${formData.Balance}</td>
  //       </tr>
  //     </tfoot>
  //   </table>

  //   <div class="footer">** End of Report — This is a computer-generated document **</div>

  // </body>
  // </html>
  // `;

  //   const win = window.open("", "_blank");
  //   win.document.open();
  //   win.document.write(printContent);
  //   win.document.close();

  //   win.onload = () => win.print();
  // };

  // remove this for chatGpt
  // useEffect(() => {
  //   console.log("mode: ", Modex);
  //   const data = Number(formData.GrossAmt) - Number(formData.Advance);

  //   // let gTotal = formData.GrossAmt + formData.CTestAmt
  //   if (Modex !== "edit") {
  //     // console.log("hi");
  //     setFormData((prev) => ({
  //       ...prev,
  //       Balance: data,
  //     }));
  //   }
  // }, [
  //   formData.GrossAmt,
  //   formData.Advance,
  //   formData.Desc,
  //   formData.DescAmt,
  //   formData.CTestAmt,
  // ]);

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
                      value={indoor ? "Y" : "N"}
                      onChange={(e) => {
                        const val = e.target.value === "Y";
                        setIndoor(val);
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
              {/* <div className="col-12 col-lg-3">
                <Barcode
                  value={formData.CaseNo}
                  height={40}
                  width={1}
                  fontSize={12}
                />{" "}
                <div className="text-center small fw-bold">
                  Test Instruction
                </div>
              </div> */}
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
                          required
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
                          <option value="">--</option>
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
                        <label style={labelStyle}>Guardian Name</label>
                        <input
                          type="text"
                          name="FName"
                          value={formData.FName}
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
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      BranchName: newValue,
                      AgentId: "",
                    }));
                    if (newValue === "N") {
                      setSelectedAgent(null);
                    }
                  }}
                  style={{ ...inputStyle, width: "40px", padding: 0 }}
                >
                  <option value="">--</option>
                  <option value="N">N</option>
                  <option value="Y">Y</option>
                </select>
                {(formData.BranchName === "Y" || formData.AgentId) && (
                  <div style={{ width: "200px" }}>
                    <Select
                      styles={compactSelectStyles}
                      value={selectedAgent}
                      onChange={(selected) => {
                        setSelectedAgent(selected);
                        setFormData((p) => ({
                          ...p,
                          AgentId: selected?.value || "",
                        }));
                      }}
                      onInputChange={(inputValue) => {
                        searchAgents(inputValue);
                      }}
                      options={agentData.map((agent) => ({
                        value: agent.AgentId,
                        label: agent.Agent,
                      }))}
                      placeholder="Search Agent..."
                      isClearable
                      isLoading={isSearchingAgent}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue.length < 2
                          ? "Type at least 2 characters"
                          : "No agent found"
                      }
                    />
                  </div>
                )}

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
                        <th style={{ ...tableHeaderStyle }}>Del</th>
                        <th style={{ ...tableHeaderStyle }}>Cancel</th>

                        <th style={tableHeaderStyle}>Test Name</th>
                        <th style={{ ...tableHeaderStyle }}>Rate</th>
                        <th style={tableHeaderStyle}>Delivery Date</th>
                        <th style={tableHeaderStyle}>Delivery Time</th>
                        <th style={tableHeaderStyle}>Net Rate</th>
                        <th style={{ ...tableHeaderStyle }}>IsisDisc</th>
                        <th style={{ ...tableHeaderStyle }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {console.log("tests:", tests)}
                      {tests.length > 0 ? (
                        tests.map((test, index) => (
                          <tr
                            key={index}
                            style={{
                              backgroundColor:
                                test.CancelTast == 1 ? "#f02929" : "#ccffdc",
                            }}
                          >
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveTest(test.id)}
                                disabled={mode === "view"}
                              >
                                ×
                              </button>
                            </td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  style={{ cursor: "pointer" }}
                                  checked={Number(test.CancelTast) == 1}
                                  onChange={() => handleCancelTest(test.id)}
                                />
                              </div>
                            </td>

                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.TestName}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              <input
                                style={{ textAlign: "center" }}
                                disabled={mode != "create"}
                                type="number"
                                value={test.Rate}
                                onChange={(e) => {
                                  handleModifyTest(
                                    index,
                                    Number(e.target.value),
                                  );
                                }}
                              />
                              {/* {test.Rate} */}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.DeliveryDate}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              {test.DeliveryTime}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              <input
                                type="number"
                                style={{ textAlign: "center" }}
                                disabled={mode != "create"}
                                value={test.NetRate}
                                onChange={(e) => {
                                  handleModifyTest(
                                    index,
                                    Number(e.target.value),
                                  );
                                }}
                              />
                              {/* {test.NetRate} */}
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              N
                            </td>
                            <td style={{ ...tableCellStyle, color: "black" }}>
                              Test
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
                  {showAddTest && (
                    <Select
                      key={indoor}
                      styles={compactSelectStyles}
                      value={selectedTestMaster}
                      onChange={(selectedOption) => {
                        setSelectedTestMaster(selectedOption);

                        if (selectedOption) {
                          handleAddTest(selectedOption); //  auto add
                        }
                      }}
                      onInputChange={(inputValue) => {
                        searchTestMaster(inputValue);
                      }}
                      options={testSearchResults.map((item) => ({
                        value: item.TestId,

                        label: `${item.Test} - ₹${indoor ? item.BRate : item.Rate}`,
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
                  )}
                  <div className="d-flex align-items-start">
                    {/* {showAddTest && (
                      <button
                        className="btn btn-success btn-sm py-1 px-1"
                        onClick={() => {
                          console.log("show add test", showAddTest);
                          if (showAddTest) {
                            handleAddTest();
                          }
                        }}
                        disabled={mode === "view" || !selectedTestMaster}
                        style={{ fontSize: "11px" }}
                      >
                        Add Test
                      </button>
                    )} */}

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
                          disabled={!showAddTest}
                        />
                      </div>
                    </div>
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
                      disabled={!showAddTest}
                    />
                    <span className="text-danger fw-bold mx-1">%</span>
                    <label style={labelStyle}>Amount</label>
                    <input
                      disabled={!showAddTest}
                      type="text"
                      name="DescAmt"
                      value={formData.DescAmt}
                      onChange={(e) => {
                        handleInputChange(e);
                        let discPerc = (e.target.value * 100) / formData.Total;

                        setFormData((prev) => ({
                          ...prev,
                          Desc: discPerc,
                        }));
                      }}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label style={labelStyle}>Cancel Test Amount</label>
                    <input
                      disabled={!showAddTest}
                      type="text"
                      name="CTestAmt"
                      value={formData.CTestAmt}
                      onChange={handleInputChange}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    {/* <label style={labelStyle}>Adv</label> */}
                    {/* <input
                      type="text"
                      name="Advance"
                      // value={formData.Advance}
                      value={0}
                      onChange={handleInputChange}
                      className="text-end ms-1"
                      style={{ ...inputStyle, width: "40px" }}
                    /> */}
                    {/* <input
                      type="text"
                      name="Advance"
                      value={formData.Advance}
                      onChange={handleInputChange}
                    /> */}

                    <label style={{ ...labelStyle, marginLeft: "4px" }}>
                      G Total
                    </label>
                    <input
                      disabled={!showAddTest}
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
                      disabled={!showAddTest}
                      type="text"
                      name="Advance"
                      // value={formData.ReceiptAmt}
                      value={formData.Advance}
                      onChange={handleInputChange}
                      className="text-end fw-bold ms-1"
                      style={{ ...inputStyle, width: "80px" }}
                    />
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <label style={labelStyle}> Due Balance</label>
                    <input
                      disabled={!showAddTest}
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
            <div className="row g-1 text-black">
              {/* SECTION 11 & 12 */}
              <div className="row g-2 mb-1">
                <div className="col-md-2">
                  <label className="form-label">Mode of Payment</label>
                  <select
                    name="PaymentType"
                    className="form-control form-control-sm"
                    disabled={mode === "view"}
                    value={formData.PaymentType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="C">Cash</option>
                    <option value="B">Bank</option>
                    <option value="D">Credit Card</option>
                    <option value="W">W</option>
                  </select>
                </div>

                <div className="col-md-5">
                  <label className="form-label">Bank</label>
                  <input
                    name="BankName"
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.BankName}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Cheque / Card No</label>
                  <input
                    name="ChequeNo"
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.ChequeNo}
                    disabled={mode === "view"}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-12 col-md-8">
                {/* <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
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
                </div> */}
                <div
                  className="d-flex flex-wrap border border-secondary p-0"
                  style={{ backgroundColor: "#dcd6fc" }}
                >
                  <button
                    className="bg-success text-white small fw-bold p-1 d-flex align-items-center"
                    style={{ width: "60px", lineHeight: 1.1 }}
                    onClick={async () => {
                      if (Modex == "edit" || Modex == "view") {
                        await fetchReceiptDetailData(formData.CaseId);

                        setShow((c) => !c);
                      }
                    }}
                  >
                    Receipt Detail
                  </button>

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
                      {/* <input
                        type="text"
                        defaultValue="0"
                        style={{ ...inputStyle, width: "40px" }}
                      /> */}

                      <input
                        type="number"
                        value={barcodeCopies}
                        min="1"
                        onChange={(e) =>
                          setBarcodeCopies(Number(e.target.value))
                        }
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
                        onClick={handleBarcodePrint}
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
            onClick={handleBillPrint}
          >
            Bill
          </button>
          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
          >
            Com Bill
          </button>
          {/* <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
            onClick={handleDepPrint}
          >
            Dep Print
          </button> */}

          {/* dev  */}

          <button
            className="btn btn-sm btn-light border shadow-sm"
            style={{ fontSize: "0.75rem", height: "26px", fontWeight: "bold" }}
            onClick={() => setShowSubDeptPopup(true)}
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
              onClick={() => {
                if (btn == "D-Work Sheet" && mode != "create") {
                  setIsOpen(true);
                }
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
      <ReceiptDetailModal
        show={show}
        setShow={setShow}
        data={receiptDetailData}
      />

      {/* {showSubDeptPopup && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: 20,
        width: 350,
        borderRadius: 5,
      }}
    >
      <h6>Select Sub Department</h6>

      {subDeptList.map((id) => (
        <div key={id}>
          <input
            type="checkbox"
            checked={selectedSubDept.includes(Number(id))}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedSubDept([...selectedSubDept, Number(id)]);
              } else {
                setSelectedSubDept(
                  selectedSubDept.filter((x) => x !== Number(id)),
                );
              }
            }}
          />
          <label className="ms-2">{depMap[id]}</label>
        </div>
      ))}

      <div className="mt-3 d-flex justify-content-end gap-2">
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setShowSubDeptPopup(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-sm btn-primary"
          onClick={() => handleDepPrint(selectedSubDept)}
        >
          Print
        </button>
      </div>
    </div>
  </div>
)} */}
      {console.log("Grouped tests: ", groupedTests)}
      {/* {console.log("Grouped tests: ",groupedTests)} */}
      {showSubDeptPopup && (
        <SubDeptSelector
          groupedTests={groupedTests}
          selectedSubDept={selectedSubDept}
          setSelectedSubDept={setSelectedSubDept}
          depMap={depMap}
          onClose={() => setShowSubDeptPopup(false)}
          onPrint={() => handleDepPrint(selectedSubDept)}
        />
      )}

      {dWorkTests.length != 0 && (
        <DepartmentModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          tests={dWorkTests}
        />
      )}
    </div>
  );
};

export default CaseEntry;
