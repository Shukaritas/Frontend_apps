import { defineStore } from 'pinia';
import { ref } from 'vue';
import { FieldApiRepository } from '../infrastructure/field.api-repository.js';
import { useDashboardStore } from '@/frutech/modules/dashboard/stores/dashboard.store.js';
import { useAuthStore } from '@/stores/auth.store.js';
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
      fields.value = []; // limpiar lista para evitar estados inconsistentes
    } finally {
      isLoading.value = false;
    }
  }
  async function fetchFieldById(id) {
    isLoading.value = true;
    error.value = null;
    currentField.value = null; // asegurar estado limpio antes
    try {
      currentField.value = await fieldRepository.getById(id);
      if (!currentField.value) throw new Error('Campo no encontrado');
    } catch (e) {
      error.value = 'No se pudo cargar la información del campo.';
      console.error(e);
      currentField.value = null; // aseguramos nulidad en error
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
      const updatedField = await fieldRepository.updateField(fieldId, {
        progress_history: [newProgress]
      });
      currentField.value = updatedField;
    } catch (e) {
      error.value = 'Failed to update progress.';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function addTaskToField(fieldId, taskData) {
    isLoading.value = true;
    error.value = null;
    try {
      const newTaskInGlobalList = await fieldRepository.addNewTask({
        description: taskData.task,
        due_date: taskData.date,
        field: taskData.name
      });

      const currentTasks = currentField.value.tasks || [];
      const newTasksArray = [
        ...currentTasks,
        {
          id: newTaskInGlobalList.id,
          date: taskData.date,
          name: taskData.name,
          task: taskData.task,
        }
      ];

      const updatedField = await fieldRepository.updateField(fieldId, {
        tasks: newTasksArray
      });

      currentField.value = updatedField;
    } catch (e) {
      error.value = 'Failed to add task.';
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