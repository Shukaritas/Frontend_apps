<template>
  <Dialog 
    :visible="visible" 
    :header="isEditMode ? 'Edit Task' : 'New Task'"
    :style="{ width: '450px' }"
    modal
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="task-form">
      <div class="field">
        <label for="description">Description</label>
        <Textarea 
          id="description"
          v-model="formData.description" 
          rows="3"
          :class="{ 'p-invalid': submitted && !formData.description }"
        />
        <small v-if="submitted && !formData.description" class="p-error">
          Description is required
        </small>
      </div>

      <div class="field">
        <label for="dueDate">Due Date</label>
        <InputText 
          id="dueDate"
          v-model="formData.dueDate" 
          placeholder="DD/MM"
          :class="{ 'p-invalid': submitted && !formData.dueDate }"
        />
        <small v-if="submitted && !formData.dueDate" class="p-error">
          Due date is required
        </small>
      </div>

      <div class="field">
        <label for="field">Field</label>
        <Dropdown 
          id="field"
          v-model="formData.field" 
          :options="availableFields"
          placeholder="Select a field"
          :class="{ 'p-invalid': submitted && !formData.field }"
        />
        <small v-if="submitted && !formData.field" class="p-error">
          Field is required
        </small>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" text @click="handleCancel" />
      <Button :label="isEditMode ? 'Update' : 'Save'" @click="handleSubmit" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';

/**
 * TaskForm Component
 * This component provides a form for managing tasks.
 * It supports both creating new tasks and editing existing ones.
 * It emits 'submit' when the form is submitted and 'cancel' when the form is closed.
 */

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  availableFields: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'submit', 'cancel']);

const formData = ref({
  description: '',
  dueDate: '',
  field: '',
});

const submitted = ref(false);

const isEditMode = ref(false);

watch(() => props.task, (newTask) => {
  if (newTask) {
    isEditMode.value = true;
    formData.value = {
      description: newTask.description || '',
      dueDate: newTask.dueDate || '',
      field: newTask.field || '',
    };
  } else {
    isEditMode.value = false;
    formData.value = {
      description: '',
      dueDate: '',
      field: '',
    };
  }
  submitted.value = false;
}, { immediate: true });

const handleSubmit = () => {
  submitted.value = true;
  
  if (!formData.value.description || !formData.value.dueDate || !formData.value.field) {
    return;
  }

  emit('submit', { ...formData.value });
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
  emit('update:visible', false);
};

const resetForm = () => {
  formData.value = {
    description: '',
    dueDate: '',
    field: '',
  };
  submitted.value = false;
};
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
