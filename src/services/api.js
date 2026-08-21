import axios from 'axios';
import { env } from '../config';

const apiUrl = env('VITE_API_BASE_URL');

let sessionModalOpener = null;

export function setSessionModalOpener(opener) {
  sessionModalOpener = opener;
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('sf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && !requestUrl.includes('/auth/login') && window.location.pathname !== '/login') {
      sessionStorage.removeItem('sf_token');
      const retryConfig = { ...error.config };
      error.config._retry = true;

      if (sessionModalOpener) {
        sessionModalOpener(() => {
          api.request(retryConfig);
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
