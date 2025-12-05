import { defineStore } from 'pinia';
import { ref } from 'vue';
import { FieldApiRepository } from '../infrastructure/field.api-repository.js';
import { useDashboardStore } from '@/frutech/modules/dashboard/stores/dashboard.store.js';
import { useAuthStore } from '@/stores/auth.store.js';

/**
 * Convierte fecha DD/MM a formato ISO YYYY-MM-DD usando el año actual
 * @param {string} dateStr - Fecha en formato DD/MM
 * @returns {string} Fecha en formato ISO YYYY-MM-DD
 */
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
      error.value = 'Could not load fields.';
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
      if (!currentField.value) throw new Error('Field not found');
    } catch (e) {
      error.value = 'Could not load field information.';
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
      error.value = 'No se pudo guardar el campo.';
      console.error(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }
  async function updateFieldProgress(fieldId, newProgress) {
    isLoading.value = true;
    error.value = null;
    try {
      if (!currentField.value || currentField.value.id !== fieldId) {
        await fetchFieldById(fieldId);
      }

      const progressHistoryId = currentField.value.progressHistoryId;

      if (!progressHistoryId) {
        throw new Error('No se encontró un registro de progreso para actualizar');
      }

      await fieldRepository.updateProgress(progressHistoryId, {
        watered: newProgress.watered ?? false,
        fertilized: newProgress.fertilized ?? false,
        pests: newProgress.pests ?? false
      });

      await fetchFieldById(fieldId);
    } catch (e) {
      error.value = 'No se pudo actualizar el progreso del campo.';
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
      const isoDate = convertShortDateToISO(taskData.date);

      const payload = {
        fieldId: fieldId,
        description: taskData.task,
        dueDate: isoDate
      };

      const newTaskFromBackend = await fieldRepository.addNewTask(payload);

      if (currentField.value) {
        const currentTasks = currentField.value.tasks || [];

        const newTaskForView = {
          id: newTaskFromBackend.id ?? newTaskFromBackend.Id,
          description: newTaskFromBackend.description ?? newTaskFromBackend.Description,
          dueDate: newTaskFromBackend.dueDate ?? newTaskFromBackend.DueDate,
          date: taskData.date,
          completed: newTaskFromBackend.completed ?? newTaskFromBackend.Completed ?? false,
          name: taskData.name,
          task: taskData.task
        };

        currentField.value = {
          ...currentField.value,
          tasks: [...currentTasks, newTaskForView]
        };
      }
    } catch (e) {
      error.value = 'No se pudo agregar la tarea.';
      console.error(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateFieldCropInfo(fieldId, cropData) {
    isLoading.value = true;
    error.value = null;
    try {
      await fieldRepository.updateField(fieldId, cropData);
      if (currentField.value && currentField.value.id === fieldId) {
        currentField.value = { ...currentField.value, ...cropData };
      }
    } catch (e) {
      error.value = 'No se pudo actualizar la información del cultivo en el campo.';
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
    updateFieldCropInfo
  };
});