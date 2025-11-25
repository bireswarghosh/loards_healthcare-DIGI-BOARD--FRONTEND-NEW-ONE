import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const DayCareBedRate = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateData, setRateData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    DayCare: "",
    Rate: "",
    
  });

  const fetchDayCares = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/dayCare");
      if (response.data.success) {
        setRateData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching day cares:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDayCares();
  }, []);

  const handleOpenAdd = () => {
    setEditingRate(null);
    setShowSidebar(true);
  };

  const handleEdit = (item) => {
    setEditingRate(item);
    setFormData({
      DayCare: item.DayCare,
      Rate: item.Rate,
    });
    setShowSidebar(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete ${item.DayCare}?`)) {
      try {
        await axiosInstance.delete(`/dayCare/${item.DayCareId}`);
        fetchDayCares();
      } catch (error) {
        alert("Error deleting!");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRate) {
        await axiosInstance.put(`/dayCare/${editingRate.DayCareId}`, formData);
      } else {
        await axiosInstance.post("/dayCare", formData);
      }
      setShowSidebar(false);
      fetchDayCares();
    } catch (error) {
      alert("Error saving");
    }
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          {/* PANEL */}
          <div className="panel">
            <div className="panel-header d-flex justify-content-between">
              <h5>💰 Day Care Bed Rate</h5>

              <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
                <i className="fa-light fa-plus"></i> Add Rate
              </button>
            </div>

            <div className="panel-body">

              {/* TABLE */}
              <div className="table-responsive">
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Particular</th>
                      <th className="text-end">Rate (₹)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <div className="spinner-border text-primary"></div>
                        </td>
                      </tr>
                    ) : rateData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          No data found
                        </td>
                      </tr>
                    ) : (
                      rateData.map((item) => (
                        <tr key={item.DayCareId}>

                          {/* ACTION — BAM SIDE */}
                          <td style={{ width: "80px" }}>
                            <div className="btn-box">
                              <button
                                onClick={() => handleEdit(item)}
                                style={{ background: "transparent", border: "none" }}
                              >
                                <i className="fa-light fa-pen"></i>
                              </button>

                              <button
                                onClick={() => handleDelete(item)}
                                style={{ background: "transparent", border: "none" }}
                              >
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td>{item.DayCare}</td>

                          <td className="text-end">
                            ₹
                            {Number(item.Rate).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>

                          

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR — EMR THEME */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowSidebar(false)}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className={`profile-right-sidebar active`}
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
                {editingRate ? "✏️ Edit Rate" : "➕ Add Rate"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">Particular *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.DayCare}
                        onChange={(e) =>
                          setFormData({ ...formData, DayCare: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rate (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.Rate}
                        onChange={(e) =>
                          setFormData({ ...formData, Rate: e.target.value })
                        }
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

                      <button type="submit" className="btn btn-primary w-50">
                        {editingRate ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DayCareBedRate;
