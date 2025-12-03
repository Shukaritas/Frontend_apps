import http from '@/services/http-common.js';
import { CropRepository } from '../domain/repositories/crop.repository';
import { Crop } from '../domain/models/crop.model';

const CROP_FIELDS_ENDPOINT = import.meta.env.VITE_ENDPOINT_CROP_FIELDS;

/**
 * Convierte fecha DD/MM/YYYY a formato ISO YYYY-MM-DD
 * @param {string} dateStr - Fecha en formato DD/MM/YYYY
 * @returns {string} Fecha en formato ISO YYYY-MM-DD
 */
function convertToISODate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';

    // Si ya viene en formato ISO, retornarla
    if (dateStr.includes('-') && dateStr.length === 10) return dateStr;

    // Convertir DD/MM/YYYY a YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * @class CropApiRepository
 * @classdesc Repository implementation that interacts with a REST API to manage crops.
 * @extends CropRepository
 */
export class CropApiRepository extends CropRepository {
    endpoint = CROP_FIELDS_ENDPOINT;

    /**
     * Maps API data to the Crop domain model.
     * Backend likely returns PascalCase or camelCase. We normalize to domain shape.
     *
     * IMPORTANTE: Si el backend no devuelve el nombre del campo (fieldName),
     * generamos un nombre genérico usando el fieldId para que la UI tenga algo que mostrar.
     */
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
            days: apiData.days ?? apiData.Days ?? apiData.days_since_planting ?? '0',
            soilType: apiData.soilType ?? apiData.SoilType ?? apiData.soil_type ?? '',
            sunlight: apiData.sunlight ?? apiData.Sunlight ?? '',
            watering: apiData.watering ?? apiData.Watering ?? ''
        });
    }

    /**
     * Maps a Crop domain entity to API payload (CreateCropFieldCommand).
     * IMPORTANTE: El backend espera propiedades en camelCase con estructura específica.
     */
    domainToApi(domainData) {
        return {
            fieldId: Number(domainData.fieldId), // DEBE ser número
            crop: domainData.title, // El backend espera "crop", no "cropType"
            soilType: domainData.soilType || '',
            sunlight: domainData.sunlight || '',
            watering: domainData.watering || '',
            status: domainData.status,
            plantingDate: convertToISODate(domainData.planting_date), // Convertir a ISO
            harvestDate: convertToISODate(domainData.harvest_date) // Convertir a ISO
        };
    }

    /**
     * Gets all crops from the API filtered by current user.
     * @returns {Promise<Array<Crop>>} Array of crop entities.
     */
    async getAll() {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) throw new Error('Usuario no autenticado');

        let userId;
        try {
            const parsed = JSON.parse(userRaw);
            userId = parsed?.id;
        } catch {
            throw new Error('Datos de usuario corruptos');
        }

        if (userId === undefined || userId === null || (typeof userId === 'string' && userId.trim() === '')) {
            throw new Error('ID de usuario inválido');
        }

        const response = await http.get(`${this.endpoint}/user/${userId}`);
        return Array.isArray(response.data) ? response.data.map(d => this.apiToDomain(d)) : [];
    }

    /**
     * Gets a crop by ID from the API.
     * @param {number} id - The crop's ID.
     * @returns {Promise<Crop>} The crop entity.
     */
    async getById(id) {
        const response = await http.get(`${this.endpoint}/${id}`);
        return this.apiToDomain(response.data);
    }

    /**
     * Creates a new crop by sending data to the API.
     * @param {Crop} crop - The crop entity to create.
     * @returns {Promise<Crop>} The created entity returned by the API.
     */
    async create(crop) {
        const payload = this.domainToApi(crop);
        const response = await http.post(this.endpoint, payload);
        return this.apiToDomain(response.data);
    }

    /**
     * Updates a crop by sending data to the API.
     * @param {Crop} crop - The crop entity to update.
     * @returns {Promise<Crop>} The updated entity returned by the API.
     */
    async update(crop) {
        const payload = this.domainToApi(crop);
        const response = await http.put(`${this.endpoint}/${crop.id}`, payload);
        return this.apiToDomain(response.data);
    }

    /**
     * Deletes a crop from the API.
     * @param {number} id - The ID of the crop to delete.
     * @returns {Promise<void>}
     */
    async delete(id) {
        await http.delete(`${this.endpoint}/${id}`);
    }
}
