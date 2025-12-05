<template>
  <div class="community-comment-card">
    <div class="card-header">
      <span class="author">{{ comment.user }}</span>
      <!-- Rol eliminado (backend ya no provee esta propiedad) -->
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
import { useAuthStore } from '@/stores/auth.store.js';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
});

defineEmits(['edit']);

const authStore = useAuthStore();

// Verificar si el usuario actual puede editar este comentario
const canEdit = computed(() => {
  const currentUser = authStore?.user?.username;
  return currentUser && props.comment?.user && currentUser === props.comment.user;
});

// Formatea fecha ISO a DD/MM/YYYY; fallback a fecha actual si inválida
const formattedDate = computed(() => {
  const raw = props.comment?.date;
  if (!raw || typeof raw !== 'string') {
    return new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  // Reemplazar espacio por 'T' si viene como "YYYY-MM-DD HH:mm:ss" para asegurar parseo consistente
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
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.community-comment-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2c3e50;
}


.card-content {
  margin: 1rem 0;
}

.text {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  text-align: justify;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 1rem;
}

.edit-btn {
  color: #6c757d;
}

.edit-btn:hover {
  color: #007bff;
}
</style>