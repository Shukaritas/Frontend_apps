import http from '@/services/http-common.js';
import { CropRepository } from '../domain/repositories/crop.repository';
import { Crop } from '../domain/models/crop.model';

/**
 * @class CropApiRepository
 * @classdesc Repository implementation that interacts with a REST API to manage crops.
 * @extends CropRepository
 */
export class CropApiRepository extends CropRepository {
    endpoint = '/v1/CropFields';

    /**
     * Maps API data to the Crop domain model.
     * Backend likely returns PascalCase or camelCase. We normalize to domain shape.
     */
    apiToDomain(apiData) {
        return new Crop({
            id: apiData.id ?? apiData.Id,
            title: apiData.cropType ?? apiData.CropType ?? apiData.title,
            planting_date: apiData.plantingDate ?? apiData.PlantingDate ?? apiData.planting_date,
            harvest_date: apiData.harvestDate ?? apiData.HarvestDate ?? apiData.harvest_date,
            field: apiData.fieldId ?? apiData.FieldId ?? apiData.field_id ?? apiData.field,
            status: apiData.status ?? apiData.Status,
            days: apiData.days ?? apiData.Days ?? apiData.days_since_planting ?? '0'
        });
    }

    /**
     * Maps a Crop domain entity to API payload.
     */
    domainToApi(domainData) {
        return {
            id: domainData.id,
            cropType: domainData.title,
            plantingDate: domainData.planting_date,
            harvestDate: domainData.harvest_date,
            fieldId: domainData.field,
            status: domainData.status,
            days: domainData.days
        };
    }

    /**
     * Gets all crops from the API.
     * @returns {Promise<Array<Crop>>} Array of crop entities.
     */
    async getAll() {
        const response = await http.get(this.endpoint);
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
