import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PaginationBar from "./DiagnosisMaster/PaginationBar";
import axiosInstance from "../axiosInstance";
import { useAuth } from "../context/AuthContext";

const Discharge = () => {
  const { permissions, user } = useAuth();
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';

  const [dischargeList, setDischargeList] = useState([]);
  const getToday = () => new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [searchName, setSearchName] = useState("");
  const [searchAdmNo, setSearchAdmNo] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchDisNo, setSearchDisNo] = useState("");

  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/discert/${deleteId}`);
      toast.success("Deleted successfully");
      setShowConfirm(false);
      setDeleteId(null);
      fetchDischarge();
    } catch (err) {
      toast.error("Delete failed: " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const fetchDischarge = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/discert", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: pageNo,
          ...(searchName && { PatientName: searchName }),
          ...(searchAdmNo && { AdmitionId: searchAdmNo }),
          ...(searchDisNo && { DisCerNo: searchDisNo }),
        },
      });

      let data = res.data.data || [];
      if (searchPhone) {
        data = data.filter((d) => d.PhoneNo?.includes(searchPhone));
      }
      setDischargeList(data);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("error fetching", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPageNo(1);
    fetchDischarge();
  };

  const clearSearch = () => {
    const today = getToday();
    setStartDate(today);
    setEndDate(today);
    setSearchName("");
    setSearchAdmNo("");
    setSearchPhone("");
    setSearchDisNo("");
    setPageNo(1);
  };

  useEffect(() => {
    fetchDischarge();
  }, [pageNo]);

  // Clear triggers re-fetch
  useEffect(() => {
    if (!searchName && !searchAdmNo && !searchPhone && !searchDisNo) {
      fetchDischarge();
    }
  }, [startDate, endDate]);

  return (
    <>
      <style>{`
        .dis-list-page { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dis-search-bar { background: #fff; border-radius: 8px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 12px; border: 1px solid #e8ecf0; }
        .dis-table-wrap { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e8ecf0; }
        .dis-table { font-size: 0.78rem; margin: 0; }
        .dis-table thead { background: linear-gradient(135deg, #1e3a5f, #2d5a87); color: #fff; position: sticky; top: 0; z-index: 10; }
        .dis-table thead th { padding: 8px 6px; font-weight: 600; border: none; white-space: nowrap; }
        .dis-table tbody tr { transition: background 0.15s; }
        .dis-table tbody tr:hover { background: #e3f2fd !important; }
        .dis-table td { padding: 6px; vertical-align: middle; }
        .dis-action-btn { padding: 3px 8px; font-size: 11px; border-radius: 4px; transition: all 0.2s; }
        .dis-action-btn:hover { transform: scale(1.05); }
        .dis-badge { font-size: 10px; padding: 3px 8px; border-radius: 12px; font-weight: 600; }
        .dis-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.2s; }
        .dis-modal-box { background: #fff; border-radius: 12px; padding: 24px; width: 360px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
      `}</style>

      <div className="dis-list-page">
        {/* Search Bar */}
        <div className="dis-search-bar">
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input type="text" className="form-control form-control-sm" placeholder="Patient Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} style={{ width: 140 }} />
            <input type="text" className="form-control form-control-sm" placeholder="Admission No" value={searchAdmNo} onChange={(e) => setSearchAdmNo(e.target.value)} style={{ width: 120 }} />
            <input type="text" className="form-control form-control-sm" placeholder="Discharge No" value={searchDisNo} onChange={(e) => setSearchDisNo(e.target.value)} style={{ width: 120 }} />
            <input type="text" className="form-control form-control-sm" placeholder="Phone" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} style={{ width: 120 }} />
            <span style={{ fontSize: 11, color: "#666" }}>From</span>
            <input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: 140 }} />
            <span style={{ fontSize: 11, color: "#666" }}>To</span>
            <input type="date" className="form-control form-control-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: 140 }} />
            <button className="btn btn-sm btn-primary" onClick={handleSearch} style={{ borderRadius: 6 }}>
              <i className="fa fa-search"></i> Search
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={clearSearch} style={{ borderRadius: 6 }}>
              Clear
            </button>
            {(isSuperAdmin || permissions?.indoor_dischargeAdvise_create !== false) && (
              <NavLink className="btn btn-sm btn-success" to="/discharge/add" style={{ borderRadius: 6, fontWeight: 600 }}>
                <i className="fa-light fa-plus"></i> New Discharge
              </NavLink>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="dis-table-wrap" style={{ maxHeight: "calc(100vh - 260px)", overflow: "auto" }}>
          <table className="table table-sm table-bordered table-striped dis-table">
            <thead>
              <tr>
                <th style={{ width: 180 }}>Action</th>
                <th>Discharge No.</th>
                <th>Time</th>
                <th>Date</th>
                <th>Patient Name</th>
                <th>Admission No.</th>
                <th>Adm. Date</th>
                <th>Phone</th>
                <th>Age/Sex</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2"></span>Loading...</td></tr>
              ) : dischargeList.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">No records found</td></tr>
              ) : (
                dischargeList.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {(isSuperAdmin || permissions?.indoor_dischargeAdvise_view !== false) && (
                          <button className="btn btn-outline-info dis-action-btn" title="View" onClick={() => navigate(`/discharge/${encodeURIComponent(item.DisCerId)}`)}>
                            <i className="fa-light fa-eye" />
                          </button>
                        )}
                        {(isSuperAdmin || permissions?.indoor_dischargeAdvise_edit !== false) && (
                          <button className="btn btn-outline-primary dis-action-btn" title="Edit" onClick={() => navigate(`/discharge/${encodeURIComponent(item.DisCerId)}/edit`)}>
                            <i className="fa-light fa-pen" />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button className="btn btn-outline-danger dis-action-btn" title="Delete" onClick={() => { setDeleteId(item.DisCerId); setShowConfirm(true); }}>
                            <i className="fa-light fa-trash" />
                          </button>
                        )}
                        {(isSuperAdmin || permissions?.indoor_dischargeAdvise_print !== false) && (
                          <button className="btn btn-success" style={{ padding: "3px 8px", fontSize: "11px", borderRadius: "4px" }} title="Print" onClick={() => navigate(`/discharge/${encodeURIComponent(item.DisCerId)}/print`)}>
                            🖨 Print
                          </button>
                        )}
                      </div>
                    </td>
                    <td><span className="dis-badge bg-primary text-white">{item.DisCerNo}</span></td>
                    <td>{item.DisCerTime}</td>
                    <td>{item.DisCerDate?.split("T")[0]}</td>
                    <td className="fw-bold">{item.PatientName || ""}</td>
                    <td>{item.AdmitionNo || `A-${item.AdmitionId}`}</td>
                    <td>{item.AdmitionDate || ""}</td>
                    <td>{item.PhoneNo || ""}</td>
                    <td>{item.Age}{item.AgeType}/{item.Sex}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {showConfirm && (
          <div className="dis-modal-overlay" onClick={() => !deleting && setShowConfirm(false)}>
            <div className="dis-modal-box" onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <h6 className="fw-bold">Confirm Delete</h6>
              <p className="text-muted" style={{ fontSize: 13 }}>
                This will permanently delete the discharge record and all related data (medicine, diagnosis, complaints, etc.)
              </p>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button className="btn btn-secondary btn-sm px-4" onClick={() => setShowConfirm(false)} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger btn-sm px-4" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? <><span className="spinner-border spinner-border-sm me-1"></span>Deleting...</> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <PaginationBar pageNo={pageNo} totalPages={totalPages} onPageChange={setPageNo} />
      </div>
    </>
  );
};

export default Discharge;
