import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
// import Barcode from 'react-barcode';

const PatientRegistrationDetail = () => {
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
    Package: "",
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
    ReligionId: "",
    PanNo: "",
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
    // Company: '',
    refdate: "",
    DepartmentId: "",
    BedId: "",
    BedRate: "",
    NursingCharge: "0",
    UCDoctor1Id: "",
    UCDoctor2Id: "",
    UCDoctor3Id: "",
    DayCareYN: "Y",
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
    oprationdate: "",
    optime: "",
    FFN: "",
    optdiagoinc: "",
    optmediinc: "",
    optotherchargeinc: "",
    optotinc: "",
    Referral: "",
    ReferralId: "",
    PackageId: "",
    InsComp: "",
    Remarks: "",
    SpRemarks: "",
    CashLess: "Y",
    packagevalid: "2000-01-01",
    packagestart: "2000-01-01",
    BedYN: "N",
  });

  useEffect(() => {
    if (id) {
      fetchAdmission();
    }
  }, [id]);

  const fetchAdmission = async () => {
    try {
      setLoading(true);
      const decodedId = decodeURIComponent(id);
      const response = await axiosInstance.get(`/admission/${decodedId}`);
      if (response.data.success) {
        const apiData = response.data.data;
        console.log("API Data:", apiData);
        setFormData({
          ...apiData,
          AdmitionDate: apiData.AdmitionDate
            ? apiData.AdmitionDate.substring(0, 10)
            : "",
          OPD: apiData.OPD || "Y",
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

  return (
    <div className="panel">
      {/* ================== HEADER ================== */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <div className="panel-title fw-bold">Patient Admission - Detail</div>

        <div className="tabs d-flex gap-2">
          <button className="btn btn-sm btn-outline-light">List</button>
          <button className="btn btn-sm btn-primary">Detail</button>
          <button className="btn btn-sm btn-outline-light">MRD</button>
        </div>
      </div>

      {/* ================== BODY ================== */}
      <div className="panel-body">
        {/* ==== Admission Detail ==== */}
        <h5 className="fw-bold text-info mb-3">Admission Detail</h5>

        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label small">Admission No</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="AdmitionNo"
              value={formData.AdmitionNo}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              name="AdmitionDate"
              value={formData.AdmitionDate}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Bill Time</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="BillTime"
              value={formData.BillTime}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Admission Time</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="AdmitionTime"
              value={formData.AdmitionTime}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">O.P.D. [Y/N]</label>
            <select
              name="OPD"
              className="form-select"
              value={formData.OPD}
              onChange={handleInputChange}
              disabled={mode === "view"}
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>
          <div className="col-md-1">
            <label className="form-label small">Booking [Y/N]</label>
            <select
              name="Booking"
              className="form-select"
              value={formData.Booking}
              onChange={handleInputChange}
              disabled={mode === "view"}
            >
              <option value="N">N</option>
              <option value="Y">Y</option>
            </select>
          </div>
          <div className="col-md-1">
            <label className="form-label small">Patient Id</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="PatientId"
              value={formData.PatientId}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-1">
            <label className="form-label small">Package [Y/N]</label>
            <select
              name="Package"
              className="form-select"
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
          <img
            src="https://barcode.tec-it.com/barcode.ashx?data=A-001043%2F24-25&code=Code128"
            alt="barcode"
          />
          <div className="fw-bold">A-001043/24-25</div>
        </div>

        <hr className="my-4" />

        {/* ==== Patient Detail ==== */}
        <h5 className="fw-bold text-info mb-3">Patient Detail</h5>

        <div className="row g-3">
          <div className={`col-md-4`}>
            <label className="form-label small">Patient Name</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="PatientName"
              value={formData.PatientName}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className={`col-md-4`}>
            <label className="form-label small">Address</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="PatientName"
              value={formData.Add1}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className={`col-md-4`}>
            <label className="form-label small">Area</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="Add2"
              value={formData.Add2}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className={`col-md-4`}>
            <label className="form-label small">Pin Code</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="Add3"
              value={formData.Add3}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className={`col-md-4`}>
            <label className="form-label small">Occupation</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="Occupation"
              value={formData.Occupation}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className={`col-md-4`}>
            <label className="form-label small">Age</label>
            <div className="input-group gap-2">
              <span>
                <label>Y</label>
                <input
                  type="text"
                  name="Age"
                  className="form-control"
                  placeholder="Y"
                  value={formData.Age}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </span>

              <span>
                <label>M</label>
                <input
                  type="text"
                  name="AgeD"
                  className="form-control"
                  placeholder="M"
                  value={formData.AgeD}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </span>

              <span>
                <label>D</label>
                <input
                  type="text"
                  name="AgeN"
                  className="form-control"
                  placeholder="D"
                  value={formData.AgeN}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                />
              </span>
            </div>
          </div>
          <div className={`col-md-2`}>
            <label className="form-label small">Sex</label>
            <select
              name="Sex"
              className="form-select"
              value={formData.Sex}
              onChange={handleInputChange}
              disabled={mode === "view"}
            >
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="O">O</option>
            </select>
          </div>
          <div className={`col-md-2`}>
            <label className="form-label small">Marital Status</label>
            <select
              name="marital_status"
              className="form-select"
              value={formData.marital_status}
              onChange={handleInputChange}
              disabled={mode === "view"}
            >
              <option value="M">M</option>
              <option value="U">U</option>
            </select>
          </div>
          <div className={`col-md-2`}>
            <label className="form-label">Weight</label>
            <input
              type="text"
              name="Weight"
              className="form-control form-control-sm"
              value={formData.Weight}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Phone</label>
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
            <label className="form-label">Id Proof(Aadhaar/Passport)</label>
            <input
              type="text"
              name="IdentNo"
              className="form-control form-control-sm"
              value={formData.IdentNo}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">District/ps </label>
            <input
              type="text"
              name="AreaId"
              className="form-control form-control-sm"
              value={formData.AreaId}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">URN</label>
            <input
              type="text"
              name="URN"
              className="form-control form-control-sm"
              value={formData.URN}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Religion</label>
            <input
              type="text"
              name="ReligionId"
              className="form-control form-control-sm"
              value={formData.ReligionId}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">PAN No</label>
            <input
              type="text"
              name="PanNo"
              className="form-control form-control-sm"
              value={formData.PanNo}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">State</label>
            <input
              type="text"
              name="PanNo"
              className="form-control form-control-sm"
              value={formData.PanNo}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Nationality</label>
            <input
              type="text"
              name="Passport"
              className="form-control form-control-sm"
              value={formData.Passport}
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
            <label className="form-label small">W/O, S/O, D/O</label>
            <input
              className="form-control form-control-sm"
              type="text"
              name="GurdianName"
              value={formData.GurdianName}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Relation</label>
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
            <label className="form-label">Relative Name</label>
            <input
              type="text"
              name="RelativeName"
              className="form-control form-control-sm"
              value={formData.RelativeName}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Phone No</label>
            <input
              type="text"
              name="RelativePhoneNo"
              className="form-control form-control-sm"
              value={formData.RelativePhoneNo}
              onChange={handleInputChange}
              disabled={mode === "view"}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">
              Diet (SELECT * FROM `dietchart` show dropdown)
            </label>
            <select
              name="DietChartId"
              className="form-select form-select-sm"
              value={formData.DietChartId}
              onChange={handleInputChange}
              disabled={mode === "view"}
            >

              <option value="">Select Diet</option>
              <option value="VEG">VEG</option>
              <option value="SUSHIL">SUSHIL</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small">Company</label>
            <input className="form-control form-control-sm" defaultValue="N" />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Admission Type</label>
            <input
              className="form-control form-control-sm"
              defaultValue="None"
            />
          </div>
        </div>

        <hr className="my-4" />

        {/* ========================================================= */}
        {/* ============== OTHER DETAILS  — FULL RESTORED ============ */}
        {/* ========================================================= */}

        <h5 className="fw-bold text-info mb-3">Other Details</h5>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small">Department</label>
            <input
              className="form-control form-control-sm"
              defaultValue="DELUX CABIN"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Under Care</label>
            <input
              className="form-control form-control-sm"
              defaultValue="ABHRA MUKHOPADHYAY"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Doctor</label>
            <input className="form-control form-control-sm" />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Referral</label>
            <input className="form-control form-control-sm" defaultValue="N" />
          </div>
          <div className="col-md-1">
            <label className="form-label small">Package</label>
            <input className="form-control form-control-sm" defaultValue="N" />
          </div>

          <div className="col-md-2">
            <label className="form-label small">Valid Till</label>
            <input
              className="form-control form-control-sm"
              defaultValue="01/01/1900"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Start Date</label>
            <input
              className="form-control form-control-sm"
              defaultValue="01/01/1900"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Bed</label>
            <input className="form-control form-control-sm" defaultValue="Y" />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Cashless</label>
            <input className="form-control form-control-sm" defaultValue="N" />
          </div>
          <div className="col-md-4">
            <label className="form-label small">Insurance Company</label>
            <input className="form-control form-control-sm" />
          </div>

          <div className="col-md-2">
            <label className="form-label small">Bed No.</label>
            <input
              className="form-control form-control-sm"
              defaultValue="DC-3RD-(01)"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Bed Rate</label>
            <input
              className="form-control form-control-sm"
              defaultValue="3500"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Nursing Charge</label>
            <input className="form-control form-control-sm" defaultValue="0" />
          </div>
          <div className="col-md-2">
            <label className="form-label small">RMO Charge</label>
            <input className="form-control form-control-sm" defaultValue="0" />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Day Care</label>
            <input className="form-control form-control-sm" defaultValue="N" />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Particular</label>
            <input className="form-control form-control-sm" />
          </div>

          <div className="col-md-2">
            <label className="form-label small">Day Care Bed Rate</label>
            <input
              className="form-control form-control-sm"
              defaultValue="0.00"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Employee</label>
            <input className="form-control form-control-sm" />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Disease</label>
            <input className="form-control form-control-sm" />
          </div>
          <div className="col-md-3">
            <label className="form-label small">R.M.O.</label>
            <input
              className="form-control form-control-sm"
              defaultValue="MO KAPIL KUMAR SHAW"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small">Referring Doctor</label>
            <input className="form-control form-control-sm" />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Referring Doctor 2</label>
            <input className="form-control form-control-sm" />
          </div>

          <div className="col-md-3">
            <label className="form-label small">Package Amount</label>
            <input
              className="form-control form-control-sm"
              defaultValue="0.00"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Total Package</label>
            <input className="form-control form-control-sm" />
          </div>

          <div className="col-md-3">
            <label className="form-label small">Card No</label>
            <input className="form-control form-control-sm" />
          </div>
          <div className="col-md-3">
            <label className="form-label small">CCN No</label>
            <input className="form-control form-control-sm" />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Disease Code</label>
            <input className="form-control form-control-sm" />
          </div>

          <div className="col-md-3">
            <label className="form-label small">Admission By</label>
            <input
              className="form-control form-control-sm"
              defaultValue="SANJAY ST."
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Current User</label>
            <input
              className="form-control form-control-sm"
              defaultValue="Admin"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small">Operation Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              defaultValue="2025-02-22"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Operation Time</label>
            <input
              className="form-control form-control-sm"
              defaultValue="07:51 AM"
            />
          </div>

          <div className="col-md-12">
            <label className="form-label small">Remarks</label>
            <textarea
              className="form-control form-control-sm"
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>

      {/* ================== FOOTER ================== */}
      {/* <div className="panel-footer d-flex justify-content-between flex-wrap gap-2 p-3">
        <div className="btn-group">
          {["New", "Edit", "Save", "Delete", "Undo", "Print", "Exit"].map((b,i)=>(
            <button key={i} className="btn btn-sm btn-primary">{b}</button>
          ))}
        </div>

        <div className="btn-group">
          <button className="btn btn-sm btn-secondary">Barcode</button>
          <button className="btn btn-sm btn-secondary">H Risk Consent</button>
          <button className="btn btn-sm btn-secondary">Consent</button>
        </div>
      </div> */}
    </div>
  );
};

export default PatientRegistrationDetail;
