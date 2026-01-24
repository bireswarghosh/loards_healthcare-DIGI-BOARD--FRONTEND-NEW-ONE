import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer"; // Assuming Footer is in this path
import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance";

// Define weekDays outside the component to avoid re-creation on every render
const weekDays = [
  { id: 0, name: "Sunday", abbr: "SUN" },
  { id: 1, name: "Monday", abbr: "MON" },
  { id: 2, name: "Tuesday", abbr: "TUE" },
  { id: 3, name: "Wednesday", abbr: "WED" },
  { id: 4, name: "Thursday", abbr: "THU" },
  { id: 5, name: "Friday", abbr: "FRI" },
  { id: 6, name: "Saturday", abbr: "SAT" },
];

const DoctorManagement = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // per page 10 doctors
  const [totalPages, setTotalPages] = useState(1);

  // Main State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [specialities, setSpecialities] = useState([]);
  const [visitTypes, setVisitTypes] = useState([]);
  const [doctorStatuses, setDoctorStatuses] = useState({});
  const [selectedId, setSelectedId] = useState("");

  // Drawer/Modal State
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState("add"); // 'add', 'edit', 'view'
  const [activeTab, setActiveTab] = useState("basic"); // for the drawer
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Form data state
  const initialFormData = {
    Doctor: "",
    Qualification: "",
    SpecialityId: "",
    Phone: "",
    IndoorYN: "N",
    RMO: "N",
    Photo: null,
    Add1: "",
    Add2: "",
    Add3: "",
    Fax: "",
    Identification: "",
    Qualification2: "",
    Qualification3: "",
    Qualification4: "",
    IndoorRate: 0,
    MExecutiveId: 0,
    Commission: "N",
    FixedDiscount: 0,
    MarkDoctorId: 0,
    DrPr: "",
    NotReq: 0,
    Panel: 0,
    CreateDate: new Date().toISOString().split("T")[0],
    RegistrationNo: "",
    areacode: 0,
    ICURate: 0,
    CABRate: 0,
    SUITRate: 0,
    VisitDays: [], // array of day IDs (0-6)
  };
  const [formData, setFormData] = useState(initialFormData);

  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);

  // Doctor rates state
  const [doctorRates, setDoctorRates] = useState([]);

  // --- Data Fetching ---

  const fetchDoctors = async (pageNo = page) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/doctormaster", {
        params: {
          search: search,
          page: pageNo,
          limit: pageSize,
        },
      });

      const doctorData = response.data.data || [];

      setDoctors(doctorData);

      // <-- STATUS SET
      const statuses = {};
      doctorData.forEach((d) => {
        statuses[d.DoctorId] = d.Status || "off";
      });
      setDoctorStatuses(statuses);

      // <-- PAGINATION (API response example)
      const totalItems = response.data.total || doctorData.length;
      const calculatedPages = Math.ceil(totalItems / pageSize);

      setTotalPages(calculatedPages);
      setPage(pageNo);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialities = async () => {
    try {
      const response = await axiosInstance.get("/speciality");
      if (response.data && response.data.success) {
        setSpecialities(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching specialities:", err);
    }
  };

  const fetchVisitTypes = async () => {
    try {
      const response = await axiosInstance.get("/visittype");
      if (response.data && response.data.success) {
        setVisitTypes(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching visit types:", err);
    }
  };

  const fetchDoctorRates = async (doctorId) => {
    try {
      const response = await axiosInstance.get(
        `/doctormaster/${doctorId}/rates`
      );
      if (response.data && response.data.success) {
        setDoctorRates(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching doctor rates:", err);
      setDoctorRates([]);
    }
  };

  const fetchDoctorPhoto = async (doctorId) => {
    try {
      const response = await axiosInstance.get(
        `/doctormaster/${doctorId}/photo`,
        {
          responseType: "blob",
        }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setImagePreview(imageUrl);
    } catch (err) {
      console.error("Failed to load doctor image:", err);
      setImagePreview(null);
    }
  };

  const fetchDoctorVisitDays = async (doctorId) => {
    try {
      const response = await axiosInstance.get(`/doctorvisitdt/${doctorId}`);
      if (response.data && response.data.success) {
        const dayNames = response.data.data.map((day) => day.VDay);
        // Map day names (SUN, MON, etc.) back to day IDs (0, 1, etc.)
        const dayIds = weekDays
          .filter((day) => dayNames.includes(day.abbr))
          .map((day) => day.id);
        return dayIds;
      }
      return [];
    } catch (visitErr) {
      console.error("Error fetching visit days:", visitErr);
      return [];
    }
  };

  //   useEffect(() => {
  //     fetchDoctors();
  //     fetchSpecialities();
  //     fetchVisitTypes();
  //   }, []);

  useEffect(() => {
    fetchDoctors(page);
    fetchSpecialities();
    fetchVisitTypes();
  }, [page, search]);

  useEffect(() => {
    fetchDoctors(); // Refetch when search changes
  }, [search]);

  // --- CRUD Handlers ---

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setError("");

    if (type === "file") {
      const file = files[0];
      if (file && file.size > 1024 * 1024) {
        setError("Image size must be less than 1MB");
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (type === "checkbox") {
      if (name === "visitDay") {
        const dayId = parseInt(value);
        setFormData((prev) => {
          const currentDays = [...prev.VisitDays];
          if (checked) {
            if (!currentDays.includes(dayId)) {
              return {
                ...prev,
                VisitDays: [...currentDays, dayId].sort((a, b) => a - b),
              };
            }
          } else {
            return {
              ...prev,
              VisitDays: currentDays.filter((day) => day !== dayId),
            };
          }
          return prev;
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked ? "Y" : "N",
        }));
      }
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle rate changes
  const updateRate = (visitTypeId, field, value) => {
    setDoctorRates((prev) => {
      const floatValue = parseFloat(value) || 0;
      const existing = prev.find((r) => r.VisitTypeId === visitTypeId);
      if (existing) {
        return prev.map((r) =>
          r.VisitTypeId === visitTypeId ? { ...r, [field]: floatValue } : r
        );
      } else {
        return [
          ...prev,
          {
            DoctorId: editingItem?.DoctorId || null,
            VisitTypeId: visitTypeId,
            Rate: field === "Rate" ? floatValue : 0,
            ServiceCh: field === "ServiceCh" ? floatValue : 0,
            GroupA: field === "GroupA" ? floatValue : 0,
            GroupB: field === "GroupB" ? floatValue : 0,
            GroupC: field === "GroupC" ? floatValue : 0,
            GroupD: field === "GroupD" ? floatValue : 0,
          },
        ];
      }
    });
  };

  // Handle form submission (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Exclude Photo and VisitDays, handle null/undefined safely
        if (
          key !== "Photo" &&
          key !== "VisitDays" &&
          value !== null &&
          value !== undefined
        ) {
          formDataToSend.append(key, value);
        }
      });

     if (formData.Photo) {
    formDataToSend.append("Photo", formData.Photo); 
}


      let response;
      let doctorId;

      if (modalType === "edit") {
        doctorId = editingItem.DoctorId;
        response = await axiosInstance.put(
          `/doctormaster/${doctorId}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await axiosInstance.post("/doctormaster", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        doctorId = response.data?.data?.DoctorId;
      }

      if (response.data && response.data.success && doctorId) {
        // Update visit days
        if (formData.VisitDays.length > 0) {
          const daysArray = formData.VisitDays.map(
            (id) => weekDays.find((d) => d.id === id)?.abbr
          ).filter(Boolean);
          try {
            await axiosInstance.put(`/doctorvisitdt/${doctorId}`, {
              days: daysArray,
            });
          } catch (visitErr) {
            console.error("Error updating visit days:", visitErr);
          }
        } else {
          // Delete all visit days if none are selected
          await axiosInstance.delete(`/doctorvisitdt/${doctorId}`);
        }

        // Save doctor rates
        if (doctorRates.length > 0) {
          try {
            await axiosInstance.post(`/doctormaster/${doctorId}/rates`, {
              rates: doctorRates.map((rate) => ({
                ...rate,
                DoctorId: doctorId,
              })),
            });
          } catch (rateErr) {
            console.error("Error saving doctor rates:", rateErr);
          }
        } else if (modalType === "edit" && doctorRates.length === 0) {
          // Clear all existing rates if editing and no rates are present
          await axiosInstance.delete(`/doctormaster/${doctorId}/rates`);
        }

        toast.success(
          modalType === "edit"
            ? "Doctor updated successfully!"
            : "Doctor created successfully!"
        );
        setShowDrawer(false);
        fetchDoctors(); // Refresh the list
      }
    } catch (err) {
      console.error("Error saving doctor:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to save doctor. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor deletion
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/doctormaster/${selectedId}`);
      toast.success("Doctor deleted successfully!");
      setShowConfirm(false);
      fetchDoctors(); // Refresh the list
    } catch (err) {
      console.error("Error deleting doctor:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to delete doctor. Please try again."
      );
    }
  };

  // --- Drawer/Modal Functions ---

  const openDrawerAdd = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setDoctorRates([]);
    setModalType("add");
    setEditingItem(null);
    setActiveTab("basic");
    setShowDrawer(true);
  };

  const openDrawerEdit = async (item) => {
    setLoading(true);
    setError("");

    try {
      const [doctorDetails, rates, visitDays] = await Promise.all([
        axiosInstance
          .get(`/doctormaster/${item.DoctorId}`)
          .then((res) => res.data.data),
        fetchDoctorRates(item.DoctorId).then(() => doctorRates), // Call fetcher and use current state value (or refactor to return data)
        fetchDoctorVisitDays(item.DoctorId),
      ]);

      setDoctorRates(rates); // Set rates from the promise result (or refactor fetchDoctorRates to return data)
      await fetchDoctorRates(item.DoctorId); // Re-run to ensure state is set correctly before form open

      // Populate form data
      setFormData({
        ...initialFormData, // Start with clean state
        ...doctorDetails,
        CreateDate: doctorDetails.CreateDate
          ? new Date(doctorDetails.CreateDate).toISOString().split("T")[0]
          : initialFormData.CreateDate,
        IndoorRate: doctorDetails.IndoorRate || 0,
        MExecutiveId: doctorDetails.MExecutiveId || 0,
        FixedDiscount: doctorDetails.FixedDiscount || 0,
        MarkDoctorId: doctorDetails.MarkDoctorId || 0,
        NotReq: doctorDetails.NotReq || 0,
        Panel: doctorDetails.Panel || 0,
        areacode: doctorDetails.areacode || 0,
        ICURate: doctorDetails.ICURate || 0,
        CABRate: doctorDetails.CABRate || 0,
        SUITRate: doctorDetails.SUITRate || 0,
        VisitDays: visitDays,
        Photo: null, // Always reset photo for edit
      });

      if (doctorDetails.hasPhoto) {
        await fetchDoctorPhoto(item.DoctorId);
      } else {
        setImagePreview(null);
      }

      setModalType("edit");
      setEditingItem(item);
      setActiveTab("basic");
      setShowDrawer(true);
    } catch (err) {
      console.error("Error opening edit drawer:", err);
      toast.error("Failed to load doctor details for editing.");
    } finally {
      setLoading(false);
    }
  };

  const openDrawerView = async (item) => {
    setLoading(true);
    setError("");

    try {
      const [doctorDetails, rates, visitDays] = await Promise.all([
        axiosInstance
          .get(`/doctormaster/${item.DoctorId}`)
          .then((res) => res.data.data),
        fetchDoctorRates(item.DoctorId).then(() => doctorRates),
        fetchDoctorVisitDays(item.DoctorId),
      ]);

      setDoctorRates(rates);
      await fetchDoctorRates(item.DoctorId);

      setFormData({
        ...initialFormData,
        ...doctorDetails,
        CreateDate: doctorDetails.CreateDate
          ? new Date(doctorDetails.CreateDate).toISOString().split("T")[0]
          : initialFormData.CreateDate,
        IndoorRate: doctorDetails.IndoorRate || 0,
        MExecutiveId: doctorDetails.MExecutiveId || 0,
        FixedDiscount: doctorDetails.FixedDiscount || 0,
        MarkDoctorId: doctorDetails.MarkDoctorId || 0,
        NotReq: doctorDetails.NotReq || 0,
        Panel: doctorDetails.Panel || 0,
        areacode: doctorDetails.areacode || 0,
        ICURate: doctorDetails.ICURate || 0,
        CABRate: doctorDetails.CABRate || 0,
        SUITRate: doctorDetails.SUITRate || 0,
        VisitDays: visitDays,
        Photo: null,
      });

      if (doctorDetails.hasPhoto) {
        await fetchDoctorPhoto(item.DoctorId);
      } else {
        setImagePreview(null);
      }

      setModalType("view");
      setEditingItem(item);
      setActiveTab("basic");
      setShowDrawer(true);
    } catch (err) {
      console.error("Error opening view drawer:", err);
      toast.error("Failed to load doctor details for viewing.");
    } finally {
      setLoading(false);
    }
  };

  // --- Utility Functions ---

  const filteredDoctors = doctors.filter(
    (item) =>
      item.Doctor?.toLowerCase().includes(search.toLowerCase()) ||
      item.Qualification?.toLowerCase().includes(search.toLowerCase())
  );

  // Find speciality name
  const getSpecialityName = (specialityId) => {
    return (
      specialities.find((s) => s.SpecialityId === specialityId)?.Speciality ||
      "Not specified"
    );
  };

  // Status Toggle
  const handleStatusToggle = async (doctorId, currentStatus) => {
    try {
      const newStatus = currentStatus === "off" ? "on" : "off";

      const response = await axiosInstance.put(
        `/doctormaster/${doctorId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data && response.data.success) {
        setDoctorStatuses((prev) => ({
          ...prev,
          [doctorId]: newStatus,
        }));
        setDoctors((prev) =>
          prev.map((doctor) =>
            doctor.DoctorId === doctorId
              ? { ...doctor, Status: newStatus }
              : doctor
          )
        );
        toast.success(
          `Doctor status updated to ${
            newStatus === "on" ? "Active" : "Inactive"
          }!`
        );
      }
    } catch (err) {
      console.error("Error updating doctor status:", err);
      toast.error("Failed to update doctor status. Please try again.");
    }
  };

  // Camera capture logic
  const handleCameraCapture = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support camera access");
      return;
    }

    setShowCameraModal(true);

    setTimeout(() => {
      const videoElement = document.getElementById("camera-feed");
      if (!videoElement) {
        setError("Video element not found");
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          videoElement.srcObject = stream;
          videoElement.play();

          window.capturePhoto = () => {
            const canvas = document.createElement("canvas");
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            canvas
              .getContext("2d")
              .drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
              const file = new File(
                [blob],
                `camera-capture-${Date.now()}.jpg`,
                { type: "image/jpeg" }
              );

              setFormData((prev) => ({ ...prev, Photo: file }));

              const reader = new FileReader();
              reader.onloadend = () => {
                setImagePreview(reader.result);
              };
              reader.readAsDataURL(file);

              stream.getTracks().forEach((track) => track.stop());
              setShowCameraModal(false);
            }, "image/jpeg");
          };
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          setError("Failed to access camera. Please check permissions.");
          setShowCameraModal(false);
        });
    }, 500);``
  };

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          <h5>👨‍⚕️ Doctor Master</h5>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Doctor/Qualification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "250px" }}
            />
            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add Doctor
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2">Loading Doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa-light fa-user-doctor fs-2 text-muted mb-3"></i>
              <h5>No doctors found</h5>
              <p className="text-muted">Add a new doctor to get started</p>
            </div>
          ) : (
            <OverlayScrollbarsComponent
              style={{ maxHeight: "calc(100vh - 250px)" }}
            >
              <table className="table table-dashed table-hover digi-dataTable table-striped">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>SLNo.</th>
                    <th>Doctor Name</th>
                    <th>Speciality</th>
                    <th>Qualification</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((item, index) => (
                    // Assumes DoctorId is the unique key
                    <tr key={item.DoctorId}>
                      <td>
                        <div className="d-flex gap-2">
                          {/* View Button */}
                          <div
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              openDrawerView(item);
                            }}
                            title="View"
                          >
                            <i className="fa-light fa-eye"></i>
                          </div>

                          {/* Edit Button */}
                          <div
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              openDrawerEdit(item);
                            }}
                            title="Edit"
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </div>

                          {/* Delete Button */}
                          <div
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedId(item.DoctorId);
                              setShowConfirm(true);
                            }}
                            title="Delete"
                          >
                            <i className="fa-light fa-trash-can"></i>
                          </div>
                        </div>
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.Doctor}</td>
                      <td>{getSpecialityName(item.SpecialityId)}</td>
                      <td>{item.Qualification || "-"}</td>
                      <td>{item.Phone || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.IndoorYN === "Y"
                              ? "bg-success"
                              : "bg-secondary"
                          } me-1`}
                        >
                          {item.IndoorYN === "Y" ? "Indoor" : "Outdoor"}
                        </span>
                        {item.RMO === "Y" && (
                          <span className="badge bg-info">RMO</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            item.Status === "on" ? "btn-success" : "btn-danger"
                          }`}
                          onClick={() =>
                            handleStatusToggle(item.DoctorId, item.Status)
                          }
                        >
                          {item.Status === "on" ? "Active" : "Inactive"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <nav>
                <ul className="pagination pagination-sm">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page - 1)}
                    >
                      Prev
                    </button>
                  </li>

                
                  <span className="m-2">{page}/{totalPages}</span>

                  <li
                    className={`page-item ${
                      page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Drawer/Sidebar for Add/Edit/View */}
      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "600px", // Increased width for more fields
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
              transition: "right 0.3s ease-in-out",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%" }}>
              <div className="dropdown-txt">
                {/* Updated Drawer Title */}
                {modalType === "add"
                  ? "➕ Add Doctor"
                  : modalType === "edit"
                  ? "✏️ Edit Doctor"
                  : "👁️ View Doctor"}
              </div>
              <div className="p-3">
                {/* Custom Tab Navigation */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "basic" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("basic")}
                      disabled={loading}
                    >
                      Basic Info
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "qualifications" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("qualifications")}
                      disabled={loading}
                    >
                      Qualifications & Photo
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "rates" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("rates")}
                      disabled={loading}
                    >
                      Rates & Settings
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "visitDays" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("visitDays")}
                      disabled={loading}
                    >
                      Visit Days
                    </button>
                  </li>
                </ul>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                  </div>
                ) : (
                  <OverlayScrollbarsComponent
                    style={{ height: "calc(100vh - 250px)", padding: "0 15px" }} // Adjusted height
                  >
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}

                      {/* Basic Information Tab */}
                      {activeTab === "basic" && (
                        <div className="row g-3">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Doctor Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="Doctor"
                              value={formData.Doctor}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Registration No.
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="RegistrationNo"
                              value={formData.RegistrationNo}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Speciality</label>
                            <select
                              className="form-control"
                              name="SpecialityId"
                              value={formData.SpecialityId}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            >
                              <option value="">-- Select Speciality --</option>
                              {specialities.map((speciality) => (
                                <option
                                  key={speciality.SpecialityId}
                                  value={speciality.SpecialityId}
                                >
                                  {speciality.Speciality}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Phone Number</label>
                            <input
                              type="tel"
                              maxLength={10}
                              className="form-control"
                              name="Phone"
                              value={formData.Phone}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Fax</label>
                            <input
                              type="text"
                              className="form-control"
                              name="Fax"
                              value={formData.Fax}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Identification</label>
                            <input
                              type="text"
                              className="form-control"
                              name="Identification"
                              value={formData.Identification}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-12 mb-3">
                            <label className="form-label">Address Line 1</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              name="Add1"
                              value={formData.Add1}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            ></textarea>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Address Line 2</label>
                            <input
                              type="text"
                              className="form-control"
                              name="Add2"
                              value={formData.Add2}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Address Line 3</label>
                            <input
                              type="text"
                              className="form-control"
                              name="Add3"
                              value={formData.Add3}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                        </div>
                      )}

                      {/* Qualifications & Photo Tab */}
                      {activeTab === "qualifications" && (
                        <div className="row g-3">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Primary Qualification
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Qualification"
                              value={formData.Qualification}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Qualification 2
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Qualification2"
                              value={formData.Qualification2}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Qualification 3
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Qualification3"
                              value={formData.Qualification3}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Qualification 4
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Qualification4"
                              value={formData.Qualification4}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>

                          <div className="col-md-12 mb-3">
                            <label className="form-label">Doctor's Photo</label>
                            <div
                              className="border rounded-3 p-3 d-flex flex-column align-items-center justify-content-center position-relative"
                              style={{ minHeight: "250px" }}
                            >
                              {imagePreview ? (
                                <div className="text-center">
                                  <img
                                    src={imagePreview}
                                    alt="Doctor preview"
                                    className="img-fluid mb-2 rounded"
                                    style={{
                                      maxHeight: "200px",
                                      maxWidth: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                  {modalType !== "view" && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => {
                                        setImagePreview(null);
                                        setFormData((prev) => ({
                                          ...prev,
                                          Photo: null,
                                        }));
                                      }}
                                    >
                                      <i className="fa-light fa-times me-1"></i>{" "}
                                      Remove Photo
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center text-muted">
                                  <i className="fa-light fa-user-doctor fs-2 mb-3 opacity-50"></i>
                                  <p>No photo selected</p>
                                  {modalType !== "view" && (
                                    <div className="d-flex gap-2 justify-content-center">
                                      <input
                                        type="file"
                                        name="Photo"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="d-none"
                                        id="photoUpload"
                                      />
                                      <label
                                        htmlFor="photoUpload"
                                        className="btn btn-outline-primary btn-sm"
                                      >
                                        <i className="fa-light fa-image me-2"></i>{" "}
                                        Select File
                                      </label>

                                      <button
                                        type="button"
                                        className="btn btn-outline-info btn-sm"
                                        onClick={handleCameraCapture}
                                      >
                                        <i className="fa-light fa-camera me-2"></i>{" "}
                                        Take Photo
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rates & Settings Tab */}
                      {activeTab === "rates" && (
                        <div className="row g-3">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Indoor Rate</label>
                            <input
                              type="number"
                              className="form-control"
                              name="IndoorRate"
                              value={formData.IndoorRate}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">ICU Rate</label>
                            <input
                              type="number"
                              className="form-control"
                              name="ICURate"
                              value={formData.ICURate}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">CAB Rate</label>
                            <input
                              type="number"
                              className="form-control"
                              name="CABRate"
                              value={formData.CABRate}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">SUIT Rate</label>
                            <input
                              type="number"
                              className="form-control"
                              name="SUITRate"
                              value={formData.SUITRate}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">Fixed Discount</label>
                            <input
                              type="number"
                              className="form-control"
                              name="FixedDiscount"
                              value={formData.FixedDiscount}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">Area Code</label>
                            <input
                              type="number"
                              className="form-control"
                              name="areacode"
                              value={formData.areacode}
                              onChange={handleChange}
                              disabled={modalType === "view"}
                            />
                          </div>

                          <div className="col-md-12 mb-3">
                            <label className="form-label">Doctor Type</label>
                            <div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="indoorDoctor"
                                  name="IndoorYN"
                                  checked={formData.IndoorYN === "Y"}
                                  onChange={handleChange}
                                  disabled={modalType === "view"}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="indoorDoctor"
                                >
                                  Indoor Doctor
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="rmoDoctor"
                                  name="RMO"
                                  checked={formData.RMO === "Y"}
                                  onChange={handleChange}
                                  disabled={modalType === "view"}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="rmoDoctor"
                                >
                                  RMO Doctor
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-12">
                            <h6 className="mt-3 mb-3 border-bottom pb-2">
                              Visit Type Rates
                            </h6>
                            {visitTypes.map((visitType) => {
                              const existingRate =
                                doctorRates.find(
                                  (r) => r.VisitTypeId === visitType.VisitTypeId
                                ) || {};

                              return (
                                <div
                                  key={visitType.VisitTypeId}
                                  className="p-3 border rounded mb-3"
                                >
                                  <strong className="d-block mb-3 text-primary">
                                    {visitType.VisitType}
                                  </strong>
                                  <div className="row g-2">
                                    <div className="col-md-4">
                                      <label className="form-label form-label-sm">
                                        Rate
                                      </label>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="0"
                                        value={existingRate.Rate || ""}
                                        onChange={(e) =>
                                          updateRate(
                                            visitType.VisitTypeId,
                                            "Rate",
                                            e.target.value
                                          )
                                        }
                                        disabled={modalType === "view"}
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label form-label-sm">
                                        Service Ch
                                      </label>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="0"
                                        value={existingRate.ServiceCh || ""}
                                        onChange={(e) =>
                                          updateRate(
                                            visitType.VisitTypeId,
                                            "ServiceCh",
                                            e.target.value
                                          )
                                        }
                                        disabled={modalType === "view"}
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label form-label-sm">
                                        Group A
                                      </label>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="0"
                                        value={existingRate.GroupA || ""}
                                        onChange={(e) =>
                                          updateRate(
                                            visitType.VisitTypeId,
                                            "GroupA",
                                            e.target.value
                                          )
                                        }
                                        disabled={modalType === "view"}
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label form-label-sm">
                                        Group B
                                      </label>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="0"
                                        value={existingRate.GroupB || ""}
                                        onChange={(e) =>
                                          updateRate(
                                            visitType.VisitTypeId,
                                            "GroupB",
                                            e.target.value
                                          )
                                        }
                                        disabled={modalType === "view"}
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label form-label-sm">
                                        Group C
                                      </label>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="0"
                                        value={existingRate.GroupC || ""}
                                        onChange={(e) =>
                                          updateRate(
                                            visitType.VisitTypeId,
                                            "GroupC",
                                            e.target.value
                                          )
                                        }
                                        disabled={modalType === "view"}
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label form-label-sm">
                                        Group D
                                      </label>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="0"
                                        value={existingRate.GroupD || ""}
                                        onChange={(e) =>
                                          updateRate(
                                            visitType.VisitTypeId,
                                            "GroupD",
                                            e.target.value
                                          )
                                        }
                                        disabled={modalType === "view"}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Visit Days Tab */}
                      {activeTab === "visitDays" && (
                        <div className="row g-3">
                          <div className="col-md-12 mb-3">
                            <label className="form-label d-block">
                              🗓️ Doctor Visit Days
                            </label>
                            <div className="d-flex flex-wrap gap-3">
                              {weekDays.map((day) => (
                                <div
                                  key={day.id}
                                  className="form-check form-check-inline"
                                >
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`day-${day.id}`}
                                    name="visitDay"
                                    value={day.id}
                                    checked={formData.VisitDays.includes(
                                      day.id
                                    )}
                                    onChange={handleChange}
                                    disabled={modalType === "view"}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`day-${day.id}`}
                                  >
                                    {day.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons (fixed at the bottom of the drawer content area) */}
                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary w-50"
                          onClick={() => setShowDrawer(false)}
                        >
                          Cancel
                        </button>
                        {modalType !== "view" && (
                          <button
                            type="submit"
                            className="btn btn-primary w-50"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin me-2"></i>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="fa-light fa-save me-2"></i>{" "}
                                {modalType === "add"
                                  ? "Create Doctor"
                                  : "Update Doctor"}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </form>
                  </OverlayScrollbarsComponent>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal (from TestParameter.jsx) */}
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
                <p>Are you sure you want to delete this doctor?</p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal (from original DoctorManagement.jsx, adapted to custom styling) */}
      {showCameraModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 10000 }}
          onClick={() => {
            const videoEl = document.querySelector("#camera-feed");
            if (videoEl && videoEl.srcObject) {
              videoEl.srcObject.getTracks().forEach((track) => track.stop());
            }
            setShowCameraModal(false);
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5>Take Photo</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    const videoEl = document.querySelector("#camera-feed");
                    if (videoEl && videoEl.srcObject) {
                      videoEl.srcObject
                        .getTracks()
                        .forEach((track) => track.stop());
                    }
                    setShowCameraModal(false);
                  }}
                ></button>
              </div>

              <div className="modal-body text-center">
                <video
                  id="camera-feed"
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                  }}
                  className="rounded"
                ></video>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const videoEl = document.querySelector("#camera-feed");
                    if (videoEl && videoEl.srcObject) {
                      videoEl.srcObject
                        .getTracks()
                        .forEach((track) => track.stop());
                    }
                    setShowCameraModal(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => window.capturePhoto()}
                >
                  <i className="fa-light fa-camera me-2"></i> Capture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DoctorManagement;