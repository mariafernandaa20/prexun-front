import axios from 'axios';
import { useAuthStore } from './store/auth-store'; // Ajusta si está en otro path

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token automáticamente
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken; // Access token directly from state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
