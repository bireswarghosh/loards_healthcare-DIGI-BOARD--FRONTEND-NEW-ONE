import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import PaginationBar from "../templates/DiagnosisMaster/PaginationBar";
import { Navigate, NavLink, useNavigate } from "react-router-dom";

const Discharge = () => {
  const [dischargeList, setDischargeList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userId, setUserId] = useState("");
  const [discType, setDiscType] = useState(null);

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

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
    setStartDate("");
    setEndDate("");
    setPageNo(1);
    fetchDischarge();
  };

  useEffect(() => {
    fetchDischarge();
  }, [pageNo]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPageNo(p);
  };

  return (
    <div>
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h5>🎯 Salutation</h5>

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
        className="flex-grow-1 border bg-secondary bg-opacity-25 mb-1"
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
              <th>Under Dr.</th>
              <th>Admission No.</th>
              <th>Admissin Date</th>
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
                        onClick={() => {}}
                      >
                        <i className="fa-light fa-trash" />
                      </button>
                    </div>
                  </td>
                  <td>{item.DisCerNo}</td>
                  <td>{item.DisCerTime}</td>
                  <td>{item.DisCerDate.split("T")[0]}</td>

                  <td></td>

                  {/* <td>{item.DoctorId}</td> */}
                  <td>{/* {doctorMap[item.DoctorId]} */}</td>

                  <td>A-{item.AdmitionId}</td>
                  <td></td>
                  <td>{item.AgentId}</td>

                  <td className="text-center">
                    <input
                      type="checkbox"
                      // checked={item.Cancel === 1}
                      onChange={(e) => {
                        console.log("Cancel changed:", e.target.checked);
                      }}
                    />
                  </td>

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

      <PaginationBar
        pageNo={pageNo}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
};

export default Discharge;