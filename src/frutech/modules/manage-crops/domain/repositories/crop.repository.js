/**
 * @class CropRepository
 * @classdesc Defines the contract (interface) for crop persistence operations.
 * @author Jefferson Castro
 */
export class CropRepository {
    /**
     * Gets all crops.
     * @returns {Promise<Array<import('../models/crop.model').Crop>>}
     */
    async getAll() {
        throw new Error('Method "getAll" must be implemented.');
    }

    /**
     * Gets a crop by its ID.
     * @param {number} id - The crop's ID.
     * @returns {Promise<import('../models/crop.model').Crop>}
     */
    async getById(id) {
        throw new Error('Method "getById" must be implemented.');
    }

    /**
     * Creates a new crop in the persistence layer.
     * @param {import('../models/crop.model').Crop} crop - The crop entity to create.
     * @returns {Promise<import('../models/crop.model').Crop>}
     */
    async create(crop) {
        throw new Error('Method "create" must be implemented.');
    }

    /**
     * Updates a crop in the persistence layer.
     * @param {import('../models/crop.model').Crop} crop - The crop entity to update.
     * @returns {Promise<import('../models/crop.model').Crop>}
     */
    async update(crop) {
        throw new Error('Method "update" must be implemented.');
    }

    /**
     * Deletes a crop by its ID.
     * @param {number} id - The ID of the crop to delete.
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method "delete" must be implemented.');
    }
}
