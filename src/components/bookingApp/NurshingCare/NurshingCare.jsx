import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"; // Assuming this is available and needed for scrollbars like in Emr1.jsx
import axiosInstance from "../../../axiosInstance";
import { toast } from 'react-toastify';

// Note: MasterLayout and Breadcrumb imports are removed to match the Emr1 structure

const NursingList = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState("add"); // Added to match Emr1 modal logic

  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    selectedFile: null, // Track the file object separately
  });

  const [packageFormData, setPackageFormData] = useState({
    nursing_category_id: "",
    package_name: "",
    duration: "",
    price: "",
    description: "",
    service_type: [],
    overview_points: [],
  });
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isPackageEditMode, setIsPackageEditMode] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/nursing");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching nursing categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async (categoryId) => {
    try {
      // Set selected category to show in package list header
      const category = categories.find((c) => c.id === categoryId);
      setSelectedCategory(category);

      const response = await axiosInstance.get(
        `/nursing/packages/${categoryId}`
      );
      if (response.data.success) {
        setPackages(response.data.packages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]); // Clear packages on error
    }
  };

  // --- Category Handlers ---
  const handleAddNewCategory = () => {
    setCategoryFormData({ name: "", selectedFile: null });
    setSelectedCategory(null);
    setIsEditMode(false);
    setModalType("add");
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({ name: category.name || "", selectedFile: null });
    setSelectedCategory(category);
    setIsEditMode(true);
    setModalType("edit");
    setShowModal(true);
  };

  // No explicit view handler in original, but adding it for modal consistency with Emr1
  const handleViewCategory = (category) => {
    setCategoryFormData({ name: category.name || "", selectedFile: null });
    setSelectedCategory(category);
    setIsEditMode(true); // Technically viewing, but we use the edit state to populate form
    setModalType("view");
    setShowModal(true);
  };

  const handleCategoryInputChange = (field, value) => {
    setCategoryFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCategoryFormData((prev) => ({
        ...prev,
        selectedFile: e.target.files[0],
      }));
    }
  };

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("name", categoryFormData.name);

      if (categoryFormData.selectedFile) {
        formDataToSend.append("logo", categoryFormData.selectedFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = isEditMode
        ? await axiosInstance.put(
            `/nursing/${selectedCategory.id}`,
            formDataToSend,
            config
          )
        : await axiosInstance.post("/nursing", formDataToSend, config);

      if (response.data.success) {
        fetchCategories();
        setShowModal(false);
      } else {
        toast.error("Error saving category: " + response.data.message);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (confirm(`Are you sure you want to delete ${category.name}?`)) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`/nursing/${category.id}`);
        if (response.data.success) {
          fetchCategories();
          toast.success("Category deleted successfully!");
        } else {
          toast.error("Error deleting category: " + response.data.message);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Error deleting category");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Package Handlers ---
  const resetPackageForm = () => {
    setPackageFormData({
      nursing_category_id: "",
      package_name: "",
      duration: "",
      price: "",
      description: "",
      service_type: [],
      overview_points: [],
    });
  };

  const handleAddNewPackage = () => {
    resetPackageForm();
    setSelectedPackage(null);
    setIsPackageEditMode(false);
    if (selectedCategory) {
      setPackageFormData((prev) => ({
        ...prev,
        nursing_category_id: selectedCategory.id,
        service_type: [""],
        overview_points: [""],
      }));
    }
    setModalType("add");
    setShowPackageModal(true);
  };

  const handleEditPackage = (pkg) => {
    let serviceTypes = [];
    let overviewPoints = [];

    try {
      serviceTypes = pkg.service_type ? JSON.parse(pkg.service_type) : [];
    } catch (e) {
      console.error("Error parsing service_type for edit:", e);
    }
    try {
      overviewPoints = pkg.overview_points ? JSON.parse(pkg.overview_points) : [];
    } catch (e) {
      console.error("Error parsing overview_points for edit:", e);
    }

    setSelectedPackage(pkg);
    setIsPackageEditMode(true);
    setPackageFormData({
      nursing_category_id: pkg.nursing_category_id,
      package_name: pkg.package_name,
      duration: pkg.duration,
      price: pkg.price,
      description: pkg.description,
      service_type: Array.isArray(serviceTypes) ? serviceTypes : [],
      overview_points: Array.isArray(overviewPoints) ? overviewPoints : [],
    });
    setModalType("edit");
    setShowPackageModal(true);
  };

  const handleDeletePackage = async (pkg) => {
    if (confirm(`Are you sure you want to delete ${pkg.package_name}?`)) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`/nursing/packages/${pkg.id}`);
        if (response.data.success) {
          if (selectedCategory) {
            fetchPackages(selectedCategory.id);
          }
          toast.success("Package deleted successfully!");
        } else {
          toast.error("Error deleting package: " + response.data.message);
        }
      } catch (error) {
        console.error("Error deleting package:", error);
        toast.error("Error deleting package");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePackageInputChange = (field, value) => {
    setPackageFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addServiceType = () => {
    setPackageFormData((prev) => ({
      ...prev,
      service_type: [...prev.service_type, ""],
    }));
  };

  const removeServiceType = (index) => {
    setPackageFormData((prev) => ({
      ...prev,
      service_type: prev.service_type.filter((_, i) => i !== index),
    }));
  };

  const updateServiceType = (index, value) => {
    setPackageFormData((prev) => {
      const updated = [...prev.service_type];
      updated[index] = value;
      return { ...prev, service_type: updated };
    });
  };

  const addOverviewPoint = () => {
    setPackageFormData((prev) => ({
      ...prev,
      overview_points: [...prev.overview_points, ""],
    }));
  };

  const removeOverviewPoint = (index) => {
    setPackageFormData((prev) => ({
      ...prev,
      overview_points: prev.overview_points.filter((_, i) => i !== index),
    }));
  };

  const updateOverviewPoint = (index, value) => {
    setPackageFormData((prev) => {
      const updated = [...prev.overview_points];
      updated[index] = value;
      return { ...prev, overview_points: updated };
    });
  };

  const handleSavePackage = async () => {
    try {
      setLoading(true);

      const packageDataToSend = {
        ...packageFormData,
        service_type: packageFormData.service_type,
        overview_points: packageFormData.overview_points,
      };

      const response = isPackageEditMode
        ? await axiosInstance.put(`/nursing/packages/${selectedPackage.id}`, packageDataToSend)
        : await axiosInstance.post("/nursing/packages", packageDataToSend);

      if (response.data.success) {
        toast.success(isPackageEditMode ? "Package updated successfully!" : "Package added successfully!");
        setShowPackageModal(false);
        if (packageFormData.nursing_category_id) {
          fetchPackages(packageFormData.nursing_category_id);
        }
        resetPackageForm();
      } else {
        toast.error("Error saving package: " + response.data.message);
      }
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("Error saving package");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPackages = (category) => {
    setSelectedCategory(category);
    fetchPackages(category.id);
    setActiveTab("packages");
  };

  // Function to render the Category form fields
  const renderCategoryForm = () => (
    <div className="row g-3">
      <div className="col-12 mb-3">
        <label className="form-label fw-bold">📝 Category Name</label>
        <input
          type="text"
          className="form-control"
          value={categoryFormData.name}
          onChange={(e) => handleCategoryInputChange("name", e.target.value)}
          placeholder="Enter category name"
          disabled={modalType === "view"}
        />
      </div>
      <div className="col-12 mb-3">
        <label className="form-label fw-bold">🖼️ Logo</label>
        <input
          type="file"
          className="form-control"
          onChange={handleFileChange}
          accept="image/*"
          disabled={modalType === "view"}
        />
        {/* Optional: Display current logo if in edit/view mode and logo exists */}
        {selectedCategory && selectedCategory.logo && modalType === "view" && (
          <div className="mt-2">
            <img
              src={`https://xrk77z9r-5000.inc1.devtunnels.ms${selectedCategory.logo}`}
              alt={selectedCategory.name}
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
              className="img-thumbnail"
            />
          </div>
        )}
      </div>
    </div>
  );

  // Function to render the Package form fields
  const renderPackageForm = () => (
    <div className="row g-3">
      <div className="col-md-6 mb-3">
        <label className="form-label fw-bold">🏥 Category</label>
        <select
          className="form-select"
          value={packageFormData.nursing_category_id}
          onChange={(e) =>
            handlePackageInputChange("nursing_category_id", e.target.value)
          }
          disabled={modalType === "view"}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label fw-bold">📦 Package Name</label>
        <input
          type="text"
          className="form-control"
          value={packageFormData.package_name}
          onChange={(e) =>
            handlePackageInputChange("package_name", e.target.value)
          }
          placeholder="e.g., 1 Day Pack"
          disabled={modalType === "view"}
        />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label fw-bold">⏰ Duration</label>
        <input
          type="text"
          className="form-control"
          value={packageFormData.duration}
          onChange={(e) => handlePackageInputChange("duration", e.target.value)}
          placeholder="e.g., 24 hours"
          disabled={modalType === "view"}
        />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label fw-bold">💰 Price</label>
        <input
          type="number"
          className="form-control"
          value={packageFormData.price}
          onChange={(e) => handlePackageInputChange("price", e.target.value)}
          placeholder="e.g., 500"
          disabled={modalType === "view"}
        />
      </div>
      <div className="col-12 mb-3">
        <label className="form-label fw-bold">📝 Description</label>
        <textarea
          className="form-control"
          rows="3"
          value={packageFormData.description}
          onChange={(e) =>
            handlePackageInputChange("description", e.target.value)
          }
          placeholder="Package description"
          disabled={modalType === "view"}
        />
      </div>
      <div className="col-12 mb-3">
        <label className="form-label fw-bold">🏥 Service Types</label>
        {packageFormData.service_type.map((service, index) => (
          <div key={index} className="input-group mb-2">
            <input
              type="text"
              className="form-control"
              value={service}
              onChange={(e) => updateServiceType(index, e.target.value)}
              placeholder="e.g., Home Care"
              disabled={modalType === "view"}
            />
            {modalType !== "view" && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeServiceType(index)}
              >
                <i className="fa-light fa-trash"></i>
              </button>
            )}
          </div>
        ))}
        {modalType !== "view" && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addServiceType}
          >
            <i className="fa-light fa-plus"></i> Add Service Type
          </button>
        )}
      </div>
      <div className="col-12 mb-3">
        <label className="form-label fw-bold">📋 Overview Points</label>
        {packageFormData.overview_points.map((point, index) => (
          <div key={index} className="input-group mb-2">
            <input
              type="text"
              className="form-control"
              value={point}
              onChange={(e) => updateOverviewPoint(index, e.target.value)}
              placeholder="e.g., 24/7 monitoring and care"
              disabled={modalType === "view"}
            />
            {modalType !== "view" && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeOverviewPoint(index)}
              >
                <i className="fa-light fa-trash"></i>
              </button>
            )}
          </div>
        ))}
        {modalType !== "view" && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addOverviewPoint}
          >
            <i className="fa-light fa-plus"></i> Add Overview Point
          </button>
        )}
      </div>
    </div>
  );

  // Dummy function for action dropdown in tables (since NursingList didn't have one)
  const handleDropdownToggle = (event) => {
    // Prevent dropdown from closing immediately on click, but since the original
    // table didn't have a dropdown, we'll keep the actions simple buttons for now.
    event.stopPropagation();
  };

  const renderCategoriesTable = () => (
    <table className="table table-dashed table-hover digi-dataTable table-striped">
      <thead>
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th className="text-center">Actions</th>
          <th>SL No.</th>
          <th>Name</th>
          <th>Logo</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="5" className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
        ) : categories.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center py-4">
              No categories found
            </td>
          </tr>
        ) : (
          categories.map((category, index) => (
            <tr key={category.id}>
              <td>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </td>
              <td className="text-center">
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="fa-thin fa-box bg-transparent border-0 p-0"
                    style={{
                      outline: "none",
                      boxShadow: "none",
                      color: "inherit", // 🌟 auto detects dark + light theme
                      background: "transparent",
                    }}
                    onClick={() => handleViewPackages(category)}
                    title="View Packages"
                  ></button>

                  <button
                    className="fa-light fa-pen bg-transparent border-0 p-0"
                    style={{
                      outline: "none",
                      boxShadow: "none",
                      color: "inherit", // 🌟 theme adaptive
                    }}
                    onClick={() => handleEditCategory(category)}
                    title="Edit"
                  ></button>

                  <button
                    className="fa-light fa-trash bg-transparent border-0 p-0"
                    style={{
                      outline: "none",
                      boxShadow: "none",
                      color: "inherit", // 🌟 theme adaptive
                    }}
                    onClick={() => handleDeleteCategory(category)}
                    title="Delete"
                  ></button>
                </div>
              </td>

              <td>{index + 1}</td>
              <td>{category.name}</td>
              <td>
                {category.logo && (
                  <img
                    src={`https://xrk77z9r-5000.inc1.devtunnels.ms${category.logo}`}
                    alt={category.name}
                    style={{
                      width: "50px",
                      height: "50px",
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
  );

  const renderPackagesTable = () => (
    <table className="table table-dashed table-hover digi-dataTable table-striped">
      <thead>
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th>SlNo.</th>
          <th>Package Name</th>
          <th>Duration</th>
          <th>Price</th>
          <th>Service Types</th>
          <th>Overview Points</th>
          <th className="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {packages.length === 0 ? (
          <tr>
            <td colSpan="8" className="text-center py-4">
              No packages found
            </td>
          </tr>
        ) : (
          packages.map((pkg, index) => {
            // --- FIX: Safely parse service_type and overview_points ---
            let serviceTypes = [];
            let overviewPoints = [];

            try {
              // Ensure pkg.service_type is present before parsing, default to '[]' if not,
              // then parse. If the result is not an array, set to [].
              serviceTypes = pkg.service_type
                ? JSON.parse(pkg.service_type)
                : [];
              if (!Array.isArray(serviceTypes)) {
                serviceTypes = [];
              }
            } catch (error) {
              console.error(
                "Error parsing service_type for package:",
                pkg.id,
                error
              );
            }

            try {
              overviewPoints = pkg.overview_points
                ? JSON.parse(pkg.overview_points)
                : [];
              if (!Array.isArray(overviewPoints)) {
                overviewPoints = [];
              }
            } catch (error) {
              console.error(
                "Error parsing overview_points for package:",
                pkg.id,
                error
              );
            }
            // -----------------------------------------------------------

            return (
              <tr key={pkg.id}>
                <td>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </td>
                <td>{index + 1}</td>
                <td>{pkg.package_name}</td>
                <td>{pkg.duration}</td>
                <td>₹{pkg.price}</td>
                <td>
                  {serviceTypes.map((service, index) => (
                    <span key={index} className="badge bg-info me-1">
                      {service}
                    </span>
                  ))}
                </td>
                <td>
                  {overviewPoints.slice(0, 2).map((point, index) => (
                    <div key={index} className="small">
                      • {point}
                    </div>
                  ))}
                  {overviewPoints.length > 2 && (
                    <div className="small text-muted">...and more</div>
                  )}
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEditPackage(pkg)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeletePackage(pkg)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>🏥 Nursing Management</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div className="nav nav-pills me-2">
                  <button
                    className={`nav-link me-2 ${
                      activeTab === "categories" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("categories")}
                  >
                    🏥 Categories
                  </button>
                  <button
                    className={`nav-link ${
                      activeTab === "packages" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("packages")}
                  >
                    📦 Packages
                  </button>
                </div>

                {activeTab === "categories" && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleAddNewCategory}
                  >
                    <i className="fa-light fa-plus"></i> ADD CATEGORY
                  </button>
                )}

                {activeTab === "packages" && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleAddNewPackage}
                  >
                    <i className="fa-light fa-plus"></i> ADD PACKAGE
                  </button>
                )}
              </div>
            </div>

            <div className="panel-body">
              {/* Filter/Search functionality from Emr1 is skipped as it wasn't in original NursingList */}

              {activeTab === "categories" && (
                <div className="table-responsive">
                  <OverlayScrollbarsComponent>
                    {renderCategoriesTable()}
                  </OverlayScrollbarsComponent>
                </div>
              )}

              {activeTab === "packages" && (
                <>
                  <h6 className="mb-3">
                    {selectedCategory
                      ? `Packages for: ${selectedCategory.name}`
                      : "All Packages"}
                  </h6>
                  <div className="table-responsive">
                    <OverlayScrollbarsComponent>
                      {renderPackagesTable()}
                    </OverlayScrollbarsComponent>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal (Sidebar Style) */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className={`profile-right-sidebar ${showModal ? "active" : ""}`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: showModal ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowModal(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div
              className="top-panel"
              style={{ height: "100%", paddingTop: "10px" }}
            >
              <div
                className="dropdown-txt"
                style={{ position: "sticky", top: 0, zIndex: 10 }}
              >
                {modalType === "add"
                  ? "➕ Add New"
                  : modalType === "edit"
                  ? "✏️ Edit"
                  : "👁️ View"}{" "}
                Category
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveCategory();
                    }}
                  >
                    {renderCategoryForm()}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowModal(false)}
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
                            : isEditMode
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

      {/* Package Modal (Sidebar Style - Larger like Emr1) */}
      {showPackageModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowPackageModal(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className={`profile-right-sidebar ${
              showPackageModal ? "active" : ""
            }`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "800px",
              right: showPackageModal ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowPackageModal(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div
              className="top-panel"
              style={{ height: "100%", paddingTop: "10px" }}
            >
              <div
                className="dropdown-txt"
                style={{ position: "sticky", top: 0, zIndex: 10 }}
              >
                {modalType === "add"
                  ? "➕ Add New"
                  : modalType === "edit"
                  ? "✏️ Edit"
                  : "👁️ View"}{" "}
                Package
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSavePackage();
                    }}
                  >
                    {renderPackageForm()}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowPackageModal(false)}
                      >
                        Cancel
                      </button>
                      {modalType !== "view" && (
                        <button
                          type="submit"
                          className="btn btn-success w-50"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Package"}
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
      {/* Footer is omitted as it was part of Emr1's wrapper but not the original NursingList. */}
    </div>
  );
};

export default NursingList;