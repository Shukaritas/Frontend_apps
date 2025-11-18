/**
 * @class DashboardRepository
 * @classdesc Define el contrato (interfaz) para las operaciones de obtención de datos del dashboard.
 */
export class DashboardRepository {
    /**
     * Obtiene todos los datos necesarios para el dashboard.
     * @returns {Promise<import('../models/dashboard.model').DashboardData>}
     */
    async getDashboardData() {
        throw new Error('El método "getDashboardData" debe ser implementado.');
    }
}