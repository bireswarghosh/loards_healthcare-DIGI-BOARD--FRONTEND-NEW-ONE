import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendPoll = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: '',
    name: '',
    countable: '1',
    msgid: '',
    full: 0
  });
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        ...formData,
        option: options.filter(opt => opt.trim() !== '')
      };
      const res = await axiosInstance.post('/whatsapp/send-poll', payload);
      setResponse(res.data);
      alert('Poll sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send Poll Message</h5>
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
              <label className="form-label">Poll Question *</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Allow Multiple Selection</label>
              <select name="countable" className="form-control" value={formData.countable} onChange={handleChange}>
                <option value="1">No (Single Choice)</option>
                <option value="0">Yes (Multiple Choice)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Message ID (Reply)</label>
              <input type="text" name="msgid" className="form-control" value={formData.msgid} onChange={handleChange} />
            </div>
            <div className="col-12">
              <h6>Poll Options</h6>
              {options.map((opt, index) => (
                <div key={index} className="input-group mb-2">
                  <input type="text" className="form-control" placeholder={`Option ${index + 1}`} value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} required />
                  {options.length > 2 && (
                    <button type="button" className="btn btn-danger" onClick={() => removeOption(index)}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addOption}>Add Option</button>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Poll'}
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

export default SendPoll;
