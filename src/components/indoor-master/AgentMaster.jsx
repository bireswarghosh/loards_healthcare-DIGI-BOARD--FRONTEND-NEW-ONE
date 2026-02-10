import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { DigiContext } from "../../context/DigiContext";

const AgentMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    Agent: "",
    ShortName: "",
    Add1: "",
    Add2: "",
    Add3: "",
    Phone: "",
    EmailId: "",
    Commission: "",
    CompanyId: "",
    CompanyYN: 0,
    OPBal: "",
    IsDiscountable: 0,
    CrLimit: "",
    MExecutiveId: ""
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgents = async (pageNum = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const endpoint = showInactive ? "/agents/inactive" : "/agents";
      let url = `${endpoint}?page=${pageNum}&limit=20`;
      
      if (search && search.trim()) {
        url += `&Agent=${encodeURIComponent(search.trim())}`;
      }
      
      const res = await axiosInstance.get(url);
      setAgents(res.data.data || []);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents(1);
  }, [showInactive]);

  const handleSearch = () => {
    setPage(1);
    fetchAgents(1, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
    fetchAgents(1, "");
  };

  const handleOpenModal = (type, agent = null) => {
    setModalType(type);
    if (agent) {
      setSelectedAgent(agent);
      setFormData(agent);
    } else {
      setSelectedAgent(null);
      setFormData({
        Agent: "",
        ShortName: "",
        Add1: "",
        Add2: "",
        Add3: "",
        Phone: "",
        EmailId: "",
        Commission: "",
        CompanyId: "",
        CompanyYN: 0,
        OPBal: "",
        IsDiscountable: 0,
        CrLimit: "",
        MExecutiveId: ""
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (modalType === "edit") {
        await axiosInstance.put(`/agents/${selectedAgent.AgentId}`, formData);
      } else {
        await axiosInstance.post("/agents", formData);
      }
      setShowModal(false);
      fetchAgents(page);
    } catch (err) {
      console.error("Error saving agent:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axiosInstance.delete(`/agents/${id}`);
        fetchAgents(page);
      } catch (err) {
        console.error("Error deleting agent:", err);
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/agents/${id}/toggle-status`);
      fetchAgents(page);
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>Agent Master</h5>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ width: 200 }}
            />
            <button className="btn btn-sm btn-info" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>
            {searchQuery && (
              <button className="btn btn-sm btn-secondary" onClick={handleClearSearch}>
                Clear
              </button>
            )}
            <button
              className={`btn btn-sm ${showInactive ? "btn-secondary" : "btn-warning"}`}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? "Show Active" : "Show Inactive"}
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => handleOpenModal("add")}>
              <i className="fa-light fa-plus"></i> Add
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <div style={{ height: isBelowLg ? "calc(100vh - 250px)" : "calc(100vh - 200px)" }}>
                <table className="table table-sm table-striped table-hover">
                  <thead className="sticky-top">
                    <tr>
                      <th>Sl</th>
                      <th>Agent Name</th>
                      <th>Short Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">No data</td>
                      </tr>
                    ) : (
                      agents.map((agent, i) => (
                        <tr key={agent.AgentId}>
                          <td>{(page - 1) * 20 + i + 1}</td>
                          <td>{agent.Agent}</td>
                          <td>{agent.ShortName}</td>
                          <td>{agent.Phone}</td>
                          <td>{agent.EmailId}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={agent.Active === 1}
                                onChange={() => toggleStatus(agent.AgentId)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => handleOpenModal("view", agent)}
                              >
                                <i className="fa-light fa-eye" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleOpenModal("edit", agent)}
                              >
                                <i className="fa-light fa-pen" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(agent.AgentId)}
                              >
                                <i className="fa-light fa-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination pagination-sm">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => fetchAgents(page - 1)}>
                Prev
              </button>
            </li>
            <li className="page-item disabled">
              <button className="page-link">
                {page} / {totalPages}
              </button>
            </li>
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => fetchAgents(page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </div>
      )}

      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
          <div className="profile-right-sidebar active" style={{ zIndex: 9999, width: "100%", maxWidth: "600px", right: 0, top: "70px", height: "calc(100vh - 70px)" }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel p-3">
              <h5>{modalType === "add" ? "Add Agent" : modalType === "edit" ? "Edit Agent" : "View Agent"}</h5>
              <div className="row mt-3">
                <div className="col-md-12 mb-2">
                  <label className="form-label small">Agent Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.Agent}
                    onChange={(e) => setFormData({ ...formData, Agent: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label small">Short Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.ShortName}
                    onChange={(e) => setFormData({ ...formData, ShortName: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label small">Phone</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.Phone}
                    onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <label className="form-label small">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={formData.EmailId}
                    onChange={(e) => setFormData({ ...formData, EmailId: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <label className="form-label small">Address 1</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.Add1}
                    onChange={(e) => setFormData({ ...formData, Add1: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <label className="form-label small">Address 2</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.Add2}
                    onChange={(e) => setFormData({ ...formData, Add2: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <label className="form-label small">Address 3</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.Add3}
                    onChange={(e) => setFormData({ ...formData, Add3: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label small">Commission</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={formData.Commission}
                    onChange={(e) => setFormData({ ...formData, Commission: e.target.value })}
                    disabled={modalType === "view"}
                  />
                </div>
              </div>
              {modalType !== "view" && (
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-secondary w-50" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary w-50" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentMaster;
