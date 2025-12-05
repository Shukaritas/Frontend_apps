<template>
  <Dialog 
    :visible="visible" 
    header="Confirm Delete"
    :style="{ width: '350px' }"
    modal
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500);"></i>
      <span>Are you sure you want to delete this task?</span>
    </div>
    <template #footer>
      <Button label="No" text @click="handleCancel" />
      <Button label="Yes" severity="danger" @click="handleConfirm" />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

/**
 * DeleteTaskDialog Component
 * This component provides a confirmation dialog for deleting a task.
 * It emits 'confirm' when the user confirms deletion and 'cancel' when the user cancels.
 */

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
