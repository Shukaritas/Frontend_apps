/**
 * @file Pinia store for layout management.
 * @description This store handles the state of UI layout elements, such as the visibility of the sidebar.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/services/http-common.js';

export const useLayoutStore = defineStore('layout', () => {
    /**
     * Reactive state that holds the visibility status of the sidebar.
     * @type {import('vue').Ref<boolean>}
     */
    const isSidebarVisible = ref(true);

    /**
     * Holds the user's location info once fetched. Null until loaded.
     * @type {import('vue').Ref<{region: string, country: string} | null>}
     */
    const userLocation = ref(null);

    /**
     * Toggles the visibility state of the sidebar.
     */
    function toggleSidebar() {
        isSidebarVisible.value = !isSidebarVisible.value;
    }

    /**
     * Fetches the user's location from backend only once per session.
     * If already fetched, it does nothing to avoid extra network calls.
     */
    async function fetchUserLocation() {
        if (userLocation.value) return; // cache guard
        try {
            const { data } = await apiClient.get('/v1/location');
            // Normalize potential key naming from backend response
            const region = data?.region ?? data?.Region ?? null;
            const country = data?.country ?? data?.Country ?? null;
            if (region || country) {
                userLocation.value = { region: region || '', country: country || '' };
            }
        } catch (_) {
            // Silently ignore; UI will remain in loading state or handle absence gracefully
        }
    }

    return { isSidebarVisible, toggleSidebar, userLocation, fetchUserLocation };
});