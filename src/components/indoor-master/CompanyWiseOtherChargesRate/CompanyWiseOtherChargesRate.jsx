import { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance";
import Footer from "../../../components/footer/Footer";

const CompanyWiseOtherChargesRate = () => {
  const [companies, setCompanies] = useState([]);
  const [otherCharges, setOtherCharges] = useState([]);
  const [otherChargesRates, setOtherChargesRates] = useState({});
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [changesCount, setChangesCount] = useState(0);

  useEffect(() => {
    fetchCompanies();
    fetchOtherCharges();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/cashless");
      if (response.data.success) setCompanies(response.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchOtherCharges = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/otherCharges");
      if (response.data.success) {
        setOtherCharges(response.data.data);

        const ratesObj = {};
        response.data.data.forEach((item) => {
          ratesObj[item.OtherChargesId] = {
            rate: item.Rate || 0,
            icu: item.ICU || 0,
            cab: item.CAB || 0,
            suit: item.SUIT || 0,
            id: null,
          };
        });
        setOtherChargesRates(ratesObj);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setSelectedCompanyId(companyId);
    if (companyId) {
      try {
        const res = await axiosInstance.get(
          `/company-wise-other-charges?cashlessId=${companyId}`
        );
        if (res.data.success) {
          const ratesObj = {};
          otherCharges.forEach((item) => {
            ratesObj[item.OtherChargesId] = {
              rate: item.Rate || 0,
              icu: item.ICU || 0,
              cab: item.CAB || 0,
              suit: item.SUIT || 0,
              id: null,
            };
          });

          res.data.data.forEach((r) => {
            if (ratesObj[r.other_charges_id]) {
              ratesObj[r.other_charges_id].rate = r.rate;
              ratesObj[r.other_charges_id].icu = r.icu;
              ratesObj[r.other_charges_id].cab = r.cab;
              ratesObj[r.other_charges_id].suit = r.suit;
              ratesObj[r.other_charges_id].id = r.id;
            }
          });

          setOtherChargesRates(ratesObj);
          setHasChanges(res.data.data.length > 0);
          setChangesCount(res.data.data.length);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleRateChange = (otherChargesId, field, value) => {
    setOtherChargesRates((prev) => ({
      ...prev,
      [otherChargesId]: { ...prev[otherChargesId], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!selectedCompanyId) {
      alert("Please select company");
      return;
    }

    try {
      for (const [otherChargesId, data] of Object.entries(otherChargesRates)) {
        const item = otherCharges.find(
          (i) => i.OtherChargesId === parseInt(otherChargesId)
        );
        const hasChanges =
          parseFloat(data.rate) !== parseFloat(item?.Rate || 0) ||
          parseFloat(data.icu) !== parseFloat(item?.ICU || 0) ||
          parseFloat(data.cab) !== parseFloat(item?.CAB || 0) ||
          parseFloat(data.suit) !== parseFloat(item?.SUIT || 0);

        if (hasChanges) {
          await axiosInstance.post("/company-wise-other-charges", {
            cashlessId: selectedCompanyId,
            otherChargesId: otherChargesId,
            rate: data.rate,
            icu: data.icu,
            cab: data.cab,
            suit: data.suit,
          });
        }
      }
      alert("Saved successfully!");
      handleCompanyChange(selectedCompanyId);
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving data");
    }
  };

  const filteredOtherCharges = otherCharges.filter((item) =>
    item.OtherCharges?.toLowerCase().includes(searchItem.toLowerCase())
  );

  return (
    <>
      <div className="main-content">
        {" "}
        {/* Themed wrapper */}
        <div className="row">
          <div className="col-12">
            <div className="panel">
              {" "}
              {/* Themed panel container */}
              <div className="panel-header">
                {" "}
                {/* Themed panel header */}
                <h5>💰 Company Wise Other Charges Rate</h5>
                <div className="btn-box d-flex flex-wrap gap-2">
                  {" "}
                  {/* Themed button box for controls */}
                  <div id="tableSearch" style={{ width: "250px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="🔍 Search Other Charges..."
                      value={searchItem}
                      onChange={(e) => setSearchItem(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSave}
                  >
                    {" "}
                    {/* Themed save button */}
                    <i className="fa-light fa-save"></i> Save All
                  </button>
                </div>
              </div>
              <div className="panel-body">
                {" "}
                {/* Themed panel body */}
                {/* Select Company and Alert section */}
                <div className="row mb-4 align-items-center">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Select Company</label>
                    <select
                      className="form-select"
                      value={selectedCompanyId}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c.CashlessId} value={c.CashlessId}>
                          {c.Cashless}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    {hasChanges && (
                      <div
                        className="alert alert-success mb-0 mt-4"
                        role="alert"
                      >
                        <strong>✅ Past Changes Found!</strong>
                        <br />
                        You have previously changed{" "}
                        <strong>{changesCount}</strong> other charge rate(s) for
                        this company
                      </div>
                    )}
                  </div>
                </div>
                {/* Table container */}
                <div className="table-responsive text-center">
                  <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
                    <table className="table table-dashed table-hover all-employee-table table-striped mb-0">
                      {" "}
                      {/* Themed table classes */}
                      <thead className="">
                        <tr>
                          <th>Other Charges</th>
                          <th className="text-end">💰 General Rate</th>
                          <th className="text-end">🏥 ICU Rate</th>
                          <th className="text-end">🛌 Cabin Rate</th>
                          <th className="text-end">🏨 Suite Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4">
                              <div
                                className="spinner-border"
                                role="status"
                              ></div>
                            </td>
                          </tr>
                        ) : filteredOtherCharges.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4">
                              No other charges found
                            </td>
                          </tr>
                        ) : (
                          filteredOtherCharges.map((item) => (
                            <tr key={item.OtherChargesId}>
                              <td>{item.OtherCharges}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-end"
                                  value={
                                    otherChargesRates[item.OtherChargesId]
                                      ?.rate ||
                                    item.Rate ||
                                    0
                                  }
                                  onChange={(e) =>
                                    handleRateChange(
                                      item.OtherChargesId,
                                      "rate",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-end"
                                  value={
                                    otherChargesRates[item.OtherChargesId]
                                      ?.icu ||
                                    item.ICU ||
                                    0
                                  }
                                  onChange={(e) =>
                                    handleRateChange(
                                      item.OtherChargesId,
                                      "icu",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-end"
                                  value={
                                    otherChargesRates[item.OtherChargesId]
                                      ?.cab ||
                                    item.CAB ||
                                    0
                                  }
                                  onChange={(e) =>
                                    handleRateChange(
                                      item.OtherChargesId,
                                      "cab",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-end"
                                  value={
                                    otherChargesRates[item.OtherChargesId]
                                      ?.suit ||
                                    item.SUIT ||
                                    0
                                  }
                                  onChange={(e) =>
                                    handleRateChange(
                                      item.OtherChargesId,
                                      "suit",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer /> {/* Added Footer for consistent page layout */}
    </>
  );
};

export default CompanyWiseOtherChargesRate;
