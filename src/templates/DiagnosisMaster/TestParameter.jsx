import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { toast } from "react-toastify";

const TestParameter = () => {
  const [testParameters, setTestParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState("add");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    PARAMETER: "",
    TESTId: "",
    Rate: "",
  });
  const [search, setSearch] = useState("");
  const [filteredTest, setFilteredTest] = useState([]);
  const [searchedTest, setSearchedTest] = useState("");

  const fetchTests = async () => {
    try {
      const response = await axiosInstance.get(
        `/tests?search=${searchedTest}&&limit=10`
      );

      if (response.data.success) {
        console.log("formdata testid ", formData.TESTId);

        if (formData.TESTId) {
          console.log("hi");
          const arr = response.data.data;
          const testById = await axiosInstance.get(`/tests/${formData.TESTId}`);
          console.log("testById", testById.data.data);
          const newArr = [testById.data.data, ...arr];
          setFilteredTest(newArr);
          console.log("with form data test id: ", newArr);
        } else {
          setFilteredTest(response.data.data);
          console.log("normal", response.data.data);
        }
      }
    } catch (error) {
      console.log("fetching test error: ", error);
    }
  };

  const fetchTestParameters = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/testparameters?page=1");
      const data = (res.data.success ? res.data.data : res.data).map((d) => ({
        ...d,
        showDropdown: false,
      }));

      setTestParameters(data);
      //   console.log(data)
      setTimeout(() => {
        fetchTests();
      }, 100);
    } catch (err) {
      console.error("Error fetching test parameters:", err);
      toast.error("Failed to fetch data");
    }
    setLoading(false);
  };

  // delete record
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/testparameters/${selectedId}`);
      fetchTestParameters();
      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to deleted");
      //   alert("Failed to delete Test Parameter.");
    }
  };

  //
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("modal type state: ", modalType);
    try {
      if (modalType == "edit") {
        await axiosInstance.put(
          `/testparameters/${editingItem.PARAMETERId}`,
          formData
        );
        toast.success("Updated Successfully");
        setSearchedTest("");
      } else {
        console.log("Submit form --> ", formData);
        await axiosInstance.post("/testparameters", formData);
        toast.success("Added Successfully");
        setSearchedTest("");
      }
      setShowDrawer(false);
      fetchTestParameters();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save ");
      //   alert("Failed to save Test Parameter.");
    }
  };

  useEffect(() => {
    fetchTestParameters();
  }, []);

  useEffect(() => {
    fetchTests();
  }, [searchedTest]);

  const openDrawerAdd = () => {
    // Reset form data for 'Add'
    setFormData({ PARAMETER: "", TESTId: "", Rate: "" });
    setModalType("add");
    setEditingItem(null);
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    setFormData({
      PARAMETER: item.PARAMETER,
      TESTId: item.TESTId,
      Rate: item.Rate,
    });
    setModalType("edit");
    setEditingItem(item);
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      PARAMETER: item.PARAMETER,
      TESTId: item.TESTId,
      Rate: item.Rate,
    });
    setModalType("view");
    setEditingItem(item);
    setShowDrawer(true);
  };

  const filtered = testParameters.filter((item) =>
    item.PARAMETER?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between">
          {/* Updated Title */}
          <h5>🧪 Test Parameter Master</h5>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Parameter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "200px" }}
            />
            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add Parameter
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
                    <th>Action</th>
                    <th>SLNo.</th>
                    <th>Parameter Name</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    // Assumes PARAMETERID is the unique key
                    <tr key={item.PARAMETERId}>
                      <td>
                        <div className="d-flex gap-2">
                          {/* View Button */}
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              openDrawerView(item);
                            }}
                          >
                            <i className="fa-light fa-eye"></i>
                          </div>

                          {/* Edit Button */}
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              openDrawerEdit(item);
                            }}
                          >
                            <i className="fa-light fa-pen-to-square"></i>
                          </div>

                          {/* Delete Button */}
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              // Pass the correct ID for deletion
                              setSelectedId(item.PARAMETERId);
                              //   handleDelete(item.PARAMETERId);
                              setShowConfirm(true);
                            }}
                          >
                            <i className="fa-light fa-trash-can"></i>
                          </div>
                        </div>
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.PARAMETER}</td>
                      <td>{item.Rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* Drawer/Sidebar for Add/Edit/View */}
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
                }}
              >
                {/* Updated Drawer Title */}
                {modalType === "add"
                  ? "➕ Add Test Parameter"
                  : modalType === "edit"
                  ? "✏️ Edit Test Parameter"
                  : "👁️ View Test Parameter"}
              </div>
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Parameter Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.PARAMETER}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            PARAMETER: e.target.value,
                          })
                        }
                        disabled={modalType === "view"}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Test *</label>
                      {/* <input
                        type="number"
                        className="form-control mb-1"
                        value={formData.TESTId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            TESTId: e.target.value,
                          })
                        }
                        disabled={modalType === "view"}
                        required
                      /> */}
                      {modalType != "view" && (
                        <input
                          type="text"
                          className="form-control mb-1"
                          placeholder="Search test"
                          value={searchedTest}
                          onChange={(e) => setSearchedTest(e.target.value)}
                        />
                      )}

                      <select
                        className="form-control"
                        value={formData.TESTId}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            TESTId: e.target.value,
                          });
                        }}
                      >
                        {filteredTest.map((test, index) => (
                          <option key={index} value={test.TestId}>
                            {test.Test}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rate</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.Rate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            Rate: e.target.value,
                          })
                        }
                        disabled={modalType === "view"}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Cancel
                      </button>
                      {modalType != "view" && (
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

      {/* Delete Modal */}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5>Delete?</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>

              <div className="modal-body text-center">
                <p>Are you sure?</p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
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

export default TestParameter;
