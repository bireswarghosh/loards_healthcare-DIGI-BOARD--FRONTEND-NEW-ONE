import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const OTMaster = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingOT, setEditingOT] = useState(null);
  const [otData, setOtData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    OtMaster: "",
    Rate: "",
  });

  useEffect(() => {
    fetchOtMasters();
  }, []);

  const fetchOtMasters = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/otMaster");
      if (response.data.success) {
        setOtData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching OT masters:", error);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingOT(null);
    setFormData({ OtMaster: "", Rate: "" });
    setShowSidebar(true);
  };

  const handleEdit = (ot) => {
    setEditingOT(ot);
    setFormData({
      OtMaster: ot.OtMaster,
      Rate: ot.Rate,
    });
    setShowSidebar(true);
  };

  const handleDelete = async (ot) => {
    if (window.confirm(`Delete ${ot.OtMaster}?`)) {
      try {
        await axiosInstance.delete(`/otMaster/${ot.OtMasterId}`);
        fetchOtMasters();
      } catch (err) {
        alert("Error deleting OT");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingOT) {
        await axiosInstance.put(`/otMaster/${editingOT.OtMasterId}`, formData);
      } else {
        await axiosInstance.post("/otMaster", formData);
      }

      setShowSidebar(false);
      fetchOtMasters();
    } catch (err) {
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
              <h5>🏥 OT Master</h5>

              <button
                className="btn btn-sm btn-primary"
                onClick={handleOpenAdd}
              >
                <i className="fa-light fa-plus"></i> Add OT
              </button>
            </div>

            <div className="panel-body">
              {/* TABLE */}
              <div className="table-responsive">
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>OT Master</th>
                      <th className="text-end">Rate (₹)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          <div className="spinner-border text-primary"></div>
                        </td>
                      </tr>
                    ) : otData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No OT masters found
                        </td>
                      </tr>
                    ) : (
                      otData.map((ot) => (
                        <tr key={ot.OtMasterId}>
                          {/* ACTION — LEFT SIDE */}
                          <td style={{ width: "80px" }}>
                            <div className="btn-box">
                              <button
                                onClick={() => handleEdit(ot)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                }}
                              >
                                <i className="fa-light fa-pen"></i>
                              </button>

                              <button
                                onClick={() => handleDelete(ot)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                }}
                              >
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td>{ot.OtMaster}</td>

                          <td className="text-end">
                            ₹
                            {Number(ot.Rate).toLocaleString("en-IN", {
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

      {/* EMR RIGHT SIDEBAR */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowSidebar(false)}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              right: 0,
              zIndex: 9999,
              maxWidth: "500px",
              width: "100%",
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

            <div className="top-panel">
              <div
                className="dropdown-txt"
                style={{
                  backgroundColor: "#0a1735",
                  position: "sticky",
                  top: 0,
                }}
              >
                {editingOT ? "✏️ Edit OT" : "➕ Add OT"}
              </div>

              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 60px)" }}
              >
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">OT Master *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.OtMaster}
                        onChange={(e) =>
                          setFormData({ ...formData, OtMaster: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rate (₹)</label>
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

                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowSidebar(false)}
                      >
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit">
                        {editingOT ? "Update" : "Save"}
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

export default OTMaster;
