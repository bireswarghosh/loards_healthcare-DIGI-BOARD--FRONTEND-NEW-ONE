import { useState, useEffect, useContext } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../../axiosInstance";
import Footer from "../../../components/footer/Footer";
import { DigiContext } from "../../../context/DigiContext";

const OtherChargesMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [modalType, setModalType] = useState("add");
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [depGroups, setDepGroups] = useState([]);
  const [billPrintHeads, setBillPrintHeads] = useState([]);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    OtherCharges: "", DepGroupId: "", Rate: 0, Unit: "", ServiceCh: "N",
    ShowInFinal: "Y", BillPrintHeadId: "", ConcYN: "N", QtyReq: "N",
    Code: "", CSTP: 0, SGST: 0, vatp: 0, ICU: 0, CAB: 0, SUIT: 0,
    IPYN: "Y", corporateyn: "N",
  });

  const fetchOtherCharges = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = showInactive ? "/otherCharges/inactive" : "/otherCharges";
      const response = await axiosInstance.get(endpoint);
      if (response.data.success) {
        setCharges(response.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const response = await axiosInstance.get("/otherCharges/dropdown-data");
      if (response.data.success) {
        setDepGroups(response.data.data.depGroups);
        setBillPrintHeads(response.data.data.billPrintHeads);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchOtherCharges();
    fetchDropdownData();
  }, [showInactive]);

  const resetFormData = () => ({
    OtherCharges: "", DepGroupId: "", Rate: 0, Unit: "", ServiceCh: "N",
    ShowInFinal: "Y", BillPrintHeadId: "", ConcYN: "N", QtyReq: "N",
    Code: "", CSTP: 0, SGST: 0, vatp: 0, ICU: 0, CAB: 0, SUIT: 0,
    IPYN: "Y", corporateyn: "N",
  });

  const handleAddNew = () => {
    setFormData(resetFormData());
    setSelectedCharge(null);
    setModalType("add");
    setShowModal(true);
  };

  const mapChargeToFormData = (charge) => ({
    OtherCharges: charge.OtherCharges || "", DepGroupId: charge.DepGroupId || "",
    Rate: charge.Rate || 0, Unit: charge.Unit || "", ServiceCh: charge.ServiceCh || "N",
    ShowInFinal: charge.ShowInFinal || "Y", BillPrintHeadId: charge.BillPrintHeadId || "",
    ConcYN: charge.ConcYN || "N", QtyReq: charge.QtyReq || "N", Code: charge.Code || "",
    CSTP: charge.CSTP || 0, SGST: charge.SGST || 0, vatp: charge.vatp || 0,
    ICU: charge.ICU || 0, CAB: charge.CAB || 0, SUIT: charge.SUIT || 0,
    IPYN: charge.IPYN || "Y", corporateyn: charge.corporateyn || "N",
  });

  const handleEdit = (charge) => {
    setFormData(mapChargeToFormData(charge));
    setSelectedCharge(charge);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this other charge?")) {
      setLoading(true);
      setError(null);
      try {
        await axiosInstance.delete(`/otherCharges/${id}`);
        alert("Deleted successfully!");
        fetchOtherCharges();
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to delete: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/otherCharges/${id}/toggle-status`);
      fetchOtherCharges();
    } catch (error) {
      console.error("Toggle Error:", error);
      setError("Failed to toggle status: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        Rate: Number(formData.Rate), CSTP: Number(formData.CSTP),
        SGST: Number(formData.SGST), vatp: Number(formData.vatp),
        ICU: Number(formData.ICU), CAB: Number(formData.CAB), SUIT: Number(formData.SUIT),
      };

      if (selectedCharge) {
        await axiosInstance.put(`/otherCharges/${selectedCharge.OtherChargesId}`, payload);
        alert("Updated successfully!");
      } else {
        await axiosInstance.post("/otherCharges", payload);
        alert("Created successfully!");
      }
      setShowModal(false);
      fetchOtherCharges();
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to save: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filtered = charges.filter(
    (charge) =>
      charge.OtherCharges?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.departmentGroupName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = () => (
    <div className="row g-3">
      <div className="col-12">
        <label className="form-label">🏷️ Other Charges Name</label>
        <input type="text" className="form-control" value={formData.OtherCharges} onChange={(e) => handleInputChange("OtherCharges", e.target.value)} required />
      </div>
      <div className="col-md-6">
        <label className="form-label">🏢 Department Group</label>
        <select className="form-select" value={formData.DepGroupId} onChange={(e) => handleInputChange("DepGroupId", e.target.value)} required>
          <option value="">Select Department Group</option>
          {depGroups.map((dept) => (
            <option key={dept.DepGroupId} value={dept.DepGroupId}>{dept.DepGroup}</option>
          ))}
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label">📋 Bill Print Head</label>
        <select className="form-select" value={formData.BillPrintHeadId} onChange={(e) => handleInputChange("BillPrintHeadId", e.target.value)}>
          <option value="">Select Bill Print Head</option>
          {billPrintHeads.map((head) => (
            <option key={head.BillPrintHeadId} value={head.BillPrintHeadId}>{head.BillPrintHead}</option>
          ))}
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label">🔢 Code</label>
        <input type="text" className="form-control" value={formData.Code} onChange={(e) => handleInputChange("Code", e.target.value)} />
      </div>
      <div className="col-md-6">
        <label className="form-label">📎 Unit</label>
        <input type="text" className="form-control" value={formData.Unit} onChange={(e) => handleInputChange("Unit", e.target.value)} />
      </div>
      <div className="col-12"><h6 className="mt-2 mb-3 text-primary">Rate Structure</h6></div>
      <div className="col-md-3">
        <label className="form-label">💰 General Rate</label>
        <input type="number" className="form-control" value={formData.Rate} onChange={(e) => handleInputChange("Rate", Number(e.target.value))} required />
      </div>
      <div className="col-md-3">
        <label className="form-label">🏥 ICU Rate</label>
        <input type="number" className="form-control" value={formData.ICU} onChange={(e) => handleInputChange("ICU", Number(e.target.value))} />
      </div>
      <div className="col-md-3">
        <label className="form-label">🛌 Cabin Rate</label>
        <input type="number" className="form-control" value={formData.CAB} onChange={(e) => handleInputChange("CAB", Number(e.target.value))} />
      </div>
      <div className="col-md-3">
        <label className="form-label">🏨 Suite Rate</label>
        <input type="number" className="form-control" value={formData.SUIT} onChange={(e) => handleInputChange("SUIT", Number(e.target.value))} />
      </div>
      <div className="col-12"><h6 className="mt-4 mb-3 text-primary">Taxation (%)</h6></div>
      <div className="col-md-4">
        <label className="form-label">📈 CGST %</label>
        <input type="number" className="form-control" value={formData.CSTP} onChange={(e) => handleInputChange("CSTP", Number(e.target.value))} />
      </div>
      <div className="col-md-4">
        <label className="form-label">📈 SGST %</label>
        <input type="number" className="form-control" value={formData.SGST} onChange={(e) => handleInputChange("SGST", Number(e.target.value))} />
      </div>
      <div className="col-md-4">
        <label className="form-label">📈 VAT %</label>
        <input type="number" className="form-control" value={formData.vatp} onChange={(e) => handleInputChange("vatp", Number(e.target.value))} />
      </div>
      <div className="col-12"><h6 className="mt-4 mb-3 text-primary">Options</h6>
        <div className="row g-2">
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={formData.IPYN === "Y"} onChange={(e) => handleInputChange("IPYN", e.target.checked ? "Y" : "N")} />
              <label className="form-check-label">🏥 IP Applicable</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={formData.ServiceCh === "Y"} onChange={(e) => handleInputChange("ServiceCh", e.target.checked ? "Y" : "N")} />
              <label className="form-check-label">💼 Service Charges</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={formData.ShowInFinal === "Y"} onChange={(e) => handleInputChange("ShowInFinal", e.target.checked ? "Y" : "N")} />
              <label className="form-check-label">📋 Show in Final</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={formData.QtyReq === "Y"} onChange={(e) => handleInputChange("QtyReq", e.target.checked ? "Y" : "N")} />
              <label className="form-check-label">🔢 Qty Required</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={formData.ConcYN === "Y"} onChange={(e) => handleInputChange("ConcYN", e.target.checked ? "Y" : "N")} />
              <label className="form-check-label">🎯 Concession</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={formData.corporateyn === "Y"} onChange={(e) => handleInputChange("corporateyn", e.target.checked ? "Y" : "N")} />
              <label className="form-check-label">🏢 Corporate</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    <table className="table table-dashed table-hover digi-dataTable table-striped">
      <thead>
        <tr>
          <th className="no-sort"><div className="form-check"><input className="form-check-input" type="checkbox" /></div></th>
          <th>ID</th>
          <th>Other Charges</th>
          <th>Code</th>
          <th>Unit</th>
          <th>Department</th>
          <th className="text-end">Rate</th>
          <th className="text-end">ICU</th>
          <th className="text-center">IPYN</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((charge) => (
          <tr key={charge.OtherChargesId}>
            <td><div className="form-check"><input className="form-check-input" type="checkbox" /></div></td>
            <td>{charge.OtherChargesId}</td>
            <td>{charge.OtherCharges}</td>
            <td>{charge.Code}</td>
            <td>{charge.Unit}</td>
            <td>{charge.departmentGroupName}</td>
            <td className="text-end">₹{(charge.Rate || 0).toLocaleString("en-IN")}</td>
            <td className="text-end">₹{(charge.ICU || 0).toLocaleString("en-IN")}</td>
            <td className="text-center">
              <span className={`badge ${charge.IPYN === "Y" ? "bg-success" : "bg-secondary"}`}>
                {charge.IPYN === "Y" ? "✅" : "❌"}
              </span>
            </td>
            <td>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" checked={charge.Active === 1} onChange={() => handleToggleStatus(charge.OtherChargesId)} style={{ cursor: "pointer" }} title={charge.Active ? "Active" : "Inactive"} />
              </div>
            </td>
            <td>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(charge)} title="Edit">
                  <i className="fa-light fa-pen-to-square"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(charge.OtherChargesId)} title="Delete">
                  <i className="fa-light fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          <div className="panel">
            <div className="panel-header">
              <h5>💳 Other Charges Master</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <div id="tableSearch">
                  <input type="text" className="form-control form-control-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className={`btn btn-sm ${showInactive ? "btn-warning" : "btn-info"}`} onClick={() => setShowInactive(!showInactive)}>
                  <i className="fa-light fa-filter"></i> {showInactive ? "Show Active" : "Show Inactive"}
                </button>
                <button className="btn btn-sm btn-primary" onClick={handleAddNew}>
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>{isBelowLg ? <OverlayScrollbarsComponent>{renderTable()}</OverlayScrollbarsComponent> : renderTable()}</>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} style={{ zIndex: 9998 }}></div>
          <div className={`profile-right-sidebar ${showModal ? "active" : ""}`} style={{ zIndex: 9999, width: "100%", maxWidth: "700px", right: showModal ? "0" : "-100%", top: "70px", height: "calc(100vh - 70px)" }}>
            <button className="right-bar-close" onClick={() => setShowModal(false)}>
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div className="top-panel" style={{ height: "100%", paddingTop: "10px" }}>
              <div className="dropdown-txt" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#0a1735" }}>
                {modalType === "add" ? "➕ Add" : "✏️ Edit"} Other Charge
              </div>
              <OverlayScrollbarsComponent style={{ height: "calc(100% - 70px)" }}>
                <div className="p-3">
                  <form onSubmit={handleSave}>
                    {renderForm()}
                    <div className="d-flex gap-2 mt-4">
                      <button type="button" className="btn btn-secondary w-50" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                      <button type="submit" className="btn btn-primary w-50" disabled={loading}>{loading ? "Saving..." : modalType === "edit" ? "Update" : "Save"}</button>
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
};

export default OtherChargesMaster;
