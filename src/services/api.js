import axios from 'axios';
import { env } from '../config';
import { showApiError } from '../lib/apiError';
import { authService } from './authService';
import { getGlobalOpenModal } from '../context/SessionModalContext';

const apiUrl = env('VITE_API_BASE_URL');

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const openSessionExpiredModal = (retryFn) => {
  const openModal = getGlobalOpenModal();
  if (openModal) {
    openModal(retryFn);
  } else {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthMe = requestUrl.includes('/auth/me');
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh') || requestUrl.includes('/auth/logout') || requestUrl.includes('/auth/trocar-senha');

    if (status === 403 && isAuthMe) {
      return Promise.reject(error);
    }

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await authService.refreshToken();
        const { accessToken } = response.data;
        isRefreshing = false;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        if (window.location.pathname !== '/login') {
          openSessionExpiredModal(() => {
            window.location.href = '/login';
          });
        }
        return Promise.reject(refreshError);
      }
    }

    if (status === 403 && !isAuthMe && !isAuthEndpoint) {
      const { detail } = error.response?.data || {};
      const isPrimeiroAcesso = detail?.includes?.('Primeiro acesso') || detail?.includes?.('primeiro acesso');

      if (isPrimeiroAcesso) {
        if (window.location.pathname !== '/change-password') {
          window.location.href = '/change-password';
        }
        return Promise.reject(error);
      }

      showApiError(error);
    }

    return Promise.reject(error);
  }
);

export default api;