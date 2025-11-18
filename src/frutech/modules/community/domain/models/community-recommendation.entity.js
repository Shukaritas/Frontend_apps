/**
 * Entity representing a community recommendation.
 * This class encapsulates the properties and methods related to a community recommendation.
 * It includes methods for serialization and deserialization from JSON.
 */
export class CommunityRecommendation {
  constructor(id, user, role, description) {
    this.id = id;
    this.user = user;
    this.role = role;
    this.description = description;
  }

  static fromJSON(json) {
    return new CommunityRecommendation(
      json.id,
      json.user,
      json.role,
      json.description
    );
  }

  toJSON() {
    return {
      id: this.id,
      user: this.user,
      role: this.role,
      description: this.description
    };
  }
}