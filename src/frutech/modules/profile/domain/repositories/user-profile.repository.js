/**
 * @class UserProfileRepository
 * @classdesc Defines the contract (interface) for user profile persistence operations.
 * @author Estefano Solis
 */
export class UserProfileRepository {
    /**
     * Gets a user profile by its ID.
     * @param {number} id - The user's ID.
     * @returns {Promise<import('../models/user-profile.model').UserProfile>}
     */
    async getById(id) {
        throw new Error('Method "getById" must be implemented.');
    }

    /**
     * Updates a user profile in the persistence layer.
     * @param {import('../models/user-profile.model').UserProfile} userProfile - The user profile entity to update.
     * @returns {Promise<void>}
     */
    async update(userProfile) {
        throw new Error('Method "update" must be implemented.');
    }

    /**
     * Updates a user's password.
     * @param {number} userId - The user's ID.
     * @param {string} currentPassword - The current password for verification.
     * @param {string} newPassword - The new password to set.
     * @returns {Promise<boolean>}
     */
    async updatePassword(userId, currentPassword, newPassword) {
        throw new Error('Method "updatePassword" must be implemented.');
    }

    /**
     * Deletes a user profile by its ID.
     * @param {number} id - The ID of the user to delete.
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method "delete" must be implemented.');
    }
}