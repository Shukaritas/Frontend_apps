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
            name: entity.name,
            phoneNumber: entity.phoneNumber,
            identificator: entity.identificator,
            email: entity.email,
        };
    }

    async getById(id) {
        const resp = await http.get(`${this.endpoint}/${id}`);
        return this.apiToDomain(resp.data);
    }

    async update(userProfile) {
        const payload = this.domainToProfilePayload(userProfile);
        const resp = await http.put(`${this.endpoint}/${userProfile.id}/profile`, payload);
        // Si la API no devuelve el recurso completo, rehidratamos con lo enviado
        const data = resp?.data && typeof resp.data === 'object' ? resp.data : payload;
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