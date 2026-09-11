import axios from 'axios';
import { env } from '../config';

const apiUrl = env('VITE_API_BASE_URL');

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh') && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;