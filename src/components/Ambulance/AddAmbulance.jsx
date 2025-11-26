import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import axiosInstance from "../../axiosInstance";

const AddAmbulance = () => {
  const [formData, setFormData] = useState({
    name: "",
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      logo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Ambulance name is required');
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await axiosInstance.post('/ambulance', formDataToSend);

      if (response.data.success) {
        alert('Ambulance added successfully');
        navigate('/ambulance-list');
      } else {
        setError('Failed to add ambulance: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error adding ambulance:', error);
      setError('Failed to add ambulance');
    } finally {
      setLoading(false);
    }
  };

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
              <h5>🚑 Add New Ambulance</h5>
            </div>

            <div className="panel-body">
              <OverlayScrollbarsComponent style={{ height: "100%" }}>
                <form onSubmit={handleSubmit}>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">📝 Ambulance Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter ambulance name"
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">🖼️ Logo</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary w-50"
                      onClick={() => navigate('/ambulance-list')}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary w-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>Save</>
                      )}
                    </button>
                  </div>

                </form>
              </OverlayScrollbarsComponent>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddAmbulance;
