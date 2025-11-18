/**
 * @file Axios instance configuration.
 * @description This file creates and configures a global Axios instance for making API requests.
 * It includes a request interceptor to automatically add the authentication token to headers.
 */

import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})
/**
 * Axios request interceptor.
 * Attaches the JWT token from the auth store to the Authorization header if it exists.
 */
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;