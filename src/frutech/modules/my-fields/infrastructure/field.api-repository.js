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

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
  }

  return null;
}

export class FieldApiRepository extends IFieldRepository {
  /**
   * Fetches all fields for the authenticated user from the API.
   */
  async getAll() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) throw new Error('User not authenticated');

    let userId;
    try {
      const parsed = JSON.parse(userRaw);
      userId = parsed?.id;
    } catch {
      throw new Error('Invalid user data');
    }

    if (userId === undefined || userId === null || (typeof userId === 'string' && userId.trim() === '')) {
      throw new Error('Invalid user ID');
    }

    const response = await http.get(`${FIELDS_ENDPOINT}/user/${userId}`);
    const data = Array.isArray(response.data) ? response.data : [];
    return FieldAssembler.toModels(data);
  }

  async getById(id) {
    try {
      const response = await http.get(`${FIELDS_ENDPOINT}/${id}`);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error retrieving field');
    }
  }

  async create(fieldData) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = fieldData.userId || user.id;

      const formData = new FormData();
      formData.append('Name', fieldData.name);
      formData.append('Location', fieldData.location);

      const size = fieldData.size ?? fieldData.fieldSize ?? fieldData.field_size;
      if (size !== undefined && size !== null) {
        formData.append('FieldSize', String(size));
      }

      if (userId !== undefined && userId !== null) {
        formData.append('UserId', String(userId));
      }

      if (fieldData.imageFile instanceof File || fieldData.imageFile instanceof Blob) {
        formData.append('Image', fieldData.imageFile);
      }

      const response = await http.post(FIELDS_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || 'Error creating field';
      throw new Error(message);
    }
  }

  async updateField(id, fieldData) {
    try {
      const payload = FieldAssembler.toPayload(fieldData);
      const response = await http.put(`${FIELDS_ENDPOINT}/${id}`, payload);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error updating field');
    }
  }

  /**
   * Updates the progress history record for a field.
   * @param {number} progressId - The ID of the progress record to update
   * @param {Object} progressData - Progress data containing:
   *   - watered: date in DD/MM/YYYY format or boolean
   *   - fertilized: date in DD/MM/YYYY format or boolean
   *   - pests: date in DD/MM/YYYY format or boolean
   * @returns {Promise<Object>} The updated progress record
   */
  async updateProgress(progressId, progressData) {
    try {
      const payload = {};

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
      const message = error?.response?.data?.message || error?.message || 'Error updating progress';
      throw new Error(message);
    }
  }

  /**
   * Creates a new task associated with a field.
   * @param {Object} taskPayload - Task data:
   *   - fieldId: Field ID (number)
   *   - description: Task description (string)
   *   - dueDate: Due date in ISO format YYYY-MM-DD (string)
   * @returns {Promise<Object>} The created task
   */
  async addNewTask(taskPayload) {
    try {
      const payload = {
        FieldId: Number(taskPayload.fieldId),
        Description: taskPayload.description,
        DueDate: taskPayload.dueDate
      };

      const response = await http.post(TASKS_ENDPOINT, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Error creating task';
      throw new Error(message);
    }
  }
}