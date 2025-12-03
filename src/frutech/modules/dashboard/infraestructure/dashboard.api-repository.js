import { DashboardRepository } from '../domain/repositories/dashboard.repository';
import { DashboardData } from '../domain/models/dashboard.model';
import { FieldApiRepository } from '@/frutech/modules/my-fields/infrastructure/field.api-repository.js';
import { TaskApiRepository } from '@/frutech/modules/my-tasks/infrastructure/task-api.repository.js';

const STATIC_RECOMMENDATIONS = [
  { id: 1, user: 'AgroExpert', role: 'Especialista', description: 'Optimiza riego temprano para mejorar retención de nutrientes.' },
  { id: 2, user: 'SoilGuru', role: 'Analista Suelos', description: 'Añade compost orgánico en parcelas con menor humedad.' },
  { id: 3, user: 'CropTech', role: 'Tecnólogo', description: 'Considera sensores de humedad en campos con variabilidad extrema.' }
];

export class DashboardApiRepository extends DashboardRepository {
  async getDashboardData() {
    try {
      const fieldRepo = new FieldApiRepository();
      const taskRepo = new TaskApiRepository();

      const fields = await fieldRepo.getAll();
      const previewFields = (fields || []).slice(0, 4).map(f => ({
        id: f.id,
        name: f.name,
        imageUrl: f.imageUrl || '',
        location: f.location,
      }));

      const rawTasks = await taskRepo.getAll();
      const upcomingTasks = (rawTasks || [])
        .map(t => {
          const [day, month] = String(t.dueDate || '').split('/').map(Number);
          const year = new Date().getFullYear();
          const date = new Date(year, (month || 1) - 1, day || 1);
          return { id: t.id, description: t.description, dueDate: date, field: t.field, completed: t.completed };
        })
        .filter(t => t.dueDate instanceof Date && !isNaN(t.dueDate.getTime()) && t.dueDate >= new Date())
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 8)
        .map(t => ({ id: t.id, description: t.description, dueDate: t.dueDate.toISOString(), field: t.field, completed: t.completed }));

      return new DashboardData({
        previewFields,
        recommendations: STATIC_RECOMMENDATIONS,
        upcomingTasks,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }
}