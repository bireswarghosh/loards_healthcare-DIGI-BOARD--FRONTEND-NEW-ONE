import React, { useEffect, useState } from "react";


import { useForm } from "react-hook-form";

import { toast } from "react-toastify";
import AsyncApiSelect from "./components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/AsyncApiSelect";
import axiosInstance from "./axiosInstance";
import ApiSelect from "./templates/DiagnosisMaster/ApiSelect";
import useAxiosFetch from "./templates/DiagnosisMaster/Fetch";





const DoctorVisit = () => {

  const [previousVisits, setPreviousVisits] = useState([]);
  const [doctorNameMap, setDoctorNameMap] = useState({});
    const [deleteId, setDeleteId] = useState(null);
      const [showConfirm, setShowConfirm] = useState(false);
    


  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      VisitDate: new Date().toISOString().slice(0, 10),
    //   DoctorName: "",
    //   Rate: 0,
      NoOfVisit: 1,
    //   Amount: 0,
      
      Package: "N",
     TypeOfVisit : "DOCTOR VISIT",
      AdmitionId: "",
      PatientName: "",
    },
  });
  const rate = watch("Rate");
const noOfVisit = watch("NoOfVisit");
useEffect(() => {
  const r = Number(rate) || 0;
  const n = Number(noOfVisit) || 0;

  setValue("Amount", r * n);
}, [rate, noOfVisit, setValue]);

const DoctorVisitId=watch("DoctorVisitId")
  const admissionId = watch("AdmitionId");
  const areaId = watch("AreaId");
const { data: areaData } = useAxiosFetch(
  areaId ? `/area/${areaId}` : null,
  [areaId]
);


  useEffect(() => {
    if (!admissionId) return;

    const fetchAdmissionDetails = async () => {
      try {
        const res = await axiosInstance.get(
          `/admission/search?q=${admissionId}&page=1`
        );
        const item = res.data?.data?.[0];
        if (!item) return;
         reset({
        AdmitionId: item.AdmitionId,
        PatientName: item.PatientName,
        Add1: item.Add1,
        AreaId: item.AreaId,
        Age: item.Age,
        Sex: item.Sex,
        PhoneNo: item.PhoneNo,
        MStatus: item.MStatus,

        // ⭐ MOST IMPORTANT LINE
        DoctorVisitId: "",

        // Doctor visit fields → fresh for POST
        DoctorId: "",
        VisitDate: new Date().toISOString().slice(0, 10),
        VisitTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        Package: "",
        Rate: "",
        NoOfVisit: "",
        Amount: "",
        payAmount: "",
        TypeOfVisit: "DOCTOR VISIT",
        VUNIT: "",
        Adv1: "",
        Adv2: "",
      });
        // 👉 2) Previous Visit Details API
        // const prevRes = await axiosInstance.get(
        //   `/doctor-visits/search/admission?admissionId=${admissionId}`
        // );
        // // console.log(prevRes);
        // setPreviousVisits(prevRes?.data?.data || []);
        // ⭐ previous visits
    fetchPreviousVisits(admissionId);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdmissionDetails();
  }, [admissionId,reset]);

  const fetchPreviousVisits = async (admissionId) => {
  if (!admissionId) return;

  try {
    const prevRes = await axiosInstance.get(
      `/doctor-visits/search/admission?admissionId=${admissionId}`
    );

    setPreviousVisits(prevRes?.data?.data || []);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  previousVisits.forEach(async (row) => {
    if (!row.DoctorId || doctorNameMap[row.DoctorId]) return;

    const res = await axiosInstance.get(
      `/doctormaster/${row.DoctorId}`
    );

    setDoctorNameMap((prev) => ({
      ...prev,
      [row.DoctorId]: res.data?.data?.Doctor,
    }));
  });
}, [previousVisits]);


  const handleEdit = (row) => {
  // Doctor select dropdown
  setValue("DoctorId", row.DoctorId);
  setValue("DoctorVisitId",row.DoctorVisitId)
  // Main visit fields
  setValue("Rate", row.Rate);
  setValue("NoOfVisit", row.NoOfVisit);
  setValue("Amount", row.Amount);
  setValue("payAmount", row.payAmount);
  setValue("Package", row.Package);
  setValue("TypeOfVisit", row.TypeOfVisit);
  setValue("VUNIT", row.VUNIT);
  

  // Dates & times
  setValue("VisitDate", row.VisitDate?.split("T")[0] || "");
  setValue("VisitTime", row.VisitTime);

  setValue("Adv1",row.Adv1);
  setValue("Adv2",row.Adv2);

  // Visit type
//   setValue("TypeOfVisit", row.TypeOfVisit || "DOCTOR VISIT");
};

const onSubmit = async (data) => {
  try {
      const payload = {
    AdmitionId: data.AdmitionId,
    DoctorId: data.DoctorId,
    Rate: data.Rate,
    NoOfVisit: data.NoOfVisit,
    Amount: data.Amount,
   
    VisitDate: data.VisitDate,
    VisitTime: data.VisitTime,
    TypeOfVisit: data.TypeOfVisit,
    Adv1:data.Adv1,
     Adv2:data.Adv2,
     Package:data.Package,
     VUNIT:data.VUNIT,
     payAmount:data.payAmount,


    
    // VisitProcedure: data.Procedure,
  };

    // 🔁 EDIT vs NEW decide 
    if (DoctorVisitId) {
      // UPDATE
      await axiosInstance.put(
        `/doctor-visits/${DoctorVisitId}`,
        payload
      );
      toast.success("updated successfully");
      reset()
    } else {
      
      await axiosInstance.post(
        `/doctor-visits`,
    payload
      );
      toast.success("saved successfully");
      reset()
    }
    

      // ✅ SUBMIT SUCCESS → REFRESH TABLE
    await fetchPreviousVisits(admissionId);
    

  } catch (err) {
    console.error(err);
toast.error("Something went wrong");
  }
};

 const confirmDelete = async () => {
  if (!deleteId) return;

  try {
    await axiosInstance.delete(`/doctor-visits/${deleteId}`);
    toast.success("Deleted successfully");

    setShowConfirm(false);
    setDeleteId(null);

    // ✅ refresh table
    fetchPreviousVisits(admissionId);

    // ✅ clear form if same row was in edit
    reset();

  } catch (err) {
    console.error(err);
    toast.error("Delete failed");
  }
};




  return (<>
  <form onSubmit={handleSubmit(onSubmit)}>
        <div className="panel">
      {/* HEADER */}
      {/* <div className="panel-header d-flex justify-content-between align-items-center"> */}
        {/* <h5 className="panel-title">Doctor Visit</h5> */}

        {/* <div className="d-flex gap-2">
          <button className="btn btn-sm btn-secondary">List</button>
          <button className="btn btn-sm btn-secondary">Detail</button>
          <button className="btn btn-sm btn-primary">Doctor Visit</button>
        </div> */}
      {/* </div> */}

      {/* BODY */}
      <div className="panel-body">
        {/* BILL DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Bill Detail</h6>
        <div className="row g-2 mb-3">
          {/* Admission No */}
          <div className="col-md-4">
            <label className="form-label small fw-bold mb-1">
              Admission No
            </label>

            <AsyncApiSelect
              api="https://lords-backend.onrender.com/api/v1/admission/search"
              value={watch("AdmitionId")}
              onChange={(val) => setValue("AdmitionId", val)}
              searchKey="q"
              labelKey="AdmitionId"
              valueKey="AdmitionId"
              defaultPage={1}
            />
            {/* {{base_url}}/admission/search?q=001159/24-25 */}

           
          </div>

          {/* Patient Name */}
          <div className="col-md-4">
            <label className="form-label small fw-bold mb-1">
              Patient Name
            </label>
            <input
              className="form-control form-control-sm"
              {...register("PatientName")}
            />
          </div>

          {/* Radio Buttons */}
          <div className="col-md-4 d-flex align-items-end gap-3">
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                value="name"
                {...register("FindBy")}
              />
              <label className="form-check-label small">Find By Name</label>
            </div>

            <div className="form-check form-check-inline">
              <input
                type="radio"
                value="number"
                className="form-check-input"
                {...register("FindBy")}
              />
              <label className="form-check-label small">Find By No.</label>
            </div>
          </div>
        </div>

        {/* PATIENT DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Patient Detail</h6>

        <div className="row g-2 mb-3">
          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Address</label>
            <input
              className="form-control form-control-sm"
              {...register("Add1")}
            />
          </div>
<input type="hidden" {...register("AreaId")} />

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Area</label>
            {/* <input
              className="form-control form-control-sm"
              {...register("Area")}
            /> */}
            <input
  className="form-control form-control-sm"
  value={areaData?.Area || ""}
  readOnly
/>
          </div>

          <div className="col-md-1">
            <label className="form-label small fw-bold mb-1">Age</label>
            <input
              className="form-control form-control-sm"
              {...register("Age")}
            />
          </div>

          <div className="col-md-1">
            <label className="form-label small fw-bold mb-1">Sex</label>
            <select className="form-select form-select-sm" {...register("Sex")}>
              <option value="F">F</option>
              <option value="M">M</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Phone</label>
            <input
              className="form-control form-control-sm"
              {...register("PhoneNo")}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">
              Marital Status
            </label>
            <input
              className="form-control form-control-sm"
              {...register("MStatus")}
            />
          </div>

          <div className="col-md-1">
            <label className="form-label small fw-bold mb-1">Bed No</label>
            <input
              className="form-control form-control-sm"
              {...register("BedId")}
            />
          </div>
        </div>

        {/* DOCTOR VISIT DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Doctor Visit</h6>

        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Doctor Name</label>
            {/* <input className="form-control form-control-sm" {...register("DoctorName")} /> */}
            <ApiSelect
              api="https://lords-backend.onrender.com/api/v1/doctormaster?page=1&limit=10000"
              value={watch("DoctorId")} // 👈 RHF live value
              labelKey="Doctor" // API label
              valueKey="DoctorId" // API id
              placeholder="Select doctor"
              onChange={(val) => setValue("DoctorId", val)} // 👈 THIS IS CORRECT
              
            />
          </div>
          <input type="hidden" {...register("DoctorVisitId")} />

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              {...register("VisitDate")}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Time</label>
            <input
              className="form-control form-control-sm"
              {...register("VisitTime")}
             
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Package</label>
            <select
              className="form-select form-select-sm"
              {...register("Package")}
            >
              <option value="N">N</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold mb-1">Rate</label>
            <input
              className="form-control form-control-sm"
              {...register("Rate")}
              type="number"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">No of Visit</label>
            <input
              className="form-control form-control-sm"
              {...register("NoOfVisit")}
              type="number"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">VUNIT</label>
            <select
              className="form-select form-select-sm"
              {...register("VUNIT")}
            >
              <option value="/VISIT">/VISIT</option>
              <option value="/DAY">/DAY</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Amount</label>
            <input
              className="form-control form-control-sm"
              {...register("Amount")}
               readOnly
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">Doc Pay Amt</label>
            <input
              className="form-control form-control-sm"
              {...register("payAmount")}
              type="number"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold mb-1">
              Type of Visit
            </label>
            {/* <input
              className="form-control form-control-sm"
              {...register("TypeOfVisit")}
            /> */}
            <select {...register("TypeOfVisit")} className="form-select form-select-sm" >
                  <option value="">DOCTOR VISIT</option>
  <option value="DOCTOR VISIT">DOCTOR VISIT</option>
  <option value="DOCTOR VISIT IN WARD">DOCTOR VISIT IN WARD</option>
  <option value="INITIAL MANAGEMENT">INITIAL MANAGEMENT</option>
  <option value="OT (ANESTHESIA CHARGE)">OT (ANESTHESIA CHARGE)</option>
  <option value="OT (ASSISTANT SURGEON)">OT (ASSISTANT SURGEON)</option>
  <option value="OT (SURGEON CHARGE)">OT (SURGEON CHARGE)</option>
  <option value="PHYSIOTHERAPIST">PHYSIOTHERAPIST</option>
  <option value="REFERRAL">REFERRAL</option>
            </select>
          </div>
<div className="col-md-2 mt-4 gap-2">
 <button
  type="submit"
  className="btn btn-sm btn-success"
  disabled={isSubmitting}
>
  {isSubmitting && (
    <span className="spinner-border spinner-border-sm me-2"></span>
  )}
       Save
</button>
</div>
        

        </div>

        {/* PREVIOUS DETAIL */}
        <h6 className="text-primary fw-bold mb-2">Previous Detail</h6>

        <div className="table-responsive mb-3" style={{ maxHeight: "130px" }}>
          <table className="table table-sm table-hover table-bordered digi-dataTable">
            <thead className="digi-table-header">
              <tr>
                 <th>Action</th>
                <th>Doctor Name</th>
                <th>Rate</th>
                <th>No of Visit</th>
                <th>Amount</th>
                <th>Pay Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Entry</th>
                <th>Visit Type</th>
               
              </tr>
            </thead>

            <tbody>
              {previousVisits.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted small py-2">
                    No previous entries.
                  </td>
                </tr>
              ) : (
                previousVisits.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info"
                          onClick={() => openView(item)}
                        >
                          <i className="fa-light fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(row)}
                        >
                          <i className="fa-light fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setDeleteId(row.DoctorVisitId);
                            setShowConfirm(true);
                          }}
                        >
                          <i className="fa-light fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                    <td>{doctorNameMap[row.DoctorId] || "..."}</td>
                    <td>{row.Rate}</td>
                    <td>{row.NoOfVisit}</td>
                    <td>{row.Amount}</td>
                    <td>{row.payAmount|| 0}</td>
                    <td>{row.VisitDate?.split("T")[0]}</td>
                    <td>{row.VisitTime || "--:--"}</td>
                    <td>{row.UserId || "-"}</td>
                    <td>{row.TypeOfVisit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ADVICE + PROCEDURE */}
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Advice</label>
            <textarea
              className="form-control form-control-sm"
              rows="1"
              {...register("Adv1")}
            ></textarea>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Procedure</label>
            <textarea
              className="form-control form-control-sm"
              rows="1"
              {...register("Adv2")}
            ></textarea>
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      {/* <div className="panel-footer d-flex justify-content-between flex-wrap gap-2">
    <div className="btn-group">
      <button className="btn btn-sm btn-primary" type="button">New</button>
      <button className="btn btn-sm btn-secondary" type="button">Edit</button>
      <button className="btn btn-sm btn-success" type="submit">Save</button>
      <button className="btn btn-sm btn-danger" type="button">Delete</button>
      <button className="btn btn-sm btn-dark" type="button">Undo</button>
      <button className="btn btn-sm btn-info" type="button">Find</button>
      <button className="btn btn-sm btn-warning" type="button">Print</button>
      <button className="btn btn-sm btn-dark" type="button">Exit</button>
    </div>
  </div> */}
    </div>
         </form>
         {/* ================= DELETE CONFIRM ================= */}
      {showConfirm && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  <p>Are you sure?</p>
                  <button
                    className="btn btn-danger me-2"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
  </>
    
         
    
  );
   
};

export default DoctorVisit;