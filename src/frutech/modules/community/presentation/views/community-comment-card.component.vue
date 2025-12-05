<template>
  <div class="community-comment-card">
    <div class="card-header">
      <div class="author-section">
        <span class="author">{{ comment.user }}</span>
        <Tag
          v-if="comment.role"
          :value="comment.role"
          :severity="roleSeverity"
          class="role-badge"
        />
      </div>
    </div>
    <div class="card-content">
      <p class="text">"{{ comment.description }}"</p>
    </div>
    <div class="card-footer">
      <span class="date">{{ formattedDate }}</span>
      <Button
        v-if="canEdit"
        icon="pi pi-pencil"
        class="p-button-text p-button-sm edit-btn"
        @click="$emit('edit', comment)"
        v-tooltip.top="'Edit comment'"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useAuthStore } from '@/stores/auth.store.js';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
});

defineEmits(['edit']);

const authStore = useAuthStore();


const canEdit = computed(() => {
  const currentUser = authStore?.user?.username;
  return currentUser && props.comment?.user && currentUser === props.comment.user;
});


const roleSeverity = computed(() => {
  const role = props.comment?.role || '';
  if (role.toLowerCase().includes('experto')) {
    return 'success';
  } else if (role.toLowerCase().includes('novato')) {
    return 'info';
  }
  return 'secondary';
});


const formattedDate = computed(() => {
  const raw = props.comment?.date;
  if (!raw || typeof raw !== 'string') {
    return new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  const normalized = raw.includes(' ') && !raw.includes('T') ? raw.replace(' ', 'T') : raw;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) {
    return new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
});
</script>

<style scoped>
.community-comment-card {
  border: 1px solid var(--p-content-border-color, #e0e0e0);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--p-surface-card, #fff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  font-family: Arial, sans-serif;
}

.community-comment-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.author {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--p-text-color, #333);
  font-family: inherit;
}

.role-badge {
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
}

:deep(.p-tag) {
  border-radius: 20px;
  font-family: inherit;
}

:deep(.p-tag.p-tag-success) {
  background-color: var(--p-primary-500, #a8bfa8);
  color: white;
  font-weight: 600;
}

:deep(.p-tag.p-tag-info) {
  background-color: #E6EFE3;
  color: var(--p-text-color, #333);
  font-weight: 500;
}

:deep(.p-tag.p-tag-secondary) {
  background-color: #9ca3af;
  color: #fff;
}

.card-content {
  margin: 1rem 0;
}

.text {
  font-size: 1rem;
  color: var(--p-text-color, #333);
  line-height: 1.6;
  text-align: justify;
  font-family: inherit;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  font-size: 0.9rem;
  color: var(--p-text-muted-color, #6c757d);
  margin-top: 1rem;
  padding-top: 0.5rem;
  gap: 0.5rem;
}

.edit-btn {
  color: var(--p-text-muted-color, #6c757d);
  transition: color 0.3s ease;
}

.edit-btn:hover {
  color: var(--p-primary-500, #a8bfa8);
}
</style>