export class DashboardAssembler {
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
            tasks: dashboardEntity.tasks.map(task => ({
                id: task.id,
                title: task.title,
                status: task.status
            }))
        };
    }
}