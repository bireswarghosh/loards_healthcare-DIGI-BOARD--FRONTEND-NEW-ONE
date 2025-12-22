import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../../components/footer/Footer";
import { useRef } from "react";
import DoctorSearchSelect from "./DoctorSearchSelect";
import AsyncPaginateSelect from "./AsyncPaginateSelect";
import useAxiosFetch from "./Fetch";

const OtherCharges = () => {
  const [doctorList, setDoctorList] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);

  const doctorRef = useRef(null);

// for search----------------------------
const [showSearch, setShowSearch] = useState(false);

const [searchFilters, setSearchFilters] = useState({
  registrationId: "",
  OutBillNo: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
});


  // ================= Department =================
  // const [department,setdepartment]=useState([])
  // ================= Religion =================
  // const [religion,setReligion]=useState([])

  // ================= LIST =================
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // ================= DRAWER =================
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("view"); // view | edit

  // ================= DELETE =================
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ================= DATA =================
  const [patientData, setPatientData] = useState({});
  const [chargeItems, setChargeItems] = useState([]);
  const [availableCharges, setAvailableCharges] = useState([]);

  const [formData, setFormData] = useState({
    OutBillId: "",
    RegistrationId: "",
    OutBillNo: "",
    OutBillDate: "",
    Amount: 0,
    DiscAmt: 0,
    GTotal: 0,
    paidamt: 0,
    dueamt: 0,
    PaymentType: 0,
    BANK: "",
    Cheque: "",
    narration: "",
  });

  // ================= FETCH LIST =================
  // const fetchCharges = async (p = 1) => {
  //   setLoading(true);
  //   try {
  //     const res = await axiosInstance.get(
  //       `/opd-other-charges?page=${p}&limit=${limit}`
  //     );
  //     if (res.data.success) {
  //       setCharges(res.data.data);
  //       setPage(res.data.pagination.page);
  //       setTotalPages(res.data.pagination.totalPages);
  //     }
  //   } catch {
  //     toast.error("Failed to load list");
  //   }
  //   setLoading(false);
  // };


  const fetchCharges = async (p = 1, filters = searchFilters) => {
  setLoading(true);
  try {
    let url = `/opd-other-charges?page=${p}&limit=${limit}`;

    const hasFilters = Object.values(filters).some(
      (v) => v && v.toString().trim() !== ""
    );

    if (hasFilters) {
      url = `/opd-other-charges/search/advanced?page=${p}&limit=${limit}`;

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          url += `&${key}=${encodeURIComponent(filters[key])}`;
        }
      });
    }

    const res = await axiosInstance.get(url);

    if (res.data.success) {
      setCharges(res.data.data);
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
    }
  } catch (err) {
    toast.error("Failed to load list");
  } finally {
    setLoading(false);
  }
};

// handle filter-------
const handleFilterChange = (key, value) => {
  setSearchFilters((prev) => ({
    ...prev,
    [key]: value,
  }));
};


// search and clear logic---- 
const handleSearch = () => {
  fetchCharges(1, searchFilters);
};

const handleClearSearch = () => {
  setSearchFilters({
    registrationId: "",
    OutBillNo: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  fetchCharges(1, {});
};



  // const fetchDepartment=async()=>{
  // try {
  //   setLoading(true)
  //   const res= await axiosInstance.get('/department')
  //   if(res.data.success) {
  //     setdepartment(res.data.data)
  //   }
  // } catch (error) {
  //   toast.error("Failed to load department");
  // }
  // finally{setLoading(false)}
  // }

  const {
    data: department,
    loading: departmentLoading,
    error: departmentError,
    refetch: fetchDepartment,
  } = useAxiosFetch("/department");

  const {
    data: religion,
    loading: religionLoading,
    error: religionError,
    refetch: fetchreligion,
  } = useAxiosFetch("/religion");

  useEffect(() => {
    fetchCharges(1);
    fetchAllDoctors();
    fetchDepartment();
    fetchreligion();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (doctorRef.current && !doctorRef.current.contains(e.target)) {
        setShowDoctorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDoctors = doctorSearch
    ? doctorList.filter((d) =>
        d.Doctor?.toLowerCase().includes(doctorSearch.toLowerCase())
      )
    : doctorList;

  // ================= FETCH SINGLE =================
  // const loadSingle = async (id) => {
  //   try {
  //     const res = await axiosInstance.get(
  //       `/opd-other-charges-with-items/${id}`
  //     );
  //     const d = res.data.data;

  //     setFormData({
  //       OutBillId: d.OutBillId,
  //       RegistrationId: d.RegistrationId,
  //       OutBillNo: d.OutBillNo,
  //       OutBillDate: d.OutBillDate?.split("T")[0] || "",
  //       Amount: d.Amount,
  //       DiscAmt: d.DiscAmt,
  //       GTotal: d.GTotal,
  //       paidamt: d.paidamt,
  //       dueamt: d.dueamt,
  //       PaymentType: d.PaymentType,
  //       BANK: d.BANK,
  //       Cheque: d.Cheque,
  //       narration: d.narration,
  //     });

  //     setPatientData(d.patientregistration || {});
  //     setChargeItems(d.chargeItems || []);
  //   } catch {
  //     toast.error("Failed to load record");
  //   }
  // };
  const loadSingle = async (id) => {
    try {
      setLoading(true);
      const encodedId = encodeURIComponent(id);

      const response = await axiosInstance.get(
        `/opd-other-charges-with-items/${encodedId}`
      );

      if (response.data.success) {
        const data = response.data.data;

        setFormData({
          OutBillId: data.OutBillId || "",
          RegistrationId: data.RegistrationId || "",
          OutBillNo: data.OutBillNo || "",
          OutBillDate: data.OutBillDate ? data.OutBillDate.split("T")[0] : "",
          Amount: data.Amount || 0,
          DiscAmt: data.DiscAmt || 0,
          GTotal: data.GTotal || 0,
          paidamt: data.paidamt || 0,
          dueamt: data.dueamt || 0,
          PaymentType: data.PaymentType || 0,
          BANK: data.BANK || "",
          Cheque: data.Cheque || "",
          narration: data.narration || "",
          PatientName: data.PatientName || "",
          Age: data.Age || 0,
          AgeD:data.AgeD || 0,
          AgeN:data.AgeN || 0,
          Sex: data.Sex || "",
          PhoneNo: data.PhoneNo || "",
          department: data.department || "",
          DoctorId: data.DoctorId || 1,
          refdoc: data.refdoc || "",
          assdoc: data.assdoc || "",
          ansdoc: data.ansdoc || "",
          otbookdate: data.otbookdate ? data.otbookdate.split("T")[0] : "",
          CompanyId: data.CompanyId || 0,
          ReligionId: data.ReligionId || "",
          AreaId: data.AreaId || "",
          Add1: data.Add1 || "",
          Add2: data.Add2 || "",
          Add3: data.Add3 || "",
        });

        setPatientData(data.patientregistration || {});
        setChargeItems(data.chargeItems || []);
        setDoctorSearch(data.DoctorName || "");

        const doc = doctorList.find((d) => d.DoctorId == data.DoctorId);
        setDoctorSearch(doc?.Doctor || "");
      }

      const chargesResponse = await axiosInstance.get("/other-charges-list");
      if (chargesResponse.data.success) {
        setAvailableCharges(chargesResponse.data.data);
      }
    } catch (err) {
      toast.error("Failed to load record");
    } finally {
      setLoading(false);
    }
  };

  const fetchChargeResponse = async () => {
    try {
      const chargesResponse = await axiosInstance.get("/other-charges-list");
      if (chargesResponse.data.success) {
        setAvailableCharges(chargesResponse.data.data);
      }
    } catch (error) {
      toast.error("Failed to load other charge response");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      setDoctorLoading(true);

      const firstRes = await axiosInstance.get("/doctormaster", {
        params: { limit: 1, page: 1 },
      });

      const total = firstRes.data?.total || 0;
      if (!total) return;

      const allRes = await axiosInstance.get("/doctormaster", {
        params: { limit: total, page: 1 },
      });

      setDoctorList(allRes.data?.data || []);
    } catch {
      toast.error("Failed to fetch doctors");
    } finally {
      setDoctorLoading(false);
    }
  };


   const openDrawerAdd = () => {
    setFormData({ OutBillId: "",
    RegistrationId: "",
    OutBillNo: "",
    OutBillDate: "",
    Amount: 0,
    DiscAmt: 0,
    GTotal: 0,
    paidamt: 0,
    dueamt: 0,
    PaymentType: 0,
    BANK: "",
    Cheque: "",
    narration: "",});
    
    setModalType("add");
    setShowDrawer(true);
  };
  // ================= DRAWER OPEN =================
  const openView = async (row) => {
    setModalType("view");
    await loadSingle(row.OutBillId);
    setShowDrawer(true);
  };

  const openEdit = async (row) => {
    setModalType("edit");
    await loadSingle(row.OutBillId);
    setShowDrawer(true);
  };

  // ================= INPUT =================
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((p) => {
  //     const u = { ...p, [name]: value };
  //     if (name === "DiscAmt") {
  //       u.GTotal = u.Amount - value;
  //       u.dueamt = u.GTotal - u.paidamt;
  //     }
  //     if (name === "paidamt") {
  //       u.dueamt = u.GTotal - value;
  //     }
  //     return u;
  //   });
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "DiscAmt") {
        updated.GTotal =
          (parseFloat(updated.Amount) || 0) - (parseFloat(value) || 0);

        updated.dueamt = updated.GTotal - (parseFloat(updated.paidamt) || 0);
      }

      if (name === "paidamt") {
        updated.dueamt =
          (parseFloat(updated.GTotal) || 0) - (parseFloat(value) || 0);
      }

      return updated;
    });
  };
  const { PatientName, Age, Sex, PhoneNo,ReligionId,AreaId,Add1,Add2,Add3,AgeD,AgeN, ...payload } = formData;

  // ================= UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(
        `/opd-other-charges-with-items/${formData.OutBillId}`,
        { ...payload, chargeItems }
      );
      toast.success("Updated successfully");
      setShowDrawer(false);
      fetchCharges(page);
    } catch {
      toast.error("Update failed");
    }
  };
  // chargeitem fnc-----
  const addChargeItem = () => {
    setChargeItems((prev) => [
      ...prev,
      {
        OtherChId: "",
        OtherCharge: "",
        Rate: 0,
        Qty: 1,
        Amount: 0,
        UNIT: "",
      },
    ]);
  };

  // removeChargeitem fnc---
  const removeChargeItem = (index) => {
    setChargeItems((prev) => prev.filter((_, i) => i !== index));
  };
  // updateChargeItem fnc----
  const updateChargeItem = (index, field, value) => {
    const updated = [...chargeItems];
    updated[index][field] = value;

    if (field === "Rate" || field === "Qty") {
      updated[index].Amount =
        (updated[index].Rate || 0) * (updated[index].Qty || 1);
    }

    if (field === "OtherChId") {
      const selected = availableCharges.find((c) => c.OtherChId == value);

      if (selected) {
        updated[index].OtherCharge = selected.OtherCharge;
        updated[index].Rate = selected.Rate;
        updated[index].UNIT = selected.UNIT;
        updated[index].Amount = selected.Rate * (updated[index].Qty || 1);
      }
    }

    setChargeItems(updated);

    const total = updated.reduce(
      (sum, item) => sum + (parseFloat(item.Amount) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      Amount: total,
      GTotal: total - (parseFloat(prev.DiscAmt) || 0),
    }));
  };

  // ================= DELETE =================
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/opd-other-charges/${deleteId}`);
      toast.success("Deleted");
      setShowConfirm(false);
      fetchCharges(page);
    } catch {
      toast.error("Delete failed");
    }
  };
  // Pagination
  // const goToPage = (p) => {
  //   if (p < 1 || p > totalPages) return;
  //   fetchCharges(p);
  // };
const goToPage = (p) => {
  if (p < 1 || p > totalPages) return;
  fetchCharges(p, searchFilters);
};

  return (
    <div className="main-content">
      <ToastContainer />
<div className="mb-3 d-flex justify-content-between">
  <button
    className="btn btn-sm btn-secondary"
    onClick={() => setShowSearch(!showSearch)}
  >
    {showSearch ? "Hide Search" : "Show Search"}
  </button>
   {/* <button className="btn btn-sm btn-primary" 
   onClick={openDrawerAdd}
   >
              <i className="fa-light fa-plus"></i> Add
            </button> */}
</div>

{showSearch && (
  <div className="card mb-3">
    <div className="card-body">
      <div className="row g-2">
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Registration ID"
            value={searchFilters.registrationId}
            onChange={(e) =>
              handleFilterChange("registrationId", e.target.value)
            }
          />
        </div>

        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Bill No"
            value={searchFilters.OutBillNo}
            onChange={(e) =>
              handleFilterChange("OutBillNo", e.target.value)
            }
          />
        </div>

        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={searchFilters.startDate}
            onChange={(e) =>
              handleFilterChange("startDate", e.target.value)
            }
          />
        </div>

        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={searchFilters.endDate}
            onChange={(e) =>
              handleFilterChange("endDate", e.target.value)
            }
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Min Amount"
            value={searchFilters.minAmount}
            onChange={(e) =>
              handleFilterChange("minAmount", e.target.value)
            }
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Max Amount"
            value={searchFilters.maxAmount}
            onChange={(e) =>
              handleFilterChange("maxAmount", e.target.value)
            }
          />
        </div>

        <div className="col-md-12 text-end mt-2">
          <button
            className="btn btn-sm btn-success me-2"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* ================= LIST ================= */}
      <div className="panel">
        <div className="panel-header">
          <h5>💰 Other Charges</h5>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-striped table-hover table-dashed">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Sl</th>
                    <th>Bill No</th>
                    <th>Reg ID</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((r, i) => (
                    <tr key={r.OutBillId}>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() => openView(r)}
                        >
                          <i className="fa-light fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEdit(r)}
                        >
                          <i className="fa-light fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setDeleteId(r.OutBillId);
                            setShowConfirm(true);
                          }}
                        >
                          <i className="fa-light fa-trash"></i>
                        </button>
                      </td>
                      <td>{(page - 1) * limit + i + 1}</td>
                      <td>{r.OutBillNo}</td>
                      <td>{r.RegistrationId}</td>
                      <td>{r.PatientName}</td>
                      <td>{new Date(r.OutBillDate).toLocaleDateString()}</td>
                      <td>₹{r.Amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* ================= DRAWER ================= */}
      {/* ================= RIGHT SIDE DRAWER ================= */}
      {showDrawer && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 9998 }} />

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "950px",
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

            <OverlayScrollbarsComponent style={{ height: "100%" }}>
              <form className="p-3" onSubmit={handleSubmit}>
                {/* ================= REGISTRATION DETAIL ================= */}
                <h6 className="text-primary border-bottom pb-2">
                  Registration Detail
                </h6>

                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="form-label">New Registration</label>
                    <select className="form-control">
                      <option>N</option>
                      <option>Y</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="OutBillDate"
                      value={formData.OutBillDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label ">Time</label>
                    <input type="time" className="form-control" />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="form-label mt-2">Patient Name</label>
                    <input
                      className="form-control"
                      value={formData.PatientName || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mt-2">Registration No</label>
                    <input
                      className="form-control"
                      name="RegistrationId"
                      value={formData.RegistrationId}
                       
                       disabled={modalType !== "add"}
                    />
                    <select name="RegistrationId" >
                      <option value="">Select</option>
                      {charges.map((c,idx)=>(
                        <option key={idx} value={c.RegistrationId}>{c.RegistrationId}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mt-2">C Registration No</label>
                    <input className="form-control" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mt-2">Company Name</label>
                    <select className="form-control d-flex">
                      <option>N</option>
                      <option>Y</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label mt-2">-</label>
                    <input
                      className="form-control"
                      name="CompanyId"
                      value={formData.CompanyId}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* ================= PATIENT DETAIL ================= */}
                <h6 className="text-primary border-bottom pb-2 mt-3">
                  Patient Detail
                </h6>
                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Age (Y)</label>
                    <input
                      className="form-control"
                      name="Age"
                      value={formData.Age}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Age (M)</label>
                    <input className="form-control"
                    name="AgeN"
                      value={formData.AgeN}
                      onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Age (D)</label>
                    <input className="form-control"
                    name="AgeD"
                      value={formData.AgeD}
                      onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Sex</label>
                    <select
                      className="form-control"
                      name="Sex"
                      value={formData.Sex}
                      onChange={handleChange}
                    >
                      <option value={"M"}>M</option>
                      <option value={"F"}>F</option>
                      <option value={"O"}>O</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Marital Status</label>
                    <select className="form-control" value={formData.MStatus}>
                      <option value="M">M</option>
                      <option value="U">U</option>
                    </select>
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-md-2">
                    <label className="form-label mt-2">Phone</label>
                    <input
                      className="form-control"
                      name="PhoneNo"
                      value={formData.PhoneNo}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mt-2">Religion</label>
                    <select
                      name="ReligionId"
                      className="form-control"
                      value={formData.ReligionId}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {religion.map((r, idx) => (
                        <option key={idx} value={r.ReligionId}>
                          {r.Religion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mt-2">Area / PS</label>
                <AsyncPaginateSelect
                      value={formData.AreaId}
                      onChange={(opt) =>
                        setFormData((p) => ({ ...p, AreaId: opt?.value || "" }))
                      }
                      apiUrl="/area"
                      getByIdUrl="/area"
                      labelKey="Area"
                      valueKey="AreaId"
                      searchKey="area"
                      placeholder="Search area..."
                      
                    />  

                    {/* <input className="form-control" /> */}
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Address 1</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="Add1"
                      value={formData.Add1}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="col-md-2">

                    <label className="form-label ">Address 2</label>
                    <textarea className="form-control" rows="2" name="Add2"
                      value={formData.Add2}
                      onChange={handleChange}></textarea>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label ">Address 3</label>
                    <textarea className="form-control" rows="2" name="Add3"
                      value={formData.Add3}
                      onChange={handleChange}></textarea>
                  </div>
                </div>

                <div className="row g-2 mt-2"></div>

                {/* ================= OPD / BILL DETAIL ================= */}
                <h6 className="text-primary border-bottom pb-2 mt-3">
                  OPD / Bill Detail
                </h6>
                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="form-label">Department</label>

                    {/* <input className="form-control" name="department" value={formData.department} onChange={handleChange}/> */}
                    {/* <AsyncPaginateSelect
  value={formData.department}
  onChange={(opt) =>
    setFormData((p) => ({ ...p, department: opt?.value || "" }))
  }
  apiUrl="/api/v1/department"
  getByIdUrl="/api/v1/department"
  labelKey="Department"
  valueKey="DepartmentId"
  placeholder="Search department..."
/> */}

                    <select
                      name="department"
                      className="form-control"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {department.map((d, idx) => (
                        <option key={idx} value={d.DepartmentId}>
                          {d.Department}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div className="col-md-2"><label className="form-label ">Doctor</label> */}
                  {/* <input className="form-control" name="DoctorId" value={formData.DoctorId} onChange={handleChange} /></div> */}
                  <div className="col-md-2 position-relative" ref={doctorRef}>

                    {/* <input
                      className="form-control"
                      placeholder="Search doctor..."
                      value={doctorSearch}
                      onFocus={() => setShowDoctorDropdown(true)}
                      onChange={(e) => {
                        setDoctorSearch(e.target.value);
                        setShowDoctorDropdown(true);
                      }}
                      disabled={modalType === "view"}
                    />

                    {showDoctorDropdown && (
                      <div
                        className="border rounded bg-black position-absolute w-100 mt-1"
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 9999,
                        }}
                      >
                        {filteredDoctors.length === 0 ? (
                          <div className="px-2 py-1 text-muted">
                            No doctor found
                          </div>
                        ) : (
                          filteredDoctors.slice(0, 20).map((d) => (
                            <div
                              key={d.DoctorId}
                              className="px-2 py-1 dropdown-item"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setFormData((p) => ({
                                  ...p,
                                  DoctorId: d.DoctorId,
                                }));
                                setDoctorSearch(d.Doctor);
                                setShowDoctorDropdown(false);
                              }}
                            >
                              {d.Doctor}
                            </div>
                          ))
                        )}
                      </div>
                    )} */}
                    <DoctorSearchSelect
                      label="Doctor"
                      value={formData.DoctorId}
                      doctorList={doctorList}
                      disabled={modalType === "view"}
                      placeholder="Search doctor..."
                      onChange={(id, name) => {
                        setFormData((p) => ({ ...p, DoctorId: id }));
                      }}
                    />
                  </div>

                  {/* <div className="col-md-2"><label className="form-label ">Assistant</label>

          <input className="form-control" name="assdoc" value={formData.assdoc} onChange={handleChange}/>
          </div> */}
                  <div className="col-md-2">
                    <DoctorSearchSelect
                      label="Assistant"
                      value={formData.assdoc}
                      doctorList={doctorList}
                      disabled={modalType === "view"}
                      placeholder="Search assistant..."
                      onChange={(id, name) => {
                        setFormData((p) => ({ ...p, assdoc: id }));
                      }}
                    />
                  </div>
                  {/* <div className="col-md-2"> <label className="form-label ">Ref Doctor</label>
          <input className="form-control" name="refdoc" value={formData.refdoc} onChange={handleChange} /></div> */}
                  <div className="col-md-2">
                    <DoctorSearchSelect
                      label="Ref Doctor"
                      value={formData.refdoc}
                      doctorList={doctorList}
                      disabled={modalType === "view"}
                      placeholder="Search Ref Doctor..."
                      onChange={(id, name) => {
                        setFormData((p) => ({ ...p, refdoc: id }));
                      }}
                    />
                  </div>
                  {/* <div className="col-md-2"><label className="form-label ">Anesthetist</label>
          <input className="form-control" name="ansdoc" value={formData.ansdoc} onChange={handleChange} /></div> */}
                  <div className="col-md-2">
                    <DoctorSearchSelect
                      label="Anesthetist"
                      value={formData.ansdoc}
                      doctorList={doctorList}
                      disabled={modalType === "view"}
                      onChange={(id) =>
                        setFormData((p) => ({ ...p, ansdoc: id }))
                      }
                    />
                  </div>
                  <div className="col-md-2"></div>
                </div>

                <div className="row g-2">
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label mt-2">Bill No</label>
                    <input
                      className="form-control"
                      name="OutBillNo"
                      value={formData.OutBillNo}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                    />
                  </div>
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label mt-2">Bill Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="OutBillDate"
                      value={formData.OutBillDate}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mt-2">OT Book Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="otbookdate"
                      value={formData.otbookdate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mt-2">Book Time</label>
                    <input type="time" className="form-control" />
                  </div>
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label mt-2">Barcode / OPD No</label>
                    <input className="form-control" />
                  </div>
                  <div className="col-md-2"></div>
                </div>

                {/* ================= CHARGE ITEMS ================= */}
                <h6 className="text-primary border-bottom pb-2 mt-3">
                  Charge Items
                </h6>

                {/* <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Particular</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {chargeItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={item.OtherCharge || ""}
                      disabled
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={item.UNIT || ""}
                      disabled
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={item.Rate || 0}
                      disabled={modalType === "view"}
                      onChange={(e) => {
                        const updated = [...chargeItems];
                        updated[index].Rate = Number(e.target.value);
                        updated[index].Amount =
                          updated[index].Rate * (updated[index].Qty || 1);
                        setChargeItems(updated);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={item.Qty || 1}
                      disabled={modalType === "view"}
                      onChange={(e) => {
                        const updated = [...chargeItems];
                        updated[index].Qty = Number(e.target.value);
                        updated[index].Amount =
                          (updated[index].Rate || 0) * updated[index].Qty;
                        setChargeItems(updated);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={item.Amount || 0}
                      disabled
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table> */}

                <table
                  className="table table-bordered table-sm"
                  style={{ tableLayout: "fixed" }}
                >
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "10%" }}>
                        Particular
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        Unit
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        Rate
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        Qty
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        Amount
                      </th>
                      {modalType === "edit" && (
                        <th className="text-center" style={{ width: "10%" }}>
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {chargeItems.map((item, index) => (
                      <tr key={index}>
                        {/* ===== Particular (SELECT HERE) ===== */}
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={item.OtherChId || ""}
                            disabled={modalType === "view"}
                            onChange={(e) =>
                              updateChargeItem(
                                index,
                                "OtherChId",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Charge</option>
                            {availableCharges.map((c) => (
                              <option key={c.OtherChId} value={c.OtherChId}>
                                {c.OtherCharge}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* ===== UNIT ===== */}
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={item.UNIT || ""}
                            disabled
                          />
                        </td>

                        {/* ===== RATE ===== */}
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={item.Rate || 0}
                            disabled={modalType === "view"}
                            onChange={(e) =>
                              updateChargeItem(
                                index,
                                "Rate",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        {/* ===== QTY ===== */}
                        <td className="text-center">
                          <input
                            type="number"
                            className="form-control form-control-sm py-0 text-center "
                            value={item.Qty || 1}
                            disabled={modalType === "view"}
                            onChange={(e) =>
                              updateChargeItem(
                                index,
                                "Qty",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        {/* ===== AMOUNT ===== */}
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={item.Amount || 0}
                            disabled
                          />
                        </td>
                        {/* ===== ACTION ===== */}
                        {modalType === "edit" && (
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeChargeItem(index)}
                              title="Remove"
                            >
                              <i className="fa-light fa-trash"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {modalType === "edit" && (
                  <div className="mt-2 text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={addChargeItem}
                    >
                      <i className="fa-light fa-plus me-1"></i>
                      Add Charge Item
                    </button>
                  </div>
                )}

                {/* ================= AMOUNT SUMMARY ================= */}
                <h6 className="text-primary border-bottom pb-2 mt-3">
                  Amount Summary
                </h6>
                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="form-label">Total</label>
                    <input
                      className="form-control"
                      value={formData.Amount}
                      disabled
                    />
                  </div>
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label ">Discount</label>
                    <input
                      type="number"
                      className="form-control"
                      name="DiscAmt"
                      value={formData.DiscAmt}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                    />
                  </div>
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label ">Grand Total</label>
                    <input
                      className="form-control"
                      value={formData.GTotal}
                      disabled
                    />
                  </div>
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label ">Paid</label>
                    <input
                      type="number"
                      className="form-control"
                      name="paidamt"
                      value={formData.paidamt}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label ">Due</label>
                    <input
                      className="form-control"
                      value={formData.dueamt}
                      disabled
                    />
                  </div>
                  <div className="col-md-2"></div>
                </div>

                {/* ================= PAYMENT ================= */}
                <h6 className="text-primary border-bottom pb-2 mt-3">
                  Payment
                </h6>
                <div className="row g-2">
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label">Receipt Type</label>
                    <select
                      className="form-control"
                      name="PaymentType"
                      value={formData.PaymentType}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                    >
                      <option value={0}>Cash</option>
                      <option value={1}>Card</option>
                      <option value={2}>Cheque</option>
                      <option value={3}>Online</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label">Bank Name</label>
                    <input
                      className="form-control"
                      name="BANK"
                      value={formData.BANK}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                    />
                  </div>
                  <div className="col-md-2">
                    {" "}
                    <label className="form-label ">Cheque / Card</label>
                    <input
                      className="form-control"
                      name="Cheque"
                      value={formData.Cheque}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                    />
                  </div>
                  <div className="col-md-2"></div>
                  <div className="col-md-2"></div>
                </div>

                {/* {modalType === "edit" && (
                  <button className="btn btn-primary w-100 mt-3">Update</button>
                )} */}
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
            </OverlayScrollbarsComponent>
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>
              Prev
            </button>
          </li>

          {/* {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${page === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))} */}
          {<button className="page-link">{`${page}/${totalPages}`}</button>}

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

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

      <Footer />
    </div>
  );
};

export default OtherCharges;
