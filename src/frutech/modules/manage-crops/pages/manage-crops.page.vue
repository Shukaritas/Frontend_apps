<template>
  <div class="manage-crops-page">
        <!-- Header Section -->
        <div class="page-header">
          <h1 class="page-title">{{ $t('manageCrops.title') }}</h1>
          <p class="page-description">
            {{ $t('manageCrops.description') }}
          </p>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="pi pi-leaf"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ totalCrops }}</span>
              <span class="stat-label">{{ $t('manageCrops.totalCrops') }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon healthy">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ healthyCrops }}</span>
              <span class="stat-label">{{ $t('manageCrops.healthy') }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon attention">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ attentionCrops }}</span>
              <span class="stat-label">{{ $t('manageCrops.attention') }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon critical">
              <i class="pi pi-times-circle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ criticalCrops }}</span>
              <span class="stat-label">{{ $t('manageCrops.critical') }}</span>
            </div>
          </div>
        </div>

        <!-- Crops Table -->
        <CropTable
          :crops="cropStore.crops"
          :is-loading="cropStore.isLoading"
          :error="cropStore.error"
          @edit="onEditCrop"
          @delete="onDeleteCrop"
          @add="goToNewCrop"
          @retry="onRetry"
        />

        <!-- Crop Form Dialog -->
        <CropForm
          v-model:visible="showCropForm"
          :crop="selectedCrop"
          :is-submitting="cropStore.isLoading"
          @submit="onSubmitCrop"
          @cancel="onCancelForm"
        />

        <!-- Toast for notifications -->
        <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import CropTable from '../components/CropTable.vue';
import CropForm from '../components/CropForm.vue';
import Toast from 'primevue/toast';
import { useCropStore } from '../stores/crop.store';

const toast = useToast();
const router = useRouter();
const { t: $t } = useI18n();
const cropStore = useCropStore();

const showCropForm = ref(false);
const selectedCrop = ref(null);

const totalCrops = computed(() => cropStore.crops.length);
const healthyCrops = computed(() => cropStore.crops.filter(crop => crop.status === 'Healthy').length);
const attentionCrops = computed(() => cropStore.crops.filter(crop => crop.status === 'Attention').length);
const criticalCrops = computed(() => cropStore.crops.filter(crop => crop.status === 'Critical').length);

onMounted(async () => {
  await cropStore.fetchCrops();
});

const onEditCrop = (crop) => {
  selectedCrop.value = crop;
  showCropForm.value = true;
};

const onDeleteCrop = async (cropId) => {
  try {
    await cropStore.deleteCrop(cropId);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: $t('manageCrops.cropDeleted'),
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: $t('manageCrops.errorDeleteCrop'),
      life: 3000
    });
  }
};

const onAddCrop = () => {
  selectedCrop.value = null;
  showCropForm.value = true;
};

const goToNewCrop = () => {
  router.push({ name: 'ManageCropsNew' });
};

const onSubmitCrop = async (cropData) => {
  try {
    if (selectedCrop.value) {
      await cropStore.updateCrop(selectedCrop.value.id, cropData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: $t('manageCrops.cropUpdated'),
        life: 3000
      });
    } else {
      await cropStore.createCrop(cropData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: $t('manageCrops.cropCreated'),
        life: 3000
      });
    }
    showCropForm.value = false;
    selectedCrop.value = null;
  } catch (error) {
    let errorMessage = selectedCrop.value ? $t('manageCrops.errorUpdateCrop') : $t('manageCrops.errorCreateCrop');

    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.title) {
      errorMessage = error.response.data.title;
    } else if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      const errorMessages = Object.values(validationErrors).flat();
      errorMessage = errorMessages.join(', ');
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    });

    console.error('Error al procesar cultivo:', error);
  }
};

const onCancelForm = () => {
  showCropForm.value = false;
  selectedCrop.value = null;
};

const onRetry = async () => {
  await cropStore.fetchCrops();
};
</script>

<style scoped>
.manage-crops-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.5;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 1.5rem;
}

.stat-icon.healthy {
  background: #e8f5e8;
  color: #2e7d32;
}

.stat-icon.attention {
  background: #fff3e0;
  color: #f57c00;
}

.stat-icon.critical {
  background: #ffebee;
  color: #d32f2f;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

@media (max-width: 768px) {
  .manage-crops-page {
    padding: 1rem;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>