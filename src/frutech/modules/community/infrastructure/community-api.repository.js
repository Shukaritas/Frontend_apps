import { CommunityRepository } from '../domain/repositories/community.repository.js';
import { CommunityRecommendation } from '../domain/models/community-recommendation.entity.js';
import http from '@/services/http-common.js';

const COMMUNITY_RECOMMENDATION_ENDPOINT = import.meta.env.VITE_ENDPOINT_COMMUNITY_RECOMMENDATION;

<<<<<<< HEAD
=======
/**
 *  CommunityRepository implementation using real HTTP API.
 */
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
export class CommunityApiRepository extends CommunityRepository {
  async getRecommendations() {
    const resp = await http.get(COMMUNITY_RECOMMENDATION_ENDPOINT);
    const data = Array.isArray(resp.data) ? resp.data : [];
    return data.map(item => new CommunityRecommendation(
      item.id,
      item.userName || item.user || item.author || 'Community',
      item.commentDate || item.CommentDate || '',
      item.comment || item.description || item.text || ''
    ));
  }

  async getRecommendationById(id) {
    const resp = await http.get(`${COMMUNITY_RECOMMENDATION_ENDPOINT}/${id}`);
    const r = resp.data;
    if (!r) return null;
    return new CommunityRecommendation(
      r.id,
      r.userName || r.user || r.author || 'Community',
      r.commentDate || r.CommentDate || '',
      r.comment || r.description || r.text || ''
    );
  }

  async createRecommendation(payload) {
    if (!payload || !payload.userName || !payload.comment) {
      throw new Error('Payload inválido para crear comentario');
    }
    const resp = await http.post(COMMUNITY_RECOMMENDATION_ENDPOINT, {
      userName: payload.userName,
      comment: payload.comment
    });
    const data = resp.data || {};
    return new CommunityRecommendation(
      data.id,
      data.userName || data.user || 'Community',
      data.commentDate || data.CommentDate || '',
      data.comment || data.description || data.text || payload.comment
    );
  }

  async updateCommentContent(id, comment) {
    if (!id || !comment || comment.trim().length === 0) {
      throw new Error('ID y contenido del comentario son requeridos');
    }
<<<<<<< HEAD
    const resp = await http.put(`${COMMUNITY_RECOMMENDATION_ENDPOINT}/${id}`, {
=======
    const resp = await http.patch(`${COMMUNITY_RECOMMENDATION_ENDPOINT}/${id}/content`, {
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3
      comment: comment.trim()
    });
    const data = resp.data || {};
    return new CommunityRecommendation(
      data.id,
      data.userName || data.user || 'Community',
      data.commentDate || data.CommentDate || '',
      data.comment || data.description || data.text || comment
    );
  }
}