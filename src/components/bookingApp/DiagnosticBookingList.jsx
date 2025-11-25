import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const DiagnosticBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState("add"); 
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    test_name: "",
    test_date: "",
    test_time: "",
    status: "pending",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/diagnostic/bookings");
      setBookings(response.data.data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    setMode("add");
    setFormData({
      patient_id: "",
      test_name: "",
      test_date: "",
      test_time: "",
      status: "pending",
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (booking) => {
    setMode("edit");
    setSelectedBooking(booking);

    setFormData({
      patient_id: booking.patient_id || "",
      test_name: booking.test_name || "",
      test_date: booking.appointment_date?.split("T")[0] || "",
      test_time: booking.appointment_time || "",
      status: booking.status || "pending",
    });

    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      let response;
      if (mode === "edit") {
        response = await axiosInstance.put(
          `/diagnostic/booking/${selectedBooking.id}/status`,
          { status: formData.status }
        );
      } else {
        response = await axiosInstance.post("/diagnostic/booking", formData);
      }

      if (response.data.success) {
        fetchBookings();
        setDrawerOpen(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-warning",
      confirmed: "bg-primary",
      completed: "bg-success",
      cancelled: "bg-danger",
    };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  return (
    <>
      <div className="main-content">
        <div className="panel">
          <div className="panel-header d-flex justify-content-between align-items-center">
            <h5>🧪 Diagnostic Bookings</h5>
            <button className="btn btn-sm btn-primary" onClick={openAddDrawer}>
              <i className="fa-light fa-plus"></i> Add New
            </button>
          </div>

          <div className="panel-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <OverlayScrollbarsComponent>
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th className="text-start">Action</th>
                      <th>Name</th>
                      <th>Test</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      bookings.map((row) => (
                        <tr key={row.id}>
                          <td className="text-start">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditDrawer(row)}
                            >
                              Update Status
                            </button>
                          </td>

                          <td>{row.name}</td>
                          <td>{row.test_name}</td>
                          <td>
                            {row.appointment_date
                              ? new Date(row.appointment_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>{row.appointment_time || "N/A"}</td>
                          <td>{getStatusBadge(row.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </OverlayScrollbarsComponent>
            )}
          </div>
        </div>

        {drawerOpen && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={() => setDrawerOpen(false)}
              style={{ zIndex: 9998 }}
            ></div>

            <div
              className="profile-right-sidebar active"
              style={{
                zIndex: 9999,
                width: "100%",
                maxWidth: "500px",
                right: drawerOpen ? "0" : "-100%",
                top: "70px",
                height: "calc(100vh - 70px)",
              }}
            >
              <button
                className="right-bar-close"
                onClick={() => setDrawerOpen(false)}
              >
                <i className="fa-light fa-angle-right"></i>
              </button>

              <div className="top-panel">
                <div
                  className="dropdown-txt"
                  style={{ position: "sticky", top: 0, background: "#0a1735" }}
                >
                  {mode === "add" ? "➕ Add Booking" : "✏️ Update Status"}
                </div>

                <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                  <div className="p-3">
                    <div className="row g-3">
                      {mode === "add" && (
                        <>
                          

                          <div className="col-md-12">
                            <label>Test Name</label>
                            <input
                              className="form-control"
                              value={formData.test_name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  test_name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-md-6">
                            <label>Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={formData.test_date}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  test_date: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-md-6">
                            <label>Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={formData.test_time}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  test_time: e.target.value,
                                })
                              }
                            />
                          </div>
                        </>
                      )}

                      <div className="col-md-12">
                        <label>Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-secondary w-50"
                        onClick={() => setDrawerOpen(false)}
                      >
                        Cancel
                      </button>
                      <button className="btn btn-primary w-50" onClick={handleSave}>
                        {mode === "add" ? "Create Booking" : "Update Status"}
                      </button>
                    </div>
                  </div>
                </OverlayScrollbarsComponent>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DiagnosticBookingList;
