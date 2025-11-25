import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const NurseStationDetailMaster = () => {
  const [details, setDetails] = useState([]);
  const [stations, setStations] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    NurseStationId: "",
    BedId: "",
  });

  const fetchDetails = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/nurse-station-details?page=${page}&limit=100`
      );
      if (response.data.success) {
        setDetails(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching nurse station details:", error);
    }
    setLoading(false);
  };

  const fetchStations = async () => {
    try {
      const response = await axiosInstance.get("/nurse-stations");
      if (response.data.success) {
        setStations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching nurse stations:", error);
    }
  };

  const fetchAvailableBeds = async () => {
    try {
      const response = await axiosInstance.get("/available-beds");
      if (response.data.success) {
        setAvailableBeds(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching available beds:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        NurseStationId: parseInt(formData.NurseStationId),
        BedId: parseInt(formData.BedId),
      };

      if (editingDetail) {
        await axiosInstance.put(
          `/nurse-station-details/${editingDetail.NurseStationId}/${editingDetail.BedId}`,
          submitData
        );
        alert("Nurse station detail updated successfully!");
      } else {
        await axiosInstance.post("/nurse-station-details", submitData);
        alert("Nurse station detail created successfully!");
      }

      setShowSidebar(false);
      setFormData({ NurseStationId: "", BedId: "" });
      setEditingDetail(null);
      fetchDetails(pagination.page);
      fetchAvailableBeds();
    } catch (error) {
      console.error("Error saving nurse station detail:", error);
      alert("Error saving nurse station detail");
    }
  };

  const handleEdit = (detail) => {
    setEditingDetail(detail);
    setFormData({
      NurseStationId: detail.NurseStationId || "",
      BedId: detail.BedId || "",
    });
    setShowSidebar(true);
  };

  const handleDelete = async (stationId, bedId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await axiosInstance.delete(
          `/nurse-station-details/${stationId}/${bedId}`
        );
        alert("Assignment deleted successfully!");
        fetchDetails(pagination.page);
        fetchAvailableBeds();
      } catch (error) {
        console.error("Error deleting assignment:", error);
        alert("Error deleting assignment");
      }
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchStations();
    fetchAvailableBeds();
  }, []);

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header d-flex justify-content-between">
              <h5>🛏️ Nurse Station Bed Assignment</h5>

              <div className="btn-box d-flex gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setEditingDetail(null);
                    setFormData({ NurseStationId: "", BedId: "" });
                    setShowSidebar(true);
                  }}
                >
                  <i className="fa-light fa-plus"></i> Assign Bed
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <>
                  {/* Pagination info */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>
                      Showing {details.length} of {pagination.total}
                    </span>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchDetails(pagination.page - 1)}
                      >
                        Previous
                      </button>

                      <span className="btn btn-outline-secondary btn-sm disabled">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchDetails(pagination.page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* EMR Theme Table */}
                  <div className="table-responsive">
                    <table className="table table-dashed table-hover digi-dataTable table-striped">
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>Station ID</th>
                          <th>Station Name</th>
                          <th>Bed ID</th>
                          <th>Bed Name</th>
                        </tr>
                      </thead>

                      <tbody>
                        {details.map((detail) => (
                          <tr
                            key={`${detail.NurseStationId}-${detail.BedId}`}
                          >
                            {/* LEFT ACTION – EMR STYLE btn-box */}
                            <td>
                              <div className="btn-box">
                                <button onClick={() => handleEdit(detail)}>
                                  <i className="fa-light fa-pen"></i>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      detail.NurseStationId,
                                      detail.BedId
                                    )
                                  }
                                >
                                  <i className="fa-light fa-trash"></i>
                                </button>
                              </div>
                            </td>

                            <td>{detail.NurseStationId}</td>
                            <td>{detail.NurseStation || "-"}</td>
                            <td>{detail.BedId}</td>
                            <td>{detail.BedNo || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EMR Right Sidebar (NO MODAL) */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowSidebar(false)}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className={`profile-right-sidebar ${
              showSidebar ? "active" : ""
            }`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: showSidebar ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowSidebar(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%", paddingTop: "10px" }}>
              {/* Sidebar Title Bar */}
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "#0a1735",
                }}
              >
                {editingDetail
                  ? "✏️ Edit Bed Assignment"
                  : "➕ Assign Bed to Station"}
              </div>

              {/* Scrollable Form Area */}
              <div
                style={{
                  height: "calc(100% - 70px)",
                  overflowY: "auto",
                }}
              >
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Nurse Station *</label>
                      <select
                        className="form-select"
                        required
                        value={formData.NurseStationId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            NurseStationId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Select Station --</option>
                        {stations.map((st) => (
                          <option
                            key={st.NurseStationId}
                            value={st.NurseStationId}
                          >
                            {st.NurseStation}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Available Bed *</label>
                      <select
                        className="form-select"
                        required
                        value={formData.BedId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            BedId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Select Bed --</option>
                        {availableBeds.map((bed) => (
                          <option key={bed.BedId} value={bed.BedId}>
                            {bed.BedNo} - {bed.Ward}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowSidebar(false)}
                      >
                        Cancel
                      </button>

                      <button type="submit" className="btn btn-primary w-50">
                        {editingDetail ? "Update" : "Assign"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NurseStationDetailMaster;
