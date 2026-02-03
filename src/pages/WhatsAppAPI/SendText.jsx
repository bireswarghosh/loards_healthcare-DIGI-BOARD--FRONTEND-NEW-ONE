import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendText = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: '',
    message: '',
    footer: '',
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
      const params = {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        sender: formData.sender,
        number: formData.number,
        message: formData.message,
        ...(formData.footer && { footer: formData.footer }),
        ...(formData.msgid && { msgid: formData.msgid }),
        ...(formData.full && { full: formData.full })
      };
      
      const res = await axiosInstance.post('/whatsapp/send-message', params);
      setResponse(res.data);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send Text Message</h5>
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
              <label className="form-label">Message *</label>
              <textarea name="message" className="form-control" rows="4" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label">Footer</label>
              <input type="text" name="footer" className="form-control" value={formData.footer} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Message ID (Reply)</label>
              <input type="text" name="msgid" className="form-control" value={formData.msgid} onChange={handleChange} />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
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

export default SendText;
