
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../axiosInstance";
import Footer from "../../components/footer/Footer";
import useAxiosFetch from "./Fetch";
import { useLocation } from "react-router-dom";

const MoneyReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [findBy, setFindBy] = useState("name"); // name | no
  const [findValue, setFindValue] = useState("");

  const [formData, setFormData] = useState({});

  // data
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [allPrevReceipts, setAllPrevReceipts] = useState([]);

  // all moneyreceipts
  const [allMRs, setAllMRs] = useState([]);

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("view"); // view | edit
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // filters
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  // const [dateTo, setDateTo] = useState("2025-02-22");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [allReceipt, setAllReceipt] = useState(true);
  const [refund, setRefund] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPatientName, setSearchPatientName] = useState("");
  const [searchCaseNo, setSearchCaseNo] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // in edit mode save btn will be shown in only for last created money recipt
  const [showSaveBtnEdit, setShowSaveBtnEdit] = useState(false);

  // show Disc, this state will show discount only if it is 1st money receipt
  const [showDisc, setShowDisc] = useState(false);

  let barcodeData = "OP/2425/08287";

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // this is for showing history
  const [histData, setHistData] = useState([]);

  const [refundMode, setRefundMode] = useState(0);

  const [showRec, setShowRec] = useState(true);

  const [allPreviouseReceipts, setAllPreviouseReceipts] = useState([]); // this state will be only used for add form and last mr edit form for the manupulation of due amount by discount

  const [additionalDueAmt, setAdditionalDueAmt] = useState(0); // this will be minus from the calculated due amount

  const [forceUnlock, setForceUnlock] = useState(false); // unlock payment section even when due is 0

  // useEffect(() => {
  //   console.log("I am changed:", allPreviouseReceipts);

  // }, [allPreviouseReceipts]);

  // IMPORTANT: BillAmount = GrossAmt from Case01 which is ALREADY net of discount
  // (Total 2350 - Disc 235 = GrossAmt 2115 = BillAmount)
  // The ORIGINAL discount is already baked into BillAmount — never subtract it again.
  // BUT if user gives a NEW discount on ADD mode (or editing last MR), that's additional
  // and should reduce the due amount.
  useEffect(() => {
    if (modalType === "add") {
      // In ADD mode, any DiscAmt entered is a NEW discount being given now
      setAdditionalDueAmt(Number(formData.DiscAmt || 0));
    } else if (modalType === "edit" && showSaveBtnEdit) {
      // For last MR edit: check if this is the FIRST receipt (original disc already in BillAmount)
      // If it's MR#1, the DiscAmt is the original discount — don't subtract
      // If it's MR#2+, any DiscAmt is a new discount — subtract it
      const isFirstReceipt = allPreviouseReceipts.length > 0 && 
        allPreviouseReceipts[0]?.ReceiptId === formData.ReceiptId;
      if (isFirstReceipt) {
        // Original discount already in BillAmount, don't subtract
        setAdditionalDueAmt(0);
      } else {
        setAdditionalDueAmt(Number(formData.DiscAmt || 0));
      }
    } else {
      setAdditionalDueAmt(0);
    }
  }, [formData.ReffId, allPreviouseReceipts, modalType, formData.DiscAmt, formData.ReceiptId, showSaveBtnEdit]);

  // useEffect(() => {
  //   console.log("additionalDueAmt", additionalDueAmt);
  // }, [additionalDueAmt]);

  useEffect(() => {
    fetchReceipts(page, showRec);
    fetchUsers();
  }, [page, showRec]);

  useEffect(() => {
    if (searchTerm.trim()) {
      fetchPatients();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!showDrawer) {
      setHistData([]);
      setAllPreviouseReceipts([]);
      setAdditionalDueAmt(0);
      setForceUnlock(false);
    }
  }, [showDrawer]);

  useEffect(() => {
    let totalPaid = 0;
    if (allPrevReceipts.length != 0) {
      totalPaid = allPrevReceipts.reduce(
        (acc, item) => acc + Number(item.Amount || 0),
        0
      );

      // Only set Amount (prev paid) for ADD mode
      // For EDIT mode, Amount is set by fetchReceiptByNo with correct logic
      if (modalType === "add") {
        setFormData((prev) => ({
          ...prev,
          Amount: totalPaid,
        }));
      }
    }
  }, [allPrevReceipts]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth/users");
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchPatients = async (search = "") => {
    try {
      const url = search
        ? `/case01?search=${encodeURIComponent(search)}&limit=50`
        : "/case01?limit=20";
      const res = await axiosInstance.get(url);
      if (res.data.success) {
        setPatients(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  // this is for removing duplicate elements from the arrays by comparing the array and its previous array
  function getNewElements(prevArr, latestArr) {
    if (!prevArr || prevArr.length === 0) {
      return latestArr;
    }

    // deep compare using JSON.stringify
    return latestArr.filter(
      (latestItem) =>
        !prevArr.some(
          (prevItem) => JSON.stringify(prevItem) === JSON.stringify(latestItem)
        )
    );
  }

  // this is will work only for add, this will fetch all the moneyreceipts by reffId
  const fetchAllPrevRecep = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/money-receipt01/search?ReffId=${id}`
      );
      if (res.data.success) {
        // console.log("History data: ", res.data.data);
        const data = res.data.data;
        setAllPrevReceipts(data);
        setAllPreviouseReceipts(data); // this will only work add mode
        // console.log("all prev receps from fetchAllPrevRecep:", data);
      }
    } catch (error) {
      console.log("Erro fetching moneyreceipt", error);
    }
  };

  // this is for fetching transaction of the patient by reff Id
  const fetchHistory = async (id, ReceiptId) => {
    try {
      const res = await axiosInstance.get(
        `/money-receipt01/search?ReffId=${id}`
      );
      if (res.data.success) {
        // console.log("History data from fetchHistory fn: ", res.data.data);

        setAllMRs(res.data.data);
        setAllPreviouseReceipts(res.data.data); // this will only work for edit mode
        const data = res.data.data;
        // console.log("prev data old:", data);
        // console.log("current receiptId:", ReceiptId);

        if (data[0].ReceiptId == ReceiptId) {
          setShowDisc(true);
        }

        // Only allow editing the LAST (latest) receipt
        // data is sorted ASC, so last element is the latest
        if (data[data.length - 1].ReceiptId == ReceiptId) {
          setShowSaveBtnEdit(true);
        } else {
          setShowSaveBtnEdit(false);
        }

        let dataNew = [];

        for (let j = data.length - 1; j >= 0; j--) {
          if (j == 0) {
            dataNew.push(data[0]);
            break;
          }
          let value = getNewElements(
            data[j - 1].paymentMethods,
            data[j].paymentMethods
          );
          // console.log("value-",j," : ", value )
          let ele = { ...data[j], paymentMethods: value };
          //  console.log("ele-",j," : ", ele )
          dataNew.push(ele);
        }

        // console.log("Data new: ", dataNew)

        //         console.log("RecpId: ", ReceiptId);
        const index = dataNew.findIndex((item) => item.ReceiptId === ReceiptId);
        // console.log("Index is :", index);
        const prevData = index !== -1 ? dataNew.slice(index + 1) : [];

        // console.log("prev data: ", prevData);
        setHistData(prevData);
      } else {
        setHistData([]);
      }
    } catch (error) {
      console.log("Error fetching history: ", error);
    }
  };

  const fetchReceipts = async (pageNo = 1, showRec) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNo,
        limit,
        startDate,
        endDate,
        // allReceipt,
        // refund,
        search: searchTerm,
        ...(searchPatientName && { PatientName: searchPatientName }),
        ...(searchCaseNo && { ReffId: searchCaseNo }),
        ...(searchPhone && { Phone: searchPhone }),
      });
      // console.log("showRec", showRec);
      const res = await axiosInstance.get(`/money-receipt01/search?${params}`);
      if (res.data.success) {
        let arr = res.data.data;
        let newArr;
        if (showRec) {
          newArr = arr.filter((item) => item.Amount >= 0);
        } else {
          newArr = arr.filter((item) => item.Amount < 0);
        }

        setReceipts(newArr || []);
        if (res.data.pagination) {
          setPage(res.data.pagination.page);
          setLimit(res.data.pagination.limit);
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch receipts");
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptByNo = async (receiptNo) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/money-receipt01/search?ReceiptNo=${encodeURIComponent(receiptNo)}`
      );

      if (res.data.success && res.data.data?.length) {
        const receipt = res.data.data[0];

        // Parse paymentMethods if it's a JSON string
        let parsedPM = receipt.paymentMethods;
        if (typeof parsedPM === "string") {
          try { parsedPM = JSON.parse(parsedPM); } catch (e) { parsedPM = null; }
        }

        // Load payment methods if exists
        if (
          parsedPM &&
          Array.isArray(parsedPM) &&
          parsedPM.length > 0
        ) {
          const loadedMethods = parsedPM.map((pm) => ({
            type:
              pm.method === "Cash"
                ? "0"
                : pm.method === "UPI" || pm.method === "UPI/PHONE PE"
                  ? "1"
                  : "2",
            amount: pm.amount || "",
            upiApp: pm.upiApp || "",
            utrNumber: pm.utrNumber || "",
            bankName: pm.bankName || "",
            chequeNumber: pm.chequeNumber || "",
          }));
          setPaymentMethods(loadedMethods);

  // Fetch total paid from all receipts for correct due amount in edit mode
          let totalSum = receipt.Amount || 0;
          let totalSumExcludingCurrent = 0;
          let isLastReceipt = false;
          if (receipt?.ReffId) {
            try {
              const resAll = await axiosInstance.get(
                `/money-receipt01/search?ReffId=${receipt.ReffId}`
              );
              if (resAll.data.success && resAll.data.data?.length) {
                const allData = resAll.data.data;
                totalSum = allData.reduce(
                  (acc, item) => acc + Number(item.Amount || 0),
                  0
                );
                totalSumExcludingCurrent = allData
                  .filter(item => item.ReceiptId !== receipt.ReceiptId)
                  .reduce((acc, item) => acc + Number(item.Amount || 0), 0);
                // Check if this is the last (latest) receipt
                isLastReceipt = allData[allData.length - 1].ReceiptId === receipt.ReceiptId;
              }
            } catch (e) {
              console.error("Failed to fetch all receipts for total:", e);
            }
          }

          setFormData({
            ReceiptId: receipt.ReceiptId,
            ReceiptNo: receipt.ReceiptNo || "",
            ReffId: receipt.ReffId || "",
            ReceiptDate: receipt.ReceiptDate?.slice(0, 10) || "",
            BillAmount: receipt.BillAmount || 0,
            BalanceAmt: receipt.BalanceAmt || 0,
            Amount: isLastReceipt ? totalSumExcludingCurrent : totalSum,
            DiscAmt: receipt.DiscAmt || 0,
            Desc: receipt.Desc || 0,
            AdjAmt: receipt.AdjAmt || 0,
            MRType: receipt.MRType || "",
            BankName: receipt.BankName || "",
            ChequeNo: receipt.ChequeNo || "",
            Phone: receipt.Phone || "",
            CaseDate: receipt.CaseDate?.slice(0, 10) || "",
            Add1: receipt.Add1 || "",
            Add2: receipt.Add2 || "",
            Add3: receipt.Add3 || "",
            DoctorId: receipt.DoctorId || "",
            CBalAmt: receipt.CBalAmt || 0,
            Remarks: receipt.Remarks || "",
            UserId: receipt.UserId || "",
            TypeofReceipt: receipt.TypeofReceipt || "",
            DiscOtherId: receipt.DiscOtherId || "",
            DiscChk: receipt.DiscChk || "",
            HeadId: receipt.HeadId || "",
            ReffType: receipt.ReffType || "",
            AgentDiscId: receipt.AgentDiscId || "",
            CompName: receipt.CompName || "",
            ReceiptTime: receipt.ReceiptTime || "",
            Narration: receipt.Narration || "",
            PaidBy: receipt.PaidBy || "",
            TDS: receipt.TDS || 0,
            PatientName: receipt.PatientName || "",
            Age: receipt.Age || "",
            Sex: receipt.Sex || "",
            AdmitionNo: receipt.AdmitionNo || "",
          });

          setLoading(false);
          return;
        } else {
          // Default: show old payment method data or empty cash payment

          let data = [];

          if (receipt?.ReffId) {
            const res1 = await axiosInstance.get(
              `/money-receipt01/search?ReffId=${receipt?.ReffId}`
            );
            if (res1.data.success) {
              data = res1.data.data;
              // console.log("this is form fetchReceipt by no: ", data);
            } else {
              data = [];
            }
          }
          // console.log("hist is : ", data);
          let sum =
            data.length != 0
              ? data.reduce((acc, item) => acc + Number(item.Amount || 0), 0)
              : 0;
          let sumExcludingCurrent =
            data.length != 0
              ? data
                  .filter(item => item.ReceiptId !== receipt.ReceiptId)
                  .reduce((acc, item) => acc + Number(item.Amount || 0), 0)
              : 0;
          // Check if this is the last (latest) receipt
          let isLastRec = data.length > 0 && data[data.length - 1].ReceiptId === receipt.ReceiptId;

          const defaultMethod = {
            type:
              receipt.MRType === "B" ? "2" : receipt.MRType === "D" ? "1" : "0",
            amount: receipt.Amount || "",
            upiApp: "",
            utrNumber: "",
            bankName: receipt.BankName || "",
            chequeNumber: receipt.ChequeNo || "",
          };
          // console.log("hi");
          // console.log("prev data: ", allMRs);
          setPaymentMethods([defaultMethod]);

          setFormData({
            ReceiptId: receipt.ReceiptId,
            ReceiptNo: receipt.ReceiptNo || "",
            ReffId: receipt.ReffId || "",
            ReceiptDate: receipt.ReceiptDate?.slice(0, 10) || "",
            BillAmount: receipt.BillAmount || 0,
            BalanceAmt: receipt.BalanceAmt || 0,
            // Amount: receipt.Amount || 0,
            Amount: isLastRec ? sumExcludingCurrent : (sum || 0),
            DiscAmt: receipt.DiscAmt || 0,
            Desc: receipt.Desc || 0,
            AdjAmt: receipt.AdjAmt || 0,
            MRType: receipt.MRType || "",
            BankName: receipt.BankName || "",
            ChequeNo: receipt.ChequeNo || "",
            Phone: receipt.Phone || "",
            CaseDate: receipt.CaseDate?.slice(0, 10) || "",
            Add1: receipt.Add1 || "",
            Add2: receipt.Add2 || "",
            Add3: receipt.Add3 || "",
            DoctorId: receipt.DoctorId || "",

            // extra
            CBalAmt: receipt.CBalAmt || 0,
            Remarks: receipt.Remarks || "",
            UserId: receipt.UserId || "",
            TypeofReceipt: receipt.TypeofReceipt || "",
            DiscOtherId: receipt.DiscOtherId || "",
            DiscChk: receipt.DiscChk || "",
            HeadId: receipt.HeadId || "",
            ReffType: receipt.ReffType || "",
            AgentDiscId: receipt.AgentDiscId || "",
            CompName: receipt.CompName || "",
            ReceiptTime: receipt.ReceiptTime || "",

            Narration: receipt.Narration || "",
            PaidBy: receipt.PaidBy || "",
            TDS: receipt.TDS || 0,

            // readonly
            PatientName: receipt.PatientName || "",
            Age: receipt.Age || "",
            Sex: receipt.Sex || "",
            AdmitionNo: receipt.AdmitionNo || "",
          });

          setLoading(false);
          return;
        }
      } else {
        toast.error("Receipt data not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load receipt details");
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = async (receipt, type) => {
    setModalType(type);

    if (type === "add") {
      setFormData({
        ReceiptDate: new Date().toISOString().slice(0, 10),
        ReffId: "",
        BillAmount: 0,
        Amount: 0,
        BalanceAmt: 0,
        DiscAmt: 0,
        Desc: 0,
        TDS: 0,
        AdjAmt: 0,
        MRType: "C",
        BankName: "",
        ChequeNo: "",
        Narration: "",
      });
      setPaymentMethods([
        {
          type: "0",
          amount: "",
          upiApp: "",
          utrNumber: "",
          bankName: "",
          chequeNumber: "",
        },
      ]);
      setPatientSearch("");
      setShowDrawer(true);
      return;
    }

    if (type === "refund") {
      console.log("type: ", type);
      setFormData({
        ReceiptDate: new Date().toISOString().slice(0, 10),
        ReffId: "",
        RefundAmount: 0,
        MRType: "C",
        BankName: "",
        ChequeNo: "",
        Narration: "Refund Money Receipt",
      });
      setPaymentMethods([
        {
          type: "0",
          amount: "",
          upiApp: "",
          utrNumber: "",
          bankName: "",
          chequeNumber: "",
        },
      ]);
      setPatientSearch("");
      setShowDrawer(true);
      return;
    }

    setFormData({
      ReceiptId: receipt.ReceiptId,

      ReceiptNo: receipt.ReceiptNo || "",
      ReffId: receipt.ReffId || "",
      ReceiptDate: receipt.ReceiptDate?.slice(0, 10) || "",
      BillAmount: receipt.BillAmount || 0,
      BalanceAmt: receipt.BalanceAmt || 0,
      Amount: receipt.Amount || 0,
      DiscAmt: receipt.BillAmount || 0,
      Desc: receipt.Desc || 0,
      AdjAmt: receipt.AdjAmt || 0,
      MRType: receipt.MRType,
      BankName: receipt.BankName || "",
      ChequeNo: receipt.ChequeNo || "",
      CaseData: receipt.CaseData || "",

      // xtra------
      CBalAmt: receipt.CBalAmt || "",
      Remarks: receipt.Remarks || "",
      UserId: receipt.UserId || "",
      TypeofReceipt: receipt.TypeofReceipt || "",
      DiscOtherId: receipt.DiscOtherId || "",
      DiscChk: receipt.DiscChk || "",
      HeadId: receipt.HeadId || "",
      ReffType: receipt.ReffType || "",
      AgentDiscId: receipt.AgentDiscId || "",
      CompName: receipt.CompName || "",
      ReceiptTime: receipt.ReceiptTime || "",
      // xtr end ----
      PaymentType: receipt.PaymentType ?? 0,
      // Bank: receipt.Bank || "",
      Narration: receipt.Narration || "",
      PaidBy: receipt.PaidBy || "",
      TDS: receipt.TDS || 0,

      // read-only / view fields (safe)
      PatientName: receipt.PatientName || "",
      Age: receipt.Age || "",
      Sex: receipt.Sex || "",
      AdmitionNo: receipt.AdmitionNo || "",
    });

    setShowDrawer(true);
    setFormData({});
    if (type === "edit" && receipt?.ReceiptNo) {
      // console.log("rec data: ", receipt);
      await fetchHistory(receipt.ReffId, receipt.ReceiptId);
      await fetchReceiptByNo(receipt.ReceiptNo);
    }
  };

  // handle save------
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.ReffId) {
        toast.error("Please select a patient");
        return;
      }

      const totalPaidAmount = paymentMethods.reduce(
        (sum, p) => sum + parseFloat(p.amount || 0),
        0
      );

      // if (totalPaidAmount <= 0) {
      //   toast.error("Please enter payment amount");
      //   return;
      // }

      // Prepare paymentMethods array
      const formattedPaymentMethods = paymentMethods.map((p) => ({
        method: p.type === "0" ? "Cash" : p.type === "1" ? "UPI" : "Cheque",
        amount: parseFloat(p.amount || 0),
        ...(p.type === "1" && { upiApp: p.upiApp, utrNumber: p.utrNumber }),
        ...(p.type === "2" && {
          bankName: p.bankName,
          chequeNumber: p.chequeNumber,
        }),
      }));

      if (modalType === "refund") {
        const payload = {
          ReffId: formData.ReffId,
          ReceiptDate:
            formData.ReceiptDate || new Date().toISOString().slice(0, 10),
          BillAmount: 0,
          Desc: 0,
          DiscAmt: 0,
          Amount: -Math.abs(formData.RefundAmount || 0),
          CBalAmt: 0,
          BalanceAmt: 0,
          Remarks: "Refund Money Receipt",
          UserId: formData.UserId || 1,
          TypeofReceipt: 1,
          DiscOtherId: 1,
          DiscChk: "Y",
          HeadId: "HEAD001",
          ReffType: "C",
          MRType: formData.MRType || "C",
          BankName: formData.BankName || "",
          ChequeNo: formData.ChequeNo || "",
          AgentDiscId: 1,
          TDS: 0,
          AdjAmt: 0,
          CompName: "",
          Narration: formData.Narration || "Refund Money Receipt",
          ReceiptTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
          paymentMethods: formattedPaymentMethods,
        };
        await axiosInstance.post("/money-receipt01", payload);
        toast.success("Refund created successfully");
      } else if (modalType === "add") {
        const payload = {
          ReffId: formData.ReffId,
          ReceiptDate:
            formData.ReceiptDate || new Date().toISOString().slice(0, 10),
          BillAmount: formData.BillAmount || 0,
          Desc: formData.Desc || 0,
          DiscAmt: formData.DiscAmt || 0,
          Amount: totalReceivedAmount,
          CBalAmt: formData.CBalAmt || 0,
          BalanceAmt: formData.BalanceAmt || 0,
          // Remarks: formData.Remarks || "",
          Remarks: "2nd Money Receipt",
          UserId: formData.UserId || 1,
          TypeofReceipt: formData.TypeofReceipt || 1,
          DiscOtherId: formData.DiscOtherId || 1,
          DiscChk: formData.DiscChk || "Y",
          HeadId: formData.HeadId || "HEAD001",
          ReffType: formData.ReffType || "C",
          MRType: formData.MRType || "C",
          BankName: formData.BankName || "",
          ChequeNo: formData.ChequeNo || "",
          AgentDiscId: formData.AgentDiscId || 1,
          TDS: formData.TDS || 0,
          AdjAmt: formData.AdjAmt || 0,
          CompName: formData.CompName || "",
          Narration: formData.Narration || "",
          ReceiptTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
          paymentMethods: formattedPaymentMethods,
        };
        await axiosInstance.post("/money-receipt01", payload);
        toast.success("Created successfully");
      } else if (modalType === "edit" && formData.ReceiptId) {
        // Update existing receipt
        console.log("payment arr: ", formattedPaymentMethods);
        const payload = {
          ReceiptNo: formData.ReceiptNo,
          ReffId: formData.ReffId,
          ReceiptDate: formData.ReceiptDate,
          BillAmount: formData.BillAmount,
          Desc: formData.Desc,
          DiscAmt: formData.DiscAmt,
          Amount: totalReceivedAmount,
          CBalAmt: formData.CBalAmt,
          BalanceAmt: formData.BalanceAmt,
          Remarks: formData.Remarks,
          UserId: formData.UserId,
          TypeofReceipt: formData.TypeofReceipt,
          DiscOtherId: formData.DiscOtherId,
          DiscChk: formData.DiscChk,
          HeadId: formData.HeadId,
          ReffType: formData.ReffType,
          MRType: formData.MRType,
          BankName: formData.BankName,
          ChequeNo: formData.ChequeNo,
          AgentDiscId: formData.AgentDiscId,
          TDS: formData.TDS,
          AdjAmt: formData.AdjAmt,
          CompName: formData.CompName,
          Narration: formData.Narration,
          ReceiptTime: formData.ReceiptTime,
          paymentMethods: formattedPaymentMethods,
        };

        // console.log("Update payload:", payload);

        await axiosInstance.put(
          `/money-receipt01/${encodeURIComponent(formData.ReceiptId)}`,
          payload
        );
        toast.success("Updated successfully");
      }
      setRefundMode(0);
      setShowDrawer(false);
      setShowDisc(false);
      fetchReceipts(page, showRec);
    } catch (err) {
      console.error("Save error:", err);
      console.error("Error response:", err?.response?.data);
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  // delete confirm
  const confirmDelete = async (id) => {
    try {
      await axiosInstance.delete(`/moneyreceipt//${deleteId}`);
      toast.success("Deleted successfully!", { autoClose: 1000 });

      setShowConfirm(false);
      setDeleteId(null);

      // reload logic
      if (items.length === 1 && page > 1) {
        fetchItems(page - 1);
      } else {
        fetchItems(page);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this receipt?")) return;
    try {
      await axiosInstance.delete(`/moneyreceipt/${id}`);
      toast.success("Deleted successfully");
      fetchReceipts(page, showRec);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchReceipts(1, showRec);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/money-receipt01/search?ReceiptNo=${encodeURIComponent(searchTerm.trim())}&page=1&limit=${limit}`
      );

      if (response.data.success) {
        setReceipts(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setPage(1);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };
  // =========================================================
  // set initial payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      type: "0", // 0=Cash, 1=UPI, 2=Cheque
      amount: "",
      upiApp: "",
      utrNumber: "",
      bankName: "",
      chequeNumber: "",
    },
  ]);

  // add Payment Methods Functions
  const addPaymentMethod = () => {
    setPaymentMethods([
      ...paymentMethods,
      {
        type: "0",
        amount: "",
        upiApp: "",
        utrNumber: "",
        bankName: "",
        chequeNumber: "",
      },
    ]);
  };
  // remove payment method
  const removePaymentMethod = (index) => {
    const newMethods = paymentMethods.filter((_, i) => i !== index);
    setPaymentMethods(newMethods);
  };

  //  Update payment method-----
  const updatePaymentMethod = (index, field, value) => {
    const newMethods = [...paymentMethods];
    newMethods[index][field] = value;
    setPaymentMethods(newMethods);
  };
  // const totalPaid = paymentMethods.reduce(
  //   (sum, p) => sum + parseFloat(p.amount || 0),
  //   0,
  // );
  // const billAmount = parseFloat(formData.BillAmount || 0);
  // const previousPaid = parseFloat(formData.Amount || 0) - totalPaid;
  // const totalReceivedAmount = previousPaid + totalPaid;

  // const calculatedDueAmount = billAmount - totalReceivedAmount;

  const billAmount = parseFloat(formData.BillAmount || 0);

  const previousPaid = parseFloat(formData.Amount || 0);

  // console.log("Mode is ", modalType);

  const currentPayment =
    modalType === "add" || (modalType === "edit" && showSaveBtnEdit)
      ? paymentMethods.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
      : 0;

  const totalReceivedAmount = currentPayment;

  const calculatedDueAmount = billAmount - previousPaid - totalReceivedAmount - additionalDueAmt;
  const isDueAmountPositive = calculatedDueAmount > 0;

  useEffect(() => {
    if (location.state?.openPatientModal) {
      setModalType("add"); // add mode
      setShowDrawer(true); // drawer open
      setShowPatientModal(true); // 🔥 patient modal open

      fetchPatients(location.state?.search); // optional (list load)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  //  ==================================================================
  // pdf print deb
  // ==================================================================
  const { data: tests } = useAxiosFetch(
    formData?.ReffId ? `case-dtl-01/case/${formData.ReffId}` : null,
    [formData.ReffId]
  );

  const { data: testHash } = useAxiosFetch("tests?limit=9999");

  const testsMap = useMemo(() => {
    const map = {};
    (testHash || []).forEach((d) => {
      map[d.TestId] = d.Test;
    });
    return map;
  }, [testHash]);

  const { data: doctors } = useAxiosFetch("/doctors");
  const doctorMap = useMemo(() => {
    const map = {};
    (doctors || []).forEach((d) => {
      map[d.DoctorId] = d.Doctor;
    });
    return map;
  }, [doctors]);

  // console.log("tests:",tests)

  const userMap = useMemo(() => {
    const map = {};
    (users || []).forEach((u) => {
      map[u.UserId] = u.UserName;
    });
    return map;
  }, [users]);

  const handlePrint = () => {
    const testsPerPage = 5;

    const pages = [];
    for (let i = 0; i < tests.length; i += testsPerPage) {
      pages.push(tests.slice(i, i + testsPerPage));
    }

    // Calculate totals from ALL receipts for this case
    const currentIndex = allPreviouseReceipts.findIndex(r => r.ReceiptId === formData.ReceiptId);
    const receiptsBefore = currentIndex > 0 ? allPreviouseReceipts.slice(0, currentIndex) : [];
    const totalAdvancedAmount = receiptsBefore.reduce((sum, r) => sum + Number(r.Amount || 0), 0);
    const totalAdvancedDiscount = receiptsBefore.reduce((sum, r) => sum + Number(r.DiscAmt || 0), 0);
    // Current receipt's actual paid amount (from stored paymentMethods)
    const currentReceiptAmount = currentIndex >= 0 ? Number(allPreviouseReceipts[currentIndex].Amount || 0) : currentPayment;
    // Total paid including current
    const totalPaidAll = allPreviouseReceipts.reduce((sum, r) => sum + Number(r.Amount || 0), 0);

    let runningTotal = 0;

    const pagesHtml = pages
      .map((pageTests, pageIndex) => {
        // ⭐ page total
        const pageTestTotal = pageTests.reduce((sum, t) => {
          return sum + (Number(t.CancelTast) === 1 ? 0 : Number(t.Rate || 0));
        }, 0);

        // ⭐ running total
        runningTotal += pageTestTotal;

        const rows = pageTests
          .map(
            (t, i) => `
<tr>
<td style="text-align:center;">${pageIndex * testsPerPage + i + 1}</td>
<td>${testsMap[t.TestId]}
${t.CancelTast == 1 ? "(Cancel)" : ""}
</td>
<td>${t.DeliveryDate}</td>
<td style="text-align:right;">${t.CancelTast == 1 ? 0 : t.Rate}</td>
</tr>
`
          )
          .join("");

        // B/F from previous pages
        const prevPagesTotal = runningTotal - pageTestTotal;

        return `

<div class="page">

<div class="top-header-row">
     
<div class="top-favicon">
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLBp8HRkxkrAD3J_42s4lQdr95CDxPS-aQCQ&s"/>
</div>

<div class="header">

<div class="hospital-name">LORDS HEALTH CARE (NURSING HOME)</div>
<div class="hospital-name">(A Unit of MJJ Enterprises Pvt. Ltd.)</div>

<div class="address">
13/3, Circular 2nd Bye Lane, Kona Expressway,<br/>
(Near Jumanabala Balika Vidyalaya) Shibpur. Howrah-711 102, W.B.
</div>

<div class="contact-info">
E-mail: patientdesk@lordshealthcare.org, Website: www.lordshealthcare.org<br/>
Phone: 8272904444 | Helpline: 7003378414 | Toll Free: 1800-309-0895
</div>

</div>

<div class="barcode">
<img src="https://barcode.tec-it.com/barcode.ashx?data=${formData.ReffId}&code=Code128&dpi=96"/>
</div>

</div>

<hr/>

<div class="title">MONEY RECEIPT</div>

<div class="patient-block">

<div class="patient-col">

<div class="patient-row">
<span class="patient-label">Receipt No</span>
<span class="patient-value">${formData.ReceiptNo || ""}</span>
</div>

<div class="patient-row">
<span class="patient-label">Case No</span>
<span class="patient-value">${formData.ReffId || ""}</span>
</div>

<div class="patient-row">
<span class="patient-label">Patient Name</span>
<span class="patient-value">${formData.PatientName || ""}</span>
</div>

<div class="patient-row">
<span class="patient-label">Address</span>
<span class="patient-value">${formData.Add1 || ""} ${formData.Add2 || ""} ${formData.Add3 || ""}</span>
</div>

<div class="patient-row">
<span class="patient-label">Reffered By</span>
<span class="patient-value">${doctorMap[formData.DoctorId] ? "Dr. " + doctorMap[formData.DoctorId] : ""}</span>
</div>

</div>

<div class="patient-col">

<div class="patient-row">
<span class="patient-label">Receipt Date</span>
<span class="patient-value">${formData.ReceiptDate || ""}</span>
</div>

<div class="patient-row">
<span class="patient-label">Case Date</span>
<span class="patient-value">${formData.CaseDate || ""}</span>
</div>

<div class="patient-row">
  <span class="patient-label">Age</span>
  <span class="patient-value">${formData.Age || ""} ${formData.AgeType || ""}</span>

  <span style="margin-left:30px;font-weight:bold;">Sex</span>
  <span class="patient-value" style="margin-left:30px">${formData.Sex || ""}</span>
</div>

<div class="patient-row">
<span class="patient-label">Phone</span>
<span class="patient-value">${formData.Phone || ""}</span>
</div>

</div>

</div>

<hr/>

<table>

<thead>
<tr>
<th style="width:60px;">Sl No</th>
<th>Test Name</th>
<th>Delivery Date</th>
<th style="width:120px;text-align:right;">Amount(Rs)</th>
</tr>
</thead>

<tbody>

${rows}

${pageIndex > 0 ? `<tr><td></td><td colspan="2" style="text-align:right;font-weight:bold;">B/F :</td><td style="text-align:right;font-weight:bold;">${prevPagesTotal}</td></tr>` : ''}

</tbody>

<tfoot>

<tr>
<td></td>
<td colspan="2" style="text-align:right;font-weight:bold;">
${pageIndex < pages.length - 1 ? 'C/F :' : 'Total Test Amount :'}
</td>
<td style="text-align:right;font-weight:bold, margin-top:2px;">
${runningTotal}
</td>
</tr>

${pageIndex === pages.length - 1 ? `
<tr>
<td></td>
<td colspan="2" style="text-align:right;font-weight:bold;">
Less Discount :
</td>
<td style="text-align:right;font-weight:bold;">
${formData.DiscAmt || 0}
</td>
</tr>

<tr>
<td colspan="2" style="font-weight:bold;">Advanced Amount : ${totalAdvancedAmount || 0}</td>
<td style="text-align:right;font-weight:bold;">Paid Amount :</td>
<td style="text-align:right;font-weight:bold;">${currentReceiptAmount || 0}</td>
</tr>

<tr>
<td colspan="2" style="font-weight:bold;">Advanced Discount : ${totalAdvancedDiscount || 0}</td>
<td style="text-align:right;font-weight:bold;">Due Amount :</td>
<td style="text-align:right;font-weight:bold;">${Math.max(0, Number(formData.BillAmount || 0) - totalPaidAll - Number(formData.DiscAmt || 0))}</td>
</tr>
` : ''}

</tfoot>

</table>

<div>
<span>Remarks : ${formData.Narration || ""}</span>
<span style="margin-left:30px;">Received By : ${userMap[formData.UserId] || ""}</span>
</div>

<div>Note:</div>

${
  pageIndex === pages.length - 1
    ? `
<div class="footer">
** End of Report **
</div>
`
    : `
<div class="footer">
*** Continued on Next Page ***
</div>
`
}

</div>

`;
      })
      .join("");

    const printContent = `
<html>
<head>

<style>

// body{
// font-family: Arial, sans-serif;
// font-size:10px;
// margin:0;
// }
body{
  font-family: Arial, sans-serif;
  font-size:12px;   /* 10 → 12 or 13 */
  font-weight:500;  /* optional */
}

.page{
page-break-after:always;
padding:10px;
}

.page:last-child{
page-break-after:auto;
}

.top-header-row{
display:flex;
justify-content:space-between;
align-items:center;
}

.hospital-name{
  font-size:18px;
  font-weight:700;
}

.address{
font-size:9px;
}

.contact-info{
font-size:9px;
}

.barcode img{
width:120px;
height:40px;
}

.top-favicon img{
width:50px;
}

.header{
text-align:center;
flex-grow:1;
}

.title{
text-align:center;
font-weight:bold;
  font-size:16px;
  font-weight:700;
margin-top:5px;
}

.patient-block{
margin-top:6px;
display:flex;
justify-content:space-between;
gap:10px;
border:1px solid #000;
padding:6px;
}

.patient-col{
width:48%;
font-size:12px;
}

.patient-row{
display:flex;
margin-bottom:3px;
}

.patient-label{
font-weight:bold;
width:80px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:6px;
}

th{
border:1px solid #333;
padding:3px;
  font-size:12px;
  font-weight:600;
}

td{
border-left:1px solid #333;
border-right:1px solid #333;
padding:3px;
font-size:12px;
font-weight:600;
}

/* ⭐ only last row bottom border */
tbody tr:last-child td{
border-bottom:1px solid #333;
}
/* ⭐ remove border from total section */
tfoot td{
border:none !important;
}

th{
background-color:#f0f0f0;
}

.footer{
text-align:center;
margin-top:4px;
  font-size:11px;
  font-weight:500;
color:#555;
}

</style>

</head>

<body>

${pagesHtml}

</body>

</html>
`;

    const win = window.open("", "_blank");

    win.document.open();
    win.document.write(printContent);
    win.document.close();

    setTimeout(() => {
      win.print();
    }, 500);
  };

  function handleRefundPdf(data) {
    // Open a new window for printing
    const printWindow = window.open("", "_blank", "width=600,height=800");

    if (!printWindow) {
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    // HTML structure with inline CSS optimized for a compacted A5 size
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Print Refund Receipt</title>
      <style>
        /* Force the printer to use A5 paper size and reduce page margins */
        @page {
         
          margin: 5mm; /* Reduced from 12mm to give more vertical space */
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          line-height: 1.1; /* Tightened line height */
          color: #000;
          margin: 0 auto;
          padding: 0;
          max-width: 100%;
          box-sizing: border-box;
        }

        .center { text-align: center; }
       
        .divider {
          text-align: center;
          letter-spacing: 1px;
          overflow: hidden;
          white-space: nowrap;
          margin: 1px 0; /* Drastically reduced vertical space around dividers */
          width: 100%;
        }

        .row { display: flex; justify-content: space-between; }
        .w-50 { width: 48%; }
       
        /* Table Styling */
        .test-table { width: 100%; border-collapse: collapse; margin-top: 2px; table-layout: fixed; }
        .test-table th { font-weight: normal; text-align: left; padding-bottom: 2px; }
        .test-table th.amount, .test-table td.amount { text-align: right; }
        .test-table td { padding: 1px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
       
        /* Totals Styling */
        .totals-section { margin-top: 5px; } /* Reduced from 15px */
        .totals-row { display: flex; margin-bottom: 1px; }
        .totals-label { width: 130px; }
        .totals-mid { flex-grow: 1; }
        .totals-val { width: 100px; text-align: right; }
       
        /* Footer Styling */
        .footer-info { margin-top: 5px; display: flex; justify-content: space-between; }
        .bottom-footer { margin-top: 15px; } /* Reduced from 30px */
       
        /* Hide scrollbars for print */
        ::-webkit-scrollbar { display: none; }
      </style>
    </head>
    <body>
      <div class="center">
        <div>${data.clinicName}</div>
        <div>${data.address}</div>
        <div>${data.receiptType}</div>
      </div>

      <div class="divider">====================================================================================================</div>

      <div class="row">
        <div class="w-50">
          Receipt No : ${data.patientDetails.receiptNo}<br>
          Case No &nbsp;&nbsp;&nbsp;: ${data.patientDetails.caseNo} <br>
          Patient &nbsp;&nbsp;&nbsp;: ${data.patientDetails.patientName}<br>
          Referred By: ${data.patientDetails.referredBy}
        </div>
        <div class="w-50">
          Receipt Date : ${data.patientDetails.receiptDate}<br>
          Case Date &nbsp;&nbsp;: ${data.patientDetails.caseDate}<br>
          Age : ${data.patientDetails.age} &nbsp; Sex: ${data.patientDetails.sex}<br>
          PhNo. : ${data.patientDetails.phoneNo}
        </div>
      </div>

      <div class="divider">====================================================================================================</div>

      <table class="test-table">
        <thead>
          <tr>
            <th style="width: 8%;">SlNo</th>
            <th style="width: 42%;">Test Name</th>
            <th style="width: 20%;">Del Date</th>
            <th style="width: 15%;">Time</th>
            <th class="amount" style="width: 15%;">Amount</th>
          </tr>
          <tr>
            <td colspan="5"><div class="divider">====================================================================================================</div></td>
          </tr>
        </thead>
        <tbody>
          ${data.tests
            .map(
              (test) => `
            <tr>
              <td>${test.slNo}</td>
              <td>${test.name} ${test.CancelTast == 1 ? "(cancel)" : ""}</td>
              <td>${test.deliveryDate}</td>
              <td>${test.time}</td>
              <td class="amount">${test.amount}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="divider">====================================================================================================</div>

      <div class="totals-section">
        <div class="totals-row">
          <div class="totals-label">Total</div>
          <div class="totals-mid">:&nbsp;&nbsp;(Advance: ${data.billing.advance} )</div>
          <div class="totals-val">${data.billing.total}</div>
        </div>
        <div class="totals-row">
          <div class="totals-label">Refund Amount</div>
          <div class="totals-mid">:</div>
          <div class="totals-val">${data.billing.refundAmount}</div>
        </div>
        <div class="totals-row">
          <div class="totals-label">Due Amount</div>
          <div class="totals-mid">:&nbsp;&nbsp;${data.billing.paymentStatus}</div>
          <div class="totals-val">${data.billing.dueAmount}</div>
        </div>
      </div>

      <div class="divider">====================================================================================================</div>

      <div class="footer-info">
        <div>Received By : ${data.footer.receivedBy}</div>
        <div>Bill Time : ${data.footer.billTime}</div>
      </div>
      <div>Remarks (If any) : ${data.footer.remarks}</div>

      <div class="bottom-footer">
        <div class="center">${data.footer.deliveryNote}</div>
        <div class="divider">====================================================================================================</div>
        <div class="row">
          <div class="center w-50">${data.footer.greeting}</div>
          <div class="center w-50">${data.footer.signatory}</div>
        </div>
      </div>

    </body>
    </html>
  `;

    // Write the HTML to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Focus the window and trigger print after a tiny delay to ensure CSS renders
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        {/* Header */}
        <div className="panel-header d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)", padding: "14px 20px", borderRadius: "12px 12px 0 0" }}>
          <h5 style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "0.5px" }}>💳 Sample Receipt</h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", fontWeight: 600, borderRadius: "8px", backdropFilter: "blur(4px)" }}
              onClick={() => openDrawer(null, "add")}
            >
              <i className="fa fa-plus me-2"></i>Add Receipt
            </button>
            <button
              className="btn btn-sm"
              style={{ background: "rgba(244,67,54,0.8)", color: "#fff", border: "none", fontWeight: 600, borderRadius: "8px" }}
              onClick={() => {
                setRefundMode(1);
                openDrawer(null, "add");
              }}
            >
              <i className="fa fa-undo me-2"></i>Refund
            </button>
            {/* <button
              className="btn btn-sm btn-danger"
              onClick={() => openDrawer(null, "refund")}
            >
              <i className="fa fa-undo me-2"></i>Refund old
            </button> */}
          </div>
        </div>

        <div className="panel-body">
          {/* Filters */}
          <div className="panel p-3 mb-3" style={{ background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)", borderRadius: "16px", border: "1px solid #e0e0e0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div className="row g-3 align-items-center justify-content-center">
              <div className="col-md-2">
                <label className="form-label">Date From</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Date To</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search name..."
                  value={searchPatientName}
                  onChange={(e) => setSearchPatientName(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Case No</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Case No..."
                  value={searchCaseNo}
                  onChange={(e) => setSearchCaseNo(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Phone..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </div>

              <div className="col-md-2 ">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={showRec}
                    onChange={() => setShowRec(true)}
                  />
                  <label className="form-check-label">All Receipt</label>
                </div>
              </div>

              <div className="col-md-2  ">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={!showRec}
                    onChange={() => setShowRec(false)}
                  />
                  <label className="form-check-label">Refund</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search receipt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                  <button
                    className="btn btn-sm btn-info"
                    onClick={handleSearch}
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            {/* Search + Barcode */}
            {/* <div className="row mb-3"> */}

            {/* <div className="col-md-6 text-end">
              <img
                src={`https://barcode.tec-it.com/barcode.ashx?data=${barcodeData}&code=Code128`}
                alt="barcode"
                height="45"
              />
              <div className="fw-bold mt-1">{barcodeData}</div>
            </div> */}
            {/* </div> */}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <div style={{ display: "inline-block", position: "relative", width: "80px", height: "80px" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  border: "4px solid transparent",
                  borderTop: "4px solid #667eea",
                  borderRight: "4px solid #764ba2",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}></div>
                <div style={{
                  position: "absolute", inset: "10px",
                  border: "4px solid transparent",
                  borderBottom: "4px solid #f093fb",
                  borderLeft: "4px solid #f5576c",
                  borderRadius: "50%",
                  animation: "spin 1.2s linear infinite reverse",
                }}></div>
                <div style={{
                  position: "absolute", inset: "20px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "50%",
                  animation: "pulse 1s ease-in-out infinite",
                }}></div>
              </div>
              <div style={{ marginTop: "16px", fontSize: "14px", fontWeight: 600, color: "#667eea", letterSpacing: "1px" }}>Loading Receipts...</div>
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { transform: scale(0.8); opacity:0.5; } 50% { transform: scale(1); opacity:1; } }
              `}</style>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-hover" style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <thead style={{ background: "linear-gradient(135deg, #1a237e, #3f51b5)", color: "#fff" }}>
                  <tr>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>Action</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>Sl No</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>MR#</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>Receipt No</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>Receipt Date</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>Patient Name</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }} className="text-end">Bill Amount</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>Receipt</th>
                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "12px" }}>Reff No</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    receipts.map((r, index) => (
                      <tr key={r.MoneyreeciptId || index}>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                if (r.Amount < 0) {
                                  setRefundMode(1);
                                  openDrawer(r, "edit");
                                } else {
                                  openDrawer(r, "edit");
                                }
                              }}
                            >
                              <i className="fa-light fa-pen-to-square"></i>
                            </button>
                          </div>
                        </td>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>
                          <span className="badge" style={{ background: "#3f51b5", fontSize: "10px" }}>
                            #{r.MRSeqNo || "-"}
                          </span>
                        </td>
                        <td>{r.ReceiptNo}</td>
                        <td>
                          {r.ReceiptDate
                            ? new Date(r.ReceiptDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{r.PatientName || "-"}</td>
                        <td className="text-end">{r.BillAmount?.toFixed(2)}</td>
                        <td>{r.Amount?.toFixed(2)}</td>
                        <td>{r.ReffId || "-"}</td>
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
          {/* backdrop */}
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              setRefundMode(0);
              setShowDrawer(false);
              setShowDisc(false);
            }}
            style={{ zIndex: 9998 }}
          ></div>

          {/* right sidebar */}
          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "1200px",
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => {
                setRefundMode(0);
                setShowDrawer(false);
                setShowDisc(false);
              }}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              {/* Header */}
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #1a237e 0%, #3f51b5 50%, #7c4dff 100%)",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  boxShadow: "0 4px 20px rgba(63,81,181,0.3)",
                }}
              >
                {modalType === "view"
                  ? "👁️ View Sample Receipt"
                  : modalType === "add"
                    ? refundMode === 0
                      ? "➕ Add Sample Receipt"
                      : "💸 Refund"
                    : modalType === "edit" && refundMode == 0
                      ? "✏️ Edit Sample Receipt"
                      : "💸 Refund"}
              </div>

              {/* BODY WITH SCROLL */}
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 60px)" }}
              >
                <div className="mx-3" style={{ paddingTop: "15px" }}>
                  {/* Locked Alert - shows in view mode OR edit mode when not last receipt */}
                  {(modalType === "view" || (modalType === "edit" && !showSaveBtnEdit)) && (
                    <div
                      className="alert d-flex align-items-center gap-3 mb-3"
                      style={{
                        background: "linear-gradient(135deg, #ff1744 0%, #d50000 100%)",
                        color: "#fff",
                        borderRadius: "14px",
                        padding: "16px 24px",
                        fontWeight: 700,
                        fontSize: "14px",
                        boxShadow: "0 8px 30px rgba(213,0,0,0.4)",
                        border: "2px solid rgba(255,255,255,0.3)",
                        animation: "pulse-alert 2s infinite",
                      }}
                    >
                      <span style={{ fontSize: "28px" }}>🔒</span>
                      <div>
                        <div style={{ fontSize: "15px", letterSpacing: "1px" }}>⚠️ THIS RECEIPT IS LOCKED</div>
                        <div style={{ fontSize: "12px", fontWeight: 500, opacity: 0.9 }}>
                          {modalType === "view" 
                            ? "View mode only — editing is not allowed. To make changes, click the Edit button."
                            : "This is not the last receipt, so editing is not allowed. Only the last receipt can be edited."
                          }
                        </div>
                      </div>
                    </div>
                  )}
                  <style>{`
                    @keyframes pulse-alert {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.01); box-shadow: 0 8px 40px rgba(213,0,0,0.6); }
                    }
                  `}</style>
                  {/* Row 1 */}
                  <div className="row g-2 mb-2 align-items-end p-3" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%)", borderRadius: "12px", border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    {/* Receipt No */}
                    <div className="col-md-3">
                      <label className="form-label">Receipt </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="ReceiptNo"
                        value={formData.ReceiptNo}
                        onChange={handleChange}
                        disabled
                      />
                    </div>

                    {/* Receipt Date */}
                    <div className="col-md-3">
                      <label className="form-label">Receipt Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        name="ReceiptDate"
                        value={new Date().toISOString().slice(0, 10)}
                        onChange={handleChange}
                        disabled
                      />
                    </div>

                    {/* Find By Radios */}
                    <div className="col-md-3">
                      <label className="form-label d-block">Find</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="findBy"
                            id="findByName"
                            checked={findBy === "name"}
                            onChange={() => setFindBy("name")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="findByName"
                          >
                            By Name
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="findBy"
                            id="findByNo"
                            checked={findBy === "no"}
                            onChange={() => setFindBy("no")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="findByNo"
                          >
                            By No
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Find Input */}
                    {/* <div className="col-md-12 mt-1">
    <input
      type="text"
      className="form-control form-control-sm"
      placeholder={
        findBy === "name"
          ? "Enter Patient Name"
          : "Enter Receipt No"
      }
      value={findValue}
      onChange={(e) => setFindValue(e.target.value)}
    />
  </div> */}
                    {formData.ReffId && (
                      <div className="col-md-3 text-end">
                        <img
                          src={`https://barcode.tec-it.com/barcode.ashx?data=${formData.ReffId}&code=Code128`}
                          alt="barcode"
                          height="40"
                        />
                      </div>
                    )}
                  </div>

                  {/* Receipt / Case */}
                  <div className="row g-2 mb-2 p-3" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e3f2fd", boxShadow: "0 2px 12px rgba(33,150,243,0.08)" }}>
                    {/* <div className="col-md-1 ">
     
      <label className="form-label">Receipt</label>
      <input
        type="radio"
        className=""
        value="Receipt"
        // disabled
      />
    </div> */}

                    <div className="col-md-2">
                      <label className="form-label">Case No</label>
                      {modalType === "add" || modalType === "refund" ? (
                        <div className="input-group input-group-sm">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            name="ReffId"
                            value={formData.ReffId || ""}
                            readOnly
                            placeholder="Select patient"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setShowPatientModal(true);

                              fetchPatients();
                            }}
                          >
                            <i className="fa fa-search"></i>
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          name="ReffId"
                          value={formData.ReffId}
                          onChange={handleChange}
                          disabled={modalType === "view"}
                        />
                      )}
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Case Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.CaseDate}
                        onChange={handleChange}
                        disabled
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="PatientName"
                        value={formData.PatientName}
                        onChange={handleChange}
                        disabled
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Age</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.Age}
                        name="Age"
                        disabled
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Sex</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.Sex}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Patient info */}
                  <div className="row g-2 mb-2 p-3" style={{ background: "linear-gradient(135deg, #fafafa 0%, #f3e5f5 100%)", borderRadius: "12px", border: "1px solid #f0e0f5" }}>
                    <div className="col-md-2">
                      <label className="form-label">Received By</label>
                      <select
                        className="form-control form-control-sm"
                        name="UserId"
                        value={formData.UserId || ""}
                        onChange={handleChange}
                        disabled={modalType === "view" || (modalType === "edit" && !showSaveBtnEdit)}
                      >
                        <option value="">Select User</option>
                        {users.map((u) => (
                          <option key={u.UserId} value={u.UserId}>
                            {u.UserName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Current User</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value="Admin"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Amount Section */}
                  {modalType === "refund" ? (
                    <div className="row g-2 mb-2 p-3" style={{ background: "linear-gradient(135deg, #fff3e0 0%, #fbe9e7 100%)", borderRadius: "12px", border: "1px solid #ffccbc", boxShadow: "0 2px 12px rgba(255,87,34,0.08)" }}>
                      <div className="col-md-12">
                        <label className="form-label">Refund Amount</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="RefundAmount"
                          value={formData.RefundAmount || 0}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="row g-2 mb-2 p-3" style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)", borderRadius: "12px", border: "1px solid #c8e6c9", boxShadow: "0 2px 12px rgba(76,175,80,0.08)" }}>
                      <div className="col-md-1">
                        <label className="form-label" style={{ fontWeight: 600, color: "#2e7d32", fontSize: "11px" }}>Bill Amt</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="BillAmount"
                          value={formData.BillAmount}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Total Received Amt</label>
                        <input
                          type="number"
                          name="Amount"
                          className="form-control form-control-sm text-end"
                          value={formData.Amount}
                          onChange={handleChange}
                          disabled={true}
                        />
                      </div>
                      {/* <div className="col-md-2">
                        <label className="form-label">Balance Amt</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="BalanceAmt"
                          value={formData.BalanceAmt}
                          onChange={handleChange}
                          disabled
                        />
                      </div> */}
                      {
                        <div className="col-md-1">
                          <label className="form-label">Disc %</label>
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            name="Desc"
                            value={formData.Desc}
                            onChange={(e) => {
                              let descAmt =
                                (formData.BillAmount * e.target.value) / 100;
                              setFormData((prev) => ({
                                ...prev,
                                DiscAmt: descAmt,
                              }));
                              handleChange(e);
                            }}
                            disabled={modalType === "view" || (modalType === "edit" && !showSaveBtnEdit)}
                          />
                        </div>
                      }
                      {
                        <div className="col-md-2">
                          <label className="form-label">Disc Amount</label>
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            value={formData.DiscAmt}
                            name="DiscAmt"
                            onChange={(e) => {
                              let discPer =
                                (e.target.value * 100) / formData.BillAmount;
                              setFormData((prev) => ({
                                ...prev,
                                Desc: discPer,
                              }));
                              handleChange(e);
                            }}
                            disabled={modalType === "view" || (modalType === "edit" && !showSaveBtnEdit)}
                          />
                        </div>
                      }
                      {/* <div className="col-md-1">
                        <label className="form-label">TDS</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="TDS"
                          value={formData.TDS}
                          onChange={handleChange}
                          disabled={modalType === "view"}
                        />
                      </div> */}
                      {/* <div className="col-md-1">
                        <label className="form-label">Adjustment</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="AdjAmt"
                          value={formData.AdjAmt}
                          onChange={handleChange}
                          disabled={modalType === "view"}
                        />
                      </div> */}
                      <div className="col-md-2 ">
                        <label className="form-label "> Actual Receipt</label>
                        <input
                          name="Amount"
                          type="number"
                          className="form-control form-control-sm text-end"
                          // value={formData.Amount}
                          value={currentPayment.toFixed(2)}
                          onChange={handleChange}
                          disabled={modalType === "view" || (modalType === "edit" && !showSaveBtnEdit)}
                        />
                      </div>
                    </div>
                  )}

                  {/* --------------------------------------------------------- */}

                  {/* Payment Details */}
                  <h6 className="fw-bold pb-1 mt-4 mb-3" style={{ color: "#1a237e", borderBottom: "2px solid #3f51b5" }}>
                    💰 Payment Breakdown
                    {allPreviouseReceipts.length > 0 && (
                      <span className="badge ms-2" style={{ background: "#3f51b5", fontSize: "11px", verticalAlign: "middle" }}>
                        MR #{modalType === "add" ? allPreviouseReceipts.length + 1 : (() => { const idx = allPreviouseReceipts.findIndex(r => r.ReceiptId === formData.ReceiptId); return idx >= 0 ? idx + 1 : allPreviouseReceipts.length; })()}
                      </span>
                    )}
                  </h6>

                  {/* Premium Payment Flow Card */}
                  <div
                    className="mb-3"
                    style={{
                      borderRadius: "24px",
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: calculatedDueAmount <= 0
                        ? "0 20px 60px rgba(5,150,105,0.4), 0 0 0 1px rgba(52,211,153,0.2)"
                        : "0 20px 60px rgba(108,92,231,0.4), 0 0 0 1px rgba(108,92,231,0.2)",
                    }}
                  >
                    {/* Glass Background */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: calculatedDueAmount <= 0
                        ? "linear-gradient(160deg, #0d3320 0%, #064e3b 20%, #047857 45%, #059669 70%, #34d399 100%)"
                        : "linear-gradient(160deg, #0f0c29 0%, #1a1a4e 20%, #302b63 45%, #4834d4 70%, #6c5ce7 100%)",
                    }}></div>
                    {/* Animated gradient overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)",
                    }}></div>
                    {/* Mesh dots pattern */}
                    <div style={{
                      position: "absolute", inset: 0, opacity: 0.03,
                      backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}></div>

                    {/* Full Paid Notification */}
                    {calculatedDueAmount <= 0 && (
                      <div style={{
                        position: "relative",
                        background: "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02), rgba(255,255,255,0.1))",
                        padding: "14px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(10px)",
                      }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 12px #34d399", animation: "blink 1.5s infinite" }}></div>
                        <span style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", color: "#ecfdf5" }}>PAYMENT COMPLETE • ZERO DUE</span>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 12px #34d399", animation: "blink 1.5s infinite 0.75s" }}></div>
                      </div>
                    )}

                    <div style={{ position: "relative", padding: "24px 28px" }}>
                      {/* Flow Items */}
                      <div className="d-flex align-items-center justify-content-center flex-wrap" style={{ gap: "16px" }}>
                        
                        {/* Bill Amount */}
                        <div className="text-center" style={{ minWidth: "100px" }}>
                          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Bill Amount</div>
                          <div style={{
                            fontSize: "28px", fontWeight: 900, color: "#fff",
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: "16px",
                            padding: "10px 20px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            backdropFilter: "blur(4px)",
                            lineHeight: 1.2,
                          }}>
                            ₹{Number(formData.BillAmount || 0).toLocaleString()}
                          </div>
                          {Number(formData.DiscAmt || 0) > 0 && (
                            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", marginTop: "5px" }}>
                              Disc {Number(formData.Desc || 0).toFixed(0)}% = ₹{Number(formData.DiscAmt || 0).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* Prev Paid */}
                        {previousPaid > 0 && (
                          <>
                            <div style={{ fontSize: "24px", fontWeight: 300, color: "rgba(255,255,255,0.3)" }}>−</div>
                            <div className="text-center" style={{ minWidth: "80px" }}>
                              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Prev Paid</div>
                              <div style={{
                                fontSize: "20px", fontWeight: 800, color: "#fff",
                                background: "rgba(168,85,247,0.2)",
                                borderRadius: "12px",
                                padding: "8px 14px",
                                border: "1px dashed rgba(168,85,247,0.4)",
                                lineHeight: 1.2,
                              }}>
                                ₹{previousPaid.toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Current Payment */}
                        {currentPayment > 0 && (
                          <>
                            <div style={{ fontSize: "24px", fontWeight: 300, color: "rgba(255,255,255,0.3)" }}>−</div>
                            <div className="text-center" style={{ minWidth: "80px" }}>
                              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Now Paying</div>
                              <div style={{
                                fontSize: "20px", fontWeight: 800, color: "#fff",
                                background: "rgba(56,189,248,0.2)",
                                borderRadius: "12px",
                                padding: "8px 14px",
                                border: "1px solid rgba(56,189,248,0.4)",
                                boxShadow: "0 0 20px rgba(56,189,248,0.15)",
                                lineHeight: 1.2,
                              }}>
                                ₹{currentPayment.toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}

                        {/* New Discount */}
                        {additionalDueAmt > 0 && (
                          <>
                            <div style={{ fontSize: "24px", fontWeight: 300, color: "rgba(255,255,255,0.3)" }}>−</div>
                            <div className="text-center" style={{ minWidth: "80px" }}>
                              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Discount</div>
                              <div style={{
                                fontSize: "20px", fontWeight: 800, color: "#fff",
                                background: "rgba(251,146,60,0.2)",
                                borderRadius: "12px",
                                padding: "8px 14px",
                                border: "1px dashed rgba(251,146,60,0.5)",
                                lineHeight: 1.2,
                              }}>
                                ₹{additionalDueAmt.toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Result */}
                        <div style={{ fontSize: "24px", fontWeight: 300, color: "rgba(255,255,255,0.3)" }}>=</div>
                        <div className="text-center" style={{ minWidth: "110px" }}>
                          <div style={{
                            fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px",
                            color: calculatedDueAmount <= 0 ? "#6ee7b7" : "#fca5a5",
                          }}>
                            {calculatedDueAmount <= 0 ? "PAID IN FULL" : "BALANCE DUE"}
                          </div>
                          <div
                            style={{
                              fontSize: "30px",
                              fontWeight: 900,
                              color: "#fff",
                              background: calculatedDueAmount <= 0
                                ? "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.15))"
                                : "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(248,113,113,0.15))",
                              borderRadius: "16px",
                              padding: "10px 22px",
                              border: `2px solid ${calculatedDueAmount <= 0 ? "rgba(52,211,153,0.5)" : "rgba(248,113,113,0.5)"}`,
                              boxShadow: calculatedDueAmount <= 0
                                ? "0 8px 30px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                                : "0 8px 30px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                              lineHeight: 1.2,
                            }}
                          >
                            ₹{Math.max(0, calculatedDueAmount).toLocaleString()}
                          </div>
                        </div>

                        {/* Add Payment - only when due > 0 */}
                        {isDueAmountPositive && modalType !== "view" && (
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={addPaymentMethod}
                              style={{
                                borderRadius: "30px",
                                padding: "10px 22px",
                                fontWeight: 800,
                                fontSize: "11px",
                                background: "rgba(255,255,255,0.95)",
                                color: "#312e81",
                                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                                border: "none",
                                letterSpacing: "0.5px",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                            >
                              + ADD PAYMENT
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <style>{`
                    @keyframes blink {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.3; }
                    }
                  `}</style>

                  {/* Previous MR History Preview */}
                  {allPreviouseReceipts.length > 0 && (
                    <div
                      className="mb-3"
                      style={{
                        background: "#f8f9fa",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: "linear-gradient(90deg, #1a237e, #3f51b5)",
                          color: "#fff",
                          padding: "8px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>📋 Payment History ({allPreviouseReceipts.length} Receipt{allPreviouseReceipts.length > 1 ? "s" : ""})</span>
                        <span style={{ opacity: 0.8, fontSize: "11px" }}>Case: {formData.ReffId}</span>
                      </div>
                      <div style={{ padding: "8px 12px", maxHeight: "140px", overflowY: "auto" }}>
                        {allPreviouseReceipts.map((r, idx) => {
                          const isCurrent = r.ReceiptId === formData.ReceiptId;
                          return (
                            <div
                              key={r.ReceiptId || idx}
                              className="d-flex align-items-center justify-content-between"
                              style={{
                                padding: "5px 10px",
                                marginBottom: "4px",
                                borderRadius: "8px",
                                background: isCurrent ? "#e3f2fd" : "#fff",
                                border: isCurrent ? "1.5px solid #2196f3" : "1px solid #eee",
                                fontSize: "12px",
                                transition: "all 0.2s",
                              }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  style={{
                                    background: isCurrent ? "#2196f3" : "#9e9e9e",
                                    color: "#fff",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                <span style={{ fontWeight: isCurrent ? 700 : 500 }}>
                                  {r.ReceiptNo || "—"}
                                </span>
                                <span style={{ color: "#888", fontSize: "11px" }}>
                                  {r.ReceiptDate ? r.ReceiptDate.slice(0, 10).split("-").reverse().join("/") : ""}
                                </span>
                                {isCurrent && <span className="badge bg-primary" style={{ fontSize: "9px" }}>Current</span>}
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ fontWeight: 700, color: "#2e7d32" }}>₹{Number(r.Amount || 0).toFixed(0)}</span>
                                {Number(r.DiscAmt || 0) > 0 && (
                                  <span style={{ fontSize: "10px", color: "#e65100", background: "#fff3e0", padding: "1px 6px", borderRadius: "4px" }}>
                                    Disc: ₹{Number(r.DiscAmt).toFixed(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {/* Force Unlock Warning */}
                  {forceUnlock && (
                    <div
                      className="alert d-flex align-items-center gap-2 mb-3"
                      style={{
                        background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "12px 18px",
                        fontWeight: 600,
                        fontSize: "13px",
                        boxShadow: "0 4px 16px rgba(255,152,0,0.4)",
                        border: "1.5px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>⚠️</span>
                      <span>Payment section unlocked! Please change the amount carefully.</span>
                      <button
                        type="button"
                        className="btn btn-sm ms-auto"
                        style={{ background: "rgba(255,255,255,0.9)", color: "#e65100", fontWeight: 700, borderRadius: "8px", fontSize: "11px" }}
                        onClick={() => setForceUnlock(false)}
                      >
                        🔒 Lock Again
                      </button>
                    </div>
                  )}

                  {/* Multiple Payment Methods - Show locked when due <= 0 */}
                  {refundMode == 0
                    ? paymentMethods.map((payment, index) => {
                        const isLocked = (calculatedDueAmount <= 0 && !forceUnlock) || (modalType === "edit" && !showSaveBtnEdit);
                        const canUnlock = calculatedDueAmount <= 0 && !forceUnlock && modalType === "edit" && showSaveBtnEdit;
                        return (
                        <div key={index} className="payment-card card mb-3" style={{
                          borderRadius: "14px",
                          border: isLocked ? "1.5px solid #e0e0e0" : "1.5px solid #c5cae9",
                          overflow: "hidden",
                          opacity: isLocked ? 0.55 : 1,
                          pointerEvents: isLocked ? "none" : "auto",
                          position: "relative",
                          boxShadow: isLocked ? "none" : "0 4px 16px rgba(63,81,181,0.1)",
                          transition: "all 0.4s ease",
                        }}>
                          {isLocked && (
                            <div style={{
                              position: "absolute", inset: 0, zIndex: 2,
                              background: "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.015) 10px, rgba(0,0,0,0.015) 20px)",
                              borderRadius: "14px",
                              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px",
                            }}>
                              <span style={{ background: "rgba(0,0,0,0.7)", color: "#fff", padding: "6px 18px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px" }}>
                                🔒 LOCKED — NO DUE
                              </span>
                              {canUnlock && (
                                <button
                                  type="button"
                                  style={{ pointerEvents: "auto", background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "#fff", border: "none", borderRadius: "20px", padding: "6px 16px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                  onClick={() => {
                                    setForceUnlock(true);
                                    toast.warn("⚠️ Payment section unlocked! You can now increase or decrease the amount.", { autoClose: 4000 });
                                  }}
                                >
                                  🔓 Unlock to Edit
                                </button>
                              )}
                            </div>
                          )}
                          <div className="card-header d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #e8eaf6, #f5f5f5)", padding: "10px 16px" }}>
                            <small className="mb-0 fw-bold" style={{ color: "#3f51b5" }}>
                              Payment #{index + 1}
                            </small>
                            {paymentMethods.length > 1 &&
                              modalType !== "view" && !isLocked && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  style={{ borderRadius: "8px" }}
                                  onClick={() => removePaymentMethod(index)}
                                >
                                  <i className="fa-light fa-trash-can"></i>
                                </button>
                              )}
                          </div>
                          <div className="card-body" style={{ padding: "14px 16px" }}>
                            <div className="row g-3">
                              <div className="col-md-2">
                                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#455a64" }}>
                                  Payment Type
                                </label>
                                <select
                                  className="form-control form-control-sm"
                                  value={payment.type}
                                  onChange={(e) =>
                                    updatePaymentMethod(index, "type", e.target.value)
                                  }
                                  disabled={modalType === "view"}
                                  style={{ borderRadius: "8px" }}
                                >
                                  <option value="0">CASH</option>
                                  <option value="1">BANK</option>
                                  <option value="2">CHEQUE</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#455a64" }}>Amount</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={payment.amount}
                                  onChange={(e) => {
                                    updatePaymentMethod(index, "amount", refundMode === 1 ? e.target.value * -1 : e.target.value);
                                  }}
                                  disabled={modalType === "view"}
                                  style={{ borderRadius: "8px" }}
                                />
                              </div>
                              {payment.type === "1" && (
                                <>
                                  <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#455a64" }}>UPI App</label>
                                    <input className="form-control form-control-sm" value={payment.upiApp} placeholder="PHONE PE" onChange={(e) => updatePaymentMethod(index, "upiApp", e.target.value)} disabled={modalType === "view"} style={{ borderRadius: "8px" }} />
                                  </div>
                                  <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#455a64" }}>UTR Number</label>
                                    <input className="form-control form-control-sm" value={payment.utrNumber} placeholder="211839452746" onChange={(e) => updatePaymentMethod(index, "utrNumber", e.target.value)} disabled={modalType === "view"} style={{ borderRadius: "8px" }} />
                                  </div>
                                </>
                              )}
                              {payment.type === "2" && (
                                <>
                                  <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#455a64" }}>Bank Name</label>
                                    <input className="form-control form-control-sm" value={payment.bankName} onChange={(e) => updatePaymentMethod(index, "bankName", e.target.value)} disabled={modalType === "view"} style={{ borderRadius: "8px" }} />
                                  </div>
                                  <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#455a64" }}>Cheque Number</label>
                                    <input className="form-control form-control-sm" value={payment.chequeNumber} onChange={(e) => updatePaymentMethod(index, "chequeNumber", e.target.value)} disabled={modalType === "view"} style={{ borderRadius: "8px" }} />
                                  </div>
                                </>
                              )}
                              {payment.type === "0" && (
                                <div className="col-md-4">
                                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "#455a64" }}>Cash Payment</label>
                                  <input className="form-control form-control-sm" value="Cash Payment" readOnly style={{ borderRadius: "8px", background: "#f5f5f5" }} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );})
                    : paymentMethods.map((payment, index) => (
                        <div key={index} className="payment-card card mb-3">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <small className="mb-0 fw-bold">
                              Payment #{index + 1}
                            </small>
                            {paymentMethods.length > 1 &&
                              modalType !== "view" && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removePaymentMethod(index)}
                                >
                                  <i className="fa-light fa-trash-can"></i>
                                </button>
                              )}
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-2">
                                <label className="form-label">
                                  Payment Type
                                </label>
                                <select
                                  className="form-control"
                                  value={payment.type}
                                  onChange={(e) =>
                                    updatePaymentMethod(
                                      index,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  disabled={modalType === "view"}
                                >
                                  <option value="0">CASH</option>
                                  <option value="1">UPI/PHONE PE</option>
                                  <option value="2">CHEQUE</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <label className="form-label">Amount</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={payment.amount}
                                  onChange={(e) => {
                                    updatePaymentMethod(
                                      index,
                                      "amount",
                                      refundMode === 1
                                        ? payment.amount < 0
                                          ? e.target.value
                                          : e.target.value * -1
                                        : e.target.value
                                    );
                                    //  console.log("value",e.target.value)
                                  }}
                                  disabled={modalType === "view"}
                                />
                              </div>

                              {/* Conditional fields based on payment type */}
                              {payment.type === "1" && (
                                <>
                                  <div className="col-md-2">
                                    <label className="form-label">
                                      UPI App
                                    </label>
                                    <input
                                      className="form-control"
                                      value={payment.upiApp}
                                      placeholder="PHONE PE - RAHUL BAR"
                                      onChange={(e) =>
                                        updatePaymentMethod(
                                          index,
                                          "upiApp",
                                          e.target.value
                                        )
                                      }
                                      disabled={modalType === "view"}
                                    />
                                  </div>
                                  <div className="col-md-2">
                                    <label className="form-label">
                                      UTR Number
                                    </label>
                                    <input
                                      className="form-control"
                                      value={payment.utrNumber}
                                      placeholder="211839452746"
                                      onChange={(e) =>
                                        updatePaymentMethod(
                                          index,
                                          "utrNumber",
                                          e.target.value
                                        )
                                      }
                                      disabled={modalType === "view"}
                                    />
                                  </div>
                                </>
                              )}

                              {payment.type === "2" && (
                                <>
                                  <div className="col-md-2">
                                    <label className="form-label">
                                      Bank Name
                                    </label>
                                    <input
                                      className="form-control"
                                      value={payment.bankName}
                                      onChange={(e) =>
                                        updatePaymentMethod(
                                          index,
                                          "bankName",
                                          e.target.value
                                        )
                                      }
                                      disabled={modalType === "view"}
                                    />
                                  </div>
                                  <div className="col-md-2">
                                    <label className="form-label">
                                      Cheque Number
                                    </label>
                                    <input
                                      className="form-control"
                                      value={payment.chequeNumber}
                                      onChange={(e) =>
                                        updatePaymentMethod(
                                          index,
                                          "chequeNumber",
                                          e.target.value
                                        )
                                      }
                                      disabled={modalType === "view"}
                                    />
                                  </div>
                                </>
                              )}

                              {payment.type === "0" && (
                                <div className="col-md-4">
                                  <label className="form-label">
                                    Cash Payment
                                  </label>
                                  <input
                                    className="form-control"
                                    value="Cash Payment"
                                    readOnly
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  {/* ======================================================= */}

                  {/* {modalType == "edit" && histData.length != 0 && (
                    <div className="mb-3">
                      <div className="container mt-4">
                        <h5 className="mb-3">History</h5>

                        <table className="table table-bordered table-hover table-striped ">
                          <thead className="">
                            <tr>
                              <th>Date</th>
                              <th>Receipt No</th>
                              <th className="text-start">Transactions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {histData.map((item, i) => (
                              <tr
                                key={i}
                                className={
                                  formData.ReceiptNo == item.ReceiptNo
                                    ? `table-success`
                                    : ``
                                }
                              >
                                <td>
                                  {item.ReceiptDate?.split("T")[0]
                                    ?.split("-")
                                    ?.reverse()
                                    .join("/") || ""}
                                </td>
                                <td>{item.ReceiptNo || ""}</td>
                                <td>
                                  {item.paymentMethods?.map((value, idx) => (
                                    <div
                                      className={
                                        idx != item.paymentMethods.length - 1
                                          ? `border-bottom border-1 py-2 text-start`
                                          : `py-2 text-start`
                                      }
                                      key={idx}
                                    >
                                      Method: {value.method || ""}, Amount:{" "}
                                      {value.amount || "0"}
                                    </div>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )} */}

                  <div className="mb-2 p-3" style={{ background: "#f8f9fa", borderRadius: "10px", border: "1px solid #e0e0e0" }}>
                    <label className="form-label" style={{ fontWeight: 600, color: "#455a64", fontSize: "12px" }}>📝 Narration</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      name="Narration"
                      value={formData.Narration}
                      disabled={modalType === "view" || (modalType === "edit" && !showSaveBtnEdit)}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", border: "1px solid #cfd8dc" }}
                    ></textarea>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-2 mt-2 mb-3 p-3" style={{ background: "linear-gradient(135deg, #f5f5f5, #eeeeee)", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
                    <button
                      className="btn w-50"
                      style={{ background: "linear-gradient(135deg, #546e7a, #37474f)", color: "#fff", fontWeight: 600, borderRadius: "10px", padding: "10px", fontSize: "14px", boxShadow: "0 4px 12px rgba(84,110,122,0.3)" }}
                      onClick={() => {
                        setRefundMode(0);
                        setShowDrawer(false);
                        setShowDisc(false);
                      }}
                    >
                      ✖ Cancel
                    </button>

                    {modalType !== "view" && (
                      <>
                        {modalType == "add" && (
                          <button
                            onClick={handleSave}
                            className="btn w-50"
                            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", fontWeight: 700, borderRadius: "10px", padding: "10px", fontSize: "14px", boxShadow: "0 4px 15px rgba(102,126,234,0.4)", border: "none" }}
                          >
                            💾 Save
                          </button>
                        )}

                        {modalType == "edit" && showSaveBtnEdit && (
                          <button
                            onClick={handleSave}
                            className="btn w-50"
                            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", fontWeight: 700, borderRadius: "10px", padding: "10px", fontSize: "14px", boxShadow: "0 4px 15px rgba(102,126,234,0.4)", border: "none" }}
                          >
                            💾 Save
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (refundMode == 0 && modalType != "add") {
                              handlePrint();
                            } else if (refundMode == 1 && modalType != "add") {
                              let testData = tests.map((item, i) => {
                                return {
                                  slNo: i + 1,
                                  name: testsMap[item.TestId] || "",
                                  deliveryDate: item.DeliveryDate,
                                  time: item.DeliveryTime,
                                  amount: item.CancelTast == 1 ? 0 : item.Rate,
                                  CancelTast: item.CancelTast,
                                };
                              });

                              console.log("test arr: ", paymentMethods);
                              console.log("formData: ", formData);
                              console.log("prev data: ", allPrevReceipts);
                              const receiptData = {
                                clinicName: "LORDS DIAGNOSTIC",
                                address: "13/3, CIRCULAR 2ND BYE LANE,",
                                receiptType: "Money Refund",

                                patientDetails: {
                                  receiptNo: formData.ReceiptNo || "",
                                  receiptDate:
                                    formData.ReceiptDate?.split("T")[0]
                                      .split("-")
                                      ?.reverse()
                                      .join("/") || "",
                                  caseNo: "OP/2526/00008",
                                  caseDate:
                                    formData.CaseDate?.split("T")[0]
                                      .split("-")
                                      ?.reverse()
                                      .join("/") || "",
                                  bedNo: "",
                                  patientName: formData.PatientName || "",
                                  age: formData.Age || "",
                                  sex: formData.Sex || "",
                                  referredBy:
                                    doctorMap[formData.DoctorId] || "",
                                  phoneNo: formData.Phone || "",
                                },

                                tests: testData,

                                billing: {
                                  total: formData.BillAmount,
                                  advance: formData.Amount || 0,
                                  refundAmount:
                                    paymentMethods[0].amount * -1 || 0,
                                  paymentStatus: "Full & Final Payment.",
                                  dueAmount: calculatedDueAmount * -1 || 0,
                                },

                                footer: {
                                  receivedBy: "Admin",
                                  billTime: "",
                                  remarks: "",
                                  deliveryNote:
                                    "Report will be delivered between 07:00 PM(Same Day), Next day between",
                                  greeting: "WE CARE FOR YOUR HEALTH",
                                  signatory: "OFFICE MANAGER",
                                },
                              };
                              setTimeout(
                                () => {
                                  handleRefundPdf(receiptData);
                                },

                                1000
                              );
                            }
                          }}
                          className="btn w-50"
                          style={{ background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "#fff", fontWeight: 700, borderRadius: "10px", padding: "10px", fontSize: "14px", boxShadow: "0 4px 15px rgba(255,152,0,0.4)", border: "none" }}
                        >
                          🖨️ Print
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      {/* Patient Search Modal */}
      {showPatientModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 10000 }}
          ></div>
          <div className="modal d-block" style={{ zIndex: 10001 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)", color: "#fff", border: "none", padding: "16px 24px" }}>
                  <h5 className="modal-title" style={{ fontWeight: 700, letterSpacing: "0.5px" }}>👤 Select Patient</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowPatientModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control form-control-sm mb-3"
                    placeholder="Search by Case ID or Patient Name..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      fetchPatients(e.target.value);
                    }}
                  />
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>Case ID</th>
                          <th>Patient Name</th>
                          <th>Age</th>
                          <th>Actionnn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center">
                              No patients found
                            </td>
                          </tr>
                        ) : (
                          patients.map((p) => (
                            <tr key={p.CaseId}>
                              <td>{p.CaseId}</td>
                              <td>{p.PatientName}</td>
                              <td>{p.Age}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    // console.log("P", p);
                                    fetchAllPrevRecep(p.CaseId);
                                    setFormData((prev) => ({
                                      ...prev,
                                      ReffId: p.CaseId,
                                      BillAmount: p.GrossAmt || 0,
                                      BalanceAmt: p.GrossAmt || 0,
                                      Amount: 0,
                                      PatientName: p.PatientName || "",
                                      Age: p.Age || "",
                                      Sex: p.Sex || "",
                                      CaseDate: p.CaseDate?.slice(0, 10) || "",
                                      DiscAmt: showDisc ? p.DescAmt : 0 || 0,
                                      Desc: showDisc ? p.Desc : 0 || 0,
                                    }));
                                    setShowPatientModal(false);
                                    setPatientSearch("");
                                  }}
                                >
                                  Select
                                </button>
                              </td>
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
        </>
      )}

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 99999 }}
        ></div>
      )}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-light fa-triangle-exclamation me-2"></i>
                  Confirm Delete
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>

              <div className="modal-body text-center">
                <p className="fs-6 mb-1">
                  Are you sure you want to delete this?
                </p>
                <p className="text-muted">This cannot be undone.</p>
              </div>

              <div className="modal-footer d-flex justify-content-center gap-3">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger px-4" onClick={confirmDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3 mb-3">
        <ul className="pagination pagination-sm" style={{ gap: "4px" }}>
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" style={{ borderRadius: "8px", fontWeight: 600 }} onClick={() => goToPage(page - 1)}>
              ◀ Prev
            </button>
          </li>
          <button className="page-link" style={{ borderRadius: "8px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", fontWeight: 700, border: "none", padding: "6px 16px" }}>{`${page} / ${totalPages}`}</button>
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" style={{ borderRadius: "8px", fontWeight: 600 }} onClick={() => goToPage(page + 1)}>
              Next ▶
            </button>
          </li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default MoneyReceipt;
