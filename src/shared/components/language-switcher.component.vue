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
/**
 * @file Language Switcher Component
 * @description A UI component that allows the user to switch the application's language.
 * It uses a PrimeVue SelectButton and interacts with the global Vue I18n locale.
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SelectButton from 'primevue/selectbutton';

const { locale } = useI18n({ useScope: 'global' });

/**
 * @const {Array<object>} languages
 * @description A static array of available languages for the application.
 */
const languages = [
  { name: 'EN', code: 'en' },
  { name: 'ES', code: 'es' },
];

/**
 * @type {import('vue').ComputedRef<string>}
 * @description A computed property that safely gets and sets the global locale.
 * It prevents re-setting the locale if the selected value is already active.
 */
const selectedLanguage = computed({
  get: () => locale.value,
  set: (newValue) => {
    if (locale.value !== newValue) {
      locale.value = newValue;
    }
  },
});
</script>