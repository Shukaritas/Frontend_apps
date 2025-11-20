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
    return new Date().toISOString().split('T')[0]; // Fecha actual como fallback
  }

  // Si ya está en formato ISO, retornar
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  // Parsear DD/MM y agregar año actual
  const parts = dateStr.split('/');
  if (parts.length === 2) {
    const [day, month] = parts;
    const currentYear = new Date().getFullYear();
    if (day && month && !isNaN(day) && !isNaN(month)) {
      return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Si tiene 3 partes (DD/MM/YYYY), convertir normalmente
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Fallback: fecha actual
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
      // Verificar que tenemos el campo actual cargado
      if (!currentField.value || currentField.value.id !== fieldId) {
        await fetchFieldById(fieldId);
      }

      // Obtener el ID del registro de progreso más reciente
      const progressHistoryId = currentField.value.progressHistoryId;

      if (!progressHistoryId) {
        throw new Error('No se encontró un registro de progreso para actualizar');
      }

      // Usar el endpoint correcto: PUT /v1/progress/{id}
      await fieldRepository.updateProgress(progressHistoryId, {
        watered: newProgress.watered ?? false,
        fertilized: newProgress.fertilized ?? false,
        pests: newProgress.pests ?? false
      });

      // Recargar el campo completo desde el servidor para obtener los datos actualizados
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
      // Convertir fecha DD/MM a formato ISO YYYY-MM-DD
      const isoDate = convertShortDateToISO(taskData.date);

      // Preparar payload según CreateTaskResource del backend
      const payload = {
        fieldId: fieldId,
        description: taskData.task,
        dueDate: isoDate
      };

      // Crear la tarea en el backend
      const newTaskFromBackend = await fieldRepository.addNewTask(payload);

      // Actualizar el estado local agregando la nueva tarea
      if (currentField.value) {
        const currentTasks = currentField.value.tasks || [];

        // Transformar la respuesta del backend al formato que usa la vista
        const newTaskForView = {
          id: newTaskFromBackend.id ?? newTaskFromBackend.Id,
          description: newTaskFromBackend.description ?? newTaskFromBackend.Description,
          dueDate: newTaskFromBackend.dueDate ?? newTaskFromBackend.DueDate,
          date: taskData.date, // Mantener formato original para la vista
          completed: newTaskFromBackend.completed ?? newTaskFromBackend.Completed ?? false,
          name: taskData.name,
          task: taskData.task
        };

        // Actualizar el estado local sin hacer otra petición al servidor
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