import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PackageMaster = () => {
  const dropdownRef = useRef(null);

  // data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit | view
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    DpackageId: "",
    Dpackage: "",
    Rate: 0,
    SubDepartmentId: "",
  });

  const [formData1, setFormData1] = useState({
    DpackageId: formData.DpackageId || "",
    TestId: null,
    ProfileID: null,
    Profileyn: "",
    SlNo: "",
  });

  const [testData, setTestData] = useState([]);
  const [profileData, setProfileData] = useState([]);

  // search
  const [searchType, setSearchType] = useState("");

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState("");

  // sub-departments
  const [subDep, setSubDep] = useState([]);

  // fetch all items
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/dpackage?page=${pageNumber}`);
      const data = res.data.success ? res.data.data : [];

      setItems(data.map((d) => ({ ...d, showDropdown: false })));

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setLimit(res.data.pagination.limit);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch!");
    }
    setLoading(false);
  };

  // fetch sub department
  const fetchSubDepartment = async () => {
    try {
      const res = await axiosInstance("/subdepartment");
      if (res.data.success) {
        setSubDep(res.data.data);
        const arr = res.data.data;
        const newArr = [
          {
            SubDepartmentId: 0,
            SubDepartment: "-- Select --",
            DepartmentId: null,
            SpRemTag: null,
          },
          ...arr,
        ];
        // console.log(newArr)
        setSubDep(newArr);
      }
    } catch (error) {
      console.log("error fetching sub department: ", error);
    }
  };

  // fetch profile/test based on yes or no
  const fetchProfileTest = async () => {
    try {
      const tests = await axiosInstance.get("/tests?page=1&limit=30");
      setTestData(tests.data.data);
      console.log("tests: ", tests.data.data);
      const profiles = await axiosInstance.get("/profile");
      setProfileData(profiles.data.data);
      console.log("profiles: ", profiles.data.data);
    } catch (error) {
      console.log("Error fetching profile/test: ", error);
    }
  };

  useEffect(() => {
    fetchItems(1);
    fetchSubDepartment();
    fetchProfileTest();
  }, []);

  // search API
  const fetchSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchType.trim()) params.append("Remarks", searchType.trim());
      params.append("page", pageNumber);

      const res = await axiosInstance.get(
        `/remarks/search?${params.toString()}`
      );
      const data = res.data.success ? res.data.data : [];

      setItems(data.map((d) => ({ ...d, showDropdown: false })));

      if (res.data.pagination) {
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
        setLimit(res.data.pagination.limit);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    }
    setLoading(false);
  };

  // search handle
  const handleSearch = () => {
    if (!searchType.trim()) {
      fetchItems(1);
    } else {
      fetchSearch(1);
    }
  };

  const clearSearch = () => {
    setSearchType("");
    fetchItems(1);
  };

  // drawer openers
  const openDrawerAdd = () => {
    setFormData({ DpackageId: "", Dpackage: "", Rate: 0, SubDepartmentId: "" });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      DpackageId: item.DpackageId,
      Dpackage: item.Dpackage,
      Rate: item.Rate,
      SubDepartmentId: item.SubDepartmentId,
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      DpackageId: item.DpackageId,
      Dpackage: item.Dpackage,
      Rate: item.Rate,
      SubDepartmentId: item.SubDepartmentId,
    });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "edit") {
        await axiosInstance.put(
          `/dpackage/${editingItem.DpackageId}`,
          formData
        );
        toast.success("Updated successfully!", { autoClose: 1000 });
      } else {
        console.log(formData);
        await axiosInstance.post(`/dpackage`, {
          DpackageId: formData.DpackageId,
          Dpackage: formData.Dpackage,
          Rate: formData.Rate,
          SubDepartmentId: formData.SubDepartmentId,
        });
        toast.success("Created successfully!", { autoClose: 1000 });
      }
      setShowDrawer(false);
      fetchItems();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to save");
    }
  };

  // delete confirm
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/dpackage/${selectedId}`);
      toast.success("Deleted successfully!", { autoClose: 1000 });

      setShowConfirm(false);
      setDeleteId(null);

      // reload logic
      if (items.length === 1 && page > 1) {
        fetchItems(page - 1);
      } else {
        fetchItems(page);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete!");
    }
  };

  // pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;

    if (!searchType.trim()) {
      fetchItems(p);
    } else {
      fetchSearch(p);
    }
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🎁 Package Master</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Remarks..."
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ width: 150 }}
            />

            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>

            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
              Clear
            </button>

            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add
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
              <table className="table table-striped table-hover table-dashed">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Sl No</th>
                    <th>Package Name</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.DpackageId}>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openDrawerView(item)}
                            >
                              <i className="fa-light fa-eye"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openDrawerEdit(item)}
                            >
                              <i className="fa-light fa-pen-to-square"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setSelectedId(item.DpackageId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>

                        <td>{index + 1}</td>
                        <td>{item.Dpackage}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* Drawer */}
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
              maxWidth: "500px",
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

            <div
              className="top-panel"
              style={{
                height: "100%",
                overflowX:"hidden"
              }}
            >
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                 
                  padding: "10px",
                  width: "100%",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Package"
                  : modalType === "edit"
                  ? "✏️ Edit Package"
                  : "👁️ View Package"}
              </div>

              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Sample Type */}
                    <div className="mb-3">
                      <label className="form-label">Package Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Dpackage}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            Dpackage: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    {/* Colour */}
                    <div className="mb-3">
                      <label className="form-label">
                        PATHOLOGY Sub Department
                      </label>

                      <select
                        className="form-control"
                        value={formData.SubDepartmentId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            SubDepartmentId: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      >
                        {subDep.map((d, index) => (
                          <option key={index} value={d.SubDepartmentId}>
                            {d.SubDepartment}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rate(Rs.)</label>

                      <input
                        type="number"
                        className="form-control"
                        value={formData.Rate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            Rate: e.target.value,
                          }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <table className="table table-striped table-hover table-dashed">
                        <thead>
                          <tr>
                            <th>ProfileYN</th>
                            <th>Test Name/Profile Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <select
                                className="form-control"
                                value={formData1.Profileyn}
                                onChange={(e) =>
                                  setFormData1((prev) => ({
                                    ...prev,
                                    Profileyn: e.target.value,
                                  }))
                                }
                              >
                                <option value={""}>--select--</option>
                                <option value={"Y"}>Y</option>
                                <option value={"N"}>N</option>
                              </select>
                            </td>
                            <td>
                              {/* {
                                formData1.ProfileYn == "Y"?
                              } */}
                              {formData1.Profileyn == "" ? (
                                <select className="form-control"></select>
                              ) : formData1.Profileyn === "N" ? (
                                <select
                                  className="form-control"
                                  value={formData1.TestId}
                                >
                                  {testData.map((t, index) => (
                                    <option key={index} value={t.TestId}>
                                      {t.Test}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <select
                                  className="form-control"
                                  value={formData1.ProfileID}
                                >
                                  {profileData.map((t, index) => (
                                    <option key={index} value={t.ProfileId}>
                                      {t.Profile}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* {formData1.Profileyn === "N" ? (
                                <select
                                  className="form-control"
                                  value={formData1.TestId}
                                >
                                  {testData.map((t, index) => (
                                    <option key={index} value={t.TestId}>
                                      {t.Test}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <select
                                  className="form-control"
                                  value={formData1.ProfileID}
                                >
                                  {profileData.map((t, index) => (
                                    <option key={index} value={t.ProfileId}>
                                      {t.Profile}
                                    </option>
                                  ))}
                                </select>
                              )} */}
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                        <button type="submit" className="btn btn-primary w-50">
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

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>
              Prev
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${page === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 99999 }}
        ></div>
      )}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-light fa-triangle-exclamation me-2"></i>
                  Confirm Delete
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>

              <div className="modal-body text-center">
                <p className="fs-6 mb-1">
                  Are you sure you want to delete this?
                </p>
                <p className="text-muted">This cannot be undone.</p>
              </div>

              <div className="modal-footer d-flex justify-content-center gap-3">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger px-4" onClick={confirmDelete}>
                  Yes, Delete
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

export default PackageMaster;
