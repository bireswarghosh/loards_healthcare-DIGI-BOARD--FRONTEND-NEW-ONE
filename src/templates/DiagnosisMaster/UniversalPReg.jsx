import React, { useEffect, useState } from "react";
// import useAxiosFetch from "./Fetch";
// import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAxiosFetch from "./Fetch";
import axiosInstance from "../../axiosInstance";
import ApiSelect from "./ApiSelect";
// import ApiSelect from "./ApiSelect";

const UniversalPReg = ({ RegistrationId, setOpen, setSelectedId }) => {
  const navigate = useNavigate();

  const { data: religions } = useAxiosFetch("/religion");

  const { data: editPatient } = useAxiosFetch(
    RegistrationId
      ? `/patientregistration/${encodeURIComponent(RegistrationId)}`
      : null,
    [RegistrationId]
  );
  const defaultForm = {
    PatientName: "",
    Sex: "M",
    CareOf: "",
    GurdianName: "",
    MStatus: "U",
    Add1: "",
    Add2: "",
    Add3: "",
    PhoneNo: "",
    Age: "",
    AreaId: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  useEffect(() => {
    if (!RegistrationId) {
      setFormData(defaultForm); // 🔥 reset form when id null
      return;
    }

    if (editPatient) {
      setFormData({ ...defaultForm, ...editPatient });
    }
  }, [RegistrationId, editPatient]);

  // const [formData, setFormData] = useState({
  //   PatientName: editPatient.PatientName || "",
  //   Sex: editPatient?.Sex || "M",
  //   CareOf: editPatient?.CareOf || "",
  //   GurdianName: editPatient?.GurdianName || "",
  //   MStatus: editPatient?.MStatus || "U",
  //   Add1: editPatient?.Add1 || "",
  //   Add2: editPatient?.Add2 || "",
  //   Add3: editPatient?.Add3 || "",
  //   PhoneNo: editPatient?.PhoneNo || "",
  //   // Area: "",
  //   // PhoneNo: "",
  //   // Religion: "",
  //   // CurrentUser: "Admin",
  //   // RegistrationTime:
  // });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (RegistrationId) {
        await axiosInstance.put(
          `/patientregistration/${encodeURIComponent(RegistrationId)}`,
          formData
        );
        toast.success("Edited Successfully");
      } else {
        const res = await axiosInstance.post("/patientregistration", formData);
        const Id = res.data.data.RegistrationId;
        sessionStorage.setItem("ID", Id);
        toast.success("Registered Successfully");
        navigate("/Opd_Other_Charges");
      }
    } catch (error) {
      toast.error("failled Operation");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="b">
      <div className="d-flex justify-content-end  align-items-center p-1 border-bottom">
        <button onClick={() => navigate("/OtherzzCharges")}>Back</button>;
        {/* <h5 className="mb-0">Patient List</h5> */}
        <button
          type="button"
          className="btn-close"
          onClick={() => {
            setSelectedId(null);
            setOpen(false);
          }}
        ></button>
      </div>
      <div className="container-fluid border border-1  p-3">
        <h4 className="mb-2">Patient Registration</h4>

        {/* ================= Registration Detail ================= */}
        <div className="card mb-3">
          {/* <div className="card-header fw-bold text-primary">
            Registration Detail
          </div> */}

          <div className="card-body">
            <div className="row mb-3">
              {/* <div className="col-md-3">
                <label className="form-label">Registration No</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="System generated"
                  readOnly
                />
              </div> */}

              {/* <div className="col-md-2">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" />
              </div> */}

              {/* <div className="col-md-2">
                <label className="form-label">Time</label>
                <input
                  name="RegistrationTime"
                  value={formData.RegistrationTime}
                  onChange={handleChange}
                  type="time"
                  className="form-control"
                />
              </div> */}

              {/* <div className="col-md-3 d-flex align-items-center justify-content-center">
                <h5 className="fw-bold">Card Number</h5>
              </div> */}
            </div>

            <div className="row">
              {/* <div className="col-md-3">
              <label className="form-label">C Registration No</label>
              <input
                type="text"
                className="form-control"
                defaultValue="02/26-0001"
              />
            </div> */}
            </div>
          </div>
        </div>

        {/* ================= Patient Detail ================= */}
        <div className="card mb-3">
          <div className="card-header fw-bold text-primary">Patient Detail</div>

          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-3">
                <label className="form-label">Patient's Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="PatientName"
                  value={formData.PatientName}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-1">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  name="Age"
                  value={formData.Age}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-1">
                <label className="form-label">Sex</label>
                <select
                  className="form-select"
                  name="Sex"
                  value={formData.Sex}
                  onChange={handleChange}
                >
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">C / O</label>
                <select className="form-select">
                  <option>S / O</option>
                  <option>D / O</option>
                  <option>W / O</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Guardian Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="GurdianName"
                  value={formData.GurdianName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Marital Status</label>
                <select
                  className="form-select"
                  name="MStatus"
                  value={formData.MStatus}
                  onChange={handleChange}
                >
                  <option value="M">Married</option>
                  <option value="U">Unmarried</option>
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-5 mb-3">
                <label className="form-label">Address</label>
                <textarea
                  rows="1"
                  className="form-control"
                  name="Add1"
                  value={`${formData.Add1}${formData.Add2}${formData.Add3}`}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="col-md-3">
                <label className="form-label">Area / P.S.</label>
                <ApiSelect
                  value={formData.AreaId}
                  api="https://lords-backend.onrender.com/api/v1/area?page=1&limit=600"
                  labelKey="Area"
                  valueKey="AreaId"
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, AreaId: val }))
                  }
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="PhoneNo"
                  value={formData.PhoneNo}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Religion</label>
                <select
                  className="form-select"
                  name="ReligionId"
                  value={formData.ReligionId || ""}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {religions.map((r) => (
                    <option key={r.ReligionId} value={r.ReligionId}>
                      {r.Religion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-1"></div>

            <div className="d-flex justify-content-between">
              {/* <div className="col-md-3">
              <label className="form-label">Registration By</label>
              <input type="text" className="form-control" />
            </div> */}

              <div className="">
                <label className="form-label">Current User</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Admin"
                />
              </div>
              <div className="col-md-6">
                <button type="submit" className=" btn btn-success me-2">
                  Save
                </button>
                {/* <button type="button" className=" btn btn-info me-2">
                  Print
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UniversalPReg;