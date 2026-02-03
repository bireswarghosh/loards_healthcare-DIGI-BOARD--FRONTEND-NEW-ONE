import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendMedia = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: '',
    media_type: 'image',
    caption: '',
    footer: '',
    url: '',
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
        sender: formData.sender,
        number: formData.number,
        media_type: formData.media_type,
        url: formData.url
      };
      
      // Only add optional fields if they have values
      if (formData.caption) payload.caption = formData.caption;
      if (formData.footer) payload.footer = formData.footer;
      if (formData.msgid) payload.msgid = formData.msgid;
      if (formData.full) payload.full = formData.full;
      
      const res = await axiosInstance.post('/whatsapp/send-media', payload);
      setResponse(res.data);
      alert('Media sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send Media Message</h5>
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
              <label className="form-label">Media Type *</label>
              <select name="media_type" className="form-control" value={formData.media_type} onChange={handleChange} required>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Media URL *</label>
              <input type="url" name="url" className="form-control" value={formData.url} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Caption</label>
              <input type="text" name="caption" className="form-control" value={formData.caption} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Footer</label>
              <input type="text" name="footer" className="form-control" value={formData.footer} onChange={handleChange} />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Media'}
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

export default SendMedia;
