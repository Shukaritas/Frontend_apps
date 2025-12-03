
export class UserProfileRepository {

    async getById(id) {
        throw new Error('Method "getById" must be implemented.');
    }


    async update(userProfile) {
        throw new Error('Method "update" must be implemented.');
    }


    async updatePassword(userId, currentPassword, newPassword) {
        throw new Error('Method "updatePassword" must be implemented.');
    }


    async delete(id) {
        throw new Error('Method "delete" must be implemented.');
    }
}