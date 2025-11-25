import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"; // Added for scrollbar styling
import axiosInstance from "../../../axiosInstance";

const CompanyWiseBedRate = () => {
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [beds, setBeds] = useState([]);
  const [bedRates, setBedRates] = useState({});
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchDept, setSearchDept] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [changesCount, setChangesCount] = useState(0);

  // Added state/ref for the theme consistency (though not strictly necessary for this file's logic)
  const [activeTab, setActiveTab] = useState("rates"); // Keeping the concept of an active tab
  const dropdownRef = useRef(null); // Keeping the concept of a ref for outside click handling if needed later

  useEffect(() => {
    fetchCompanies();
    fetchDepartments();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/cashless");
      if (response.data.success) setCompanies(response.data.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get("/departmentIndoor");
      if (response.data.success) setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchBedRates = useCallback(async (companyId, department) => {
    if (!department) return;
    setLoading(true);
    try {
      // 1. Fetch all beds for the department
      const bedsResponse = await axiosInstance.get("/bedMaster");
      let filteredBeds = [];
      if (bedsResponse.data.success) {
        filteredBeds = bedsResponse.data.data.filter(
          (b) => b.DepartmentId === department.DepartmentId
        );
        setBeds(filteredBeds);
      } else {
        setBeds([]);
        setBedRates({});
        setLoading(false);
        return;
      }

      const ratesObj = {};
      filteredBeds.forEach((bed) => {
        // Use TotalCh as default rate, falling back to Rate or 0
        const defaultRate = parseFloat(bed.TotalCh || bed.Rate || 0);
        ratesObj[bed.BedId] = {
          rate: defaultRate,
          id: null,
          defaultRate: defaultRate,
        };
      });

      // 2. Fetch company-specific rates if a company is selected
      if (companyId) {
        const ratesResponse = await axiosInstance.get(
          `/company-wise-bed-rate?cashlessId=${companyId}`
        );
        if (ratesResponse.data.success) {
          ratesResponse.data.data.forEach((r) => {
            if (
              r.department_id === department.DepartmentId &&
              ratesObj[r.bed_id]
            ) {
              ratesObj[r.bed_id].rate = parseFloat(r.rate);
              ratesObj[r.bed_id].id = r.id;
            }
          });
        }
      }
      setBedRates(ratesObj);
    } catch (error) {
      console.error("Error fetching bed data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler to call fetchBedRates when department or company changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchBedRates(selectedCompanyId, selectedDepartment);
    } else {
      setBeds([]);
      setBedRates({});
    }
  }, [selectedCompanyId, selectedDepartment, fetchBedRates]);

  // Handler for company select change
  const handleCompanySelect = async (companyId) => {
    setSelectedCompanyId(companyId);
    setHasChanges(false);
    setChangesCount(0);
    if (companyId) {
      try {
        const res = await axiosInstance.get(
          `/company-wise-bed-rate?cashlessId=${companyId}`
        );
        if (res.data.success && res.data.data.length > 0) {
          setHasChanges(true);
          setChangesCount(res.data.data.length);
        }
      } catch (error) {
        console.error("Error checking for past changes:", error);
      }
    }
  };

  const handleRateChange = (bedId, value) => {
    const rateValue = value === "" ? "" : parseFloat(value);
    setBedRates((prev) => ({
      ...prev,
      [bedId]: { ...prev[bedId], rate: rateValue },
    }));
  };

  const handleSave = async () => {
    if (!selectedCompanyId || !selectedDepartment) {
      alert("Please select a company and a department before saving.");
      return;
    }

    setLoading(true);
    try {
      const savePromises = [];
      let savedCount = 0;

      for (const [bedId, data] of Object.entries(bedRates)) {
        const currentRate = parseFloat(data.rate || 0);
        const defaultRate = parseFloat(data.defaultRate || 0);

        // Only save if rate is different from default and a valid number
        if (currentRate !== defaultRate && !isNaN(currentRate)) {
          const payload = {
            cashlessId: selectedCompanyId,
            departmentId: selectedDepartment.DepartmentId,
            bedId: parseInt(bedId),
            rate: currentRate,
          };

          if (data.id) {
            // Update existing record
            savePromises.push(
              axiosInstance.put(`/company-wise-bed-rate/${data.id}`, payload)
            );
          } else {
            // Create new record
            savePromises.push(
              axiosInstance.post("/company-wise-bed-rate", payload)
            );
          }
          savedCount++;
        }
      }

      await Promise.all(savePromises);
      alert(`Successfully saved ${savedCount} rate change(s)!`);
      // Re-fetch data to update IDs and default rates correctly
      fetchBedRates(selectedCompanyId, selectedDepartment);
      handleCompanySelect(selectedCompanyId); // Re-check for past changes
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving data. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.Department?.toLowerCase().includes(searchDept.toLowerCase())
  );

  return (
    <>
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className="panel">
              {" "}
              {/* Changed from 'card' to 'panel' */}
              <div className="panel-header">
                <h5>🏢 Company Wise Bed Rate Management</h5>
                <div className="btn-box d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSave}
                    disabled={
                      loading || !selectedCompanyId || !selectedDepartment
                    }
                  >
                    {loading ? "Saving..." : "💾 Save Changes"}
                  </button>
                </div>
              </div>
              <div className="panel-body">
                {" "}
                {/* Changed from 'card-body' to 'panel-body' */}
                <div className="row mb-3 align-items-start">
                  {" "}
                  {/* Align-items-start for better layout */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Select Company *
                    </label>
                    <select
                      className="form-select"
                      value={selectedCompanyId}
                      onChange={(e) => handleCompanySelect(e.target.value)}
                      required
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
                        className="alert alert-success digi-alert mt-4"
                        role="alert"
                      >
                        {" "}
                        {/* digi-alert is a common theme style */}
                        <strong>✅ Past Changes Found!</strong>
                        <br />
                        You have previously changed{" "}
                        <strong>{changesCount}</strong> bed rate(s) for this
                        company.
                      </div>
                    )}
                  </div>
                </div>
                <div className="row mt-3">
                  {/* Department List Panel */}
                  <div className="col-md-4">
                    <div className="panel">
                      {" "}
                      {/* Changed from 'card' to 'panel' */}
                      <div className="panel-header">
                        <h6 className="mb-0">Department List</h6>
                      </div>
                      <div className="panel-body p-0">
                        <div className="p-3 border-bottom">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="🔍 Search Department..."
                            value={searchDept}
                            onChange={(e) => setSearchDept(e.target.value)}
                          />
                        </div>

                        {/* Use OverlayScrollbarsComponent for consistent scrolling/theming */}
                        <OverlayScrollbarsComponent
                          style={{ maxHeight: "60vh" }}
                        >
                          <div className="list-group list-group-flush digi-list">
                            {" "}
                            {/* Added digi-list class for styling consistency */}
                            {filteredDepartments.map((dept) => (
                              <button
                                key={dept.DepartmentId}
                                className={`list-group-item list-group-item-action ${
                                  selectedDepartment?.DepartmentId ===
                                  dept.DepartmentId
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => setSelectedDepartment(dept)} // Simplified select handler
                              >
                                {dept.Department}
                              </button>
                            ))}
                          </div>
                        </OverlayScrollbarsComponent>
                      </div>
                    </div>
                  </div>

                  {/* Bed Rate Panel */}
                  <div className="col-md-8">
                    {selectedDepartment ? (
                      <div className="panel">
                        {" "}
                        {/* Changed from 'card' to 'panel' */}
                        <div className="panel-header d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            Department: {selectedDepartment.Department}
                          </h6>
                        </div>
                        <div className="panel-body p-0">
                          {loading ? (
                            <div className="text-center py-5">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          ) : (
                            <OverlayScrollbarsComponent
                              style={{ maxHeight: "60vh" }}
                            >
                              <table className="table table-dashed table-hover digi-dataTable table-striped mb-0">
                                {" "}
                                {/* Added table classes from Emr1 */}
                                <thead className=" sticky-top">
                                  <tr>
                                    <th>Bed No</th>
                                    <th className="text-end">
                                      Default Rate
                                    </th>{" "}
                                    {/* Added Default Rate column */}
                                    <th className="text-end">Company Rate</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {beds.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan="3"
                                        className="text-center py-4"
                                      >
                                        No beds found for this department.
                                      </td>
                                    </tr>
                                  ) : (
                                    beds.map((bed) => (
                                      <tr key={bed.BedId}>
                                        <td>{bed.Bed}</td>
                                        <td className="text-end fw-bold text-secondary">
                                          {parseFloat(
                                            bedRates[bed.BedId]?.defaultRate ||
                                              0
                                          ).toFixed(2)}
                                        </td>
                                        <td>
                                          <input
                                            type="number"
                                            className="form-control form-control-sm text-end"
                                            value={
                                              bedRates[bed.BedId]?.rate ?? ""
                                            } // Use ?? '' for controlled input to allow empty field
                                            onChange={(e) =>
                                              handleRateChange(
                                                bed.BedId,
                                                e.target.value
                                              )
                                            }
                                            placeholder={parseFloat(
                                              bedRates[bed.BedId]
                                                ?.defaultRate || 0
                                            ).toFixed(2)}
                                            // Disable if no company is selected
                                          />
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
                    ) : (
                      <div className="alert alert-info digi-alert text-center py-5">
                        <i className="fa-light fa-circle-info me-2"></i> Please
                        select a department from the list on the left to
                        manage bed rates.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyWiseBedRate;
