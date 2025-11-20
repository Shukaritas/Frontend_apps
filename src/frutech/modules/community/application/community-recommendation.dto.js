/**
 * Data Transfer Object for Community Recommendation / Comment.
 * Reflects backend structure without legacy 'role'.
 */

export class CommunityRecommendationDTO {
  constructor(id, user, date, description) {
    this.id = id;
    this.user = user;
    this.date = date; // formatted or ISO date string
    this.description = description;
  }
}