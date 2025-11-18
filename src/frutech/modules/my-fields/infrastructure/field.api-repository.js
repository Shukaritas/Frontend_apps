import { IFieldRepository } from "@/frutech/modules/my-fields/domain/model/field.respository.js";
import { FieldAssembler } from "@/frutech/modules/my-fields/application/field.assembler.js";
import http from '@/services/http-common.js';

export class FieldApiRepository extends IFieldRepository {
  /**
   * Obtiene todos los campos del usuario autenticado.
   */
  async getAll() {
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) throw new Error('Usuario no autenticado');
      const { id: userId } = JSON.parse(userRaw);
      if (!Number.isFinite(Number(userId))) throw new Error('ID de usuario inválido');
      try {
        const response = await http.get(`/fields/user/${userId}`);
        return FieldAssembler.toModels(response.data);
      } catch (err1) {
        try {
          const alt = await http.get(`/users/${userId}/fields`);
          return FieldAssembler.toModels(Array.isArray(alt.data) ? alt.data : []);
        } catch (err2) {
          try {
            const resAll = await http.get(`/fields`, { params: { userId } });
            const data = Array.isArray(resAll.data) ? resAll.data : [];
            // Si el backend ignora params, filtramos manual
            const mine = data.filter(f => (f.userId ?? f.user_id) == userId);
            return FieldAssembler.toModels(mine);
          } catch (err3) {
            const status = err3?.response?.status || err2?.response?.status || err1?.response?.status;
            if (status === 404 || status === 405) {
              return [];
            }
            throw err3;
          }
        }
      }
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || 'Error obteniendo campos';
      throw new Error(message);
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
      // Propagar mensaje 400 del backend si existe
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