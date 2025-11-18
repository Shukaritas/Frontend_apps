import http from '@/services/http-common.js';
import { DashboardRepository } from '../domain/repositories/dashboard.repository';
import { DashboardData } from '../domain/models/dashboard.model';

/**
 * @class DashboardApiRepository
 * @classdesc Implementación del repositorio que interactúa con la API REST para obtener los datos del dashboard.
 * @extends DashboardRepository
 */
export class DashboardApiRepository extends DashboardRepository {
    /**
     * Obtiene todos los datos necesarios para el dashboard desde la API.
     * @returns {Promise<DashboardData>} La entidad de datos del dashboard.
     */
    async getDashboardData() {

        const previewFieldsPath = import.meta.env.VITE_PREVIEW_FIELDS_ENDPOINT_PATH;
        const recommendationsPath = import.meta.env.VITE_RECOMMENDATIONS_ENDPOINT_PATH;
        const upcomingTasksPath = import.meta.env.VITE_UPCOMING_TASKS_ENDPOINT_PATH;


        const [previewFieldsResponse, recommendationsResponse, upcomingTasksResponse] = await Promise.all([
            http.get(previewFieldsPath),
            http.get(recommendationsPath),
            http.get(upcomingTasksPath)
        ]);

        return new DashboardData({
            previewFields: previewFieldsResponse.data,
            recommendations: recommendationsResponse.data,
            upcomingTasks: upcomingTasksResponse.data
        });
    }
}