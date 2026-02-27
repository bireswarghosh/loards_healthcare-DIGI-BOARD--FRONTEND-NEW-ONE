import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../axiosInstance";
import Footer from "../../components/footer/Footer";

// const MoneyReceipt = () => {
//   const navigate = useNavigate();

//   const [findBy, setFindBy] = useState("name"); // name | no
// const [findValue, setFindValue] = useState("");

// const [formData, setFormData] = useState({});

//   // data
//   const [receipts, setReceipts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [patients, setPatients] = useState([]);
//   const [patientSearch, setPatientSearch] = useState('');
//   const [showPatientModal, setShowPatientModal] = useState(false);
//   const [users, setUsers] = useState([]);

//   // drawer
//   const [showDrawer, setShowDrawer] = useState(false);
//   const [modalType, setModalType] = useState("view"); // view | edit
//   const [selectedReceipt, setSelectedReceipt] = useState(null);

//   // filters
//   const [startDate, setStartDate] = useState("2024-06-13");
//   // const [dateTo, setDateTo] = useState("2025-02-22");
//   const [endDate, setEndDate] = useState(
//   new Date().toISOString().slice(0, 10)
// );

//   const [allReceipt, setAllReceipt] = useState(true);
//   const [refund, setRefund] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   // pagination
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(20);
//   const [totalPages, setTotalPages] = useState(1);

//   const barcodeData = "OP/2425/08287";

//     // delete confirm
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   useEffect(() => {
//     fetchReceipts(page);
//     fetchPatients();
//     fetchUsers();
//   }, [page, startDate, endDate,  searchTerm]);

//   const fetchUsers = async () => {
//     try {
//       const res = await axiosInstance.get('/auth/users');
//       if (res.data.success) {
//         setUsers(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Failed to fetch users:', err);
//     }
//   };

//   const fetchPatients = async (search = '') => {
//     try {
//       const url = search
//         ? `/case01?search=${encodeURIComponent(search)}&limit=50`
//         : '/case01?limit=20';
//       const res = await axiosInstance.get(url);
//       if (res.data.success) {
//         setPatients(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Failed to fetch patients:', err);
//     }
//   };

//   const fetchReceipts = async (pageNo = 1) => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams({
//         page: pageNo,
//         limit,
//         startDate,
//         endDate,
//         // allReceipt,
//         // refund,
//         search: searchTerm,
//       });

//       const res = await axiosInstance.get(`/money-receipt01/search?${params}`);
//       if (res.data.success) {
//         setReceipts(res.data.data || []);
//         if (res.data.pagination) {
//           setPage(res.data.pagination.page);
//           setLimit(res.data.pagination.limit);
//           setTotalPages(res.data.pagination.totalPages);
//         }
//       }
//     } catch (err) {
//       toast.error("Failed to fetch receipts");
//     } finally {
//       setLoading(false);
//     }
//   };

// const fetchReceiptByNo = async (receiptNo) => {
//   try {
//     setLoading(true);

//     const res = await axiosInstance.get(
//       `/money-receipt01/search?ReceiptNo=${encodeURIComponent(receiptNo)}`
//     );

//     if (res.data.success && res.data.data?.length) {
//       const receipt = res.data.data[0];

//       setFormData({
//         ReceiptId: receipt.ReceiptId,
//         ReceiptNo: receipt.ReceiptNo || "",
//         ReffId: receipt.ReffId || "",
//         ReceiptDate: receipt.ReceiptDate?.slice(0, 10) || "",
//         BillAmount: receipt.BillAmount || 0,
//         BalanceAmt: receipt.BalanceAmt || 0,
//         Amount: receipt.Amount || 0,
//         DiscAmt: receipt.DiscAmt || 0,
//         Desc: receipt.Desc || 0,
//         AdjAmt: receipt.AdjAmt || 0,
//         MRType: receipt.MRType || "",
//         BankName: receipt.BankName || "",
//         ChequeNo: receipt.ChequeNo || "",

//         // extra
//         CBalAmt: receipt.CBalAmt || 0,
//         Remarks: receipt.Remarks || "",
//         UserId: receipt.UserId || "",
//         TypeofReceipt: receipt.TypeofReceipt || "",
//         DiscOtherId: receipt.DiscOtherId || "",
//         DiscChk: receipt.DiscChk || "",
//         HeadId: receipt.HeadId || "",
//         ReffType: receipt.ReffType || "",
//         AgentDiscId: receipt.AgentDiscId || "",
//         CompName: receipt.CompName || "",
//         ReceiptTime: receipt.ReceiptTime || "",

//         Narration: receipt.Narration || "",
//         PaidBy: receipt.PaidBy || "",
//         TDS: receipt.TDS || 0,

//         // readonly
//         PatientName: receipt.PatientName || "",
//         Age: receipt.Age || "",
//         Sex: receipt.Sex || "",
//         AdmitionNo: receipt.AdmitionNo || "",
//       });
//     } else {
//       toast.error("Receipt data not found");
//     }
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to load receipt details");
//   } finally {
//     setLoading(false);
//   }
// };

//   const openDrawer = async (receipt, type) => {
//   setModalType(type);

//   if (type === 'add') {
//     setFormData({
//       ReceiptDate: new Date().toISOString().slice(0, 10),
//       ReffId: '',
//       BillAmount: 0,
//       Amount: 0,
//       BalanceAmt: 0,
//       DiscAmt: 0,
//       Desc: 0,
//       TDS: 0,
//       AdjAmt: 0,
//       MRType: 'C',
//       BankName: '',
//       ChequeNo: '',
//       Narration: '',
//     });
//     setPatientSearch('');
//     setShowDrawer(true);
//     return;
//   }

//   if (type === 'refund') {
//     setFormData({
//       ReceiptDate: new Date().toISOString().slice(0, 10),
//       ReffId: '',
//       RefundAmount: 0,
//       MRType: 'C',
//       BankName: '',
//       ChequeNo: '',
//       Narration: 'Refund Money Receipt',
//     });
//     setPatientSearch('');
//     setShowDrawer(true);
//     return;
//   }

// //   setFormData({
// //     ReceiptId: receipt.ReceiptId,

// //    ReceiptNo: receipt.ReceiptNo || "",
// //    ReffId:receipt.ReffId || "",
// //     ReceiptDate: receipt.ReceiptDate?.slice(0, 10) || "",
// //     BillAmount: receipt.BillAmount || 0,
// //     BalanceAmt: receipt.BalanceAmt || 0,
// //     Amount:receipt.Amount || 0,
// //     DiscAmt:receipt.BillAmount || 0 ,
// //     Desc:receipt.Desc || 0 ,
// //     AdjAmt:receipt.AdjAmt || 0 ,
// //     MRType: receipt.MRType,
// // BankName: receipt.BankName || "",
// // ChequeNo: receipt.ChequeNo || "",
// // CaseData:receipt.CaseData || "",

// // // xtra------
// //   CBalAmt: receipt.CBalAmt || "",
// //   Remarks: receipt.Remarks || "",
// //   UserId: receipt.UserId || "",
// //   TypeofReceipt: receipt.TypeofReceipt || "",
// //   DiscOtherId: receipt.DiscOtherId || "",
// //   DiscChk: receipt.DiscChk || "",
// //   HeadId: receipt.HeadId || "",
// //   ReffType: receipt.ReffType || "",
// //   AgentDiscId: receipt.AgentDiscId || "",
// //   CompName: receipt.CompName || "",
// //   ReceiptTime: receipt.ReceiptTime || "",
// // // xtr end ----
// //     PaymentType: receipt.PaymentType ?? 0,
// //     // Bank: receipt.Bank || "",
// //     Narration: receipt.Narration || "",
// //     PaidBy: receipt.PaidBy || "",
// //     TDS: receipt.TDS || 0,

// //     // read-only / view fields (safe)
// //     PatientName: receipt.PatientName || "",
// //     Age: receipt.Age || "",
// //     Sex: receipt.Sex || "",
// //     AdmitionNo: receipt.AdmitionNo || "",
// //   });

//   setShowDrawer(true);
//   setFormData({});
//   if (type === "edit" && receipt?.ReceiptNo) {
//     await fetchReceiptByNo(receipt.ReceiptNo);
//   }
// };

// // handle save------
// const handleSave = async () => {
//   try {
//     if (modalType === "refund") {
//       const payload = {
//         ReffId: formData.ReffId,
//         ReceiptDate: formData.ReceiptDate || new Date().toISOString().slice(0, 10),
//         BillAmount: 0,
//         Desc: 0,
//         DiscAmt: 0,
//         Amount: -(Math.abs(formData.RefundAmount || 0)),
//         CBalAmt: 0,
//         BalanceAmt: 0,
//         Remarks: 'Refund Money Receipt',
//         UserId: formData.UserId || 1,
//         TypeofReceipt: 1,
//         DiscOtherId: 1,
//         DiscChk: 'Y',
//         HeadId: 'HEAD001',
//         ReffType: 'C',
//         MRType: formData.MRType || 'C',
//         BankName: formData.BankName || '',
//         ChequeNo: formData.ChequeNo || '',
//         AgentDiscId: 1,
//         TDS: 0,
//         AdjAmt: 0,
//         CompName: '',
//         Narration: formData.Narration || 'Refund Money Receipt',
//         ReceiptTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
//       };
//       await axiosInstance.post('/money-receipt01', payload);
//       toast.success('Refund created successfully');
//     } else if (modalType === "add") {
//       const payload = {
//         ReffId: formData.ReffId,
//         ReceiptDate: formData.ReceiptDate || new Date().toISOString().slice(0, 10),
//         BillAmount: formData.BillAmount || 0,
//         Desc: formData.Desc || 0,
//         DiscAmt: formData.DiscAmt || 0,
//         Amount: formData.Amount || 0,
//         CBalAmt: formData.CBalAmt || 0,
//         BalanceAmt: formData.BalanceAmt || 0,
//         Remarks: formData.Remarks || '',
//         UserId: formData.UserId || 1,
//         TypeofReceipt: formData.TypeofReceipt || 1,
//         DiscOtherId: formData.DiscOtherId || 1,
//         DiscChk: formData.DiscChk || 'Y',
//         HeadId: formData.HeadId || 'HEAD001',
//         ReffType: formData.ReffType || 'C',
//         MRType: formData.MRType || 'C',
//         BankName: formData.BankName || '',
//         ChequeNo: formData.ChequeNo || '',
//         AgentDiscId: formData.AgentDiscId || 1,
//         TDS: formData.TDS || 0,
//         AdjAmt: formData.AdjAmt || 0,
//         CompName: formData.CompName || '',
//         Narration: formData.Narration || '',
//         ReceiptTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
//       };
//       await axiosInstance.post('/money-receipt01', payload);
//       toast.success('Created successfully');
//     } else if (modalType === "edit" && formData.ReceiptId) {
//       // Update existing receipt
//       const payload = {
//         ReceiptNo: formData.ReceiptNo,
//         ReffId: formData.ReffId,
//         ReceiptDate: formData.ReceiptDate,
//         BillAmount: formData.BillAmount,
//         Desc: formData.Desc,
//         DiscAmt: formData.DiscAmt,
//         Amount: formData.Amount,
//         CBalAmt: formData.CBalAmt,
//         BalanceAmt: formData.BalanceAmt,
//         Remarks: formData.Remarks,
//         UserId: formData.UserId,
//         TypeofReceipt: formData.TypeofReceipt,
//         DiscOtherId: formData.DiscOtherId,
//         DiscChk: formData.DiscChk,
//         HeadId: formData.HeadId,
//         ReffType: formData.ReffType,
//         MRType: formData.MRType,
//         BankName: formData.BankName,
//         ChequeNo: formData.ChequeNo,
//         AgentDiscId: formData.AgentDiscId,
//         TDS: formData.TDS,
//         AdjAmt: formData.AdjAmt,
//         CompName: formData.CompName,
//         Narration: formData.Narration,
//         ReceiptTime: formData.ReceiptTime,
//       };

//       console.log('Update payload:', payload);

//       await axiosInstance.put(
//         `/money-receipt01/${encodeURIComponent(formData.ReceiptId)}`,
//         payload
//       );
//       toast.success("Updated successfully");
//     }

//     setShowDrawer(false);
//     fetchReceipts(page);
//   } catch (err) {
//     console.error('Save error:', err);
//     console.error('Error response:', err?.response?.data);
//     toast.error(
//       err?.response?.data?.message || "Save failed"
//     );
//   }
// };

//  // delete confirm
//   const confirmDelete = async (id) => {
//     try {
//       await axiosInstance.delete(`/moneyreceipt//${deleteId}`);
//       toast.success("Deleted successfully!", { autoClose: 1000 });

//       setShowConfirm(false);
//       setDeleteId(null);

//       // reload logic
//       if (items.length === 1 && page > 1) {
//         fetchItems(page - 1);
//       } else {
//         fetchItems(page);
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//       toast.error("Failed to delete!");
//     }
//   };

// const handleChange = (e) => {
//   const { name, value } = e.target;

//   setFormData((prev) => ({
//     ...prev,
//     [name]: value,
//   }));
// };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this receipt?")) return;
//     try {
//       await axiosInstance.delete(`/moneyreceipt/${id}`);
//       toast.success("Deleted successfully");
//       fetchReceipts(page);
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchTerm.trim()) {
//       fetchReceipts(1);
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await axiosInstance.get(
//         `/money-receipt01/search?ReceiptNo=${encodeURIComponent(searchTerm.trim())}&page=1&limit=${limit}`
//       );

//       if (response.data.success) {
//         setReceipts(response.data.data || []);
//         setTotalPages(response.data.pagination?.totalPages || 1);
//         setPage(1);
//       }
//     } catch (err) {
//       console.error('Search error:', err);
//       toast.error('Search failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const goToPage = (p) => {
//     if (p < 1 || p > totalPages) return;
//     setPage(p);
//   };

//   return (
//     <div className="main-content">
//       <ToastContainer />

//       <div className="panel">
//         {/* Header */}
//         <div className="panel-header d-flex justify-content-between align-items-center">
//           <h5>Sample Receipt</h5>
//           <div className="d-flex gap-2">
//             <button className="btn btn-sm btn-primary" onClick={() => openDrawer(null, 'add')}>
//               <i className="fa fa-plus me-2"></i>Add Receipt
//             </button>
//             <button className="btn btn-sm btn-danger" onClick={() => openDrawer(null, 'refund')}>
//               <i className="fa fa-undo me-2"></i>Refund
//             </button>
//           </div>
//         </div>

//         <div className="panel-body">
//           {/* Filters */}
//           <div className="panel border rounded p-3 mb-3">
//             <div className="row g-3  align-items-center justify-content-center">
//               <div className="col-md-2">
//                 <label className="form-label">Date From</label>
//                 <input
//                   type="date"
//                   className="form-control form-control-sm"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                 />
//               </div>

//               <div className="col-md-3">
//                 <label className="form-label">Date To</label>
//                 <input
//                   type="date"
//                   className="form-control form-control-sm"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                 />
//               </div>

//               <div className="col-md-2 ">
//                 <div className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     checked={allReceipt}
//                     onChange={(e) => setAllReceipt(e.target.checked)}
//                   />
//                   <label className="form-check-label">All Receipt</label>
//                 </div>
//               </div>

//               <div className="col-md-2  ">
//                 <div className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     checked={refund}
//                     onChange={(e) => setRefund(e.target.checked)}
//                   />
//                   <label className="form-check-label">Refund</label>
//                 </div>
//               </div>
//   <div className="col-md-3">
//               <div className="input-group input-group-sm">
//                 <input
//                   type="text"
//                   className="form-control form-control-sm"
//                   placeholder="Search receipt..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') handleSearch();
//                   }}
//                 />
//                 <button className="btn btn-sm btn-info" onClick={handleSearch}>
//                   <i className="fa fa-search"></i>
//                 </button>

//               </div>

//             </div>
//             </div>
//               {/* Search + Barcode */}
//           {/* <div className="row mb-3"> */}

//             {/* <div className="col-md-6 text-end">
//               <img
//                 src={`https://barcode.tec-it.com/barcode.ashx?data=${barcodeData}&code=Code128`}
//                 alt="barcode"
//                 height="45"
//               />
//               <div className="fw-bold mt-1">{barcodeData}</div>
//             </div> */}
//           {/* </div> */}
//           </div>

//           {/* Table */}
//           {loading ? (
//             <div className="text-center py-5">
//               <div className="spinner-border text-primary"></div>
//             </div>
//           ) : (
//             <OverlayScrollbarsComponent>
//               <table className="table table-striped table-hover table-dashed">
//                 <thead>
//                   <tr>
//                     <th>Action</th>
//                      <th>Sl No</th>
//                     <th>Receipt No</th>
//                     <th>Receipt Date</th>
//                     <th>Patient Name</th>
//                     <th className="text-end">Bill Amount</th>
//                       <th>Receipt</th>
//                     <th>Reff No</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {receipts.length === 0 ? (
//                     <tr>
//                       <td colSpan={7} className="text-center p-4">
//                         No data found
//                       </td>
//                     </tr>
//                   ) : (
//                     receipts.map((r,index) => (
//                       <tr key={r.MoneyreeciptId || index}>
//                         <td>
//                           <div className="d-flex gap-2">
//                             {/* <button
//                               className="btn btn-sm btn-outline-info"
//                               onClick={() => openDrawer(r, "view")}
//                             >
//                               <i className="fa-light fa-eye"></i>
//                             </button> */}

//                             <button
//                               className="btn btn-sm btn-outline-primary"
//                               onClick={() => openDrawer(r, "edit")}
//                             >
//                               <i className="fa-light fa-pen-to-square"></i>
//                             </button>

//                             {/* <button
//                               className="btn btn-sm btn-outline-danger"
//                               // onClick={() => handleDelete(r.MoneyreeciptId)}
//                                onClick={() => {
//                                 setDeleteId(r.MoneyreeciptId);
//                                 setShowConfirm(true);
//                               }}
//                             >
//                               <i className="fa-light fa-trash-can"></i>
//                             </button> */}
//                           </div>
//                         </td>
// <td>{(page - 1) * limit + index + 1}</td>
//                         <td>{r.ReceiptNo}</td>
//                         <td>
//                           {r.ReceiptDate
//                             ? new Date(r.ReceiptDate).toLocaleDateString()
//                             : "-"}
//                         </td>
//                         <td>{r.PatientName || "-"}</td>
//                         {/* <td className="text-end">{r.BillAmount?.toFixed(2)}</td> */}
//                         <td className="text-end">{r.BillAmount?.toFixed(2)}</td>
//                         <td>{r.Amount ?.toFixed(2)}</td>
//                         <td>{r.ReffId || "-"}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </OverlayScrollbarsComponent>
//           )}
//         </div>
//       </div>

//      {showDrawer && (
//   <>
//     {/* backdrop */}
//     <div
//       className="modal-backdrop fade show"
//       onClick={() => setShowDrawer(false)}
//       style={{ zIndex: 9998 }}
//     ></div>

//     {/* right sidebar */}
//     <div
//       className="profile-right-sidebar active"
//       style={{
//         zIndex: 9999,
//         width: "100%",
//          maxWidth: "950px",
//         right: showDrawer ? "0" : "-100%",
//         top: "70px",
//         height: "calc(100vh - 70px)",
//       }}
//     >
//       <button
//         className="right-bar-close"
//         onClick={() => setShowDrawer(false)}
//       >
//         <i className="fa-light fa-angle-right"></i>
//       </button>

//       <div className="top-panel" style={{ height: "100%" }}>
//         {/* Header */}
//         <div
//           className="dropdown-txt"
//           style={{
//             position: "sticky",
//             top: 0,
//             zIndex: 10,
//             padding: "5px",
//           }}
//         >
//           {modalType === "view"
//             ? "👁️ View Sample Receipt"
//             : modalType === "add"
//             ? "➕ Add Sample Receipt"
//             : modalType === "refund"
//             ? "💸 Refund"
//             : "✏️ Edit Sample Receipt"}
//         </div>

//         {/* BODY WITH SCROLL */}
//         <OverlayScrollbarsComponent
//           style={{ height: "calc(100% - 60px)" }}
//         >
//         <div className="mx-3">

// {/* Row 1 */}
// <div className="row g-2 mb-1 align-items-end">
//   {/* Receipt No */}
//   <div className="col-md-3">
//     <label className="form-label">Receipt </label>
//     <input
//       type="text"
//       className="form-control form-control-sm"
//       name="ReceiptNo"
// value={formData.ReceiptNo}
//         onChange={handleChange}
//       disabled
//     />
//   </div>

//   {/* Receipt Date */}
//   <div className="col-md-3">
//     <label className="form-label">Receipt Date</label>
//     <input
//       type="date"
//       className="form-control form-control-sm"
//       name="ReceiptDate"
//  value={new Date().toISOString().slice(0, 10)}

//     onChange={handleChange}
//       disabled
//     />
//   </div>

//   {/* Find By Radios */}
//   <div className="col-md-3">
//     <label className="form-label d-block">Find</label>
//     <div className="d-flex gap-3">
//       <div className="form-check">
//         <input
//           className="form-check-input"
//           type="radio"
//           name="findBy"
//           id="findByName"
//           checked={findBy === "name"}
//           onChange={() => setFindBy("name")}
//         />
//         <label className="form-check-label" htmlFor="findByName">
//           By Name
//         </label>
//       </div>

//       <div className="form-check">
//         <input
//           className="form-check-input"
//           type="radio"
//           name="findBy"
//           id="findByNo"
//           checked={findBy === "no"}
//           onChange={() => setFindBy("no")}
//         />
//         <label className="form-check-label" htmlFor="findByNo">
//           By No
//         </label>
//       </div>

//     </div>

//   </div>

//   {/* Find Input */}
//   {/* <div className="col-md-12 mt-1">
//     <input
//       type="text"
//       className="form-control form-control-sm"
//       placeholder={
//         findBy === "name"
//           ? "Enter Patient Name"
//           : "Enter Receipt No"
//       }
//       value={findValue}
//       onChange={(e) => setFindValue(e.target.value)}
//     />
//   </div> */}
//     <div className="col-md-3 text-end">
//               <img
//                 src={`https://barcode.tec-it.com/barcode.ashx?data=${barcodeData}&code=Code128`}
//                 alt="barcode"
//                 height="40"
//               />
//               <div className=" mt-1">{barcodeData}</div>
//             </div>
// </div>

//   {/* Receipt / Case */}
//   <div className="row g-2 mb-1">
//     {/* <div className="col-md-1 ">

//       <label className="form-label">Receipt</label>
//       <input
//         type="radio"
//         className=""
//         value="Receipt"
//         // disabled
//       />
//     </div> */}

//     <div className="col-md-2">
//       <label className="form-label">Case No</label>
//       {(modalType === 'add' || modalType === 'refund') ? (
//         <div className="input-group input-group-sm">
//           <input
//             type="text"
//             className="form-control form-control-sm"
//             name="ReffId"
//             value={formData.ReffId || ''}
//             readOnly
//             placeholder="Select patient"
//           />
//           <button
//             type="button"
//             className="btn btn-sm btn-outline-primary"
//             onClick={() => setShowPatientModal(true)}
//           >
//             <i className="fa fa-search"></i>
//           </button>
//         </div>
//       ) : (
//         <input
//           type="text"
//           className="form-control form-control-sm"
//           name="ReffId"
//           value={formData.ReffId}
//           onChange={handleChange}
//           disabled={modalType === "view"}
//         />
//       )}
//     </div>
//     <div className="col-md-2">
//     <label className="form-label">Case Date</label>
//     <input
//       type="date"
//       className="form-control form-control-sm"
//       value={
//         formData.CaseDate

//       }
//       onChange={handleChange}
//       disabled
//     />
//   </div>

//     <div className="col-md-2">
//       <label className="form-label">Patient Name</label>
//       <input
//         type="text"
//         className="form-control form-control-sm"
//         name="PatientName"
//         value={formData.PatientName }
//         onChange={handleChange}
//         disabled
//       />
//     </div>

//     <div className="col-md-2">
//       <label className="form-label">Age</label>
//       <input
//         type="text"
//         className="form-control form-control-sm"
//         value={formData.Age}
//          name="Age"
//         disabled
//       />
//     </div>

//     <div className="col-md-2">
//       <label className="form-label">Sex</label>
//       <input
//         type="text"
//         className="form-control form-control-sm"
//         value={formData.Sex }
//         disabled
//       />
//     </div>

//   </div>

//   {/* Patient info */}
//   <div className="row g-2 mb-1">
//     <div className="col-md-2">
//       <label className="form-label">Received By</label>
//       <select
//         className="form-control form-control-sm"
//         name="UserId"
//         value={formData.UserId || ''}
//         onChange={handleChange}
//         disabled={modalType === "view"}
//       >
//         <option value="">Select User</option>
//         {users.map((u) => (
//           <option key={u.UserId} value={u.UserId}>
//             {u.UserName}
//           </option>
//         ))}
//       </select>
//     </div>
//     <div className="col-md-3">
//       <label className="form-label">Current User</label>
//       <input
//         type="text"
//         className="form-control form-control-sm"
//         value="Admin"
//         disabled
//       />
//     </div>

//   </div>

//   {/* Amount Section */}
//    {modalType === 'refund' ? (
//      <div className="row g-2 mb-2">
//        <div className="col-md-12">
//          <label className="form-label">Refund Amount</label>
//          <input
//            type="number"
//            className="form-control form-control-sm text-end"
//            name="RefundAmount"
//            value={formData.RefundAmount || 0}
//            onChange={handleChange}
//          />
//        </div>
//      </div>
//    ) : (
//    <div className="row g-2 mb-2">

//  <div className="col-md-1">
//     <label className="form-label">Bill Amt</label>
//     <input
//       type="number"
//       className="form-control form-control-sm text-end"
//       name="BillAmount"
//       value={formData.BillAmount}
//       onChange={handleChange}
//       disabled
//     />
//   </div>
// <div className="col-md-2">
//     <label className="form-label">Total Received Amt</label>
//     <input
//       type="number"
//        name="Amount"
//       className="form-control form-control-sm text-end"
//       value={formData.Amount }
//        onChange={handleChange}
//       disabled={modalType === "view"}
//     />
//   </div>
// <div className="col-md-2">
//     <label className="form-label">Balance Amt</label>
//     <input
//       type="number"
//       className="form-control form-control-sm text-end"
//       name="BalanceAmt"
//       value={formData.BalanceAmt }
//        onChange={handleChange}
//       disabled
//     />
//   </div>
// <div className="col-md-1">
//       <label className="form-label">Disc %</label>
//       <input
//         type="number"
//         className="form-control form-control-sm text-end"
//         name="Desc"
//         value={formData.Desc}
//         onChange={handleChange}
//         disabled={modalType === "view"}
//       />
//     </div>
//  <div className="col-md-2">
//       <label className="form-label">Disc Amount</label>
//       <input
//         type="number"
//         className="form-control form-control-sm text-end"
//         value={formData.DiscAmt}
//         name="DiscAmt"
//         onChange={handleChange}
//         disabled={modalType === "view"}
//       />
//     </div>
// <div className="col-md-1">
//       <label className="form-label">TDS</label>
//       <input
//         type="number"
//         className="form-control form-control-sm text-end"
//         name="TDS"
//         value={formData.TDS}
//         onChange={handleChange}
//         disabled={modalType === "view"}
//       />
//     </div>
//   <div className="col-md-1">
//       <label className="form-label">Adjustment</label>
//       <input
//         type="number"
//         className="form-control form-control-sm text-end"
//         name="AdjAmt"
//         value={formData.AdjAmt}
//         onChange={handleChange}
//         disabled={modalType === "view"}
//       />
//     </div>
// <div className="col-md-2 ">
//     <label className="form-label "> Actual Receipt</label>
//     <input
//     name="Amount"
//       type="number"
//       className="form-control form-control-sm text-end"
//       value={formData.Amount }
//       onChange={handleChange}
//      disabled={modalType === "view"}
//     />
//   </div>

//    </div>
//    )}

//   {/* Payment */}
//   <div className="row g-2 mb-1">
//     <div className="col-md-2">
//       <label className="form-label">Mode of Payment</label>
//       <select
//         className="form-control form-control-sm"
//         disabled={modalType === "view"}
//         name="MRType"
//         value={formData.MRType}
//         onChange={handleChange}
//       >
//         <option value="">Select</option>
//         <option value="C">Cash</option>
//         <option value="B">Bank</option>
//         <option value="D">Credit Card</option>
//         <option value="W">W</option>
//       </select>
//     </div>

//     <div className="col-md-5">
//       <label className="form-label">Bank</label>
//       <input

//         type="text"
//         className="form-control form-control-sm"
//         name="BankName"
//      value={formData.BankName}
//           onChange={handleChange}
//         disabled={modalType === "view"}
//       />
//     </div>
//     <div className="col-md-5">
//       <label className="form-label">Cheque / Card No</label>
//       <input
//       name="ChequeNo"
//         type="text"
//         className="form-control form-control-sm"
//         value={formData.ChequeNo}
//   disabled={modalType === "view"}
//   onChange={handleChange}
//       />
//     </div>
//   </div>

//   <div className="mb-1">
//     <label className="form-label">Narration</label>
//     <textarea

//       className="form-control form-control-sm"
//       rows={1}
//       name="Narration"
//        value={formData.Narration}
//   disabled={modalType === "view"}
//   onChange={handleChange}
//     ></textarea>
//   </div>

//   {/* Buttons */}
//   <div className="d-flex gap-2 mt-1">
//     <button
//       className="btn btn-secondary w-50"
//       onClick={() => setShowDrawer(false)}
//     >
//       Cancel
//     </button>

//     {modalType !== "view" && (
//       <button   onClick={handleSave} className="btn btn-primary w-50">
//         Save
//       </button>
//     )}
//   </div>
// </div>

//         </OverlayScrollbarsComponent>
//       </div>
//     </div>
//   </>
// )}

//       {/* Patient Search Modal */}
//       {showPatientModal && (
//         <>
//           <div className="modal-backdrop fade show" style={{ zIndex: 10000 }}></div>
//           <div className="modal d-block" style={{ zIndex: 10001 }}>
//             <div className="modal-dialog modal-dialog-centered modal-lg">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5 className="modal-title">Select Patient</h5>
//                   <button className="btn-close" onClick={() => setShowPatientModal(false)}></button>
//                 </div>
//                 <div className="modal-body">
//                   <input
//                     type="text"
//                     className="form-control form-control-sm mb-3"
//                     placeholder="Search by Case ID or Patient Name..."
//                     value={patientSearch}
//                     onChange={(e) => {
//                       setPatientSearch(e.target.value);
//                       fetchPatients(e.target.value);
//                     }}
//                   />
//                   <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                     <table className="table table-sm table-hover">
//                       <thead>
//                         <tr>
//                           <th>Case ID</th>
//                           <th>Patient Name</th>
//                           <th>Age</th>
//                           <th>Action</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {patients.length === 0 ? (
//                           <tr>
//                             <td colSpan="4" className="text-center">No patients found</td>
//                           </tr>
//                         ) : (
//                           patients.map((p) => (
//                             <tr key={p.CaseId}>
//                               <td>{p.CaseId}</td>
//                               <td>{p.PatientName}</td>
//                               <td>{p.Age}</td>
//                               <td>
//                                 <button
//                                   className="btn btn-sm btn-primary"
//                                   onClick={() => {
//                                     setFormData(prev => ({
//                                       ...prev,
//                                       ReffId: p.CaseId,
//                                       BillAmount: p.GrossAmt || 0,
//                                       BalanceAmt: p.GrossAmt || 0,
//                                       Amount: p.GrossAmt || 0,
//                                       PatientName: p.PatientName || '',
//                                       Age: p.Age || '',
//                                       Sex: p.Sex || '',
//                                       CaseDate: p.CaseDate?.slice(0, 10) || '',
//                                     }));
//                                     setShowPatientModal(false);
//                                     setPatientSearch('');
//                                   }}
//                                 >
//                                   Select
//                                 </button>
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//    {/* Confirm Delete Modal */}
//       {showConfirm && <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>}
//       {showConfirm && (
//         <div
//           className="modal d-block"
//           style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
//           onClick={() => setShowConfirm(false)}
//         >
//           <div
//             className="modal-dialog modal-dialog-centered"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div
//               className="modal-content"
//               style={{
//                 borderRadius: "10px",
//                 overflow: "hidden",
//               }}
//             >
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   <i className="fa-light fa-triangle-exclamation me-2"></i>
//                   Confirm Delete
//                 </h5>
//                 <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
//               </div>

//               <div className="modal-body text-center">
//                 <p className="fs-6 mb-1">Are you sure you want to delete this?</p>
//                 <p className="text-muted">This cannot be undone.</p>
//               </div>

//               <div className="modal-footer d-flex justify-content-center gap-3">
//                 <button className="btn btn-secondary px-4" onClick={() => setShowConfirm(false)}>
//                   Cancel
//                 </button>

//                 <button className="btn btn-danger px-4" onClick={confirmDelete}>
//                   Yes, Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="d-flex justify-content-center mt-3">
//         <ul className="pagination pagination-sm">
//           <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
//             <button className="page-link" onClick={() => goToPage(page - 1)}>
//               Prev
//             </button>
//           </li>

//           {/* {[...Array(totalPages)].map((_, i) => (
//             <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
//               <button className="page-link" onClick={() => goToPage(i + 1)}>
//                 {i + 1}
//               </button>
//             </li>
//           ))} */}
//           <button className="page-link">{`${page}/${totalPages}`}</button>

//           <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
//             <button className="page-link" onClick={() => goToPage(page + 1)}>
//               Next
//             </button>
//           </li>
//         </ul>
//       </div>

//       <Footer />
//     </div>
//   );
// };

const MoneyReceipt = () => {
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

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("view"); // view | edit
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // filters
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  // const [dateTo, setDateTo] = useState("2025-02-22");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [allReceipt, setAllReceipt] = useState(true);
  const [refund, setRefund] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  let barcodeData = "OP/2425/08287";

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // this is for showing history
  const [histData, setHistData] = useState([]);

  useEffect(() => {
    fetchReceipts(page);
    fetchPatients();
    fetchUsers();
  }, [page, startDate, endDate, searchTerm]);

  useEffect(() => {
    if (!showDrawer) {
      setHistData([]);
    }
  }, [showDrawer]);

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

  // this is for fetching transaction of the patient by reff Id
  const fetchHistory = async (id, ReceiptId) => {
    try {
      const res = await axiosInstance.get(
        `/money-receipt01/search?ReffId=${id}`,
      );
      if (res.data.success) {
        // console.log("History data: ", res.data.data);
        const data = res.data.data;

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

  const fetchReceipts = async (pageNo = 1) => {
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

      const res = await axiosInstance.get(`/money-receipt01/search?${params}`);
      if (res.data.success) {
        setReceipts(res.data.data || []);
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
            type: pm.method === "Cash" ? "0" : pm.method === "UPI" ? "1" : "2",
            amount: pm.amount || "",
            upiApp: pm.upiApp || "",
            utrNumber: pm.utrNumber || "",
            bankName: pm.bankName || "",
            chequeNumber: pm.chequeNumber || "",
          }));
          setPaymentMethods(loadedMethods);
        } else {
          // Default: show old payment method data or empty cash payment
          const defaultMethod = {
            type:
              receipt.MRType === "B" ? "2" : receipt.MRType === "D" ? "1" : "0",
            amount: receipt.Amount || "",
            upiApp: "",
            utrNumber: "",
            bankName: receipt.BankName || "",
            chequeNumber: receipt.ChequeNo || "",
          };
          setPaymentMethods([defaultMethod]);
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

    //   setFormData({
    //     ReceiptId: receipt.ReceiptId,

    //    ReceiptNo: receipt.ReceiptNo || "",
    //    ReffId:receipt.ReffId || "",
    //     ReceiptDate: receipt.ReceiptDate?.slice(0, 10) || "",
    //     BillAmount: receipt.BillAmount || 0,
    //     BalanceAmt: receipt.BalanceAmt || 0,
    //     Amount:receipt.Amount || 0,
    //     DiscAmt:receipt.BillAmount || 0 ,
    //     Desc:receipt.Desc || 0 ,
    //     AdjAmt:receipt.AdjAmt || 0 ,
    //     MRType: receipt.MRType,
    // BankName: receipt.BankName || "",
    // ChequeNo: receipt.ChequeNo || "",
    // CaseData:receipt.CaseData || "",

    // // xtra------
    //   CBalAmt: receipt.CBalAmt || "",
    //   Remarks: receipt.Remarks || "",
    //   UserId: receipt.UserId || "",
    //   TypeofReceipt: receipt.TypeofReceipt || "",
    //   DiscOtherId: receipt.DiscOtherId || "",
    //   DiscChk: receipt.DiscChk || "",
    //   HeadId: receipt.HeadId || "",
    //   ReffType: receipt.ReffType || "",
    //   AgentDiscId: receipt.AgentDiscId || "",
    //   CompName: receipt.CompName || "",
    //   ReceiptTime: receipt.ReceiptTime || "",
    // // xtr end ----
    //     PaymentType: receipt.PaymentType ?? 0,
    //     // Bank: receipt.Bank || "",
    //     Narration: receipt.Narration || "",
    //     PaidBy: receipt.PaidBy || "",
    //     TDS: receipt.TDS || 0,

    //     // read-only / view fields (safe)
    //     PatientName: receipt.PatientName || "",
    //     Age: receipt.Age || "",
    //     Sex: receipt.Sex || "",
    //     AdmitionNo: receipt.AdmitionNo || "",
    //   });

    setShowDrawer(true);
    setFormData({});
    if (type === "edit" && receipt?.ReceiptNo) {
      console.log("rec data: ", receipt);
      fetchHistory(receipt.ReffId, receipt.ReceiptId);
      await fetchReceiptByNo(receipt.ReceiptNo);
    }
  };

  // handle save------
  const handleSave = async () => {
    try {
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
          Amount: formData.Amount || 0,
          CBalAmt: formData.CBalAmt || 0,
          BalanceAmt: formData.BalanceAmt || 0,
          Remarks: formData.Remarks || "",
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
        const payload = {
          ReceiptNo: formData.ReceiptNo,
          ReffId: formData.ReffId,
          ReceiptDate: formData.ReceiptDate,
          BillAmount: formData.BillAmount,
          Desc: formData.Desc,
          DiscAmt: formData.DiscAmt,
          Amount: formData.Amount,
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

        console.log("Update payload:", payload);

        await axiosInstance.put(
          `/money-receipt01/${encodeURIComponent(formData.ReceiptId)}`,
          payload,
        );
        toast.success("Updated successfully");
      }

      setShowDrawer(false);
      fetchReceipts(page);
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
      fetchReceipts(page);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchReceipts(1);
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
  const totalPaid = paymentMethods.reduce(
    (sum, p) => sum + parseFloat(p.amount || 0),
    0,
  );
  const billAmount = parseFloat(formData.BillAmount || 0);

  const calculatedDueAmount = billAmount - totalPaid;
  const isDueAmountPositive = calculatedDueAmount > 0;
  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        {/* Header */}
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>Sample Receipt</h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => openDrawer(null, "add")}
            >
              <i className="fa fa-plus me-2"></i>Add Receipt
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => openDrawer(null, "refund")}
            >
              <i className="fa fa-undo me-2"></i>Refund
            </button>
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
                    checked={allReceipt}
                    onChange={(e) => setAllReceipt(e.target.checked)}
                  />
                  <label className="form-check-label">All Receipt</label>
                </div>
              </div>

              <div className="col-md-2  ">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={refund}
                    onChange={(e) => setRefund(e.target.checked)}
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
              <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="spinner-grow text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="spinner-grow text-success" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="spinner-grow text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="spinner-grow text-warning" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="spinner-grow text-info" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="spinner-grow text-light" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="spinner-grow text-dark" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-striped table-hover table-dashed">
                <thead>
                  <tr>
                    <th>Action</th>
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
                                console.log("r: ", r);
                                openDrawer(r, "edit");
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
            onClick={() => setShowDrawer(false)}
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
              onClick={() => setShowDrawer(false)}
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
                    ? "➕ Add Sample Receipt"
                    : modalType === "refund"
                      ? "💸 Refund"
                      : "✏️ Edit Sample Receipt"}
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
                            onClick={() => setShowPatientModal(true)}
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
                          disabled={modalType === "view"}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Balance Amt</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="BalanceAmt"
                          value={formData.BalanceAmt}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                      <div className="col-md-1">
                        <label className="form-label">Disc %</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="Desc"
                          value={formData.Desc}
                          onChange={handleChange}
                          disabled={modalType === "view"}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Disc Amount</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          value={formData.DiscAmt}
                          name="DiscAmt"
                          onChange={handleChange}
                          disabled={modalType === "view"}
                        />
                      </div>
                      <div className="col-md-1">
                        <label className="form-label">TDS</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="TDS"
                          value={formData.TDS}
                          onChange={handleChange}
                          disabled={modalType === "view"}
                        />
                      </div>
                      <div className="col-md-1">
                        <label className="form-label">Adjustment</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          name="AdjAmt"
                          value={formData.AdjAmt}
                          onChange={handleChange}
                          disabled={modalType === "view"}
                        />
                      </div>
                      <div className="col-md-2 ">
                        <label className="form-label "> Actual Receipt</label>
                        <input
                          name="Amount"
                          type="number"
                          className="form-control form-control-sm text-end"
                          value={formData.Amount}
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
                    <div className="col-md-3">
                      <label className="form-label">Total Bill Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.BillAmount}
                        disabled
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Total Paid Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={paymentMethods.reduce(
                          (sum, p) => sum + parseFloat(p.amount || 0),
                          0,
                        )}
                        readOnly
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Due Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={calculatedDueAmount.toFixed(2)}
                        readOnly
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label d-block">&nbsp;</label>{" "}
                      {/* Placeholder label for alignment */}
                      {isDueAmountPositive && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={addPaymentMethod}
                        >
                          + Add Payment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multiple Payment Methods */}
                  {paymentMethods.map((payment, index) => (
                    <div key={index} className="payment-card card mb-3">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <small className="mb-0 fw-bold">
                          Payment #{index + 1}
                        </small>
                        {paymentMethods.length > 1 && (
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
                            <label className="form-label">Payment Type</label>
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
                              onChange={(e) =>
                                updatePaymentMethod(
                                  index,
                                  "amount",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {/* Conditional fields based on payment type */}
                          {payment.type === "1" && (
                            <>
                              <div className="col-md-2">
                                <label className="form-label">UPI App</label>
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
                                />
                              </div>
                              <div className="col-md-2">
                                <label className="form-label">UTR Number</label>
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
                                />
                              </div>
                            </>
                          )}

                          {payment.type === "2" && (
                            <>
                              <div className="col-md-2">
                                <label className="form-label">Bank Name</label>
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
                                />
                              </div>
                            </>
                          )}

                          {payment.type === "0" && (
                            <div className="col-md-4">
                              <label className="form-label">Cash Payment</label>
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

                  {modalType == "edit" && histData.length != 0 && (
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
                            {/* <tr key={1}>
                              <td>{1}</td>
                              <td>
                                <div className="border-bottom border-1">d</div>
                                <div className="border-bottom border-1">d</div>
                                <div className="border-bottom border-1">d</div>
                                <div>d</div>
                              </td>
                            </tr> */}
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
                  )}

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
                      onClick={() => setShowDrawer(false)}
                    >
                      Cancel
                    </button>

                    {modalType !== "view" && (
                      <button
                        onClick={handleSave}
                        className="btn btn-primary w-50"
                      >
                        Save
                      </button>
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
                          <th>Action</th>
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
                                    setFormData((prev) => ({
                                      ...prev,
                                      ReffId: p.CaseId,
                                      BillAmount: p.GrossAmt || 0,
                                      BalanceAmt: p.GrossAmt || 0,
                                      Amount: p.GrossAmt || 0,
                                      PatientName: p.PatientName || "",
                                      Age: p.Age || "",
                                      Sex: p.Sex || "",
                                      CaseDate: p.CaseDate?.slice(0, 10) || "",
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