export class TaskAssembler {
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

    toDTOList(taskEntities) {
        return taskEntities.map((entity) => this.toDTO(entity));
    }
}
