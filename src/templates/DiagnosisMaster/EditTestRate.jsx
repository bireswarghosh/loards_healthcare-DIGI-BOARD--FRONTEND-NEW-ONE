import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditTestRate = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchType, setSearchType] = useState(""); // SubDept ID Search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [subDep, setSubDep] = useState([]);
  const [dep, setDep] = useState([]);

  // 🔥 Fetch Tests
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

  // fetch sub dep
  const fetchSubdep = async (params) => {
    try {
      const subdepData = await axiosInstance.get("/subdepartment");
      
      setSubDep([{SubDepartmentId:0,SubDepartment:"--Select--"},...subdepData.data.data]);
      console.log(subdepData.data.data);
    } catch (error) {
      console.error("Error fetching subdep: ", error);
    }
  };

  useEffect(() => {
    fetchItems(1);
    fetchSubdep();
  }, []);

  // 🔍 Search
  const handleSearch = () => {
    fetchItems(1);
  };

  const clearSearch = () => {
      setSearchType("");
      fetchItems(1);
      fetchItems();
  };

  // 🔄 Pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchItems(p);
  };

  return (
    <div className="main-content">
      <ToastContainer />

      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🧪 Edit Test Rate</h5>

          <div className="d-flex gap-2">
            {/* <input
              type="text"
              className="form-control form-control-sm"
              placeholder="SubDept ID..."
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ width: 150 }}
            /> */}
            <select
              type="text"
              className="form-control form-control-sm"
              placeholder="SubDept ID..."
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ width: 150 }}
            >
                {subDep.map((d, index)=>(
                    <option key={index} value={d.SubDepartmentId}>{d.SubDepartment}</option>
                ))}
            </select>

            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>

            <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
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
                      <td colSpan={6} className="text-center p-4">
                        No Tests Found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.TestId}>
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
