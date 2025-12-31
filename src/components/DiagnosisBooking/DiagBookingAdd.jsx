import React, { useEffect, useState } from "react";
import Footer from "../../components/footer/Footer";
import { useNavigate, useParams } from "react-router-dom";
import axios, { all } from "axios";
import axiosInstance from "../../axiosInstance";
import Select from "react-select";
import { use } from "react";
import { ta } from "date-fns/locale";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { toast } from "react-toastify";

const DiagBookingAdd = () => {
  let { id, mode } = useParams();
  id = decodeURIComponent(id);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Add1: "",
    Add2: "",
    Add3: "",
    Age: "",
    AgeType: "",
    AgentId: "",
    BookingDate: new Date(Date.now()).toISOString().slice(0, 10),
    BookingFor: new Date(Date.now()).toISOString().slice(0, 10),
    BookingId: "",
    BookingNo: "",
    BookingP: "",
    BookingS: "",
    BookingTime: new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    }),
    BTime:  new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    }),
    CancelBookig: "",
    CancelDate: "",
    CancelR: "",
    CardNo: "",
    CashBank: "",
    CollectorId: "",
    CompanyId: "",
    DiscAmt: "",
    DiscP: "",
    DoctorId: "",
    GTotal: "",
    LabId: "",
    m_CompanyId: "",
    OPDRegNo: "",
    PatientName: "",
    Phone: "",
    PPr: "",
    Receipt: "",
    Remarks: "",
    ServiceCh: "",
    Sex: "",
    Total: "",
    UserId: "",
    bookingDetails: [],
  });
  const [bookingDtlMap, setBookingDtlMap] = useState([]);
  // these states are only for search of OPD
  const [searchResultsOPD, setSearchResultsOPD] = useState([]);
  const [isSearchingOPD, setIsSearchingOPD] = useState(false);
  const [selectedTestOPD, setSelectedTestOPD] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [allLab, setAllLab] = useState([]);
  const [testNameMap, setTestNameMap] = useState({});

  const [bookingDtlForm, setBookingDtlForm] = useState({
    TestId: "",
    Rate: "",
    Profile: "N",
  });

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState(mode); // 'add', 'edit', 'view'

  const [selectedTestMaster, setSelectedTestMaster] = useState(null);
  const [testSearchResults, setTestSearchResults] = useState([]);
  const [isSearchingTest, setIsSearchingTest] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);

  const [userMap, setUserMap] = useState([]);
  const [agentsMap, setAgentsMap] = useState([]);

  const [companyMap, setCompanyMap] = useState([]);

  const [agentYN, setAgentYN] = useState("N");
  const [companyYN, setCompanyYN] = useState("N");
  const [opdYN, setOpdYN] = useState("N");
  const [opdData, setOpdData] = useState({});

  // Search tests
  const searchTestMaster = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setTestSearchResults([]);
      return;
    }
    setIsSearchingTest(true);
    try {
      const res = await axiosInstance.get(
        `/tests/search/advanced?test=${encodeURIComponent(
          searchTerm
        )}&page=1&limit=50`
      );
      setTestSearchResults(res.data.data || []);
    } catch (err) {
      console.error("Test search error:", err);
      setTestSearchResults([]);
    } finally {
      setIsSearchingTest(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Name: ${name} and Value: ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //   const fetchBookings = async () => {
  //     try {
  //       // const res = await axiosInstance.get(`/bookings?page=1`);
  //       const res = await axiosInstance.get(`/bookings/${id}`);
  //       const data = res.data.booking;

  //       setFormData(data);
  //       console.log("data: ", data);

  //       if (data.AgentId && data.AgentId != 0) {
  //         setAgentYN("Y");
  //       }
  //       if (data.CompanyId && data.CompanyId != 0) {
  //         setCompanyYN("Y");
  //       }

  //       // if opd presenet in fetched form data
  //       if (data.OPDRegNo) {
  //         const opd = await axiosInstance.get(`/patient-visits?page=1
  // &limit=20&registrationId=${formData.OPDRegNo}`);

  //         if (opd.data.success) {
  //           const value = opd.RegistrationId;
  //           const label = `${opd.PatientName} (${opd.RegistrationNo})`;
  //           setSearchResultsOPD({ value, label });
  //         }
  //       }
  //     } catch (error) {
  //       console.log("Error fetching bookings: ", error);
  //     }
  //   };

  // this function is for fetching booking details
  //   const fetchBookingDtl = async () => {
  //     try {
  //       const res = await axiosInstance.get(`/booking-details/booking/${id}`);
  //       setBookingDtlMap(res.data.data);
  //       console.log("dtl data: ", res.data.data);
  //       fetchTestNames(res.data.data);
  //       const totalRate = res.data.data.reduce(
  //         (sum, item) => sum + Number(item.Rate || 0),
  //         0
  //       );
  //       console.log("Total Rate calculated: ", totalRate);
  //       setFormData((prev) => ({
  //         ...prev,
  //         Total: totalRate.toFixed(2),
  //       }));
  //     } catch (error) {
  //       console.log("Error fetching booking dtl: ", error);
  //     }
  //   };

  //   fetch test names for booking details
  const fetchTestNames = async (bookingDetails) => {
    try {
      // unique TestIds
      const testIds = [...new Set(bookingDetails.map((i) => i.TestId))];

      const responses = await Promise.all(
        testIds.map((id) => axiosInstance.get(`/tests/${id}`))
      );

      const map = {};
      responses.forEach((res) => {
        const t = res.data?.data;
        if (t) map[t.TestId] = t.Test;
      });
      console.log("Test Name Map: ", map);
      setTestNameMap(map);
    } catch (err) {
      console.log("Error fetching test names", err);
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

  const fetchLabs = async () => {
    try {
      let res = await axiosInstance.get("/lab?page=1&limit=1");
      if (res.data.success) {
        const limit = res.data.pagination.totalRecords;
        res = await axiosInstance.get(`/lab??page=1&limit=${limit}`);
        const data = res.data.success ? res.data.data : [];
        if (data.length != 0) {
          const arr = [{ LabId: 0, Lab: "---" }, ...data];
          setAllLab(arr);
          return;
        }
        setAllLab(data);
        console.log("Lab data: ", data);
      }
    } catch (error) {
      console.log("error fetching lab: ", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      let res = await axiosInstance.get("/doctors");
      if (res.data.success) {
        const data = res.data.success ? res.data.data : [];
        const arr = [{ DoctorId: 0, Doctor: "---" }, ...data];
        setAllDoctors(arr);
        // console.log("Doctors data: ", data);
      }
    } catch (error) {
      console.log("error fetching doctors: ", error);
    }
  };

  const fetchUsers = async () => {
    try {
      let res = await axiosInstance.get("/auth/users");
      if (res.data.success) {
        const data = res.data.success ? res.data.data : [];
        const arr = [{ UserId: 0, UserName: "---" }, ...data];

        setUserMap(arr);
        console.log("Users data: ", data);
      }
    } catch (error) {
      console.log("error fetching users: ", error);
    }
  };

  const fetchAgents = async () => {
    try {
      let res = await axiosInstance.get("/agents?page=1&limit=647");
      if (res.data.success) {
        const data = res.data.success ? res.data.data : [];
        const arr = [{ AgentId: 0, Agent: "---" }, ...data];
        setAgentsMap(arr);
        console.log("Agents data: ", data);
      }
    } catch (error) {
      console.log("error fetching agents: ", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      let res = await axiosInstance.get("/acgenled?partyType=D");
      if (res.data.success) {
        const data = res.data.success ? res.data.data : [];
        const arr = [{ DescId: 0, Desc: "---" }, ...data];
        setCompanyMap(arr);
        console.log("Companies data: ", data);
      }
    } catch (error) {
      console.log("error fetching companies: ", error);
    }
  };

  const submitBookingDtlForm = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        console.log("Submitting Add Booking Dtl Form: ", bookingDtlForm);
        // const res = await axiosInstance.post(
        //   `/booking-details`,
        //   bookingDtlForm
        // );

        setFormData((prev) => ({
          ...prev,
          bookingDetails: [...prev.bookingDetails, bookingDtlForm],
        }));

        setSelectedTestMaster("");
        // console.log("Add Booking Dtl Response: ", res.data);
        // toast.success(res.data.message);
      } else if (modalType === "edit") {
        // const res = await axiosInstance.put(
        //   `/booking-details/${id}/${bookingDtlForm.TestId}`,
        //   bookingDtlForm
        // );
        // console.log("Edit Booking Dtl Response: ", res.data);
        // toast.success(res.data.message);
      }
      setShowDrawer(false);
      //   fetchBookingDtl();
    } catch (error) {
      console.log("Error submitting booking dtl form: ", error);
    }
  };

  const handleDelete = async () => {
    try {
      //   const res = await axiosInstance.delete(
      //     `/booking-details/${id}/${selectedId}`
      //   );
      // const filtered = bookingDtlMap.filter(
      //   (item) => item.TestId === selectedId
      // );
      // setFormData((prev) => ({
      //   ...prev,
      //   Total: (Number(prev.Total) - Number(filtered[0].Rate)).toFixed(2),
      // }));

      const data = formData.bookingDetails;

      const testIdToDelete = selectedId;

      const updatedData = data.filter((item) => item.TestId !== testIdToDelete);

      setFormData((prev) => ({
        ...prev,
        bookingDetails: updatedData,
      }));

      //   toast.success(res.data.message);
      //   fetchBookingDtl();
      setSelectedId("");
    } catch (err) {
      //   console.error("Delete booking dtl error:", err);
      // toast.error("Failed to delete Health Card record.");
    }
    setShowConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting Booking Form: ", formData);
      const res = await axiosInstance.post(`/bookings`, formData);
      console.log("Booking Form Response: ", res.data);
      toast.success(res.data.message);
      navigate("/DiagBookingList");
    } catch (error) {
      console.log("Error submitting booking form: ", error);
    }
  };

  // fetch opd data
  const fetchOpdData = async (id) => {
    try {
      const res = await axiosInstance.get(
        `patient-visits/registration?registrationId=${id}`
      );

      if (res.data.success) {
        const data = res.data.data[0] ? res.data.data[0] || {} : {};
        console.log("OPD data fetch data: ", data);
        setOpdData(data);
        const ppr = data.PPr;
        switch (ppr) {
          case "Mast.":
            data.PPr = "MAST";
            break;
          case "Miss.":
            data.PPr = "MISS";
            break;
          case "Mr.":
            data.PPr = "MR";
            break;
          case "Mrs.":
            data.PPr = "MRS";
            break;
          default:
            data.PPr = "";
        }

        setFormData((prev) => ({
          ...prev,
          Age: data.Age,
          AgeType: data.AgeType,
          OPDRegNo: data.RegistrationId,
          PatientName: data.PatientName,
          Phone: data.PhoneNo,
          PPr: data.PPr,
          Sex: data.Sex,
        }));
      }
    } catch (error) {
      console.log("Error fetching OPD data: ", error);
    }
  };

  useEffect(() => {
    // fetchBookings();
    // fetchBookingDtl();
    fetchLabs();
    fetchDoctors();
    fetchUsers();
    fetchAgents();
    fetchCompanies();
  }, []);

  useEffect(() => {
    const id = selectedTestOPD?.value;
    if (id) {
      setFormData((prev) => ({
        ...prev,
        OPDRegNo: id,
      }));
      console.log("OPD changed", selectedTestOPD);
      fetchOpdData(id);
    }
  }, [selectedTestOPD]);

  useEffect(() => {
    const cal =
      Number(formData.Total) +
      Number(formData.ServiceCh) -
      Number(formData.DiscAmt);
    console.log("calculated gtotal: ", cal);
    setFormData((prev) => ({
      ...prev,
      GTotal: cal.toFixed(2),
    }));
  }, [formData.Total, formData.ServiceCh, formData.DiscAmt]);

  useEffect(() => {
    console.log("Selected Test Master changed: ", selectedTestMaster);
    if (selectedTestMaster) {
      setBookingDtlForm((prev) => ({
        ...prev,
        TestId: selectedTestMaster.value,
        Rate: selectedTestMaster.Rate,
      }));
    } else {
      setBookingDtlForm((prev) => ({
        ...prev,
        TestId: "",
        Rate: "",
      }));
    }
  }, [selectedTestMaster]);

  useEffect(() => {
    fetchTestNames(formData.bookingDetails);

    console.log("Form Data Booking Details changed: ", formData);
    const totalRate = formData.bookingDetails.reduce(
      (sum, item) => sum + Number(item.Rate || 0),
      0
    );

    console.log("Total Rate calculated: ", totalRate);
    setFormData((prev) => ({
      ...prev,
      Total: totalRate.toFixed(2),
    }));
  }, [formData.bookingDetails]);

  return (
    <div className="main-content">
      {/* Header Design from Table.jsx */}
      <div className="panel-header d-flex justify-content-between align-items-center p-2 mb-2">
        <h5>Booking</h5>
        <button
          className="btn btn-secondary"
          onClick={() => {
            navigate("/DiagBookingList");
          }}
        >
          List
        </button>
      </div>

      <div
        className="panel p-2 bg-neutral-50"
        style={{ border: "1px solid #7F9DB9", borderRadius: "0" }}
      >
        {/* TOP SECTION: CASE INFO */}
        <div className="row g-1 mb-2">
          <div className="col-md-9">
            <div className="row g-2 align-items-center">
              <div className="col-md-2">
                <label>OPD</label>
                <div className="row">
                  <select
                    className="form-control form-control-sm"
                    value={opdYN}
                    onChange={(e) => {
                      setOpdYN(e.target.value);
                      if (e.target.value === "N") {
                        setSelectedTestOPD(null);
                        setFormData((prev) => ({
                          ...prev,
                          OPDRegNo: "",
                        }));
                      }
                    }}
                  >
                    <option value={"N"}>N</option>
                    <option value={"Y"}>Y</option>
                  </select>
                  {mode === "add" && (
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

                {mode !== "add" && (
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    name="OPDRegNo"
                    value={formData.OPDRegNo}
                    onChange={handleChange}
                  />
                )}
              </div>

              <div className="col-md-2">
                <label>Date</label>
                <input
                  name="BookingDate"
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.BookingDate?.split("T")[0]}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label>Time</label>
                <input
                  name="BookingTime"
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.BookingTime}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

              {/* case no. er field khuje parchina */}
              {/* <div className="col-md-3">
                <label>Case No. (field khuje pachina)</label>
                <input type="text" className="form-control form-control-sm" />
              </div> */}
              <div className="col-md-3">
                <label>Card No</label>
                <input
                  name="CardNo"
                  onChange={handleChange}
                  value={formData.CardNo}
                  type="text"
                  className="form-control form-control-sm"
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>
          <div className="col-md-3 border-start ps-2">
            <label>Booking For</label>
            <input
              type="text"
              name="BookingFor"
              value={formData.BookingFor.split("T")[0]}
              onChange={handleChange}
              className="form-control form-control-sm mb-1"
              disabled={mode === "view"}
            />
            <label>Booking Time</label>
            <input
              type="text"
              name="BTime"
              value={formData.BTime}
              onChange={handleChange}
              className="form-control form-control-sm"
              disabled={mode === "view"}
            />
          </div>
        </div>

        {/* PATIENT / BOOKING INFO */}
        <div className="row g-2 mb-2">
          <div className="col-md-8">
            <div className="panel border p-2 mb-2">
              <div className="row g-2">
                <div className="col-md-4">
                  <label>Booking No</label>
                  <input
                    name="BookingNo"
                    value={formData.BookingNo}
                    onChange={handleChange}
                    type="text"
                    className="form-control form-control-sm bg-neutral-200"
                    disabled={mode === "view"}
                  />
                </div>
                <div className="col-md-8">
                  <label className="">Patient Name</label>
                  <div className="d-flex gap-1">
                    <select
                      name="PPr"
                      value={formData.PPr}
                      onChange={handleChange}
                      className="form-select form-select-sm"
                      style={{ width: "70px" }}
                      disabled={mode === "view"}
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
                      className="form-control form-control-sm"
                      disabled={mode === "view"}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label>Age</label>
                  <div className="d-flex gap-1">
                    <input
                      type="text"
                      name="Age"
                      value={formData.Age}
                      onChange={handleChange}
                      className="form-control form-control-sm"
                      disabled={mode === "view"}
                    />
                    <select
                      className="form-control form-control-sm"
                      value={formData.AgeType}
                      name="AgeType"
                      onChange={handleChange}
                      disabled={mode === "view"}
                    >
                      <option value={""}>---</option>
                      <option value={"Y"}>Y</option>
                      <option value={"M"}>M</option>
                      <option value={"D"}>D</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <label>Sex</label>
                  <select
                    className="form-control form-control-sm"
                    value={formData.Sex}
                    name="Sex"
                    onChange={handleChange}
                    disabled={mode === "view"}
                  >
                    <option value={""}>---</option>
                    <option value={"M"}>M</option>
                    <option value={"F"}>F</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    maxLength={10}
                    value={formData.Phone}
                    name="Phone"
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>
                <div className="col-md-12">
                  <label>Address</label>
                  <input
                    className="form-control form-control-sm"
                    style={{ height: "40px", resize: "none" }}
                    type="text"
                    name="Add1"
                    value={formData.Add1}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                  <input
                    className="form-control form-control-sm"
                    style={{ height: "40px", resize: "none" }}
                    type="text"
                    name="Add2"
                    value={formData.Add2}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                  <input
                    className="form-control form-control-sm"
                    style={{ height: "40px", resize: "none" }}
                    type="text"
                    name="Add3"
                    value={formData.Add3}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>
              </div>
            </div>

            {/* TEST LIST GRID */}
            <div
              className="bg-neutral-800"
              style={{
                height: "180px",
                border: "1px solid #000",
                overflowY: "scroll",
              }}
            >
              <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                {mode !== "view" && (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setShowDrawer(true);
                      setModalType("add");
                      setBookingDtlForm((prev) => ({
                        ...prev,
                        TestId: "",
                        Rate: "",
                        Profile: "N",
                      }));
                    }}
                  >
                    Add Test
                  </button>
                )}
              </div>
              <table
                className="table table-sm table-bordered mb-0"
                style={{ fontSize: "11px", color: "#fff" }}
              >
                <thead className="bg-neutral-600 text-white">
                  <tr>
                    {mode !== "view" && <th>Action</th>}
                    <th>SL No.</th>
                    <th style={{ width: "40px" }}>Pr</th>
                    <th>Test Name</th>
                    <th style={{ width: "100px" }}>Rate</th>
                  </tr>
                </thead>

                {formData.bookingDetails.length === 0 ? (
                  <tbody>
                    <td>No data available</td>
                  </tbody>
                ) : (
                  <tbody>
                    {formData.bookingDetails.map((bookingDtl, idx) => (
                      <tr key={idx}>
                        {mode !== "view" && (
                          <td>
                            <div className="d-flex gap-2">
                              {/* Edit Button */}
                              <div
                                onClick={(e) => {
                                  e.preventDefault();
                                  setModalType("edit");
                                  setShowDrawer(true);
                                  setBookingDtlForm((prev) => ({
                                    ...prev,
                                    TestId: bookingDtl.TestId,
                                    Rate: bookingDtl.Rate,
                                    Profile: bookingDtl.Profile,
                                  }));
                                }}
                              >
                                <i className="fa-light fa-pen-to-square"></i>
                              </div>

                              {/* Delete Button */}
                              <div
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShowConfirm(true);
                                  setSelectedId(bookingDtl.TestId);
                                }}
                              >
                                <i className="fa-light fa-trash-can"></i>
                              </div>
                            </div>
                          </td>
                        )}
                        <td>{idx + 1}</td>
                        <td>{bookingDtl?.Profile}</td>
                        <td>{testNameMap[bookingDtl?.TestId]}</td>
                        <td>{bookingDtl?.Rate}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>

          {/* RIGHT SIDE: BILLING & PAYMENT */}
          <div className="col-md-4">
            <div className="panel border p-2 mb-2 bg-neutral-100">
              <label className="dropdown-txt w-100 mb-2">Billing Detail</label>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end">
                  <label className="mb-0">Total</label>
                </div>
                <div className="col-6">
                  <input
                    type="Number"
                    className="form-control form-control-sm text-end"
                    name="Total"
                    value={formData.Total}
                    // onChange={handleChange}
                    readOnly
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end">
                  <label className="mb-0">Service Chg.</label>
                </div>
                <div className="col-6">
                  <input
                    type="Number"
                    className="form-control form-control-sm text-end"
                    value={formData.ServiceCh}
                    name="ServiceCh"
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end">
                  <label className="mb-0">Amount</label>
                </div>
                <div className="col-6">
                  <input
                    readOnly
                    type="Number"
                    className="form-control form-control-sm text-end"
                    value={Number(formData.Total) + Number(formData.ServiceCh)}
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end">
                  <label className="mb-0">Discount (%)</label>
                </div>
                <div className="col-6">
                  <input
                    name="DiscP"
                    value={formData.DiscP}
                    onChange={(e) => {
                      handleChange(e);
                      const calDiscAmt =
                        (Number(formData.Total) + Number(formData.ServiceCh)) *
                        (Number(e.target.value) / 100);
                      setFormData((prev) => ({
                        ...prev,
                        DiscAmt: calDiscAmt.toFixed(2),
                      }));
                    }}
                    type="Number"
                    className="form-control form-control-sm text-end"
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end">
                  <label className="mb-0">Discount Amount</label>
                </div>
                <div className="col-6">
                  <input
                    name="DiscAmt"
                    value={formData.DiscAmt}
                    onChange={(e) => {
                      handleChange(e);
                      const calDiscP =
                        (Number(e.target.value) /
                          (Number(formData.Total) +
                            Number(formData.ServiceCh))) *
                        100;
                      setFormData((prev) => ({
                        ...prev,
                        DiscP: calDiscP.toFixed(2),
                      }));
                    }}
                    type="Number"
                    className="form-control form-control-sm text-end"
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end">
                  <label className="mb-0 fw-bold">Grand Total</label>
                </div>
                <div className="col-6">
                  <input
                    type="Number"
                    className="form-control form-control-sm text-end fw-bold bg-warning-50"
                    value={formData.GTotal}
                    name="GTotal"
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-6 text-end">
                  <label className="mb-0">Advance</label>
                </div>
                <div className="col-6">
                  <input
                    type="Number"
                    className="form-control form-control-sm text-end"
                    name="Receipt"
                    value={formData.Receipt}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>
              </div>
            </div>

            <div className="panel border p-2 bg-neutral-100">
              <label>Payment Mode</label>
              <select
                className="form-control form-control-sm "
                name="CashBank"
                value={formData.CashBank}
                onChange={handleChange}
                disabled={mode === "view"}
              >
                <option value={""}>---</option>
                <option value={"C"}>Cash</option>
                <option value={"R"}>Credit</option>
                <option value={"B"}>Bank</option>
                <option>Card</option>
              </select>
              {/* <label className="dropdown-txt w-100 mb-2">Bank Detail</label> */}
              <label>Bank Name</label>
              <input
                type="text"
                className="form-control form-control-sm mb-1"
                disabled={mode === "view"}
              />
              <label>Cheque / Card</label>
              <input
                type="text"
                className="form-control form-control-sm mb-1"
                disabled={mode === "view"}
              />
            </div>
          </div>
        </div>

        {/* REMARKS AND METADATA */}
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label>Remarks</label>
            <textarea
              name="Remarks"
              value={formData.Remarks}
              onChange={handleChange}
              className="form-control"
              style={{ height: "60px", resize: "none" }}
              disabled={mode === "view"}
            ></textarea>
          </div>
          <div className="col-md-7">
            <div className="row g-2">
              <div className="col-md-6">
                <label>Doctor Name</label>
                {/* <input
                  type="text"
                  className="form-control form-control-sm"
                  name="DoctorId"
                  value={formData.DoctorId}
                  onChange={handleChange}
                /> */}
                <select
                  className="form-control form-control-sm"
                  name="DoctorId"
                  value={formData.DoctorId}
                  onChange={handleChange}
                  disabled={mode === "view"}
                >
                  {allDoctors.map((doc, idx) => (
                    <option key={idx} value={doc.DoctorId}>
                      {doc.Doctor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label>Agent</label>
                <select
                  className="form-select form-select-sm"
                  value={agentYN}
                  onChange={(e) => {
                    setAgentYN(e.target.value);
                    if (e.target.value === "N") {
                      setFormData((prev) => ({
                        ...prev,
                        AgentId: 0,
                      }));
                    }
                  }}
                  disabled={mode === "view"}
                >
                  <option value={"N"}>N</option>
                  <option value={"Y"}>Y</option>
                </select>
                {/* <input
                  type="text"
                  className="form-control form-control-sm"
                  name="AgentId"
                  value={formData.AgentId}
                  onChange={handleChange}
                /> */}
                <select
                  className="form-control form-control-sm"
                  name="AgentId"
                  value={formData.AgentId}
                  onChange={handleChange}
                  disabled={mode === "view" || agentYN === "N"}
                  // disabled={mode === "view"}
                >
                  {agentsMap.map((agent, idx) => (
                    <option key={idx} value={agent.AgentId}>
                      {agent.Agent}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label>Company</label>
                <select
                  className="form-select form-select-sm"
                  value={companyYN}
                  onChange={(e) => {
                    setCompanyYN(e.target.value);
                    if (e.target.value === "N") {
                      setFormData((prev) => ({
                        ...prev,
                        CompanyId: 0,
                      }));
                    }
                  }}
                  // disabled={mode === "view"}
                  disabled={mode === "view"}
                >
                  <option value={"N"}>N</option>
                  <option value={"Y"}>Y</option>
                </select>
                {/* <input
                  type="text"
                  className="form-control form-control-sm"
                  name="CompanyId"
                  value={formData.CompanyId}
                  onChange={handleChange}
                /> */}
                <select
                  className="form-control form-control-sm"
                  name="CompanyId"
                  value={formData.CompanyId}
                  onChange={handleChange}
                  disabled={mode === "view" || companyYN === "N"}
                  // disabled={}
                >
                  {companyMap.map((comp, idx) => (
                    <option key={idx} value={comp.DescId}>
                      {comp.Desc}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div className="col-md-4">
                <small>Received By:(field khuje paini)</small>
                <input className="form-control form-control-sm" type="text" />
              </div> */}
              <div className="col-md-4">
                <small>Current User:</small>
                {/* <input
                  className="form-control form-control-sm"
                  type="text"
                  value={formData.UserId}
                  name="UserId"
                  onChange={handleChange}
                /> */}
                <select
                  className="form-control form-control-sm"
                  value={formData.UserId}
                  name="UserId"
                  onChange={handleChange}
                  disabled={mode === "view"}
                >
                  {userMap.map((user, idx) => (
                    <option key={idx} value={user.UserId}>
                      {user.UserName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <small>Lab:</small>
                <select
                  className="form-control form-control-sm"
                  name="LabId"
                  value={formData.LabId}
                  onChange={handleChange}
                  disabled={mode === "view"}
                >
                  {allLab.map((lab, idx) => (
                    <option key={idx} value={lab.LabId}>
                      {lab.Lab}
                    </option>
                  ))}
                </select>
                {/* <input
                  className="form-control form-control-sm"
                  type="text"
                  name="LabId"
                  value={formData.LabId}
                  onChange={handleChange}
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BUTTON BAR */}
      <div className="panel-footer mt-3 d-flex gap-1 justify-content-center bg---rt-color-dark p-2 border">
        {/* <button className="btn btn-sm btn-primary">New</button>
        <button className="btn btn-sm btn-primary">Edit</button> */}
        <button className="btn btn-sm btn-primary" onClick={handleSubmit}>
          Save
        </button>
        {/* <button className="btn btn-sm btn-primary">Delete</button>
        <button className="btn btn-sm btn-primary">Undo</button>
        <button className="btn btn-sm btn-primary">Find</button>
        <button className="btn btn-sm btn-primary">Print</button> */}
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            navigate("/DiagBookingList");
          }}
        >
          Exit
        </button>
      </div>

      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "450px",
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                {/* Updated Drawer Title */}
                {modalType === "add"
                  ? "➕ Add Booking Detail"
                  : modalType === "edit"
                  ? "✏️ Edit Booking Detail"
                  : "👁️ View Booking Detail"}
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form onSubmit={submitBookingDtlForm} className="">
                    <div>
                      <label>Test Name</label>
                      {modalType !== "add" ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          name="TestId"
                          value={testNameMap[bookingDtlForm.TestId]}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            setBookingDtlForm((prev) => ({
                              ...prev,
                              [name]: value,
                            }));
                          }}
                          readOnly
                        />
                      ) : (
                        // <input
                        //   type="text"
                        //   className="form-control form-control-sm"
                        //   name="TestId"
                        //   value={bookingDtlForm.TestId}
                        //   onChange={(e) => {
                        //     const { name, value } = e.target;
                        //     setBookingDtlForm((prev) => ({
                        //       ...prev,
                        //       [name]: value,
                        //     }));
                        //   }}
                        // />

                        <Select
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
                        />
                      )}
                    </div>
                    <div>
                      <label>Rate</label>
                      {modalType !== "add" ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          name="Rate"
                          value={bookingDtlForm.Rate}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            setBookingDtlForm((prev) => ({
                              ...prev,
                              [name]: value,
                            }));
                          }}
                        />
                      ) : (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          name="Rate"
                          value={bookingDtlForm.Rate}
                          readOnly
                        />
                      )}
                    </div>
                    <div>
                      <label>Profile</label>
                      <select
                        className="form-control form-control-sm"
                        name="Profile"
                        value={bookingDtlForm.Profile}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setBookingDtlForm((prev) => ({
                            ...prev,
                            [name]: value,
                          }));
                        }}
                      >
                        <option value={"Y"}>Y</option>
                        <option value={"N"}>N</option>
                      </select>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Cancel
                      </button>
                      {modalType !== "view" && (
                        <button type="submit" className="btn btn-primary w-50">
                          Save
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="text-danger">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>

              <div className="modal-body text-center">
                <p className="fw-bold mb-1">
                  Are you sure you want to delete this record?
                </p>

                <p className="text-muted mb-1">This action cannot be undone.</p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DiagBookingAdd;
