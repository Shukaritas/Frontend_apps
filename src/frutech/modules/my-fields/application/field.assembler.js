/**
 * Converts an ISO date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) to display format DD/MM/YYYY.
 * @param {string} isoDate - Date in ISO format
 * @returns {string} Date in DD/MM/YYYY format or empty string if invalid
 */
function isoToDisplayDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string' || isoDate.trim() === '') {
    return '';
  }

  try {
    const datePart = isoDate.split('T')[0];

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
      return datePart;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }

    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
  }

  return '';
}

/**
 * Converts an ISO date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) to short format DD/MM.
 * @param {string} isoDate - Date in ISO format
 * @returns {string} Date in DD/MM format or empty string if invalid
 */
function isoToShortDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string' || isoDate.trim() === '') {
    return '';
  }

  try {
    const datePart = isoDate.split('T')[0];

    if (/^\d{2}\/\d{2}$/.test(datePart)) {
      return datePart;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}`;
    }

    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
  } catch (e) {
  }

  return '';
}

export class FieldAssembler {
  /**
   * Converts an API resource (FieldResource) to the domain model.
   * Supports multiple property naming conventions (camelCase, snake_case, PascalCase).
   * Handles both legacy and new backend formats for progress history and crop data.
   * @param {Object} resource - Raw resource object from the API
   * @returns {Object} Converted field model
   */
  static toModel(resource) {
    if (!resource) return null;

    let imageUrl = resource.imageUrl || resource.image_url || resource.ImageUrl;

    if (!imageUrl || imageUrl.trim() === '') {
      imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }

    const cropNameRaw = resource.cropName ?? resource.crop_name ?? resource.crop ?? '';
    const productRaw = resource.product ?? resource.cropName ?? resource.crop_name ?? resource.crop ?? '';

    const cropName = (typeof cropNameRaw === 'string' && cropNameRaw.trim() !== '') ? cropNameRaw : 'No Crop';
    const product = (typeof productRaw === 'string' && productRaw.trim() !== '') ? productRaw : 'No Crop';

    return {
      id: resource.id ?? resource.Id,
      name: resource.name ?? resource.Name,
      location: resource.location ?? resource.Location,

      fieldSize: resource.fieldSize ?? resource.field_size ?? resource.FieldSize,
      field_size: resource.fieldSize ?? resource.field_size ?? resource.FieldSize,

      imageUrl: imageUrl,

      status: resource.cropStatus ?? resource.crop_status ?? resource.status ?? resource.Status ?? 'Healthy',

      crop: cropName,
      cropName: cropName,
      product: product,

      soilType: resource.soilType ?? resource.soil_type ?? resource['Soil Type'] ?? '',
      sunlight: resource.sunlight ?? '',
      watering: resource.watering ?? '',

      plantingDate: resource.plantingDate ?? resource.planting_date ?? '',
      planting_date: resource.plantingDate ?? resource.planting_date ?? '',

      expectingHarvest: resource.harvestDate ?? resource.harvest_date ?? resource.expectingHarvest ?? resource.expecting_harvest ?? '',
      expecting_harvest: resource.harvestDate ?? resource.harvest_date ?? resource.expecting_harvest ?? '',

      daysSincePlanting: resource.daysSincePlanting ?? resource.days_since_planting ?? 0,
      days_since_planting: resource.daysSincePlanting ?? resource.days_since_planting ?? 0,

      progress_history: (() => {
        const progressData = resource.progressHistory ?? resource.progress_history;

        if (Array.isArray(progressData)) {
          return progressData.map(p => ({
            id: p.id ?? p.Id,
            date: p.date ?? p.Date ?? new Date().toISOString(),
            watered: isoToDisplayDate(p.watered ?? p.Watered) || '',
            fertilized: isoToDisplayDate(p.fertilized ?? p.Fertilized) || '',
            pests: isoToDisplayDate(p.pests ?? p.Pests) || ''
          }));
        }

        if (progressData && typeof progressData === 'object' && !Array.isArray(progressData)) {
          return [{
            id: progressData.id ?? progressData.Id,
            date: progressData.date ?? progressData.Date ?? new Date().toISOString(),
            watered: isoToDisplayDate(progressData.watered ?? progressData.Watered) || '',
            fertilized: isoToDisplayDate(progressData.fertilized ?? progressData.Fertilized) || '',
            pests: isoToDisplayDate(progressData.pests ?? progressData.Pests) || ''
          }];
        }

        return [];
      })(),

      progressHistoryId: (() => {
        if (resource.progressHistoryId ?? resource.progress_history_id ?? resource.ProgressHistoryId) {
          return resource.progressHistoryId ?? resource.progress_history_id ?? resource.ProgressHistoryId;
        }

        const progressData = resource.progressHistory ?? resource.progress_history;

        if (progressData && typeof progressData === 'object' && !Array.isArray(progressData)) {
          return progressData.id ?? progressData.Id ?? null;
        }

        if (Array.isArray(progressData) && progressData.length > 0) {
          const lastItem = progressData[progressData.length - 1];
          return lastItem?.id ?? lastItem?.Id ?? null;
        }

        return null;
      })(),

      tasks: Array.isArray(resource.tasks)
        ? resource.tasks.map(t => {
            const rawDueDate = t.dueDate || t.due_date || t.DueDate || t.date;
            return {
              id: t.id ?? t.Id,
              description: t.description ?? t.Description,
              dueDate: rawDueDate,
              date: isoToShortDate(rawDueDate),
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

  /**
   * Prepares a payload for create or update operations (camelCase format expected by backend).
   * @param {Object} model - The field model to convert
   * @returns {Object} API payload object
   */
  static toPayload(model) {
    return {
      userId: model.userId || model.user_id,
      name: model.name,
      location: model.location,
      fieldSize: model.fieldSize ?? model.size,
      imageUrl: model.imageUrl,
    };
  }
}