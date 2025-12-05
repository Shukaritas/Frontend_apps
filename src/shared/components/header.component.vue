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
 * @description The main application header containing sidebar toggle, language switcher, and user action buttons.
 */
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLayoutStore } from '@/stores/layout.store';
import { useAuthStore } from '@/stores/auth.store';
import LanguageSwitcher from './language-switcher.component.vue';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const layoutStore = useLayoutStore();
const authStore = useAuthStore();
const router = useRouter();
const { t, locale } = useI18n({ useScope: 'global' });

/**
 * @type {import('vue').Ref<string>}
 * Reactive reference for the translated "Profile" button label.
 */
const profileLabel = ref('');

/**
 * @type {import('vue').Ref<string>}
 * Reactive reference for the translated "Log Out" button label.
 */
const logoutLabel = ref('');

/**
 * Translates header button labels based on the current locale.
 */
const translateHeaderLabels = () => {
  if (typeof locale.value !== 'string') return;
  profileLabel.value = t('header.profile');
  logoutLabel.value = t('header.logout');
};

/**
 * Watches for locale changes to re-translate labels.
 */
watch(locale, translateHeaderLabels, { immediate: true });

/**
 * Navigates the user to the profile page.
 */
const goToProfile = () => router.push('/profile');

/**
 * Logs out the user and navigates to the login page.
 */
const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>