import http from '@/services/http-common.js';
import { CropRepository } from '../domain/repositories/crop.repository';
import { Crop } from '../domain/models/crop.model';

const CROP_FIELDS_ENDPOINT = import.meta.env.VITE_ENDPOINT_CROP_FIELDS;

<<<<<<< HEAD
=======
/**
 * Convierte fecha DD/MM/YYYY a formato ISO YYYY-MM-DD
 * @param {string} dateStr - Fecha en formato DD/MM/YYYY
 * @returns {string} Fecha en formato ISO YYYY-MM-DD
 */
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
function convertToISODate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    if (dateStr.includes('-') && dateStr.length === 10) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export class CropApiRepository extends CropRepository {
    endpoint = CROP_FIELDS_ENDPOINT;

    apiToDomain(apiData) {
        const fieldId = apiData.fieldId ?? apiData.FieldId ?? apiData.field_id;
        const fieldName = apiData.fieldName || apiData.field_name || (fieldId != null ? `Field #${fieldId}` : '');
        return new Crop({
            id: apiData.id ?? apiData.Id,
            title: apiData.cropType ?? apiData.CropType ?? apiData.crop ?? apiData.title,
            planting_date: apiData.plantingDate ?? apiData.PlantingDate ?? apiData.planting_date,
            harvest_date: apiData.harvestDate ?? apiData.HarvestDate ?? apiData.harvest_date,
            field: fieldName,
            fieldId: fieldId,
            status: apiData.status ?? apiData.Status,
            days: apiData.days ?? apiData.Days
        });
    }

    domainToApi(domainData) {
        return {
            id: domainData.id,
            cropType: domainData.title,
            plantingDate: convertToISODate(domainData.planting_date),
            harvestDate: convertToISODate(domainData.harvest_date),
            fieldId: domainData.fieldId,
            status: domainData.status
        };
    }

    async getAll() {
        const response = await http.get(this.endpoint);
        return response.data.map(this.apiToDomain);
    }

    async getById(id) {
        const response = await http.get(`${this.endpoint}/${id}`);
        return this.apiToDomain(response.data);
    }

    async create(crop) {
        const apiCrop = this.domainToApi(crop);
        const response = await http.post(this.endpoint, apiCrop);
        return this.apiToDomain(response.data);
    }

    async update(id, crop) {
        const apiCrop = this.domainToApi(crop);
        const response = await http.put(`${this.endpoint}/${id}`, apiCrop);
        return this.apiToDomain(response.data);
    }

    async delete(id) {
        await http.delete(`${this.endpoint}/${id}`);
    }
}
