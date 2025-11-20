<template>
  <div class="detail-container">
    <Toast />
    <ConfirmDialog />

    <router-link to="/my-fields" class="back-link">
      <span class="arrow">&larr;</span>
    </router-link>
    <h1 class="page-title">{{ t('fields.title') }}</h1>

    <div v-if="fieldStore.isLoading">Cargando...</div>
    <div v-else-if="fieldStore.error">{{ fieldStore.error }}</div>
    <div v-else-if="field" class="content-wrapper">
      <div class="hero-image-container">
        <img
          :src="field.imageUrl"
          :alt="field.name"
          class="hero-image"
          @error="handleImageError"
        />
      </div>

      <div class="header-section">
        <div>
          <h2 class="field-name">{{ field.name }}</h2>
          <p class="crop-name">{{ field.crop }}</p>
        </div>
        <div class="status-badge">
          <span :class="['status-dot', `status-${field.status.toLowerCase()}`]"></span>
          {{ field.status }}
        </div>
      </div>
      <div class="main-content">
        <div class="info-card">
          <div class="info-item"><span>{{t('field_detail.location')}}</span> {{ field.location }}</div>
          <div class="info-item"><span>{{t('field_detail.field_size')}}</span> {{ field.fieldSize }}</div>
          <div class="info-item"><span>{{t('field_detail.crop')}}</span> {{ field.crop }}</div>
          <div class="info-item"><span>{{t('field_detail.days_since')}}</span> {{ field.daysSincePlanting }} Days</div>
          <div class="info-item"><span>{{t('field_detail.planting_date')}}:</span> {{ field.plantingDate }}</div>
          <div class="info-item"><span>{{t('field_detail.expected')}}</span> {{ field.expectingHarvest }}</div>
          <div class="info-item"><span>{{t('field_detail.soil_type')}}</span> {{ field.soilType }}</div>
          <div class="info-item"><span>{{t('field_detail.watering')}}</span> {{ field.watering }}</div>
          <div class="info-item"><span>{{t('field_detail.sunlight')}}</span> {{ field.sunlight }}</div>
        </div>

        <div class="right-column">
          <div class="progress-section">
            <div class="section-header">
              <h3 class="section-title">{{t('field_detail.progress.title')}}</h3>
              <Button icon="pi pi-pencil" class="p-button-text p-button-rounded" @click="openProgressModal" />
            </div>
            <div class="progress-item" v-if="field.progress_history && field.progress_history.length > 0"><span>{{t('field_detail.progress.watered')}}</span> {{ field.progress_history[0].watered }}</div>
            <div class="progress-item" v-if="field.progress_history && field.progress_history.length > 0"><span>{{t('field_detail.progress.fertilized')}}</span> {{ field.progress_history[0].fertilized }}</div>
            <div class="progress-item" v-if="field.progress_history && field.progress_history.length > 0"><span>{{t('field_detail.progress.pest')}}</span> {{ field.progress_history[0].pests }}</div>
          </div>
          <div class="tasks-section">
            <div class="section-header">
              <h3 class="section-title">{{ t('field_detail.tasks') }}</h3>
              <Button icon="pi pi-plus" class="p-button-text p-button-rounded" @click="openTaskModal" />
            </div>
            <ul v-if="field.tasks && field.tasks.length > 0">
              <li v-for="task in field.tasks" :key="task.id" class="task-item">
                <input type="checkbox" class="task-checkbox" />
                <div class="task-details">
                  <span class="task-date">{{ task.date }}</span>
                  <span class="task-name">{{ task.name }}</span>
                  <span class="task-description">{{ task.task }}</span>
                </div>
                <span class="task-close" @click="confirmDeleteTask(task)">&times;</span>
              </li>
            </ul>
            <p v-else>No hay tareas asignadas a este campo.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="isProgressModalVisible" modal :header="t('modifications.progress')" :style="{ width: '25rem' }">
    <div class="flex flex-column gap-3">
      <div class="field">
        <label for="watered">{{t('field_detail.progress.watered')}}</label>
        <InputText id="watered" v-model="progressData.watered" class="w-full" placeholder="DD/MM/YYYY" />
      </div>
      <div class="field">
        <label for="fertilized">{{t('field_detail.progress.fertilized')}}</label>
        <InputText id="fertilized" v-model="progressData.fertilized" class="w-full" placeholder="DD/MM/YYYY" />
      </div>
      <div class="field">
        <label for="pests">{{t('field_detail.progress.pest')}}</label>
        <InputText id="pests" v-model="progressData.pests" class="w-full" placeholder="DD/MM/YYYY" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" @click="isProgressModalVisible = false" />
      <Button label="Save" @click="saveProgress" :loading="fieldStore.isLoading" />
    </template>
  </Dialog>

  <Dialog v-model:visible="isTaskModalVisible" modal :header="t('modifications.new_task')" :style="{ width: '25rem' }">
    <div class="flex flex-column gap-3">
      <div class="field">
        <label for="taskDate">{{t('modifications.date')}}</label>
        <InputText id="taskDate" v-model="newTaskData.date" class="w-full" placeholder="DD/MM" />
      </div>
      <div class="field">
        <label for="taskDescription">{{t('modifications.description')}}</label>
        <InputText id="taskDescription" v-model="newTaskData.task" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" @click="isTaskModalVisible = false" />
      <Button label="Save" @click="saveTask" :loading="fieldStore.isLoading" />
    </template>
  </Dialog>
</template>

<script setup>
import { onMounted, computed, ref, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useFieldStore } from '../stores/field.store.js';
import { useTaskStore } from '@/frutech/modules/my-tasks/application/task.store.js';
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

const { t } = useI18n({ useScope: 'global' });
const fieldStore = useFieldStore();
const taskStore = useTaskStore();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();

const field = computed(() => fieldStore.currentField);
const isProgressModalVisible = ref(false);
const isTaskModalVisible = ref(false);
const progressData = reactive({ watered: '', fertilized: '', pests: '' });
const newTaskData = reactive({ date: '', name: '', task: '' });

watch(field, (newField) => {
  if (newField?.progress_history?.[0]) {
    Object.assign(progressData, newField.progress_history[0]);
  }
  if (newField) {
    newTaskData.name = newField.name;
  }
}, { immediate: true, deep: true });


const openProgressModal = () => isProgressModalVisible.value = true;

const openTaskModal = () => {
  newTaskData.date = '';
  newTaskData.task = '';
  isTaskModalVisible.value = true;
};

const saveProgress = async () => {
  try {
    await fieldStore.updateFieldProgress(field.value.id, progressData);
    isProgressModalVisible.value = false;
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

const saveTask = async () => {
  // Validar que la descripción tenga al menos 3 caracteres
  if (!newTaskData.task || newTaskData.task.trim().length < 3) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'La descripción debe tener al menos 3 caracteres.',
      life: 3000
    });
    return;
  }

  try {
    await fieldStore.addTaskToField(field.value.id, newTaskData);
    isTaskModalVisible.value = false;
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tarea agregada correctamente',
      life: 3000
    });
  } catch (error) {
    console.error('Failed to save task:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar la tarea',
      life: 3000
    });
  }
};

const confirmDeleteTask = (task) => {
  confirm.require({
    message: '¿Estás seguro de que quieres eliminar esta tarea?',
    header: 'Confirmación de borrado',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await taskStore.deleteTask(task.id);
        // Re-fetch the field data to get the updated task list
        await fieldStore.fetchFieldById(route.params.id);
        toast.add({ severity: 'info', summary: 'Confirmado', detail: 'Tarea eliminada', life: 3000 });
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la tarea.', life: 3000 });
      }
    }
  });
};

onMounted(() => {
  const fieldId = route.params.id;
  fieldStore.fetchFieldById(fieldId);
});

// Manejo de error de carga de imagen (fallback a placeholder)
const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
};
</script>

<style scoped>

.detail-container {
  padding: 32px;
  justify-self: left;
  align-items: end;
}
.arrow{
  display:flex;
  margin-top:-30px;
}

.back-link {
  color: #1a202c;
  text-decoration: none;
  font-size: 1.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-top: 8px;
}
.task-close {
  cursor: pointer;
  color: #a0aec0;
  font-size: 1.5rem;
}
.task-close:hover {
  color: #ef4444;
}
.content-wrapper {
  margin-top: 24px;
  justify-self: left;
}
.hero-image-container {
  width: 100%;
  height: 300px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}
.field-name {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

.crop-name {
  font-size: 1.1rem;
  color: #718096;
  margin-top: 4px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

.info-card {
  background-color: #f7fafc;
  border-radius: 16px;
  padding: 24px;
  font-size: 0.95rem;
}

.info-item {
  display: flex;
  justify-content: left;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item span {
  font-weight: 600;
  color: #4a5568;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.progress-item {
  display: flex;
  justify-content: left;
  margin-bottom: 10px;
  padding: 5px
}

.progress-item span {
  font-weight: 600;
}

.tasks-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
}

.task-checkbox {
  margin-top: 4px;
  width: 18px;
  height: 18px;
}

.task-details {
  flex-grow: 1;
  margin: 0 16px;
}

.task-date, .task-name {
  display: block;
  font-size: 0.8rem;
  color: #718096;
}

.task-description {
  font-size: 1rem;
  color: #1a202c;
  margin-top: 4px;
}

.task-close {
  cursor: pointer;
  color: #a0aec0;
  font-size: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 9999px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f0f0;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-healthy {
  background-color: #34d399;
}

.status-attention {
  background-color: #f59e0b;
}

.status-critical {
  background-color: #ef4444;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
@media (min-width: 768px) {
  .main-content { grid-template-columns: 350px 1fr; }
}
</style>