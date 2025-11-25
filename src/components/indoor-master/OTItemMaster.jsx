import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const OTItemMaster = () => {
  const [itemData, setItemData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    OtItem: "",
    OtCategoryId: "",
    Rate: 0,
    Unit: "",
    ServiceChYN: "Y",
  });

  useEffect(() => {
    fetchOtItems();
    fetchCategories();
  }, []);

  const fetchOtItems = async () => {
    try {
      const response = await axiosInstance.get("/otItem");
      if (response.data.success) setItemData(response.data.data);
    } catch {
      console.error("Error fetching OT items");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/otItem/categories");
      if (response.data.success) setCategories(response.data.data);
    } catch {
      console.error("Error fetching categories");
    }
  };

  const openAddSidebar = () => {
    setFormData({
      OtItem: "",
      OtCategoryId: "",
      Rate: 0,
      Unit: "",
      ServiceChYN: "Y",
    });
    setEditingItem(null);
    setShowSidebar(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      OtItem: item.OtItem || "",
      OtCategoryId: item.OtCategoryId || "",
      Rate: item.Rate || 0,
      Unit: item.Unit || "",
      ServiceChYN: item.ServiceChYN || "Y",
    });
    setShowSidebar(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete ${item.OtItem}?`)) {
      try {
        await axiosInstance.delete(`/otItem/${item.OtItemId}`);
        fetchOtItems();
      } catch {
        alert("Error deleting item");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = editingItem
        ? await axiosInstance.put(`/otItem/${editingItem.OtItemId}`, formData)
        : await axiosInstance.post("/otItem", formData);

      if (response.data.success) {
        fetchOtItems();
        setShowSidebar(false);
      } else {
        alert("Error saving item");
      }
    } catch {
      alert("Error saving item");
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingItem(null);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          {/* PANEL */}
          <div className="panel">
            <div className="panel-header d-flex justify-content-between">
              <h5>🔧 OT Item Master - List</h5>

              <button className="btn btn-sm btn-primary" onClick={openAddSidebar}>
                <i className="fa-light fa-plus"></i> Add New
              </button>
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
                        <th>Item Name</th>
                        <th>Category</th>
                        <th className="text-end">Rate (₹)</th>
                        <th>Unit</th>
                        <th className="text-center">Service</th>
                      </tr>
                    </thead>

                    <tbody>
                      {itemData.map((item) => (
                        <tr key={item.OtItemId}>
                          
                          {/* ACTION LEFT SIDE */}
                          <td className="text-center">
                            <div className="btn-box">
                              <button onClick={() => handleEdit(item)}>
                                <i className="fa-light fa-pen"></i>
                              </button>
                              <button onClick={() => handleDelete(item)}>
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td className="text-center">{item.OtItem}</td>
                          <td className="text-center">{item.OtCategory || "N/A"}</td>
                          <td className="text-end">
                            ₹{(item.Rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-center">{item.Unit || "N/A"}</td>

                          <td className="text-center">
                            <span className={`badge ${item.ServiceChYN === "Y" ? "bg-success" : "bg-danger"}`}>
                              {item.ServiceChYN === "Y" ? "🟢 Yes" : "🔴 No"}
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

      {/* RIGHT SIDEBAR FORM */}
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
              <div className="dropdown-txt" style={{  }}>
                {editingItem ? "✏️ Edit OT Item" : "➕ Add OT Item"}
              </div>

              <div style={{ overflowY: "auto", height: "calc(100% - 70px)" }}>
                <div className="p-3">

                  <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.OtItem}
                        onChange={(e) =>
                          setFormData({ ...formData, OtItem: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-control"
                        value={formData.OtCategoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            OtCategoryId: Number(e.target.value),
                          })
                        }
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.OtCategoryId} value={cat.OtCategoryId}>
                            {cat.OtCategory}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rate (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.Rate}
                        onChange={(e) =>
                          setFormData({ ...formData, Rate: Number(e.target.value) })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Unit *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Unit}
                        onChange={(e) =>
                          setFormData({ ...formData, Unit: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.ServiceChYN === "Y"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ServiceChYN: e.target.checked ? "Y" : "N",
                          })
                        }
                      />
                      <label className="form-check-label">Service Charge</label>
                    </div>

                    {/* BUTTONS */}
                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={closeSidebar}>
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit">
                        {editingItem ? "Update" : "Save"}
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

export default OTItemMaster;
