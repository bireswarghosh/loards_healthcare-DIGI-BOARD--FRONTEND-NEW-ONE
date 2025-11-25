import React, { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import axiosInstance from '../../axiosInstance';

const AppBannerSettings = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: 1,
    sort_order: 0,
    banner_image: null
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/app-banners');
      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      banner_image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingBanner && !formData.banner_image) {
      toast.error('Please select a banner image');
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', formData.is_active);
      formDataToSend.append('sort_order', formData.sort_order);
      if (formData.banner_image) {
        formDataToSend.append('banner_image', formData.banner_image);
      }

      const url = editingBanner ? `/app-banners/${editingBanner.id}` : '/app-banners';
      const method = editingBanner ? 'put' : 'post';
      
      const response = await axiosInstance[method](url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(`Banner ${editingBanner ? 'updated' : 'uploaded'} successfully!`);
        resetForm();
        fetchBanners();
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', is_active: 1, sort_order: 0, banner_image: null });
    setShowAddForm(false);
    setEditingBanner(null);
  };

  const editBanner = (banner) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      banner_image: null
    });
    setEditingBanner(banner);
    setShowAddForm(true);
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const response = await axiosInstance.delete(`/app-banners/${id}`);
      if (response.data.success) {
        toast.success('Banner deleted successfully!');
        fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  return (
    <>
      
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">App Banner/Slider Management</h5>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className="fas fa-plus me-1"></i>
            Add New Banner
          </button>
        </div>
        
        <div className="card-body">
          {showAddForm && (
            <div className="mb-4 p-3 border rounded">
              <h6>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h6>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Banner title"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Sort Order</label>
                      <input
                        type="number"
                        className="form-control"
                        name="sort_order"
                        value={formData.sort_order}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Banner description"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Banner Image <span className="text-danger">*</span></label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editingBanner}
                  />
                  <small className="text-muted">Recommended size: 1200x400px, Max size: 5MB</small>
                </div>
                
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active === 1}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success" disabled={uploading}>
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {editingBanner ? 'Updating...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${editingBanner ? 'fa-save' : 'fa-upload'} me-1`}></i>
                        {editingBanner ? 'Update Banner' : 'Upload Banner'}
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="row">
              {banners.length === 0 ? (
                <div className="col-12 text-center py-4">
                  <p className="text-muted">No banners found. Add your first banner!</p>
                </div>
              ) : (
                banners.map((banner) => (
                  <div key={banner.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card">
                      <img 
                        src={banner.image_url} 
                        className="card-img-top" 
                        alt={banner.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h6 className="card-title">{banner.title}</h6>
                        <p className="card-text small text-muted">{banner.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            Order: {banner.sort_order} | 
                            <span className={`ms-1 badge ${banner.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {banner.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </small>
                          <div className="btn-group">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => editBanner(banner)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteBanner(banner.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppBannerSettings;