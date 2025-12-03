

import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/services/http-common.js';

const LOCATION_ENDPOINT = import.meta.env.VITE_ENDPOINT_LOCATION;

export const useLayoutStore = defineStore('layout', () => {

    const isSidebarVisible = ref(true);


    const userLocation = ref(null);

<<<<<<< HEAD

    const isLocationPublic = ref(true);


=======
    /**
     * Controls whether user's location is public in UI.
     * @type {import('vue').Ref<boolean>}
     */
    const isLocationPublic = ref(true);

    /**
     * Toggles the visibility state of the sidebar.
     */
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
    function toggleSidebar() {
        isSidebarVisible.value = !isSidebarVisible.value;
    }

<<<<<<< HEAD

=======
    /**
     * Updates the location privacy flag.
     * @param {boolean} value
     */
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
    function toggleLocationPrivacy(value) {
        isLocationPublic.value = !!value;
    }

<<<<<<< HEAD

=======
    /**
     * Fetches the user's location from backend only once per session.
     * If already fetched, it does nothing to avoid extra network calls.
     */
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
    async function fetchUserLocation() {
        if (userLocation.value) return;
        try {
            const { data } = await apiClient.get(LOCATION_ENDPOINT);
<<<<<<< HEAD
=======
            // Normalizar las claves que vienen del backend
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
            const city = data?.city ?? data?.City ?? '';
            const country_name = data?.country_name ?? data?.countryName ?? data?.Country ?? '';

            if (city || country_name) {
                userLocation.value = { city, country_name };
            }
        } catch (error) {
            console.error('Error fetching user location:', error);
        }
    }

    return { isSidebarVisible, toggleSidebar, userLocation, fetchUserLocation, isLocationPublic, toggleLocationPrivacy };
});