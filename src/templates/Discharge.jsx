import React, { useEffect, useState } from "react";
// import axiosInstance from "../../axiosInstance";
// import PaginationBar from "./PaginationBar";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PaginationBar from "./DiagnosisMaster/PaginationBar";
import axiosInstance from "../axiosInstance";

const Discharge = () => {
  const [dischargeList, setDischargeList] = useState([]);
  const getToday = () => new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [userId, setUserId] = useState("");
  const [discType, setDiscType] = useState(null);

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  /* ================= DELETE ================= */
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

    /* ================= DELETE ================= */
    const confirmDelete = async () => {
      try {
        await axiosInstance.delete(`/discert/${deleteId}`);
        // console.log("hi");
        
        toast.success("Deleted successfully");
        setShowConfirm(false);
        fetchDischarge();
      } catch {
        toast.error("Delete failed");
      }
    };
  //     const fetchDischarge=async()=>{
  // try {
  //     const res = await axiosInstance.get(
  //       `/discert?startDate=${startDate}&endDate=${endDate}&page=${pageNo}`
  //     );
  //     // &UserId=${userId}&DiscType=${discType}
  //     setDischargeList(res?.data?.data || [])
  //      setTotalPages(res?.data?.pagination?.totalPages);

  // } catch (error) {
  //     console.log("error fetching ", error);

  // }
  //     }
  const fetchDischarge = async () => {
    try {
      const res = await axiosInstance.get("/discert", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: pageNo,
        },
      });

      setDischargeList(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("error fetching", error);
    }
  };

  const handleSearch = () => {
    setPageNo(1); // page reset
    fetchDischarge(); // API call
  };
  const clearSearch = () => {
    const today = getToday();
    setStartDate(today);
    setEndDate(today);
    setPageNo(1);
    fetchDischarge();
  };

  useEffect(() => {
    fetchDischarge();
  }, [pageNo]);

  // const goToPage = (p) => {
  //   if (p < 1 || p > totalPages) return;
  //   setPageNo(p);
  // };

  return (
    <div>
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h1></h1>

        <div className="d-flex gap-2 align-items-center">
          Form-
          <input
            type="date"
            className="form-control form-control-sm"
            placeholder="Form"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 150 }}
          />
          To-
          <input
            type="date"
            className="form-control form-control-sm"
            placeholder="Form"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: 150 }}
          />
          <button className="btn btn-sm btn-info" onClick={handleSearch}>
            <i className="fa fa-search"></i>
          </button>
          <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
            Clear
          </button>
          <NavLink className="btn btn-sm btn-primary" to={`/discharge/add`}>
            <i className="fa-light fa-plus"></i> Add
          </NavLink>
        </div>
      </div>
      <div
        className="flex-grow-1 border  mb-1"
        style={{ minHeight: "150px" }}
      >
        <table
          className="table table-sm table-bordered table-striped mb-0"
          style={{ fontSize: "0.8rem" }}
        >
          <thead
            className="bg-primary text-white"
            style={{ position: "sticky", top: 0, zIndex: 10 }}
          >
            <tr>
              <th>Action</th>
              <th>Discharge No.</th>
              <th>Discharge Time</th>
              <th>Discharge Date</th>
              <th>Patient Name</th>
              {/* <th>Under Dr.</th> */}
              <th>Admission No.</th>
              <th>Admission Date</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            {dischargeList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted">
                  No records found
                </td>
              </tr>
            ) : (
              dischargeList.map((item, index) => (
                <tr key={index} style={{ cursor: "pointer" }}>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() =>
                          navigate(
                            `/discharge/${encodeURIComponent(item.DisCerId)}`
                          )
                        }
                      >
                        <i className="fa-light fa-eye" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          navigate(
                            `/discharge/${encodeURIComponent(
                              item.DisCerId
                            )}/edit`
                          )
                        }
                      >
                        <i className="fa-light fa-pen" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          console.log(item.DisCerId);

                          setDeleteId(item.DisCerId);
                          setShowConfirm(true);
                        }}
                      >
                        <i className="fa-light fa-trash" />
                      </button>
                    </div>
                  </td>
                  <td>{item.DisCerNo}</td>
                  <td>{item.DisCerTime}</td>
                  <td>{item.DisCerDate.split("T")[0]}</td>

                  {/* <td></td> */}

                  {/* <td>{item.DoctorId}</td> */}
                  <td>{/* {doctorMap[item.DoctorId]} */}</td>

                  <td>A-{item.AdmitionId}</td>
                  <td></td>
                  <td>{item.AgentId}</td>

                  

                  <td>{item.Date}</td>
                </tr>
              ))
            )}

            {/* Empty filler row (same as your code) */}
            <tr style={{ height: "100%" }}>
              <td colSpan={10} className="p-0 border-0"></td>
            </tr>
          </tbody>
        </table>
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
      <PaginationBar
        pageNo={pageNo}
        totalPages={totalPages}
        // onPageChange={goToPage}
        setPageNo={setPageNo}
      />
    </div>
  );
};

export default Discharge;