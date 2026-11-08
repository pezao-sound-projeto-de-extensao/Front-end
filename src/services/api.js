import axios from 'axios';
import { env } from '../config';
import { showApiError } from '../lib/apiError';
import { emitSessionExpired } from '../lib/sessionEvents';

export const API_BASE_URL = (env('VITE_API_BASE_URL') || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  // Sem a URL, as chamadas caem no próprio servidor do front, que responde index.html com 200
  console.error('VITE_API_BASE_URL não definida: configure o .env (veja .env.example).');
}

// A autenticação é por cookie httpOnly (access_token / refresh_token):
// o navegador envia e o back-end renova os cookies, não há header para gerenciar.
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Rotas de autenticação nunca disparam o refresh automático
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/trocar-senha', '/auth/esqueci-senha', '/auth/redefinir-senha'];
const SESSION_CHECK_ENDPOINT = '/auth/me';

const matches = (url, endpoint) => url.includes(endpoint);

// Várias requisições podem receber 401 juntas: todas esperam o mesmo refresh
let refreshPromise = null;

function refreshSession() {
  refreshPromise ??= api.post('/auth/refresh').finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};
    const status = error.response?.status;
    const url = originalRequest.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => matches(url, endpoint));
    const isSessionCheck = matches(url, SESSION_CHECK_ENDPOINT);

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshSession();
        return api(originalRequest);
      } catch (refreshError) {
        // Falha no /auth/me ao abrir o app só significa "sem sessão": o ProtectedRoute leva ao login
        if (!isSessionCheck && window.location.pathname !== '/login' && !emitSessionExpired()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (status === 403 && !isAuthEndpoint && !isSessionCheck) {
      showApiError(error);
    }

    return Promise.reject(error);
  }
);

export default api;
