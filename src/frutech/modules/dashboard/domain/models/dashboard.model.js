export class DashboardData {
    constructor({ previewFields, recommendations, upcomingTasks }) {
        if (!Array.isArray(previewFields) || !Array.isArray(recommendations) || !Array.isArray(upcomingTasks)) {
            throw new Error('Invalid data structure for DashboardData');
        }
        this.previewFields = previewFields;
        this.recommendations = recommendations;
        this.upcomingTasks = upcomingTasks;
    }
}