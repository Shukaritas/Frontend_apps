import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Backend corre en 5000 por indicación del usuario; permitimos override con VITE_BACKEND_ORIGIN
  const target = env.VITE_BACKEND_ORIGIN || 'http://localhost:5000'

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          // Mantenemos el prefijo /api tal cual para soportar /api/Tasks y /api/v1/... del backend
          // rewrite: (path) => path
        },
      },
    },
  }
})
