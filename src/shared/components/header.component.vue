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


const profileLabel = ref('');

const logoutLabel = ref('');


const translateHeaderLabels = () => {
  if (typeof locale.value !== 'string') return;
  profileLabel.value = t('header.profile');
  logoutLabel.value = t('header.logout');
};


watch(locale, translateHeaderLabels, { immediate: true });


const goToProfile = () => router.push('/profile');


const logout = () => {
  authStore.logout();
  console.log('User logged out');
  router.push('/login');
};
</script>