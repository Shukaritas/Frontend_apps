/**
 * @file Axios instance configuration (refactor .NET 9 API).
 * @description Configura instancia global de Axios apuntando a la API real y maneja auth via JWT.
 */

import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
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
      if (error.response.status === 401) {
        // Sesión expirada o token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      const message = error.response.data?.message || `Error ${error.response.status}`;
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(new Error('No se recibió respuesta del servidor.'));
    }
    return Promise.reject(new Error(error.message));
  }
);

export default apiClient;