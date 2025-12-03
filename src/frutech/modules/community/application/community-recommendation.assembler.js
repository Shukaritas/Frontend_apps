import { CommunityRecommendationDTO } from './community-recommendation.dto.js';

export class CommunityRecommendationAssembler {
  static toDTO(entity) {
    return new CommunityRecommendationDTO(
      entity.id,
      entity.user,
      entity.date,
      entity.description
    );
  }

  static toDTOList(entities) {
    return entities.map(entity => this.toDTO(entity));
  }
}