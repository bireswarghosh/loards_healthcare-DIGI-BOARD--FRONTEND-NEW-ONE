import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const username = user?.username || localStorage.getItem('username');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (username !== 'lords') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminOnlyRoute;
