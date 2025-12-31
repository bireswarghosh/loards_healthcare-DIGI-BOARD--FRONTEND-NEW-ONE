import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DiagBookingList = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState("List");
  const [searchBy, setSearchBy] = useState("PatientName"); // 'phone no' | 'patientName'
  const [searchValue, setSearchValue] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Date state initialized to match screenshot logic or today
  //   const date = String( new Date(Date.now()).toISOString().slice(2, 10))
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [bookings, setBookings] = useState([]); // Data grid source
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate("");

  // delete confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  // fetch Bookings function
  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get(
        `/bookings/search?${searchBy}=${searchValue}&startDate=${dateFrom}&endDate=${dateTo}&page=${page}`
      );
      setBookings(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.log("Error fetching bookings: ", error);
    }
  };

  // function handle del
  const handleDel = async (id) => {
    try {
      setShowConfirm(false);
      const res1 = await axiosInstance.delete(`/booking-details/booking/${id}`);
      console.log("res1 del details: ", res1);
      const res = await axiosInstance.delete(`/bookings/${id}`);
      console.log("res del booking: ", res);
      toast.success(res.data.message);
      fetchBookings();
    } catch (error) {
      console.log("error del booking: ", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, dateFrom, dateTo, searchValue]);

  // --- Handlers ---
  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="main-content">
      <div
        className="panel"
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1">
          <h6 className="m-0 fw-bold">Booking</h6>
          <button
            className="btn btn-success"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/DiagBooking/add`);
            }}
          >
            Add
          </button>
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1">
          {/* ------------------------------------------------
                FILTER / SEARCH SECTION
                ------------------------------------------------ */}
          <div className="panel border-bottom p-2 bg---rt-color-dark">
            <div className="row g-2 align-items-center">
              {/* Radio Buttons */}
              <div className="col-auto d-flex gap-3">
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="searchBy"
                    id="chkBookingNo"
                    checked={searchBy === "Phone"}
                    onChange={() => setSearchBy("Phone")}
                  />
                  <label
                    className="form-check-label small fw-bold"
                    htmlFor="chkBookingNo"
                  >
                    Phone No.
                  </label>
                </div>
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="searchBy"
                    id="chkPatientName"
                    checked={searchBy === "PatientName"}
                    onChange={() => setSearchBy("PatientName")}
                  />
                  <label
                    className="form-check-label small fw-bold"
                    htmlFor="chkPatientName"
                  >
                    Patient Name
                  </label>
                </div>
                <div className="form-check m-0">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder={
                      searchBy === "PatientName"
                        ? "Search By Patient Name..."
                        : "Search By Phone No..."
                    }
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    value={searchValue}
                  />
                </div>
              </div>

              {/* Spacer */}
              <div className="col-auto ms-4 "></div>

              {/* Date From */}
              <div className="col-auto d-flex align-items-center gap-2 ">
                <label className="form-label m-0 small fw-bold">
                  Date From
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{ width: "130px" }}
                />
              </div>

              {/* Date To */}
              <div className="col-auto d-flex align-items-center gap-2">
                <label className="form-label m-0 small fw-bold">Date To</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{ width: "130px" }}
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------
                MAIN CONTENT (GRID + RIGHT PANEL)
                ------------------------------------------------ */}
          <div className="d-flex flex-grow-1" style={{ overflow: "hidden" }}>
            {/* LEFT: DATA GRID */}
            <div
              className="flex-grow-1 border-end d-flex flex-column"
              style={{ width: "75%" }}
            >
              <div
                className="flex-grow-1 bg-secondary bg-opacity-25"
                style={{ border: "1px solid #c27070ff" }}
              >
                {/* Applied border style from reference */}

                {/* UPDATED: height set to 100% to fill the flex container automatically */}
                <OverlayScrollbarsComponent
                  style={{ height: "100%", width: "100%" }}
                >
                  <table className="table table-sm table-striped table-bordered mb-0  ">
                    {/* UPDATED: Removed table-light, added bg-secondary bg-opacity-25 to match container */}
                    <thead
                      className="bg-secondary bg-opacity-25"
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        fontSize: "0.85rem",
                      }}
                    >
                      <tr>
                        <th>Action</th>
                        <th>Sl No.</th>
                        <th
                        //   style={{ width: "15%", backgroundColor: "inherit" }}
                        >
                          Booking No
                        </th>
                        <th
                        //   style={{ width: "15%", backgroundColor: "inherit" }}
                        >
                          Date
                        </th>
                        <th
                        //   style={{ width: "40%", backgroundColor: "inherit" }}
                        >
                          Patient Name
                        </th>
                        <th
                        //   style={{ width: "30%", backgroundColor: "inherit" }}
                        >
                          Booking For
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        /* Empty rows to mimic legacy grid look if needed, or just standard "No Data" */
                        <tr style={{ height: "400px" }}>
                          <td
                            colSpan={4}
                            className="text-center align-middle text-muted"
                          >
                            No data available.
                            {/* Legacy grids are often just blank gray when empty */}
                          </td>
                        </tr>
                      ) : (
                        bookings.map((row, idx) => (
                          <tr
                            key={idx}
                            onClick={() => setSelectedRow(idx)}
                            className={selectedRow === idx ? "" : ""}
                          >
                            <td>
                              <div className="d-flex gap-2">
                                {/* View Button */}
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const id = row.BookingId;
                                    // console.log("view: ", id);
                                    navigate(
                                      `/DiagBooking/${encodeURIComponent(
                                        id
                                      )}/view`
                                    );
                                  }}
                                >
                                  <i className="fa-light fa-eye"></i>
                                </div>

                                {/* Edit Button */}
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const id = row.BookingId;
                                    // console.log("edit ", id);
                                    navigate(
                                      `/DiagBooking/${encodeURIComponent(
                                        id
                                      )}/edit`
                                    );
                                  }}
                                >
                                  <i className="fa-light fa-pen-to-square"></i>
                                </div>

                                {/* Delete Button */}
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const id = row.BookingId;

                                    setSelectedId(id);
                                    setShowConfirm(true);
                                  }}
                                >
                                  <i className="fa-light fa-trash-can"></i>
                                </div>
                              </div>
                            </td>
                            <td>{idx + 1}</td>
                            <td>{row.BookingNo}</td>
                            <td>
                              {row.BookingDate?.split("T")[0]
                                .split("-")
                                .reverse()
                                .join("-")}
                            </td>
                            <td>{row.PatientName}</td>
                            <td>
                              {row.BookingFor?.split("T")[0]
                                .split("-")
                                .reverse()
                                .join("-")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </OverlayScrollbarsComponent>
              </div>
            </div>

            {/* RIGHT: BLANK PANEL */}
          </div>

          {/* ------------------------------------------------
                FOOTER BUTTON BAR
                ------------------------------------------------ */}
          {/* Updated container to match DoctorBusiness design: center aligned, dark bg, border */}
          <div className="panel-footer mt-auto d-flex gap-1 justify-content-center bg---rt-color-dark p-2 border-top">
            {/* Buttons updated to btn-primary to match design */}

            {/* <button className="btn btn-sm btn-primary">New</button> */}

            {/* Separators removed to match DoctorBusiness style */}

            {/* <button className="btn btn-sm btn-primary">Bill</button> */}

            {/* <button className="btn btn-sm btn-primary">Bill Win</button> */}

            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  if (page >= 2) {
                    setPage((c) => c - 1);
                  }
                }}
              >
                Prev
              </button>
              <div>{`${page}/${totalPages}`}</div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  if (page < totalPages) {
                    setPage((c) => c + 1);
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5>Delete?</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <p className="fw-semibold mb-1">
                  Are you sure you want to permanently delete this record?
                </p>
                <small className="text-muted">
                  This action cannot be undone.
                </small>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleDel(selectedId);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagBookingList;
