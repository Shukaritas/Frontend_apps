export class FieldAssembler {
  /**
   * Convierte un recurso de la API (FieldResource) al modelo de dominio.
   *
   * NOTA IMPORTANTE: El backend ahora envía propiedades en snake_case y con datos del cultivo aplanados.
   * - imageUrl viene en formato Base64 (data:image/...;base64,...)
   * - Propiedades de cultivo están en el mismo nivel que el field
   */
  static toModel(resource) {
    if (!resource) return null;

    // Priorizar imageUrl del backend (puede ser Base64 o URL)
    // Orden: imageUrl (camelCase) -> image_url (snake_case) -> ImageUrl (PascalCase)
    let imageUrl = resource.imageUrl || resource.image_url || resource.ImageUrl;

    // Si viene vacío, null o undefined, usar imagen por defecto
    if (!imageUrl || imageUrl.trim() === '') {
      imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }

    return {
      // Propiedades básicas del field
      id: resource.id ?? resource.Id,
      name: resource.name ?? resource.Name,
      location: resource.location ?? resource.Location,

      // fieldSize con soporte para múltiples formatos
      fieldSize: resource.fieldSize ?? resource.field_size ?? resource.FieldSize,
      field_size: resource.fieldSize ?? resource.field_size ?? resource.FieldSize, // Legacy para compatibilidad con vistas antiguas

      imageUrl: imageUrl,

      // Status del cultivo (prioriza cropStatus del backend)
      status: resource.cropStatus ?? resource.crop_status ?? resource.status ?? resource.Status ?? 'Healthy',

      // Propiedades del cultivo aplanadas (nuevas desde el backend)
      crop: resource.cropName ?? resource.crop_name ?? resource.crop ?? '',
      cropName: resource.cropName ?? resource.crop_name ?? resource.crop ?? '',
      product: resource.cropName ?? resource.crop_name ?? resource.crop ?? resource.product ?? '', // Para compatibilidad

      // Información del cultivo - snake_case prioritario
      soilType: resource.soilType ?? resource.soil_type ?? resource['Soil Type'] ?? '',
      sunlight: resource.sunlight ?? '',
      watering: resource.watering ?? '',

      // Fechas del cultivo
      plantingDate: resource.plantingDate ?? resource.planting_date ?? '',
      planting_date: resource.plantingDate ?? resource.planting_date ?? '', // Legacy

      expectingHarvest: resource.harvestDate ?? resource.harvest_date ?? resource.expectingHarvest ?? resource.expecting_harvest ?? '',
      expecting_harvest: resource.harvestDate ?? resource.harvest_date ?? resource.expecting_harvest ?? '', // Legacy

      // Días desde plantación
      daysSincePlanting: resource.daysSincePlanting ?? resource.days_since_planting ?? 0,
      days_since_planting: resource.daysSincePlanting ?? resource.days_since_planting ?? 0, // Legacy

      // Progress history (opcional)
      progress_history: Array.isArray(resource.progressHistory)
        ? resource.progressHistory
        : (Array.isArray(resource.progress_history) ? resource.progress_history : []),

      // Tareas asociadas
      tasks: Array.isArray(resource.tasks)
        ? resource.tasks.map(t => ({
            id: t.id ?? t.Id,
            description: t.description ?? t.Description,
            dueDate: t.dueDate || t.due_date || t.DueDate,
            date: t.dueDate || t.due_date || t.DueDate || t.date, // Legacy para compatibilidad
            completed: t.completed || t.Completed || false,
            name: t.name ?? t.fieldName ?? t.field_name ?? '',
            task: t.description ?? t.Description ?? t.task ?? ''
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