import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { DigiContext } from "../../context/DigiContext";

const SpecialityMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    Speciality: "",
    Code: "",
    OT: "N"
  });

  const fetchSpecialities = async () => {
    setLoading(true);
    try {
      const endpoint = showInactive ? "/speciality/inactive" : "/speciality";
      const res = await axiosInstance.get(endpoint);
      setSpecialities(res.data.data || []);
    } catch (err) {
      console.error("Error fetching specialities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialities();
  }, [showInactive]);

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setSelectedItem(item);
      setFormData(item);
    } else {
      setSelectedItem(null);
      setFormData({ Speciality: "", Code: "", OT: "N" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (modalType === "edit") {
        await axiosInstance.put(`/speciality/${selectedItem.SpecialityId}`, formData);
      } else {
        await axiosInstance.post("/speciality", formData);
      }
      setShowModal(false);
      fetchSpecialities();
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axiosInstance.delete(`/speciality/${id}`);
        fetchSpecialities();
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/speciality/${id}/toggle-status`);
      fetchSpecialities();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>Speciality Master</h5>
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${showInactive ? "btn-secondary" : "btn-warning"}`}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? "Show Active" : "Show Inactive"}
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => handleOpenModal("add")}>
              <i className="fa-light fa-plus"></i> Add
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <div style={{ height: isBelowLg ? "calc(100vh - 250px)" : "calc(100vh - 200px)" }}>
                <table className="table table-sm table-striped table-hover">
                  <thead className="sticky-top">
                    <tr>
                      <th>Sl</th>
                      <th>Speciality</th>
                      <th>Code</th>
                      <th>OT</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">No data</td>
                      </tr>
                    ) : (
                      specialities.map((item, i) => (
                        <tr key={item.SpecialityId}>
                          <td>{i + 1}</td>
                          <td>{item.Speciality}</td>
                          <td>{item.Code}</td>
                          <td>{item.OT}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={item.Active === 1}
                                onChange={() => toggleStatus(item.SpecialityId)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => handleOpenModal("view", item)}
                              >
                                <i className="fa-light fa-eye" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleOpenModal("edit", item)}
                              >
                                <i className="fa-light fa-pen" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(item.SpecialityId)}
                              >
                                <i className="fa-light fa-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
          <div className="profile-right-sidebar active" style={{ zIndex: 9999, width: "100%", maxWidth: "500px", right: 0, top: "70px", height: "calc(100vh - 70px)" }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel p-3">
              <h5>{modalType === "add" ? "Add Speciality" : modalType === "edit" ? "Edit Speciality" : "View Speciality"}</h5>
              <div className="row mt-3">
                <div className="col-md-12 mb-2">
                  <label className="form-label small">Speciality Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.Speciality}
                    onChange={(e) => setFormData({ ...formData, Speciality: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label small">Code</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    maxLength={3}
                    value={formData.Code}
                    onChange={(e) => setFormData({ ...formData, Code: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label small">OT</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.OT}
                    onChange={(e) => setFormData({ ...formData, OT: e.target.value })}
                    disabled={modalType === "view"}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>
              </div>
              {modalType !== "view" && (
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-secondary w-50" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary w-50" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpecialityMaster;
