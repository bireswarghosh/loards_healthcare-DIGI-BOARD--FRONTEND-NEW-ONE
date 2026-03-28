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
    new Date().toISOString().slice(0, 10),
  );
  // const [dateTo, setDateTo] = useState("2025-02-22");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [allReceipt, setAllReceipt] = useState(true);
  const [refund, setRefund] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // useEffect(() => {
  //   console.log("I am changed:", allPreviouseReceipts);

  // }, [allPreviouseReceipts]);

  // this is used for calculating discount and deduct it from the due the amount
  useEffect(() => {
    let n = allPreviouseReceipts.length; // this is the length of the allPreviouseReceipts array
    if (formData?.ReffId && n != 0) {
      console.log("This is modal type", modalType);
      console.log("this is changed form data", formData);
      console.log("this is changed prev recp:", allPreviouseReceipts);

      // if only one mr present then only 1st mr exists
      if (n == 1) {
        // if you are editing 1st mr then this will run
        if (modalType == "edit") {
          setAdditionalDueAmt(0);
          return;
        }
        // if you are add 2nd mr then this will run
        else {
          setAdditionalDueAmt(formData.DiscAmt);
          return;
        }
      } else if (n > 1) {
        console.log("hoooo");
        let lastEle = allPreviouseReceipts[n - 1]; // this is the last element of allPreviouseReceipts and this is the 1st mr

        // if the selected mr is the 1st mr
        if (lastEle.ReceiptId == formData.ReceiptId) {
          setAdditionalDueAmt(0);
          return;
        }

        // if the selected mr is not the 1st mr

        // if the selected mr is 2nd mr
        if (formData.ReceiptId == allPreviouseReceipts[n - 2].ReceiptId) {
          setAdditionalDueAmt(Number(formData.DiscAmt));
          return;
        }
        // if the selected mr is from 3rd mr to more than that then we will calculate it from 2nd to the selected one in edit mode and 2nd to last mr in add mode
        else {
          // if the modal is in edit mode
          if (modalType == "edit") {
            let idxSel; // this is the index of the selected mr

            // this loop will find the index of the selected mr from the allPreviouseReceipts array
            for (let i = 0; i < n; i++) {
              if (formData.ReceiptId == allPreviouseReceipts[i].ReceiptId) {
                idxSel = i;
                break;
              }
            }

            console.log("idx of sel:", idxSel);
            let sum = 0;
            // this loop will calculate the sum of the DiscAmt from the seleceted mr to the 2nd mr
            for (let i = idxSel + 1; i < n - 1; i++) {
              sum += Number(allPreviouseReceipts[i].DiscAmt || 0);
            }
            console.log("sum is :", sum);
            setAdditionalDueAmt(Number(formData.DiscAmt) + sum);
            return;
          }

          // if the type of the modal is add then we will calculate it from 2nd mr to the last mr
          let sum = 0;
          // this loop will calculate the sum of the DiscAmt from the last mr to the 2nd mr
          for (let i = 0; i < n - 1; i++) {
            sum += Number(allPreviouseReceipts[i].DiscAmt || 0);
          }
          console.log("sum is :", sum);
          setAdditionalDueAmt(Number(formData.DiscAmt) + sum);
          return;
        }
      }
    }
    // console.log("hello",receipts)
  }, [formData.ReffId, allPreviouseReceipts, modalType, formData.DiscAmt]);

  // useEffect(() => {
  //   console.log("additionalDueAmt", additionalDueAmt);
  // }, [additionalDueAmt]);

  useEffect(() => {
    fetchReceipts(page, showRec);

    if (searchTerm.trim()) {
      fetchPatients();
    }
    fetchUsers();
  }, [page, startDate, endDate, searchTerm, showRec]);

  useEffect(() => {
    if (!showDrawer) {
      setHistData([]);
      setAllPreviouseReceipts([]);
      setAdditionalDueAmt(0);
    }
  }, [showDrawer]);

  useEffect(() => {
    let totalPaid = 0;
    if (allPrevReceipts.length != 0) {
      totalPaid = allPrevReceipts.reduce(
        (acc, item) => acc + Number(item.Amount || 0),
        0,
      );

      setFormData((prev) => ({
        ...prev,
        Amount: totalPaid,
      }));
    }
    // console.log("Total paid: ", totalPaid);
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
          (prevItem) => JSON.stringify(prevItem) === JSON.stringify(latestItem),
        ),
    );
  }

  // this is will work only for add, this will fetch all the moneyreceipts by reffId
  const fetchAllPrevRecep = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/money-receipt01/search?ReffId=${id}`,
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
        `/money-receipt01/search?ReffId=${id}`,
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
        // console.log("data", data[0]);
        if (data[0].ReceiptId == ReceiptId && calculatedDueAmount != 0) {
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
            data[j].paymentMethods,
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
        `/money-receipt01/search?ReceiptNo=${encodeURIComponent(receiptNo)}`,
      );

      if (res.data.success && res.data.data?.length) {
        const receipt = res.data.data[0];

        // Load payment methods if exists
        if (
          receipt.paymentMethods &&
          Array.isArray(receipt.paymentMethods) &&
          receipt.paymentMethods.length > 0
        ) {
          const loadedMethods = receipt.paymentMethods.map((pm) => ({
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
        } else {
          // Default: show old payment method data or empty cash payment

          let data = [];

          if (receipt?.ReffId) {
            const res1 = await axiosInstance.get(
              `/money-receipt01/search?ReffId=${receipt?.ReffId}`,
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

          // console.log("Sum is : ", sum);
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
            Amount: sum || 0,
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

        setFormData({
          ReceiptId: receipt.ReceiptId,
          ReceiptNo: receipt.ReceiptNo || "",
          ReffId: receipt.ReffId || "",
          ReceiptDate: receipt.ReceiptDate?.slice(0, 10) || "",
          BillAmount: receipt.BillAmount || 0,
          BalanceAmt: receipt.BalanceAmt || 0,
          Amount: receipt.Amount || 0,
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
        0,
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
          payload,
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
        `/money-receipt01/search?ReceiptNo=${encodeURIComponent(searchTerm.trim())}&page=1&limit=${limit}`,
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
    modalType != "add"
      ? 0
      : paymentMethods.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const totalReceivedAmount = currentPayment;

  const calculatedDueAmount = billAmount - previousPaid - totalReceivedAmount;
  // const calculatedDueAmount = billAmount - previousPaid - totalReceivedAmount - formData.DiscAmt;
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
    [formData.ReffId],
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
    const testsPerPage = 9;

    const pages = [];
    for (let i = 0; i < tests.length; i += testsPerPage) {
      pages.push(tests.slice(i, i + testsPerPage));
    }

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
`,
          )
          .join("");

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
<span class="patient-value">${doctorMap[formData.DoctorId] || ""}</span>
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

</tbody>

<tfoot>

<tr>
<td></td>
<td colspan="2" style="text-align:right;font-weight:bold;">
Total Test Amount :
</td>
<td style="text-align:right;font-weight:bold, margin-top:2px;">
${runningTotal}
</td>
</tr>

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
<td></td>
<td colspan="2" style="text-align:right;font-weight:bold;">
Paid Amount :
</td>
<td style="text-align:right;font-weight:bold;">
${formData.Amount || 0}
</td>
</tr>

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

body{
font-family: Arial, sans-serif;
font-size:10px;
margin:0;
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
font-size:15px;
font-weight:bold;
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
font-size:12px;
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
font-size:10px;
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
font-size:10px;
}

td{
border-left:1px solid #333;
border-right:1px solid #333;
padding:3px;
font-size:10px;
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
font-size:9px;
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
          `,
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
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>Sample Receipt222</h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => openDrawer(null, "add")}
            >
              <i className="fa fa-plus me-2"></i>Add Receipt
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                // setRefund(1)
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
          <div className="panel border rounded p-3 mb-3">
            <div className="row g-3  align-items-center justify-content-center">
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
            // <div className="text-center py-5">
            //   <div className="spinner-border text-primary"></div>
            // </div>
            <div>
              <div className="spinner-grow text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-dark" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-striped table-hover table-dashed">
                <thead>
                  <tr>
                    <th>Actionkkkk 20.00</th>
                    <th>Sl No</th>
                    <th>Receipt No</th>
                    <th>Receipt Date</th>
                    <th>Patient Name</th>
                    <th className="text-end">Bill Amount</th>
                    <th>Receipt</th>
                    <th>Reff No</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    receipts.map((r, index) => (
                      <tr key={r.MoneyreeciptId || index}>
                        <td>
                          <div className="d-flex gap-2">
                            {/* <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openDrawer(r, "view")}
                            >
                              <i className="fa-light fa-eye"></i>
                            </button> */}

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                // console.log("row is: ", r);
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

                            {/* <button
                              className="btn btn-sm btn-outline-danger"
                              // onClick={() => handleDelete(r.MoneyreeciptId)}
                               onClick={() => {
                                setDeleteId(r.MoneyreeciptId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button> */}
                          </div>
                        </td>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{r.ReceiptNo}</td>
                        <td>
                          {r.ReceiptDate
                            ? new Date(r.ReceiptDate).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>{r.PatientName || "-"}</td>
                        {/* <td className="text-end">{r.BillAmount?.toFixed(2)}</td> */}
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
              maxWidth: "950px",
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
                  padding: "5px",
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
                <div className="mx-3">
                  {/* Row 1 */}
                  <div className="row g-2 mb-1 align-items-end">
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
                  <div className="row g-2 mb-1">
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
                  <div className="row g-2 mb-1">
                    <div className="col-md-2">
                      <label className="form-label">Received By</label>
                      <select
                        className="form-control form-control-sm"
                        name="UserId"
                        value={formData.UserId || ""}
                        onChange={handleChange}
                        disabled={modalType === "view"}
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
                    <div className="row g-2 mb-2">
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
                    <div className="row g-2 mb-2">
                      <div className="col-md-1">
                        <label className="form-label">Bill Amt</label>
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
                            disabled={modalType === "view"}
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
                            disabled={modalType === "view"}
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
                          disabled={modalType === "view"}
                        />
                      </div>
                    </div>
                  )}

                  {/* --------------------------------------------------------- */}

                  {/* Payment Details */}
                  <h6 className="text-primary fw-bold border-bottom pb-1 mt-4 mb-3">
                    Payment
                  </h6>

                  {/* Payment Summary */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-2">
                      <label className="form-label">Total Bill Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.BillAmount || 0}
                        disabled
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Previous Paid</label>
                      <input
                        type="number"
                        className="form-control"
                        value={previousPaid.toFixed(2)}
                        readOnly
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Current Payment</label>
                      <input
                        type="number"
                        className="form-control"
                        value={currentPayment.toFixed(2)}
                        readOnly
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Total Received</label>
                      <input
                        type="number"
                        className="form-control"
                        value={totalReceivedAmount.toFixed(2)}
                        readOnly
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Due Amount</label>

                      <input
                        type="number"
                        className="form-control text-danger fw-bold"
                        // value={calculatedDueAmount.toFixed(2)}

                        value={
                          Number(calculatedDueAmount.toFixed(2)) -
                          additionalDueAmt
                        }
                        readOnly
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label d-block">&nbsp;</label>
                      {isDueAmountPositive && modalType !== "view" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success w-100"
                          onClick={addPaymentMethod}
                        >
                          + Add Payment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multiple Payment Methods */}
                  {refundMode == 0
                    ? calculatedDueAmount != 0 &&
                      paymentMethods.map((payment, index) => (
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
                                      e.target.value,
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
                                        ? e.target.value * -1
                                        : e.target.value,
                                    );
                                    // console.log("value",e.target.value)
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
                                          e.target.value,
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
                                          e.target.value,
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
                                          e.target.value,
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
                                          e.target.value,
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
                      ))
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
                                      e.target.value,
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
                                        : e.target.value,
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
                                          e.target.value,
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
                                          e.target.value,
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
                                          e.target.value,
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
                                          e.target.value,
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

                  <div className="mb-1">
                    <label className="form-label">Narration</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={1}
                      name="Narration"
                      value={formData.Narration}
                      disabled={modalType === "view"}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-2 mt-1">
                    <button
                      className="btn btn-secondary w-50"
                      onClick={() => {
                        setRefundMode(0);
                        setShowDrawer(false);
                        setShowDisc(false);
                      }}
                    >
                      Cancel
                    </button>

                    {modalType !== "view" && (
                      <>
                        {modalType == "add" && (
                          // (refundMode === 0 ? (
                          //   calculatedDueAmount != 0 && (
                          //     <button
                          //       onClick={handleSave}
                          //       className="btn btn-primary w-50"
                          //     >
                          //       Save
                          //     </button>
                          //   )
                          // ) : (
                          //   <button
                          //     onClick={handleSave}
                          //     className="btn btn-primary w-50"
                          //   >
                          //     Save
                          //   </button>
                          // ))

                          <button
                            onClick={handleSave}
                            className="btn btn-primary w-50"
                          >
                            Save
                          </button>
                        )}

                        {modalType == "edit" && showSaveBtnEdit && (
                          <button
                            onClick={handleSave}
                            className="btn btn-primary w-50"
                          >
                            Save
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

                                1000,
                              );
                            }
                          }}
                          className="btn btn-warning w-50"
                        >
                          Print
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Select Patient</h5>
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
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>
              Prev
            </button>
          </li>

          {/* {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))} */}
          <button className="page-link">{`${page}/${totalPages}`}</button>

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default MoneyReceipt;
