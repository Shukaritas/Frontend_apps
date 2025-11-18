import http from '@/services/http-common.js';
import { DashboardRepository } from '../domain/repositories/dashboard.repository';
import { DashboardData } from '../domain/models/dashboard.model';

// Recomendaciones estáticas (se evita consumo API real para Community)
const STATIC_RECOMMENDATIONS = [
  { id: 1, user: 'AgroExpert', role: 'Especialista', description: 'Optimiza riego temprano para mejorar retención de nutrientes.' },
  { id: 2, user: 'SoilGuru', role: 'Analista Suelos', description: 'Añade compost orgánico en parcelas con menor humedad.' },
  { id: 3, user: 'CropTech', role: 'Tecnólogo', description: 'Considera sensores de humedad en campos con variabilidad extrema.' }
];

function isoToDateObj(iso) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * @class DashboardApiRepository
 * @classdesc Implementación del repositorio que interactúa con la API REST para obtener los datos del dashboard.
 * @extends DashboardRepository
 */
export class DashboardApiRepository extends DashboardRepository {
  async getDashboardData() {
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) throw new Error('Usuario no autenticado');
      const { id: userId } = JSON.parse(userRaw);

      let fields = [];
      // Intento 1: endpoint específico por usuario
      try {
        const resp = await http.get(`/fields/user/${userId}`);
        fields = Array.isArray(resp.data) ? resp.data : [];
      } catch (e1) {
        // Intento 2: /users/:userId/fields
        try {
          const resp2 = await http.get(`/users/${userId}/fields`);
          fields = Array.isArray(resp2.data) ? resp2.data : [];
        } catch (e2) {
          // Intento 3: /fields?userId=:userId
          try {
            const resp3 = await http.get('/fields', { params: { userId } });
            fields = Array.isArray(resp3.data) ? resp3.data : [];
          } catch (e3) {
            // Intento 4: /fields y filtramos
            try {
              const resAll = await http.get('/fields');
              const all = Array.isArray(resAll.data) ? resAll.data : [];
              fields = all.filter(f => (f.userId ?? f.user_id) == userId);
            } catch (e4) {
              fields = [];
            }
          }
        }
      }

      const previewFields = fields.slice(0, 4).map(f => ({
        id: f.id,
        name: f.name,
        imageUrl: f.imageUrl || f.image_url || '',
        location: f.location,
      }));

      const allTasks = fields.flatMap(f => Array.isArray(f.tasks) ? f.tasks.map(t => ({ ...t, fieldId: f.id, fieldName: f.name })) : []);
      const upcomingTasks = allTasks
        .map(t => {
          const dueIso = t.dueDate || t.due_date;
          const d = new Date(dueIso);
          return { id: t.id, description: t.description, dueDate: d, fieldId: t.fieldId, fieldName: t.fieldName, completed: t.completed || false };
        })
        .filter(t => t.dueDate instanceof Date && !isNaN(t.dueDate.getTime()) && t.dueDate >= new Date())
        .sort((a,b) => a.dueDate - b.dueDate)
        .slice(0, 8)
        .map(t => ({ id: t.id, description: t.description, dueDate: t.dueDate.toISOString(), field: t.fieldName, completed: t.completed }));

      return new DashboardData({
        previewFields,
        recommendations: STATIC_RECOMMENDATIONS,
        upcomingTasks
      });
    } catch (error) {
      throw new Error(error.message || 'Error al obtener datos de dashboard');
    }
  }
}