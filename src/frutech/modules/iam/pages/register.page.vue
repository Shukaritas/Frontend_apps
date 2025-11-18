<template>
  <main class="auth-container">
    <section class="auth-card">
      <h1>Crear cuenta</h1>

      <form @submit.prevent="handleRegister" class="auth-form">
        <label>
          <span>Nombre Completo</span>
          <input v-model="form.username" type="text" required placeholder="Juan Perez" />
        </label>

        <label>
          <span>DNI (8 dígitos)</span>
          <input
              v-model="form.identificator"
              type="text"
              maxlength="8"
              required
              placeholder="12345678"
              @input="validateNumberInput"
          />
        </label>

        <label>
          <span>Teléfono (con código de país)</span>
          <input v-model="form.phoneNumber" type="text" required placeholder="+51999999999" />
        </label>

        <label>
          <span>Email</span>
          <input v-model="form.email" type="email" required placeholder="ejemplo@correo.com"/>
        </label>

        <label>
          <span>Contraseña</span>
          <input v-model="form.password" type="password" required />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>

        <p class="alt-action">
          ¿Ya tienes cuenta?
          <router-link to="/login">Inicia sesión</router-link>
        </p>
      </form>

      <p v-if="authStore.error" class="auth-message error" role="alert">
        {{ authStore.error }}
      </p>
      <p v-if="successMessage" class="auth-message success" role="alert">
        {{ successMessage }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const successMessage = ref('');

const form = reactive({
  username: '',
  identificator: '',
  phoneNumber: '',
  email: '',
  password: ''
});

// Validación simple en tiempo real para que solo ingresen números en el DNI
const validateNumberInput = (event) => {
  form.identificator = event.target.value.replace(/\D/g, '');
};

const handleRegister = async () => {
  authStore.error = null; // Limpiar errores previos
  loading.value = true;

  // Nota: La validación estricta (DNI 8 digitos, + en teléfono)
  // se realiza dentro de la entidad User en el Store/Modelo antes de enviar.

  const success = await authStore.register(form);
  loading.value = false;

  if (success) {
    successMessage.value = '¡Cuenta creada con éxito! Redirigiendo al login...';
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  }
};
</script>

<style scoped>
/* Estilos copiados y encapsulados del Landing Page para mantener la identidad visual */
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
.auth-message.success { color: var(--primary); background-color: #d1fae5; }
</style>