<template>
  <div class="task-list">
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else-if="sortedTasks.length > 0" class="tasks-table">
      <div class="table-header">
        <div class="col-description">{{ $t('task.description') }}</div>
        <div class="col-date">{{ $t('dashboard.due_date') }}</div>
        <div class="col-field">{{ $t('manageCrops.field') }}</div>
        <div class="col-actions">{{ $t('dashboard.actions') }}</div>
      </div>

      <div class="table-body">
        <div 
          v-for="task in sortedTasks" 
          :key="task.id" 
          class="task-row"
          :class="{ 'overdue': task.isOverdue }"
        >
          <div class="col-description">
            <Checkbox 
              :model-value="task.completed" 
              :binary="true"
              @update:model-value="$emit('toggle-task', task.id)"
            />
            <span :class="{ 'completed': task.completed }">
              {{ task.description }}
            </span>
          </div>
          <div class="col-date">
            <Tag 
              :severity="getDateSeverity(task)" 
              :value="task.dueDate"
            />
          </div>
          <div class="col-field">
            {{ task.field }}
          </div>
          <div class="col-actions">
            <Button 
              icon="pi pi-pencil" 
              text 
              rounded 
              severity="secondary"
              @click="$emit('edit-task', task)"
            />
            <Button 
              icon="pi pi-trash" 
              text 
              rounded 
              severity="danger"
              @click="$emit('delete-task', task)"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-inbox" style="font-size: 3rem; color: var(--surface-400);"></i>
      <p>{{ $t('myTasks.empty') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

/**
 * TaskList Component
 * This component displays a list of tasks with options to toggle completion,
 * edit, and delete each task. It also handles loading and empty states.
 * It emits events for task actions to be handled by the parent component.
 */

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle-task', 'edit-task', 'delete-task']);

const sortedTasks = computed(() => {
  return [...props.tasks].sort((a, b) => {
    return (a.daysUntilDue || 0) - (b.daysUntilDue || 0);
  });
});

const getDateSeverity = (task) => {
  if (task.isOverdue) return 'danger';
  if (task.daysUntilDue !== undefined && task.daysUntilDue <= 3) return 'warning';
  return 'success';
};
</script>

<style scoped>
.task-list {
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.tasks-table {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 0.5fr;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50);
  font-weight: 600;
  border-bottom: 1px solid var(--surface-border);
}

.table-body {
  display: flex;
  flex-direction: column;
}

.task-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 0.5fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  transition: background-color 0.2s;
}

.task-row:hover {
  background: var(--surface-50);
}

.task-row:last-child {
  border-bottom: none;
}

.task-row.overdue {
  background: var(--red-50);
}

.col-description {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.col-description span.completed {
  text-decoration: line-through;
  color: var(--text-color-secondary);
}

.col-date,
.col-field {
  display: flex;
  align-items: center;
}

.col-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.empty-state p {
  color: var(--text-color-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .table-header,
  .task-row {
    grid-template-columns: 1fr;
  }
}
</style>
