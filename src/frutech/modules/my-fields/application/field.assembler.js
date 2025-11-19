/**
 * Convierte una fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss) a formato display DD/MM/YYYY
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha en formato DD/MM/YYYY o string vacío si es inválida
 */
function isoToDisplayDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string' || isoDate.trim() === '') {
    return '';
  }

  try {
    // Remover parte de hora si existe
    const datePart = isoDate.split('T')[0];

    // Si ya está en formato DD/MM/YYYY, retornar tal cual
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
      return datePart;
    }

    // Parsear formato ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }

    // Intentar parsear como Date
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    console.warn('Error converting date to display format:', isoDate, e);
  }

  return '';
}

/**
 * Convierte una fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss) a formato corto DD/MM
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha en formato DD/MM o string vacío si es inválida
 */
function isoToShortDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string' || isoDate.trim() === '') {
    return '';
  }

  try {
    // Remover parte de hora si existe
    const datePart = isoDate.split('T')[0];

    // Si ya está en formato DD/MM, retornar tal cual
    if (/^\d{2}\/\d{2}$/.test(datePart)) {
      return datePart;
    }

    // Parsear formato ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}`;
    }

    // Intentar parsear como Date
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
  } catch (e) {
    console.warn('Error converting date to short format:', isoDate, e);
  }

  return '';
}

export class FieldAssembler {
  /**
   * Convierte un recurso de la API (FieldResource) al modelo de dominio.
   *
   * NOTA IMPORTANTE: El backend ahora envía propiedades en snake_case y con datos del cultivo aplanados.
   * - imageUrl viene en formato Base64 (data:image/...;base64,...)
   * - Propiedades de cultivo están en el mismo nivel que el field
   * - progressHistory puede ser un objeto (nuevo formato) o un array (legacy)
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

      // Progress history - El backend ahora envía un objeto con fechas, la vista espera un array
      progress_history: (() => {
        // Intentar obtener progressHistory desde múltiples formatos
        const progressData = resource.progressHistory ?? resource.progress_history;

        // Si es un array (formato legacy), procesarlo como antes
        if (Array.isArray(progressData)) {
          return progressData.map(p => ({
            id: p.id ?? p.Id,
            date: p.date ?? p.Date ?? new Date().toISOString(),
            watered: isoToDisplayDate(p.watered ?? p.Watered) || '',
            fertilized: isoToDisplayDate(p.fertilized ?? p.Fertilized) || '',
            pests: isoToDisplayDate(p.pests ?? p.Pests) || ''
          }));
        }

        // Si es un objeto (nuevo formato del backend), convertirlo a array con un elemento
        if (progressData && typeof progressData === 'object' && !Array.isArray(progressData)) {
          return [{
            id: progressData.id ?? progressData.Id,
            date: progressData.date ?? progressData.Date ?? new Date().toISOString(),
            watered: isoToDisplayDate(progressData.watered ?? progressData.Watered) || '',
            fertilized: isoToDisplayDate(progressData.fertilized ?? progressData.Fertilized) || '',
            pests: isoToDisplayDate(progressData.pests ?? progressData.Pests) || ''
          }];
        }

        // Si no hay datos, retornar array vacío
        return [];
      })(),

      // ID del registro de progreso más reciente (para actualizaciones)
      // Prioridad: propiedad directa -> objeto progressHistory -> último elemento del array
      progressHistoryId: (() => {
        // 1. Intentar desde propiedad directa
        if (resource.progressHistoryId ?? resource.progress_history_id ?? resource.ProgressHistoryId) {
          return resource.progressHistoryId ?? resource.progress_history_id ?? resource.ProgressHistoryId;
        }

        const progressData = resource.progressHistory ?? resource.progress_history;

        // 2. Si es un objeto (nuevo formato), obtener su ID
        if (progressData && typeof progressData === 'object' && !Array.isArray(progressData)) {
          return progressData.id ?? progressData.Id ?? null;
        }

        // 3. Si es un array, obtener el ID del último elemento
        if (Array.isArray(progressData) && progressData.length > 0) {
          const lastItem = progressData[progressData.length - 1];
          return lastItem?.id ?? lastItem?.Id ?? null;
        }

        return null;
      })(),

      // Tareas asociadas
      tasks: Array.isArray(resource.tasks)
        ? resource.tasks.map(t => {
            const rawDueDate = t.dueDate || t.due_date || t.DueDate || t.date;
            return {
              id: t.id ?? t.Id,
              description: t.description ?? t.Description,
              dueDate: rawDueDate, // Mantener formato ISO para lógica interna
              date: isoToShortDate(rawDueDate), // Formato legible DD/MM para la UI
              completed: t.completed || t.Completed || false,
              name: t.name ?? t.fieldName ?? t.field_name ?? '',
              task: t.description ?? t.Description ?? t.task ?? ''
            };
          })
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