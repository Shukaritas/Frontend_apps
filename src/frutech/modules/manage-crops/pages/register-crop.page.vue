<template>
  <div class="register-crop-page">
    <div class="header">
      <h1 class="title">{{ $t('registerCrop.title') }}</h1>
      <p class="subtitle">{{ $t('registerCrop.subtitle') }}</p>
    </div>

    <h3 class="section-title">{{ $t('registerCrop.cropInformation') }}</h3>

    <div class="form-grid">
      <div class="left">
        <div class="field">
          <InputText v-model="form.title" :placeholder="$t('registerCrop.cropTypePlaceholder')" class="w-full soft-input" :class="{'p-invalid': errors.title}" />
          <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
        </div>
        <div class="field">
          <InputText v-model="form.planting_date" :placeholder="$t('registerCrop.plantingDatePlaceholder')" class="w-full soft-input" :class="{'p-invalid': errors.planting_date}" />
          <small v-if="errors.planting_date" class="p-error">{{ errors.planting_date }}</small>
        </div>
        <div class="field">
          <InputText v-model="form.harvest_date" :placeholder="$t('registerCrop.harvestDatePlaceholder')" class="w-full soft-input" />
        </div>
        <div class="field">
          <Dropdown v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Selecciona estado" class="w-full" :class="{'p-invalid': errors.status}" />
          <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
        </div>
      </div>

      <div class="right">
        <InputText v-model="form.soilType" :placeholder="$t('registerCrop.soilTypePlaceholder')" class="w-full mb-3 soft-input" />
        <InputText v-model="form.sunlight" :placeholder="$t('registerCrop.sunlightPlaceholder')" class="w-full mb-3 soft-input" />
        <InputText v-model="form.watering" :placeholder="$t('registerCrop.wateringPlaceholder')" class="w-full soft-input" />
      </div>
    </div>

    <h3 class="section-title">{{ $t('registerCrop.chooseField') }}</h3>
    <small v-if="errors.field" class="p-error d-block mb-2">{{ errors.field }}</small>

    <div class="fields-grid">
      <div
          v-for="field in previewFieldsWithStatus"
          :key="field.id"
          class="field-card"
          :class="{ selected: form.field === field.title }"
          @click="selectField(field)"
      >
        <div class="image-wrapper">
          <img :src="field.image_url" :alt="field.title" />
          <Tag class="status-badge" :value="field.status" :severity="statusSeverity(field.status)" />
        </div>
        <div class="field-info">
          <div class="field-title">{{ field.title }}</div>
          <div class="field-details">{{ field.crop }} - {{ field.days }} Days</div>
        </div>
      </div>
      <div class="add-field-card" @click="goToNewField">
        <i class="pi pi-plus"></i>
      </div>
    </div>

    <div class="actions">
      <Button :label="$t('registerCrop.cancel')" class="p-button-text" @click="goBack" />
      <Button :label="$t('registerCrop.save')" class="p-button-success" @click="save" :loading="isSubmitting" />
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useCropStore } from '../stores/crop.store';
import { useFieldStore } from '@/frutech/modules/my-fields/stores/field.store.js';
import http from '@/services/http-common.js';

const router = useRouter();
const { t: $t } = useI18n();
const toast = useToast();
const cropStore = useCropStore();
const fieldStore = useFieldStore();

const isSubmitting = ref(false);
const form = ref({
  title: '',
  planting_date: '',
  harvest_date: '',
  field: '',
  status: '',
  days: '',
  soilType: '',
  sunlight: '',
  watering: ''
});
const errors = reactive({});
const selectedFieldId = ref(null);

const statusOptions = [
  { label: 'Saludable', value: 'Healthy' },
  { label: 'Atención', value: 'Attention' },
  { label: 'Crítico', value: 'Critical' }
];

const previewFieldsWithStatus = ref([]);

onMounted(async () => {
  try {
    // Obtener userId sin depender del store
    const userId = (() => {
      try { return JSON.parse(localStorage.getItem('user') || '{}').id; } catch { return null; }
    })();

    const getUserFields = async () => {
      if (!userId) return [];
      // 1) /fields/user/:userId
      try {
        const { data } = await http.get(`/fields/user/${userId}`);
        return Array.isArray(data) ? data : [];
      } catch (_) {
        // 2) /users/:userId/fields
        try {
          const { data } = await http.get(`/users/${userId}/fields`);
          return Array.isArray(data) ? data : [];
        } catch (_) {
          // 3) /fields?userId=:userId
          try {
            const { data } = await http.get('/fields', { params: { userId } });
            return Array.isArray(data) ? data : [];
          } catch (_) {
            return [];
          }
        }
      }
    };

    const [{ data: previews }, { data: statuses }, fields] = await Promise.all([
      http.get('/preview_fields'),
      http.get('/crop_status'),
      getUserFields()
    ]);

    const statusById = Object.fromEntries(statuses.map(s => [s.id, s.status]));
    const fieldById = Object.fromEntries(fields.map(f => [f.id, f]));

    previewFieldsWithStatus.value = previews.map(p => {
      const field = fieldById[p.id];
      return {
        ...p,
        status: statusById[p.id] || 'Healthy',
        crop: field?.crop || 'Desconocido',
        days: field?.days_since_planting || '0'
      };
    });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los campos.', life: 3000 });
  }
});

function selectField(field) {
  form.value.field = field.title;
  selectedFieldId.value = field.id;
  if (errors.field) delete errors.field;
}

function statusSeverity(status) {
  switch ((status || '').toLowerCase()) {
    case 'healthy': return 'success';
    case 'attention': return 'warning';
    case 'critical': return 'danger';
    default: return 'info';
  }
}

function goBack() {
  router.push({ name: 'ManageCrops' });
}

function goToNewField() {
  router.push({ name: 'field-new' });
}

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  let isValid = true;
  if (!form.value.title.trim() || form.value.title.length < 2) {
    errors.title = 'El tipo de cultivo es obligatorio (mín. 2 caracteres).';
    isValid = false;
  }
  if (!form.value.planting_date) {
    errors.planting_date = 'La fecha de siembra es obligatoria.';
    isValid = false;
  }
  if (!form.value.status) {
    errors.status = 'Debe seleccionar un estado.';
    isValid = false;
  }
  if (!selectedFieldId.value) {
    errors.field = 'Por favor, selecciona un campo de la lista.';
    isValid = false;
  }
  return isValid;
}


async function save() {
  if (!validateForm()) {
    toast.add({ severity: 'warn', summary: 'Revisar Formulario', detail: 'Por favor, complete los campos requeridos.', life: 3000 });
    return;
  }

  isSubmitting.value = true;

  const plantingDate = new Date(form.value.planting_date.split('/').reverse().join('-'));

  if (isNaN(plantingDate.getTime())) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Formato de fecha de siembra inválido. Usar DD/MM/YYYY.', life: 3000 });
    isSubmitting.value = false;
    return;
  }

  const today = new Date();
  const diffTime = today - plantingDate;
  const daysSincePlanting = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const harvestDate = form.value.harvest_date ? new Date(form.value.harvest_date.split('/').reverse().join('-')) : null;
  let totalCropDays = form.value.days || '0';
  if (plantingDate && harvestDate && !isNaN(harvestDate.getTime())) {
    const durationTime = harvestDate - plantingDate;
    totalCropDays = Math.ceil(durationTime / (1000 * 60 * 60 * 24)).toString();
  }

  try {
    const cropPayload = { ...form.value, days: totalCropDays };
    await cropStore.createCrop(cropPayload);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cultivo creado correctamente.', life: 2000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: `No se pudo crear el registro del cultivo: ${e.message}`, life: 4000 });
    isSubmitting.value = false;
    return;
  }

  try {
    const fieldUpdatePayload = {
      product: form.value.title,
      crop: form.value.title,
      days_since_planting: daysSincePlanting.toString(),
      planting_date: form.value.planting_date,
      expecting_harvest: form.value.harvest_date,
      "Soil Type": form.value.soilType,
      status: form.value.status,
      sunlight: form.value.sunlight,
      watering: form.value.watering,
    };

    await fieldStore.updateFieldCropInfo(selectedFieldId.value, fieldUpdatePayload);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Campo actualizado con la nueva información.', life: 3000 });

    router.push({ name: 'ManageCrops' });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'El cultivo fue creado, pero no se pudo actualizar el campo.', life: 4000 });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.register-crop-page {

  padding: 1.5rem;

}
.header {

  margin-bottom: 1.5rem;

}
.title {

  margin: 0 0 .25rem 0;
  font-size: 2rem;
  font-weight: 700;

}
.subtitle {

  margin: 0;
  color: #6c757d;

}
.section-title {

  margin: 1.25rem 0 .75rem 0;
  font-size: 1.1rem;
  font-weight: 700;

}
.form-grid {

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;

}
.soft-input { margin-bottom: 0 !important; }
.field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; }
.p-error { font-size: 0.875rem; }
.d-block { display: block; }
.mb-2 { margin-bottom: 0.5rem; }
.actions { margin-top: 2rem; display: flex; gap: .75rem; justify-content: flex-end; }
.fields-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: .5rem; }
.field-card { cursor: pointer; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,.08); border: 2px solid transparent; transition: border-color .2s ease; }
.field-card.selected { border-color: #2e7d32; }
.image-wrapper { position: relative; width: 100%; aspect-ratio: 4/3; overflow: hidden; border-radius: 12px 12px 0 0; }
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 12px 12px 0 0; }
.status-badge { position: absolute; left: .5rem; top: .5rem; }
.field-info { padding: .75rem 1rem; }
.field-title { font-weight: 600; color: #2c3e50; margin-bottom: .25rem; }
.field-details { font-size: .875rem; color: #6c757d; }
.add-field-card { display: flex; align-items: center; justify-content: center; border: 2px dashed #cfd8dc; border-radius: 16px; color: #90a4ae; min-height: 200px; cursor: pointer; }
.add-field-card i { font-size: 1.5rem; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
</style>