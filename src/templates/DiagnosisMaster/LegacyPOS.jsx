import React, { useEffect, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
//import Footer from '../components/footer/Footer';

const LegacyPOS = () => {
  const navigate = useNavigate();

  const [bookingList, setBookingList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedBooking, setSelectedBooking] = useState({});

  const fetchBoookingList = async () => {
    try {
      const response = await axiosInstance.get(
        `/case01/search?startDate=${startDate}&endDate=${endDate}`
      );
      console.log("bookingList: ", response.data.data);
      setBookingList(response?.data?.data || []);

      setTotalPages(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching booking list:", error);
    }
  };

  useEffect(() => {
    fetchBoookingList();
  }, [startDate, endDate]);

  // // useEffect(() => {
  // //   console.log("My value is changed: ", Object.keys(selectedBooking).length);
  // // }, [selectedBooking]);

  // // deobouncing for date range
  // const useDebounce = (startDate, endDate, delay = 500) => {
  //   const [startDt, setStartDt] = useState("");
  //   const [endDt, setEndDt] = useState("");

  //   useEffect(() => {
  //     const timeOut = setTimeout(() => {
  //       setStartDt(startDate);
  //       setEndDt(endDate);
  //     }, delay);

  //     return () => clearTimeout(timeOut);
  //   }, [delay, startDt, endDt]);
  //   return {startDt, endDt}
  // };

  return (
    <div className="main-content">
      <div className="panel">
        {/* --- Header --- */}
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Diagnostic POS</h5>
          <button className="btn btn-sm btn-danger">
            <i className="fa-light fa-xmark"></i>
          </button>
        </div>

        <div className="panel-body">
          {/* --- Top Filters --- */}
          <div className="panel border rounded p-3 mb-3 ">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label small text-muted">Date From</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted">Date To</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="row g-3">
            {/* --- Left Sidebar: Registration List --- */}
            <div className="col-md-3">
              <div className="panel border h-100">
                <div className="panel-header  py-2 px-3 border-bottom">
                  <h6 className="mb-0 small fw-bold">
                    Registration No (currently showing caseId)
                  </h6>
                </div>
                <div style={{ height: "400px" }}>
                  <OverlayScrollbarsComponent
                    style={{ height: "100%", width: "100%" }}
                  >
                    <ul className="list-group list-group-flush small">
                      {/* <li className="list-group-item list-group-item-action active">
                        <span className="fw-bold">REG-2023-001</span>
                      </li> */}
                      {/* {[...Array(20)].map((_, i) => (
                        <li
                          key={i}
                          className="list-group-item list-group-item-action"
                        >
                          REG-2023-00{i + 2}f
                        </li>
                      ))} */}

                      {bookingList.map((booking, i) => (
                        <li
                          key={i}
                          className="list-group-item list-group-item-action"
                          onClick={() => {
                            setSelectedBooking(booking);
                          }}
                        >
                          {booking.CaseId}
                        </li>
                      ))}
                    </ul>
                  </OverlayScrollbarsComponent>
                </div>
              </div>
            </div>

            {/* --- Right Panel: Actions & Grid --- */}
            <div className="col-md-9 d-flex flex-column gap-3">
              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    navigate("/PatientRegistrationList");
                  }}
                >
                  <i className="fa-light fa-user-plus me-1"></i>Patient
                  Registration
                </button>
                <button
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    navigate("/table-data");
                  }}
                >
                  <i className="fa-light fa-clipboard-user me-1"></i>Visit Entry
                </button>
                <button
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    navigate("/CaseList");
                  }}
                >
                  <i className="fa-light fa-file-medical me-1"></i>Case Entry
                </button>
                <button
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    navigate("/HealthCard");
                  }}
                >
                  <i className="fa-light fa-id-card me-1"></i>Health Card
                </button>
                <button
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    navigate("/othercharges");
                  }}
                >
                  <i className="fa-light fa-money-bill me-1"></i>Other Charges
                </button>
                <button
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    navigate("/sampleReceipts");
                  }}
                >
                  <i className="fa-light fa-hand-holding-dollar me-1"></i>2nd
                  Money Rcv
                </button>
                <button
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    navigate("/moneyreceipt");
                  }}
                >
                  <i className="fa-light fa-receipt me-1"></i>Other 2nd Rcv
                </button>
              </div>

              {/* Data Grid */}
              <div className="panel border flex-grow-1">
                <div className="table-responsive" style={{ height: "350px" }}>
                  <OverlayScrollbarsComponent
                    style={{ height: "100%", width: "100%" }}
                  >
                    <table className="table table-striped table-hover table-dashed table-sm mb-0">
                      <thead className="sticky-top  z-1">
                        <tr>
                          <th>Patient Name</th>
                          <th>Registration No</th>
                          <th>Date</th>
                          <th>Customer Reg</th>
                          <th>Phone No</th>
                          <th>Address 1</th>
                          <th>Address 2</th>
                          <th>Address 3</th>
                        </tr>
                      </thead>
                      {Object.keys(selectedBooking).length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-muted text-center small py-3 "
                          >
                            No data is selected.
                          </td>
                        </tr>
                      ) : (
                        <tbody>
                          {/* Input Row for New Entry */}
                          <tr className="">
                            <td className="p-1">
                              {selectedBooking.PatientName}
                            </td>
                            <td className="p-1">NA</td>
                            <td className="p-1">
                              {selectedBooking.CaseDate.split("T")[0]}
                            </td>
                            <td className="p-1">NA</td>
                            <td className="p-1">
                              {selectedBooking.MobileNo || "NA"}
                            </td>
                            <td className="p-1">
                              {selectedBooking.Add1 || "NA"}
                            </td>
                            <td className="p-1">
                              {selectedBooking.Add2 || "NA"}
                            </td>
                            <td className="p-1">
                              {selectedBooking.Add3 || "NA"}
                            </td>
                          </tr>
                          {/* Empty Rows Filler
                          {[...Array(10)].map((_, i) => (
                            <tr key={i}>
                              <td
                                colSpan={7}
                                className="text-muted text-center small py-3 opacity-25"
                              >
                                &nbsp;
                              </td>
                            </tr>
                          ))} */}
                        </tbody>
                      )}
                    </table>
                  </OverlayScrollbarsComponent>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyPOS;
