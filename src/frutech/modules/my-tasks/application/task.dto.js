/**
 * @typedef {Object} TaskDTO
 * @property {number} id - The task's ID.
 * @property {string} description - The task's description.
 * @property {string} dueDate - The task's due date in DD/MM format.
 * @property {string} field - The field associated with the task.
 * @property {boolean} completed - Whether the task is completed.
 * @property {boolean} isOverdue - Whether the task is overdue.
 * @property {number} daysUntilDue - Days until the task is due (negative if overdue).
 */

/**
 * Data Transfer Object for Task.
 * Used to transfer task data between layers without exposing domain logic.
 */
export const TaskDTO = {};
