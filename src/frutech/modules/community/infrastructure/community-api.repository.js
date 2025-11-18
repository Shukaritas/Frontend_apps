import { CommunityRepository } from '../domain/repositories/community.repository.js';
import { CommunityRecommendation } from '../domain/models/community-recommendation.entity.js';
import httpCommon from '../../../../services/http-common.js';

/**
 *  CommunityRepository Assembler using HTTP API.
 * This class interacts with a RESTful API to fetch community recommendations.
 * It extends the abstract CommunityRepository and implements its methods.
 */
export class CommunityApiRepository extends CommunityRepository {
  async getRecommendations() {
    try {
      const response = await httpCommon.get('/community_recommendation');
      return response.data.map(item => CommunityRecommendation.fromJSON(item));
    } catch (error) {
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }
  }

  async getRecommendationById(id) {
    try {
      const response = await httpCommon.get(`/community_recommendation/${id}`);
      return CommunityRecommendation.fromJSON(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch recommendation with id ${id}: ${error.message}`);
    }
  }
}