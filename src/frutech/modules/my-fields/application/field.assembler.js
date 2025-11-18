
export class FieldAssembler {
    /**
     * @param {import('./field.dto').PreviewFieldDTO[]} previewFieldDTOs
     * @param {import('./field.dto').CropStatusDTO[]} cropStatusDTOs
     * @returns {FieldModel[]}
     */
    static toModel(previewFieldDTOs, cropStatusDTOs) {
        const statusMap = new Map(
            cropStatusDTOs.map(item => [item.id, item.status])
        );

        return previewFieldDTOs.map(preview => {
            const status = statusMap.get(preview.id) || 'Healthy';

            return {
                id: preview.id,
                name: preview.title,
                imageUrl: preview.image_url,
                status: status,
            };
        });
    }
}