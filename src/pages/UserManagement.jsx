import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    UserName: '',
    Password: '',
    Active: 'Y',
    Admin: '1'
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const { user } = useAuth();

  // Check if current user has edit permissions
  const canEdit = user?.username !== 'PARESH CH ROY';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/auth/users');
      setUsers(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, userData = null) => {
    if (!canEdit) return;
    setModalMode(mode);
    if (mode === 'edit' && userData) {
      setEditingUserId(userData.UserId);
      setFormData({
        UserName: userData.UserName,
        Password: '',
        Active: userData.Active || 'Y',
        Admin: userData.Admin || '1'
      });
    } else {
      setEditingUserId(null);
      setFormData({
        UserName: '',
        Password: '',
        Active: 'Y',
        Admin: '1'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ UserName: '', Password: '', Active: 'Y', Admin: '1' });
    setEditingUserId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      if (modalMode === 'add') {
        await axiosInstance.post('/auth/users', formData);
        alert('User added successfully');
      } else {
        await axiosInstance.put(`/auth/users/${editingUserId}`, formData);
        alert('User updated successfully');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Operation failed'));
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    if (!canEdit) return;
    
    try {
      const newStatus = currentStatus === 'Y' ? 'N' : 'Y';
      await axiosInstance.patch(`/auth/users/${userId}/status`, { Active: newStatus });
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">User Management</h5>
        {canEdit && (
          <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal('add')}>
            <i className="fa fa-plus me-2"></i>Add User
          </button>
        )}
      </div>
      <div className="card-body">
        {!canEdit && (
          <div className="alert alert-info">
            <i className="fa fa-info-circle me-2"></i>You have view-only access
          </div>
        )}
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Password</th>
                <th>Status</th>
                <th>Admin Level</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.UserId} style={{ backgroundColor: user?.username === u.UserName ? '#fff3cd' : 'transparent' }}>
                  <td>{u.UserId}</td>
                  <td>
                    {u.UserName}
                    {user?.username === u.UserName && <span className="badge bg-info ms-2">You</span>}
                  </td>
                  <td>{u.Password || 'N/A'}</td>
                  <td>
                    {canEdit ? (
                      <button
                        className={`btn btn-sm ${u.Active === 'Y' ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => handleToggleActive(u.UserId, u.Active)}
                      >
                        {u.Active === 'Y' ? 'Active' : 'Inactive'}
                      </button>
                    ) : (
                      <span className={`badge ${u.Active === 'Y' ? 'bg-success' : 'bg-secondary'}`}>
                        {u.Active === 'Y' ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.Admin ? 'bg-primary' : 'bg-secondary'}`}>
                      {u.Admin || 'N/A'}
                    </span>
                  </td>
                  {canEdit && (
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleOpenModal('edit', u)}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center text-muted py-4">No users found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{modalMode === 'add' ? 'Add User' : 'Edit User'}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        name="UserName"
                        value={formData.UserName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Password"
                        value={formData.Password}
                        onChange={handleInputChange}
                        placeholder={modalMode === 'edit' ? 'Leave blank to keep current' : ''}
                        required={modalMode === 'add'}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        name="Active"
                        value={formData.Active}
                        onChange={handleInputChange}
                      >
                        <option value="Y">Active</option>
                        <option value="N">Inactive</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Admin Level</label>
                      <select
                        className="form-select"
                        name="Admin"
                        value={formData.Admin}
                        onChange={handleInputChange}
                      >
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="0">No Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {modalMode === 'add' ? 'Add' : 'Update'}
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

export default UserManagement;
