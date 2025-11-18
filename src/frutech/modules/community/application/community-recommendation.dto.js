/**
 * Data Transfer Object for Community Recommendation.
 * This class is used to transfer data between different layers of the application.
 * It encapsulates the properties of a community recommendation.
 */

export class CommunityRecommendationDTO {
  constructor(id, user, role, description) {
    this.id = id;
    this.user = user;
    this.role = role;
    this.description = description;
  }
}