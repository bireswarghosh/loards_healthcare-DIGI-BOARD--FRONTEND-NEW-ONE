import { io } from 'socket.io-client';

// Backend URL
const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://lords-backend.onrender.com';

// Socket connection
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Connection status
socket.on('connect', () => {
  console.log('✅ Socket Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket Disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket Error:', error);
});

export default socket;
