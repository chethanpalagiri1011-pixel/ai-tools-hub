import axios from 'axios';

const api = axios.create({
  baseURL: '', // Dev proxy handles /api routing
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-logout on 401 - let each component handle it
    return Promise.reject(error);
  }
);

export default api;
