import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Barcode from "react-barcode";
import axios from "axios";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance";

const CaseEntryForm = () => {
  const { id, Modex } = useParams();
  const orgId = decodeURIComponent(id);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const [mode, setMode] = useState("create"); // 'view', 'edit', 'create'
  const [mode, setMode] = useState(Modex);

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
    PatientS: "",
    CaseTime: "",
    CaseDate: "",
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
    AgeType: "",
    Sex: "",
    AgentId: "",
    DoctorId: "",
    BookingId: "",
    UserId: "",
    DeliveryDate: "",
    OnDelivery: "",
    AfterDelivery: "",
    Total: "",
    ServiceChg: "",
    Desc: "",
    DescAmt: "",
    Amount: "",
    GrossAmt: "",
    CTestAmt: "",
    Balance: "",
    PaymentType: "",
    CollectorId: "",
    CompanyId: "",
    ReportDate: "",
    PathologistId: "",
    LabId: "",
    BillId: "",
    Advance: "",
    Clearing: "",
    ClearingDate: "",
    Remarks: "",
    CancelTest: "",
    CancelDate: "",
    CancelR: "",
    PathologistId1: "",
    PathologistId2: "",
    PathologistId3: "",
    AdmitionYN: "",
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
    PrintYN: "",
  });

  // thess states are only for searching of IPD (admission)
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTest, setSelectedTest] = useState("");

  // these states are only for search of OPD
  const [searchResultsOPD, setSearchResultsOPD] = useState([]);
  const [isSearchingOPD, setIsSearchingOPD] = useState(false);
  const [selectedTestOPD, setSelectedTestOPD] = useState("");

  // this function is only for searching the IPD (Admission)
  const searchTests = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axiosInstance.get(
        `/admissions?page=1&limit=20&search=${encodeURIComponent(searchTerm)}`
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
          searchTerm
        )}`
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
      // console.log("hi:", data);
      if (data.data.success) {
        const arr = data.data.data;
        const newArr = [{ CollectorId: 0, Collector: "--select--" }, ...arr];
        setCollectorData(newArr);
        // console.log("hi: ", doctorData);
      }
    } catch (error) {
      console.log("error fetching doctor:", error);
    }
  };

  const footerActions = [
    { label: "New", variant: "primary", onClick: () => setMode("create") },
    { label: "Edit", variant: "primary", onClick: () => setMode("edit") },
    {
      label: "Save",
      variant: "primary",
      onClick: () => console.log("Saving...", formData),
    },
    { label: "Delete", variant: "primary" },
    { label: "Undo", variant: "primary" },
    { label: "Bill", variant: "primary" },
    { label: "Com Bill", variant: "primary" },
    { label: "Dep Print", variant: "primary" },
    { label: "Exit", variant: "primary", onClick: () => navigate(-1) },
  ];

  useEffect(() => {
    fetchData();
    fetchCompany();
    fetchBooking();
    fetchOPD();
    fetchDoctor();
    fetchCollector();
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

  return (
    <div
      className="container-fluid py-3 px-lg-4"
      style={{ minHeight: "100vh" }}
    >
      <div className="panel shadow-sm">
        {/* ================== HEADER TABS ================== */}
        <div className="panel-header d-flex justify-content-between align-items-center">
          <div className="panel-title fw-bold">Case Entry</div>
          <div className="tabs d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary "
              onClick={() => {
                navigate("/CaseList");
              }}
            >
              List
            </button>

            <button className="btn btn-sm btn-outline-secondary">
              Estimate
            </button>
            <button className="btn btn-sm btn-outline-secondary ">MRD</button>
          </div>
        </div>

        {/* {console.log(orgId)}
        {console.log(Mode)} */}

        <div className="panel-body">
          <div className="row g-3">
            <div className="col-md-9 border-end pe-3">
              <div className="p-2 rounded mb-3">
                <div className="row g-2  small ">
                  <div className="col-md-4">
                    {/* Company */}
                    <label>Company</label>
                    <div className="d-flex gap-1 mb-1">
                      <select
                        disabled={mode === "view"}
                        className="form-select form-select-sm w-25"
                        value={companyYN}
                        onChange={(e) => {
                          setCompanyYN(e.target.value);

                          if (e.target.value === "N") {
                            setFormData((prev) => ({ ...prev, CompanyId: 0 }));
                          }
                        }}
                      >
                        <option value={"Y"}>Y</option>
                        <option value={"N"}>N</option>
                      </select>

                      <select
                        name="CompanyId"
                        className="form-control form-control-sm"
                        value={formData.CompanyId}
                        onChange={handleInputChange}
                        disabled={companyYN === "N"}
                      >
                        {companyData.map((data, index) => (
                          <option key={index} value={data.DescId}>
                            {data.Desc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Booking */}
                    <label>Booking</label>
                    <div className="d-flex gap-1 mb-1">
                      <select
                        disabled={mode === "view"}
                        className="form-select form-select-sm w-25"
                        value={bookingYN}
                        onChange={(e) => {
                          setBookingYN(e.target.value);

                          if (e.target.value === "N") {
                            setFormData((prev) => ({ ...prev, BookingId: 0 }));
                          }
                        }}
                      >
                        <option value={"Y"}>Y</option>
                        <option value={"N"}>N</option>
                      </select>

                      <select
                        name="BookingId"
                        className="form-control form-control-sm"
                        value={formData.BookingId}
                        onChange={handleInputChange}
                        disabled={bookingYN === "N"}
                      >
                        {bookingData.map((data, index) => (
                          <option key={index} value={data.bookingId}>
                            {data.booking}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* indoor */}
                    <label>Indoor</label>
                    <div className="d-flex  gap-1">
                      <select
                        disabled={mode === "view"}
                        name="AdmitionYN"
                        className="form-select form-select-sm w-25"
                        value={formData.AdmitionYN}
                        onChange={(e) => {
                          handleInputChange(e);

                          if (e.target.value === "N") {
                            setFormData((prev) => ({ ...prev, AdmitionId: 0 }));
                          }
                        }}
                      >
                        <option value={"Y"}>Y</option>
                        <option value={"N"}>N</option>
                      </select>

                      {/* {console.log("this is mode: ", useParams())} */}
                      {/* {console.log("this is IPD Value: ", selectedTest)} */}
                      {mode === "view" ? (
                        <input
                          disabled={mode === "view"}
                          type="text"
                          className="form-control form-control-sm"
                          value={selectedTest?.label}
                        />
                      ) : (
                        <Select
                          value={selectedTest}
                          onChange={setSelectedTest}
                          onInputChange={(inputValue) => {
                            searchTests(inputValue);
                          }}
                          options={searchResults.map((item) => ({
                            value: item.AdmitionId,
                            label: `${item.PatientName} (${item.AdmitionNo})`,
                          }))}
                          placeholder="Type to search Indoor..."
                          isSearchable
                          isClearable
                          isLoading={isSearching}
                          noOptionsMessage={({ inputValue }) =>
                            inputValue.length < 2
                              ? "Type at least 2 characters"
                              : "No admission found"
                          }
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            container: (base) => ({
                              ...base,
                              flex: 1,
                              minWidth: 0,
                            }),
                            control: (base) => ({
                              ...base,
                              minHeight: "32px",
                              fontSize: "14px",
                            }),
                            singleValue: (base) => ({
                              ...base,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 10000,
                            }),
                          }}
                        />
                      )}
                    </div>

                    {/* OPD */}
                    <label>OPD</label>
                    <div className="d-flex mb-1 gap-1">
                      <select
                        disabled={mode === "view"}
                        name="OPDYN"
                        className="form-select form-select-sm w-25"
                        value={formData.OPDYN}
                        onChange={(e) => {
                          handleInputChange(e);

                          if (e.target.value === "N") {
                            setFormData((prev) => ({ ...prev, OPDID: 0 }));
                          }
                        }}
                      >
                        <option value={"Y"}>Y</option>
                        <option value={"N"}>N</option>
                      </select>
                      {/* <select
                        name="OPDID"
                        className="form-control form-control-sm"
                        value={formData.OPDID}
                        onChange={handleInputChange}
                        disabled={formData.OPDYN === "N" || mode === "view"}
                      >
                        {opdData.map((data, index) => (
                          <option key={index} value={data.opdId}>
                            {data.opdValue}
                          </option>
                        ))}
                      </select> */}

                      {/* {console.log("this is OPD Value: ", selectedTestOPD)} */}
                      {mode === "view" ? (
                        <input
                          disabled={mode === "view"}
                          type="text"
                          className="form-control form-control-sm"
                          value={selectedTestOPD?.label}
                        />
                      ) : (
                        <Select
                          value={selectedTestOPD}
                          onChange={setSelectedTestOPD}
                          onInputChange={(inputValue) => {
                            searchTestsOPD(inputValue);
                          }}
                          options={searchResultsOPD.map((item) => ({
                            value: item.RegistrationId,
                            label: `${item.PatientName} (${item.RegistrationNo})`,
                          }))}
                          placeholder="Type to search Outdoor..."
                          isSearchable
                          isClearable
                          isLoading={isSearchingOPD}
                          noOptionsMessage={({ inputValue }) =>
                            inputValue.length < 2
                              ? "Type at least 2 characters"
                              : "No admission found"
                          }
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            container: (base) => ({
                              ...base,
                              flex: 1,
                              minWidth: 0,
                            }),
                            control: (base) => ({
                              ...base,
                              minHeight: "32px",
                              fontSize: "14px",
                            }),
                            singleValue: (base) => ({
                              ...base,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 10000,
                            }),
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="col-md-5 border-start ps-1">
                    {/* time and date*/}
                    <div className="d-flex gap-1 mb-1">
                      <div>
                        <span>Time</span>
                        <input
                          name="CaseTime"
                          type="time-p"
                          className="form-control form-control-sm"
                          value={formData.CaseTime?.trim()}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <span>Date</span>
                        <input
                          name="CaseDate"
                          type="date"
                          className="form-control form-control-sm"
                          onChange={handleInputChange}
                          value={formData.CaseDate?.slice(0, 10)}
                        />
                      </div>
                    </div>

                    {/* case no */}
                    <span>Case No</span>
                    <input
                      disabled={mode === "view"}
                      name="CaseNo"
                      value={formData.CaseNo}
                      onChange={handleInputChange}
                      type="text"
                      className="form-control form-control-sm"
                      readOnly
                    />

                    <div className="d-flex gap-1 mb-1">
                      <div>
                        <span>Received By</span>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          name="ValueEntryBy"
                          onChange={handleInputChange}
                          value={formData.ValueEntryBy}
                        />
                      </div>

                      <div>
                        <span>Current User</span>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={"Admin"}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-1 mb-1">
                      <input type="checkbox" className="" />
                      <label>New UID</label>
                    </div>
                  </div>

                  <div className="col-md-3 border-start ps-3">
                    {/* clear date */}
                    <span>Clear Date</span>
                    <input
                      name="ClearingDate"
                      value={formData.ClearingDate?.slice(0, 10)}
                      onChange={handleInputChange}
                      type="date"
                      className="form-control form-control-sm mb-2"
                    />

                    {/* sample no */}
                    <span>Sample ID</span>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                    />

                    {/* slip no */}
                    <span>Slip No</span>
                    <input
                      name="SlipNo"
                      value={formData.SlipNo}
                      onChange={handleInputChange}
                      type="text"
                      className="form-control form-control-sm mb-2"
                    />
                  </div>
                </div>
              </div>

              <div className="row g-2 small mb-3">
                <div className="col-md-6">
                  <label>Card No (For Cardno list F1)</label>
                  <div className="d-flex gap-2 mb-1 ">
                    <input
                      name="CardNo"
                      value={formData.CardNo}
                      onChange={handleInputChange}
                      type="text"
                      className="form-control form-control-sm"
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                    />
                    <button className="btn btn-outline-secondary">Ph?</button>
                    <button className="btn btn-outline-secondary">Name?</button>
                  </div>

                  <label>Card Expiary Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm mb-1"
                  />

                  <label>Patient Name</label>
                  <div className="d-flex gap-2 mb-1 ">
                    <select
                      name="PPr"
                      value={formData.PPr}
                      onChange={handleInputChange}
                      className="form-select form-select-sm w-25"
                    >
                      <option value={""}>---</option>
                      <option value={"MAST"}>Mast.</option>
                      <option value={"MISS"}>Miss.</option>
                      <option value={"MR"}>Mr.</option>
                      <option value={"MRS"}>Mrs.</option>
                    </select>
                    <input
                      name="PatientName"
                      value={formData.PatientName}
                      onChange={handleInputChange}
                      type="text"
                      className="form-control form-control-sm"
                    />
                    {`"`}
                  </div>

                  <label>Age</label>
                  <div className="d-flex gap-2 mb-1">
                    <input
                      name="Age"
                      type="text"
                      className="form-control form-control-sm w-25"
                      value={formData.Age}
                      onChange={handleInputChange}
                    />
                    <select
                      name="AgeType"
                      value={formData.AgeType}
                      onChange={handleInputChange}
                      className="form-select form-select-sm w-25"
                    >
                      <option value={""}>---</option>
                      <option value={"Y"}>Y</option>
                      <option value={"M"}>M</option>
                      <option value={"D"}>D</option>
                    </select>
                    {`"`}

                    <input
                      name="AgeD"
                      type="text"
                      className="form-control form-control-sm w-25"
                      value={formData.AgeD}
                      onChange={handleInputChange}
                    />
                    <select
                      name="AgeTypeD"
                      value={formData.AgeTypeD}
                      onChange={handleInputChange}
                      className="form-select form-select-sm w-25"
                    >
                      <option value={""}>---</option>
                      <option value={"Y"}>Y</option>
                      <option value={"M"}>M</option>
                      <option value={"D"}>D</option>
                    </select>
                    {`"`}

                    <label className="ms-2">Sex:</label>
                    <select
                      className="form-select form-select-sm w-25"
                      name="Sex"
                      value={formData.Sex}
                      onChange={handleInputChange}
                    >
                      <option value={""}>--</option>
                      <option value={"M"}>M</option>
                      <option value={"F"}>F</option>
                      <option value={"T"}>T</option>
                    </select>
                  </div>

                  <div className="d-flex gap-1 ">
                    <div>
                      <label>Mobile No.</label>
                      <div className="d-flex mb-2 gap-2">
                        <input
                          name="MobileNo"
                          value={formData.MobileNo}
                          onChange={handleInputChange}
                          type="tel"
                          maxLength={10}
                          className="form-control form-control-sm"
                        />
                        {` " `}
                      </div>
                    </div>
                    <div>
                      <label>C/O Phone</label>
                      <div className="d-flex mb-2 gap-2">
                        <input
                          name="Phone"
                          value={formData.Phone}
                          onChange={handleInputChange}
                          type="tel"
                          maxLength={10}
                          className="form-control form-control-sm"
                        />
                        {` " `}
                      </div>
                    </div>
                  </div>
                  <label>e-mail</label>
                  <input
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    type="email"
                    className="form-control form-control-sm"
                  />

                  <label className="mt-1">Husband Name</label>
                  <input type="text" className="form-control form-control-sm" />
                </div>
                <div className="col-md-5">
                  <label>P Id</label>
                  <div className="d-flex gap-2 mb-1 align-items-center">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                    />
                  </div>
                  <label>Address</label>
                  <div className="d-flex gap-1 mb-1">
                    <input
                      name="Add1"
                      value={formData.Add1}
                      onChange={handleInputChange}
                      type="text"
                      className="form-control form-control-sm"
                    />
                    {`"`}
                  </div>
                  <input
                    name="Add2"
                    value={formData.Add2}
                    onChange={handleInputChange}
                    type="text"
                    className="form-control form-control-sm mb-1"
                  />{" "}
                  <input
                    name="Add3"
                    value={formData.Add3}
                    onChange={handleInputChange}
                    type="text"
                    className="form-control form-control-sm mb-1"
                  />
                  <label>Due on A/C</label>
                  <input type="text" className="form-control form-control-sm" />
                  <label className="mt-2">Notes</label>
                  <input type="text" className="form-control form-control-sm" />
                  <div className="d-flex gap-2 mt-1">
                    <div>
                      <label>No of Child(M)</label>

                      <input
                        name="CHM"
                        value={formData.CHM}
                        onChange={handleInputChange}
                        type="number"
                        className="form-control form-control-sm"
                      />
                    </div>
                    <div>
                      <label>No of Child(M)</label>

                      <input
                        name="CHF"
                        value={formData.CHF}
                        onChange={handleInputChange}
                        type="number"
                        className="form-control form-control-sm"
                      />
                    </div>
                  </div>
                  <div className="d-flex mt-2 gap-1">
                    <input type="checkbox" />
                    <label>Report Upload on Portal</label>
                  </div>
                </div>
                <div className="col-md-1">
                  <div className="d-flex gap-1 mb-2">
                    <input type="checkbox" />
                    <label>All</label>
                  </div>
                  <button className="btn btn-sm btn-primary small mb-2">
                    Details
                  </button>
                  <button className="btn btn-sm btn-danger mb-2 small">
                    Cancel Test
                  </button>
                </div>
              </div>

              <div className="row g-2 small mb-3">
                <div className="col-md-5">
                  <label>Branch Name</label>
                  <div className="d-flex gap-1">
                    <select className="form-control form-control-sm">
                      <option>--</option>
                      <option>Y</option>
                      <option>N</option>
                    </select>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <label>Doctor Name</label>
                  <select
                    name="DoctorId"
                    className="form-control form-control-sm"
                    value={formData.DoctorId}
                    onChange={handleInputChange}
                  >
                    {doctorData.map((item, index) => (
                      <option key={index} value={item.DoctorId}>
                        {item.Doctor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <div></div>
                  <div className="d-flex gap-1">
                    <input
                      name="req"
                      type="checkbox"
                      checked={Number(formData.req) === 1}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        // console.log("checked:", checked);

                        setFormData((prev) => ({
                          ...prev,
                          req: checked ? 1 : 0,
                        }));
                      }}
                    />
                    <label>Requisition "</label>
                  </div>

                  <div className="d-flex gap-1">
                    <input type="checkbox" />
                    <label>O.S "</label>
                  </div>
                </div>
              </div>
              {/* Test Selection Table Area */}
              <div
                className="row g-0 border rounded mb-3"
                style={{ height: "250px" }}
              >
                {/* LEFT TABLE WITH SCROLL */}
                <div
                  className="col-md-7 p-0"
                  style={{ height: "100%", overflowY: "auto" }}
                >
                  <table className="table table-sm table-bordered small mb-0">
                    <thead>
                      <tr>
                        <th>Pr</th>
                        <th>Test Name</th>
                        <th>Rate</th>
                        <th>Delivery Date</th>
                        <th>Delivery Time</th>
                        <th>Delivery Time</th>
                        <th>Net Rate</th>
                        <th>isDisc</th>
                        <th>Type</th>
                        <th>.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 20 }).map((_, i) => (
                        <tr key={i}>
                          <td>N</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RIGHT PANEL WITH SCROLL */}
                <div
                  className="col-md-5 p-2 border-start"
                  style={{ height: "100%", overflowY: "auto" }}
                >
                  <button className="btn btn-sm btn-success small mb-2">
                    Test Master
                  </button>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Total</span>
                    <input
                      name="Total"
                      value={formData.Total}
                      onChange={handleInputChange}
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>GST</span>
                    <input
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Collection Chg.</span>
                    <input
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Discount</span>
                    <input
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Amount</span>
                    <input
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Patient Disc</span>
                    <input
                    name="PatientDisc"
                    value={formData.PatientDisc}
                    onChange={handleInputChange}
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Cancel Test Amount</span>
                    <input
                    name="CancelTest"
                    value={formData.CancelTest}
                    onChange={handleInputChange}
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Adv</span>
                    <input
                      name="Advance"
                      value={formData.Advance}
                      onChange={handleInputChange}
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>G Total</span>
                    <input
                      name="GrossAmt"
                      value={formData.GrossAmt}
                      onChange={handleInputChange}
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Receipt Amt</span>
                    <input
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>Balance</span>
                    <input
                      name="Balance"
                      value={formData.Balance}
                      onChange={handleInputChange}
                      type="number"
                      className="form-control form-control-sm w-50 text-end"
                    />
                  </div>

                  <div className="small mb-2">
                    <div>[C]ash / C[R]edit / [B]ank</div>
                    <div>Card / [P] Complementary</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <label className="mb-0">Payment Mode</label>
                    <select
                    name="PaymentType"
                    value={formData.PaymentType}
                    onChange={handleInputChange}
                    className="form-control form-control-sm w-50">
                      <option value={""}>--</option>
                      <option value={"C"}>C</option>
                      <option value={"R"}>R</option>
                      <option value={"B"}>B</option>
                      <option value={"D"}>D</option>
                      <option value={"W"}>W</option>
                      <option value={"F"}>F</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 small">
                    <label className="mb-0">Col Dt</label>
                    <input
                      name="CollDt"
                      value={formData.CollDt?.slice(0, 10)}
                      onChange={handleInputChange}
                      type="date"
                      className="form-control form-control-sm w-50"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center small">
                    <label className="mb-0">Col Time</label>
                    <input
                      name="CollTime"
                      value={formData.CollTime}
                      onChange={handleInputChange}
                      type="time"
                      className="form-control form-control-sm w-50"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Narration */}
              <div className="d-flex align-items-center gap-2 small">
                <span className="bg-success text-white px-2 rounded">
                  Receipt Detail
                </span>
                <label>Narration</label>
                <input
                  name="Narration"
                  value={formData.Narration}
                  onChange={handleInputChange}
                  type="text"
                  className="form-control form-control-sm flex-grow-1"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar & Barcode */}
            <div className="col-md-3">
              <div className="border bg-white p-2 text-center mb-3 rounded shadow-sm">
                <Barcode
                  value={formData.CaseNo}
                  height={40}
                  width={1}
                  fontSize={12}
                />
                <div className="small fw-bold mt-1">Test Instruction</div>
              </div>

              <div className="bg-primary text-white p-2 rounded mb-3 small opacity-75">
                <div>** → Mandatory Field</div>
                <div>PH? → Phone Search</div>
                <div>Name? → Patient Name Search</div>
              </div>

              <div className="mb-3 small">
                <label>Collector </label>
                <select
                  name="CollectorId"
                  className="form-control form-control-sm"
                  value={formData.CollectorId}
                  onChange={handleInputChange}
                >
                  {collectorData.map((item, index) => (
                    <option key={index} value={item.CollectorId}>
                      {item.Collector}
                    </option>
                  ))}
                </select>

                <label>Area</label>
                <input
                  name="Area"
                  value={formData.Area}
                  onChange={handleInputChange}
                  type="text"
                  className="form-control form-control-sm"
                />
              </div>

              {/* Service Table */}
              <div
                className="border rounded mb-2"
                style={{
                  height: "120px",
                  overflowY: "auto", // ✅ vertical + horizontal
                }}
              >
                <table
                  className="table table-sm small mb-0"
                  style={{ minWidth: "400px" }} // ✅ force horizontal scroll
                >
                  <thead>
                    <tr>
                      <th>Service Type</th>
                      <th>Service Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        <td>Service {i + 1}</td>
                        <td>{100 + i}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <input
                type="number"
                className="form-control fomr-control-sm mb-2"
              />

              {/* Barcode Print Utility */}
              <div className="border p-2 rounded">
                <div className="text-danger fw-bold small border-bottom mb-2">
                  BarCode Print
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="small">No of Copy</span>
                  <input
                    type="number"
                    className="form-control form-control-sm w-25"
                  />
                  <button className="btn btn-sm btn-warning fw-bold">
                    BarCode Print
                  </button>
                </div>
              </div>
              <div className="form-check mt-2 small">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="duePrint"
                />
                <label className="form-check-label ms-1" htmlFor="duePrint">
                  Due Bill Print
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ================== FOOTER ACTIONS ================== */}
        <div className="panel-footer d-flex flex-wrap gap-1 p-2 border-top">
          {footerActions.map((btn, i) => (
            <button
              key={i}
              className={`btn btn-sm btn-${btn.variant} px-3`}
              onClick={btn.onClick}
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                fontWeight: "600",
              }}
            >
              {btn.label}
            </button>
          ))}
          <div className="ms-auto d-flex gap-1">
            <button
              className="btn btn-sm btn-secondary"
              style={{ fontSize: "11px" }}
            >
              Work Sheet
            </button>
            <button
              className="btn btn-sm btn-secondary"
              style={{ fontSize: "11px" }}
            >
              D-Work Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseEntryForm;
