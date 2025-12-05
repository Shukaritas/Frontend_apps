<template>
  <main class="auth-container">
    <section class="auth-card">
      <h1>{{ $t('iam.login.title') }}</h1>

      <form @submit.prevent="handleLogin" class="auth-form">
        <label>
          <span>{{ $t('iam.login.email') }}</span>
          <input v-model="form.email" type="email" required :placeholder="$t('iam.login.emailPlaceholder')" />
        </label>

        <label>
          <span>{{ $t('iam.login.password') }}</span>
          <input v-model="form.password" type="password" required />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? $t('iam.login.loading') : $t('iam.login.submit') }}
        </button>

        <p class="alt-action">
          {{ $t('iam.login.noAccount') }}
          <router-link to="/register">{{ $t('iam.login.goRegister') }}</router-link>
        </p>
      </form>

      <p v-if="authStore.error" class="auth-message error" role="alert">
        {{ authStore.error }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const handleLogin = async () => {
  loading.value = true;
  const success = await authStore.login(form);
  loading.value = false;

  if (success) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

.auth-container {
  --bg: #ffffff;
  --card: #ffffff;
  --text: #2c3e50;
  --muted: #666666;
  --primary: #245f35;
  --primary-dark: #1a4a28;
  --accent-bg: #e9fbe0;
  --danger: #ef4444;

  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0fce8 0%, #e9fbe0 100%);
  font-family: "Poppins", sans-serif;
  color: var(--text);
}

.auth-card {
  width: min(480px, 100%);
  background: var(--card);
  border: 2px solid var(--accent-bg);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(36, 95, 53, 0.12);
}

.auth-card h1 {
  margin: 0 0 16px;
  font-size: 1.5rem;
  text-align: center;
  color: var(--primary);
}

.auth-form {
  display: grid;
  gap: 12px;
  margin: 8px 0 4px;
}

.auth-form label {
  display: grid;
  gap: 6px;
}

.auth-form span {
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 500;
}

.auth-form input {
  padding: 10px 12px;
  border: 1px solid #d8e8d8;
  border-radius: 10px;
  background: #ffffff;
  color: var(--text);
  outline: none;
  font-family: inherit;
}

.auth-form input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(36, 95, 53, 0.15);
}

.auth-form button {
  margin-top: 12px;
  background: var(--primary);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.auth-form button:hover {
  background: var(--primary-dark);
}

.auth-form button:disabled {
  background: var(--muted);
  cursor: not-allowed;
}

.alt-action {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 0.9rem;
  text-align: center;
}

.alt-action a {
  color: var(--primary);
  font-weight: bold;
  text-decoration: none;
}

.alt-action a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.auth-message {
  min-height: 22px;
  margin: 15px 0 0;
  text-align: center;
  font-size: 0.9rem;
  padding: 8px;
  border-radius: 6px;
}
.auth-message.error { color: var(--danger); background-color: #fee2e2; }
</style>