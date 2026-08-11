import axios from 'axios';
import { env } from '../config';

const apiUrl = env('VITE_API_BASE_URL');

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log(apiUrl);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);