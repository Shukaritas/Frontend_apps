/**
 * Data Transfer Object for Community Recommendation / Comment.
 * Includes user role information for display purposes.
 */

export class CommunityRecommendationDTO {
  constructor(id, user, role, date, description) {
    this.id = id;
    this.user = user;
    this.role = role; // User role (e.g., "Agricultor Experto", "Agricultor Novato")
    this.date = date; // formatted or ISO date string
    this.description = description;
  }
}