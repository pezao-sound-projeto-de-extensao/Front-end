import axios from 'axios';
import { env } from '../config';

const apiUrl = env('VITE_API_BASE_URL');

let sessionModalOpener = null;
let isRefreshing = false;
let failedQueue = [];

export function setSessionModalOpener(opener) {
  sessionModalOpener = opener;
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('sf_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || '';

    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh') && window.location.pathname !== '/login') {
      if (originalRequest._retry) {
        sessionStorage.removeItem('sf_access_token');
        sessionStorage.removeItem('sf_refresh_token');
        sessionStorage.removeItem('sf_user');
        if (sessionModalOpener) {
          sessionModalOpener(() => {});
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api.request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem('sf_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        sessionStorage.removeItem('sf_access_token');
        sessionStorage.removeItem('sf_refresh_token');
        sessionStorage.removeItem('sf_user');
        if (sessionModalOpener) {
          sessionModalOpener(() => {});
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${apiUrl}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, username, usuario } = response.data;

        sessionStorage.setItem('sf_access_token', accessToken);
        sessionStorage.setItem('sf_refresh_token', newRefreshToken);
        sessionStorage.setItem('sf_user', JSON.stringify({ username, ...usuario }));

        const remember = localStorage.getItem('sf_remember');
        if (remember) {
          localStorage.setItem('sf_access_token', accessToken);
          localStorage.setItem('sf_refresh_token', newRefreshToken);
          localStorage.setItem('sf_user', JSON.stringify({ username, ...usuario }));
        }

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        sessionStorage.removeItem('sf_access_token');
        sessionStorage.removeItem('sf_refresh_token');
        sessionStorage.removeItem('sf_user');
        localStorage.removeItem('sf_access_token');
        localStorage.removeItem('sf_refresh_token');
        localStorage.removeItem('sf_user');
        localStorage.removeItem('sf_remember');

        if (sessionModalOpener) {
          sessionModalOpener(() => {});
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;