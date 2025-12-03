import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { CropApiRepository } from '../infrastructure/crop.api-repository';
import { CropAssembler } from '../application/crop.assembler';
import { Crop } from '../domain/models/crop.model';

const repository = new CropApiRepository();
const assembler = new CropAssembler();

export const useCropStore = defineStore('crop', () => {
    const crops = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const hasCrops = computed(() => crops.value.length > 0);

    async function fetchCrops() {
        isLoading.value = true;
        error.value = null;
        try {
            const cropEntities = await repository.getAll();
            crops.value = assembler.toDTOs(cropEntities);
        } catch (err) {
            error.value = 'Could not load crops.';
            console.error(err);
            crops.value = [];
        } finally {
            isLoading.value = false;
        }
    }

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
                fieldId: cropData.fieldId,
                status: cropData.status,
                days: cropData.days,
                soilType: cropData.soilType || '',
                sunlight: cropData.sunlight || '',
                watering: cropData.watering || ''
            });

            await repository.create(cropEntity);
            await fetchCrops();
        } catch (err) {
            error.value = 'Could not create crop.';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

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
                cropData.fieldId,
                cropData.status,
                cropData.days,
                cropData.soilType,
                cropData.sunlight,
                cropData.watering
            );
            
            await repository.update(currentEntity);
            await fetchCrops();
        } catch (err) {
            error.value = 'Could not update crop.';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteCrop(cropId) {
        isLoading.value = true;
        error.value = null;
        try {
            await repository.delete(cropId);
            await fetchCrops();
        } catch (err) {
            error.value = 'Could not delete crop.';
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
        deleteCrop
    };
});
