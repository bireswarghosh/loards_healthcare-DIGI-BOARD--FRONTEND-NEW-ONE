import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading, permissions, user } = useAuth();

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

  // Check if user is super admin
  const isSuperAdmin = user?.username === 'lordsYou' || user?.username === 'lords' || user?.email === 'lords@kol';
  
  // Allow access if super admin or has userManagement permission
  if (!isSuperAdmin && !permissions?.userManagement) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminOnlyRoute;
