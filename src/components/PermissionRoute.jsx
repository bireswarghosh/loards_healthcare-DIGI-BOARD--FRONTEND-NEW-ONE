import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosInstance';

const PermissionRoute = ({ children, section }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [permLoading, setPermLoading] = useState(true);
  const username = user?.username || localStorage.getItem('username');

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.userId) {
        try {
          const response = await axiosInstance.get(`/auth/users/${user.userId}/permissions`);
          if (response.data.success) {
            setPermissions(response.data.data);
          }
        } catch (err) {
          setPermissions(null);
        }
      }
      setPermLoading(false);
    };
    fetchPermissions();
  }, [user]);

  if (loading || permLoading) {
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

  if (username === 'lords') {
    return children;
  }

  if (permissions && permissions[section] === false) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PermissionRoute;
