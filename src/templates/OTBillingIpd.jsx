import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../components/footer/Footer";
import "react-toastify/dist/ReactToastify.css";
// import useAxiosFetch from "./Fetch";
// import OT from "./OT";


import axiosInstance from "../axiosInstance";
import ApiSelect from "./DiagnosisMaster/ApiSelect";
import AsyncApiSelect from "../components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/AsyncApiSelect";

const OTBilling = () => {
  const [admissionOption, setAdmissionOption] = useState(null);


  const [chargeItems, setChargeItems] = useState([]);
  const [availableCharges, setAvailableCharges] = useState([]);


  /* ================= LIST STATE ================= */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  /* ================= DRAWER ================= */
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit | view
  const [editingItem, setEditingItem] = useState(null);


  const calculateTotal = (items, fd) => {
    const chargeTotal = items.reduce((s, i) => s + Number(i.Amount || 0), 0);


    return (
      chargeTotal +
      Number(fd.AnesthesiaAmt || 0) +
      Number(fd.SergonDocAmt || 0) +
      Number(fd.OthersDocAmt || 0) +
      Number(fd.OTAmt || 0) +
      // Number(fd.ConsumableAmt || 0) +
      // Number(fd.InstrumentAmt || 0) +
      // Number(fd.MedicineAmt || 0) +
      // Number(fd.OthersCh || 0) +
      Number(fd.ServiceCharge || 0)
    );
  };


  /* ================= FORM ================= */
  const initialFormData = {
    OtBillId: "",
    OtBillNo: "",
    BillDate: new Date().toISOString().split("T")[0],
    AdmitionId: "",
    PatientName: "",


    AnesthesiaDocId: "",
    anttype: "",
    AnesthesiaAmt: 0,


    SergonDocId: "",
    SergonDocAmt: 0,


    OthersDocId: "",
    OthersDocAmt: 0,


    OTId: "",
    OTType: "",
    OTAmt: 0,
    OTSlotId: "",
    OTHr: 0,
    OTMinit: 0,


    ConsumableAmt: 0,
    InstrumentAmt: 0,
    MedicineAmt: 0,
    OthersCh: 0,
    TotalAmt: 0,


    // UserId: "",
  };


  const [formData, setFormData] = useState({
    ...initialFormData,
  });
  useEffect(() => {
    if (!formData.AdmitionId) {
      setAdmissionOption(null);
      return;
    }


    setAdmissionOption({
      label: formData.AdmitionId,
      value: formData.AdmitionId,
    });
  }, [formData.AdmitionId]);


  // useEffect(() => {
  //   const consumableTotal = formData.Consumables.reduce(
  //     (sum, row) => sum + Number(row.amount || 0),
  //     0
  //   );


  //   const grandTotal =
  //     Number(formData.AnesthesiaAmt || 0) +
  //     Number(formData.SurgeonAmt || 0) +
  //     Number(formData.CareDoctorAmt || 0) +
  //     Number(formData.OTCharge || 0) +
  //     consumableTotal +
  //     Number(formData.OTInstruments || 0) +
  //     Number(formData.OTMedicines || 0) +
  //     Number(formData.OTOtherCharge || 0) +
  //     Number(formData.ServiceCharge || 0);


  //   setFormData((prev) => ({
  //     ...prev,
  //     OTConsumable: consumableTotal,
  //     TotalAmt: grandTotal.toFixed(2),
  //   }));
  // }, [
  //   formData.Consumables,
  //   formData.AnesthesiaAmt,
  //   formData.SurgeonAmt,
  //   formData.CareDoctorAmt,
  //   formData.OTCharge,
  //   formData.OTInstruments,
  //   formData.OTMedicines,
  //   formData.OTOtherCharge,
  //   formData.ServiceCharge,
  // ]);


  /* ================= SEARCH ================= */
  const [searchPatient, setSearchPatient] = useState("");


  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);


  /* ================= DELETE ================= */
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);


  /* ================= FETCH LIST ================= */
  const fetchBills = async (pageNo = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/ot-bills?page=${pageNo}&limit=${limit}`
      );


      setItems(res.data.data || []);
      setPage(res.data.pagination?.currentPage || pageNo);
      setTotalPages(res.data.pagination?.totalPages);
    } catch {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchBills(1);
    fetchChargeResponse();
  }, []);
  // ================= AUTO FILL WHEN ADMITION ID SELECTED =================
  useEffect(() => {
    if (modalType !== "add") return;


    if (!formData.AdmitionId) return;


    const fetchAdmissionDetails = async () => {
      try {
        const res1 = await axiosInstance.get(
          `/ot-bills/search/admission?admissionId=${formData.AdmitionId}&page=1`
          // `/admission/search?q=${formData.AdmitionId}`
        );


        const OtBillId = res1.data?.data?.[0]?.OtBillId;
        if (!OtBillId) return;


        const res = await axiosInstance.get(
          `/ot-bills/${encodeURIComponent(OtBillId)}`
        );


        const item = res.data?.data;
        if (!item) return;


        setFormData((prev) => ({
          ...prev,
          // AdmitionId: item.AdmitionId,
          PatientName: item.PatientName || prev.PatientName,
          OtBillId: item.OtBillId,
          OtBillNo: item.OtBillNo,
          BillDate: new Date().toISOString().split("T")[0],
          AnesthesiaDocId: item.AnesthesiaDocId,
          AnesthesiaAmt: item.AnesthesiaAmt,
          anttype: item.anttype,
          SergonDocId: item.SergonDocId,
          SergonDocAmt: item.SergonDocAmt,
          OthersDocId: item.OthersDocId,
          OthersDocAmt: item.OthersDocAmt,
          OTId: item.OTId,
          OTType: item.OTType,
          OTAmt: item.OTAmt,
          OTSlotId: item.OTSlotId,
          OTHr: item.OTHr,
          OTMinit: item.OTMinit,
          ConsumableAmt: item.ConsumableAmt,
          InstrumentAmt: item.InstrumentAmt,
          MedicineAmt: item.MedicineAmt,
          OthersCh: item.OthersCh,
          TotalAmt: item.TotalAmt,
          otBillDetails: item.otBillDetails,
        }));
        // setChargeItems(item.otBillDetails || []);


        const chargesResponse = await axiosInstance.get("/otItem");
        if (chargesResponse.data.success) {
          console.log(chargesResponse.data.data);


          setAvailableCharges(chargesResponse.data.data);
        }
        setChargeItems(
          (item.otBillDetails || []).map((d) => ({
            OtItemId: d.OtItemId,
            Rate: d.Rate,
            Unit: d.Unit,


            Qty: d.Qty,
            Amount: d.Amount,
          }))
        );
      } catch (err) {
        console.error("Fetch OT bill error:", err);
      }
    };


    fetchAdmissionDetails();
  }, [formData.AdmitionId, modalType]);


  const handleSearch = async () => {
    setLoading(true);


    try {
      let url = "";
      let params = new URLSearchParams();


      /* ===== DATE RANGE SEARCH ===== */
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);


        url = `/ot-bills/search/date-range?${params.toString()}`;
      } else if (searchPatient) {
        /* ===== PATIENT SEARCH ===== */
        params.append("patientName", searchPatient);


        url = `/ot-bills/search/patient?${params.toString()}`;
      } else {
        fetchBills(1);
        setLoading(false);
        return;
      }


      const res = await axiosInstance.get(url);


      setItems(res.data.data || []);


      setPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    }


    setLoading(false);
  };


  const clearSearch = () => {
    setSearchPatient("");
    setStartDate("");
    setEndDate("");
    fetchBills(1);
  };


  /* ================= DRAWER OPEN ================= */
  const openAdd = () => {
    setModalType("add");
    setEditingItem(null);
    setFormData({
      ...initialFormData,
      BillDate: new Date().toISOString().split("T")[0],
    });
    setAdmissionOption(null);
    setChargeItems([]);
    setShowDrawer(true);
  };


  // const openEdit = (item) => {
  //   setModalType("edit");
  //   setEditingItem(item);
  //   setFormData((prev) => ({
  //     ...prev,
  //     ...item,
  //     BillDate: item.BillDate?.split("T")[0],
  //   }));


  //   setChargeItems(
  //     (item.otBillDetails || []).map((d) => ({
  //       OtItemId: d.OtItemId,
  //       Rate: d.Rate,
  //       Unit: d.Unit,
  //       Amount: d.Amount,
  //       Qty: d.Qty,
  //     }))
  //   );


  //   setShowDrawer(true);
  // };
  const openEdit = async (otBillId) => {
    try {
      setLoading(true);
      setModalType("edit");
      setShowDrawer(true);


      // 🔥 OtBillId may contain "/" → encode REQUIRED
      const res = await axiosInstance.get(
        `/ot-bills/${encodeURIComponent(otBillId)}`
      );


      const item = res.data?.data;
      if (!item) {
        toast.error("OT Bill not found");
        return;
      }


      setEditingItem(item);


      // 🔥 FORM DATA FILL
      setFormData({
        ...initialFormData,
        ...item,
        BillDate: item.BillDate?.split("T")[0],
      });


      // 🔥 Admission Async Select fix
      if (item.AdmitionId) {
        setAdmissionOption({
          label: item.AdmitionId,
          value: item.AdmitionId,
        });
      }


      // 🔥 Charge Items
      setChargeItems(
        (item.otBillDetails || []).map((d) => ({
          OtItemId: d.OtItemId,
          Rate: d.Rate,
          Unit: d.Unit,
          Qty: d.Qty,
          Amount: d.Amount,
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load OT Bill");
    } finally {
      setLoading(false);
    }
  };


  // const openView = (item) => {
  //   setModalType("view");
  //   setEditingItem(item);
  //   setFormData(item);
  //   setShowDrawer(true);
  // };


  const openView = async (otBillId) => {
    try {
      setLoading(true);
      setModalType("view");
      setShowDrawer(true);


      const res = await axiosInstance.get(
        `/ot-bills/${encodeURIComponent(otBillId)}`
      );


      const item = res.data?.data;
      if (!item) {
        toast.error("OT Bill not found");
        return;
      }


      setEditingItem(item);


      // 🔥 Form Fill
      setFormData({
        ...initialFormData,
        ...item,
        BillDate: item.BillDate?.split("T")[0],
      });


      // 🔥 Admission select UI sync
      if (item.AdmitionId) {
        setAdmissionOption({
          label: item.AdmitionId,
          value: item.AdmitionId,
        });
      }


      // 🔥 Charge Items
      setChargeItems(
        (item.otBillDetails || []).map((d) => ({
          OtItemId: d.OtItemId,
          Rate: d.Rate,
          Unit: d.Unit,
          Qty: d.Qty,
          Amount: d.Amount,
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load OT Bill");
    } finally {
      setLoading(false);
    }
  };


  const buildPayload = () => ({
    ...formData,


    // 🔥 backend expects this exact key
    otBillDetails: chargeItems.map((item, index) => ({
      OtItemId: item.OtItemId,
      Rate: Number(item.Rate),


      Unit: item.Unit,
      // Amount: Number(item.Amount),
      Amount: Number(item.rate * item.Qty),
      SlNo: index + 1,
      Qty: Number(item.Qty),
    })),
  });


  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();


    const payload = buildPayload();


    try {
      if (modalType === "edit") {
        await axiosInstance.put(`/ot-bills/${editingItem.OtBillId}`, payload);
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post(`/ot-bills`, payload);
        toast.success("Created successfully");
      }


      setShowDrawer(false);
      fetchBills(page);
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };


  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/ot-bills/${deleteId}`);
      toast.success("Deleted successfully");
      setShowConfirm(false);
      fetchBills(page);
    } catch {
      toast.error("Delete failed");
    }
  };


  const fetchChargeResponse = async () => {
    try {
      const chargesResponse = await axiosInstance.get("/otItem");
      if (chargesResponse.data.success) {
        setAvailableCharges(chargesResponse.data.data);
      }
    } catch (error) {
      toast.error("Failed to load other charge response");
    } finally {
      setLoading(false);
    }
  };


  /* ================= PAGINATION ================= */
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;


    // 🔥 search active
    if ((startDate && endDate) || searchPatient) {
      handleSearch(p);
    }
    // 🔥 normal list
    else {
      fetchBills(p);
    }
  };


  // chargeitem fnc-----
  const addChargeItem = () => {
    setChargeItems((prev) => [
      ...prev,
      {
        OtItemId: "",
        OtItem: "",
        Rate: 0,
        Qty: 1,
        Amount: 0,
        Unit: "",
      },
    ]);
  };


  // removeChargeitem fnc---
  const removeChargeItem = (index) => {
    setChargeItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);


      return updated;
    });
  };


  // updateChargeItem fnc----
  const updateChargeItem = (index, field, value) => {
    const updated = [...chargeItems];
    updated[index][field] = value;


    if (field === "Rate" || field === "Qty") {
      updated[index].Amount =
        (updated[index].Rate || 0) * (updated[index].Qty || 1);
    }


    if (field === "OtItemId") {
      const selected = availableCharges.find((c) => c.OtItemId == value);


      if (selected) {
        updated[index].OtItem = selected.OtItem;
        updated[index].Rate = selected.Rate;
        updated[index].Unit = selected.Unit;
        const qty = Number(updated[index].Qty || 1);
        updated[index].Amount = Number(selected.Rate) * qty;
        // updated[index].Qty = selected.Qty;
        // updated[index].Amount = selected.Rate * (updated[index].Qty || 1);
      }
    }


    setChargeItems(updated);


    // const total = updated.reduce(
    //   (sum, item) => sum + (parseFloat(item.Amount) || 0),
    //   0
    // );
  };
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      TotalAmt: calculateTotal(chargeItems, prev),
    }));
  }, [
    chargeItems,
    formData.AnesthesiaAmt,
    formData.SergonDocAmt,
    formData.OthersDocAmt,
    formData.OTAmt,
    formData.ServiceCharge,
  ]);


  // ================= DELETE =================
  // const confirmDelete = async () => {
  //   try {
  //     await axiosInstance.delete(`/opd-other-charges/${deleteId}`);
  //     toast.success("Deleted");
  //     setShowConfirm(false);
  //     fetchCharges(page);
  //   } catch {
  //     toast.error("Delete failed");
  //   }
  // };


  return (
    <div className="main-content">
      <ToastContainer />
      {/* <OT/>  */}
      {/* ================= PANEL ================= */}
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🏥 OT Billing</h5>


          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 140 }}
            />


            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 140 }}
            />


            <input
              className="form-control form-control-sm"
              placeholder="Patient Name"
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              style={{ width: 150 }}
            />
            <button
              className="btn btn-sm btn-info"
              onClick={() => handleSearch(1)}
            >
              <i className="fa fa-search"></i>
            </button>
            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
              Clear
            </button>
            <button className="btn btn-sm btn-primary" onClick={openAdd}>
              <i className="fa-light fa-plus"></i> Add
            </button>
          </div>
        </div>


        {/* ================= TABLE ================= */}
        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-striped table-hover table-dashed">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Sl No</th>
                    <th>Bill Date</th>
                    <th>Admission No</th>
                    <th>Patient Name</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={item.OtBillId}>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openView(item.OtBillId)}
                            >
                              <i className="fa-light fa-eye"></i>
                            </button>


                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEdit(item.OtBillId)}
                            >
                              <i className="fa-light fa-pen-to-square"></i>
                            </button>


                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setDeleteId(item.OtBillId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                        <td>{(page - 1) * limit + i + 1}</td>
                        <td>{item.BillDate?.split("T")[0]}</td>
                        <td>{item.AdmitionId}</td>
                        <td>{item.PatientName}</td>
                        <td>{item.TotalAmt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>


      {showDrawer && (
        <>
          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 9998 }}
            onClick={() => setShowDrawer(false)}
          />


          {/* DRAWER */}
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


            <div className="top-panel" style={{ height: "100%" }}>
              {/* HEADER */}
              <div
                className="dropdown-txt "
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  padding: "10px",
                  fontWeight: 600,
                }}
              >
                {modalType === "add"
                  ? "➕ Add OT Billing"
                  : modalType === "edit"
                    ? "✏️ Edit OT Billing"
                    : "👁️ View OT Billing"}
              </div>


              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 50px)" }}
              >
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* ================= BASIC ================= */}
                    <h6 className="text-primary">Basic Info</h6>
                    <div className="row g-2 align-items-end">
                      <div className="col-md-3">
                        <label className="form-label">OT Bill No</label>
                        <input
                          className="form-control"
                          name="OtBillNo"
                          value={formData.OtBillNo || ""}
                          disabled
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">Bill Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="BillDate"
                          // value={new Date().toISOString().split("T")[0]}
                          value={formData.BillDate || ""}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              BillDate: e.target.value,
                            })
                          }
                        />
                      </div>


                      <div className="col-md-3" disabled={modalType === "edit"}>
                        <label className="form-label">Admission No</label>


                        {/* <AsyncApiSelect
                          api="https://lords-backend.onrender.com/api/v1/ot-bills/search/admission"
                          value={formData.AdmitionId}
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              AdmitionId: val,
                            }))
                          }
                          searchKey="admissionId"
                          labelKey="AdmitionId"
                          valueKey="AdmitionId"
                          defaultPage={1}
                          isDisabled={modalType === "edit"}
                        /> */}
                        <AsyncApiSelect
                          // api="https://lords-backend.onrender.com/api/v1/ot-bills/search/admission"
                          api="https://lords-backend.onrender.com/api/v1/admission/search"
                          // `/admission/search?q=${formData.AdmitionId}`
                          value={admissionOption} // ✅ UI object
                          // searchKey="admissionId"


                          searchKey="q"
                          labelKey="AdmitionId"
                          showKey="PatientName"
                          valueKey="AdmitionId"
                          onChange={(opt) => {
                            setAdmissionOption(opt); // UI
                            setFormData((prev) => ({
                              ...prev,
                              AdmitionId: opt ? opt.value : "", // backend
                            }));
                          }}
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">Patient Name</label>
                        <input
                          className="form-control"
                          name="PatientName"
                          value={formData.PatientName || ""}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              PatientName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>


                    {/* ================= BOOKING ================= */}
                    <hr />
                    {/* <h6 className="text-primary">Booking Info</h6> */}
                    <div className="row">
                      {/* Booking No */}
                      {/* <div className="col-md-3 mb-3">
                        <label className="form-label fw-semibold">
                          Booking No
                        </label>
                        <input
                          className="form-control"
                          placeholder="Enter Booking No"
                          value={formData.BookingNo || ""}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              BookingNo: e.target.value,
                            })
                          }
                        />
                      </div> */}


                      {/* Booking Date */}
                      {/* <div className="col-md-3 mb-3">
                        <label className="form-label fw-semibold">
                          Booking Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Enter Booking Date"
                          value={formData.BookingDate || ""}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              BookingDate: e.target.value,
                            })
                          }
                        />
                      </div> */}
                    </div>


                    {/* ================= DOCTORS ================= */}
                   
                    <h6 className="text-primary">Doctors</h6>


                    <div className="row g-2 align-items-end">
                      <div className="col-md-4">
                        <label className="form-label">Anesthesia Doctor</label>
                        {/* <input
      className="form-control"
      name="AnesthesiaDocId"
      value={formData.AnesthesiaDocId || ""}
      disabled={modalType === "view"}
      onChange={(e) =>
        setFormData({ ...formData, AnesthesiaDocId: e.target.value })
      }
    /> */}
                        <ApiSelect
                          api="https://lords-backend.onrender.com/api/v1/doctormaster?page=1&limit=10000"
                          value={formData.AnesthesiaDocId || null}
                          labelKey="Doctor"
                          valueKey="DoctorId"
                          placeholder="Select doctor"
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              AnesthesiaDocId: val, // ✅ correct field
                            }))
                          }
                        />
                      </div>


                      <div className="col-md-4">
                        <label className="form-label">Anesthesia Type</label>
                        {/* <input
      className="form-control"
      name="anttype"
      value={formData.anttype || ""}
      disabled={modalType === "view"}
      onChange={(e) =>
        setFormData({ ...formData, anttype: e.target.value })
      }
    /> */}
                        <select
                          className="form-control"
                          name="anttype"
                          value={formData.anttype || ""}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              anttype: e.target.value,
                            })
                          }
                        >
                          <option value="">Select</option>
                          {[
                            "SA",
                            "GA",
                            "LA",
                            "TIVA",
                            "BRACHIAL",
                            "WRIST",
                            "BLOCK",
                            "SADDLE",
                          ].map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>


                      <div className="col-md-4">
                        <label className="form-label">Anesthesia Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="AnesthesiaAmt"
                          value={formData.AnesthesiaAmt || 0}
                          disabled={modalType === "view"}
                          onChange={(e) => {
                            const value = Number(e.target.value || 0);
                            setFormData((prev) => ({
                              ...prev,
                              AnesthesiaAmt: value,
                            }));
                          }}
                        />
                      </div>
                    </div>


                    <div className="row g-2 align-items-end">
                      <div className="col-md-3">
                        <label className="form-label">Surgeon Doctor</label>


                        <ApiSelect
                          api="https://lords-backend.onrender.com/api/v1/doctormaster?page=1&limit=10000"
                          value={formData.SergonDocId || null}
                          labelKey="Doctor"
                          valueKey="DoctorId"
                          placeholder="Select doctor"
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              SergonDocId: val, // ✅ correct field
                            }))
                          }
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">Surgeon Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="SergonDocAmt"
                          value={formData.SergonDocAmt || 0}
                          disabled={modalType === "view"}
                          onChange={(e) => {
                            const value = Number(e.target.value || 0);
                            setFormData((prev) => ({
                              ...prev,
                              SergonDocAmt: value,
                            }));
                          }}
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">Under Care Doctor</label>


                        <ApiSelect
                          api="https://lords-backend.onrender.com/api/v1/doctormaster?page=1&limit=10000"
                          value={formData.OthersDocId || null}
                          labelKey="Doctor"
                          valueKey="DoctorId"
                          placeholder="Select doctor"
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              OthersDocId: val, // ✅ correct field
                            }))
                          }
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">Under Care Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="OthersDocAmt"
                          value={formData.OthersDocAmt || 0}
                          disabled={modalType === "view"}
                          onChange={(e) => {
                            const value = Number(e.target.value || 0);
                            setFormData((prev) => ({
                              ...prev,
                              OthersDocAmt: value,
                            }));
                          }}
                        />
                      </div>
                    </div>


                    {/* ================= OT DETAILS ================= */}
                    <hr />
                    <h6 className="text-primary">OT Charge</h6>


                    <div className="row g-2 align-items-end">
                      <div className="col-md-3">
                        <label className="form-label">OT Name</label>


                        <ApiSelect
                          api="https://lords-backend.onrender.com/api/v1/otMaster"
                          value={formData.OTId || ""}
                          labelKey="OtMaster"
                          valueKey="OtMasterId"
                          placeholder="Select "
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              OTId: val, // ✅ correct field
                            }))
                          }
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">OT Slot</label>


                        <ApiSelect
                          api="https://lords-backend.onrender.com/api/v1/otSlot"
                          value={formData.OTSlotId || ""}
                          labelKey="OTSlot"
                          valueKey="OTSlotId"
                          placeholder="Select "
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              OTSlotId: val, // ✅ correct field
                            }))
                          }
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">OT Type</label>


                        <ApiSelect
                          api="https://lords-backend.onrender.com/api/v1/otType"
                          value={formData.OTType || ""}
                          labelKey="OtType"
                          valueKey="OtType"
                          placeholder="Select "
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              OTType: val, // ✅ correct field
                            }))
                          }
                        />
                      </div>


                      <div className="col-md-3">
                        <label className="form-label">OT Charge Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="OTAmt"
                          value={formData.OTAmt || ""}
                          disabled={modalType === "view"}
                          onChange={(e) => {
                            const value = Number(e.target.value || 0);
                            setFormData((prev) => ({
                              ...prev,
                              OTAmt: value,
                            }));
                          }}
                        />
                      </div>
                    </div>


                    <div className="row g-2 align-items-end">
                      <div className="col-md-4">
                        <label className="form-label">OT Hour</label>
                        <input
                          type="number"
                          className="form-control"
                          name="OTHr"
                          value={formData.OTHr || 0}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({ ...formData, OTHr: e.target.value })
                          }
                        />
                      </div>


                      <div className="col-md-4">
                        <label className="form-label">OT Minute</label>
                        <input
                          type="number"
                          className="form-control"
                          name="OTMinit"
                          value={formData.OTMinit || 0}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              OTMinit: e.target.value,
                            })
                          }
                        />
                      </div>


                      <div className="col-md-4">
                        <label className="form-label">Remarks</label>
                        <input
                          className="form-control"
                          name="Remarks"
                          value={formData.Remarks || ""}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              Remarks: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>


                    {/* ================= CONSUMABLES ================= */}
                    <hr />
                    <h6 className="text-primary border-bottom pb-2 mt-3">
                      Charge Items
                    </h6>
                    {/* <table
                      className="table table-bordered table-sm"
                      style={{ tableLayout: "fixed" }}
                    >
                      <thead>
                        <tr>
                          <th className="text-center" style={{ width: "10%" }}>
                            Action
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Item
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Unit
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Rate
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Unit


                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Amount
                          </th>
                        </tr>
                      </thead>


                      <tbody>
                        {chargeItems?.map((item, index) => (
                          <tr key={index}>
                            {/* ===== PARTICULAR ===== */}
                    {/* <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  // onClick={() => openView(item)}
                                >
                                  <i className="fa-light fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  // onClick={() => openEdit(item)}
                                >
                                  <i className="fa-light fa-pen-to-square"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    // setDeleteId(item.id);
                                    // setShowConfirm(true);
                                  }}
                                >
                                  <i className="fa-light fa-trash-can"></i>
                                </button>
                              </div>
                            </td> */}


                    {/* <td>
                              <select
                                className="form-control form-control-sm"
                                value={item.OtItemId || ""}
                               onChange={(e) =>
  updateChargeItem(index, "Rate", Number(e.target.value))
}
                              >
                                <option value="">Select</option>
                                {/* {availableCharges.map((c) => (
            <option key={c.OtItemId} value={c.OtItemId}>
              {c.OtherCharge}
            </option>
          ))} */}
                    {/* </select>
                            </td> */}


                    {/* ===== UNIT ===== */}
                    {/* <td>
                              <input
                                className="form-control form-control-sm"
                                value={item.Unit || ""}
                                disabled
                              />
                            </td> */}


                    {/* ===== RATE ===== */}
                    {/* <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={item.Rate || 0}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  setFormData((prev) => {
                                    const updated = [...chargeItems];
                                    const Unit
 = updated[index].Unit
 || 0;
                                    updated[index] = {
                                      ...updated[index],
                                      Rate: value,
                                      Amount: value * Unit
,
                                    };
                                    return { ...prev, chargeItems: updated };
                                  });
                                }}
                              />
                            </td> */}


                    {/* ===== Unit
 ===== */}
                    {/* <td>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control form-control-sm"
                                value={item.Unit
 || 0}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  setFormData((prev) => {
                                    const updated = [...prev.otBillDetails];
                                    const rate = updated[index].Rate || 0;
                                    updated[index] = {
                                      ...updated[index],
                                      Unit
: value,
                                      Amount: rate * value,
                                    };
                                    return { ...prev, otBillDetails: updated };
                                  });
                                }}
                              />
                            </td> */}


                    {/* ===== AMOUNT ===== */}
                    {/* <td>
                              <input
                                className="form-control form-control-sm"
                                value={item.Amount || 0}
                                disabled
                              />
                            </td> */}
                    {/* </tr>
                        ))}
                      </tbody>
                    </table> */}
                    {/* <h6 className="text-primary">Consumables</h6> */}


                    {/* <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          Consumables: [
                            ...(formData.Consumables || []),
                            {
                              item: "",
                              unit: "",
                              rate: "",
                              Unit
: "",
                              amount: "",
                            },
                          ],
                        })
                      }
                    >
                      + Add Item
                    </button>
                    <h1>hello</h1> */}


                    <table
                      className="table table-bordered table-sm"
                      style={{ tableLayout: "fixed" }}
                    >
                      <thead>
                        <tr>
                          <th className="text-center" style={{ width: "20%" }}>
                            Item
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
                          {modalType !== "view" && (
                            <th
                              className="text-center"
                              style={{ width: "10%" }}
                            >
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
                                value={item.OtItemId || ""}
                                disabled={modalType === "view"}
                                onChange={(e) =>
                                  updateChargeItem(
                                    index,
                                    "OtItemId",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Charge</option>
                                {availableCharges.map((c) => (
                                  <option key={c.OtItemId} value={c.OtItemId}>
                                    {c.OtItem}
                                  </option>
                                ))}
                              </select>
                            </td>


                            {/* ===== UNIT ===== */}
                            <td>
                              <input
                                className="form-control form-control-sm"
                                // value={item.UNIT || ""}
                                value={item.Unit || ""}
                                disabled
                              />
                            </td>


                            {/* ===== RATE ===== */}
                            <td>
                              <input
                                type="number"
                                placeholder="₹"
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


                            {/* ===== Unit
 ===== */}
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
                                value={item.Amount}
                                disabled
                              />
                            </td>
                            {/* ===== ACTION ===== */}
                            {modalType !== "view" && (
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
                    {/* {modalType === "edit" && */}


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


                    {/* }    */}
                    {/* ================= SUMMARY ================= */}
                    <hr />
                    <h6 className="text-primary">Summary</h6>
                    <div className="row g-2 justify-content-end">
                      {/* <div className="col-md-2">
                        <label className="form-label">Consumable Amt</label>
                        <input
                          type="number"
                          className="form-control"
                          name="ConsumableAmt"
                          value={formData.ConsumableAmt || 0}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ConsumableAmt: e.target.value,
                            })
                          }
                        />
                      </div> */}


                      {/* <div className="col-md-2">
                        <label className="form-label">Instrument Amt</label>
                        <input
                          type="number"
                          className="form-control"
                          name="InstrumentAmt"
                          value={formData.InstrumentAmt || 0}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              InstrumentAmt: e.target.value,
                            })
                          }
                        />
                      </div> */}


                      {/* <div className="col-md-2">
                        <label className="form-label">Medicine Amt</label>
                        <input
                          type="number"
                          className="form-control"
                          name="MedicineAmt"
                          value={formData.MedicineAmt || 0}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              MedicineAmt: e.target.value,
                            })
                          }
                        />
                      </div> */}


                      {/* <div className="col-md-2">
                        <label className="form-label">Other Charges</label>
                        <input
                          type="number"
                          className="form-control"
                          name="OthersCh"
                          value={formData.OthersCh || 0}
                          disabled={modalType === "view"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              OthersCh: e.target.value,
                            })
                          }
                        />
                      </div> */}


                      <div className="col-md-2">
                        <label className="form-label">Service Charge</label>
                        <input
                          type="number"
                          placeholder="₹"
                          className="form-control"
                          name="ServiceCharge"
                          value={formData.ServiceCharge || ""}
                          disabled={modalType === "view"}
                          onChange={(e) => {
                            const value = Number(e.target.value || 0);
                            setFormData((prev) => ({
                              ...prev,
                              ServiceCharge: value,
                            }));
                          }}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label fw-bold">
                          Total Bill Amount
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          className="form-control fw-bold text-danger"
                          name="TotalAmt"
                          value={formData.TotalAmt || 0}
                          disabled
                        />
                      </div>
                    </div>


                    {/* ================= TOTAL ================= */}


                    {/* ================= ACTION ================= */}
                    <div className="d-flex gap-2 mt-4">
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


      {/* {showDrawer && <OT/>} */}


      {/* ================= DELETE CONFIRM ================= */}
      {showConfirm && (
        <div className="modal d-block" onClick={() => setShowConfirm(false)}>
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-body text-center">
                <p>Are you sure you want to delete?</p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ================= DRAWER ================= */}


      {/* ================= PAGINATION ================= */}
      {!searchPatient && !startDate && !endDate && (
        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination pagination-sm">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => goToPage(page - 1)}>
                Prev
              </button>
            </li>


            <button className="page-link">{`${page}/${totalPages}`}</button>


            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </div>
      )}


      <Footer />
    </div>
  );
};



export default OTBilling;