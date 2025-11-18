import http from '@/services/http-common.js';
import { CropRepository } from '../domain/repositories/crop.repository';
import { Crop } from '../domain/models/crop.model';

/**
 * @class CropApiRepository
 * @classdesc Repository implementation that interacts with a REST API to manage crops.
 * @extends CropRepository
 * @author Jefferson Castro
 */
export class CropApiRepository extends CropRepository {
    endpoint = '/cropfields';

    /**
     * Maps API data to the Crop domain model.
     * @param {object} apiData - The raw data from the API.
     * @returns {Crop} An instance of the Crop entity.
     */
    apiToDomain(apiData) {
        return new Crop({
            id: apiData.id,
            title: apiData.crop_type || apiData.title,
            planting_date: apiData.planting_date,
            harvest_date: apiData.harvest_date,
            field: apiData.field_id || apiData.field,
            status: apiData.status,
            days: apiData.days || apiData.days_since_planting || '0'
        });
    }

    /**
     * Maps a Crop domain entity to a plain object for API submission.
     * @param {Crop} domainData - The domain entity.
     * @returns {object} A plain object compatible with the API.
     */
    domainToApi(domainData) {
        return {
            id: domainData.id,
            crop_type: domainData.title,
            planting_date: domainData.planting_date,
            harvest_date: domainData.harvest_date,
            field_id: domainData.field,
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
