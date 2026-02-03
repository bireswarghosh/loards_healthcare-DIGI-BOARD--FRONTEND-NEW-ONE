import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const CheckNumber = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: ''
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
      const res = await axiosInstance.get('/whatsapp/check-number', {
        params: {
          api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
          ...formData
        }
      });
      setResponse(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to check number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Check WhatsApp Number</h5>
      </div>
      <div className="panel-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Your Number *</label>
              <input type="text" name="sender" className="form-control" value={formData.sender} onChange={handleChange} placeholder="62888xxxx" required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Number to Check *</label>
              <input type="text" name="number" className="form-control" value={formData.number} onChange={handleChange} placeholder="201111xxxxxx" required />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Checking...' : 'Check Number'}
              </button>
            </div>
          </div>
        </form>
        {response && (
          <div className={`alert ${response.msg?.exists ? 'alert-success' : 'alert-warning'} mt-3`}>
            <h6>Result:</h6>
            <p><strong>Exists:</strong> {response.msg?.exists ? 'Yes ✓' : 'No ✗'}</p>
            {response.msg?.jid && <p><strong>JID:</strong> {response.msg.jid}</p>}
            <pre className="mt-2">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckNumber;
