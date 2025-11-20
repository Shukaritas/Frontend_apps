/**
 * Entity representing a community recommendation / comment.
 * Backend structure:
 * {
 *   id: number,
 *   userName: string,
 *   commentDate: string (ISO),
 *   comment: string
 * }
 */
export class CommunityRecommendation {
  constructor(id, user, date, description) {
    this.id = id;
    this.user = user;
    this.date = date; // ISO or display string
    this.description = description;
  }

  static fromJSON(json) {
    if (!json) return null;
    return new CommunityRecommendation(
      json.id,
      json.user || json.userName || json.author || 'Community',
      json.commentDate || json.CommentDate || json.date || json.Date || '',
      json.comment || json.description || json.text || ''
    );
  }

  toJSON() {
    return {
      id: this.id,
      user: this.user,
      date: this.date,
      description: this.description
    };
  }
}