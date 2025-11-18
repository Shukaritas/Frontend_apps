/**
 * Abstract repository for community recommendations.
 * This class defines the interface for fetching community recommendations.
 * Concrete implementations should extend this class and implement the methods.
 */
export class CommunityRepository {
  async getRecommendations() {
    throw new Error('Method must be implemented');
  }

  async getRecommendationById(id) {
    throw new Error('Method must be implemented');
  }
}