import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { CropApiRepository } from '../infrastructure/crop.api-repository';
import { CropAssembler } from '../application/crop.assembler';
import { Crop } from '../domain/models/crop.model';

const repository = new CropApiRepository();
const assembler = new CropAssembler();

/**
 * @store useCropStore
 * @description Pinia store to manage crop state and actions.
 * @author Jefferson Castro
 */
export const useCropStore = defineStore('crop', () => {
    const crops = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const hasCrops = computed(() => crops.value.length > 0);

    /**
     * Fetches all crops from the API and saves them to the state.
     */
    async function fetchCrops() {
        isLoading.value = true;
        error.value = null;
        try {
            const cropEntities = await repository.getAll();
            crops.value = assembler.toDTOs(cropEntities);
        } catch (err) {
            error.value = 'Could not load crops.';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Creates a new crop.
     * @param {object} cropData - Object with crop data (title, planting_date, harvest_date, field, status, days).
     */
    async function createCrop(cropData) {
        isLoading.value = true;
        error.value = null;
        try {

            const newId = Math.max(...crops.value.map(c => c.id), 0) + 1;
            
            const cropEntity = new Crop({
                id: newId,
                title: cropData.title,
                planting_date: cropData.planting_date,
                harvest_date: cropData.harvest_date,
                field: cropData.field,
                status: cropData.status,
                days: cropData.days
            });

            const createdEntity = await repository.create(cropEntity);
            const newCropDTO = assembler.toDTO(createdEntity);
            crops.value.push(newCropDTO);
        } catch (err) {
            error.value = 'Could not create crop.';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Updates an existing crop.
     * @param {number} cropId - The ID of the crop to update.
     * @param {object} cropData - Object with updated crop data.
     */
    async function updateCrop(cropId, cropData) {
        isLoading.value = true;
        error.value = null;
        try {
            const currentEntity = await repository.getById(cropId);
            currentEntity.updateInformation(
                cropData.title,
                cropData.planting_date,
                cropData.harvest_date,
                cropData.field,
                cropData.status,
                cropData.days
            );
            
            const updatedEntity = await repository.update(currentEntity);
            const updatedCropDTO = assembler.toDTO(updatedEntity);
            
            const index = crops.value.findIndex(crop => crop.id === cropId);
            if (index !== -1) {
                crops.value[index] = updatedCropDTO;
            }
        } catch (err) {
            error.value = 'Could not update crop.';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Deletes a crop.
     * @param {number} cropId - The ID of the crop to delete.
     */
    async function deleteCrop(cropId) {
        isLoading.value = true;
        error.value = null;
        try {
            await repository.delete(cropId);
            crops.value = crops.value.filter(crop => crop.id !== cropId);
        } catch (err) {
            error.value = 'Could not delete crop.';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Updates the status of a crop.
     * @param {number} cropId - The ID of the crop.
     * @param {string} newStatus - The new status.
     */
    async function updateCropStatus(cropId, newStatus) {
        isLoading.value = true;
        error.value = null;
        try {
            const currentEntity = await repository.getById(cropId);
            currentEntity.updateStatus(newStatus);
            
            const updatedEntity = await repository.update(currentEntity);
            const updatedCropDTO = assembler.toDTO(updatedEntity);
            
            const index = crops.value.findIndex(crop => crop.id === cropId);
            if (index !== -1) {
                crops.value[index] = updatedCropDTO;
            }
        } catch (err) {
            error.value = 'Could not update crop status.';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        crops,
        isLoading,
        error,
        hasCrops,
        fetchCrops,
        createCrop,
        updateCrop,
        deleteCrop,
        updateCropStatus
    };
});
