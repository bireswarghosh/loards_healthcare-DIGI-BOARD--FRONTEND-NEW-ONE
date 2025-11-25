import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

const CashlessMaster = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCashless, setSelectedCashless] = useState(null);
  const [cashlessData, setCashlessData] = useState([]);
  const [acGenLeds, setAcGenLeds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);

  const [formData, setFormData] = useState({
    Cashless: "",
    Add1: "",
    Add2: "",
    Phone: "",
    Company: "",
    Add3: "",
    emailid: "",
    contactperson: "",
    cPhone: "",
    servicecharge: "N",
    AcGenLedCompany: "",
  });

  useEffect(() => {
    fetchCashlessData();
    fetchAcGenLeds();
  }, []);

  const fetchCashlessData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cashless");
      if (response.data.success) {
        setCashlessData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching cashless data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcGenLeds = async () => {
    try {
      const response = await axiosInstance.get("/cashless/acgenleds");
      if (response.data.success) {
        setAcGenLeds(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching ACGenLeds:", error);
    }
  };

  const openAddSidebar = () => {
    setSelectedCashless(null);
    setFormData({
      Cashless: "",
      Add1: "",
      Add2: "",
      Phone: "",
      Company: "",
      Add3: "",
      emailid: "",
      contactperson: "",
      cPhone: "",
      servicecharge: "N",
      AcGenLedCompany: "",
    });
    setShowSidebar(true);
  };

  const handleEdit = (cashless) => {
    setSelectedCashless(cashless);
    setFormData({
      Cashless: cashless.Cashless || "",
      Add1: cashless.Add1 || "",
      Add2: cashless.Add2 || "",
      Phone: cashless.Phone || "",
      Company: cashless.Company || "",
      Add3: cashless.Add3 || "",
      emailid: cashless.emailid || "",
      contactperson: cashless.contactperson || "",
      cPhone: cashless.cPhone || "",
      servicecharge: cashless.servicecharge || "N",
      AcGenLedCompany: cashless.AcGenLedCompany || "",
    });
    setShowSidebar(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axiosInstance.delete(`/cashless/${id}`);
      fetchCashlessData();
    } catch (error) {
      alert("Error deleting cashless");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = selectedCashless
        ? await axiosInstance.put(`/cashless/${selectedCashless.CashlessId}`, formData)
        : await axiosInstance.post("/cashless", formData);

      if (response.data.success) {
        fetchCashlessData();
        setShowSidebar(false);
      } else {
        alert("Error: " + response.data.error);
      }
    } catch {
      alert("Error saving cashless");
    } finally {
      setLoading(false);
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedCashless(null);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">

          {/* LIST PANEL */}
          <div className="panel">
            <div className="panel-header d-flex justify-content-between">
              <h5>💳 Cashless Master</h5>

              <button className="btn btn-sm btn-primary" onClick={openAddSidebar}>
                <i className="fa-light fa-plus"></i> Add New
              </button>
            </div>

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dashed table-hover digi-dataTable table-striped">
                    <thead>
                      <tr>
                        <th style={{ width: "70px" }}>Action</th>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Contact</th>
                        <th>Phone</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashlessData.map((row) => (
                        <tr key={row.CashlessId}>
                          <td className="text-center">
                            <div className="btn-box">
                              <button onClick={() => handleEdit(row)}>
                                <i className="fa-light fa-pen"></i>
                              </button>
                              <button onClick={() => handleDelete(row.CashlessId)}>
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </div>
                          </td>

                          <td className="text-center">{row.Cashless}</td>
                          <td className="text-center">{row.Company}</td>
                          <td className="text-center">{row.contactperson}</td>
                          <td className="text-center">{row.Phone}</td>
                          <td className="text-center">{row.emailid}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR FOR ADD/EDIT */}
      {showSidebar && (
        <>
          <div className="modal-backdrop fade show" onClick={closeSidebar}></div>

          <div
            className="profile-right-sidebar active"
            style={{
              width: "100%",
              maxWidth: "500px",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button className="right-bar-close" onClick={closeSidebar}>
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel">
              <div className="dropdown-txt" style={{ backgroundColor: "#0a1735" }}>
                {selectedCashless ? "✏️ Edit Cashless" : "➕ Add Cashless"}
              </div>

              <div style={{ overflowY: "auto", height: "calc(100% - 70px)" }}>
                <div className="p-3">

                  {/* FORM */}
                  <form>

                    <div className="mb-3">
                      <label className="form-label">Cashless Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Cashless}
                        onChange={(e) => setFormData({ ...formData, Cashless: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Company *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Company}
                        onChange={(e) => setFormData({ ...formData, Company: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address 1</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add1}
                        onChange={(e) => setFormData({ ...formData, Add1: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address 2</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add2}
                        onChange={(e) => setFormData({ ...formData, Add2: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address 3</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Add3}
                        onChange={(e) => setFormData({ ...formData, Add3: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contact Person</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.contactperson}
                        onChange={(e) => setFormData({ ...formData, contactperson: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.Phone}
                        onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.emailid}
                        onChange={(e) => setFormData({ ...formData, emailid: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.cPhone}
                        onChange={(e) => setFormData({ ...formData, cPhone: e.target.value })}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.servicecharge === "Y"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            servicecharge: e.target.checked ? "Y" : "N",
                          })
                        }
                      />
                      <label className="form-check-label">Service Charge</label>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">AC Gen Led Company</label>
                      <select
                        className="form-select"
                        value={formData.AcGenLedCompany}
                        onChange={(e) =>
                          setFormData({ ...formData, AcGenLedCompany: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        {acGenLeds.map((item) => (
                          <option key={item.DescId} value={item.DescId}>
                            {item.Desc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* BUTTONS */}
                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-secondary w-50" onClick={closeSidebar}>
                        Cancel
                      </button>

                      <button type="button" className="btn btn-primary w-50" onClick={handleSave}>
                        {selectedCashless ? "Update" : "Save"}
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

export default CashlessMaster;
