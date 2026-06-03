import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Footer from "../components/footer/Footer";
import "react-toastify/dist/ReactToastify.css";
// import useAxiosFetch from "./Fetch";
// import OT from "./OT";


import ZLoader from "./DiagnosisMaster/ZLoader";


// import axiosInstance from "../axiosInstance";
import ApiSelect from "./DiagnosisMaster/ApiSelect";
import AsyncApiSelect from "../components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/AsyncApiSelect";
import useAxiosFetch from "./Fetch";
import axiosInstance from "../axiosInstance";

const OTBilling = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { data: cashLessList } = useAxiosFetch
  ("/cashless");
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
    CashLess: "N",
    CashLessId: 0,

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
          CashLess: item.CashLess,
          CashLessId: item.CashLessId,
        }));
        // setChargeItems(item.otBillDetails || []);

        const chargesResponse = await axiosInstance.get("/otItem");
        //  const chu = await axiosInstance.get(
        //    `/company-wise-ot-item-rate?cashlessId=${formData.CashlessId}`
        //  );

        //   console.log(chu);

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
        setIsInitialLoad(false);
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
      Amount: Number(item.Rate * item.Qty),
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
useEffect(() => {
  if (formData.CashLess !== "Y") return;
  if (!formData.CashLessId) return;

  // ⭐ LOOP STOPPER for first Admission autofill
  if (modalType === "add" && isInitialLoad) return;

  // ⭐ STOP if all OtItemId empty
  const hasValidItem = chargeItems.some((i) => i.OtItemId);
  if (!hasValidItem) return;

  const fetchCompanyRates = async () => {
    try {
      const res = await axiosInstance.get(
        `/company-wise-ot-item-rate?cashlessId=${formData.CashLessId}`
      );

      const companyRates = res.data.data || [];

      const updated = chargeItems.map((item) => {
        const match = companyRates.find(
          (r) => Number(r.ot_item_id) === Number(item.OtItemId)
        );

        return match
          ? {
              ...item,
              Rate: Number(match.rate),
              Amount: Number(match.rate) * Number(item.Qty),
            }
          : item;
      });

      setChargeItems(updated);
    } catch (err) {
      console.error("Company rate error:", err);
    }
  };

  fetchCompanyRates();
}, [
  formData.CashLess,
  formData.CashLessId,
  chargeItems.map((i) => i.OtItemId).join(","),
]);

  // ================= PDF GENERATE =================
  const [doctorList, setDoctorList] = useState([]);
  const [otMasterList, setOtMasterList] = useState([]);

  useEffect(() => {
    axiosInstance.get("/doctors/indoor").then((res) => {
      setDoctorList(res.data?.data || []);
    }).catch(() => {});
    axiosInstance.get("/otMaster").then((res) => {
      setOtMasterList(res.data?.data || []);
    }).catch(() => {});
  }, []);

  const getDoctorName = (docId) => {
    if (!docId) return "-";
    const d = doctorList.find((x) => x.DoctorId === docId);
    return d?.Doctor || "-";
  };

  const getOtMasterName = (otId) => {
    if (!otId) return "-";
    const o = otMasterList.find((x) => x.OtMasterId === otId);
    return o?.OtMaster || "-";
  };

  const generateOTBillPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const m = 15;

    // ===== HEADER =====
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LORDS HEALTH CARE (NURSING HOME)", pw / 2, 14, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("(A UNIT of MJJ Enterprises Pvt. Ltd.)", pw / 2, 19, { align: "center" });
    doc.text("13/3, Circular 2nd Bye Lane, Kona Expressway,", pw / 2, 24, { align: "center" });
    doc.text("(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711102, W.B.", pw / 2, 29, { align: "center" });
    doc.text("E-mail: patientdesk@lordshealthcare.org", pw / 2, 34, { align: "center" });
    doc.text("Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895", pw / 2, 39, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(m, 42, pw - m, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("OT BILLING", pw / 2, 48, { align: "center" });
    doc.setLineWidth(0.3);
    doc.line(m, 51, pw - m, 51);

    // ===== BASIC INFO =====
    let y = 58;
    doc.setFontSize(10);
    const lbl = (text, x, yy) => { doc.setFont("helvetica", "bold"); doc.text(text, x, yy); };
    const val = (text, x, yy) => { doc.setFont("helvetica", "normal"); doc.text(text, x, yy); };

    lbl("OT Bill No:", m, y); val(formData.OtBillNo || "-", m + 28, y);
    lbl("Bill Date:", 105, y); val(formData.BillDate || "-", 105 + 24, y);
    y += 6;
    lbl("Admission No:", m, y); val(formData.AdmitionId || "-", m + 34, y);
    lbl("Patient Name:", 105, y); val(formData.PatientName || "-", 105 + 32, y);

    // ===== DOCTORS (3 rows like form) =====
    y += 12;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Doctors", m, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Role", "Doctor Name", "Type", "Amount (Rs.)"]],
      body: [
        ["Anesthesia Doctor", getDoctorName(formData.AnesthesiaDocId), formData.anttype || "-", Number(formData.AnesthesiaAmt || 0).toFixed(2)],
        ["Surgeon Doctor", getDoctorName(formData.SergonDocId), "-", Number(formData.SergonDocAmt || 0).toFixed(2)],
        ["Under Care Doctor", getDoctorName(formData.OthersDocId), "-", Number(formData.OthersDocAmt || 0).toFixed(2)],
      ],
      theme: "grid",
      headStyles: { fillColor: [44, 62, 80], fontSize: 9, halign: "center" },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 3: { halign: "right" } },
      margin: { left: m, right: m },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ===== OT CHARGE =====
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("OT Charge", m, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["OT Name", "OT Type", "OT Hour", "OT Minute", "Amount (Rs.)"]],
      body: [
        [getOtMasterName(formData.OTId), formData.OTType || "-", formData.OTHr || "0", formData.OTMinit || "0", Number(formData.OTAmt || 0).toFixed(2)],
      ],
      theme: "grid",
      headStyles: { fillColor: [44, 62, 80], fontSize: 9, halign: "center" },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "right" } },
      margin: { left: m, right: m },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ===== CHARGE ITEMS =====
    if (chargeItems.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Charge Items", m, y);
      y += 2;

      const itemRows = chargeItems.map((item, i) => {
        const name = availableCharges.find((c) => c.OtItemId == item.OtItemId)?.OtItem || item.OtItem || "-";
        return [i + 1, name, item.Unit || "-", Number(item.Rate).toFixed(2), item.Qty || 1, Number(item.Amount).toFixed(2)];
      });

      autoTable(doc, {
        startY: y,
        head: [["#", "Item", "Unit", "Rate (Rs.)", "Qty", "Amount (Rs.)"]],
        body: itemRows,
        theme: "grid",
        headStyles: { fillColor: [44, 62, 80], fontSize: 9, halign: "center" },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "center" }, 5: { halign: "right" } },
        margin: { left: m, right: m },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // ===== SUMMARY =====
    doc.setLineWidth(0.5);
    doc.line(m, y, pw - m, y);
    y += 8;

    doc.setFontSize(10);
    if (Number(formData.ServiceCharge)) {
      lbl("Service Charge:", pw - 85, y);
      val(`Rs. ${Number(formData.ServiceCharge).toFixed(2)}`, pw - m, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${Number(formData.ServiceCharge).toFixed(2)}`, pw - m, y, { align: "right" });
      y += 8;
    }

    // Total Amount Box
    doc.setFillColor(230, 230, 230);
    doc.rect(pw - 110, y - 5, 95, 14, "F");
    doc.setDrawColor(0);
    doc.rect(pw - 110, y - 5, 95, 14, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Total Amount:", pw - 105, y + 3);
    doc.text(`Rs. ${Number(formData.TotalAmt || 0).toFixed(2)}`, pw - m, y + 3, { align: "right" });

    // Footer
    y += 30;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("This is a computer generated bill.", pw / 2, y, { align: "center" });
    y += 5;
    doc.text("Printed By: " + (localStorage.getItem("username") || "Admin") + "   |   Print Date & Time: " + new Date().toLocaleString("en-IN", { hour12: true }), pw / 2, y, { align: "center" });

    return doc;
  };

  const handlePrintPDF = () => {
    const doc = generateOTBillPDF();
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  const handleDownloadPDF = () => {
    const doc = generateOTBillPDF();
    doc.save(`OT_Bill_${formData.OtBillNo || "new"}.pdf`);
  };

  return (
    <div className="main-content">
      <ToastContainer />
      
      {/* Premium Injected Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .main-content {
          background: radial-gradient(circle at 50% 0%, #0d1e3d 0%, #050b18 100%) !important;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #cbd5e1;
          padding: 25px 25px 90px 25px !important;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }

        .premium-dashboard-card {
          background: rgba(13, 27, 56, 0.65);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 24px;
        }

        .premium-dashboard-card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
        }

        .premium-header-bar {
          background: linear-gradient(135deg, rgba(23, 37, 84, 0.3) 0%, rgba(9, 17, 36, 0.65) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .premium-title-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: #ffffff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pulse-dot {
          width: 10px;
          height: 10px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 12px #10b981, 0 0 24px rgba(16, 185, 129, 0.5);
          animation: pulse 2.2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* Executive Stats Widgets */
        .premium-stat-widget {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-stat-widget:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .stat-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          transition: all 0.3s ease;
        }

        .stat-icon-box.blue {
          background: rgba(59, 130, 246, 0.12);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .stat-icon-box.green {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .stat-icon-box.purple {
          background: rgba(139, 92, 246, 0.12);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 2px;
          letter-spacing: -0.01em;
        }

        .premium-filter-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .premium-input-field {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #e2e8f0 !important;
          border-radius: 10px !important;
          padding: 8px 14px !important;
          font-size: 0.85rem !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .premium-input-field:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.35) !important;
          background: rgba(15, 23, 42, 0.9) !important;
        }

        .premium-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: white !important;
          border-radius: 10px !important;
          padding: 8px 18px !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3) !important;
          transition: all 0.25s ease !important;
          cursor: pointer;
        }

        .premium-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45) !important;
        }

        .premium-btn-secondary {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #94a3b8 !important;
          border-radius: 10px !important;
          padding: 8px 16px !important;
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          cursor: pointer;
        }

        .premium-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #fff !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }

        .premium-btn-search {
          background: rgba(14, 165, 233, 0.15) !important;
          border: 1px solid rgba(14, 165, 233, 0.3) !important;
          color: #38bdf8 !important;
          border-radius: 10px !important;
          width: 38px !important;
          height: 38px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer;
        }

        .premium-btn-search:hover {
          background: #0ea5e9 !important;
          color: #fff !important;
          box-shadow: 0 0 12px rgba(14, 165, 233, 0.45) !important;
        }

        .premium-table-container {
          padding: 0;
          overflow: hidden;
        }

        .premium-dashboard-table {
          margin: 0 !important;
        }

        .premium-dashboard-table th {
          background: rgba(15, 23, 42, 0.5) !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          font-size: 0.76rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          padding: 18px 24px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .premium-dashboard-table td {
          padding: 18px 24px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
          color: #cbd5e1 !important;
          font-size: 0.9rem !important;
          vertical-align: middle !important;
        }

        .premium-table-row {
          transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-table-row:hover {
          background-color: rgba(255, 255, 255, 0.02) !important;
        }

        .premium-badge-amount {
          background: rgba(16, 185, 129, 0.12) !important;
          color: #34d399 !important;
          border: 1px solid rgba(16, 185, 129, 0.25) !important;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 8px;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.05);
        }

        .premium-badge-id {
          background: rgba(99, 102, 241, 0.12) !important;
          color: #a5b4fc !important;
          border: 1px solid rgba(99, 102, 241, 0.25) !important;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 6px;
        }

        .action-button-group {
          display: flex;
          gap: 8px;
        }

        .action-icon-pill {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
        }

        .action-icon-pill.view {
          background: rgba(14, 165, 233, 0.08);
          color: #38bdf8;
          border-color: rgba(14, 165, 233, 0.15);
        }

        .action-icon-pill.view:hover {
          background: #0ea5e9;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
        }

        .action-icon-pill.edit {
          background: rgba(245, 158, 11, 0.08);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.15);
        }

        .action-icon-pill.edit:hover {
          background: #f59e0b;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
        }

        .action-icon-pill.delete {
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.15);
        }

        .action-icon-pill.delete:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
        }

        .premium-drawer {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          background: rgba(8, 16, 36, 0.98) !important;
          border-left: none !important;
          box-shadow: none !important;
          backdrop-filter: blur(20px);
        }

        .premium-drawer-header {
          background: linear-gradient(135deg, rgba(23, 37, 84, 0.5) 0%, rgba(9, 17, 36, 0.8) 100%) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 20px 28px !important;
        }

        .premium-section-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.01);
        }

        .premium-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #818cf8;
          font-weight: 700;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .receipt-summary-panel {
          background: linear-gradient(135deg, rgba(23, 37, 84, 0.3) 0%, rgba(9, 17, 36, 0.6) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.2);
        }

        .digital-total-amount {
          background: rgba(9, 17, 36, 0.7);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          margin-top: 10px;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.08);
          transition: all 0.3s ease;
        }

        .digital-amount-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .digital-amount-val {
          font-size: 2.1rem;
          font-weight: 800;
          color: #34d399;
          letter-spacing: -0.02em;
          text-shadow: 0 0 10px rgba(52, 211, 153, 0.25);
        }

        .premium-btn-save {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3) !important;
          color: #fff !important;
          font-weight: 600 !important;
          border-radius: 10px !important;
          padding: 10px 26px !important;
          font-size: 0.9rem !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer;
        }

        .premium-btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45) !important;
        }

        .premium-btn-pdf {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3) !important;
          color: #fff !important;
          font-weight: 600 !important;
          border-radius: 10px !important;
          padding: 10px 22px !important;
          font-size: 0.9rem !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer;
        }

        .premium-btn-pdf:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.45) !important;
        }

        .premium-btn-print {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3) !important;
          color: #fff !important;
          font-weight: 600 !important;
          border-radius: 10px !important;
          padding: 10px 22px !important;
          font-size: 0.9rem !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer;
        }

        .premium-btn-print:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(6, 182, 212, 0.45) !important;
        }

        .charge-item-table th {
          background: rgba(15, 23, 42, 0.4) !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          font-size: 0.76rem !important;
          text-transform: uppercase !important;
          padding: 12px 14px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .charge-item-table td {
          padding: 10px 14px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
          vertical-align: middle !important;
        }


        /* ==========================================================================
           LIGHT/WHITE THEME OVERRIDES (AUTOMATICALLY TRIGGERED BY ROOT GLOBAL CLASS)
           ========================================================================== */
        
        .light-theme .main-content {
          background: radial-gradient(circle at 50% 0%, #f8fafc 0%, #f1f5f9 100%) !important;
          color: #334155 !important;
        }

        /* Custom Scrollbar for Light Theme */
        .light-theme ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
        }
        .light-theme ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
        }
        .light-theme ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }

        .light-theme .premium-dashboard-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          color: #334155;
        }

        .light-theme .premium-dashboard-card:hover {
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 16px 48px rgba(15, 23, 42, 0.09);
        }

        .light-theme .premium-header-bar {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.85) 100%);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .light-theme .premium-title-text {
          background: linear-gradient(135deg, #0f172a 30%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Stats Widgets in Light Theme */
        .light-theme .premium-stat-widget {
          background: rgba(15, 23, 42, 0.015);
          border: 1px solid rgba(15, 23, 42, 0.04);
        }

        .light-theme .premium-stat-widget:hover {
          background: rgba(15, 23, 42, 0.035);
          border-color: rgba(99, 102, 241, 0.25);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .light-theme .stat-icon-box.blue {
          background: rgba(59, 130, 246, 0.08);
          color: #2563eb;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .light-theme .stat-icon-box.green {
          background: rgba(16, 185, 129, 0.08);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .light-theme .stat-icon-box.purple {
          background: rgba(139, 92, 246, 0.08);
          color: #7c3aed;
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .light-theme .stat-label {
          color: #64748b;
        }

        .light-theme .stat-value {
          color: #0f172a;
        }

        /* Filter elements in Light Theme */
        .light-theme .premium-filter-container {
          background: rgba(15, 23, 42, 0.015);
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .light-theme .premium-input-field {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #1e293b !important;
        }

        .light-theme .premium-input-field:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.18) !important;
          background: #ffffff !important;
        }

        .light-theme .premium-btn-secondary {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #475569 !important;
        }

        .light-theme .premium-btn-secondary:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
          border-color: #94a3b8 !important;
        }

        /* Table elements in Light Theme */
        .light-theme .premium-dashboard-table th {
          background: rgba(241, 245, 249, 0.85) !important;
          color: #475569 !important;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
        }

        .light-theme .premium-dashboard-table td {
          border-bottom: 1px solid rgba(15, 23, 42, 0.04) !important;
          color: #334155 !important;
        }

        .light-theme .premium-table-row:hover {
          background-color: rgba(99, 102, 241, 0.025) !important;
        }

        .light-theme .premium-badge-amount {
          background: rgba(16, 185, 129, 0.08) !important;
          color: #059669 !important;
          border-color: rgba(16, 185, 129, 0.2) !important;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.02);
        }

        .light-theme .premium-badge-id {
          background: rgba(99, 102, 241, 0.08) !important;
          color: #4f46e5 !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
        }

        /* Text Overrides for Light Mode (Critical for preventing invisible text) */
        .light-theme .fw-semibold.text-white {
          color: #1e293b !important;
        }
        .light-theme .text-secondary {
          color: #64748b !important;
        }
        .light-theme .text-muted {
          color: #94a3b8 !important;
        }

        /* Drawer in Light Theme */
        .light-theme .premium-drawer {
          background: #ffffff !important;
          border-left: none !important;
          box-shadow: none !important;
        }

        .light-theme .premium-drawer-header {
          background: linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(226, 232, 240, 0.9) 100%) !important;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
        }

        .light-theme .premium-drawer-header span {
          color: #0f172a !important;
        }

        .light-theme .premium-section-card {
          background: rgba(15, 23, 42, 0.008);
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.01);
        }

        .light-theme .premium-section-title {
          color: #4f46e5 !important;
        }

        .light-theme select.premium-input-field option {
          background-color: #ffffff !important;
          color: #1e293b !important;
        }

        /* Drawer Item Tables in Light Theme */
        .light-theme .charge-item-table th {
          background: rgba(15, 23, 42, 0.02) !important;
          color: #475569 !important;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06) !important;
        }

        .light-theme .charge-item-table td {
          border-bottom: 1px solid rgba(15, 23, 42, 0.04) !important;
        }

        .light-theme .charge-item-table span.text-white {
          color: #1e293b !important;
        }

        /* Summary Receipt Panel in Light Theme */
        .light-theme .receipt-summary-panel {
          background: linear-gradient(135deg, rgba(241, 245, 249, 0.4) 0%, rgba(226, 232, 240, 0.7) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.03);
        }

        .light-theme .digital-total-amount {
          background: #ffffff;
          border: 1px solid rgba(16, 185, 129, 0.3);
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.02), 0 0 20px rgba(16,185,129,0.04);
        }

        .light-theme .digital-amount-val {
          color: #10b981;
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }

        /* Modals and Dialogs in Light Theme */
        .light-theme .modal-content.premium-dashboard-card {
          background: #ffffff !important;
          border: 1px solid rgba(15, 23, 42, 0.1) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
        }

        /* Premium full-screen close button */
        .premium-drawer .right-bar-close {
          position: absolute;
          top: 18px;
          right: 28px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          z-index: 100;
        }
        .premium-drawer .right-bar-close:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
          transform: rotate(90deg) scale(1.05);
        }
        .light-theme .premium-drawer .right-bar-close {
          background: rgba(15, 23, 42, 0.05);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #475569;
        }
        .light-theme .premium-drawer .right-bar-close:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
        }

        /* Stats Row adjustment in Light Mode */
        .light-theme .premium-dashboard-card .row.g-3.px-4.py-3.border-bottom {
          background: rgba(255, 255, 255, 0.4) !important;
          border-color: rgba(0, 0, 0, 0.05) !important;
        }
      `}} />

      {/* ================= PREMIUM DASHBOARD CARD ================= */}
      <div className="premium-dashboard-card">
        
        {/* PREMIUM HEADER BAR */}
        <div className="premium-header-bar">
          <h5 className="premium-title-text">
            <span className="pulse-dot"></span>
            🏥 OT Operating Billing Manager
          </h5>

          {/* PREMIUM FILTER CONTAINER */}
          <div className="premium-filter-container">
            <div className="d-flex align-items-center gap-1">
              <i className="fa-light fa-calendar text-muted ms-1" style={{ fontSize: '0.85rem' }}></i>
              <input
                type="date"
                className="premium-input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: 130 }}
                title="Start Date"
              />
            </div>

            <div className="d-flex align-items-center gap-1">
              <i className="fa-light fa-calendar text-muted ms-1" style={{ fontSize: '0.85rem' }}></i>
              <input
                type="date"
                className="premium-input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: 130 }}
                title="End Date"
              />
            </div>

            <div className="d-flex align-items-center gap-1">
              <i className="fa-light fa-user text-muted ms-1" style={{ fontSize: '0.85rem' }}></i>
              <input
                className="premium-input-field"
                placeholder="Patient Name..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                style={{ width: 160 }}
              />
            </div>

            <button
              className="premium-btn-search"
              onClick={() => handleSearch(1)}
              title="Search"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            
            <button className="premium-btn-secondary" onClick={clearSearch}>
              Reset
            </button>

            <button className="premium-btn-primary ms-2" onClick={openAdd}>
              <i className="fa-solid fa-plus"></i> Add Invoice
            </button>
          </div>
        </div>

        {/* PREMIUM STATS ROW */}
        <div className="row g-3 px-4 py-3 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.05)', background: 'rgba(15, 23, 42, 0.15)' }}>
          <div className="col-md-4">
            <div className="premium-stat-widget">
              <div className="stat-icon-box blue">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Invoices</span>
                <span className="stat-value">{items.length}</span>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="premium-stat-widget">
              <div className="stat-icon-box green">
                <i className="fa-solid fa-indian-rupee-sign"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Value</span>
                <span className="stat-value">
                  ₹ {items.reduce((acc, curr) => acc + Number(curr.TotalAmt || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="premium-stat-widget">
              <div className="stat-icon-box purple">
                <i className="fa-solid fa-hospital-user"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Operations Today</span>
                <span className="stat-value">
                  {items.filter(item => item.BillDate?.split("T")[0] === new Date().toISOString().split("T")[0]).length} Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PREMIUM TABLE ================= */}
        <div className="premium-table-container">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <ZLoader/>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table premium-dashboard-table">
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
                      <td colSpan={6} className="text-center text-muted py-5">
                        <i className="fa-light fa-folder-open d-block mb-2" style={{ fontSize: '2rem' }}></i>
                        No OT Billing invoices found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={item.OtBillId} className="premium-table-row">
                        <td>
                          <div className="action-button-group">
                            <button
                              className="action-icon-pill view"
                              onClick={() => openView(item.OtBillId)}
                              title="View Invoice"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>

                            <button
                              className="action-icon-pill edit"
                              onClick={() => openEdit(item.OtBillId)}
                              title="Edit Invoice"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>

                            <button
                              className="action-icon-pill delete"
                              onClick={() => {
                                setDeleteId(item.OtBillId);
                                setShowConfirm(true);
                              }}
                              title="Delete Invoice"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                        <td><span className="text-secondary">{(page - 1) * limit + i + 1}</span></td>
                        <td><i className="fa-light fa-calendar-days text-secondary me-2"></i>{item.BillDate?.split("T")[0]}</td>
                        <td><span className="premium-badge-id">{item.AdmitionId}</span></td>
                        <td><span className="fw-semibold text-white">{item.PatientName}</span></td>
                        <td><span className="premium-badge-amount">₹ {Number(item.TotalAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* ================= DRAWER ================= */}
      {showDrawer && (
        <>
          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 999998 }}
            onClick={() => setShowDrawer(false)}
          />

          {/* DRAWER */}
          <div
            className="profile-right-sidebar premium-drawer active"
            style={{
              zIndex: 999999,
              width: "100vw",
              maxWidth: "100vw",
              top: "0",
              height: "100vh",
              left: "0",
              right: "0",
              position: "fixed",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDrawer(false)}
              title="Close Panel"
            >
              <i className="fa-regular fa-xmark" style={{ fontSize: '1.25rem' }}></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              {/* HEADER */}
              <div
                className="dropdown-txt premium-drawer-header"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  padding: "18px 24px",
                  fontWeight: 600,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {modalType === "add"
                    ? "➕ Add OT Billing Invoice"
                    : modalType === "edit"
                      ? "✏️ Edit OT Billing Invoice"
                      : "👁️ View OT Billing Details"}
                </span>
                
                {/* Cashless Indicator Badge */}
                {formData.CashLess === "Y" && (
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25" style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '20px' }}>
                    <i className="fa-solid fa-credit-card me-1"></i> Cashless Active
                  </span>
                )}
              </div>

              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-4 mx-auto" style={{ maxWidth: "1280px" }}>
                  <form onSubmit={handleSubmit}>
                    
                    {/* ================= BASIC INFO CARD ================= */}
                    <div className="premium-section-card">
                      <div className="premium-section-title">
                        <i className="fa-solid fa-file-invoice-dollar text-primary"></i> Basic Billing Info
                      </div>
                      <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                          <label className="form-label text-secondary small">OT Bill No</label>
                          <input
                            className="form-control premium-input-field"
                            name="OtBillNo"
                            value={formData.OtBillNo || "Auto Generated"}
                            disabled
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label text-secondary small">Bill Date</label>
                          <input
                            type="date"
                            className="form-control premium-input-field"
                            name="BillDate"
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

                        <div className="col-md-3">
                          <label className="form-label text-secondary small">Admission No</label>
                          <div className="premium-select-wrapper">
                            <AsyncApiSelect
                              api="/admission/search"
                              value={admissionOption}
                              searchKey="q"
                              labelKey="AdmitionId"
                              showKey="PatientName"
                              valueKey="AdmitionId"
                              onChange={(opt) => {
                                setAdmissionOption(opt);
                                setFormData((prev) => ({
                                  ...prev,
                                  AdmitionId: opt ? opt.value : "",
                                }));
                              }}
                              disabled={modalType === "edit" || modalType === "view"}
                            />
                          </div>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label text-secondary small">Patient Name</label>
                          <input
                            className="form-control premium-input-field"
                            name="PatientName"
                            value={formData.PatientName || ""}
                            disabled={modalType === "view"}
                            placeholder="Autofills from Admission ID"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                PatientName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* ================= DOCTORS SECTION CARD ================= */}
                    <div className="premium-section-card">
                      <div className="premium-section-title">
                        <i className="fa-solid fa-user-nurse text-primary"></i> Operating Surgical Team
                      </div>
                      
                      {/* Anesthesia Row */}
                      <div className="row g-3 align-items-center mb-3">
                        <div className="col-md-4">
                          <label className="form-label text-secondary small d-flex align-items-center gap-1">
                            <i className="fa-light fa-user-doctor text-secondary"></i> Anesthesia Doctor
                          </label>
                          <ApiSelect
                            api="/doctors/indoor"
                            value={formData.AnesthesiaDocId || null}
                            labelKey="Doctor"
                            valueKey="DoctorId"
                            placeholder="Select Anesthetist"
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                AnesthesiaDocId: val,
                              }))
                            }
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label text-secondary small d-flex align-items-center gap-1">
                            <i className="fa-light fa-syringe text-secondary"></i> Anesthesia Type
                          </label>
                          <select
                            className="form-control premium-input-field"
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
                            <option value="">Select Type</option>
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
                          <label className="form-label text-secondary small d-flex align-items-center gap-1">
                            <i className="fa-light fa-indian-rupee-sign text-secondary"></i> Anesthesia Fee (₹)
                          </label>
                          <input
                            type="number"
                            className="form-control premium-input-field text-end"
                            name="AnesthesiaAmt"
                            value={formData.AnesthesiaAmt || 0}
                            disabled={modalType === "view"}
                            placeholder="0.00"
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
                      
                      {/* Surgeon and Under-care Row */}
                      <div className="row g-3 align-items-center">
                        <div className="col-md-3">
                          <label className="form-label text-secondary small d-flex align-items-center gap-1">
                            <i className="fa-light fa-user-doctor text-secondary"></i> Surgeon Doctor
                          </label>
                          <ApiSelect
                            api="/doctors/indoor"
                            value={formData.SergonDocId || null}
                            labelKey="Doctor"
                            valueKey="DoctorId"
                            placeholder="Select Surgeon"
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                SergonDocId: val,
                              }))
                            }
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label text-secondary small d-flex align-items-center gap-1">
                            <i className="fa-light fa-indian-rupee-sign text-secondary"></i> Surgeon Fee (₹)
                          </label>
                          <input
                            type="number"
                            className="form-control premium-input-field text-end"
                            name="SergonDocAmt"
                            value={formData.SergonDocAmt || 0}
                            disabled={modalType === "view"}
                            placeholder="0.00"
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
                          <label className="form-label text-secondary small d-flex align-items-center gap-1">
                            <i className="fa-light fa-user-doctor text-secondary"></i> Under Care Doctor
                          </label>
                          <ApiSelect
                            api="/doctors/indoor"
                            value={formData.OthersDocId || null}
                            labelKey="Doctor"
                            valueKey="DoctorId"
                            placeholder="Select Doctor"
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                OthersDocId: val,
                              }))
                            }
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label text-secondary small d-flex align-items-center gap-1">
                            <i className="fa-light fa-indian-rupee-sign text-secondary"></i> Under Care Fee (₹)
                          </label>
                          <input
                            type="number"
                            className="form-control premium-input-field text-end"
                            name="OthersDocAmt"
                            value={formData.OthersDocAmt || 0}
                            disabled={modalType === "view"}
                            placeholder="0.00"
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
                    </div>

                    {/* ================= OT CHARGE CARD ================= */}
                    <div className="premium-section-card">
                      <div className="premium-section-title">
                        <i className="fa-solid fa-hospital text-primary"></i> Operating Theatre (OT) Allocation
                      </div>
                      
                      <div className="row g-3 align-items-center mb-3">
                        <div className="col-md-3">
                          <label className="form-label text-secondary small">OT Room/Name</label>
                          <ApiSelect
                            api="/otMaster"
                            value={formData.OTId || ""}
                            labelKey="OtMaster"
                            valueKey="OtMasterId"
                            placeholder="Select OT Room"
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                OTId: val,
                              }))
                            }
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label text-secondary small">OT Time Slot</label>
                          <ApiSelect
                            api="/otSlot"
                            value={formData.OTSlotId || ""}
                            labelKey="OTSlot"
                            valueKey="OTSlotId"
                            placeholder="Select Time Slot"
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                OTSlotId: val,
                              }))
                            }
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label text-secondary small">OT Surgery Type</label>
                          <ApiSelect
                            api="/otType"
                            value={formData.OTType || ""}
                            labelKey="OtType"
                            valueKey="OtType"
                            placeholder="Select Category"
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                OTType: val,
                              }))
                            }
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label text-secondary small">OT Base Fee (₹)</label>
                          <input
                            type="number"
                            className="form-control premium-input-field text-end"
                            name="OTAmt"
                            value={formData.OTAmt || ""}
                            disabled={modalType === "view"}
                            placeholder="0.00"
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
                      
                      <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                          <label className="form-label text-secondary small">Surgery Duration (Hours)</label>
                          <input
                            type="number"
                            className="form-control premium-input-field text-center"
                            name="OTHr"
                            value={formData.OTHr || 0}
                            disabled={modalType === "view"}
                            placeholder="Hours"
                            onChange={(e) =>
                              setFormData({ ...formData, OTHr: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label text-secondary small">Surgery Duration (Minutes)</label>
                          <input
                            type="number"
                            className="form-control premium-input-field text-center"
                            name="OTMinit"
                            value={formData.OTMinit || 0}
                            disabled={modalType === "view"}
                            placeholder="Minutes"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                OTMinit: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label text-secondary small">OT Remarks / Special Notes</label>
                          <input
                            className="form-control premium-input-field"
                            name="Remarks"
                            value={formData.Remarks || ""}
                            disabled={modalType === "view"}
                            placeholder="Enter surgical notes..."
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                Remarks: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* ================= CHARGE ITEMS SHEET ================= */}
                    <div className="premium-section-card">
                      <div className="premium-section-title d-flex justify-content-between align-items-center w-100 mb-3">
                        <span><i className="fa-solid fa-list-check text-primary"></i> Surgical Consumables & Item Charges</span>
                        {modalType !== "view" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success border-opacity-50"
                            style={{ fontSize: '0.78rem', borderRadius: '6px', padding: '4px 12px' }}
                            onClick={addChargeItem}
                          >
                            <i className="fa-light fa-plus me-1"></i> Add Item Row
                          </button>
                        )}
                      </div>

                      <div className="table-responsive border rounded" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <table className="table charge-item-table mb-0" style={{ tableLayout: "fixed" }}>
                          <thead>
                            <tr>
                              <th style={{ width: "40%" }}>Item Description</th>
                              <th style={{ width: "15%" }} className="text-center">Unit</th>
                              <th style={{ width: "15%" }} className="text-end">Rate (₹)</th>
                              <th style={{ width: "12%" }} className="text-center">Qty</th>
                              <th style={{ width: "18%" }} className="text-end">Amount (₹)</th>
                              {modalType !== "view" && (
                                <th style={{ width: "10%" }} className="text-center">Action</th>
                              )}
                            </tr>
                          </thead>

                          <tbody>
                            {chargeItems.length === 0 ? (
                              <tr>
                                <td colSpan={modalType !== "view" ? 6 : 5} className="text-center text-muted py-4 small">
                                  <i className="fa-light fa-receipt d-block mb-1" style={{ fontSize: '1.3rem' }}></i>
                                  No additional item charges added. Click 'Add Item Row' to select items.
                                </td>
                              </tr>
                            ) : (
                              chargeItems.map((item, index) => (
                                <tr key={index}>
                                  {/* Item Selector */}
                                  <td>
                                    <select
                                      className="form-control premium-input-field form-control-sm"
                                      value={item.OtItemId || ""}
                                      disabled={modalType === "view"}
                                      onChange={(e) =>
                                        updateChargeItem(
                                          index,
                                          "OtItemId",
                                          e.target.value
                                        )
                                      }
                                      style={{ padding: '4px 8px !important' }}
                                    >
                                      <option value="">Select Surgical Charge Item</option>
                                      {availableCharges.map((c) => (
                                        <option key={c.OtItemId} value={c.OtItemId}>
                                          {c.OtItem}
                                        </option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Unit */}
                                  <td className="text-center">
                                    <span className="text-secondary small">{item.Unit || "-"}</span>
                                  </td>

                                  {/* Rate */}
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control premium-input-field form-control-sm text-end"
                                      value={item.Rate || 0}
                                      disabled={modalType === "view"}
                                      onChange={(e) =>
                                        updateChargeItem(
                                          index,
                                          "Rate",
                                          Number(e.target.value)
                                        )
                                      }
                                      style={{ padding: '4px 8px !important' }}
                                    />
                                  </td>

                                  {/* Qty */}
                                  <td className="text-center">
                                    <input
                                      type="number"
                                      className="form-control premium-input-field form-control-sm text-center"
                                      value={item.Qty || 1}
                                      disabled={modalType === "view"}
                                      onChange={(e) =>
                                        updateChargeItem(
                                          index,
                                          "Qty",
                                          Number(e.target.value)
                                        )
                                      }
                                      style={{ padding: '4px 8px !important' }}
                                    />
                                  </td>

                                  {/* Amount */}
                                  <td className="text-end">
                                    <span className="fw-semibold text-white small">₹ {Number(item.Amount || 0).toFixed(2)}</span>
                                  </td>

                                  {/* Action */}
                                  {modalType !== "view" && (
                                    <td className="text-center">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-opacity-25"
                                        onClick={() => removeChargeItem(index)}
                                        title="Remove Item"
                                        style={{ padding: '2px 8px' }}
                                      >
                                        <i className="fa-solid fa-trash-can" style={{ fontSize: '0.8rem' }}></i>
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ================= RECEIPT SUMMARY PANEL ================= */}
                    <div className="receipt-summary-panel mb-4">
                      <div className="premium-section-title">
                        <i className="fa-solid fa-receipt text-success"></i> Billing & Receipt Summary
                      </div>
                      
                      <div className="row g-3 justify-content-between align-items-center">
                        <div className="col-md-5">
                          <p className="text-secondary small mb-2">
                            Please review all surgical fees, OT suite base rate, and additional consumables charges before generating the final invoice.
                          </p>
                          {formData.CashLess === "Y" && (
                            <div className="p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-10 d-flex align-items-center gap-2">
                              <i className="fa-solid fa-circle-check text-success"></i>
                              <span className="text-success small fw-semibold">Rates automatically adjusted for cashless company scheme.</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6">
                          <div className="row g-3 justify-content-end">
                            <div className="col-md-6">
                              <label className="form-label text-secondary small">Service Charge (₹)</label>
                              <input
                                type="number"
                                placeholder="₹ 0.00"
                                className="form-control premium-input-field text-end fw-semibold"
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

                            <div className="col-md-6">
                              <div className="digital-total-amount">
                                <div className="digital-amount-label">Grand Total Invoice</div>
                                <div className="digital-amount-val">
                                  ₹ {Number(formData.TotalAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ================= ACTION BUTTON BAR ================= */}
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-opacity-10" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <button
                        type="button"
                        className="premium-btn-secondary"
                        onClick={() => setShowDrawer(false)}
                      >
                        <i className="fa-regular fa-xmark me-1"></i> Close
                      </button>
                      
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="premium-btn-pdf"
                          onClick={handleDownloadPDF}
                          title="Export PDF Document"
                        >
                          <i className="fa-solid fa-file-pdf me-1"></i> PDF
                        </button>
                        
                        <button
                          type="button"
                          className="premium-btn-print"
                          onClick={handlePrintPDF}
                          title="Send to Printer"
                        >
                          <i className="fa-solid fa-print me-1"></i> Print
                        </button>

                        {modalType !== "view" && (
                          <button type="submit" className="premium-btn-save">
                            <i className="fa-solid fa-floppy-disk me-1"></i> {modalType === "edit" ? "Update Invoice" : "Generate Invoice"}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      {/* ================= DELETE CONFIRM ================= */}
      {showConfirm && (
        <div className="modal d-block" onClick={() => setShowConfirm(false)} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000 }}>
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content premium-dashboard-card p-0" style={{ maxWidth: '400px', margin: 'auto' }}>
              <div className="premium-header-bar py-3 justify-content-center">
                <h5 className="premium-title-text" style={{ fontSize: '1.1rem' }}>
                  ⚠️ Delete Confirmation
                </h5>
              </div>
              <div className="modal-body text-center p-4">
                <p className="text-secondary mb-4">Are you sure you want to permanently delete this billing invoice?</p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="premium-btn-secondary py-1 px-4"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button className="premium-btn-pdf py-1 px-4" onClick={confirmDelete}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PREMIUM PAGINATION ================= */}
      {!searchPatient && !startDate && !endDate && (
        <div className="d-flex justify-content-center mt-4">
          <div className="premium-filter-container py-1 px-2">
            <button
              className="premium-btn-secondary py-1 px-3"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              style={{ minHeight: 'auto', border: 'none' }}
            >
              <i className="fa-solid fa-angle-left me-1"></i> Prev
            </button>
            
            <span className="text-secondary small px-3">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            
            <button
              className="premium-btn-secondary py-1 px-3"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
              style={{ minHeight: 'auto', border: 'none' }}
            >
              Next <i className="fa-solid fa-angle-right ms-1"></i>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OTBilling;