import http from '@/services/http-common.js';
import { UserProfileRepository } from '../domain/repositories/user-profile.repository';
import { UserProfile } from '../domain/models/user-profile.model';

const USERS_ENDPOINT = import.meta.env.VITE_ENDPOINT_USERS;

<<<<<<< HEAD

export class UserProfileApiRepository extends UserProfileRepository {
    endpoint = USERS_ENDPOINT;

=======
/**
 * @class UserProfileApiRepository
 * @classdesc Implementación contra API .NET real.
 * Endpoints utilizados (Swagger):
 *  - GET    /api/v1/users/{id}
 *  - PUT    /api/v1/users/{id}/profile
 *  - PUT    /api/v1/users/{id}/password
 *  - DELETE /api/v1/users/{id}
 */
export class UserProfileApiRepository extends UserProfileRepository {
    endpoint = USERS_ENDPOINT;
>>>>>>> d287244216b8ee9be0ab229d2ec10e615e422fe3

    apiToDomain(api) {
        const id = api.id ?? api.Id;
        const name = api.userName ?? api.username ?? api.name ?? api.UserName ?? api.Name;
        const email = api.email ?? api.Email;
        const phoneNumber = api.phoneNumber ?? api.PhoneNumber;
        const identificator = api.identificator ?? api.Identificator;
        const password = '******';
        return new UserProfile({ id: Number(id), name, email, phoneNumber, identificator, password });
    }


    domainToProfilePayload(entity) {
        return {
            userName: entity.name, // backend espera UserName
            email: entity.email,
            phoneNumber: entity.phoneNumber,
        };
    }

    async getById(id) {
        const resp = await http.get(`${this.endpoint}/${id}`);
        return this.apiToDomain(resp.data);
    }

    async update(userProfile) {
        const payload = this.domainToProfilePayload(userProfile);
        const resp = await http.put(`${this.endpoint}/${userProfile.id}/profile`, payload);
        const data = resp?.data && typeof resp.data === 'object' ? resp.data : payload;
        if (!('identificator' in data) && !('Identificator' in data)) {
            data.identificator = userProfile.identificator;
        }
        return this.apiToDomain({ id: userProfile.id, ...data });
    }

    async updatePassword(userId, currentPassword, newPassword) {
        await http.put(`${this.endpoint}/${userId}/password`, { currentPassword, newPassword });
        return true;
    }

    async delete(id) {
        await http.delete(`${this.endpoint}/${id}`);
    }
}