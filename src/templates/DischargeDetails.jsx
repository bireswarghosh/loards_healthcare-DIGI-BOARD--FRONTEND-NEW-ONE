import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import useAxiosFetch from "./Fetch";
import { useForm, } from "react-hook-form";
// import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
// import AsyncApiSelect from "./AsyncApiSelect";
import JsBarcode from "jsbarcode";
import axiosInstance from "../axiosInstance";
import AsyncApiSelect from "../components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/AsyncApiSelect";
import useAxiosFetch from "./DiagnosisMaster/Fetch";
// import axiosInstance from "../axiosInstance";

const DischargeDetails = ({ mode }) => {
  // console.log("mode",mode);

  const navigate = useNavigate();
  const { id } = useParams();

  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      DisCerNo: "",
      DisCerTime: new Date().toLocaleTimeString("en-GB", {
  hour: "2-digit",
  minute: "2-digit"
}),
      DisCerDate: new Date().toISOString().split("T")[0],
      DiscType: "",
      OTTypeId: "",
      Remarks: "",
      DischargedBy: "",
      AdmitionId: "",
      AdmitionObj: null,
    },
  });
  const admObj = watch("AdmitionObj");
  const admissionId = watch("AdmitionId");
  useEffect(() => {
    if (admissionId) {
      sessionStorage.setItem("selectedAdmitionId", admissionId);
    }
  }, [admissionId]);

  //   fetch dischargedata====================================================
  const { data: dischargeData } = useAxiosFetch(id ? `/discert/${id}` : null, [
    id,
  ]);
  // const admissionId = dischargeData?.AdmitionId;

  const { data: emrData } = useAxiosFetch(id ? `/emr/D-${id}` : null, [id]);
  // fetch by admissionId===================================================
  const { data: patientDetails } = useAxiosFetch(
    admissionId ? `/admission/${admissionId}` : null,
    [admissionId]
  );
  const patient =
    mode == "edit" || "view" ? patientDetails || {} : selectedPatient || {};
  // fetch bed============================
  const { data: bed } = useAxiosFetch(
    patient.BedId ? `/bedMaster/${patient.BedId}` : null,
    [patient.BedId]
  );
  // fetch doctor name===============================
  const { data: doctor } = useAxiosFetch(
    patient?.UCDoctor1Id ? `doctormaster/${patient?.UCDoctor1Id}` : null,
    [patient?.UCDoctor1Id]
  );

  // fetch user==============================
  const { data: users } = useAxiosFetch("/auth/users", []);
  const userMap = useMemo(() => {
    const map = {};
    (users || []).forEach((u) => {
      map[u.UserId] = u.UserName;
    });
    return map;
  }, [users]);

  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        // AdmitionId: dischargeData?.AdmitionId,
        DisCerDate: data.DisCerDate ? `${data.DisCerDate}T00:00:00.000Z` : new Date().toISOString().split("T")[0],
        // diagnosis: diagnosisRows,
        // complaints: complaintRows,
      };

      // const response = await axiosInstance.put(`/discert/${id}`, payload);

      // console.log("UPDATE SUCCESS:", response.data);
      // toast.success("Updated Successfully!")
      if (mode === "edit") {
        const res = await axiosInstance.put(`/discert/${id}`, payload);
        // toast.success("Updated Successfully!");
      } else {
        const postRes = await axiosInstance.post("/discert", payload);
        const postId = await postRes.data.DisCerId;
        console.log(postId);
        navigate(`/discharge/${encodeURIComponent(postId)}/advice`);
        // toast.success("Added Successfully!");
      }
      const diagnosisPayload = diagnosisRows
        .filter((item) => item.diagnosis.trim() !== "")
        .map((item) => ({
          diagonisis: item.diagnosis,
        }));

      const complaintPayload = complaintRows
        .filter((item) => item.complaint.trim() !== "")
        .map((item) => ({
          chief: item.complaint,
        }));

      const emrPayload = {
        RegistrationId: selectedPatient?.RegistrationId || "",
        VisitId: "",
        admissionid: null,
        diagnosis: diagnosisPayload,
        complaints: complaintPayload,
      };

      await axiosInstance.post("/emr/bulk", emrPayload);

      toast.success("Navigated to advice!");
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  //   =====================Rhf ==============================

  useEffect(() => {
    if (!dischargeData && mode !== "edit") return;

    reset({
      DisCerNo: dischargeData.DisCerNo,
      DisCerTime: dischargeData.DisCerTime,
      DisCerDate: dischargeData?.DisCerDate?.split("T")[0],
      DiscType: dischargeData.DiscType,
      OTTypeId: dischargeData.OTTypeId,
      Remarks: dischargeData.Remarks,
      DischargedBy: dischargeData.DischargedBy,
      AdmitionId: dischargeData.AdmitionId,
      UserId: dischargeData.UserId,
      AdmitionObj: {
        label: dischargeData.AdmitionId,
        value: dischargeData.AdmitionId,
      },
    });
  }, [dischargeData, mode, reset]);

  useEffect(() => {
    if (!admObj?.value) {
      setSelectedPatient(null);
      return;
    }

    const loadPatient = async () => {
      try {
        const res = await axiosInstance.get(`/admission/${admObj.value}`);
        setSelectedPatient(res.data);
      } catch (err) {
        console.error(err);
        setSelectedPatient(null);
      }
    };

    loadPatient();
  }, [admObj]);

  const [activeTab, setActiveTab] = useState("Detail");

  const [diagnosisRows, setDiagnosisRows] = useState([
    // {
    //   sl: 1,
    //   diagnosis: "HEAD INJURY WITH FOCAL PARENCHYMAL HEMORRHAGIC CONTUSIONS.",
    // },
    { sl: 1, diagnosis: "" },
  ]);

  const [complaintRows, setComplaintRows] = useState([
    // { sl: 1, complaint: "ON ADMISSION PATIENT WAS UNCONCIOUS STATE." },
    // { sl: 2, complaint: "ALLEGED H/O- HEAD INJURY DUE TO FALL FROM HEIGHT." },
    { sl: 1, complaint: "" },
  ]);

  // --- HANDLERS ---
  const handleDiagnosisChange = (index, value) => {
    const newData = [...diagnosisRows];
    newData[index].diagnosis = value;
    if (index === newData.length - 1 && value.trim() !== "") {
      newData.push({ sl: newData.length + 1, diagnosis: "" });
    }
    setDiagnosisRows(newData);
  };

  const handleComplaintChange = (index, value) => {
    const newData = [...complaintRows];
    newData[index].complaint = value;
    if (index === newData.length - 1 && value.trim() !== "") {
    }
    setComplaintRows(newData);
  };

  useEffect(() => {
    if (!emrData) return;

    // ---------------- DIAGNOSIS ----------------
    if (emrData.diagnosis?.length > 0) {
      const diag = emrData.diagnosis
        .sort((a, b) => a.SlNo - b.SlNo)
        .map((item) => ({
          sl: item.SlNo,
          diagnosis: item.diagonisis || "",
        }));

      // last empty row add
      diag.push({ sl: diag.length + 1, diagnosis: "" });

      setDiagnosisRows(diag);
    }

    // ---------------- COMPLAINTS ----------------
    if (emrData.complaints?.length > 0) {
      const comp = emrData.complaints
        .sort((a, b) => a.SlNo - b.SlNo)
        .map((item) => ({
          sl: item.SlNo,
          complaint: item.chief || item.Complaint || "",
        }));

      // last empty row add
      comp.push({ sl: comp.length + 1, complaint: "" });

      setComplaintRows(comp);
    }
  }, [emrData]);

  // --- STYLES ---
  const inputStyle = {
    fontSize: "11px",
    padding: "0px 4px",
    height: "22px",
    borderRadius: "0px",
  };
  const labelStyle = {
    fontSize: "11px",
    margin: "0",
    whiteSpace: "nowrap",
    color: "#545554ff",
    fontWeight: "500",
  };
  const headerStyle = { fontSize: "12px", fontWeight: "600", margin: 0 };

  const barcodeImg = useMemo(() => {
    if (!dischargeData?.AdmitionId) return "";
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, `A-${dischargeData?.AdmitionId}`, {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: true,
    });
    return canvas.toDataURL("image/png");
  }, [dischargeData?.AdmitionId]);
  return (
    <>
      {mode === "view" && (
        <button
          className="btn btn-success btn-sm"
          onClick={() =>
            navigate(`/discharge/${encodeURIComponent(id)}/print`, "_blank")
          }
        >
          🖨 Print
        </button>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div id="printSection">
          {/* <h1>{id ? id : "Add page no id"}</h1> */}
          {/* {mode === "add" && "Add Discharge page"}
          {mode === "view" && "View Discharge page"}
          {mode === "edit" && "edit Discharge page"} */}

          <div className="d-flex flex-column h-100 overflow-hidden">
            {/* --- Form Section (Fixed Height Content) --- */}
            <div className="flex-shrink-0">
              {/* Top Row */}
              <div className="panel border rounded p-1  mb-1">
                <div className="row g-1 align-items-center mb-1">
                  <div className="col-md-4 d-flex align-items-center gap-2">
                    <label style={labelStyle}>Advise No.</label>
                    <input
                      className="form-control form-control-sm "
                      {...register("DisCerNo")}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-center gap-2">
                    <label style={labelStyle}>DischargeTime</label>
                    <input
                      className="form-control form-control-sm"
                      {...register("DisCerTime")}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-center gap-2">
                    <label style={labelStyle}>Discharge Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      {...register("DisCerDate")}
                    />
                  </div>
                </div>
                <div className="row g-1 align-items-center">
                  <div className="col-md-3 d-flex align-items-center gap-2">
                    <label style={labelStyle}>Patient Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-bold"
                      style={inputStyle}
                      value={patient?.PatientName}
                    />
                  </div>
                  <div className="col-md-4 ">
                    <label style={labelStyle}>Admission No.</label>
                    {/* <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ ...inputStyle, width: "100px" }}
                    value={`A-${dischargeData?.AdmitionId || ""}`}
                  /> */}
                    <AsyncApiSelect
                      api="https://lords-backend.onrender.com/api/v1/admission/search"
                      // value={watch("AdmitionId")}
                      // onChange={(val) => setValue("AdmitionId", val)}
                      value={watch("AdmitionObj")} // 👈 object field
                      onChange={(opt) => {
                        setValue("AdmitionObj", opt); // UI
                        setValue("AdmitionId", opt?.value || ""); // API
                        if (opt?.value) {
                          sessionStorage.setItem(
                            "selectedAdmitionId",
                            opt.value
                          );
                        }
                      }}
                      searchKey="q"
                      labelKey="AdmitionId"
                      valueKey="AdmitionId"
                      showKey="PatientName"
                      defaultPage={1}
                      isDisabled={mode !== "add"}
                    />
                    <input type="hidden" {...register("AdmitionId")} />
                  </div>
                  <div className="col-md-6 d-flex align-items-center gap-2">
                    <label style={labelStyle}>Bed</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ ...inputStyle, width: "60px" }}
                      value={bed?.Bed}
                    />
                    <label style={labelStyle}>AdmTime</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ ...inputStyle, width: "80px" }}
                      value={patient?.AdmitionTime}
                    />
                  </div>
                </div>
              </div>

              {/* Patient Detail */}
              <div className="panel border rounded-1 p-2 mb-1 position-relative">
                <span
                  className="position-absolute top-0 start-0 translate-middle-y ms-2 px-1  text-primary small fw-bold"
                  style={{ fontSize: "10px" }}
                >
                  Patient Detail
                </span>
                <div className="row g-1 pt-1">
                  <div className="col-md-9">
                    <div className="row g-1 mb-1">
                      <div className="col-md-4 d-flex align-items-center gap-1">
                        <label style={labelStyle}>Age</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ ...inputStyle, width: "40px" }}
                          value={patient?.Age}
                        />

                        <label style={labelStyle}>Sex</label>
                        <select
                          className="form-select form-select-sm p-0 ps-1"
                          style={{ ...inputStyle, width: "50px" }}
                          value={patient?.Sex}
                        >
                          <option value="">Select</option>
                          <option value="M">M</option>
                          <option value="F">F</option>
                          <option value="O">O</option>
                        </select>
                      </div>
                      <div className="col-md-4 d-flex align-items-center gap-1">
                        <label style={labelStyle}>Phone</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={inputStyle}
                          value={patient?.PhoneNo}
                        />
                      </div>
                      <div className="col-md-4 d-flex align-items-center gap-1">
                        <label style={labelStyle}>Marital Status</label>
                        <select
                          className="form-select form-select-sm p-0 ps-1"
                          style={inputStyle}
                          value={patient?.MStatus}
                        >
                          <option value="">Select</option>
                          <option value="M">M</option>
                          <option value="U">U</option>
                        </select>
                      </div>
                    </div>
                    <div className="row g-1 mb-1">
                      <div className="col-md-4 d-flex align-items-center gap-1">
                        <label style={labelStyle}>AddmitionDate</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          style={inputStyle}
                          value={patient?.AdmitionDate?.split("T")[0]}
                        />
                      </div>
                      <div className="col-md-4 d-flex align-items-center gap-1">
                        <label style={labelStyle}>W/O S/O</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={inputStyle}
                          value={patient?.RelativeName}
                        />
                      </div>
                      <div className="col-md-4 d-flex align-items-center gap-1">
                        <label style={labelStyle}>Relation</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={inputStyle}
                          value={patient?.Relation}
                        />
                      </div>
                    </div>
                    <div className="row g-1 align-items-center">
                      <div className="col-md-12 d-flex align-items-center gap-1">
                        <label style={labelStyle}>Address</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={inputStyle}
                          value={`${patient?.Add1 || ""}-${
                            patient?.Add2 || ""
                          }-${patient?.Add3 || ""}`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 d-flex align-items-center justify-content-center">
                    <div className="border p-2  text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center">
                      {barcodeImg && <img src={barcodeImg} alt="barcode" />}
                    </div>
                  </div>
                </div>
                <div className="row g-1 mt-1 border-top pt-1">
                  <div className="col-md-3 d-flex align-items-center gap-1">
                    <label style={labelStyle}>Nationality</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={inputStyle}
                      value={patient?.Passport}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-center gap-1">
                    <label style={labelStyle}>Under Care Dr.</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={inputStyle}
                      value={doctor.Doctor}
                    />
                  </div>
                  <div className="col-md-3 d-flex align-items-center gap-1">
                    <label style={labelStyle}>Referral</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={inputStyle}
                      value={patient?.Referral}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-center gap-1">
                    <label style={labelStyle}>Corporate</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Discharge Info & Remarks */}
              <div className="row g-1 mb-1 align-items-center">
                <div className="col-md-4 d-flex align-items-center gap-1">
                  <label style={labelStyle}>Reason Discharge</label>
                  <select
                    className="form-select form-select-sm"
                    {...register("DiscType")}
                  >
                    <option value="0">Normal Discharge</option>
                    <option value="1">Discharge On Request</option>
                    <option value="2">Discharge on Risk Bond</option>
                    <option value="3">Expired</option>
                    <option value="4">Referred</option>
                    <option value="5">Lama</option>
                    <option value="6">Discharge Against Medical Service</option>
                    <option value="7">Left Against Discharge Advice</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-center gap-1">
                  <label style={labelStyle}>OT Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    style={inputStyle}
                    value={patient?.oprationdate?.split("T")[0]}
                  />
                </div>
                <div className="col-md-5 d-flex align-items-center gap-1">
                  <label style={labelStyle}>O.T.Type</label>
                  <select
                    name=""
                    className="form-select form-select-sm"
                    style={{ ...inputStyle }}
                    {...register("OTTypeId")}
                  >
                    <option value="">Select</option>
                    <option value="0">Normal</option>
                  </select>

                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ ...inputStyle, width: "80px" }}
                  />
                </div>
              </div>
              <div className="d-flex align-items-center gap-1 mb-2">
                <span
                  className="badge bg-secondary rounded-0"
                  style={{ fontSize: "11px" }}
                >
                  Remarks
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-0"
                  style={inputStyle}
                  {...register("Remarks")}
                />
              </div>
            </div>

            {/* --- 4. Main Tables Split (Flex Grow Area) --- */}
            {/* minHeight: 0 is CRITICAL for Flex children to shrink properly */}
            <div className="row g-2 flex-grow-1" style={{ minHeight: 0 }}>
              {/* Left: Diagnosis */}
              {/* <div className="col-md-6 d-flex flex-column h-100">
                <div className="d-flex gap-1 mb-1 flex-shrink-0">
                 
                </div>

                <div
                  className="panel border flex-grow-1 d-flex flex-column"
                  style={{ minHeight: 0, overflow: "hidden" }}
                >
                  <div className="panel-header py-1 px-2  text-center flex-shrink-0">
                    <small style={headerStyle}>Diagnosis</small>
                  </div>
                  <div className="flex-grow-1" style={{ position: "relative" }}>
                    <OverlayScrollbarsComponent
                      style={{
                        height: "100%",
                        width: "100%",
                        // position: "absolute",
                      }}
                    >
                      <table
                        className="table table-bordered table-sm mb-0 small table-hover"
                        style={{ tableLayout: "fixed" }}
                      >
                        <thead className="sticky-top ">
                          <tr>
                            <th style={{ width: "35px", textAlign: "center" }}>
                              Sl
                            </th>
                            <th>Diagnosis</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diagnosisRows.map((row, index) => (
                            <tr
                              key={index}
                              className={
                                index === diagnosisRows.length - 1
                                  ? ""
                                  : "table-warning"
                              }
                            >
                              <td className="text-center ">{row.sl}</td>
                              <td className="p-0">
                                <input
                                  type="text"
                                  className="form-control form-control-sm border-0 rounded-0  h-100 w-100"
                                  style={{
                                    fontSize: "11px",
                                    boxShadow: "none",
                                  }}
                                  value={row.diagnosis}
                                  onChange={(e) =>
                                    handleDiagnosisChange(index, e.target.value)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </OverlayScrollbarsComponent>
                  </div>
                </div>
              </div> */}

              {/* Right: Complaints */}
              {/* <div className="col-md-6 d-flex flex-column h-100">
                <div className="d-flex justify-content-between align-items-center mb-1 flex-shrink-0">
                  <span className="small fw-bold">
                    Present Complains (Reason for Admission)
                  </span>
                 
                </div>

                <div
                  className="panel border flex-grow-1 d-flex flex-column"
                  style={{ minHeight: 0, overflow: "hidden" }}
                >
                  <div className="panel-header py-1 px-2  text-center flex-shrink-0">
                    <small style={headerStyle}>Chief Complaint</small>
                  </div>
                  <div className="flex-grow-1" style={{ position: "relative" }}>
                    <OverlayScrollbarsComponent
                      style={{
                        height: "100%",
                        width: "100%",
                        // position: "absolute",
                      }}
                    >
                      <table
                        className="table table-bordered table-sm mb-0 small table-hover"
                        style={{ tableLayout: "fixed" }}
                      >
                        <thead className="sticky-top ">
                          <tr>
                            <th style={{ width: "35px", textAlign: "center" }}>
                              Sl
                            </th>
                            <th>Chief Complaint</th>
                          </tr>
                        </thead>
                        <tbody>
                          {complaintRows.map((row, index) => (
                            <tr
                              key={index}
                              className={
                                index === complaintRows.length - 1
                                  ? ""
                                  : "table-warning"
                              }
                            >
                              <td className="text-center ">{row.sl}</td>
                              <td className="p-0">
                                <input
                                  type="text"
                                  className="form-control form-control-sm border-0 rounded-0 bg-transparent h-100 w-100"
                                  style={{
                                    fontSize: "11px",
                                    boxShadow: "none",
                                  }}
                                  value={row.complaint}
                                  onChange={(e) =>
                                    handleComplaintChange(index, e.target.value)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </OverlayScrollbarsComponent>
                  </div>
                </div>
              </div> */}
            </div>

            {/* --- 5. Footer (Fixed Height) --- */}
            <div className="d-flex flex-column flex-shrink-0 mt-2">
              <div className="d-flex justify-content-center gap-4 mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-danger fw-bold small">
                    Discharged By
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm fw-bold"
                    style={{ ...inputStyle, width: "100px" }}
                    defaultValue="ROM"
                  />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-danger fw-bold small">
                    Current User
                  </span>
                  <input
                    hidden
                    type="text"
                    className="form-control form-control-sm fw-bold"
                    style={{ ...inputStyle, width: "100px" }}
                    {...register("UserId")}
                  />
                  {/* <input
                    type="text"
                    className="form-control form-control-sm fw-bold"
                    style={{ ...inputStyle, width: "100px" }}
                    value={userMap[dischargeData.UserId]}
                  /> */}
                  <select
                    className="form-select form-select-sm fw-bold"
                    style={{ width: "120px", fontSize: "11px" }}
                    {...register("UserId")}
                  >
                    <option value="">Select User</option>

                    {users?.map((u) => (
                      <option key={u.UserId} value={u.UserId}>
                        {u.UserName}
                      </option>
                    ))}
                  </select>
                </div>
                {mode !== "view" && (
                  <button type="submit" className="btn btn-primary btn-sm mt-2">
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};



export default DischargeDetails;