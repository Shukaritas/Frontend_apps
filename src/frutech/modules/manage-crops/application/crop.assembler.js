/**
 * @class CropAssembler
 * @classdesc Handles the conversion (assembly) between the Crop domain entity and its DTO.
 * @author Jefferson Castro
 */
export class CropAssembler {
    /**
     * Converts a Crop entity to a plain DTO.
     * @param {import('../domain/models/crop.model').Crop} cropEntity - The domain entity.
     * @returns {import('./crop.dto').CropDTO} The resulting DTO.
     */
    toDTO(cropEntity) {
        return {
            id: cropEntity.id,
            title: cropEntity.title,
            planting_date: cropEntity.planting_date,
            harvest_date: cropEntity.harvest_date,
            field: cropEntity.field,
            status: cropEntity.status,
            days: cropEntity.days
        };
    }

    /**
     * Converts multiple Crop entities to DTOs.
     * @param {Array<import('../domain/models/crop.model').Crop>} cropEntities - The domain entities.
     * @returns {Array<import('./crop.dto').CropDTO>} The resulting DTOs.
     */
    toDTOs(cropEntities) {
        return cropEntities.map(crop => this.toDTO(crop));
    }
}
