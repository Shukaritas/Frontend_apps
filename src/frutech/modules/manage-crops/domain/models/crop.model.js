/**
 * Validates the fields of a crop object.
 * @author Jefferson Castro
 * @param {object} cropData - The crop data to validate.
 * @param {number} cropData.id - The crop's ID.
 * @param {string} cropData.title - The crop's title/name.
 * @param {string} cropData.planting_date - The planting date.
 * @param {string} cropData.harvest_date - The harvest date.
 * @param {string} cropData.field - The field name.
 * @param {string} cropData.status - The crop status.
 * @param {string} cropData.days - The days since planting.
 * @throws {Error} If any validation fails.
 */
function validateCrop({ id, title, planting_date, harvest_date, field, status, days }) {
    if (typeof id !== 'number') throw new Error('ID must be a number.');
    if (typeof title !== 'string' || title.length < 2) throw new Error('Title must be at least 2 characters long.');
    if (typeof planting_date !== 'string' || planting_date.length === 0) throw new Error('Planting date is required.');
    if (typeof harvest_date !== 'string' || harvest_date.length === 0) throw new Error('Harvest date is required.');
    if (typeof field !== 'string' || field.length < 2) throw new Error('Field must be at least 2 characters long.');
    if (typeof status !== 'string' || status.length === 0) throw new Error('Status is required.');
    if (typeof days !== 'string' || days.length === 0) throw new Error('Days is required.');
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
     * @param {string} cropData.status - The crop status.
     * @param {string} cropData.days - The days since planting.
     */
    constructor({ id, title, planting_date, harvest_date, field, status, days }) {
        validateCrop({ id, title, planting_date, harvest_date, field, status, days });
        this.id = id;
        this.title = title;
        this.planting_date = planting_date;
        this.harvest_date = harvest_date;
        this.field = field;
        this.status = status;
        this.days = days;
    }

    /**
     * Updates the crop information.
     * @param {string} newTitle - The new title.
     * @param {string} newPlantingDate - The new planting date.
     * @param {string} newHarvestDate - The new harvest date.
     * @param {string} newField - The new field.
     * @param {string} newStatus - The new status.
     * @param {string} newDays - The new days.
     */
    updateInformation(newTitle, newPlantingDate, newHarvestDate, newField, newStatus, newDays) {
        validateCrop({
            id: this.id,
            title: newTitle,
            planting_date: newPlantingDate,
            harvest_date: newHarvestDate,
            field: newField,
            status: newStatus,
            days: newDays
        });
        this.title = newTitle;
        this.planting_date = newPlantingDate;
        this.harvest_date = newHarvestDate;
        this.field = newField;
        this.status = newStatus;
        this.days = newDays;
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
