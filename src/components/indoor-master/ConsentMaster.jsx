import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const ConsentMaster = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingConsent, setEditingConsent] = useState(null);

  const [formData, setFormData] = useState({
    Consent: "",
    Description: "",
  });

  // Fetch
  const fetchConsents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/consents");
      if (response.data.success) {
        setConsents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching consents:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  // Edit
  const handleEdit = (consent) => {
    setEditingConsent(consent);
    setFormData({
      Consent: consent.Consent || "",
      Description: consent.Description || "",
    });
    setShowSidebar(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this consent?")) {
      try {
        await axiosInstance.delete(`/consents/${id}`);
        fetchConsents();
      } catch (error) {
        console.error("Error deleting consent:", error);
        alert("Error deleting consent");
      }
    }
  };

  // Add new
  const openAddSidebar = () => {
    setEditingConsent(null);
    setFormData({ Consent: "", Description: "" });
    setShowSidebar(true);
  };

  // Save
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingConsent) {
        await axiosInstance.put(
          `/consents/${editingConsent.ConsentId}`,
          formData
        );
      } else {
        await axiosInstance.post("/consents", formData);
      }

      setShowSidebar(false);
      setEditingConsent(null);
      fetchConsents();
    } catch (error) {
      console.error("Error saving consent:", error);
      alert("Error saving consent");
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingConsent(null);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header d-flex justify-content-between align-items-center">
              <h5>📋 Consent Management</h5>
              <button className="btn btn-sm btn-primary" onClick={openAddSidebar}>
                <i className="fa-light fa-plus"></i> Add Consent
              </button>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dashed table-hover digi-dataTable table-striped">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Action</th>
                        <th>Consent</th>
                        <th>Description</th>
                      </tr>
                    </thead>

                    <tbody>
                      {consents.map((consent) => (
                        <tr key={consent.ConsentId}>
                          {/* Action Left */}
                          <td className="text-center">
                            <div className="btn-box">
                              <button onClick={() => handleEdit(consent)}>
                                <i className="fa-light fa-pen"></i>
                              </button>
                              <button onClick={() => handleDelete(consent.ConsentId)}>
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td className="text-center">{consent.Consent}</td>

                          <td>
                            {consent.Description
                              ? consent.Description.substring(0, 80) + "..."
                              : "-"}
                          </td>
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

      {/* EMR Right Sidebar */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={closeSidebar}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: 0,
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={closeSidebar}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div className="dropdown-txt">📋 {editingConsent ? "Edit Consent" : "Add Consent"}</div>

              <div style={{ overflowY: "auto", height: "calc(100% - 70px)" }}>
                <div className="p-3">

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Consent *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Consent}
                        onChange={(e) =>
                          setFormData({ ...formData, Consent: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="8"
                        value={formData.Description}
                        onChange={(e) =>
                          setFormData({ ...formData, Description: e.target.value })
                        }
                      />
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={closeSidebar}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary w-50">
                        {editingConsent ? "Update" : "Save"}
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

export default ConsentMaster;
