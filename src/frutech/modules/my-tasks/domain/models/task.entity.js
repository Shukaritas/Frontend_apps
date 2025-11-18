/**
 * Validates the fields of a task object.
 * @param {object} taskData - The task data to validate.
 * @param {number} taskData.id - The task's ID.
 * @param {string} taskData.description - The task's description.
 * @param {string} taskData.dueDate - The task's due date.
 * @param {string} taskData.field - The field associated with the task.
 * @throws {Error} If any validation fails.
 */
function validateTask({ id, description, dueDate, field }) {
    if (typeof id !== 'number') throw new Error('ID must be a number.');
    if (typeof description !== 'string' || description.length < 3) 
        throw new Error('Description must be at least 3 characters long.');
    if (typeof dueDate !== 'string' || !/^\d{2}\/\d{2}$/.test(dueDate)) 
        throw new Error('Due date must be in DD/MM format.');
    if (typeof field !== 'string' || field.length === 0) 
        throw new Error('Field is required.');
}

/**
 * @class Task
 * @classdesc Entity representing a task in the domain.
 */
export class Task {
    /**
     * Creates an instance of Task.
     * @param {object} taskData - The data to create the task.
     * @param {number} taskData.id - The task's ID.
     * @param {string} taskData.description - The task's description.
     * @param {string} taskData.dueDate - The task's due date (DD/MM format).
     * @param {string} taskData.field - The field associated with the task.
     * @param {boolean} [taskData.completed=false] - Whether the task is completed.
     */
    constructor({ id, description, dueDate, field, completed = false }) {
        validateTask({ id, description, dueDate, field });
        this.id = id;
        this.description = description;
        this.dueDate = dueDate;
        this.field = field;
        this.completed = completed;
    }

    /**
     * Marks the task as completed.
     */
    markAsCompleted() {
        this.completed = true;
    }

    /**
     * Marks the task as incomplete.
     */
    markAsIncomplete() {
        this.completed = false;
    }

    /**
     * Updates the task information.
     * @param {string} newDescription - The new description.
     * @param {string} newDueDate - The new due date.
     * @param {string} newField - The new field.
     */
    updateInformation(newDescription, newDueDate, newField) {
        if (newDescription) {
            if (typeof newDescription !== 'string' || newDescription.length < 3) {
                throw new Error('Description must be at least 3 characters long.');
            }
            this.description = newDescription;
        }
        if (newDueDate) {
            if (typeof newDueDate !== 'string' || !/^\d{2}\/\d{2}$/.test(newDueDate)) {
                throw new Error('Due date must be in DD/MM format.');
            }
            this.dueDate = newDueDate;
        }
        if (newField) {
            if (typeof newField !== 'string' || newField.length === 0) {
                throw new Error('Field is required.');
            }
            this.field = newField;
        }
    }

    /**
     * Checks if the task is overdue.
     * @returns {boolean} True if the task is overdue, false otherwise.
     */
    isOverdue() {
        const [day, month] = this.dueDate.split('/').map(Number);
        const year = new Date().getFullYear();
        const taskDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return taskDate < today;
    }

    /**
     * Gets the number of days until the task is due.
     * @returns {number} The number of days (negative if overdue).
     */
    getDaysUntilDue() {
        const [day, month] = this.dueDate.split('/').map(Number);
        const year = new Date().getFullYear();
        const taskDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = taskDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
