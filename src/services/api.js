import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log(config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);