import { IFieldRepository } from "@/frutech/modules/my-fields/domain/model/field.respository.js";
import { FieldAssembler } from "@/frutech/modules/my-fields/application/field.assembler.js";
import http from '@/services/http-common.js';

const FIELDS_ENDPOINT = import.meta.env.VITE_ENDPOINT_FIELDS;
const PROGRESS_ENDPOINT = import.meta.env.VITE_ENDPOINT_PROGRESS;
const TASKS_ENDPOINT = import.meta.env.VITE_ENDPOINT_TASKS;

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
    console.warn('Error parsing date:', dateStr, e);
  }

  return null;
}

export class FieldApiRepository extends IFieldRepository {
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

      const formData = new FormData();
      formData.append('Name', fieldData.name);
      formData.append('Location', fieldData.location);

      const size = fieldData.size ?? fieldData.fieldSize ?? fieldData.field_size;
      if (size !== undefined && size !== null) {
        formData.append('FieldSize', String(size));
      }

      if (userId) {
        formData.append('UserId', String(userId));
      }

      if (fieldData.imageFile) {
        formData.append('ImageFile', fieldData.imageFile);
      }

      const response = await http.post(FIELDS_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error creando campo');
    }
  }

  async addProgress(fieldId, progressData) {
    const isoDate = convertToISO(progressData.date);
    if (!isoDate) {
      throw new Error('Formato de fecha inválido. Use DD/MM/YYYY.');
    }
    const payload = {
      fieldId: parseInt(fieldId, 10),
      progressDate: isoDate,
      description: progressData.description,
      status: progressData.status,
    };
    const response = await http.post(PROGRESS_ENDPOINT, payload);
    return response.data;
  }

  async getTasksForField(fieldId) {
    const response = await http.get(`${TASKS_ENDPOINT}/field/${fieldId}`);
    return response.data;
  }
}