import apiClient from '@/services/http-common.js';
import { TaskRepository } from '../domain/repositories/task.repository';
import { Task } from '../domain/models/task.entity';

// Se mantiene updateCompletion para casos futuros de toggle rápido aunque no se use aún

const TASKS_ENDPOINT = '/tasks';

function isoToDDMM(iso) {
  if (!iso) return '01/01';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '01/01';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function ddmmToISO(ddmm) {
  const [day, month] = ddmm.split('/').map(Number);
  const year = new Date().getFullYear();
  return new Date(year, month - 1, day).toISOString();
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
        return new Task({
            id: apiData.id,
            description: apiData.description,
            dueDate: isoToDDMM(apiData.dueDate || apiData.due_date),
            field: apiData.field?.name || apiData.field || apiData.fieldName || '—',
            completed: apiData.completed || false,
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
            fieldId: domainData.fieldId || domainData.field_id, // si se provee
            completed: domainData.completed || false,
        };
    }

    /**
     * Gets all tasks from the API.
     * @returns {Promise<Array<Task>>} Array of task entities.
     */
    async getAll() {
        const response = await apiClient.get(TASKS_ENDPOINT);
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
}
