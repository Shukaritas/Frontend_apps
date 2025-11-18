/**
 * @file Main entry point for the Vue application.
 * @description This file initializes the Vue app, Pinia for state management, Vue Router,
 * Vue I18n for internationalization, and PrimeVue for UI components, along with its services.
 * It also imports global styles.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import i18n from './assets/i18n';

// PrimeVue
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

// Custom Global Styles
import './assets/styles/global.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.p-dark',
            cssLayer: {
                name: 'primevue',
                order: 'primevue, layout'
            }
        }
    }
});
app.use(ConfirmationService);
app.use(ToastService);

app.mount('#app');