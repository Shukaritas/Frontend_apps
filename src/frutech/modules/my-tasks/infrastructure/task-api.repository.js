import axios from 'axios';
import apiClient from '@/services/http-common.js';
import { TaskRepository } from '../domain/repositories/task.repository';
import { Task } from '../domain/models/task.entity';

const TASK_ENDPOINT = import.meta.env.VITE_TASK_ENDPOINT_PATH;

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
            dueDate: apiData.due_date,
            field: apiData.field,
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
            due_date: domainData.dueDate,
            field: domainData.field,
        };
    }

    /**
     * Gets all tasks from the API.
     * @returns {Promise<Array<Task>>} Array of task entities.
     */
    async getAll() {
        const response = await apiClient.get(TASK_ENDPOINT);
        return response.data.map((item) => this.apiToDomain(item));
    }

    /**
     * Gets a task by ID from the API.
     * @param {number} id - The task's ID.
     * @returns {Promise<Task>} The task entity.
     */
    async getById(id) {
        const response = await apiClient.get(`${TASK_ENDPOINT}/${id}`);
        return this.apiToDomain(response.data);
    }

    /**
     * Creates a new task via the API.
     * @param {Task} task - The task entity to create.
     * @returns {Promise<Task>} The created task entity.
     */
    async create(task) {
        const apiData = this.domainToApi(task);
        const response = await apiClient.post(TASK_ENDPOINT, apiData);
        return this.apiToDomain(response.data);
    }

    /**
     * Updates a task via the API.
     * @param {Task} task - The task entity to update.
     * @returns {Promise<Task>} The updated task entity.
     */
    async update(task) {
        const apiData = this.domainToApi(task);
        const response = await apiClient.patch(`${TASK_ENDPOINT}/${task.id}`, apiData);
        return this.apiToDomain(response.data);
    }

    async updateCompletion(task) {
        const response = await apiClient.patch(`${TASK_ENDPOINT}/${task.id}`, {
            completed: task.completed,
        });
        return this.apiToDomain(response.data);
    }

    /**
     * Deletes a task via the API.
     * @param {number} id - The ID of the task to delete.
     * @returns {Promise<void>}
     */
    async delete(id) {
        await apiClient.delete(`${TASK_ENDPOINT}/${id}`);
    }
}
