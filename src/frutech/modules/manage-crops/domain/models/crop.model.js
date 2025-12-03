
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
        if (field !== undefined && field !== null && typeof field !== 'string') {
            throw new Error('Field must be a string.');
        }
    }

    if (fieldId !== undefined && fieldId !== null && typeof fieldId !== 'number') throw new Error('Field ID must be a number.');
    if (typeof status !== 'string' || status.length === 0) throw new Error('Status is required.');
    if (typeof days !== 'string' || days.length === 0) throw new Error('Days is required.');
}


export class Crop {

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


    updateStatus(newStatus) {
        if (typeof newStatus !== 'string' || newStatus.length === 0) {
            throw new Error('Status is required.');
        }
        this.status = newStatus;
    }
}
