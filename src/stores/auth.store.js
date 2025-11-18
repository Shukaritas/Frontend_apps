import { defineStore } from 'pinia';
// Importamos el repositorio y el modelo para seguir DDD y conectar con la API
import { AuthApiRepository } from '@/frutech/modules/iam/infrastructure/auth.api-repository';
import { User } from '@/frutech/modules/iam/domain/models/user.model';

// Instanciamos el repositorio
const authRepository = new AuthApiRepository();

export const useAuthStore = defineStore('auth', {
    /**
     * Estado inicial
     */
    state: () => ({
        // Intentamos leer del localStorage para mantener la sesión al recargar
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null
    }),

    /**
     * Getters
     */
    getters: {
        isAuthenticated: (state) => !!state.user,
    },

    /**
     * Acciones
     */
    actions: {
        /**
         * Inicia sesión usando el repositorio API.
         */
        async login({ email, password }) {
            this.error = null;
            try {
                // 1. Llamamos a la API a través del repositorio
                const user = await authRepository.login(email, password);

                // 2. Generamos un token simulado (ya que json-server no da uno real)
                const fakeToken = 'jwt-' + Date.now();

                // 3. Guardamos en el estado
                this.user = user;
                this.token = fakeToken;

                // 4. Persistimos en localStorage
                localStorage.setItem('token', fakeToken);
                localStorage.setItem('user', JSON.stringify(user));

                return true;
            } catch (err) {
                this.error = err.message;
                return false;
            }
        },

        /**
         * Registra un nuevo usuario.
         * ESTA ES LA FUNCIÓN QUE TE FALTABA.
         */
        async register(userData) {
            this.error = null;
            try {
                // 1. Creamos la entidad User para validar los datos (DDD)
                // Pasamos id: 0 porque el backend (json-server) generará el ID real
                const newUser = new User({ ...userData, id: 0 });

                // 2. Enviamos al repositorio
                await authRepository.register(newUser);

                return true;
            } catch (err) {
                this.error = err.message;
                return false;
            }
        },

        /**
         * Cierra sesión y limpia el almacenamiento.
         */
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});