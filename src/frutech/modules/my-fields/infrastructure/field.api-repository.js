import { IFieldRepository } from "@/frutech/modules/my-fields/domain/model/field.respository.js";
import { FieldAssembler } from "@/frutech/modules/my-fields/application/field.assembler.js";
import http from '@/services/http-common.js';

export class FieldApiRepository extends IFieldRepository {
  /**
   * Obtiene todos los campos del usuario autenticado usando únicamente el endpoint oficial.
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

    if (userId === undefined || userId === null || (typeof userId === 'string' && userId.trim() === '')) {
      throw new Error('ID de usuario inválido');
    }

    // Único intento: endpoint correcto. Si falla se deja que el store maneje el error.
    const response = await http.get(`/v1/Fields/user/${userId}`);
    const data = Array.isArray(response.data) ? response.data : [];
    return FieldAssembler.toModels(data);
  }

  async getById(id) {
    try {
      const response = await http.get(`/v1/Fields/${id}`);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error obteniendo campo');
    }
  }

  async create(fieldData) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = fieldData.userId || user.id;

      // Crear FormData con nombres PascalCase que espera el backend .NET
      const formData = new FormData();
      formData.append('Name', fieldData.name);
      formData.append('Location', fieldData.location);

      // El backend espera 'FieldSize' (PascalCase)
      const size = fieldData.size ?? fieldData.fieldSize ?? fieldData.field_size;
      if (size !== undefined && size !== null) {
        formData.append('FieldSize', String(size));
      }

      // UserId en PascalCase
      if (userId !== undefined && userId !== null) {
        formData.append('UserId', String(userId));
      }

      // CRUCIAL: El backend espera 'Image' (PascalCase) como IFormFile
      if (fieldData.imageFile instanceof File || fieldData.imageFile instanceof Blob) {
        formData.append('Image', fieldData.imageFile);
      }

      const response = await http.post('/v1/Fields', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || 'Error creando campo';
      throw new Error(message);
    }
  }

  async updateField(id, fieldData) {
    try {
      const payload = FieldAssembler.toPayload(fieldData);
      const response = await http.put(`/v1/Fields/${id}`, payload);
      return FieldAssembler.toModel(response.data);
    } catch (error) {
      throw new Error(error.message || 'Error actualizando campo');
    }
  }
}