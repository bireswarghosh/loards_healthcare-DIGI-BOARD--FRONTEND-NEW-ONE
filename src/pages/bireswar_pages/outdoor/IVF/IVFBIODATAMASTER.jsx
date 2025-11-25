import React, { useState, useEffect, useCallback, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../../../axiosInstance";
import Footer from "../../../../components/footer/Footer";

// IVF Biodata Master
const IVFBIODATAMASTER = () => {
  // List data
  const [ivfData, setIvfData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Right sidebar modal
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null); // current selected row
  const [modalType, setModalType] = useState("add"); // 'add' | 'edit' | 'view'

  // Main form state
  const [formData, setFormData] = useState({
    IVFNo: "",
    Type: "PATIENT", // Default to PATIENT
    Name: "", // Husband/Donor/Surrogate Name
    Age: "",
    Add1: "",
    Complexion: "",
    EyeColour: "",
    BloodGroup: "",
    Height: "",
    Weight: "",
    Occupation: "",
    PhoneNo: "",
    // Wife's fields (used when Type is PATIENT)
    WName: "",
    WAge: "",
    WAdd1: "",
    WComplexion: "",
    WEyeColour: "",
    WBloodGroup: "",
    WHeight: "",
    WWeight: "",
    WOccupation: "",
    WPhoneNo: "",
    // Other fields
    HusbandName: "", // Used for Donor/Surrogate's Husband/Partner
    AgentName: "",
  });

  // Photos (file inputs)
  const [photos, setPhotos] = useState({
    husbandPhoto: null,
    wifePhoto: null,
  });

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    ivfNo: "",
    name: "",
    phoneNo: "",
    bloodGroup: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dropdownRef = useRef(null);
  const [dataWithDropdown, setDataWithDropdown] = useState([]);

  // ===================================
  // API Calls
  // ===================================
  const fetchIVFData = useCallback(
    async (page, search, filters) => {
      setLoading(true);
      try {
        let url = `/ivf/ivf-biodata?page=${page}&limit=10`;

        if (search && search.trim() !== "") {
          url += `&search=${encodeURIComponent(search.trim())}`;
        } else {
          Object.keys(filters || {}).forEach((key) => {
            const val = filters[key];
            if (val && val.toString().trim() !== "") {
              url += `&${key}=${encodeURIComponent(val.toString().trim())}`;
            }
          });
        }

        const response = await axiosInstance.get(url);
        const data = response.data?.data || [];

        setIvfData(data);
        setDataWithDropdown(
          data.map((item) => ({
            ...item,
            showDropdown: false,
          }))
        );
        setTotalPages(response.data?.pagination?.totalPages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error fetching IVF data:", err);
      } finally {
        setLoading(false);
      }
    },
    [] 
  );

  useEffect(() => {
    fetchIVFData(currentPage, searchQuery, searchFilters);
  }, [fetchIVFData]);

  // ===================================
  // CRUD & State Handlers 
  // ===================================
  const handleSearch = () => {
    const page = 1;
    setCurrentPage(page);
    fetchIVFData(page, searchQuery, searchFilters);
  };
  const handleClearSearch = () => {
    const clearedFilters = {
      ivfNo: "",
      name: "",
      phoneNo: "",
      bloodGroup: "",
    };
    setSearchQuery("");
    setSearchFilters(clearedFilters);
    const page = 1;
    setCurrentPage(page);
    fetchIVFData(page, "", clearedFilters);
  };
  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleGeneralSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val) {
      const page = 1;
      setCurrentPage(page);
      fetchIVFData(page, "", searchFilters);
    }
  };
  const handleDropdownToggle = (event, id) => {
    event.stopPropagation();
    const updatedData = dataWithDropdown.map((data) => ({
      ...data,
      showDropdown: data.IVFNo === id ? !data.showDropdown : false,
    }));
    setDataWithDropdown(updatedData);
  };
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        const updatedData = dataWithDropdown.map((data) => ({
          ...data,
          showDropdown: false,
        }));
        setDataWithDropdown(updatedData);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [dataWithDropdown]);
  const resetForm = () => {
    setFormData({
      IVFNo: "",
      Type: "PATIENT",
      Name: "",
      Age: "",
      Add1: "",
      Complexion: "",
      EyeColour: "",
      BloodGroup: "",
      Height: "",
      Weight: "",
      Occupation: "",
      PhoneNo: "",
      WName: "",
      WAge: "",
      WAdd1: "",
      WComplexion: "",
      WEyeColour: "",
      WBloodGroup: "",
      WHeight: "",
      WWeight: "",
      WOccupation: "",
      WPhoneNo: "",
      HusbandName: "",
      AgentName: "",
    });
    setPhotos({ husbandPhoto: null, wifePhoto: null });
    setEditingData(null);
  };
  const handleAdd = () => {
    resetForm();
    setModalType("add");
    setShowModal(true);
  };
  const handleEdit = (data) => {
    setEditingData(data);
    setFormData({
      IVFNo: data.IVFNo || "",
      Type: data.Type || "PATIENT",
      Name: data.Name || "",
      Age: data.Age || "",
      Add1: data.Add1 || "",
      Complexion: data.Complexion || "",
      EyeColour: data.EyeColour || "",
      BloodGroup: data.BloodGroup || "",
      Height: data.Height || "",
      Weight: data.Weight || "",
      Occupation: data.Occupation || "",
      PhoneNo: data.PhoneNo || "",
      WName: data.WName || "",
      WAge: data.WAge || "",
      WAdd1: data.WAdd1 || "",
      WComplexion: data.WComplexion || "",
      WEyeColour: data.WEyeColour || "",
      WBloodGroup: data.WBloodGroup || "",
      WHeight: data.WHeight || "",
      WWeight: data.WWeight || "",
      WOccupation: data.WOccupation || "",
      WPhoneNo: data.WPhoneNo || "",
      HusbandName: data.HusbandName || "",
      AgentName: data.AgentName || "",
    });
    setPhotos({ husbandPhoto: null, wifePhoto: null });
    setModalType("edit");
    setShowModal(true);
  };
  const handleView = (data) => {
    setEditingData(data);
    setFormData({
      IVFNo: data.IVFNo || "",
      Type: data.Type || "PATIENT",
      Name: data.Name || "",
      Age: data.Age || "",
      Add1: data.Add1 || "",
      Complexion: data.Complexion || "",
      EyeColour: data.EyeColour || "",
      BloodGroup: data.BloodGroup || "",
      Height: data.Height || "",
      Weight: data.Weight || "",
      Occupation: data.Occupation || "",
      PhoneNo: data.PhoneNo || "",
      WName: data.WName || "",
      WAge: data.WAge || "",
      WAdd1: data.WAdd1 || "",
      WComplexion: data.WComplexion || "",
      WEyeColour: data.WEyeColour || "",
      WBloodGroup: data.WBloodGroup || "",
      WHeight: data.WHeight || "",
      WWeight: data.WWeight || "",
      WOccupation: data.WOccupation || "",
      WPhoneNo: data.WPhoneNo || "",
      HusbandName: data.HusbandName || "",
      AgentName: data.AgentName || "",
    });
    setModalType("view");
    setShowModal(true);
  };
  const handleDelete = async (ivfNo) => {
    if (window.confirm(`Are you sure you want to delete IVF record ${ivfNo}?`)) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/ivf/ivf-biodata/${ivfNo}`);
        console.log("Record deleted successfully!");
        fetchIVFData(currentPage, searchQuery, searchFilters);
      } catch (error) {
        console.error("Error deleting IVF data:", error);
        console.log("Failed to delete record.");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setPhotos((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      dataToSubmit.append(key, formData[key]);
    });

    if (photos.husbandPhoto) {
      dataToSubmit.append("husbandPhoto", photos.husbandPhoto);
    }
    if (photos.wifePhoto) {
      dataToSubmit.append("wifePhoto", photos.wifePhoto);
    }

    try {
      if (editingData && modalType === "edit") {
        await axiosInstance.put(
          `/ivf/ivf-biodata/${editingData.IVFNo}`,
          dataToSubmit,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("IVF Biodata updated successfully!");
      } else {
        await axiosInstance.post("/ivf/ivf-biodata", dataToSubmit, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("IVF Biodata added successfully!");
      }

      handleCloseModal();
      fetchIVFData(currentPage, searchQuery, searchFilters);
    } catch (error) {
      console.error("Error saving IVF data:", error);
      console.log("Failed to save record.");
    } finally {
      setLoading(false);
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };


  // ============== FORM RENDERER (STYLED AND CONDITIONAL) ==============
  
  // Helper function to get photo URL for display/preview
  const getPhotoUrl = (photoFile, photoPathKey) => {
      const isView = modalType === "view";
      if (!isView && photoFile) {
          return URL.createObjectURL(photoFile);
      }
      return editingData?.[photoPathKey] || null;
  };
    
  // Helper function to render a single photo input/display section
  const renderPhotoSection = (photoKey, photoPathKey, label) => {
    const isView = modalType === "view";
    const currentPhotoFile = photos[photoKey];
    const photoSrc = getPhotoUrl(currentPhotoFile, photoPathKey);
    const hasPhoto = !!photoSrc; 
    
    return (
      <div className="text-center mb-3">
          <label className="form-label fw-bold d-block">{label}</label>
          <div 
            className="border border-2 border-dashed p-4 rounded mb-2 text-muted" 
            style={{width: '150px', height: '150px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
          >
              {hasPhoto ? (
                  <img 
                      src={photoSrc} 
                      alt={label} 
                      className="img-fluid rounded" 
                      style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                  />
              ) : (
                  <span style={{fontSize: '12px', lineHeight: '1.2'}}>
                      {isView ? 'No Photo' : 'Select Picture'}
                  </span>
              )}
          </div>
          {!isView && (
              <input 
                  type="file" 
                  name={photoKey} 
                  onChange={handleFileChange}
                  accept="image/*"
                  className="form-control form-control-sm"
              />
          )}
      </div>
    );
  };

  // Helper function to render a single biodata field
  const renderInputField = (name, placeholder, isRequired = false, isWife = false) => {
    const isView = modalType === "view";
    const dataToDisplay = isView ? editingData : formData;
    const isPatientType = dataToDisplay.Type === 'PATIENT';

    const key = name;
    const value = dataToDisplay[key] || '';
      
    // Label adjustment for Donor/Surrogacy type
    let fieldPlaceholder = placeholder;
    if (!isPatientType && !isWife) {
        if (name === 'Name') fieldPlaceholder = `${dataToDisplay.Type} Name`;
        if (name === 'Age') fieldPlaceholder = `${dataToDisplay.Type} Age`;
        if (name === 'PhoneNo') fieldPlaceholder = `${dataToDisplay.Type} Phone No`;
    }

    return (
      <div className="col-12">
          <input 
              type={name.includes('Age') ? "number" : "text"} 
              name={key} 
              placeholder={fieldPlaceholder} 
              value={value} 
              onChange={handleFormChange} 
              className="form-control" 
              disabled={isView} 
              required={isRequired} 
          />
      </div>
    );
  };
    
  const renderIvfForm = () => {
    const isView = modalType === "view";
    const dataToDisplay = isView ? editingData : formData;
    const isPatientType = dataToDisplay.Type === 'PATIENT';
    
    return (
      <div className="row g-3">
        {/* Registration and Type Selector */}
        <div className="col-12">
            <div className=" p-3 rounded mb-3">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <label className="fw-bold mb-0">Category:</label>
                    <select 
                        name="Type" 
                        value={dataToDisplay.Type} 
                        onChange={handleFormChange}
                        className="form-select w-auto"
                        disabled={isView}
                    >
                        <option value="PATIENT">PATIENT</option>
                        <option value="SURROGACY">SURROGACY</option>
                        <option value="EGG DONOR">EGG DONOR</option>
                        <option value="SPERM DONOR">SPERM DONOR</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Registration No</label>
          <input
            type="text"
            className="form-control"
            name="IVFNo"
            value={dataToDisplay.IVFNo}
            onChange={handleFormChange}
            placeholder="IVF Number"
            disabled={!!editingData || isView}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Date</label>
          <input 
            type="date" 
            className="form-control"
            defaultValue={editingData?.IVFDate ? new Date(editingData.IVFDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            disabled={isView}
          />
        </div>
        
        <div className="col-12">
            <hr className="my-2"/>
        </div>

        {isPatientType ? (
          // === PATIENT TYPE (Husband & Wife Split) ===
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card"> 
                <div className="card-header  text-center">
                  <h5 className="mb-0">HUSBAND</h5>
                </div>
                <div className="card-body">
                  {renderPhotoSection("husbandPhoto", "HusbandPhoto", "Husband Photo")}
                  <div className="row g-2">
                    {renderInputField("Name", "Name", true)}
                    {renderInputField("Age", "Age")}
                    {renderInputField("Add1", "Address")}
                    {renderInputField("Complexion", "Complexion")}
                    {renderInputField("EyeColour", "Eye Colour")}
                    {renderInputField("BloodGroup", "Blood Group")}
                    {renderInputField("Height", "Height")}
                    {renderInputField("Weight", "Weight")}
                    {renderInputField("Occupation", "Occupation")}
                    {renderInputField("PhoneNo", "Phone No")}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card"> 
                <div className="card-header  text-center">
                  <h5 className="mb-0">WIFE</h5>
                </div>
                <div className="card-body">
                  {renderPhotoSection("wifePhoto", "WifePhoto", "Wife Photo")}
                  <div className="row g-2">
                    {renderInputField("WName", "Wife Name", true, true)}
                    {renderInputField("WAge", "Wife Age", true, true)}
                    {renderInputField("WAdd1", "Wife Address", false, true)}
                    {renderInputField("WComplexion", "Wife Complexion", false, true)}
                    {renderInputField("WEyeColour", "Wife Eye Colour", false, true)}
                    {renderInputField("WBloodGroup", "Wife Blood Group", false, true)}
                    {renderInputField("WHeight", "Wife Height", false, true)}
                    {renderInputField("WWeight", "Wife Weight", false, true)}
                    {renderInputField("WOccupation", "Wife Occupation", false, true)}
                    {renderInputField("WPhoneNo", "Wife Phone No", false, true)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // === NON-PATIENT TYPES (Donor/Surrogacy) ===
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card"> 
                <div className="card-body">
                  <h6 className="mt-2 mb-3 text-primary text-center fw-bold">{dataToDisplay.Type} Biodata</h6>
                  
                  {renderPhotoSection("husbandPhoto", "HusbandPhoto", `${dataToDisplay.Type} Photo`)}
                  
                  <div className="row g-2">
                    {renderInputField("Name", "Name", true)}
                    {renderInputField("Age", "Age")}
                    {renderInputField("HusbandName", "Husband Name")}
                    {renderInputField("Add1", "Address")}
                    {renderInputField("PhoneNo", "Phone No")}
                    {renderInputField("BloodGroup", "Blood Group")}
                    {renderInputField("EyeColour", "Eye Colour")}
                    {renderInputField("Height", "Height")}
                    {renderInputField("Weight", "Weight")}
                    {renderInputField("Occupation", "Occupation")}
                  </div>

                  <div className="row g-2 mt-3 pt-3 border-top">
                    <div className="col-12">
                        <label className="form-label fw-bold">Agent Name</label>
                        {renderInputField("AgentName", "Agent Name")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              {/* Blood Test Results Panel */}
              <div className="card">
                <div className="card-header bg-info text-white">
                  <div className="row fw-bold">
                    <div className="col-6">Blood Test Name</div>
                    <div className="col-6">Result</div>
                  </div>
                </div>
                <div
                  className="card-body"
                  style={{ height: isView ? "auto" : "calc(100% - 48px)" }} 
                >
                  <div className="text-muted text-center mt-5">
                    Blood test results will appear here / No results available for demo.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // ============== ADVANCED SEARCH FORM (Theme-neutral) ==============
  const renderAdvancedSearchForm = () => (
    <div className="card-body border-bottom pt-3 pb-3">
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">IVF No</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Enter IVF No"
            value={searchFilters.ivfNo}
            onChange={(e) => handleFilterChange("ivfNo", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Enter Name"
            value={searchFilters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Phone No</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Enter Phone No"
            value={searchFilters.phoneNo}
            onChange={(e) => handleFilterChange("phoneNo", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Blood Group</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Enter Blood Group"
            value={searchFilters.bloodGroup}
            onChange={(e) => handleFilterChange("bloodGroup", e.target.value)}
          />
        </div>
        <div className="col-md-12 d-flex align-items-end justify-content-end">
          <button className="btn btn-success btn-sm me-2" onClick={handleSearch}>
            Search
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );

  // ============== TABLE RENDERER (Theme-neutral) ==============
  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">
      <thead>
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th>Action</th>
          <th>IVF No</th>
          <th>Type</th>
          <th>Name (Wife/Donor)</th>
          <th>Age (Wife/Donor)</th>
          <th>Husband Name</th>
          <th>Phone No</th>
          <th>Blood Group</th>
        </tr>
      </thead>
      <tbody>
        {dataWithDropdown.length > 0 ? (
          dataWithDropdown.map((data) => (
            <tr key={data.IVFNo}>
              <td>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </td>
              <td>
                <div
                  className="digi-dropdown dropdown d-inline-block"
                  ref={dropdownRef}
                >
                  <button
                    className={`btn btn-sm btn-outline-primary ${
                      data.showDropdown ? "show" : ""
                    }`}
                    onClick={(event) =>
                      handleDropdownToggle(event, data.IVFNo)
                    }
                  >
                    Action <i className="fa-regular fa-angle-down"></i>
                  </button>
                  <ul
                    className={`digi-table-dropdown dropdown-menu dropdown-slim dropdown-menu-sm ${
                      data.showDropdown ? "show" : ""
                    }`}
                  >
                    <li>
                      <a
                        href="#"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          handleView(data);
                        }}
                      >
                        <span className="dropdown-icon">
                          <i className="fa-light fa-eye"></i>
                        </span>{" "}
                        View
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(data);
                        }}
                      >
                        <span className="dropdown-icon">
                          <i className="fa-light fa-pen-to-square"></i>
                        </span>{" "}
                        Edit
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="dropdown-item text-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(data.IVFNo);
                        }}
                      >
                        <span className="dropdown-icon">
                          <i className="fa-light fa-trash-can"></i>
                        </span>{" "}
                        Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </td>
              <td>{data.IVFNo}</td>
              <td>
                <span
                  className={`badge ${
                    data.Type === "PATIENT" ? "bg-info" : "bg-warning"
                  }`}
                >
                  {data.Type}
                </span>
              </td>
              <td>{data.Type === 'PATIENT' ? data.WName : data.Name}</td>
              <td>{data.Type === 'PATIENT' ? data.WAge : data.Age}</td>
              <td>{data.HusbandName || (data.Type === 'PATIENT' ? data.Name : "N/A")}</td>
              <td>{data.Type === 'PATIENT' ? data.WPhoneNo : data.PhoneNo}</td>
              <td>{data.Type === 'PATIENT' ? data.WBloodGroup : data.BloodGroup}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="text-center text-muted py-4">
              No IVF Biodata records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
  
  // ============== PAGINATION (Theme-neutral) ==============
  const getPageNumbers = () => {
    const maxPages = 7;
    let startPage, endPage;

    if (totalPages <= maxPages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxPages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxPages / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxPages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxPages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    return Array.from({ length: endPage + 1 - startPage }, (_, i) => startPage + i);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    const goToPage = (page) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      fetchIVFData(page, searchQuery, searchFilters);
    };

    return (
      <nav className="d-flex justify-content-center">
        <ul className="pagination justify-content-center mt-3">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              aria-label="First"
            >
              «
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous"
            >
              ‹
            </button>
          </li>

          {pageNumbers.map((pageNumber) => (
            <li
              key={pageNumber}
              className={`page-item ${
                currentPage === pageNumber ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next"
            >
              ›
            </button>
          </li>
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last"
            >
              »
            </button>
          </li>
        </ul>
      </nav>
    );
  };


  // ============== MAIN RENDER ==============
  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>🧬 IVF Biodata Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                >
                  <i
                    className={`fa-light ${
                      showAdvancedSearch
                        ? "fa-eye-slash"
                        : "fa-magnifying-glass"
                    }`}
                  ></i>{" "}
                  {showAdvancedSearch ? "Hide" : "Show"} Advanced Search
                </button>
                <div id="tableSearch">
                  {!showAdvancedSearch && (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search IVF No or Name..."
                      value={searchQuery}
                      onChange={handleGeneralSearchChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                  )}
                </div>
                <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            {showAdvancedSearch && renderAdvancedSearchForm()}

            <div className="panel-body">
              {loading && ivfData.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: "auto" }}>{renderTable()}</div>
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className={`profile-right-sidebar ${showModal ? "active" : ""}`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "550px",
              right: showModal ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={handleCloseModal}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div
              className="top-panel"
              style={{ height: "100%", paddingTop: "10px" }}
            >
              <div
                // ADDED  and border-bottom for theme-agnostic sticky header visibility
                className="dropdown-txt  border-bottom"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                {modalType === "add"
                  ? "➕ Add New Biodata"
                  : modalType === "edit"
                  ? `✏️ Edit Biodata (${editingData?.IVFNo})`
                  : `👁️ View Biodata (${editingData?.IVFNo})`}
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    {renderIvfForm()}
                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                      {modalType !== "view" && (
                        <button
                          type="submit"
                          className="btn btn-primary w-50"
                          disabled={loading}
                        >
                          {loading
                            ? "Saving..."
                            : editingData
                            ? "Update"
                            : "Save"}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default IVFBIODATAMASTER;