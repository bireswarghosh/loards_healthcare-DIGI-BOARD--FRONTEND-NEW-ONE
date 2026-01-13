import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance";

const CashPaymentHeadMaster = () => {
  // Doctors List Modal Component defined inside the main component
  const DoctorsListModal = ({ doctors, onSelectDoctor, onClose }) => {
    // FIX: Ensure doctors is an array before mapping
    const doctorsList = Array.isArray(doctors)
      ? doctors
      : [
          {
            DoctorId: 8857,
            Doctor: "Dr. Test Doctor",
            Qualification: "MD, Test Specialty",
            Phone: "555-1234",
            SpecialityId: 2,
            IndoorYN: "Y",
            RMO: "N",
            Status: "off",
          },
          {
            DoctorId: 8856,
            Doctor: "Dr. Test Doctor",
            Qualification: "MD, Test Specialty",
            Phone: "555-1234",
            SpecialityId: 2,
            IndoorYN: "Y",
            RMO: "N",
            Status: "off",
          },
          {
            DoctorId: 8855,
            Doctor: "Dr. Test Doctor",
            Qualification: "MD, Test Specialty",
            Phone: "555-1234",
            SpecialityId: 2,
            IndoorYN: "Y",
            RMO: "N",
            Status: "off",
          },
        ];

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div
              className="modal-header text-white rounded-top-4"
              style={{
                background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <h5 className="modal-title">👨‍⚕️ Select Doctor</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body p-4">
              <div
                className="table-responsive"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                <table className="table table-bordered table-sm table-striped table-hover align-middle">
                  <thead className="table-primary sticky-top">
                    <tr>
                      <th>ID</th>
                      <th>Doctor Name</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsList.map((doctor) => (
                      // Using DoctorId for key, using DoctorName or Doctor for display
                      <tr key={doctor.DoctorId || doctor.id}>
                        <td>{doctor.DoctorId || "N/A"}</td>
                        <td>{doctor.DoctorName || doctor.Doctor || "N/A"}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => onSelectDoctor(doctor)}
                          >
                            ➕ Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {doctorsList.length === 0 && (
                <p className="text-center mt-3">No doctors found.</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary rounded-pill px-4"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // End of Doctors List Modal Component

  const [showModal, setShowModal] = useState(false); // Main Modal
  const [showDoctorsModal, setShowDoctorsModal] = useState(false); // Doctors List Modal
  const [isDefaultModalReadOnly, setIsDefaultModalReadOnly] = useState(false); // Read-only state for main modal
  const [selectedHead, setSelectedHead] = useState(null); // Currently selected Cash Payment Head for edit
  const [isEditMode, setIsEditMode] = useState(false); // Flag to indicate if in edit mode
  const [cashPaymentHeads, setCashPaymentHeads] = useState([]); // List of Cash Payment Heads
  const [loading, setLoading] = useState(false); // Loading state
  const [doctors, setDoctors] = useState([]); // List of all doctors
  const [isDoctorChecked, setIsDoctorChecked] = useState(false); // Doctor checkbox state
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Selected doctor from modal

  const [docSel, setDocSel] = useState(true);

  const [formData, setFormData] = useState({
    CashPaymentHead: "",
    doctorId: "",
    doctorY: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedDelId, setSelectedDelId] = useState("");

  useEffect(() => {
    fetchCashPaymentHeads();
    fetchAllDoctors();
  }, []);

  const fetchCashPaymentHeads = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cashpaymenthead");
      setCashPaymentHeads(response.data);
    } catch (error) {
      console.error("Error fetching cash payment heads:", error);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await axiosInstance.get("/doctors");
      setDoctors(response.data.data);
      console.log("doc: ", response.data.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  };

  const handleAddNew = () => {
    setFormData({
      CashPaymentHead: "",
      doctorId: "",
      doctorY: "",
    });
    setSelectedHead(null);
    setIsEditMode(false);
    setIsDoctorChecked(false);
    setShowModal(true);
  };

  const handleEdit = (head) => {
    setFormData({
      CashPaymentHead: head.CashPaymentHead || "",
      doctorId: head.doctorId || "",
      doctorY: head.doctorY || "",
    });
    setIsDoctorChecked(head.doctorId);
    setSelectedHead(head);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    if (!isDefaultModalReadOnly) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        doctorId: formData.doctorId ? parseInt(formData.doctorId) : null,
        doctorY: formData.doctorY ? parseInt(formData.doctorY) : null,
      };

      if (selectedHead) {
        await axiosInstance.put(
          `/cashpaymenthead/${selectedHead.CashPaymentHeadId}`,
          submitData
        );
        // alert("Cash Payment Head updated successfully");
        toast.success("Cash Payment Head updated successfully");
      } else {
        await axiosInstance.post("/cashpaymenthead", submitData);
        // alert("Cash Payment Head created successfully");
        toast.success("Cash Payment Head created successfully");
      }
      await fetchCashPaymentHeads();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving cash payment head:", error);
      //   alert("Error saving cash payment head");
      toast.error("Error saving cash payment head");
    } finally {
      setLoading(false);
      setDocSel(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/cashpaymenthead/${id}`);
      await fetchCashPaymentHeads();
      //   alert("Cash Payment Head deleted successfully");
      toast.success("Cash Payment Head deleted successfully");
    } catch (error) {
      console.error("Error deleting cash payment head:", error);
      alert("Error deleting cash payment head");
    } finally {
      setShowConfirm(false);
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHead(null);
    setIsEditMode(false);
    setIsDoctorChecked(false);
    setFormData({ CashPaymentHead: "", doctorId: "", doctorY: "" });
  };

  const handleDoctorCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setIsDoctorChecked(isChecked);
    if (isChecked) {
      //   setShowDoctorsModal(true);
      //   setIsDefaultModalReadOnly(true);
      setDocSel(false);
    } else {
      setDocSel(true);
      setFormData((prev) => ({ ...prev, doctorId: "", doctorY: "" }));
    }
  };

  const handleSelectDoctor = (doctor) => {
    setFormData((prev) => ({
      ...prev,
      doctorId: doctor.DoctorId || "",
      doctorY: doctor.DoctorY || "",
    }));
    setShowDoctorsModal(false);
    setIsDefaultModalReadOnly(false);
  };

  const handleCloseDoctorsModal = () => {
    setShowDoctorsModal(false);
    setIsDefaultModalReadOnly(false);
    if (!formData.doctorId) {
      setIsDoctorChecked(false);
    }
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="card shadow border-0 rounded-4">
          <div className="card-header border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              💰 Cash Payment Head Master - List {loading && "(Loading...)"}
            </h5>
            <button className="btn btn-success" onClick={handleAddNew}>
              ADD
            </button>
          </div>

          <div className="card-body">
            <div
              className="table-responsive"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <table className="table table-bordered table-sm table-striped table-hover align-middle">
                <thead className=" ">
                  <tr>
                    <th className="text-center">Action</th>
                    <th>Sl.No</th>
                    <th className="text-center">Cash Payment Head Name</th>
                    {/* <th>Doctor ID</th>
                    <th>Doctor Y</th> */}
                  </tr>
                </thead>
                <tbody>
                  {cashPaymentHeads.map((head, index) => (
                    <tr key={head.CashPaymentHeadId}>
                      <td className="text-center">
                        {/* <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() => openView(r)}
                        >
                          <i className="fa-light fa-eye"></i>
                        </button> */}
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(head)}
                          disabled={loading}
                        >
                          <i className="fa-light fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setSelectedDelId(head.CashPaymentHeadId);
                            setShowConfirm(true);
                          }}
                          disabled={loading}
                        >
                          <i className="fa-light fa-trash"></i>
                        </button>
                      </td>
                      <td>{index + 1}</td>
                      <td className="text-center">{head.CashPaymentHead}</td>
                      {/* <td>{head.doctorId || "N/A"}</td>
                      <td>{head.doctorY || "N/A"}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Main Modal */}
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
                  setDocSel(true);
                }}
              >
                <i className="fa-light fa-angle-right"></i>
              </button>
              <OverlayScrollbarsComponent style={{ height: "100%" }}>
                <h5 className=" border-bottom pt-2 pb-2">
                  💰{" "}
                  {isEditMode
                    ? "Edit Cash Payment Head"
                    : "Add New Cash Payment Head"}
                </h5>

                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="fw-bold mb-1">
                        Cash Payment Head Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.CashPaymentHead}
                        onChange={(e) =>
                          handleInputChange("CashPaymentHead", e.target.value)
                        }
                        placeholder="Enter cash payment head name"
                        readOnly={isDefaultModalReadOnly}
                      />
                    </div>

                    {/* Doctor Checkbox */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="doctorCheckbox"
                          checked={isDoctorChecked}
                          onChange={handleDoctorCheckboxChange}
                          disabled={isDefaultModalReadOnly && !showDoctorsModal}
                        />
                        <label
                          className="form-check-label fw-bold "
                          htmlFor="doctorCheckbox"
                        >
                          Doctor
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className=" fw-bold ">Doctor</label>

                      <select
                        className="form-control mb-5"
                        value={formData.doctorId}
                        onChange={(e) =>
                          handleInputChange("doctorId", e.target.value)
                        }
                        disabled={docSel}
                      >
                        <option value={0}>--select--</option>
                        {doctors.map((doc, i) => (
                          <option key={i} value={doc.DoctorId}>
                            {doc.Doctor}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={handleSave}
                      disabled={loading || isDefaultModalReadOnly}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary w-100"
                      onClick={handleCloseModal}
                      disabled={isDefaultModalReadOnly}
                    >
                      Cancel
                    </button>
                  </div>
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

        {/* Doctors List Modal */}
        {showDoctorsModal && (
          <DoctorsListModal
            doctors={doctors}
            onSelectDoctor={handleSelectDoctor}
            onClose={handleCloseDoctorsModal}
          />
        )}
      </div>
    </>
  );
};

export default CashPaymentHeadMaster;
