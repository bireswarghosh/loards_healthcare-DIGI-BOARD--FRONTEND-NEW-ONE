import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("packages");

  // Drawer state (EMR-style right sidebar)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [formData, setFormData] = useState({
    packageName: "",
    packagePrice: "",
    packageDescription: "",
    services: [{ serviceName: "", serviceDescription: "" }],
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const drawerRef = useRef(null);

  useEffect(() => {
    fetchData();
    // close drawer on outside click
    const handleOutside = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        // don't auto-close on any click to avoid accidental close; keep manual close
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPackages(), fetchPurchases(), fetchStatistics()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await axiosInstance.get("/admin/packages");
      if (response.data.success) {
        setPackages(response.data.packages || []);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await axiosInstance.get("/admin/packages/purchases");
      if (response.data.success) {
        setPurchases(response.data.purchases || []);
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get("/admin/packages/statistics");
      if (response.data.success) {
        setStatistics(response.data.statistics || {});
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  const openAddDrawer = () => {
    resetForm();
    setEditingPackage(null);
    setDrawerOpen(true);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      packageName: pkg.packageName || "",
      packagePrice: pkg.packagePrice?.toString() || "",
      packageDescription: pkg.packageDescription || "",
      services:
        pkg.services?.length > 0
          ? pkg.services.map((s) => ({
              serviceName: s.serviceName || "",
              serviceDescription: s.serviceDescription || "",
            }))
          : [{ serviceName: "", serviceDescription: "" }],
    });
    setSelectedImage(null);
    setImagePreview(pkg.packageImage || null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const response = await axiosInstance.delete(`/admin/packages/${id}`);
      if (response.data.success) {
        await fetchPackages();
        alert("Package deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting package:", err);
      alert("Failed to delete package");
    }
  };

  const addService = () => {
    setFormData((prev) => ({ ...prev, services: [...prev.services, { serviceName: "", serviceDescription: "" }] }));
  };

  const removeService = (index) => {
    setFormData((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };

  const updateService = (index, field, value) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.services[index][field] = value;
      return copy;
    });
  };

  const resetForm = () => {
    setFormData({
      packageName: "",
      packagePrice: "",
      packageDescription: "",
      services: [{ serviceName: "", serviceDescription: "" }],
    });
    setEditingPackage(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    try {
      const url = editingPackage ? `/admin/packages/${editingPackage.id}` : "/admin/packages";
      const method = editingPackage ? "put" : "post";

      const fd = new FormData();
      fd.append("packageName", formData.packageName);
      fd.append("packagePrice", formData.packagePrice);
      fd.append("packageDescription", formData.packageDescription || "");
      formData.services.forEach((s, idx) => {
        fd.append(`services[${idx}][serviceName]`, s.serviceName || "");
        fd.append(`services[${idx}][serviceDescription]`, s.serviceDescription || "");
      });
      if (selectedImage) fd.append("packageImage", selectedImage);

      const response = await axiosInstance[method](url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        await fetchPackages();
        setDrawerOpen(false);
        resetForm();
        alert(editingPackage ? "Package updated successfully!" : "Package created successfully!");
      } else {
        alert("Failed to save package");
      }
    } catch (err) {
      console.error("Error saving package:", err);
      alert("Failed to save package");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  const getStatusBadge = (isActive) => (
    <span className={`badge ${isActive ? "bg-success" : "bg-danger"}`}>{isActive ? "Active" : "Inactive"}</span>
  );

  return (
    <>
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            {/* Statistics cards - keep EMR styling */}
            <div className="row mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px", background: "linear-gradient(135deg,#0b74ff 0%,#5b21b6 100%)" }}>
                  <div className="card-body text-white text-center py-4">
                    <i className="fas fa-box mb-2" style={{ fontSize: "1.8rem", opacity: 0.9 }}></i>
                    <h4 className="fw-bold mb-1">{statistics.totalPackages || 0}</h4>
                    <div className="small">Total Packages</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px", background: "linear-gradient(135deg,#16a34a 0%,#7dd3fc 100%)" }}>
                  <div className="card-body text-white text-center py-4">
                    <i className="fas fa-check-circle mb-2" style={{ fontSize: "1.8rem", opacity: 0.9 }}></i>
                    <h4 className="fw-bold mb-1">{statistics.activePackages || 0}</h4>
                    <div className="small">Active Packages</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px", background: "linear-gradient(135deg,#f97316 0%,#f43f5e 100%)" }}>
                  <div className="card-body text-white text-center py-4">
                    <i className="fas fa-shopping-cart mb-2" style={{ fontSize: "1.8rem", opacity: 0.9 }}></i>
                    <h4 className="fw-bold mb-1">{statistics.totalPurchases || 0}</h4>
                    <div className="small">Total Purchases</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px", background: "linear-gradient(135deg,#2563eb 0%,#06b6d4 100%)" }}>
                  <div className="card-body text-white text-center py-4">
                    <i className="fas fa-rupee-sign mb-2" style={{ fontSize: "1.8rem", opacity: 0.9 }}></i>
                    <h4 className="fw-bold mb-1">{formatCurrency(statistics.totalRevenue || 0)}</h4>
                    <div className="small">Total Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs + Table Card */}
            <div className="panel">
              <div className="panel-header d-flex justify-content-between align-items-center">
                <div className="nav nav-pills">
                  <button className={`nav-link me-2 ${activeTab === "packages" ? "active" : ""}`} onClick={() => setActiveTab("packages")}>
                    <i className="fas fa-box me-1"></i> Packages
                  </button>
                  <button className={`nav-link ${activeTab === "purchases" ? "active" : ""}`} onClick={() => setActiveTab("purchases")}>
                    <i className="fas fa-shopping-cart me-1"></i> Purchases
                  </button>
                </div>

                <div>
                  {activeTab === "packages" && (
                    <button className="btn btn-sm btn-primary" onClick={openAddDrawer}>
                      <i className="fa-light fa-plus"></i> Add New Package
                    </button>
                  )}
                </div>
              </div>

              <div className="panel-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary"></div>
                  </div>
                ) : (
                  <>
                    {activeTab === "packages" ? (
                      <OverlayScrollbarsComponent>
                        <div className="table-responsive">
                          <table className="table table-dashed table-hover digi-dataTable table-striped">
                            <thead>
                              <tr>
                                <th className="text-start">Actions</th>
                                <th>Image</th>
                                <th>Package Name</th>
                                <th>Price</th>
                                <th>Services</th>
                                <th>Status</th>
                                <th>Purchases</th>
                              </tr>
                            </thead>
                            <tbody>
                              {packages.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="text-center">No packages found</td>
                                </tr>
                              ) : (
                                packages.map((pkg) => (
                                  <tr key={pkg.id}>
                                    {/* LEFT-SIDE ACTIONS (no dropdown) */}
                                    <td className="text-start">
                                      <div className="d-flex gap-1">
                                        <button className="btn btn-sm btn-outline-primary" title="Edit Package" onClick={() => handleEdit(pkg)}>
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" title="Delete Package" onClick={() => handleDelete(pkg.id)}>
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    </td>

                                    <td>
                                      {pkg.packageImage ? (
                                        <img src={pkg.packageImage} alt={pkg.packageName} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
                                      ) : (
                                        <div style={{ width: 50, height: 50, backgroundColor: "#f8f9fa", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                          <i className="fas fa-image text-muted"></i>
                                        </div>
                                      )}
                                    </td>

                                    <td>
                                      <strong>{pkg.packageName}</strong>
                                      {pkg.packageDescription && <div className="text-muted small">{pkg.packageDescription}</div>}
                                    </td>

                                    <td className="fw-bold text-success">{formatCurrency(pkg.packagePrice)}</td>
                                    <td><span className="badge bg-info">{pkg.services?.length || 0} services</span></td>
                                    <td>{getStatusBadge(pkg.isActive)}</td>
                                    <td><span className="badge bg-primary">{pkg._count?.purchases || 0}</span></td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </OverlayScrollbarsComponent>
                    ) : (
                      <OverlayScrollbarsComponent>
                        <div className="table-responsive">
                          <table className="table table-dashed table-hover digi-dataTable table-striped">
                            <thead>
                              <tr>
                                <th>Patient</th>
                                <th>Package</th>
                                <th>Amount</th>
                                <th>Payment Status</th>
                                <th>Purchase Date</th>
                                <th>Transaction ID</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchases.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-center">No purchases found</td>
                                </tr>
                              ) : (
                                purchases.map((purchase) => (
                                  <tr key={purchase.id}>
                                    <td>
                                      <strong>{purchase.patient?.fullName}</strong>
                                      <div className="text-muted small">{purchase.patient?.email}</div>
                                    </td>
                                    <td>{purchase.package?.packageName}</td>
                                    <td className="fw-bold text-success">{formatCurrency(purchase.purchaseAmount)}</td>
                                    <td>
                                      <span className={`badge ${
                                        purchase.paymentStatus === "completed" ? "bg-success" :
                                        purchase.paymentStatus === "pending" ? "bg-warning" :
                                        purchase.paymentStatus === "failed" ? "bg-danger" : "bg-secondary"
                                      }`}>{purchase.paymentStatus}</span>
                                    </td>
                                    <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                    <td>{purchase.transactionId || "N/A"}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </OverlayScrollbarsComponent>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR DRAWER (EMR style) */}
        {drawerOpen && (
          <>
            <div className="modal-backdrop fade show" onClick={() => setDrawerOpen(false)} style={{ zIndex: 9998 }}></div>

            <div
              className="profile-right-sidebar active"
              style={{
                zIndex: 9999,
                width: "100%",
                maxWidth: "560px",
                right: drawerOpen ? "0" : "-100%",
                top: "70px",
                height: "calc(100vh - 70px)",
              }}
            >
              <button className="right-bar-close" onClick={() => setDrawerOpen(false)}>
                <i className="fa-light fa-angle-right"></i>
              </button>

              <div className="top-panel" ref={drawerRef} style={{ height: "100%" }}>
                <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10,  color: "#fff", padding: "10px" }}>
                  {editingPackage ? "✏️ Edit Package" : "➕ Add New Package"}
                </div>

                <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                  <div className="p-3">
                    <form onSubmit={handleSave}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Package Name *</label>
                          <input type="text" className="form-control" required value={formData.packageName} onChange={(e) => setFormData({ ...formData, packageName: e.target.value })} />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Price (₹) *</label>
                          <input type="number" step="0.01" className="form-control" required value={formData.packagePrice} onChange={(e) => setFormData({ ...formData, packagePrice: e.target.value })} />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows="3" value={formData.packageDescription} onChange={(e) => setFormData({ ...formData, packageDescription: e.target.value })}></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Package Image</label>
                        <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
                        {imagePreview && (
                          <div className="mt-2">
                            <img src={imagePreview} alt="Preview" style={{ width: 150, height: 100, objectFit: "cover", borderRadius: 8 }} />
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label mb-0">Services Included</label>
                          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addService}>
                            <i className="fas fa-plus me-1"></i> Add Service
                          </button>
                        </div>

                        {formData.services.map((service, idx) => (
                          <div key={idx} className="border rounded p-2 mb-2">
                            <div className="row g-2 align-items-center">
                              <div className="col-5">
                                <input type="text" className="form-control" placeholder="Service Name" required value={service.serviceName} onChange={(e) => updateService(idx, "serviceName", e.target.value)} />
                              </div>
                              <div className="col-6">
                                <input type="text" className="form-control" placeholder="Description (optional)" value={service.serviceDescription} onChange={(e) => updateService(idx, "serviceDescription", e.target.value)} />
                              </div>
                              <div className="col-1 text-end">
                                {formData.services.length > 1 && (
                                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeService(idx)} title="Remove service">
                                    <i className="fas fa-trash"></i>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="d-flex gap-2 mt-3">
                        <button type="button" className="btn btn-secondary w-50" onClick={() => setDrawerOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary w-50">{editingPackage ? "Update Package" : "Create Package"}</button>
                      </div>
                    </form>
                  </div>
                </OverlayScrollbarsComponent>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PackageManagement;
