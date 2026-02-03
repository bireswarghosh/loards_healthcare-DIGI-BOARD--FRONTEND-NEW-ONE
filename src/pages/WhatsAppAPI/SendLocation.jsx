import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendLocation = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: '',
    latitude: '',
    longitude: '',
    msgid: '',
    full: 0
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        ...formData
      };
      const res = await axiosInstance.post('/whatsapp/send-location', payload);
      setResponse(res.data);
      alert('Location sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send Location</h5>
      </div>
      <div className="panel-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Sender Number *</label>
              <input type="text" name="sender" className="form-control" value={formData.sender} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Recipient Number *</label>
              <input type="text" name="number" className="form-control" value={formData.number} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Latitude *</label>
              <input type="text" name="latitude" className="form-control" value={formData.latitude} onChange={handleChange} placeholder="24.121231" required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Longitude *</label>
              <input type="text" name="longitude" className="form-control" value={formData.longitude} onChange={handleChange} placeholder="55.1121221" required />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Location'}
              </button>
            </div>
          </div>
        </form>
        {response && (
          <div className="alert alert-success mt-3">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendLocation;
