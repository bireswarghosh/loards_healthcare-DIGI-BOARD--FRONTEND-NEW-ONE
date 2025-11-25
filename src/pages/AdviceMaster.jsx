import { useState, useEffect, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../axiosInstance";

const AdviceMaster = () => {
  const dropdownRef = useRef(null);

  const [advices, setAdvices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState("add");

  const [formData, setFormData] = useState({ Advice: "" });
  const [search, setSearch] = useState("");

  const fetchAdvices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/advices");
      const data = res.data.map((d) => ({ ...d, showDropdown: false }));
      setAdvices(data);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvices();
  }, []);

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setAdvices((prev) =>
      prev.map((item, i) => ({
        ...item,
        showDropdown: i === index ? !item.showDropdown : false,
      }))
    );
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAdvices((prev) =>
          prev.map((d) => ({ ...d, showDropdown: false }))
        );
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const openDrawerAdd = () => {
    setFormData({ Advice: "" });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({ Advice: item.Advice });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({ Advice: item.Advice });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advice?")) return;
    try {
      await axiosInstance.delete(`/advices/${id}`);
      fetchAdvices();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "edit") {
        await axiosInstance.put(
          `/advices/${editingItem.AdviceId}`,
          formData
        );
      } else {
        await axiosInstance.post("/advices", formData);
      }
      setShowDrawer(false);
      fetchAdvices();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const filtered = advices.filter((a) =>
    a.Advice.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-content">

      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          <h5>💡 Advice Management</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "200px" }}
            />

            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add Advice
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <table className="table table-dashed table-hover digi-dataTable table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Advice</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item.AdviceId}>
                      <td>{item.AdviceId}</td>
                      <td>{item.Advice}</td>

                      <td>
                        <div
                          className="digi-dropdown dropdown d-inline-block"
                          ref={dropdownRef}
                        >
                          <button
                            className={`btn btn-sm btn-outline-primary ${
                              item.showDropdown ? "show" : ""
                            }`}
                            onClick={(e) => toggleDropdown(e, index)}
                          >
                            Action <i className="fa-regular fa-angle-down"></i>
                          </button>

                          <ul
                            className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${
                              item.showDropdown ? "show" : ""
                            }`}
                          >
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openDrawerView(item);
                                }}
                              >
                                <i className="fa-light fa-eye"></i> View
                              </a>
                            </li>

                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openDrawerEdit(item);
                                }}
                              >
                                <i className="fa-light fa-pen-to-square"></i>{" "}
                                Edit
                              </a>
                            </li>

                            <li>
                              <a
                                href="#"
                                className="dropdown-item text-danger"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelete(item.AdviceId);
                                }}
                              >
                                <i className="fa-light fa-trash-can"></i>{" "}
                                Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* ⭐ RIGHT SIDE DRAWER PANEL */}
      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDrawer(false)}
            style={{ zIndex: 9998 }}
          ></div>

          <div
            className={`profile-right-sidebar active`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "450px",
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "#0a1735",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Advice"
                  : modalType === "edit"
                  ? "✏️ Edit Advice"
                  : "👁️ View Advice"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Advice *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Advice}
                        onChange={(e) =>
                          setFormData({ Advice: e.target.value })
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

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
                        >
                          Save
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
    </div>
  );
};

export default AdviceMaster;