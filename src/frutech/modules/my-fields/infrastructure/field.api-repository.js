import { IFieldRepository } from "@/frutech/modules/my-fields/domain/model/field.respository.js";
import { FieldAssembler } from "@/frutech/modules/my-fields/application/field.assembler.js";
import http from '@/services/http-common.js';

const PREVIEW_FIELDS_PATH = import.meta.env.VITE_PREVIEW_FIELDS_ENDPOINT_PATH;
const CROP_STATUS_PATH = import.meta.env.VITE_CROP_STATUS_ENDPOINT_PATH;
const FIELDS_PATH = import.meta.env.VITE_FIELDS_ENDPOINT_PATH;
const TASK_PATH = import.meta.env.VITE_TASK_ENDPOINT_PATH;
const UPCOMING_TASKS_PATH = import.meta.env.VITE_UPCOMING_TASKS_ENDPOINT_PATH;

export class FieldApiRepository extends IFieldRepository {
    /**
     * Obtiene los datos de los endpoints y los transforma usando el Assembler.
     * @override
     * @returns {Promise<import('../domain/models/field.model').FieldModel[]>}
     */
    async getAll() {
        try {
            const [previewResponse, statusResponse] = await Promise.all([
                http.get(PREVIEW_FIELDS_PATH),
                http.get(CROP_STATUS_PATH)
            ]);

            const previewFieldDTOs = previewResponse.data;
            const cropStatusDTOs = statusResponse.data;

            return FieldAssembler.toModel(previewFieldDTOs, cropStatusDTOs);

        } catch (error) {
            console.error('FieldApiRepository Error:', error);
            throw error;
        }
    }
    /**
     * Obtiene los datos detallados de un solo campo por su ID.
     * @param {string | number} id
     * @returns {Promise<any>} // En un caso real, usaríamos un Assembler para convertir a FieldDetailModel
     */
    async getById(id) {
        try {
            const response = await http.get(`${FIELDS_PATH}/${id}`);
            return response.data;
        } catch (error) {
            console.error('FieldApiRepository getById Error:', error);
            throw error;
        }
    }
    /**
     * Crea un nuevo campo enviando los datos a la API (db.json).
     * @returns {Promise<any>} - La respuesta del servidor con el objeto ya creado.
     * @param previewData
     * @param detailData
     */
    async create(previewData, detailData) {
        try {
            const [previewResponse, detailResponse] = await Promise.all([
                http.post(PREVIEW_FIELDS_PATH, previewData),
                http.post(FIELDS_PATH, detailData),
            ]);
            return previewResponse.data;
        } catch (error) {
            console.error('FieldApiRepository create Error:', error);
            throw error;
        }
    }
    async updateField(id, fieldData) {
        try {
            const response = await http.patch(`${FIELDS_PATH}/${id}`, fieldData);
            return response.data;
        } catch (error) {
            console.error('FieldApiRepository updateField Error:', error);
            throw error;
        }
    }

    /**
     * Agrega una nueva tarea a la lista global de tareas.
     * @param {object} taskData El objeto de la nueva tarea.
     * @returns {Promise<any>} Los datos de la tarea creada.
     */
    async addNewTask(taskData) {
        try {
            const response = await http.post(TASK_PATH, taskData);
            return response.data;
        } catch (error) {
            console.error('FieldApiRepository addNewTask Error:', error);
            throw error;
        }
    }
    async getAllFieldsDetails() {
        try {
            const response = await http.get(FIELDS_PATH);
            return response.data;
        } catch (error) {
            console.error('FieldApiRepository getAllFieldsDetails Error:', error);
            throw error;
        }
    }
    async updateUpcomingTask(taskId, taskData) {
        try {
            const response = await http.patch(`${UPCOMING_TASKS_PATH}/${taskId}`, taskData);
            return response.data;
        } catch (error) {
            console.error('FieldApiRepository updateUpcomingTask Error:', error);
            throw error;
        }
    }
    async deleteUpcomingTask(taskId) {
        try {
            await http.delete(`${UPCOMING_TASKS_PATH}/${taskId}`);
        } catch (error) {
            console.error('FieldApiRepository deleteUpcomingTask Error:', error);
            throw error;
        }
    }
}