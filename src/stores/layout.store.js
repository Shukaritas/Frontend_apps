/**
 * @file Pinia store for layout management.
 * @description This store handles the state of UI layout elements, such as the visibility of the sidebar.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/services/http-common.js';

const LOCATION_ENDPOINT = import.meta.env.VITE_ENDPOINT_LOCATION;

export const useLayoutStore = defineStore('layout', () => {
    /**
     * Reactive state that holds the visibility status of the sidebar.
     * @type {import('vue').Ref<boolean>}
     */
    const isSidebarVisible = ref(true);

    /**
     * Holds the user's location info once fetched. Null until loaded.
     * @type {import('vue').Ref<{city: string, country_name: string} | null>}
     */
    const userLocation = ref(null);

    /**
     * Controls whether user's location is public in UI.
     * @type {import('vue').Ref<boolean>}
     */
    const isLocationPublic = ref(true);

    /**
     * Toggles the visibility state of the sidebar.
     */
    function toggleSidebar() {
        isSidebarVisible.value = !isSidebarVisible.value;
    }

    /**
     * Updates the location privacy flag.
     * @param {boolean} value
     */
    function toggleLocationPrivacy(value) {
        isLocationPublic.value = !!value;
    }

    /**
     * Fetches the user's location from backend only once per session.
     * If already fetched, it does nothing to avoid extra network calls.
     */
    async function fetchUserLocation() {
        if (userLocation.value) return; // cache guard: evita llamadas repetidas
        try {
            const { data } = await apiClient.get(LOCATION_ENDPOINT);
            // Normalizar las claves que vienen del backend
            const city = data?.city ?? data?.City ?? '';
            const country_name = data?.country_name ?? data?.countryName ?? data?.Country ?? '';

            if (city || country_name) {
                userLocation.value = { city, country_name };
            }
        } catch (error) {
            // Silenciosamente ignorar errores; el UI mostrará "Cargando..." indefinidamente
            console.error('Error fetching user location:', error);
        }
    }

    return { isSidebarVisible, toggleSidebar, userLocation, fetchUserLocation, isLocationPublic, toggleLocationPrivacy };
});