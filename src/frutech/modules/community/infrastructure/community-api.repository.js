import { CommunityRepository } from '../domain/repositories/community.repository.js';
import { CommunityRecommendation } from '../domain/models/community-recommendation.entity.js';
import http from '@/services/http-common.js';

/**
 *  CommunityRepository implementation using real HTTP API.
 */
export class CommunityApiRepository extends CommunityRepository {
  async getRecommendations() {
    const resp = await http.get('/v1/CommunityRecommendation');
    const data = Array.isArray(resp.data) ? resp.data : [];
    return data.map(item => new CommunityRecommendation(
      item.id,
      item.user || item.userName || item.author || 'Community',
      item.role || item.userRole || 'Member',
      item.description || item.text || ''
    ));
  }

  async getRecommendationById(id) {
    const resp = await http.get(`/v1/CommunityRecommendation/${id}`);
    const r = resp.data;
    if (!r) return null;
    return new CommunityRecommendation(
      r.id,
      r.user || r.userName || r.author || 'Community',
      r.role || r.userRole || 'Member',
      r.description || r.text || ''
    );
  }
}