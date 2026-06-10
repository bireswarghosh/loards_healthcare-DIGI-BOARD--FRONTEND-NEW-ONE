import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { DigiContext } from "../../context/DigiContext";

const IndoorPackageMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packagesData, setPackagesData] = useState([]);
  const [acGenLeds, setAcGenLeds] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [inclusionsLoading, setInclusionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    Package: "",
    DescId: "",
    Rate: "",
    GSTAmt: "",
  });

  const [includeFormData, setIncludeFormData] = useState({
    IncHead: "",
    IncHeadRate: "",
  });
  const [editingInclude, setEditingInclude] = useState(null);

  useEffect(() => {
    fetchPackages();
    fetchAcGenLeds();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/packages");
      if (response.data.success) {
        setPackagesData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError("Failed to fetch packages: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAcGenLeds = async () => {
    try {
      const response = await axiosInstance.get("/ac-genled/acgenled");
      if (response.data.success) {
        setAcGenLeds(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching general ledgers:", error);
    }
  };

  const fetchInclusions = async (packageId) => {
    setInclusionsLoading(true);
    try {
      const response = await axiosInstance.get(`/includes/package/${packageId}/includes`);
      if (response.data.success) {
        setInclusions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching inclusions:", error);
    } finally {
      setInclusionsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormData({ Package: "", DescId: "", Rate: "", GSTAmt: "" });
    setInclusions([]);
    setIncludeFormData({ IncHead: "", IncHeadRate: "" });
    setEditingInclude(null);
    setShowSidebar(true);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      Package: pkg.Package || "",
      DescId: pkg.DescId || "",
      Rate: pkg.Rate !== null ? pkg.Rate : "",
      GSTAmt: pkg.GSTAmt !== null ? pkg.GSTAmt : "",
    });
    setIncludeFormData({ IncHead: "", IncHeadRate: "" });
    setEditingInclude(null);
    fetchInclusions(pkg.PackageId);
    setShowSidebar(true);
  };

  const handleDelete = async (pkg) => {
    if (window.confirm(`Are you sure you want to delete the package "${pkg.Package}"?`)) {
      setLoading(true);
      setError(null);
      try {
        await axiosInstance.delete(`/packages/${pkg.PackageId}`);
        alert("Package deleted successfully!");
        fetchPackages();
      } catch (err) {
        console.error("Error deleting package:", err);
        setError("Failed to delete: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const dataToSend = {
      Package: formData.Package,
      DescId: formData.DescId ? parseInt(formData.DescId) : null,
      Rate: (formData.Rate !== "" && formData.Rate !== null && formData.Rate !== undefined) ? parseFloat(formData.Rate) : null,
      GSTAmt: (formData.GSTAmt !== "" && formData.GSTAmt !== null && formData.GSTAmt !== undefined) ? parseFloat(formData.GSTAmt) : null,
    };

    try {
      if (editingPackage) {
        await axiosInstance.put(`/packages/${editingPackage.PackageId}`, dataToSend);
        alert("Package updated successfully!");
        setShowSidebar(false);
        fetchPackages();
      } else {
        const response = await axiosInstance.post("/packages", dataToSend);
        alert("Package created successfully!");
        // If they want to immediately add inclusions, keep sidebar open and load the newly created package edit state
        if (response.data.success && response.data.data) {
          const newPkg = response.data.data;
          setEditingPackage(newPkg);
          fetchInclusions(newPkg.PackageId);
        } else {
          setShowSidebar(false);
        }
        fetchPackages();
      }
    } catch (err) {
      console.error("Error saving package:", err);
      setError("Failed to save: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Inclusion Handlers
  const handleSaveInclusion = async (e) => {
    e.preventDefault();
    if (!includeFormData.IncHead) return;
    
    const dataToSend = {
      PackageId: editingPackage.PackageId,
      IncHead: includeFormData.IncHead,
      IncHeadRate: (includeFormData.IncHeadRate !== "" && includeFormData.IncHeadRate !== null && includeFormData.IncHeadRate !== undefined) ? parseFloat(includeFormData.IncHeadRate) : null,
    };

    try {
      if (editingInclude) {
        await axiosInstance.put(`/includes/package/${editingPackage.PackageId}/include/${editingInclude.IncludeId}`, dataToSend);
      } else {
        await axiosInstance.post("/includes", dataToSend);
      }
      setIncludeFormData({ IncHead: "", IncHeadRate: "" });
      setEditingInclude(null);
      fetchInclusions(editingPackage.PackageId);
    } catch (err) {
      console.error("Error saving inclusion:", err);
      alert("Failed to save inclusion: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditInclusion = (inc) => {
    setEditingInclude(inc);
    setIncludeFormData({
      IncHead: inc.IncHead || "",
      IncHeadRate: inc.IncHeadRate !== null ? inc.IncHeadRate : "",
    });
  };

  const handleDeleteInclusion = async (inc) => {
    if (window.confirm(`Delete inclusion "${inc.IncHead}"?`)) {
      try {
        await axiosInstance.delete(`/includes/package/${editingPackage.PackageId}/include/${inc.IncludeId}`);
        fetchInclusions(editingPackage.PackageId);
      } catch (err) {
        console.error("Error deleting inclusion:", err);
        alert("Failed to delete inclusion: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCancelIncludeEdit = () => {
    setEditingInclude(null);
    setIncludeFormData({ IncHead: "", IncHeadRate: "" });
  };

  // Helper to map DescId to ledger name
  const getLedgerName = (descId) => {
    const ledger = acGenLeds.find((l) => l.DescId === descId);
    return ledger ? ledger.Desc : descId || "N/A";
  };

  const filtered = packagesData.filter(
    (pkg) =>
      pkg.Package?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.PackageId?.toString().includes(searchTerm)
  );

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Package Name</th>
          <th>Account Ledger</th>
          <th className="text-end">Rate (₹)</th>
          <th className="text-end">GST (₹)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((pkg) => (
          <tr key={pkg.PackageId}>
            <td>{pkg.PackageId}</td>
            <td>{pkg.Package}</td>
            <td>{getLedgerName(pkg.DescId)}</td>
            <td className="text-end">
              ₹{Number(pkg.Rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="text-end">
              ₹{Number(pkg.GSTAmt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(pkg)}
                  title="Edit / Manage Includes"
                >
                  <i className="fa-light fa-pen-to-square"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(pkg)}
                  title="Delete"
                >
                  <i className="fa-light fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          <div className="panel">
            <div className="panel-header">
              <h5>📦 Indoor Package Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search package..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
                  <i className="fa-light fa-plus"></i> Add Package
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>{isBelowLg ? <OverlayScrollbarsComponent>{renderTable()}</OverlayScrollbarsComponent> : renderTable()}</>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowSidebar(false)}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              right: 0,
              zIndex: 9999,
              maxWidth: "550px",
              width: "100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={() => setShowSidebar(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%", paddingTop: "10px" }}>
              <div
                className="dropdown-txt"
                style={{
                  backgroundColor: "#0a1735",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                {editingPackage ? `✏️ Edit Package (${editingPackage.PackageId})` : "➕ Add Indoor Package"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSavePackage}>
                    <div className="mb-3">
                      <label className="form-label">Package Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Package}
                        onChange={(e) => setFormData({ ...formData, Package: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Account Ledger *</label>
                      <select
                        className="form-select"
                        value={formData.DescId}
                        onChange={(e) => setFormData({ ...formData, DescId: e.target.value })}
                        required
                      >
                        <option value="">Select Ledger</option>
                        {acGenLeds.map((item) => (
                          <option key={item.DescId} value={item.DescId}>
                            {item.Desc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="form-label">Rate (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.Rate}
                          onChange={(e) => setFormData({ ...formData, Rate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label">GST Amount (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.GSTAmt}
                          onChange={(e) => setFormData({ ...formData, GSTAmt: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-2 mb-4">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowSidebar(false)}
                      >
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit" disabled={loading}>
                        {loading ? "Saving..." : editingPackage ? "Update Package" : "Save & Continue"}
                      </button>
                    </div>
                  </form>

                  {/* INCLUSIONS MANAGEMENT SECTION */}
                  {editingPackage && (
                    <div className="border-top pt-4 mt-4">
                      <h6 className="mb-3">📋 Package Inclusions (Inclusions/Exclusions)</h6>
                      
                      {/* Inclusion Form */}
                      <form onSubmit={handleSaveInclusion} className="mb-4 p-3 bg-light rounded">
                        <div className="dropdown-txt mb-2" style={{ fontSize: "14px", padding: "4px 8px" }}>
                          {editingInclude ? "✏️ Edit Inclusion" : "➕ Add Inclusion"}
                        </div>
                        
                        <div className="mb-2">
                          <label className="form-label" style={{ fontSize: "12px" }}>Inclusion Head *</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. DIALYSIS CHARGES, CONSULTANT FEES"
                            value={includeFormData.IncHead}
                            onChange={(e) => setIncludeFormData({ ...includeFormData, IncHead: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label" style={{ fontSize: "12px" }}>Rate (₹) (Optional - 0 for completely covered)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm"
                            placeholder="0.00"
                            value={includeFormData.IncHeadRate}
                            onChange={(e) => setIncludeFormData({ ...includeFormData, IncHeadRate: e.target.value })}
                          />
                        </div>
                        
                        <div className="d-flex gap-2">
                          {editingInclude && (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary w-50"
                              onClick={handleCancelIncludeEdit}
                            >
                              Cancel Edit
                            </button>
                          )}
                          <button
                            type="submit"
                            className="btn btn-sm btn-primary w-100"
                          >
                            {editingInclude ? "Update Inclusion" : "Add Inclusion"}
                          </button>
                        </div>
                      </form>

                      {/* Inclusion List */}
                      {inclusionsLoading ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm text-primary"></div>
                        </div>
                      ) : inclusions.length === 0 ? (
                        <div className="text-center text-muted py-3" style={{ fontSize: "13px" }}>
                          No inclusions added to this package yet.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-sm table-dashed table-striped" style={{ fontSize: "13px" }}>
                            <thead>
                              <tr>
                                <th>Inc Head</th>
                                <th className="text-end">Rate (₹)</th>
                                <th style={{ width: "80px" }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inclusions.map((inc) => (
                                <tr key={inc.IncludeId}>
                                  <td>{inc.IncHead}</td>
                                  <td className="text-end">
                                    ₹{Number(inc.IncHeadRate || 0).toFixed(2)}
                                  </td>
                                  <td>
                                    <div className="d-flex gap-1 justify-content-center">
                                      <button
                                        type="button"
                                        className="btn btn-xs btn-link p-0 text-primary"
                                        onClick={() => handleEditInclusion(inc)}
                                        title="Edit"
                                        style={{ border: "none", background: "none" }}
                                      >
                                        <i className="fa-light fa-pen-to-square"></i>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-xs btn-link p-0 text-danger"
                                        onClick={() => handleDeleteInclusion(inc)}
                                        title="Delete"
                                        style={{ border: "none", background: "none" }}
                                      >
                                        <i className="fa-light fa-trash-can"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IndoorPackageMaster;
