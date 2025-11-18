/**
 * @class DashboardAssembler
 * @classdesc Se encarga de la conversión (ensamblaje) entre la entidad de dominio DashboardData y su DTO.
 */
export class DashboardAssembler {
    /**
     * Convierte una entidad DashboardData a un DTO plano.
     * @param {import('../domain/models/dashboard.model').DashboardData} dashboardEntity - La entidad de dominio.
     * @returns {import('./dashboard.dto').DashboardDTO} El DTO resultante.
     */
    toDTO(dashboardEntity) {
        return {
            previewFields: dashboardEntity.previewFields.map(field => ({
                id: field.id,
                imageUrl: field.image_url,
                title: field.title
            })),
            recommendations: dashboardEntity.recommendations.map(rec => ({
                id: rec.id,
                title: rec.title,
                content: rec.content
            })),
            upcomingTasks: dashboardEntity.upcomingTasks.map(task => ({
                id: task.id,
                date: task.date,
                name: task.name,
                task: task.task
            }))
        };
    }
}