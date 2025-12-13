import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestReportSeq = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // search
  const [searchTest, setSearchTest] = useState("");

  // dropdown list
  const [allTests, setAllTests] = useState([]);

  // Add/Edit drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("edit");
  const [editingItem, setEditingItem] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  // form data
  const [formData, setFormData] = useState({
    TestId: "",
    Test: "",
    RSlNo: "",
  });

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(20);

  // =============================
  // Fetch list for table
  // =============================
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/tests/search/advanced?page=${pageNumber}&limit=${limit}`
      );

      let data = res.data.data || [];
      data.sort((a, b) => Number(a.RSlNo) - Number(b.RSlNo));
      setItems(data);

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setLimit(res.data.pagination.itemsPerPage);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
    } catch {
      toast.error("Failed to load tests!");
    }
    setLoading(false);
  };

  // =============================
  // Fetch all tests for dropdown
  // =============================
  const fetchAllTests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/tests?page=1&limit=${totalItems}`);
      setAllTests(res.data.data || []);
    } catch (err) {
      console.log("Dropdown load error", err);
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  // ⭐ Fetch dropdown list AFTER totalItems is updated
  useEffect(() => {
    if (totalItems > 20) {
      fetchAllTests();
    }
  }, [totalItems]);

  // =============================
  // Search
  // =============================
  const fetchSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTest.trim()) params.append("test", searchTest.trim());
      params.append("page", pageNumber);
      params.append("limit", limit);

      const res = await axiosInstance.get(
        `/tests/search/advanced?${params.toString()}`
      );

      let data = res.data.data || [];
      data.sort((a, b) => Number(a.RSlNo) - Number(b.RSlNo));
      setItems(data);

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setLimit(res.data.pagination.itemsPerPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch {
      toast.error("Search failed!");
    }
    finally{setLoading(false)}
  };

  const handleSearch = () =>
    searchTest.trim() ? fetchSearch(1) : fetchItems(1);

  const clearSearch = () => {
    setSearchTest("");
    fetchItems(1);
  };

  // =============================
  // Open Drawer Edit
  // =============================
  const openDrawerEdit = (item) => {
    setFormData({
      TestId: item.TestId,
      Test: item.Test,
      RSlNo: item.RSlNo,
    });

    setSelectedTest(item); // Full object for backend update
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  // =============================
  // Open Drawer Add
  // =============================
  const openDrawerAdd = () => {
    setFormData({ TestId: "", Test: "", RSlNo: "" });
    setSelectedTest(null);
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  // =============================
  // Submit Add/Edit
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fullObj = editingItem ?? selectedTest;
    if (!fullObj) {
      toast.error("Please select a test!");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.put(`/tests/${fullObj.TestId}`, {
        ...fullObj,
        RSlNo: Number(formData.RSlNo),
      });

      toast.success("Updated successfully!", { autoClose: 800 });

      setShowDrawer(false);
      searchTest.trim()
        ? fetchSearch(page)
        : fetchItems(page);
    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data || err);
      toast.error("Save failed!");
    }
    finally{setLoading(false)}
  };

  // pagination
  const loadPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);

    searchTest.trim()
      ? fetchSearch(newPage)
      : fetchItems(newPage);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">

        {/* HEADER */}
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>📑 Test Report Sequence</h5>

          <div className="d-flex gap-2">

            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Test..."
              value={searchTest}
              onChange={(e) => setSearchTest(e.target.value)}
              style={{ width: "200px" }}
            />

            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              Search
            </button>

            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
              Clear
            </button>

            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              ➕ Add
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
                    <th>Test Name</th>
                    <th>Sequence</th>
                    
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.TestId}>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openDrawerEdit(item)}
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </button>
                        </td>
                         <td>{item.Test}</td>
                        <td>{item.RSlNo}</td>
                        
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => loadPage(page - 1)}>
              Prev
            </button>
          </li>

          <button className="page-link" disabled>
            {page}/{totalPages}
          </button>

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => loadPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* DRAWER */}
      {showDrawer && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 9998 }}></div>

          <div
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "420px",
              right: 0,
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={() => setShowDrawer(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div className="dropdown-txt p-2">
                {modalType === "add"
                  ? "➕ Add Test Sequence"
                  : "✏️ Edit Test RSl No"}
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">

                  <form onSubmit={handleSubmit}>

                    {/* TEST FIELD */}
                    <div className="mb-3">
                      <label className="form-label">Test Name *</label>

                      {editingItem ? (
                        <input
                          type="text"
                          className="form-control"
                          disabled
                          value={formData.Test}
                        />
                      ) : (
                        <select
                          className="form-control"
                          value={formData.TestId}
                          onChange={(e) => {
                            const selectedId = Number(e.target.value);
                            const testObj = allTests.find(
                              (t) => Number(t.TestId) === selectedId
                            );

                            if (!testObj) return;

                            setSelectedTest(testObj);

                            setFormData({
                              TestId: testObj.TestId,
                              Test: testObj.Test,
                              RSlNo: testObj.RSlNo ?? 0,
                            });
                          }}
                        >
                          <option value="">Select Test Name</option>
                          {allTests.map((t) => (
                            <option key={t.TestId} value={t.TestId}>
                              {t.Test}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* RSlNo */}
                    <div className="mb-3">
                      <label className="form-label">Sequence *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.RSlNo}
                        min={0}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            RSlNo: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                      disabled={loading}
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Cancel
                      </button>

                      <button  disabled={loading} type="submit" className="btn btn-primary w-50">
                      {loading ? "Submitting" : "Save"}
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

export default TestReportSeq;