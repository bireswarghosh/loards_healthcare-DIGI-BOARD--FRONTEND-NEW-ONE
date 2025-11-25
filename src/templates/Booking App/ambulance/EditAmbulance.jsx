import { useState, useEffect } from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../masterLayout/Breadcrumb";
import axiosInstance from "../../axiosInstance";
import { useNavigate, useParams } from 'react-router-dom';

const EditAmbulance = () => {
  const [formData, setFormData] = useState({
    name: "",
    logo: null
  });
  const [currentLogo, setCurrentLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchAmbulance();
  }, []);

  const fetchAmbulance = async () => {
    try {
      const response = await axiosInstance.get(`/ambulance/${id}`);
      if (response.data.success) {
        setFormData({
          name: response.data.ambulance.name,
          logo: null
        });
        setCurrentLogo(response.data.ambulance.logo);
        setError(null);
      } else {
        setError('Failed to load ambulance details: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error fetching ambulance:', error);
      setError('Failed to load ambulance details');
    } finally {
      setFetchLoading(false);
    }
  };

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
      } else {
        // If no new logo selected, keep the existing logo
        formDataToSend.append('keepExistingLogo', 'true');
      }
      
      const response = await axiosInstance.put(`/ambulance/${id}`, formDataToSend);
      
      if (response.data.success) {
        alert('Ambulance updated successfully');
        navigate('/ambulance-list');
      } else {
        setError('Failed to update ambulance: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error updating ambulance:', error);
      setError('Failed to update ambulance');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <MasterLayout>
        <Breadcrumb title="Edit Ambulance" />
        <div className="container-fluid py-4">
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <Breadcrumb title="Edit Ambulance" />
      <div className="container-fluid py-4">
        <div className="card shadow border-0 rounded-4">
          <div className="card-header border-bottom">
            <h5 className="mb-0">🚑 Edit Ambulance</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold">📝 Ambulance Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name} 
                    onChange={(e) => handleInputChange("name", e.target.value)} 
                    placeholder="Enter ambulance name"
                    required 
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">🖼️ Logo</label>
                  {currentLogo && (
                    <div className="mb-3">
                      <img 
                        src={`http://localhost:5000${currentLogo}`} 
                        alt="Current Logo" 
                        style={{ width: '100px', height: '100px' }} 
                        className="border rounded p-1"
                      />
                      <p className="text-muted mt-1">Current Logo</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                  />
                </div>
                <div className="col-12 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 py-2"
                    disabled={loading}
                    style={{ background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)", border: "none" }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        💾 Update Ambulance
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default EditAmbulance;