import { IFieldRepository } from "@/frutech/modules/my-fields/domain/model/field.respository.js";
import { FieldAssembler } from "@/frutech/modules/my-fields/application/field.assembler.js";
import http from '@/services/http-common.js';

const FIELDS_ENDPOINT = import.meta.env.VITE_ENDPOINT_FIELDS;
const PROGRESS_ENDPOINT = import.meta.env.VITE_ENDPOINT_PROGRESS;
const TASKS_ENDPOINT = import.meta.env.VITE_ENDPOINT_TASKS;

/**
 * Convierte fecha DD/MM/YYYY a formato ISO YYYY-MM-DD
 * @param {string} dateStr - Fecha en formato DD/MM/YYYY o cualquier formato de fecha
 * @returns {string|null} Fecha en formato ISO YYYY-MM-DD o null si es inválida
 */
function convertToISO(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return null;
  }

  // Si ya viene en formato ISO (YYYY-MM-DD), retornarla
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0]; // Remover hora si existe
  }

  // Convertir DD/MM/YYYY a YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    // Validar que sean números válidos
    if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Intentar parsear como fecha JavaScript
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.warn('Error parsing date:', dateStr, e);
  }

  return null;
}

export class FieldApiRepository extends IFieldRepository {
  /**
   * Obtiene todos los campos del usuario autenticado usando únicamente el endpoint oficial.
   */
  async getAll() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) throw new Error('Usuario no autenticado');

    let userId;
    try {
      const parsed = JSON.parse(userRaw);
      userId = parsed?.id;
    } catch {
      throw new Error('Datos de usuario corruptos');
    }

    if (userId === undefined || userId === null || (typeof userId === 'string' && userId.trim() === '')) {
      throw new Error('ID de usuario inválido');
    }

    // Único intento: endpoint correcto. Si falla se deja que el store maneje el error.
    const response = await http.get(`${FIELDS_ENDPOINT}/user/${userId}`);
    const data = Array.isArray(response.data) ? response.data : [];
    return FieldAssembler.toModels(data);
  }

  async getById(id) {
    try {
      const response = await http.get(`${FIELDS_ENDPOINT}/${id}`);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error obteniendo campo');
    }
  }

  async create(fieldData) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = fieldData.userId || user.id;

      // Crear FormData con nombres PascalCase que espera el backend .NET
      const formData = new FormData();
      formData.append('Name', fieldData.name);
      formData.append('Location', fieldData.location);

      // El backend espera 'FieldSize' (PascalCase)
      const size = fieldData.size ?? fieldData.fieldSize ?? fieldData.field_size;
      if (size !== undefined && size !== null) {
        formData.append('FieldSize', String(size));
      }

      // UserId en PascalCase
      if (userId !== undefined && userId !== null) {
        formData.append('UserId', String(userId));
      }

      // CRUCIAL: El backend espera 'Image' (PascalCase) como IFormFile
      if (fieldData.imageFile instanceof File || fieldData.imageFile instanceof Blob) {
        formData.append('Image', fieldData.imageFile);
      }

      const response = await http.post(FIELDS_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || 'Error creando campo';
      throw new Error(message);
    }
  }

  async updateField(id, fieldData) {
    try {
      const payload = FieldAssembler.toPayload(fieldData);
      const response = await http.put(`${FIELDS_ENDPOINT}/${id}`, payload);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error actualizando campo');
    }
  }

  /**
   * Actualiza el historial de progreso de un campo.
   * @param {number} progressId - El ID del registro de progreso a actualizar
   * @param {object} progressData - Datos del progreso que pueden incluir:
   *   - watered: fecha en formato DD/MM/YYYY o booleano
   *   - fertilized: fecha en formato DD/MM/YYYY o booleano
   *   - pests: fecha en formato DD/MM/YYYY o booleano
   * @returns {Promise<object>} - El registro de progreso actualizado
   */
  async updateProgress(progressId, progressData) {
    try {
      // El backend espera UpdateProgressHistoryResource con propiedades en PascalCase
      // Las fechas deben estar en formato ISO (YYYY-MM-DD)
      const payload = {};

      // Convertir watered (puede ser fecha DD/MM/YYYY, fecha ISO, o booleano)
      if (progressData.watered !== undefined && progressData.watered !== null) {
        if (typeof progressData.watered === 'boolean') {
          payload.Watered = progressData.watered;
        } else if (typeof progressData.watered === 'string') {
          const isoDate = convertToISO(progressData.watered);
          payload.Watered = isoDate || progressData.watered;
        } else {
          payload.Watered = progressData.watered;
        }
      } else {
        payload.Watered = false;
      }

      // Convertir fertilized
      if (progressData.fertilized !== undefined && progressData.fertilized !== null) {
        if (typeof progressData.fertilized === 'boolean') {
          payload.Fertilized = progressData.fertilized;
        } else if (typeof progressData.fertilized === 'string') {
          const isoDate = convertToISO(progressData.fertilized);
          payload.Fertilized = isoDate || progressData.fertilized;
        } else {
          payload.Fertilized = progressData.fertilized;
        }
      } else {
        payload.Fertilized = false;
      }

      // Convertir pests
      if (progressData.pests !== undefined && progressData.pests !== null) {
        if (typeof progressData.pests === 'boolean') {
          payload.Pests = progressData.pests;
        } else if (typeof progressData.pests === 'string') {
          const isoDate = convertToISO(progressData.pests);
          payload.Pests = isoDate || progressData.pests;
        } else {
          payload.Pests = progressData.pests;
        }
      } else {
        payload.Pests = false;
      }

      const response = await http.put(`${PROGRESS_ENDPOINT}/${progressId}`, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Error actualizando progreso';
      throw new Error(message);
    }
  }

  /**
   * Crea una nueva tarea asociada a un campo.
   * @param {object} taskPayload - Datos de la tarea:
   *   - fieldId: ID del campo (number)
   *   - description: Descripción de la tarea (string)
   *   - dueDate: Fecha de vencimiento en formato ISO YYYY-MM-DD (string)
   * @returns {Promise<object>} - La tarea creada
   */
  async addNewTask(taskPayload) {
    try {
      // El backend espera CreateTaskResource con propiedades en PascalCase
      const payload = {
        FieldId: Number(taskPayload.fieldId),
        Description: taskPayload.description,
        DueDate: taskPayload.dueDate // Debe estar en formato ISO
      };

      // Nota: http-common ya tiene baseURL='/api', por lo que '/Tasks' resulta en '/api/Tasks'
      const response = await http.post(TASKS_ENDPOINT, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Error creando tarea';
      throw new Error(message);
    }
  }
}