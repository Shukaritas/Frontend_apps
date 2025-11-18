export class FieldAssembler {
  /**
   * Convierte un recurso de la API (FieldResource) al modelo de dominio.
   * FieldResource (API .NET) ejemplo:
   * { id, name, location, fieldSize, imageUrl, tasks: [ { id, description, dueDate, completed } ] }
   */
  static toModel(resource) {
    if (!resource) return null;
    return {
      id: resource.id,
      name: resource.name,
      location: resource.location,
      fieldSize: resource.fieldSize,
      imageUrl: resource.imageUrl || resource.image_url || '',
      status: resource.status || 'Healthy',
      cropName: resource.cropName || resource.crop || '',
      tasks: Array.isArray(resource.tasks)
        ? resource.tasks.map(t => ({
            id: t.id,
            description: t.description,
            dueDate: t.dueDate || t.due_date,
            completed: t.completed || false
          }))
        : []
    };
  }

  static toModels(resources) {
    return Array.isArray(resources) ? resources.map(r => this.toModel(r)) : [];
  }

  /** Prepara payload para creación/actualización (camelCase que espera backend) */
  static toPayload(model) {
    return {
      userId: model.userId || model.user_id, // permitir ambos
      name: model.name,
      location: model.location,
      fieldSize: model.fieldSize ?? model.size,
      imageUrl: model.imageUrl,
    };
  }
}