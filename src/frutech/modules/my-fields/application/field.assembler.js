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
    console.warn('Error converting date to display format:', isoDate, e);
  }

  return '';
}

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
    console.warn('Error converting date to short format:', isoDate, e);
  }

  return '';
}

export class FieldAssembler {
  static toModel(resource) {
    if (!resource) return null;

    let imageUrl = resource.imageUrl || resource.image_url || resource.ImageUrl;

    if (!imageUrl || imageUrl.trim() === '') {
      imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }

    const cropName = resource.cropName || resource.crop_name || resource.CropName || 'Unknown Crop';
    const cropVariety = resource.cropVariety || resource.crop_variety || resource.CropVariety || '';

    const progressHistory = resource.progressHistory || resource.progress_history || [];
    let lastProgress = {};
    if (Array.isArray(progressHistory) && progressHistory.length > 0) {
      lastProgress = progressHistory[progressHistory.length - 1];
    } else if (typeof progressHistory === 'object' && progressHistory !== null && !Array.isArray(progressHistory)) {
      lastProgress = progressHistory;
    }

    return {
      id: resource.id,
      name: resource.name || resource.Name || `Field ${resource.id}`,
      location: resource.location || resource.Location || 'Unknown Location',
      soilType: resource.soilType || resource.soil_type || resource.SoilType || 'Unknown',
      ph: resource.ph ?? resource.Ph ?? 7.0,
      organicMatter: resource.organicMatter ?? resource.organic_matter ?? resource.OrganicMatter ?? 0,
      description: resource.description || resource.Description || '',
      imageUrl: imageUrl,
      crop: {
        name: cropName,
        variety: cropVariety,
        plantingDate: isoToDisplayDate(resource.plantingDate || resource.planting_date),
        harvestDate: isoToDisplayDate(resource.harvestDate || resource.harvest_date),
      },
      lastProgress: {
        date: isoToShortDate(lastProgress.date),
        description: lastProgress.description || 'No recent progress',
        status: lastProgress.status || 'info',
      },
      progressHistory: Array.isArray(progressHistory)
        ? progressHistory.map(p => ({
            date: isoToShortDate(p.date),
            description: p.description,
            status: p.status || 'info',
          }))
        : [],
    };
  }

  static toModelList(resources) {
    return resources.map(r => FieldAssembler.toModel(r));
  }
}