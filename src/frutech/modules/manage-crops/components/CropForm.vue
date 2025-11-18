<template>
  <Dialog 
    :visible="visible" 
    :header="isEditing ? $t('manageCrops.editCrop') : $t('manageCrops.newCrop')"
    :modal="true" 
    :style="{width: '500px'}"
    :closable="true"
    @hide="onHide"
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="onSubmit" class="crop-form">
      <div class="field">
        <label for="title" class="block text-900 font-medium mb-2">{{ $t('manageCrops.cropName') }} *</label>
        <InputText 
          id="title"
          v-model="formData.title" 
          :placeholder="$t('manageCrops.cropNamePlaceholder')"
          :class="{'p-invalid': errors.title}"
          class="w-full"
        />
        <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
      </div>

      <div class="field">
        <label for="planting_date" class="block text-900 font-medium mb-2">{{ $t('manageCrops.plantingDate') }} *</label>
        <InputText 
          id="planting_date"
          v-model="formData.planting_date" 
          :placeholder="$t('manageCrops.plantingDatePlaceholder')"
          :class="{'p-invalid': errors.planting_date}"
          class="w-full"
        />
        <small v-if="errors.planting_date" class="p-error">{{ errors.planting_date }}</small>
      </div>

      <div class="field">
        <label for="harvest_date" class="block text-900 font-medium mb-2">{{ $t('manageCrops.harvestDate') }} *</label>
        <InputText 
          id="harvest_date"
          v-model="formData.harvest_date" 
          :placeholder="$t('manageCrops.harvestDatePlaceholder')"
          :class="{'p-invalid': errors.harvest_date}"
          class="w-full"
        />
        <small v-if="errors.harvest_date" class="p-error">{{ errors.harvest_date }}</small>
      </div>

      <div class="field">
        <label for="field" class="block text-900 font-medium mb-2">{{ $t('manageCrops.field') }} *</label>
        <InputText 
          id="field"
          v-model="formData.field" 
          :placeholder="$t('manageCrops.fieldPlaceholder')"
          :class="{'p-invalid': errors.field}"
          class="w-full"
        />
        <small v-if="errors.field" class="p-error">{{ errors.field }}</small>
      </div>

      <div class="field">
        <label for="status" class="block text-900 font-medium mb-2">{{ $t('manageCrops.status') }} *</label>
        <Dropdown 
          id="status"
          v-model="formData.status" 
          :options="statusOptions"
          :placeholder="$t('manageCrops.selectStatus')"
          :class="{'p-invalid': errors.status}"
          class="w-full"
        />
        <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
      </div>

      <div class="field">
        <label for="days" class="block text-900 font-medium mb-2">{{ $t('manageCrops.days') }} *</label>
        <InputText 
          id="days"
          v-model="formData.days" 
          :placeholder="$t('manageCrops.daysPlaceholder')"
          :class="{'p-invalid': errors.days}"
          class="w-full"
        />
        <small v-if="errors.days" class="p-error">{{ errors.days }}</small>
      </div>
    </form>

    <template #footer>
      <Button 
        :label="$t('manageCrops.cancel')" 
        icon="pi pi-times" 
        @click="onCancel" 
        class="p-button-text"
      />
      <Button 
        :label="isEditing ? $t('manageCrops.update') : $t('manageCrops.create')" 
        icon="pi pi-check" 
        @click="onSubmit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  crop: {
    type: Object,
    default: null
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'submit', 'cancel']);
const { t: $t } = useI18n();

const formData = ref({
  title: '',
  planting_date: '',
  harvest_date: '',
  field: '',
  status: '',
  days: ''
});

const errors = ref({});

const statusOptions = computed(() => [
  { label: $t('manageCrops.statusHealthy'), value: 'Healthy' },
  { label: $t('manageCrops.statusAttention'), value: 'Attention' },
  { label: $t('manageCrops.statusCritical'), value: 'Critical' }
]);

const isEditing = computed(() => !!props.crop);


watch(() => props.crop, (newCrop) => {
  if (newCrop) {
    formData.value = {
      title: newCrop.title || '',
      planting_date: newCrop.planting_date || '',
      harvest_date: newCrop.harvest_date || '',
      field: newCrop.field || '',
      status: newCrop.status || '',
      days: newCrop.days || ''
    };
  } else {
    resetForm();
  }
}, { immediate: true });


watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    resetForm();
  }
});

function resetForm() {
  formData.value = {
    title: '',
    planting_date: '',
    harvest_date: '',
    field: '',
    status: '',
    days: ''
  };
  errors.value = {};
}

const validateForm = () => {
  errors.value = {};

  if (!formData.value.title.trim()) {
    errors.value.title = $t('manageCrops.validation.cropNameRequired');
  }

  if (!formData.value.planting_date.trim()) {
    errors.value.planting_date = $t('manageCrops.validation.plantingDateRequired');
  }

  if (!formData.value.harvest_date.trim()) {
    errors.value.harvest_date = $t('manageCrops.validation.harvestDateRequired');
  }

  if (!formData.value.field.trim()) {
    errors.value.field = $t('manageCrops.validation.fieldRequired');
  }

  if (!formData.value.status) {
    errors.value.status = $t('manageCrops.validation.statusRequired');
  }

  if (!formData.value.days.trim()) {
    errors.value.days = $t('manageCrops.validation.daysRequired');
  }

  return Object.keys(errors.value).length === 0;
};

const onSubmit = () => {
  if (validateForm()) {
    emit('submit', {
      ...formData.value,
      id: props.crop?.id
    });
  }
};

const onCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};

const onHide = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.crop-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
}
</style>
