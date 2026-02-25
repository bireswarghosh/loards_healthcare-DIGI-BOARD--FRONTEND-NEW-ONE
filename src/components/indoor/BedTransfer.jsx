/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { use } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BedTransfer = () => {
  const { id, mode } = useParams();
  const [admData, setAdmData] = useState({});
  const id_new = decodeURIComponent(id);
  const [selecetdBed, setSelecetdBed] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [bedTransfers, setBedTransfers] = useState([]);

  const [bedNoMap, setBedNoMap] = useState({});
  const [bedDeptMap, setBedDeptMap] = useState({});
  const [departmentMap, setDepartmentMap] = useState([]);
  const [allDepts, setAllDepts] = useState([]);

  const [selectedDeptOrginal, setSelectedDeptOrginal] = useState(0);
  const [filteredBedMap, setFilteredBedMap] = useState([]);

  const [selectedRate, setSelectedRate] = useState(0);

  const [showDrop, setShowDrop] = useState(false);

  const [formData, setFormData] = useState({
    AdmitionId: id_new || "0",
    BedId: 0,
    AdmitionDate: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
    ReleaseDate: "",
    Release: "",
    AdmitionTime: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
    ReleaseTime: "",
    ToDayRate: 0,
    Rate: 0,
    Userid: 9,
    RMOCh: 0,
    AtttndantCh: 0,
    packagevalid: "",
    packagestart: "",
  });

  const [slNo, setSlNo] = useState("");
  const [update, setUpdate] = useState(false);

  // Delete
  const [showConfirm, setShowConfirm] = useState(false);
  // const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [okDeleted, setOkDeleted] = useState(0);

  const [loadBtn, setLoadBtn] = useState(false);

  const navigate = useNavigate();

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    // console.log(`name:${name} : value: ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/departmentindoor");

      const map = {};
      res.data?.data?.forEach((d) => {
        map[d.DepartmentId] = d.Department;
      });

      setDepartmentMap(map);
    } catch (err) {
      console.error("Department fetch failed", err);
    }
  };

  const fetchDepts = async () => {
    try {
      const res = await axiosInstance.get("/departmentIndoor");
      const arr = res.data.data;
      const newArr = [{ DepartmentId: 0, Department: "--Select--" }, ...arr];
      setAllDepts(newArr);
      // console.log("all dept data: ", res.data.data);
    } catch (error) {
      console.log("error fetching dept: ", error);
    }
  };

  const fetchAdmById = async (id) => {
    try {
      const res = await axiosInstance.get(`/admissions/${id}`);

      if (res.data.success) {
        setAdmData(res.data.data.admission);
        // console.log("Adm data: ", res.data.data.admission);
        fetchSelcetedBed(res.data.data.admission.BedId);
        fetchSelectedDept(res.data.data.admission.DepartmentId);
        fetchBedTransfers(id);
      }
    } catch (error) {
      console.log("Error fetching admission by id: ", error);
    }
  };

  // this is for before trasfer bed
  const fetchSelcetedBed = async (id) => {
    try {
      const res = await axiosInstance.get(`/bedMaster/${id}`);
      if (res.data.success) {
        setSelecetdBed(res.data.data);
      }
    } catch (error) {
      console.log("error fetching selected bed: ", error);
    }
  };

  // this is for before trasfer bed
  const fetchSelectedDept = async (id) => {
    try {
      const res = await axiosInstance.get(`/departmentIndoor/${id}`);
      if (res.data.success) {
        // console.log("dept data: ", res.data.data);
        setSelectedDept(res.data.data.Department);
      }
    } catch (error) {
      console.log("error fetching bed transfers: ", error);
    }
  };

  // this is for all bed transfer reports
  const fetchBedTransfers = async (id) => {
    try {
      const res = await axiosInstance.get(`/admitionbeds?admitionid=${id}`);
      // console.log("All bed transfers: ", res.data.data);

      if (res.data.success) {
        // console.log("All bed transfers: ", res.data.data);
        // setSelectedDept(res.data.data.Department);
        setBedTransfers(res.data.data ? res.data.data : []);
      } else {
        setBedTransfers([]);
      }
    } catch (error) {
      setBedTransfers([]);
      console.log("error fetching bed transfer: ", error);
    }
  };

  const fetchBedNos = async (bedTransfers) => {
    const uniqueBedIds = [...new Set(bedTransfers.map((b) => b.BedId))];

    const bedMap = {};
    const deptMap = {};

    await Promise.all(
      uniqueBedIds.map(async (id) => {
        const res = await axiosInstance.get(`/bedMaster/${id}`);
        bedMap[id] = res.data?.data?.Bed || "NA";
        deptMap[id] = res.data?.data?.DepartmentId || null;
      }),
    );

    setBedNoMap(bedMap);
    setBedDeptMap(deptMap);
  };

  const fetchBedByDeptId = async () => {
    try {
      setShowDrop(false);
      const res = await axiosInstance.get("/bedMaster?currentPage=1&limit=1");
      if (res.data.success) {
        const limit = res.data.pagination.totalItems;
        const response = await axiosInstance.get(
          `/bedMaster?currentPage=1&limit=${limit}`,
        );
        const data = response.data.data;
        // console.log("selected dept : ", selectedDeptOrginal);
        const filtered = data.filter(
          (b) => b.DepartmentId == selectedDeptOrginal,
        );
        const arr = filtered;
        const newArr = [{ BedId: 0, Bed: "--Select--" }, ...arr];
        setFilteredBedMap(newArr);
        // console.log("Fileterd bed by dept id: ", newArr);
        setShowDrop(true);
      }
    } catch (error) {
      console.log("error fetching bed by dept id: ", error);
    }
  };

  const handleSave = async () => {
    try {
      if (formData.BedId == 0) {
        toast.error("First fill the form. Then try to add.");
        return;
      }
      setLoadBtn(true);
      const res = await axiosInstance.post("/admitionbeds", formData);
      let res1;
      const ele = bedTransfers[bedTransfers.length - 1];
      if (ele) {
        res1 = await axiosInstance.put(
          `/admitionbeds?admitionid=${id_new}&slno=${ele.SlNo}`,
          {
            ...ele,
            Release: "Y",
            ReleaseDate:
              new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
            ReleaseTime: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        );
      } else {
        // res1.data.success = true;
        res1={data:{success:true}}
      }

      // console.log("save res: ", res);
      if (res.data.success && res1.data.success) {
        toast.success(res.data.message);
        setLoadBtn(false);

        fetchAdmById(id_new);
        fetchDepartments();
        fetchDepts();
        setSelectedDeptOrginal(0);
        // setSelectedRate(0);
        // setFormData((prev) => ({ ...prev, ToDayRate: 0, Rate: 0 }));
        setFormData({
          AdmitionId: id_new || "0",
          BedId: 0,
          AdmitionDate:
            new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
          ReleaseDate: "",
          Release: "",
          AdmitionTime: "12.00 PM",
          ReleaseTime: "",
          ToDayRate: 0,
          Rate: 0,
          Userid: 9,
          RMOCh: 0,
          AtttndantCh: 0,
          packagevalid: "",
          packagestart: "",
        });
      }
    } catch (error) {
      console.log("error saving form ", error);
    }
  };

  const handleUpdate = async (slNo) => {
    // console.log("update: ", slNo);
    try {
      setLoadBtn(true);

      const res = await axiosInstance.put(
        `/admitionbeds?admitionid=${id_new}&slno=${slNo}`,
        formData,
      );
      // console.log("updating admitionbed: ", res.data);
      if (res.data.success) {
        // setShowConfirm(false);
        setSlNo("");
        toast.success(res.data.message);
        setLoadBtn(false);

        fetchAdmById(id_new);
        fetchDepartments();
        fetchDepts();
        setSelectedDeptOrginal(0);
        // setSelectedRate(0);
        setFormData((prev) => ({ ...prev, ToDayRate: 0, Rate: 0 }));

        setUpdate(false);
      }
    } catch (error) {
      console.log("Error updating admitionbed: ", error);
    }
  };

  const handleDelete = async (slNo) => {
    try {
      setLoading(true);
      const res = await axiosInstance.delete(
        `/admitionbeds?admitionid=${id_new}&slno=${slNo}`,
      );
      // console.log("admition bed delete: ", res);
      if (res.data.success) {
        setShowConfirm(false);
        setSlNo("");
        toast.success(res.data.message);
        setSelectedDeptOrginal(0);
        setSelectedRate(0);

        // fetchAdmById(id_new);
        // fetchDepartments();
        // fetchDepts();
        setOkDeleted((c) => c + 1);
      }
    } catch (error) {
      console.log("Error deleting admition bed: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedByDeptId();
  }, [selectedDeptOrginal]);

  useEffect(() => {
    if (bedTransfers.length) {
      fetchBedNos(bedTransfers);
      // fetchDeptID(bedTransfers);
    }
  }, [bedTransfers]);

  useEffect(() => {
    fetchAdmById(id_new);
    fetchDepartments();
    fetchDepts();
  }, [okDeleted]);

  useEffect(() => {
    fetchAdmById(id_new);
    fetchDepartments();
    fetchDepts();
  }, []);

  useEffect(() => {
    // console.log("I am outside");
    if (update) {
      fetchBedByDeptId();
      // console.log("BedId: ",formData.BedId)
      // console.log("Bed : ",filteredBedMap)

      const filterBed = filteredBedMap.filter(
        (bed) => bed.BedId == formData.BedId,
      );
      // console.log("fil ahah: ", filterBed);
      if (filterBed.length != 0) {
        setFormData((prev) => ({
          ...prev,
          Rate: filterBed[0].TotalCh,
          ToDayRate: filterBed[0].TotalCh,
        }));
      }
      return;
    }
    if (formData.BedId != 0) {
      // console.log("I am inside");

      const filterBed = filteredBedMap.filter(
        (bed) => bed.BedId == formData.BedId,
      );
      // console.log("fil: ", filterBed);
      setFormData((prev) => ({
        ...prev,
        Rate: filterBed[0].TotalCh,
        ToDayRate: filterBed[0].TotalCh,
      }));
      // setSelectedRate(filterBed[0].TotalCh);
      // console.log(formData);
    }
  }, [formData.BedId]);

  return (
    <div className="panel">
      {/* HEADER */}
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h5 className="panel-title">Bed Transfer</h5>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => {
              navigate("/BedTransfer");
            }}
          >
            List
          </button>
          {/* <button className="btn btn-sm btn-primary">Transfer</button> */}
        </div>
      </div>

      {/* BODY */}
      <div className="panel-body">
        {/* CURRENT DATE */}
        <h6 className="text-primary fw-bold mb-2">Current Date</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold">Date</label>
            <input
              disabled={mode == "view"}
              // value={Date.now()}
              // value={new Date().toLocaleDateString("en-GB").split("/").join("-")}
              value={new Date()
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .replace(/ /g, "/")
                .toLowerCase()}
              className="form-control form-control-sm"
              // defaultValue="22/Feb/2025"
            />
          </div>
        </div>

        {/* PATIENT INFORMATION */}
        <h6 className="text-primary fw-bold mb-2">Patient Information</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold">Patient Name</label>
            <input
              disabled={mode == "view"}
              value={admData?.PatientName}
              className="form-control form-control-sm"
              defaultValue="MD YOUNUS"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold">Admission No</label>
            <input
              disabled={mode == "view"}
              value={admData?.AdmitionNo}
              className="form-control form-control-sm"
              defaultValue="A-000014/16-17"
            />
          </div>

          {/* <div className="col-md-4 d-flex align-items-end gap-3">
            <div className="form-check d-flex align-items-center gap-1">
              <input
                type="radio"
                name="find"
                className="form-check-input"
                defaultChecked
              />
              <label className="form-check-label small">Find By Name</label>
            </div>


            <div className="form-check d-flex align-items-center gap-1">
              <input type="radio" name="find" className="form-check-input" />
              <label className="form-check-label small">Find By No.</label>
            </div>
          </div> */}
        </div>

        {/* BEFORE TRANSFER BED */}
        <h6 className="text-primary fw-bold mb-2">Before Transfer Bed</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold">Department</label>
            <input
              disabled={mode == "view"}
              value={selectedDept}
              className="form-control form-control-sm"
              // defaultValue="ICU"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold">Bed No</label>
            <input
              disabled={mode == "view"}
              className="form-control form-control-sm"
              value={selecetdBed.Bed}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold">Rate</label>
            <input
              disabled={mode == "view"}
              // value={admData.BedRate}
              value={selecetdBed.TotalCh}
              className="form-control form-control-sm"
              defaultValue="4000.00"
            />
          </div>
        </div>

        {/* TRANSFER BED */}
        <h6 className="text-primary fw-bold mb-2">Transfer Bed</h6>
        <div className="row g-2 mb-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small fw-bold">Department</label>
            <select
              disabled={mode == "view"}
              className="form-control form-control-sm"
              value={selectedDeptOrginal}
              onChange={(e) => {
                setSelectedDeptOrginal(e.target.value);
              }}
            >
              {allDepts.map((dept, i) => (
                <option key={i} value={dept.DepartmentId}>
                  {dept.Department}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Bed No</label>
            {!showDrop ? (
              <input
                className="form-control form-control-sm"
                value="--select--"
              />
            ) : (
              <select
                disabled={mode == "view"}
                className="form-control form-control-sm"
                name="BedId"
                value={formData.BedId}
                onChange={(e) => {
                  onHandleChange(e);
                }}
              >
                {filteredBedMap.map((bed, i) => (
                  <option key={i} value={bed.BedId}>
                    {bed.Bed}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Rate</label>
            <input
              disabled={mode == "view"}
              className="form-control form-control-sm"
              readOnly
              value={formData.Rate}
              // value={selectedRate}
              type="number"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Time</label>
            <input
              disabled={mode == "view"}
              className="form-control form-control-sm"
              type="text"
              name="AdmitionTime"
              value={formData.AdmitionTime}
              onChange={onHandleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold">To Day Rate</label>
            <input
              disabled={mode == "view"}
              className="form-control form-control-sm"
              name="ToDayRate"
              value={formData.ToDayRate}
              onChange={onHandleChange}
              type="number"
            />
          </div>
        </div>

        {/* TRANSFER HISTORY */}
        <h6 className="text-primary fw-bold mb-2 mt-4">Transfer History</h6>

        <div className="table-responsive border rounded">
          <table className="table table-sm table-bordered table-hover digi-dataTable mb-0">
            <thead className="digi-table-header">
              <tr>
                {mode != "view" && <th>Action</th>}
                <th>A Date</th>
                <th>A Time</th>
                <th>Department</th>
                <th>Bed No</th>
                <th>Rate</th>
                <th>R Date</th>
                <th>R Time</th>
                <th>To Day Rate</th>
                <th>Entry By</th>
              </tr>
            </thead>

            <tbody>
              {bedTransfers.length != 0 ? (
                bedTransfers.map((bed, i) => (
                  <tr key={i}>
                    {mode != "view" && (
                      <td>
                        {/* {console.log("I am bed transfer: ",bed)} */}{" "}
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={async () => {
                            setSlNo(bed.SlNo);
                            setUpdate(true);
                            const bedID = bed.BedId;
                            try {
                              const res = await axiosInstance.get(
                                `/bedMaster/${bedID}`,
                              );
                              if (res.data.success) {
                                // console.log("original dept:",res.data.data.DepartmentId)
                                setSelectedDeptOrginal(
                                  res.data.data.DepartmentId,
                                );

                                setFormData((prev) => ({
                                  ...prev,
                                  BedId: bed.BedId,
                                  AdmitionDate: bed.AdmitionDate,
                                  ReleaseDate: bed.ReleaseDate,
                                  Release: bed.Release,
                                  AdmitionTime: bed.AdmitionTime,
                                  ReleaseTime: bed.ReleaseTime,
                                  ToDayRate: bed.ToDayRate,
                                  Rate: res.data.data.TotalCh,
                                  Userid: bed.Userid,
                                  RMOCh: bed.RMOCh,
                                  AtttndantCh: bed.AtttndantCh,
                                  packagevalid: bed.packagevalid,
                                  packagestart: bed.packagestart,
                                }));
                              }
                            } catch (error) {
                              console.log("Error fetching bed master: ", error);
                            }
                          }}
                          disabled={bed.SlNo==1}
                        >
                          <i className="fa-light fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setSlNo(bed.SlNo);
                            setShowConfirm(true);
                          }}
                          disabled={bed.SlNo==1}
                        >
                          <i className="fa-light fa-trash-can"></i>
                        </button>
                      </td>
                    )}
                    <td>{bed?.AdmitionDate?.split("T")[0] || "NA"}</td>
                    <td>{bed?.AdmitionTime || "NA"}</td>
                    <td>{departmentMap[bedDeptMap[bed.BedId]] || "NA"}</td>
                    <td>{bedNoMap[bed.BedId] || "Loading..."}</td>

                    <td>{bed?.Rate || "NA"}</td>
                    <td>{bed?.ReleaseDate?.split("T")[0] || "NA"}</td>
                    <td>{bed?.ReleaseTime || "NA"}</td>
                    <td>{bed?.ToDayRate || "NA"}</td>
                    <td>{bed?.Userid || "NA"}</td>
                  </tr>
                ))
              ) : (
                // : "No data available"}
                <div className="text-center">No data available</div>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      {mode != "view" && (
        <div className="panel-footer d-flex justify-content-between flex-wrap gap-2">
          <div className="btn-group">
            {/* <button className="btn btn-sm btn-primary">New</button> */}
            {/* <button className="btn btn-sm btn-secondary">Edit</button> */}
            {!update ? (
              <button
                className="btn btn-sm btn-success"
                onClick={handleSave}
                disabled={loadBtn}
              >
                {!loadBtn ? "Add" : "Adding..."}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    handleUpdate(slNo);
                  }}
                >
                  {!loadBtn ? "Update" : "Updating..."}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSlNo("");

                    setSelectedDeptOrginal(0);

                    setFormData({
                      AdmitionId: id_new || "0",
                      BedId: 0,
                      AdmitionDate:
                        new Date().toISOString().split("T")[0] +
                        "T00:00:00.000Z",
                      ReleaseDate: "",
                      Release: "",
                      AdmitionTime: "12.00 PM",
                      ReleaseTime: "",
                      ToDayRate: 0,
                      Rate: 0,
                      Userid: 9,
                      RMOCh: 0,
                      AtttndantCh: 0,
                      packagevalid: "",
                      packagestart: "",
                    });
                    setUpdate(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
            {/* <button className="btn btn-sm btn-danger">Delete</button> */}
            {!update && (
              <button
                className="btn btn-sm btn-dark"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    BedId: 0,
                    AdmitionDate:
                      new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
                    ReleaseDate: "",
                    Release: "",
                    AdmitionTime: "12.00 PM",
                    ReleaseTime: "",
                    ToDayRate: 0,
                    Rate: 0,
                    Userid: 9,
                    RMOCh: 0,
                    AtttndantCh: 0,
                    packagevalid: "",
                    packagestart: "",
                  }));
                  setSelectedDeptOrginal(0);
                  setSelectedRate(0);
                }}
              >
                Undo
              </button>
            )}
            {/* <button className="btn btn-sm btn-info">Find</button> */}
            {/* <button className="btn btn-sm btn-dark">Exit</button> */}
          </div>
        </div>
      )}
      {/* DELETE MODAL */}
      {showConfirm && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 99999 }}
          ></div>

          <div
            className="modal d-block"
            style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Confirm Delete</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowConfirm(false)}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  Are you sure you want to delete?
                </div>

                <div className="modal-footer d-flex justify-content-center gap-3">
                  <button
                    disabled={loading}
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    className="btn btn-danger"
                    onClick={() => {
                      handleDelete(slNo);
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BedTransfer;