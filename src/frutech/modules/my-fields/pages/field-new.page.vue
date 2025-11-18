<template>
  <div class="form-container">
    <router-link to="/my-fields" class="back-link">
      <span class="arrow">&larr;</span>
    </router-link>
    <h1 class="page-title">{{t('new_field.title')}}</h1>
    <p class="page-subtitle">{{t('new_field.description')}}</p>

    <form @submit.prevent="handleSubmit">

      <div class="image-upload-container">
        <label for="file-upload" class="image-upload-label">
          <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="Image preview" class="image-preview" />
          <span v-else>{{t('new_field.image')}}</span>
        </label>
        <input id="file-upload" type="file" @change="handleFileUpload" accept="image/*" />
      </div>

      <div class="inputs-grid">
        <input type="text" v-model="fieldName" :placeholder="t('new_field.name')" class="form-input" required/>
        <input type="text" v-model="location" :placeholder="t('new_field.location')" class="form-input" required/>
        <input type="text" v-model="fieldSize" :placeholder="t('new_field.size')" class="form-input" required/>
      </div>

      <div class="action-buttons">
        <router-link to="/my-fields" class="btn btn-cancel">{{t('new_field.cancel')}}</router-link>
         <button type="submit" class="btn btn-save" :disabled="store.isLoading" to="/my-fields">
          {{ store.isLoading ? t('new_field.saving') : t('new_field.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFieldStore } from '../stores/field.store.js';
import {useI18n} from "vue-i18n";
const { t } = useI18n({ useScope: 'global' });
const store = useFieldStore();
const router = useRouter();

const fieldName = ref('');
const location = ref('');
const fieldSize = ref('');
const imagePreviewUrl = ref(null);
const imageFile = ref(null);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
};

const handleSubmit = async () => {
  if (!fieldName.value || !imageFile.value) {
    alert('Por favor, completa el nombre y sube una imagen.');
    return;
  }

  try {
    await store.createField({
      name: fieldName.value,
      location: location.value,
      size: fieldSize.value,
      imageUrl: imagePreviewUrl.value,
    });

    router.push('/my-fields');

  } catch (error) {
    alert('Falló al guardar el campo. Por favor, intenta de nuevo.');
  }
};
</script>

<style scoped>
.form-container { padding: 32px; max-width: 800px; margin: auto; }
.back-link { color: #1a202c; text-decoration: none; font-size: 1.5rem; }
.page-title { font-size: 2.25rem; font-weight: 700; margin: 8px 0 4px 0; }
.page-subtitle { font-size: 1.1rem; color: #718096; margin-bottom: 32px; }


.image-upload-container { margin-bottom: 24px; }
.image-upload-label {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  background-color: #f7fafc;
  border: 2px dashed #e2e8f0;
  cursor: pointer;
  transition: border-color 0.2s;
  color: #a0aec0;
}
.image-upload-label:hover { border-color: #34d399; }
#file-upload { display: none; }
.image-preview { width: 100%; height: 100%; object-fit: cover; }


.inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
.inputs-grid input:first-child { grid-column: 1 / -1; }
.form-input {
  width: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  background-color: #f7fafc;
  border-radius: 16px;
  font-size: 1rem;
  box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #34d399; }


.action-buttons { display: flex; justify-content: flex-end; gap: 16px; }
.btn {
  padding: 12px 24px;
  border-radius: 9999px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.btn-cancel { background-color: #e2e8f0; color: #4a5568; }
.btn-cancel:hover { background-color: #cbd5e0; }
.btn-save { background-color: #34d399; color: white; }
.btn-save:hover { background-color: #2cb385; }
.btn-save:disabled { background-color: #a0aec0; cursor: not-allowed; }

@media (max-width: 640px) {
  .inputs-grid { grid-template-columns: 1fr; }
}
</style>