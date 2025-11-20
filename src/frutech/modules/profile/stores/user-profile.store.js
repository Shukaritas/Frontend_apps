import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserProfileApiRepository } from '../infrastructure/user-profile.api-repository';
import { UserProfileAssembler } from '../application/user-profile.assembler';
import { useAuthStore } from '@/stores/auth.store.js'; // nuevo import para logout y sincronización

// Instanciamos las dependencias (Infraestructura y Application)
const repository = new UserProfileApiRepository();
const assembler = new UserProfileAssembler();

/**
 * @store useUserProfileStore
 * @description Store de Pinia para gestionar el estado del perfil de usuario.
 * Adaptado para usar el repositorio con mapeo corregido (DDD).
 */
export const useUserProfileStore = defineStore('user-profile', () => {
    // Estado Reactivo
    const profile = ref(null);
    // CAMBIO: Renombrado de 'isLoading' a 'loading' para coincidir con profile.page.vue
    const loading = ref(false);
    const error = ref(null);

    // Getters (Computed)
    const hasProfile = computed(() => !!profile.value);
    const isLoading = computed(() => loading.value); // alias para la página que usa isLoading

    /**
     * Obtiene el perfil desde la API usando el Repositorio corregido.
     * @param {number} userId - El ID del usuario.
     */
    async function fetchProfile(userId) {
        loading.value = true;
        error.value = null;
        try {
            // repository.getById ahora devuelve una entidad UserProfile válida (con camelCase)
            const profileEntity = await repository.getById(userId);

            // Convertimos la Entidad a DTO para la vista
            profile.value = assembler.toDTO(profileEntity);

        } catch (err) {
            error.value = 'No se pudo cargar la información del perfil.';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Actualiza la información personal del usuario.
     * @param {object} dataToUpdate - Datos nuevos { name, phoneNumber, identificator }.
     */
    async function updateProfile(dataToUpdate) {
        if (!profile.value) return;
        loading.value = true;
        error.value = null;
        const oldEmail = profile.value.email; // guardar email anterior
        let emailChanged = false;
        try {
            // 1. Obtenemos la entidad actual fresca desde el repositorio
            const currentEntity = await repository.getById(profile.value.id);

            // Actualizar email si viene en el payload y es distinto
            if (dataToUpdate.email && dataToUpdate.email !== currentEntity.email) {
                currentEntity.email = dataToUpdate.email.trim();
            }

            // 2. Aplicamos la lógica de negocio del Dominio
            currentEntity.updateInformation(
                dataToUpdate.name,
                dataToUpdate.phoneNumber,
                dataToUpdate.identificator
            );

            // 3. Persistimos los cambios (El repositorio se encarga del mapeo a snake_case)
            const updatedEntity = await repository.update(currentEntity);

            // 4. Actualizamos el estado local con la respuesta
            profile.value = assembler.toDTO(updatedEntity);

            // Sincronizar nombre con sesión local (authStore + localStorage) si sigue autenticado
            if (!emailChanged) { // aún no se ha marcado cambio de email
                const authStore = useAuthStore();
                if (authStore.user) {
                    const newName = updatedEntity.name || profile.value.name;
                    authStore.user.username = newName;
                    try {
                        const stored = JSON.parse(localStorage.getItem('user') || '{}');
                        stored.username = newName;
                        localStorage.setItem('user', JSON.stringify(stored));
                    } catch (e) {
                        // Si hay corrupción en localStorage, reescribimos completamente
                        localStorage.setItem('user', JSON.stringify({ id: authStore.user.id, username: newName, email: authStore.user.email }));
                    }
                }
            }

            // Comparar email para saber si se requiere logout
            if (oldEmail !== dataToUpdate.email) {
                emailChanged = true;
                const authStore = useAuthStore();
                authStore.logout();
            }
        } catch (err) {
            error.value = 'No se pudo actualizar el perfil.';
            console.error(err);
            throw err;
        } finally {
            loading.value = false;
        }
        return { emailChanged };
    }

    /**
     * Cambia la contraseña del usuario.
     * @param {object} passwordData - { currentPassword, newPassword, confirmPassword }.
     */
    async function changePassword({ currentPassword, newPassword, confirmPassword }) {
        if (!profile.value) return;

        if (newPassword !== confirmPassword) {
            throw new Error('errors.passwordsDontMatch');
        }

        loading.value = true;
        try {
            await repository.updatePassword(profile.value.id, currentPassword, newPassword);
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Elimina la cuenta del usuario.
     */
    async function deleteAccount() {
        if (!profile.value) return;
        loading.value = true;
        try {
            await repository.delete(profile.value.id);
            profile.value = null;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        profile,
        loading, // Exportamos 'loading' para que el v-if de la página funcione
        isLoading, // export alias
        error,
        hasProfile,
        fetchProfile,
        updateProfile,
        changePassword,
        deleteAccount
    };
});