import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendTextChannel = () => {
  const [formData, setFormData] = useState({
    sender: '',
    url: '',
    message: '',
    footer: '',
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
      const res = await axiosInstance.post('/whatsapp/send-text-channel', payload);
      setResponse(res.data);
      alert('Message sent to channel successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message to channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send Text to Channel</h5>
      </div>
      <div className="panel-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Sender Number *</label>
              <input type="text" name="sender" className="form-control" value={formData.sender} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Channel URL *</label>
              <input type="url" name="url" className="form-control" value={formData.url} onChange={handleChange} placeholder="https://whatsapp.com/channel/ABCDEF123456" required />
            </div>
            <div className="col-12">
              <label className="form-label">Message *</label>
              <textarea name="message" className="form-control" rows="4" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <div className="col-12">
              <label className="form-label">Footer</label>
              <input type="text" name="footer" className="form-control" value={formData.footer} onChange={handleChange} />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send to Channel'}
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

export default SendTextChannel;
