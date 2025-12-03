import { defineStore } from 'pinia';
import { AuthApiRepository } from '@/frutech/modules/iam/infrastructure/auth.api-repository';
import { User } from '@/frutech/modules/iam/domain/models/user.model';

const authRepository = new AuthApiRepository();

export const useAuthStore = defineStore('auth', {

    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null
    }),


    getters: {
        isAuthenticated: (state) => !!state.user, // permitir cookie-based sessions
    },


    actions: {

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


        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});