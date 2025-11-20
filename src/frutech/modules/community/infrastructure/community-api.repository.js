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
      item.userName || item.user || item.author || 'Community',
      item.commentDate || item.CommentDate || '',
      item.comment || item.description || item.text || ''
    ));
  }

  async getRecommendationById(id) {
    const resp = await http.get(`/v1/CommunityRecommendation/${id}`);
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
    // payload: { userName, comment }
    if (!payload || !payload.userName || !payload.comment) {
      throw new Error('Payload inválido para crear comentario');
    }
    const resp = await http.post('/v1/CommunityRecommendation', {
      userName: payload.userName,
      comment: payload.comment
    });
    // Mapear respuesta a entidad
    const data = resp.data || {};
    return new CommunityRecommendation(
      data.id,
      data.userName || data.user || 'Community',
      data.commentDate || data.CommentDate || '',
      data.comment || data.description || data.text || payload.comment
    );
  }

  /**
   * Actualiza el contenido de un comentario existente.
   * @param {number} id - ID del comentario a actualizar
   * @param {string} comment - Nuevo texto del comentario
   * @returns {Promise<CommunityRecommendation>}
   */
  async updateCommentContent(id, comment) {
    if (!id || !comment || comment.trim().length === 0) {
      throw new Error('ID y contenido del comentario son requeridos');
    }
    const resp = await http.patch(`/v1/CommunityRecommendation/${id}/content`, {
      comment: comment.trim()
    });
    const data = resp.data || {};
    return new CommunityRecommendation(
      data.id || id,
      data.userName || data.user || 'Community',
      data.commentDate || data.CommentDate || '',
      data.comment || data.description || data.text || comment
    );
  }
}