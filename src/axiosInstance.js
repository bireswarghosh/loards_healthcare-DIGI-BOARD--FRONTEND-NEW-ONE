import axios from 'axios';


const axiosInstance = axios.create({


// ! for production


 baseURL:'https://lords-backend.onrender.com/api/v1',










  // Automatically switch between production and local
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/v1'  // for local machine
    : 'https://lords-backend.onrender.com/api/v1',  // for production


  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});


// Add a request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend server might be down');
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;

