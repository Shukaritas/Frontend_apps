

import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/services/http-common.js';

const LOCATION_ENDPOINT = import.meta.env.VITE_ENDPOINT_LOCATION;

export const useLayoutStore = defineStore('layout', () => {

    const isSidebarVisible = ref(true);


    const userLocation = ref(null);


    const isLocationPublic = ref(true);


    function toggleSidebar() {
        isSidebarVisible.value = !isSidebarVisible.value;
    }


    function toggleLocationPrivacy(value) {
        isLocationPublic.value = !!value;
    }


    async function fetchUserLocation() {
        if (userLocation.value) return;
        try {
            const { data } = await apiClient.get(LOCATION_ENDPOINT);
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