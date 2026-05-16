import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const useActivityTracker = () => {
  const location = useLocation();
  const lastPage = useRef('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (!userId || !username) return;
    if (location.pathname === lastPage.current) return;
    lastPage.current = location.pathname;

    // Don't log login page
    if (location.pathname === '/login') return;

    axiosInstance.post('/activity-log', {
      userId,
      username,
      action: 'page_visit',
      page: location.pathname,
      details: `Visited ${location.pathname}`
    }).catch(() => {});
  }, [location.pathname]);
};

// Utility to log custom actions
export const logActivity = (action, page, details) => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  if (!userId) return;

  axiosInstance.post('/activity-log', {
    userId,
    username,
    action,
    page: page || window.location.pathname,
    details
  }).catch(() => {});
};

export default useActivityTracker;
