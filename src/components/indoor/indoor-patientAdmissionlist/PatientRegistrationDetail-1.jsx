import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// NOTE: Make sure you have 'react-barcode' installed, e.g., npm install react-barcode
import Barcode from "react-barcode"; 
import axiosInstance from "../../../axiosInstance";

const PatientRegistrationDetail = () => {
  const { id } = useParams();
  console.log("Admission ID from URL:", id);
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
  const [formData, setFormData] = useState({
    AdmitionNo: "",
    AdmitionDate: new Date().toISOString().split("T")[0],
    BillTime: "12:00",
    AdmitionTime: "13:15",
    OPD: "Y",
    Booking: "N",
    PatientId: "",
    BillNo: "",
    RegistrationNo: "",
    EMRNo: "",
    Package: "N", // Ensure default is 'N' as per Admission Detail example
    PatientName: "",
    Add1: "",
    Add2: "",
    Add3: "",
    PinCode: "",
    Occupation: "",
    DateOfBirth: "",
    Age: "0",
    AgeD: "0",
    AgeN: "0",
    Sex: "M",
    MStatus: "U",
    ReligionId: "HINDU",
    PanNo: "",
    State: "",
    Nationality: "",
    Weight: "0.000",
    PhoneNo: "",
    IdentNo: "",
    AreaId: "", // Added for Area district/police station
    District: "",
    URN: "",
    // ReligionId: "", // Duplicate, removed
    // PanNo: "", // Duplicate, removed
    nameemployer: "",
    Passport: "",
    GurdianName: "",
    Relation: "",
    DietChartId: "",
    RelativeName: "",
    RelativePhoneNo: "",
    DepartmentId: "",
    CompanyId: "",
    AdmissionType: "",
    Company: "N", // Added/defaulted based on Admission Detail example
    refdate: "",
    // DepartmentId: "", // Duplicate, removed
    BedId: "",
    BedRate: "",
    NursingCharge: "0",
    UCDoctor1Id: "",
    UCDoctor2Id: "",
    UCDoctor3Id: "",
    DayCareYN: "N", // Defaulted to 'N' as per Admission Detail example
    Particular: "",
    BMDCharge: "0",
    HealthCardNo: "",
    DayCareBedRate: "0.00",
    Nameemp: "",
    empcode: "",
    PatientsDoctor: "",
    DiseaseId: "",
    PolcNo: "",
    MEXECUTIVE: "",
    RMOId: "",
    CardNo: "",
    RefDoctorId: "",
    CCNNo: "",
    RefDoctorId2: "",
    DiseaseCode: "",
    PackageAmount: "0.00",
    TotalPackage: "0.00",
    DischargeDate: "",
    FinalBillDate: "",
    AdmissionBy: "Admin",
    CurrentUser: "Admin",
    oprationdate: new Date().toISOString().split("T")[0], // Defaulted to today's date
    optime: "07:51 AM", // Defaulted as per Admission Detail example
    FFN: "",
    optdiagoinc: "",
    optmediinc: "",
    optotherchargeinc: "",
    optotinc: "",
    Referral: "N", // Defaulted to 'N'
    ReferralId: "",
    PackageId: "",
    InsComp: "",
    Remarks: "",
    SpRemarks: "",
    CashLess: "N", // Defaulted to 'N'
    packagevalid: "2000-01-01",
    packagestart: "2000-01-01",
    BedYN: "N",
  });

  useEffect(() => {
    if (id && id !== 'new') { // Check for 'new' keyword to prevent API call on new creation
      fetchAdmission();
    } else if (id === 'new' && mode !== 'create') {
        // Handle case where URL is /patient-registration/new
        setMode('create');
        // Optionally reset form data here if needed, but it's already set to defaults
    }
  }, [id]);

  const fetchAdmission = async () => {
    try {
      setLoading(true);
      // const decodedId = decodeURIComponent(id);
      const decodedId =id;
      const response = await axiosInstance.get(`/admission/${decodedId}`);
      if (response.data.success) {
        const apiData = response.data.data;
        console.log("API Data:", apiData);
        setFormData({
          ...apiData,
          AdmitionDate: apiData.AdmitionDate
            ? apiData.AdmitionDate.substring(0, 10)
            : new Date().toISOString().split("T")[0],
          OPD: apiData.OPD || "Y",
          oprationdate: apiData.oprationdate
            ? apiData.oprationdate.substring(0, 10)
            : new Date().toISOString().split("T")[0],
          packagevalid: apiData.packagevalid
            ? apiData.packagevalid.substring(0, 10)
            : "2000-01-01",
          packagestart: apiData.packagestart
            ? apiData.packagestart.substring(0, 10)
            : "2000-01-01",
          refdate: apiData.refdate ? apiData.refdate.substring(0, 10) : "",
          // Ensure all fields have fallbacks to prevent undefined values in controlled inputs
          Package: apiData.Package || "N",
          DayCareYN: apiData.DayCareYN || "N",
          Referral: apiData.Referral || "N",
          CashLess: apiData.CashLess || "N",
          optime: apiData.optime || "07:51 AM",
        });
      }
    } catch (error) {
      console.error("Error fetching admission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response =
        mode === "create"
          ? await axiosInstance.post("/admission", formData)
          : await axiosInstance.put(
              `/admission/${decodeURIComponent(id)}`,
              formData
            );

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
    { label: "List", onClick: () => navigate("/patient-registration"), variant: "outline-light" },
    { label: "Detail", variant: "primary" },
    { label: "MRD", variant: "outline-light" },
  ];

  const footerActions = [
    {
      label: "New",
      onClick: () => {
        setMode("create");
        setFormData({
          ...formData,
          AdmitionNo: "",
          PatientName: "",
          AdmitionDate: new Date().toISOString().split("T")[0],
        });
        navigate("/patient-registration/new?mode=create", { replace: true });
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
    { label: "Exit", onClick: () => navigate("/patient-registration"), variant: "primary" },
  ];

  return (
    <>
      <div className="container-fluid py-4 px-lg-4">
        <div className="panel">
          {/* ================== HEADER ================== */}
          <div className="panel-header d-flex justify-content-between align-items-center">
            <div className="panel-title fw-bold">Patient Registration - Detail</div>

            <div className="tabs d-flex gap-2">
              {headerTabs.map((tab, index) => (
                <button
                  key={index}
                  className={`btn btn-sm btn-${tab.variant}`}
                  onClick={tab.onClick}
                  disabled={tab.disabled}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ================== BODY ================== */}
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
                <select
                  name="OPD"
                  className="form-select form-select-sm"
                  value={formData.OPD}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Booking [Y/N]</label>
                <select
                  name="Booking"
                  className="form-select form-select-sm"
                  value={formData.Booking}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="N">N</option>
                  <option value="Y">Y</option>
                </select>
              </div>

              {/* Barcode and other fields moved here for closer resemblance */}
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
              <div className="col-md-2">
                <label className="form-label small">Package [Y/N]</label>
                <select
                  name="Package"
                  className="form-select form-select-sm"
                  value={formData.Package}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="N">N</option>
                  <option value="Y">Y</option>
                </select>
              </div>
            </div>

            {/* BARCODE */}
            <div className="text-end mt-3">
              {formData.AdmitionNo && (
                <>
                  <Barcode
                    value={formData.AdmitionNo}
                    format="CODE128"
                    width={2}
                    height={40}
                    displayValue={false} // Match the visual style of the example
                    margin={5}
                  />
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

              {/* DOB, Age, Sex, Marital Status, Phone, ID Proof, Religion, PAN No, State, Nationality, Weight, District/PS, URN */}
              <div className="col-md-2">
                <label className="form-label small">DOB</label>
                {/* Note: DOB field is missing in formData and original registration detail but present in admission detail.
                    Using a placeholder text input for consistency if needed. */}
                <input
                  type="text" // Should be type="date" but sticking to text for placeholder consistency
                  name="DateOfBirth"
                  className="form-control form-control-sm"
                  value={formData.DateOfBirth}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Age (Y/M/D)</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    name="Age"
                    className="form-control"
                    placeholder="Y"
                    value={formData.Age}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                  <span className="input-group-text p-1">Y</span>
                  <input
                    type="text"
                    name="AgeD"
                    className="form-control"
                    placeholder="M"
                    value={formData.AgeD}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                  <span className="input-group-text p-1">M</span>
                  <input
                    type="text"
                    name="AgeN"
                    className="form-control"
                    placeholder="D"
                    value={formData.AgeN}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                  <span className="input-group-text p-1">D</span>
                </div>
              </div>
              <div className="col-md-1">
                <label className="form-label small">Sex</label>
                <select
                  name="Sex"
                  className="form-select form-select-sm"
                  value={formData.Sex}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="M">M</option>
                  <option value="F">F</option>
                  <option value="O">O</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Marital Status</label>
                {/* Marital Status not explicitly in formData, using text input */}
                <input
                  type="text"
                  name="MStatus"
                  className="form-control form-control-sm"
                  value={formData.MStatus}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Phone</label>
                <input
                  type="text"
                  name="PhoneNo"
                  className="form-control form-control-sm"
                  value={formData.PhoneNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">ID Proof</label>
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
                <input
                  type="text"
                  name="ReligionId"
                  className="form-control form-control-sm"
                  value={formData.ReligionId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
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
                <label className="form-label small">State</label>
                <input
                  type="text"
                  name="State" // Original code had PanNo here, fixed to State
                  className="form-control form-control-sm"
                  value={formData.State}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Nationality</label>
                <input
                  type="text"
                  name="Nationality" // Original code had Passport here, fixed to Nationality
                  className="form-control form-control-sm"
                  value={formData.Nationality}
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
                <label className="form-label small">District / PS</label>
                <input
                  type="text"
                  name="AreaId" // Used AreaId as it seems to be the one holding the value
                  className="form-control form-control-sm"
                  value={formData.AreaId}
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
                <label className="form-label small">Guardian Name</label>
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
                  type="text"
                  name="RelativePhoneNo"
                  className="form-control form-control-sm"
                  value={formData.RelativePhoneNo}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Company [Y/N]</label>
                <input
                  type="text"
                  name="Company"
                  className="form-control form-control-sm"
                  value={formData.Company}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Company Name</label>
                <input
                  type="text"
                  name="CompanyId"
                  className="form-control form-control-sm"
                  value={formData.CompanyId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
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
                <input
                  type="text"
                  name="AdmissionType"
                  className="form-control form-control-sm"
                  value={formData.AdmissionType}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Diet</label>
                <input
                  type="text"
                  name="DietChartId"
                  className="form-control form-control-sm"
                  value={formData.DietChartId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
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
                <input
                  type="text"
                  name="DepartmentId"
                  className="form-control form-control-sm"
                  value={formData.DepartmentId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Under Care Dr. 1</label>
                <input
                  type="text"
                  name="UCDoctor1Id"
                  className="form-control form-control-sm"
                  value={formData.UCDoctor1Id}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Under Care Dr. 2</label>
                <input
                  type="text"
                  name="UCDoctor2Id"
                  className="form-control form-control-sm"
                  value={formData.UCDoctor2Id}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Under Care Dr. 3</label>
                <input
                  type="text"
                  name="UCDoctor3Id"
                  className="form-control form-control-sm"
                  value={formData.UCDoctor3Id}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Referral [Y/N]</label>
                <input
                  type="text"
                  name="Referral"
                  className="form-control form-control-sm"
                  value={formData.Referral}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Referral Name</label>
                <input
                  type="text"
                  name="ReferralId"
                  className="form-control form-control-sm"
                  value={formData.ReferralId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Package [Y/N]</label>
                <input
                  type="text"
                  name="Package"
                  className="form-control form-control-sm"
                  value={formData.Package}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Package Name</label>
                <input
                  type="text"
                  name="PackageId"
                  className="form-control form-control-sm"
                  value={formData.PackageId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
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
                <label className="form-label small">Cashless [Y/N]</label>
                <input
                  type="text"
                  name="CashLess"
                  className="form-control form-control-sm"
                  value={formData.CashLess}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Insurance Company</label>
                <input
                  type="text"
                  name="InsComp"
                  className="form-control form-control-sm"
                  value={formData.InsComp}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Bed No.</label>
                <input
                  type="text"
                  name="BedId"
                  className="form-control form-control-sm"
                  value={formData.BedId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Bed Rate</label>
                <input
                  type="text"
                  name="BedRate"
                  className="form-control form-control-sm"
                  value={formData.BedRate}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Nursing Charge</label>
                <input
                  type="text"
                  name="NursingCharge"
                  className="form-control form-control-sm"
                  value={formData.NursingCharge}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">RMO Charge</label>
                {/* RMO Charge not explicitly in formData, using a placeholder/related field */}
                <input
                  type="text"
                  name="BMDCharge" // Using a related charge field
                  className="form-control form-control-sm"
                  value={formData.BMDCharge}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Day Care [Y/N]</label>
                <select
                  name="DayCareYN"
                  className="form-select form-select-sm"
                  value={formData.DayCareYN}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Particular</label>
                <input
                  type="text"
                  name="Particular"
                  className="form-control form-control-sm"
                  value={formData.Particular}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small">Day Care Bed Rate</label>
                <input
                  type="text"
                  name="DayCareBedRate"
                  className="form-control form-control-sm"
                  value={formData.DayCareBedRate}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Employee</label>
                {/* Employee not explicitly mapped, using a placeholder/related field */}
                <input
                  type="text"
                  name="Nameemp" // Using Nameemp as employee name field
                  className="form-control form-control-sm"
                  value={formData.Nameemp}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Disease</label>
                <input
                  type="text"
                  name="DiseaseId"
                  className="form-control form-control-sm"
                  value={formData.DiseaseId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">R.M.O.</label>
                <input
                  type="text"
                  name="RMOId"
                  className="form-control form-control-sm"
                  value={formData.RMOId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small">Referring Doctor</label>
                <input
                  type="text"
                  name="RefDoctorId"
                  className="form-control form-control-sm"
                  value={formData.RefDoctorId}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Referring Doctor 2</label>
                <input
                  type="text"
                  name="RefDoctorId2"
                  className="form-control form-control-sm"
                  value={formData.RefDoctorId2}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small">Package Amount</label>
                <input
                  type="text"
                  name="PackageAmount"
                  className="form-control form-control-sm"
                  value={formData.PackageAmount}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Total Package</label>
                <input
                  type="text"
                  name="TotalPackage"
                  className="form-control form-control-sm"
                  value={formData.TotalPackage}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
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
                <label className="form-label small">Disease Code</label>
                <input
                  type="text"
                  name="DiseaseCode"
                  className="form-control form-control-sm"
                  value={formData.DiseaseCode}
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
                  name="AdmissionBy"
                  className="form-control form-control-sm"
                  value={formData.AdmissionBy}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Current User</label>
                <input
                  type="text"
                  name="CurrentUser"
                  className="form-control form-control-sm"
                  value={formData.CurrentUser}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
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
                <label className="form-label small">Special Remarks (Notes)</label>
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

          {/* ================== FOOTER ================== */}
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
            {/* Additional buttons from Admission Detail example (Barcode, H Risk Consent, Consent) */}
            <div className="btn-group">
              <button className="btn btn-sm btn-secondary">Barcode</button>
              <button className="btn btn-sm btn-secondary">H Risk Consent</button>
              <button className="btn btn-sm btn-secondary">Consent</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientRegistrationDetail;