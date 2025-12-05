/**
 * Entity representing a community recommendation / comment.
 * Backend structure:
 * {
 *   id: number,
 *   userName: string,
 *   commentDate: string (ISO),
 *   comment: string,
 *   role: string (opcional)
 * }
 */
export class CommunityRecommendation {
  constructor(id, user, date, description, role = '') {
    this.id = id;
    this.user = user;
    this.date = date; // ISO or display string
    this.description = description;
    this.role = role || ''; // Rol del usuario (ej: "Agricultor Experto")
  }

  static fromJSON(json) {
    if (!json) return null;
    return new CommunityRecommendation(
      json.id,
      json.user || json.userName || json.author || 'Community',
      json.commentDate || json.CommentDate || json.date || json.Date || '',
      json.comment || json.description || json.text || '',
      json.role || json.Role || ''
    );
  }

  toJSON() {
    return {
      id: this.id,
      user: this.user,
      date: this.date,
      description: this.description,
      role: this.role
    };
  }
}