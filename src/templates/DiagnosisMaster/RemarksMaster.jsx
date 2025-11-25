import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import Footer from "../../components/footer/Footer";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const RemarksMaster = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);

  // State keys match the API POST/PUT body keys
  const [formData, setFormData] = useState({
    remarkname: "", // Maps to the short name/title
    description: "", // Maps to the long description/type
  });

  useEffect(() => {
    // Console log confirming fetch initiation
    console.log("Component mounted, fetching remarks...");
    fetchRemarks();
  }, []);

  // --- API Handlers ---

  const fetchRemarks = async () => {
    try {
      setLoading(true);
      // Calls: https://lords-backend.onrender.com/api/v1/remarks?page=1&limit=20
      console.log("Fetching Remarks Data from API...");
      const response = await axiosInstance.get("/remarks?page=1&limit=20");

      console.log("Fetched Remarks Data Success:", response.data);

      // Robustness check for API response structure
      if (response.data && Array.isArray(response.data.data)) {
        setRemarks(response.data.data);
      } else {
        console.error("API response data is not an array:", response.data);
        setRemarks([]);
      }
    } catch (error) {
      // This will log if the network request fails (including a wrong base URL)
      console.error("Error fetching remarks:", error);
      alert("Error fetching remarks data. Check network or API configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // FIX: Standardize submission data structure for POST and PUT
      const submitData = {
        remarkname: formData.remarkname,
        description: formData.description,
      };

      if (selectedRemark) {
        // PUT request for update uses the same API structure (remarkname, description)
        console.log("Submitting data for update:", submitData);
        console.log("Updating Remark ID:", selectedRemark);
        console.log("Updating Remark ID:", selectedRemark.RemarksId);
        await axiosInstance.put(
          `/remarks/${selectedRemark.RemarksId}`,
          submitData
        );
        alert("Remark updated successfully");
      } else {
        // POST request for creation uses the same API structure
        await axiosInstance.post("/remarks", submitData);
        alert("Remark created successfully");
      }

      await fetchRemarks();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving remark:", error.response?.data || error.message);
      alert("Error saving remark. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Remark?")) {
      try {
        setLoading(true);
        // DELETE request
        await axiosInstance.delete(`/remarks/${id}`);
        await fetchRemarks();
        alert("Remark deleted successfully");
      } catch (error) {
        console.error("Error deleting remark:", error);
        alert("Error deleting remark");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- UI/State Handlers ---

  const handleAddNew = () => {
    setFormData({ remarkname: "", description: "" });
    setSelectedRemark(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (remark) => {
    // FIX: Map the fields from the fetched API response (likely Remarks, Type) 
    // to the local state (remarkname, description).
    setFormData({
      remarkname: remark.Remarks || "", // Assuming remark.Remarks is the short name/title
      description: remark.Type || "", // Assuming remark.Type is the description/type field
    });
    setSelectedRemark(remark);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRemark(null);
    setIsEditMode(false);
    setFormData({ remarkname: "", description: "" });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown({});
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDropdown = (id) => {
    setShowDropdown((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRemarks = remarks.filter((r) =>
    (r.Remarks || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.Type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="panel">
            <div className="panel-header">
              <h4>Remarks Master</h4>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "200px" }}
                />
                <button className="btn btn-primary" onClick={handleAddNew}>
                  <i className="fas fa-plus"></i> Add New
                </button>
              </div>
            </div>
            <div className="panel-body">
              <OverlayScrollbarsComponent defer>
                <table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Sl.No</th>
                      <th>Remarks</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRemarks.map((remark, index) => (
                      <tr key={remark.RemarksId}>
                        <td>
                          <div className="dropdown" ref={dropdownRef}>
                            <button
                              className="btn btn-sm btn-secondary dropdown-toggle"
                              onClick={() => toggleDropdown(remark.RemarksId)}
                            >
                              Actions
                            </button>
                            {showDropdown[remark.RemarksId] && (
                              <ul className="dropdown-menu show">
                                <li>
                                  <a className="dropdown-item" onClick={() => { handleEdit(remark); setShowDropdown({}); }}>
                                    Edit
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" onClick={() => { handleDelete(remark.RemarksId); setShowDropdown({}); }}>
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            )}
                          </div>
                        </td>
                        <td>{index + 1}</td>
                        <td>{remark.Remarks || "N/A"}</td>
                        <td>{remark.Type || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{ top: "70px", height: "calc(100vh - 70px)" }}
          >
            <div className="modal-header">
              <h5>{isEditMode ? "Edit Remark" : "Add New Remark"}</h5>
              <button className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.remarkname}
                  onChange={(e) => handleInputChange("remarkname", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default RemarksMaster;