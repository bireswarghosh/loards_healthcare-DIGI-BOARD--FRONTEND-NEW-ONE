/** @format */

import { useEffect, useState, useMemo } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../axiosInstance";
import { set } from "date-fns";
import debounce from "lodash.debounce";
import ApiSelect from "./ApiSelect";
import { Await, useNavigate } from "react-router-dom";
import PaginationBar from "./PaginationBar";
import BookingTable from "./BookingTable";
import TestDrawer from "./TestDrawer";

const LaboratoryQuery = () => {
  const [loading, setLoading] = useState(false);
  // --- State ---
  const [filterType, setFilterType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [signatory, setSignatory] = useState("NONE");

  // Mock Data for Grids to visualize layout
  const [cases, setCases] = useState([]);

  // =======================fetchBoookingList====================================================
  const [bookingList, setBookingList] = useState([]);
  const [PatientName, setPatientName] = useState("");
  /* ================= PAGINATION ================= */
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const fetchBoookingList = async () => {
    try {
      const response = await axiosInstance.get(
        `case01/search?PatientName=${PatientName}&startDate=${startDate}&endDate=${endDate}&page=${pageNo}&limit=${limit}`,
      );

      setBookingList(response?.data?.data || []);

      setTotalPages(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching booking list:", error);
    }
  };

  const debouncedFetchBookingList = useMemo(
    () =>
      debounce(() => {
        setPageNo(1); // Reset to first page on new search
        fetchBoookingList();
      }, 500), // ⏱️ 500ms debounce
    [PatientName, startDate, endDate],
  );
  // ================= PAGINATION =================
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPageNo(p);
  };
  // =================================================================================================
  // ====================================fetchTestDetails============================================
  const [tests, setTests] = useState([]);
  const fetchTestDetails = async (CaseId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/case-dtl-01/case/${CaseId}`);
      const testList = res?.data?.data || [];

      const enrichedTests = await Promise.all(
        testList.map(async (t) => {
          try {
            const nameRes = await axiosInstance.get(`/tests/${t.TestId}`);
            return {
              ...t,
              Test: nameRes?.data?.data?.Test || t.TestId,
              DescFormat: nameRes?.data?.data?.DescFormat ,
            };
          } catch {
            return { ...t, Test: t.TestId };
          }
        }),
      );

      setTests(enrichedTests);
    } catch (error) {
      console.error("Error fetching test details:", error);
    } finally {
      setLoading(false);
    }
  };
  // ==================================================================================================
  useEffect(() => {
    debouncedFetchBookingList();
    // Cancel the debounce on useEffect cleanup.
    return () => {
      debouncedFetchBookingList.cancel();
    };
  }, [PatientName, startDate, endDate]);
  useEffect(() => {
    fetchBoookingList();
  }, [pageNo]);
  // ======================================================================================================

  const initialFormData = {
    PatientId: "",
    Age: "",
    Sex: "",
    BillId: "",
    Remarks: "",
    CompanyId: "",
    LabId: "",
  };
  const [formData, setFormData] = useState({ ...initialFormData });
  //   ================================================================================================
  //   const initialFormData2 = {
  //     CaseNo: "",
  //     PatientId: "",
  //   };
  const [formData2, setFormData2] = useState({});
  // ================================================================================================
  // =====================fetch lab list================================
  const [labList, setLabList] = useState([]);
  const fetchLabList = async () => {
    try {
      const res = await axiosInstance.get(`/lab?page=1&limit=200`);
      setLabList = res?.data?.data || [];
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchLabList();
  }, []);

  const labMap = useMemo(() => {
    const map = {};
    labList.forEach((lab) => {
      map[lab.LabId] = lab.Lab;
    });
    return map;
  }, [labList]);
  // =====================fetchProertyagainsttest===========================
  const [propertyList, setPropertyList] = useState([]);

  const fetchPropertyList = async (testId, page = 1, limit = 20) => {
    try {
      const res = await axiosInstance.get(
        `/testproperty?testId=${testId}&page=${page}&limit=${limit}`,
      );

      setPropertyList(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching test property:", error);
      setPropertyList([]);
    }
  };
  // ========================propertyValue==============================
  const [propertyValueMap, setPropertyValueMap] = useState({});
  // const fetchPropertyValues = async (caseId, testId) => {
  //   try {
  //     const res = await axiosInstance.get(
  //       `/testproval/search?CaseId=${caseId}&TestId=${testId}&page=1`
  //     );

  //     const obj = res?.data?.data;

  //     if (!obj || !obj.TestPropertyId) {
  //       setPropertyValueMap({});
  //       return;
  //     }

  //     // 🔥 single object → map
  //     setPropertyValueMap({
  //       [obj.TestPropertyId]: obj.TestProVal,
  //     });
  //     console.log("proval",propertyValueMap);

  //   } catch (err) {
  //     console.error("Property value error", err);
  //     setPropertyValueMap({});
  //   }
  // };

  const fetchPropertyValues = async (caseId, testId) => {
    try {
      const res = await axiosInstance.get(
        `/testproval/search?CaseId=${caseId}&TestId=${testId}&page=1`,
      );

      const list = res?.data?.data || [];

      if (list.length === 0) {
        setPropertyValueMap({});
        return;
      }

      const map = {};
      list.forEach((item) => {
        map[item.TestPropertyId] = {
          value: item.TestProVal,
          barcode: item.BarCodeNo,
          lis: item.LISVal,
          alert: item.Alart,
        };
      });

      setPropertyValueMap(map);
      console.log("FULL PROPERTY VALUE MAP:", map);
    } catch (err) {
      console.error("Property value error", err);
      setPropertyValueMap({});
    }
  };

  const [showTestModal, setShowTestModal] = useState(false);
  // modal================================
  /* ================= DRAWER ================= */
  const [showTestDrawer, setShowTestDrawer] = useState(false);
  const [testDrawerType, setTestDrawerType] = useState(null);
  // "descriptive" | "general"

  const [selectedTests, setSelectedTests] = useState([]);

  // =====================================
  const handlePropertyChange = (propertyId, field, value) => {
    setPropertyValueMap((prev) => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        [field]: value,
      },
    }));
  };

  return (
    <div className='main-content'>
      <div
        className='panel'
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className='panel-header d-flex justify-content-between align-items-center py-1 px-2 border-bottom'>
          <div className='d-flex align-items-center gap-2'>
            {/* Legacy Icon Placeholder */}
            <i className='fa fa-e me-1 text-danger'></i>
            <h6 className='m-0 fw-bold' style={{ fontSize: "0.9rem" }}>
              Laboratory Query
            </h6>
          </div>
        </div>

        <div className='panel-body p-1 d-flex flex-column flex-grow-1  bg----rt-color-dark'>
          {/* ------------------------------------------------
                ROW 1: FILTER BAR & STATUS INDICATORS
                ------------------------------------------------ */}
          <div className='d-flex align-items-center gap-2 mb-1 flex-wrap'>
            {/* Filter Type */}
            <div className='d-flex align-items-center gap-2'>
              {/* <label className="form-label m-0 fw-bold small text-nowrap">
                Filter Type
              </label> */}
              {/* <select
                className="form-select form-select-sm"
                style={{ width: "120px" }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>All</option> */}
              {/* </select> */}
              {/* Extra text box visible in screenshot next to filter type  */}
              <input
                value={PatientName}
                onChange={(e) => setPatientName(e.target.value)}
                type='text'
                className='form-control form-control-sm'
                placeholder='Search patient name'
              />
            </div>

            <button className='btn btn-sm btn-light border shadow-sm fw-bold'>
              Search patient Name
            </button>

            {/* Signatory */}
            <div className='d-flex align-items-center gap-2 ms-auto'>
              <label className='form-label m-0 fw-bold small'>Signatory</label>
              <select
                className='form-select form-select-sm'
                style={{ width: "100px" }}
                value={signatory}
                onChange={(e) => setSignatory(e.target.value)}
              >
                <option>NONE</option>
                <option value='Footer 1'>Footer 1</option>
                <option value='Footer 2'>Footer 2</option>
                <option value='Footer 3'>Footer 3</option>
                <option value='Footer 4'>Footer 4</option>
                <option value='Footer 5'>Footer 5</option>
                <option value='Footer 6'>Footer 6</option>
              </select>
            </div>

            {/* Status Indicators (Right Side) */}
            <div
              className='border d-flex flex-column text-center small fw-bold'
              style={{ width: "140px", fontSize: "0.7rem", lineHeight: "1.1" }}
            >
              <div className='bg-success text-white'>Reporting Done</div>
              <div className='bg-warning text-dark'>Reporting Partly Done</div>
              <div className='bg-white text-dark'>Reporting Pending</div>
            </div>
          </div>

          {/* ------------------------------------------------
                ROW 2: STATUS RADIO BUTTONS
                ------------------------------------------------ */}
          <div className='d-flex align-items-center gap-3 mb-1 px-1 border-bottom pb-1'>
            {[
              "All",
              "Pending Reporting",
              "Pending Delivery",
              "Pending Receipt",
              "Abnormal Report",
              "Previous case",
              "Direct case",
            ].map((label) => (
              <div className='form-check m-0' key={label}>
                <input
                  className='form-check-input'
                  type='radio'
                  name='statusFilter'
                  id={`rad-${label.replace(/\s/g, "")}`}
                  checked={statusFilter === label}
                  onChange={() => setStatusFilter(label)}
                />
                <label
                  className='form-check-label small fw-bold text-nowrap'
                  htmlFor={`rad-${label.replace(/\s/g, "")}`}
                >
                  {label}
                </label>
              </div>
            ))}
          </div>

          {/* ------------------------------------------------
                ROW 3: DATE & SEARCH CONTROLS
                ------------------------------------------------ */}
          <div className='d-flex align-items-center gap-2 mb-2 flex-wrap'>
            {/* Date From */}
            <div className='d-flex align-items-center gap-1'>
              <label className='form-label m-0 fw-bold small text-nowrap'>
                Date From
              </label>
              <input
                type='date'
                className='form-control form-control-sm'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: "130px" }}
              />
            </div>

            {/* Date To */}
            <div className='d-flex align-items-center gap-1'>
              <label className='form-label m-0 fw-bold small text-nowrap'>
                Date To
              </label>
              <input
                type='date'
                className='form-control form-control-sm'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: "130px" }}
              />
            </div>

            {/* Total Cases Indicator */}
            <span className='fw-bold text-danger ms-2 small text-nowrap'>
              Total Cases
            </span>

            {/* Spacer */}
            <div className='flex-grow-1'></div>

            {/* Update Section (Top Right of Date Row) */}
            <div className='d-flex align-items-center gap-1'>
              <input
                type='text'
                className='form-control form-control-sm'
                style={{ width: "80px" }}
              />
              <button className='btn btn-sm btn-light border shadow-sm'>
                Update
              </button>
            </div>
          </div>

          {/* ROW 4: BARCODE & ACTION BUTTONS */}
          <div className='d-flex align-items-center gap-2 mb-2 flex-wrap'>
            <div className='d-flex align-items-center gap-1'>
              <label className='form-label m-0 fw-bold small text-nowrap'>
                Pre Prnt BarCode
              </label>
              <input
                type='text'
                className='form-control form-control-sm'
                style={{ width: "150px" }}
              />
              <button className='btn btn-sm btn-light border shadow-sm text-nowrap'>
                Search By BarCode
              </button>
            </div>

            <div className='ms-auto d-flex gap-2'>
              <button className='btn btn-sm btn-light border shadow-sm fw-bold'>
                All E Mail
              </button>
              <button className='btn btn-sm btn-light border shadow-sm fw-bold'>
                Pathologist Login
              </button>
              <button
                className='btn btn-sm text-dark fw-bold border shadow-sm'
                style={{ backgroundColor: "#ff8c00" }}
              >
                Pull Machine Data For LIS
              </button>
            </div>
          </div>

          {/* ------------------------------------------------
                MAIN CASE LIST GRID (TOP)
                ------------------------------------------------ */}
          <BookingTable
            bookingList={bookingList}
            onRowClick={(item) => {
              console.log("Form Data Set:", item);
              setFormData(item);
              fetchTestDetails(item.CaseId);
            }}
          />
          {/* pagination===================================================================== */}

          <PaginationBar
            pageNo={pageNo}
            totalPages={totalPages}
            onPageChange={goToPage}
          />

          {/* ------------------------------------------------
                PATIENT INFO SECTION (MIDDLE PANEL)
                ------------------------------------------------ */}
          <div className='border p-2 mb-1  bg----rt-color-dark'>
            {/* Row 1 */}
            <div className='row g-1 align-items-center mb-1'>
              <div className='col-auto'>
                <label className='form-label m-0 fw-bold small'>
                  Patient Id
                </label>
              </div>
              <div className='col-auto'>
                <input
                  type='text'
                  value={formData.PatientId || ""}
                  readOnly
                  className='form-control form-control-sm'
                  style={{ width: "150px" }}
                />
              </div>

              <div className='col-auto'>
                <label className='form-label m-0 fw-bold small'>Age</label>
              </div>
              <div className='col-auto'>
                <input
                  type='text'
                  value={formData.Age || ""}
                  readOnly
                  className='form-control form-control-sm'
                  style={{ width: "60px" }}
                />
              </div>

              <div className='col-auto'>
                <label className='form-label m-0 fw-bold small'>Sex</label>
              </div>
              <div className='col-auto'>
                <input
                  type='text'
                  value={formData.Sex || ""}
                  readOnly
                  className='form-control form-control-sm'
                  style={{ width: "80px" }}
                />
              </div>

              <div className='col-auto'>
                <label className='form-label m-0 fw-bold small'>Bill No</label>
              </div>
              <div className='col-auto'>
                <input
                  type='text'
                  value={formData.BillId || ""}
                  readOnly
                  className='form-control form-control-sm'
                  style={{ width: "120px" }}
                />
              </div>

              <div className='col-auto'>
                <label className='form-label m-0 fw-bold small'>Remarks</label>
              </div>
              <div className='col'>
                <input
                  type='text'
                  value={formData.Remarks || ""}
                  readOnly
                  className='form-control form-control-sm w-100'
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className='row g-1 align-items-center'>
              <div className='col-auto'>
                <label className='form-label m-0 fw-bold small'>
                  Company Name
                </label>
              </div>
              <div className='col-md-5'>
                <input
                  type='text'
                  value={formData.CompanyId}
                  readOnly
                  className='form-control form-control-sm w-100'
                />
              </div>

              <div className='col-auto'>
                <label className='form-label m-0 fw-bold small'>Lab Name</label>
              </div>
              <div className='col'>
                <input
                  type='text'
                  value={labMap[formData.LabId] || ""}
                  readOnly
                  className='form-control form-control-sm w-100'
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------
                BOTTOM SECTION (SPLIT GRIDS)
            ------------------------------------------------ */}
          <div className='d-flex gap-1' style={{ height: "200px" }}>
            {/* TEST DETAIL GRID (BOTTOM LEFT) */}
            <div
              className='flex-grow-1 border  bg----rt-color-dark'
              style={{ width: "75%" }}
            >
              <OverlayScrollbarsComponent
                style={{ height: "100%", width: "100%" }}
              >
                <table
                  className='table table-sm table-bordered mb-0'
                  style={{ fontSize: "0.8rem" }}
                >
                  <thead
                    className='bg-primary text-white'
                    style={{ position: "sticky", top: 0, zIndex: 10 }}
                  >
                    <tr>
                      <th>Test Name</th>
                      <th>Report Date</th>
                      <th>Delivered</th>
                      <th>Printed</th>
                      <th>PrePrntBarCode</th>
                      <th>User</th>
                      <th className='text-center'>Approval</th>
                      <th>Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && "loading..."}
                    {tests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className='text-center text-muted'>
                          No test details available.
                        </td>
                      </tr>
                    ) : (
                      tests.map((test, index) => (
                        <tr style={{ height: "100%" }} key={index}>
                          <td
                            onClick={() => {
                              console.log("test details", test);
                              const clickedDescFormat = test.DescFormat;
                              console.log("hale luia", clickedDescFormat);

                              const matchedTests = tests.filter(
                                (t) => t.DescFormat === clickedDescFormat,
                              );

                              setSelectedTests(matchedTests);
                              console.log(matchedTests);

                              setFormData2({
                                ...formData,
                                Test: test.Test,
                                TestId: test.TestId,
                                ReportDate: test.ReportDate,
                                DescFormat: test.DescFormat, //  IMPORTANT
                              });
                              fetchPropertyList(test.TestId);
                              fetchPropertyValues(formData.CaseId, test.TestId);
                              // setShowTestModal(true); // ✅ modal open
                              if (test.DescFormat === 0) {
                                setTestDrawerType("descriptive");
                              }
                              if (test.DescFormat === 2) {
                                setTestDrawerType("general");
                              }
                              if (test.DescFormat === 1) {
                                const id = formData?.CaseId;
                                console.log(" hello id", id);

                                const fetchBloodFormatByCaseId = async () => {
                                  try {
                                    const res = await axiosInstance.get(
                                      `/bloodformat/case/${id}?page=1&limit=20/`,
                                    );

                                    if (res.data.success) {
                                      const bloodFormatData = res.data.data;
                                     if(bloodFormatData.length==0){
                                        navigate('/BloodReport/Add')
                                     }
                                     else{
                                         navigate(
                                  `/BloodReport/${encodeURIComponent(id)}/edit`,
                                );
                                     }
                                    }
                                  } catch (error) {
                                    console.log(
                                      "error fetching blood format by caseId: ",
                                      error,
                                    );
                                  }
                                };

                               fetchBloodFormatByCaseId()
                              }

                              setShowTestDrawer(true);
                            }}
                          >
                            {test.Test}
                          </td>
                          <td>{test.ReportDate}</td>
                          <td>{test.DeliveryDate}</td>
                          <td>{test.Printed}</td>
                          <td>{test.PrePrntBarCode}</td>
                          <td>{test.User}</td>
                          {/* <td className="text-center">{test.Approval}</td> */}
                          <td className='text-center'>
                            <input
                              type='checkbox'
                              // checked={test.Approval === 1}
                              onChange={(e) => {
                                console.log(
                                  "Cancel changed:",
                                  e.target.checked,
                                );
                              }}
                            />
                          </td>
                          <td>{test.Profile}</td>
                        </tr>
                      ))
                    )}
                    {/* Empty State */}
                  </tbody>
                </table>
              </OverlayScrollbarsComponent>
            </div>

            {/* BOTTOM RIGHT PANEL */}
            <div
              className='border bg-secondary bg-opacity-25'
              style={{ width: "25%", height: "100%", overflowY: "auto" }}
            >
              <div className='p-2'>
                {/* Placeholder for the secondary panel content in screenshot */}

                {/* RIGHT PANEL */}
                <div className='col-md-12'>
                  <label className='form-label mb-0'>Lab Sl.No.</label>
                  <input className='form-control form-control-sm mb-2' />

                  <table className='table table-bordered table-sm'>
                    <thead>
                      <tr>
                        <th>Test Property</th>
                        <th>Value</th>
                        <th>UOM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyList.length === 0 ? (
                        <tr>
                          <td colSpan={3} className='text-center text-muted'>
                            No property found
                          </td>
                        </tr>
                      ) : (
                        propertyList.map((prop) => (
                          <tr key={prop.TestPropertyId}>
                            <td>{prop.TestProperty}</td>

                            <td className='fw-bold text-primary'>
                              {propertyValueMap[prop.TestPropertyId]?.value ??
                                ""}
                            </td>

                            <td>{prop.Uom}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      <TestDrawer
        open={showTestDrawer}
        onClose={() => setShowTestDrawer(false)}
        type={testDrawerType} // "descriptive" | "general"
        tests={selectedTests}
        formData2={formData2}
        propertyList={propertyList}
        propertyValueMap={propertyValueMap}
        handlePropertyChange={handlePropertyChange}
        fetchPropertyList={fetchPropertyList}
        fetchPropertyValues={fetchPropertyValues}
      />
    </div>
  );
};

export default LaboratoryQuery;
// {showTestDrawer && (
//         <>
//           {/* BACKDROP */}
//           <div
//             className="modal-backdrop fade show"
//             style={{ zIndex: 9998 }}
//             onClick={() => setShowTestDrawer(false)}
//           />

//           {/* DRAWER */}
//           <div
//             className="profile-right-sidebar active"
//             style={{
//               zIndex: 9999,
//               width: "100%",
//               maxWidth: "900px",
//               top: "70px",
//               height: "calc(100vh - 70px)",
//             }}
//           >
//             {/* CLOSE BUTTON */}
//             <button
//               className="right-bar-close"
//               onClick={() => setShowTestDrawer(false)}
//             >
//               <i className="fa-light fa-angle-right"></i>
//             </button>

//             {/* HEADER */}
//             <div
//               className="dropdown-txt fw-bold"
//               style={{
//                 position: "sticky",
//                 top: 0,
//                 zIndex: 10,
//                 padding: "10px",
//               }}
//             >
//               {testDrawerType === "descriptive"
//                 ? "🧪 Descriptive Test"
//                 : "🧪 General Test"}
//             </div>

//             {/* BODY */}
//             <OverlayScrollbarsComponent style={{ height: "calc(100% - 50px)" }}>
//               <div className="p-3">
//                 {/* ================= DESCRIPTIVE ================= */}
//                 {testDrawerType === "descriptive" && (
//                   <>
//                     {/* 🔥 তোমার existing Descriptive Test JSX এখানে paste করো */}
//                     {/* NO condition needed anymore */}
//                     <OverlayScrollbarsComponent
//                       style={{ height: "calc(100% - 50px)" }}
//                     >
//                       <div className="p-3">
//                         {/* ================= BASIC INFO ================= */}
//                         <div className="row g-2 mb-2 align-items-end">
//                           <div className="col-md-2">
//                             <label className="form-label mb-0">Case No.</label>
//                             <input
//                               value={formData2?.CaseNo || ""}
//                               readOnly
//                               className="form-control form-control-sm"
//                             />
//                           </div>

//                           <div className="col-md-2">
//                             <label className="form-label mb-0">
//                               Patient Id
//                             </label>
//                             <input
//                               value={formData2?.PatientId || ""}
//                               readOnly
//                               className="form-control form-control-sm"
//                             />
//                           </div>

//                           <div className="col-md-3">
//                             <label className="form-label mb-0">
//                               Patient Name
//                             </label>
//                             <input
//                               value={formData2?.PatientName || ""}
//                               readOnly
//                               className="form-control form-control-sm"
//                             />
//                           </div>

//                           <div className="col-md-3 ms-auto text-end">
//                             <div className="border px-2 py-1 fw-bold text-center">
//                               {formData2?.CaseNo}
//                             </div>
//                           </div>
//                         </div>

//                         {/* ================= PATHOLOGIST ================= */}
//                         <div className="row g-2 mb-2">
//                           <div className="col-md-4">
//                             <label className="form-label mb-0">
//                               Pathologist
//                             </label>
//                             <ApiSelect
//                               api="https://lords-backend.onrender.com/api/v1/pathologist"
//                               labelKey="Pathologist"
//                               valueKey="PathologistId"
//                               placeholder="Select Pathologist"
//                             />
//                           </div>
//                         </div>

//                         {/* ================= TEST TABLE ================= */}
//                         <div className="table-responsive mb-3">
//                           <table className="table table-bordered table-sm">
//                             <thead>
//                               <tr>
//                                 <th>Test Name</th>
//                                 <th>Pathologist</th>
//                                 <th>Report Date</th>
//                                 <th>Test Detail</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               <tr>
//                                 <td>{formData2?.Test}</td>

//                                 <td>
//                                   <ApiSelect
//                                     api="https://lords-backend.onrender.com/api/v1/pathologist"
//                                     labelKey="Pathologist"
//                                     valueKey="PathologistId"
//                                     placeholder="Select"
//                                   />
//                                 </td>

//                                 <td>
//                                   <input
//                                     type="date"
//                                     className="form-control form-control-sm"
//                                   />
//                                 </td>

//                                 <td></td>
//                               </tr>

//                               <tr>
//                                 <td colSpan={4} style={{ height: 150 }}></td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </div>

//                         {/* ================= PROPERTY VIEW ================= */}
//                         <div className="table-responsive mb-3">
//                           <table className="table table-bordered table-sm">
//                             <thead>
//                               <tr>
//                                 <th>Test Property</th>
//                                 <th>Value</th>
//                                 <th>UOM</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {propertyList.length === 0 ? (
//                                 <tr>
//                                   <td
//                                     colSpan={3}
//                                     className="text-center text-muted"
//                                   >
//                                     No property found
//                                   </td>
//                                 </tr>
//                               ) : (
//                                 propertyList.map((prop, index) => (
//                                   <tr key={index}>
//                                     <td>{prop.TestProperty}</td>
//                                     <td className="fw-bold text-primary">
//                                       {propertyValueMap[prop.TestPropertyId] ??
//                                         ""}
//                                     </td>
//                                     <td>{prop.Uom}</td>
//                                   </tr>
//                                 ))
//                               )}
//                             </tbody>
//                           </table>
//                         </div>

//                         {/* ================= ACTION BUTTONS ================= */}
//                         <div className="d-flex justify-content-end gap-2 mb-3">
//                           <button className="btn btn-sm btn-outline-danger">
//                             Abnormal
//                           </button>
//                           <button className="btn btn-sm btn-outline-secondary">
//                             Special
//                           </button>
//                         </div>

//                         <div className="d-flex gap-2 flex-wrap">
//                           {[
//                             "New",
//                             "Edit",
//                             "Save",
//                             "Delete",
//                             "Undo",
//                             "Find",
//                             "Print",
//                             "Exit",
//                           ].map((btn) => (
//                             <button
//                               key={btn}
//                               className="btn btn-sm btn-outline-primary"
//                             >
//                               {btn}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     </OverlayScrollbarsComponent>
//                   </>
//                 )}

//                 {/* ================= GENERAL ================= */}
//                 {testDrawerType === "general" && (
//                   <>
//                     <OverlayScrollbarsComponent
//                       style={{ height: "calc(100% - 50px)" }}
//                     >
//                       <div className="p-3">
//                         {/* ================= BASIC INFO ================= */}
//                         <div className="row g-2 mb-2 align-items-end">
//                           <div className="col-md-2">
//                             <label className="form-label mb-0">Case No.</label>
//                             <input
//                               value={formData2?.CaseNo || ""}
//                               readOnly
//                               className="form-control form-control-sm"
//                             />
//                           </div>

//                           <div className="col-md-2">
//                             <label className="form-label mb-0">
//                               Patient Id
//                             </label>
//                             <input
//                               value={formData2?.PatientId || ""}
//                               readOnly
//                               className="form-control form-control-sm"
//                             />
//                           </div>

//                           <div className="col-md-3">
//                             <label className="form-label mb-0">
//                               Patient Name
//                             </label>
//                             <input
//                               value={formData2?.PatientName || ""}
//                               readOnly
//                               className="form-control form-control-sm"
//                             />
//                           </div>

//                           <div className="col-md-3 ms-auto text-end">
//                             <div className="border px-2 py-1 fw-bold text-center">
//                               {formData2?.CaseNo}
//                             </div>
//                           </div>
//                         </div>

//                         {/* ================= PATHOLOGIST ================= */}
//                         <div className="row g-2 mb-3">
//                           <div className="col-md-4">
//                             <label className="form-label mb-0">
//                               Pathologist
//                             </label>
//                             <ApiSelect
//                               api="https://lords-backend.onrender.com/api/v1/pathologist"
//                               labelKey="Pathologist"
//                               valueKey="PathologistId"
//                               placeholder="Select Pathologist"
//                             />
//                           </div>
//                         </div>

//                         {/* ================= TEST TABLE ================= */}
//                         <div className="table-responsive mb-3">
//                           <table className="table table-bordered table-sm">
//                             <thead>
//                               <tr>
//                                 <th>Test Name</th>
//                                 <th>Report Date</th>
//                                 <th>Test Detail</th>
//                                 <th>Special Remarks</th>
//                                 <th>Value</th>
//                                 <th>Report Time</th>
//                               </tr>
//                             </thead>

//                             <tbody>
//                               <tr>
//                                 <td>{formData2?.Test}</td>
//                                 <td>{formData2?.ReportDate}</td>
//                                 <td className="text-primary">
//                                   Click Here To Enter Result
//                                 </td>
//                                 <td></td>
//                                 <td></td>
//                                 <td>{formData2?.ReportTime}</td>
//                               </tr>

//                               <tr>
//                                 <td colSpan={6} style={{ height: 120 }}></td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </div>

//                         {/* ================= PROPERTY PANEL ================= */}
//                         <div className="table-responsive mb-3">
//                           <table className="table table-bordered table-sm">
//                             <thead>
//                               <tr>
//                                 <th>Test Property</th>
//                                 <th>Value</th>
//                                 <th>UOM</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {propertyList.length === 0 ? (
//                                 <tr>
//                                   <td
//                                     colSpan={3}
//                                     className="text-center text-muted"
//                                   >
//                                     No property found
//                                   </td>
//                                 </tr>
//                               ) : (
//                                 propertyList.map((prop, index) => (
//                                   <tr key={index}>
//                                     <td>{prop.TestProperty}</td>
//                                     <td className="fw-bold text-primary">
//                                       {propertyValueMap[prop.TestPropertyId] ??
//                                         ""}
//                                     </td>
//                                     <td>{prop.Uom}</td>
//                                   </tr>
//                                 ))
//                               )}
//                             </tbody>
//                           </table>
//                         </div>

//                         {/* ================= ACTION BUTTONS ================= */}
//                         <div className="d-flex gap-2 flex-wrap">
//                           {[
//                             "New",
//                             "Edit",
//                             "Save",
//                             "Delete",
//                             "Undo",
//                             "Find",
//                             "Print",
//                             "Previous",
//                             "Next",
//                             "Exit",
//                           ].map((btn) => (
//                             <button
//                               key={btn}
//                               className="btn btn-sm btn-outline-primary"
//                             >
//                               {btn}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     </OverlayScrollbarsComponent>
//                   </>
//                 )}
//               </div>
//             </OverlayScrollbarsComponent>
//           </div>
//         </>
//       )}

{
  /* below box------- */
}
// {formData2?.DescFormat === 1 && (
//   <div className="">
//     {/* HEADER */}
//     <div className="panel-header d-flex justify-content-between align-items-center py-1">
//       <h6 className="m-0 fw-bold">Descriptive Test</h6>
//     </div>

//     {/* MAIN PANEL */}
//     <div
//       className="panel p-2 bg-neutral-50"
//       style={{ border: "1px solid #7F9DB9", borderRadius: 0 }}
//     >
//       {/* TOP FORM */}
//       <div className="row g-2 mb-2 align-items-end">
//         <div className="col-md-2">
//           <label className="form-label mb-0">Case No.</label>
//           <input
//             value={formData2?.CaseNo || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-2">
//           <label className="form-label mb-0">Patient Id</label>
//           <input
//             value={formData2?.PatientId || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-2">
//           <label className="form-label mb-0">Entry By</label>
//           <input className="form-control form-control-sm" />
//         </div>

//         <div className="col-md-3">
//           <label className="form-label mb-0">Patient Name</label>
//           <input
//             value={formData2?.PatientName || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-3 text-end">
//           <div className="border px-2 py-1 fw-bold text-center">
//             IP/2526/00001
//           </div>
//         </div>
//       </div>

//       <div className="row g-2 mb-2">
//         <div className="col-md-4">
//           <label className="form-label mb-0">Pathologist</label>

//           <ApiSelect
//             api="https://lords-backend.onrender.com/api/v1/pathologist"
//             // value={formData.OTType || ""}
//             labelKey="Pathologist"
//             valueKey="PathologistId"
//             placeholder="Select "
//             // onChange={(val) =>
//             //   setFormData((prev) => ({
//             //     ...prev,
//             //     OTType: val, // ✅ correct field
//             //   }))
//             // }
//           />
//         </div>
//       </div>

//       {/* TEST TABLE */}
//       <div className="table-responsive mb-2">
//         <table className="table table-bordered table-sm">
//           <thead className="">
//             <tr>
//               <th>Test Name</th>
//               <th>Pathologist</th>
//               <th>Report Date</th>
//               <th>Test Detail</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr onClick={() => {}} className="">
//               <td>{formData2?.Test}</td>
//               <td>
//                 <ApiSelect
//                   api="https://lords-backend.onrender.com/api/v1/pathologist"
//                   // value={formData.OTType || ""}
//                   labelKey="Pathologist"
//                   valueKey="PathologistId"
//                   placeholder="Select "
//                   // onChange={(val) =>
//                   //   setFormData((prev) => ({
//                   //     ...prev,
//                   //     OTType: val, // ✅ correct field
//                   //   }))
//                   // }
//                 />
//               </td>
//               <td>
//                 {" "}
//                 <input
//                   type="date"
//                   className="form-control form-control-sm"
//                   // value={item.CaseDate?.split("T")[0]}
//                 />
//               </td>

//               <td></td>
//             </tr>
//             <tr>
//               <td colSpan={4} style={{ height: 180 }}></td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* RIGHT SIDE BUTTONS */}
//       <div className="d-flex justify-content-end gap-2 mb-2">
//         <button className="btn btn-sm btn-outline-danger">
//           Abnormal
//         </button>
//         <button className="btn btn-sm btn-outline-secondary">
//           Special
//         </button>
//       </div>

//       {/* FOOTER ACTION BAR */}
//       <div className="d-flex gap-2 flex-wrap">
//         {[
//           "New",
//           "Edit",
//           "Save",
//           "Delete",
//           "Undo",
//           "Find",
//           "Print",
//           "Exit",
//         ].map((btn) => (
//           <button key={btn} className="btn btn-sm btn-outline-primary">
//             {btn}
//           </button>
//         ))}
//       </div>
//     </div>
//   </div>
// )}
{
  /* end--------- */
}

{
  /* ===================General Test======================= */
}
// {formData2?.DescFormat === 1 && (
//   <div className="">
//     {/* HEADER */}
//     <div className="panel-header d-flex justify-content-between align-items-center py-1">
//       <h6 className="m-0 fw-bold">General Test</h6>
//     </div>

//     {/* MAIN PANEL */}
//     <div
//       className="panel p-2 bg-neutral-50"
//       style={{ border: "1px solid #7F9DB9", borderRadius: 0 }}
//     >
//       {/* TOP SECTION */}
//       <div className="row g-2 mb-2 align-items-end">
//         <div className="col-md-2">
//           <label className="form-label mb-0">Case No.</label>

//           <input
//             value={formData2?.CaseNo || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-2">
//           <label className="form-label mb-0">Entry By</label>
//           <input className="form-control form-control-sm" value="LAB" />
//         </div>

//         <div className="col-md-2">
//           <label className="form-label mb-0">Patient Id</label>
//           <input
//             value={formData2?.PatientId || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-3">
//           <label className="form-label mb-0">Patient Name</label>
//           <input
//             value={formData2?.PatientName || ""}
//             readOnly
//             className="form-control form-control-sm"
//           />
//         </div>

//         <div className="col-md-3">
//           <label className="form-label mb-0">Case No.</label>
//           <div className="border px-2 py-1 fw-bold text-center">
//             OP/2324/07132
//           </div>
//         </div>
//       </div>

//       {/* PATHOLOGIST */}
//       <div className="row g-2 mb-2">
//         <div className="col-md-4">
//           <label className="form-label mb-0">Pathologist</label>
//           <ApiSelect
//             api="https://lords-backend.onrender.com/api/v1/pathologist"
//             // value={formData.OTType || ""}
//             labelKey="Pathologist"
//             valueKey="PathologistId"
//             placeholder="Select "
//             // onChange={(val) =>
//             //   setFormData((prev) => ({
//             //     ...prev,
//             //     OTType: val, // ✅ correct field
//             //   }))
//             // }
//           />
//         </div>
//       </div>

//       <div className="row g-2">
//         {/* LEFT TABLE */}
//         <div className="col-md-8">
//           <div className="table-responsive">
//             <table className="table table-bordered table-sm">
//               <thead>
//                 <tr>
//                   <th>Test Name</th>
//                   <th>Report Date</th>
//                   <th>Test Detail</th>
//                   <th>Special Remarks</th>
//                   <th>Value</th>
//                   <th>Report Time</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 <tr>
//                   <td>{formData2?.Test}</td>

//                   <td>{formData2?.ReportDate}</td>
//                   <td className="text-primary">Click Here To ...</td>
//                   <td></td>
//                   <td></td>
//                   <td>{formData2?.ReportTime}</td>
//                 </tr>
//               </tbody>
//               {/* <tbody>
//         {[
//           "SUGAR FASTING",
//           "UREA",
//           "CREATININE",
//           "LIPID PROFILE",
//         ].map((test, i) => (
//           <tr key={i}>
//             <td>{test}</td>
//             <td>27/12/2023</td>
//             <td className="text-primary">Click Here To ...</td>
//             <td></td>
//             <td></td>
//             <td>16:48</td>
//           </tr>
//         ))}

//         <tr>
//           <td colSpan={6} style={{ height: 120 }}></td>
//         </tr>
//       </tbody> */}
//             </table>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div className="col-md-4">
//           <label className="form-label mb-0">Lab Sl.No.</label>
//           <input className="form-control form-control-sm mb-2" />

//           <table className="table table-bordered table-sm">
//             <thead>
//               <tr>
//                 <th>Test Property</th>
//                 <th>Value</th>
//                 <th>UOM</th>
//               </tr>
//             </thead>
//             <tbody>
//               {propertyList.length === 0 ? (
//                 <tr>
//                   <td colSpan={3} className="text-center text-muted">
//                     No property found
//                   </td>
//                 </tr>
//               ) : (
//                 propertyList.map((prop, index) => (
//                   <tr key={index}>
//                     <td>{prop.TestProperty}</td>
//                     <td className="fw-bold text-primary">
//                       {propertyValueMap[prop.TestPropertyId] ?? ""}
//                     </td>

//                     <td>{prop.Uom}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* FOOTER BUTTONS */}
//       <div className="d-flex gap-2 flex-wrap mt-2">
//         {[
//           "New",
//           "Edit",
//           "Save",
//           "Delete",
//           "Undo",
//           "Find",
//           "Print",
//           "Previous",
//           "Next",
//           "Exit",
//         ].map((btn) => (
//           <button key={btn} className="btn btn-sm btn-outline-primary">
//             {btn}
//           </button>
//         ))}
//       </div>
//     </div>
//   </div>
// )}
