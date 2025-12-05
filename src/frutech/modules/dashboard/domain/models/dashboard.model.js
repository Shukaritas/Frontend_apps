/**
 * @file Entidad de dominio para el Dashboard.
 * @description Modela los datos agregados que se muestran en el panel de control.
 */

/**
 * @class DashboardData
 * @classdesc Representa el conjunto de datos para el dashboard.
 */
export class DashboardData {
    /**
     * @param {object} data
     * @param {Array<object>} data.previewFields - Una lista de campos para previsualizar.
     * @param {Array<object>} data.recommendations - Una lista de recomendaciones.
     * @param {Array<object>} data.upcomingTasks - Una lista de tareas próximas.
     */
    constructor({ previewFields, recommendations, upcomingTasks }) {
        if (!Array.isArray(previewFields) || !Array.isArray(recommendations) || !Array.isArray(upcomingTasks)) {
            throw new Error('Invalid data structure for DashboardData');
        }
        this.previewFields = previewFields;
        this.recommendations = recommendations;
        this.upcomingTasks = upcomingTasks;
    }
}