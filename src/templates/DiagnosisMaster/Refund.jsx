import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../axiosInstance";
import Footer from "../../components/footer/Footer";

const Refund = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("view");
  const [startDate, setStartDate] = useState("2024-06-13");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReceipts(page);
    fetchPatients();
    fetchUsers();
  }, [page, startDate, endDate, searchTerm]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchPatients = async (search = '') => {
    try {
      const url = search 
        ? `/case01?search=${encodeURIComponent(search)}&limit=50`
        : '/case01?limit=20';
      const res = await axiosInstance.get(url);
      if (res.data.success) {
        setPatients(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
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

  const openDrawer = async (receipt, type) => {
    setModalType(type);
    if (type === 'add') {
      setFormData({
        ReceiptDate: new Date().toISOString().slice(0, 10),
        ReffId: '',
        RefundAmount: 0,
        MRType: 'C',
        BankName: '',
        ChequeNo: '',
        Narration: 'Refund Money Receipt',
      });
      setPatientSearch('');
      setShowDrawer(true);
    }
  };

  const handleSave = async () => {
    try {
      if (modalType === "add") {
        const payload = {
          ReffId: formData.ReffId,
          ReceiptDate: formData.ReceiptDate || new Date().toISOString().slice(0, 10),
          BillAmount: 0,
          Desc: 0,
          DiscAmt: 0,
          Amount: -(Math.abs(formData.RefundAmount || 0)),
          CBalAmt: 0,
          BalanceAmt: 0,
          Remarks: 'Refund Money Receipt',
          UserId: formData.UserId || 1,
          TypeofReceipt: 1,
          DiscOtherId: 1,
          DiscChk: 'Y',
          HeadId: 'HEAD001',
          ReffType: 'C',
          MRType: formData.MRType || 'C',
          BankName: formData.BankName || '',
          ChequeNo: formData.ChequeNo || '',
          AgentDiscId: 1,
          TDS: 0,
          AdjAmt: 0,
          CompName: '',
          Narration: formData.Narration || 'Refund Money Receipt',
          ReceiptTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        };
        await axiosInstance.post('/money-receipt01', payload);
        toast.success('Refund created successfully');
      }
      setShowDrawer(false);
      fetchReceipts(page);
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchReceipts(1);
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
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="main-content">
      <ToastContainer />
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>Refund</h5>
          <button className="btn btn-sm btn-danger" onClick={() => openDrawer(null, 'add')}>
            <i className="fa fa-plus me-2"></i>Add Refund
          </button>
        </div>

        <div className="panel-body">
          <div className="panel border rounded p-3 mb-3">
            <div className="row g-3 align-items-center justify-content-center">
              <div className="col-md-2">
                <label className="form-label">Date From</label>
                <input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Date To</label>
                <input type="date" className="form-control form-control-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <input type="text" className="form-control form-control-sm" placeholder="Search receipt..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }} />
                  <button className="btn btn-sm btn-info" onClick={handleSearch}><i className="fa fa-search"></i></button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-striped table-hover table-dashed">
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th>Receipt No</th>
                    <th>Receipt Date</th>
                    <th>Patient Name</th>
                    <th className="text-end">Refund Amount</th>
                    <th>Reff No</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-4">No data found</td></tr>
                  ) : (
                    receipts.filter(r => r.Amount < 0).map((r, index) => (
                      <tr key={r.MoneyreeciptId || index}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{r.ReceiptNo}</td>
                        <td>{r.ReceiptDate ? new Date(r.ReceiptDate).toLocaleDateString() : "-"}</td>
                        <td>{r.PatientName || "-"}</td>
                        <td className="text-end text-danger">{Math.abs(r.Amount)?.toFixed(2)}</td>
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
          <div className="modal-backdrop fade show" onClick={() => setShowDrawer(false)} style={{ zIndex: 9998 }}></div>
          <div className="profile-right-sidebar active" style={{ zIndex: 9999, width: "100%", maxWidth: "600px", right: showDrawer ? "0" : "-100%", top: "70px", height: "calc(100vh - 70px)" }}>
            <button className="right-bar-close" onClick={() => setShowDrawer(false)}><i className="fa-light fa-angle-right"></i></button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10, padding: "5px" }}>➕ Add Refund</div>
              <OverlayScrollbarsComponent style={{ height: "calc(100% - 60px)" }}>
                <div className="mx-3">
                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label">Receipt Date</label>
                      <input type="date" className="form-control form-control-sm" name="ReceiptDate" value={formData.ReceiptDate || new Date().toISOString().slice(0, 10)} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Case No</label>
                      <div className="input-group input-group-sm">
                        <input type="text" className="form-control form-control-sm" name="ReffId" value={formData.ReffId || ''} readOnly placeholder="Select patient" />
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowPatientModal(true)}><i className="fa fa-search"></i></button>
                      </div>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label">Patient Name</label>
                      <input type="text" className="form-control form-control-sm" value={formData.PatientName || ''} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Refund Amount</label>
                      <input type="number" className="form-control form-control-sm text-end" name="RefundAmount" value={formData.RefundAmount || 0} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-md-12">
                      <label className="form-label">Received By</label>
                      <select className="form-control form-control-sm" name="UserId" value={formData.UserId || ''} onChange={handleChange}>
                        <option value="">Select User</option>
                        {users.map((u) => (<option key={u.UserId} value={u.UserId}>{u.UserName}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-md-4">
                      <label className="form-label">Mode of Payment</label>
                      <select className="form-control form-control-sm" name="MRType" value={formData.MRType} onChange={handleChange}>
                        <option value="C">Cash</option>
                        <option value="B">Bank</option>
                        <option value="D">Credit Card</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Bank</label>
                      <input type="text" className="form-control form-control-sm" name="BankName" value={formData.BankName || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cheque / Card No</label>
                      <input type="text" className="form-control form-control-sm" name="ChequeNo" value={formData.ChequeNo || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Narration</label>
                    <textarea className="form-control form-control-sm" rows={2} name="Narration" value={formData.Narration || 'Refund Money Receipt'} onChange={handleChange}></textarea>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-secondary w-50" onClick={() => setShowDrawer(false)}>Cancel</button>
                    <button onClick={handleSave} className="btn btn-danger w-50">Save Refund</button>
                  </div>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      {showPatientModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 10000 }}></div>
          <div className="modal d-block" style={{ zIndex: 10001 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Select Patient</h5>
                  <button className="btn-close" onClick={() => setShowPatientModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input type="text" className="form-control form-control-sm mb-3" placeholder="Search by Case ID or Patient Name..." value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); fetchPatients(e.target.value); }} />
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr><th>Case ID</th><th>Patient Name</th><th>Age</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {patients.length === 0 ? (
                          <tr><td colSpan="4" className="text-center">No patients found</td></tr>
                        ) : (
                          patients.map((p) => (
                            <tr key={p.CaseId}>
                              <td>{p.CaseId}</td>
                              <td>{p.PatientName}</td>
                              <td>{p.Age}</td>
                              <td>
                                <button className="btn btn-sm btn-primary" onClick={() => { setFormData(prev => ({ ...prev, ReffId: p.CaseId, PatientName: p.PatientName || '' })); setShowPatientModal(false); setPatientSearch(''); }}>Select</button>
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

      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => goToPage(page - 1)}>Prev</button></li>
          <button className="page-link">{`${page}/${totalPages}`}</button>
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={() => goToPage(page + 1)}>Next</button></li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default Refund;
