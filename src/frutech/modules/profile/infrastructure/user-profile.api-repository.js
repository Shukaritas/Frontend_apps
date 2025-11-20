import http from '@/services/http-common.js';
import { UserProfileRepository } from '../domain/repositories/user-profile.repository';
import { UserProfile } from '../domain/models/user-profile.model';

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
    endpoint = '/v1/users';

    /**
     * Mapea UserResource (API) a entidad de dominio.
     */
    apiToDomain(api) {
        // Aceptar PascalCase/camelCase
        const id = api.id ?? api.Id;
        const name = api.userName ?? api.username ?? api.name ?? api.UserName ?? api.Name;
        const email = api.email ?? api.Email;
        const phoneNumber = api.phoneNumber ?? api.PhoneNumber;
        const identificator = api.identificator ?? api.Identificator;
        // El backend no devolverá password; usamos placeholder para pasar validación del dominio
        const password = '******';
        return new UserProfile({ id: Number(id), name, email, phoneNumber, identificator, password });
    }

    /**
     * Mapea entidad de dominio a payload de API (camelCase).
     */
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
        // Si el backend no retorna identificator, preservar el existente para pasar validación del dominio
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