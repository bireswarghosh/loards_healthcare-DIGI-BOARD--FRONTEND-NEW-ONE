import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";

const RazorpaySettings = () => {
  const [settings, setSettings] = useState({
    razorpay_key: "",
    razorpay_secret: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/razorpay-settings");
      if (response.data.success && response.data.data) {
        setSettings({
          razorpay_key: response.data.data.razorpay_key || "",
          razorpay_secret: response.data.data.razorpay_secret || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!settings.razorpay_key.trim() || !settings.razorpay_secret.trim()) {
      toast.error("Please fill in both Razorpay Key and Secret");
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.put("/razorpay-settings", settings);
      if (response.data.success) {
        toast.success("Razorpay settings updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Razorpay Payment Gateway Settings</h5>
            <small className="text-muted">
              Configure your Razorpay credentials for payment processing
            </small>
          </div>

          <button
            className="btn btn-sm btn-primary"
            onClick={fetchSettings}
            disabled={saving || loading}
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">Razorpay Key ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="razorpay_key"
                    value={settings.razorpay_key}
                    onChange={handleInputChange}
                    placeholder="Enter Razorpay Key ID"
                    required
                  />
                  <small className="text-muted">
                    Your Razorpay Key ID (starts with rzp_)
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Razorpay Secret *</label>
                  <input
                    type="password"
                    className="form-control"
                    name="razorpay_secret"
                    value={settings.razorpay_secret}
                    onChange={handleInputChange}
                    placeholder="Enter Razorpay Secret"
                    required
                  />
                  <small className="text-muted">
                    Keep your Razorpay Secret secure
                  </small>
                </div>

                <div className="col-12">
                  <div className="alert alert-info">
                    <strong>Note:</strong> These credentials are used for secure
                    payment processing. Ensure the values match those in your
                    Razorpay Dashboard.
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={fetchSettings}
                  disabled={loading || saving}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RazorpaySettings;
