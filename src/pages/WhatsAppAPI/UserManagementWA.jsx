import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const UserManagementWA = () => {
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    email: '',
    expire: '30',
    limit_device: '10'
  });
  const [infoUsername, setInfoUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/whatsapp/create-user', {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        ...createForm
      });
      setResponse(res.data);
      alert('User created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.get('/whatsapp/info-user', {
        params: {
          api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
          username: infoUsername
        }
      });
      setResponse(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get user info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <div className="panel">
          <div className="panel-header">
            <h5>Create User</h5>
          </div>
          <div className="panel-body">
            <form onSubmit={handleCreateUser}>
              <div className="mb-3">
                <label className="form-label">Username *</label>
                <input type="text" name="username" className="form-control" value={createForm.username} onChange={handleCreateChange} required />
                <small className="text-muted">No symbols allowed</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Password *</label>
                <input type="password" name="password" className="form-control" value={createForm.password} onChange={handleCreateChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-control" value={createForm.email} onChange={handleCreateChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Expire (Days) *</label>
                <input type="number" name="expire" className="form-control" value={createForm.expire} onChange={handleCreateChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Device Limit</label>
                <input type="number" name="limit_device" className="form-control" value={createForm.limit_device} onChange={handleCreateChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="panel">
          <div className="panel-header">
            <h5>Get User Info</h5>
          </div>
          <div className="panel-body">
            <form onSubmit={handleGetUserInfo}>
              <div className="mb-3">
                <label className="form-label">Username *</label>
                <input type="text" className="form-control" value={infoUsername} onChange={(e) => setInfoUsername(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-info" disabled={loading}>
                {loading ? 'Loading...' : 'Get Info'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {response && (
        <div className="col-12">
          <div className="alert alert-info">
            <h6>Response:</h6>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementWA;
