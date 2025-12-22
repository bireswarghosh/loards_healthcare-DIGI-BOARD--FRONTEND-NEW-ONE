import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const DiagBookingList = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState("List");
  const [searchBy, setSearchBy] = useState("bookingNo"); // 'bookingNo' | 'patientName'
  
  // Date state initialized to match screenshot logic or today
  const [dateFrom, setDateFrom] = useState("2025-12-20");
  const [dateTo, setDateTo] = useState("2025-12-20");

  const [bookings, setBookings] = useState([]); // Data grid source
  const [selectedRow, setSelectedRow] = useState(null);

  // --- Mock Data Loading ---
  useEffect(() => {
    // Simulating empty grid or initial load
    setBookings([]); 
  }, []);

  // --- Handlers ---
  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="main-content">
      <div className="panel" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* ------------------------------------------------
            WINDOW HEADER
            ------------------------------------------------ */}
        <div className="panel-header d-flex justify-content-between align-items-center py-1">
          <div className="d-flex align-items-center gap-2">
             {/* Legacy Icon Placeholder */}
            <i className="fa fa-e me-1 text-danger"></i> 
            <h6 className="m-0 fw-bold">Booking</h6>
          </div>
        </div>

        <div className="panel-body p-0 d-flex flex-column flex-grow-1">
            
            {/* ------------------------------------------------
                FILTER / SEARCH SECTION
                ------------------------------------------------ */}
            <div className="panel border-bottom p-2 bg---rt-color-dark">
                <div className="row g-2 align-items-center">
                    
                    {/* Radio Buttons */}
                    <div className="col-auto d-flex gap-3" >
                        <div className="form-check m-0">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="searchBy"
                                id="chkBookingNo"
                                checked={searchBy === "bookingNo"}
                                onChange={() => setSearchBy("bookingNo")}
                            />
                            <label className="form-check-label small fw-bold" htmlFor="chkBookingNo">
                                Booking No
                            </label>
                        </div>
                        <div className="form-check m-0">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="searchBy"
                                id="chkPatientName"
                                checked={searchBy === "patientName"}
                                onChange={() => setSearchBy("patientName")}
                            />
                            <label className="form-check-label small fw-bold" htmlFor="chkPatientName">
                                Patient Name
                            </label>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="col-auto ms-4 "></div>

                    {/* Date From */}
                    <div className="col-auto d-flex align-items-center gap-2 ">
                        <label className="form-label m-0 small fw-bold">Date From</label>
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
                <div className="flex-grow-1 border-end d-flex flex-column" style={{ width: "75%" }}>
                    <div className="flex-grow-1 bg-secondary bg-opacity-25" style={{ border: "1px solid #c27070ff" }}> 
                    {/* Applied border style from reference */}
                    
                    {/* UPDATED: height set to 100% to fill the flex container automatically */}
                    <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
                        <table className="table table-sm table-striped table-hover table-bordered mb-0 bg---rt-color-dark ">
                            
                            {/* UPDATED: Removed table-light, added bg-secondary bg-opacity-25 to match container */}
                            <thead className="bg-secondary bg-opacity-25" style={{ position: "sticky", top: 0, zIndex: 1, fontSize: "0.85rem" }}>
                                <tr>
                                    <th style={{ width: "15%", backgroundColor: "inherit" }}>Booking No</th>
                                    <th style={{ width: "15%", backgroundColor: "inherit" }}>Date</th>
                                    <th style={{ width: "40%", backgroundColor: "inherit" }}>Patient Name</th>
                                    <th style={{ width: "30%", backgroundColor: "inherit" }}>Booking For</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    /* Empty rows to mimic legacy grid look if needed, or just standard "No Data" */
                                    <tr style={{ height: "400px" }}>
                                         <td colSpan={4} className="text-center align-middle text-muted">
                                            {/* Legacy grids are often just blank gray when empty */}
                                         </td>
                                    </tr>
                                ) : (
                                    bookings.map((row, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => setSelectedRow(idx)}
                                            className={selectedRow === idx ? "table-primary" : ""}
                                        >
                                            <td>{row.bookingNo}</td>
                                            <td>{row.date}</td>
                                            <td>{row.patientName}</td>
                                            <td>{row.bookingFor}</td>
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
                    
                    <button className="btn btn-sm btn-primary">
                        New
                    </button>

                    <button className="btn btn-sm btn-primary">
                        Edit
                    </button>

                    <button className="btn btn-sm btn-primary" disabled>
                        Save
                    </button>

                    <button className="btn btn-sm btn-primary">
                        Delete
                    </button>

                    <button className="btn btn-sm btn-primary" disabled>
                        Undo
                    </button>

                    {/* Separators removed to match DoctorBusiness style */}

                    <button className="btn btn-sm btn-primary">
                        Bill
                    </button>

                    <button className="btn btn-sm btn-primary">
                        Bill Win
                    </button>

                    <button className="btn btn-sm btn-primary">
                        Exit
                    </button>

                    <button className="btn btn-sm btn-primary">
                        Prev
                    </button>

                    <button className="btn btn-sm btn-primary">
                        Next
                    </button>

            </div>

        </div>
      </div>
    </div>
  );
};

export default DiagBookingList;