import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendProduct = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: '',
    url: '',
    message: '',
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
      const res = await axiosInstance.post('/whatsapp/send-product', payload);
      setResponse(res.data);
      alert('Product sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send Product Message</h5>
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
            <div className="col-12">
              <label className="form-label">WhatsApp Product URL *</label>
              <input type="url" name="url" className="form-control" value={formData.url} onChange={handleChange} placeholder="https://wa.me/p/123456789/628xxxxxxxxxx" required />
              <small className="text-muted">Example: https://wa.me/p/12345678901234567/6281222xxxxxx</small>
            </div>
            <div className="col-12">
              <label className="form-label">Caption/Message</label>
              <textarea name="message" className="form-control" rows="3" value={formData.message} onChange={handleChange}></textarea>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Product'}
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

export default SendProduct;
