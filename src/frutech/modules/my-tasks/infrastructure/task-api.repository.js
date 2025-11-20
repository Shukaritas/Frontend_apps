import apiClient from '@/services/http-common.js';
import { TaskRepository } from '../domain/repositories/task.repository';
import { Task } from '../domain/models/task.entity';

// NOTA: Backend real usa /api/Tasks (sin v1). BaseURL es /api, por lo tanto usamos "/Tasks".
const TASKS_ENDPOINT = '/Tasks';

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

/**
 * @class TaskApiRepository
 * @classdesc Repository implementation that interacts with a REST API to manage tasks.
 * @extends TaskRepository
 */
export class TaskApiRepository extends TaskRepository {
  /**
   * Maps API data to the Task domain model.
   * @param {object} apiData - The raw data from the API.
   * @returns {Task} An instance of the Task entity.
   */
  apiToDomain(apiData) {
    // Obtener el valor del campo con orden de prioridad
    let fieldValue = apiData.fieldName ?? apiData.FieldName ?? apiData.field_name ??
                     apiData.field?.name ?? apiData.field;

    // Si el valor es falsy o una cadena vacía después de trim, usar valor por defecto
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

  /**
   * Maps a Task domain entity to a plain object for API submission.
   * @param {Task} domainData - The domain entity.
   * @returns {object} A plain object compatible with the API.
   */
  domainToApi(domainData) {
    return {
      id: domainData.id,
      description: domainData.description,
      dueDate: ddmmToISO(domainData.dueDate),
      fieldId: domainData.fieldId || domainData.field_id,
      completed: Boolean(domainData.completed),
    };
  }

  /**
   * Gets all tasks from the API filtered by current user.
   * @returns {Promise<Array<Task>>} Array of task entities.
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

    const response = await apiClient.get(`${TASKS_ENDPOINT}/user/${userId}`);
    return Array.isArray(response.data) ? response.data.map(d => this.apiToDomain(d)) : [];
  }

  /**
   * Gets a task by ID from the API.
   * @param {number} id - The task's ID.
   * @returns {Promise<Task>} The task entity.
   */
  async getById(id) {
    const response = await apiClient.get(`${TASKS_ENDPOINT}/${id}`);
    return this.apiToDomain(response.data);
  }

  /**
   * Creates a new task via the API.
   * @param {Task} task - The task entity to create.
   * @returns {Promise<Task>} The created task entity.
   */
  async create(task) {
    const payload = this.domainToApi(task);
    const response = await apiClient.post(TASKS_ENDPOINT, payload);
    return this.apiToDomain(response.data);
  }

  /**
   * Updates a task via the API.
   * @param {Task} task - The task entity to update.
   * @returns {Promise<Task>} The updated task entity.
   */
  async update(task) {
    const payload = this.domainToApi(task);
    const response = await apiClient.put(`${TASKS_ENDPOINT}/${task.id}`, payload);
    return this.apiToDomain(response.data);
  }

  async updateCompletion(task) {
    const response = await apiClient.put(`${TASKS_ENDPOINT}/${task.id}`, { completed: task.completed });
    return this.apiToDomain(response.data);
  }

  /**
   * Deletes a task via the API.
   * @param {number} id - The ID of the task to delete.
   * @returns {Promise<void>}
   */
  async delete(id) {
    await apiClient.delete(`${TASKS_ENDPOINT}/${id}`);
  }

  /**
   * Gets tasks by field ID.
   * @param {number} fieldId - The field ID to filter tasks.
   * @returns {Promise<Array<Task>>} Array of task entities.
   */
  async getByFieldId(fieldId) {
    const response = await apiClient.get(`${TASKS_ENDPOINT}/field/${fieldId}`);
    return Array.isArray(response.data) ? response.data.map(d => this.apiToDomain(d)) : [];
  }

  /**
   * Gets the upcoming tasks for a user, limited by count.
   * @param {number|string} userId - The current user's ID.
   * @param {number} count - Max number of tasks to retrieve.
   * @returns {Promise<Array<Task>>}
   */
  async getUpcomingTasks(userId, count = 3) {
    if (userId === undefined || userId === null || String(userId).trim() === '') {
      throw new Error('Invalid user ID');
    }
    const response = await apiClient.get(`${TASKS_ENDPOINT}/user/${userId}/upcoming/${count}`);
    return Array.isArray(response.data) ? response.data.map(d => this.apiToDomain(d)) : [];
  }
}
