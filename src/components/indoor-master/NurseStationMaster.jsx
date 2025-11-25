import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const NurseStationMaster = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingStation, setEditingStation] = useState(null);

  const [formData, setFormData] = useState({
    NurseStation: "",
  });

  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/nurse-stations");
      if (response.data.success) {
        setStations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching nurse stations:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ NurseStation: "" });
    setEditingStation(null);
    setShowSidebar(true);
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setFormData({
      NurseStation: station.NurseStation || "",
    });
    setShowSidebar(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      try {
        await axiosInstance.delete(`/nurse-stations/${id}`);
        alert("Station deleted successfully!");
        fetchStations();
      } catch (error) {
        alert("Error deleting station");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStation) {
        await axiosInstance.put(
          `/nurse-stations/${editingStation.NurseStationId}`,
          formData
        );
        alert("Station updated successfully!");
      } else {
        const nextId =
          stations.length > 0
            ? Math.max(...stations.map((s) => s.NurseStationId)) + 1
            : 1;

        await axiosInstance.post("/nurse-stations", {
          ...formData,
          NurseStationId: nextId,
        });

        alert("Station created successfully!");
      }

      setShowSidebar(false);
      setEditingStation(null);
      setFormData({ NurseStation: "" });
      fetchStations();
    } catch (error) {
      alert("Error saving station");
    }
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          <div className="panel">
            <div className="panel-header">
              <h5>🏥 Nurse Station Master</h5>

              <div className="btn-box d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : stations.length === 0 ? (
                <div className="text-center text-muted py-5">No stations found</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dashed table-hover digi-dataTable table-striped">
                    <thead>
                      <tr>
                        <th className="no-sort">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" />
                          </div>
                        </th>

                        {/* ACTION COLUMN */}
                        <th style={{ width: "80px" }}>Action</th>

                        <th>Sl No.</th>
                        <th>Station Name</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stations.map((station, idx) => (
                        <tr key={station.NurseStationId}>

                          {/* CHECKBOX */}
                          <td>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" />
                            </div>
                          </td>

                          {/* FIXED — ACTION EXACTLY UNDER HEADER */}
                          <td style={{ padding: "0px 6px", width: "80px" }}>
                            <div
                              className="btn-box"
                              style={{
                                display: "flex",
                                gap: "6px",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                margin: 0,
                                padding: 0,
                              }}
                            >
                              <button
                                onClick={() => handleEdit(station)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: "3px",
                                  margin: 0,
                                  cursor: "pointer",
                                }}
                              >
                                <i className="fa-light fa-pen"></i>
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(station.NurseStationId)
                                }
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: "3px",
                                  margin: 0,
                                  cursor: "pointer",
                                }}
                              >
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td>{idx + 1}</td>
                          <td>
                            
                            {station.NurseStation}</td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowSidebar(false)}
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: "0",
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

            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "#0a1735",
                }}
              >
                {editingStation ? "✏️ Edit Nurse Station" : "➕ Add Station"}
              </div>

              <div style={{ height: "calc(100% - 70px)", overflowY: "auto" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Station Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.NurseStation}
                        onChange={(e) =>
                          setFormData({ NurseStation: e.target.value })
                        }
                        maxLength={12}
                        required
                      />
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowSidebar(false)}
                      >
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit">
                        {editingStation ? "Update" : "Save"}
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

export default NurseStationMaster;
