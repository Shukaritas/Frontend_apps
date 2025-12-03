<template>
  <SelectButton
      v-model="selectedLanguage"
      :options="languages"
      :allowEmpty="false"
      optionLabel="name"
      optionValue="code"
      aria-labelledby="language-selector"
  />
</template>

<script setup>

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SelectButton from 'primevue/selectbutton';

const { locale } = useI18n({ useScope: 'global' });


const languages = [
  { name: 'EN', code: 'en' },
  { name: 'ES', code: 'es' },
];


const selectedLanguage = computed({
  get: () => locale.value,
  set: (newValue) => {
    if (locale.value !== newValue) {
      locale.value = newValue;
    }
  },
});
</script>