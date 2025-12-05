/**
 * @class TaskRepository
 * @classdesc Defines the contract (interface) for task persistence operations.
 */
export class TaskRepository {
    /**
     * Gets all tasks.
     * @returns {Promise<Array<import('../models/task.entity').Task>>}
     */
    async getAll() {
        throw new Error('Method "getAll" must be implemented.');
    }

    /**
     * Gets a task by its ID.
     * @param {number} id - The task's ID.
     * @returns {Promise<import('../models/task.entity').Task>}
     */
    async getById(id) {
        throw new Error('Method "getById" must be implemented.');
    }

    /**
     * Creates a new task in the persistence layer.
     * @param {import('../models/task.entity').Task} task - The task entity to create.
     * @returns {Promise<import('../models/task.entity').Task>}
     */
    async create(task) {
        throw new Error('Method "create" must be implemented.');
    }

    /**
     * Updates a task in the persistence layer.
     * @param {import('../models/task.entity').Task} task - The task entity to update.
     * @returns {Promise<import('../models/task.entity').Task>}
     */
    async update(task) {
        throw new Error('Method "update" must be implemented.');
    }

    /**
     * Deletes a task by its ID.
     * @param {number} id - The ID of the task to delete.
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method "delete" must be implemented.');
    }
}
