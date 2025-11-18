import { CommunityRecommendationDTO } from './community-recommendation.dto.js';

/**
 * Assembler for converting between CommunityRecommendation entities and DTOs.
 * This class provides static methods to facilitate the transformation.
 */
export class CommunityRecommendationAssembler {
  static toDTO(entity) {
    return new CommunityRecommendationDTO(
      entity.id,
      entity.user,
      entity.role,
      entity.description
    );
  }

  static toDTOList(entities) {
    return entities.map(entity => this.toDTO(entity));
  }
}