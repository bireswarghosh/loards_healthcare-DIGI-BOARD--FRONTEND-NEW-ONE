import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditMarketingExecutive = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // marketing executive list
  const [mExecList, setMExecList] = useState([]);

  const [formData, setFormData] = useState({
    Doctor: "",
    DoctorId: "",
    MExecutiveId: "",
  });

  // search
  const [searchExec, setSearchExec] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // fetch ME list
  const fetchExecutives = async () => {
    try {
      const res = await axiosInstance.get(`/mexecutive`);
      if (res.data) {
        setMExecList(res.data);
      }
    } catch (err) {
      console.error("MExecutive list load error", err);
    }
  };

  // fetch doctors list
  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/doctormasters-mexecutive?page=${pageNumber}&limit=20`);
      if (res.data.success) {
        setItems(res.data.data);
        setPage(res.data.pagination.page);
        setLimit(res.data.pagination.limit);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(1);
    fetchExecutives();
  }, []);

  // search by MExecutive
  const handleSearch = async () => {
    if (!searchExec.trim()) {
      return fetchItems(1);
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/doctormasters-mexecutive/search?mexecutiveid=${searchExec}&page=1&limit=20`
      );

      if (res.data.success) {
        setItems(res.data.data);
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Search failed");
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchExec("");
    fetchItems(1);
  };

  // open drawer
  const openDrawer = (item) => {
    setEditingItem(item);
    setFormData({
      Doctor: item.Doctor,
      DoctorId: item.DoctorId,
      MExecutiveId: item.MExecutiveId,
    });

    setShowDrawer(true);
  };

  // update executive
  const handleSubmit = async (e) => {
    e.preventDefault();
setLoading(true)
    try {
      await axiosInstance.put(`/doctormasters-mexecutive/${formData.DoctorId}`, {
        MExecutiveId: formData.MExecutiveId,
      });

      toast.success("Updated Successfully!", { autoClose: 1000 });
      setShowDrawer(false);
      fetchItems(page);
    } catch (err) {
      console.error("Update error", err);
      toast.error("Update failed");
    }
     finally{setLoading(false)}
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
          <h5>🧑‍⚕️ Edit Marketing Executive</h5>

          <div className="d-flex gap-2">
            <select
              className="form-control form-control-sm"
              value={searchExec}
              onChange={(e) => setSearchExec(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="">Search by Executive</option>
              {mExecList.map((m) => (
                <option key={m.MExecutiveId} value={m.MExecutiveId}>
                  {m.MExecutive}
                </option>
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
                    <th>Action</th>
                    <th>Sl No</th>
                    <th>Doctor</th>
                    <th>Marketing Executive</th>
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
                      <tr key={item.DoctorId} >
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openDrawer(item)}
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </button>
                        </td>

                        <td>{(page - 1) * limit + index + 1}</td>
                        <td >{item.Doctor}</td>
                        <td>
                          {
                            mExecList.find((m) => m.MExecutiveId === item.MExecutiveId)
                              ?.MExecutive || "—"
                          }
                        </td>
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
              <div
                className="dropdown-txt"
                style={{
                 
                  padding: "10px",
                }}
              >
                ✏️ Edit Marketing Executive
              </div>

              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    {/* Doctor Name */}
                    <div className="mb-3">
                      <label className="form-label">Doctor</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Doctor}
                        disabled
                      />
                    </div>

                    {/* Marketing Executive Dropdown */}
                    <div className="mb-3">
                      <label className="form-label">Marketing Executive *</label>
                      <select
                        className="form-control"
                        value={formData.MExecutiveId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            MExecutiveId: Number(e.target.value),
                          }))
                        }
                        required
                      >
                        <option value="">Select Executive</option>

                        {mExecList.map((m) => (
                          <option key={m.MExecutiveId} value={m.MExecutiveId}>
                            {m.MExecutive}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        disabled={loading}
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Cancel
                      </button>

                      <button disabled={loading} type="submit" className="btn btn-primary w-50">
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

          {/* {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))} */}
          <button className="ms-1 me-1">{`${page}/${totalPages}`}</button>

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

export default EditMarketingExecutive;