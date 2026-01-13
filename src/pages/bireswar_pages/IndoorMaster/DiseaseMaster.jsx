import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance";

const DiseaseMaster = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [diseaseData, setDiseaseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    Disease: "",
    Diseasecode: "",
  });

  const [selectedDelId, setSelectedDelId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/disease");
      setDiseaseData(response.data);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (disease) => {
    setFormData({
      Disease: disease.Disease || "",
      Diseasecode: disease.Diseasecode || "",
    });
    setSelectedDisease(disease);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      Disease: "",
      Diseasecode: "",
    });
    setSelectedDisease(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (selectedDisease) {
        await axiosInstance.put(
          `/disease/${selectedDisease.DiseaseId}`,
          formData
        );
        // alert("Disease updated successfully");
        setShowModal(false);
        toast.success("Disease updated successfully");
      } else {
        await axiosInstance.post("/disease", formData);
        // alert("Disease created successfully");
        setShowModal(false);
        toast.success("Disease created successfully");
      }
      await fetchDiseases();
    } catch (error) {
      console.error("Error saving disease:", error);
      //   alert("Error saving disease");
      toast.error("Error saving disease");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/disease/${id}`);
      await fetchDiseases();
      //   alert("Disease deleted successfully");
      setShowConfirm(false);
      setSelectedDelId("");
      toast.success("Disease deleted successfully");
    } catch (error) {
      console.error("Error deleting disease:", error);
      setShowConfirm(false);
      toast.error("Error deleting disease");
      setSelectedDelId("");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDisease(null);
    setIsEditMode(false);
    setFormData({ Disease: "", Diseasecode: "" });
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="card shadow border-0 rounded-4">
          <div className="card-header border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              🩺 Disease Master - List {loading && "(Loading...)"}
            </h5>
            <button
              className="btn btn-success px-4 py-2"
              onClick={handleAddNew}
            >
              Add
            </button>
          </div>

          <div className="card-body">
            <div
              className="table-responsive"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <table className="table table-bordered table-sm table-striped table-hover align-middle">
                <thead className="">
                  <tr>
                    <th className="text-center">Action</th>
                    <th>Sl.No</th>
                    <th>Disease Name</th>
                    <th className="text-center">Disease Code</th>
                  </tr>
                </thead>
                <tbody>
                  {diseaseData.map((disease, index) => (
                    <tr key={disease.DiseaseId}>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-primary btn-sm me-1"
                          onClick={() => handleEdit(disease)}
                          disabled={loading}
                        >
                          <i className="fa-light fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            // handleDelete(disease.DiseaseId)
                            setShowConfirm(true);
                            setSelectedDelId(disease.DiseaseId);
                          }}
                          disabled={loading}
                        >
                          <i className="fa-light fa-trash"></i>
                        </button>
                      </td>
                      <td>{index + 1}</td>
                      <td>{disease.Disease}</td>
                      <td className="text-center">{disease.Diseasecode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <>
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 9998 }}
            />
            <div
              className="profile-right-sidebar active"
              style={{
                zIndex: 9999,
                width: "100%",
                maxWidth: "500px",
                top: "70px",
                height: "calc(100vh - 70px)",
              }}
            >
              <button
                className="right-bar-close"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                <i className="fa-light fa-angle-right"></i>
              </button>
              <OverlayScrollbarsComponent style={{ height: "100%" }}>
                <h5 className=" border-bottom pt-2 pb-2 ps-3">
                  {isEditMode ? "Edit Disease" : "Add New Disease"}
                </h5>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className=" fw-bold mb-1">Disease Name</label>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={formData.Disease}
                        onChange={(e) =>
                          handleInputChange("Disease", e.target.value)
                        }
                        placeholder="Enter disease name"
                      />
                    </div>
                    <div className="col-12">
                      <label className="fw-bold mb-1">Disease Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Diseasecode}
                        onChange={(e) =>
                          handleInputChange("Diseasecode", e.target.value)
                        }
                        placeholder="Enter disease code"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 d-flex gap-2 px-2">
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </>
        )}

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
                  <p>Are you sure?</p>
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
                      handleDelete(selectedDelId);
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
    </>
  );
};

export default DiseaseMaster;
