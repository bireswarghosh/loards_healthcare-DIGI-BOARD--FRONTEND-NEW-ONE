import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../axiosInstance';

const SpecialProperty = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({
    PropertyName: '',
    PropertyValue: '',
    Description: ''
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/special-property');
      if (response.data?.success) {
        setProperties(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch special properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        await axiosInstance.post('/special-property', formData);
        toast.success('Special property added successfully!');
      } else {
        await axiosInstance.put(`/special-property/${formData.id}`, formData);
        toast.success('Special property updated successfully!');
      }
      setShowModal(false);
      setFormData({ PropertyName: '', PropertyValue: '', Description: '' });
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save special property');
    }
  };

  const handleEdit = (property) => {
    setFormData(property);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axiosInstance.delete(`/special-property/${id}`);
        toast.success('Special property deleted successfully!');
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete special property');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-primary">Special Property Master</h4>
        <button
          className="btn btn-primary"
          onClick={() => {
            setModalType('add');
            setFormData({ PropertyName: '', PropertyValue: '', Description: '' });
            setShowModal(true);
          }}
        >
          <i className="fa fa-plus me-2"></i>Add Property
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Property Name</th>
                    <th>Property Value</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.length > 0 ? (
                    properties.map((property) => (
                      <tr key={property.id}>
                        <td>{property.PropertyName}</td>
                        <td>{property.PropertyValue}</td>
                        <td>{property.Description}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(property)}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(property.id)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No special properties found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalType === 'add' ? 'Add' : 'Edit'} Special Property
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Property Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.PropertyName}
                        onChange={(e) => setFormData({...formData, PropertyName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Property Value *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.PropertyValue}
                        onChange={(e) => setFormData({...formData, PropertyValue: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.Description}
                        onChange={(e) => setFormData({...formData, Description: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {modalType === 'add' ? 'Add' : 'Update'} Property
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpecialProperty;