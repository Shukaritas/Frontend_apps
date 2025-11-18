<template>
  <header class="flex justify-content-between align-items-center p-3 shadow-1 header-component" style="background-color: var(--surface-card);">
    <Button
        icon="pi pi-bars"
        @click="layoutStore.toggleSidebar"
        text
        rounded
        aria-label="Toggle Sidebar"
    />
    <div class="flex align-items-center gap-3">
      <LanguageSwitcher />
      <Button icon="pi pi-user" :label="profileLabel" @click="goToProfile" text />
      <Button icon="pi pi-sign-out" :label="logoutLabel" @click="logout" severity="danger" text />
    </div>
  </header>
</template>

<script setup>
/**
 * @file Header Component
 * @description The main application header. It contains the sidebar toggle button,
 * the language switcher, and user action buttons like profile and logout.
 */
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLayoutStore } from '@/stores/layout.store';
import { useAuthStore } from '@/stores/auth.store'; // 1. Importamos el Auth Store
import LanguageSwitcher from './language-switcher.component.vue';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const layoutStore = useLayoutStore();
const authStore = useAuthStore(); // 2. Instanciamos el Store
const router = useRouter();
const { t, locale } = useI18n({ useScope: 'global' });

/**
 * @type {import('vue').Ref<string>}
 * @description Reactive reference for the translated "Profile" button label.
 */
const profileLabel = ref('');
/**
 * @type {import('vue').Ref<string>}
 * @description Reactive reference for the translated "Log Out" button label.
 */
const logoutLabel = ref('');

/**
 * Translates the header button labels.
 * @function
 */
const translateHeaderLabels = () => {
  if (typeof locale.value !== 'string') return;
  profileLabel.value = t('header.profile');
  logoutLabel.value = t('header.logout');
};

/**
 * Watches for changes in the global locale to re-translate the labels.
 */
watch(locale, translateHeaderLabels, { immediate: true });

/**
 * Navigates the user to the profile page.
 * @function
 */
const goToProfile = () => router.push('/profile');

/**
 * Logs out the user and navigates to the login page.
 * @function
 */
const logout = () => {
  authStore.logout(); // 3. Ejecutamos la acción de logout del store (limpia localStorage y estado)
  console.log('User logged out');
  router.push('/login');
};
</script>