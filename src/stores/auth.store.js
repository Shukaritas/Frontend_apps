import { defineStore } from 'pinia';
import { AuthApiRepository } from '@/frutech/modules/iam/infrastructure/auth.api-repository';
import { User } from '@/frutech/modules/iam/domain/models/user.model';

const authRepository = new AuthApiRepository();

export const useAuthStore = defineStore('auth', {
    /**
     * Initial state containing user authentication information.
     */
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null
    }),

    /**
     * Computed getters for the authentication state.
     */
    getters: {
        isAuthenticated: (state) => !!state.user,
    },

    /**
     * Actions for authentication operations.
     */
    actions: {
        /**
         * Authenticates a user by email and password.
         * @param {Object} credentials - Login credentials
         * @param {string} credentials.email - User email
         * @param {string} credentials.password - User password
         * @returns {Promise<boolean>} True if login successful, false otherwise
         */
        async login({ email, password }) {
            this.error = null;
            try {
                const user = await authRepository.login(email, password);
                this.user = JSON.parse(localStorage.getItem('user'));
                this.token = localStorage.getItem('token');
                return true;
            } catch (err) {
                this.error = err.message;
                return false;
            }
        },

        /**
         * Registers a new user account.
         * @param {Object} userData - User information for registration
         * @returns {Promise<boolean>} True if registration successful, false otherwise
         */
        async register(userData) {
            this.error = null;
            try {
                const newUser = new User({ ...userData, id: 0 });
                await authRepository.register(newUser);
                return true;
            } catch (err) {
                this.error = err.message;
                return false;
            }
        },

        /**
         * Logs out the current user and clears authentication data.
         */
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});