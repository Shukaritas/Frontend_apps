import apiClient from '@/services/http-common.js';
import { TaskRepository } from '../domain/repositories/task.repository';
import { Task } from '../domain/models/task.entity';

const TASKS_ENDPOINT = import.meta.env.VITE_ENDPOINT_TASKS;

function isoToDDMM(iso) {
  if (!iso) return '01/01';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '01/01';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function ddmmToISO(ddmm) {
  const [day, month] = String(ddmm || '').split('/').map(Number);
  const year = new Date().getFullYear();
  return new Date(year, (month || 1) - 1, day || 1).toISOString();
}


export class TaskApiRepository extends TaskRepository {

  apiToDomain(apiData) {
    let fieldValue = apiData.fieldName ?? apiData.FieldName ?? apiData.field_name ??
                     apiData.field?.name ?? apiData.field;

    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      fieldValue = 'Campo Desconocido';
    }

    return new Task({
      id: apiData.id ?? apiData.Id,
      description: apiData.description ?? apiData.Description,
      dueDate: isoToDDMM(apiData.dueDate ?? apiData.DueDate ?? apiData.due_date),
      field: fieldValue,
      completed: Boolean(apiData.completed ?? apiData.Completed ?? false),
    });
  }


  domainToApi(domainData) {
    return {
      id: domainData.id,
      description: domainData.description,
      dueDate: ddmmToISO(domainData.dueDate),
      fieldId: domainData.fieldId || domainData.field_id,
      completed: Boolean(domainData.completed),
    };
  }


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

    const response = await apiClient.get(`${TASKS_ENDPOINT}/user/${userId}`);
    return Array.isArray(response.data) ? response.data.map(d => this.apiToDomain(d)) : [];
  }


  async getById(id) {
    const response = await apiClient.get(`${TASKS_ENDPOINT}/${id}`);
    return this.apiToDomain(response.data);
  }


  async create(task) {
    const payload = this.domainToApi(task);
    const response = await apiClient.post(TASKS_ENDPOINT, payload);
    return this.apiToDomain(response.data);
  }


  async update(task) {
    const payload = this.domainToApi(task);
    const response = await apiClient.put(`${TASKS_ENDPOINT}/${task.id}`, payload);
    return this.apiToDomain(response.data);
  }

  async updateCompletion(task) {
    const response = await apiClient.put(`${TASKS_ENDPOINT}/${task.id}`, { completed: task.completed });
    return this.apiToDomain(response.data);
  }


  async delete(id) {
    await apiClient.delete(`${TASKS_ENDPOINT}/${id}`);
  }


  async getByFieldId(fieldId) {
    const response = await apiClient.get(`${TASKS_ENDPOINT}/field/${fieldId}`);
    return Array.isArray(response.data) ? response.data.map(d => this.apiToDomain(d)) : [];
  }


  async getUpcomingTasks(userId, count = 3) {
    if (userId === undefined || userId === null || String(userId).trim() === '') {
      throw new Error('Invalid user ID');
    }
    const response = await apiClient.get(`${TASKS_ENDPOINT}/user/${userId}/upcoming/${count}`);
    return Array.isArray(response.data) ? response.data.map(d => this.apiToDomain(d)) : [];
  }
}
