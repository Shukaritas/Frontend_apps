export class IFieldRepository {
    /**
     * @returns {Promise<import('../models/field.model').FieldModel[]>}
     */
    async getAll() {
        throw new Error("El método 'getAll' debe ser implementado.");
    }
}