import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";


const FinalBillingListB = () => {
  const navigate = useNavigate();


  // UI State
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [delBtnLoading, setDelBtnLoading] = useState(false)
  const [finalBillings, setFinalBillings] = useState([]); // Empty array for UI rendering
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });


  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(1);


  const [showConfirm, setShowConfirm] = useState(false)
  const [delId, setDelId] = useState("")


  const fetchFinalBillings = async (fromDate,toDate) => {
    try {
      setLoading(true);
      // Fetch logic here
      const res = await axiosInstance.get(
        `/fb?startDate=${fromDate}&endDate=${toDate}&page=${page}&limit=20`,
      );
      // const res = await axiosInstance.get(`/fb?page=${page}&limit=20`);


      console.log("Final Billings Response:", res.data.data);


      if (res.data.success) {
        setFinalBillings(res.data.data || []);


        if (res.data.pagination) {
          setPagination({
            page: res.data.pagination.page,
            limit: res.data.pagination.limit,
            total: res.data.pagination.total,
            pages: res.data.pagination.totalPages,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching final billings:", error);
    } finally {
      setLoading(false);
    }
  };


const handleDelte = async (id) => {
 try {
  setDelBtnLoading(true)
  const res = await axiosInstance.delete(`/fb/${id}`)


  if(res.data.success){
    setShowConfirm(false)
    toast.success("Final Bill Deleted Successfully.")
    fetchFinalBillings(fromDate, toDate)
    setDelId('')
  }
 } catch (error) {
  console.log("error deleting final bill: ", error)
 } finally{
  setDelBtnLoading(false)
 }
}




  useEffect(() => {
    fetchFinalBillings(fromDate, toDate);
  }, [page]);


  return (
    <>
      <div className="container-fluid py-4 px-lg-4">
        <div className="panel">
          {/* Header */}
          <div className="panel-header d-flex justify-content-between align-items-center">
            <div className="panel-title fw-bold">Final Billing</div>
            <div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate("/fina-bill-add")}
              >
                New
              </button>
              {/* <button className="btn btn-sm btn-warning ms-1"> Refresh </button> */}
            </div>
          </div>


          {/* Body */}
          <div className="panel-body">
            {/* FILTER PANEL */}
            <div className="panel border rounded p-3 mb-3">
              <div className="row g-3 align-items-center">
                {/* SEARCH */}
                {/* <div className="col-lg-6">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <div className="fw-bold text-secondary small">Search</div>


                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="search"
                        id="byName"
                        checked={searchType === 'name'}
                        onChange={() => setSearchType('name')}
                      />
                      <label className="form-check-label small" htmlFor="byName">By Name</label>
                    </div>


                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="search"
                        id="byPhone"
                        checked={searchType === 'phone'}
                        onChange={() => setSearchType('phone')}
                      />
                      <label className="form-check-label small" htmlFor="byPhone">By Phone</label>
                    </div>


                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="search"
                        id="byReg"
                        checked={searchType === 'reg'}
                        onChange={() => setSearchType('reg')}
                      />
                      <label className="form-check-label small" htmlFor="byReg">By Reg No</label>
                    </div>


                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder={`Search by ${searchType}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '170px' }}
                    />
                  </div>
                </div> */}


                <div className="col-lg-8">
                  <div className="input-group input-group-sm">
                    {/* Date filters can be added here if needed */}
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                    <span className="input-group-text">to</span>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                    <button
                      className="btn btn-sm btn-primary ms-2"
                      onClick={() => {
                        setPage(1);
                        fetchFinalBillings(fromDate,toDate);
                      }}
                    >
                      <i className="fa-solid fa-filter"></i> Filter
                    </button>
                    <button
                      className="btn btn-sm btn-secondary ms-2"
                      onClick={() => {
                        setPage(1);
                        setFromDate(new Date().toISOString().split("T")[0]);
                        setToDate(new Date().toISOString().split("T")[0]);
                        fetchFinalBillings(new Date().toISOString().split("T")[0],new Date().toISOString().split("T")[0]);
                      }}
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* TABLE */}
            <div
              className="table-responsive border rounded"
              style={{ maxHeight: "440px" }}
            >
              <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Bill No.</th>
                    <th>Bill Date</th>
                    <th>Bill Time</th>
                    <th>Admission No.</th>
                    <th>Patient Name</th>
                    <th>Bill Type</th>
                    <th>Receipt Amt.</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : finalBillings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No finalBillings found
                      </td>
                    </tr>
                  ) : (
                    finalBillings.map((admission, i) => (
                      <tr key={admission.AdmitionId || i}>
                        <td>
                          <button className="btn btn-sm btn-outline-info me-1"
                            onClick={() => {
                          navigate(`/fina-bill/${encodeURIComponent(admission.FinalBillId)}/view`)  
                          }
                          }
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => {
                          navigate(`/fina-bill/${encodeURIComponent(admission.FinalBillId)}/edit`)  
                          }
                          }
                          >
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setDelId(admission.FinalBillId)
                            setShowConfirm(true)
                          }
                          }
                          >
                            <i className="fa-solid fa-trash"></i>
                           
                          </button>
                        </td>
                        <td>{admission.BillNo || "N/A"}</td>
                        <td>
                          {admission.BillDate?.split("T")[0]
                            ?.split("-")
                            ?.reverse()
                            ?.join("/") || "N/A"}
                        </td>
                        <td>{admission.BillTime || "N/A"}</td>
                        <td>{admission.AdmissionNo || "N/A"}</td>
                        <td>{admission.PatientName || "N/A"}</td>
                        <td>{admission.BillType || "N/A"}</td>
                        <td>{admission.ReciptAmt || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* Footer / Pagination */}
          <div className="panel-footer d-flex justify-content-between flex-wrap gap-2 p-3">
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>


              <span className="small">
                Page {pagination.page} of {pagination.pages || 1}
              </span>


              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>


            <div className="btn-group">
              {/* Extra action buttons can go here */}
            </div>
          </div>
        </div>
      </div>
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
                    disabled={delBtnLoading}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={() => {
                   handleDelte(delId)
                  }
                  }
                  disabled={delBtnLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default FinalBillingListB;





