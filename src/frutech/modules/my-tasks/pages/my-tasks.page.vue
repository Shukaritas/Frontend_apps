<template>
  <div class="my-tasks-container">
    <Card>
      <template #title>
        <div class="header-section">
          <h1 class="m-0">{{ $t('sidebar.myTasks') }}</h1>
          <div class="total-tasks">
            <span class="label">Total Tasks</span>
            <span class="count">{{ taskStore.taskCount }}</span>
          </div>
        </div>
      </template>
      <template #content>
        <p class="description">
          {{ $t('task.origin') }}
        </p>

        <TaskList 
          :tasks="taskStore.sortedTasks"
          :is-loading="taskStore.isLoading"
          @toggle-task="handleToggleTask"
          @edit-task="handleEditTask"
          @delete-task="handleDeleteTask"
        />

      </template>
    </Card>

    <TaskForm 
      v-model:visible="showTaskDialog"
      :task="selectedTask"
      @submit="handleSaveTask"
      @cancel="handleCancelDialog"
    />

    <DeleteTaskDialog 
      v-model:visible="showDeleteDialog"
      @confirm="handleConfirmDelete"
      @cancel="taskToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTaskStore } from '../application/task.store';
import Card from 'primevue/card';
import TaskList from '../presentation/views/task-list.component.vue';
import TaskForm from '../presentation/views/task-form.component.vue';
import DeleteTaskDialog from '../presentation/views/delete-task-dialog.component.vue';
import {useToast} from "primevue/usetoast";
import Toast from 'primevue/toast';


/**
 * MyTasks Page Component
 * This component serves as the main page for managing user tasks.
 * It integrates the TaskList, TaskForm, and DeleteTaskDialog components,
 * and interacts with the TaskStore for state management.
 */

const taskStore = useTaskStore();
const toast = useToast();

const showTaskDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedTask = ref(null);
const taskToDelete = ref(null);


onMounted(() => {
  taskStore.fetchTasks();
});

const handleToggleTask = async (taskId) => {
  try {
    await taskStore.toggleTaskCompletion(taskId);
  } catch (error) {
    console.error('Error toggling task:', error);
  }
};

const handleEditTask = (task) => {
  selectedTask.value = { ...task };
  showTaskDialog.value = true;
};

const handleDeleteTask = (task) => {
  taskToDelete.value = task;
  showDeleteDialog.value = true;
};

const handleSaveTask = async (taskData) => {
  try {
    if (selectedTask.value && selectedTask.value.id) {
      await taskStore.updateTask(selectedTask.value.id, taskData);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea actualizada correctamente.', life: 3000 });
    } else {
      await taskStore.createTask(taskData);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea creada.', life: 3000 });
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la tarea.', life: 3000 });
  } finally {
    handleCancelDialog();
  }
};

const handleConfirmDelete = async () => {
  if (!taskToDelete.value) return;

  try {
    await taskStore.deleteTask(taskToDelete.value.id);
  } catch (error) {
    console.error('Error deleting task:', error);
  } finally {
    showDeleteDialog.value = false;
    taskToDelete.value = null;
  }
};


const handleCancelDialog = () => {
  showTaskDialog.value = false;
  selectedTask.value = null;
};
</script>

<style scoped>
.my-tasks-container {
  padding: 1rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-tasks {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  background: var(--primary-50);
  border-radius: 8px;
}

.total-tasks .label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.total-tasks .count {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.description {
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
}

.add-task-section {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>