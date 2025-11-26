import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { toast } from "react-toastify";

const GenericMedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // pagination / search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // form
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    manufacturer: "",
    strength: "",
    dosageForm: "",
    price: "",
    description: "",
  });

  const drawerRef = useRef(null);

  useEffect(() => {
    fetchMedicines();
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit, ...(searchQuery ? { search: searchQuery } : {}) };
      const response = await axiosInstance.get("/generic-medicines", { params });

      if (response.data && response.data.success) {
        setMedicines(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems ?? (response.data.data || []).length);
      } else {
        setMedicines([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
      toast.error(err.response?.data?.message || "Failed to fetch medicines", { position: "top-right", autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    resetForm();
    setEditingMedicine(null);
    setDrawerOpen(true);
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name || "",
      genericName: medicine.generic_name || "",
      manufacturer: medicine.manufacturer || "",
      strength: medicine.strength || "",
      dosageForm: medicine.dosage_form || "",
      price: medicine.price?.toString() || "",
      description: medicine.description || "",
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const res = await axiosInstance.delete(`/generic-medicines/${id}`);
      if (res.data && res.data.success) {
        await fetchMedicines();
      } else {
        toast.error(res.data?.message || "Failed to delete medicine", { position: "top-right", autoClose: 2000 });
      }
    } catch (err) {
      console.error("Error deleting medicine:", err);
      toast.error(err.response?.data?.message || "Failed to delete medicine", { position: "top-right", autoClose: 2000 });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      genericName: "",
      manufacturer: "",
      strength: "",
      dosageForm: "",
      price: "",
      description: "",
    });
    setEditingMedicine(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      const url = editingMedicine ? `/generic-medicines/${editingMedicine.id}` : "/generic-medicines";
      const method = editingMedicine ? "put" : "post";

      const payload = {
        name: formData.name,
        genericName: formData.genericName,
        manufacturer: formData.manufacturer,
        strength: formData.strength,
        dosageForm: formData.dosageForm,
        price: formData.price,
        description: formData.description,
      };

      const response = await axiosInstance[method](url, payload);

      if (response.data && response.data.success) {
        toast.success(editingMedicine ? "Medicine updated successfully" : "Medicine created successfully", { position: "top-right", autoClose: 2000 });
        await fetchMedicines();
        setDrawerOpen(false);
        resetForm();
      } else {
        toast.error(response.data?.message || "Failed to save medicine", { position: "top-right", autoClose: 2000 });
      }
    } catch (err) {
      console.error("Error saving medicine:", err);
      toast.error(err.response?.data?.message || "Failed to save medicine", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  // small helper to render pagination buttons compactly
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    // show max 7 page buttons: current ±3
    const start = Math.max(1, currentPage - 3);
    const end = Math.min(totalPages, currentPage + 3);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <nav>
        <ul className="pagination pagination-sm justify-content-center mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </button>
          </li>

          {start > 1 && (
            <li className="page-item">
              <button className="page-link" onClick={() => setCurrentPage(1)}>
                1
              </button>
            </li>
          )}

          {start > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}

          {pages.map((p) => (
            <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(p)}>
                {p}
              </button>
            </li>
          ))}

          {end < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}

          {end < totalPages && (
            <li className="page-item">
              <button className="page-link" onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </button>
            </li>
          )}

          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="main-content">
      {/* panel header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Generic Medicine Management</h5>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Search medicines"
                  />
                </div>

                <button className="btn btn-sm btn-primary" onClick={openAddDrawer}>
                  Add New Medicine
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* table panel */}
      <div className="panel">
        <div className="panel-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading medicines...</p>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <div className="table-responsive">
                <table className="table table-dashed table-hover digi-dataTable table-striped mb-0">
                  <thead >
                    <tr>
                      <th className="py-3 px-3 text-start">Actions</th>
                      <th className="py-3 px-3">Medicine Name</th>
                      <th className="py-3">Generic Name</th>
                      <th className="py-3">Manufacturer</th>
                      <th className="py-3">Strength</th>
                      <th className="py-3">Form</th>
                      <th className="py-3">Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {medicines.length > 0 ? (
                      medicines.map((m) => (
                        <tr key={m.id} className="align-middle">
                          <td className="py-3 px-3 text-start">
                            <div className="d-flex gap-3">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(m)} title="Edit">
                                <i class="fa-light fa-pen"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m.id)} title="Delete">
                               <i class="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div>
                              <div className="fw-bold">{m.name}</div>
                            </div>
                          </td>

                          <td className="py-3">
                            <span className="badge bg-info bg-opacity-10 text-info px-2 py-1">{m.generic_name}</span>
                          </td>

                          <td className="py-3">{m.manufacturer || "N/A"}</td>
                          <td className="py-3">
                            <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">{m.strength || "N/A"}</span>
                          </td>
                          <td className="py-3">{m.dosage_form || "N/A"}</td>
                          <td className="py-3">{formatCurrency(m.price)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="text-muted">
                            <p className="mb-0">No medicines found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </OverlayScrollbarsComponent>
          )}
        </div>

        {/* pagination */}
        {renderPagination() && <div className="card-footer  border-0">{renderPagination()}</div>}
      </div>

      {/* right drawer */}
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
              <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10,  padding: "10px" }}>
                {editingMedicine ? "✏️ Edit Medicine" : "➕ Add Medicine"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Medicine Name *</label>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Generic Name *</label>
                        <input type="text" className="form-control" value={formData.genericName} onChange={(e) => setFormData((p) => ({ ...p, genericName: e.target.value }))} required />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Manufacturer</label>
                        <input type="text" className="form-control" value={formData.manufacturer} onChange={(e) => setFormData((p) => ({ ...p, manufacturer: e.target.value }))} />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Strength</label>
                        <input type="text" className="form-control" placeholder="e.g., 500mg" value={formData.strength} onChange={(e) => setFormData((p) => ({ ...p, strength: e.target.value }))} />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Dosage Form</label>
                        <select className="form-select" value={formData.dosageForm} onChange={(e) => setFormData((p) => ({ ...p, dosageForm: e.target.value }))}>
                          <option value="">Select Form</option>
                          <option value="Tablet">Tablet</option>
                          <option value="Capsule">Capsule</option>
                          <option value="Syrup">Syrup</option>
                          <option value="Injection">Injection</option>
                          <option value="Cream">Cream</option>
                          <option value="Ointment">Ointment</option>
                          <option value="Drops">Drops</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Price (₹)</label>
                        <input type="number" step="0.01" className="form-control" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}></textarea>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setDrawerOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary w-50">
                        {editingMedicine ? "Update Medicine" : "Add Medicine"}
                      </button>
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GenericMedicineManagement;
