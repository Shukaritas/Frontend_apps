<template>
  <div class="my-fields-container">
    <h1 class="page-title">{{t('fields.title')}}</h1>
    <p class="page-subtitle">{{t('fields.description')}}</p>
    <div v-if="fieldStore.isLoading" class="feedback-message">Cargando campos...</div>
    <div v-else-if="fieldStore.error" class="feedback-message error">{{ fieldStore.error }}</div>
    <div v-else class="fields-grid">

      <router-link
          v-for="field in fieldStore.fields"
          :key="field.id"
          :to="`/fields/${field.id}`"
        class="field-card-link"
      >
        <div class="field-card">
          <div class="status-badge">
            <span :class="['status-dot', `status-${field.status.toLowerCase()}`]"></span>
            {{ field.status }}
          </div>
          <img
            :src="field.imageUrl"
            :alt="field.name"
            class="field-image"
            @error="handleImageError"
          />
          <div class="field-info">
            <p class="field-name">{{ field.name }}</p>
            <p class="crop-info">{{ field.cropName }}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/fields/new" class="add-field-link">
        <div class="add-field-button">
          <span>+</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useFieldStore } from '../stores/field.store.js';
import {useI18n} from "vue-i18n";
const { t } = useI18n({ useScope: 'global' });
const fieldStore = useFieldStore();

onMounted(() => {
  fieldStore.fetchFields();
});

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
};
</script>

<style scoped>
.my-fields-container {
  padding: 32px;
  background-color: white;
}
.field-card-link {
  text-decoration: none;
}
.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 24px;
  margin-top: 6px;
}

.fields-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .fields-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .fields-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1280px) {
  .fields-grid { grid-template-columns: repeat(4, 1fr); }
}

.feedback-message {
  text-align: center;
  padding: 40px;
  color: #4a5568;
}

.field-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.field-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
.field-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
.field-info {
  padding: 16px;
}
.field-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0 0 4px 0;
  color: #1a202c;
}
.crop-info {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 5px 12px 5px 8px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5568;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: capitalize;
  visibility: visible;
  opacity: 1;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-healthy { background-color: #34d399; }
.status-attention { background-color: #f59e0b; }
.status-critical { background-color: #ef4444; }

.add-field-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
  background-color: #a8bfa8;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  min-height: auto;


  place-self: center;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-field-button:hover {
  background-color: #2cb385;
  transform: scale(1.05);
}

.add-field-button span {
  font-size: 2.5rem;
  font-weight: 300;
  color: black;
  line-height: 1;
  padding-bottom: 4px;
}
.add-field-link {
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
}
</style>