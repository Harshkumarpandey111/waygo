import axios from 'axios';

// ── Use Render backend in production, Vite proxy in development ──
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://waygo-backend-dr13.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('waygo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('waygo_token');
      localStorage.removeItem('waygo_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;