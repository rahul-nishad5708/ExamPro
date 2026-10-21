import axios from 'axios';

// Resolve API baseURL from environment (e.g. Render production URL) or fallback to '/api'
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const baseURL = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
