<template>
  <aside class="flex flex-column h-full p-3 shadow-2 sidebar-container" style="background-color: var(--p-primary-500);">
    <div class="flex align-items-center justify-content-center mb-5 logo-section">
      <img src="@/assets/logo.svg" alt="CultivApp Logo" class="h-2rem mr-2">
      <span class="font-bold text-xl">CultivApp</span>
    </div>

    <ul class="list-none p-0 m-0 flex-grow-1">
      <li v-for="item in navItems" :key="item.labelKey" class="mb-2">
        <router-link :to="item.route" v-slot="{ isActive }">
          <a :class="['flex align-items-center p-3 border-round text-color no-underline transition-colors transition-duration-150', { 'bg-primary': isActive, 'hover:surface-hover': !isActive }]">
            <img :src="getIconUrl(item.icon)" :alt="item.label" class="w-2rem h-2rem mr-3" />
            <span class="font-medium">{{ item.label }}</span>
          </a>
        </router-link>
      </li>
    </ul>

    <!-- Sección de ubicación del usuario al fondo -->
    <div class="mt-auto p-3 text-sm text-color-secondary">
      <template v-if="layoutStore.userLocation">
        <span>📍 {{ layoutStore.userLocation.region }}, {{ layoutStore.userLocation.country }}</span>
      </template>
      <template v-else>
        <span> Cargando... </span>
      </template>
    </div>
  </aside>
</template>

<script setup>
/**
 * @file Sidebar Component
 * @description A responsive navigation sidebar that displays links with icons.
 * It features a collapsibledesign and handles language translations for its items reactively.
 */
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLayoutStore } from '@/stores/layout.store';

const layoutStore = useLayoutStore();

const { t, locale } = useI18n({ useScope: 'global' });

/**
 * @const {Array<object>} baseNavItems
 * @description A static array of navigation item objects, each containing a translation key, icon name, and route.
 */
const baseNavItems = [
  { labelKey: 'sidebar.dashboard', icon: 'dashboard', route: '/dashboard' },
  { labelKey: 'sidebar.manageCrops', icon: 'manage-crops', route: '/manage-crops' },
  { labelKey: 'sidebar.myFields', icon: 'my-fields', route: '/my-fields' },
  { labelKey: 'sidebar.myTasks', icon: 'my-tasks', route: '/my-tasks' },
  { labelKey: 'sidebar.community', icon: 'community', route: '/community' },
];

/**
 * @type {import('vue').Ref<Array<object>>}
 * @description A reactive reference to the array of navigation items that will be rendered.
 * This array is updated with translated labels whenever the locale changes.
 */
const navItems = ref([]);

/**
 * Translates the labels of the base navigation items and updates the reactive `navItems` array.
 * @function
 */
const translateNavItems = () => {
  navItems.value = baseNavItems.map(item => ({
    ...item,
    label: t(item.labelKey)
  }));
};

/**
 * Watches for changes in the global `locale` and re-translates the navigation items.
 * The `immediate: true` option ensures it runs once on component mount.
 */
watch(locale, translateNavItems, { immediate: true });

/**
 * Generates the correct URL for a given SVG icon name from the assets folder.
 * @param {string} name - The name of the SVG file (without extension).
 * @returns {string} The resolved URL for the asset.
 */
const getIconUrl = (name) => {
  return new URL(`../../assets/${name}.svg`, import.meta.url).href;
};

onMounted(() => {
  layoutStore.fetchUserLocation();
});
</script>

<style scoped>
.logo-section, .list-none {
  transition: opacity 0.3s ease;
}

a {
  text-decoration: none;
}

a.bg-primary {
  background-color: rgba(0, 0, 0, 0.2) !important;
  color: var(--p-primary-color-text) !important;
}
a:not(.bg-primary):hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>