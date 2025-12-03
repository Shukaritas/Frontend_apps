<template>
  <div class="crop-table-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>{{ $t('manageCrops.loadingCrops') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c"></i>
      <p>{{ error }}</p>
      <Button @click="$emit('retry')" :label="$t('manageCrops.retry')" severity="secondary" />
    </div>

    <!-- Table Content -->
    <div v-else>
      <DataTable 
        :value="crops" 
        :paginator="true" 
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5,10,25]"
        :currentPageReportTemplate="$t('manageCrops.pagination')"
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <Column field="title" :header="$t('manageCrops.crop')" :sortable="true">
          <template #body="slotProps">
            <span class="font-semibold">{{ slotProps.data.title }}</span>
          </template>
        </Column>
        
        <Column field="planting_date" :header="$t('manageCrops.plantingDate')" :sortable="true">
          <template #body="slotProps">
            <Tag :value="formatDate(slotProps.data.planting_date)" severity="info" />
          </template>
        </Column>
        
        <Column field="harvest_date" :header="$t('manageCrops.harvestDate')" :sortable="true">
          <template #body="slotProps">
            <Tag :value="formatDate(slotProps.data.harvest_date)" severity="success" />
          </template>
        </Column>
        
        <Column field="field" :header="$t('manageCrops.field')" :sortable="true">
          <template #body="slotProps">
            <span>{{ slotProps.data.field }}</span>
          </template>
        </Column>
        
        <Column field="status" :header="$t('manageCrops.status')" :sortable="true">
          <template #body="slotProps">
            <Tag 
              :value="slotProps.data.status" 
              :severity="getStatusSeverity(slotProps.data.status)"
            />
          </template>
        </Column>
        
        <Column field="days" :header="$t('manageCrops.days')" :sortable="true">
          <template #body="slotProps">
            <Badge :value="slotProps.data.days" severity="info" />
          </template>
        </Column>
        
        <Column :header="$t('manageCrops.actions')" :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button 
                icon="pi pi-pencil" 
                severity="warning" 
                size="small" 
                @click="$emit('edit', slotProps.data)"
                v-tooltip.top="$t('manageCrops.tooltip.edit')"
              />
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                size="small" 
                @click="confirmDelete(slotProps.data)"
                v-tooltip.top="$t('manageCrops.tooltip.delete')"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Add New Crop Button -->
      <div class="add-crop-container">
        <Button 
          icon="pi pi-plus" 
          :label="$t('manageCrops.newCrop')" 
          @click="$emit('add')"
          class="p-button-success"
        />
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteDialog" 
      :style="{width: '450px'}" 
      :header="$t('manageCrops.confirmDelete')" 
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="selectedCrop">
          {{ $t('manageCrops.confirmDeleteMessage') }} <b>{{ selectedCrop.title }}</b>?
        </span>
      </div>
      <template #footer>
        <Button 
          :label="$t('manageCrops.cancel')" 
          icon="pi pi-times" 
          @click="deleteDialog = false" 
          class="p-button-text"
        />
        <Button 
          :label="$t('manageCrops.delete')" 
          icon="pi pi-check" 
          @click="deleteCrop" 
          class="p-button-danger"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import { useConfirm } from 'primevue/useconfirm';

// Helper para formatear fechas a DD/MM/YYYY o devolver YYYY-MM-DD si se requiere
function formatDate(value, mode = 'DMY') {
  if (!value) return '';
  let datePart = String(value);
  // Cortar tiempo si viene en ISO extendido
  if (datePart.includes('T')) datePart = datePart.split('T')[0];
  // Si viene en YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-');
    return mode === 'DMY' ? `${d}/${m}/${y}` : `${y}-${m}-${d}`;
  }
  // Si viene en DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
    if (mode === 'DMY') return datePart;
    const [d, m, y] = datePart.split('/');
    return `${y}-${m}-${d}`;
  }
  // Intento genérico de parseo
  try {
    const d = new Date(datePart);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = d.getFullYear();
      return mode === 'DMY' ? `${dd}/${mm}/${yy}` : `${yy}-${mm}-${dd}`;
    }
  } catch {}
  return datePart; // fallback
}

const props = defineProps({
  crops: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['edit', 'delete', 'add', 'retry']);

const deleteDialog = ref(false);
const selectedCrop = ref(null);

const getStatusSeverity = (status) => {
  switch (status?.toLowerCase()) {
    case 'healthy':
      return 'success';
    case 'attention':
      return 'warning';
    case 'critical':
      return 'danger';
    default:
      return 'info';
  }
};

const confirmDelete = (crop) => {
  selectedCrop.value = crop;
  deleteDialog.value = true;
};

const deleteCrop = () => {
  if (selectedCrop.value) {
    emit('delete', selectedCrop.value.id);
    deleteDialog.value = false;
    selectedCrop.value = null;
  }
};
</script>

<style scoped>
.crop-table-container {
  margin-top: 1rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading-container p, .error-container p {
  margin-top: 1rem;
  color: #6c757d;
}

.error-container p {
  color: #e74c3c;
}

.add-crop-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable-header) {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: #f8f9fa;
}

:deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #e9ecef;
}
</style>
