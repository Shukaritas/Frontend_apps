/**
 * @file Axios instance configuration for API communication.
 * @description Configures a global Axios instance pointing to the API backend with JWT authentication support.
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
    withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      const data = error.response.data || {};
      const backendMsg = data.message || data.title || data.detail || data.error;
      error.message = backendMsg || `Error ${status}`;
      return Promise.reject(error);
    }
    if (error.request) {
      return Promise.reject(new Error('No response received from server.'));
    }
    return Promise.reject(new Error(error.message));
  }
);

export default apiClient;