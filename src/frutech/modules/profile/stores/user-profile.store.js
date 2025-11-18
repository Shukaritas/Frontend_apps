import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserProfileApiRepository } from '../infrastructure/user-profile.api-repository';
import { UserProfileAssembler } from '../application/user-profile.assembler';

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

        try {
            // 1. Obtenemos la entidad actual fresca desde el repositorio
            const currentEntity = await repository.getById(profile.value.id);

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

        } catch (err) {
            error.value = 'No se pudo actualizar el perfil.';
            console.error(err);
            throw err;
        } finally {
            loading.value = false;
        }
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
        error,
        hasProfile,
        fetchProfile,
        updateProfile,
        changePassword,
        deleteAccount
    };
});