import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const OTCategory = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    OtCategory: "",
  });

  useEffect(() => {
    fetchOtCategories();
  }, []);

  const fetchOtCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/otCategory");
      if (response.data.success) {
        setCategoryData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching OT categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddSidebar = () => {
    setFormData({ OtCategory: "" });
    setEditingCategory(null);
    setShowSidebar(true);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      OtCategory: cat.OtCategory || ""
    });
    setShowSidebar(true);
  };

  const handleDelete = async (cat) => {
    if (window.confirm(`Are you sure you want to delete ${cat.OtCategory}?`)) {
      try {
        await axiosInstance.delete(`/otCategory/${cat.OtCategoryId}`);
        fetchOtCategories();
      } catch {
        alert("Error deleting category!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingCategory
        ? await axiosInstance.put(`/otCategory/${editingCategory.OtCategoryId}`, formData)
        : await axiosInstance.post("/otCategory", formData);

      if (res.data.success) {
        fetchOtCategories();
        setShowSidebar(false);
      } else {
        alert("Error saving category!");
      }
    } catch {
      alert("Error saving category!");
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingCategory(null);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          <div className="panel">
            <div className="panel-header">
              <h5>📂 OT Category - List</h5>

              <div className="btn-box d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={openAddSidebar}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dashed table-hover digi-dataTable table-striped">
                    <thead>
                      <tr>
                        <th style={{ width: "70px" }}>Action</th>
                        <th>OT Category</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {categoryData.map((cat) => (
                        <tr key={cat.OtCategoryId}>
                          
                          {/* ACTION LEFT SIDE */}
                          <td className="text-center">
                            <div className="btn-box">
                              <button onClick={() => handleEdit(cat)}>
                                <i className="fa-light fa-pen"></i>
                              </button>
                              <button onClick={() => handleDelete(cat)}>
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td >{cat.OtCategory}</td>

                          <td >
                            <span className="badge bg-success">
                              🟢 Active
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      {showSidebar && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={closeSidebar}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: "0",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >

            <button className="right-bar-close" onClick={closeSidebar}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div
                className="dropdown-txt"
                style={{ backgroundColor: "#0a1735" }}
              >
                {editingCategory ? "✏️ Edit OT Category" : "➕ Add OT Category"}
              </div>

              <div style={{ overflowY: "auto", height: "calc(100% - 70px)" }}>
                <div className="p-3">

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">OT Category *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.OtCategory}
                        onChange={(e) =>
                          setFormData({ ...formData, OtCategory: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={closeSidebar}>
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit">
                        {editingCategory ? "Update" : "Save"}
                      </button>
                    </div>

                  </form>

                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OTCategory;
