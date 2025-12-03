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

    <div class="mt-auto location-card">
      <div class="location-icon-circle">
        <i class="pi pi-map-marker"></i>
      </div>
      <div class="location-text-container">
        <div class="location-label">{{ $t('sidebar.myLocation') }}</div>
        <div class="location-value">{{ locationDisplay }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>

import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLayoutStore } from '@/stores/layout.store';

const layoutStore = useLayoutStore();
const { t, locale } = useI18n({ useScope: 'global' });
<<<<<<< HEAD


const locationDisplay = computed(() => {
  if (!layoutStore.isLocationPublic) return t('sidebar.location.anonymous');
=======

/**
 * Computed property que devuelve la ubicación formateada o un mensaje por defecto.
 * Respeta la privacidad del usuario.
 */
const locationDisplay = computed(() => {
  // Si la ubicación no es pública, mostrar cadena anónima
  if (!layoutStore.isLocationPublic) return t('sidebar.location.anonymous');
  // Si aún no se ha cargado la ubicación
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
  if (!layoutStore.userLocation) return t('sidebar.location.loading');
  const { city, country_name } = layoutStore.userLocation;
  if (city && country_name) return `${city}, ${country_name}`;
  if (city) return city;
  if (country_name) return country_name;
  return t('sidebar.location.unknown');
});

<<<<<<< HEAD

=======
/**
 * @const {Array<object>} baseNavItems
 * @description A static array of navigation item objects, each containing a translation key, icon name, and route.
 */
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
const baseNavItems = [
  { labelKey: 'sidebar.dashboard', icon: 'dashboard', route: '/dashboard' },
  { labelKey: 'sidebar.manageCrops', icon: 'manage-crops', route: '/manage-crops' },
  { labelKey: 'sidebar.myFields', icon: 'my-fields', route: '/my-fields' },
  { labelKey: 'sidebar.myTasks', icon: 'my-tasks', route: '/my-tasks' },
  { labelKey: 'sidebar.community', icon: 'community', route: '/community' },
];


const navItems = ref([]);


const translateNavItems = () => {
  navItems.value = baseNavItems.map(item => ({
    ...item,
    label: t(item.labelKey)
  }));
};


watch(locale, translateNavItems, { immediate: true });


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

.location-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(168, 191, 168, 0.3);
  border-radius: 8px;
  margin-top: 1rem;
}

.location-icon-circle {
  background: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-icon-circle i {
  color: gray;
  font-size: 1.2rem;
}

.location-text-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.location-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.location-value {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.location-value{
  color: var(--p-text-color)
}
.location-label{
  color: var(--p-text-color)
}
</style>