import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditTestRate = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchType, setSearchType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [subDep, setSubDep] = useState([]);
  const [dep, setDep] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [defaultDept, setDefaultDept] = useState(0);

  // Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    Rate: "",
    BRate: "",
    ICURate: "",
    CABRate: "",
    SUITRate: "",
  });

  // Fetch test list
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/tests/search/advanced?limit=${limit}&page=${pageNumber}&subDepartmentId=${
          searchType || ""
        }`
      );

      const data = res.data.success ? res.data.data : [];
      setItems(data);

      if (res.data.pagination) {
        setPage(res.data.pagination.currentPage);
        setLimit(res.data.pagination.itemsPerPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load test list");
    }
    setLoading(false);
  };

  // fetch subdepartments
  const fetchSubdep = async () => {
    try {
      const subdepData = await axiosInstance.get("/subdepartment");
      setSubDep([
        { SubDepartmentId: "", SubDepartment: "--Select--", DepartmentId: 0 },
        ...subdepData.data.data,
      ]);
    } catch (error) {
      console.error("Error fetching subdep: ", error);
    }
  };

  // fetch departments
  const fetchDep = async () => {
    try {
      const depData = await axiosInstance.get("/department");
      setDep([
        { DepartmentId: 0, Department: "--Select--" },
        ...depData.data.data,
      ]);
    } catch (error) {
      console.error("Error fetching dep: ", error);
    }
  };

  // find subdepartments by department id
const filteredSubdepartments = (deptId) => {
  const subDeps = subDep.filter((item)=>item.DepartmentId==deptId)
  // console.log("filtered subdeps: ",subDeps)
  const subDepsIds = subDeps.map(subDep => subDep.SubDepartmentId)
  // console.log("Subdep ids: ",subDepsIds)
  if(subDepsIds.length==0){
    setItems([]);
  }
  const str = subDepsIds.join(",");
  // console.log(str)
  setSearchType(str)
}


  useEffect(() => {
    fetchItems(1);
    fetchSubdep();
    fetchDep();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [searchType]);

  // search
  const handleSearch = () => {
    fetchItems(1);
  };

  const clearSearch = () => {
    if(filterType == "Department"){
      setSearchType("");
          setFilterType("All");
    setDefaultDept(0);
      fetchItems();
      return
    }
    setFilterType("All");
    setSearchType("");
    setDefaultDept(0);
  };

  // Pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchItems(p);
  };

  // Open drawer to edit
  const openDrawerEdit = (item) => {
    setEditingItem(item);
    // console.log("item is: ", item)
    setFormData(item);
    setShowDrawer(true);
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.put(`/tests/${editingItem.TestId}`, formData);

      toast.success("Updated Successfully", { autoClose: 1000 });
      setShowDrawer(false);
      fetchItems(page);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update!");
    }
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🧪 Edit Test Rate</h5>

          <div className="d-flex gap-2">
            <label className="mt-2">Filter Type:</label>

            <select
              className="form-control form-control-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: 150 }}
            >
              {["All", "Sub Department", "Department"].map((d, index) => (
                <option key={index} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {filterType === "Department" ? (
              <select
                className="form-control form-control-sm"
                value={defaultDept}
                onChange={(e) => {
                  filteredSubdepartments(e.target.value)
                  setDefaultDept(e.target.value)
                }}
                style={{ width: 150 }}
              >
                {dep.map((d, index) => (
                  <option key={index} value={d.DepartmentId}>
                    {d.Department}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="form-control form-control-sm"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{ width: 150 }}
                disabled={filterType === "All"}
              >
                {filterType === "All"
                  ? null
                  : subDep.map((d, index) => (
                      <option key={index} value={d.SubDepartmentId}>
                        {d.SubDepartment}
                      </option>
                    ))}
              </select>
            )}

            {/* <button className="btn btn-info btn-sm" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button> */}

            <button className="btn btn-secondary btn-sm" onClick={clearSearch}>
              Clear
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
                    <th>SubDept ID</th>
                    <th>Test</th>
                    <th>Rate</th>
                    <th>IPD Rate</th>
                    <th>ICU Rate</th>
                    <th>CAB Rate</th>
                    <th>SUIT Rate</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-4">
                        No Tests Found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.TestId}>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openDrawerEdit(item)}
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </button>
                        </td>

                        <td>{index + 1}</td>
                        <td>{item.SubDepartmentId}</td>
                        <td>{item.Test}</td>
                        <td>{item.Rate}</td>
                        <td>{item.BRate}</td>
                        <td>{item.ICURate}</td>
                        <td>{item.CABRate}</td>
                        <td>{item.SUITRate}</td>
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
              maxWidth: "420px",
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

            <div className="top-panel">
              <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "#0a1735",
                  color: "#fff",
                  padding: "10px",
                }}
              >
                ✏️ Edit Test Rate
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {["Rate", "BRate", "ICURate", "CABRate", "SUITRate"].map(
                      (field) => (
                        <div className="mb-3" key={field}>
                          <label className="form-label">{field=="BRate"?"IPD Rate":field}</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData[field]}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [field]: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      )
                    )}

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Cancel
                      </button>

                      <button type="submit" className="btn btn-primary w-50">
                        Save
                      </button>
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

          <span className="me-2 ms-2">
            {page}/{totalPages}
          </span>

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default EditTestRate;
