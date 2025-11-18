import http from '@/services/http-common.js';
import { UserProfileRepository } from '../domain/repositories/user-profile.repository';
import { UserProfile } from '../domain/models/user-profile.model';

/**
 * @class UserProfileApiRepository
 * @classdesc Implementación del repositorio que interactúa con la API REST para gestionar perfiles.
 * @extends UserProfileRepository
 * @author Estefano Solis (Adaptado)
 */
export class UserProfileApiRepository extends UserProfileRepository {
    // Asumimos que la variable de entorno apunta a '/user'
    endpoint = import.meta.env.VITE_USER_ENDPOINT_PATH || '/user';

    /**
     * Mapea los datos de la API (snake_case) al modelo de Dominio (camelCase).
     * @param {object} apiData - Datos crudos de la API.
     * @returns {UserProfile} Instancia de la entidad UserProfile.
     */
    apiToDomain(apiData) {
        return new UserProfile({
            id: apiData.id,
            name: apiData.user_name,       // Aquí arreglamos el error de mapeo
            email: apiData.email,
            phoneNumber: apiData.phone_number, // Y aquí también
            identificator: apiData.identificator,
            password: apiData.password,
        });
    }

    /**
     * Mapea la entidad de Dominio a un objeto plano para enviar a la API.
     * @param {UserProfile} domainData - Entidad de dominio.
     * @returns {object} Objeto plano compatible con la API.
     */
    domainToApi(domainData) {
        return {
            id: domainData.id,
            user_name: domainData.name,
            email: domainData.email,
            phone_number: domainData.phoneNumber,
            identificator: domainData.identificator,
            password: domainData.password,
        };
    }

    /**
     * Obtiene un perfil por ID directamente desde la API.
     * @param {number} id - El ID del usuario.
     * @returns {Promise<UserProfile>} La entidad del perfil de usuario.
     */
    async getById(id) {
        // Optimizamos para pedir directo el recurso: GET /user/1
        const response = await http.get(`${this.endpoint}/${id}`);
        // La API (json-server) devuelve el objeto directo, no un array
        const userData = response.data;

        if (!userData) throw new Error('User not found');

        return this.apiToDomain(userData);
    }

    /**
     * Actualiza un perfil enviando los datos a la API.
     * @param {UserProfile} userProfile - La entidad de perfil a actualizar.
     * @returns {Promise<UserProfile>} La entidad actualizada devuelta por la API.
     */
    async update(userProfile) {
        const apiData = this.domainToApi(userProfile);
        // PUT /user/1
        const response = await http.put(`${this.endpoint}/${userProfile.id}`, apiData);
        return this.apiToDomain(response.data);
    }

    /**
     * Actualiza la contraseña en la base de datos vía API.
     * @param {number} userId - ID del usuario.
     * @param {string} currentPassword - Contraseña actual para verificación.
     * @param {string} newPassword - Nueva contraseña.
     * @returns {Promise<boolean>} True si la actualización fue exitosa.
     */
    async updatePassword(userId, currentPassword, newPassword) {
        // Reutilizamos getById para aprovechar el mapeo y lógica
        const response = await http.get(`${this.endpoint}/${userId}`);
        const currentUserData = response.data;

        if (currentUserData.password !== currentPassword) {
            throw new Error('La contraseña actual no coincide.');
        }

        // Actualizamos solo el campo password
        const updatedUserData = {
            ...currentUserData,
            password: newPassword,
        };

        await http.put(`${this.endpoint}/${userId}`, updatedUserData);
        return true;
    }

    /**
     * Elimina un perfil de usuario.
     * @param {number} id - ID del usuario a eliminar.
     * @returns {Promise<void>}
     */
    async delete(id) {
        await http.delete(`${this.endpoint}/${id}`);
    }
}