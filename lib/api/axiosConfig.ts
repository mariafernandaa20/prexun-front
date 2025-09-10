import axios from 'axios';
import Cookies from 'js-cookie';
import { requestLogger } from '@/lib/debug/request-logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
// Expose logger globally in development
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEVELOPMENT === 'true') {
  (window as any).__requestLogger = requestLogger;
}

// Add token interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NEXT_PUBLIC_DEVELOPMENT === 'true') {
      requestLogger.logRequest(config.url || '', config.method?.toUpperCase() || 'GET');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
