/**
 * @file Pinia store for layout management.
 * @description This store handles the state of UI layout elements, such as the visibility of the sidebar.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
    /**
     * Reactive state that holds the visibility status of the sidebar.
     * @type {import('vue').Ref<boolean>}
     */
    const isSidebarVisible = ref(true);

    /**
     * Toggles the visibility state of the sidebar.
     */
    function toggleSidebar() {
        isSidebarVisible.value = !isSidebarVisible.value;
    }

    return { isSidebarVisible, toggleSidebar };
});