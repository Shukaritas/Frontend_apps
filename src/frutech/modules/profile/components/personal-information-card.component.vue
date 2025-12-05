<template>
  <Card>
    <template #title><h3 class="m-0">{{ t('profile.personalInfo') }}</h3></template>
    <template #content>
      <div class="field grid align-items-center">
        <label for="name" class="col-12 md:col-4">{{ t('profile.name') }}</label>
        <div class="col-12 md:col-8">
          <InputText id="name" v-model="localProfile.name" class="w-full" :disabled="!isEditing" :invalid="!!errors.name" />
          <small v-if="errors.name" class="p-error">{{ t(errors.name) }}</small>
        </div>
      </div>

      <div class="field grid align-items-center">
        <label for="email" class="col-12 md:col-4">{{ t('profile.email') }}</label>
        <div class="col-12 md:col-8">

          <InputText id="email" v-model="localProfile.email" class="w-full" :disabled="!isEditing" :invalid="!!errors.email" />
          <small v-if="errors.email" class="p-error">{{ t(errors.email) }}</small>
        </div>
      </div>

      <div class="field grid align-items-center">
        <label for="phone" class="col-12 md:col-4">{{ t('profile.phoneNumber') }}</label>
        <div class="col-12 md:col-8">
          <InputText id="phone" v-model="localProfile.phoneNumber" class="w-full" :disabled="!isEditing" :invalid="!!errors.phoneNumber" />
          <small v-if="errors.phoneNumber" class="p-error">{{ t(errors.phoneNumber) }}</small>
        </div>
      </div>

      <div class="field grid align-items-center">
        <label for="doc" class="col-12 md:col-4">{{ t('profile.identityDocument') }}</label>
        <div class="col-12 md:col-8">

          <InputText id="doc" v-model="localProfile.identificator" class="w-full" disabled />
        </div>
      </div>

      <div class="field grid align-items-center">
        <label class="col-12 md:col-4">{{ t('profile.role') }}</label>
        <div class="col-12 md:col-8">
          <InputText :model-value="roleLabel" class="w-full" disabled />
        </div>
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <Button v-if="!isEditing" :label="t('profile.editInfo')" icon="pi pi-pencil" @click="isEditing = true" />
        <template v-else>
          <Button :label="t('profile.cancel')" icon="pi pi-times" class="p-button-text" @click="cancelEdit" />
          <Button :label="t('profile.saveChanges')" icon="pi pi-check" @click="save" />
        </template>
      </div>
    </template>
  </Card>
</template>

<script setup>
/**
 * @author Estefano Solis
 */
import { ref, watch, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const { t } = useI18n({ useScope: 'global' });
const props = defineProps({ profile: Object });
const emit = defineEmits(['save']);

const isEditing = ref(false);
const localProfile = reactive({ ...props.profile });
const errors = reactive({});

/**
 * Computed property to get the role label based on roleId
 */
const roleLabel = computed(() => {
  const roleId = localProfile.roleId || 0;
  return t(`roles.${roleId}`);
});

watch(() => props.profile, (newVal) => {
  Object.assign(localProfile, newVal);
}, { deep: true, immediate: true });

/**
 * Validates the personal information form fields.
 * @returns {boolean} True if the form is valid.
 */
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  let isValid = true;

  if (!localProfile.name || localProfile.name.trim().length < 3) {
    errors.name = 'errors.nameLength';
    isValid = false;
  }

  if (!/^\+\d+$/.test(localProfile.phoneNumber || '')) {
    errors.phoneNumber = 'errors.phoneDigits';
    isValid = false;
  }

  const email = localProfile.email || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'errors.emailInvalid';
    isValid = false;
  }

  return isValid;
}

/**
 * Cancels editing and restores the original profile data.
 */
const cancelEdit = () => {
  Object.assign(localProfile, props.profile);
  isEditing.value = false;
  Object.keys(errors).forEach(key => delete errors[key]);
};

/**
 * Validates and emits the event to save profile changes.
 */
const save = () => {
  if (validate()) {
    emit('save', localProfile);
    isEditing.value = false;
  }
};
</script>

<style scoped>
.field.grid { margin-bottom: 1rem; }
label { font-weight: 500; color: #333; padding-right: 1rem; }
:deep(.p-inputtext) { background-color: #f0f0f0; border: 1px solid transparent; border-radius: 20px; padding-left: 1rem; padding-right: 1rem; }
:deep(.p-inputtext:enabled:focus) { background-color: #fff; border-color: #007bff; box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2); }
:deep(.p-inputtext:disabled) { opacity: 1; color: #333; }
.p-error { display: block; margin-top: 0.25rem; color: var(--p-red-500); }
@media (max-width: 767px) { .field.grid label { margin-bottom: 0.5rem; } }
</style>