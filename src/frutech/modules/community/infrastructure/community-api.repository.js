import { CommunityRepository } from '../domain/repositories/community.repository.js';
import { CommunityRecommendation } from '../domain/models/community-recommendation.entity.js';

// Datos estáticos (no se consume API real para recomendaciones)
const STATIC_RECOMMENDATIONS = [
  new CommunityRecommendation(1, 'AgroExpert', 'Especialista', 'Optimiza riego temprano para mejorar retención de nutrientes.'),
  new CommunityRecommendation(2, 'SoilGuru', 'Analista Suelos', 'Añade compost orgánico en parcelas con menor humedad.'),
  new CommunityRecommendation(3, 'CropTech', 'Tecnólogo', 'Considera sensores de humedad en campos con variabilidad extrema.'),
];

/**
 *  CommunityRepository Assembler using HTTP API.
 * This class interacts with a RESTful API to fetch community recommendations.
 * It extends the abstract CommunityRepository and implements its methods.
 */
export class CommunityApiRepository extends CommunityRepository {
  async getRecommendations() {
    return STATIC_RECOMMENDATIONS;
  }
  async getRecommendationById(id) {
    return STATIC_RECOMMENDATIONS.find(r => r.id === Number(id)) || null;
  }
}