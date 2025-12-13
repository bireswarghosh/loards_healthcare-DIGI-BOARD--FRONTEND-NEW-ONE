import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const Formula = () => {
  const dropdownRef = useRef(null);

  // data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingItem, setEditingItem] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTest, setSelectedTest] = useState("");

  const [formData, setFormData] = useState({
    FormulaCode: "",
    FormulaName: "",
    FormulaText: "",
    FormulaValue: "",
  });

  // search for test
  const [searchType, setSearchType] = useState("");

  // search for item
//   const [searchItem, setSearchItem] = useState(second)

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // fetch items (GET formulas)
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/formulas?page=${pageNumber}&limit=${limit}`
      );
    //   const res = await axiosInstance.get(
    //     `/formulas?search=${searchItem}page=${pageNumber}&limit=${limit}`
    //   );

      const data = res.data.success ? res.data.data : [];

      setItems(data);

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Failed to fetch!");
    }
    setLoading(false);
  };

  // search tests by name
  const searchTests = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axiosInstance.get(
        `/tests/search/advanced?test=${encodeURIComponent(
          searchTerm
        )}&page=1&limit=50`
      );
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.error("Test search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // search API
  const fetchSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchType.trim()) params.append("search", searchType.trim());

      params.append("page", pageNumber);
      params.append("limit", limit);

      const res = await axiosInstance.get(`/formulas?${params.toString()}`);

      const data = res.data.success ? res.data.data : [];

      setItems(data);

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Search failed");
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchType.trim()) fetchItems(1);
    else fetchSearch(1);
  };

  const clearSearch = () => {
    setSearchType("");
    fetchItems(1);
  };

  // drawer open
  const openDrawerAdd = () => {
    setFormData({
      FormulaCode: "",
      FormulaName: "",
      FormulaText: "",
      FormulaValue: "",
    });
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      FormulaCode: item.FormulaCode,
      FormulaName: item.FormulaName,
      FormulaText: item.FormulaText,
      FormulaValue: item.FormulaValue,
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      FormulaCode: item.FormulaCode,
      FormulaName: item.FormulaName,
      FormulaText: item.FormulaText,
      FormulaValue: item.FormulaValue,
    });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  // calculator button press
  const addSymbol = (symbol) => {
    setFormData((prev) => ({
      ...prev,
      FormulaText: prev.FormulaText + symbol,
      FormulaValue: prev.FormulaValue + symbol,
    }));
  };

  // add test input box (read only)
  const addText = (test) => {
    setFormData((prev) => ({
      ...prev,
      FormulaText: prev.FormulaText + test,
      FormulaValue: prev.FormulaValue + `|${test}|`,
    }));
  };

  const handleBackspace = () => {
    setFormData((prev) => ({
      ...prev,
      FormulaText: prev.FormulaText.slice(0, -1),
    }));
  };

  const handleClear = () => {
    setFormData((prev) => ({
      ...prev,
      FormulaText: "",
    }));
  };

  // submit form (POST/PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "edit") {
        await axiosInstance.put(`/formulas/${editingItem.FormulaId}`, formData);
        toast.success("Updated successfully!");
      } else {
        await axiosInstance.post(`/formulas`, formData);
        toast.success("Created successfully!");
      }

      setShowDrawer(false);
      fetchItems();
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  // delete
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/formulas/${deleteId}`);
      toast.success("Deleted successfully!");

      setShowConfirm(false);
      setDeleteId(null);

      fetchItems(page);
    } catch (err) {
      toast.error("Failed to delete!");
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;

    if (!searchType.trim()) fetchItems(p);
    else fetchSearch(p);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🧮 Formula Master</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Formula..."
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ width: 160 }}
            />

            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>

            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
              Clear
            </button>

            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setSelectedTest("");
                openDrawerAdd();
              }}
            >
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
                    <th>Formula Code</th>
                    <th>Formula Name</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.FormulaId}>
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
                              onClick={() => {
                                openDrawerEdit(item);
                                setSelectedTest("");
                              }}
                            >
                              <i className="fa-light fa-pen-to-square"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setDeleteId(item.FormulaId);
                                setShowConfirm(true);
                              }}
                            >
                              <i className="fa-light fa-trash-can"></i>
                            </button>
                          </div>
                        </td>

                        <td>{index + 1}</td>
                        <td>{item.FormulaCode}</td>
                        <td>{item.FormulaName}</td>
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
              maxWidth: "480px",
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
                  //   backgroundColor: "#0a1735",
                  //   color: "#fff",
                  padding: "10px",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Formula"
                  : modalType === "edit"
                  ? "✏️ Edit Formula"
                  : "👁️ View Formula"}
              </div>

              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Code */}
                    <div className="mb-2">
                      <label className="form-label">Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.FormulaCode}
                        disabled={modalType === "view"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            FormulaCode: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* Name */}
                    <div className="mb-2">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.FormulaName}
                        disabled={modalType === "view"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            FormulaName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* Formula Text */}
                    <div className="mb-3">
                      <label className="form-label">Formula</label>
                      <textarea
                        className="form-control"
                        style={{
                          background: "black",
                          color: "white",
                          height: "120px",
                          fontSize: "16px",
                        }}
                        value={formData.FormulaText}
                        disabled={modalType === "view"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            FormulaText: e.target.value,
                          })
                        }
                        readOnly
                      ></textarea>
                    </div>

                    {/* Test Dropdown placeholder */}
                    <div className="mb-3">
                      {modalType !== "view" && (
                        <label className="form-label">Select Test</label>
                      )}

                      {/* Add Test Section */}
                      {/* {showTestSection && modalType !== "view" && ( */}
                      {modalType !== "view" && (
                        <div className="border rounded p-2">
                          <div className="row">
                            <div className="col-10">
                              <Select
                                value={selectedTest}
                                onChange={setSelectedTest}
                                onInputChange={(inputValue) => {
                                  searchTests(inputValue);
                                }}
                                options={searchResults.map((test) => ({
                                  value: test.TestId,
                                  label: `${test.Test} (Rate: ${test.Rate})`,
                                  test: test,
                                }))}
                                placeholder="Type to search tests..."
                                isSearchable={true}
                                isClearable={true}
                                isLoading={isSearching}
                                noOptionsMessage={({ inputValue }) =>
                                  inputValue.length < 2
                                    ? "Type at least 2 characters"
                                    : "No tests found"
                                }
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    minHeight: "32px",
                                    fontSize: "14px",
                                  }),
                                  menu: (base) => ({
                                    ...base,
                                    zIndex: 10000,
                                  }),
                                }}
                              />
                            </div>
                            <div className="col-2">
                              <button
                                className="btn btn-sm btn-primary w-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (selectedTest) {
                                    addText(selectedTest.test.Test);
                                  } else {
                                    console.log("I am empty: ", selectedTest);
                                  }
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Calculator Buttons */}
                    {modalType !== "view" && (
                      <div
                        className="calculator-grid mb-3"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "10px",
                        }}
                      >
                        {["+", "-", "*", "/", "(", ")"].map((btn) => (
                          <button
                            type="button"
                            key={btn}
                            className="btn btn-light border"
                            onClick={() => addSymbol(btn)}
                          >
                            {btn}
                          </button>
                        ))}

                        <button
                          type="button"
                          className="btn btn-warning d-flex flex-row"
                          onClick={handleBackspace}
                        >
                          <div>⬅</div>
                          <div>Backspace</div>
                        </button>

                        <div></div>

                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleClear}
                        >
                          Cancel
                        </button>

                        <button type="submit" className="btn btn-success">
                          Re Enter
                        </button>
                      </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Exit
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

      {/* Confirm Delete */}
      {showConfirm && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 99999 }}
          ></div>
          <div
            className="modal d-block"
            style={{
              zIndex: 100000,
              background: "rgba(0,0,0,0.2)",
            }}
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowConfirm(false)}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  <p className="mb-1">
                    Are you sure you want to delete this Formula?
                  </p>
                  <p className="text-muted">This cannot be undone.</p>
                </div>

                <div className="modal-footer d-flex justify-content-center">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>

                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {console.log("Selected test is: ", selectedTest)}
      <Footer />
    </div>
  );
};

export default Formula;
