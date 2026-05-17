import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const SYNC_INTERVAL = 60000; // Send data every 60 seconds
const IDLE_THRESHOLD = 30000; // 30 seconds no activity = idle

const useActivityTracker = () => {
  const location = useLocation();
  const lastPage = useRef('');
  const stats = useRef({ mouseClicks: 0, keyStrokes: 0, activeSeconds: 0, idleSeconds: 0, pagesVisited: new Set() });
  const lastActivity = useRef(Date.now());
  const isActive = useRef(true);
  const intervalRef = useRef(null);
  const secondsRef = useRef(null);

  // Track page visits
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (!userId || !username) return;
    if (location.pathname === lastPage.current) return;
    if (location.pathname === '/login') return;
    lastPage.current = location.pathname;
    stats.current.pagesVisited.add(location.pathname);

    axiosInstance.post('/activity-log', {
      userId, username, action: 'page_visit', page: location.pathname, details: `Visited ${location.pathname}`
    }).catch(() => {});
  }, [location.pathname]);

  // Track mouse clicks
  const handleClick = useCallback(() => {
    stats.current.mouseClicks++;
    lastActivity.current = Date.now();
    isActive.current = true;
  }, []);

  // Track keystrokes
  const handleKeyDown = useCallback(() => {
    stats.current.keyStrokes++;
    lastActivity.current = Date.now();
    isActive.current = true;
  }, []);

  // Track mouse movement (for active detection)
  const handleMouseMove = useCallback(() => {
    lastActivity.current = Date.now();
    isActive.current = true;
  }, []);

  // Count seconds (active vs idle)
  useEffect(() => {
    secondsRef.current = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_THRESHOLD) {
        isActive.current = false;
        stats.current.idleSeconds++;
      } else {
        stats.current.activeSeconds++;
      }
    }, 1000);

    return () => clearInterval(secondsRef.current);
  }, []);

  // Sync to backend every 60 seconds
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (!userId || !username) return;

    intervalRef.current = setInterval(() => {
      const { mouseClicks, keyStrokes, activeSeconds, idleSeconds, pagesVisited } = stats.current;
      if (mouseClicks === 0 && keyStrokes === 0 && activeSeconds === 0) return;

      axiosInstance.post('/productivity-log', {
        userId, username, mouseClicks, keyStrokes, activeSeconds, idleSeconds, pagesVisited: pagesVisited.size
      }).catch(() => {});

      // Reset counters after sync
      stats.current.mouseClicks = 0;
      stats.current.keyStrokes = 0;
      stats.current.activeSeconds = 0;
      stats.current.idleSeconds = 0;
    }, SYNC_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Attach event listeners
  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleClick, handleKeyDown, handleMouseMove]);
};

// Utility to log custom actions (create, update, delete etc.)
export const logActivity = (action, page, details) => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  if (!userId) return;

  axiosInstance.post('/activity-log', {
    userId, username, action, page: page || window.location.pathname, details
  }).catch(() => {});
};

export default useActivityTracker;
