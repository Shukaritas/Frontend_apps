/**
 * @class TaskAssembler
 * @classdesc Handles the conversion (assembly) between the Task domain entity and its DTO.
 */
export class TaskAssembler {
    /**
     * Converts a Task entity to a plain DTO.
     * @param {import('../domain/models/task.entity').Task} taskEntity - The domain entity.
     * @returns {import('./task.dto').TaskDTO} The resulting DTO.
     */
    toDTO(taskEntity) {
        return {
            id: taskEntity.id,
            description: taskEntity.description,
            dueDate: taskEntity.dueDate,
            field: taskEntity.field,
            completed: taskEntity.completed,
            isOverdue: taskEntity.isOverdue(),
            daysUntilDue: taskEntity.getDaysUntilDue(),
        };
    }

    /**
     * Converts an array of Task entities to DTOs.
     * @param {Array<import('../domain/models/task.entity').Task>} taskEntities - Array of domain entities.
     * @returns {Array<import('./task.dto').TaskDTO>} Array of DTOs.
     */
    toDTOList(taskEntities) {
        return taskEntities.map((entity) => this.toDTO(entity));
    }
}
