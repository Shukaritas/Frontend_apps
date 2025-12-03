import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserProfileApiRepository } from '../infrastructure/user-profile.api-repository';
import { UserProfileAssembler } from '../application/user-profile.assembler';
import { useAuthStore } from '@/stores/auth.store.js';

const repository = new UserProfileApiRepository();
const assembler = new UserProfileAssembler();


export const useUserProfileStore = defineStore('user-profile', () => {
    const profile = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const hasProfile = computed(() => !!profile.value);
    const isLoading = computed(() => loading.value); // alias para la página que usa isLoading


    async function fetchProfile(userId) {
        loading.value = true;
        error.value = null;
        try {
            const profileEntity = await repository.getById(userId);

            profile.value = assembler.toDTO(profileEntity);

        } catch (err) {
            error.value = 'No se pudo cargar la información del perfil.';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }


    async function updateProfile(dataToUpdate) {
        if (!profile.value) return;
        loading.value = true;
        error.value = null;
        const oldEmail = profile.value.email;
        let emailChanged = false;
        try {
            const currentEntity = await repository.getById(profile.value.id);

            if (dataToUpdate.email && dataToUpdate.email !== currentEntity.email) {
                currentEntity.email = dataToUpdate.email.trim();
            }

            currentEntity.updateInformation(
                dataToUpdate.name,
                dataToUpdate.phoneNumber,
                dataToUpdate.identificator
            );

            const updatedEntity = await repository.update(currentEntity);

            profile.value = assembler.toDTO(updatedEntity);

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
                        localStorage.setItem('user', JSON.stringify({ id: authStore.user.id, username: newName, email: authStore.user.email }));
                    }
                }
            }

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
        loading,
        isLoading,
        error,
        hasProfile,
        fetchProfile,
        updateProfile,
        changePassword,
        deleteAccount
    };
});