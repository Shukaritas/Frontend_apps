import { defineStore } from 'pinia';
import { ref } from 'vue';
import { FieldApiRepository } from '../infrastructure/field.api-repository.js';
import { useDashboardStore } from '@/frutech/modules/dashboard/stores/dashboard.store.js';
import { useAuthStore } from '@/stores/auth.store.js';

function convertShortDateToISO(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date().toISOString().split('T')[0];
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  const parts = dateStr.split('/');
  if (parts.length === 2) {
    const [day, month] = parts;
    const currentYear = new Date().getFullYear();
    if (day && month && !isNaN(day) && !isNaN(month)) {
      return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  return new Date().toISOString().split('T')[0];
}

const fieldRepository = new FieldApiRepository();


export const useFieldStore = defineStore('fields', () => {
  const fields = ref([]);
  const currentField = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchFields() {
    isLoading.value = true;
    error.value = null;
    try {
      const allFields = await fieldRepository.getAll();
      fields.value = allFields;
    } catch (e) {
      error.value = 'No se pudieron cargar los campos.';
      console.error(e);
      fields.value = [];
    } finally {
      isLoading.value = false;
    }
  }
  async function fetchFieldById(id) {
    isLoading.value = true;
    error.value = null;
    currentField.value = null;
    try {
      currentField.value = await fieldRepository.getById(id);
      if (!currentField.value) throw new Error('Campo no encontrado');
    } catch (e) {
      error.value = 'No se pudo cargar la información del campo.';
      console.error(e);
      currentField.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createField(fieldData) {
    isLoading.value = true;
    error.value = null;
    try {
      const auth = useAuthStore();
      const userId = auth?.user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
      const payload = {
        userId,
        name: fieldData.name,
        location: fieldData.location,
        size: fieldData.size || fieldData.fieldSize,
        imageFile: fieldData.imageFile,
      };

      await fieldRepository.create(payload);
      await fetchFields();

      const dashboardStore = useDashboardStore();
      dashboardStore.fetchDashboardData();

    } catch (e) {
      error.value = 'No se pudo crear el campo.';
      console.error(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateFieldProgress(fieldId, progressData) {
    isLoading.value = true;
    error.value = null;
    try {
      await fieldRepository.addProgress(fieldId, progressData);
      await fetchFieldById(fieldId);
    } catch (e) {
      error.value = 'No se pudo actualizar el progreso.';
      console.error(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function addTaskToField(fieldId, taskData) {
    isLoading.value = true;
    error.value = null;
    try {
      const payload = {
        ...taskData,
        dueDate: convertShortDateToISO(taskData.date),
        fieldId: fieldId,
      };
      await fieldRepository.addTask(payload);
      await fetchFieldById(fieldId);
    } catch (e) {
      error.value = 'No se pudo agregar la tarea.';
      console.error(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    fields,
    currentField,
    isLoading,
    error,
    fetchFields,
    fetchFieldById,
    createField,
    updateFieldProgress,
    addTaskToField,
  };
});