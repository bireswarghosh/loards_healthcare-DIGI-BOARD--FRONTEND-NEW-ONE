import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const DiagProfile = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

// subdepertment------------------
  const [subDepartments, setSubDepartments] = useState([]);

  // department name 
  const [departmentName, setDepartmentName] = useState("");



  const [formData, setFormData] = useState({
    Profile: "",
    Department: "",
    SubDepartmentId: "",
    Rate: "",
    cost: "",
    DeliveryAfter: "",
    NotReq: false,
    Interpretation: "",
  });

  // Profile Tests
  const [allTests, setAllTests] = useState([]);
  const [profileTests, setProfileTests] = useState([]);
  const [showTestSection, setShowTestSection] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // search
  const [searchName, setSearchName] = useState("");

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // fetch all
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/profile?page=${pageNumber}`);
      const data = res.data.success ? res.data.data : [];

      setItems(data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setPage(res.data.pagination.currentPage || 1);
      }
    } catch (err) {
      toast.error("Fetch failed");
    }
    setLoading(false);
  };
//fetch sub department-------
const fetchSubDepartments = async () => {
  try {
    const res = await axiosInstance.get(`/subdepartment`);
    setSubDepartments(res.data.data || []);
  } catch (err) {
    console.error("SubDepartment load error:", err);
  }
};

// search tests by name
const searchTests = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) {
    setSearchResults([]);
    return;
  }
  
  setIsSearching(true);
  try {
    const res = await axiosInstance.get(`/tests/search/advanced?test=${encodeURIComponent(searchTerm)}&page=1&limit=50`);
    setSearchResults(res.data.data || []);
  } catch (err) {
    console.error("Test search error:", err);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

// fetch all tests (keep for profile test display)
const fetchAllTests = async () => {
  try {
    const res = await axiosInstance.get(`/tests?page=1&limit=1000`);
    setAllTests(res.data.data || []);
  } catch (err) {
    console.error("Tests load error:", err);
  }
};

// fetch profile tests
const fetchProfileTests = async (profileId) => {
  if (!profileId) return;
  try {
    const res = await axiosInstance.get(`/profiletest/profile/${profileId}`);
    setProfileTests(res.data.data || []);
  } catch (err) {
    console.error("Profile tests load error:", err);
  }
};

// add test to profile
const addTestToProfile = async (testId) => {
  if (modalType === "add") {
    // For new profiles, just add to local state
    const maxSlNo = Math.max(...profileTests.map(pt => pt.SlNo), 0);
    const newTest = {
      ProfileId: null, // Will be set after profile creation
      TestId: testId,
      SlNo: maxSlNo + 1
    };
    setProfileTests(prev => [...prev, newTest]);
    toast.success("Test added to profile");
    return;
  }
  
  if (!editingItem?.ProfileId) return;
  try {
    const maxSlNo = Math.max(...profileTests.map(pt => pt.SlNo), 0);
    await axiosInstance.post(`/profiletest`, {
      ProfileId: editingItem.ProfileId,
      TestId: testId,
      SlNo: maxSlNo + 1
    });
    fetchProfileTests(editingItem.ProfileId);
    toast.success("Test added to profile");
  } catch (err) {
    toast.error("Failed to add test");
  }
};

// remove test from profile
const removeTestFromProfile = async (testId) => {
  if (modalType === "add") {
    // For new profiles, just remove from local state
    setProfileTests(prev => prev.filter(pt => pt.TestId !== testId));
    toast.success("Test removed from profile");
    return;
  }
  
  if (!editingItem?.ProfileId) return;
  try {
    await axiosInstance.delete(`/profiletest/${editingItem.ProfileId}/${testId}`);
    fetchProfileTests(editingItem.ProfileId);
    toast.success("Test removed from profile");
  } catch (err) {
    toast.error("Failed to remove test");
  }
};

// fetch department name---- 
const fetchDepartmentName = async (deptId) => {
  try {
    const res = await axiosInstance.get(`/department/${deptId}`);
    if (res.data?.data?.Department) {
      setDepartmentName(res.data.data.Department);
      setFormData((prev) => ({ ...prev, Department: res.data.data.Department }));
    }
  } catch (err) {
    console.error("Department fetch error:", err);
  }
};

  useEffect(() => {
    fetchSubDepartments();
    fetchAllTests();
    fetchItems(1);
  }, []);


// find subdepartment name---- 
const getSubDeptName = (id) => {
  const found = subDepartments.find((sd) => sd.SubDepartmentId === id);
  return found ? found.SubDepartment : "—";
};


  // search
  const handleSearch = async () => {
    if (!searchName.trim()) return fetchItems(1);
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/profile?search=${searchName}`);
      setItems(res.data.data || []);
      setTotalPages(1);
      setPage(1);
    } catch (err) {
      toast.error("Search failed");
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchName("");
    fetchItems(1);
  };

  // drawer
  const openDrawerAdd = () => {
    setFormData({
      Profile: "",
      Department: "",
      SubDepartmentId: "",
      Rate: "",
      cost: "",
      DeliveryAfter: "",
      NotReq: false,
      Interpretation: "",
    });
    setModalType("add");
    setEditingItem(null);
    setShowTestSection(false);
    setSelectedTest(null);
    setProfileTests([]); // Clear profile tests for new profile
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      Profile: item.Profile || "",
      Department: item.Department || "",
      SubDepartmentId: item.SubDepartmentId || "",
      Rate: item.Rate || "",
      cost: item.cost || "",
      DeliveryAfter: item.DeliveryAfter || "",
      NotReq: item.NotReq === 1,
      Interpretation: item.Interpretation || "",
    });
    // find departmentId from subdepartment list
const sd = subDepartments.find(s => s.SubDepartmentId === item.SubDepartmentId);

if (sd?.DepartmentId) {
  fetchDepartmentName(sd.DepartmentId);
}

    setEditingItem(item);
    setModalType("edit");
    fetchProfileTests(item.ProfileId);
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      Profile: item.Profile || "",
      Department: item.Department || "",
      SubDepartmentId: item.SubDepartmentId || "",
      Rate: item.Rate || "",
      cost: item.cost || "",
      DeliveryAfter: item.DeliveryAfter || "",
      NotReq: item.NotReq === 1,
      Interpretation: item.Interpretation || "",
    });
    setEditingItem(item);
    setModalType("view");
    fetchProfileTests(item.ProfileId);
    setShowDrawer(true);
  };

  // save
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      NotReq: formData.NotReq ? 1 : 0,
    };

    try {
      let profileId;
      
      if (modalType === "edit") {
        await axiosInstance.put(`/profile/${editingItem.ProfileId}`, payload);
        profileId = editingItem.ProfileId;
        toast.success("Updated successfully");
      } else {
        // Create new profile first
        const response = await axiosInstance.post(`/profile`, payload);
        profileId = response.data.data?.ProfileId || response.data.ProfileId;
        toast.success("Created successfully");
        
        // Now save all the tests for the new profile
        if (profileTests.length > 0 && profileId) {
          for (const test of profileTests) {
            try {
              await axiosInstance.post(`/profiletest`, {
                ProfileId: profileId,
                TestId: test.TestId,
                SlNo: test.SlNo
              });
            } catch (testErr) {
              console.error(`Failed to add test ${test.TestId}:`, testErr);
            }
          }
          toast.success(`Profile created with ${profileTests.length} tests`);
        }
      }
      
      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      toast.error("Failed to save");
      console.error("Save error:", err);
    }
  };

  // delete
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/profile/${deleteId}`);
      toast.success("Deleted");
      setDeleteId(null);
      setShowConfirm(false);
      fetchItems(1);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchItems(p);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🧾Profile</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Profile name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 200 }}
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

        {/* TABLE */}
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
                    <th>Profile Name</th>
                    
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4">
                        No data
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.ProfileId}>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openDrawerView(item)}
                            >
                              <i className="fa fa-eye"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openDrawerEdit(item)}
                            >
                              <i className="fa fa-pen"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setDeleteId(item.ProfileId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.Profile || "—"}</td>
                        
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
          ></div>

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "420px",
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={() => setShowDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div className="dropdown-txt" style={{ background: "#0a1735", color: "#fff", padding: 10 }}>
                {modalType === "add"
                  ? "Add Profile"
                  : modalType === "edit"
                  ? "Edit Profile"
                  : "View Profile"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                    <div className="mb-2 col-md-4">
                      <label className="form-label">Profile Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Profile}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, Profile: e.target.value }))
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    <div className="mb-2 col-md-4">
                      <label className="form-label">Department *</label>
                      <input
  type="text"
  className="form-control"
  value={formData.Department}
  disabled
/>

                    </div>

                    <div className="mb-2 col-md-4">
                      <label className="form-label">Sub Department *</label>
                    <select
  className="form-control"
  value={formData.SubDepartmentId}
 onChange={(e) => {
  const subId = Number(e.target.value);
  setFormData((p) => ({ ...p, SubDepartmentId: subId }));

  // find subdepartment to get departmentId
  const selected = subDepartments.find((s) => s.SubDepartmentId === subId);
  if (selected?.DepartmentId) {
    fetchDepartmentName(selected.DepartmentId);
  }
}}

  disabled={modalType === "view"}
>
  <option value="">Select Sub Department</option>

  {subDepartments.map((sd) => (
    <option key={sd.SubDepartmentId} value={sd.SubDepartmentId}>
      {sd.SubDepartment}
    </option>
  ))}
</select>

                    </div>
</div>
                    <div className="row">
                      <div className="col-md-4 mb-2">
                        <label className="form-label">Rate(Rs.) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.Rate}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, Rate: e.target.value }))
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label">Costing *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.cost}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, cost: e.target.value }))
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                        <div className="mb-2 col-md-4">
                      <label className="form-label">Delivery After</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="day(s)"
                        min="0"
                        value={formData.DeliveryAfter}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, DeliveryAfter: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      />
                    </div>
                    </div>

                  

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.NotReq}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, NotReq: e.target.checked }))
                        }
                        disabled={modalType === "view"}
                      />
                      <label className="form-check-label">Not Required</label>
                    </div>

                    {/* Profile Tests Section */}
                    {modalType !== "view" && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label">Tests in Profile</label>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => setShowTestSection(!showTestSection)}
                          >
                            <i className="fa fa-plus"></i> {showTestSection ? 'Hide' : 'Add Test'}
                          </button>
                        </div>
                        
                        {/* Current Profile Tests */}
                        <div className="border rounded p-2 mb-2" style={{ maxHeight: "150px", overflowY: "auto" }}>
                          {profileTests.length === 0 ? (
                            <p className="text-muted text-center m-0">No tests added</p>
                          ) : (
                            profileTests.map((pt) => {
                              const test = allTests.find(t => t.TestId === pt.TestId);
                              return (
                                <div key={pt.TestId} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                  <span>{test?.Test || `Test ID: ${pt.TestId}`}</span>
                                  {modalType !== "view" && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeTestFromProfile(pt.TestId)}
                                    >
                                      <i className="fa fa-times"></i>
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Add Test Section */}
                        {showTestSection && modalType !== "view" && (
                          <div className="border rounded p-2">
                            <div className="row">
                              <div className="col-8">
                                <Select
                                  value={selectedTest}
                                  onChange={setSelectedTest}
                                  onInputChange={(inputValue) => {
                                    searchTests(inputValue);
                                  }}
                                  options={searchResults
                                    .filter(test => !profileTests.some(pt => pt.TestId === test.TestId))
                                    .map(test => ({
                                      value: test.TestId,
                                      label: `${test.Test} (ID: ${test.TestId})`,
                                      test: test
                                    }))
                                  }
                                  placeholder="Type to search tests..."
                                  isSearchable={true}
                                  isClearable={true}
                                  isLoading={isSearching}
                                  noOptionsMessage={({ inputValue }) => 
                                    inputValue.length < 2 ? "Type at least 2 characters" : "No tests found"
                                  }
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      minHeight: '32px',
                                      fontSize: '14px'
                                    }),
                                    menu: (base) => ({
                                      ...base,
                                      zIndex: 10000
                                    })
                                  }}
                                />
                              </div>
                              <div className="col-4">
                                <button
                                  className="btn btn-sm btn-primary w-100"
                                  onClick={() => {
                                    if (selectedTest) {
                                      addTestToProfile(selectedTest.value);
                                      setSelectedTest(null);
                                    }
                                  }}
                                  disabled={!selectedTest}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="form-label">Interpretation</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.Interpretation}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, Interpretation: e.target.value }))
                        }
                        disabled={modalType === "view"}
                      ></textarea>
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



      {/* Confirm Delete Modal */}
      {showConfirm && <div className="modal-backdrop fade show" style={{ zIndex: 99999 }}></div>}
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
                <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>

              <div className="modal-body text-center">
                <p className="fs-6 mb-1">Are you sure you want to delete this?</p>
                <p className="text-muted">This cannot be undone.</p>
              </div>

              <div className="modal-footer d-flex justify-content-center gap-3">
                <button className="btn btn-secondary px-4" onClick={() => setShowConfirm(false)}>
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
export default DiagProfile;