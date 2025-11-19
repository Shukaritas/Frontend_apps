export class FieldAssembler {
  /**
   * Convierte un recurso de la API (FieldResource) al modelo de dominio.
   * FieldResource (API .NET) ejemplo:
   * { id, name, location, fieldSize, imageUrl, tasks: [ { id, description, dueDate, completed } ] }
   *
   * NOTA: El backend ahora devuelve imageUrl en formato Base64 (data:image/...;base64,...)
   */
  static toModel(resource) {
    if (!resource) return null;

    // Priorizar imageUrl del backend (puede ser Base64 o URL)
    // Orden: imageUrl (camelCase) -> ImageUrl (PascalCase) -> image_url (snake_case)
    let imageUrl = resource.imageUrl || resource.ImageUrl || resource.image_url;

    // Si viene vacío, null o undefined, usar imagen por defecto
    if (!imageUrl || imageUrl.trim() === '') {
      imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }

    return {
      id: resource.id ?? resource.Id,
      name: resource.name ?? resource.Name,
      location: resource.location ?? resource.Location,
      fieldSize: resource.fieldSize ?? resource.FieldSize,
      imageUrl: imageUrl,
      status: resource.status || resource.Status || 'Healthy',
      cropName: resource.cropName || resource.CropName || resource.crop || '',
      tasks: Array.isArray(resource.tasks)
        ? resource.tasks.map(t => ({
            id: t.id ?? t.Id,
            description: t.description ?? t.Description,
            dueDate: t.dueDate || t.due_date || t.DueDate,
            completed: t.completed || t.Completed || false
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