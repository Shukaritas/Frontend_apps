<template>
  <div class="dashboard-page">
    <div v-if="isLoading" class="flex justify-content-center align-items-center h-20rem">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="p-4">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else>
      <div v-if="!userFields.length && !upcomingTasks.length && !recommendations.length" class="p-4">
        <Message severity="info" :closable="false">{{ $t('dashboard.empty') }}</Message>
      </div>
      <div v-else class="grid gap-4">
        <div class="col-12">
          <Card class="preview-fields-card">
            <template #title>
              <div class="flex justify-content-between align-items-center">
                <h1 class="m-0">{{ $t('sidebar.dashboard') }}</h1>
                <Button :label="$t('dashboard.addNewCrop')" icon="pi pi-plus" @click="goToMyFields" />
              </div>
            </template>
            <template #content>
              <div class="field-items-container">
                <div v-for="field in userFields" :key="field.id" class="field-item">
                  <img
                    :src="field.imageUrl"
                    :alt="field.name"
                    class="field-image"
                    @error="handleImageError"
                  >
                  <span class="field-title mt-2">{{ field.name }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <div class="col-12">
          <Card>
            <template #title>
              <div class="flex justify-content-between align-items-center">
                <h2 class="m-0 text-xl font-semibold">{{ $t('sidebar.myTasks') }}</h2>
                <Button :label="$t('dashboard.view_tasks')" @click="goToMyTasks" text />
              </div>
            </template>
            <template #content>
              <DataTable :value="upcomingTasks" responsiveLayout="scroll">
                <Column field="field" :header="$t('dashboard.crop_name')"></Column>
                <Column field="description" :header="$t('dashboard.task')"></Column>
                <Column field="dueDate" :header="$t('dashboard.due_date')"></Column>
                <Column :header="$t('dashboard.actions')">
                  <template #body>
                    <Checkbox :binary="true" />
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>

        <div class="col-12" v-if="recommendations.length">
          <Card>
            <template #title><h2 class="m-0 text-xl font-semibold">{{ $t('dashboard.recommendatios') }}</h2></template>
            <template #content>
              <div v-for="rec in recommendations" :key="rec.id" class="mb-3">
                <p><strong class="font-semibold">{{ rec.title }}:</strong> {{ rec.content }}</p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import { useRouter } from 'vue-router';

import { FieldApiRepository } from '@/frutech/modules/my-fields/infrastructure/field.api-repository.js';
import { TaskApiRepository } from '@/frutech/modules/my-tasks/infrastructure/task-api.repository.js';

const router = useRouter();
const fieldRepository = new FieldApiRepository();
const taskRepository = new TaskApiRepository();

const isLoading = ref(false);
const error = ref(null);

const userFields = ref([]);
const upcomingTasks = ref([]);
const recommendations = ref([]); // placeholder si luego hay recomendaciones reales

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id;
  } catch {
    return null;
  }
}

async function fetchDashboardData() {
  isLoading.value = true;
  error.value = null;

  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    // Cargar Fields del usuario
    const fields = await fieldRepository.getAll();
    userFields.value = Array.isArray(fields)
      ? fields.map(f => ({ id: f.id, name: f.name, imageUrl: f.imageUrl }))
      : [];

    // Cargar 3 tareas próximas del usuario
    const tasks = await taskRepository.getUpcomingTasks(userId, 3);
    upcomingTasks.value = Array.isArray(tasks) ? tasks.map(t => ({
      id: t.id,
      description: t.description,
      // TaskApiRepository ya convierte dueDate a DD/MM vía apiToDomain
      dueDate: t.dueDate,
      field: t.field,
      completed: t.completed
    })) : [];
  } catch (e) {
    console.error(e);
    error.value = e.message || 'Error cargando datos del dashboard';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchDashboardData();
});

const goToMyFields = () => {
  router.push('/my-fields');
};

const goToMyTasks = () => {
  router.push('/my-tasks');
};

// Manejo de error de carga de imagen (fallback a placeholder)
const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-fields-card .p-card-content {
  padding-top: 0;
}

.field-items-container {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem; /* Espacio para la barra de scroll */
}

/* Ocultar barra de scroll pero mantener funcionalidad */
.field-items-container::-webkit-scrollbar {
  display: none;
}
.field-items-container {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.field-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px;
}

.field-image {
  width: 180px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.field-title {
  font-size: 0.9rem;
  text-align: center;
  color: var(--p-text-color);
}
</style>