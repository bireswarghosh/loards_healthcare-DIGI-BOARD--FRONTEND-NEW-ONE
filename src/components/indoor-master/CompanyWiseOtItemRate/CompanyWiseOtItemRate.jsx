import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'; // Import for custom scrollbars
import axiosInstance from "../../../axiosInstance";

const CompanyWiseOtItemRate = () => {
  const [companies, setCompanies] = useState([]);
  const [otItems, setOtItems] = useState([]);
  const [otCategories, setOtCategories] = useState([]);
  const [otItemRates, setOtItemRates] = useState({});
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [changesCount, setChangesCount] = useState(0);

  useEffect(() => {
    fetchCompanies();
    fetchOtItems();
    fetchOtCategories();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/cashless');
      if (response.data.success) setCompanies(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchOtCategories = async () => {
    try {
      const response = await axiosInstance.get('/otItem/categories');
      if (response.data.success) setOtCategories(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchOtItems = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/otItem');
      if (response.data.success) {
        setOtItems(response.data.data);
        
        const ratesObj = {};
        response.data.data.forEach(item => {
          const defaultRate = item.Rate || 0;
          ratesObj[item.OtItemId] = { rate: defaultRate, id: null, defaultRate: defaultRate };
        });
        setOtItemRates(ratesObj);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setSelectedCompanyId(companyId);
    if (companyId) {
      try {
        const res = await axiosInstance.get(`/company-wise-ot-item-rate?cashlessId=${companyId}`);
        if (res.data.success) {
          const ratesObj = {};
          // Initialize rates with defaults
          otItems.forEach(item => {
            const defaultRate = item.Rate || 0;
            ratesObj[item.OtItemId] = { rate: defaultRate, id: null, defaultRate: defaultRate };
          });
          
          // Overwrite with company-specific rates
          res.data.data.forEach(r => {
            if (ratesObj[r.ot_item_id]) {
              ratesObj[r.ot_item_id].rate = r.rate;
              ratesObj[r.ot_item_id].id = r.id;
            }
          });
          
          setOtItemRates(ratesObj);
          setHasChanges(res.data.data.length > 0);
          setChangesCount(res.data.data.length);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
        // Reset state if no company is selected
        setHasChanges(false);
        setChangesCount(0);
        const ratesObj = {};
        otItems.forEach(item => {
            const defaultRate = item.Rate || 0;
            ratesObj[item.OtItemId] = { rate: defaultRate, id: null, defaultRate: defaultRate };
        });
        setOtItemRates(ratesObj);
    }
  };

  const handleRateChange = (otItemId, value) => {
    // Ensure value is treated as a number string for comparison
    setOtItemRates(prev => ({
      ...prev,
      [otItemId]: { ...prev[otItemId], rate: value }
    }));
  };

  const handleSave = async () => {
    if (!selectedCompanyId) {
      alert('Please select company');
      return;
    }

    try {
      setLoading(true);
      // Create a list of changes to send to the API
      const changesToSave = Object.entries(otItemRates)
        .filter(([otItemId, data]) => {
          // Find the original OT Item to get its default rate (item.Rate)
          const item = otItems.find(i => i.OtItemId === parseInt(otItemId));
          const defaultRate = item?.Rate || 0;

          // Only save if the rate is set and different from the default rate
          // Note: API needs to handle updates/inserts based on (cashlessId, otItemId) unique constraint
          return data.rate && parseFloat(data.rate) !== parseFloat(defaultRate);
        })
        .map(([otItemId, data]) => ({
          cashlessId: selectedCompanyId,
          otItemId: parseInt(otItemId),
          rate: parseFloat(data.rate) // Convert to float for API
        }));
      
      // Assuming the API supports a batch update/insert endpoint, but using
      // the original loop structure for simplicity and adherence to original function.
      let successfulSaves = 0;
      for (const change of changesToSave) {
          await axiosInstance.post('/company-wise-ot-item-rate', change);
          successfulSaves++;
      }
      
      alert(`Saved successfully! ${successfulSaves} changes processed.`);
      handleCompanyChange(selectedCompanyId); // Re-fetch to update state
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const filteredOtItems = otItems.filter(item => {
    const matchesSearch = item.OtItem?.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.OtCategory?.toLowerCase().includes(searchItem.toLowerCase());
    const matchesCategory = !selectedCategoryId || item.OtCategoryId === parseInt(selectedCategoryId);
    return matchesSearch && matchesCategory;
  });

  return (
    // Assuming MasterLayout contains the necessary wrappers for main-content to apply
    // the "Digi" theme styles globally.
    <>
      <div className="container-fluid py-4">
        {/* Replaced card with panel - Digi Style */}
        <div className="panel">
          <div className="panel-header">
            {/* Title moved to panel-header for consistent look */}
            <h5>🏥 Company Wise OT Item Rate</h5>
            <div className="btn-box d-flex flex-wrap gap-2">
                {/* Save button placed in the header for prominent access */}
                <button className="btn btn-sm btn-primary" onClick={handleSave}>
                  <i className="fa-light fa-floppy-disk"></i> Save All
                </button>
            </div>
          </div>

          <div className="panel-body">
            {/* Selection/Filter Section */}
            <div className="row mb-4 align-items-center">
              <div className="col-md-4">
                <label className="form-label">Select Company</label>
                {/* Using simple form-control/form-select, which is styled by the theme */}
                <select 
                  className="form-control form-control-sm"
                  value={selectedCompanyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                >
                  <option value="">Select Company</option>
                  {companies.map(c => (
                    <option key={c.CashlessId} value={c.CashlessId}>{c.Cashless}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                  <label className="form-label">Filter by Category</label>
                  <select
                      className="form-control form-control-sm"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {otCategories.map(cat => (
                        <option key={cat.OtCategoryId} value={cat.OtCategoryId}>{cat.OtCategory}</option>
                      ))}
                    </select>
              </div>
              <div className="col-md-4">
                  <label className="form-label">Search Item</label>
                  <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="🔍 Search OT Item..."
                      value={searchItem}
                      onChange={(e) => setSearchItem(e.target.value)}
                    />
              </div>
            </div>
            
            {/* Status Alert for Past Changes */}
            {hasChanges && selectedCompanyId && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <strong>✅ Past Changes Found!</strong>
                <p className="mb-0">You have previously changed <strong>{changesCount}</strong> OT item rate(s) for the selected company.</p>
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            )}
            
            {/* Table/Data View Section */}
            <div className="panel">
              <div className="panel-header">
                <h6>OT Item Rates List</h6>
              </div>
              <div className="panel-body p-0">
                {/* Use OverlayScrollbarsComponent for consistent scrollbar styling */}
                <OverlayScrollbarsComponent style={{ maxHeight: '60vh' }}>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredOtItems.length === 0 ? (
                    <div className="text-center py-4">No OT items found for the selected filters.</div>
                  ) : (
                    <table className="table table-dashed table-hover digi-dataTable table-striped">
                      <thead >
                        <tr>
                          <th>OT Item</th>
                          <th>Category</th>
                          <th className="text-end">Default Rate</th>
                          <th className="text-end">Company Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOtItems.map(item => (
                          <tr key={item.OtItemId}>
                            <td>{item.OtItem}</td>
                            <td>{item.OtCategory || '-'}</td>
                            <td className="text-end">
                                {/* Display the default rate for reference */}
                                ${item.Rate?.toFixed(2) || '0.00'}
                            </td>
                            <td>
                              <input
                                type="number"
                                className={`form-control form-control-sm text-end ${
                                    parseFloat(otItemRates[item.OtItemId]?.rate) !== parseFloat(item.Rate) && otItemRates[item.OtItemId]?.rate ? 'border-success border-2' : ''
                                }`}
                                value={otItemRates[item.OtItemId]?.rate || ''}
                                onChange={(e) => handleRateChange(item.OtItemId, e.target.value)}
                                placeholder="0.00"
                                min="0"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </OverlayScrollbarsComponent>
              </div>
            </div>
            
            {/* Re-add the save button at the bottom for accessibility */}
            <div className="text-end mt-3">
                <button className="btn btn-primary" onClick={handleSave} disabled={!selectedCompanyId || loading}>
                    {loading ? 'Saving...' : '💾 Save All Changes'}
                </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyWiseOtItemRate;