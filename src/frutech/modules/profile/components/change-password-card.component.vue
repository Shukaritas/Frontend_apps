<template>
  <Card>
    <template #title><h3 class="m-0">{{ t('profile.changePassword') }}</h3></template>
    <template #content>
      <div class="grid formgrid p-fluid">
        <div class="field col-12">
          <label for="currentPass">{{ t('profile.currentPassword') }}</label>
          <Password id="currentPass" v-model="form.currentPassword" :feedback="false" toggleMask :invalid="!!errors.currentPassword" />
          <small v-if="errors.currentPassword" class="p-error">{{ t(errors.currentPassword) }}</small>
        </div>
        <div class="field col-12">
          <label for="newPass">{{ t('profile.newPassword') }}</label>
          <Password id="newPass" v-model="form.newPassword" toggleMask :invalid="!!errors.newPassword"/>
          <small v-if="errors.newPassword" class="p-error">{{ t(errors.newPassword) }}</small>
        </div>
        <div class="field col-12">
          <label for="confirmPass">{{ t('profile.confirmNewPassword') }}</label>
          <Password id="confirmPass" v-model="form.confirmPassword" :feedback="false" toggleMask :invalid="!!errors.confirmPassword" />
          <small v-if="errors.confirmPassword" class="p-error">{{ t(errors.confirmPassword) }}</small>
        </div>
      </div>
      <div class="flex justify-content-end mt-4">
        <Button :label="t('profile.saveChanges')" icon="pi pi-check" @click="save" />
      </div>
    </template>
  </Card>
</template>

<script setup>
/**
 * @author Estefano Solis
 */
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Password from 'primevue/password';
import Button from 'primevue/button';

const { t } = useI18n({ useScope: 'global' });
const emit = defineEmits(['save']);
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const errors = reactive({});

/**
 * Validates the change password form fields.
 * @returns {boolean} True if the form is valid.
 */
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  let isValid = true;
  if (!form.currentPassword) {
    errors.currentPassword = 'errors.requiredCurrentPass';
    isValid = false;
  }
  if (form.newPassword.length < 8) {
    errors.newPassword = 'errors.newPassLength';
    isValid = false;
  }
  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'errors.passwordsDontMatch';
    isValid = false;
  }
  return isValid;
}

/**
 * Validates and emits the event to save the new password.
 */
const save = () => {
  if (validate()) {
    emit('save', { ...form });
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
  }
};
</script>

<style scoped>
label { font-weight: 500; color: #6c757d; display: block; margin-bottom: 0.5rem; }
.p-error { display: block; margin-top: 0.25rem; color: var(--p-red-500); }
</style>