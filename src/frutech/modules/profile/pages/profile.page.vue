<template>
  <div class="profile-page p-3 md:p-4">
    <Toast />
    <ConfirmDialog group="danger" />

    <div class="flex align-items-center mb-4">
      <Button icon="pi pi-arrow-left" class="p-button-text p-button-secondary mr-2" @click="router.back()" />
      <h1 class="text-2xl md:text-3xl font-bold m-0">{{ t('profile.title') }}</h1>
    </div>

    <div v-if="userProfileStore.isLoading" class="text-center p-5"><ProgressSpinner /></div>
    <div v-else-if="userProfileStore.error" class="text-center p-5 text-red-500">{{ userProfileStore.error }}</div>

    <div v-else-if="userProfileStore.profile" class="grid">
      <div class="col-12 lg:col-8">
        <PersonalInformationCard :profile="userProfileStore.profile" @save="onUpdateProfile" />
      </div>
      <div class="col-12 lg:col-4">
        <ChangePasswordCard @save="onChangePassword" />
      </div>
      <div class="col-12 mt-4">
        <Card>
          <template #title><h3 class="m-0">{{ t('profile.settings') }}</h3></template>
          <template #content>
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round">
                <span>{{ t('profile.notifications') }}</span>
                <ToggleSwitch v-model="preferences.notifications" />
              </div>
              <div class="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round">
                <span>{{ t('profile.location') }}</span>
                <ToggleSwitch v-model="preferences.location" />
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 flex flex-column md:flex-row justify-content-end gap-3 mt-4">
        <Button :label="t('profile.logout')" icon="pi pi-sign-out" class="p-button-text p-button-secondary" @click="logout" />
        <Button :label="t('profile.deleteAccount')" icon="pi pi-trash" class="p-button-danger p-button-text" @click="confirmDelete" />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file Profile Page Component
 * @description This page serves as the main user profile interface, allowing users to view and edit
 * their personal information, change their password, and manage account settings. It orchestrates
 * child components and communicates with the Pinia store for state management.
 * @author Estefano Solis
 */
import { onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import PersonalInformationCard from '../components/personal-information-card.component.vue';
import ChangePasswordCard from '../components/change-password-card.component.vue';
import ProgressSpinner from 'primevue/progressspinner';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

import { useUserProfileStore } from '../stores/user-profile.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLayoutStore } from '@/stores/layout.store';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const { t } = useI18n({ useScope: 'global' });
const userProfileStore = useUserProfileStore();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();

const preferences = reactive({ notifications: false, location: false });

onMounted(() => {
  const storeUserId = authStore?.user?.id;
  let id = storeUserId;

  if (!id) {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      id = parsed?.id || null;
    } catch (_) {
      id = null;
    }
  }

  if (!id) {
    router.push('/login');
    return;
  }

  userProfileStore.fetchProfile(id);

  preferences.location = !!layoutStore.isLocationPublic;
});

watch(() => preferences.location, (val) => {
  layoutStore.toggleLocationPrivacy(val);
});

/**
 * Handles the profile update event from the child component.
 * @param {object} data - The profile data to update.
 */
const onUpdateProfile = async (data) => {
  try {
    const result = await userProfileStore.updateProfile(data);
    if (result?.emailChanged) {
      toast.add({ severity: 'info', summary: 'Info', detail: t('toast.emailChangedReLogin') || 'Email changed. Please log in again.', life: 3500 });
      router.push('/login');
      return;
    }
    toast.add({ severity: 'success', summary: 'Success', detail: t('toast.profileUpdated'), life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: t('toast.errorProfileUpdate'), life: 3000 });
  }
};

/**
 * Handles the password change event from the child component.
 * @param {object} data - The password data.
 */
const onChangePassword = async (data) => {
  try {
    await userProfileStore.changePassword(data);
    toast.add({ severity: 'success', summary: 'Success', detail: t('toast.passwordChanged'), life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: t(err.message), life: 3000 });
  }
};

/**
 * Logs out the user and redirects to the login page.
 */
const logout = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Logging out...', life: 1500 });
  router.push('/login');
};

/**
 * Displays a confirmation dialog before deleting the user's account.
 */
const confirmDelete = () => {
  confirm.require({
    group: 'danger',
    header: t('profile.deleteConfirmHeader'),
    message: t('profile.deleteConfirmMessage'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('profile.deleteAccept'),
    rejectLabel: t('profile.deleteReject'),
    accept: async () => {
      try {
        await userProfileStore.deleteAccount();
        toast.add({ severity: 'success', summary: 'Success', detail: t('toast.accountDeleted'), life: 3000 });
        router.push('/login');
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: t('toast.errorDeleteAccount'), life: 3000 });
      }
    },
  });
};
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
}
</style>