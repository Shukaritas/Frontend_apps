/**
 * Validates the fields of a crop object.
 * @author Jefferson Castro
 * @param {object} cropData - The crop data to validate.
 * @param {number} cropData.id - The crop's ID.
 * @param {string} cropData.title - The crop's title/name.
 * @param {string} cropData.planting_date - The planting date.
 * @param {string} cropData.harvest_date - The harvest date.
 * @param {string} cropData.field - The field name.
 * @param {number} cropData.fieldId - The field ID (numeric).
 * @param {string} cropData.status - The crop status.
 * @param {string} cropData.days - The days since planting.
 * @param {string} cropData.soilType - The soil type (optional).
 * @param {string} cropData.sunlight - The sunlight conditions (optional).
 * @param {string} cropData.watering - The watering method (optional).
 * @throws {Error} If any validation fails.
 */
function validateCrop({ id, title, planting_date, harvest_date, field, fieldId, status, days, soilType, sunlight, watering }) {
    if (typeof id !== 'number') throw new Error('ID must be a number.');
    if (typeof title !== 'string' || title.length < 2) throw new Error('Title must be at least 2 characters long.');
    if (typeof planting_date !== 'string' || planting_date.length === 0) throw new Error('Planting date is required.');
    if (typeof harvest_date !== 'string' || harvest_date.length === 0) throw new Error('Harvest date is required.');

    const hasValidFieldId = typeof fieldId === 'number' && fieldId > 0;
    if (!hasValidFieldId) {
        if (typeof field !== 'string' || field.length < 2) {
            throw new Error('Field must be at least 2 characters long.');
        }
    } else {
        // Si hay fieldId, field puede ser cualquier string (incluso genérico como "Field #1")
        if (field !== undefined && field !== null && typeof field !== 'string') {
            throw new Error('Field must be a string.');
        }
    }

    if (fieldId !== undefined && fieldId !== null && typeof fieldId !== 'number') throw new Error('Field ID must be a number.');
    if (typeof status !== 'string' || status.length === 0) throw new Error('Status is required.');
    if (typeof days !== 'string' || days.length === 0) throw new Error('Days is required.');
    // soilType, sunlight, watering son opcionales, no los validamos estrictamente
}

/**
 * @class Crop
 * @classdesc Entity representing a crop in the domain.
 * @author Jefferson Castro
 */
export class Crop {
    /**
     * Creates an instance of Crop.
     * @param {object} cropData - The data to create the crop.
     * @param {number} cropData.id - The crop's ID.
     * @param {string} cropData.title - The crop's title/name.
     * @param {string} cropData.planting_date - The planting date.
     * @param {string} cropData.harvest_date - The harvest date.
     * @param {string} cropData.field - The field name.
     * @param {number} cropData.fieldId - The field ID (numeric).
     * @param {string} cropData.status - The crop status.
     * @param {string} cropData.days - The days since planting.
     * @param {string} cropData.soilType - The soil type (optional).
     * @param {string} cropData.sunlight - The sunlight conditions (optional).
     * @param {string} cropData.watering - The watering method (optional).
     */
    constructor({ id, title, planting_date, harvest_date, field, fieldId, status, days, soilType, sunlight, watering }) {
        validateCrop({ id, title, planting_date, harvest_date, field, fieldId, status, days, soilType, sunlight, watering });
        this.id = id;
        this.title = title;
        this.planting_date = planting_date;
        this.harvest_date = harvest_date;
        this.field = field;
        this.fieldId = fieldId;
        this.status = status;
        this.days = days;
        this.soilType = soilType || '';
        this.sunlight = sunlight || '';
        this.watering = watering || '';
    }

    /**
     * Updates the crop information.
     * @param {string} newTitle - The new title.
     * @param {string} newPlantingDate - The new planting date.
     * @param {string} newHarvestDate - The new harvest date.
     * @param {string} newField - The new field.
     * @param {number} newFieldId - The new field ID.
     * @param {string} newStatus - The new status.
     * @param {string} newDays - The new days.
     * @param {string} newSoilType - The new soil type (optional).
     * @param {string} newSunlight - The new sunlight (optional).
     * @param {string} newWatering - The new watering (optional).
     */
    updateInformation(newTitle, newPlantingDate, newHarvestDate, newField, newFieldId, newStatus, newDays, newSoilType, newSunlight, newWatering) {
        validateCrop({
            id: this.id,
            title: newTitle,
            planting_date: newPlantingDate,
            harvest_date: newHarvestDate,
            field: newField,
            fieldId: newFieldId,
            status: newStatus,
            days: newDays,
            soilType: newSoilType,
            sunlight: newSunlight,
            watering: newWatering
        });
        this.title = newTitle;
        this.planting_date = newPlantingDate;
        this.harvest_date = newHarvestDate;
        this.field = newField;
        this.fieldId = newFieldId;
        this.status = newStatus;
        this.days = newDays;
        this.soilType = newSoilType || '';
        this.sunlight = newSunlight || '';
        this.watering = newWatering || '';
    }

    /**
     * Updates the crop status.
     * @param {string} newStatus - The new status.
     */
    updateStatus(newStatus) {
        if (typeof newStatus !== 'string' || newStatus.length === 0) {
            throw new Error('Status is required.');
        }
        this.status = newStatus;
    }
}
