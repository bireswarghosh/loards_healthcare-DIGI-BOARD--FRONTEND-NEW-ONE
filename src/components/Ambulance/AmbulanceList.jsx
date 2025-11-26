import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";

const AmbulanceList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    selectedFile: null,
  });

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const response = await axiosInstance.get("/ambulance");
      if (response.data.success) {
        setAmbulances(response.data.ambulances);
      }
    } catch (err) {
      console.error("Error fetching ambulances:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ name: "", selectedFile: null });
    setSelectedAmbulance(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (ambulance) => {
    setFormData({
      name: ambulance.name || "",
      selectedFile: null,
    });
    setSelectedAmbulance(ambulance);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      handleInputChange("selectedFile", e.target.files[0]);
    }
  };

  const handleSave = async (e) => {
    try {
        e.target.disabled=true;
        
      const fd = new FormData();
      fd.append("name", formData.name);
      if (formData.selectedFile) fd.append("logo", formData.selectedFile);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const response = isEditMode
        ? await axiosInstance.put(`/ambulance/${selectedAmbulance.id}`, fd, config)
        : await axiosInstance.post("/ambulance", fd, config);

      if (response.data.success) {
        toast.success("Submitted Sucessfully",{autoClose:2000})
        e.target.disabled=false
        fetchAmbulances();
        setShowModal(false);
      } else {
        e.target.disabled=false
        toast.error("Failled to save",{autoClose:2000})
      }
    } catch (err) {
      alert("Error saving ambulance");
    }
  };

  const handleDelete = async (ambulance) => {
    if (!window.confirm(`Delete ${ambulance.name}?`)) return;

    try {
      const res = await axiosInstance.delete(`/ambulance/${ambulance.id}`);
      if (res.data.success) {
        toast.success("Deleted sucessfully",{autoClose:2000})
        fetchAmbulances();
      }
    } catch (err) {
      alert("Error deleting ambulance");
    }
  };

  return (
    <div className="main-content">
      <div className="panel">

        {/* HEADER */}
        <div className="panel-header">
          <h5>🚑 Ambulance Management</h5>
          <div className="btn-box d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={handleAddNew}>
              <i className="fa-light fa-plus"></i> Add Ambulance
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-dashed table-hover digi-dataTable table-striped align-middle">
                <thead>
                  <tr>
                    {/* ACTION FIRST COLUMN */}
                    <th>Action</th>
                    <th>Sl No</th>
                    <th>Name</th>
                    <th>Logo</th>
                  </tr>
                </thead>

                <tbody>
                  {ambulances.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">No ambulances found</td>
                    </tr>
                  ) : (
                    ambulances.map((amb, index) => (
                      <tr key={amb.id}>
                        
                        {/* ACTION ICONS LEFT SIDE */}
                        <td className="d-flex gap-2">

                          {/* EDIT ICON */}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(amb)}
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </button>

                          {/* DELETE ICON */}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(amb)}
                          >
                            <i className="fa-light fa-trash-can"></i>
                          </button>
                        </td>

                        <td>{index + 1}</td>
                        <td>{amb.name}</td>

                        <td>
                          {amb.logo && (
                            <img
                              src={amb.logo}
                              alt="logo"
                              style={{
                                width: "45px",
                                height: "45px",
                                borderRadius: "6px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* EMR SIDE MODAL */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 9998 }}
            onClick={() => setShowModal(false)}
          />

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              maxWidth: "500px",
              right: "0",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="dropdown-txt">
              {isEditMode ? "✏️ Edit Ambulance" : "➕ Add Ambulance"}
            </div>

            <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
              <div className="p-3">

                {/* NAME FIELD */}
                <div className="mb-3">
                  <label className="form-label fw-bold">📝 Ambulance Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                {/* LOGO FIELD */}
                <div className="mb-3">
                  <label className="form-label fw-bold">🖼️ Logo</label>
                  <input type="file" className="form-control" onChange={handleFileChange} />

                  {isEditMode && selectedAmbulance?.logo && (
                    <div className="mt-2">
                      <img
                        src={selectedAmbulance.logo}
                        alt="Current Logo"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "8px",
                        }}
                      />
                      <p className="text-muted small">Current Logo</p>
                    </div>
                  )}
                </div>

                {/* BUTTONS */}
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-secondary w-50" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary w-50" onClick={handleSave}>
                    {isEditMode ? "Update" : "Save"}
                  </button>
                </div>

              </div>
            </OverlayScrollbarsComponent>
          </div>
        </>
      )}
    </div>
  );
};

export default AmbulanceList;
