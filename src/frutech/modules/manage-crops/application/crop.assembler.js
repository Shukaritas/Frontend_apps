export class CropAssembler {
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

    toDTOs(cropEntities) {
        return cropEntities.map(entity => this.toDTO(entity));
    }
}
