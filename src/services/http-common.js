/**
 * @file Axios instance configuration (refactor .NET 9 API).
 * @description Configura instancia global de Axios apuntando a la API real y maneja auth via JWT.
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
    withCredentials: true,
});

// Request interceptor: agrega Authorization si existe token
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

// Response interceptor: manejo básico de errores + expiración sesión
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Sesión expirada o token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      const data = error.response.data || {};
      const backendMsg = data.message || data.title || data.detail || data.error;
      const message = backendMsg || `Error ${status}`;
      // Preservar el objeto de error de Axios (incluye response/status) y ajustar el mensaje
      error.message = message;
      return Promise.reject(error);
    }
    if (error.request) {
      return Promise.reject(new Error('No se recibió respuesta del servidor.'));
    }
    return Promise.reject(new Error(error.message));
  }
);

export default apiClient;