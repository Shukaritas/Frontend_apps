import { IFieldRepository } from "@/frutech/modules/my-fields/domain/model/field.respository.js";
import { FieldAssembler } from "@/frutech/modules/my-fields/application/field.assembler.js";
import http from '@/services/http-common.js';

export class FieldApiRepository extends IFieldRepository {
  /**
   * Obtiene todos los campos del usuario autenticado.
   */
  async getAll() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) throw new Error('Usuario no autenticado');

    let userId;
    try {
      const parsed = JSON.parse(userRaw);
      userId = parsed?.id;
    } catch {
      throw new Error('Datos de usuario corruptos');
    }

    // Aceptar userId numérico o string (GUID); sólo validamos que exista
    if (userId === undefined || userId === null || (typeof userId === 'string' && userId.trim() === '')) {
      throw new Error('ID de usuario inválido');
    }

    // Intento 1: /fields/user/:userId
    try {
      const response = await http.get(`/fields/user/${userId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      return FieldAssembler.toModels(data);
    } catch (e1) {
      // Intento 2: /users/:userId/fields
      try {
        const response = await http.get(`/users/${userId}/fields`);
        const data = Array.isArray(response.data) ? response.data : [];
        return FieldAssembler.toModels(data);
      } catch (e2) {
        // Intento 3: /fields?userId=:userId
        try {
          const response = await http.get(`/fields`, { params: { userId } });
          const data = Array.isArray(response.data) ? response.data : [];
          return FieldAssembler.toModels(data);
        } catch (e3) {
          // Intento 4 (último): /fields plano y filtramos
          try {
            const resAll = await http.get('/fields');
            const all = Array.isArray(resAll.data) ? resAll.data : [];
            const mine = all.filter(f => (f.userId ?? f.user_id) == userId);
            return FieldAssembler.toModels(mine);
          } catch (e4) {
            // Si también falla, devolvemos vacío para no romper la UI
            return [];
          }
        }
      }
    }
  }

  async getById(id) {
    try {
      const response = await http.get(`/fields/${id}`);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error obteniendo campo');
    }
  }

  async create(fieldData) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = FieldAssembler.toPayload({ ...fieldData, userId: fieldData.userId || user.id });
      const response = await http.post('/fields', payload);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || 'Error creando campo';
      throw new Error(message);
    }
  }

  async updateField(id, fieldData) {
    try {
      const payload = FieldAssembler.toPayload(fieldData);
      const response = await http.put(`/fields/${id}`, payload);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error actualizando campo');
    }
  }
}