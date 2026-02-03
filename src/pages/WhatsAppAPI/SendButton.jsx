import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendButton = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: '',
    message: '',
    footer: '',
    url: ''
  });
  const [buttons, setButtons] = useState([{ type: 'reply', displayText: '', phoneNumber: '', url: '', copyText: '' }]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleButtonChange = (index, field, value) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };

  const addButton = () => {
    if (buttons.length < 5) {
      setButtons([...buttons, { type: 'reply', displayText: '', phoneNumber: '', url: '', copyText: '' }]);
    }
  };

  const removeButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        ...formData,
        button: buttons.map(btn => {
          const cleanBtn = { type: btn.type, displayText: btn.displayText };
          if (btn.type === 'call') cleanBtn.phoneNumber = btn.phoneNumber;
          if (btn.type === 'url') cleanBtn.url = btn.url;
          if (btn.type === 'copy') cleanBtn.copyText = btn.copyText;
          return cleanBtn;
        })
      };
      const res = await axiosInstance.post('/whatsapp/send-button', payload);
      setResponse(res.data);
      alert('Button message sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send button message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send Button Message</h5>
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
              <textarea name="message" className="form-control" rows="3" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label">Image/Video URL *</label>
              <input type="url" name="url" className="form-control" value={formData.url} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Footer</label>
              <input type="text" name="footer" className="form-control" value={formData.footer} onChange={handleChange} />
            </div>
            <div className="col-12">
              <h6>Buttons (Max 5)</h6>
              {buttons.map((btn, index) => (
                <div key={index} className="card mb-2 p-3">
                  <div className="row g-2">
                    <div className="col-md-3">
                      <select className="form-control" value={btn.type} onChange={(e) => handleButtonChange(index, 'type', e.target.value)}>
                        <option value="reply">Reply</option>
                        <option value="call">Call</option>
                        <option value="url">URL</option>
                        <option value="copy">Copy</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Button Text" value={btn.displayText} onChange={(e) => handleButtonChange(index, 'displayText', e.target.value)} required />
                    </div>
                    {btn.type === 'call' && (
                      <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Phone Number" value={btn.phoneNumber} onChange={(e) => handleButtonChange(index, 'phoneNumber', e.target.value)} />
                      </div>
                    )}
                    {btn.type === 'url' && (
                      <div className="col-md-3">
                        <input type="url" className="form-control" placeholder="URL" value={btn.url} onChange={(e) => handleButtonChange(index, 'url', e.target.value)} />
                      </div>
                    )}
                    {btn.type === 'copy' && (
                      <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Copy Text" value={btn.copyText} onChange={(e) => handleButtonChange(index, 'copyText', e.target.value)} />
                      </div>
                    )}
                    <div className="col-md-2">
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeButton(index)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              {buttons.length < 5 && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={addButton}>Add Button</button>
              )}
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Button Message'}
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

export default SendButton;
