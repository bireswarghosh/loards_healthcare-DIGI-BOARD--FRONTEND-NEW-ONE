import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const BillPrintHeadMaster = () => {
  const [headData, setHeadData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingHead, setEditingHead] = useState(null);

  const [formData, setFormData] = useState({
    BillPrintHead: "",
    Slno: 0,
  });

  useEffect(() => {
    fetchBillPrintHeads();
  }, []);

  const fetchBillPrintHeads = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/billPrintHead");
      if (response.data.success) {
        setHeadData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bill print heads:", error);
    }
    setLoading(false);
  };

  const openAddSidebar = () => {
    setFormData({ BillPrintHead: "", Slno: 0 });
    setEditingHead(null);
    setShowSidebar(true);
  };

  const handleEdit = (head) => {
    setEditingHead(head);
    setFormData({
      BillPrintHead: head.BillPrintHead,
      Slno: head.Slno,
    });
    setShowSidebar(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill print head?")) {
      try {
        await axiosInstance.delete(`/billPrintHead/${id}`);
        fetchBillPrintHeads();
      } catch (error) {
        console.error("Error deleting bill print head:", error);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = editingHead
        ? await axiosInstance.put(
            `/billPrintHead/${editingHead.BillPrintHeadId}`,
            formData
          )
        : await axiosInstance.post("/billPrintHead", formData);

      if (response.data.success) {
        fetchBillPrintHeads();
        setShowSidebar(false);
        setEditingHead(null);
      }
    } catch (error) {
      console.error("Error saving bill print head:", error);
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingHead(null);
  };

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>📋 Bill Print Head Master</h5>

          <button className="btn btn-primary btn-sm" onClick={openAddSidebar}>
            <i className="fa-light fa-plus"></i> Add Head
          </button>
        </div>

        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-dashed table-hover digi-dataTable table-striped">
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>Action</th>
                  <th>Sl.No</th>
                  <th>Bill Print Head</th>
                 
                </tr>
              </thead>

              <tbody>
                {headData.map((head, index) => (
                  <tr key={index}>
                    {/* ACTION LEFT */}
                    <td className="text-center">
                      <div className="btn-box">
                        <button onClick={() => handleEdit(head)}>
                          <i className="fa-light fa-pen"></i>
                        </button>
                        <button onClick={() => handleDelete(head.BillPrintHeadId)}>
                          <i className="fa-light fa-trash"></i>
                        </button>
                      </div>
                    </td>

                    <td className="text-center">{index + 1}</td>
                    <td>{head.BillPrintHead}</td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CRM RIGHT SIDEBAR */}
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
              right: 0,
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={closeSidebar}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div className="dropdown-txt">
                {editingHead ? "✏️ Edit Bill Print Head" : "➕ Add Bill Print Head"}
              </div>

              <div style={{ overflowY: "auto", height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">Bill Print Head *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.BillPrintHead}
                        onChange={(e) =>
                          setFormData({ ...formData, BillPrintHead: e.target.value })
                        }
                        required
                      />
                    </div>

                   

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={closeSidebar}
                      >
                        Cancel
                      </button>

                      <button className="btn btn-primary w-50" type="submit">
                        {editingHead ? "Update" : "Save"}
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

export default BillPrintHeadMaster;
