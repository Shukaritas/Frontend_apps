
function validateTask({ id, description, dueDate, field }) {
    if (typeof id !== 'number') throw new Error('ID must be a number.');
    if (typeof description !== 'string' || description.length < 3) 
        throw new Error('Description must be at least 3 characters long.');
    if (typeof dueDate !== 'string' || !/^\d{2}\/\d{2}$/.test(dueDate)) 
        throw new Error('Due date must be in DD/MM format.');
    if (typeof field !== 'string' || field.length === 0) 
        throw new Error('Field is required.');
}


export class Task {

    constructor({ id, description, dueDate, field, completed = false }) {
        validateTask({ id, description, dueDate, field });
        this.id = id;
        this.description = description;
        this.dueDate = dueDate;
        this.field = field;
        this.completed = completed;
    }


    markAsCompleted() {
        this.completed = true;
    }


    markAsIncomplete() {
        this.completed = false;
    }


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


    isOverdue() {
        const [day, month] = this.dueDate.split('/').map(Number);
        const year = new Date().getFullYear();
        const taskDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return taskDate < today;
    }


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
